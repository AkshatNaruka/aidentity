#!/usr/bin/env node

/**
 * Install a bundle or a single skill into an agent's skills directory.
 *
 *   node scripts/install.js starter-10 --platform claude
 *   node scripts/install.js mattpocock/engineering/tdd --platform cursor
 *   node scripts/install.js --list
 *
 * Flags:
 *   --platform <claude|cursor|codex|gemini|opencode|copilot>
 *   --global      install into the home directory instead of the project
 *   --dry-run     print destinations without writing
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const registry = JSON.parse(fs.readFileSync(path.join(ROOT, "registry", "skills.json"), "utf8"));
const bundleFile = path.join(ROOT, "bundles", "bundles.json");
const bundles = fs.existsSync(bundleFile) ? JSON.parse(fs.readFileSync(bundleFile, "utf8")).bundles : [];

const PLATFORMS = {
  claude: ".claude/skills",
  cursor: ".cursor/skills",
  codex: ".codex/skills",
  gemini: ".gemini/skills",
  opencode: ".opencode/skills",
  copilot: ".github/skills",
};

function parse(argv) {
  const positional = [];
  const flags = {};
  const booleans = new Set(["global", "dry-run", "list", "help"]);
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) {
      positional.push(token);
      continue;
    }
    const key = token.slice(2);
    if (booleans.has(key)) flags[key] = true;
    else {
      flags[key] = argv[i + 1];
      i += 1;
    }
  }
  return { positional, flags };
}

const { positional, flags } = parse(process.argv.slice(2));

if (flags.list || positional[0] === "list") {
  for (const bundle of bundles) {
    console.log(`${bundle.slug.padEnd(18)} ${String(bundle.skills.length).padStart(2)} skills  ${bundle.name}`);
  }
  process.exit(0);
}

if (flags.help || !positional[0]) {
  console.log(`Usage: node scripts/install.js <bundle|skill-id> --platform <name> [--global] [--dry-run]

Bundles:
${bundles.map((b) => `  ${b.slug.padEnd(18)} ${b.description}`).join("\n")}

Platforms: ${Object.keys(PLATFORMS).join(", ")}`);
  process.exit(flags.help ? 0 : 1);
}

const target = positional[0];
const platform = flags.platform;
if (!platform || !PLATFORMS[platform]) {
  console.error(`error: --platform must be one of: ${Object.keys(PLATFORMS).join(", ")}`);
  process.exit(1);
}

const bundle = bundles.find((entry) => entry.slug === target);
const requested = bundle
  ? bundle.skills
  : [target, ...registry.skills.filter((skill) => skill.name === target).map((skill) => skill.id)];

const resolved = requested.map((id) => {
  const skill = registry.skills.find((entry) => entry.id === id);
  if (!skill) {
    console.error(`error: unknown skill id "${id}"${bundle ? ` in bundle ${bundle.slug}` : ""}`);
    process.exit(1);
  }
  return skill;
});

const base = flags.global
  ? path.join(process.env.HOME || process.env.USERPROFILE, PLATFORMS[platform])
  : path.join(process.cwd(), PLATFORMS[platform]);

let installed = 0;
let skipped = 0;

for (const skill of resolved) {
  if (!skill.distributable || !skill.path) {
    console.error(`skip: ${skill.id} is indexed but not hosted (${skill.source.license}).`);
    skipped += 1;
    continue;
  }
  const source = path.join(ROOT, path.dirname(skill.path));
  const destination = path.join(base, path.basename(skill.id));

  if (flags["dry-run"]) {
    console.log(`would install ${skill.id} → ${path.relative(process.cwd(), destination)}`);
    installed += 1;
    continue;
  }
  if (fs.existsSync(destination)) {
    console.error(`skip: ${path.relative(process.cwd(), destination)} already exists`);
    skipped += 1;
    continue;
  }
  fs.mkdirSync(base, { recursive: true });
  fs.cpSync(source, destination, { recursive: true });
  console.log(`installed ${skill.id} → ${path.relative(process.cwd(), destination)}`);
  installed += 1;
}

console.log(`\n${installed} installed, ${skipped} skipped · ${platform} · ${bundle ? bundle.slug : "single skill"}`);
process.exit(skipped && !installed ? 1 : 0);
