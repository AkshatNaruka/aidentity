/* Aidentity desktop app — renderer. No dependencies, no build step. */

const TOKEN = document.body.dataset.token;
const DESKTOP = Boolean(window.aidentityDesktop && window.aidentityDesktop.isDesktop);

const el = (sel, root = document) => root.querySelector(sel);
const els = (sel, root = document) => [...root.querySelectorAll(sel)];

function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmtTokens(n) {
  if (!n) return "—";
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

async function api(path, options = {}) {
  const init = { method: options.method || "GET", headers: {} };
  if (init.method !== "GET") {
    init.headers["content-type"] = "application/json";
    init.headers["x-aidentity-token"] = TOKEN;
    init.body = JSON.stringify(options.body || {});
  }
  const response = await fetch(path, init);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `${response.status} ${response.statusText}`);
  return payload;
}

// ---------------------------------------------------------------------------
// Toast
// ---------------------------------------------------------------------------

let toastTimer;
function toast(message, isError = false) {
  const node = el("#toast");
  node.textContent = message;
  node.classList.toggle("is-error", isError);
  node.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    node.hidden = true;
  }, 4200);
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

const state = {
  view: "overview",
  data: null,
  category: "",
  agent: "claude",
  query: "",
  bundles: [],
  roles: [],
  security: null,
};

function agentKey() {
  return state.agent;
}

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

function go(page, { silent = false } = {}) {
  state.view = page;
  els(".nav-item").forEach((item) => item.classList.toggle("is-active", item.dataset.page === page));
  els(".page").forEach((section) => section.classList.toggle("is-active", section.dataset.page === page));
  if (!silent && location.hash.slice(1) !== page) location.hash = page;
  if (page === "browse") {
    el("#search-input").focus();
    if (!state.query) runSearch("");
  }
  if (page === "security") renderSecurity();
}

window.addEventListener("hashchange", () => {
  const page = location.hash.slice(1);
  if (page && page !== state.view && el(`.page[data-page="${page}"]`)) go(page, { silent: true });
});

els(".nav-item").forEach((item) => item.addEventListener("click", () => go(item.dataset.page)));
els("[data-goto]").forEach((item) => item.addEventListener("click", () => go(item.dataset.goto)));

// ---------------------------------------------------------------------------
// Overview
// ---------------------------------------------------------------------------

function renderOverview() {
  const data = state.data;
  if (!data) return;

  const installedCount = data.installed.length;
  el("#nav-installed-count").textContent = String(installedCount);

  el("#overview-stats").innerHTML = [
    ["Skills indexed", data.totals.skills.toLocaleString()],
    ["Installed here", String(installedCount)],
    ["Context added", `${fmtTokens(data.installed_tokens)} tokens`],
    ["Agents found", String(data.agents.filter((a) => a.detected).length)],
  ]
    .map(([label, value]) => `<div class="stat"><div class="n">${escapeHtml(value)}</div><div class="l">${escapeHtml(label)}</div></div>`)
    .join("");

  const installed = data.installed;
  el("#overview-installed-note").textContent = installed.length
    ? `${fmtTokens(data.installed_tokens)} tokens`
    : "";
  el("#overview-installed").innerHTML = installed.length
    ? installed
        .map(
          (item) => `
      <div class="row">
        <div class="row-main">
          <div class="row-title">${escapeHtml(item.name)}</div>
          <div class="row-sub">${escapeHtml(item.id)}</div>
        </div>
        <span class="tag ${item.status === "ok" ? "ok" : item.status === "modified" ? "warn" : "bad"}">${escapeHtml(item.status)}</span>
        <span class="tokens">${item.tokens ? `~${fmtTokens(item.tokens)}` : ""}</span>
      </div>`
        )
        .join("")
    : `<div class="empty">Nothing installed in this folder yet. <button class="ghost small" data-goto="browse">Browse the index</button></div>`;

  const problems = data.problems || [];
  el("#overview-health").innerHTML = problems.length
    ? problems
        .slice(0, 8)
        .map(
          (problem) => `<div class="problem"><span class="lvl ${problem.level}">${problem.level}</span><span>${escapeHtml(problem.message)}</span></div>`
        )
        .join("")
    : `<div class="empty">No problems. Manifest is intact.</div>`;

  el("#agent-grid").innerHTML = data.agents
    .map(
      (agent) => `
      <div class="agent ${agent.detected ? "is-detected" : ""}">
        <span class="dot"></span>
        <div>
          <div class="name">${escapeHtml(agent.label)}</div>
          <div class="dir">${escapeHtml(agent.dir)}</div>
        </div>
      </div>`
    )
    .join("");

  el("#workspace-path").textContent = data.cwd.split("/").filter(Boolean).slice(-2).join("/") || data.cwd;
  el("#workspace-path").title = data.cwd;
  el("#rail-meta").innerHTML = `${data.totals.skills} skills · ${data.totals.sources} sources<br>registry ${escapeHtml(data.generated_at)}`;
}

// ---------------------------------------------------------------------------
// Browse
// ---------------------------------------------------------------------------

let searchTimer;
el("#search-input").addEventListener("input", (event) => {
  clearTimeout(searchTimer);
  const value = event.target.value;
  searchTimer = setTimeout(() => {
    state.query = value;
    runSearch(value);
  }, 130);
});

el("#category-filter").addEventListener("change", (event) => {
  state.category = event.target.value;
  runSearch(state.query);
});

el("#agent-select").addEventListener("change", (event) => {
  state.agent = event.target.value;
  state.agentTouched = true;
});

async function runSearch(query) {
  const params = new URLSearchParams({ q: query, limit: "30" });
  if (state.category) params.set("category", state.category);
  const data = await api(`/api/search?${params}`);
  el("#result-meta").textContent = query
    ? `${data.count} result${data.count === 1 ? "" : "s"} for “${query}”`
    : `Top skills across ${state.data ? state.data.totals.skills : ""} indexed`;
  renderResults(data.results, query);
}

function renderResults(results, query) {
  const container = el("#results");
  if (!results.length) {
    container.innerHTML = `<div class="empty">No skill matches “${escapeHtml(query)}”. Try a broader word, or browse by category.</div>`;
    return;
  }
  container.innerHTML = results
    .map(
      (skill) => `
    <article class="result">
      <div>
        <h3>${escapeHtml(skill.name)}</h3>
        <div class="id">${escapeHtml(skill.id)}</div>
        <p>${escapeHtml(skill.description)}</p>
        <div class="why">${skill.why ? `matched ${escapeHtml(skill.why)}` : ""}</div>
      </div>
      <div class="actions">
        <div class="facts">
          <span class="tag">${escapeHtml(skill.category)}</span>
          <span class="tokens">${skill.tokens ? `~${fmtTokens(skill.tokens)} tok` : "index only"}</span>
        </div>
        <div class="facts">
          <button class="ghost small" data-detail="${escapeHtml(skill.id)}">Details</button>
          <button class="primary" data-install="${escapeHtml(skill.id)}" ${skill.distributable ? "" : "disabled"}>Install</button>
        </div>
      </div>
    </article>`
    )
    .join("");
}

// ---------------------------------------------------------------------------
// Installed
// ---------------------------------------------------------------------------

function renderInstalled() {
  const data = state.data;
  if (!data) return;
  const items = data.installed;

  const max = 200000;
  const pct = Math.min(100, Math.round((data.installed_tokens / max) * 100));
  el("#budget-fill").style.width = `${pct}%`;
  el("#budget-note").textContent = `${fmtTokens(data.installed_tokens)} of ~200k context`;
  el("#budget-legend").innerHTML = `<span>0</span><span>${items.length} skills installed</span><span>200k</span>`;

  const container = el("#installed-list");
  if (!items.length) {
    container.innerHTML = `<div class="empty">Nothing installed in this folder. Install from Browse, or apply a stack.</div>`;
    return;
  }

  container.innerHTML = items
    .map(
      (item) => `
    <article class="result">
      <div>
        <h3>${escapeHtml(item.name)}</h3>
        <div class="id">${escapeHtml(item.id)} · ${escapeHtml(item.path)}</div>
        <p>${escapeHtml(item.description || "")}</p>
        <div class="why">${escapeHtml(item.agent)} · ${escapeHtml(item.license || "")} · installed ${escapeHtml((item.installed_at || "").slice(0, 10))}</div>
      </div>
      <div class="actions">
        <div class="facts">
          <span class="tag ${item.status === "ok" ? "ok" : item.status === "modified" ? "warn" : "bad"}">${escapeHtml(item.status)}</span>
          <span class="tokens">${item.tokens ? `~${fmtTokens(item.tokens)} tok` : ""}</span>
        </div>
        <div class="facts">
          <button class="ghost small" data-detail="${escapeHtml(item.id)}">Details</button>
          <button class="ghost small danger" data-remove="${escapeHtml(item.id)}">Remove</button>
        </div>
      </div>
    </article>`
    )
    .join("");
}

// ---------------------------------------------------------------------------
// Stacks
// ---------------------------------------------------------------------------

function renderStacks() {
  el("#stack-grid").innerHTML = state.bundles
    .map(
      (bundle) => `
    <article class="stack-card">
      <h3>${escapeHtml(bundle.name)}</h3>
      <p class="desc">${escapeHtml(bundle.description)}</p>
      <ul>
        ${bundle.resolved
          .slice(0, 6)
          .map(
            (skill) => `<li><span>${escapeHtml(skill.name)}</span><span>${skill.tokens ? `~${fmtTokens(skill.tokens)}` : ""}</span></li>`
          )
          .join("")}
        ${bundle.resolved.length > 6 ? `<li><span>+ ${bundle.resolved.length - 6} more</span><span></span></li>` : ""}
      </ul>
      <div class="foot">
        <span class="tokens">${bundle.resolved.length} skills · ~${fmtTokens(bundle.tokens)} tokens</span>
        <button class="primary" data-stack="${escapeHtml(bundle.slug)}">Install stack</button>
      </div>
    </article>`
    )
    .join("");
}

// ---------------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------------

function renderRoles() {
  el("#role-grid").innerHTML = state.roles
    .map(
      (role) => `
    <article class="role-card">
      <div>
        <h3>${escapeHtml(role.name)}</h3>
        <div class="slug">${escapeHtml(role.slug)}</div>
        <div class="counts">${(role.skills || []).length} skills · ${(role.rules || []).length} rules · ${(role.agents || []).length} agents</div>
      </div>
      <button class="ghost small" data-role="${escapeHtml(role.slug)}">Preview</button>
    </article>`
    )
    .join("");
}

// ---------------------------------------------------------------------------
// Security
// ---------------------------------------------------------------------------

async function renderSecurity() {
  const data = state.data;
  if (!state.security) state.security = await api("/api/security");
  const sec = state.security;
  const broken = data.installed.filter((item) => item.status !== "ok");
  el("#security-stats").innerHTML = [
    ["Skills verified", `${sec.verified}/${sec.total_skills}`],
    ["Files scanned", (sec.files || 0).toLocaleString()],
    ["Critical findings", String(sec.critical)],
    ["Installed intact", `${data.installed.length - broken.length}/${data.installed.length}`],
  ]
    .map(([label, value]) => `<div class="stat"><div class="n">${escapeHtml(value)}</div><div class="l">${escapeHtml(label)}</div></div>`)
    .join("");

  el("#security-policy").innerHTML = `
    <div class="problem"><span class="lvl info">gate</span><span>Every install is blocked unless <span class="mono">verified === true</span> in the registry security report.</span></div>
    <div class="problem"><span class="lvl info">hash</span><span>Each skill is hashed before and after copying; a mismatch aborts the install.</span></div>
    <div class="problem"><span class="lvl info">local</span><span>The app binds to 127.0.0.1 and sends nothing off the machine.</span></div>
    <div class="problem"><span class="lvl info">checks</span><span class="mono">${escapeHtml((sec.checks || []).join(", "))}</span></div>`;

  el("#security-integrity").innerHTML = broken.length
    ? broken
        .map(
          (item) => `<div class="problem"><span class="lvl warn">${escapeHtml(item.status)}</span><span>${escapeHtml(item.id)} · ${escapeHtml(item.path)}</span></div>`
        )
        .join("")
    : `<div class="empty">Every installed skill matches its recorded hash.</div>`;
}

// ---------------------------------------------------------------------------
// Drawer
// ---------------------------------------------------------------------------

function closeDrawer() {
  el("#drawer").hidden = true;
  el("#drawer-content").innerHTML = "";
}

el("#drawer").addEventListener("click", (event) => {
  if (event.target.dataset.close !== undefined) closeDrawer();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeDrawer();
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    go("browse");
  }
});

function renderMarkdown(markdown) {
  const blocks = [];
  let text = escapeHtml(markdown).replace(/```([\s\S]*?)```/g, (_match, code) => {
    blocks.push(`<pre>${code.replace(/^\n/, "")}</pre>`);
    return `\u0000${blocks.length - 1}\u0000`;
  });
  text = text
    .replace(/^###### (.*)$/gm, "<h4>$1</h4>")
    .replace(/^##### (.*)$/gm, "<h4>$1</h4>")
    .replace(/^#### (.*)$/gm, "<h4>$1</h4>")
    .replace(/^### (.*)$/gm, "<h3>$1</h3>")
    .replace(/^## (.*)$/gm, "<h3>$1</h3>")
    .replace(/^# (.*)$/gm, "<h2>$1</h2>")
    .replace(/^[-*] (.*)$/gm, "<li>$1</li>")
    .replace(/(<li>[\s\S]*?<\/li>)/g, "<ul>$1</ul>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\n{2,}/g, "</p><p>")
    .replace(/\n/g, "<br>");
  text = text.replace(/\u0000(\d+)\u0000/g, (_match, index) => blocks[Number(index)]);
  return `<p>${text}</p>`;
}

async function openSkill(id) {
  const drawer = el("#drawer");
  const content = el("#drawer-content");
  drawer.hidden = false;
  content.innerHTML = `<div class="empty">Loading…</div>`;
  try {
    const skill = await api(`/api/skill?id=${encodeURIComponent(id)}`);
    const security = skill.security || {};
    content.innerHTML = `
      <div class="kicker">${escapeHtml(skill.category)}</div>
      <h2>${escapeHtml(skill.name)}</h2>
      <div class="id mono muted">${escapeHtml(skill.id)}</div>
      <div class="drawer-meta">
        <span class="tag ok">${escapeHtml(skill.source.license)}</span>
        <span class="tag">${escapeHtml(skill.source.repo)}</span>
        <span class="tag ${security.verified ? "ok" : "bad"}">${escapeHtml(security.status || "unverified")}</span>
        ${skill.tokens ? `<span class="tag">~${fmtTokens(skill.tokens)} tokens</span>` : ""}
      </div>
      <p>${escapeHtml(skill.description)}</p>
      <div style="display:flex;gap:8px;margin:14px 0 6px">
        <button class="primary" data-install="${escapeHtml(skill.id)}" ${skill.distributable ? "" : "disabled"}>Install</button>
        <button class="ghost" data-reveal="${escapeHtml(skill.id)}">Show file</button>
      </div>
      ${skill.content ? `<h3>SKILL.md</h3>${renderMarkdown(skill.content)}` : `<p class="muted">Index-only entry. Read it upstream: <a href="${escapeHtml(skill.upstream)}">${escapeHtml(skill.upstream)}</a></p>`}
    `;
  } catch (error) {
    content.innerHTML = `<div class="empty">Could not load: ${escapeHtml(error.message)}</div>`;
  }
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

async function installIds(ids, { force = false } = {}) {
  try {
    toast(`Installing ${ids.length} skill${ids.length === 1 ? "" : "s"}…`);
    const result = await api("/api/install", { method: "POST", body: { ids, agent: agentKey(), force } });
    state.data = result.state;
    renderAll();
    const failed = result.failed || [];
    if (failed.length) {
      toast(`Installed ${result.installed.length}, ${failed.length} failed: ${failed[0].error}`, true);
    } else {
      toast(`Installed ${result.installed.length} skill${result.installed.length === 1 ? "" : "s"} into ${agentKey()}`);
    }
  } catch (error) {
    toast(error.message, true);
  }
}

async function removeId(id) {
  try {
    const result = await api("/api/remove", { method: "POST", body: { id } });
    state.data = result.state;
    renderAll();
    toast(`Removed ${id}`);
  } catch (error) {
    toast(error.message, true);
  }
}

async function updateAll() {
  try {
    const result = await api("/api/update", { method: "POST", body: {} });
    state.data = result.state;
    renderAll();
    const changed = result.results.filter((entry) => entry.status !== "current");
    toast(changed.length ? `Updated ${changed.length} skill${changed.length === 1 ? "" : "s"}` : "Everything is current");
  } catch (error) {
    toast(error.message, true);
  }
}

async function installStack(slug) {
  const bundle = state.bundles.find((entry) => entry.slug === slug);
  if (!bundle) return;
  await installIds(bundle.resolved.map((skill) => skill.id));
}

async function previewRole(slug) {
  const profile = el("#profile-select").value;
  try {
    const result = await api("/api/setup", { method: "POST", body: { role: slug, profile, agent: agentKey(), dryRun: true } });
    const plan = result.plan;
    const drawer = el("#drawer");
    drawer.hidden = false;
    el("#drawer-content").innerHTML = `
      <div class="kicker">Setup plan</div>
      <h2>${escapeHtml(plan.role.name)}</h2>
      <div class="id mono muted">${escapeHtml(plan.profile.name)} profile · ${escapeHtml(plan.agent)}</div>
      <p>${escapeHtml(plan.role.description || "")}</p>
      <div class="drawer-meta">
        <span class="tag">${plan.skills.length} skills</span>
        <span class="tag">${plan.rules.length} rules</span>
        <span class="tag">${plan.agents.length} subagents</span>
        <span class="tag">${plan.hooks.length} hooks</span>
      </div>
      <h3>Skills</h3>
      <ul>${plan.skills.map((skill) => `<li class="mono" style="font-size:11px">${escapeHtml(skill.id)} · ~${fmtTokens(skill.tokens)} tok</li>`).join("")}</ul>
      <div style="display:flex;gap:8px;margin-top:14px">
        <button class="primary" data-apply-role="${escapeHtml(plan.role.slug)}">Apply to ${escapeHtml(plan.agent)}</button>
      </div>
      <h3>Prompt</h3>
      <pre>${escapeHtml(result.prompt)}</pre>
    `;
  } catch (error) {
    toast(error.message, true);
  }
}

async function applyRole(slug) {
  const profile = el("#profile-select").value;
  try {
    const result = await api("/api/setup", { method: "POST", body: { role: slug, profile, agent: agentKey(), dryRun: false } });
    state.data = result.state;
    renderAll();
    closeDrawer();
    toast(`Applied ${result.plan.role.name} (${profile})`);
  } catch (error) {
    toast(error.message, true);
  }
}

// ---------------------------------------------------------------------------
// Event delegation
// ---------------------------------------------------------------------------

document.addEventListener("click", async (event) => {
  const goto = event.target.closest("[data-goto]");
  if (goto) return go(goto.dataset.goto);

  const target = event.target.closest("[data-install],[data-remove],[data-detail],[data-stack],[data-role],[data-apply-role]");
  if (!target) return;
  const { install, remove, detail, stack, role, applyRole: apply } = target.dataset;
  if (install) await installIds([install]);
  if (remove) await removeId(remove);
  if (detail) await openSkill(detail);
  if (stack) await installStack(stack);
  if (role) await previewRole(role);
  if (apply) await applyRole(apply);
});

el("#update-all").addEventListener("click", updateAll);
el("#refresh").addEventListener("click", () => load(true));
el("#recheck").addEventListener("click", async () => {
  state.data = await api("/api/state");
  renderAll();
  toast("Re-checked installed skills");
});

el("#change-folder").addEventListener("click", async () => {
  if (DESKTOP) {
    const folder = await window.aidentityDesktop.chooseFolder();
    if (!folder) return;
    state.data = await api("/api/state");
    renderAll();
    toast(`Workspace: ${folder}`);
    return;
  }
  const folder = window.prompt("Workspace folder", state.data ? state.data.cwd : "");
  if (!folder) return;
  try {
    state.data = await api("/api/cwd", { method: "POST", body: { path: folder } });
    renderAll();
    toast(`Workspace: ${folder}`);
  } catch (error) {
    toast(error.message, true);
  }
});

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------

function renderAll() {
  renderOverview();
  renderInstalled();
  renderStacks();
  renderRoles();
  if (state.view === "security") renderSecurity();
}

async function load(force = false) {
  if (!state.data || force) {
    state.data = await api("/api/state");
  }
  if (!state.bundles.length || force) {
    const [bundles, roles] = await Promise.all([api("/api/bundles"), api("/api/roles")]);
    state.bundles = bundles;
    state.roles = roles;
  }
  if (!state.agentTouched) {
    state.agent = state.data.detected || "claude";
    state.agentTouched = true;
  }

  const categories = await api("/api/categories");
  el("#category-filter").innerHTML =
    `<option value="">All categories</option>` +
    categories.map((entry) => `<option value="${escapeHtml(entry.name)}">${escapeHtml(entry.name)} (${entry.count})</option>`).join("");

  el("#agent-select").innerHTML = state.data.agents
    .map((agent) => `<option value="${escapeHtml(agent.key)}" ${agent.key === state.agent ? "selected" : ""}>→ ${escapeHtml(agent.label)}</option>`)
    .join("");

  renderAll();
  await runSearch(state.query);
}

(async function boot() {
  try {
    await load(true);
    const initial = location.hash.slice(1);
    go(el(`.page[data-page="${initial}"]`) ? initial : "overview", { silent: true });
  } catch (error) {
    document.body.innerHTML = `<div style="padding:40px;font-family:system-ui"><h1>Aidentity</h1><p>Could not start: ${escapeHtml(error.message)}</p></div>`;
  }
})();
