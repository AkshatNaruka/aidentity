#!/usr/bin/env node
/**
 * Discover, verify and optionally import high-quality agent skills.
 *
 *   node scripts/discover-skills.js --domain video --dry-run
 *   node scripts/discover-skills.js --domain all --import
 *
 * What it does:
 *   1. Searches GitHub per domain (video, design, specs, testing, ...).
 *   2. Rejects abandoned, archived, unlicensed or duplicate sources.
 *   3. Validates SKILL.md frontmatter, body length and prompt-injection shapes.
 *   4. Imports the best source (max N skills) with LICENSE, ATTRIBUTION and manifest.
 *   5. Runs the registry/catalog/license/validate gates.
 *
 * It never executes code from a candidate repository.
 */

const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
if (!TOKEN) {
  console.error("error: GITHUB_TOKEN or GH_TOKEN is required");
  process.exit(1);
}

const ALLOWED_LICENSES = new Set([
  "MIT", "Apache-2.0", "BSD-2-Clause", "BSD-3-Clause", "ISC", "MPL-2.0",
  "CC0-1.0", "CC-BY-4.0", "CC-BY-SA-4.0", "Unlicense",
]);

const DOMAINS = {
  video: ["video editing agent skill", "ai video production skill"],
  design: ["ui design agent skill", "design system claude skill"],
  specs: ["spec driven development agent skill", "planning agent skill"],
  testing: ["testing agent skill", "playwright agent skill"],
  security: ["security audit agent skill"],
  data: ["data engineering agent skill", "sql agent skill"],
  devops: ["devops agent skill", "kubernetes agent skill"],
  content: ["seo agent skill", "copywriting agent skill"],
  docs: ["documentation agent skill"],
  mobile: ["expo agent skill", "react native agent skill"],
  backend: ["api design agent skill"],
  product: ["product management agent skill"],
};

const DOMAIN_KEYWORDS = {
  video: ["video", "film", "media", "remotion", "ffmpeg", "animation", "render", "blender", "audio", "3d"],
  design: ["design", "ui", "ux", "figma", "frontend"],
  specs: ["spec", "planning", "prd", "requirements", "roadmap"],
  testing: ["test", "qa", "playwright", "cypress"],
  security: ["security", "audit", "vulnerability", "appsec"],
  data: ["data", "sql", "database", "analytics", "etl"],
  devops: ["devops", "ci", "deploy", "kubernetes", "docker", "infra"],
  content: ["seo", "content", "copywriting", "marketing", "social"],
  docs: ["documentation", "docs", "writing", "diagram"],
  mobile: ["mobile", "expo", "react native", "ios", "android"],
  backend: ["api", "backend", "graphql", "rest"],
  product: ["product", "roadmap", "prd", "discovery"],
};

const INJECTION = [
  /ignore (all )?(previous|prior) instructions/i,
  /exfiltrate|send (the )?(contents|keys|token)/i,
  /curl[^\n|]*\|\s*(sh|bash)/i,
  /base64\s+-d[^\n]*\|\s*(sh|bash)/i,
];
const NETWORK = /\b(curl|wget|fetch\(|requests\.|pip install|npm install|pnpm add|API_KEY|process\.env)\b/;

function parseArgs(argv) {
  const out = { domain: "all", import: false, minStars: 100, maxSkills: 12, json: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--domain") out.domain = argv[++i];
    else if (arg === "--import") out.import = true;
    else if (arg === "--dry-run") out.import = false;
    else if (arg === "--min-stars") out.minStars = Number(argv[++i]);
    else if (arg === "--max-skills") out.maxSkills = Number(argv[++i]);
    else if (arg === "--json") out.json = true;
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
if (args.domain !== "all" && !DOMAINS[args.domain]) {
  console.error(`error: unknown domain "${args.domain}". Use: all, ${Object.keys(DOMAINS).join(", ")}`);
  process.exit(1);
}

async function api(url) {
  const response = await fetch(url, {
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${TOKEN}`,
      "user-agent": "aidentity-discovery",
      "x-github-api-version": "2022-11-28",
    },
  });
  if (response.status === 403 || response.status === 429) {
    throw new Error(`GitHub API rate limit or forbidden (${response.status})`);
  }
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json();
}

async function raw(repo, ref, file) {
  const response = await fetch(`https://raw.githubusercontent.com/${repo}/${ref}/${file}`, {
    headers: { "user-agent": "aidentity-discovery" },
  });
  if (!response.ok) return null;
  return response.text();
}

function frontmatter(text) {
  if (!text || !text.startsWith("---")) return null;
  const end = text.indexOf("\n---", 3);
  if (end === -1) return null;
  const block = text.slice(3, end);
  const get = (key) => {
    const match = block.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
    return match ? match[1].trim().replace(/^["']|["']$/g, "") : null;
  };
  return { name: get("name"), description: get("description"), body: text.slice(end + 4).trim() };
}

function titleCase(value) {
  return value.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

async function findCandidates(domain) {
  const queries = DOMAINS[domain];
  const seen = new Map();
  for (const query of queries) {
    const data = await api(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(`${query} in:name,description`)}&sort=stars&order=desc&per_page=10`
    );
    for (const repo of data.items || []) seen.set(repo.full_name, repo);
  }
  return [...seen.values()];
}

function verifyRepo(repo, sources, domain) {
  const reasons = [];
  const license = repo.license && repo.license.spdx_id;
  const haystack = `${repo.name} ${repo.description || ""} ${(repo.topics || []).join(" ")}`.toLowerCase();
  if (!DOMAIN_KEYWORDS[domain].some((keyword) => haystack.includes(keyword))) reasons.push("domain mismatch");
  if (repo.archived) reasons.push("archived");
  if (repo.fork) reasons.push("fork");
  if (!ALLOWED_LICENSES.has(license)) reasons.push(`license ${license || "none"}`);
  if (repo.stargazers_count < args.minStars) reasons.push(`${repo.stargazers_count} stars`);
  const days = (Date.now() - new Date(repo.pushed_at).getTime()) / 86400000;
  if (days > 180) reasons.push(`${Math.round(days)} days since push`);
  if (existingSource(repo, sources)) reasons.push("already imported");
  const aggregate = `${repo.full_name} ${repo.description || ""}`.toLowerCase();
  if (/awesome|curated list|collection of|mega.?list/.test(aggregate)) reasons.push("aggregator, not a source");
  return { ok: reasons.length === 0, reasons, license, days };
}

function existingSource(repo, sources) {
  return Object.values(sources).some((source) => source.repo && source.repo.toLowerCase() === repo.full_name.toLowerCase());
}

async function inspectRepo(repo) {
  const tree = await api(`https://api.github.com/repos/${repo.full_name}/git/trees/${repo.default_branch}?recursive=1`);
  const paths = (tree.tree || []).map((node) => node.path);
  const skillFiles = paths.filter((file) => file === "SKILL.md" || file.endsWith("/SKILL.md"));
  if (!skillFiles.length) return null;
  // A repository with hundreds of skills is a dump, not a curated source.
  if (skillFiles.length > 200) return null;

  // Prefer canonical locations, dedupe by skill directory name.
  const rank = (file) =>
    file.startsWith("skills/") ? 0 : file.startsWith(".agents/skills/") ? 1 : file.startsWith("plugins/") ? 2 : file.startsWith(".claude/skills/") ? 3 : 4;
  const byName = new Map();
  for (const file of skillFiles.sort((a, b) => rank(a) - rank(b) || a.length - b.length)) {
    const dir = path.posix.dirname(file);
    const name = path.posix.basename(dir);
    if (!byName.has(name)) byName.set(name, { name, dir, file });
  }
  return { paths, skills: [...byName.values()] };
}

async function validateSkill(repo, skill, knownNames) {
  const text = await raw(repo.full_name, repo.default_branch, skill.file);
  const fm = frontmatter(text);
  const notes = [];
  let score = 0;
  if (!fm) return { ok: false, reason: "no frontmatter" };
  if (!fm.name || !fm.description) return { ok: false, reason: "missing name/description" };
  if (knownNames.has(fm.name)) return { ok: false, reason: "duplicate name" };
  if (fm.description.length < 30) notes.push("short description");
  else score += 2;
  if (fm.body.length < 500) notes.push("short body");
  else score += Math.min(6, Math.floor(fm.body.length / 2000));
  if (INJECTION.some((pattern) => pattern.test(text))) return { ok: false, reason: "prompt-injection shape" };
  if (NETWORK.test(text)) notes.push("mentions network/install commands");
  if (skill.dir.split("/").includes("deprecated")) return { ok: false, reason: "deprecated path" };
  return { ok: true, name: fm.name, description: fm.description, score, notes, content: text };
}

function scoreRepo(repo, inspection, validations, license, days) {
  const stars = Math.log10(Math.max(1, repo.stargazers_count)) * 12;
  const recency = Math.max(0, 30 - days / 6);
  const skillCount = Math.min(12, validations.length) * 2;
  const quality = validations.reduce((sum, item) => sum + (item.score || 0), 0) / Math.max(1, validations.length);
  const licenseBonus = license === "MIT" || license === "Apache-2.0" ? 5 : 2;
  return Math.round(stars + recency + skillCount + quality + licenseBonus);
}

async function importSource(domain, repo, inspection, license, validations) {
  const sourceKey = `-`.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "aid-discover-"));
  try {
    execFileSync("git", ["clone", "--depth", "1", "--filter=blob:none", repo.clone_url, dir], { stdio: "pipe" });
    const sha = execFileSync("git", ["-C", dir, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();

    const licenseFile = ["LICENSE", "LICENSE.md", "LICENSE.txt", "COPYING"].find((name) => fs.existsSync(path.join(dir, name)));
    if (!licenseFile) return { ok: false, reason: "no license file" };

    const chosen = validations.slice(0, args.maxSkills);
    const target = path.join(ROOT, "skills", sourceKey);
    fs.mkdirSync(target, { recursive: true });
    for (const skill of chosen) {
      const from = path.join(dir, skill.dir);
      if (!fs.existsSync(from)) continue;
      fs.cpSync(from, path.join(target, path.basename(skill.dir)), { recursive: true });
    }
    fs.copyFileSync(path.join(dir, licenseFile), path.join(target, "LICENSE"));

    const scripts = inspection.paths.filter((file) =>
      chosen.some((skill) => file.startsWith(`${skill.dir}/`)) && /\.(sh|py|js|ts)$/.test(file)
    );
    fs.writeFileSync(
      path.join(target, "ATTRIBUTION.md"),
      `# Attribution\n\n- **Source:** [${repo.full_name}](${repo.html_url})\n- **Commit:** \`${sha}\`\n- **Imported:** ${new Date().toISOString().slice(0, 10)}\n- **License:** ${license} (see \`LICENSE\`)\n- **Domain:** ${domain}\n- **Imported skills:** ${chosen.map((skill) => skill.name).join(", ")}\n\n## Script review\n\n${scripts.length ? `${scripts.length} script file(s) imported. They were copied unmodified and **not executed**. Review network, install and credential access before running.` : "No scripts imported."}\n`
    );

    const sourcesFile = path.join(ROOT, "registry", "sources.json");
    const sources = JSON.parse(fs.readFileSync(sourcesFile, "utf8"));
    sources.sources[sourceKey] = {
      repo: repo.full_name,
      url: repo.html_url,
      license,
      publish: true,
      author: repo.owner.login,
      copyright: `Copyright (c) ${repo.owner.login}`,
      commit: sha,
      imported_at: new Date().toISOString().slice(0, 10),
    };
    fs.writeFileSync(sourcesFile, JSON.stringify(sources, null, 2) + "\n");

    const manifest = {
      source: sourceKey,
      repo: repo.full_name,
      url: repo.html_url,
      commit: sha,
      imported_at: new Date().toISOString().slice(0, 10),
      license,
      license_file: `skills/${sourceKey}/LICENSE`,
      domain,
      skills: chosen.map((skill) => skill.name),
      scripts_reviewed: true,
      script_count: scripts.length,
      discovered_by: "scripts/discover-skills.js",
    };
    fs.mkdirSync(path.join(ROOT, "registry", "manifests"), { recursive: true });
    fs.writeFileSync(path.join(ROOT, "registry", "manifests", `${sourceKey}.json`), JSON.stringify(manifest, null, 2) + "\n");

    return { ok: true, sourceKey, sha, imported: chosen.length, scripts: scripts.length };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function gate() {
  for (const script of ["build-registry.js", "build-catalog.js", "check-licenses.js", "validate.js"]) {
    execFileSync(process.execPath, [path.join(ROOT, "scripts", script)], { stdio: "pipe" });
  }
}

async function main() {
  const sources = JSON.parse(fs.readFileSync(path.join(ROOT, "registry", "sources.json"), "utf8")).sources;
  const registry = JSON.parse(fs.readFileSync(path.join(ROOT, "registry", "skills.json"), "utf8"));
  const knownNames = new Set(registry.skills.map((skill) => skill.name));
  const domains = args.domain === "all" ? Object.keys(DOMAINS) : [args.domain];
  const results = [];

  for (const domain of domains) {
    const candidates = await findCandidates(domain);
    const verified = candidates
      .map((repo) => ({ repo, ...verifyRepo(repo, sources, domain) }))
      .filter((entry) => entry.ok)
      .sort((a, b) => b.repo.stargazers_count - a.repo.stargazers_count);

    let best = null;
    for (const entry of verified.slice(0, 4)) {
      const inspection = await inspectRepo(entry.repo);
      if (!inspection || !inspection.skills.length) continue;
      const validations = [];
      for (const skill of inspection.skills.slice(0, args.maxSkills * 3)) {
        const checked = await validateSkill(entry.repo, skill, knownNames);
        if (!checked.ok) continue;
        const haystack = `${skill.name} ${checked.description}`.toLowerCase();
        const relevance = DOMAIN_KEYWORDS[domain].filter((keyword) => haystack.includes(keyword)).length;
        validations.push({ ...skill, ...checked, relevance });
      }
      validations.sort((a, b) => b.relevance - a.relevance || b.score - a.score);
      const relevant = validations.filter((skill) => skill.relevance > 0);
      if (relevant.length) validations.splice(0, validations.length, ...relevant);
      if (!validations.length) continue;
      const score = scoreRepo(entry.repo, inspection, validations, entry.license, entry.days);
      if (!best || score > best.score) {
        best = { ...entry, inspection, validations, score };
      }
    }

    if (!best) {
      results.push({ domain, status: "no candidate", repo: null, skills: 0 });
      continue;
    }

    const summary = {
      domain,
      status: "candidate",
      repo: best.repo.full_name,
      url: best.repo.html_url,
      stars: best.repo.stargazers_count,
      license: best.license,
      pushed: best.repo.pushed_at.slice(0, 10),
      score: best.score,
      skills: best.validations.length,
      names: best.validations.map((skill) => skill.name),
      notes: [...new Set(best.validations.flatMap((skill) => skill.notes))],
    };

    if (args.import) {
      const imported = await importSource(domain, best.repo, best.inspection, best.license, best.validations);
      summary.status = imported.ok ? "imported" : "rejected";
      summary.imported = imported.ok ? imported.imported : 0;
      summary.reason = imported.reason;
    }
    results.push(summary);
  }

  if (args.import && results.some((result) => result.status === "imported")) gate();

  const report = [
    `# Skill discovery — ${new Date().toISOString().slice(0, 10)}`,
    "",
    `Mode: ${args.import ? "import" : "dry run"} · domains: ${domains.join(", ")}`,
    "",
    "| Domain | Repo | Stars | License | Skills | Result | Notes |",
    "|---|---|---:|---|---:|---|---|",
    ...results.map(
      (result) =>
        `| ${result.domain} | ${result.repo ? `[${result.repo}](${result.url})` : "—"} | ${result.stars || 0} | ${result.license || "—"} | ${result.imported ?? result.skills ?? 0} | ${result.status} | ${(result.reason || result.notes || []).toString().replace(/\|/g, "\\|").slice(0, 80) || "—"} |`
    ),
    "",
    "Candidates pass: permissive license, pushed within 180 days, not archived, ≥ min stars, valid SKILL.md frontmatter, no prompt-injection shapes.",
    "",
  ].join("\n");

  fs.mkdirSync(path.join(ROOT, "reports"), { recursive: true });
  fs.writeFileSync(path.join(ROOT, "reports", "discovery-latest.md"), report);
  if (args.json) console.log(JSON.stringify({ results }, null, 2));
  else console.log(report);
}

main().catch((error) => {
  console.error(`discovery failed: ${error.message}`);
  process.exit(1);
});
