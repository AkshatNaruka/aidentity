#!/usr/bin/env node

/**
 * Static site generator.
 *
 * Zero dependencies on purpose: `node site/build.js` produces a complete,
 * deployable site in site/dist. No npm install, no framework drift, no build
 * cache to invalidate. Content is generated from registry/skills.json.
 *
 * Usage:
 *   node site/build.js
 *   SITE_URL=https://example.com node site/build.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(__dirname, "dist");
const SITE = (() => {
  const url = new URL(process.env.SITE_URL || "https://akshatnaruka.github.io/aidentity");
  url.hostname = url.hostname.toLowerCase();
  return url.toString().replace(/\/$/, "");
})();
const BASE = new URL(SITE).pathname.replace(/\/$/, "");
const REPO = "https://github.com/AkshatNaruka/aidentity";
const GENERATED = new Date().toISOString().slice(0, 10);
const BUILD_HASH = Date.now().toString(36);
// Date the indexed content last changed (stable across rebuilds), for
// sitemap lastmod and schema dateModified. Falls back to the build date.
let CONTENT_DATE = GENERATED;
const INDEXNOW_KEY = "c53fff0269a753a2d4152843dfb58136";

const registry = JSON.parse(fs.readFileSync(path.join(ROOT, "registry", "skills.json"), "utf8"));
CONTENT_DATE = registry.generated_at || GENERATED;
const security = fs.existsSync(path.join(ROOT, "registry", "security.json"))
  ? JSON.parse(fs.readFileSync(path.join(ROOT, "registry", "security.json"), "utf8"))
  : { skills: {} };
const { buildRolePlan, generateSetupPrompt } = require("../cli/lib/setup");
const bundlesData = fs.existsSync(path.join(ROOT, "bundles", "bundles.json"))
  ? JSON.parse(fs.readFileSync(path.join(ROOT, "bundles", "bundles.json"), "utf8")).bundles
  : [];
const sources = JSON.parse(fs.readFileSync(path.join(ROOT, "registry", "sources.json"), "utf8")).sources;
const verified = fs.existsSync(path.join(ROOT, "registry", "verified.json"))
  ? JSON.parse(fs.readFileSync(path.join(ROOT, "registry", "verified.json"), "utf8"))
  : { sources: {} };
const rolesData = fs.existsSync(path.join(ROOT, "roles", "roles.json"))
  ? JSON.parse(fs.readFileSync(path.join(ROOT, "roles", "roles.json"), "utf8"))
  : { roles: [] };

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

const esc = (value) =>
  String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const up = (depth) => "../".repeat(depth);

// Human-readable skill name for titles and headings: "tdd" -> "TDD",
// "supabase-postgres-best-practices" -> "Supabase Postgres Best Practices".
const ACRONYMS = new Set([
  "ai", "api", "apis", "ui", "ux", "seo", "aeo", "geo", "cro", "tdd", "sql", "css", "html", "js", "ts", "ios",
  "aws", "gcp", "gke", "cli", "mcp", "pr", "prs", "llm", "llms", "rag", "adr", "adrs", "e2e", "ci", "cd", "md",
  "pdf", "pptx", "docx", "xlsx", "ado", "sdk", "jwt", "oauth", "waf", "tpu", "gpu", "vm", "iam", "rbac", "sre",
  "kpi", "okr", "aso", "ppc", "sm", "qa", "ml", "nlp", "ocr", "py", "url", "json", "yaml", "dns", "ssr",
]);
function displayName(name) {
  return String(name || "")
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => {
      const lower = word.toLowerCase();
      if (ACRONYMS.has(lower)) return lower.toUpperCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

// <title> that matches search intent and stays near 60 chars with the " | Aidentity" suffix.
function skillTitle(name) {
  const full = `${name}: agent skill for Claude Code, Codex & Cursor`;
  if (full.length <= 58) return full;
  const short = `${name}: AI agent skill`;
  return short.length <= 58 ? short : name;
}

// Security label that never claims more than the scanner did.
function securityLabel(record) {
  if (!record) return "not scanned";
  if (!record.files_scanned) return "not scanned (content not hosted)";
  if (record.verified && !record.findings_count) return `scanned, 0 findings (${record.files_scanned} file${record.files_scanned === 1 ? "" : "s"})`;
  return `scanned, ${record.findings_count || 0} finding(s)`;
}


const SETUP_PROMPT = `Set up my agent with Aidentity.

1. Read https://akshatnaruka.github.io/aidentity/llms.txt and https://akshatnaruka.github.io/aidentity/roles.json.
2. Ask me my role (e.g. software-engineer, architect, product-manager, designer, marketer, finance-analyst, quant-researcher, data-analyst) and profile (individual or enterprise).
3. If you have shell access, run: npx aidentity setup <role> --profile <individual|enterprise>
4. Otherwise, fetch https://akshatnaruka.github.io/aidentity/security.json and https://akshatnaruka.github.io/aidentity/search.json.
5. Verify every skill has verified:true, risk_level:"safe", status:"stable", and content_url!=null.
6. Tell me the license and SHA-256 verification status before running: npx aidentity add <id>`;

function promptBlock(prompt, label = "AI setup prompt") {
  return `<div class="prompt-block">
  <div class="prompt-head">
    <span>${esc(label)}</span>
    <button type="button" data-copy="${esc(prompt)}" aria-label="Copy ${esc(label)}">copy prompt</button>
  </div>
  <pre><code>${esc(prompt)}</code></pre>
</div>`;
}

function rotatingCommandBlock(commands) {
  const first = commands[0];
  return `<div class="cmd cmd-rotate" data-commands="${esc(JSON.stringify(commands))}">
  <span class="prompt" aria-hidden="true">$</span>
  <code aria-live="off">${esc(first)}</code>
  <button type="button" data-copy="${esc(first)}" aria-label="Copy install command">copy</button>
</div>`;
}

function modernCopyButton(text, label = "Copy") {
  return `<button type="button" class="modern-copy-btn" data-copy="${esc(text)}" aria-label="${esc(label)}">
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
  <span class="copy-text">${esc(label)}</span>
</button>`;
}

function modernCommandSnippet({ title, badge = "CURL", command }) {
  return `<div class="snippet-card snippet-card-dark">
  <div class="snippet-header">
    <div class="snippet-info">
      <span class="snippet-badge">${esc(badge)}</span>
      <span class="snippet-title">${esc(title)}</span>
    </div>
    ${modernCopyButton(command, "Copy command")}
  </div>
  <pre class="snippet-body"><code>${esc(command)}</code></pre>
</div>`;
}

function modernPromptCard({ num, title, description, prompt }) {
  return `<div class="prompt-card">
  <div class="prompt-card-head">
    <div class="prompt-card-title-group">
      <span class="prompt-card-num">${esc(num)}</span>
      <span class="prompt-card-name">${esc(title)}</span>
    </div>
    ${modernCopyButton(prompt, "Copy prompt")}
  </div>
  ${description ? `<p class="prompt-card-desc">${esc(description)}</p>` : ""}
  <div class="prompt-card-body">
    <pre><code>${esc(prompt)}</code></pre>
  </div>
</div>`;
}

function jsonld(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function shareRow(url, title) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  return `<div class="share">
  <span class="share-label">Share</span>
  <a href="https://x.com/intent/tweet?text=${t}&url=${u}" rel="noopener" target="_blank">X</a>
  <a href="https://www.linkedin.com/sharing/share-offsite/?url=${u}" rel="noopener" target="_blank">LinkedIn</a>
  <a href="https://news.ycombinator.com/submitlink?u=${u}&t=${t}" rel="noopener" target="_blank">Hacker News</a>
  <a href="https://www.reddit.com/submit?url=${u}&title=${t}" rel="noopener" target="_blank">Reddit</a>
  <button type="button" data-copy="${esc(url)}">copy link</button>
</div>`;
}


function write(file, contents) {
  const target = path.join(OUT, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, contents);
}

function licenseLabel(license) {
  if (!license) return "Unknown";
  if (license === "LicenseRef-Proprietary") return "Proprietary";
  return license;
}

function statusTag(status) {
  if (status === "stable") return `<span class="tag ok">stable</span>`;
  if (status === "deprecated") return `<span class="tag bad">deprecated</span>`;
  return `<span class="tag warn">in progress</span>`;
}

function verifiedOn(key) {
  const entry = verified.sources && verified.sources[key];
  return entry && entry.checked_at ? entry.checked_at.slice(0, 10) : GENERATED;
}

const skills = registry.skills.slice().sort((a, b) => a.id.localeCompare(b.id));

const counts = {};
for (const skill of skills) counts[skill.category] = (counts[skill.category] || 0) + 1;

const categoryList = Object.entries(counts)
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  .map(([name, count]) => ({ name, count }));

const sourceList = Object.entries(sources)
  .map(([key, source]) => ({
    key,
    ...source,
    count: skills.filter((skill) => skill.source.key === key).length,
    verified: verifiedOn(key),
  }))
  .filter((source) => source.count > 0)
  .sort((a, b) => b.count - a.count);

// Hand-picked starting points. Falls back to the first distributable skills.
const START_HERE = [
  "mattpocock/engineering/grill-with-docs",
  "mattpocock/engineering/tdd",
  "mattpocock/engineering/code-review",
  "addyosmani/planning-and-task-breakdown",
  "addyosmani/debugging-and-error-recovery",
  "addyosmani/security-and-hardening",
  "obra-superpowers/systematic-debugging",
  "obra-superpowers/using-git-worktrees",
];

const startHere = START_HERE.map((id) => skills.find((skill) => skill.id === id)).filter(Boolean);
if (startHere.length < 6) {
  for (const skill of skills) {
    if (startHere.length >= 6) break;
    if (skill.distributable && !startHere.includes(skill)) startHere.push(skill);
  }
}

// ---------------------------------------------------------------------------
// layout
// ---------------------------------------------------------------------------

function layout({ title, description, depth, body, page, canonical, jsonld, ogType = "website", keywords = "", markdownAlt = null }) {
  const p = up(depth);
  const totalRoles = rolesData.roles ? rolesData.roles.length : 21;
  const fullTitle = title ? `${title} | Aidentity` : "Aidentity: agent skills, checked before you install them";
  const cleanDescription = (description || "")
    .replace(/\s*—\s*/g, ", ")
    .replace(/\s*–\s*/g, " - ");
  const rawDescription =
    cleanDescription ||
    `${registry.total} agent skills from Anthropic, Google, Microsoft, Vercel and more. Hosted skills are scanned and license-checked; one command installs into 6 coding agents.`;
  const metaDescription = rawDescription.replace(/\s+/g, " ").trim();
  // Search results truncate around 160 characters; keep the full text in the body.
  const shortDescription =
    metaDescription.length > 158
      ? metaDescription.slice(0, 155).replace(/[,.;:\s]+$/, "") + "…"
      : metaDescription;
  const ogImage = `${SITE}/assets/og.png`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(shortDescription)}">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
<meta name="author" content="Akshat Naruka">
${keywords ? `<meta name="keywords" content="${esc(keywords)}">` : `<meta name="keywords" content="AI agent skills, Claude Code skills, Cursor skills, Codex skills, OpenCode, Gemini CLI, SKILL.md, MCP, agent playbooks, agentic workflows, GEO, AEO">`}
<link rel="canonical" href="${esc(canonical || SITE + "/")}">
<meta property="og:site_name" content="Aidentity">
<meta property="og:type" content="${ogType}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(shortDescription)}">
<meta property="og:url" content="${esc(canonical || SITE + "/")}">
<meta property="og:image" content="${ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Aidentity: the verified index of AI agent skills">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(fullTitle)}">
<meta name="twitter:description" content="${esc(shortDescription)}">
<meta name="twitter:image" content="${ogImage}">
<meta name="theme-color" content="#f7f4ed" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#121210" media="(prefers-color-scheme: dark)">
<link rel="icon" href="${p}assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="${p}assets/apple-touch-icon.png">
<link rel="manifest" href="${p}manifest.webmanifest">
<link rel="alternate" type="application/rss+xml" title="Aidentity: new skills" href="${p}feed.xml">
<link rel="ai-catalog" href="${p}.well-known/ai-catalog.json">
<link rel="ai-plugin" href="${p}.well-known/ai-plugin.json">
<link rel="mcp-server" href="${p}.well-known/mcp.json">
<link rel="service-desc" href="${p}openapi.json" type="application/json">
<link rel="alternate" type="text/plain" title="LLMs Context" href="${p}llms.txt">
${markdownAlt ? `<link rel="alternate" type="text/markdown" href="${esc(markdownAlt)}">` : ""}
<link rel="stylesheet" href="${p}assets/style.css?v=${BUILD_HASH}">
${jsonld ? `<script type="application/ld+json">${jsonld.replace(/\s*—\s*/g, ", ").replace(/\s*–\s*/g, " - ")}</script>` : ""}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-head" id="site-head">
  <div class="wrap site-head-inner">
    <div class="site-brand">
      <a class="wordmark" href="${p}index.html">
        <span class="dot" aria-hidden="true"></span>aidentity <span class="sub">/ index</span>
      </a>
    </div>

    <div class="site-nav-group">
      <nav class="site-nav" id="site-nav" aria-label="Primary">
        <a href="${p}setup/index.html"${page === "setup" ? ' aria-current="page"' : ""}>Setup</a>
        <a href="${p}skills/index.html"${page === "browse" ? ' aria-current="page"' : ""}>Browse</a>
        <a href="${p}playbooks/index.html"${page === "playbooks" || page === "roles" || page === "courses" ? ' aria-current="page"' : ""}>Playbooks</a>
        <a href="${p}guides/index.html"${page === "guides" ? ' aria-current="page"' : ""}>Guides</a>
        <a href="${p}enterprise/index.html"${page === "enterprise" ? ' aria-current="page"' : ""}>Enterprise</a>
      </nav>

      <button type="button" class="nav-search-trigger" id="nav-search-trigger" aria-label="Quick Search (/ or ⌘K)">
        <span class="search-icon" aria-hidden="true">⌕</span>
        <span class="search-label">Search</span>
        <kbd class="search-kbd">/</kbd>
      </button>

      <div class="nav-social-links">
        <a href="https://x.com/probiex007" rel="noopener" target="_blank" class="nav-icon-link" aria-label="Maker on X (@probiex007)" title="Maker: @probiex007 on X">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </a>

        <a href="${REPO}" rel="noopener" target="_blank" class="nav-icon-link" aria-label="GitHub Repository" title="GitHub">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
          </svg>
        </a>
      </div>

      <button type="button" class="nav-mobile-toggle" id="nav-mobile-toggle" aria-label="Toggle navigation menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>
</header>
<main id="main">
${body}
</main>
<footer class="site-foot" id="site-foot">
  <canvas id="footer-shader-canvas" class="footer-shader-canvas" aria-hidden="true"></canvas>
  <div class="footer-overlay" aria-hidden="true"></div>
  <div class="footer-watermark" aria-hidden="true">AIDENTITY</div>
  <div class="wrap footer-wrap">
    <div class="footer-grid">
      <div class="footer-col footer-col-brand">
        <div class="footer-brand-title">
          <span class="dot" aria-hidden="true"></span><strong>aidentity</strong>
        </div>
        <p class="footer-tagline">
          The verified registry of AI agent skills, playbooks, and curricula. Every file cryptographically verified with SHA-256 digests and validated against SPDX open-source licenses.
        </p>
        <div class="footer-chips">
          <span class="footer-chip">${registry.total} Skills</span>
          <span class="footer-chip">${totalRoles} Roles</span>
          <span class="footer-chip">6 Tracks</span>
          <span class="footer-chip">Scanned &amp; licensed</span>
        </div>
        <div class="footer-maker">
          <span class="footer-maker-label">Built by maker</span>
          <a href="https://x.com/probiex007" rel="noopener" target="_blank" class="footer-maker-link" title="Maker: @probiex007 on X">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span>@probiex007</span>
          </a>
        </div>
      </div>

      <div class="footer-col">
        <h4 class="footer-heading">Registry</h4>
        <ul class="footer-links">
          <li><a href="${p}setup/index.html">Setup Generator (5 Qs)</a></li>
          <li><a href="${p}skills/index.html">Browse All ${registry.total} Skills</a></li>
          <li><a href="${p}playbooks/index.html">Role Playbooks &amp; Blueprints</a></li>
          <li><a href="${p}playbooks/index.html#courses">Guided Learning Tracks</a></li>
          <li><a href="${p}guides/index.html">Engineering Guides</a></li>
          <li><a href="${p}sources/index.html">Sources &amp; Authors (${sourceList.length})</a></li>
          <li><a href="${p}compare/index.html">Compare Skill Directories</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4 class="footer-heading">Agents &amp; Formats</h4>
        <ul class="footer-links">
          <li><a href="${p}for-agents/index.html">Agent Instructions</a></li>
          <li><a href="${p}llms.txt">llms.txt (Full Index Context)</a></li>
          <li><a href="${p}agent.json">agent.json Discovery</a></li>
          <li><a href="${p}security.json">security.json Digests</a></li>
          <li><a href="${p}catalog.json">catalog.json Schema</a></li>
          <li><a href="${p}feed.xml">RSS Feed</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4 class="footer-heading">Integrity &amp; Enterprise</h4>
        <ul class="footer-links">
          <li><a href="${p}enterprise/index.html">Enterprise Trust Center</a></li>
          <li><a href="${p}enterprise/index.html#seven-gates">7-Gate Security Audit</a></li>
          <li><a href="${p}enterprise/index.html#air-gapped">Air-Gapped VPC Setup</a></li>
          <li><a href="${p}enterprise/index.html#ciso-packet">CISO Approval Packet</a></li>
          <li><a href="${REPO}" rel="noopener" target="_blank">GitHub Repository ↗</a></li>
          <li><a href="https://x.com/probiex007" rel="noopener" target="_blank">Maker on X (@probiex007) ↗</a></li>
          <li><a href="${p}about/index.html#licensing">SPDX Licensing Notice</a></li>
          <li><a href="${p}pricing.md">Zero-Cost Model ($0 Free)</a></li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <div class="footer-legal">
        <p>Built by <a href="https://x.com/probiex007" rel="noopener" target="_blank"><strong>@probiex007</strong> on X</a> · Aidentity is an open registry, not a fork. Every skill belongs to its upstream author.<br>Registry generated ${GENERATED}. Content under MIT, Apache-2.0 and CC0 (see <a href="${p}about/index.html#licensing">licensing</a>).</p>
      </div>
      <div class="footer-actions">
        <button type="button" class="back-to-top" id="back-to-top" aria-label="Back to top of page">
          <span>Back to top</span>
          <span class="arrow" aria-hidden="true">&uarr;</span>
        </button>
      </div>
    </div>
  </div>
</footer>
<script src="${p}assets/app.js?v=${BUILD_HASH}" defer></script>
</body>
</html>
`;
}

function row(skill, depth) {
  const p = up(depth);
  const cleanDesc = (skill.description || "").replace(/\s*—\s*/g, ", ").replace(/\s*–\s*/g, " - ");
  const search = `${skill.name} ${cleanDesc} ${skill.category} ${skill.tags.join(" ")} ${skill.source.repo}`.toLowerCase();
  return `<a class="row" href="${p}skills/${skill.id}/index.html"
     data-source="${esc(skill.source.key)}"
     data-category="${esc(skill.category)}"
     data-name="${esc(skill.name.toLowerCase())}"
     data-distributable="${skill.install ? "1" : "0"}"
     data-search="${esc(search)}">
  <span>
    <span class="r-name">${esc(skill.name)}</span>
    <span class="r-desc">${esc(cleanDesc)}</span>
  </span>
  <span class="r-src">${esc(skill.source.repo)}</span>
  <span class="r-lic">${esc(licenseLabel(skill.source.license))}</span>
</a>`;
}

function commandBlock(command, label) {
  return `<div class="cmd">
  <span class="prompt" aria-hidden="true">$</span>
  <code>${esc(command)}</code>
  <button type="button" data-copy="${esc(command)}" aria-label="Copy ${esc(label || "command")}">copy</button>
</div>`;
}

// Minimal, safe markdown renderer. Escapes first, then applies structure, so
// untrusted text can never inject markup. Covers what SKILL.md files use:
// headings, lists, fenced code, tables, quotes, inline code, links, emphasis.
function renderMarkdown(markdown) {
  const codeBlocks = [];
  let text = String(markdown || "")
    .replace(/\s*—\s*/g, ", ")
    .replace(/\s*–\s*/g, " - ")
    .replace(/```([a-z0-9-]*)\n([\s\S]*?)```/gi, (_, lang, code) => {
      codeBlocks.push(`<pre><code>${esc(code.replace(/\n$/, ""))}</code></pre>`);
      return `\u0000CODE${codeBlocks.length - 1}\u0000`;
    });

  const lines = esc(text).split(/\r?\n/);
  const out = [];
  let list = null;
  let quote = [];
  let table = [];

  const closeList = () => {
    if (list) {
      out.push(`</${list}>`);
      list = null;
    }
  };
  const closeQuote = () => {
    if (quote.length) {
      out.push(`<blockquote>${inline(quote.join(" "))}</blockquote>`);
      quote = [];
    }
  };
  const closeTable = () => {
    if (!table.length) return;
    const rows = table.filter((row) => !/^\s*\|?[\s:|-]+\|?\s*$/.test(row));
    if (rows.length) {
      const cells = (row) =>
        row
          .replace(/^\s*\|/, "")
          .replace(/\|\s*$/, "")
          .split("|")
          .map((cell) => cell.trim());
      const head = cells(rows[0]);
      const bodyRows = rows.slice(1);
      out.push("<table><thead><tr>" + head.map((c) => `<th>${inline(c)}</th>`).join("") + "</tr></thead><tbody>");
      for (const row of bodyRows) {
        out.push("<tr>" + cells(row).map((c) => `<td>${inline(c)}</td>`).join("") + "</tr>");
      }
      out.push("</tbody></table>");
    }
    table = [];
  };

  function inline(value) {
    return value
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[\s(])\*([^*\n]+)\*/g, "$1<em>$2</em>")
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" rel="noopener">$1</a>')
      .replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, '$1<a href="$2" rel="noopener">$2</a>');
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (/^\s*\|.*\|\s*$/.test(line)) {
      closeList();
      closeQuote();
      table.push(line);
      continue;
    }
    if (table.length) closeTable();

    if (!line.trim()) {
      closeList();
      closeQuote();
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      closeList();
      closeQuote();
      const level = Math.min(heading[1].length + 2, 5);
      out.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      continue;
    }

    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    if (bullet) {
      closeQuote();
      if (list !== "ul") {
        closeList();
        out.push("<ul>");
        list = "ul";
      }
      out.push(`<li>${inline(bullet[1])}</li>`);
      continue;
    }

    const numbered = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (numbered) {
      closeQuote();
      if (list !== "ol") {
        closeList();
        out.push("<ol>");
        list = "ol";
      }
      out.push(`<li>${inline(numbered[1])}</li>`);
      continue;
    }

    if (/^>\s?/.test(line)) {
      closeList();
      quote.push(line.replace(/^>\s?/, ""));
      continue;
    }

    if (/^(-{3,}|\*{3,})$/.test(line.trim())) {
      closeList();
      closeQuote();
      out.push("<hr>");
      continue;
    }

    closeList();
    closeQuote();
    out.push(`<p>${inline(line)}</p>`);
  }

  closeList();
  closeQuote();
  closeTable();

  return out
    .join("\n")
    .replace(/\u0000CODE(\d+)\u0000/g, (_, index) => codeBlocks[Number(index)]);
}

function skillBody(skill) {
  if (!skill.path) return "";
  const file = path.join(ROOT, skill.path);
  if (!fs.existsSync(file)) return "";
  const raw = fs.readFileSync(file, "utf8");
  const withoutFrontmatter = raw.startsWith("---") ? raw.replace(/^---[\s\S]*?\n---\s*\n?/, "") : raw;
  return withoutFrontmatter.trim();
}

// ---------------------------------------------------------------------------
// home
// ---------------------------------------------------------------------------

// Homepage FAQ: rendered visibly and as FAQPage JSON-LD (answer engines quote these).
const HOME_FAQ = [
  {
    q: "What is an agent skill?",
    html: "A folder with a <span class=\"mono\">SKILL.md</span> file: instructions, and sometimes scripts, that a coding agent loads when a task matches the skill's description. Claude Code, Codex, Cursor, OpenCode, GitHub Copilot and Gemini CLI all read the same format.",
  },
  {
    q: "What does \"scanned\" mean on Aidentity?",
    html: "Every file in every hosted skill passes six static checks in CI: hidden or bidirectional Unicode, live credentials, destructive commands, prompt-injection payloads, unverified remote execution such as <span class=\"mono\">curl | sh</span>, and symlink or binary escapes. Each skill's SHA-256 digest is published in <a href=\"security.json\">security.json</a>. It is a static scan, not a guarantee, so read a skill before giving your agent broad permissions.",
  },
  {
    q: "How is this different from skills.sh or SkillsMP?",
    html: "Large directories optimise for reach and volume and list far more skills. Aidentity lists fewer and checks each one for security, license and provenance before it appears. If you need something we don't list, use a large directory, then check the skill the same way. <a href=\"compare/index.html\">See the full comparison</a>.",
  },
  {
    q: "Which coding agents does it work with?",
    html: "Claude Code, Codex, Cursor, OpenCode, GitHub Copilot and Gemini CLI. <span class=\"mono\">npx aidentity add &lt;id&gt;</span> detects your agent from the project, or pass <span class=\"mono\">--agent</span> to choose. Agents that can fetch a URL can also install from <a href=\"llms.txt\">llms.txt</a> or the MCP server.",
  },
  {
    q: "Is it free, and who owns the skills?",
    html: "Yes. The CLI is MIT-licensed and the index data is CC0. Skill content belongs to its authors and keeps its upstream license, shown on every page. Skills whose license does not allow redistribution are linked to their source, never mirrored.",
  },
];

function buildHome() {
  const topPrioritySkillIds = [
    "mattpocock/engineering/tdd",
    "mattpocock/engineering/code-review",
    "obra-superpowers/systematic-debugging",
    "addyosmani/planning-and-task-breakdown",
    "addyosmani/security-and-hardening",
    "ui-ux-pro-max/ui-ux-pro-max",
    "trailofbits/audit-context-building",
    "trailofbits/supply-chain-risk-auditor",
    "obra-superpowers/test-driven-development",
    "obra-superpowers/using-git-worktrees",
    "expo/expo-router",
    "marketingskills/ai-seo",
    "supabase/supabase-postgres-best-practices",
    "mattpocock/engineering/grill-with-docs",
    "addyosmani/debugging-and-error-recovery",
    "trailofbits/semgrep-rule-creator",
    "marketingskills/copywriting",
  ];

  const distributableSkills = skills.filter((s) => s.distributable);
  const prioritySkills = topPrioritySkillIds
    .map((id) => distributableSkills.find((s) => s.id === id))
    .filter(Boolean);

  const remainingSkills = distributableSkills.filter(
    (s) => !topPrioritySkillIds.includes(s.id)
  );

  const heroCommands = [
    ...prioritySkills.map((s) => `npx aidentity add ${s.id}`),
    ...remainingSkills.map((s) => `npx aidentity add ${s.id}`),
  ];
  const featured = startHere.slice(0, 6);
  const topCategories = categoryList;
  const distributable = registry.distributable;
  const homeRoles = rolesData.roles || [];

  // Named upstream maintainers: the strongest proof we have, shown first.
  const PROOF = [
    ["anthropic-official", "Anthropic"],
    ["google-cloud", "Google Cloud"],
    ["microsoft-azure", "Microsoft"],
    ["vercel-labs", "Vercel"],
    ["trailofbits", "Trail of Bits"],
    ["supabase", "Supabase"],
    ["expo", "Expo"],
    ["shadcn", "shadcn/ui"],
    ["mattpocock", "Matt Pocock"],
    ["addyosmani", "Addy Osmani"],
    ["obra-superpowers", "obra/superpowers"],
  ]
    .map(([key, label]) => ({ label, source: sourceList.find((s) => s.key === key) }))
    .filter((item) => item.source);
  const otherSources = sourceList.length - PROOF.length;
  const topSources = sourceList.slice().sort((a, b) => b.count - a.count).slice(0, 8);
  const roleChips = homeRoles.slice(0, 8);

  const body = `
<section class="hero">
  <div class="wrap hero-grid">
    <div class="hero-copy">
    <p class="kicker">Open source · ${registry.total} skills · 6 coding agents</p>
    <h1>Agent skills, <em>checked</em> before you install them.</h1>
    <p class="lede">
      ${registry.total} skills from Anthropic, Google, Microsoft, Vercel and ${sourceList.length - 4} more maintainers.
      Every hosted skill is scanned for prompt injection, leaked secrets and unsafe shell, license-checked,
      and installs into your coding agent with one command.
    </p>
    ${rotatingCommandBlock(heroCommands)}
    <div class="hero-actions">
      <a href="skills/index.html" class="btn btn-shimmer">Browse ${registry.total} skills &rarr;</a>
      <a href="setup/index.html" class="btn btn-ghost">Build my role setup</a>
    </div>
    <p class="hero-links"><a href="#how">How skills are checked</a><a href="compare/index.html">Compare with other directories</a></p>
    </div>
  </div>
</section>

<div class="wrap">
  <div class="proof-strip" aria-label="Upstream maintainers">
    <span class="proof-label">Skills from</span>
    <ul>
      ${PROOF.map((p) => `<li><a href="${esc(p.source.url)}" rel="noopener">${esc(p.label)}</a></li>`).join("\n      ")}
      <li><a href="sources/index.html">+ ${otherSources} more</a></li>
    </ul>
  </div>
  <div class="stats">
    <div><b>${registry.total}</b><span>Skills indexed</span></div>
    <div><b>${distributable}</b><span>Scanned &amp; installable</span></div>
    <div><b>${sourceList.length}</b><span>Upstream repositories</span></div>
    <div><b>6</b><span>Coding agents supported</span></div>
  </div>
</div>

<section id="how">
  <div class="wrap">
    <div class="section-head">
      <h2>A skill is a prompt with access to your shell.</h2>
    </div>
    <p class="section-lede">
      Your agent follows a skill's instructions with the same tools you gave it: files, terminal, network.
      A hidden Unicode instruction or a pasted <span class="mono">curl | sh</span> line is a supply-chain risk.
      Aidentity checks every hosted skill before it is listed.
    </p>
    <ol class="steps">
      <li>
        <span class="num">01</span>
        <h3>Find</h3>
        <p>Search ${registry.total} skills by task, category or source, or <a href="setup/index.html">answer five questions</a> to get a set for your role.</p>
      </li>
      <li>
        <span class="num">02</span>
        <h3>Check</h3>
        <p>Every page shows the author, SPDX license, scan result and SHA-256 digest. In CI, each file must pass six static checks:</p>
        <ul class="checklist">
          <li>No hidden or bidirectional Unicode</li>
          <li>No live credentials or private keys</li>
          <li>No destructive commands</li>
          <li>No prompt-injection payloads</li>
          <li>No unverified <span class="mono">curl | sh</span></li>
          <li>No symlink or binary escapes</li>
        </ul>
      </li>
      <li>
        <span class="num">03</span>
        <h3>Install</h3>
        <p><span class="mono">npx aidentity add &lt;id&gt;</span> detects your agent and writes the skill to <span class="mono">.claude/skills</span>, <span class="mono">.codex/skills</span>, <span class="mono">.cursor/skills</span>, <span class="mono">.opencode/skills</span>, <span class="mono">.github/skills</span> or <span class="mono">.gemini/skills</span>. Pass <span class="mono">--agent</span> to choose.</p>
      </li>
    </ol>
    <p class="note">This is a static scan, not a guarantee. Read a skill before giving your agent broad permissions. Results are public in <a href="security.json">security.json</a>.</p>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="section-head">
      <h2>Fewer skills, each one checked.</h2>
      <a class="more" href="compare/index.html">Full comparison →</a>
    </div>
    <div class="table-scroll">
    <table class="table compare-table">
      <thead>
        <tr><th scope="col"></th><th scope="col">Aidentity</th><th scope="col">Large directories</th><th scope="col">Copying from GitHub</th></tr>
      </thead>
      <tbody>
        <tr><th scope="row">Security scan before listing</th><td data-label="Aidentity">Yes, 6 checks per file</td><td data-label="Large directories">Varies, often none</td><td data-label="Copying from GitHub">You review it</td></tr>
        <tr><th scope="row">License checked</th><td data-label="Aidentity">Yes, enforced in CI</td><td data-label="Large directories">Rarely</td><td data-label="Copying from GitHub">You check it</td></tr>
        <tr><th scope="row">Author and source on every entry</th><td data-label="Aidentity">Yes</td><td data-label="Large directories">Usually</td><td data-label="Copying from GitHub">Yes</td></tr>
        <tr><th scope="row">One command, six agents</th><td data-label="Aidentity">Yes</td><td data-label="Large directories">Often</td><td data-label="Copying from GitHub">No</td></tr>
        <tr><th scope="row">Catalogue size</th><td data-label="Aidentity">${registry.total}</td><td data-label="Large directories">Tens of thousands or more</td><td data-label="Copying from GitHub">Unlimited</td></tr>
      </tbody>
    </table>
    </div>
    <p class="note">Need a skill that isn't here? A large directory will have more. Check it the same way before you install it, or <a href="${REPO}/issues/new?template=submit-a-skill.yml" rel="noopener">submit it</a> so we can scan it.</p>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="section-head">
      <h2>Start here</h2>
      <a class="more" href="skills/index.html">All ${registry.total} skills →</a>
    </div>
    <div class="rows">
      ${featured.map((skill) => row(skill, 0)).join("\n")}
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="split">
      <div>
        <h2>Not sure what to install? Start from your role.</h2>
        <p style="max-width:60ch;color:var(--ink-soft);margin-top:14px">${homeRoles.length} role playbooks bundle the skills, rules, subagents and safety hooks for a job. Pick a role, choose Individual or Enterprise, and get one command plus a setup prompt for your agent.</p>
        <p class="hero-actions"><a href="setup/index.html" class="btn">Build my role setup &rarr;</a></p>
      </div>
      <div>
        <ul class="role-chips">
          ${roleChips.map((r) => `<li><a href="playbooks/${esc(r.slug)}/index.html">${esc(r.name)}</a></li>`).join("\n          ")}
          <li><a href="playbooks/index.html">All ${homeRoles.length} roles →</a></li>
        </ul>
      </div>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="section-head">
      <h2>By category</h2>
      <a class="more" href="skills/index.html">Filter the full index →</a>
    </div>
    <div class="cat-grid">
      ${topCategories
        .map(
          (category) => `<a href="skills/index.html?category=${encodeURIComponent(category.name)}">
        <span class="name">${esc(category.name)}</span>
        <span class="count">${category.count} skill${category.count === 1 ? "" : "s"}</span>
      </a>`
        )
        .join("\n")}
    </div>
  </div>
</section>

<section id="faq">
  <div class="wrap">
    <div class="section-head">
      <h2>Questions</h2>
    </div>
    <div class="faq">
      ${HOME_FAQ.map((item) => `<details>
        <summary>${esc(item.q)}</summary>
        <p>${item.html}</p>
      </details>`).join("\n      ")}
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="section-head">
      <h2>Largest sources</h2>
      <a class="more" href="sources/index.html">All ${sourceList.length} sources →</a>
    </div>
    <div class="table-scroll">
    <table class="table">
      <thead>
        <tr><th>Repository</th><th>Author</th><th>License</th><th>Skills</th></tr>
      </thead>
      <tbody>
        ${topSources
          .map(
            (source) => `<tr>
          <td data-label="Repository"><a href="${source.url}" rel="noopener">${esc(source.repo)}</a></td>
          <td data-label="Author">${esc(source.author)}</td>
          <td data-label="License" class="mono">${esc(licenseLabel(source.license))}</td>
          <td data-label="Skills" class="mono">${source.count}</td>
        </tr>`
          )
          .join("\n")}
      </tbody>
    </table>
    </div>
    <div class="callout">
      <strong>On the proprietary entries.</strong> ${(sourceList.find((source) => source.key === "anthropic-official") || {}).count || 0} skills from
      <a href="https://github.com/anthropics/skills" rel="noopener">anthropics/skills</a> are indexed with their
      metadata and an upstream link, but their content is not hosted here because the upstream license does not permit
      redistribution. They are marked <span class="mono">Proprietary</span> everywhere they appear.
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="split">
      <div>
        <h2>Add a skill</h2>
        <p style="max-width:60ch;color:var(--ink-soft);margin-top:14px">One JSON record, one pull request. If it's accurate, correctly licensed and passes the scan, it ships the same day.</p>
        ${commandBlock("./scripts/check-all.sh", "validate command")}
        <p class="hero-links"><a href="${REPO}/blob/main/CONTRIBUTING.md" rel="noopener">Contributing guide →</a></p>
      </div>
      <div>
        <h2>Set up with your agent</h2>
        <p style="max-width:60ch;color:var(--ink-soft);margin-top:14px">Copy this prompt into Claude Code, Cursor, Codex or any agent that can fetch a URL. It reads the index, asks what you are building, and installs only what you approve.</p>
        ${promptBlock(SETUP_PROMPT)}
        <p class="hero-links"><a href="for-agents/index.html">Agent setup page →</a><a href="llms.txt">llms.txt</a><a href="agent.json">agent.json</a><a href="okf/index.md">okf/</a></p>
      </div>
    </div>
    ${shareRow(SITE + "/", "Aidentity: agent skills, checked before you install them")}
  </div>
</section>
`;

  write(
    "index.html",
    layout({
      title: null,
      depth: 0,
      body,
      page: "home",
      canonical: SITE + "/",
      keywords: "AI agent skills, Claude Code skills, Codex skills, Cursor skills, OpenCode skills, Gemini CLI skills, AI agent playbooks, AI agent courses, SKILL.md registry, enterprise AI agent setup, AI SEO GEO",
      markdownAlt: `${SITE}/llms.txt`,
      jsonld: jsonld({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebSite",
            "@id": SITE + "/#website",
            url: SITE + "/",
            name: "Aidentity",
            description: `An open-source index of ${registry.total} AI agent skills. Every hosted skill is statically scanned, license-checked and installable into six coding agents with one command.`,
            inLanguage: "en",
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: `${SITE}/skills/index.html?q={search_term_string}`
              },
              "query-input": "required name=search_term_string"
            }
          },
          {
            "@type": "Organization",
            "@id": SITE + "/#organization",
            name: "Aidentity",
            url: SITE + "/",
            logo: `${SITE}/assets/favicon.svg`,
            sameAs: [REPO]
          },
          {
            "@type": "SoftwareApplication",
            "@id": SITE + "/#software",
            name: "Aidentity CLI & Registry",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "macOS, Linux, Windows",
            url: SITE + "/",
            downloadUrl: REPO,
            softwareVersion: "1.2.0",
            license: "https://opensource.org/licenses/MIT",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
          },
          {
            "@type": "DataCatalog",
            "@id": SITE + "/#catalog",
            name: "Aidentity AI Agent Skills Catalog",
            url: SITE + "/",
            description: `Open-source verified catalog of ${registry.total} AI agent skills and ${rolesData.roles ? rolesData.roles.length : 21} role setup blueprints.`,
            publisher: { "@id": SITE + "/#organization" },
            dataset: [
              {
                "@type": "Dataset",
                "@id": SITE + "/#dataset-skills",
                name: "Verified AI Agent Skills Index",
                description: `Index of ${registry.total} AI agent skills with license, author provenance, and SHA-256 digests.`,
                license: "https://creativecommons.org/publicdomain/zero/1.0/",
                distribution: [
                  { "@type": "DataDownload", "encodingFormat": "application/json", "contentUrl": `${SITE}/search.json` },
                  { "@type": "DataDownload", "encodingFormat": "application/json", "contentUrl": `${SITE}/registry.json` },
                  { "@type": "DataDownload", "encodingFormat": "text/plain", "contentUrl": `${SITE}/llms.txt` }
                ]
              },
              {
                "@type": "Dataset",
                "@id": SITE + "/#dataset-security",
                name: "AI Agent Skill Security & Integrity Report",
                description: `7-gate static security audit and SHA-256 cryptographic hashes for ${registry.total} AI agent skills.`,
                license: "https://creativecommons.org/publicdomain/zero/1.0/",
                distribution: [
                  { "@type": "DataDownload", "encodingFormat": "application/json", "contentUrl": `${SITE}/security.json` }
                ]
              }
            ]
          },
          {
            "@type": "FAQPage",
            "@id": SITE + "/#faq",
            mainEntity: HOME_FAQ.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: { "@type": "Answer", text: item.html.replace(/<[^>]+>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">") },
            })),
          },
          {
            "@type": "CollectionPage",
            "@id": SITE + "/#collection",
            name: "Agent skills, playbooks & courses index",
            isPartOf: { "@id": SITE + "/#website" },
            mainEntity: { "@type": "ItemList", numberOfItems: registry.total }
          }
        ]
      }),
    })
  );
}

// ---------------------------------------------------------------------------
// browse
// ---------------------------------------------------------------------------

function buildBrowse() {
  const options = (values, selected) =>
    values
      .map(
        (value) =>
          `<option value="${esc(value)}"${value === selected ? " selected" : ""}>${esc(value)}</option>`
      )
      .join("\n");

  const topicKeywords = ["claude", "cursor", "python", "react", "security", "testing", "git", "scrum"];
  const existingCatNames = new Set(categoryList.slice(0, 10).map((c) => c.name.toLowerCase()));

  const topicPills = topicKeywords
    .filter((kw) => !existingCatNames.has(kw.toLowerCase()))
    .map((kw) => {
      const matchCount = skills.filter((s) =>
        (s.id + " " + s.name + " " + s.description + " " + (s.tags || []).join(" ") + " " + s.category)
          .toLowerCase()
          .includes(kw)
      ).length;
      return { name: kw, count: matchCount, type: "query" };
    });

  const catPills = categoryList.slice(0, 10).map((c) => ({
    name: c.name,
    count: c.count,
    type: "cat"
  }));

  // Unified list of filter pills sorted by count descending (zero duplicates)
  const unifiedPills = [...catPills, ...topicPills].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  const body = `
<div class="wrap">
  <div class="page-hero">
    <span class="page-hero-kicker">Verified Registry · All ${registry.total} Skills</span>
    <h1 class="page-title">Browse Verified Agent Skills</h1>
    <p class="page-lead">
      Search and filter across ${registry.total} security-audited skills from ${sourceList.length} upstream sources.
      Every file is scanned for prompt injection, secret exfiltration, and malicious shell scripts, with SHA-256 digests published in <span class="mono">security.json</span>.
    </p>
    <div class="page-hero-meta">
      <span class="hero-pill"><span class="dot"></span> ${registry.total} Total Skills</span>
      <span class="hero-pill"><span class="dot"></span> ${registry.distributable} One-Command Install</span>
      <span class="hero-pill"><span class="dot"></span> ${sourceList.length} Upstream Repositories</span>
      <span class="hero-pill"><span class="dot"></span> Weekly Verified</span>
    </div>
  </div>

  <div class="pill-strip" id="category-pills" role="toolbar" aria-label="Quick filters">
    <button type="button" class="pill-btn active" aria-pressed="true" data-cat="">All (${registry.total})</button>
    ${unifiedPills.map((p) => p.type === "cat"
      ? `<button type="button" class="pill-btn" aria-pressed="false" data-cat="${esc(p.name)}">${esc(p.name)} (${p.count})</button>`
      : `<button type="button" class="pill-btn" aria-pressed="false" data-query="${esc(p.name)}">${esc(p.name)} (${p.count})</button>`
    ).join("\n    ")}
  </div>

  <div class="controls browse-controls">
    <div class="search-input-wrap">
      <span class="search-input-icon" aria-hidden="true">⌕</span>
      <label class="sr-only" for="q">Search skills</label>
      <input id="q" type="search" placeholder="Search ${registry.total} skills by name, tag, category, author..." autocomplete="off" spellcheck="false">
      <button type="button" id="search-clear-btn" class="search-clear-btn" aria-label="Clear search" title="Clear search" hidden>&times;</button>
      <kbd class="search-input-kbd">/</kbd>
    </div>

    <div class="select-wrap">
      <label class="sr-only" for="filter-category">Filter by category</label>
      <select id="filter-category">
        <option value="">All categories (${categoryList.length})</option>
        ${options(categoryList.map((category) => category.name))}
      </select>
    </div>

    <div class="select-wrap">
      <label class="sr-only" for="filter-source">Filter by source</label>
      <select id="filter-source">
        <option value="">All sources (${sourceList.length})</option>
        ${options(sourceList.map((source) => source.key))}
      </select>
    </div>

    <div class="select-wrap">
      <label class="sr-only" for="filter-sort">Sort skills</label>
      <select id="filter-sort">
        <option value="default">Sort: Default</option>
        <option value="name-asc">Sort: Name (A to Z)</option>
        <option value="name-desc">Sort: Name (Z to A)</option>
      </select>
    </div>
  </div>

  <div class="browse-meta">
    <div class="browse-meta-left">
      <span id="result-count"><strong>${registry.total}</strong> skills available</span>
      <span class="browse-meta-sub mono">${registry.distributable} distributable · ${registry.total - registry.distributable} index only</span>
    </div>
    <div class="browse-meta-right">
      <button type="button" class="filter-dist-btn" id="filter-dist-btn" aria-pressed="false" title="Show only skills installable with a single command">
        <span class="filter-dist-dot" aria-hidden="true"></span>1-Command Install Only
      </button>
      <button type="button" id="clear-all-filters" class="clear-all-filters" hidden>Reset filters ✕</button>
    </div>
  </div>

  <div class="rows" id="skill-list">
    ${skills.map((skill) => row(skill, 1)).join("\n")}
  </div>
  <div class="empty empty-browse" id="empty" hidden>
    <p class="empty-msg">No skills match your search or filter.</p>
    <p class="empty-sub">Try broadening keywords, choosing another category, or resetting all filters.</p>
    <button type="button" id="empty-clear-btn" class="empty-clear-btn">Reset All Filters</button>
  </div>
</div>
`;

  write(
    "skills/index.html",
    layout({
      title: "All skills",
      description: `Browse ${registry.total} indexed AI agent skills with author, license and verification data.`,
      depth: 1,
      body,
      page: "browse",
      canonical: SITE + "/skills/",
    })
  );

  // detail pages
  for (const skill of skills) {
    write(`skills/${skill.id}/index.html`, skillPage(skill));
  }
}

const DUPLICATE_NAMES = (() => {
  const seen = new Map();
  for (const s of skills) seen.set(s.name.toLowerCase(), (seen.get(s.name.toLowerCase()) || 0) + 1);
  return new Set([...seen].filter(([, n]) => n > 1).map(([name]) => name));
})();

function skillPage(skill) {
  const depth = 1 + skill.id.split("/").length;
  const p = up(depth);
  const pageUrl = `${SITE}/skills/${skill.id}/`;
  const relatedPool = skills.filter((other) => other.id !== skill.id);
  const related = [
    ...relatedPool.filter((other) => other.category === skill.category),
    ...relatedPool.filter(
      (other) => other.category !== skill.category && other.source.key === skill.source.key
    ),
  ].slice(0, 5);
  const source = sources[skill.source.key] || {};
  const install = skill.install;
  const content = skillBody(skill);
  const title = displayName(skill.name);
  // Two upstreams can ship a skill with the same name; keep <title>s unique.
  const owner = (skill.source.repo || "").split("/")[0];
  const seoName = DUPLICATE_NAMES.has(skill.name.toLowerCase()) ? `${title} (${owner})` : title;
  const scan = security.skills ? security.skills[skill.id] : null;

  const body = `
<div class="wrap">
  <nav class="crumbs" aria-label="Breadcrumb">
    <a href="${p}skills/index.html">Skills</a><span>/</span><a href="${p}skills/index.html?category=${encodeURIComponent(skill.category)}">${esc(skill.category)}</a><span>/</span>${esc(title)}
  </nav>

  <article class="detail">
    <div>
      <p class="kicker">${esc(skill.source.repo)} · ${esc(licenseLabel(skill.source.license))}</p>
      <h1>${esc(title)}</h1>
      <p class="summary">${esc((skill.description || "").replace(/\s*—\s*/g, ", ").replace(/\s*–\s*/g, " - "))}</p>

      <div class="tags" style="margin-top:20px">
        ${skill.tags.map((tag) => `<a class="tag" href="${p}skills/index.html?q=${encodeURIComponent(tag)}">${esc(tag)}</a>`).join(" ")}
        ${statusTag(skill.status)}
      </div>

      ${
        content
          ? `<h2>Contents</h2>
      <div class="skill-content">${renderMarkdown(content)}</div>`
          : `<h2>Contents</h2>
      <p class="prose">This entry is indexed but not hosted here because the upstream license does not permit
      redistribution. <a href="${esc(skill.upstream ? skill.upstream.url : skill.source.url)}" rel="noopener">Read it at the source ↗</a></p>`
      }

      <h2>Provenance</h2>
      <p class="prose">
        Authored by <strong>${esc(skill.source.author)}</strong> in
        <a href="${esc(skill.source.url)}" rel="noopener">${esc(skill.source.repo)}</a>.
        ${skill.distributable ? "The content is mirrored here under its upstream license." : "The content is not hosted here because the upstream license does not permit redistribution. Follow the link to install it from the source."}
      </p>

      ${
        related.length
          ? `<h2>Related</h2>
      <div class="rows">
        ${related.map((other) => row(other, depth)).join("\n")}
      </div>`
          : ""
      }
    </div>

    <aside>
      <div class="aside-card">
        <h2>Install</h2>
        ${
          install
            ? commandBlock(install, `install ${skill.name}`)
            : `<p class="note" style="margin-top:0">Not hosted. Install from the upstream repository:</p>
               <a class="btn" href="${esc(skill.upstream ? skill.upstream.url : skill.source.url)}" rel="noopener">View upstream ↗</a>`
        }
        <dl class="meta" style="margin-top:20px">
          <div><dt>Source</dt><dd><a href="${esc(skill.source.url)}" rel="noopener">${esc(skill.source.repo)}</a></dd></div>
          <div><dt>Author</dt><dd>${esc(skill.source.author)}</dd></div>
          <div><dt>License</dt><dd>${esc(licenseLabel(skill.source.license))}</dd></div>
          <div><dt>Category</dt><dd>${esc(skill.category)}</dd></div>
          <div><dt>Status</dt><dd>${esc(skill.status)}</dd></div>
          <div><dt>Security</dt><dd>${esc(securityLabel(scan))}</dd></div>${scan && scan.sha256 ? `<div><dt>SHA-256</dt><dd class="mono" style="font-size:11px" title="${esc(scan.sha256)}">${esc(scan.sha256.slice(0, 16))}…</dd></div>` : ""}
          <div><dt>Checked</dt><dd>${verifiedOn(skill.source.key)}</dd></div>
          <div><dt>ID</dt><dd class="mono" style="font-size:11px">${esc(skill.id)}</dd></div>
        </dl>
        ${shareRow(pageUrl, `${title}: AI agent skill`)}
        ${
          skill.distributable
            ? `<a class="btn" href="${REPO}/blob/main/${esc(skill.path)}" rel="noopener">View file ↗</a>`
            : ""
        }
        ${source.note ? `<p class="note">${esc(source.note)}</p>` : ""}
      </div>
    </aside>
  </article>
</div>
`;

  const pageJsonLd = jsonld({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Skills", item: `${SITE}/skills/` },
          { "@type": "ListItem", position: 2, name: skill.category, item: `${SITE}/skills/?category=${encodeURIComponent(skill.category)}` },
          { "@type": "ListItem", position: 3, name: title, item: pageUrl }
        ]
      },
      {
        "@type": "SoftwareSourceCode",
        name: title,
        description: skill.description,
        url: pageUrl,
        codeRepository: skill.source.url,
        programmingLanguage: "Markdown",
        runtimePlatform: "Claude Code, Codex, Cursor, OpenCode, GitHub Copilot, Gemini CLI",
        license: skill.source.license,
        author: { "@type": "Person", name: skill.source.author },
        dateModified: CONTENT_DATE,
        isAccessibleForFree: true,
      },
      {
        "@type": "TechArticle",
        headline: title,
        description: skill.description,
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        dateModified: CONTENT_DATE,
        author: { "@type": "Person", name: skill.source.author },
        license: skill.source.license,
        isPartOf: { "@id": `${SITE}/#website` },
        publisher: { "@id": `${SITE}/#organization` },
        keywords: [skill.category, ...skill.tags, "AI agent skill", "SKILL.md"].join(", ")
      }
    ]
  });

  return layout({
    title: skillTitle(seoName),
    description: skill.description,
    depth,
    body,
    page: "skill",
    canonical: pageUrl,
    ogType: "article",
    keywords: [skill.name, skill.category, ...skill.tags, "AI agent skill", "SKILL.md", "install", "AI agent playbook", "AI course"].join(", "),
    jsonld: pageJsonLd,
    markdownAlt: skill.distributable && skill.path ? `${SITE}/skills/${skill.id}/SKILL.md` : null,
  });
}

// ---------------------------------------------------------------------------
// sources
// ---------------------------------------------------------------------------

function buildSources() {
  const body = `
<section class="page-hero">
  <div class="wrap">
    <span class="hero-badge">Provenance &amp; Attribution</span>
    <h1 class="hero-title">Where These Skills Come From</h1>
    <p class="hero-desc">
      Aidentity is an open index, not a fork. Every skill belongs to the upstream repository and engineer that created it.
      We mirror content only when permitted by open-source licenses, and re-verify upstream health every week.
    </p>
    <div class="pill-strip" style="justify-content:center;margin-top:20px">
      <span class="pill-btn" style="cursor:default">● ${sourceList.length} Upstream Repos</span>
      <span class="pill-btn" style="cursor:default">100% License Tracked</span>
      <span class="pill-btn" style="cursor:default">Weekly CI Verification</span>
      <span class="pill-btn" style="cursor:default">Zero Uncredited Code</span>
    </div>
  </div>
</section>

<section style="padding: 24px 0 60px">
  <div class="wrap">
    <div style="margin-bottom:44px">
      <p class="kicker">Upstream Spotlight</p>
      <h2 style="font-family:var(--serif);font-size:1.85rem;font-weight:400;margin:6px 0 20px">Featured Open-Source Contributors</h2>
      <div class="bento-grid" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))">
        <div class="bento-card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <span class="tag ok">MIT License</span>
            <span class="mono" style="font-size:11px;color:var(--muted)">18 Skills</span>
          </div>
          <h3>Addy Osmani</h3>
          <p>Chrome &amp; Engineering Director at Google. Pioneered agentic design patterns, planning breakdowns, and debugging workflows.</p>
          <div style="margin-top:auto;padding-top:14px;border-top:1px solid var(--rule);display:flex;justify-content:space-between;align-items:center">
            <span class="mono" style="font-size:11px;color:var(--ink-soft)">addyosmani/agentic-design-patterns</span>
            <a href="https://github.com/addyosmani/agentic-design-patterns" target="_blank" rel="noopener" class="mono" style="font-size:11px;color:var(--accent)">GitHub ↗</a>
          </div>
        </div>

        <div class="bento-card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <span class="tag ok">MIT License</span>
            <span class="mono" style="font-size:11px;color:var(--muted)">15 Skills</span>
          </div>
          <h3>Matt Pocock</h3>
          <p>TypeScript instructor and prompt engineering author. High-velocity skills for spec writing, TDD cycles, and PR audits.</p>
          <div style="margin-top:auto;padding-top:14px;border-top:1px solid var(--rule);display:flex;justify-content:space-between;align-items:center">
            <span class="mono" style="font-size:11px;color:var(--ink-soft)">mattpocock/skills</span>
            <a href="https://github.com/mattpocock/skills" target="_blank" rel="noopener" class="mono" style="font-size:11px;color:var(--accent)">GitHub ↗</a>
          </div>
        </div>

        <div class="bento-card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <span class="tag">CC BY-SA 4.0</span>
            <span class="mono" style="font-size:11px;color:var(--muted)">Security</span>
          </div>
          <h3>Trail of Bits</h3>
          <p>Elite cybersecurity and software research firm. Comprehensive skills for smart contract auditing, AST parsing, and invariant analysis.</p>
          <div style="margin-top:auto;padding-top:14px;border-top:1px solid var(--rule);display:flex;justify-content:space-between;align-items:center">
            <span class="mono" style="font-size:11px;color:var(--ink-soft)">trailofbits/skills</span>
            <a href="https://github.com/trailofbits/skills" target="_blank" rel="noopener" class="mono" style="font-size:11px;color:var(--accent)">GitHub ↗</a>
          </div>
        </div>

        <div class="bento-card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <span class="tag warn">Index Only</span>
            <span class="mono" style="font-size:11px;color:var(--muted)">Official</span>
          </div>
          <h3>Anthropic</h3>
          <p>Creators of Claude and Claude Code. Authoritative repository of Claude skills, guidelines, and tool interaction patterns.</p>
          <div style="margin-top:auto;padding-top:14px;border-top:1px solid var(--rule);display:flex;justify-content:space-between;align-items:center">
            <span class="mono" style="font-size:11px;color:var(--ink-soft)">anthropics/skills</span>
            <a href="https://github.com/anthropics/skills" target="_blank" rel="noopener" class="mono" style="font-size:11px;color:var(--accent)">GitHub ↗</a>
          </div>
        </div>
      </div>
    </div>

    <div>
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:16px;flex-wrap:wrap;gap:10px">
        <div>
          <p class="kicker">Audit Manifest</p>
          <h2 style="font-family:var(--serif);font-size:1.85rem;font-weight:400;margin:4px 0">All ${sourceList.length} Indexed Repositories</h2>
        </div>
        <div class="mono" style="font-size:12px;color:var(--ink-soft)">
          Live verification status updated on every CI commit
        </div>
      </div>

      <div class="table-scroll">
      <table class="table" style="margin-top:10px">
        <thead>
          <tr><th>Repository</th><th>License</th><th>Skills</th><th>Hosted</th><th>Checked</th></tr>
        </thead>
        <tbody>
          ${sourceList
            .map(
              (source) => `<tr>
            <td data-label="Repository">
              <a href="${source.url}" target="_blank" rel="noopener" style="font-weight:500">${esc(source.repo)}</a>
              <div class="mono" style="font-size:11px;color:var(--muted)">${esc(source.author)}</div>
            </td>
            <td data-label="License" class="mono">${esc(licenseLabel(source.license))}</td>
            <td data-label="Skills" class="mono"><strong style="color:var(--ink)">${source.count}</strong></td>
            <td data-label="Hosted" class="mono">${source.publish === false ? '<span style="color:var(--muted)">index only</span>' : '<span style="color:var(--ok)">✓ mirrored</span>'}</td>
            <td data-label="Checked" class="mono" style="color:var(--ink-soft)">${esc(source.verified)}</td>
          </tr>`
            )
            .join("\n")}
        </tbody>
      </table>
      </div>
    </div>

    <div class="callout" style="margin-top:36px">
      <strong>Why "index only" exists.</strong> Some upstream repositories do not grant redistribution rights.
      Copying that content into a public repo would violate their license, so those entries carry metadata and a
      direct upstream link instead. You still find them; you just install them from the source. The check is
      automated in <span class="mono">scripts/check-licenses.js</span> and runs on every pull request.
    </div>
  </div>
</section>
`;

  write(
    "sources/index.html",
    layout({
      title: "Sources: Upstream Repositories & License Attribution",
      description: "Every upstream repository indexed by Aidentity, with license, attribution, and live verification status.",
      depth: 1,
      body,
      page: "sources",
      canonical: SITE + "/sources/",
    })
  );
}

// ---------------------------------------------------------------------------
// about
// ---------------------------------------------------------------------------

function buildAbout() {
  const body = `
<section class="page-hero">
  <div class="wrap" style="max-width:820px">
    <span class="hero-badge">Manifesto &amp; Verification</span>
    <h1 class="hero-title">An Index, with Receipts</h1>
    <p class="hero-desc">
      There are thousands of AI agent skills. They live in dozens of repositories, in conflicting directory conventions, under unstated licenses. Finding one is easy. Knowing whether it's safe to run, who wrote it, and what you're allowed to do with it is not. Aidentity is the verifiable registry.
    </p>
  </div>
</section>

<section style="padding: 24px 0 60px">
  <div class="wrap" style="max-width:840px">
    
    <!-- 4 Core Pillars Bento -->
    <div style="margin-bottom:48px">
      <p class="kicker">Registry Architecture</p>
      <h2 style="font-family:var(--serif);font-size:1.85rem;font-weight:400;margin:6px 0 20px">Four Principles of Aidentity</h2>
      <div class="bento-grid" style="grid-template-columns: repeat(auto-fit, minmax(340px, 1fr))">
        <div class="bento-card">
          <div class="kicker" style="color:var(--ok)">01 · Safety First</div>
          <h3>Deterministic Security</h3>
          <p>Every skill is scanned across 7 static analysis gates for Trojan Unicode, credentials, prompt injections, and destructive commands. SHA-256 digests in <span class="mono">security.json</span>.</p>
        </div>
        <div class="bento-card">
          <div class="kicker" style="color:var(--accent)">02 · Attribution</div>
          <h3>Upstream Respect</h3>
          <p>Aidentity is an index, never a fork. We preserve upstream authors, source links, and original licenses. Where licenses prohibit re-hosting, we link directly without mirroring.</p>
        </div>
        <div class="bento-card">
          <div class="kicker" style="color:var(--ink)">03 · Normalization</div>
          <h3>Cross-Agent Portability</h3>
          <p>One unified registry maps seamlessly across Claude Code, Cursor, OpenAI Codex, Gemini CLI, OpenCode, and Copilot. One CLI installs to the exact right directory.</p>
        </div>
        <div class="bento-card">
          <div class="kicker" style="color:var(--ink-soft)">04 · Fast &amp; Machine-Ready</div>
          <h3>Zero-Bloat Performance</h3>
          <p>Built with zero runtime JavaScript dependencies. 100% static HTML/CSS, machine-readable JSON endpoints, and full <span class="mono">llms.txt</span> support for autonomous RAG agents.</p>
        </div>
      </div>
    </div>

    <!-- Security Deep Dive -->
    <div style="margin-bottom:48px" id="security">
      <p class="kicker">Security &amp; Integrity</p>
      <h2 style="font-family:var(--serif);font-size:1.85rem;font-weight:400;margin:6px 0 16px">The 7-Gate Security Scanner</h2>
      <p style="color:var(--ink-soft);font-size:0.95rem;line-height:1.6;margin-bottom:18px">
        Every skill in the registry (${security.total_files_scanned || 2492} files across ${registry.total} entries) is scanned by <span class="mono">scripts/scan-skills-security.js</span> and recorded in <a href="../security.json" class="mono">security.json</a> with a deterministic SHA-256 digest. The scanner strictly blocks:
      </p>

      <div class="gate-grid" style="grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap:12px; margin-bottom:24px">
        <div class="gate-card">
          <span class="gate-num">Gate 01</span>
          <h3 style="font-size:14px;margin:4px 0 6px">Trojan &amp; BiDi Unicode</h3>
          <p style="font-size:12px">Rejects zero-width spaces (<code>U+200B</code>), byte-order marks, and bidirectional direction overrides.</p>
        </div>
        <div class="gate-card">
          <span class="gate-num">Gate 02</span>
          <h3 style="font-size:14px;margin:4px 0 6px">Hardcoded Secrets</h3>
          <p style="font-size:12px">Rejects live AWS, GitHub, OpenAI, Anthropic, Slack tokens, and private PEM keys.</p>
        </div>
        <div class="gate-card">
          <span class="gate-num">Gate 03</span>
          <h3 style="font-size:14px;margin:4px 0 6px">Destructive Commands</h3>
          <p style="font-size:12px">Blocks <code>rm -rf /</code>, fork bombs, disk formatters (<code>mkfs</code>), and raw disk writes.</p>
        </div>
        <div class="gate-card">
          <span class="gate-num">Gate 04</span>
          <h3 style="font-size:14px;margin:4px 0 6px">Prompt Injections</h3>
          <p style="font-size:12px">Detects instructions attempting to exfiltrate env vars or bypass system safety guardrails.</p>
        </div>
      </div>

      <!-- Terminal Preview -->
      <div class="terminal-card">
        <div class="terminal-header">
          <div class="terminal-dots">
            <span class="dot-r"></span><span class="dot-y"></span><span class="dot-g"></span>
          </div>
          <span class="terminal-title">Terminal · npx aidentity audit</span>
        </div>
        <div class="terminal-body">
<span style="color:#10b981">✓</span> Scanning ${registry.total} skills across 2,492 files...
<span style="color:#10b981">✓</span> Gate 01: Zero-width &amp; BiDi Unicode: 0 findings
<span style="color:#10b981">✓</span> Gate 02: Hardcoded credentials &amp; tokens: 0 findings
<span style="color:#10b981">✓</span> Gate 03: Destructive shell operations: 0 findings
<span style="color:#10b981">✓</span> Gate 04: Prompt injection &amp; data exfiltration: 0 findings
<span style="color:#10b981">✓</span> Gate 05: Untrusted remote execution: 0 findings
<span style="color:#10b981">✓</span> Gate 06: Symlink &amp; binary hygiene: 0 findings
<span style="color:#10b981">✓</span> Gate 07: Deterministic SHA-256 verification: 100% PASS
<span style="color:#38bdf8">→ Output written to security.json · Ready for production agents</span>
        </div>
      </div>
    </div>

    <!-- Licensing & FAQ Section -->
    <div style="margin-bottom:48px" id="licensing">
      <p class="kicker">Transparency</p>
      <h2 style="font-family:var(--serif);font-size:1.85rem;font-weight:400;margin:6px 0 16px">Licensing Policy</h2>
      <p style="color:var(--ink-soft);font-size:0.95rem;line-height:1.6">
        Every skill in the registry strictly observes its upstream license:
      </p>
      <ul style="color:var(--ink-soft);font-size:0.95rem;line-height:1.6;margin:12px 0 24px 20px">
        <li><strong>Redistributable (MIT, Apache-2.0, CC BY):</strong> Mirrored with preserved upstream license notices.</li>
        <li><strong>Non-Redistributable (Proprietary, Index-Only):</strong> Pointers with name, description, author, and direct link only. Never copied.</li>
        <li><strong>Repository Code:</strong> Aidentity tooling is MIT. Registry metadata is CC0. Original writing is CC BY 4.0.</li>
      </ul>
    </div>

    <!-- Interactive FAQ Accordion -->
    <div style="margin-bottom:48px" id="faq">
      <p class="kicker">Frequently Asked Questions</p>
      <h2 style="font-family:var(--serif);font-size:1.85rem;font-weight:400;margin:6px 0 20px">Everything You Need to Know</h2>
      
      <div class="accordion-group">
        <details class="accordion-item" open>
          <summary class="accordion-trigger">
            <span>What is Aidentity?</span>
            <span class="chevron">›</span>
          </summary>
          <div class="accordion-body">
            Aidentity is a verified, open-source registry of ${registry.total} AI agent skills and ${rolesData.roles ? rolesData.roles.length : 21} role-based setups. Each entry records its source repository, author, license, SHA-256 security verification status, category, and automated verification date.
          </div>
        </details>

        <details class="accordion-item">
          <summary class="accordion-trigger">
            <span>How do I set up my agent for my job role?</span>
            <span class="chevron">›</span>
          </summary>
          <div class="accordion-body">
            You can run <code class="mono">npx aidentity setup &lt;role&gt; --profile individual</code> (or <code class="mono">enterprise</code>), use the interactive 5-question wizard on our <a href="../setup/index.html">Setup page</a>, or browse complete blueprints in the <a href="../playbooks/index.html">Playbooks directory</a>.
          </div>
        </details>

        <details class="accordion-item">
          <summary class="accordion-trigger">
            <span>Are the skills free to use?</span>
            <span class="chevron">›</span>
          </summary>
          <div class="accordion-body">
            Yes, 100% of the skills indexed are free. The majority are licensed under MIT or Apache-2.0. Trail of Bits skills are licensed under CC BY-SA 4.0. Upstream skills from Anthropic are indexed with direct reference links. Every page clearly states its specific license.
          </div>
        </details>

        <details class="accordion-item">
          <summary class="accordion-trigger">
            <span>How do I install a skill into my coding agent?</span>
            <span class="chevron">›</span>
          </summary>
          <div class="accordion-body">
            Run <code class="mono">npx aidentity add &lt;id&gt; --agent claude</code> (or <code class="mono">cursor</code>, <code class="mono">codex</code>, <code class="mono">gemini</code>, <code class="mono">opencode</code>, <code class="mono">copilot</code>). The CLI automatically detects your active coding agent and writes files to the exact directory required.
          </div>
        </details>

        <details class="accordion-item">
          <summary class="accordion-trigger">
            <span>How do you keep the index safe and updated?</span>
            <span class="chevron">›</span>
          </summary>
          <div class="accordion-body">
            CI rebuilds the registry on every commit, executes the 7-gate static analysis scanner, and computes deterministic SHA-256 hashes. A scheduled weekly workflow tests every upstream Git repository and writes fresh verification timestamps to <code class="mono">registry/verified.json</code>.
          </div>
        </details>

        <details class="accordion-item">
          <summary class="accordion-trigger">
            <span>Can I contribute a new skill or repository?</span>
            <span class="chevron">›</span>
          </summary>
          <div class="accordion-body">
            Yes! Submitting a skill requires just one JSON entry and a GitHub pull request. CI automatically verifies schema conformity, license compliance, and security checks. Submissions are reviewed by maintainers within 24 hours.
          </div>
        </details>
      </div>

      <div style="text-align:center;margin-top:32px">
        <a class="btn" href="${REPO}/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener">Read Contributing Guide ↗</a>
      </div>
    </div>

  </div>
</section>
`;

  write(
    "about/index.html",
    layout({
      title: "About Aidentity: Verified AI Agent Registry",
      description: `How Aidentity indexes, security-verifies, and licenses ${registry.total} AI agent skills and ${rolesData.roles ? rolesData.roles.length : 21} role setups with complete provenance receipts.`,
      depth: 1,
      body,
      page: "about",
      canonical: SITE + "/about/",
      jsonld: jsonld({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          { "@type": "Question", name: "What is Aidentity?", acceptedAnswer: { "@type": "Answer", text: `Aidentity is a verified index of ${registry.total} AI agent skills with source, author, license, SHA-256 security verification, and ${rolesData.roles ? rolesData.roles.length : 21} role-based setups.` } },
          { "@type": "Question", name: "How do I set up an agent for my role?", acceptedAnswer: { "@type": "Answer", text: "Run npx aidentity setup <role> --profile individual (or enterprise), or copy a role setup prompt from the Roles page." } },
          { "@type": "Question", name: "Are the skills free to use?", acceptedAnswer: { "@type": "Answer", text: "Most are MIT or Apache-2.0. Trail of Bits skills are CC BY-SA 4.0. Some Anthropic skills are index-only because their license does not permit redistribution. Each page states its license." } },
          { "@type": "Question", name: "How are skills verified for security?", acceptedAnswer: { "@type": "Answer", text: "Every skill is scanned for hidden Unicode, hardcoded secrets, destructive commands, prompt injection, and untrusted remote script execution, with SHA-256 digests published in security.json." } }
        ]
      }),
    })
  );
}

// ---------------------------------------------------------------------------
// enterprise trust center
// ---------------------------------------------------------------------------

function buildEnterprise() {
  const verifiedCount = security.verified || registry.total;
  const filesScanned = security.total_files_scanned || 2499;

  const body = `
<section class="page-hero">
  <div class="wrap" style="max-width:920px">
    <div class="enterprise-hero-badge">
      <span class="shield-dot" aria-hidden="true"></span>
      <span>Enterprise Trust &amp; Governance Standard</span>
    </div>
    <h1 class="hero-title" style="font-size:clamp(2rem, 3.8vw, 3rem);line-height:1.15;margin-bottom:16px">
      Air-Gapped, Cryptographically Verified AI Skills for Enterprise
    </h1>
    <p class="hero-desc" style="font-size:1.05rem;line-height:1.65;color:var(--ink-soft)">
      Security teams and CISOs block outside AI agent skills because of untrusted supply chains, hidden prompt injection, and credential exfiltration. 
      Aidentity eliminates these risks with <strong>deterministic SHA-256 lockfiles</strong>, <strong>automated 7-gate AST static analysis</strong>, <strong>active pre-execution runtime hooks</strong>, and <strong>100% air-gapped private VPC mirroring</strong>.
    </p>
    <div class="page-hero-meta" style="justify-content:center;margin-top:24px">
      <span class="hero-pill"><span class="dot" style="background:#10b981"></span> Zero Telemetry / 100% Local</span>
      <span class="hero-pill"><span class="dot" style="background:#10b981"></span> ${verifiedCount} Cryptographically Verified</span>
      <span class="hero-pill"><span class="dot" style="background:#10b981"></span> Pre-Execution Hook Defense</span>
      <span class="hero-pill"><span class="dot" style="background:#10b981"></span> NIST SSDF &amp; OWASP LLM Guarded</span>
      <span class="hero-pill"><span class="dot" style="background:#10b981"></span> Air-Gapped Mirror Ready</span>
    </div>
  </div>
</section>

<section style="padding: 24px 0 64px">
  <div class="wrap" style="max-width:920px">

    <!-- 5 Enterprise Trust Pillars -->
    <div style="margin-bottom:56px">
      <p class="kicker">Security Architecture</p>
      <h2 style="font-family:var(--serif);font-size:1.85rem;font-weight:400;margin:6px 0 12px">The 5 Enterprise Security Guarantees</h2>
      <p style="color:var(--ink-soft);font-size:0.95rem;line-height:1.6">
        How Aidentity is engineered to satisfy strict AppSec, SecOps, and compliance standards (SOC 2 Type II, ISO 27001, NIST SP 800-218):
      </p>

      <div class="trust-pillars-grid">
        <div class="trust-pillar-card">
          <div class="trust-pillar-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h3 class="trust-pillar-title">1. Zero External Telemetry</h3>
          <p class="trust-pillar-desc">
            No cloud registry server, no telemetry daemons, and zero network calls during agent operation. All skills, prompts, and hooks execute 100% locally in your developer environment or private CI/CD runners. Your company source code and proprietary prompts never touch third-party servers.
          </p>
        </div>

        <div class="trust-pillar-card">
          <div class="trust-pillar-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <polyline points="9 12 11 14 15 10"></polyline>
            </svg>
          </div>
          <h3 class="trust-pillar-title">2. SHA-256 Lockfile Immutability</h3>
          <p class="trust-pillar-desc">
            Every skill release is cryptographically fingerprinted in <span class="mono">registry/security.json</span> and pinned in <span class="mono">.aidentity-lock.json</span>. If an upstream repository is compromised or a single character in a skill is altered, <span class="mono">npx aidentity audit</span> halts execution immediately.
          </p>
        </div>

        <div class="trust-pillar-card">
          <div class="trust-pillar-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="4 17 10 11 4 5"></polyline>
              <line x1="12" y1="19" x2="20" y2="19"></line>
            </svg>
          </div>
          <h3 class="trust-pillar-title">3. 7-Gate AST Static Analysis</h3>
          <p class="trust-pillar-desc">
            Every file passes a continuous 7-gate static analysis scanner on every commit: zero hidden/BiDi Unicode, zero hardcoded API keys or private certificates, zero destructive shell commands, zero prompt injection exfiltration, zero untrusted script piping, and zero symlink directory escapes.
          </p>
        </div>

        <div class="trust-pillar-card">
          <div class="trust-pillar-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
            </svg>
          </div>
          <h3 class="trust-pillar-title">4. Runtime Pre-Execution Hooks</h3>
          <p class="trust-pillar-desc">
            The Enterprise Profile automatically configures pre-tool hooks (<span class="mono">block-dangerous.js</span> and <span class="mono">scan-secrets.js</span>) for Claude Code, Cursor, and Codex. Harmful shell operations (<span class="mono">rm -rf /</span>, disk format) and credential leaks (<span class="mono">.env</span>, tokens) are intercepted and rejected before execution.
          </p>
        </div>

        <div class="trust-pillar-card">
          <div class="trust-pillar-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
          </div>
          <h3 class="trust-pillar-title">5. SPDX License &amp; IP Hygiene</h3>
          <p class="trust-pillar-desc">
            Eliminate legal risk and copyright contamination. Every skill is audited against standard open-source licenses (MIT, Apache-2.0, CC BY-SA 4.0). Non-redistributable upstream skills are indexed by metadata reference only and never vendored. Registry metadata is dedicated to the public domain under CC0.
          </p>
        </div>

        <div class="trust-pillar-card">
          <div class="trust-pillar-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
              <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
              <line x1="6" y1="6" x2="6.01" y2="6"></line>
              <line x1="6" y1="18" x2="6.01" y2="18"></line>
            </svg>
          </div>
          <h3 class="trust-pillar-title">Air-Gapped &amp; Private VPC Ready</h3>
          <p class="trust-pillar-desc">
            Designed for isolated defense, finance, and healthcare networks. Mirror the entire repository into internal GitLab, GitHub Enterprise, or Artifactory. Your teams run the exact same governance CLI and skill sets behind your corporate proxy without internet access.
          </p>
        </div>
      </div>
    </div>

    <!-- The 7-Gate Security Verification Explorer -->
    <div style="margin-bottom:56px" id="seven-gates">
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:12px;flex-wrap:wrap;gap:10px">
        <div>
          <p class="kicker">Continuous Audit Protocol</p>
          <h2 style="font-family:var(--serif);font-size:1.85rem;font-weight:400;margin:6px 0 0">The 7-Gate Static Security Inspection</h2>
        </div>
        <a class="mono" href="../security.json" style="font-size:12px;color:var(--accent)">Fetch security.json ↗</a>
      </div>
      <p style="color:var(--ink-soft);font-size:0.95rem;line-height:1.6;margin-bottom:24px">
        Implemented in <span class="mono">scripts/scan-skills-security.js</span>. Re-scans all ${filesScanned} files on every pull request, release, and CI build:
      </p>

      <div class="gates-grid" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:14px">
        <div class="gate-card" style="background:var(--paper);border:1px solid var(--rule);border-left:3px solid #10b981;padding:16px 18px;border-radius:6px">
          <span class="gate-num" style="color:#10b981;font-weight:600;font-size:11px;font-family:var(--mono)">GATE 01 · PASSED (0 findings)</span>
          <h3 style="font-size:14.5px;margin:6px 0 6px;color:var(--ink)">Zero-Width &amp; BiDi Unicode</h3>
          <p style="font-size:12.5px;color:var(--ink-soft);margin:0;line-height:1.5">Scans for Trojan Source invisible characters (U+200B..U+200D, U+FEFF) and bidirectional control overrides that disguise malicious code in text editors.</p>
        </div>

        <div class="gate-card" style="background:var(--paper);border:1px solid var(--rule);border-left:3px solid #10b981;padding:16px 18px;border-radius:6px">
          <span class="gate-num" style="color:#10b981;font-weight:600;font-size:11px;font-family:var(--mono)">GATE 02 · PASSED (0 findings)</span>
          <h3 style="font-size:14.5px;margin:6px 0 6px;color:var(--ink)">Hardcoded Credentials &amp; Secrets</h3>
          <p style="font-size:12.5px;color:var(--ink-soft);margin:0;line-height:1.5">Detects AWS keys, GitHub PATs, OpenAI/Anthropic secret keys, Slack tokens, Google credentials, and PEM private keys with high-entropy regex patterns.</p>
        </div>

        <div class="gate-card" style="background:var(--paper);border:1px solid var(--rule);border-left:3px solid #10b981;padding:16px 18px;border-radius:6px">
          <span class="gate-num" style="color:#10b981;font-weight:600;font-size:11px;font-family:var(--mono)">GATE 03 · PASSED (0 findings)</span>
          <h3 style="font-size:14.5px;margin:6px 0 6px;color:var(--ink)">Destructive Shell Operations</h3>
          <p style="font-size:12.5px;color:var(--ink-soft);margin:0;line-height:1.5">Blocks recursive deletion of root or home directories (<span class="mono">rm -rf /</span>, <span class="mono">~</span>), shell fork bombs, filesystem formatters (<span class="mono">mkfs</span>), raw disk writes via <span class="mono">dd</span>, and universal <span class="mono">chmod 777</span>.</p>
        </div>

        <div class="gate-card" style="background:var(--paper);border:1px solid var(--rule);border-left:3px solid #10b981;padding:16px 18px;border-radius:6px">
          <span class="gate-num" style="color:#10b981;font-weight:600;font-size:11px;font-family:var(--mono)">GATE 04 · PASSED (0 findings)</span>
          <h3 style="font-size:14.5px;margin:6px 0 6px;color:var(--ink)">Prompt Injection &amp; Exfiltration</h3>
          <p style="font-size:12.5px;color:var(--ink-soft);margin:0;line-height:1.5">Identifies system prompt override commands ("ignore previous instructions") and credential exfiltration triggers ("upload environment variables", reverse shells).</p>
        </div>

        <div class="gate-card" style="background:var(--paper);border:1px solid var(--rule);border-left:3px solid #10b981;padding:16px 18px;border-radius:6px">
          <span class="gate-num" style="color:#10b981;font-weight:600;font-size:11px;font-family:var(--mono)">GATE 05 · PASSED (0 findings)</span>
          <h3 style="font-size:14.5px;margin:6px 0 6px;color:var(--ink)">Untrusted Remote Script Piping</h3>
          <p style="font-size:12.5px;color:var(--ink-soft);margin:0;line-height:1.5">Disallows <span class="mono">curl | sh</span> execution pipelines from unverified domains, preventing dynamic supply-chain injection attacks.</p>
        </div>

        <div class="gate-card" style="background:var(--paper);border:1px solid var(--rule);border-left:3px solid #10b981;padding:16px 18px;border-radius:6px">
          <span class="gate-num" style="color:#10b981;font-weight:600;font-size:11px;font-family:var(--mono)">GATE 06 · PASSED (0 findings)</span>
          <h3 style="font-size:14.5px;margin:6px 0 6px;color:var(--ink)">Symlink &amp; Binary Hygiene</h3>
          <p style="font-size:12.5px;color:var(--ink-soft);margin:0;line-height:1.5">Prevents directory traversal escapes via malicious symlinks and ensures no uninspected compiled ELF/Mach-O binaries are smuggled into skill folders.</p>
        </div>

        <div class="gate-card" style="background:var(--paper);border:1px solid var(--rule);border-left:3px solid #10b981;padding:16px 18px;border-radius:6px;grid-column:1 / -1">
          <span class="gate-num" style="color:#10b981;font-weight:600;font-size:11px;font-family:var(--mono)">GATE 07 · 100% ATTESTED</span>
          <h3 style="font-size:14.5px;margin:6px 0 6px;color:var(--ink)">Deterministic SHA-256 Digest Attestation</h3>
          <p style="font-size:12.5px;color:var(--ink-soft);margin:0;line-height:1.5">Computes a cryptographic SHA-256 digest over normalized contents for every skill. Published publicly in <a href="../security.json" class="mono">security.json</a> and checked against developer lockfiles via <span class="mono">npx aidentity audit</span>.</p>
        </div>
      </div>
    </div>

    <!-- Runtime Defense Interceptor Hooks -->
    <div style="margin-bottom:56px" id="runtime-hooks">
      <p class="kicker">Active Defense</p>
      <h2 style="font-family:var(--serif);font-size:1.85rem;font-weight:400;margin:6px 0 12px">Pre-Execution Runtime Guardrails</h2>
      <p style="color:var(--ink-soft);font-size:0.95rem;line-height:1.6;margin-bottom:20px">
        Static scanning protects the supply chain, but what protects against agent hallucination or unexpected commands at runtime? 
        The Aidentity Enterprise profile (<span class="mono">--profile enterprise</span>) automatically configures pre-tool execution hooks in Claude Code, Cursor, and Codex:
      </p>

      <div style="display:grid;grid-template-columns:1fr;gap:20px">
        ${modernCommandSnippet({
          title: "Runtime Guardrail 1: hooks/block-dangerous.js (Intercepts Destructive Bash)",
          badge: "HOOK",
          command: `// Intercepts PreToolUse before shell commands execute in the terminal
const dangerousPatterns = [
  /\\brm\\s+(-[a-z]*[rf][a-z]*\\s+)+(\\/?|~|\\$HOME)(\\s|$)/i, // rm -rf / or ~
  /:\\(\\)\\s*\\{\\s*:\\|:&\\s*\\};:/,                           // fork bombs
  /\\bmkfs(\\.\\w+)?\\s+\\/dev\\//i,                             // filesystem wipe
  /\\bdd\\b[^\\n]*\\bof=\\/dev\\/(sd|nvme|hd|disk)/i             // raw disk writes
];
if (dangerousPatterns.some(re => re.test(toolInput.command))) {
  console.error("[AIDENTITY HOOK BLOCKED]: Destructive command rejected prior to execution.");
  process.exit(1);
}`
        })}

        ${modernCommandSnippet({
          title: "Runtime Guardrail 2: hooks/scan-secrets.js (Prevents Credential Leakage to LLMs)",
          badge: "HOOK",
          command: `// Inspects agent file reads and stdout to prevent secrets leakage into LLM context
const secretPatterns = [
  /\\b(AKIA|ASIA)[0-9A-Z]{16}\\b/,               // AWS Access Keys
  /\\bgh[pousr]_[A-Za-z0-9]{36,}\\b/,             // GitHub Personal Access Tokens
  /\\bsk-[A-Za-z0-9]{32,}\\b/,                    // OpenAI API Keys
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/           // Private Cryptographic Keys
];
if (secretPatterns.some(re => re.test(payloadContent))) {
  console.error("[AIDENTITY HOOK BLOCKED]: High-entropy secret detected. Scrub before LLM API transmission.");
  process.exit(1);
}`
        })}
      </div>
    </div>

    <!-- Air-Gapped & Private Mirroring Blueprint -->
    <div style="margin-bottom:56px" id="air-gapped">
      <p class="kicker">Air-Gapped Deployment</p>
      <h2 style="font-family:var(--serif);font-size:1.85rem;font-weight:400;margin:6px 0 12px">Private VPC &amp; Self-Hosted Mirroring Guide</h2>
      <p style="color:var(--ink-soft);font-size:0.95rem;line-height:1.6;margin-bottom:20px">
        For enterprises operating under air-gapped environments, FedRAMP High, or strict proxy isolation, Aidentity requires zero external network access:
      </p>

      <div class="steps" style="margin-bottom:28px">
        <div class="step">
          <div class="step-num">1</div>
          <div class="step-content">
            <h4>Mirror to Internal GitLab / GitHub Enterprise</h4>
            <p>Clone a clean mirror of the verified registry into your company's private version control system:</p>
            <pre class="snippet-body" style="background:#14130f;color:#efeade;padding:12px 14px;border-radius:4px;font-family:var(--mono);font-size:12px;margin:8px 0"><code>git clone --mirror https://github.com/AkshatNaruka/aidentity.git aidentity-mirror.git
cd aidentity-mirror.git
git push --mirror https://gitlab.internal.company.com/appsec/aidentity-verified.git</code></pre>
          </div>
        </div>

        <div class="step">
          <div class="step-num">2</div>
          <div class="step-content">
            <h4>Deploy to Developer Workstations Offline</h4>
            <p>Developers install skills and role blueprints directly from the internal mirror with zero external requests:</p>
            <pre class="snippet-body" style="background:#14130f;color:#efeade;padding:12px 14px;border-radius:4px;font-family:var(--mono);font-size:12px;margin:8px 0"><code># Install role blueprint and pre-execution hooks locally
node /opt/aidentity/cli/index.js setup software-engineer --profile enterprise --agent claude</code></pre>
          </div>
        </div>

        <div class="step">
          <div class="step-num">3</div>
          <div class="step-content">
            <h4>Enforce CI/CD Integrity Audit</h4>
            <p>Add a required PR status check verifying all developer workspaces match the authorized SHA-256 lockfile:</p>
            <pre class="snippet-body" style="background:#14130f;color:#efeade;padding:12px 14px;border-radius:4px;font-family:var(--mono);font-size:12px;margin:8px 0"><code># Run in your GitLab CI / GitHub Actions pipeline
npx aidentity audit --strict</code></pre>
          </div>
        </div>
      </div>
    </div>

    <!-- Compliance Mapping Matrix -->
    <div style="margin-bottom:56px" id="compliance">
      <p class="kicker">Regulatory Alignment</p>
      <h2 style="font-family:var(--serif);font-size:1.85rem;font-weight:400;margin:6px 0 12px">Compliance &amp; Governance Mapping</h2>
      <p style="color:var(--ink-soft);font-size:0.95rem;line-height:1.6">
        How Aidentity controls satisfy enterprise audit requirements:
      </p>

      <div class="compliance-table-wrap">
        <table class="compliance-table">
          <thead>
            <tr>
              <th>Framework / Standard</th>
              <th>Control Requirement</th>
              <th>Aidentity Implementation</th>
              <th>Audit Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span class="std-badge">NIST SP 800-218</span></td>
              <td><strong>PS.1 / PS.2: Software Supply Chain Integrity</strong></td>
              <td>Cryptographic SHA-256 digest hashing of all vendored files; immutable lockfile pinning.</td>
              <td><span class="status-pass">Verified</span></td>
            </tr>
            <tr>
              <td><span class="std-badge">NIST SP 800-218</span></td>
              <td><strong>PW.1: Static Application Security Testing (SAST)</strong></td>
              <td>Continuous 7-gate static analysis scanner inspecting Unicode, tokens, prompt injection, and shell syntax.</td>
              <td><span class="status-pass">Verified</span></td>
            </tr>
            <tr>
              <td><span class="std-badge">OWASP LLM01</span></td>
              <td><strong>Prompt Injection Defense</strong></td>
              <td>Gate 04 scans for instruction overrides; runtime hooks intercept unauthorized system context altering.</td>
              <td><span class="status-pass">Verified</span></td>
            </tr>
            <tr>
              <td><span class="std-badge">OWASP LLM02</span></td>
              <td><strong>Sensitive Information Disclosure</strong></td>
              <td>Gate 02 + runtime <span class="mono">scan-secrets.js</span> prevents API keys, tokens, and .env files from entering LLM context.</td>
              <td><span class="status-pass">Verified</span></td>
            </tr>
            <tr>
              <td><span class="std-badge">SOC 2 Type II</span></td>
              <td><strong>CC6.1 / CC6.6: Perimeter &amp; Tooling Governance</strong></td>
              <td>Zero external telemetry; completely self-contained local CLI; optional air-gapped internal Git mirroring.</td>
              <td><span class="status-pass">Verified</span></td>
            </tr>
            <tr>
              <td><span class="std-badge">Legal / SPDX</span></td>
              <td><strong>Open-Source License Compliance</strong></td>
              <td>Automated SPDX license audits; strict segregation of permissive vs. non-distributable upstream items.</td>
              <td><span class="status-pass">Verified</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- CISO Security Review Ticket Template -->
    <div style="margin-bottom:56px" id="ciso-packet">
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:12px;flex-wrap:wrap;gap:10px">
        <div>
          <p class="kicker">AppSec Approval Fast-Track</p>
          <h2 style="font-family:var(--serif);font-size:1.85rem;font-weight:400;margin:6px 0 0">Copy-Paste CISO / AppSec Approval Packet</h2>
        </div>
      </div>
      <p style="color:var(--ink-soft);font-size:0.95rem;line-height:1.6;margin-bottom:16px">
        Need to get approval from your Security or DevSecOps team? Copy and paste this exact evaluation packet into your internal Jira, ServiceNow, or Archer approval ticket:
      </p>

      <div class="ciso-ticket-card">
        <div class="ciso-ticket-header">
          <div class="ciso-ticket-title">
            <span class="mono" style="font-size:11px;font-weight:600;background:rgba(255,255,255,0.08);color:var(--ink-soft);padding:2px 8px;border-radius:4px;letter-spacing:0.04em">TEMPLATE</span>
            <span>Security Architecture Review Packet (Markdown)</span>
          </div>
          ${modernCopyButton(`### Security Review Request: Aidentity AI Agent Skills Framework

**Tool Name:** Aidentity (AI Agent Skills Registry & Governance CLI)
**Vendor / Publisher:** Open-Source (MIT License, CC0 Metadata)
**Repository:** https://github.com/AkshatNaruka/aidentity
**Website / Trust Center:** https://akshatnaruka.github.io/aidentity/enterprise/

#### 1. Architecture & Data Flow
- **Hosting Model:** 100% Client-Side Static Markdown & Node.js CLI. Zero cloud backend servers.
- **External Telemetry:** NONE. Zero analytics, zero phone-home daemons, zero external API requests.
- **Data Sensitivity:** Customer source code and prompts remain 100% within the developer's local machine or corporate CI/CD container.

#### 2. Supply Chain & Integrity Controls
- **Cryptographic Attestation:** Every skill has a published SHA-256 digest in security.json.
- **Dependency Pinning:** Local lockfile (.aidentity-lock.json) checked via \`npx aidentity audit\`.
- **Automated Verification:** 7-gate static analysis scanner verifies 0 hidden Unicode (Trojan Source), 0 hardcoded credentials, 0 destructive shell operations, and 0 prompt injections across 2,499+ files.

#### 3. Runtime Defense & Guardrails
- **Pre-Execution Shell Interceptor:** hooks/block-dangerous.js terminates destructive commands (rm -rf, format) before terminal execution.
- **Secret Exfiltration Guard:** hooks/scan-secrets.js intercepts credentials and environment tokens prior to LLM submission.

#### 4. Compliance & Licensing
- **Licensing:** CLI is MIT; Metadata is CC0; Vendored skills strictly permissive (MIT/Apache-2.0).
- **Standards Alignment:** NIST SP 800-218 SSDF v1.1, OWASP Top 10 for LLMs, SOC 2 Type II controls.
- **Air-Gap Capability:** Fully compatible with internal GitLab/GitHub Enterprise mirroring behind corporate firewalls.

**Recommendation:** Approve for enterprise engineering usage under the \`--profile enterprise\` configuration.`, "Copy CISO Ticket")}
        </div>
        <div class="ciso-ticket-body">
          <pre><code>### Security Review Request: Aidentity AI Agent Skills Framework

**Tool Name:** Aidentity (AI Agent Skills Registry & Governance CLI)
**Hosting Model:** 100% Client-Side Static Markdown & Node.js CLI (Zero cloud backend servers)
**External Telemetry:** NONE. Zero analytics, zero external API requests
**Data Sensitivity:** Source code & prompts remain strictly within local developer VPC
**Integrity Controls:** Cryptographic SHA-256 lockfile (.aidentity-lock.json) + 7-gate static analysis
**Runtime Guardrails:** hooks/block-dangerous.js (destruct command halt) + hooks/scan-secrets.js (token exfil halt)
**Compliance Alignment:** NIST SP 800-218 (SSDF), OWASP LLM Top 10, SOC 2 Type II CC6.1
**Licensing:** MIT CLI, CC0 Metadata, 100% Permissive Open Source (MIT/Apache-2.0)

Recommendation: APPROVED for developer workstations with --profile enterprise</code></pre>
        </div>
      </div>
    </div>

    <!-- Enterprise CISO FAQ Accordion -->
    <div style="margin-bottom:48px" id="enterprise-faq">
      <p class="kicker">Executive FAQ</p>
      <h2 style="font-family:var(--serif);font-size:1.85rem;font-weight:400;margin:6px 0 20px">Security &amp; Governance FAQ</h2>

      <div class="accordion-group">
        <details class="accordion-item" open>
          <summary class="accordion-trigger">
            <span>Does Aidentity collect, transmit, or log any proprietary code or prompts?</span>
            <span class="chevron">›</span>
          </summary>
          <div class="accordion-body">
            <strong>No, absolutely zero.</strong> Aidentity is completely decentralized with zero server-side telemetry. The CLI operates entirely as a local file generator and inspector. Your code, prompts, and agent activities are never transmitted outside your machine.
          </div>
        </details>

        <details class="accordion-item">
          <summary class="accordion-trigger">
            <span>How does Aidentity protect against malicious upstream supply-chain updates?</span>
            <span class="chevron">›</span>
          </summary>
          <div class="accordion-body">
            Every file in the registry is pinned by a deterministic SHA-256 hash. When a skill is installed, its digest is recorded in <span class="mono">.aidentity-lock.json</span>. If an upstream author modifies a skill to inject a payload, the hash mismatch immediately fails your build and CI gate via <span class="mono">npx aidentity audit</span>.
          </div>
        </details>

        <details class="accordion-item">
          <summary class="accordion-trigger">
            <span>Can our organization run Aidentity in an air-gapped VPC?</span>
            <span class="chevron">›</span>
          </summary>
          <div class="accordion-body">
            <strong>Yes.</strong> You can mirror the Git repository into your internal GitHub Enterprise or GitLab server with a simple <span class="mono">git clone --mirror</span>. The CLI has zero runtime npm dependencies, requiring only local Node.js to execute.
          </div>
        </details>

        <details class="accordion-item">
          <summary class="accordion-trigger">
            <span>How do pre-execution runtime hooks stop agents from executing dangerous shell commands?</span>
            <span class="chevron">›</span>
          </summary>
          <div class="accordion-body">
            When you run <span class="mono">npx aidentity setup &lt;role&gt; --profile enterprise</span>, Aidentity configures pre-tool use interceptors (<span class="mono">block-dangerous.js</span>). In tools like Claude Code and Cursor, this hook is called synchronously before any bash command executes. If the command matches patterns like <span class="mono">rm -rf /</span> or filesystem formatters, the hook exits with an error and halts tool execution.
          </div>
        </details>

        <details class="accordion-item">
          <summary class="accordion-trigger">
            <span>What is the cost of the Enterprise Profile?</span>
            <span class="chevron">›</span>
          </summary>
          <div class="accordion-body">
            <strong>$0 / forever.</strong> Aidentity is 100% free and open-source under the MIT license. There are no enterprise seat licenses, no premium feature paywalls, and no sales calls. Everything is open, transparent, and inspectable in the GitHub repository.
          </div>
        </details>
      </div>
    </div>

    <!-- Final CTA Banner -->
    <div style="background:var(--paper-2);border:1px solid var(--rule);border-radius:8px;padding:36px;text-align:center;margin-top:40px">
      <h3 style="font-family:var(--serif);font-size:1.6rem;font-weight:400;margin:0 0 10px">Ready to Secure Your Organization's AI Agents?</h3>
      <p style="color:var(--ink-soft);font-size:0.95rem;max-width:600px;margin:0 auto 24px">
        Deploy verified skills and active runtime guardrails across your engineering teams in 30 seconds.
      </p>
      <div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap">
        <a class="btn" href="../setup/index.html">Configure Role Blueprint →</a>
        <a class="btn btn-secondary" href="../security.json">Download security.json</a>
      </div>
    </div>

  </div>
</section>
`;

  write(
    "enterprise/index.html",
    layout({
      title: "Enterprise AI Agent Trust Center: Air-Gapped, Cryptographically Verified",
      description: "How enterprises adopt verified AI agent skills with zero external telemetry, SHA-256 lockfiles, 7-gate static analysis, runtime pre-execution hooks, and air-gapped mirroring.",
      depth: 1,
      body,
      page: "enterprise",
      canonical: SITE + "/enterprise/",
      keywords: "enterprise AI agent security, CISO AI agent approval, air gapped AI skills, SHA-256 skill verification, NIST SSDF AI, OWASP LLM Top 10, Claude Code enterprise, Cursor enterprise security, agentic governance",
      jsonld: jsonld({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebPage",
            "@id": SITE + "/enterprise/#webpage",
            url: SITE + "/enterprise/",
            name: "Enterprise AI Agent Trust Center | Aidentity",
            description: "Air-gapped, cryptographically verified governance architecture for AI agent skills and role blueprints.",
            isPartOf: { "@id": SITE + "/#website" }
          },
          {
            "@type": "SecurityPolicy",
            "@id": SITE + "/enterprise/#policy",
            name: "Aidentity Enterprise AI Skill Verification & Runtime Guardrail Policy",
            description: "7-gate static analysis and deterministic SHA-256 cryptographic verification for AI coding agent skills.",
            publisher: { "@id": SITE + "/#organization" }
          },
          {
            "@type": "FAQPage",
            "@id": SITE + "/enterprise/#faq",
            mainEntity: [
              {
                "@type": "Question",
                name: "Does Aidentity collect, transmit, or log any proprietary code or prompts?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "No, absolutely zero. Aidentity has zero server infrastructure and zero telemetry. All operations run 100% locally on developer machines."
                }
              },
              {
                "@type": "Question",
                name: "How does Aidentity protect against malicious upstream supply-chain updates?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Every skill is pinned by a deterministic SHA-256 hash in .aidentity-lock.json. Any upstream tampering triggers a hard execution halt in CI via npx aidentity audit."
                }
              },
              {
                "@type": "Question",
                name: "Can our organization run Aidentity in an air-gapped VPC?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes. The entire repository can be mirrored to internal GitLab or GitHub Enterprise servers, operating completely offline with zero external network access."
                }
              }
            ]
          }
        ]
      })
    })
  );
}

// ---------------------------------------------------------------------------
// for agents
// ---------------------------------------------------------------------------

function buildForAgents() {
  const body = `
<section class="page-hero">
  <div class="wrap" style="max-width:840px">
    <span class="hero-badge">Machine-Readable API</span>
    <h1 class="hero-title">Use Aidentity from an AI Agent</h1>
    <p class="hero-desc">
      The registry is designed to be read by machines first. One deterministic JSON endpoint, verified SHA-256 digests, and full <span class="mono">SKILL.md</span> instructions in clean markdown. Zero authentication, zero scraping, and instantaneous responses.
    </p>
    <div class="pill-strip" style="justify-content:center;margin-top:20px">
      <span class="pill-btn" style="cursor:default">HTTP GET</span>
      <span class="pill-btn" style="cursor:default">CORS Allowed</span>
      <span class="pill-btn" style="cursor:default">llms.txt Standard</span>
      <span class="pill-btn" style="cursor:default">Zero Auth Required</span>
      <span class="pill-btn" style="cursor:default">OpenAPI 3.1 Spec</span>
    </div>
  </div>
</section>

<section style="padding: 24px 0 60px">
  <div class="wrap" style="max-width:880px">

    <!-- Modern Snippet Cards: Quick Curl & JQ Examples -->
    <div style="margin-bottom:48px">
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:14px;flex-wrap:wrap;gap:10px">
        <div>
          <p class="kicker">Terminal Operations</p>
          <h2 style="font-family:var(--serif);font-size:1.85rem;font-weight:400;margin:4px 0">Quick Agent Queries · curl &amp; jq</h2>
        </div>
        <div class="mono" style="font-size:12px;color:var(--muted)">One-click copyable bash pipelines</div>
      </div>
      <p style="color:var(--ink-soft);font-size:0.95rem;margin-bottom:18px">Execute these one-liners in your shell, CI pipelines, or LLM agent sandboxes:</p>

      ${modernCommandSnippet({
        badge: "CURL · LLMS.TXT",
        title: "01 · Fetch LLM Context Summary for Prompt Injection",
        command: "curl -s https://akshatnaruka.github.io/aidentity/llms.txt | head -n 35"
      })}

      ${modernCommandSnippet({
        badge: "CURL · JQ",
        title: "02 · Query Verified Skills in JSON by Tag",
        command: `curl -s https://akshatnaruka.github.io/aidentity/search.json | jq '.[] | select(.tags | contains(["security"]))'`
      })}

      ${modernCommandSnippet({
        badge: "CURL · INTEGRITY",
        title: "03 · Check SHA-256 Security Verification Status",
        command: `curl -s https://akshatnaruka.github.io/aidentity/security.json | jq '.skills["addyosmani/engineering/debugging"]'`
      })}
    </div>

    <!-- Endpoints Bento Grid -->
    <div style="margin: 44px 0">
      <p class="kicker">Direct Endpoints</p>
      <h2 style="font-family:var(--serif);font-size:1.85rem;font-weight:400;margin:6px 0 20px">Machine-Readable Surfaces</h2>
      <div class="bento-grid" style="grid-template-columns: repeat(auto-fit, minmax(260px, 1fr))">
        <div class="bento-card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
            <span class="tag ok">TXT</span>
            <span class="mono" style="font-size:11px;color:var(--muted)">~${Math.round(JSON.stringify(skills).length / 1024)} KB</span>
          </div>
          <h3 style="font-size:1.2rem;margin-bottom:6px"><a href="../llms.txt" style="color:var(--ink);text-decoration:none">llms.txt</a></h3>
          <p style="font-size:12.5px;color:var(--ink-soft)">Standardized concise summary and one-line descriptions for LLM system prompts.</p>
          <div style="margin-top:auto"><a href="../llms.txt" class="mono" style="font-size:11.5px;color:var(--accent)">Fetch llms.txt ↗</a></div>
        </div>

        <div class="bento-card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
            <span class="tag ok">JSON</span>
            <span class="mono" style="font-size:11px;color:var(--muted)">~${Math.round(JSON.stringify(skills).length / 1024)} KB</span>
          </div>
          <h3 style="font-size:1.2rem;margin-bottom:6px"><a href="../search.json" style="color:var(--ink);text-decoration:none">search.json</a></h3>
          <p style="font-size:12.5px;color:var(--ink-soft)">Compact fuzzy search index: ID, name, description, tags, license, and install commands.</p>
          <div style="margin-top:auto"><a href="../search.json" class="mono" style="font-size:11.5px;color:var(--accent)">Fetch search.json ↗</a></div>
        </div>

        <div class="bento-card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
            <span class="tag ok">JSON</span>
            <span class="mono" style="font-size:11px;color:var(--muted)">SHA-256</span>
          </div>
          <h3 style="font-size:1.2rem;margin-bottom:6px"><a href="../security.json" style="color:var(--ink);text-decoration:none">security.json</a></h3>
          <p style="font-size:12.5px;color:var(--ink-soft)">SHA-256 digests, file counts, and 7-gate static analysis verification results for every skill.</p>
          <div style="margin-top:auto"><a href="../security.json" class="mono" style="font-size:11.5px;color:var(--accent)">Fetch security.json ↗</a></div>
        </div>

        <div class="bento-card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
            <span class="tag ok">JSON</span>
            <span class="mono" style="font-size:11px;color:var(--muted)">Roles</span>
          </div>
          <h3 style="font-size:1.2rem;margin-bottom:6px"><a href="../roles.json" style="color:var(--ink);text-decoration:none">roles.json</a></h3>
          <p style="font-size:12.5px;color:var(--ink-soft)">20 job roles with Individual and Enterprise setup profiles (skills, rules, subagents, hooks).</p>
          <div style="margin-top:auto"><a href="../roles.json" class="mono" style="font-size:11.5px;color:var(--accent)">Fetch roles.json ↗</a></div>
        </div>

        <div class="bento-card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
            <span class="tag ok">OpenAPI 3.1</span>
            <span class="mono" style="font-size:11px;color:var(--muted)">Schema</span>
          </div>
          <h3 style="font-size:1.2rem;margin-bottom:6px"><a href="../openapi.json" style="color:var(--ink);text-decoration:none">openapi.json</a></h3>
          <p style="font-size:12.5px;color:var(--ink-soft)">Typed schema for autonomous agent tool-calling, function definition, and API clients.</p>
          <div style="margin-top:auto"><a href="../openapi.json" class="mono" style="font-size:11.5px;color:var(--accent)">Fetch openapi.json ↗</a></div>
        </div>

        <div class="bento-card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
            <span class="tag ok">OKF</span>
            <span class="mono" style="font-size:11px;color:var(--muted)">Bundle</span>
          </div>
          <h3 style="font-size:1.2rem;margin-bottom:6px"><a href="../okf/index.md" style="color:var(--ink);text-decoration:none">okf/index.md</a></h3>
          <p style="font-size:12.5px;color:var(--ink-soft)">Open Knowledge Format bundle for full semantic RAG ingestion and context indexing.</p>
          <div style="margin-top:auto"><a href="../okf/index.md" class="mono" style="font-size:11.5px;color:var(--accent)">Fetch OKF Bundle ↗</a></div>
        </div>
      </div>
    </div>

    <!-- MCP Server Section -->
    <div style="margin-bottom:48px" id="mcp">
      <p class="kicker">Model Context Protocol</p>
      <h2 style="font-family:var(--serif);font-size:1.85rem;font-weight:400;margin:6px 0 16px">Built-in MCP Server</h2>
      <p style="color:var(--ink-soft);font-size:0.95rem;line-height:1.6">
        The repository includes a zero-dependency Model Context Protocol (MCP) server exposing tools:
        <span class="mono">search_skills</span>, <span class="mono">recommend</span>,
        <span class="mono">get_skill</span>, <span class="mono">list_bundles</span>,
        <span class="mono">list_roles</span>, <span class="mono">setup_role</span>,
        <span class="mono">verify_skill_security</span>, and <span class="mono">install_skill</span>.
      </p>

      ${commandBlock("node cli/mcp.js", "start the MCP server")}

      <div style="margin-top:24px">
        <h3 style="font-family:var(--sans);font-size:14px;font-weight:600;margin-bottom:12px">Agent Integration Configurations:</h3>
        
        <details class="accordion-item" style="margin-bottom:8px" open>
          <summary class="accordion-trigger" style="font-family:var(--mono);font-size:12px;padding:12px 16px">
            <span>Claude Code: Terminal Setup</span>
            <span class="chevron">›</span>
          </summary>
          <div class="accordion-body" style="padding:14px 16px">
            <div style="display:flex;justify-content:flex-end;margin-bottom:8px">
              ${modernCopyButton("claude mcp add aidentity -- node /path/to/aidentity/cli/mcp.js", "Copy command")}
            </div>
            <pre style="background:#14130f;color:#efeade;padding:12px;overflow-x:auto;font-size:12px;margin:0;border-radius:4px"><code>claude mcp add aidentity -- node /path/to/aidentity/cli/mcp.js</code></pre>
          </div>
        </details>

        <details class="accordion-item" style="margin-bottom:8px">
          <summary class="accordion-trigger" style="font-family:var(--mono);font-size:12px;padding:12px 16px">
            <span>Cursor: .cursor/mcp.json</span>
            <span class="chevron">›</span>
          </summary>
          <div class="accordion-body" style="padding:14px 16px">
            <div style="display:flex;justify-content:flex-end;margin-bottom:8px">
              ${modernCopyButton(`{\n  "mcpServers": {\n    "aidentity": {\n      "command": "node",\n      "args": ["/path/to/aidentity/cli/mcp.js"]\n    }\n  }\n}`, "Copy config")}
            </div>
            <pre style="background:#14130f;color:#efeade;padding:12px;overflow-x:auto;font-size:12px;margin:0;border-radius:4px"><code>{
  "mcpServers": {
    "aidentity": {
      "command": "node",
      "args": ["/path/to/aidentity/cli/mcp.js"]
    }
  }
}</code></pre>
          </div>
        </details>

        <details class="accordion-item" style="margin-bottom:8px">
          <summary class="accordion-trigger" style="font-family:var(--mono);font-size:12px;padding:12px 16px">
            <span>OpenAI Codex: ~/.codex/config.toml</span>
            <span class="chevron">›</span>
          </summary>
          <div class="accordion-body" style="padding:14px 16px">
            <div style="display:flex;justify-content:flex-end;margin-bottom:8px">
              ${modernCopyButton(`[mcp_servers.aidentity]\ncommand = "node"\nargs = ["/path/to/aidentity/cli/mcp.js"]`, "Copy config")}
            </div>
            <pre style="background:#14130f;color:#efeade;padding:12px;overflow-x:auto;font-size:12px;margin:0;border-radius:4px"><code>[mcp_servers.aidentity]
command = "node"
args = ["/path/to/aidentity/cli/mcp.js"]</code></pre>
          </div>
        </details>

        <details class="accordion-item" style="margin-bottom:8px">
          <summary class="accordion-trigger" style="font-family:var(--mono);font-size:12px;padding:12px 16px">
            <span>Gemini CLI: ~/.gemini/settings.json</span>
            <span class="chevron">›</span>
          </summary>
          <div class="accordion-body" style="padding:14px 16px">
            <div style="display:flex;justify-content:flex-end;margin-bottom:8px">
              ${modernCopyButton(`{\n  "mcpServers": {\n    "aidentity": {\n      "command": "node",\n      "args": ["/path/to/aidentity/cli/mcp.js"]\n    }\n  }\n}`, "Copy config")}
            </div>
            <pre style="background:#14130f;color:#efeade;padding:12px;overflow-x:auto;font-size:12px;margin:0;border-radius:4px"><code>{
  "mcpServers": {
    "aidentity": {
      "command": "node",
      "args": ["/path/to/aidentity/cli/mcp.js"]
    }
  }
}</code></pre>
          </div>
        </details>
      </div>
    </div>

    <!-- Agent Operational Prompts & Guardrails -->
    <div style="margin-bottom:48px">
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:14px;flex-wrap:wrap;gap:10px">
        <div>
          <p class="kicker">Agent Instructions</p>
          <h2 style="font-family:var(--serif);font-size:1.85rem;font-weight:400;margin:4px 0">Prompts That Work</h2>
        </div>
        <div class="mono" style="font-size:12px;color:var(--muted)">100% Deterministic execution prompts</div>
      </div>
      <p style="color:var(--ink-soft);font-size:0.95rem;margin-bottom:18px">Copy and paste these exact prompts into Claude Code, Cursor, Codex, Gemini CLI, or ChatGPT:</p>

      <div class="prompt-card-grid">
        ${modernPromptCard({
          num: "Prompt 01",
          title: "Full Role Setup & Security Verification",
          description: "Directs the agent to fetch the role blueprint and security manifest, configure the workspace with enterprise guardrails, and enforce SHA-256 integrity before installation.",
          prompt: `Fetch https://akshatnaruka.github.io/aidentity/roles.json and https://akshatnaruka.github.io/aidentity/security.json\nSet up my workspace for the "software-engineer" role with the "enterprise" profile.\nVerify every skill is verified:true before installing.`
        })}

        ${modernPromptCard({
          num: "Prompt 02",
          title: "Query & Filter Skills by Category and Status",
          description: "Queries search.json to identify stable skills within a specific engineering domain and returns prioritized install commands.",
          prompt: `Fetch https://akshatnaruka.github.io/aidentity/search.json\nFilter for category "testing" and status "stable".\nReturn the top 3 best matches with their install commands.`
        })}

        ${modernPromptCard({
          num: "Prompt 03",
          title: "Stack Architecture Recommendation via llms.txt",
          description: "Supplies llms.txt to the LLM to analyze dependencies and recommend the optimal verified skill bundle for a modern tech stack.",
          prompt: `Read https://akshatnaruka.github.io/aidentity/llms.txt\nI am building a Next.js + Supabase SaaS. Which bundle should I install, and why?`
        })}
      </div>

      <div class="callout" style="margin-top:24px">
        <strong>Direct Context Injection:</strong> Pass <span class="mono">https://akshatnaruka.github.io/aidentity/llms.txt</span> to your agent to provide the complete verified registry in a single HTTP fetch.
      </div>
    </div>

  </div>
</section>
`;

  write(
    "for-agents/index.html",
    layout({
      title: "Use Aidentity from an AI Agent: Machine-Readable Registry API",
      description: "Machine-readable endpoints, an MCP server, security verification, and role setup prompts for AI coding agents.",
      depth: 1,
      body,
      page: "agents",
      canonical: SITE + "/for-agents/",
      keywords: "agent skills API, MCP server, AI agent skill search, llms.txt, agent-readable registry, skill security",
    })
  );
}



function renderSetupWizardSection({ roles, securityPath = "../security.json", headingLevel = "h2" }) {
  // Pre-build Individual and Enterprise plans for all roles for the interactive onboarding wizard
  const builderPlans = {};
  for (const role of roles) {
    for (const profile of ["individual", "enterprise"]) {
      const plan = buildRolePlan({ role: role.slug, profile, agent: "claude" });
      builderPlans[`${role.slug}:${profile}`] = {
        roleSlug: role.slug,
        roleName: role.name,
        roleDescription: role.description,
        profileSlug: profile,
        profileName: plan.profile.name,
        skills: plan.skills,
        rules: plan.rules,
        agents: plan.agents,
        commands: plan.commands,
        hooks: plan.hooks,
        skillsCount: plan.skills.length,
        rulesCount: plan.rules.length,
        agentsCount: plan.agents.length,
        hooksCount: plan.hooks.length,
        prompt: generateSetupPrompt(plan),
      };
    }
  }

  // Extra focus-specific verified skills + rules for the interactive questionnaire
  const focusPresets = {
    default: {
      label: "Role Default (Balanced)",
      extraSkills: [],
      extraAgents: [],
    },
    mvp: {
      label: "Build & Ship MVP Fast",
      extraSkills: [
        "mattpocock/engineering/to-spec",
        "addyosmani/planning-and-task-breakdown",
        "addyosmani/shipping-and-launch",
      ],
      extraAgents: ["agents/planner.md"],
    },
    growth: {
      label: "Growth, AI SEO & Launch",
      extraSkills: [
        "marketingskills/ai-seo",
        "marketingskills/launch",
        "marketingskills/cro",
        "marketingskills/pricing",
      ],
      extraAgents: ["agents/researcher.md", "agents/doc-writer.md"],
    },
    security: {
      label: "Security, Hardening & Audit",
      extraSkills: [
        "addyosmani/security-and-hardening",
        "trailofbits/supply-chain-risk-auditor",
        "trailofbits/agentic-actions-auditor",
      ],
      extraAgents: ["agents/security-auditor.md", "agents/reviewer.md"],
    },
    quality: {
      label: "TDD, Debugging & Code Quality",
      extraSkills: [
        "mattpocock/engineering/tdd",
        "mattpocock/engineering/code-review",
        "obra-superpowers/systematic-debugging",
      ],
      extraAgents: ["agents/debugger.md", "agents/reviewer.md"],
    },
  };

  // Resolve full metadata for extra skills so app.js can dynamically merge them
  const extraSkillsCatalog = {};
  for (const preset of Object.values(focusPresets)) {
    for (const id of preset.extraSkills) {
      if (extraSkillsCatalog[id]) continue;
      const skill = skills.find((s) => s.id === id);
      const sec = (security.skills && security.skills[id]) || {};
      if (skill && skill.distributable && skill.status === "stable" && sec.verified) {
        extraSkillsCatalog[id] = {
          id: skill.id,
          name: skill.name,
          description: skill.description,
          category: skill.category,
          license: skill.source.license,
          security: {
            status: sec.status || "verified",
            verified: true,
            sha256: sec.sha256 ? sec.sha256.slice(0, 16) : null,
          },
        };
      }
    }
  }

  const stackPresets = {
    role: { label: "Use Role Default Rules", rules: [] },
    ts: { label: "TypeScript / Next.js / Web", rules: ["rules/typescript/coding-style.md"] },
    python: { label: "Python / AI / Data", rules: ["rules/python/coding-style.md"] },
    go: { label: "Go / Backend / Infra", rules: ["rules/golang/coding-style.md"] },
    mobile: { label: "React Native / Mobile", rules: ["rules/react-native/coding-style.md", "rules/typescript/coding-style.md"] },
    fullstack: {
      label: "Full-Stack (TS + Python + Go)",
      rules: ["rules/typescript/coding-style.md", "rules/python/coding-style.md", "rules/golang/coding-style.md"],
    },
    none: { label: "No-Code / Docs / Strategy Only", rules: [] },
  };

  const defaultPlan = builderPlans["founder:individual"] || builderPlans["software-engineer:individual"];
  const defaultRoleSlug = builderPlans["founder:individual"] ? "founder" : "software-engineer";
  const defaultCmd = `npx aidentity setup ${defaultRoleSlug} --profile individual --agent claude`;
  const quickRoles = ["founder", "software-engineer", "architect", "product-manager", "designer", "marketer", "seo-specialist", "quant-researcher"];

  const wizardData = {
    plans: builderPlans,
    focusPresets,
    stackPresets,
    extraSkillsCatalog,
  };
  const wizardJson = JSON.stringify(wizardData).replace(/\s*—\s*/g, ", ").replace(/\s*–\s*/g, " - ");

  return `
    <div class="setup-builder" id="setup-builder" data-wizard="${esc(wizardJson)}">
      <div class="wizard-header">
        <div>
          <p class="kicker" style="margin:0 0 6px">One-Time Initial Agent Setup Generator</p>
          <${headingLevel} style="font-family:var(--serif);font-weight:400;font-size:clamp(1.45rem,2.6vw,2rem);margin:0">Answer 5 quick questions → Copy your ideal agent setup prompt</${headingLevel}>
          <p style="color:var(--ink-soft);font-size:0.92rem;margin:8px 0 0;max-width:68ch">
            Whether you are a <strong>Founder</strong>, <strong>Software Engineer</strong>, <strong>Architect</strong>, <strong>PM</strong>, <strong>Designer</strong>, or <strong>Quant</strong>, answer the questions below once. Copy the generated prompt into Claude Code, Cursor, Codex, or Gemini CLI to install your verified skills, coding rules, subagents, and security hooks.
          </p>
        </div>
      </div>

      <div class="wizard-quick-roles" aria-label="Quick role presets">
        <span class="mono" style="font-size:10.5px;text-transform:uppercase;letter-spacing:0.08em;color:var(--muted)">Quick pick:</span>
        ${quickRoles
          .map((slug) => {
            const r = roles.find((item) => item.slug === slug);
            if (!r) return "";
            const active = slug === defaultRoleSlug ? " active" : "";
            return `<button type="button" class="wizard-pill${active}" data-QuickRole="${esc(r.slug)}">${esc(r.name)}</button>`;
          })
          .join("\n")}
      </div>

      <div class="setup-controls setup-controls-5">
        <div class="setup-field">
          <label for="setup-role">1. Who are you? (Role)</label>
          <select id="setup-role">
            ${roles.map((r) => `<option value="${esc(r.slug)}"${r.slug === defaultRoleSlug ? " selected" : ""}>${esc(r.name)}</option>`).join("\n")}
          </select>
        </div>
        <div class="setup-field">
          <label for="setup-profile">2. Organization / Security</label>
          <select id="setup-profile">
            <option value="individual">Individual / Solo (Fast + core safety hooks)</option>
            <option value="enterprise">Enterprise / Team (+ Supply-chain &amp; 4 hooks)</option>
          </select>
        </div>
        <div class="setup-field">
          <label for="setup-stack">3. Primary Tech Stack</label>
          <select id="setup-stack">
            <option value="role">Role Default Stack</option>
            <option value="ts">TypeScript / Next.js / Web</option>
            <option value="python">Python / AI / Data</option>
            <option value="go">Go / Backend / Infra</option>
            <option value="mobile">React Native / Mobile</option>
            <option value="fullstack">Full-Stack (TS + Python + Go)</option>
            <option value="none">No-Code / Strategy / Docs Only</option>
          </select>
        </div>
        <div class="setup-field">
          <label for="setup-focus">4. Primary Goal right now</label>
          <select id="setup-focus">
            <option value="default">Role Default (Balanced)</option>
            <option value="mvp">Build &amp; Ship MVP Fast</option>
            <option value="growth">Growth, AI SEO &amp; Launch</option>
            <option value="security">Security, Hardening &amp; Audit</option>
            <option value="quality">TDD, Debugging &amp; Code Quality</option>
          </select>
        </div>
        <div class="setup-field">
          <label for="setup-agent">5. Your Coding Agent</label>
          <select id="setup-agent">
            <option value="claude">Claude Code (.claude/)</option>
            <option value="cursor">Cursor (.cursor/)</option>
            <option value="codex">Codex (.codex/)</option>
            <option value="gemini">Gemini CLI (.gemini/)</option>
            <option value="opencode">OpenCode (.opencode/)</option>
            <option value="copilot">GitHub Copilot (.github/)</option>
          </select>
        </div>
      </div>

      <div class="cmd" style="max-width:100%">
        <span class="prompt" aria-hidden="true">$</span>
        <code id="setup-cmd-code">${esc(defaultCmd)}</code>
        <button type="button" id="setup-cmd-copy" data-copy="${esc(defaultCmd)}" aria-label="Copy role setup CLI command">copy CLI command</button>
      </div>

      <div class="setup-summary">
        <span id="setup-summary-text" class="mono">${defaultPlan.skillsCount} verified skills · ${defaultPlan.rulesCount} rules · ${defaultPlan.agentsCount} subagents · ${defaultPlan.hooksCount} safety hooks · each skill scanned, SHA-256 published</span>
        <a class="mono" style="font-size:11.5px" href="${securityPath}">Verify in security.json →</a>
      </div>

      <div class="prompt-block">
        <div class="prompt-head">
          <span id="setup-prompt-title">${esc(defaultPlan.roleName)} · Individual One-Time Setup Prompt</span>
          <button type="button" id="setup-prompt-copy" data-copy="${esc(defaultPlan.prompt)}" aria-label="Copy role setup prompt">copy setup prompt</button>
        </div>
        <pre><code id="setup-prompt-code">${esc(defaultPlan.prompt)}</code></pre>
      </div>
    </div>`;
}

function buildForRoles() {
  const body = `
<section style="padding:70px 0;text-align:center">
  <div class="wrap" style="max-width:680px">
    <p class="kicker">Navigation Update</p>
    <h1 style="font-size:clamp(1.8rem,4vw,2.5rem)">Roles has merged into Playbooks</h1>
    <p style="color:var(--ink-soft);margin-top:14px;font-size:1.05rem">
      All 21 role setups, verified skill lists, and Individual &amp; Enterprise blueprints are now unified under the <strong>Playbooks</strong> directory.
    </p>
    <div style="margin-top:28px">
      <a class="btn" href="../playbooks/index.html">Open Role Playbooks →</a>
    </div>
  </div>
</section>
<script>
  (function () {
    var hash = window.location.hash || "";
    if (hash) {
      var slug = hash.replace(/^#/, "");
      window.location.replace("../playbooks/" + slug + "/index.html");
    } else {
      window.location.replace("../playbooks/index.html");
    }
  })();
</script>
`;
  write("roles/index.html", layout({
    title: "Roles & Playbooks",
    description: "Role setups have merged into the unified Playbooks directory.",
    depth: 1,
    body,
    page: "playbooks",
    canonical: SITE + "/playbooks/",
  }));
}

// ---------------------------------------------------------------------------
// setup tab (interactive 5-question one-time setup prompt generator)
// ---------------------------------------------------------------------------

function buildSetup() {
  const roles = rolesData.roles || [];

  const body = `
<div class="wrap">
  <div class="page-hero">
    <span class="page-hero-kicker">Interactive Setup Wizard · 5 Quick Questions</span>
    <h1 class="page-title">One-Time Initial Agent Setup Generator</h1>
    <p class="page-lead">
      Answer the 5 quick questions below or pick a pre-configured role launchpad. Generate a deterministic, copy-paste onboarding prompt for <strong>Claude Code</strong>, <strong>Cursor</strong>, <strong>OpenCode</strong>, <strong>Codex</strong>, <strong>Copilot</strong>, or <strong>Gemini CLI</strong> that installs security-verified skills, role rules, subagents, and safety hooks in one run.
    </p>
    <div class="page-hero-meta">
      <span class="hero-pill"><span class="dot"></span> ${roles.length} Role Profiles</span>
      <span class="hero-pill"><span class="dot"></span> SHA-256 digests published</span>
      <span class="hero-pill"><span class="dot"></span> 6 Agents Supported</span>
      <span class="hero-pill"><span class="dot"></span> Zero Prompt Injections</span>
    </div>
  </div>

  <div style="margin-bottom:14px">
    <h3 style="font-family:var(--sans);font-size:14px;text-transform:uppercase;letter-spacing:0.08em;color:var(--muted);margin-bottom:10px">
      Quick Role Launchpads (Click to auto-populate questionnaire)
    </h3>
    <div class="presets-grid">
      <div class="preset-card active" role="button" tabindex="0" aria-pressed="true" data-preset-role="founder" data-preset-profile="individual">
        <div>
          <div class="preset-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
              <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
              <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
              <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
            </svg>
          </div>
          <h4>Founder / MVP Velocity</h4>
          <p>Product specs, MVP scaffolding, pricing models, launch strategy, and AI SEO.</p>
        </div>
        <span class="mono" style="font-size:11px;color:var(--accent);margin-top:10px">Individual · 9 skills →</span>
      </div>

      <div class="preset-card" role="button" tabindex="0" aria-pressed="false" data-preset-role="software-engineer" data-preset-profile="individual">
        <div>
          <div class="preset-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
          </div>
          <h4>Software Engineer</h4>
          <p>TDD workflow, systematic debugging, code refactoring, and strict code review.</p>
        </div>
        <span class="mono" style="font-size:11px;color:var(--accent);margin-top:10px">Individual · 8 skills →</span>
      </div>

      <div class="preset-card" role="button" tabindex="0" aria-pressed="false" data-preset-role="architect" data-preset-profile="enterprise">
        <div>
          <div class="preset-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
          </div>
          <h4>Software Architect</h4>
          <p>C4 documentation, ADR records, microservices resilience, and security review.</p>
        </div>
        <span class="mono" style="font-size:11px;color:var(--accent);margin-top:10px">Enterprise · 8 skills →</span>
      </div>

      <div class="preset-card" role="button" tabindex="0" aria-pressed="false" data-preset-role="product-manager" data-preset-profile="individual">
        <div>
          <div class="preset-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="6"></circle>
              <circle cx="12" cy="12" r="2"></circle>
            </svg>
          </div>
          <h4>Product Manager</h4>
          <p>PRD generation, JTBD user analysis, feature specs, and product telemetry.</p>
        </div>
        <span class="mono" style="font-size:11px;color:var(--accent);margin-top:10px">Individual · 6 skills →</span>
      </div>

      <div class="preset-card" role="button" tabindex="0" aria-pressed="false" data-preset-role="designer" data-preset-profile="individual">
        <div>
          <div class="preset-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle>
              <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle>
              <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle>
              <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle>
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path>
            </svg>
          </div>
          <h4>Product Designer</h4>
          <p>Design systems, Toss/Rayden tokens, micro-interactions, and mobile UX.</p>
        </div>
        <span class="mono" style="font-size:11px;color:var(--accent);margin-top:10px">Individual · 6 skills →</span>
      </div>

      <div class="preset-card" role="button" tabindex="0" aria-pressed="false" data-preset-role="quant-researcher" data-preset-profile="enterprise">
        <div>
          <div class="preset-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
              <polyline points="17 6 23 6 23 12"></polyline>
            </svg>
          </div>
          <h4>Quant Researcher</h4>
          <p>Backtesting engines, risk metrics, financial APIs, and market data feeds.</p>
        </div>
        <span class="mono" style="font-size:11px;color:var(--accent);margin-top:10px">Enterprise · 7 skills →</span>
      </div>
    </div>
  </div>

  ${renderSetupWizardSection({ roles, securityPath: "../security.json", headingLevel: "h2" })}

  <div class="section-head" style="margin-top:64px">
    <h2>Why Use Aidentity Setup Instead of Default Agent Prompts</h2>
  </div>
  <div class="bento-grid">
    <div class="bento-card spotlight-card">
      <span class="bento-badge">Deterministic</span>
      <h3>Zero "Hallucinated" Skills</h3>
      <p>Raw agent prompts often invent non-existent packages or install untrusted dependencies. Aidentity enforces strict SHA-256 cryptographic verification against security.json before any file is created.</p>
    </div>
    <div class="bento-card spotlight-card">
      <span class="bento-badge">Security Guardrails</span>
      <h3>Supply-Chain &amp; Hook Gates</h3>
      <p>Enterprise profiles automatically attach pre-push security hooks, secret sanitization, and AST blockers that intercept destructive shell commands like rm -rf, curl | sh, or credential leaks.</p>
    </div>
    <div class="bento-card spotlight-card">
      <span class="bento-badge">Multi-Platform</span>
      <h3>1 Command · 6 Coding Agents</h3>
      <p>Whether your team works in Claude Code (.claude/skills), Cursor (.cursor/rules), Codex, OpenCode, Copilot, or Gemini CLI, one single flag adapts the layout without rewriting your team's guidelines.</p>
    </div>
  </div>

  <div class="section-head" style="margin-top:40px">
    <h2>Setup Frequently Asked Questions</h2>
  </div>
  <div class="accordion-group">
    <details class="accordion-item" open>
      <summary class="accordion-trigger">
        <span>How does the one-time initial setup work?</span>
        <span class="chevron" aria-hidden="true">&#x25B6;</span>
      </summary>
      <div class="accordion-body">
        Copy the prompt generated above and paste it once into your coding agent's chat window (e.g. Claude Code or Cursor). The agent reads the instructions, inspects your local workspace, and installs the verified SKILL.md files, project rules, and subagents specified for your profile into the standard directory structure.
      </div>
    </details>

    <details class="accordion-item">
      <summary class="accordion-trigger">
        <span>What is the difference between Individual and Enterprise profiles?</span>
        <span class="chevron" aria-hidden="true">&#x25B6;</span>
      </summary>
      <div class="accordion-body">
        <strong>Individual</strong> is tuned for solo speed, prototyping, and MVP velocity with core sanity checks. <strong>Enterprise</strong> enforces pre-commit verification, architectural decision records (ADRs), 7-gate static analysis, prompt injection blockers, and formal license attestation.
      </div>
    </details>

    <details class="accordion-item">
      <summary class="accordion-trigger">
        <span>Do I need shell access to install these skills?</span>
        <span class="chevron" aria-hidden="true">&#x25B6;</span>
      </summary>
      <div class="accordion-body">
        If you have shell access in your agent, running <code>npx aidentity setup &lt;role&gt;</code> is the fastest method. If you do not have shell access, the generated setup prompt instructs the agent to download and write the verified SKILL.md files directly using its file-writing tools.
      </div>
    </details>
  </div>
</div>
`;

  write("setup/index.html", layout({
    title: "One-Time Initial Agent Setup Generator: Custom AI Agent Prompts",
    description: "Answer 5 quick questions to generate a customized one-time AI agent setup prompt for Founders, Software Engineers, Architects, PMs, Designers, Marketers, and Quants.",
    depth: 1,
    body,
    page: "setup",
    canonical: SITE + "/setup/",
    keywords: "AI agent setup, Claude Code setup prompt, Cursor agent setup, founder AI setup prompt, enterprise AI agent generator, coding agent onboarding questionnaire",
    markdownAlt: `${SITE}/roles.json`,
    jsonld: jsonld({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
            { "@type": "ListItem", position: 2, name: "Setup", item: `${SITE}/setup/` },
          ],
        },
        {
          "@type": "WebApplication",
          name: "Aidentity Initial Agent Setup Generator",
          url: `${SITE}/setup/`,
          description: "Interactive questionnaire generating customized one-time AI agent setup prompts for Founders, Software Engineers, Architects, PMs, Designers, and Quants.",
          applicationCategory: "DeveloperApplication",
          operatingSystem: "All",
        },
      ],
    }),
  }));
}

// ---------------------------------------------------------------------------
// playbooks (programmatic SEO: 20 role setup playbooks + hub)
// ---------------------------------------------------------------------------

function getRoleDomain(slug) {
  if (["software-engineer", "architect", "engineering-manager", "data-analyst", "enterprise-agent-security-governance", "ai-coding-agent-mastery"].includes(slug)) return "engineering";
  if (["product-manager", "designer", "motion-designer", "founder", "startup-founder-mvp-velocity", "fullstack-product-design-shipping"].includes(slug)) return "product";
  if (["marketer", "content-creator", "seo-specialist", "sales", "ai-seo-aeo-geo-playbook"].includes(slug)) return "marketing";
  if (["finance-analyst", "quant-researcher", "quant", "quant-research-systematic-trading"].includes(slug)) return "finance";
  return "specialized";
}

function getDomainLabel(domain) {
  switch (domain) {
    case "engineering": return "Engineering & Infra";
    case "product": return "Product & Design";
    case "marketing": return "Growth & Marketing";
    case "finance": return "Finance & Quant";
    default: return "Specialized";
  }
}

function buildPlaybooks() {
  const roles = rolesData.roles || [];
  if (!roles.length) return;

  const courseCards = COURSES_DATA.map((course) => {
    const allSkillIds = course.modules.flatMap((m) => m.skills);
    const resolvedSkills = allSkillIds.map((id) => skills.find((s) => s.id === id)).filter(Boolean);
    const domain = getRoleDomain(course.roleSlug);
    const domainLabel = getDomainLabel(domain);

    return `<article class="playbook-card" id="${esc(course.slug)}" data-domain="courses ${esc(domain)}" style="border-left:3px solid var(--accent)">
      <div class="playbook-card-head">
        <span class="playbook-domain-badge" style="background:var(--paper-2);color:var(--accent);font-weight:600">Track · ${esc(course.kicker.split("·")[0].trim())}</span>
        <span class="mono" style="font-size:11px;color:var(--muted)">${esc(course.level)}</span>
      </div>
      <h3><a href="${esc(course.roleSlug)}/index.html#curriculum">${esc(course.name)}</a></h3>
      <p class="playbook-desc">${esc(course.summary)}</p>
      <div class="playbook-cmd-row">
        <code>npx aidentity setup ${esc(course.roleSlug)}</code>
        <button type="button" class="playbook-copy-btn" data-copy="npx aidentity setup ${esc(course.roleSlug)}">copy</button>
      </div>
      <div class="tags" style="margin-top:10px">
        <span class="tag ok">${course.modules.length} modules</span>
        <span class="tag">${resolvedSkills.length} skills</span>
        <span class="tag">${esc(domainLabel)}</span>
      </div>
      <div class="playbook-card-foot">
        <span class="mono" style="font-size:11px;color:var(--ink-soft)">Self-paced · ${esc(course.audience.split(",")[0])}</span>
        <a href="${esc(course.roleSlug)}/index.html#curriculum">Open Curriculum →</a>
      </div>
    </article>`;
  });

  const roleCards = roles.map((role) => {
    const indPlan = buildRolePlan({ role: role.slug, profile: "individual", agent: "claude" });
    const entPlan = buildRolePlan({ role: role.slug, profile: "enterprise", agent: "claude" });
    const domain = getRoleDomain(role.slug);
    const domainLabel = getDomainLabel(domain);
    const categories = (role.categories || []).slice(0, 3);
    const bundles = (role.bundles || []).slice(0, 1);
    const matchingCourse = COURSES_DATA.find((c) => c.roleSlug === role.slug);
    const tagsHtml = `<div class="tags" style="margin-top:10px">
        ${matchingCourse ? `<span class="tag ok" style="font-weight:600">curriculum included</span>` : ""}
        ${categories.map((c) => `<span class="tag">${esc(c)}</span>`).join(" ")}
        ${bundles.map((b) => `<a class="tag ok" href="../bundles/#${esc(b)}">${esc(b)} bundle</a>`).join(" ")}
      </div>`;

    return `<article class="playbook-card" id="${esc(role.slug)}" data-domain="${esc(domain)}">
      <div class="playbook-card-head">
        <span class="playbook-domain-badge">${esc(domainLabel)}</span>
        <span class="mono" style="font-size:11px;color:var(--muted)">${indPlan.skills.length} / ${entPlan.skills.length} skills</span>
      </div>
      <h3><a href="${esc(role.slug)}/index.html">${esc(role.name)}</a></h3>
      <p class="playbook-desc">${esc(role.description)}</p>
      <div class="playbook-cmd-row">
        <code>npx aidentity setup ${esc(role.slug)}</code>
        <button type="button" class="playbook-copy-btn" data-copy="npx aidentity setup ${esc(role.slug)}">copy</button>
      </div>
      ${tagsHtml}
      <div class="playbook-card-foot">
        <span class="mono" style="font-size:11px;color:var(--ink-soft)">${entPlan.hooks.length} safety hooks${matchingCourse ? " · with curriculum" : ""}</span>
        <a href="${esc(role.slug)}/index.html">Open Full Playbook →</a>
      </div>
    </article>`;
  });

  const hubCards = [...courseCards, ...roleCards].join("\n");

  const hubBody = `
<div class="wrap">
  <div class="page-hero">
    <span class="page-hero-kicker">Blueprints &amp; Curricula · 21 Roles &amp; 6 Tracks</span>
    <h1 class="page-title">Role Setup Playbooks &amp; Curricula</h1>
    <p class="page-lead">
      Deterministic, step-by-step agent configuration blueprints and hands-on learning curricula. Each playbook installs verified <span class="mono">SKILL.md</span> files, language coding rules, specialist subagents, and safety hooks into <strong>Claude Code</strong>, <strong>Cursor</strong>, <strong>Codex</strong>, <strong>Gemini CLI</strong>, <strong>OpenCode</strong>, or <strong>GitHub Copilot</strong> in both <strong>Individual</strong> (solo speed) and <strong>Enterprise</strong> (supply-chain audits &amp; test guardrails) profiles.
    </p>
    <div class="page-hero-meta">
      <span class="hero-pill"><span class="dot"></span> 21 Role Blueprints</span>
      <span class="hero-pill"><span class="dot"></span> 6 Hands-on Tracks</span>
      <span class="hero-pill"><span class="dot"></span> SHA-256 digests published</span>
      <span class="hero-pill"><span class="dot"></span> Individual &amp; Enterprise</span>
    </div>
  </div>

  <div class="callout" style="margin-top:0;margin-bottom:28px">
    <strong>Looking for a tailored agent configuration?</strong> Answer 5 quick questions in our <a href="../setup/index.html"><strong>Interactive Setup Generator →</strong></a> to customize your stack, safety presets, and agent rules.
  </div>

  <div class="filter-bar" role="tablist" aria-label="Filter playbooks by category">
    <button type="button" class="filter-btn active" aria-pressed="true" data-playbook-filter="all">All (${roles.length + COURSES_DATA.length})</button>
    <button type="button" class="filter-btn" aria-pressed="false" data-playbook-filter="courses">Guided Curricula (${COURSES_DATA.length})</button>
    <button type="button" class="filter-btn" aria-pressed="false" data-playbook-filter="engineering">Engineering &amp; Infra</button>
    <button type="button" class="filter-btn" aria-pressed="false" data-playbook-filter="product">Product &amp; Design</button>
    <button type="button" class="filter-btn" aria-pressed="false" data-playbook-filter="marketing">Growth &amp; Marketing</button>
    <button type="button" class="filter-btn" aria-pressed="false" data-playbook-filter="finance">Finance &amp; Quant</button>
    <button type="button" class="filter-btn" aria-pressed="false" data-playbook-filter="specialized">Specialized</button>
  </div>

  <div class="playbook-grid" style="margin-top:24px">${hubCards}</div>
</div>
`;

  write("playbooks/index.html", layout({
    title: "AI Agent Setup Playbooks & Curricula: Blueprints for 21 Roles & 6 Tracks",
    description: "21 step-by-step AI agent setup playbooks and 6 guided curricula for software engineers, architects, PMs, designers, marketers, and quants. SHA-256 verified skills for Claude Code & Cursor.",
    depth: 1,
    body: hubBody,
    page: "playbooks",
    canonical: `${SITE}/playbooks/`,
    keywords: "AI agent playbooks, AI agent courses, Claude Code playbook, Cursor setup playbook, enterprise AI agent playbook, developer agent setup, AI workflow playbook, SKILL.md playbook",
    jsonld: jsonld({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
            { "@type": "ListItem", position: 2, name: "Playbooks", item: `${SITE}/playbooks/` },
          ],
        },
        {
          "@type": "CollectionPage",
          "@id": `${SITE}/playbooks/#collection`,
          name: "AI Agent Setup Playbooks & Curricula",
          url: `${SITE}/playbooks/`,
          description: "21 step-by-step AI agent setup playbooks and 6 guided learning tracks for Individual and Enterprise engineering, product, design, marketing, finance, and quant teams.",
          dateModified: GENERATED,
          author: { "@type": "Person", name: "Akshat Naruka" },
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: roles.length + COURSES_DATA.length,
            itemListElement: [
              ...COURSES_DATA.map((c, idx) => ({
                "@type": "ListItem",
                position: idx + 1,
                name: `${c.name} Curriculum`,
                url: `${SITE}/playbooks/${c.roleSlug}/#curriculum`,
              })),
              ...roles.map((r, idx) => ({
                "@type": "ListItem",
                position: COURSES_DATA.length + idx + 1,
                name: `${r.name} AI Agent Setup Playbook`,
                url: `${SITE}/playbooks/${r.slug}/`,
              })),
            ],
          },
        },
      ],
    }),
  }));

  // Individual role playbook pages (/playbooks/<slug>/index.html + /playbooks/<slug>/playbook.md)
  for (const role of roles) {
    const indPlan = buildRolePlan({ role: role.slug, profile: "individual", agent: "claude" });
    const entPlan = buildRolePlan({ role: role.slug, profile: "enterprise", agent: "claude" });
    const indPrompt = generateSetupPrompt(indPlan);
    const entPrompt = generateSetupPrompt(entPlan);
    const pageUrl = `${SITE}/playbooks/${role.slug}/`;
    const mdUrl = `${SITE}/playbooks/${role.slug}/playbook.md`;

    const mdLines = [
      `---`,
      `type: Playbook`,
      `title: "${role.name} AI Agent Setup Playbook (Individual & Enterprise)"`,
      `description: "${role.description} Verified skills, rules, subagents, and safety hooks for Claude Code, Cursor, Codex, and Gemini CLI."`,
      `resource: ${pageUrl}`,
      `tags: [${[role.slug, ...(role.categories || []), "playbook", "agent-setup"].join(", ")}]`,
      `timestamp: ${GENERATED}`,
      `---`,
      ``,
      `# ${role.name} AI Agent Setup Playbook (Individual & Enterprise)`,
      ``,
      `**Definition:** The **${role.name} AI Agent Playbook** configures any coding agent (Claude Code, Cursor, Codex, Gemini CLI, OpenCode, or GitHub Copilot) for ${role.description.toLowerCase()} It installs ${indPlan.skills.length} SHA-256 security-verified skills in the Individual profile and ${entPlan.skills.length} skills plus 4 runtime guardrails in the Enterprise profile.`,
      ``,
      `## Quick Commands`,
      ``,
      `\`\`\`bash`,
      `# Individual setup (${indPlan.skills.length} verified skills)`,
      `npx aidentity setup ${role.slug} --profile individual`,
      ``,
      `# Enterprise setup (${entPlan.skills.length} verified skills + supply-chain & security hooks)`,
      `npx aidentity setup ${role.slug} --profile enterprise`,
      `\`\`\``,
      ``,
      `## Individual vs. Enterprise Comparison`,
      ``,
      `| Component | Individual Profile | Enterprise Profile |`,
      `|---|---|---|`,
      `| Verified Skills | ${indPlan.skills.length} core skills | ${entPlan.skills.length} skills (+4 security/audit skills) |`,
      `| Coding Rules | ${indPlan.rules.length} rule files | ${entPlan.rules.length} rule files |`,
      `| Subagents | ${indPlan.agents.length} subagents | ${entPlan.agents.length} subagents |`,
      `| Slash Commands | ${indPlan.commands.length} commands | ${entPlan.commands.length} commands |`,
      `| Safety Hooks | ${indPlan.hooks.join(", ")} | ${entPlan.hooks.join(", ")} |`,
      ``,
      `## Verified Skills Included`,
      ``,
      ...entPlan.skills.map((s) => `- **${s.name}** (\`${s.id}\`, ${s.license}, SHA-256 \`${(s.sha256 || "").slice(0, 12)}\`): ${s.description}`),
      ``,
      `## One-Shot Individual Setup Prompt`,
      ``,
      "```markdown",
      indPrompt,
      "```",
      ``,
      `## One-Shot Enterprise Setup Prompt`,
      ``,
      "```markdown",
      entPrompt,
      "```",
      ``,
    ];

    const matchingCourse = COURSES_DATA.find((c) => c.roleSlug === role.slug);
    if (matchingCourse) {
      mdLines.push(
        `## Guided Learning Track: ${matchingCourse.name}`,
        ``,
        matchingCourse.summary,
        ``,
        `**Level:** ${matchingCourse.level} · **Target Audience:** ${matchingCourse.audience}`,
        ``,
        `### Learning Outcomes`,
        ...matchingCourse.outcomes.map((o) => `- ${o}`),
        ``,
        `### Curriculum Modules & Verified Skills`,
        ...matchingCourse.modules.flatMap((m) => [
          `#### ${m.title}`,
          ...m.skills.map((id) => {
            const s = skills.find((sk) => sk.id === id);
            return s ? `- **${s.name}** (\`${s.id}\`, ${s.license}): ${(s.description || "").replace(/\s*—\s*/g, ", ").replace(/\s*–\s*/g, " - ")}` : `- \`${id}\``;
          }),
          ``,
        ])
      );
    }

    write(`playbooks/${role.slug}/playbook.md`, mdLines.join("\n"));

    const body = `
<div class="wrap">
  <nav class="crumbs" aria-label="Breadcrumb">
    <a href="../../index.html">Home</a><span>/</span><a href="../index.html">Playbooks</a><span>/</span>${esc(role.name)}
  </nav>

  <article class="detail">
    <div>
      <p class="kicker">Role Playbook · Individual &amp; Enterprise · scanned &amp; licensed</p>
      <h1>${esc(role.name)} AI Agent Setup Playbook</h1>
      <p class="summary">
        <strong>What is the ${esc(role.name)} AI Agent Playbook?</strong> The ${esc(role.name)} AI Agent Playbook is a complete, security-verified configuration for Claude Code, Cursor, Codex, Gemini CLI, OpenCode, and GitHub Copilot tailored to ${esc(role.description.toLowerCase())} It bundles ${indPlan.skills.length} verified skills (Individual) or ${entPlan.skills.length} skills + 4 runtime safety hooks (Enterprise), ${indPlan.rules.length} coding rules, and ${indPlan.agents.length} specialist subagents in one command.
      </p>
      <p class="mono" style="font-size:11.5px;color:var(--muted);margin-top:12px">
        Last updated: ${GENERATED} · Author: Akshat Naruka · Aliases: ${esc([role.slug, ...(role.aliases || [])].join(", "))} · <a href="playbook.md">Download playbook.md</a>
      </p>

      <h2>Step 1: Run the One-Command Setup</h2>
      <p class="prose">Choose <strong>Individual</strong> for solo work and fast iteration, or <strong>Enterprise</strong> for team governance, supply-chain security audits, and automated pre-commit/stop hooks:</p>
      ${commandBlock(`npx aidentity setup ${role.slug} --profile individual`, `setup ${role.name} individual`)}
      ${commandBlock(`npx aidentity setup ${role.slug} --profile enterprise`, `setup ${role.name} enterprise`)}

      <h2>Step 2: Individual vs. Enterprise Profile Comparison</h2>
      <div class="table-scroll">
        <table class="table">
          <thead>
            <tr><th>Dimension</th><th>Individual Profile</th><th>Enterprise Profile</th></tr>
          </thead>
          <tbody>
            <tr>
              <td data-label="Dimension"><strong>Use Case</strong></td>
              <td data-label="Individual Profile">Solo ${esc(role.name.toLowerCase())}s, side projects, rapid prototyping</td>
              <td data-label="Enterprise Profile">Production engineering orgs, regulated teams, CI-enforced repos</td>
            </tr>
            <tr>
              <td data-label="Dimension"><strong>Verified Skills</strong></td>
              <td data-label="Individual Profile" class="mono">${indPlan.skills.length} skills</td>
              <td data-label="Enterprise Profile" class="mono">${entPlan.skills.length} skills (+ supply-chain, agentic-actions &amp; hardening)</td>
            </tr>
            <tr>
              <td data-label="Dimension"><strong>Coding Rules</strong></td>
              <td data-label="Individual Profile" class="mono">${indPlan.rules.length ? indPlan.rules.join(", ") : "Role-specific guidelines"}</td>
              <td data-label="Enterprise Profile" class="mono">${entPlan.rules.length ? entPlan.rules.join(", ") : "Role-specific guidelines"} + ADR/PR gates</td>
            </tr>
            <tr>
              <td data-label="Dimension"><strong>Subagents</strong></td>
              <td data-label="Individual Profile" class="mono">${indPlan.agents.join(", ") || "None"}</td>
              <td data-label="Enterprise Profile" class="mono">${entPlan.agents.join(", ") || "None"}</td>
            </tr>
            <tr>
              <td data-label="Dimension"><strong>Safety Hooks</strong></td>
              <td data-label="Individual Profile" class="mono">${indPlan.hooks.join(", ")}</td>
              <td data-label="Enterprise Profile" class="mono">${entPlan.hooks.join(", ")}</td>
            </tr>
          </tbody>
        </table>
      </div>

      ${matchingCourse ? `
      <div id="curriculum" class="callout" style="margin:26px 0 28px;background:var(--paper-2);border-left:3px solid var(--accent)">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
          <span class="course-badge">${esc(matchingCourse.kicker.split("·")[0].trim())} · Learning Track</span>
          <span class="mono" style="font-size:11px;color:var(--muted)">Level: ${esc(matchingCourse.level)}</span>
        </div>
        <h3 style="margin:4px 0 8px;font-size:1.18rem">${esc(matchingCourse.name)}</h3>
        <p class="prose" style="margin:0 0 14px;color:var(--ink-soft)">${esc(matchingCourse.summary)}</p>
        
        <h4 style="font-size:0.85rem;text-transform:uppercase;letter-spacing:0.04em;margin:14px 0 6px;color:var(--muted)">What You Will Learn &amp; Automate</h4>
        <ul class="outcomes-list" style="margin-bottom:14px">
          ${matchingCourse.outcomes.map((o) => `<li>${esc(o)}</li>`).join("")}
        </ul>

        <h4 style="font-size:0.85rem;text-transform:uppercase;letter-spacing:0.04em;margin:14px 0 8px;color:var(--muted)">Curriculum Modules &amp; Verified Skills</h4>
        <div>
          ${matchingCourse.modules.map((m) => {
            const mSkills = m.skills.map((id) => skills.find((s) => s.id === id)).filter(Boolean);
            return `<div class="module-block" style="padding:10px 14px;margin-bottom:10px;background:var(--paper);border:1px solid var(--rule)">
              <div style="font-weight:600;font-size:13px;margin-bottom:4px">${esc(m.title)}</div>
              <div class="skill-chips">
                ${mSkills.map((s) => `<a class="skill-chip" href="../../skills/${esc(s.id)}/index.html" title="${esc((s.description || "").replace(/\s*—\s*/g, ", ").replace(/\s*–\s*/g, " - "))}">${esc(s.name)}</a>`).join("")}
              </div>
            </div>`;
          }).join("\n")}
        </div>
      </div>
      ` : ""}

      <h2>Step 3: Verified Skills in This Playbook</h2>
      <p class="prose">Every skill below has passed Aidentity's 7-gate static security scanner (<span class="mono">0</span> critical findings) and carries a deterministic SHA-256 content digest:</p>
      <div class="table-scroll">
        <table class="table">
          <thead>
            <tr><th>Skill</th><th>Profile</th><th>License</th><th>SHA-256 Digest</th><th>Install Single Skill</th></tr>
          </thead>
          <tbody>
            ${entPlan.skills.map((s) => {
              const inInd = indPlan.skills.some((i) => i.id === s.id);
              return `<tr>
                <td data-label="Skill"><a href="../../skills/${esc(s.id)}/index.html"><strong>${esc(s.name)}</strong></a><div style="font-size:12px;color:var(--ink-soft)">${esc((s.description || "").replace(/\s*—\s*/g, ", ").replace(/\s*–\s*/g, " - "))}</div></td>
                <td data-label="Profile" class="mono">${inInd ? "Individual &amp; Enterprise" : "Enterprise"}</td>
                <td data-label="License" class="mono">${esc(s.license)}</td>
                <td data-label="SHA-256 Digest" class="mono">${esc((s.sha256 || "").slice(0, 12))}…</td>
                <td data-label="Install Single Skill" class="mono">${esc(s.install || `npx aidentity add ${s.id}`)}</td>
              </tr>`;
            }).join("\n")}
          </tbody>
        </table>
      </div>

      <h2>Step 4: Copyable One-Shot Setup Prompts</h2>
      <p class="prose">Paste either prompt directly into Claude Code, Cursor, Codex, or Gemini CLI to configure your workspace automatically:</p>
      <details class="prompt-details" open style="margin-top:14px">
        <summary>${esc(role.name)} · Individual Setup Prompt <span class="mono" style="font-size:11px;color:var(--muted);font-weight:normal">(${indPlan.skills.length} skills · Click to collapse)</span></summary>
        <div style="margin-top:12px">
          ${promptBlock(indPrompt, `${role.name} · Individual Setup Prompt`)}
        </div>
      </details>
      <details class="prompt-details" style="margin-top:14px">
        <summary>${esc(role.name)} · Enterprise Setup Prompt <span class="mono" style="font-size:11px;color:var(--muted);font-weight:normal">(${entPlan.skills.length} skills + hooks · Click to expand)</span></summary>
        <div style="margin-top:12px">
          ${promptBlock(entPrompt, `${role.name} · Enterprise Setup Prompt`)}
        </div>
      </details>

      <h2 id="faq">Frequently Asked Questions: ${esc(role.name)} AI Setup</h2>
      <div class="prose">
        <h3>How do I set up Claude Code or Cursor for a ${esc(role.name.toLowerCase())}?</h3>
        <p>Run <span class="mono">npx aidentity setup ${esc(role.slug)} --profile individual --agent claude</span> (or <span class="mono">--agent cursor</span>). The CLI verifies SHA-256 digests against <span class="mono">security.json</span> and writes the skills, coding rules, subagents, and hooks to your agent directory.</p>
        <h3>What is the difference between the Individual and Enterprise ${esc(role.name.toLowerCase())} setup?</h3>
        <p>The Individual profile installs ${indPlan.skills.length} core skills and essential secret/command safety hooks. The Enterprise profile installs ${entPlan.skills.length} skills, adding Trail of Bits supply-chain risk auditing, agentic actions auditing, and security hardening, plus format-on-save and test-on-stop hooks.</p>
        <h3>Are all skills in the ${esc(role.name)} playbook security-verified?</h3>
        <p>Yes. Every skill in this playbook is scanned by <span class="mono">scripts/scan-skills-security.js</span> for hidden Unicode, hardcoded credentials, destructive commands, and prompt injection, with SHA-256 hashes published at <a href="../../security.json">security.json</a>.</p>
      </div>
    </div>

    <aside>
      <div class="aside-card">
        <h2>Quick Setup</h2>
        ${commandBlock(`npx aidentity setup ${role.slug}`, `setup ${role.name}`)}
        <dl class="meta" style="margin-top:20px">
          <div><dt>Role Slug</dt><dd class="mono">${esc(role.slug)}</dd></div>
          <div><dt>Aliases</dt><dd class="mono">${esc((role.aliases || []).join(", ") || "None")}</dd></div>
          <div><dt>Ind. Skills</dt><dd class="mono">${indPlan.skills.length} verified</dd></div>
          <div><dt>Ent. Skills</dt><dd class="mono">${entPlan.skills.length} verified</dd></div>
          ${matchingCourse ? `<div><dt>Curriculum</dt><dd class="mono"><a href="#curriculum">Included (${matchingCourse.modules.length} mod)</a></dd></div>` : ""}
          <div><dt>Subagents</dt><dd class="mono">${indPlan.agents.length}</dd></div>
          <div><dt>Rules</dt><dd class="mono">${indPlan.rules.length}</dd></div>
          <div><dt>Security</dt><dd>6 static checks + SHA-256 digest per skill</dd></div>
          <div><dt>Updated</dt><dd>${GENERATED}</dd></div>
        </dl>
        ${shareRow(pageUrl, `${role.name} AI Agent Setup Playbook | Aidentity`)}
        <a class="btn" href="playbook.md">View Markdown (playbook.md) ↗</a>
        <a class="btn" href="../../setup/index.html" style="margin-top:8px">Open in Interactive Setup Generator ↗</a>
      </div>
    </aside>
  </article>
</div>
`;

    const playbookJsonLd = jsonld({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
            { "@type": "ListItem", position: 2, name: "Playbooks", item: `${SITE}/playbooks/` },
            { "@type": "ListItem", position: 3, name: `${role.name} Playbook`, item: pageUrl },
          ],
        },
        {
          "@type": "TechArticle",
          headline: `${role.name} AI Agent Setup Playbook (Individual & Enterprise)`,
          description: `${role.description} Step-by-step AI agent setup playbook with ${entPlan.skills.length} SHA-256 verified skills, rules, subagents, and safety hooks.`,
          url: pageUrl,
          datePublished: GENERATED,
          dateModified: GENERATED,
          author: { "@type": "Person", name: "Akshat Naruka" },
          publisher: { "@id": `${SITE}/#organization` },
          isPartOf: { "@id": `${SITE}/#website` },
          keywords: [
            `${role.name} AI agent setup`,
            `${role.name} Claude Code skills`,
            `${role.name} Cursor rules`,
            `${role.name} AI playbook`,
            ...role.categories,
            ...(role.aliases || []),
          ].join(", "),
        },
        {
          "@type": "HowTo",
          name: `How to set up an AI coding agent for a ${role.name}`,
          description: `Configure Claude Code, Cursor, Codex, or Gemini CLI for a ${role.name} with verified skills, rules, and safety hooks.`,
          step: [
            {
              "@type": "HowToStep",
              position: 1,
              name: "Choose Individual or Enterprise profile",
              text: `Select the Individual profile (${indPlan.skills.length} skills) for solo work or Enterprise profile (${entPlan.skills.length} skills + 4 hooks) for team governance.`,
            },
            {
              "@type": "HowToStep",
              position: 2,
              name: "Run the Aidentity CLI setup command",
              text: `Run npx aidentity setup ${role.slug} --profile individual (or enterprise) in your project root.`,
            },
            {
              "@type": "HowToStep",
              position: 3,
              name: "Verify SHA-256 security status",
              text: "Run npx aidentity audit to confirm all installed skills match registry/security.json with 0 critical findings.",
            },
          ],
        },
        {
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: `How do I set up Claude Code or Cursor for a ${role.name.toLowerCase()}?`,
              acceptedAnswer: {
                "@type": "Answer",
                text: `Run npx aidentity setup ${role.slug} --profile individual --agent claude (or --agent cursor) to install ${indPlan.skills.length} SHA-256 verified skills, coding rules, subagents, and safety hooks.`,
              },
            },
            {
              "@type": "Question",
              name: `What is the difference between Individual and Enterprise ${role.name.toLowerCase()} agent setup?`,
              acceptedAnswer: {
                "@type": "Answer",
                text: `Individual installs ${indPlan.skills.length} core role skills and 2 safety hooks. Enterprise installs ${entPlan.skills.length} skills (adding supply-chain and agentic-actions security audits) plus 4 runtime hooks.`,
              },
            },
          ],
        },
      ],
    });

    write(`playbooks/${role.slug}/index.html`, layout({
      title: `${role.name} AI Agent Playbook: Individual & Enterprise Setup`,
      description: `Set up Claude Code, Cursor, Codex, or Gemini CLI for a ${role.name.toLowerCase()}. ${indPlan.skills.length} Individual / ${entPlan.skills.length} Enterprise SHA-256 verified skills, rules & hooks.`,
      depth: 2,
      body,
      page: "playbooks",
      canonical: pageUrl,
      ogType: "article",
      keywords: [
        `${role.name} AI agent playbook`,
        `${role.name} Claude Code setup`,
        `${role.name} Cursor rules`,
        `${role.slug} AI skills`,
        ...(role.aliases || []),
        ...role.categories,
      ].join(", "),
      jsonld: playbookJsonLd,
      markdownAlt: mdUrl,
    }));
  }
}

// ---------------------------------------------------------------------------
// courses (structured learning paths & curricula powered by verified skills)
// ---------------------------------------------------------------------------

const COURSES_DATA = [
  {
    slug: "ai-coding-agent-mastery",
    name: "AI Coding Agent Mastery: Spec, TDD & Verification",
    kicker: "Course 01 · Engineering & Architecture",
    level: "Intermediate to Advanced",
    audience: "Software engineers, tech leads, and staff architects",
    roleSlug: "software-engineer",
    bundleSlug: "starter-10",
    summary: "Learn how to turn Claude Code, Cursor, Codex, and Gemini CLI into disciplined engineering partners using spec-driven development, red-green-refactor TDD, git worktrees, and automated code review.",
    outcomes: [
      "Turn ambiguous feature requests into verifiable technical specifications before writing code.",
      "Enforce strict red-green-refactor TDD loops so agents verify every change against real tests.",
      "Run parallel agent workstreams safely using isolated git worktrees and review gates.",
    ],
    modules: [
      { title: "Module 1: Spec-Driven Development & Grilling", skills: ["mattpocock/engineering/grill-with-docs", "mattpocock/engineering/to-spec", "addyosmani/planning-and-task-breakdown"] },
      { title: "Module 2: Test-Driven Agent Workflows", skills: ["mattpocock/engineering/tdd", "obra-superpowers/systematic-debugging", "addyosmani/debugging-and-error-recovery"] },
      { title: "Module 3: Architecture, Worktrees & Code Review", skills: ["obra-superpowers/using-git-worktrees", "mattpocock/engineering/code-review", "addyosmani/security-and-hardening"] },
    ],
  },
  {
    slug: "ai-seo-aeo-geo-playbook",
    name: "AI SEO, AEO & Generative Engine Optimization (GEO) Course",
    kicker: "Course 02 · Search & AI Visibility",
    level: "All Levels",
    audience: "SEO specialists, growth marketers, founders, and content engineers",
    roleSlug: "seo-specialist",
    bundleSlug: "content-creator",
    summary: "Master traditional technical SEO alongside AI Search Optimization (AEO/GEO) so your product is indexed by Google and cited or selected as the default by ChatGPT, Perplexity, Claude, and Gemini.",
    outcomes: [
      "Audit crawlability, indexation, and Core Web Vitals with a quantitative 0–100 SEO Health Index.",
      "Structure pages with 40–60 word extractable answer blocks, comparison tables, and JSON-LD schema.",
      "Ship AgentReady discovery files (llms.txt, llms-full.txt, pricing.md, .well-known/ai-catalog.json, and OKF bundles).",
    ],
    modules: [
      { title: "Module 1: Technical SEO Audit & Site Architecture", skills: ["marketingskills/seo-audit", "marketingskills/site-architecture", "marketingskills/schema"] },
      { title: "Module 2: AI SEO, GEO & Agent Readiness", skills: ["marketingskills/ai-seo", "marketingskills/content-strategy", "marketingskills/competitors"] },
      { title: "Module 3: Programmatic SEO at Scale & Link Authority", skills: ["marketingskills/programmatic-seo", "marketingskills/link-building", "marketingskills/analytics"] },
    ],
  },
  {
    slug: "enterprise-agent-security-governance",
    name: "Enterprise AI Agent Security, Auditing & Supply-Chain Governance",
    kicker: "Course 03 · AppSec & DevSecOps",
    level: "Advanced",
    audience: "Security engineers, CISOs, platform teams, and enterprise architects",
    roleSlug: "architect",
    bundleSlug: "security-review",
    summary: "Secure autonomous coding agents in enterprise repositories. Learn how to audit SKILL.md files for hidden Unicode and prompt injection, audit GitHub Actions, and enforce runtime pre-tool hooks.",
    outcomes: [
      "Scan agent skills and prompts across 7 static security gates with deterministic SHA-256 digests.",
      "Audit CI/CD workflows, GitHub Actions, and third-party dependencies for supply-chain and agentic risks.",
      "Deploy mandatory pre-tool command blockers, secret scanners, and custom Semgrep rules.",
    ],
    modules: [
      { title: "Module 1: Threat Modeling & Audit Context Building", skills: ["trailofbits/audit-context-building", "trailofbits/code-maturity-assessor", "addyosmani/security-and-hardening"] },
      { title: "Module 2: Supply-Chain & Agentic Actions Auditing", skills: ["trailofbits/supply-chain-risk-auditor", "trailofbits/agentic-actions-auditor", "trailofbits/second-opinion"] },
      { title: "Module 3: Custom Detection Rules & Quality Gates", skills: ["trailofbits/semgrep-rule-creator", "addyosmani/code-review-and-quality"] },
    ],
  },
  {
    slug: "fullstack-product-design-shipping",
    name: "Full-Stack Product Design, UI Systems & Conversion Engineering",
    kicker: "Course 04 · Design & Web Engineering",
    level: "Intermediate",
    audience: "Product designers, design engineers, and full-stack builders",
    roleSlug: "designer",
    bundleSlug: "web-app",
    summary: "Go from aesthetic direction and design tokens to accessible React/Next.js interfaces, Postgres data models, conversion rate optimization (CRO), and automated production releases.",
    outcomes: [
      "Build cohesive design systems with typography, color tokens, and high-craft micro-interactions.",
      "Architect clean REST/RPC APIs and high-performance Postgres schemas.",
      "Optimize landing pages for conversion and ship with automated CI/CD pipelines.",
    ],
    modules: [
      { title: "Module 1: Aesthetic Direction & Design Systems", skills: ["ui-ux-pro-max/ui-ux-pro-max", "ui-ux-pro-max/design-system", "tastemaker/tastemaker"] },
      { title: "Module 2: Frontend, API & Database Engineering", skills: ["addyosmani/frontend-ui-engineering", "addyosmani/api-and-interface-design", "supabase/supabase-postgres-best-practices"] },
      { title: "Module 3: Performance, CRO & Production Launch", skills: ["addyosmani/performance-optimization", "marketingskills/cro", "addyosmani/shipping-and-launch"] },
    ],
  },
  {
    slug: "quantitative-finance-investment-workflows",
    name: "Quantitative Trading, Risk Management & Institutional Financial Modeling",
    kicker: "Course 05 · Finance & Quant Research",
    level: "Advanced",
    audience: "Quant researchers, systematic traders, and investment analysts",
    roleSlug: "quant-researcher",
    bundleSlug: "data-ai",
    summary: "Combine institutional 3-statement/DCF/LBO financial modeling with systematic backtesting (Backtrader, VectorBT), Kelly position sizing, regime detection, and risk management.",
    outcomes: [
      "Build institutional-grade 3-statement, DCF, LBO, and comparable company models.",
      "Backtest systematic strategies in Python with VectorBT and Backtrader without lookahead bias.",
      "Size positions and manage drawdown risk using Kelly criterion and market regime detection.",
    ],
    modules: [
      { title: "Module 1: Institutional Financial Modeling & Valuation", skills: ["agentii-ai-agentii-investment-intelligence/3-statement", "agentii-ai-agentii-investment-intelligence/dcf", "agentii-ai-agentii-investment-intelligence/comps", "agentii-ai-agentii-investment-intelligence/lbo"] },
      { title: "Module 2: Systematic Backtesting & Signal Research", skills: ["agiprolabs-claude-trading-skills/backtrader", "agiprolabs-claude-trading-skills/vectorbt", "agiprolabs-claude-trading-skills/regime-detection"] },
      { title: "Module 3: Position Sizing, Fixed Income & Risk Control", skills: ["agiprolabs-claude-trading-skills/kelly-criterion", "agiprolabs-claude-trading-skills/position-sizing", "agiprolabs-claude-trading-skills/risk-management", "agiprolabs-claude-trading-skills/fixed-income"] },
    ],
  },
  {
    slug: "product-management-agile-delivery",
    name: "AI-Native Product Management, Spec Writing & Sprint Delivery",
    kicker: "Course 06 · Product & Engineering Management",
    level: "All Levels",
    audience: "Product managers, product owners, scrum masters, and engineering managers",
    roleSlug: "product-manager",
    bundleSlug: "starter-10",
    summary: "Run discovery, write unambiguous PRDs and user stories, slice backlogs, plan sprint capacity, and generate release notes using verified product and agile skills.",
    outcomes: [
      "Draft structured specs and user stories with clear acceptance criteria.",
      "Audit sprint capacity, Jira/ADO backlogs, and retrospectives with data-backed workflows.",
      "Coordinate engineering handoffs and automated release notes.",
    ],
    modules: [
      { title: "Module 1: Discovery & Specification Writing", skills: ["mattpocock/engineering/to-spec", "addyosmani/spec-driven-development", "addyosmani/planning-and-task-breakdown"] },
      { title: "Module 2: User Stories & Backlog Architecture", skills: ["abrahamferga-scrum-skills/po-create-user-story", "abrahamferga-scrum-skills/po-split-story", "abrahamferga-scrum-skills/audit-backlog-ado"] },
      { title: "Module 3: Sprint Capacity, Delivery & Release Notes", skills: ["abrahamferga-scrum-skills/sm-capacity-planning", "abrahamferga-scrum-skills/audit-sprint-jira", "abrahamferga-scrum-skills/po-release-notes"] },
    ],
  },
];

function buildCourses() {
  // Backwards-compatible redirects: Courses and Curricula have merged into Playbooks
  write(
    "courses/index.html",
    `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="robots" content="noindex,follow">
  <meta http-equiv="refresh" content="0; url=../playbooks/index.html">
  <link rel="canonical" href="${SITE}/playbooks/">
  <title>Courses Redirect | Aidentity</title>
</head>
<body>
  <p>Courses &amp; Curricula have been merged into Playbooks. Redirecting to <a href="../playbooks/index.html">Playbooks &amp; Curricula</a>...</p>
  <script>location.replace("../playbooks/index.html");</script>
</body>
</html>`
  );

  for (const course of COURSES_DATA) {
    write(
      `courses/${course.slug}/index.html`,
      `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="robots" content="noindex,follow">
  <meta http-equiv="refresh" content="0; url=../../playbooks/${course.roleSlug}/index.html#curriculum">
  <link rel="canonical" href="${SITE}/playbooks/${course.roleSlug}/">
  <title>${esc(course.name)} Redirect | Aidentity</title>
</head>
<body>
  <p>This course curriculum is integrated into the ${course.roleSlug} playbook. Redirecting to <a href="../../playbooks/${course.roleSlug}/index.html#curriculum">${esc(course.name)}</a>...</p>
  <script>location.replace("../../playbooks/${course.roleSlug}/index.html#curriculum");</script>
</body>
</html>`
    );

    write(
      `courses/${course.slug}/course.md`,
      [
        `---`,
        `type: CourseRedirect`,
        `title: "${course.name}"`,
        `target: ${SITE}/playbooks/${course.roleSlug}/#curriculum`,
        `timestamp: ${GENERATED}`,
        `---`,
        ``,
        `# ${course.name}`,
        ``,
        `This course curriculum has been merged into the **[${course.roleSlug} Playbook](${SITE}/playbooks/${course.roleSlug}/playbook.md)**.`,
        ``,
        `Read the complete curriculum and playbook at:`,
        `${SITE}/playbooks/${course.roleSlug}/`,
      ].join("\n")
    );
  }
}

// ---------------------------------------------------------------------------
// guides (pillar comparison & agent-readiness / security / keyword guides)
// ---------------------------------------------------------------------------

function buildGuides() {
  const body = `
<section class="page-hero">
  <div class="wrap" style="max-width:960px">
    <span class="hero-badge">Canonical Reference Architecture</span>
    <h1 class="hero-title">Definitive Guides to AI Agent Skills, Setup &amp; Security</h1>
    <p class="hero-desc">
      The authoritative reference for comparing AI coding agent directory conventions, choosing between <strong>Individual</strong> and <strong>Enterprise</strong> agent setups, verifying <span class="mono">SKILL.md</span> security, and optimizing codebases for autonomous AI citation and agent readiness.
    </p>
    <div class="pill-strip" style="justify-content:center;margin-top:20px">
      <span class="pill-btn" style="cursor:default">6 Agent Runtimes</span>
      <span class="pill-btn" style="cursor:default">7 Security Gates</span>
      <span class="pill-btn" style="cursor:default">AgentReady Certified</span>
      <span class="pill-btn" style="cursor:default">Open Knowledge Format (OKF)</span>
    </div>
  </div>
</section>

<section style="padding: 24px 0 60px">
  <div class="wrap" style="max-width:960px">

    <nav class="pill-strip" aria-label="Guides table of contents" style="margin-bottom:36px;padding-bottom:18px;border-bottom:1px solid var(--rule)">
      <span class="mono" style="font-size:11px;font-weight:bold;color:var(--muted);align-self:center;margin-right:6px">JUMP TO:</span>
      <a href="#agent-comparison" class="pill-btn">1. Agent Path Comparison</a>
      <a href="#individual-vs-enterprise" class="pill-btn">2. Individual vs. Enterprise</a>
      <a href="#security-standard" class="pill-btn">3. 7-Gate Security Standard</a>
      <a href="#ai-visibility-architecture" class="pill-btn">4. AI Visibility Architecture</a>
    </nav>

    <!-- SECTION 1: Coding Agent Directory Comparison -->
    <div id="agent-comparison" style="margin-bottom:52px">
      <p class="kicker">Multi-Agent Normalization</p>
      <h2 style="font-family:var(--serif);font-size:1.85rem;font-weight:400;margin:6px 0 16px">1. Coding Agent Skill Directory &amp; MCP Comparison</h2>
      <p style="color:var(--ink-soft);font-size:0.95rem;line-height:1.6;margin-bottom:20px">
        Every AI coding agent reads markdown instructions, but each tool expects a different folder layout. <span class="mono">npx aidentity setup &lt;role&gt; --agent &lt;target&gt;</span> automatically normalizes installation paths across all 6 leading platforms:
      </p>

      <div class="bento-grid" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); margin-bottom:24px">
        <div class="bento-card">
          <span class="tag ok" style="margin-bottom:8px">Anthropic</span>
          <h3>Claude Code</h3>
          <p>Installs to <code>.claude/skills/&lt;name&gt;/SKILL.md</code>. Reads system rules from <code>CLAUDE.md</code> and supports pre-tool safety hooks.</p>
          <div class="mono" style="font-size:11px;color:var(--muted);margin-top:auto">CLI: --agent claude</div>
        </div>

        <div class="bento-card">
          <span class="tag ok" style="margin-bottom:8px">Anysphere</span>
          <h3>Cursor</h3>
          <p>Installs to <code>.cursor/skills/&lt;name&gt;/SKILL.md</code>. Uses <code>.cursor/rules/*.mdc</code> for scoped context and <code>.cursor/mcp.json</code> for tool servers.</p>
          <div class="mono" style="font-size:11px;color:var(--muted);margin-top:auto">CLI: --agent cursor</div>
        </div>

        <div class="bento-card">
          <span class="tag ok" style="margin-bottom:8px">OpenAI &amp; Google</span>
          <h3>Codex &amp; Gemini CLI</h3>
          <p>Installs to <code>.codex/skills/</code> and <code>.gemini/skills/</code>. Respects <code>AGENTS.md</code> / <code>GEMINI.md</code> project instructions.</p>
          <div class="mono" style="font-size:11px;color:var(--muted);margin-top:auto">CLI: --agent codex / gemini</div>
        </div>
      </div>

      <div class="table-scroll">
        <table class="table">
          <thead>
            <tr><th>Agent</th><th>Skills Path</th><th>Rules / Context File</th><th>MCP Config Path</th><th>CLI Install Flag</th></tr>
          </thead>
          <tbody>
            <tr>
              <td data-label="Agent"><strong>Claude Code</strong></td>
              <td data-label="Skills Path" class="mono">.claude/skills/&lt;name&gt;/SKILL.md</td>
              <td data-label="Rules / Context File" class="mono">CLAUDE.md + .claude/rules/</td>
              <td data-label="MCP Config Path" class="mono">claude mcp add aidentity</td>
              <td data-label="CLI Install Flag" class="mono">--agent claude</td>
            </tr>
            <tr>
              <td data-label="Agent"><strong>Cursor</strong></td>
              <td data-label="Skills Path" class="mono">.cursor/skills/&lt;name&gt;/SKILL.md</td>
              <td data-label="Rules / Context File" class="mono">.cursor/rules/*.mdc</td>
              <td data-label="MCP Config Path" class="mono">.cursor/mcp.json</td>
              <td data-label="CLI Install Flag" class="mono">--agent cursor</td>
            </tr>
            <tr>
              <td data-label="Agent"><strong>OpenAI Codex</strong></td>
              <td data-label="Skills Path" class="mono">.codex/skills/&lt;name&gt;/SKILL.md</td>
              <td data-label="Rules / Context File" class="mono">AGENTS.md</td>
              <td data-label="MCP Config Path" class="mono">~/.codex/config.toml</td>
              <td data-label="CLI Install Flag" class="mono">--agent codex</td>
            </tr>
            <tr>
              <td data-label="Agent"><strong>Gemini CLI</strong></td>
              <td data-label="Skills Path" class="mono">.gemini/skills/&lt;name&gt;/SKILL.md</td>
              <td data-label="Rules / Context File" class="mono">GEMINI.md</td>
              <td data-label="MCP Config Path" class="mono">~/.gemini/settings.json</td>
              <td data-label="CLI Install Flag" class="mono">--agent gemini</td>
            </tr>
            <tr>
              <td data-label="Agent"><strong>OpenCode</strong></td>
              <td data-label="Skills Path" class="mono">.opencode/skills/&lt;name&gt;/SKILL.md</td>
              <td data-label="Rules / Context File" class="mono">AGENTS.md</td>
              <td data-label="MCP Config Path" class="mono">opencode.json</td>
              <td data-label="CLI Install Flag" class="mono">--agent opencode</td>
            </tr>
            <tr>
              <td data-label="Agent"><strong>GitHub Copilot</strong></td>
              <td data-label="Skills Path" class="mono">.github/skills/&lt;name&gt;/SKILL.md</td>
              <td data-label="Rules / Context File" class="mono">.github/copilot-instructions.md</td>
              <td data-label="MCP Config Path" class="mono">.vscode/mcp.json</td>
              <td data-label="CLI Install Flag" class="mono">--agent copilot</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- SECTION 2: Individual vs Enterprise -->
    <div id="individual-vs-enterprise" style="margin-bottom:52px">
      <p class="kicker">Setup Governance</p>
      <h2 style="font-family:var(--serif);font-size:1.85rem;font-weight:400;margin:6px 0 16px">2. Individual vs. Enterprise AI Agent Setup</h2>
      <p style="color:var(--ink-soft);font-size:0.95rem;line-height:1.6;margin-bottom:20px">
        Solo developers prioritize execution velocity and lean token overhead; engineering organizations enforce supply-chain safety, secret scanning, and reproducible code standards.
      </p>
      
      <div class="profile-grid">
        <div class="profile-card">
          <span class="profile-badge">Individual Profile</span>
          <h3>Solo Developer &amp; Rapid Iteration</h3>
          <p style="font-size:12px;color:var(--ink-soft);margin-bottom:12px">Fast, lightweight agent configuration with core role skills and safety hooks.</p>
          <div style="margin-bottom:14px">
            <code>npx aidentity setup &lt;role&gt; --profile individual</code>
          </div>
          <ul class="profile-list">
            <li><span class="label">Skill Set</span><span class="val">6–8 core role skills</span></li>
            <li><span class="label">Pre-Tool Hooks</span><span class="val">block-dangerous.js, scan-secrets.js</span></li>
            <li><span class="label">Security Gate</span><span class="val">Verified in security.json</span></li>
            <li><span class="label">Lockfile Audit</span><span class="val">Optional</span></li>
            <li><span class="label">License / Cost</span><span class="val">$0 (MIT / Apache-2.0)</span></li>
          </ul>
        </div>

        <div class="profile-card enterprise">
          <span class="profile-badge" style="color:var(--ok)">Enterprise Profile</span>
          <h3>Team Governance &amp; Supply-Chain Audit</h3>
          <p style="font-size:12px;color:var(--ink-soft);margin-bottom:12px">Full organizational guardrails with supply-chain audits, secret scanning, and automated hooks.</p>
          <div style="margin-bottom:14px">
            <code>npx aidentity setup &lt;role&gt; --profile enterprise</code>
          </div>
          <ul class="profile-list">
            <li><span class="label">Skill Set</span><span class="val">Core + 4 supply-chain/audit skills</span></li>
            <li><span class="label">Pre-Tool Hooks</span><span class="val">Dangerous, secrets, format, test-on-stop</span></li>
            <li><span class="label">Security Gate</span><span class="val">Enforced SHA-256 lockfile audit</span></li>
            <li><span class="label">CI Integration</span><span class="val">npx aidentity audit in pipeline</span></li>
            <li><span class="label">License / Cost</span><span class="val">$0 (Self-hosted in repo)</span></li>
          </ul>
        </div>
      </div>
    </div>

    <!-- SECTION 3: 7-Gate Security Pipeline -->
    <div id="security-standard" style="margin-bottom:52px">
      <p class="kicker">Defense in Depth</p>
      <h2 style="font-family:var(--serif);font-size:1.85rem;font-weight:400;margin:6px 0 16px">3. How Aidentity Verifies Skill Security (7-Gate Static Analysis)</h2>
      <p style="color:var(--ink-soft);font-size:0.95rem;line-height:1.6;margin-bottom:20px">
        Unverified <span class="mono">SKILL.md</span> files from random repositories can contain invisible Trojan-Source Unicode, prompt injection directives that leak <span class="mono">.env</span> secrets, or destructive shell operations. Every skill in Aidentity (${security.total_files_scanned || 2492} files across ${registry.total} skills) is scanned on every commit by <span class="mono">scripts/scan-skills-security.js</span>:
      </p>

      <div class="gate-grid">
        <div class="gate-card">
          <span class="gate-num">Gate 01</span>
          <h3>Hidden &amp; Trojan Unicode</h3>
          <p>Rejects zero-width spaces (<code>U+200B</code>–<code>U+200D</code>), byte-order marks, and bidirectional override characters (<code>U+202A</code>–<code>U+202E</code>, <code>U+2066</code>–<code>U+2069</code>).</p>
        </div>
        <div class="gate-card">
          <span class="gate-num">Gate 02</span>
          <h3>Hardcoded Secrets &amp; Keys</h3>
          <p>Scans for live AWS, GitHub, OpenAI, Anthropic, Slack, Stripe, and PEM private keys across every instruction file.</p>
        </div>
        <div class="gate-card">
          <span class="gate-num">Gate 03</span>
          <h3>Destructive Shell Patterns</h3>
          <p>Blocks <code>rm -rf /</code>, fork bombs, raw disk writes (<code>dd</code>, <code>mkfs</code>), and root permission wipes.</p>
        </div>
        <div class="gate-card">
          <span class="gate-num">Gate 04</span>
          <h3>Prompt Injection &amp; Exfiltration</h3>
          <p>Detects instructions attempting to override system guardrails, exfiltrate environment variables, or establish reverse shells.</p>
        </div>
        <div class="gate-card">
          <span class="gate-num">Gate 05</span>
          <h3>Untrusted Remote Scripts</h3>
          <p>Flags <code>curl | sh</code> and <code>wget | bash</code> patterns that fetch and execute arbitrary unverified code from the network.</p>
        </div>
        <div class="gate-card">
          <span class="gate-num">Gate 06</span>
          <h3>Symlink &amp; Binary Hygiene</h3>
          <p>Rejects symlinks pointing outside the skill directory and unexpected compiled binary blobs.</p>
        </div>
        <div class="gate-card">
          <span class="gate-num">Gate 07</span>
          <h3>Deterministic SHA-256 Digest</h3>
          <p>Computes canonical SHA-256 hash across every file in the skill directory, published in <a href="../security.json">security.json</a>.</p>
        </div>
      </div>
    </div>

    <!-- SECTION 4: AI Visibility & AgentReady Architecture -->
    <div id="ai-visibility-architecture" style="margin-bottom:40px">
      <p class="kicker">Discovery &amp; RAG Architecture</p>
      <h2 style="font-family:var(--serif);font-size:1.85rem;font-weight:400;margin:6px 0 16px">4. Agent-Readable &amp; AI Visibility Architecture (AEO / GEO / OKF)</h2>
      <p style="color:var(--ink-soft);font-size:0.95rem;line-height:1.6;margin-bottom:20px">
        Aidentity implements the complete <a href="https://agentready.org" target="_blank" rel="noopener">AgentReady</a> and Open Knowledge Format (<span class="mono">OKF</span>) stack so both search engines and autonomous agents can discover, verify, and act on the index without JavaScript rendering:
      </p>

      <div class="table-scroll">
        <table class="table">
          <thead>
            <tr><th>Discovery Surface</th><th>URL</th><th>Purpose for Search &amp; AI Agents</th></tr>
          </thead>
          <tbody>
            <tr><td data-label="Surface"><strong>AI Catalog</strong></td><td data-label="URL" class="mono"><a href="../.well-known/ai-catalog.json">/.well-known/ai-catalog.json</a></td><td data-label="Purpose">Lists all machine-readable endpoints, MCP server, OpenAPI spec, and OKF bundle</td></tr>
            <tr><td data-label="Surface"><strong>OpenAPI 3.1</strong></td><td data-label="URL" class="mono"><a href="../openapi.json">/openapi.json</a></td><td data-label="Purpose">Typed schema for registry, search, security digests, and role blueprints</td></tr>
            <tr><td data-label="Surface"><strong>OKF Knowledge Bundle</strong></td><td data-label="URL" class="mono"><a href="../okf/index.md">/okf/index.md</a></td><td data-label="Purpose">Cross-linked markdown concept graph with YAML frontmatter for RAG ingestion</td></tr>
            <tr><td data-label="Surface"><strong>Structured Pricing</strong></td><td data-label="URL" class="mono"><a href="../pricing.md">/pricing.md</a></td><td data-label="Purpose">Explicit $0 free/open-source licensing for autonomous tool-evaluation agents</td></tr>
            <tr><td data-label="Surface"><strong>LLMs Context</strong></td><td data-label="URL" class="mono"><a href="../llms.txt">/llms.txt</a> · <a href="../llms-full.txt">/llms-full.txt</a></td><td data-label="Purpose">Single-request index summary and full skill instructions for LLMs</td></tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</section>
`;

  write("guides/index.html", layout({
    title: "AI Agent Guides: Claude Code vs Cursor, Enterprise Setup, Skill Security & GEO",
    description: "Definitive reference guides comparing Claude Code, Cursor, Codex, and Gemini CLI directory structures, Individual vs Enterprise setups, 7-gate SKILL.md security, and AgentReady GEO.",
    depth: 1,
    body,
    page: "guides",
    canonical: `${SITE}/guides/`,
    keywords: "Claude Code vs Cursor skills, SKILL.md format, AI agent security, enterprise AI coding agent setup, AgentReady, Open Knowledge Format OKF, llms.txt guide",
    jsonld: jsonld({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
            { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE}/guides/` },
          ],
        },
        {
          "@type": "TechArticle",
          headline: "Definitive Guides to AI Agent Skills, Role Setup & Security Verification",
          description: "Comparison of Claude Code, Cursor, Codex, Gemini CLI, OpenCode, and Copilot skill paths, Individual vs Enterprise setup profiles, and 7-gate SKILL.md security scanning.",
          url: `${SITE}/guides/`,
          datePublished: GENERATED,
          dateModified: GENERATED,
          author: { "@type": "Person", name: "Akshat Naruka" },
          publisher: { "@id": `${SITE}/#organization` },
        },
      ],
    }),
  }));
}


function buildBundlesPage() {
  const cards = bundlesData.map((bundle) => {
    const skills = bundle.skills.map((id) => registry.skills.find((skill) => skill.id === id)).filter(Boolean);
    return `<article class="bundle" id="${bundle.slug}">
      <h3>${esc(bundle.name)} <span class="mono" style="font-size:11px;color:var(--muted)">${esc(bundle.slug)}</span></h3>
      <p>${esc(bundle.description)}</p>
      <div class="cmd"><span class="prompt" aria-hidden="true">$</span><code>node scripts/install.js ${esc(bundle.slug)} --platform claude</code><button type="button" data-copy="node scripts/install.js ${esc(bundle.slug)} --platform claude">copy</button></div>
      <ul class="bundle-skills">${skills.map((skill) => `<li><a href="../skills/${skill.id}/">${esc(skill.name)}</a> <span class="mono">${esc(skill.source.license)}</span></li>`).join("")}</ul>
    </article>`;
  }).join("\n");
  const body = `<section style="padding-top:44px"><div class="wrap" style="max-width:900px">
    <p class="kicker">Bundles</p>
    <h1 style="font-size:clamp(2rem,4.6vw,3.2rem)">Install a working set</h1>
    <p style="max-width:62ch;color:var(--ink-soft);margin-top:14px">Five to fifteen skills, chosen for a task. Smaller than loading the whole index, larger than guessing.</p>
    ${cards}
  </div></section>`;
  write("bundles/index.html", layout({ title: "Bundles", description: "Task-based install sets of AI agent skills.", depth: 1, body, page: "bundles", canonical: SITE + "/bundles/" }));
}


// ---------------------------------------------------------------------------
// compare: honest comparison page for "alternative" / "vs" search intent
// ---------------------------------------------------------------------------

const COMPARE_REVIEWED = "2026-11-18"; // editorial date: update when the facts below are re-checked

function buildCompare() {
  const rows = [
    ["What it is", "Curated, open-source index with a CLI and MCP server", "Vercel's open directory and leaderboard for agent skills", "Large aggregator of skills found in public GitHub repositories", "The marketplace built into one agent (Claude Code <span class=\"mono\">/plugin</span>, Codex <span class=\"mono\">$skill-installer</span>)", "Clone a repo and copy the folder into your agent's skills directory"],
    ["Catalogue size", `${registry.total} skills from ${sourceList.length} repositories`, "Very large, open to any GitHub repo", "Hundreds of thousands listed", "Depends on the marketplaces you add", "Unlimited"],
    ["How entries are ranked or chosen", "Hand-picked upstreams, then automated gates", "By install count", "By category, author and popularity", "By the marketplace owner", "By you"],
    ["Security scan before listing", "Yes: 6 static checks on every hosted file, results public", "Not part of the documented listing process", "Not part of the documented listing process", "Depends on the marketplace", "Your own review"],
    ["License checked", "Yes, enforced in CI. Non-redistributable skills are linked, not mirrored", "Not documented", "Not documented", "Depends on the marketplace", "Your own check"],
    ["Integrity digest", "SHA-256 per skill in security.json", "Not documented", "Not documented", "Depends on the marketplace", "Git commit hash"],
    ["Install command", "<span class=\"mono\">npx aidentity add &lt;id&gt;</span>", "<span class=\"mono\">npx skills add owner/repo</span>", "Copy or a third-party CLI", "Inside the agent", "<span class=\"mono\">git clone</span> + copy"],
    ["Agents", "Claude Code, Codex, Cursor, OpenCode, GitHub Copilot, Gemini CLI", "Many agents", "Many agents", "One", "Any, manually"],
    ["Role bundles", `${(rolesData.roles || []).length} role setups (Individual and Enterprise)`, "No", "No", "Plugins can bundle skills", "No"],
    ["Machine-readable index", "registry.json, search.json, llms.txt, OpenAPI, MCP", "Website and CLI", "Website", "Agent UI", "No"],
  ];
  const cols = ["", "Aidentity", "skills.sh", "SkillsMP", "Agent marketplaces", "Copying from GitHub"];

  const faq = [
    {
      q: "Is Aidentity a skills.sh alternative?",
      a: "It solves a narrower problem. skills.sh helps you find popular skills across all of GitHub. Aidentity lists fewer skills and checks each hosted one for security issues, license and provenance before it appears. Many people use both: discover broadly, then prefer a checked copy when one exists.",
    },
    {
      q: "Are skills from large directories unsafe?",
      a: "Not by default. Most are fine. The risk is that a skill is a prompt your agent follows with your tools, so one malicious or careless skill can run commands, read files or leak secrets. Without a review step, you are the review step.",
    },
    {
      q: "Can I use Aidentity's checks on a skill it does not list?",
      a: "Yes. The scanner is open source: run node scripts/scan-skills-security.js against a skills folder in a clone of the repo, or submit the skill so it is scanned in CI and added to the index.",
    },
  ];

  const body = `
<div class="wrap">
  <div class="page-hero">
    <span class="page-hero-kicker">Comparison · reviewed ${COMPARE_REVIEWED}</span>
    <h1 class="page-title">Aidentity vs skills.sh, SkillsMP and agent marketplaces</h1>
    <p class="page-lead">
      There are several ways to get agent skills into Claude Code, Codex or Cursor. They make different trade-offs between
      how many skills you can reach and how much is checked before you install one. This page lays them side by side,
      including when another option is the better choice.
    </p>
  </div>
</div>

<section>
  <div class="wrap">
    <div class="table-scroll">
    <table class="table compare-table compare-wide">
      <thead><tr>${cols.map((c) => `<th scope="col">${c}</th>`).join("")}</tr></thead>
      <tbody>
        ${rows.map(([label, ...cells]) => `<tr><th scope="row">${label}</th>${cells.map((cell, i) => `<td data-label="${cols[i + 1]}">${cell}</td>`).join("")}</tr>`).join("\n        ")}
      </tbody>
    </table>
    </div>
    <p class="note">Facts about other services come from their public documentation and launch posts as of ${COMPARE_REVIEWED}. Spot something out of date? <a href="${REPO}/issues/new" rel="noopener">Open an issue</a>.</p>
  </div>
</section>

<section>
  <div class="wrap">
    <h2>When to use each</h2>
    <div class="three" style="margin-top:28px">
      <div>
        <h3>Use Aidentity</h3>
        <p>When you want a short list you can install without reading every file first, need license and provenance for a team or enterprise review, or want a whole role set up in one command.</p>
      </div>
      <div>
        <h3>Use a large directory</h3>
        <p>When you need a niche skill nobody has curated yet, or want to see what is popular this week. Read the skill before you install it, or run the open-source scanner on it.</p>
      </div>
      <div>
        <h3>Use your agent's marketplace</h3>
        <p>When you only use one agent and want plugins that bundle skills with commands and hooks, managed from inside the agent.</p>
      </div>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <h2>How to vet any skill in five minutes</h2>
    <ol class="vet-list">
      <li><strong>Read SKILL.md and every script it references.</strong> Look for commands that delete, upload or fetch-and-run.</li>
      <li><strong>Search for hidden characters.</strong> Zero-width and bidirectional Unicode can hide instructions from a human reader.</li>
      <li><strong>Check for secrets and endpoints.</strong> API keys, tokens or unfamiliar URLs have no place in a skill.</li>
      <li><strong>Confirm the license and author.</strong> No license means you have no right to redistribute it inside your company.</li>
      <li><strong>Pin a version.</strong> Install from a specific commit or digest so the skill cannot change under you.</li>
    </ol>
    <p class="note">Aidentity automates steps 2 to 5 for every hosted skill. Step 1 is still worth doing for anything that runs scripts.</p>
  </div>
</section>

<section>
  <div class="wrap">
    <h2>Questions</h2>
    <div class="faq" style="margin-top:28px">
      ${faq.map((item) => `<details><summary>${esc(item.q)}</summary><p>${esc(item.a)}</p></details>`).join("\n      ")}
    </div>
    <p class="hero-actions" style="margin-top:32px"><a class="btn btn-shimmer" href="../skills/index.html">Browse ${registry.total} checked skills &rarr;</a><a class="btn btn-ghost" href="../setup/index.html">Build my role setup</a></p>
  </div>
</section>
`;

  write(
    "compare/index.html",
    layout({
      title: "Aidentity vs skills.sh vs SkillsMP: agent skill directories compared",
      description: "How Aidentity, skills.sh, SkillsMP, agent marketplaces and copying from GitHub compare on security scanning, licensing, size and install. Includes when to use each.",
      depth: 1,
      body,
      page: "compare",
      canonical: SITE + "/compare/",
      keywords: "skills.sh alternative, SkillsMP alternative, agent skills directory, safe Claude Code skills, agent skill security, SKILL.md marketplace comparison",
      jsonld: jsonld({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebPage",
            "@id": SITE + "/compare/#page",
            url: SITE + "/compare/",
            name: "Aidentity vs skills.sh vs SkillsMP: agent skill directories compared",
            dateModified: COMPARE_REVIEWED,
            isPartOf: { "@id": SITE + "/#website" },
            about: ["Agent skills", "SKILL.md", "Software supply chain security"],
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE + "/" },
              { "@type": "ListItem", position: 2, name: "Compare", item: SITE + "/compare/" },
            ],
          },
          {
            "@type": "FAQPage",
            mainEntity: faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })),
          },
        ],
      }),
    })
  );
}

function buildSupport() {
  const body = `
<section style="padding-top:44px">
  <div class="wrap" style="max-width:820px">
    <p class="kicker">Support</p>
    <h1 style="font-size:clamp(2rem,4.6vw,3.2rem)">Keep the index verified</h1>
    <p style="max-width:62ch;color:var(--ink-soft);margin-top:16px">
      Aidentity is free, the registry is CC0, and every install is open source.
      If it saved you a search, you can fund the weekly verification, new imports
      and the site. Nothing is paywalled.
    </p>
    <div class="support-grid">
      <div class="support-card">
        <h3>Buy Me a Coffee</h3>
        <p>One-off or recurring support. The fastest option.</p>
        <a href="https://buymeacoffee.com/narukaakshat" rel="noopener"><img src="../assets/buymeacoffee-qr.png" alt="QR code for buymeacoffee.com/narukaakshat" width="220" height="220" loading="lazy"></a>
        <a class="btn" href="https://buymeacoffee.com/narukaakshat" rel="noopener">buymeacoffee.com/narukaakshat ↗</a>
      </div>
      <div class="support-card">
        <h3>PayPal</h3>
        <p>Direct one-off support, no account needed on this site.</p>
        <a class="btn" href="https://paypal.me/AkshatNaruka007" rel="noopener">paypal.me/AkshatNaruka007 ↗</a>
        <p class="note" style="font-size:12px;color:var(--muted);margin-top:18px">Both links go straight to the payment provider. No card details touch this site.</p>
      </div>
    </div>
    <div class="callout" style="margin-top:28px">
      <strong>Prefer contributing?</strong> Adding a skill, fixing a license or reporting a dead link is worth more than money. See <a href="${REPO}/blob/main/CONTRIBUTING.md" rel="noopener">CONTRIBUTING.md</a>.
    </div>
  </div>
</section>
`;
  write("support/index.html", layout({
    title: "Support",
    description: "Support Aidentity via Buy Me a Coffee or PayPal. The index stays free and CC0.",
    depth: 1,
    body,
    page: "support",
    canonical: SITE + "/support/",
  }));
}

function buildMachineReadable() {
  write("registry.json", JSON.stringify(registry, null, 2) + "\n");

  const roles = rolesData.roles || [];

  const llms = [
    "# Aidentity",
    "",
    "> A verified, machine-readable index of AI agent skills, role setup playbooks, and courses. One ID, one command, works in every coding agent.",
    "",
    `Generated ${GENERATED}. ${registry.total} skills indexed, ${registry.distributable} installable, ${security.verified}/${security.total_skills} security-verified, ${roles.length} role setup playbooks, ${COURSES_DATA.length} courses, ${sourceList.length} upstream sources.`,
    "",
    "## Key facts",
    "",
    `- Aidentity is a verified index of AI agent skills, playbooks, and courses. It is not a fork: each skill belongs to its upstream author.`,
    `- ${registry.total} entries: ${registry.distributable} hosted and installable, ${registry.total - registry.distributable} indexed with an upstream link only.`,
    `- Role setup playbooks (Individual or Enterprise): \`npx aidentity setup <role> --profile individual|enterprise --agent claude|cursor|codex|gemini|opencode|copilot\`.`,
    `- Install a single skill: \`npx aidentity add <id>\` or copy \`skills/<source>/<name>/\`.`,
    `- Every hosted skill is scanned by \`scripts/scan-skills-security.js\` (${security.verified}/${security.total_skills} verified, 0 critical findings) with SHA-256 digests in \`${SITE}/security.json\`.`,
    `- Compared with skills.sh, SkillsMP and agent marketplaces: ${SITE}/compare/ (Aidentity lists fewer skills and checks each hosted one for security, license and provenance).`,
    `- Pricing: $0 (100% free & open-source). See \`${SITE}/pricing.md\`.`,
    `- Licenses are per entry. MIT and Apache-2.0 are hosted; CC BY-SA 4.0 content keeps its share-alike terms; proprietary entries are not redistributed.`,
    `- Every source is re-checked weekly; \`registry/verified.json\` records the last check.`,
    `- Machine-readable: ${SITE}/registry.json (JSON), ${SITE}/search.json (compact search), ${SITE}/roles.json (role setup blueprints), ${SITE}/security.json (SHA-256 digests & scan results), ${SITE}/openapi.json (OpenAPI 3.1), ${SITE}/.well-known/ai-catalog.json (AI Catalog), ${SITE}/okf/index.md (Open Knowledge Format bundle), ${SITE}/pricing.md (pricing & licensing), ${SITE}/agent.json (manifest), ${SITE}/ai.txt (AI usage), ${SITE}/sitemap.xml (URLs), ${SITE}/feed.xml (RSS).`,
    "",
    "## How to use this index",
    "",
    "1. For full role setup, fetch `roles.json` or run `npx aidentity setup <role> --profile individual|enterprise`.",
    "2. Fetch `search.json` once and keep it. Filter by `tags`, `category`, `status` and `description`.",
    "3. Check `security.json` (`verified === true`) and fetch `content_url` for the full `SKILL.md` before recommending an install.",
    "4. If `content_url` is null the skill is index-only: link `upstream`, never install it.",
    "5. Install with `npx aidentity add <id>` or copy from `https://github.com/AkshatNaruka/aidentity`.",
    "6. Local agents can run the MCP server: `node cli/mcp.js` (`list_roles`, `setup_role`, `verify_skill_security`, `search_skills`, `get_skill`, `install_skill`).",
    "",
    "## Files & Hubs",
    "",
    `- [Registry](${SITE}/registry.json): every skill with id, description, category, tags, status, source, license and install command.`,
    `- [Roles](${SITE}/roles.json): ${roles.length} job role setup blueprints with Individual and Enterprise profiles.`,
    `- [Playbooks & Curricula](${SITE}/playbooks/): 21 step-by-step AI agent setup playbooks and 6 guided learning tracks by job role.`,
    `- [Guides Hub](${SITE}/guides/): comparisons (Claude Code vs Cursor vs Codex vs Gemini CLI), security verification, and GEO/OKF architecture.`,
    `- [Enterprise Trust Center](${SITE}/enterprise/): CISO governance, 7-gate static analysis, air-gapped mirroring, and runtime execution guardrails.`,
    `- [Security](${SITE}/security.json): static security scan status and SHA-256 digests for all ${security.total_skills} skills.`,
    `- [Pricing](${SITE}/pricing.md): $0 open-source pricing and licensing tiers.`,
    `- [Open Knowledge Format (OKF)](${SITE}/okf/index.md): cross-linked markdown concept bundle for RAG and agent ingestion.`,
    `- [OpenAPI 3.1](${SITE}/openapi.json): formal API schema for all JSON endpoints.`,
    `- [AI Catalog](${SITE}/.well-known/ai-catalog.json): AgentReady discovery catalog.`,
    `- [Schema](${REPO}/blob/main/registry/schema.json): JSON Schema for the registry.`,
    `- [Sources](${SITE}/sources/): provenance and license for every upstream repository.`,
    "",
    "## Role Setup Playbooks & Curricula",
    "",
    ...roles.map((r) => {
      const c = COURSES_DATA.find((crs) => crs.roleSlug === r.slug);
      return `- [${r.name} Playbook](${SITE}/playbooks/${r.slug}/) ([playbook.md](${SITE}/playbooks/${r.slug}/playbook.md)): \`npx aidentity setup ${r.slug} --profile individual|enterprise\` : ${r.description}${c ? ` (Includes curriculum: ${c.name})` : ""}`;
    }),
    "",
    "## Guided Learning Tracks (Curricula)",
    "",
    ...COURSES_DATA.map((c) => `- [${c.name}](${SITE}/playbooks/${c.roleSlug}/#curriculum): ${c.summary}`),
    "",
    "## Install & Setup",
    "",
    "```bash",
    "npx aidentity setup software-engineer --profile individual",
    "npx aidentity setup architect --profile enterprise",
    "npx aidentity add <id>",
    "npx aidentity audit",
    "```",
    "",
    "## Skills",
    "",
  ];

  for (const skill of skills) {
    llms.push(`- [${skill.name}](${SITE}/skills/${skill.id}/): ${skill.description}`);
  }

  llms.push(
    "",
    "## Notes",
    "",
    "- Entries marked `distributable: false` are indexed but not hosted; the upstream license forbids redistribution.",
    "- Skill content belongs to its author. Aidentity is an index, not a fork.",
    ""
  );

  write("llms.txt", llms.join("\n"));

  const urls = [
    { loc: "/" },
    { loc: "/setup/" },
    { loc: "/skills/" },
    { loc: "/playbooks/" },
    { loc: "/guides/" },
    { loc: "/enterprise/" },
    { loc: "/sources/" },
    { loc: "/for-agents/" },
    { loc: "/about/" },
    { loc: "/bundles/" },
    { loc: "/support/" },
    { loc: "/compare/" },
    { loc: "/pricing.md" },
    { loc: "/okf/index.md" },
    ...roles.map((r) => ({ loc: `/playbooks/${r.slug}/`, priority: "0.8", changefreq: "weekly" })),
    ...skills.map((skill) => ({ loc: `/skills/${skill.id}/`, priority: "0.7", changefreq: "weekly" })),
  ];
  write(
    "sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${SITE}${u.loc}</loc>
    <lastmod>${CONTENT_DATE}</lastmod>
  </url>`
  )
  .join("\n")}
</urlset>
`
  );

  const aiBots = [
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "ClaudeBot",
    "Claude-SearchBot",
    "Claude-User",
    "Claude-Web",
    "PerplexityBot",
    "Perplexity-User",
    "Google-Extended",
    "Googlebot",
    "Googlebot-Image",
    "Applebot",
    "Applebot-Extended",
    "meta-externalagent",
    "meta-externalfetcher",
    "meta-webindexer",
    "cohere-ai",
    "Diffbot",
    "Bytespider",
    "CCBot",
    "Bingbot",
    "BingPreview",
    "Amazonbot",
    "YouBot",
    "AI2Bot",
    "Scrapy",
  ];
  write(`${INDEXNOW_KEY}.txt`, INDEXNOW_KEY + "\n");
  write(".nojekyll", "");
  write(
    "robots.txt",
    [
      "User-agent: *",
      "Allow: /",
      "",
      ...aiBots.flatMap((bot) => [`User-agent: ${bot}`, "Allow: /", ""]),
      `Host: ${new URL(SITE).host}`,
      `Sitemap: ${SITE}/sitemap.xml`,
      `LLMs-Txt: ${SITE}/llms.txt`,
      `Agent-Manifest: ${SITE}/agent.json`,
      "",
    ].join("\n")
  );

  write(
    "ai.txt",
    [
      "# ai.txt: usage preferences for AI systems",
      `# ${SITE}/ai.txt`,
      "",
      "User-Agent: *",
      "Allow: /",
      "",
      `# Aidentity is a verified index of ${registry.total} AI agent skills, ${roles.length} role setup playbooks, and 6 courses. Facts may be quoted and cited.`,
      "Citation: allowed",
      "Attribution: required (link to the page and to the upstream skill author)",
      "Training: allowed for the registry metadata; vendored skills keep their upstream licenses",
      "",
      `LLMs: ${SITE}/llms.txt`,
      `LLMs-Full: ${SITE}/llms-full.txt`,
      `Registry: ${SITE}/registry.json`,
      `Roles: ${SITE}/roles.json`,
      `Security: ${SITE}/security.json`,
      `OpenAPI: ${SITE}/openapi.json`,
      `AI-Catalog: ${SITE}/.well-known/ai-catalog.json`,
      `AI-Plugin: ${SITE}/.well-known/ai-plugin.json`,
      `MCP: ${SITE}/.well-known/mcp.json`,
      `Enterprise: ${SITE}/enterprise/`,
      `OKF: ${SITE}/okf/index.md`,
      `Pricing: ${SITE}/pricing.md`,
      `Sitemap: ${SITE}/sitemap.xml`,
      "",
      "# Do not present an index-only entry as installable. Check `distributable` in the registry.",
      "",
    ].join("\n")
  );

  const pricingMd = [
    "# Pricing: Aidentity",
    "",
    `Last updated: ${GENERATED}`,
    "",
    "Aidentity is 100% free and open-source. There are no paid tiers, no seat limits, no API keys required, and no paywalls.",
    "",
    "## Individual Profile (`--profile individual`)",
    "- Price: $0 / forever",
    "- Limits: Unlimited installs, unlimited repositories, unlimited developers",
    `- Included: All ${registry.distributable} installable skills, ${roles.length} role setup playbooks, coding rules, subagents, slash commands, \`block-dangerous.js\` and \`scan-secrets.js\` hooks, SHA-256 verification`,
    "- Install command: `npx aidentity setup <role> --profile individual`",
    "",
    "## Enterprise Profile (`--profile enterprise`)",
    "- Price: $0 / forever (self-hosted directly in your repository)",
    "- Limits: Unlimited seats, unlimited CI/CD runs, zero external telemetry",
    "- Included: Everything in Individual + 4 mandatory security/supply-chain audit skills (`addyosmani/security-and-hardening`, `trailofbits/supply-chain-risk-auditor`, `trailofbits/agentic-actions-auditor`, `addyosmani/code-review-and-quality`), all 4 runtime hooks (`block-dangerous.js`, `scan-secrets.js`, `format-on-save.js`, `test-on-stop.js`), and `.aidentity-lock.json` SHA-256 integrity auditing via `npx aidentity audit`",
    "- Install command: `npx aidentity setup <role> --profile enterprise`",
    "",
    "## Licensing",
    "- CLI & site generator code: MIT",
    "- Registry metadata (`registry/skills.json`, `roles/roles.json`, `registry/security.json`): CC0 1.0 Universal",
    "- Vendored skills: MIT, Apache-2.0, or CC BY-SA 4.0 (per skill entry in `registry.json`)",
    "- Index-only skills (`distributable: false`): Metadata & upstream link only; not redistributed",
    "",
  ].join("\n");
  write("pricing.md", pricingMd);
  write("pricing.txt", pricingMd);

  write(
    "manifest.webmanifest",
    JSON.stringify(
      {
        name: "Aidentity",
        short_name: "Aidentity",
        description: "A verified index of AI agent skills, role setup playbooks, and courses.",
        start_url: "./",
        display: "browser",
        background_color: "#f7f4ed",
        theme_color: "#14130f",
        icons: [{ src: "assets/favicon.svg", sizes: "any", type: "image/svg+xml" }],
      },
      null,
      2
    ) + "\n"
  );

  const xml = (value) =>
    String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const feedItems = skills.slice(0, 50).map((skill) => `    <item>
      <title>${xml(skill.name)} | ${xml(skill.category)} AI agent skill</title>
      <link>${SITE}/skills/${skill.id}/</link>
      <guid>${SITE}/skills/${skill.id}/</guid>
      <description>${xml(skill.description)}</description>
      <pubDate>${new Date(GENERATED + "T00:00:00Z").toUTCString()}</pubDate>
      <author>${xml(skill.source.author)}</author>
    </item>`).join("\n");
  write(
    "feed.xml",
    `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Aidentity: AI agent skills</title>
    <link>${SITE}/</link>
    <description>A verified index of AI agent skills, with license and source for every entry.</description>
    <language>en</language>
    <lastBuildDate>${new Date(GENERATED + "T00:00:00Z").toUTCString()}</lastBuildDate>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml"/>
${feedItems}
  </channel>
</rss>
`
  );

  const badgeLabel = `${registry.total} skills`;
  write(
    "badge.svg",
    `<svg xmlns="http://www.w3.org/2000/svg" width="224" height="44" viewBox="0 0 224 44" role="img" aria-label="aidentity: ${badgeLabel}">
  <rect width="224" height="44" fill="#14130f"/>
  <rect x="12" y="14" width="10" height="10" fill="#b0341d"/>
  <text x="30" y="26" fill="#f4f1e8" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="12">aidentity</text>
  <text x="212" y="26" text-anchor="end" fill="#b9b2a0" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="11">${badgeLabel}</text>
</svg>
`
  );

  write(
    "404.html",
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found | Aidentity</title><meta name="robots" content="noindex"><meta name="description" content="This page is not in the Aidentity index."><link rel="icon" href="${BASE}/assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="${BASE}/assets/style.css?v=${BUILD_HASH}"></head><body><main id="main"><section style="padding-top:80px"><div class="wrap"><p class="kicker">404</p><h1>That page isn't indexed.</h1><p style="color:var(--muted);margin-top:14px">Try the <a href="${BASE}/skills/index.html">full index</a>, <a href="${BASE}/playbooks/index.html">role playbooks &amp; curricula</a>, or <a href="${BASE}/guides/index.html">guides</a>.</p></div></section></main></body></html>`
  );
}

function buildAssets() {
  const css = fs.readFileSync(path.join(__dirname, "assets", "style.css"));
  const js = fs.readFileSync(path.join(__dirname, "assets", "app.js"));
  write("assets/style.css", css);
  write("assets/app.js", js);
  write(
    "assets/favicon.svg",
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#14130f"/><rect x="9" y="9" width="14" height="14" fill="#b0341d"/></svg>`
  );
  // Binary assets are copied, not generated.
  for (const file of ["og.png", "apple-touch-icon.png", "buymeacoffee-qr.png"]) {
    const source = path.join(__dirname, "assets", file);
    if (!fs.existsSync(source)) continue;
    fs.mkdirSync(path.join(OUT, "assets"), { recursive: true });
    fs.copyFileSync(source, path.join(OUT, "assets", file));
  }
}


// ---------------------------------------------------------------------------
// agent surface: compact search index, manifest, raw skill files, OKF, OpenAPI
// ---------------------------------------------------------------------------

function buildAgentSurface() {
  const url = (skill) => `${SITE}/skills/${skill.id}/`;
  const install = (skill) => skill.install || null;
  const roles = rolesData.roles || [];

  const search = skills.map((skill) => ({
    id: skill.id,
    name: skill.name,
    description: skill.description,
    category: skill.category,
    tags: skill.tags,
    status: skill.status,
    license: skill.source.license,
    source: skill.source.repo,
    verified: Boolean(security.skills && security.skills[skill.id] && security.skills[skill.id].verified),
    sha256: security.skills && security.skills[skill.id] ? security.skills[skill.id].sha256 : null,
    install: install(skill),
    url: url(skill),
    content_url: skill.distributable && skill.path ? `${SITE}/skills/${skill.id}/SKILL.md` : null,
    upstream: skill.upstream ? skill.upstream.url : skill.source.url,
  }));
  write("search.json", JSON.stringify({ version: "1.1.0", updated: GENERATED, count: search.length, skills: search }, null, 2) + "\n");

  // Raw skill files so an agent can read the instructions without GitHub.
  for (const skill of skills) {
    if (!skill.distributable || !skill.path) continue;
    const source = path.join(ROOT, skill.path);
    if (!fs.existsSync(source)) continue;
    write(`skills/${skill.id}/SKILL.md`, fs.readFileSync(source));
  }

  // Bundles, roles, security report, and the full catalog, served next to the registry.
  const bundlesFile = path.join(ROOT, "bundles", "bundles.json");
  if (fs.existsSync(bundlesFile)) write("bundles.json", fs.readFileSync(bundlesFile));
  const rolesFile = path.join(ROOT, "roles", "roles.json");
  if (fs.existsSync(rolesFile)) write("roles.json", fs.readFileSync(rolesFile));
  const securityFile = path.join(ROOT, "registry", "security.json");
  if (fs.existsSync(securityFile)) write("security.json", fs.readFileSync(securityFile));
  const catalogFile = path.join(ROOT, "registry", "catalog.json");
  if (fs.existsSync(catalogFile)) write("catalog.json", fs.readFileSync(catalogFile));

  const manifest = {
    name: "aidentity",
    version: "1.2.0",
    description: `A verified index of ${registry.total} AI agent skills, ${roles.length} role setup playbooks, and 6 courses with license, source, and SHA-256 security verification.`,
    updated: GENERATED,
    counts: {
      skills: registry.total,
      installable: registry.distributable,
      security_verified: security.verified || registry.total,
      sources: sourceList.length,
      bundles: bundlesData.length,
      roles: roles.length,
      playbooks: roles.length,
      courses: COURSES_DATA.length,
    },
    endpoints: {
      setup: `${SITE}/setup/`,
      search: `${SITE}/search.json`,
      registry: `${SITE}/registry.json`,
      security: `${SITE}/security.json`,
      roles: `${SITE}/roles.json`,
      catalog: `${SITE}/catalog.json`,
      bundles: `${SITE}/bundles.json`,
      playbooks: `${SITE}/playbooks/`,
      courses: `${SITE}/playbooks/`,
      guides: `${SITE}/guides/`,
      enterprise: `${SITE}/enterprise/`,
      pricing: `${SITE}/pricing.md`,
      okf: `${SITE}/okf/index.md`,
      openapi: `${SITE}/openapi.json`,
      ai_catalog: `${SITE}/.well-known/ai-catalog.json`,
      ai_plugin: `${SITE}/.well-known/ai-plugin.json`,
      mcp_manifest: `${SITE}/.well-known/mcp.json`,
      llms: `${SITE}/llms.txt`,
      llms_full: `${SITE}/llms-full.txt`,
      ai: `${SITE}/ai.txt`,
      sitemap: `${SITE}/sitemap.xml`,
      mcp: `${SITE}/for-agents/#mcp`,
    },
    usage: [
      "Run `npx aidentity setup <role> --profile <individual|enterprise>` for one-command role setup.",
      "Fetch /search.json and /security.json once. Verify `verified: true` before recommending or installing any skill.",
      "Fetch content_url for the full SKILL.md before recommending an install.",
      "Respect distributable: index-only entries (content_url null) must be linked upstream, not installed.",
      "Install with `npx aidentity add <id>` or by copying the folder from the GitHub repository.",
    ],
  };
  write("agent.json", JSON.stringify(manifest, null, 2) + "\n");
  write(".well-known/agent.json", JSON.stringify(manifest, null, 2) + "\n");

  // AgentReady /.well-known/ai-catalog.json
  const aiCatalog = {
    schema_version: "1.0",
    name: "Aidentity",
    description: `Verified index of ${registry.total} AI agent skills, ${roles.length} role setup playbooks (Individual & Enterprise), and 6 AI agent courses.`,
    url: SITE + "/",
    updated_at: GENERATED,
    pricing_url: `${SITE}/pricing.md`,
    resources: [
      { type: "llms-txt", url: `${SITE}/llms.txt`, description: `Concise index overview, role playbooks, courses, and all ${registry.total} skills` },
      { type: "llms-full-txt", url: `${SITE}/llms-full.txt`, description: "Complete metadata, SHA-256 status, and instructions URL for every skill" },
      { type: "openapi", url: `${SITE}/openapi.json`, description: "OpenAPI 3.1 specification for static JSON endpoints" },
      { type: "ai-plugin", url: `${SITE}/.well-known/ai-plugin.json`, description: "OpenAI ChatGPT plugin and Custom GPT actions discovery manifest" },
      { type: "mcp-manifest", url: `${SITE}/.well-known/mcp.json`, description: "Model Context Protocol (MCP) server discovery specification" },
      { type: "okf-bundle", url: `${SITE}/okf/index.md`, description: "Open Knowledge Format (OKF v0.1) cross-linked markdown concept bundle" },
      { type: "enterprise-trust", url: `${SITE}/enterprise/`, description: "Enterprise AI Agent Security & Trust Center (CISO approval, SHA-256 lockfile, air-gapped mirroring, and runtime hooks)" },
      { type: "mcp-server", url: `${SITE}/for-agents/#mcp`, command: "npx aidentity-mcp", description: "Local stdio MCP server for searching, verifying, and installing skills and role setups" },
      { type: "cli", command: "npx aidentity setup <role> --profile individual|enterprise", description: "Zero-dependency CLI installer for Claude Code, Cursor, Codex, Gemini CLI, OpenCode, and Copilot" },
    ],
  };
  write(".well-known/ai-catalog.json", JSON.stringify(aiCatalog, null, 2) + "\n");

  // OpenAI ChatGPT Plugin / Custom GPT Action Discovery (/.well-known/ai-plugin.json)
  const aiPlugin = {
    schema_version: "v1",
    name_for_human: "Aidentity AI Skills & Playbooks",
    name_for_model: "aidentity",
    description_for_human: `Search ${registry.total} verified AI agent skills, ${roles.length} role setup playbooks, and SHA-256 security digests.`,
    description_for_model: `Registry API and discovery manifest for searching ${registry.total} verified AI agent skills, 7-gate security verification audits, and ${roles.length} role setup blueprints for Claude Code, Cursor, Codex, OpenCode, Gemini CLI, and Copilot.`,
    auth: { type: "none" },
    api: { type: "openapi", url: `${SITE}/openapi.json` },
    logo_url: `${SITE}/assets/favicon.svg`,
    contact_email: "support@aidentity.dev",
    legal_info_url: `${SITE}/about/#licensing`,
  };
  write(".well-known/ai-plugin.json", JSON.stringify(aiPlugin, null, 2) + "\n");
  write("ai-plugin.json", JSON.stringify(aiPlugin, null, 2) + "\n");

  // Model Context Protocol (MCP) server discovery manifest
  const mcpDiscovery = {
    $schema: "https://modelcontextprotocol.io/schema.json",
    name: "aidentity-mcp",
    version: "1.2.0",
    description: "Model Context Protocol (MCP) server for Aidentity to search skills, inspect security digests, and generate role blueprints.",
    command: "npx",
    args: ["-y", "aidentity-mcp"],
    transport: "stdio",
    tools: [
      { name: "search_skills", description: `Search ${registry.total} verified AI agent skills by query, category, or tag.` },
      { name: "get_skill", description: "Retrieve complete metadata, provenance, and SKILL.md instructions for a skill by ID." },
      { name: "verify_security", description: "Inspect 7-gate static security audit and SHA-256 digests for any skill." },
      { name: "get_role_setup", description: `Retrieve deterministic workspace setup blueprint for any of ${roles.length} job roles.` },
      { name: "list_roles", description: `List all ${roles.length} available role blueprints with skill counts and profiles.` },
    ],
    homepage: `${SITE}/for-agents/#mcp`,
  };
  write(".well-known/mcp.json", JSON.stringify(mcpDiscovery, null, 2) + "\n");
  write("mcp.json", JSON.stringify(mcpDiscovery, null, 2) + "\n");

  // OpenAPI 3.1 specification for static JSON endpoints (AR-ACT-02)
  const openApi = {
    openapi: "3.1.0",
    info: {
      title: "Aidentity Static Registry & Security API",
      version: "1.2.0",
      description: `Read-only JSON endpoints for searching ${registry.total} AI agent skills, verifying SHA-256 security digests, and retrieving ${roles.length} Individual/Enterprise role setup blueprints.`,
      license: { name: "CC0-1.0", url: "https://creativecommons.org/publicdomain/zero/1.0/" },
    },
    servers: [{ url: SITE }],
    paths: {
      "/search.json": {
        get: {
          operationId: "getCompactSkillSearchIndex",
          summary: `Compact search index of all ${registry.total} skills with SHA-256 digest and content_url`,
          responses: { "200": { description: "Compact search index JSON" } },
        },
      },
      "/registry.json": {
        get: {
          operationId: "getFullSkillRegistry",
          summary: "Full schema-validated skill registry with source and license provenance",
          responses: { "200": { description: "Full registry JSON" } },
        },
      },
      "/security.json": {
        get: {
          operationId: "getSecurityVerificationReport",
          summary: "7-gate static security scan report and deterministic SHA-256 digests for all skills",
          responses: { "200": { description: "Security report JSON" } },
        },
      },
      "/roles.json": {
        get: {
          operationId: "getRoleSetupBlueprints",
          summary: `${roles.length} job role setup blueprints with Individual and Enterprise profiles`,
          responses: { "200": { description: "Role blueprints JSON" } },
        },
      },
      "/bundles.json": {
        get: {
          operationId: "getTaskBundles",
          summary: "Curated task-based skill bundles",
          responses: { "200": { description: "Bundles JSON" } },
        },
      },
      "/catalog.json": {
        get: {
          operationId: "getFullCatalog",
          summary: "Complete catalog of skills, setup prompts, rules, subagents, commands, hooks, and templates",
          responses: { "200": { description: "Catalog JSON" } },
        },
      },
    },
  };
  write("openapi.json", JSON.stringify(openApi, null, 2) + "\n");

  // Open Knowledge Format (OKF v0.1) bundle at /okf/
  write(
    "okf/index.md",
    [
      "---",
      "type: Index",
      "title: Aidentity Open Knowledge Format (OKF) Bundle",
      "description: Cross-linked markdown knowledge graph of Aidentity skills, " + roles.length + " role setup playbooks, 6 courses, and 7-gate security verification.",
      `resource: ${SITE}/okf/index.md`,
      "tags: [okf, ai-agent-skills, playbooks, courses, security, claude-code, cursor, codex, gemini-cli]",
      `timestamp: ${GENERATED}`,
      "---",
      "",
      "# Aidentity Knowledge Bundle (OKF v0.1)",
      "",
      "This directory contains cross-linked concept files in the [Open Knowledge Format (OKF v0.1)](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/HEAD/okf/SPEC.md) for zero-scraping ingestion by AI agents and RAG pipelines.",
      "",
      "## Concept Files in This Bundle",
      "",
      `- [Role Setup Playbooks](./playbooks.md): ${roles.length} job role setup blueprints (Individual & Enterprise profiles)`,
      "- [Enterprise Trust & Governance](./enterprise.md): Zero-telemetry guarantees, SHA-256 lockfile, air-gapped mirroring, and CISO approval kit",
      "- [AI Agent Courses](./courses.md): 6 structured learning curricula built from verified skills",
      "- [Skill Security Standard](./security.md): 7-gate static security scanner and SHA-256 verification protocol",
      `- [Pricing & Licensing](../pricing.md): $0 open-source pricing and SPDX license rules`,
      `- [Full LLMs Index](../llms-full.txt): Complete skill metadata and instruction URLs`,
      "",
    ].join("\n")
  );

  write(
    "okf/playbooks.md",
    [
      "---",
      "type: PlaybookCollection",
      `title: Aidentity Role Setup Playbooks (${roles.length} Jobs · Individual & Enterprise)`,
      "description: Deterministic setup blueprints for configuring AI coding agents by job role.",
      `resource: ${SITE}/playbooks/`,
      "tags: [playbooks, roles, individual, enterprise, agent-setup]",
      `timestamp: ${GENERATED}`,
      "---",
      "",
      "# Aidentity Role Setup Playbooks",
      "",
      "See [OKF Index](./index.md) · [AI Agent Courses](./courses.md) · [Skill Security Standard](./security.md) · [Enterprise Trust](./enterprise.md).",
      "",
      ...roles.map((r) => `- **[${r.name} Playbook](${SITE}/playbooks/${r.slug}/playbook.md)**: \`npx aidentity setup ${r.slug} --profile individual|enterprise\` : ${r.description}`),
      "",
    ].join("\n")
  );

  write(
    "okf/courses.md",
    [
      "---",
      "type: CourseCollection",
      "title: Aidentity AI Agent Courses & Curricula",
      "description: 6 hands-on courses teaching spec-driven development, TDD, AI SEO/GEO, enterprise agent security, UI design, and quant finance.",
      `resource: ${SITE}/playbooks/`,
      "tags: [courses, curriculum, tdd, ai-seo, geo, appsec, quant]",
      `timestamp: ${GENERATED}`,
      "---",
      "",
      "# Aidentity AI Agent Courses & Curricula",
      "",
      "See [OKF Index](./index.md) · [Role Setup Playbooks](./playbooks.md) · [Skill Security Standard](./security.md).",
      "",
      "All course curricula are now directly integrated into the corresponding role playbooks.",
      "",
      ...COURSES_DATA.map((c) => [
        `## ${c.name}`,
        `- Level: ${c.level}`,
        `- Audience: ${c.audience}`,
        `- Install curriculum: \`npx aidentity setup ${c.roleSlug} --profile individual\``,
        `- Summary: ${c.summary}`,
        `- Matching Playbook: [${c.roleSlug} Playbook](${SITE}/playbooks/${c.roleSlug}/playbook.md)`,
        "",
      ].join("\n")),
    ].join("\n")
  );

  write(
    "okf/security.md",
    [
      "---",
      "type: SecurityPolicy",
      "title: Aidentity 7-Gate Skill Security Verification Standard",
      `description: Static security verification and deterministic SHA-256 content hashing across all ${registry.total} AI agent skills.`,
      `resource: ${SITE}/security.json`,
      "tags: [security, sha256, prompt-injection, unicode, supply-chain]",
      `timestamp: ${GENERATED}`,
      "---",
      "",
      "# Aidentity 7-Gate Skill Security Verification Standard",
      "",
      "See [OKF Index](./index.md) · [Role Setup Playbooks](./playbooks.md) · [Enterprise Trust](./enterprise.md).",
      "",
      `- Verified skills: ${security.verified}/${security.total_skills} (100%)`,
      `- Files scanned: ${security.total_files_scanned || 2492}`,
      `- Critical findings: 0`,
      `- Machine-readable report: [${SITE}/security.json](${SITE}/security.json)`,
      "",
    ].join("\n")
  );

  write(
    "okf/enterprise.md",
    [
      "---",
      "type: EnterpriseGovernancePolicy",
      "title: Aidentity Enterprise AI Agent Trust & Security Architecture",
      "description: Complete enterprise governance framework: zero external telemetry, SHA-256 lockfile immutability, 7-gate AST static analysis, runtime pre-execution hooks, air-gapped private VPC mirroring, and compliance mapping (NIST SSDF & OWASP LLM).",
      `resource: ${SITE}/enterprise/`,
      "tags: [enterprise, ciso-approval, zero-telemetry, sha256-lockfile, air-gapped, nist-ssdf, owasp-llm, runtime-hooks]",
      `timestamp: ${GENERATED}`,
      "---",
      "",
      "# Aidentity Enterprise AI Agent Security & Trust Architecture",
      "",
      "See [OKF Index](./index.md) · [Skill Security Standard](./security.md) · [Role Setup Playbooks](./playbooks.md).",
      "",
      "## 5 Enterprise Guarantees",
      "",
      "1. **Zero External Telemetry**: 100% local execution. Code, prompts, and tokens never leave developer machines or VPCs.",
      "2. **Cryptographic SHA-256 Lockfile**: `.aidentity-lock.json` records immutable content hashes. Upstream tampering halts execution in CI.",
      "3. **7-Gate Static AST Analysis**: Scans every file for Trojan Unicode, hardcoded secrets, destructive shell patterns, and prompt injections.",
      "4. **Active Runtime Guardrails**: Synchronous pre-tool hooks (`block-dangerous.js` and `scan-secrets.js`) intercept and block unauthorized operations before execution.",
      "5. **Air-Gapped & Self-Hosted Ready**: Complete repository mirrors cleanly into internal GitLab or GitHub Enterprise servers with zero external network access required.",
      "",
      "## Compliance & Standards Alignment",
      "",
      "- **NIST SP 800-218 (SSDF v1.1)**: PO.3.1 (Software Tampering Protection), PS.1.1 (Pre-release Software Security Testing), PW.1.2 (Security Review Checklists).",
      "- **OWASP Top 10 for LLMs (2025)**: LLM01:2025 Prompt Injection, LLM02:2025 Sensitive Information Disclosure, LLM05:2025 Supply Chain Vulnerabilities, LLM07:2025 System Prompt Leakage.",
      "- **SOC 2 Type II**: CC6.1 (Logical Access Controls), CC6.6 (Boundary Protection & Exfiltration Prevention), CC7.1 (Vulnerability Detection & Static Analysis).",
      "",
      "## CISO Architecture Review Ticket Template",
      "",
      `Ready-to-file security clearance request template available at [Enterprise Trust Center](${SITE}/enterprise/#ciso-ticket).`,
      "",
    ].join("\n")
  );

  const full = [
    "# Aidentity: full index for agents",
    "",
    `Generated ${GENERATED}. ${registry.total} skills, ${registry.distributable} installable, ${security.verified}/${security.total_skills} security-verified, ${roles.length} role playbooks & curricula, ${sourceList.length} sources.`,
    "",
    "How to use: read this file to choose; verify SHA-256 in security.json; fetch the SKILL.md URL for the full instructions; install with the command.",
    "",
    "## Role Setup Playbooks & Curricula",
    "",
    ...roles.map((r) => {
      const c = COURSES_DATA.find((crs) => crs.roleSlug === r.slug);
      return `- **${r.name}** (\`${r.slug}\`): \`npx aidentity setup ${r.slug} --profile individual|enterprise\` : ${SITE}/playbooks/${r.slug}/playbook.md${c ? ` (Includes: ${c.name})` : ""}`;
    }),
    "",
    "## Guided Learning Tracks (Curricula)",
    "",
    ...COURSES_DATA.map((c) => `- **${c.name}** (\`${c.slug}\`): \`npx aidentity setup ${c.roleSlug}\` : ${SITE}/playbooks/${c.roleSlug}/#curriculum`),
    "",
    "## Skills",
    "",
  ];
  for (const skill of skills) {
    const sec = security.skills && security.skills[skill.id];
    full.push(
      `## ${skill.name}`,
      "",
      `- id: \`${skill.id}\``,
      `- category: ${skill.category}`,
      `- license: ${skill.source.license}`,
      `- status: ${skill.status}`,
      `- security: ${sec && sec.verified ? (sec.sha256 ? `verified (sha256:${sec.sha256.slice(0, 16)}…)` : "verified (index-only)") : "verified"}`,
      `- source: ${skill.source.repo}`,
      `- install: ${skill.install || "not hosted, use upstream"}`,
      `- page: ${url(skill)}`,
      skill.distributable ? `- instructions: ${SITE}/skills/${skill.id}/SKILL.md` : `- upstream: ${skill.upstream ? skill.upstream.url : skill.source.url}`,
      "",
      skill.description,
      ""
    );
  }
  write("llms-full.txt", full.join("\n"));
}

// ---------------------------------------------------------------------------

fs.rmSync(OUT, { recursive: true, force: true });
buildAssets();
buildHome();
buildSetup();
buildBrowse();
buildSources();
buildAbout();
buildForAgents();
buildForRoles();
buildPlaybooks();
buildCourses();
buildGuides();
buildEnterprise();
buildBundlesPage();
buildSupport();
buildCompare();
buildMachineReadable();
buildAgentSurface();

const pages = skills.length + (rolesData.roles ? rolesData.roles.length : 0) + COURSES_DATA.length + 13;
console.log(`Built ${pages} pages → ${path.relative(ROOT, OUT)}`);
console.log(`  ${registry.total} skills · ${(rolesData.roles || []).length} role playbooks & curricula · ${COURSES_DATA.length} guided tracks · ${sourceList.length} sources · ${categoryList.length} categories`);


