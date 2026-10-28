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

function layout({ title, description, depth, body, page, canonical, jsonld }) {
  const p = up(depth);
  const fullTitle = title ? `${title} — Aidentity` : "Aidentity — the verified index of agent skills";
  const metaDescription =
    description ||
    "A verified, machine-readable index of AI agent skills. One ID, one command, works in every coding agent.";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(metaDescription)}">
<link rel="canonical" href="${esc(canonical || SITE + "/")}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(metaDescription)}">
<meta property="og:url" content="${esc(canonical || SITE + "/")}">
<meta name="twitter:card" content="summary">
<meta name="theme-color" content="#f7f4ed" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#121210" media="(prefers-color-scheme: dark)">
<link rel="icon" href="${p}assets/favicon.svg" type="image/svg+xml">
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
    <p style="margin:0"><a href="${p}skills/index.html">Browse</a> · <a href="${p}sources/index.html">Sources</a> · <a href="${p}about/index.html">About</a> · <a href="${p}registry.json">registry.json</a> · <a href="${p}llms.txt">llms.txt</a></p>
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
  const featured = startHere.slice(0, 6);
  const topCategories = categoryList.slice(0, 12);
  const distributable = registry.distributable;

  const body = `
<section class="hero">
  <div class="wrap">
    <p class="kicker">Agent skills · indexed · verified weekly</p>
    <h1>The index of agent skills that <em>still work</em>.</h1>
    <p class="lede">
      ${registry.total} skills from ${sourceList.length} sources. Every entry carries its author, its license,
      and the date it was last checked. Install any of them into Claude Code, OpenCode, Codex, Cursor,
      Copilot or Gemini CLI with one command.
    </p>
    ${commandBlock("npx aidentity add mattpocock/engineering/code-review", "install command")}
    <p class="hero-links">
      <a href="skills/index.html">Browse all ${registry.total} →</a>
      <a href="sources/index.html">Where they come from</a>
      <a href="${REPO}" rel="noopener">Source on GitHub</a>
    </p>
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
    <table class="table">
      <thead>
        <tr><th>Repository</th><th>Author</th><th>License</th><th>Skills</th></tr>
      </thead>
      <tbody>
        ${sourceList
          .map(
            (source) => `<tr>
          <td><a href="${source.url}" rel="noopener">${esc(source.repo)}</a></td>
          <td>${esc(source.author)}</td>
          <td class="mono">${esc(licenseLabel(source.license))}</td>
          <td class="mono">${source.count}</td>
        </tr>`
          )
          .join("\n")}
      </tbody>
    </table>
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
    layout({ title: null, depth: 0, body, page: "home", canonical: SITE + "/" })
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

  const jsonld = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: skill.name,
    description: skill.description,
    url: `${SITE}/skills/${skill.id}/`,
    author: { "@type": "Person", name: skill.source.author },
    license: skill.source.license,
    isPartOf: { "@type": "WebSite", name: "Aidentity", url: SITE },
  }).replace(/</g, "\\u003c");

  return layout({
    title: skill.name,
    description: skill.description,
    depth,
    body,
    page: "skill",
    canonical: `${SITE}/skills/${skill.id}/`,
    jsonld,
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

    <table class="table" style="margin-top:36px">
      <thead>
        <tr><th>Repository</th><th>License</th><th>Skills</th><th>Hosted</th><th>Checked</th></tr>
      </thead>
      <tbody>
        ${sourceList
          .map(
            (source) => `<tr>
          <td>
            <a href="${source.url}" rel="noopener">${esc(source.repo)}</a>
            <div class="mono" style="font-size:11px">${esc(source.author)}</div>
          </td>
          <td class="mono">${esc(licenseLabel(source.license))}</td>
          <td class="mono">${source.count}</td>
          <td class="mono">${source.publish === false ? "no — index only" : "yes"}</td>
          <td class="mono">${esc(source.verified)}</td>
        </tr>`
          )
          .join("\n")}
      </tbody>
    </table>

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
    })
  );
}

// ---------------------------------------------------------------------------
// machine-readable + assets
// ---------------------------------------------------------------------------

function buildMachineReadable() {
  write("registry.json", JSON.stringify(registry, null, 2) + "\n");

  const llms = [
    "# Aidentity",
    "",
    "> A verified, machine-readable index of AI agent skills. One ID, one command, works in every coding agent.",
    "",
    `Generated ${GENERATED}. ${registry.total} skills indexed, ${registry.distributable} installable, ${sourceList.length} upstream sources.`,
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
    "npx aidentity add <id>",
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

  write("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);

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
}

// ---------------------------------------------------------------------------

fs.rmSync(OUT, { recursive: true, force: true });
buildAssets();
buildHome();
buildBrowse();
buildSources();
buildAbout();
buildMachineReadable();

const pages = skills.length + 5;
console.log(`Built ${pages} pages → ${path.relative(ROOT, OUT)}`);
console.log(`  ${registry.total} skills · ${sourceList.length} sources · ${categoryList.length} categories`);
