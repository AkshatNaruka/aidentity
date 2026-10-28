#!/usr/bin/env node

/**
 * Validate the repository before CI or a release.
 *
 * Checks:
 *   1. Every SKILL.md has frontmatter name + description
 *   2. Skill ids are unique; duplicate names are reported as warnings
 *   3. Every vendored source ships a LICENSE
 *   4. Bundle references exist and stay between 5 and 15 skills
 *   5. Tool ids are unique and have an install command
 *   6. Catalog is current (delegates to build-catalog --check)
 *
 * Usage: node scripts/validate.js [--json]
 */

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const errors = [];
const warnings = [];
const fail = (message) => errors.push(message);
const warn = (message) => warnings.push(message);

function frontmatter(file) {
  const raw = fs.readFileSync(file, "utf8");
  if (!raw.startsWith("---")) return null;
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return null;
  const block = raw.slice(3, end);
  const get = (key) => {
    const match = block.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
    return match ? match[1].trim().replace(/^["']|["']$/g, "") : null;
  };
  return { name: get("name"), description: get("description") };
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

// 1 + 2 — skills
const skillFiles = walk(path.join(ROOT, "skills"), (file) => file.endsWith("SKILL.md"));
const ids = new Map();
const names = new Map();
for (const file of skillFiles) {
  const meta = frontmatter(file);
  const rel = path.relative(ROOT, file);
  if (!meta) {
    fail(`${rel}: missing YAML frontmatter`);
    continue;
  }
  if (!meta.name) fail(`${rel}: frontmatter is missing "name"`);
  if (!meta.description) fail(`${rel}: frontmatter is missing "description"`);
  const id = path.relative(path.join(ROOT, "skills"), path.dirname(file)).split(path.sep).join("/");
  if (ids.has(id)) fail(`duplicate skill id: ${id}`);
  ids.set(id, true);
  if (meta.name) {
    names.set(meta.name, (names.get(meta.name) || 0) + 1);
  }
}
for (const [name, count] of names) {
  if (count > 1) warn(`duplicate skill name "${name}" (${count} sources). Disambiguate in bundles.`);
}

// 3 — licenses
const sources = Object.entries(
  JSON.parse(fs.readFileSync(path.join(ROOT, "registry", "sources.json"), "utf8")).sources
);
for (const [key, source] of sources) {
  if (source.publish === false || source.firstParty) continue;
  const dir = path.join(ROOT, "skills", key);
  if (!fs.existsSync(dir)) continue;
  const has = ["LICENSE", "LICENSE.txt", "LICENSE.md", "COPYING"].some((name) => fs.existsSync(path.join(dir, name)));
  if (!has) fail(`skills/${key}: missing upstream LICENSE`);
}

// 4 — bundles
const bundleFile = path.join(ROOT, "bundles", "bundles.json");
const registry = JSON.parse(fs.readFileSync(path.join(ROOT, "registry", "skills.json"), "utf8"));
if (fs.existsSync(bundleFile)) {
  const bundles = JSON.parse(fs.readFileSync(bundleFile, "utf8")).bundles;
  const known = new Set(registry.skills.map((skill) => skill.id));
  const slugs = new Set();
  for (const bundle of bundles) {
    if (slugs.has(bundle.slug)) fail(`duplicate bundle slug: ${bundle.slug}`);
    slugs.add(bundle.slug);
    if (!bundle.description) fail(`bundle ${bundle.slug}: missing description`);
    if (bundle.skills.length < 5 || bundle.skills.length > 15) {
      fail(`bundle ${bundle.slug}: ${bundle.skills.length} skills (must be 5–15)`);
    }
    for (const id of bundle.skills) {
      if (!known.has(id)) fail(`bundle ${bundle.slug}: unknown skill "${id}"`);
    }
  }
}

// 5 — tools
const toolsFile = path.join(ROOT, "registry", "tools.json");
if (fs.existsSync(toolsFile)) {
  const tools = JSON.parse(fs.readFileSync(toolsFile, "utf8")).tools;
  const seen = new Set();
  for (const tool of tools) {
    if (seen.has(tool.id)) fail(`duplicate tool id: ${tool.id}`);
    seen.add(tool.id);
    for (const field of ["name", "description", "when_to_use", "install", "url", "license"]) {
      if (!tool[field]) fail(`tool ${tool.id}: missing ${field}`);
    }
    if (!Array.isArray(tool.command) || !tool.command.length) fail(`tool ${tool.id}: missing command array`);
  }
}

// 6 — catalog freshness
try {
  execFileSync(process.execPath, [path.join(ROOT, "scripts", "build-catalog.js"), "--check"], {
    stdio: "pipe",
  });
} catch {
  fail("registry/catalog.json is stale. Run: node scripts/build-catalog.js");
}

// report
const json = process.argv.includes("--json");
if (json) {
  console.log(JSON.stringify({ ok: errors.length === 0, errors, warnings }, null, 2));
} else {
  for (const message of warnings) console.warn(`warn  ${message}`);
  for (const message of errors) console.error(`FAIL  ${message}`);
  if (!errors.length) console.log(`Validated ${skillFiles.length} skills, ${names.size} unique names, ${errors.length} errors.`);
}
process.exit(errors.length ? 1 : 0);
