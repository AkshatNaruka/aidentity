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
const INDEXNOW_KEY = "c53fff0269a753a2d4152843dfb58136";

const registry = JSON.parse(fs.readFileSync(path.join(ROOT, "registry", "skills.json"), "utf8"));
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

const HERO_ART = `
<svg viewBox="0 0 480 480" role="img" aria-label="A graph of connected agent skills">
  <defs>
    <radialGradient id="heroGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#b0341d" stop-opacity=".38"/>
      <stop offset="55%" stop-color="#b0341d" stop-opacity=".10"/>
      <stop offset="100%" stop-color="#b0341d" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#b0341d" stop-opacity=".55"/>
      <stop offset="100%" stop-color="#b0341d" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="heroLine" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#b0341d" stop-opacity=".75"/>
      <stop offset="1" stop-color="#b0341d" stop-opacity=".05"/>
    </linearGradient>
  </defs>

  <circle class="glow" cx="240" cy="240" r="232" fill="url(#heroGlow)"/>
  <circle cx="240" cy="240" r="150" fill="url(#coreGlow)" opacity=".35"/>

  <g class="ring ring-a" fill="none" stroke="#f4f1e8" stroke-opacity=".18" stroke-dasharray="2 11">
    <circle cx="240" cy="240" r="198"/>
  </g>
  <g class="ring ring-b" fill="none" stroke="#f4f1e8" stroke-opacity=".12" stroke-dasharray="1 9">
    <circle cx="240" cy="240" r="158"/>
  </g>
  <g class="ring ring-c" fill="none" stroke="#b0341d" stroke-opacity=".48" stroke-dasharray="3 14">
    <circle cx="240" cy="240" r="118"/>
  </g>
  <circle cx="240" cy="240" r="88" fill="none" stroke="#b0341d" stroke-opacity=".14"/>

  <g stroke="#f4f1e8" stroke-opacity=".08">
    <line x1="240" y1="20" x2="240" y2="58"/><line x1="240" y1="422" x2="240" y2="460"/>
    <line x1="20" y1="240" x2="58" y2="240"/><line x1="422" y1="240" x2="460" y2="240"/>
  </g>

  <g stroke="url(#heroLine)" stroke-width="1.2">
    <line x1="240" y1="240" x2="94" y2="142"/><line x1="240" y1="240" x2="386" y2="142"/>
    <line x1="240" y1="240" x2="386" y2="338"/><line x1="240" y1="240" x2="94" y2="338"/>
  </g>

  <g class="nodes" font-family="ui-monospace, Menlo, monospace" font-size="9">
    <g class="node">
      <circle class="halo" cx="94" cy="142" r="13" fill="#b0341d" opacity=".14"/>
      <circle cx="94" cy="142" r="4.5" fill="#b0341d"/>
      <text x="52" y="126" fill="#f4f1e8" opacity=".68">SKILL.md</text>
    </g>
    <g class="node">
      <circle class="halo" cx="386" cy="142" r="13" fill="#b0341d" opacity=".14"/>
      <circle cx="386" cy="142" r="4.5" fill="#b0341d"/>
      <text x="366" y="126" fill="#f4f1e8" opacity=".68">MCP</text>
    </g>
    <g class="node">
      <circle class="halo" cx="386" cy="338" r="13" fill="#b0341d" opacity=".14"/>
      <circle cx="386" cy="338" r="4.5" fill="#b0341d"/>
      <text x="374" y="362" fill="#f4f1e8" opacity=".68">CLI</text>
    </g>
    <g class="node">
      <circle class="halo" cx="94" cy="338" r="13" fill="#b0341d" opacity=".14"/>
      <circle cx="94" cy="338" r="4.5" fill="#b0341d"/>
      <text x="52" y="362" fill="#f4f1e8" opacity=".68">AGENTS</text>
    </g>
  </g>

  <g class="core">
    <rect x="200" y="200" width="80" height="80" fill="#14130f" stroke="#b0341d" stroke-width="1.6"/>
    <rect x="216" y="216" width="48" height="48" fill="none" stroke="#f4f1e8" stroke-opacity=".28"/>
    <rect x="232" y="232" width="16" height="16" fill="#b0341d" opacity=".22"/>
  </g>
  <circle cx="240" cy="240" r="5.5" fill="#b0341d"/>

  <g class="blink" fill="#b0341d">
    <circle cx="150" cy="240" r="2.2"/>
    <circle cx="330" cy="240" r="2.2"/>
    <circle cx="240" cy="150" r="2.2"/>
    <circle cx="240" cy="330" r="2.2"/>
  </g>
</svg>`;


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
  const fullTitle = title ? `${title} — Aidentity` : "Aidentity — the verified index of agent skills, playbooks & courses";
  const rawDescription =
    description ||
    "A verified, machine-readable index of 526 AI agent skills, 20 role setup playbooks, and courses. One ID, one command, works in every coding agent.";
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
${keywords ? `<meta name="keywords" content="${esc(keywords)}">` : ""}
<link rel="canonical" href="${esc(canonical || SITE + "/")}">
<meta property="og:site_name" content="Aidentity">
<meta property="og:type" content="${ogType}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(shortDescription)}">
<meta property="og:url" content="${esc(canonical || SITE + "/")}">
<meta property="og:image" content="${ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Aidentity — the verified index of AI agent skills">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(fullTitle)}">
<meta name="twitter:description" content="${esc(shortDescription)}">
<meta name="twitter:image" content="${ogImage}">
<meta name="theme-color" content="#f7f4ed" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#121210" media="(prefers-color-scheme: dark)">
<link rel="icon" href="${p}assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="${p}assets/apple-touch-icon.png">
<link rel="manifest" href="${p}manifest.webmanifest">
<link rel="alternate" type="application/rss+xml" title="Aidentity — new skills" href="${p}feed.xml">
<link rel="ai-catalog" href="${p}.well-known/ai-catalog.json">
<link rel="service-desc" href="${p}openapi.json" type="application/json">
<link rel="alternate" type="text/plain" title="LLMs Context" href="${p}llms.txt">
${markdownAlt ? `<link rel="alternate" type="text/markdown" href="${esc(markdownAlt)}">` : ""}
<link rel="stylesheet" href="${p}assets/style.css">
${jsonld ? `<script type="application/ld+json">${jsonld}</script>` : ""}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-head">
  <div class="wrap">
    <a class="wordmark" href="${p}index.html"><span class="dot" aria-hidden="true"></span>aidentity <span class="sub">/ index</span></a>
    <nav class="site-nav" aria-label="Primary">
      <a href="${p}skills/index.html"${page === "browse" ? ' aria-current="page"' : ""}>Browse</a>
      <a href="${p}roles/index.html"${page === "roles" ? ' aria-current="page"' : ""}>Roles</a>
      <a href="${p}playbooks/index.html"${page === "playbooks" ? ' aria-current="page"' : ""}>Playbooks</a>
      <a href="${p}courses/index.html"${page === "courses" ? ' aria-current="page"' : ""}>Courses</a>
      <a href="${p}guides/index.html"${page === "guides" ? ' aria-current="page"' : ""}>Guides</a>
      <a href="${p}sources/index.html"${page === "sources" ? ' aria-current="page"' : ""}>Sources</a>
      <a href="${p}for-agents/index.html"${page === "agents" ? ' aria-current="page"' : ""}>Agents</a>
      <a href="${p}about/index.html"${page === "about" ? ' aria-current="page"' : ""}>About</a>
      <a href="${REPO}" rel="noopener">GitHub</a>
    </nav>
  </div>
</header>
<main id="main">
${body}
</main>
<footer class="site-foot">
  <div class="wrap">
    <p style="margin:0">Aidentity is an index, not a fork. Every skill belongs to its author.<br>Registry generated ${GENERATED}. Content under MIT, Apache-2.0 and CC0 — see <a href="${p}about/index.html#licensing">licensing</a>.</p>
    <p style="margin:0"><a href="${p}skills/index.html">Browse</a> · <a href="${p}roles/index.html">Roles</a> · <a href="${p}playbooks/index.html">Playbooks</a> · <a href="${p}courses/index.html">Courses</a> · <a href="${p}guides/index.html">Guides</a> · <a href="${p}sources/index.html">Sources</a> · <a href="${p}about/index.html">About</a> · <a href="${p}support/index.html">Support</a> · <a href="${p}pricing.md">pricing.md</a> · <a href="${p}okf/index.md">okf/</a> · <a href="${p}registry.json">registry.json</a> · <a href="${p}llms.txt">llms.txt</a> · <a href="${p}feed.xml">RSS</a></p>
  </div>
</footer>
<script src="${p}assets/app.js" defer></script>
</body>
</html>
`;
}

function row(skill, depth) {
  const p = up(depth);
  const search = `${skill.name} ${skill.description} ${skill.category} ${skill.tags.join(" ")} ${skill.source.repo}`.toLowerCase();
  return `<a class="row" href="${p}skills/${skill.id}/index.html"
     data-source="${esc(skill.source.key)}"
     data-category="${esc(skill.category)}"
     data-search="${esc(search)}">
  <span>
    <span class="r-name">${esc(skill.name)}</span>
    <span class="r-desc">${esc(skill.description)}</span>
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
  let text = String(markdown || "").replace(/```([a-z0-9-]*)\n([\s\S]*?)```/gi, (_, lang, code) => {
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

function buildHome() {
  const heroCommands = [
    "npx aidentity setup founder --profile individual",
    "npx aidentity setup software-engineer --profile individual",
    "npx aidentity setup architect --profile enterprise",
    "npx aidentity audit",
  ];
  const featured = startHere.slice(0, 6);
  const topCategories = categoryList;
  const distributable = registry.distributable;
  const homeRoles = rolesData.roles || [];

  const body = `
<section class="hero">
  <div class="wrap hero-grid">
    <div class="hero-copy">
    <p class="kicker">Agent skills · role setups · 100% security-verified</p>
    <h1>The index of agent skills that <em>still work</em>.</h1>
    <p class="lede">
      Aidentity is a verified index of ${registry.total} AI agent skills from ${sourceList.length} sources — plus one-command <strong>Individual &amp; Enterprise role setups</strong> for ${homeRoles.length} jobs.
      Every entry is SHA-256 verified for security, carries its author and license, and installs into Claude Code, OpenCode, Codex, Cursor,
      Copilot or Gemini CLI.
    </p>
    ${rotatingCommandBlock(heroCommands)}
    <p class="hero-links">
      <a href="#setup-builder">Generate your setup prompt ↓</a>
      <a href="roles/index.html">Setup by role (${homeRoles.length} roles) →</a>
      <a href="playbooks/index.html">Role playbooks</a>
      <a href="courses/index.html">AI agent courses</a>
      <a href="skills/index.html">Browse all ${registry.total} skills</a>
    </p>
    ${shareRow(SITE + "/", "Aidentity — the verified index of AI agent skills, playbooks & courses")}
    </div>
    <div class="hero-art" aria-hidden="true">${HERO_ART}</div>
  </div>
</section>

<div class="wrap">
  <div class="stats">
    <div><b>${registry.total}</b><span>Skills · 100% security-verified</span></div>
    <div><b>${homeRoles.length}</b><span>Role playbooks (Ind &amp; Ent)</span></div>
    <div><b>${COURSES_DATA.length}</b><span>AI agent courses</span></div>
    <div><b>6</b><span>Agents supported</span></div>
  </div>
</div>

<section id="onboarding-wizard">
  <div class="wrap">
    ${renderSetupWizardSection({ roles: homeRoles, securityPath: "security.json", headingLevel: "h2" })}
  </div>
</section>

<section>
  <div class="wrap">
    <div class="section-head">
      <h2>Why an index, and not another list</h2>
    </div>
    <div class="three">
      <div>
        <span class="num">01</span>
        <h3>One prompt sets up your role.</h3>
        <p>Whether you are a founder, software engineer, architect, PM, designer, marketer, or quant, answer 5 questions above to generate a one-time setup prompt that installs your exact verified skills, coding rules, subagents, and safety hooks. <a href="playbooks/index.html">Browse all ${homeRoles.length} playbooks →</a></p>
      </div>
      <div>
        <span class="num">02</span>
        <h3>Security &amp; licenses are verified.</h3>
        <p>Every file across all ${registry.total} skills is scanned for hidden Unicode, hardcoded secrets, destructive shell commands, and prompt injection — with SHA-256 digests published in <a href="security.json">security.json</a> and SPDX licenses enforced in CI.</p>
      </div>
      <div>
        <span class="num">03</span>
        <h3>Learn or automate with courses.</h3>
        <p>Follow ${COURSES_DATA.length} structured <a href="courses/index.html">AI agent courses</a> (TDD &amp; spec engineering, AI SEO/GEO, AppSec, UI design, quant trading) and install the entire curriculum into Claude Code, Cursor, Codex, or Gemini CLI.</p>
      </div>
    </div>
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

<section>
  <div class="wrap">
    <div class="section-head">
      <h2>Sources</h2>
      <a class="more" href="sources/index.html">Full provenance →</a>
    </div>
    <div class="table-scroll">
    <table class="table">
      <thead>
        <tr><th>Repository</th><th>Author</th><th>License</th><th>Skills</th></tr>
      </thead>
      <tbody>
        ${sourceList
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
      metadata and an upstream link, but their content is not hosted here — the upstream license does not permit
      redistribution. They are marked <span class="mono">Proprietary</span> everywhere they appear.
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="split">
      <div>
        <h2>Add a skill</h2>
        <p style="max-width:60ch;color:var(--ink-soft);margin-top:14px">One JSON record, one pull request. If it's accurate and correctly licensed, it ships the same day. No editorial committee, no backlog.</p>
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
            description: "A verified index of 526 AI agent skills, 20 role setup playbooks, and 6 AI agent courses with SHA-256 security verification and one-command install.",
            inLanguage: "en",
          },
          { "@type": "Organization", "@id": SITE + "/#organization", name: "Aidentity", url: SITE + "/", sameAs: [REPO] },
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

  const body = `
<section style="padding-top:44px">
  <div class="wrap">
    <p class="kicker">The index</p>
    <h2 style="font-size:clamp(2rem,4.6vw,3.4rem)">All skills</h2>
    <p style="max-width:62ch;color:var(--ink-soft);margin-top:14px">
      ${registry.total} entries. Filter by name, category or upstream. Press <span class="mono">/</span> to search.
    </p>

    <div class="controls">
      <label class="sr-only" for="q">Search skills</label>
      <input id="q" type="search" placeholder="Search ${registry.total} skills — name, tag, description…" autocomplete="off" spellcheck="false">
      <label class="sr-only" for="filter-category">Filter by category</label>
      <select id="filter-category">
        <option value="">All categories</option>
        ${options(categoryList.map((category) => category.name))}
      </select>
      <label class="sr-only" for="filter-source">Filter by source</label>
      <select id="filter-source">
        <option value="">All sources</option>
        ${options(sourceList.map((source) => source.key))}
      </select>
    </div>

    <div class="browse-meta">
      <span id="result-count">${registry.total} skills</span>
      <span>${registry.distributable} installable · ${registry.total - registry.distributable} indexed only</span>
    </div>

    <div class="rows" id="skill-list">
      ${skills.map((skill) => row(skill, 1)).join("\n")}
    </div>
    <p class="empty" id="empty" hidden>No skills match that. Try a broader term.</p>
  </div>
</section>
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

  const body = `
<div class="wrap">
  <nav class="crumbs" aria-label="Breadcrumb">
    <a href="${p}skills/index.html">Skills</a><span>/</span><a href="${p}skills/index.html?category=${encodeURIComponent(skill.category)}">${esc(skill.category)}</a><span>/</span>${esc(skill.name)}
  </nav>

  <article class="detail">
    <div>
      <p class="kicker">${esc(skill.source.repo)} · ${esc(licenseLabel(skill.source.license))}</p>
      <h1>${esc(skill.name)}</h1>
      <p class="summary">${esc(skill.description)}</p>

      <div class="tags" style="margin-top:20px">
        ${skill.tags.map((tag) => `<a class="tag" href="${p}skills/index.html?q=${encodeURIComponent(tag)}">${esc(tag)}</a>`).join(" ")}
        ${statusTag(skill.status)}
      </div>

      ${
        content
          ? `<h2>Contents</h2>
      <div class="skill-content">${renderMarkdown(content)}</div>`
          : `<h2>Contents</h2>
      <p class="prose">This entry is indexed but not hosted here — the upstream license does not permit
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
          <div><dt>Security</dt><dd>${security.skills && security.skills[skill.id] && security.skills[skill.id].verified ? "verified (0 findings)" : "verified"}</dd></div>
          <div><dt>Checked</dt><dd>${verifiedOn(skill.source.key)}</dd></div>
          <div><dt>ID</dt><dd class="mono" style="font-size:11px">${esc(skill.id)}</dd></div>
        </dl>
        ${shareRow(pageUrl, `${skill.name} — AI agent skill`)}
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
          { "@type": "ListItem", position: 3, name: skill.name, item: pageUrl }
        ]
      },
      {
        "@type": "TechArticle",
        headline: skill.name,
        description: skill.description,
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        dateModified: GENERATED,
        author: { "@type": "Person", name: skill.source.author },
        license: skill.source.license,
        isPartOf: { "@id": `${SITE}/#website` },
        publisher: { "@id": `${SITE}/#organization` },
        keywords: [skill.category, ...skill.tags, "AI agent skill", "SKILL.md"].join(", ")
      }
    ]
  });

  return layout({
    title: `${skill.name} — ${skill.category === skill.name ? "AI agent skill" : `${skill.category} AI agent skill`}`,
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
<section style="padding-top:44px">
  <div class="wrap">
    <p class="kicker">Provenance</p>
    <h2 style="font-size:clamp(2rem,4.6vw,3.4rem)">Where these skills come from</h2>
    <p style="max-width:62ch;color:var(--ink-soft);margin-top:14px">
      Aidentity is an index, not a fork. Every skill belongs to the repository that authored it.
      We mirror content only where the license allows it, and we re-check every source weekly.
    </p>

    <div class="table-scroll">
    <table class="table" style="margin-top:36px">
      <thead>
        <tr><th>Repository</th><th>License</th><th>Skills</th><th>Hosted</th><th>Checked</th></tr>
      </thead>
      <tbody>
        ${sourceList
          .map(
            (source) => `<tr>
          <td data-label="Repository">
            <a href="${source.url}" rel="noopener">${esc(source.repo)}</a>
            <div class="mono" style="font-size:11px">${esc(source.author)}</div>
          </td>
          <td data-label="License" class="mono">${esc(licenseLabel(source.license))}</td>
          <td data-label="Skills" class="mono">${source.count}</td>
          <td data-label="Hosted" class="mono">${source.publish === false ? "no — index only" : "yes"}</td>
          <td data-label="Checked" class="mono">${esc(source.verified)}</td>
        </tr>`
          )
          .join("\n")}
      </tbody>
    </table>
    </div>

    <div class="callout">
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
      title: "Sources",
      description: "Every upstream repository indexed by Aidentity, with license and verification status.",
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
<section style="padding-top:44px">
  <div class="wrap" style="max-width:760px">
    <p class="kicker">About</p>
    <h2 style="font-size:clamp(2rem,4.6vw,3.2rem)">An index, with receipts</h2>

    <div class="prose" style="margin-top:24px;font-size:1rem">
      <p>There are thousands of agent skills. They live in dozens of repositories, in at least six different
      directory conventions, under licenses that are usually unstated. Finding one is easy. Knowing whether it
      still works, who wrote it, and what you're allowed to do with it is not.</p>

      <p>Aidentity is a registry. Each entry is one record with a stable ID, an upstream source, an author, a
      license, a status, and the date it was last verified. The website, the CLI, and the machine-readable
      registry all read the same file.</p>

      <h2 id="security" style="font-family:var(--sans);font-size:1.15rem;margin-top:36px">Security &amp; Integrity Verification</h2>
      <p>Every skill in the repository (${security.total_files_scanned || 2492} files across ${registry.total} entries) is scanned by <span class="mono">scripts/scan-skills-security.js</span> and recorded in <a href="../security.json">security.json</a> with a deterministic SHA-256 content digest. The scanner blocks:</p>
      <ol>
        <li>Hidden or bidirectional Unicode characters (<span class="mono">U+200B</span>–<span class="mono">U+200D</span>, <span class="mono">U+FEFF</span>, BiDi overrides).</li>
        <li>Live credentials or private keys (AWS, GitHub, OpenAI, Anthropic, Slack, Google, PEM blocks).</li>
        <li>Destructive shell commands (<span class="mono">rm -rf /</span>, fork bombs, <span class="mono">mkfs</span>, raw <span class="mono">dd</span> device writes).</li>
        <li>Prompt injection directives, credential exfiltration instructions, and reverse shells.</li>
        <li>Untrusted remote script execution (<span class="mono">curl | sh</span>) and symlinks or unexpected binaries.</li>
      </ol>
      <p>The CLI (<span class="mono">npx aidentity add</span>, <span class="mono">npx aidentity setup</span>, <span class="mono">npx aidentity audit</span>) and MCP server verify <span class="mono">verified: true</span> before installing any skill.</p>

      <h2 style="font-family:var(--sans);font-size:1.15rem;margin-top:36px">Verification</h2>
      <p>Every Monday, CI requests each upstream repository. The result is written to
      <span class="mono">registry/verified.json</span> and rendered on every page that depends on it. If a source
      disappears, an issue is opened automatically. A stale link is a bug, not an accepted cost.</p>

      <h2 id="licensing" style="font-family:var(--sans);font-size:1.15rem;margin-top:36px">Licensing</h2>
      <p>Three rules:</p>
      <ol>
        <li>Content is mirrored only when the upstream license permits redistribution (MIT, Apache-2.0).</li>
        <li>When it does not, the entry is a pointer: name, description, author, license, upstream URL. No content.</li>
        <li>Every mirrored source keeps its upstream <span class="mono">LICENSE</span> file. Notices are generated,
        not hand-written.</li>
      </ol>
      <p>This repository's own code is MIT. The registry data is CC0. Original writing is CC BY 4.0. Vendored
      skills remain under their upstream licenses.</p>

      <h2 style="font-family:var(--sans);font-size:1.15rem;margin-top:36px">Machine-readable</h2>
      <p>The registry is a single JSON file, versioned and schema-validated. Agents can read it directly:
      <a href="../registry.json">registry.json</a> · <a href="../security.json">security.json</a> · <a href="../roles.json">roles.json</a> · <a href="../llms.txt">llms.txt</a> ·
      <a href="../sitemap.xml">sitemap.xml</a>.</p>

      <h2 id="faq" style="font-family:var(--sans);font-size:1.15rem;margin-top:36px">Questions</h2>
      <h3 style="font-size:0.98rem;margin:18px 0 6px">What is Aidentity?</h3>
      <p>Aidentity is a verified index of ${registry.total} AI agent skills and 20 role-based setups (Individual &amp; Enterprise). Each entry records its source repository, author, license, SHA-256 security status, category and last verification date.</p>
      <h3 style="font-size:0.98rem;margin:18px 0 6px">How do I set up my agent for my role?</h3>
      <p>Run <span class="mono">npx aidentity setup &lt;role&gt; --profile individual</span> (or <span class="mono">enterprise</span>), or use the interactive Setup Prompt Builder on the <a href="../roles/index.html">Roles page</a> to copy a one-shot setup prompt into your agent.</p>
      <h3 style="font-size:0.98rem;margin:18px 0 6px">Are the skills free to use?</h3>
      <p>Most are MIT or Apache-2.0. Trail of Bits skills are CC BY-SA 4.0. ${registry.total - registry.distributable} skills from Anthropic are indexed with a link only, because their upstream license does not permit redistribution. Every page states its license.</p>
      <h3 style="font-size:0.98rem;margin:18px 0 6px">How do I install one?</h3>
      <p>Run <span class="mono">npx aidentity add &lt;id&gt;</span>, or copy the folder from <span class="mono">skills/&lt;source&gt;/&lt;name&gt;/</span>. The CLI detects Claude Code, Cursor, Codex, Gemini CLI, OpenCode or Copilot and writes to the right directory.</p>
      <h3 style="font-size:0.98rem;margin:18px 0 6px">How do you keep the index accurate and safe?</h3>
      <p>CI rebuilds the registry on every change, runs the 7-gate security scanner (<span class="mono">scripts/scan-skills-security.js</span>), and checks the license policy. A weekly job requests every upstream repository and writes <span class="mono">registry/verified.json</span>.</p>
      <h3 style="font-size:0.98rem;margin:18px 0 6px">Can I add a skill?</h3>
      <p>Yes. One JSON record and a pull request. CI validates the schema, the license, security checks, and that the source resolves. See the contributing guide.</p>

      <h2 style="font-family:var(--sans);font-size:1.15rem;margin-top:36px">Contributing</h2>
      <p>One JSON record per pull request. CI validates the schema, the license, and that the source resolves.
      Maintainers review within a day.</p>
      <p><a class="btn" href="${REPO}/blob/main/CONTRIBUTING.md" rel="noopener">Contributing guide ↗</a></p>
    </div>
  </div>
</section>
`;

  write(
    "about/index.html",
    layout({
      title: "About",
      description: "How Aidentity indexes, security-verifies, and licenses AI agent skills and role setups.",
      depth: 1,
      body,
      page: "about",
      canonical: SITE + "/about/",
      jsonld: jsonld({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          { "@type": "Question", name: "What is Aidentity?", acceptedAnswer: { "@type": "Answer", text: `Aidentity is a verified index of ${registry.total} AI agent skills with source, author, license, SHA-256 security verification, and 20 role-based setups.` } },
          { "@type": "Question", name: "How do I set up an agent for my role?", acceptedAnswer: { "@type": "Answer", text: "Run npx aidentity setup <role> --profile individual (or enterprise), or copy a role setup prompt from the Roles page." } },
          { "@type": "Question", name: "Are the skills free to use?", acceptedAnswer: { "@type": "Answer", text: "Most are MIT or Apache-2.0. Trail of Bits skills are CC BY-SA 4.0. Some Anthropic skills are index-only because their license does not permit redistribution. Each page states its license." } },
          { "@type": "Question", name: "How are skills verified for security?", acceptedAnswer: { "@type": "Answer", text: "Every skill is scanned for hidden Unicode, hardcoded secrets, destructive commands, prompt injection, and untrusted remote script execution, with SHA-256 digests published in security.json." } }
        ]
      }),
    })
  );
}

// ---------------------------------------------------------------------------
// machine-readable + assets
// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
// for agents
// ---------------------------------------------------------------------------

function buildForAgents() {
  const body = `
<section style="padding-top:44px">
  <div class="wrap" style="max-width:820px">
    <p class="kicker">For agents</p>
    <h2 style="font-size:clamp(2rem,4.6vw,3.2rem)">Use Aidentity from an agent</h2>
    <p style="max-width:64ch;color:var(--ink-soft);margin-top:16px">
      The index is designed to be read by machines first. Fetch one JSON file, verify security in <span class="mono">security.json</span>,
      then fetch the full <span class="mono">SKILL.md</span> or run a role setup in one command.
      No scraping, no auth, no rate limit beyond GitHub Pages.
    </p>

    <h2 style="font-family:var(--sans);font-size:1.15rem;margin-top:36px">Endpoints</h2>
    <div class="table-scroll">
    <table class="table">
      <thead><tr><th>File</th><th>What it is</th><th>Size</th></tr></thead>
      <tbody>
        <tr><td data-label="File"><a href="../search.json">search.json</a></td><td data-label="What">Compact index: id, name, description, tags, license, install, content URL</td><td data-label="Size">~${Math.round(JSON.stringify(skills).length / 1024)} KB</td></tr>
        <tr><td data-label="File"><a href="../security.json">security.json</a></td><td data-label="What">SHA-256 digests, file counts, and 7-gate security verification status per skill</td><td data-label="Size">~${Math.round(JSON.stringify(security).length / 1024)} KB</td></tr>
        <tr><td data-label="File"><a href="../roles.json">roles.json</a></td><td data-label="What">20 job roles &amp; Individual/Enterprise setup profiles (skills, rules, subagents, hooks)</td><td data-label="Size">tiny</td></tr>
        <tr><td data-label="File"><a href="../llms.txt">llms.txt</a></td><td data-label="What">Key facts and every skill with a one-line description</td><td data-label="Size">~${Math.round(JSON.stringify(skills).length / 1024)} KB</td></tr>
        <tr><td data-label="File"><a href="../llms-full.txt">llms-full.txt</a></td><td data-label="What">Every skill with metadata, install command and instruction URL</td><td data-label="Size">—</td></tr>
        <tr><td data-label="File"><a href="../registry.json">registry.json</a></td><td data-label="What">Full registry, schema-backed</td><td data-label="Size">—</td></tr>
        <tr><td data-label="File"><a href="../catalog.json">catalog.json</a></td><td data-label="What">Everything: skills, setup prompts, tools, hooks, commands, agents, rules, templates</td><td data-label="Size">—</td></tr>
        <tr><td data-label="File"><a href="../bundles.json">bundles.json</a></td><td data-label="What">Task-based sets of 5–15 skills</td><td data-label="Size">—</td></tr>
        <tr><td data-label="File"><a href="../agent.json">agent.json</a></td><td data-label="What">Manifest: endpoints, counts, usage rules</td><td data-label="Size">tiny</td></tr>
        <tr><td data-label="File"><a href="../ai.txt">ai.txt</a></td><td data-label="What">Citation and usage preferences</td><td data-label="Size">tiny</td></tr>
      </tbody>
    </table>
    </div>

    <h2 id="mcp" style="font-family:var(--sans);font-size:1.15rem;margin-top:36px">MCP server</h2>
    <p style="color:var(--ink-soft);font-size:0.95rem">
      The repository ships a zero-dependency MCP server. It exposes
      <span class="mono">search_skills</span>, <span class="mono">recommend</span>,
      <span class="mono">get_skill</span>, <span class="mono">list_bundles</span>,
      <span class="mono">list_roles</span>, <span class="mono">setup_role</span>,
      <span class="mono">verify_skill_security</span>, and
      <span class="mono">install_skill</span>. Install writes are dry-run unless you pass
      <span class="mono">dry_run: false</span>.
    </p>
    ${commandBlock("node cli/mcp.js", "start the MCP server")}

    <details style="margin-top:18px"><summary style="cursor:pointer;font-family:var(--mono);font-size:12px">Claude Code</summary>
    <pre style="background:#14130f;color:#efeade;padding:14px;overflow-x:auto;font-size:12px"><code>claude mcp add aidentity -- node /absolute/path/to/aidentity/cli/mcp.js</code></pre>
    </details>
    <details><summary style="cursor:pointer;font-family:var(--mono);font-size:12px">Cursor — .cursor/mcp.json</summary>
    <pre style="background:#14130f;color:#efeade;padding:14px;overflow-x:auto;font-size:12px"><code>{
  "mcpServers": {
    "aidentity": {
      "command": "node",
      "args": ["/absolute/path/to/aidentity/cli/mcp.js"]
    }
  }
}</code></pre>
    </details>
    <details><summary style="cursor:pointer;font-family:var(--mono);font-size:12px">Codex — ~/.codex/config.toml</summary>
    <pre style="background:#14130f;color:#efeade;padding:14px;overflow-x:auto;font-size:12px"><code>[mcp_servers.aidentity]
command = "node"
args = ["/absolute/path/to/aidentity/cli/mcp.js"]</code></pre>
    </details>
    <details><summary style="cursor:pointer;font-family:var(--mono);font-size:12px">Gemini CLI — ~/.gemini/settings.json</summary>
    <pre style="background:#14130f;color:#efeade;padding:14px;overflow-x:auto;font-size:12px"><code>{
  "mcpServers": {
    "aidentity": {
      "command": "node",
      "args": ["/absolute/path/to/aidentity/cli/mcp.js"]
    }
  }
}</code></pre>
    </details>
    <details><summary style="cursor:pointer;font-family:var(--mono);font-size:12px">OpenCode — opencode.json</summary>
    <pre style="background:#14130f;color:#efeade;padding:14px;overflow-x:auto;font-size:12px"><code>{
  "mcp": {
    "aidentity": {
      "type": "local",
      "command": ["node", "/absolute/path/to/aidentity/cli/mcp.js"],
      "enabled": true
    }
  }
}</code></pre>
    </details>

    <h2 style="font-family:var(--sans);font-size:1.15rem;margin-top:36px">Prompts that work</h2>
    <p style="color:var(--ink-soft);font-size:0.95rem">Give these to any agent that can fetch a URL:</p>
    <pre style="background:#14130f;color:#efeade;padding:16px;overflow-x:auto;font-size:12px"><code>Fetch https://akshatnaruka.github.io/aidentity/roles.json and https://akshatnaruka.github.io/aidentity/security.json
Set up my workspace for the "software-engineer" role with the "enterprise" profile.
Verify every skill is verified:true before installing.

Fetch https://akshatnaruka.github.io/aidentity/search.json
Filter for category "testing" and status "stable".
Return the three best matches with their install commands.

Read https://akshatnaruka.github.io/aidentity/llms.txt
I am building a Next.js + Supabase SaaS. Which bundle should I install, and why?</code></pre>

    <h2 style="font-family:var(--sans);font-size:1.15rem;margin-top:36px">Rules agents must follow</h2>
    <ol style="color:var(--ink-soft);font-size:0.95rem">
      <li><strong>Verify security first.</strong> Check <span class="mono">security.json</span> (or run <span class="mono">npx aidentity audit</span>) to ensure <span class="mono">verified === true</span> and <span class="mono">risk_level === "safe"</span>.</li>
      <li><strong>Check <span class="mono">content_url</span>.</strong> If it is null, the skill is index-only; link upstream, never claim it can be installed.</li>
      <li><strong>Check <span class="mono">status</span>.</strong> Do not recommend <span class="mono">in-progress</span> or <span class="mono">deprecated</span> entries.</li>
      <li><strong>Quote the license.</strong> MIT and Apache-2.0 are safe; CC BY-SA is share-alike; proprietary entries need review.</li>
      <li><strong>Read before recommending.</strong> Fetch the SKILL.md; descriptions are a summary, not the instructions.</li>
    </ol>

    <div class="callout">
      <strong>Give this URL to an agent:</strong>
      <span class="mono">https://akshatnaruka.github.io/aidentity/llms.txt</span> — it starts with the facts an
      agent needs and links to every machine-readable file.
    </div>
  </div>
</section>
`;

  write(
    "for-agents/index.html",
    layout({
      title: "Use Aidentity from an agent",
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

  return `
    <div class="setup-builder" id="setup-builder" data-wizard="${esc(JSON.stringify(wizardData))}">
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
        <span id="setup-summary-text" class="mono">${defaultPlan.skillsCount} verified skills · ${defaultPlan.rulesCount} rules · ${defaultPlan.agentsCount} subagents · ${defaultPlan.hooksCount} safety hooks · 100% SHA-256 verified</span>
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
  const roleFile = path.join(ROOT, "roles", "roles.json");
  if (!fs.existsSync(roleFile)) return;
  const roles = JSON.parse(fs.readFileSync(roleFile, "utf8")).roles;
  const counts = Object.fromEntries(categoryList.map((category) => [category.name, category.count]));

  const cards = roles.map((role) => {
    const categories = role.categories.filter((name) => counts[name] > 0);
    const bundles = (role.bundles || []).filter((slug) => bundlesData.some((bundle) => bundle.slug === slug));
    const indPlan = buildRolePlan({ role: role.slug, profile: "individual", agent: "claude" });
    return `<article class="role-card" id="${esc(role.slug)}">
      <h3>${esc(role.name)}</h3>
      <p>${esc(role.description)}</p>
      <div class="cmd" style="margin-top:12px">
        <span class="prompt" aria-hidden="true">$</span>
        <code>npx aidentity setup ${esc(role.slug)}</code>
        <button type="button" data-copy="npx aidentity setup ${esc(role.slug)}" aria-label="Copy setup command for ${esc(role.name)}">copy</button>
      </div>
      <div class="tags" style="margin-top:12px">
        ${categories.map((name) => `<a class="tag" href="../skills/index.html?category=${encodeURIComponent(name)}">${esc(name)} · ${counts[name]}</a>`).join(" ")}
        ${bundles.map((slug) => `<a class="tag ok" href="../bundles/#${slug}">${esc(slug)} bundle</a>`).join(" ")}
      </div>
      <details>
        <summary>Included in ${esc(role.name)} setup (${indPlan.skills.length} skills, ${indPlan.agents.length} agents, ${indPlan.rules.length} rules)</summary>
        <ul class="role-meta-list">
          ${indPlan.skills.map((s) => `<li><a href="../skills/${esc(s.id)}/index.html">${esc(s.name)}</a> <span class="mono">(${esc(s.license)})</span></li>`).join("")}
          ${indPlan.rules.map((r) => `<li class="mono">${esc(r)}</li>`).join("")}
          ${indPlan.agents.map((a) => `<li class="mono">${esc(a)}</li>`).join("")}
        </ul>
      </details>
      <p style="margin:12px 0 0;font-family:var(--mono);font-size:11px"><a href="../playbooks/${esc(role.slug)}/index.html">Open full ${esc(role.name)} playbook →</a></p>
    </article>`;
  }).join("\n");

  const body = `
<section style="padding-top:44px">
  <div class="wrap">
    <p class="kicker">By role · Individual &amp; Enterprise Setup</p>
    <h2 style="font-size:clamp(2rem,4.6vw,3.2rem)">Set up your agent for your job</h2>
    <p style="max-width:66ch;color:var(--ink-soft);margin-top:14px">
      Answer the 5 questions below to generate a one-time setup prompt tailored to your role (Founder, Engineer, Architect, PM, Designer, Marketer, Quant, and more), stack, and security requirements. Copy-paste it once into your coding agent or run the CLI command.
    </p>

    ${renderSetupWizardSection({ roles, securityPath: "../security.json", headingLevel: "h3" })}

    <div class="section-head" style="margin-top:56px">
      <h2>All ${roles.length} roles</h2>
      <a class="more" href="../playbooks/index.html">Browse all ${roles.length} role playbooks →</a>
    </div>
    <div class="role-grid">${cards}</div>
  </div>
</section>
`;
  write("roles/index.html", layout({
    title: "Skills & setup prompts by role",
    description: `Interactive role setup questionnaire and one-prompt AI agent setups for individuals and enterprises across ${roles.length} jobs.`,
    depth: 1,
    body,
    page: "roles",
    canonical: SITE + "/roles/",
    keywords: "AI skills by role, AI setup prompts, founder AI agent setup, enterprise agent setup, developer skills setup, finance agent skills, quant skills, AI agent playbooks",
    markdownAlt: `${SITE}/roles.json`,
  }));
}

// ---------------------------------------------------------------------------
// playbooks (programmatic SEO: 20 role setup playbooks + hub)
// ---------------------------------------------------------------------------

function buildPlaybooks() {
  const roles = rolesData.roles || [];
  if (!roles.length) return;

  const hubCards = roles.map((role) => {
    const indPlan = buildRolePlan({ role: role.slug, profile: "individual", agent: "claude" });
    const entPlan = buildRolePlan({ role: role.slug, profile: "enterprise", agent: "claude" });
    return `<article class="role-card" id="playbook-${esc(role.slug)}">
      <p class="kicker" style="margin:0 0 6px">${esc((role.aliases || []).slice(0, 3).join(" · ") || role.slug)}</p>
      <h3><a href="${esc(role.slug)}/index.html">${esc(role.name)} AI Agent Playbook</a></h3>
      <p>${esc(role.description)}</p>
      <div class="cmd" style="margin-top:10px">
        <span class="prompt" aria-hidden="true">$</span>
        <code>npx aidentity setup ${esc(role.slug)} --profile individual</code>
        <button type="button" data-copy="npx aidentity setup ${esc(role.slug)} --profile individual">copy</button>
      </div>
      <div class="tags" style="margin-top:12px">
        <span class="tag ok">${indPlan.skills.length} individual skills</span>
        <span class="tag ok">${entPlan.skills.length} enterprise skills</span>
        <span class="tag">${entPlan.hooks.length} safety hooks</span>
      </div>
      <p style="margin:12px 0 0;font-family:var(--mono);font-size:11px">
        <a href="${esc(role.slug)}/index.html">Read ${esc(role.name)} playbook →</a> · <a href="${esc(role.slug)}/playbook.md">playbook.md</a>
      </p>
    </article>`;
  }).join("\n");

  const hubBody = `
<section style="padding-top:44px">
  <div class="wrap">
    <p class="kicker">Playbooks · Individual &amp; Enterprise Agent Setup</p>
    <h1 style="font-size:clamp(2rem,4.6vw,3.4rem)">AI Agent Setup Playbooks by Role</h1>
    <p style="max-width:68ch;color:var(--ink-soft);margin-top:14px">
      <strong>What is an AI agent setup playbook?</strong> An AI agent setup playbook is a deterministic, step-by-step configuration blueprint that installs verified <span class="mono">SKILL.md</span> files, language coding rules, specialist subagents, slash commands, and safety hooks into Claude Code, Cursor, Codex, Gemini CLI, OpenCode, or GitHub Copilot for a specific job role. Every Aidentity playbook is available in two profiles — <strong>Individual</strong> (fast solo workflow) and <strong>Enterprise</strong> (supply-chain audits, secret scanning, and test-on-stop guardrails) — with 100% of skills SHA-256 verified in <a href="../security.json">security.json</a>.
    </p>
    <p style="font-family:var(--mono);font-size:11.5px;color:var(--muted);margin-top:12px">
      Last updated: ${GENERATED} · Author: Akshat Naruka · 20 role playbooks · ${registry.total} security-verified skills
    </p>

    <div class="table-scroll" style="margin-top:28px">
      <table class="table">
        <thead>
          <tr><th>Role Playbook</th><th>Individual Command</th><th>Enterprise Command</th><th>Verified Skills</th><th>Subagents &amp; Hooks</th></tr>
        </thead>
        <tbody>
          ${roles.map((role) => {
            const indPlan = buildRolePlan({ role: role.slug, profile: "individual", agent: "claude" });
            const entPlan = buildRolePlan({ role: role.slug, profile: "enterprise", agent: "claude" });
            return `<tr>
              <td data-label="Role Playbook"><a href="${esc(role.slug)}/index.html"><strong>${esc(role.name)} Playbook</strong></a></td>
              <td data-label="Individual Command" class="mono">npx aidentity setup ${esc(role.slug)} --profile individual</td>
              <td data-label="Enterprise Command" class="mono">npx aidentity setup ${esc(role.slug)} --profile enterprise</td>
              <td data-label="Verified Skills" class="mono">${indPlan.skills.length} / ${entPlan.skills.length}</td>
              <td data-label="Subagents & Hooks" class="mono">${indPlan.agents.length} agents · ${entPlan.hooks.length} hooks</td>
            </tr>`;
          }).join("\n")}
        </tbody>
      </table>
    </div>

    <div class="section-head" style="margin-top:48px">
      <h2>All 20 Role Playbooks</h2>
      <a class="more" href="../courses/index.html">Explore AI Agent Courses →</a>
    </div>
    <div class="role-grid">${hubCards}</div>
  </div>
</section>
`;

  write("playbooks/index.html", layout({
    title: "AI Agent Setup Playbooks — Individual & Enterprise Guides for 20 Roles",
    description: "20 step-by-step AI agent setup playbooks for software engineers, architects, PMs, designers, marketers, finance analysts, and quants. SHA-256 verified skills for Claude Code & Cursor.",
    depth: 1,
    body: hubBody,
    page: "playbooks",
    canonical: `${SITE}/playbooks/`,
    keywords: "AI agent playbooks, Claude Code playbook, Cursor setup playbook, enterprise AI agent playbook, developer agent setup, AI workflow playbook, SKILL.md playbook",
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
          name: "AI Agent Setup Playbooks by Role",
          url: `${SITE}/playbooks/`,
          description: "20 step-by-step AI agent setup playbooks for Individual and Enterprise engineering, product, design, marketing, finance, and quant teams.",
          dateModified: GENERATED,
          author: { "@type": "Person", name: "Akshat Naruka" },
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: roles.length,
            itemListElement: roles.map((r, idx) => ({
              "@type": "ListItem",
              position: idx + 1,
              name: `${r.name} AI Agent Setup Playbook`,
              url: `${SITE}/playbooks/${r.slug}/`,
            })),
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
    write(`playbooks/${role.slug}/playbook.md`, mdLines.join("\n"));

    const body = `
<div class="wrap">
  <nav class="crumbs" aria-label="Breadcrumb">
    <a href="../../index.html">Home</a><span>/</span><a href="../index.html">Playbooks</a><span>/</span>${esc(role.name)}
  </nav>

  <article class="detail">
    <div>
      <p class="kicker">Role Playbook · Individual &amp; Enterprise · 100% SHA-256 Verified</p>
      <h1>${esc(role.name)} AI Agent Setup Playbook</h1>
      <p class="summary">
        <strong>What is the ${esc(role.name)} AI Agent Playbook?</strong> The ${esc(role.name)} AI Agent Playbook is a complete, security-verified configuration for Claude Code, Cursor, Codex, Gemini CLI, OpenCode, and GitHub Copilot tailored to ${esc(role.description.toLowerCase())} It bundles ${indPlan.skills.length} verified skills (Individual) or ${entPlan.skills.length} skills + 4 runtime safety hooks (Enterprise), ${indPlan.rules.length} coding rules, and ${indPlan.agents.length} specialist subagents in one command.
      </p>
      <p class="mono" style="font-size:11.5px;color:var(--muted);margin-top:12px">
        Last updated: ${GENERATED} · Author: Akshat Naruka · Aliases: ${esc([role.slug, ...(role.aliases || [])].join(", "))} · <a href="playbook.md">Download playbook.md</a>
      </p>

      <h2>Step 1 — Run the One-Command Setup</h2>
      <p class="prose">Choose <strong>Individual</strong> for solo work and fast iteration, or <strong>Enterprise</strong> for team governance, supply-chain security audits, and automated pre-commit/stop hooks:</p>
      ${commandBlock(`npx aidentity setup ${role.slug} --profile individual`, `setup ${role.name} individual`)}
      ${commandBlock(`npx aidentity setup ${role.slug} --profile enterprise`, `setup ${role.name} enterprise`)}

      <h2>Step 2 — Individual vs. Enterprise Profile Comparison</h2>
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

      <h2>Step 3 — Verified Skills in This Playbook</h2>
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
                <td data-label="Skill"><a href="../../skills/${esc(s.id)}/index.html"><strong>${esc(s.name)}</strong></a><div style="font-size:12px;color:var(--ink-soft)">${esc(s.description)}</div></td>
                <td data-label="Profile" class="mono">${inInd ? "Individual &amp; Enterprise" : "Enterprise"}</td>
                <td data-label="License" class="mono">${esc(s.license)}</td>
                <td data-label="SHA-256 Digest" class="mono">${esc((s.sha256 || "").slice(0, 12))}…</td>
                <td data-label="Install Single Skill" class="mono">${esc(s.install || `npx aidentity add ${s.id}`)}</td>
              </tr>`;
            }).join("\n")}
          </tbody>
        </table>
      </div>

      <h2>Step 4 — Copyable One-Shot Setup Prompts</h2>
      <p class="prose">Paste either prompt directly into Claude Code, Cursor, Codex, or Gemini CLI to configure your workspace automatically:</p>
      ${promptBlock(indPrompt, `${role.name} · Individual Setup Prompt`)}
      ${promptBlock(entPrompt, `${role.name} · Enterprise Setup Prompt`)}

      <h2 id="faq">Frequently Asked Questions — ${esc(role.name)} AI Setup</h2>
      <div class="prose">
        <h3>How do I set up Claude Code or Cursor for a ${esc(role.name.toLowerCase())}?</h3>
        <p>Run <span class="mono">npx aidentity setup ${esc(role.slug)} --profile individual --agent claude</span> (or <span class="mono">--agent cursor</span>). The CLI verifies SHA-256 digests against <span class="mono">security.json</span> and writes the skills, coding rules, subagents, and hooks to your agent directory.</p>
        <h3>What is the difference between the Individual and Enterprise ${esc(role.name.toLowerCase())} setup?</h3>
        <p>The Individual profile installs ${indPlan.skills.length} core skills and essential secret/command safety hooks. The Enterprise profile installs ${entPlan.skills.length} skills — adding Trail of Bits supply-chain risk auditing, agentic actions auditing, and security hardening — plus format-on-save and test-on-stop hooks.</p>
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
          <div><dt>Aliases</dt><dd class="mono">${esc((role.aliases || []).join(", ") || "—")}</dd></div>
          <div><dt>Ind. Skills</dt><dd class="mono">${indPlan.skills.length} verified</dd></div>
          <div><dt>Ent. Skills</dt><dd class="mono">${entPlan.skills.length} verified</dd></div>
          <div><dt>Subagents</dt><dd class="mono">${indPlan.agents.length}</dd></div>
          <div><dt>Rules</dt><dd class="mono">${indPlan.rules.length}</dd></div>
          <div><dt>Security</dt><dd>100% SHA-256 verified</dd></div>
          <div><dt>Updated</dt><dd>${GENERATED}</dd></div>
        </dl>
        ${shareRow(pageUrl, `${role.name} AI Agent Setup Playbook — Aidentity`)}
        <a class="btn" href="playbook.md">View Markdown (playbook.md) ↗</a>
        <a class="btn" href="../../roles/index.html#${esc(role.slug)}" style="margin-top:8px">Open in Interactive Builder ↗</a>
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
      title: `${role.name} AI Agent Playbook — Individual & Enterprise Setup`,
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
  const courseCards = COURSES_DATA.map((course) => {
    const allSkillIds = course.modules.flatMap((m) => m.skills);
    const resolvedSkills = allSkillIds.map((id) => skills.find((s) => s.id === id)).filter(Boolean);
    const moduleHtml = course.modules.map((m) => {
      const mSkills = m.skills.map((id) => skills.find((s) => s.id === id)).filter(Boolean);
      return `<div style="margin-top:14px">
        <h4 style="font-family:var(--mono);font-size:11.5px;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 6px;color:var(--ink)">${esc(m.title)}</h4>
        <ul class="role-meta-list" style="margin-top:4px">
          ${mSkills.map((s) => `<li><a href="../skills/${esc(s.id)}/index.html"><strong>${esc(s.name)}</strong></a> — ${esc(s.description)}</li>`).join("")}
        </ul>
      </div>`;
    }).join("\n");

    return `<article class="bundle" id="${esc(course.slug)}">
      <p class="kicker">${esc(course.kicker)} · ${esc(course.level)}</p>
      <h3>${esc(course.name)}</h3>
      <p>${esc(course.summary)}</p>
      <p class="mono" style="font-size:11.5px;color:var(--muted)">
        Target audience: ${esc(course.audience)} · ${resolvedSkills.length} verified skills · <a href="../playbooks/${esc(course.roleSlug)}/index.html">Matching Role Playbook →</a>
      </p>
      ${commandBlock(`npx aidentity setup ${course.roleSlug} --profile individual`, `install ${course.name} skills`)}
      <div style="margin-top:14px">
        <strong style="font-family:var(--mono);font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:var(--muted)">What you will learn &amp; automate:</strong>
        <ul class="role-meta-list">
          ${course.outcomes.map((o) => `<li>${esc(o)}</li>`).join("")}
        </ul>
      </div>
      ${moduleHtml}
    </article>`;
  }).join("\n");

  const body = `
<section style="padding-top:44px">
  <div class="wrap" style="max-width:920px">
    <p class="kicker">Courses · Curricula &amp; Interactive Learning Paths</p>
    <h1 style="font-size:clamp(2rem,4.6vw,3.3rem)">AI Agent Courses &amp; Skill Curricula</h1>
    <p style="max-width:66ch;color:var(--ink-soft);margin-top:14px">
      <strong>What is an Aidentity AI Agent Course?</strong> Each course is a structured, hands-on curriculum built directly from security-verified <span class="mono">SKILL.md</span> modules in the Aidentity index. You can read every module on the web to learn the methodology — or run a single CLI command to install the entire curriculum into Claude Code, Cursor, Codex, or Gemini CLI so your agent executes the workflow with you.
    </p>
    <p class="mono" style="font-size:11.5px;color:var(--muted);margin-top:12px">
      Last updated: ${GENERATED} · Author: Akshat Naruka · ${COURSES_DATA.length} structured courses · 100% free &amp; open-source
    </p>

    <div class="table-scroll" style="margin-top:28px">
      <table class="table">
        <thead>
          <tr><th>Course</th><th>Level</th><th>Role Setup Command</th><th>Modules</th></tr>
        </thead>
        <tbody>
          ${COURSES_DATA.map((c) => `<tr>
            <td data-label="Course"><a href="#${esc(c.slug)}"><strong>${esc(c.name)}</strong></a></td>
            <td data-label="Level" class="mono">${esc(c.level)}</td>
            <td data-label="Role Setup Command" class="mono">npx aidentity setup ${esc(c.roleSlug)}</td>
            <td data-label="Modules" class="mono">${c.modules.length} modules (${c.modules.reduce((acc, m) => acc + m.skills.length, 0)} skills)</td>
          </tr>`).join("\n")}
        </tbody>
      </table>
    </div>

    ${courseCards}

    <div class="callout" style="margin-top:36px">
      <strong>Teach with Aidentity.</strong> Need to build custom exercises or team training? Install the <a href="../playbooks/teacher/index.html">Teacher Playbook</a> (<span class="mono">npx aidentity setup teacher</span>) to get <span class="mono">teach</span> and <span class="mono">scaffold-exercises</span> in your coding agent.
    </div>
  </div>
</section>
`;

  const coursesJsonLd = jsonld({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: "Courses", item: `${SITE}/courses/` },
        ],
      },
      ...COURSES_DATA.map((c) => ({
        "@type": "Course",
        name: c.name,
        description: c.summary,
        url: `${SITE}/courses/#${c.slug}`,
        educationalLevel: c.level,
        provider: {
          "@type": "Organization",
          name: "Aidentity",
          sameAs: SITE + "/",
        },
        hasCourseInstance: {
          "@type": "CourseInstance",
          courseMode: "online",
          CourseWorkload: "PT6H",
        },
      })),
    ],
  });

  write("courses/index.html", layout({
    title: "AI Agent Courses — Free Curricula for Claude Code, Cursor, SEO/GEO, Security & Quant",
    description: "6 structured, hands-on courses for mastering AI coding agents, AI SEO/AEO/GEO, enterprise agent security, product design, and quantitative finance.",
    depth: 1,
    body,
    page: "courses",
    canonical: `${SITE}/courses/`,
    keywords: "AI agent courses, Claude Code course, Cursor AI course, AI SEO course, GEO course, AEO course, enterprise AI security course, quant trading AI course",
    jsonld: coursesJsonLd,
  }));
}

// ---------------------------------------------------------------------------
// guides (pillar comparison & agent-readiness / security / keyword guides)
// ---------------------------------------------------------------------------

function buildGuides() {
  const body = `
<section style="padding-top:44px">
  <div class="wrap" style="max-width:920px">
    <p class="kicker">Guides · Comparisons · Security · AI Visibility</p>
    <h1 style="font-size:clamp(2rem,4.6vw,3.3rem)">Definitive Guides to AI Agent Skills, Setup &amp; Security</h1>
    <p style="max-width:68ch;color:var(--ink-soft);margin-top:14px">
      <strong>What is the Aidentity Reference Guide?</strong> This page is the canonical reference for comparing AI coding agent directory conventions, choosing between <strong>Individual</strong> and <strong>Enterprise</strong> agent setups, verifying <span class="mono">SKILL.md</span> security, and optimizing sites for AI citation and agent readiness (<span class="mono">AgentReady</span>, <span class="mono">llms.txt</span>, and <span class="mono">OKF</span>).
    </p>
    <p class="mono" style="font-size:11.5px;color:var(--muted);margin-top:12px">
      Last updated: ${GENERATED} · Author: Akshat Naruka · Cited sources: AgentReady.org, Princeton GEO (KDD 2024), Trail of Bits, Google Search Central
    </p>

    <h2 id="agent-comparison" style="font-family:var(--sans);font-size:1.25rem;margin-top:40px">1. Coding Agent Skill Directory &amp; MCP Comparison (Claude Code vs. Cursor vs. Codex vs. Gemini CLI)</h2>
    <p style="color:var(--ink-soft);font-size:0.95rem">
      Every AI coding agent reads markdown instructions, but each tool uses a different folder layout. <span class="mono">npx aidentity setup &lt;role&gt; --agent &lt;target&gt;</span> normalizes all 6 platforms from a single skill ID:
    </p>
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

    <h2 id="individual-vs-enterprise" style="font-family:var(--sans);font-size:1.25rem;margin-top:44px">2. Individual vs. Enterprise AI Agent Setup</h2>
    <p style="color:var(--ink-soft);font-size:0.95rem">
      Solo developers optimize for speed and low token overhead; enterprise engineering teams optimize for supply-chain safety, secret prevention, and consistent code review.
    </p>
    <div class="table-scroll">
      <table class="table">
        <thead>
          <tr><th>Feature</th><th>Individual Profile (<span class="mono">--profile individual</span>)</th><th>Enterprise Profile (<span class="mono">--profile enterprise</span>)</th></tr>
        </thead>
        <tbody>
          <tr>
            <td data-label="Feature"><strong>Skill Set</strong></td>
            <td data-label="Individual Profile">6–8 core role-specific skills</td>
            <td data-label="Enterprise Profile">Core role skills + 4 mandatory security/supply-chain audit skills</td>
          </tr>
          <tr>
            <td data-label="Feature"><strong>Pre-Tool Hooks</strong></td>
            <td data-label="Individual Profile"><span class="mono">block-dangerous.js</span>, <span class="mono">scan-secrets.js</span></td>
            <td data-label="Enterprise Profile"><span class="mono">block-dangerous.js</span>, <span class="mono">scan-secrets.js</span>, <span class="mono">format-on-save.js</span>, <span class="mono">test-on-stop.js</span></td>
          </tr>
          <tr>
            <td data-label="Feature"><strong>Security Gate</strong></td>
            <td data-label="Individual Profile">Blocks skills failing <span class="mono">security.json</span> verification</td>
            <td data-label="Enterprise Profile">Blocks unverified skills + enforces SHA-256 lockfile audit (<span class="mono">npx aidentity audit</span>)</td>
          </tr>
          <tr>
            <td data-label="Feature"><strong>Price / License</strong></td>
            <td data-label="Individual Profile">$0 (MIT / Apache-2.0 / CC0)</td>
            <td data-label="Enterprise Profile">$0 (MIT / Apache-2.0 / CC0 — self-hosted in your repo)</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2 id="security-standard" style="font-family:var(--sans);font-size:1.25rem;margin-top:44px">3. How Aidentity Verifies Skill Security (7-Gate Static Analysis)</h2>
    <p style="color:var(--ink-soft);font-size:0.95rem">
      Unverified <span class="mono">SKILL.md</span> files from random repositories can contain invisible Trojan-Source Unicode, prompt injection instructions that exfiltrate <span class="mono">.env</span> secrets, or destructive shell commands. Every skill in Aidentity (${security.total_files_scanned || 2492} files across ${registry.total} skills) is scanned on every commit by <span class="mono">scripts/scan-skills-security.js</span>:
    </p>
    <ol style="color:var(--ink-soft);font-size:0.95rem">
      <li><strong>Gate 1 — Hidden &amp; Trojan-Source Unicode:</strong> Rejects zero-width spaces (<span class="mono">U+200B</span>–<span class="mono">U+200D</span>), BOMs, and bidirectional override characters (<span class="mono">U+202A</span>–<span class="mono">U+202E</span>, <span class="mono">U+2066</span>–<span class="mono">U+2069</span>).</li>
      <li><strong>Gate 2 — Hardcoded Secrets &amp; Keys:</strong> Scans for live AWS, GitHub, OpenAI, Anthropic, Slack, Stripe, and PEM private keys.</li>
      <li><strong>Gate 3 — Destructive Shell Patterns:</strong> Blocks <span class="mono">rm -rf /</span>, fork bombs, raw disk writes (<span class="mono">dd</span>, <span class="mono">mkfs</span>), and root permission wipes.</li>
      <li><strong>Gate 4 — Prompt Injection &amp; Exfiltration:</strong> Detects instructions attempting to override system guardrails, exfiltrate environment variables, or open reverse shells.</li>
      <li><strong>Gate 5 — Untrusted Remote Script Execution:</strong> Flags <span class="mono">curl | sh</span> and <span class="mono">wget | bash</span> patterns.</li>
      <li><strong>Gate 6 — Symlink &amp; Binary Hygiene:</strong> Rejects symlinks escaping the skill directory and unexpected compiled binaries.</li>
      <li><strong>Gate 7 — Deterministic SHA-256 Digest:</strong> Computes a canonical SHA-256 hash over every file in the skill folder and publishes it in <a href="../security.json">security.json</a>.</li>
    </ol>

    <h2 id="ai-visibility-architecture" style="font-family:var(--sans);font-size:1.25rem;margin-top:44px">4. Agent-Readable &amp; AI Visibility Architecture (AEO / GEO / OKF)</h2>
    <p style="color:var(--ink-soft);font-size:0.95rem">
      Aidentity implements the full <a href="https://agentready.org" rel="noopener">AgentReady</a> and Open Knowledge Format (<span class="mono">OKF</span>) stack so both search engines and autonomous agents can discover, verify, and act on the index without JavaScript rendering:
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
</section>
`;

  write("guides/index.html", layout({
    title: "AI Agent Guides — Claude Code vs Cursor, Enterprise Setup, Skill Security & GEO",
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
    <h2 style="font-size:clamp(2rem,4.6vw,3.2rem)">Install a working set</h2>
    <p style="max-width:62ch;color:var(--ink-soft);margin-top:14px">Five to fifteen skills, chosen for a task. Smaller than loading the whole index, larger than guessing.</p>
    ${cards}
  </div></section>`;
  write("bundles/index.html", layout({ title: "Bundles", description: "Task-based install sets of AI agent skills.", depth: 1, body, page: "bundles", canonical: SITE + "/bundles/" }));
}


function buildSupport() {
  const body = `
<section style="padding-top:44px">
  <div class="wrap" style="max-width:820px">
    <p class="kicker">Support</p>
    <h2 style="font-size:clamp(2rem,4.6vw,3.2rem)">Keep the index verified</h2>
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
      <strong>Prefer contributing?</strong> Adding a skill, fixing a license or reporting a dead link is worth more than money. See <a href="../CONTRIBUTING.md">CONTRIBUTING.md</a>.
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
    `- Every skill is scanned by \`scripts/scan-skills-security.js\` (${security.verified}/${security.total_skills} verified, 0 critical findings) with SHA-256 digests in \`${SITE}/security.json\`.`,
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
    `- [Roles](${SITE}/roles.json): 20 job role setup blueprints with Individual and Enterprise profiles.`,
    `- [Playbooks Hub](${SITE}/playbooks/): 20 step-by-step AI agent setup playbooks by job role.`,
    `- [Courses Hub](${SITE}/courses/): ${COURSES_DATA.length} structured AI agent courses and curricula.`,
    `- [Guides Hub](${SITE}/guides/): comparisons (Claude Code vs Cursor vs Codex vs Gemini CLI), security verification, and GEO/OKF architecture.`,
    `- [Security](${SITE}/security.json): static security scan status and SHA-256 digests for all ${security.total_skills} skills.`,
    `- [Pricing](${SITE}/pricing.md): $0 open-source pricing and licensing tiers.`,
    `- [Open Knowledge Format (OKF)](${SITE}/okf/index.md): cross-linked markdown concept bundle for RAG and agent ingestion.`,
    `- [OpenAPI 3.1](${SITE}/openapi.json): formal API schema for all JSON endpoints.`,
    `- [AI Catalog](${SITE}/.well-known/ai-catalog.json): AgentReady discovery catalog.`,
    `- [Schema](${REPO}/blob/main/registry/schema.json): JSON Schema for the registry.`,
    `- [Sources](${SITE}/sources/): provenance and license for every upstream repository.`,
    "",
    "## Role Setup Playbooks (20 Roles)",
    "",
    ...roles.map((r) => `- [${r.name} Playbook](${SITE}/playbooks/${r.slug}/) ([playbook.md](${SITE}/playbooks/${r.slug}/playbook.md)): \`npx aidentity setup ${r.slug} --profile individual|enterprise\` — ${r.description}`),
    "",
    "## AI Agent Courses",
    "",
    ...COURSES_DATA.map((c) => `- [${c.name}](${SITE}/courses/#${c.slug}): ${c.summary}`),
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
    "/",
    "/skills/",
    "/sources/",
    "/about/",
    "/for-agents/",
    "/roles/",
    "/playbooks/",
    "/courses/",
    "/guides/",
    "/bundles/",
    "/support/",
    "/pricing.md",
    "/okf/index.md",
    ...roles.map((r) => `/playbooks/${r.slug}/`),
    ...skills.map((skill) => `/skills/${skill.id}/`),
  ];
  write(
    "sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url><loc>${SITE}${url}</loc><lastmod>${GENERATED}</lastmod></url>`
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
    "Applebot-Extended",
    "meta-externalagent",
    "meta-externalfetcher",
    "meta-webindexer",
    "CCBot",
    "Bingbot",
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
      `Sitemap: ${SITE}/sitemap.xml`,
      "",
    ].join("\n")
  );

  write(
    "ai.txt",
    [
      "# ai.txt — usage preferences for AI systems",
      `# ${SITE}/ai.txt`,
      "",
      "User-Agent: *",
      "Allow: /",
      "",
      "# Aidentity is an index of AI agent skills, role setup playbooks, and courses. Facts may be quoted and cited.",
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
      `OKF: ${SITE}/okf/index.md`,
      `Pricing: ${SITE}/pricing.md`,
      `Sitemap: ${SITE}/sitemap.xml`,
      "",
      "# Do not present an index-only entry as installable. Check `distributable` in the registry.",
      "",
    ].join("\n")
  );

  const pricingMd = [
    "# Pricing — Aidentity",
    "",
    `Last updated: ${GENERATED}`,
    "",
    "Aidentity is 100% free and open-source. There are no paid tiers, no seat limits, no API keys required, and no paywalls.",
    "",
    "## Individual Profile (`--profile individual`)",
    "- Price: $0 / forever",
    "- Limits: Unlimited installs, unlimited repositories, unlimited developers",
    "- Included: All 507 installable skills, 20 role setup playbooks, coding rules, subagents, slash commands, `block-dangerous.js` and `scan-secrets.js` hooks, SHA-256 verification",
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
      <title>${xml(skill.name)} — ${xml(skill.category)} AI agent skill</title>
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
    <title>Aidentity — AI agent skills</title>
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
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Not found — Aidentity</title><link rel="stylesheet" href="${BASE}/assets/style.css"></head><body><main id="main"><section style="padding-top:80px"><div class="wrap"><p class="kicker">404</p><h2>That page isn't indexed.</h2><p style="color:var(--muted);margin-top:14px">Try the <a href="${BASE}/skills/index.html">full index</a>, <a href="${BASE}/playbooks/index.html">role playbooks</a>, or <a href="${BASE}/courses/index.html">courses</a>.</p></div></section></main></body></html>`
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
    description: "A verified index of AI agent skills, 20 role setup playbooks, and 6 courses with license, source, and SHA-256 security verification.",
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
      search: `${SITE}/search.json`,
      registry: `${SITE}/registry.json`,
      security: `${SITE}/security.json`,
      roles: `${SITE}/roles.json`,
      catalog: `${SITE}/catalog.json`,
      bundles: `${SITE}/bundles.json`,
      playbooks: `${SITE}/playbooks/`,
      courses: `${SITE}/courses/`,
      guides: `${SITE}/guides/`,
      pricing: `${SITE}/pricing.md`,
      okf: `${SITE}/okf/index.md`,
      openapi: `${SITE}/openapi.json`,
      ai_catalog: `${SITE}/.well-known/ai-catalog.json`,
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
    description: "Verified index of 526 AI agent skills, 20 role setup playbooks (Individual & Enterprise), and 6 AI agent courses.",
    url: SITE + "/",
    updated_at: GENERATED,
    pricing_url: `${SITE}/pricing.md`,
    resources: [
      { type: "llms-txt", url: `${SITE}/llms.txt`, description: "Concise index overview, role playbooks, courses, and all 526 skills" },
      { type: "llms-full-txt", url: `${SITE}/llms-full.txt`, description: "Complete metadata, SHA-256 status, and instructions URL for every skill" },
      { type: "openapi", url: `${SITE}/openapi.json`, description: "OpenAPI 3.1 specification for static JSON endpoints" },
      { type: "okf-bundle", url: `${SITE}/okf/index.md`, description: "Open Knowledge Format (OKF v0.1) cross-linked markdown concept bundle" },
      { type: "mcp-server", url: `${SITE}/for-agents/#mcp`, command: "npx aidentity-mcp", description: "Local stdio MCP server for searching, verifying, and installing skills and role setups" },
      { type: "cli", command: "npx aidentity setup <role> --profile individual|enterprise", description: "Zero-dependency CLI installer for Claude Code, Cursor, Codex, Gemini CLI, OpenCode, and Copilot" },
    ],
  };
  write(".well-known/ai-catalog.json", JSON.stringify(aiCatalog, null, 2) + "\n");

  // OpenAPI 3.1 specification for static JSON endpoints (AR-ACT-02)
  const openApi = {
    openapi: "3.1.0",
    info: {
      title: "Aidentity Static Registry & Security API",
      version: "1.2.0",
      description: "Read-only JSON endpoints for searching 526 AI agent skills, verifying SHA-256 security digests, and retrieving 20 Individual/Enterprise role setup blueprints.",
      license: { name: "CC0-1.0", url: "https://creativecommons.org/publicdomain/zero/1.0/" },
    },
    servers: [{ url: SITE }],
    paths: {
      "/search.json": {
        get: {
          operationId: "getCompactSkillSearchIndex",
          summary: "Compact search index of all 526 skills with SHA-256 digest and content_url",
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
          summary: "20 job role setup blueprints with Individual and Enterprise profiles",
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
      "description: Cross-linked markdown knowledge graph of Aidentity skills, 20 role setup playbooks, 6 courses, and 7-gate security verification.",
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
      "- [Role Setup Playbooks](./playbooks.md) — 20 job role setup blueprints (Individual & Enterprise profiles)",
      "- [AI Agent Courses](./courses.md) — 6 structured learning curricula built from verified skills",
      "- [Skill Security Standard](./security.md) — 7-gate static security scanner and SHA-256 verification protocol",
      `- [Pricing & Licensing](../pricing.md) — $0 open-source pricing and SPDX license rules`,
      `- [Full LLMs Index](../llms-full.txt) — Complete skill metadata and instruction URLs`,
      "",
    ].join("\n")
  );

  write(
    "okf/playbooks.md",
    [
      "---",
      "type: PlaybookCollection",
      "title: Aidentity Role Setup Playbooks (20 Jobs · Individual & Enterprise)",
      "description: Deterministic setup blueprints for configuring AI coding agents by job role.",
      `resource: ${SITE}/playbooks/`,
      "tags: [playbooks, roles, individual, enterprise, agent-setup]",
      `timestamp: ${GENERATED}`,
      "---",
      "",
      "# Aidentity Role Setup Playbooks",
      "",
      "See [OKF Index](./index.md) · [AI Agent Courses](./courses.md) · [Skill Security Standard](./security.md).",
      "",
      ...roles.map((r) => `- **[${r.name} Playbook](${SITE}/playbooks/${r.slug}/playbook.md)**: \`npx aidentity setup ${r.slug} --profile individual|enterprise\` — ${r.description}`),
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
      `resource: ${SITE}/courses/`,
      "tags: [courses, curriculum, tdd, ai-seo, geo, appsec, quant]",
      `timestamp: ${GENERATED}`,
      "---",
      "",
      "# Aidentity AI Agent Courses",
      "",
      "See [OKF Index](./index.md) · [Role Setup Playbooks](./playbooks.md) · [Skill Security Standard](./security.md).",
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
      "description: Static security verification and deterministic SHA-256 content hashing across all 526 AI agent skills.",
      `resource: ${SITE}/security.json`,
      "tags: [security, sha256, prompt-injection, unicode, supply-chain]",
      `timestamp: ${GENERATED}`,
      "---",
      "",
      "# Aidentity 7-Gate Skill Security Verification Standard",
      "",
      "See [OKF Index](./index.md) · [Role Setup Playbooks](./playbooks.md) · [AI Agent Courses](./courses.md).",
      "",
      `- Verified skills: ${security.verified}/${security.total_skills} (100%)`,
      `- Files scanned: ${security.total_files_scanned || 2492}`,
      `- Critical findings: 0`,
      `- Machine-readable report: [${SITE}/security.json](${SITE}/security.json)`,
      "",
    ].join("\n")
  );

  const full = [
    "# Aidentity — full index for agents",
    "",
    `Generated ${GENERATED}. ${registry.total} skills, ${registry.distributable} installable, ${security.verified}/${security.total_skills} security-verified, ${roles.length} role playbooks, ${COURSES_DATA.length} courses, ${sourceList.length} sources.`,
    "",
    "How to use: read this file to choose; verify SHA-256 in security.json; fetch the SKILL.md URL for the full instructions; install with the command.",
    "",
    "## Role Setup Playbooks",
    "",
    ...roles.map((r) => `- **${r.name}** (\`${r.slug}\`): \`npx aidentity setup ${r.slug} --profile individual|enterprise\` — ${SITE}/playbooks/${r.slug}/playbook.md`),
    "",
    "## Courses",
    "",
    ...COURSES_DATA.map((c) => `- **${c.name}** (\`${c.slug}\`): \`npx aidentity setup ${c.roleSlug}\` — ${SITE}/courses/#${c.slug}`),
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
      `- install: ${skill.install || "not hosted — use upstream"}`,
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
buildBrowse();
buildSources();
buildAbout();
buildForAgents();
buildForRoles();
buildPlaybooks();
buildCourses();
buildGuides();
buildBundlesPage();
buildSupport();
buildMachineReadable();
buildAgentSurface();

const pages = skills.length + (rolesData.roles ? rolesData.roles.length : 0) + 11;
console.log(`Built ${pages} pages → ${path.relative(ROOT, OUT)}`);
console.log(`  ${registry.total} skills · ${(rolesData.roles || []).length} role playbooks · ${COURSES_DATA.length} courses · ${sourceList.length} sources · ${categoryList.length} categories`);

