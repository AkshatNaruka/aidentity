/**
 * Local app server for Aidentity.
 *
 * A plain Node HTTP server on 127.0.0.1 that exposes the registry, the search
 * engine and the install lifecycle as JSON, and serves the app UI. Electron
 * loads this URL in a window; `aidentity app --web` opens it in a browser.
 *
 * Nothing leaves the machine. Every mutating request must carry the random
 * token injected into the page, so a random website cannot drive your
 * installs through a localhost port.
 */

const fs = require("fs");
const path = require("path");
const http = require("http");
const crypto = require("crypto");
const { URL } = require("url");

const { registry, bundles, search, defaults, recommend } = require("../cli/lib/search");
const { AGENT_TARGETS, detectAgent } = require("../cli/lib/agents");
const {
  rolesData,
  findRole,
  getSecurityRecord,
  buildRolePlan,
  generateSetupPrompt,
  executeSetup,
} = require("../cli/lib/setup");
const {
  installSkills,
  removeSkill,
  listInstalled,
  updateSkills,
  doctor,
} = require("../cli/lib/installed");

const RENDERER = path.join(__dirname, "renderer");
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".json": "application/json; charset=utf-8",
  ".woff2": "font/woff2",
};

function bundleTokens(bundle) {
  return bundle.skills
    .map((id) => registry.skills.find((skill) => skill.id === id))
    .filter((skill) => skill && skill.tokens)
    .reduce((sum, skill) => sum + skill.tokens, 0);
}

function state(cwd) {
  const report = doctor({ cwd, global: false });
  const items = report.installed.map((item) => {
    const skill = registry.skills.find((entry) => entry.id === item.id);
    return {
      ...item,
      name: item.name || (skill && skill.name) || item.id,
      tokens: skill ? skill.tokens : null,
      description: skill ? skill.description : "",
      license: skill ? skill.source.license : item.source_license,
    };
  });
  return {
    cwd,
    generated_at: registry.generated_at,
    totals: {
      skills: registry.total,
      installable: registry.distributable,
      categories: new Set(registry.skills.map((skill) => skill.category)).size,
      sources: Object.keys(registry.by_source).length,
      tokens: registry.skills.reduce((sum, skill) => sum + (skill.tokens || 0), 0),
    },
    agents: Object.entries(AGENT_TARGETS).map(([key, target]) => ({
      key,
      label: target.label,
      dir: target.skillsDir,
      // A folder that already exists for this agent is a signal worth showing,
      // even before it has a skills/ subdirectory.
      detected:
        report.agents.some((agent) => agent.agent === key) ||
        fs.existsSync(path.join(cwd, target.rootDir)),
    })),
    detected: detectAgent(cwd),
    installed: items,
    installed_tokens: items.reduce((sum, item) => sum + (item.tokens || 0), 0),
    orphans: report.orphans,
    problems: report.problems,
    healthy: report.healthy,
  };
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) reject(new Error("body too large"));
    });
    req.on("end", () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(new Error(`invalid JSON body: ${error.message}`));
      }
    });
    req.on("error", reject);
  });
}

function createServer({ cwd = process.cwd(), token = crypto.randomBytes(16).toString("hex") } = {}) {
  const ctx = { cwd };

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, "http://127.0.0.1");

    const send = (status, body, type = "application/json; charset=utf-8") => {
      res.writeHead(status, {
        "content-type": type,
        "cache-control": "no-store",
        "x-content-type-options": "nosniff",
      });
      res.end(typeof body === "string" ? body : JSON.stringify(body));
    };

    try {
      // ---- API ---------------------------------------------------------
      if (url.pathname.startsWith("/api/")) {
        if (req.method === "POST" && req.headers["x-aidentity-token"] !== token) {
          return send(403, { error: "invalid token" });
        }
        const q = url.searchParams;

        switch (`${req.method} ${url.pathname}`) {
          case "GET /api/state":
            return send(200, state(ctx.cwd));

          case "GET /api/search": {
            const query = q.get("q") || "";
            const limit = Number(q.get("limit")) || 24;
            const results = query.trim()
              ? search(query, {
                  limit,
                  category: q.get("category") || undefined,
                  source: q.get("source") || undefined,
                })
              : defaults(limit);
            return send(200, { query, count: results.length, results });
          }

          case "GET /api/recommend":
            return send(200, recommend(q.get("task") || "", Number(q.get("limit")) || 6));

          case "GET /api/skill": {
            const id = q.get("id");
            const skill = registry.skills.find((entry) => entry.id === id);
            if (!skill) return send(404, { error: `unknown skill: ${id}` });
            let content = null;
            if (skill.distributable && skill.path) {
              const file = path.join(__dirname, "..", skill.path);
              if (fs.existsSync(file)) content = fs.readFileSync(file, "utf8");
            }
            return send(200, { ...skill, security: getSecurityRecord(skill.id), content });
          }

          case "GET /api/bundles":
            return send(
              200,
              bundles.map((bundle) => ({
                ...bundle,
                tokens: bundleTokens(bundle),
                resolved: bundle.skills
                  .map((id) => registry.skills.find((skill) => skill.id === id))
                  .filter(Boolean)
                  .map((skill) => ({ id: skill.id, name: skill.name, tokens: skill.tokens })),
              }))
            );

          case "GET /api/roles":
            return send(200, rolesData.roles);

          case "GET /api/categories": {
            const counts = {};
            for (const skill of registry.skills) counts[skill.category] = (counts[skill.category] || 0) + 1;
            return send(200, Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count));
          }

          case "GET /api/security": {
            const sec = require("../cli/lib/setup").securityData;
            const skills = Object.values(sec.skills || {});
            return send(200, {
              total_skills: sec.total_skills,
              verified: sec.verified_skills,
              files: sec.total_files_scanned,
              critical: sec.critical_findings,
              advisories: sec.advisories || 0,
              checks: (sec.policy && sec.policy.checks) || [],
            });
          }

          case "POST /api/install": {
            const body = await readBody(req);
            const ids = body.ids || [];
            const agent = body.agent || detectAgent(ctx.cwd) || "claude";
            const skills = ids.map((id) => registry.skills.find((entry) => entry.id === id)).filter(Boolean);
            if (!skills.length) return send(400, { error: "no valid skill ids" });
            const result = installSkills(skills, {
              agentKey: agent,
              cwd: ctx.cwd,
              global: false,
              force: Boolean(body.force),
              allSkills: registry.skills,
            });
            return send(200, { ...result, agent, state: state(ctx.cwd) });
          }

          case "POST /api/remove": {
            const body = await readBody(req);
            const result = removeSkill({ id: body.id, agent: body.agent, cwd: ctx.cwd, global: false });
            return send(200, { ...result, state: state(ctx.cwd) });
          }

          case "POST /api/update": {
            const body = await readBody(req);
            const results = updateSkills({
              ids: body.ids || [],
              cwd: ctx.cwd,
              global: false,
              registry,
            });
            return send(200, { results, state: state(ctx.cwd) });
          }

          case "POST /api/setup": {
            const body = await readBody(req);
            const role = findRole(body.role);
            if (!role) return send(404, { error: `unknown role: ${body.role}` });
            const plan = buildRolePlan({
              role,
              profile: body.profile === "enterprise" ? "enterprise" : "individual",
              task: body.task || "",
              agent: body.agent || detectAgent(ctx.cwd) || "claude",
            });
            if (body.dryRun !== false) {
              return send(200, { plan, prompt: generateSetupPrompt(plan), execution: null });
            }
            const execution = executeSetup(plan, { cwd: ctx.cwd, global: false, dryRun: false });
            return send(200, { plan, prompt: generateSetupPrompt(plan), execution, state: state(ctx.cwd) });
          }

          case "POST /api/cwd": {
            const body = await readBody(req);
            const next = path.resolve(String(body.path || ""));
            if (!fs.existsSync(next) || !fs.statSync(next).isDirectory()) {
              return send(400, { error: `not a directory: ${next}` });
            }
            ctx.cwd = next;
            return send(200, state(ctx.cwd));
          }

          default:
            return send(404, { error: `no route: ${req.method} ${url.pathname}` });
        }
      }

      // ---- Static UI ---------------------------------------------------
      let filePath = url.pathname === "/" ? "/index.html" : url.pathname;
      filePath = path.normalize(filePath).replace(/^(\.\.[/\\])+/, "");
      const absolute = path.join(RENDERER, filePath);
      if (!absolute.startsWith(RENDERER)) return send(403, { error: "forbidden" });

      if (!fs.existsSync(absolute) || fs.statSync(absolute).isDirectory()) {
        return send(404, "Not found", "text/plain; charset=utf-8");
      }

      let content = fs.readFileSync(absolute);
      const ext = path.extname(absolute);
      if (ext === ".html") {
        content = content
          .toString("utf8")
          .replace("__AIDENTITY_TOKEN__", token)
          .replace("__AIDENTITY_CWD__", ctx.cwd);
      }
      res.writeHead(200, {
        "content-type": MIME[ext] || "application/octet-stream",
        "cache-control": "no-store",
        "x-content-type-options": "nosniff",
        "content-security-policy":
          "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; img-src 'self' data:; connect-src 'self'",
      });
      res.end(content);
    } catch (error) {
      send(500, { error: error.message });
    }
  });

  return { server, token, ctx };
}

function startApp({ port = 0, open = true, cwd = process.cwd(), electron = false } = {}) {
  const { server, token, ctx } = createServer({ cwd });
  const listenPort = port || 7419;

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(`port ${listenPort} is busy. Try: aidentity app --port 7420`);
      process.exit(1);
    }
    throw error;
  });

  server.listen(listenPort, "127.0.0.1", () => {
    const url = `http://127.0.0.1:${listenPort}/?token=${token}`;
    if (!electron) {
      console.log(`Aidentity app → ${url}`);
      console.log(`  workspace: ${ctx.cwd}`);
      if (open) {
        const { exec } = require("child_process");
        const command =
          process.platform === "darwin" ? `open "${url}"` : process.platform === "win32" ? `start "" "${url}"` : `xdg-open "${url}"`;
        exec(command, () => {});
      }
      console.log("  press Ctrl+C to stop");
    }
    process.env.AIDENTITY_URL = url;
  });

  return { server, token, port: listenPort };
}

module.exports = { createServer, startApp };

if (require.main === module) {
  startApp({ port: Number(process.env.PORT) || 0, cwd: process.cwd() });
}
