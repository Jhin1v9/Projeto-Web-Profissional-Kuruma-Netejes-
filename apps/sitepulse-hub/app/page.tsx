"use client";

import { useMemo, useState } from "react";

type Mode = "desktop" | "mobile";

type DemoIssue = {
  id: string;
  code: string;
  severity: "high" | "medium" | "low";
  route: string;
  action: string;
  detail: string;
  recommendedResolution: string;
  assistantHint?: {
    priority: "P0" | "P1" | "P2";
    firstChecks: string[];
    commandHints: string[];
  };
};

type DemoReport = {
  meta: {
    project: string;
    mode: Mode;
    generatedAt: string;
  };
  summary: {
    routesChecked: number;
    buttonsChecked: number;
    totalIssues: number;
    visualSectionOrderInvalid: number;
    buttonsNoEffect: number;
    consoleErrors: number;
  };
  assistantGuide: {
    replayCommand: string;
    immediateSteps: string[];
    quickStartPrompt: string;
  };
  issues: DemoIssue[];
};

const DEFAULT_URL = "https://projeto-web-profissional-kuruma-net.vercel.app";

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function priorityClass(priority?: string) {
  if (priority === "P0") return "pill p0";
  if (priority === "P1") return "pill p1";
  return "pill p2";
}

function downloadJson(fileName: string, value: unknown) {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Page() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [logged, setLogged] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [mode, setMode] = useState<Mode>("desktop");
  const [targetUrl, setTargetUrl] = useState(DEFAULT_URL);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [report, setReport] = useState<DemoReport | null>(null);
  const [health, setHealth] = useState<"idle" | "ok" | "bad">("idle");

  const copyCommand = useMemo(() => {
    const config = mode === "mobile" ? "audit.kuruma.mobile.json" : "audit.kuruma.json";
    return `npm --prefix tools/sitepulse-qa run audit:cmd -- --config "${config}" --base-url "${targetUrl}" --no-server`;
  }, [mode, targetUrl]);

  async function checkHealth() {
    try {
      const res = await fetch("/api/health", { cache: "no-store" });
      setHealth(res.ok ? "ok" : "bad");
    } catch {
      setHealth("bad");
    }
  }

  function onLogin() {
    const valid =
      (username === "admin" && password === "admin123") ||
      (username === "mobile" && password === "mobile123");
    if (!valid) {
      setLoginError("Login invalido. Use admin/admin123 ou mobile/mobile123.");
      return;
    }
    setLoginError("");
    setLogged(true);
    void checkHealth();
  }

  async function copyCmd() {
    try {
      await navigator.clipboard.writeText(copyCommand);
      setLogs((prev) => [`[hub] command copied`, ...prev].slice(0, 120));
    } catch {
      setLogs((prev) => [`[hub] could not copy command`, ...prev].slice(0, 120));
    }
  }

  async function loadDemoReport() {
    const res = await fetch(`/api/demo-report?mode=${mode}`, { cache: "no-store" });
    const data = (await res.json()) as DemoReport;
    setReport(data);
    return data;
  }

  async function runPlan() {
    if (!targetUrl.trim()) return;
    setRunning(true);
    setProgress(0);
    setLogs([]);
    setReport(null);
    try {
      const res = await fetch("/api/run-plan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          baseUrl: targetUrl.trim(),
          mode,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "run_plan_failed");

      const steps: string[] = data.steps ?? [];
      const total = Math.max(steps.length, 1);
      for (let i = 0; i < steps.length; i += 1) {
        const line = steps[i];
        setLogs((prev) => [`[plan] ${line}`, ...prev].slice(0, 120));
        setProgress(Math.round(((i + 1) / total) * 80));
        await wait(450);
      }

      const demo = await loadDemoReport();
      setLogs((prev) => [`[plan] report loaded with ${demo.summary.totalIssues} issue(s)`, ...prev].slice(0, 120));
      setProgress(100);
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown_error";
      setLogs((prev) => [`[plan] failed: ${message}`, ...prev].slice(0, 120));
      setProgress(0);
    } finally {
      setRunning(false);
    }
  }

  if (!logged) {
    return (
      <main className="page">
        <section className="hero">
          <span className="kicker">SitePulse Hub</span>
          <h1 className="title">Deploy this folder to Vercel and tune the visual on top.</h1>
          <p className="subtitle">This app is a ready base for design iteration, command copy and report reading.</p>
        </section>

        <section className="card" style={{ maxWidth: 520 }}>
          <h2>Login</h2>
          <p className="muted">Demo users: admin/admin123 or mobile/mobile123</p>
          <div className="controls" style={{ marginTop: 12 }}>
            <label>
              Username
              <input value={username} onChange={(e) => setUsername(e.target.value)} />
            </label>
            <label>
              Password
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            <div className="row">
              <button type="button" onClick={onLogin}>
                Enter hub
              </button>
            </div>
            {loginError ? <p style={{ color: "#ffb5c0" }}>{loginError}</p> : null}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="hero">
        <span className="kicker">SitePulse Hub</span>
        <h1 className="title">Audit command center for UI, flow and assistant playbooks.</h1>
        <p className="subtitle">
          Ready for Vercel deploy now. Next step is pure visual iteration on top of this base.
        </p>
        <div className="row">
          <span className="status">
            <span className={`dot ${health === "ok" ? "ok" : health === "bad" ? "bad" : ""}`} />
            API health: {health}
          </span>
          <button type="button" className="secondary" onClick={checkHealth}>
            Check API
          </button>
        </div>
      </section>

      <section className="grid">
        <article className="card span-8">
          <h2>Execution</h2>
          <div className="controls">
            <label>
              Target URL
              <input value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} placeholder="https://your-site.com" />
            </label>
            <div className="row">
              <label style={{ minWidth: 200 }}>
                Mode
                <select value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
                  <option value="desktop">desktop</option>
                  <option value="mobile">mobile</option>
                </select>
              </label>
            </div>
            <div className="row">
              <button type="button" disabled={running} onClick={runPlan}>
                {running ? "Running..." : "Run plan"}
              </button>
              <button type="button" className="secondary" onClick={copyCmd}>
                Copy command
              </button>
              <button
                type="button"
                className="secondary"
                onClick={() => report && downloadJson(`sitepulse-${mode}-report.json`, report)}
                disabled={!report}
              >
                Download report JSON
              </button>
            </div>
            <p className="code">{copyCommand}</p>
          </div>
        </article>

        <article className="card span-4">
          <h2>Progress</h2>
          <p className="muted">{running ? "Execution in progress..." : "Idle"}</p>
          <div className="progress-shell">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <p style={{ marginTop: 8 }}>{progress}%</p>
        </article>

        <article className="card span-12">
          <h3>Live log</h3>
          <pre className="log">{logs.length ? logs.join("\n") : "[hub] waiting for run..."}</pre>
        </article>

        <article className="card span-12">
          <h3>Summary</h3>
          {!report ? (
            <p className="muted">No report loaded yet.</p>
          ) : (
            <div className="summary-grid">
              <div className="summary-box">
                <div className="summary-value">{report.summary.routesChecked}</div>
                <div className="summary-label">Routes checked</div>
              </div>
              <div className="summary-box">
                <div className="summary-value">{report.summary.buttonsChecked}</div>
                <div className="summary-label">Buttons checked</div>
              </div>
              <div className="summary-box">
                <div className="summary-value">{report.summary.totalIssues}</div>
                <div className="summary-label">Total issues</div>
              </div>
              <div className="summary-box">
                <div className="summary-value">{report.summary.visualSectionOrderInvalid}</div>
                <div className="summary-label">Visual order invalid</div>
              </div>
            </div>
          )}
        </article>

        <article className="card span-8">
          <h3>Issues</h3>
          {!report ? (
            <p className="muted">Run plan to get issue details.</p>
          ) : (
            <ul className="list">
              {report.issues.map((issue) => (
                <li key={issue.id} className="item">
                  <div className="row">
                    <strong>{issue.code}</strong>
                    <span className="pill">{issue.severity}</span>
                    <span className={priorityClass(issue.assistantHint?.priority)}>{issue.assistantHint?.priority ?? "P2"}</span>
                  </div>
                  <p className="muted" style={{ marginTop: 6 }}>
                    {issue.route}
                    {issue.action ? ` -> ${issue.action}` : ""}
                  </p>
                  <p style={{ marginTop: 6 }}>{issue.detail}</p>
                  <p className="muted" style={{ marginTop: 6 }}>
                    Resolution: {issue.recommendedResolution}
                  </p>
                  {issue.assistantHint?.firstChecks?.length ? (
                    <p className="code" style={{ marginTop: 6 }}>
                      checks: {issue.assistantHint.firstChecks.join(" | ")}
                    </p>
                  ) : null}
                  {issue.assistantHint?.commandHints?.length ? (
                    <p className="code" style={{ marginTop: 6 }}>
                      commands: {issue.assistantHint.commandHints.join(" || ")}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="card span-4">
          <h3>Assistant prompt</h3>
          {!report ? (
            <p className="muted">Prompt will show after report load.</p>
          ) : (
            <>
              <div className="item">
                <p className="code">{report.assistantGuide.quickStartPrompt}</p>
              </div>
              <div className="row" style={{ marginTop: 10 }}>
                <button
                  type="button"
                  className="warn"
                  onClick={() => navigator.clipboard.writeText(report.assistantGuide.quickStartPrompt)}
                >
                  Copy prompt
                </button>
              </div>
            </>
          )}
        </article>
      </section>
    </main>
  );
}

