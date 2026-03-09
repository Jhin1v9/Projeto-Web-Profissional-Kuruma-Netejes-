#!/usr/bin/env node
import crypto from "node:crypto";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import express from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const QA_DIR = path.resolve(__dirname, "..", "sitepulse-qa");
const PUBLIC_DIR = path.resolve(__dirname, "public");
const DATA_DIR = path.resolve(__dirname, "data");
const USERS_FILE = path.resolve(DATA_DIR, "users.json");
const PORT = Number(process.env.PORT ?? 4577);

const MAX_LOGS = 1400;
const MAX_EVENTS = 450;
const sessions = new Map();

let runner = null;
let checkpointTimer = null;
let reportDirActive = path.resolve(QA_DIR, "reports");
let checkpointFileActive = path.resolve(reportDirActive, "sitepulse-checkpoint.json");
let configPathActive = path.resolve(QA_DIR, "audit.kuruma.json");

const state = {
  running: false,
  status: "idle",
  startedAt: "",
  endedAt: "",
  configFile: "audit.kuruma.json",
  baseUrlOverride: "",
  commandPreview: "",
  pid: null,
  logs: [],
  events: [],
  currentEvent: null,
  checkpoint: null,
  summary: null,
  latestReports: [],
  lastError: "",
  activeUser: "",
};

function nowIso() {
  return new Date().toISOString();
}

function trimArray(arr, max) {
  if (arr.length <= max) return arr;
  arr.splice(0, arr.length - max);
  return arr;
}

function pushLog(level, text) {
  state.logs.push({
    ts: nowIso(),
    level,
    text: String(text ?? "").trim(),
  });
  trimArray(state.logs, MAX_LOGS);
}

function pushEvent(event) {
  state.events.push(event);
  trimArray(state.events, MAX_EVENTS);
  state.currentEvent = event;
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  const sanitized = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
  return JSON.parse(sanitized);
}

function resolveMaybeAbsolute(baseDir, value, fallback) {
  if (!value || typeof value !== "string") return fallback;
  return path.isAbsolute(value) ? value : path.resolve(baseDir, value);
}

async function ensureUsersFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  if (await fileExists(USERS_FILE)) return;
  const seed = [
    {
      username: "admin",
      password: "admin123",
      defaultConfig: "audit.kuruma.json",
      defaultBaseUrl: "http://127.0.0.1:3110",
    },
    {
      username: "mobile",
      password: "mobile123",
      defaultConfig: "audit.kuruma.mobile.json",
      defaultBaseUrl: "http://127.0.0.1:3111",
    },
  ];
  await fs.writeFile(USERS_FILE, JSON.stringify(seed, null, 2), "utf8");
}

async function loadUsers() {
  await ensureUsersFile();
  const users = await readJson(USERS_FILE).catch(() => []);
  return Array.isArray(users) ? users : [];
}

function sanitizeUser(user) {
  return {
    username: String(user.username),
    defaultConfig: String(user.defaultConfig ?? "audit.kuruma.json"),
    defaultBaseUrl: String(user.defaultBaseUrl ?? ""),
  };
}

function getTokenFromRequest(req) {
  const auth = String(req.headers.authorization ?? "");
  if (auth.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
  const headerToken = String(req.headers["x-session-token"] ?? "").trim();
  if (headerToken) return headerToken;
  return String(req.query?.token ?? "").trim();
}

function authRequired(req, res, next) {
  const token = getTokenFromRequest(req);
  const session = sessions.get(token);
  if (!token || !session) {
    return res.status(401).json({ ok: false, error: "Nao autenticado." });
  }
  req.session = session;
  req.token = token;
  return next();
}

async function listConfigFiles() {
  const files = await fs.readdir(QA_DIR);
  return files
    .filter((name) => name.endsWith(".json") && name.startsWith("audit."))
    .sort((a, b) => a.localeCompare(b));
}

async function resolveRunContext(configFile) {
  const configPath = path.isAbsolute(configFile)
    ? configFile
    : path.resolve(QA_DIR, configFile || "audit.kuruma.json");
  const cfg = await readJson(configPath);
  const configDir = path.dirname(configPath);
  const reportDir = resolveMaybeAbsolute(configDir, cfg.reportDir, path.resolve(configDir, "reports"));
  const checkpointFile = resolveMaybeAbsolute(
    configDir,
    cfg.checkpointFile,
    path.resolve(reportDir, "sitepulse-checkpoint.json"),
  );
  return { configPath, reportDir, checkpointFile };
}

function getSafeReportPath(fileName) {
  const base = path.basename(String(fileName ?? ""));
  if (!base.includes("sitepulse-")) return "";
  return path.resolve(reportDirActive, base);
}

async function listReportGroups() {
  if (!(await fileExists(reportDirActive))) return [];
  const names = await fs.readdir(reportDirActive);
  const grouped = new Map();

  for (const name of names) {
    if (!name.includes("-sitepulse-")) continue;
    const stamp = name.split("-sitepulse-")[0];
    const group = grouped.get(stamp) ?? {
      stamp,
      reportJson: "",
      reportMd: "",
      issuesLog: "",
      checkpoint: "",
      createdAt: "",
    };
    if (name.endsWith(".json") && name.includes("-sitepulse-report-")) group.reportJson = name;
    if (name.endsWith(".md") && name.includes("-sitepulse-report-")) group.reportMd = name;
    if (name.endsWith(".log") && name.includes("-sitepulse-issues-")) group.issuesLog = name;
    if (name.endsWith(".json") && name.includes("checkpoint")) group.checkpoint = name;
    grouped.set(stamp, group);
  }

  const groups = [];
  for (const group of grouped.values()) {
    const sampleFile = group.reportJson || group.reportMd || group.issuesLog;
    if (!sampleFile) continue;
    const stat = await fs.stat(path.resolve(reportDirActive, sampleFile)).catch(() => null);
    group.createdAt = stat?.mtime.toISOString() ?? "";
    groups.push(group);
  }

  return groups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function buildCommandPreview(options) {
  const args = [
    "node src/index.mjs",
    `--config ${options.configFile}`,
    options.fresh ? "--fresh" : "",
    options.headed ? "--headed" : "",
    options.noResume ? "--no-resume" : "",
    options.noServer ? "--no-server" : "",
    options.liveLog ? "--live-log" : "",
    options.humanLog ? "--human-log" : "",
    options.baseUrlOverride ? `--base-url ${options.baseUrlOverride}` : "",
    Number.isFinite(options.maxRunMs) && options.maxRunMs > 0 ? `--max-run-ms ${options.maxRunMs}` : "",
  ].filter(Boolean);
  return args.join(" ");
}

async function refreshCheckpointState() {
  if (!(await fileExists(checkpointFileActive))) {
    state.checkpoint = null;
    return;
  }
  const payload = await readJson(checkpointFileActive).catch(() => null);
  if (!payload?.report) return;
  state.checkpoint = payload.report;
}

async function refreshLatestReports() {
  state.latestReports = await listReportGroups();
  const latest = state.latestReports[0];
  if (!latest?.reportJson) return;
  const reportPath = path.resolve(reportDirActive, latest.reportJson);
  const report = await readJson(reportPath).catch(() => null);
  if (!report) return;
  state.summary = report.summary ?? null;
}

function parseLiveLine(line) {
  const trimmed = String(line ?? "").trim();
  if (!trimmed.startsWith("SPLIVE ")) return null;
  const payload = trimmed.slice("SPLIVE ".length);
  try {
    const parsed = JSON.parse(payload);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

function consumeOutputBuffer(level, chunk) {
  const lines = String(chunk ?? "").split(/\r?\n/).filter(Boolean);
  for (const line of lines) {
    const live = parseLiveLine(line);
    if (live) {
      pushEvent({
        ts: live.ts ?? nowIso(),
        type: live.type ?? "unknown",
        route: live.route ?? "",
        action: live.action ?? "",
        detail: live.detail ?? "",
      });
      continue;
    }
    pushLog(level, line);
  }
}

async function killProcessTreeWindows(pid) {
  if (!pid) return;
  await new Promise((resolve) => {
    const killer = spawn("cmd.exe", ["/d", "/s", "/c", `taskkill /PID ${pid} /T /F`], {
      stdio: "ignore",
      windowsHide: true,
    });
    killer.on("close", () => resolve());
    killer.on("error", () => resolve());
  });
}

async function stopRunner(reason = "manual_stop") {
  if (!runner || !state.running) return;
  pushLog("warn", `Parando auditoria (${reason})...`);
  await killProcessTreeWindows(runner.pid);
  runner = null;
  state.running = false;
  state.status = reason === "manual_stop" ? "stopped" : "idle";
  state.endedAt = nowIso();
  if (checkpointTimer) {
    clearInterval(checkpointTimer);
    checkpointTimer = null;
  }
}

async function startRunner(options) {
  if (state.running) throw new Error("Ja existe uma auditoria em execucao.");

  const ctx = await resolveRunContext(options.configFile);
  configPathActive = ctx.configPath;
  reportDirActive = ctx.reportDir;
  checkpointFileActive = ctx.checkpointFile;

  const commandArgs = ["src/index.mjs", "--config", path.basename(configPathActive), "--live-log"];
  if (options.fresh) commandArgs.push("--fresh");
  if (options.headed) commandArgs.push("--headed");
  if (options.noResume) commandArgs.push("--no-resume");
  if (options.noServer) commandArgs.push("--no-server");
  if (options.humanLog) commandArgs.push("--human-log");
  if (options.baseUrlOverride) commandArgs.push("--base-url", String(options.baseUrlOverride));
  if (Number.isFinite(options.maxRunMs) && options.maxRunMs > 0) {
    commandArgs.push("--max-run-ms", String(options.maxRunMs));
  }

  state.running = true;
  state.status = "running";
  state.startedAt = nowIso();
  state.endedAt = "";
  state.logs = [];
  state.events = [];
  state.currentEvent = null;
  state.summary = null;
  state.lastError = "";
  state.configFile = path.basename(configPathActive);
  state.baseUrlOverride = options.baseUrlOverride || "";
  state.activeUser = options.username || state.activeUser;
  state.commandPreview = buildCommandPreview({
    configFile: state.configFile,
    fresh: options.fresh,
    headed: options.headed,
    noResume: options.noResume,
    noServer: options.noServer,
    liveLog: true,
    humanLog: options.humanLog,
    maxRunMs: options.maxRunMs,
    baseUrlOverride: options.baseUrlOverride,
  });
  state.checkpoint = null;

  pushLog("info", `Executando: ${state.commandPreview}`);
  pushLog("info", `Pasta: ${QA_DIR}`);

  runner = spawn("node", commandArgs, {
    cwd: QA_DIR,
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });
  state.pid = runner.pid ?? null;

  runner.stdout.on("data", (chunk) => consumeOutputBuffer("stdout", chunk));
  runner.stderr.on("data", (chunk) => consumeOutputBuffer("stderr", chunk));

  runner.on("close", async (code) => {
    state.running = false;
    state.status = code === 0 ? "success" : "failed";
    state.endedAt = nowIso();
    pushLog(code === 0 ? "success" : "error", `Processo finalizado com codigo ${code}`);
    if (checkpointTimer) {
      clearInterval(checkpointTimer);
      checkpointTimer = null;
    }
    await refreshCheckpointState();
    await refreshLatestReports();
    runner = null;
    state.pid = null;
  });

  checkpointTimer = setInterval(async () => {
    await refreshCheckpointState();
    await refreshLatestReports();
  }, 1200);
}

function progressFromState() {
  const progress = state.checkpoint?.progress;
  if (!progress) {
    if (!state.running && state.summary) {
      return {
        percent: 100,
        nextRouteIndex: Number(state.summary.routesChecked ?? 0),
        totalRoutes: Number(state.summary.routesChecked ?? 0),
        nextLabelIndex: 0,
        segments: 0,
      };
    }
    return {
      percent: state.running ? 5 : 0,
      nextRouteIndex: 0,
      totalRoutes: 0,
      nextLabelIndex: 0,
      segments: 0,
    };
  }
  const total = Number(progress.totalRoutes ?? 0);
  const next = Number(progress.nextRouteIndex ?? 0);
  const percent = total > 0 ? Math.max(0, Math.min(100, Math.round((next / total) * 100))) : 0;
  return {
    percent,
    nextRouteIndex: next,
    totalRoutes: total,
    nextLabelIndex: Number(progress.nextLabelIndex ?? 0),
    segments: Number(progress.segments ?? 0),
  };
}

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.static(PUBLIC_DIR));

app.post("/api/auth/login", async (req, res) => {
  const username = String(req.body?.username ?? "").trim();
  const password = String(req.body?.password ?? "").trim();
  if (!username || !password) {
    return res.status(400).json({ ok: false, error: "Informe usuario e senha." });
  }

  const users = await loadUsers();
  const found = users.find((u) => String(u.username) === username && String(u.password) === password);
  if (!found) {
    return res.status(401).json({ ok: false, error: "Credenciais invalidas." });
  }

  const token = crypto.randomBytes(24).toString("hex");
  const user = sanitizeUser(found);
  sessions.set(token, {
    username: user.username,
    defaultConfig: user.defaultConfig,
    defaultBaseUrl: user.defaultBaseUrl,
    issuedAt: nowIso(),
  });
  state.activeUser = user.username;
  return res.json({ ok: true, token, user });
});

app.post("/api/auth/logout", authRequired, (req, res) => {
  sessions.delete(req.token);
  if (!sessions.size) state.activeUser = "";
  res.json({ ok: true });
});

app.get("/api/auth/me", authRequired, (req, res) => {
  res.json({
    ok: true,
    user: {
      username: req.session.username,
      defaultConfig: req.session.defaultConfig,
      defaultBaseUrl: req.session.defaultBaseUrl,
    },
  });
});

app.get("/api/meta", authRequired, async (_req, res) => {
  const configs = await listConfigFiles().catch(() => []);
  res.json({
    qaDir: QA_DIR,
    reportDir: reportDirActive,
    configs,
    port: PORT,
  });
});

app.get("/api/configs", authRequired, async (_req, res) => {
  const configs = await listConfigFiles().catch(() => []);
  res.json({ configs });
});

app.get("/api/state", authRequired, (_req, res) => {
  res.json({
    ...state,
    progress: progressFromState(),
  });
});

app.post("/api/run", authRequired, async (req, res) => {
  try {
    const configFile = String(req.body?.configFile ?? req.session.defaultConfig ?? "audit.kuruma.json");
    const fresh = req.body?.fresh !== false;
    const headed = req.body?.headed === true;
    const noResume = req.body?.noResume === true;
    const noServer = req.body?.noServer === true;
    const humanLog = req.body?.humanLog === true;
    const maxRunMs = Number(req.body?.maxRunMs ?? 0);
    const baseUrlOverride = String(req.body?.baseUrlOverride ?? req.session.defaultBaseUrl ?? "").trim();

    await startRunner({
      configFile,
      fresh,
      headed,
      noResume,
      noServer,
      humanLog,
      maxRunMs,
      baseUrlOverride,
      username: req.session.username,
    });
    res.json({ ok: true, running: true, state });
  } catch (error) {
    res.status(400).json({ ok: false, error: String(error?.message ?? error) });
  }
});

app.post("/api/stop", authRequired, async (_req, res) => {
  await stopRunner("manual_stop");
  res.json({ ok: true, running: state.running });
});

app.get("/api/reports", authRequired, async (_req, res) => {
  const groups = await listReportGroups().catch(() => []);
  state.latestReports = groups;
  res.json({ groups });
});

app.get("/api/report", authRequired, async (req, res) => {
  const file = String(req.query.file ?? "");
  const reportPath = getSafeReportPath(file);
  if (!reportPath || !(await fileExists(reportPath))) {
    return res.status(404).json({ ok: false, error: "Arquivo nao encontrado." });
  }

  const ext = path.extname(reportPath).toLowerCase();
  if (ext === ".json") {
    const payload = await readJson(reportPath).catch(() => null);
    if (!payload) return res.status(500).json({ ok: false, error: "Falha ao ler JSON." });
    return res.json({ ok: true, type: "json", file: path.basename(reportPath), payload });
  }

  const text = await fs.readFile(reportPath, "utf8").catch(() => "");
  return res.json({ ok: true, type: "text", file: path.basename(reportPath), payload: text });
});

app.get("/api/report/download", authRequired, async (req, res) => {
  const file = String(req.query.file ?? "");
  const reportPath = getSafeReportPath(file);
  if (!reportPath || !(await fileExists(reportPath))) {
    return res.status(404).send("Arquivo nao encontrado.");
  }
  return res.download(reportPath, path.basename(reportPath));
});

app.get("*", (_req, res) => {
  res.sendFile(path.resolve(PUBLIC_DIR, "index.html"));
});

app.listen(PORT, async () => {
  await ensureUsersFile();
  state.latestReports = await listReportGroups().catch(() => []);
  pushLog("info", `SitePulse Studio em http://127.0.0.1:${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`[SitePulse Studio] http://127.0.0.1:${PORT}`);
});
