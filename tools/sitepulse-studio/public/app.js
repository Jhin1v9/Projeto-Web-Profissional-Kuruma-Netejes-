const TOKEN_KEY = "sitepulse_studio_token";

const els = {
  loginPanel: document.getElementById("login-panel"),
  appShell: document.getElementById("app-shell"),
  loginUser: document.getElementById("login-user"),
  loginPass: document.getElementById("login-pass"),
  loginBtn: document.getElementById("login-btn"),
  loginMsg: document.getElementById("login-msg"),
  logoutBtn: document.getElementById("logout-btn"),
  userName: document.getElementById("user-name"),
  userSite: document.getElementById("user-site"),
  statusPill: document.getElementById("status-pill"),
  configFile: document.getElementById("config-file"),
  maxRunMs: document.getElementById("max-run-ms"),
  baseUrl: document.getElementById("base-url"),
  fresh: document.getElementById("fresh"),
  headed: document.getElementById("headed"),
  noResume: document.getElementById("no-resume"),
  noServer: document.getElementById("no-server"),
  humanLog: document.getElementById("human-log"),
  runBtn: document.getElementById("run-btn"),
  stopBtn: document.getElementById("stop-btn"),
  copyBtn: document.getElementById("copy-btn"),
  pid: document.getElementById("pid"),
  startedAt: document.getElementById("started-at"),
  endedAt: document.getElementById("ended-at"),
  commandPreview: document.getElementById("command-preview"),
  progressBar: document.getElementById("progress-bar"),
  progressLabel: document.getElementById("progress-label"),
  progressRoute: document.getElementById("progress-route"),
  progressClick: document.getElementById("progress-click"),
  liveAction: document.getElementById("live-action"),
  logs: document.getElementById("logs"),
  reportsList: document.getElementById("reports-list"),
  viewer: document.getElementById("viewer"),
  refreshReports: document.getElementById("refresh-reports"),
  mTotal: document.getElementById("m-total"),
  m5xx: document.getElementById("m-5xx"),
  mRuntime: document.getElementById("m-runtime"),
  mOrder: document.getElementById("m-order"),
};

let token = localStorage.getItem(TOKEN_KEY) || "";
let profile = null;
let pollTimer = null;
let reportsCache = [];

function authHeaders(extra = {}) {
  const headers = { ...extra };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function api(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: authHeaders(options.headers || {}),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error || `HTTP ${response.status}`);
  }
  return payload;
}

function formatDate(iso) {
  if (!iso) return "-";
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return iso;
  return dt.toLocaleString("pt-BR");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function setStatus(status) {
  els.statusPill.textContent = status || "idle";
  els.statusPill.className = "pill";
  els.statusPill.classList.add(`pill-${status || "idle"}`);
}

function showLogin(message = "") {
  els.loginPanel.style.display = "block";
  els.appShell.classList.remove("app-visible");
  els.appShell.classList.add("app-hidden");
  if (message) els.loginMsg.textContent = message;
}

function showApp() {
  els.loginPanel.style.display = "none";
  els.appShell.classList.remove("app-hidden");
  els.appShell.classList.add("app-visible");
}

function renderProfile() {
  els.userName.textContent = profile?.username || "-";
  els.userSite.textContent = profile?.defaultBaseUrl || "-";
  if (!els.baseUrl.value && profile?.defaultBaseUrl) {
    els.baseUrl.value = profile.defaultBaseUrl;
  }
}

function renderState(state) {
  setStatus(state.status || "idle");
  els.pid.textContent = state.pid || "-";
  els.startedAt.textContent = formatDate(state.startedAt);
  els.endedAt.textContent = formatDate(state.endedAt);
  els.commandPreview.textContent = state.commandPreview || "-";

  const progress = state.progress || {};
  const percent = Number(progress.percent || 0);
  els.progressBar.style.width = `${percent}%`;
  els.progressLabel.textContent = `${percent}%`;
  els.progressRoute.textContent = `rota ${progress.nextRouteIndex || 0}/${progress.totalRoutes || 0}`;
  els.progressClick.textContent = `botão idx ${progress.nextLabelIndex || 0}`;

  const current = state.currentEvent;
  if (!current) {
    els.liveAction.textContent = "Sem evento";
  } else {
    els.liveAction.textContent = `[${current.type}] rota=${current.route || "-"} acao=${current.action || "-"} ${
      current.detail || ""
    }`;
  }

  const logs = Array.isArray(state.logs) ? state.logs.slice(-150) : [];
  els.logs.textContent = logs.length
    ? logs.map((entry) => `[${entry.ts}] [${entry.level}] ${entry.text}`).join("\n")
    : "Sem logs.";

  const summary = state.summary || {};
  els.mTotal.textContent = String(summary.totalIssues ?? 0);
  els.m5xx.textContent = String(summary.http5xx ?? 0);
  els.mRuntime.textContent = String(summary.jsRuntimeErrors ?? 0);
  els.mOrder.textContent = String((summary.visualSectionOrderInvalid ?? 0) + (summary.visualSectionMissing ?? 0));

  els.runBtn.disabled = state.running;
  els.stopBtn.disabled = !state.running;
}

function buildClientCommand() {
  const config = els.configFile.value || profile?.defaultConfig || "audit.kuruma.json";
  const parts = ["node src/index.mjs", `--config ${config}`];
  if (els.fresh.checked) parts.push("--fresh");
  if (els.headed.checked) parts.push("--headed");
  if (els.noResume.checked) parts.push("--no-resume");
  if (els.noServer.checked) parts.push("--no-server");
  if (els.humanLog.checked) parts.push("--human-log");
  const baseUrl = els.baseUrl.value.trim();
  const inferredNoServer =
    !!baseUrl && !/127\.0\.0\.1|localhost/i.test(baseUrl);
  const noServer = els.noServer.checked || inferredNoServer;
  if (noServer) parts.push("--no-server");
  if (baseUrl) parts.push(`--base-url ${baseUrl}`);
  const maxRun = Number(els.maxRunMs.value || 0);
  if (Number.isFinite(maxRun) && maxRun > 0) parts.push(`--max-run-ms ${maxRun}`);
  parts.push("--live-log");
  return parts.join(" ");
}

function renderReports(groups) {
  reportsCache = groups || [];
  if (!reportsCache.length) {
    els.reportsList.innerHTML = "Sem relatórios encontrados.";
    return;
  }
  els.reportsList.innerHTML = reportsCache
    .map((group) => {
      const jsonBtn = group.reportJson
        ? `<button class="btn btn-secondary" data-action="open" data-file="${group.reportJson}">Abrir JSON</button>`
        : "";
      const mdBtn = group.reportMd
        ? `<button class="btn btn-secondary" data-action="open" data-file="${group.reportMd}">Abrir MD</button>`
        : "";
      const logBtn = group.issuesLog
        ? `<button class="btn btn-secondary" data-action="open" data-file="${group.issuesLog}">Abrir LOG</button>`
        : "";
      const dlBtn = group.reportJson
        ? `<a class="btn btn-primary" href="/api/report/download?file=${encodeURIComponent(group.reportJson)}&token=${encodeURIComponent(token)}">Download JSON</a>`
        : "";
      return `
        <div class="report-row">
          <div class="report-row-head">
            <span><strong>${escapeHtml(group.stamp)}</strong></span>
            <span>${escapeHtml(formatDate(group.createdAt))}</span>
          </div>
          <div class="report-actions">${jsonBtn}${mdBtn}${logBtn}${dlBtn}</div>
        </div>
      `;
    })
    .join("");
}

function renderJsonReport(payload) {
  const summary = payload.summary || {};
  const issues = Array.isArray(payload.issues) ? payload.issues : [];
  const issuesHtml = issues.length
    ? issues
        .map(
          (issue) => `
      <div class="report-row">
        <div class="report-row-head">
          <span><strong>[${escapeHtml(issue.code)}]</strong> (${escapeHtml(issue.severity)})</span>
          <span>${escapeHtml(issue.route)} ${issue.action ? `-> ${escapeHtml(issue.action)}` : ""}</span>
        </div>
        <div><strong>Detalhe:</strong> ${escapeHtml(issue.detail)}</div>
        <div><strong>Leigo:</strong> ${escapeHtml(issue.laymanExplanation || "")}</div>
        <div><strong>Sugestão:</strong> ${escapeHtml(issue.recommendedResolution || "")}</div>
      </div>
    `,
        )
        .join("")
    : "<div>Sem issues.</div>";

  els.viewer.innerHTML = `
    <div class="summary-grid">
      <div class="metric"><span>Total Issues</span><strong>${summary.totalIssues ?? 0}</strong></div>
      <div class="metric"><span>4xx</span><strong>${summary.http4xx ?? 0}</strong></div>
      <div class="metric"><span>5xx</span><strong>${summary.http5xx ?? 0}</strong></div>
      <div class="metric"><span>Ordem Visual</span><strong>${
        (summary.visualSectionOrderInvalid ?? 0) + (summary.visualSectionMissing ?? 0)
      }</strong></div>
    </div>
    <h3>Issues, Sucessos e Sugestões</h3>
    ${issuesHtml}
  `;
}

async function openReport(fileName) {
  try {
    const data = await api(`/api/report?file=${encodeURIComponent(fileName)}`);
    if (data.type === "json") {
      renderJsonReport(data.payload);
      return;
    }
    els.viewer.innerHTML = `<pre>${escapeHtml(data.payload || "")}</pre>`;
  } catch (error) {
    els.viewer.textContent = `Falha ao abrir relatório: ${error.message}`;
  }
}

async function loadConfigs() {
  const data = await api("/api/configs");
  const options = data.configs || [];
  els.configFile.innerHTML = options
    .map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`)
    .join("");
  if (profile?.defaultConfig) {
    const exists = options.includes(profile.defaultConfig);
    if (exists) els.configFile.value = profile.defaultConfig;
  }
}

async function loadReports() {
  const data = await api("/api/reports");
  renderReports(data.groups || []);
}

async function refreshState() {
  const data = await api("/api/state");
  renderState(data);
}

async function startRun() {
  try {
    const configFile = els.configFile.value || profile?.defaultConfig || "audit.kuruma.json";
    const baseUrlOverride = els.baseUrl.value.trim() || profile?.defaultBaseUrl || "";
    const inferredNoServer =
      !!baseUrlOverride && !/127\.0\.0\.1|localhost/i.test(baseUrlOverride);
    const noServer = els.noServer.checked || inferredNoServer;

    await api("/api/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        configFile,
        baseUrlOverride,
        fresh: els.fresh.checked,
        headed: els.headed.checked,
        noResume: els.noResume.checked,
        noServer,
        humanLog: els.humanLog.checked,
        maxRunMs: Number(els.maxRunMs.value || 0),
      }),
    });
    await refreshState();
  } catch (error) {
    alert(`Erro ao iniciar: ${error.message}`);
  }
}

async function stopRun() {
  await api("/api/stop", { method: "POST" }).catch(() => null);
  await refreshState();
}

function startPolling() {
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(() => {
    refreshState().catch(() => null);
  }, 1000);
}

async function login() {
  try {
    const username = els.loginUser.value.trim();
    const password = els.loginPass.value.trim();
    const result = await api("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    token = result.token;
    localStorage.setItem(TOKEN_KEY, token);
    profile = result.user;
    renderProfile();
    showApp();
    await Promise.all([loadConfigs(), loadReports(), refreshState()]);
    startPolling();
  } catch (error) {
    els.loginMsg.textContent = `Falha de login: ${error.message}`;
  }
}

async function logout() {
  await api("/api/auth/logout", { method: "POST" }).catch(() => null);
  localStorage.removeItem(TOKEN_KEY);
  token = "";
  profile = null;
  if (pollTimer) clearInterval(pollTimer);
  showLogin("Sessão encerrada.");
}

async function restoreSession() {
  if (!token) {
    showLogin();
    return;
  }
  try {
    const me = await api("/api/auth/me");
    profile = me.user;
    renderProfile();
    showApp();
    await Promise.all([loadConfigs(), loadReports(), refreshState()]);
    startPolling();
  } catch {
    localStorage.removeItem(TOKEN_KEY);
    token = "";
    showLogin("Sessão expirada. Faça login novamente.");
  }
}

function attachEvents() {
  els.loginBtn.addEventListener("click", login);
  els.loginPass.addEventListener("keydown", (e) => {
    if (e.key === "Enter") login();
  });
  els.logoutBtn.addEventListener("click", logout);
  els.runBtn.addEventListener("click", startRun);
  els.stopBtn.addEventListener("click", stopRun);
  els.copyBtn.addEventListener("click", async () => {
    const command = buildClientCommand();
    await navigator.clipboard.writeText(command).catch(() => null);
  });
  els.refreshReports.addEventListener("click", loadReports);
  els.reportsList.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.dataset.action !== "open") return;
    const file = target.dataset.file;
    if (file) openReport(file);
  });
}

attachEvents();
restoreSession().catch((error) => {
  els.viewer.textContent = `Falha ao iniciar UI: ${error.message}`;
});
