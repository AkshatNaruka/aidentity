/**
 * Install lifecycle for Aidentity.
 *
 * Every install is recorded in a manifest at `.aidentity/installed.json`
 * (project) or `~/.aidentity/installed.json` (global). The manifest stores a
 * path-independent content hash of what was written, so `doctor` can tell you
 * whether a skill on disk still matches what you installed, and `update` can
 * replace it when the registry ships a new version.
 *
 * This is what turns `aidentity add` from a one-way file copy into something
 * you can inspect, reproduce and undo.
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { AGENT_TARGETS } = require("./agents");

const ROOT = path.join(__dirname, "..", "..");
const MANIFEST_VERSION = 1;

const AGENTS = Object.fromEntries(
  Object.entries(AGENT_TARGETS).map(([key, target]) => [
    key,
    { dir: target.skillsDir, label: target.label },
  ])
);

// ---------------------------------------------------------------------------
// Manifest
// ---------------------------------------------------------------------------

function manifestRoot({ cwd = process.cwd(), global = false } = {}) {
  return global ? process.env.HOME || process.env.USERPROFILE : cwd;
}

function manifestPath(options = {}) {
  return path.join(manifestRoot(options), ".aidentity", "installed.json");
}

function readManifest(options = {}) {
  const file = manifestPath(options);
  if (!fs.existsSync(file)) {
    return { version: MANIFEST_VERSION, updated_at: null, items: [] };
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
    return {
      version: parsed.version || MANIFEST_VERSION,
      updated_at: parsed.updated_at || null,
      items: Array.isArray(parsed.items) ? parsed.items : [],
    };
  } catch (error) {
    throw new Error(`corrupt manifest at ${file}: ${error.message}`);
  }
}

function writeManifest(manifest, options = {}) {
  const file = manifestPath(options);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const payload = {
    $schema: "https://akshatnaruka.github.io/aidentity/manifest.schema.json",
    version: MANIFEST_VERSION,
    updated_at: new Date().toISOString(),
    items: manifest.items.slice().sort((a, b) => a.id.localeCompare(b.id) || a.kind.localeCompare(b.kind)),
  };
  fs.writeFileSync(file, `${JSON.stringify(payload, null, 2)}\n`);
  return payload;
}

function upsertItem(manifest, item) {
  const items = manifest.items.filter((entry) => !(entry.id === item.id && entry.agent === item.agent && entry.kind === item.kind));
  items.push(item);
  return { ...manifest, items };
}

function dropItem(manifest, { id, agent, kind = "skill" }) {
  return {
    ...manifest,
    items: manifest.items.filter((entry) => !(entry.id === id && (!agent || entry.agent === agent) && entry.kind === kind)),
  };
}

// ---------------------------------------------------------------------------
// Hashing
// ---------------------------------------------------------------------------

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".git") continue;
    const full = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.isFile()) acc.push(full);
  }
  return acc;
}

/**
 * Content hash that survives a move: paths are relative to the skill root and
 * files are sorted, so the same skill hashes the same in the package and in
 * `.claude/skills/`.
 */
function contentHash(dir) {
  if (!fs.existsSync(dir)) return null;
  const stat = fs.statSync(dir);
  if (stat.isFile()) {
    return `sha256:${crypto.createHash("sha256").update(fs.readFileSync(dir)).digest("hex")}`;
  }
  const files = walk(dir).sort();
  const hash = crypto.createHash("sha256");
  for (const file of files) {
    const rel = path.relative(dir, file).split(path.sep).join("/");
    hash.update(rel);
    hash.update("\0");
    hash.update(fs.readFileSync(file));
  }
  return `sha256:${hash.digest("hex")}`;
}

function sourceDirFor(skill) {
  return path.join(ROOT, path.dirname(skill.path));
}

// ---------------------------------------------------------------------------
// Naming
// ---------------------------------------------------------------------------

/** Directory name for a skill inside an agent's skills folder. */
function skillDirName(skill, allSkills = []) {
  const base = path.basename(skill.id);
  const collisions = allSkills.filter((other) => path.basename(other.id) === base);
  if (collisions.length <= 1) return base;
  // Two skills with the same leaf name: namespace by source so neither
  // silently overwrites the other.
  return `${skill.source.key}--${base}`;
}

// ---------------------------------------------------------------------------
// Install / remove
// ---------------------------------------------------------------------------

function installOne(skill, { agentKey, global = false, cwd = process.cwd(), force = false, allSkills = [] }) {
  const target = AGENTS[agentKey];
  if (!target) throw new Error(`unknown agent "${agentKey}". Options: ${Object.keys(AGENTS).join(", ")}`);

  if (!skill.distributable || !skill.path) {
    throw new Error(`${skill.id} is index-only (${skill.source.license}); read it at ${skill.upstream ? skill.upstream.url : skill.source.url}`);
  }

  const source = sourceDirFor(skill);
  if (!fs.existsSync(source)) throw new Error(`source missing in package: ${path.dirname(skill.path)}`);

  const baseRoot = global ? manifestRoot({ global }) : cwd;
  const destBase = path.join(baseRoot, target.dir);
  const dirName = skillDirName(skill, allSkills);
  const destination = path.join(destBase, dirName);

  if (fs.existsSync(destination) && !force) {
    throw new Error(`${path.relative(cwd, destination) || destination} already exists. Use --force to overwrite, or aidentity remove ${skill.id}`);
  }

  const before = contentHash(source);
  fs.mkdirSync(destBase, { recursive: true });
  fs.cpSync(source, destination, { recursive: true, force: true });
  const after = contentHash(destination);

  if (before !== after) {
    throw new Error(`integrity check failed for ${skill.id}: copied content does not match the package`);
  }

  return {
    item: {
      id: skill.id,
      name: skill.name,
      kind: "skill",
      agent: agentKey,
      path: path.relative(baseRoot, destination).split(path.sep).join("/"),
      content_hash: after,
      source_repo: skill.source.repo,
      source_license: skill.source.license,
      installed_at: new Date().toISOString(),
    },
    destination,
    hash: after,
  };
}

function installSkills(skills, options = {}) {
  const manifest = readManifest(options);
  let next = manifest;
  const installed = [];
  const failed = [];

  for (const skill of skills) {
    try {
      const result = installOne(skill, { ...options, allSkills: options.allSkills || [] });
      next = upsertItem(next, result.item);
      installed.push({ id: skill.id, destination: result.destination, hash: result.hash });
    } catch (error) {
      failed.push({ id: skill.id, error: error.message });
    }
  }

  if (!options.dryRun && installed.length) writeManifest(next, options);
  return { installed, failed, dry_run: Boolean(options.dryRun) };
}

function removeSkill({ id, agent, cwd = process.cwd(), global = false, kind = "skill" }) {
  const options = { cwd, global };
  const manifest = readManifest(options);
  const matches = manifest.items.filter(
    (item) => item.id === id && item.kind === kind && (!agent || item.agent === agent)
  );

  if (!matches.length) {
    // Fall back to the conventional location so a hand-installed skill can
    // still be removed.
    const fallback = path.join(manifestRoot(options), AGENTS[agent || "claude"].dir, path.basename(id));
    if (!fs.existsSync(fallback)) throw new Error(`nothing installed for "${id}"`);
    fs.rmSync(fallback, { recursive: true, force: true });
    return { removed: [{ id, path: fallback, tracked: false }] };
  }

  const removed = [];
  let next = manifest;
  for (const item of matches) {
    const target = path.join(manifestRoot(options), item.path);
    if (fs.existsSync(target)) fs.rmSync(target, { recursive: true, force: true });
    next = dropItem(next, item);
    removed.push({ id, path: target, tracked: true, agent: item.agent });
  }
  writeManifest(next, options);
  return { removed };
}

// ---------------------------------------------------------------------------
// Status
// ---------------------------------------------------------------------------

function listInstalled({ cwd = process.cwd(), global = false } = {}) {
  const options = { cwd, global };
  const manifest = readManifest(options);
  return manifest.items.map((item) => {
    const absolute = path.join(manifestRoot(options), item.path);
    const present = fs.existsSync(absolute);
    const currentHash = present ? contentHash(absolute) : null;
    return {
      ...item,
      absolute_path: absolute,
      present,
      current_hash: currentHash,
      status: !present ? "missing" : currentHash === item.content_hash ? "ok" : "modified",
    };
  });
}

function doctor({ cwd = process.cwd(), global = false } = {}) {
  const options = { cwd, global };
  const items = listInstalled(options);
  const detected = Object.entries(AGENTS)
    .filter(([, agent]) => fs.existsSync(path.join(manifestRoot(options), agent.dir)))
    .map(([key, agent]) => ({ agent: key, label: agent.label, dir: agent.dir }));

  const tracked = new Set(items.map((item) => item.absolute_path));
  const orphans = [];
  for (const { agent } of detected) {
    const dir = path.join(manifestRoot(options), AGENTS[agent].dir);
    if (!fs.existsSync(dir)) continue;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const full = path.join(dir, entry.name);
      if (!tracked.has(full)) orphans.push({ agent, path: path.relative(manifestRoot(options), full) });
    }
  }

  const problems = [];
  for (const item of items) {
    if (item.status === "missing") problems.push({ level: "error", id: item.id, message: `recorded but missing on disk: ${item.path}` });
    if (item.status === "modified") problems.push({ level: "warn", id: item.id, message: `content changed since install: ${item.path}` });
  }
  for (const orphan of orphans) {
    problems.push({ level: "info", id: null, message: `untracked skill directory: ${orphan.path}` });
  }

  return {
    root: manifestRoot(options),
    global: Boolean(global),
    manifest: manifestPath(options),
    manifest_exists: fs.existsSync(manifestPath(options)),
    agents: detected,
    installed: items,
    orphans,
    problems,
    healthy: problems.filter((problem) => problem.level === "error").length === 0,
  };
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

function updateSkills({ ids = [], cwd = process.cwd(), global = false, dryRun = false, registry }) {
  const options = { cwd, global };
  const items = listInstalled(options).filter((item) => item.kind === "skill");
  const targets = ids.length ? items.filter((item) => ids.includes(item.id)) : items;
  const results = [];

  for (const item of targets) {
    const skill = registry.skills.find((entry) => entry.id === item.id);
    if (!skill) {
      results.push({ id: item.id, status: "gone", message: "no longer in the registry" });
      continue;
    }
    const source = sourceDirFor(skill);
    const packageHash = contentHash(source);
    const onDisk = item.present ? contentHash(item.absolute_path) : null;
    if (packageHash === onDisk) {
      results.push({ id: item.id, status: "current" });
      continue;
    }
    if (dryRun) {
      results.push({
        id: item.id,
        status: onDisk === item.content_hash ? "would-update" : "would-repair",
        from: onDisk,
        to: packageHash,
      });
      continue;
    }
    try {
      const manifest = readManifest(options);
      const result = installOne(skill, { ...options, agentKey: item.agent, force: true, allSkills: registry.skills });
      writeManifest(upsertItem(manifest, result.item), options);
      results.push({
        id: item.id,
        status: onDisk === item.content_hash ? "updated" : "repaired",
        hash: result.hash,
      });
    } catch (error) {
      results.push({ id: item.id, status: "failed", message: error.message });
    }
  }

  return results;
}

module.exports = {
  AGENTS,
  MANIFEST_VERSION,
  manifestPath,
  readManifest,
  writeManifest,
  contentHash,
  skillDirName,
  installOne,
  installSkills,
  removeSkill,
  listInstalled,
  updateSkills,
  doctor,
};
