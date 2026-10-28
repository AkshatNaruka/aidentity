#!/usr/bin/env node

/**
 * Build the skill registry.
 *
 * Walks skills/**, reads each SKILL.md frontmatter, and emits
 * registry/skills.json — the single source of truth consumed by the
 * website, the CLI, and the search index.
 *
 * Usage:
 *   node scripts/build-registry.js
 *   node scripts/build-registry.js --check   # exit 1 if output is stale
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SKILLS_DIR = path.join(ROOT, "skills");
const POINTERS_DIR = path.join(ROOT, "registry", "pointers");
const OUT_FILE = path.join(ROOT, "registry", "skills.json");
const SOURCES_FILE = path.join(ROOT, "registry", "sources.json");

// Canonical provenance, shared with scripts/check-licenses.js.
// publish: false => keep the entry as a pointer only, never vendor the content.
const SOURCES = JSON.parse(fs.readFileSync(SOURCES_FILE, "utf8")).sources;

/**
 * Sources we index but cannot host: their content lives in registry/pointers/*.json
 * as metadata only. Keeps coverage without redistributing restricted material.
 */
function loadPointers() {
  if (!fs.existsSync(POINTERS_DIR)) return [];
  return fs
    .readdirSync(POINTERS_DIR)
    .filter((file) => file.endsWith(".json"))
    .flatMap((file) => JSON.parse(fs.readFileSync(path.join(POINTERS_DIR, file), "utf8")).skills || [])
    .map((skill) => ({
      ...skill,
      status: skill.status || "stable",
      tags: skill.tags || [],
      category: categoryFor({ sourceKey: skill.source.key, rest: [], name: skill.name, description: skill.description, tags: skill.tags || [] }),
      distributable: false,
      install: null,
    }));
}

const STATUS_DIRS = new Set(["deprecated", "in-progress", "misc", "engineering", "productivity"]);

// Token → tag. Exact token matches only: substring matching labels every
// Google skill "cloud" and every description containing "agent" an agent skill.
const TOKEN_TAGS = {
  debug: "debugging",
  debugging: "debugging",
  test: "testing",
  tests: "testing",
  testing: "testing",
  tdd: "testing",
  review: "code-review",
  reviews: "code-review",
  security: "security",
  hardening: "security",
  frontend: "frontend",
  ui: "frontend",
  design: "design",
  docs: "documentation",
  documentation: "documentation",
  adr: "documentation",
  adrs: "documentation",
  perf: "performance",
  performance: "performance",
  deploy: "devops",
  deployment: "devops",
  ci: "devops",
  cd: "devops",
  observability: "devops",
  git: "git",
  plan: "planning",
  planning: "planning",
  spec: "planning",
  specs: "planning",
  tickets: "planning",
  agent: "agents",
  agents: "agents",
  subagents: "agents",
  prompt: "prompts",
  prompts: "prompts",
  memory: "memory",
  cloud: "cloud",
  gcp: "google-cloud",
  azure: "azure",
  ads: "ads",
  analytics: "analytics",
  migration: "migration",
  refactor: "refactoring",
  refactoring: "refactoring",
};

function parseFrontmatter(raw) {
  if (!raw.startsWith("---")) return {};
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return {};
  const block = raw.slice(3, end).split(/\r?\n/);

  const out = {};
  let key = null;
  let buffer = [];
  let mode = null;

  const flush = () => {
    if (key) {
      const value = buffer.join(" ").replace(/\s+/g, " ").trim();
      if (value) out[key] = value;
    }
    buffer = [];
  };

  for (const line of block) {
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (kv && !line.startsWith(" ")) {
      flush();
      key = kv[1];
      const rest = kv[2].trim();
      if (rest === "|" || rest === ">" || rest === "|-" || rest === ">-") {
        mode = "block";
      } else {
        mode = "inline";
        buffer.push(
          rest
            .replace(/^["']|["']$/g, "")
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, "\\")
        );
      }
      continue;
    }
    if (key && line.trim()) {
      if (mode === "block") buffer.push(line.trim());
      else if (mode === "inline" && !out[key]) buffer.push(line.trim());
    }
  }
  flush();
  return out;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9/]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-/]|[-/]$/g, "");
}

function inferTags(name, description) {
  const tokens = `${name} ${description}`.toLowerCase().split(/[^a-z0-9]+/);
  const tags = new Set();
  for (const token of tokens) {
    const tag = TOKEN_TAGS[token];
    if (tag) tags.add(tag);
  }
  return [...tags].sort().slice(0, 6);
}


// Curated taxonomy. Name matches win over description matches, and nested
// vendor sources keep their own path taxonomy.
const SOURCE_CATEGORY = {
  expo: "mobile",
  trailofbits: "security",
  caveman: "context",
  supabase: "database",
  "ui-ux-pro-max": "design",
  tastemaker: "design",
  "repo-scanner": "tooling",
  "agentii-investment-intelligence": "finance",
  "claude-trading-skills": "quant",
  "claude-ai-music-skills": "music",
  "agentii-ai-agentii-investment-intelligence": "finance",
  "agiprolabs-claude-trading-skills": "quant",
  "jtydhr88-lyric-writing-skills": "music",
  "jtydhr88-screenwriting-skills": "film",
  "emmapbingham-agentic-newsroom": "media",
  "agents365-ai-drawio-skill": "architecture",
  "abrahamferga-scrum-skills": "project-management",
};

const NAME_RULES = [
  ["finance", /\b(finance|financial|equity|investment|valuation|earnings|portfolio|banking|dcf|budget|forecast|invoice|tax|expense)\b/],
  ["quant", /\b(quant|quantitative|trading|backtest|derivative|volatility|arbitrage|cointegration|fixed-income)\b/],
  ["corporate", /\b(excel|spreadsheet|word|powerpoint|office|deck|report|business-plan|kpi|dashboard|data-cleaning|data-analyst)\b/],
  ["project-management", /\b(scrum|sprint|agile|backlog|kanban|standup|retrospective|project-management|user-story|velocity|capacity|stakeholder|impediment|release-notes)\b/],
  ["architecture", /\b(architecture|architect|system-design|c4|diagram|archify)\b/],
  ["music", /\b(music|audio|song|lyric|mastering|album|suno|ableton|sound)\b/],
  ["media", /\b(media|journalism|newsroom|editorial|broadcast|news)\b/],
  ["film", /\b(film|screenwriting|screenplay|storyboard|cinematography)\b/],
  ["legal", /\b(legal|contract|compliance|privacy|gdpr|terms)\b/],
  ["sales", /\b(sales|crm|prospecting|pipeline|gtm)\b/],
  ["support", /\b(support|helpdesk|ticket|escalation)\b/],
  ["education", /\b(teach|tutor|curriculum|course|lesson)\b/],
  ["people", /\b(recruit|hiring|interview|job-description|candidate|hr)\b/],
  ["seo", /\b(seo|backlink|backlinks|schema|programmatic-seo|site-architecture|ai-seo)\b/],
  ["copywriting", /\b(copywriting|copy-editing|article|newsletter|content-strategy|writing|comms)\b/],
  ["social", /\b(social|linkedin|twitter|instagram|tiktok|pinterest|reddit|thread|carousel|caption)\b/],
  ["email", /\b(email|emails|cold-email|sms)\b/],
  ["ads", /\b(ads|ad-creative|ppc|aso)\b/],
  ["analytics", /\b(analytics|attribution|ab-testing|conversion)\b/],
  ["cro", /\b(cro|signup|onboarding|paywall|paywalls|popup|popups|form|forms)\b/],
  ["pricing", /\b(pricing|offers|churn)\b/],
  ["growth", /\b(launch|referral|referrals|marketing|community|influencer|public-relations|events|co-marketing|directory|prospecting|revops)\b/],
  ["video", /\b(video|youtube|ffmpeg|veo|kling|wan|seedance|ugc)\b/],
  ["motion", /\b(motion|animation|gsap|motion-graphics|lottie)\b/],
  ["design", /\b(design|ui-ux|brand|theme|canvas|frontend-design|image|illustration|visual|art)\b/],
  ["frontend", /\b(frontend|react|nextjs|next|css|ui-styling|turbopack|web)\b/],
  ["mobile", /\b(expo|react-native|ios|android|mobile)\b/],
  ["database", /\b(postgres|sql|database|cosmos|spanner|alloydb|bigquery|redis)\b/],
  ["api", /\b(api|mcp|graphql|rest|openapi)\b/],
  ["security", /\b(security|audit|threat|vulnerab|supply-chain|semgrep|sarif|agentic-actions|hardening)\b/],
  ["testing", /\b(test|tests|testing|tdd|qa|playwright|cypress|e2e)\b/],
  ["debugging", /\b(debug|debugging|diagnos|bug|error-recovery)\b/],
  ["code-review", /\b(code-review|review)\b/],
  ["planning", /\b(plan|planning|spec|specs|ticket|tickets|roadmap|grill|interview|brainstorm|prototype|breakdown)\b/],
  ["git", /\b(git|worktree|commit|branch)\b/],
  ["docs", /\b(doc|docs|adr|adrs|documentation|pdf|docx|pptx|xlsx|coauthor|guide)\b/],
  ["agents", /\b(agent|agents|subagent|subagents|skill-creator|context-engineering|handoff|orchestrat|mcp-builder)\b/],
  ["memory", /\b(memory|remember|forget|recall|unified-memory)\b/],
  ["devops", /\b(ci|cd|deploy|deployment|observability|monitor|shipping|infra|kubernetes|docker|cloud-run|gke)\b/],
  ["performance", /\b(performance|perf)\b/],
  ["quality", /\b(eval|benchmark|verification|quality|maturity)\b/],
  ["context", /\b(caveman|compact|token|context)\b/],
];

function categoryFor({ sourceKey, rest, name, description, tags }) {
  if (sourceKey === "google-cloud" && rest[0] === "developers") return "developer-tools";
  if (sourceKey === "google-cloud" && rest.length > 1 && !STATUS_DIRS.has(rest[0])) return rest[0];
  if (sourceKey === "microsoft-azure") return "azure";
  if (SOURCE_CATEGORY[sourceKey]) return SOURCE_CATEGORY[sourceKey];
  const lowerName = name.toLowerCase();
  for (const [category, pattern] of NAME_RULES) {
    if (pattern.test(lowerName)) return category;
  }
  const lowerDescription = description.toLowerCase();
  for (const [category, pattern] of NAME_RULES) {
    if (pattern.test(lowerDescription)) return category;
  }
  return tags[0] || "engineering";
}

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.name === "SKILL.md") acc.push(full);
  }
  return acc;
}

function build() {
  const files = walk(SKILLS_DIR).sort();
  const skills = [];

  for (const file of files) {
    const rel = path.relative(SKILLS_DIR, path.dirname(file)).split(path.sep);
    const sourceKey = rel[0];
    const source = SOURCES[sourceKey] || {
      repo: sourceKey,
      url: `https://github.com/${sourceKey}`,
      license: "UNKNOWN",
      publish: false,
      author: "Unknown",
    };

    const fm = parseFrontmatter(fs.readFileSync(file, "utf8"));
    const name = fm.name || rel[rel.length - 1];
    const description = (fm.description || "").replace(/\s+/g, " ").trim();
    const rest = rel.slice(1);

    let status = "stable";
    if (rel.includes("deprecated")) status = "deprecated";
    else if (rel.includes("in-progress")) status = "in-progress";

    const id = slugify(rel.join("/"));
    const tags = inferTags(id, name, description);

    const category = categoryFor({ sourceKey, rest, name, description, tags });

    skills.push({
      id,
      name,
      description,
      category,
      tags,
      status,
      path: path.relative(ROOT, file),
      source: {
        key: sourceKey,
        repo: source.repo,
        url: source.url,
        author: source.author,
        license: source.license,
        ...(source.note ? { note: source.note } : {}),
      },
      distributable: source.publish !== false,
      install: source.publish === false ? null : `npx AkshatNaruka/aidentity add ${id}`,
    });
  }

  skills.push(...loadPointers());
  skills.sort((a, b) => a.id.localeCompare(b.id));

  const bySource = {};
  for (const skill of skills) {
    bySource[skill.source.key] = (bySource[skill.source.key] || 0) + 1;
  }

  return {
    $schema: "./schema.json",
    name: "aidentity",
    version: "1.0.0",
    generated_at: new Date().toISOString().slice(0, 10),
    total: skills.length,
    distributable: skills.filter((s) => s.distributable).length,
    by_source: bySource,
    skills,
  };
}

const registry = build();
const serialized = JSON.stringify(registry, null, 2) + "\n";

if (process.argv.includes("--check")) {
  const current = fs.existsSync(OUT_FILE) ? fs.readFileSync(OUT_FILE, "utf8") : "";
  if (current !== serialized) {
    console.error("registry/skills.json is stale. Run: node scripts/build-registry.js");
    process.exit(1);
  }
  console.log("registry/skills.json is up to date");
  process.exit(0);
}

fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
fs.writeFileSync(OUT_FILE, serialized);
console.log(
  `Wrote ${registry.total} skills (${registry.distributable} distributable) to ${path.relative(
    ROOT,
    OUT_FILE
  )}`
);
for (const [key, count] of Object.entries(registry.by_source)) {
  console.log(`  ${key.padEnd(22)} ${count}`);
}
