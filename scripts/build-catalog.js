#!/usr/bin/env node

/**
 * Build registry/catalog.json — the single machine-readable index for every
 * resource type in the repository.
 *
 * Skills come from registry/skills.json (already normalized). Non-skill
 * resources are discovered from their directories by frontmatter or filename.
 * Missing directories are skipped, so the catalog grows as the repo grows.
 *
 * Usage:
 *   node scripts/build-catalog.js
 *   node scripts/build-catalog.js --check
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "registry", "catalog.json");
const GENERATED = new Date().toISOString().slice(0, 10);

const skills = JSON.parse(fs.readFileSync(path.join(ROOT, "registry", "skills.json"), "utf8"));
const sources = JSON.parse(fs.readFileSync(path.join(ROOT, "registry", "sources.json"), "utf8")).sources;

function frontmatter(file) {
  const raw = fs.readFileSync(file, "utf8");
  if (!raw.startsWith("---")) return {};
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return {};
  const block = raw.slice(3, end).split(/\r?\n/);
  const out = {};
  let key = null;
  let buffer = [];
  const flush = () => {
    if (key) {
      const value = buffer.join(" ").replace(/\s+/g, " ").trim().replace(/^["']|["']$/g, "");
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
      if (["|", ">", "|-", ">-"].includes(rest)) {
        buffer.push("");
      } else {
        buffer.push(rest.replace(/^["']|["']$/g, ""));
      }
      continue;
    }
    if (key && line.trim()) buffer.push(line.trim());
  }
  flush();
  return out;
}

function walk(dir, predicate) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.name.startsWith(".")) continue;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (predicate(full)) out.push(full);
    }
  }
  return out.sort();
}

const entries = skills.skills.map((skill) => ({
  id: skill.id,
  type: "skill",
  name: skill.name,
  description: skill.description,
  category: skill.category,
  tags: skill.tags,
  status: skill.status,
  path: skill.path,
  source: skill.source,
  license: skill.source.license,
  distributable: skill.distributable,
  install: skill.install,
}));

// --- tools -----------------------------------------------------------------
for (const file of walk(path.join(ROOT, "tools"), (f) => f.endsWith(".md"))) {
  const fm = frontmatter(file);
  if (!fm.name) continue;
  entries.push({
    id: fm.id || `tool/${path.basename(file, ".md")}`,
    type: "tool",
    name: fm.name,
    description: fm.description || "",
    category: fm.category || "tool",
    tags: fm.tags ? fm.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    status: "stable",
    path: path.relative(ROOT, file),
    source: { key: "local", repo: "AkshatNaruka/aidentity", url: "https://github.com/AkshatNaruka/aidentity", author: "Aidentity contributors", license: "MIT" },
    license: "MIT",
    distributable: true,
    install: fm.install || null,
  });
}

// --- hooks / commands / agents / prompts / templates ------------------------
const DIRS = {
  hook: ["hooks", (f) => f.endsWith(".md") || f.endsWith(".sh") || f.endsWith(".js")],
  command: ["commands", (f) => f.endsWith(".md")],
  agent: ["agents", (f) => f.endsWith(".md") && !/README/i.test(f)],
  prompt: ["prompts", (f) => f.endsWith(".md") && !/README/i.test(f)],
  template: ["templates", (f) => /(AGENTS|CLAUDE)\.md$/.test(f)],
};

for (const [type, [dir, predicate]] of Object.entries(DIRS)) {
  for (const file of walk(path.join(ROOT, dir), predicate)) {
    if (type === "prompt" && file.includes("fabric-patterns")) continue;
    const fm = frontmatter(file);
    const base = path.basename(file).replace(/\.(md|sh|js)$/, "");
    entries.push({
      id: fm.id || `${type}/${base}`,
      type,
      name: fm.name || base,
      description: fm.description || "",
      category: fm.category || type,
      tags: fm.tags ? fm.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      status: "stable",
      path: path.relative(ROOT, file),
      source: { key: "local", repo: "AkshatNaruka/aidentity", url: "https://github.com/AkshatNaruka/aidentity", author: "Aidentity contributors", license: "MIT" },
      license: "MIT",
      distributable: true,
      install: null,
    });
  }
}

entries.sort((a, b) => a.type.localeCompare(b.type) || a.id.localeCompare(b.id));

const byType = {};
const bySource = {};
for (const entry of entries) {
  byType[entry.type] = (byType[entry.type] || 0) + 1;
  bySource[entry.source.key] = (bySource[entry.source.key] || 0) + 1;
}

const catalog = {
  $schema: "./catalog.schema.json",
  name: "aidentity",
  version: "1.0.0",
  generated_at: GENERATED,
  total: entries.length,
  by_type: byType,
  by_source: bySource,
  sources,
  entries,
};

const serialized = JSON.stringify(catalog, null, 2) + "\n";

if (process.argv.includes("--check")) {
  const current = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : "";
  if (current !== serialized) {
    console.error("registry/catalog.json is stale. Run: node scripts/build-catalog.js");
    process.exit(1);
  }
  console.log("registry/catalog.json is up to date");
  process.exit(0);
}

fs.writeFileSync(OUT, serialized);
console.log(`Wrote ${entries.length} entries to ${path.relative(ROOT, OUT)}`);
console.log("  " + Object.entries(byType).map(([key, value]) => `${key}:${value}`).join("  "));
