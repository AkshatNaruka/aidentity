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
const sources = JSON.parse(fs.readFileSync(path.join(ROOT, "registry", "sources.json"), "utf8")).sources;
const verified = fs.existsSync(path.join(ROOT, "registry", "verified.json"))
  ? JSON.parse(fs.readFileSync(path.join(ROOT, "registry", "verified.json"), "utf8"))
  : { sources: {} };

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

function layout({ title, description, depth, body, page, canonical, jsonld, ogType = "website", keywords = "" }) {
  const p = up(depth);
  const fullTitle = title ? `${title} — Aidentity` : "Aidentity — the verified index of agent skills";
  const rawDescription =
    description ||
    "A verified, machine-readable index of AI agent skills. One ID, one command, works in every coding agent.";
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
    <p style="margin:0"><a href="${p}skills/index.html">Browse</a> · <a href="${p}sources/index.html">Sources</a> · <a href="${p}about/index.html">About</a> · <a href="${p}registry.json">registry.json</a> · <a href="${p}llms.txt">llms.txt</a> · <a href="${p}feed.xml">RSS</a></p>
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
    "npx AkshatNaruka/aidentity add code-review",
    "npx AkshatNaruka/aidentity add expo-router",
    "npx AkshatNaruka/aidentity add audit-context-building",
    "npx AkshatNaruka/aidentity add copywriting",
  ];
  const featured = startHere.slice(0, 6);
  const topCategories = categoryList.slice(0, 12);
  const distributable = registry.distributable;

  const body = `
<section class="hero">
  <div class="wrap hero-grid">
    <div class="hero-copy">
    <p class="kicker">Agent skills · indexed · verified weekly</p>
    <h1>The index of agent skills that <em>still work</em>.</h1>
    <p class="lede">
      Aidentity is a verified index of ${registry.total} AI agent skills from ${sourceList.length} sources.
      Every entry carries its author, its license, and the date it was last checked. Install any of them into Claude Code, OpenCode, Codex, Cursor,
      Copilot or Gemini CLI with one command.
    </p>
    ${rotatingCommandBlock(heroCommands)}
    <p class="hero-links">
      <a href="skills/index.html">Browse all ${registry.total} →</a>
      <a href="sources/index.html">Where they come from</a>
      <a href="${REPO}" rel="noopener">Source on GitHub</a>
    </p>
    ${shareRow(SITE + "/", "Aidentity — the verified index of AI agent skills")}
    </div>
    <div class="hero-art" aria-hidden="true">${HERO_ART}</div>
  </div>
</section>

<div class="wrap">
  <div class="stats">
    <div><b>${registry.total}</b><span>Skills indexed</span></div>
    <div><b>${distributable}</b><span>Installable here</span></div>
    <div><b>${sourceList.length}</b><span>Upstream sources</span></div>
    <div><b>6</b><span>Agents supported</span></div>
  </div>
</div>

<section>
  <div class="wrap">
    <div class="section-head">
      <h2>Why an index, and not another list</h2>
    </div>
    <div class="three">
      <div>
        <span class="num">01</span>
        <h3>Links rot. Quietly.</h3>
        <p>Most skill collections are a markdown file that was accurate once. Every source here is re-checked weekly by CI, and the date is printed on the page. If a source dies, it gets flagged, not ignored.</p>
      </div>
      <div>
        <span class="num">02</span>
        <h3>Licenses are invisible until they aren't.</h3>
        <p>Each entry states its license and author. Content we can't redistribute is indexed but not hosted — clearly marked. That is the difference between a useful index and a takedown notice.</p>
      </div>
      <div>
        <span class="num">03</span>
        <h3>Every agent invents its own folder.</h3>
        <p>One skill ID installs into six different agents. You shouldn't have to learn each tool's directory layout, or re-copy files when you switch editors.</p>
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
        <span class="count">${category.count} skills</span>
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
    <div class="section-head"><h2>Add a skill</h2></div>
    <p style="max-width:60ch;color:var(--ink-soft)">One JSON record, one pull request. If it's accurate and correctly licensed, it ships the same day. No editorial committee, no backlog.</p>
    ${commandBlock("node scripts/build-registry.js && node scripts/check-licenses.js", "validate command")}
    <p class="hero-links"><a href="${REPO}/blob/main/CONTRIBUTING.md" rel="noopener">Contributing guide →</a></p>
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
      keywords: "AI agent skills, Claude Code skills, Codex skills, Cursor skills, OpenCode skills, agent skills registry",
      jsonld: jsonld({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebSite",
            "@id": SITE + "/#website",
            url: SITE + "/",
            name: "Aidentity",
            description: "A verified index of AI agent skills with licenses, sources and one-command install.",
            inLanguage: "en",
            potentialAction: {
              "@type": "SearchAction",
              target: SITE + "/skills/?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          },
          { "@type": "Organization", "@id": SITE + "/#organization", name: "Aidentity", url: SITE + "/", sameAs: [REPO] },
          {
            "@type": "CollectionPage",
            "@id": SITE + "/#collection",
            name: "Agent skills index",
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
    keywords: [skill.name, skill.category, ...skill.tags, "AI agent skill", "SKILL.md", "install"].join(", "),
    jsonld: pageJsonLd,
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
      <a href="../registry.json">registry.json</a> · <a href="../llms.txt">llms.txt</a> ·
      <a href="../sitemap.xml">sitemap.xml</a>.</p>

      <h2 id="faq" style="font-family:var(--sans);font-size:1.15rem;margin-top:36px">Questions</h2>
      <h3 style="font-size:0.98rem;margin:18px 0 6px">What is Aidentity?</h3>
      <p>Aidentity is a verified index of ${registry.total} AI agent skills. Each entry records its source repository, author, license, category and last verification date. You install any hosted skill with one command.</p>
      <h3 style="font-size:0.98rem;margin:18px 0 6px">Are the skills free to use?</h3>
      <p>Most are MIT or Apache-2.0. Trail of Bits skills are CC BY-SA 4.0. ${registry.total - registry.distributable} skills from Anthropic are indexed with a link only, because their upstream license does not permit redistribution. Every page states its license.</p>
      <h3 style="font-size:0.98rem;margin:18px 0 6px">How do I install one?</h3>
      <p>Run <span class="mono">npx AkshatNaruka/aidentity add &lt;id&gt;</span>, or copy the folder from <span class="mono">skills/&lt;source&gt;/&lt;name&gt;/</span>. The CLI detects Claude Code, Cursor, Codex, Gemini CLI, OpenCode or Copilot and writes to the right directory.</p>
      <h3 style="font-size:0.98rem;margin:18px 0 6px">How do you keep the index accurate?</h3>
      <p>CI rebuilds the registry on every change and checks the license policy. A weekly job requests every upstream repository, writes the result to <span class="mono">registry/verified.json</span> and opens a report PR when something is unreachable.</p>
      <h3 style="font-size:0.98rem;margin:18px 0 6px">Can I add a skill?</h3>
      <p>Yes. One JSON record and a pull request. CI validates the schema, the license and that the source resolves. See the contributing guide.</p>

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
      description: "How Aidentity indexes, verifies and licenses AI agent skills.",
      depth: 1,
      body,
      page: "about",
      canonical: SITE + "/about/",
      jsonld: jsonld({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          { "@type": "Question", name: "What is Aidentity?", acceptedAnswer: { "@type": "Answer", text: `Aidentity is a verified index of ${registry.total} AI agent skills with source, author, license and verification data, installable with one command.` } },
          { "@type": "Question", name: "Are the skills free to use?", acceptedAnswer: { "@type": "Answer", text: "Most are MIT or Apache-2.0. Trail of Bits skills are CC BY-SA 4.0. Some Anthropic skills are index-only because their license does not permit redistribution. Each page states its license." } },
          { "@type": "Question", name: "How do I install a skill?", acceptedAnswer: { "@type": "Answer", text: "Run npx AkshatNaruka/aidentity add <id>, or copy the folder from skills/<source>/<name>/. The CLI detects the agent and writes to its skills directory." } },
          { "@type": "Question", name: "How are sources verified?", acceptedAnswer: { "@type": "Answer", text: "CI rebuilds the registry and checks licenses on every change. A weekly job checks every upstream repository and reports dead sources." } }
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
      The index is designed to be read by machines first. Fetch one JSON file, filter it locally,
      then fetch the full <span class="mono">SKILL.md</span> only for the entries you shortlist.
      No scraping, no auth, no rate limit beyond GitHub Pages.
    </p>

    <h2 style="font-family:var(--sans);font-size:1.15rem;margin-top:36px">Endpoints</h2>
    <div class="table-scroll">
    <table class="table">
      <thead><tr><th>File</th><th>What it is</th><th>Size</th></tr></thead>
      <tbody>
        <tr><td data-label="File"><a href="../search.json">search.json</a></td><td data-label="What">Compact index: id, name, description, tags, license, install, content URL</td><td data-label="Size">~${Math.round(JSON.stringify(skills).length / 1024)} KB</td></tr>
        <tr><td data-label="File"><a href="../llms.txt">llms.txt</a></td><td data-label="What">Key facts and every skill with a one-line description</td><td data-label="Size">~${Math.round(JSON.stringify(skills).length / 1024)} KB</td></tr>
        <tr><td data-label="File"><a href="../llms-full.txt">llms-full.txt</a></td><td data-label="What">Every skill with metadata, install command and instruction URL</td><td data-label="Size">—</td></tr>
        <tr><td data-label="File"><a href="../registry.json">registry.json</a></td><td data-label="What">Full registry, schema-backed</td><td data-label="Size">—</td></tr>
        <tr><td data-label="File"><a href="../catalog.json">catalog.json</a></td><td data-label="What">Everything: skills, tools, hooks, commands, agents, rules, templates</td><td data-label="Size">—</td></tr>
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
      <span class="mono">get_skill</span>, <span class="mono">list_bundles</span> and
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
    <pre style="background:#14130f;color:#efeade;padding:16px;overflow-x:auto;font-size:12px"><code>Fetch https://akshatnaruka.github.io/aidentity/search.json
Filter for category "testing" and status "stable".
Return the three best matches with their install commands.

Read https://akshatnaruka.github.io/aidentity/llms.txt
I am building a Next.js + Supabase SaaS. Which bundle should I install, and why?

Fetch https://akshatnaruka.github.io/aidentity/agent.json
Store the endpoints. Use search.json for retrieval and content_url for full instructions.</code></pre>

    <h2 style="font-family:var(--sans);font-size:1.15rem;margin-top:36px">Rules agents must follow</h2>
    <ol style="color:var(--ink-soft);font-size:0.95rem">
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
      description: "Machine-readable endpoints, an MCP server, and prompts for agents that need to find and install AI agent skills.",
      depth: 1,
      body,
      page: "agents",
      canonical: SITE + "/for-agents/",
      keywords: "agent skills API, MCP server, AI agent skill search, llms.txt, agent-readable registry",
    })
  );
}

function buildMachineReadable() {
  write("registry.json", JSON.stringify(registry, null, 2) + "\n");

  const llms = [
    "# Aidentity",
    "",
    "> A verified, machine-readable index of AI agent skills. One ID, one command, works in every coding agent.",
    "",
    `Generated ${GENERATED}. ${registry.total} skills indexed, ${registry.distributable} installable, ${sourceList.length} upstream sources.`,
    "",
    "## Key facts",
    "",
    `- Aidentity is a verified index of AI agent skills. It is not a fork: each skill belongs to its upstream author.`,
    `- ${registry.total} entries: ${registry.distributable} hosted and installable, ${registry.total - registry.distributable} indexed with an upstream link only.`,
    `- Install: \`npx AkshatNaruka/aidentity add <id>\` or copy \`skills/<source>/<name>/\`.`,
    `- Licenses are per entry. MIT and Apache-2.0 are hosted; CC BY-SA 4.0 content keeps its share-alike terms; proprietary entries are not redistributed.`,
    `- Every source is re-checked weekly; \`registry/verified.json\` records the last check.`,
    `- Machine-readable: ${SITE}/registry.json (JSON), ${SITE}/search.json (compact search), ${SITE}/agent.json (manifest), ${SITE}/ai.txt (AI usage), ${SITE}/sitemap.xml (URLs), ${SITE}/feed.xml (RSS).`,
    "",
    "## How to use this index",
    "",
    "1. Fetch `search.json` once and keep it. Filter by `tags`, `category`, `status` and `description`.",
    "2. Fetch `content_url` for the full `SKILL.md` before recommending an install.",
    "3. If `content_url` is null the skill is index-only: link `upstream`, never install it.",
    "4. Install with `npx AkshatNaruka/aidentity add <id>` or copy from `https://github.com/AkshatNaruka/aidentity`.",
    "5. Local agents can run the MCP server: `node cli/mcp.js`.",
    "",
    "## Files",
    "",
    `- [Registry](${SITE}/registry.json): every skill with id, description, category, tags, status, source, license and install command.`,
    `- [Schema](${REPO}/blob/main/registry/schema.json): JSON Schema for the registry.`,
    `- [Sources](${SITE}/sources/): provenance and license for every upstream repository.`,
    "",
    "## Install",
    "",
    "```bash",
    "npx AkshatNaruka/aidentity add <id>",
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

  const aiBots = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-Web", "PerplexityBot", "Google-Extended", "Applebot-Extended", "CCBot", "Bingbot"];
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
      "# Aidentity is an index of AI agent skills. Facts may be quoted and cited.",
      "Citation: allowed",
      "Attribution: required (link to the page and to the upstream skill author)",
      "Training: allowed for the registry metadata; vendored skills keep their upstream licenses",
      "",
      `LLMs: ${SITE}/llms.txt`,
      `Registry: ${SITE}/registry.json`,
      `Sitemap: ${SITE}/sitemap.xml`,
      "",
      "# Do not present an index-only entry as installable. Check `distributable` in the registry.",
      "",
    ].join("\n")
  );

  write(
    "manifest.webmanifest",
    JSON.stringify(
      {
        name: "Aidentity",
        short_name: "Aidentity",
        description: "A verified index of AI agent skills.",
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
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Not found — Aidentity</title><link rel="stylesheet" href="${BASE}/assets/style.css"></head><body><main id="main"><section style="padding-top:80px"><div class="wrap"><p class="kicker">404</p><h2>That page isn't indexed.</h2><p style="color:var(--muted);margin-top:14px">Try the <a href="${BASE}/skills/index.html">full index</a>.</p></div></section></main></body></html>`
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
  for (const file of ["og.png", "apple-touch-icon.png"]) {
    const source = path.join(__dirname, "assets", file);
    if (!fs.existsSync(source)) continue;
    fs.mkdirSync(path.join(OUT, "assets"), { recursive: true });
    fs.copyFileSync(source, path.join(OUT, "assets", file));
  }
}


// ---------------------------------------------------------------------------
// agent surface: compact search index, manifest, raw skill files
// ---------------------------------------------------------------------------

function buildAgentSurface() {
  const url = (skill) => `${SITE}/skills/${skill.id}/`;
  const install = (skill) => skill.install || null;

  const search = skills.map((skill) => ({
    id: skill.id,
    name: skill.name,
    description: skill.description,
    category: skill.category,
    tags: skill.tags,
    status: skill.status,
    license: skill.source.license,
    source: skill.source.repo,
    install: install(skill),
    url: url(skill),
    content_url: skill.distributable && skill.path ? `${SITE}/skills/${skill.id}/SKILL.md` : null,
    upstream: skill.upstream ? skill.upstream.url : skill.source.url,
  }));
  write("search.json", JSON.stringify({ version: "1.0.0", updated: GENERATED, count: search.length, skills: search }, null, 2) + "\n");

  // Raw skill files so an agent can read the instructions without GitHub.
  for (const skill of skills) {
    if (!skill.distributable || !skill.path) continue;
    const source = path.join(ROOT, skill.path);
    if (!fs.existsSync(source)) continue;
    write(`skills/${skill.id}/SKILL.md`, fs.readFileSync(source));
  }

  // Bundles and the full catalog, served next to the registry.
  const bundlesFile = path.join(ROOT, "bundles", "bundles.json");
  if (fs.existsSync(bundlesFile)) write("bundles.json", fs.readFileSync(bundlesFile));
  const catalogFile = path.join(ROOT, "registry", "catalog.json");
  if (fs.existsSync(catalogFile)) write("catalog.json", fs.readFileSync(catalogFile));

  const manifest = {
    name: "aidentity",
    version: "1.0.0",
    description: "A verified index of AI agent skills with license, source and install metadata.",
    updated: GENERATED,
    counts: { skills: registry.total, installable: registry.distributable, sources: sourceList.length, bundles: 8 },
    endpoints: {
      search: `${SITE}/search.json`,
      registry: `${SITE}/registry.json`,
      catalog: `${SITE}/catalog.json`,
      bundles: `${SITE}/bundles.json`,
      llms: `${SITE}/llms.txt`,
      llms_full: `${SITE}/llms-full.txt`,
      ai: `${SITE}/ai.txt`,
      sitemap: `${SITE}/sitemap.xml`,
      mcp: `${SITE}/for-agents/#mcp`,
    },
    usage: [
      "Fetch /search.json once and keep it. Filter locally by tags, category, status and description.",
      "Fetch content_url for the full SKILL.md before recommending an install.",
      "Respect distributable: index-only entries (content_url null) must be linked upstream, not installed.",
      "Install with `npx AkshatNaruka/aidentity add <id>` or by copying the folder from the GitHub repository.",
    ],
  };
  write("agent.json", JSON.stringify(manifest, null, 2) + "\n");
  write(".well-known/agent.json", JSON.stringify(manifest, null, 2) + "\n");

  const full = [
    "# Aidentity — full index for agents",
    "",
    `Generated ${GENERATED}. ${registry.total} skills, ${registry.distributable} installable, ${sourceList.length} sources.`,
    "",
    "How to use: read this file to choose; fetch the SKILL.md URL for the full instructions; install with the command.",
    "",
  ];
  for (const skill of skills) {
    full.push(
      `## ${skill.name}`,
      "",
      `- id: \`${skill.id}\``,
      `- category: ${skill.category}`,
      `- license: ${skill.source.license}`,
      `- status: ${skill.status}`,
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
buildMachineReadable();
buildForAgents();
buildAgentSurface();

const pages = skills.length + 5;
console.log(`Built ${pages} pages → ${path.relative(ROOT, OUT)}`);
console.log(`  ${registry.total} skills · ${sourceList.length} sources · ${categoryList.length} categories`);
