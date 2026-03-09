#!/usr/bin/env node
import { spawn } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium } from "playwright";

const EXIT_OK = 0;
const EXIT_FAIL = 1;
const EXIT_PARTIAL = 2;
const CHECKPOINT_VERSION = 1;

const CODE = {
  ROUTE_LOAD_FAIL: "ROUTE_LOAD_FAIL",
  BTN_CLICK_ERROR: "BTN_CLICK_ERROR",
  BTN_NO_EFFECT: "BTN_NO_EFFECT",
  HTTP_4XX: "HTTP_4XX",
  HTTP_5XX: "HTTP_5XX",
  NET_REQUEST_FAILED: "NET_REQUEST_FAILED",
  JS_RUNTIME_ERROR: "JS_RUNTIME_ERROR",
  CONSOLE_ERROR: "CONSOLE_ERROR",
};

const ISSUE_GUIDE = {
  [CODE.ROUTE_LOAD_FAIL]: {
    technical:
      "Falha ao abrir a rota dentro do timeout configurado. Pode envolver erro de render, middleware, auth ou timeout de backend.",
    layman:
      "A pagina nao abriu quando deveria. Para o usuario final, parece que o site travou ou ficou indisponivel.",
    recommendation:
      "Validar middleware/auth, tempo de resposta e erros do servidor para a rota; adicionar fallback visual para carregamento.",
  },
  [CODE.BTN_CLICK_ERROR]: {
    technical:
      "O clique do botao gerou excecao de automacao ou estado invalido na interface.",
    layman:
      "O botao existe, mas ao clicar ele falha em vez de executar a acao esperada.",
    recommendation:
      "Revisar handler do botao, estado desabilitado, seletores e erros de runtime ligados ao evento de clique.",
  },
  [CODE.BTN_NO_EFFECT]: {
    technical:
      "Clique concluido sem efeito detectavel (URL, DOM, request, dialog, scroll). Possivel callback vazio ou condicao de guarda excessiva.",
    layman:
      "O botao parece funcionar, mas nao acontece nada visivel para quem usa o site.",
    recommendation:
      "Garantir feedback de sucesso/erro, navegacao, abertura de modal, mudanca de estado visual ou rolagem para secao alvo.",
  },
  [CODE.HTTP_4XX]: {
    technical:
      "Requisicao da interface retornou erro 4xx, geralmente payload invalido, permissao ausente ou endpoint incorreto.",
    layman:
      "O site tentou falar com o servidor, mas a requisicao foi rejeitada por erro de dados ou permissao.",
    recommendation:
      "Conferir contrato da API, autenticacao/autorizacao e validacao de campos antes de enviar.",
  },
  [CODE.HTTP_5XX]: {
    technical:
      "Requisicao da interface retornou erro 5xx, indicando falha interna no backend ou dependencia.",
    layman:
      "O servidor caiu ou nao conseguiu processar a acao pedida pelo usuario.",
    recommendation:
      "Investigar logs do backend, tratar excecoes, aplicar retry/fallback e monitoramento no endpoint afetado.",
  },
  [CODE.NET_REQUEST_FAILED]: {
    technical:
      "A requisicao falhou na camada de rede (DNS, conexao, CORS, timeout, cancelamento nao esperado).",
    layman:
      "O site tentou buscar dados, mas a comunicacao com o servidor falhou.",
    recommendation:
      "Verificar disponibilidade da API, CORS, URL/basePath e implementar mensagem amigavel com tentativa de nova carga.",
  },
  [CODE.JS_RUNTIME_ERROR]: {
    technical:
      "Erro de JavaScript em runtime no navegador, potencialmente quebrando fluxo ou renderizacao.",
    layman:
      "Uma falha de codigo no navegador interrompeu parte do funcionamento da tela.",
    recommendation:
      "Adicionar tratamento de erro, validacao de null/undefined e cobertura de testes para o fluxo afetado.",
  },
  [CODE.CONSOLE_ERROR]: {
    technical:
      "Mensagem de erro registrada no console do navegador durante a navegacao auditada.",
    layman:
      "Algo deu errado por baixo dos panos, mesmo que a tela ainda apareca.",
    recommendation:
      "Inspecionar stack/message no console, remover erros silenciosos e corrigir integrações quebradas.",
  },
};

function nowIso() {
  return new Date().toISOString();
}

function nowStamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function shortHash(value) {
  return crypto.createHash("sha1").update(value).digest("hex").slice(0, 12);
}

function normalizeText(value) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function parseArgs(argv) {
  const args = {
    configPath: "audit.config.json",
    headed: false,
    fresh: false,
    noResume: false,
    maxRunMs: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--headed") {
      args.headed = true;
      continue;
    }
    if (token === "--fresh") {
      args.fresh = true;
      continue;
    }
    if (token === "--no-resume") {
      args.noResume = true;
      continue;
    }
    if (token === "--config" && argv[i + 1]) {
      args.configPath = argv[i + 1];
      i += 1;
      continue;
    }
    if (token === "--max-run-ms" && argv[i + 1]) {
      const parsed = Number(argv[i + 1]);
      args.maxRunMs = Number.isFinite(parsed) && parsed > 0 ? parsed : null;
      i += 1;
      continue;
    }
  }

  return args;
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  const sanitized = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
  return JSON.parse(sanitized);
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function ensureArray(value, fieldName) {
  if (!Array.isArray(value)) {
    throw new Error(`Config invalida: ${fieldName} precisa ser array.`);
  }
}

function toAbsoluteMaybe(value, baseDir) {
  if (!value || typeof value !== "string") return "";
  return path.isAbsolute(value) ? value : path.resolve(baseDir, value);
}

function normalizeConfig(config, configDir) {
  if (!config || typeof config !== "object") {
    throw new Error("Config invalida: JSON vazio ou incorreto.");
  }

  ensureArray(config.routes, "routes");
  ensureArray(config.allowedNoEffectButtonContains ?? [], "allowedNoEffectButtonContains");
  ensureArray(config.ignoredRequestFailedErrors ?? [], "ignoredRequestFailedErrors");

  const serverCwd = path.isAbsolute(config.serverCwd)
    ? config.serverCwd
    : path.resolve(configDir, config.serverCwd ?? process.cwd());

  const reportDir = toAbsoluteMaybe(config.reportDir, configDir) || path.resolve(configDir, "reports");
  const checkpointFile =
    toAbsoluteMaybe(config.checkpointFile, configDir) ||
    path.resolve(reportDir, "sitepulse-checkpoint.json");

  return {
    name: String(config.name ?? "site-audit"),
    baseUrl: String(config.baseUrl ?? "http://127.0.0.1:3000"),
    serverCommand: String(config.serverCommand ?? "npm run start"),
    serverCwd,
    routes: config.routes.map((item) => String(item)),
    routeLoadTimeoutMs: Number(config.routeLoadTimeoutMs ?? 30000),
    buttonClickTimeoutMs: Number(config.buttonClickTimeoutMs ?? 3000),
    clickWaitMs: Number(config.clickWaitMs ?? 900),
    viewportWidth: Number.isFinite(Number(config.viewportWidth)) ? Math.max(320, Number(config.viewportWidth)) : 1536,
    viewportHeight: Number.isFinite(Number(config.viewportHeight)) ? Math.max(320, Number(config.viewportHeight)) : 864,
    requireButtonEffect: config.requireButtonEffect !== false,
    allowedNoEffectButtonContains: (config.allowedNoEffectButtonContains ?? []).map((item) => String(item).toLowerCase()),
    reportDir,
    checkpointFile,
    checkpointEveryClicks: Number(config.checkpointEveryClicks ?? 20),
    maxRunMs: Number(config.maxRunMs ?? 0),
    scrollEffectMinPx: Number.isFinite(Number(config.scrollEffectMinPx))
      ? Math.max(0, Number(config.scrollEffectMinPx))
      : 8,
    ignoredRequestFailedErrors: (config.ignoredRequestFailedErrors ?? ["ERR_ABORTED"]).map((item) =>
      String(item).toLowerCase(),
    ),
  };
}

function mkIssue(input) {
  const guide = ISSUE_GUIDE[input.code] ?? {
    technical: "Sem descricao tecnica definida para este codigo.",
    layman: "Foi detectada uma inconsistenca que precisa de revisao.",
    recommendation: "Revisar logs e fluxo afetado para aplicar correcao orientada a causa raiz.",
  };
  return {
    id: shortHash(`${input.code}|${input.route}|${input.action ?? ""}|${input.detail}`),
    code: input.code,
    severity: input.severity,
    route: input.route,
    action: input.action ?? "",
    detail: input.detail,
    url: input.url ?? "",
    timestamp: nowIso(),
    technicalExplanation: guide.technical,
    laymanExplanation: guide.layman,
    recommendedResolution: guide.recommendation,
  };
}

function pushIssue(report, input) {
  const issue = mkIssue(input);
  report.issues.push(issue);
  report.issueLog.push({
    timestamp: issue.timestamp,
    code: issue.code,
    severity: issue.severity,
    route: issue.route,
    action: issue.action,
    detail: issue.detail,
    laymanExplanation: issue.laymanExplanation,
    recommendedResolution: issue.recommendedResolution,
  });
}

function severityFromCode(code) {
  if (code === CODE.ROUTE_LOAD_FAIL || code === CODE.HTTP_5XX || code === CODE.JS_RUNTIME_ERROR) return "high";
  if (code === CODE.BTN_CLICK_ERROR || code === CODE.NET_REQUEST_FAILED) return "medium";
  return "low";
}

function buildPromptPack(issues) {
  const byCode = new Map();
  for (const issue of issues) {
    const list = byCode.get(issue.code) ?? [];
    list.push(issue);
    byCode.set(issue.code, list);
  }

  const prompts = [];

  if (byCode.has(CODE.BTN_NO_EFFECT)) {
    const rows = byCode
      .get(CODE.BTN_NO_EFFECT)
      .slice(0, 20)
      .map((i) => `- ${i.route} -> "${i.action}"`)
      .join("\n");
    prompts.push(
      [
        "Corrija todos os botoes sem efeito observavel.",
        "Cada clique deve gerar mudanca de estado visual, navegacao, request ou mensagem de status.",
        "Itens detectados:",
        rows,
      ].join("\n"),
    );
  }

  if (byCode.has(CODE.HTTP_5XX) || byCode.has(CODE.HTTP_4XX)) {
    const rows = [...(byCode.get(CODE.HTTP_5XX) ?? []), ...(byCode.get(CODE.HTTP_4XX) ?? [])]
      .slice(0, 20)
      .map((i) => `- ${i.route} -> ${i.detail}`)
      .join("\n");
    prompts.push(
      [
        "Corrija as rotas/API com erro HTTP durante interacoes de UI.",
        "Mantenha fluxo idempotente, mensagens de erro claras e status consistente na tela.",
        "Ocorrencias:",
        rows,
      ].join("\n"),
    );
  }

  if (byCode.has(CODE.JS_RUNTIME_ERROR) || byCode.has(CODE.CONSOLE_ERROR) || byCode.has(CODE.NET_REQUEST_FAILED)) {
    const rows = [...(byCode.get(CODE.JS_RUNTIME_ERROR) ?? []), ...(byCode.get(CODE.CONSOLE_ERROR) ?? []), ...(byCode.get(CODE.NET_REQUEST_FAILED) ?? [])]
      .slice(0, 20)
      .map((i) => `- ${i.route} -> ${i.code}: ${i.detail}`)
      .join("\n");
    prompts.push(
      [
        "Resolva erros de runtime/rede do frontend.",
        "Garanta try/catch, fallback de estado e tratamento de respostas invalidas.",
        "Ocorrencias:",
        rows,
      ].join("\n"),
    );
  }

  const masterPrompt = [
    "Faca uma passada completa no app e elimine todos os erros abaixo.",
    "Exigencias: sem botao sem efeito, sem callback solto, sem erro fetch sem feedback, sem 4xx/5xx inesperado no fluxo principal.",
    "Apos corrigir, rode novamente o auditor e garanta zero falhas.",
    ...prompts,
  ].join("\n\n");

  return { masterPrompt, prompts };
}

function laymanSummaryByCode(issues) {
  const grouped = new Map();
  for (const issue of issues) {
    if (!grouped.has(issue.code)) {
      grouped.set(issue.code, { count: 0, layman: issue.laymanExplanation, resolution: issue.recommendedResolution });
    }
    grouped.get(issue.code).count += 1;
  }
  return Array.from(grouped.entries()).map(([code, info]) => ({ code, ...info }));
}

function toMarkdown(report) {
  const lines = [];
  lines.push("# SitePulse QA Report");
  lines.push("");
  lines.push(`- Projeto: ${report.meta.project}`);
  lines.push(`- Inicio: ${report.meta.startedAt}`);
  lines.push(`- Fim: ${report.meta.finishedAt}`);
  lines.push(`- Base URL: ${report.meta.baseUrl}`);
  lines.push(`- Viewport: ${report.meta.viewport ?? "n/a"}`);
  lines.push(`- Execucao pausada: ${report.meta.paused ? "sim" : "nao"}`);
  lines.push(`- Retomado de checkpoint: ${report.meta.resumedFromCheckpoint ? "sim" : "nao"}`);
  lines.push("");
  lines.push("## Resumo");
  lines.push("");
  lines.push(`- Rotas verificadas: ${report.summary.routesChecked}`);
  lines.push(`- Falhas de carga de rota: ${report.summary.routeLoadFailures}`);
  lines.push(`- Botoes verificados: ${report.summary.buttonsChecked}`);
  lines.push(`- Botoes sem efeito: ${report.summary.buttonsNoEffect}`);
  lines.push(`- Erros HTTP 4xx: ${report.summary.http4xx}`);
  lines.push(`- Erros HTTP 5xx: ${report.summary.http5xx}`);
  lines.push(`- Erros de rede: ${report.summary.netRequestFailed}`);
  lines.push(`- Erros JS runtime: ${report.summary.jsRuntimeErrors}`);
  lines.push(`- Console errors: ${report.summary.consoleErrors}`);
  lines.push(`- Total issues: ${report.summary.totalIssues}`);

  lines.push("");
  lines.push("## Explicacao Para Leigos");
  lines.push("");
  const laymanSummary = laymanSummaryByCode(report.issues);
  if (!laymanSummary.length) {
    lines.push("- Nenhum problema detectado nesta rodada.");
  } else {
    for (const row of laymanSummary) {
      lines.push(`- [${row.code}] ${row.count} ocorrencia(s)`);
      lines.push(`  - O que isso significa: ${row.layman}`);
      lines.push(`  - O que fazer: ${row.resolution}`);
    }
  }
  lines.push("");
  lines.push("## Progresso");
  lines.push("");
  lines.push(`- Proxima rota indice: ${report.progress.nextRouteIndex}`);
  lines.push(`- Proximo botao indice: ${report.progress.nextLabelIndex}`);
  lines.push(`- Segmentos executados: ${report.progress.segments}`);

  lines.push("");
  lines.push("## Issues");
  lines.push("");

  if (report.issues.length === 0) {
    lines.push("Sem issues detectadas.");
  } else {
    for (const issue of report.issues) {
      lines.push(`- [${issue.code}] (${issue.severity}) ${issue.route}${issue.action ? ` -> ${issue.action}` : ""}: ${issue.detail}`);
      lines.push(`  - Tecnico: ${issue.technicalExplanation}`);
      lines.push(`  - Leigo: ${issue.laymanExplanation}`);
      lines.push(`  - Resolucao recomendada: ${issue.recommendedResolution}`);
    }
  }

  lines.push("");
  lines.push("## Prompt Master");
  lines.push("");
  lines.push("```text");
  lines.push(report.promptPack.masterPrompt);
  lines.push("```");

  return lines.join("\n");
}

function toIssueLog(report) {
  if (!report.issueLog.length) {
    return "[SitePulse-QA] Sem issues detectadas nesta execucao.";
  }

  return report.issueLog
    .map((entry) =>
      [
        `[${entry.timestamp}] [${entry.severity}] [${entry.code}] ${entry.route}${entry.action ? ` -> ${entry.action}` : ""}`,
        `detalhe: ${entry.detail}`,
        `leigo: ${entry.laymanExplanation}`,
        `resolucao_recomendada: ${entry.recommendedResolution}`,
      ].join("\n"),
    )
    .join("\n\n");
}

function extractButtonLabels(page) {
  return page.evaluate(() => {
    const isVisible = (el) => {
      const style = window.getComputedStyle(el);
      if (!style || style.visibility === "hidden" || style.display === "none") return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };

    const all = Array.from(document.querySelectorAll("button"));
    const labels = all
      .filter((el) => isVisible(el))
      .map((el) => {
        const text = (el.textContent ?? "").replace(/\s+/g, " ").trim();
        const aria = (el.getAttribute("aria-label") ?? "").replace(/\s+/g, " ").trim();
        const title = (el.getAttribute("title") ?? "").replace(/\s+/g, " ").trim();
        return text || aria || title || "";
      })
      .filter((label) => label.length > 0);

    return Array.from(new Set(labels));
  });
}

async function fingerprint(page) {
  const snap = await page.evaluate(() => {
    const bodyText = (document.body?.innerText ?? "").replace(/\s+/g, " ").trim();
    const dialogs = document.querySelectorAll('[role="dialog"], .modal, [data-state="open"]').length;
    return {
      href: window.location.href,
      title: document.title,
      bodyText,
      rootClass: document.documentElement.className,
      dialogs,
      scrollY: Math.round(window.scrollY),
    };
  });

  return {
    href: snap.href,
    title: snap.title,
    bodyHash: shortHash(snap.bodyText.slice(0, 20000)),
    rootClass: snap.rootClass,
    dialogs: snap.dialogs,
    scrollY: snap.scrollY,
  };
}

async function clickButtonByLabel(page, label, cfg, counters) {
  const strict = page.getByRole("button", { name: label, exact: true }).first();
  let target = strict;
  let visible = await strict.isVisible().catch(() => false);

  if (!visible) {
    const soft = page.getByRole("button", { name: label }).first();
    visible = await soft.isVisible().catch(() => false);
    target = soft;
  }

  if (!visible) {
    return { ok: false, reason: "button_not_visible" };
  }

  const enabled = await target.isEnabled().catch(() => false);
  if (!enabled) {
    return { ok: false, reason: "button_disabled" };
  }

  const before = await fingerprint(page);
  const beforeReq = counters.requestsFinished;
  const beforeDialogs = counters.dialogs;

  await target.click({ timeout: cfg.buttonClickTimeoutMs });
  await page.waitForTimeout(cfg.clickWaitMs);

  const after = await fingerprint(page);
  const effectDetected =
    before.href !== after.href ||
    before.title !== after.title ||
    before.bodyHash !== after.bodyHash ||
    before.rootClass !== after.rootClass ||
    before.dialogs !== after.dialogs ||
    Math.abs(before.scrollY - after.scrollY) >= cfg.scrollEffectMinPx ||
    counters.requestsFinished > beforeReq ||
    counters.dialogs > beforeDialogs;

  return {
    ok: true,
    effectDetected,
  };
}

function canIgnoreNoEffect(label, cfg) {
  const normalized = label.toLowerCase();
  return cfg.allowedNoEffectButtonContains.some((token) => normalized.includes(token));
}

async function wait(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(baseUrl, timeoutMs = 120000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(baseUrl);
      if (response.status < 500) {
        return;
      }
    } catch {
      // keep waiting
    }
    await wait(1000);
  }
  throw new Error(`Servidor nao respondeu em ${baseUrl} em ${timeoutMs}ms.`);
}

async function killProcessTreeWindows(pid) {
  if (!pid || Number.isNaN(pid)) return;
  await new Promise((resolve) => {
    const killer = spawn("cmd.exe", ["/d", "/s", "/c", `taskkill /PID ${pid} /T /F`], {
      stdio: "ignore",
      windowsHide: true,
    });
    killer.on("close", () => resolve());
    killer.on("error", () => resolve());
  });
}

function dedupeIssues(issues) {
  const seen = new Set();
  const deduped = [];
  for (const issue of issues) {
    const key = `${issue.code}|${issue.route}|${issue.action}|${issue.detail}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(issue);
  }
  return deduped;
}

function summarize(report) {
  const count = (code) => report.issues.filter((item) => item.code === code).length;

  return {
    routesChecked: report.routeSweep.length,
    routeLoadFailures: count(CODE.ROUTE_LOAD_FAIL),
    buttonsChecked: report.routeSweep.reduce((acc, item) => acc + item.buttonsDiscovered, 0),
    buttonsNoEffect: count(CODE.BTN_NO_EFFECT),
    http4xx: count(CODE.HTTP_4XX),
    http5xx: count(CODE.HTTP_5XX),
    netRequestFailed: count(CODE.NET_REQUEST_FAILED),
    jsRuntimeErrors: count(CODE.JS_RUNTIME_ERROR),
    consoleErrors: count(CODE.CONSOLE_ERROR),
    totalIssues: report.issues.length,
  };
}

function createEmptyReport(cfg, args, maxRunMs) {
  return {
    meta: {
      project: cfg.name,
      startedAt: nowIso(),
      finishedAt: "",
      baseUrl: cfg.baseUrl,
      serverCommand: cfg.serverCommand,
      serverCwd: cfg.serverCwd,
      headed: args.headed,
      viewport: `${cfg.viewportWidth}x${cfg.viewportHeight}`,
      resumedFromCheckpoint: false,
      paused: false,
      maxRunMs,
      checkpointFile: cfg.checkpointFile,
    },
    progress: {
      nextRouteIndex: 0,
      nextLabelIndex: 0,
      totalRoutes: cfg.routes.length,
      segments: 0,
    },
    routeSweep: [],
    issues: [],
    issueLog: [],
    promptPack: {
      masterPrompt: "",
      prompts: [],
    },
    summary: {},
  };
}

function normalizeCheckpointReport(report, cfg, args, maxRunMs) {
  if (!report || typeof report !== "object") {
    return createEmptyReport(cfg, args, maxRunMs);
  }

  if (!report.meta || typeof report.meta !== "object") {
    report.meta = {};
  }
  if (!report.progress || typeof report.progress !== "object") {
    report.progress = {
      nextRouteIndex: 0,
      nextLabelIndex: 0,
      totalRoutes: cfg.routes.length,
      segments: 0,
    };
  }
  if (!Array.isArray(report.routeSweep)) report.routeSweep = [];
  if (!Array.isArray(report.issues)) report.issues = [];
  if (!Array.isArray(report.issueLog)) report.issueLog = [];
  if (!report.promptPack || typeof report.promptPack !== "object") {
    report.promptPack = { masterPrompt: "", prompts: [] };
  }

  report.meta.project = cfg.name;
  report.meta.baseUrl = cfg.baseUrl;
  report.meta.serverCommand = cfg.serverCommand;
  report.meta.serverCwd = cfg.serverCwd;
  report.meta.headed = args.headed;
  report.meta.viewport = `${cfg.viewportWidth}x${cfg.viewportHeight}`;
  report.meta.resumedFromCheckpoint = true;
  report.meta.paused = false;
  report.meta.maxRunMs = maxRunMs;
  report.meta.checkpointFile = cfg.checkpointFile;
  report.meta.finishedAt = "";

  report.progress.totalRoutes = cfg.routes.length;
  report.progress.nextRouteIndex = Math.max(0, Math.min(Number(report.progress.nextRouteIndex ?? 0), cfg.routes.length));
  report.progress.nextLabelIndex = Math.max(0, Number(report.progress.nextLabelIndex ?? 0));
  report.progress.segments = Math.max(0, Number(report.progress.segments ?? 0));

  return report;
}

async function loadCheckpoint(checkpointFile) {
  if (!(await fileExists(checkpointFile))) {
    return null;
  }

  const payload = await readJson(checkpointFile);
  if (!payload || payload.version !== CHECKPOINT_VERSION || !payload.report) {
    return null;
  }
  return payload.report;
}

async function saveCheckpoint(checkpointFile, report) {
  const dir = path.dirname(checkpointFile);
  await fs.mkdir(dir, { recursive: true });
  const payload = {
    version: CHECKPOINT_VERSION,
    savedAt: nowIso(),
    report,
  };
  await fs.writeFile(checkpointFile, JSON.stringify(payload, null, 2), "utf8");
}

async function clearCheckpoint(checkpointFile) {
  if (await fileExists(checkpointFile)) {
    await fs.unlink(checkpointFile);
  }
}

function ensureRouteResult(report, route) {
  let found = report.routeSweep.find((item) => item.route === route);
  if (found) return found;

  found = {
    route,
    loadOk: true,
    buttonsDiscovered: 0,
    buttonsClicked: 0,
  };
  report.routeSweep.push(found);
  return found;
}

function shouldPauseByTime(runStartedAt, maxRunMs) {
  return maxRunMs > 0 && Date.now() - runStartedAt >= maxRunMs;
}

function finalizeReport(report, paused) {
  report.issues = dedupeIssues(report.issues);
  report.issueLog = report.issues.map((issue) => ({
    timestamp: issue.timestamp,
    code: issue.code,
    severity: issue.severity,
    route: issue.route,
    action: issue.action,
    detail: issue.detail,
    laymanExplanation: issue.laymanExplanation,
    recommendedResolution: issue.recommendedResolution,
  }));
  report.promptPack = buildPromptPack(report.issues);
  report.summary = summarize(report);
  report.meta.finishedAt = nowIso();
  report.meta.paused = paused;
}

async function writeReportArtifacts(report, reportDir, paused) {
  await fs.mkdir(reportDir, { recursive: true });
  const stamp = nowStamp();
  const suffix = paused ? "partial" : "final";
  const jsonPath = path.join(reportDir, `${stamp}-sitepulse-report-${suffix}.json`);
  const mdPath = path.join(reportDir, `${stamp}-sitepulse-report-${suffix}.md`);
  const issueLogPath = path.join(reportDir, `${stamp}-sitepulse-issues-${suffix}.log`);
  await fs.writeFile(jsonPath, JSON.stringify(report, null, 2), "utf8");
  await fs.writeFile(mdPath, toMarkdown(report), "utf8");
  await fs.writeFile(issueLogPath, toIssueLog(report), "utf8");
  return { jsonPath, mdPath, issueLogPath };
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  const configPath = path.resolve(process.cwd(), args.configPath);
  const configDir = path.dirname(configPath);
  const rawConfig = await readJson(configPath);
  const cfg = normalizeConfig(rawConfig, configDir);

  const maxRunMs = args.maxRunMs ?? (cfg.maxRunMs > 0 ? cfg.maxRunMs : 0);

  if (args.fresh) {
    await clearCheckpoint(cfg.checkpointFile);
  }

  let report = createEmptyReport(cfg, args, maxRunMs);
  if (!args.noResume) {
    const restored = await loadCheckpoint(cfg.checkpointFile);
    if (restored) {
      report = normalizeCheckpointReport(restored, cfg, args, maxRunMs);
    }
  }

  report.progress.segments += 1;

  let currentRoute = "(none)";
  let currentAction = "";
  let paused = false;
  let clicksSinceLastCheckpoint = 0;

  const runStartedAt = Date.now();

  const server = spawn("cmd.exe", ["/d", "/s", "/c", cfg.serverCommand], {
    cwd: cfg.serverCwd,
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });

  server.stdout.on("data", () => {
    // kept intentionally empty (drain stream)
  });
  server.stderr.on("data", () => {
    // kept intentionally empty (drain stream)
  });

  const counters = {
    requestsFinished: 0,
    dialogs: 0,
  };

  let browser = null;

  try {
    await waitForServer(`${cfg.baseUrl}/`);

    browser = await chromium.launch({ headless: !args.headed });
    const context = await browser.newContext({ viewport: { width: cfg.viewportWidth, height: cfg.viewportHeight } });
    const page = await context.newPage();

    page.on("dialog", async (dialog) => {
      counters.dialogs += 1;
      try {
        await dialog.dismiss();
      } catch {
        // ignore
      }
    });

    page.on("pageerror", (error) => {
      pushIssue(report, {
        code: CODE.JS_RUNTIME_ERROR,
        severity: severityFromCode(CODE.JS_RUNTIME_ERROR),
        route: currentRoute,
        action: currentAction,
        detail: normalizeText(error.message) || "Erro JS em runtime.",
        url: page.url(),
      });
    });

    page.on("console", (msg) => {
      if (msg.type() !== "error") return;
      pushIssue(report, {
        code: CODE.CONSOLE_ERROR,
        severity: severityFromCode(CODE.CONSOLE_ERROR),
        route: currentRoute,
        action: currentAction,
        detail: normalizeText(msg.text()) || "Erro de console.",
        url: page.url(),
      });
    });

    page.on("requestfinished", () => {
      counters.requestsFinished += 1;
    });

    page.on("requestfailed", (request) => {
      const failure = request.failure()?.errorText ?? "request_failed";
      const ignored = cfg.ignoredRequestFailedErrors.some((token) => failure.toLowerCase().includes(token));
      if (ignored) return;
      pushIssue(report, {
        code: CODE.NET_REQUEST_FAILED,
        severity: severityFromCode(CODE.NET_REQUEST_FAILED),
        route: currentRoute,
        action: currentAction,
        detail: `${request.method()} ${request.url()} :: ${failure}`,
        url: page.url(),
      });
    });

    page.on("response", (response) => {
      const status = response.status();
      if (status < 400) return;
      const code = status >= 500 ? CODE.HTTP_5XX : CODE.HTTP_4XX;
      pushIssue(report, {
        code,
        severity: severityFromCode(code),
        route: currentRoute,
        action: currentAction,
        detail: `${status} ${response.request().method()} ${response.url()}`,
        url: page.url(),
      });
    });

    routeLoop: for (let routeIndex = report.progress.nextRouteIndex; routeIndex < cfg.routes.length; routeIndex += 1) {
      if (shouldPauseByTime(runStartedAt, maxRunMs)) {
        paused = true;
        report.progress.nextRouteIndex = routeIndex;
        report.progress.nextLabelIndex = 0;
        break;
      }

      const route = cfg.routes[routeIndex];
      currentRoute = route;
      currentAction = "route_load";

      const routeResult = ensureRouteResult(report, route);
      routeResult.loadOk = true;

      try {
        await page.goto(`${cfg.baseUrl}${route}`, {
          waitUntil: "domcontentloaded",
          timeout: cfg.routeLoadTimeoutMs,
        });
        await page.waitForTimeout(300);
      } catch (error) {
        routeResult.loadOk = false;
        pushIssue(report, {
          code: CODE.ROUTE_LOAD_FAIL,
          severity: severityFromCode(CODE.ROUTE_LOAD_FAIL),
          route,
          detail: normalizeText(String(error)),
          url: `${cfg.baseUrl}${route}`,
        });
        report.progress.nextRouteIndex = routeIndex + 1;
        report.progress.nextLabelIndex = 0;
        await saveCheckpoint(cfg.checkpointFile, report);
        continue;
      }

      const labels = await extractButtonLabels(page);
      routeResult.buttonsDiscovered = Math.max(routeResult.buttonsDiscovered, labels.length);

      let labelStartIndex = routeIndex === report.progress.nextRouteIndex ? report.progress.nextLabelIndex : 0;
      if (labelStartIndex < 0) labelStartIndex = 0;
      if (labelStartIndex > labels.length) labelStartIndex = labels.length;

      for (let labelIndex = labelStartIndex; labelIndex < labels.length; labelIndex += 1) {
        if (shouldPauseByTime(runStartedAt, maxRunMs)) {
          paused = true;
          report.progress.nextRouteIndex = routeIndex;
          report.progress.nextLabelIndex = labelIndex;
          break routeLoop;
        }

        const label = labels[labelIndex];
        currentAction = label;

        try {
          if (!page.url().includes(route)) {
            await page.goto(`${cfg.baseUrl}${route}`, {
              waitUntil: "domcontentloaded",
              timeout: cfg.routeLoadTimeoutMs,
            });
            await page.waitForTimeout(250);
          }

          const result = await clickButtonByLabel(page, label, cfg, counters);
          if (!result.ok) {
            if (result.reason !== "button_disabled" && result.reason !== "button_not_visible") {
              pushIssue(report, {
                code: CODE.BTN_CLICK_ERROR,
                severity: severityFromCode(CODE.BTN_CLICK_ERROR),
                route,
                action: label,
                detail: `Falha no clique: ${result.reason}`,
                url: page.url(),
              });
            }
          } else {
            routeResult.buttonsClicked += 1;

            if (cfg.requireButtonEffect && !result.effectDetected && !canIgnoreNoEffect(label, cfg)) {
              pushIssue(report, {
                code: CODE.BTN_NO_EFFECT,
                severity: severityFromCode(CODE.BTN_NO_EFFECT),
                route,
                action: label,
                detail: "Clique sem efeito observavel (URL, DOM, request, dialog, scroll).",
                url: page.url(),
              });
            }
          }
        } catch (error) {
          pushIssue(report, {
            code: CODE.BTN_CLICK_ERROR,
            severity: severityFromCode(CODE.BTN_CLICK_ERROR),
            route,
            action: label,
            detail: normalizeText(String(error)),
            url: page.url(),
          });
        }

        report.progress.nextRouteIndex = routeIndex;
        report.progress.nextLabelIndex = labelIndex + 1;

        clicksSinceLastCheckpoint += 1;
        if (cfg.checkpointEveryClicks > 0 && clicksSinceLastCheckpoint >= cfg.checkpointEveryClicks) {
          await saveCheckpoint(cfg.checkpointFile, report);
          clicksSinceLastCheckpoint = 0;
        }
      }

      if (!paused) {
        report.progress.nextRouteIndex = routeIndex + 1;
        report.progress.nextLabelIndex = 0;
      }

      await saveCheckpoint(cfg.checkpointFile, report);
      clicksSinceLastCheckpoint = 0;

      if (paused) {
        break;
      }
    }
  } finally {
    if (browser) {
      await browser.close().catch(() => undefined);
    }
    await killProcessTreeWindows(server.pid);
  }

  const finished = !paused && report.progress.nextRouteIndex >= cfg.routes.length;
  if (finished) {
    report.progress.nextRouteIndex = cfg.routes.length;
    report.progress.nextLabelIndex = 0;
  }

  finalizeReport(report, paused);
  const artifacts = await writeReportArtifacts(report, cfg.reportDir, paused);

  if (paused) {
    await saveCheckpoint(cfg.checkpointFile, report);
  } else {
    await clearCheckpoint(cfg.checkpointFile);
  }

  const output = {
    ok: !paused && report.summary.totalIssues === 0,
    paused,
    resumedFromCheckpoint: report.meta.resumedFromCheckpoint,
    progress: report.progress,
    summary: report.summary,
    checkpointFile: cfg.checkpointFile,
    jsonReport: artifacts.jsonPath,
    markdownReport: artifacts.mdPath,
    issueLog: artifacts.issueLogPath,
  };

  console.log(JSON.stringify(output, null, 2));

  if (paused) {
    process.exitCode = EXIT_PARTIAL;
  } else {
    process.exitCode = report.summary.totalIssues === 0 ? EXIT_OK : EXIT_FAIL;
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(EXIT_FAIL);
});
