#!/usr/bin/env node

/**
 * License gate.
 *
 * Fails when the repo would redistribute content it has no right to publish.
 * Runs in CI on every PR and before any release.
 *
 * Checks:
 *   1. No content exists for a source marked `publish: false`
 *   2. Every vendored source ships its upstream LICENSE (and NOTICE where required)
 *   3. No SKILL.md belongs to a source missing from registry/sources.json
 *   4. Every registry entry carries an SPDX-shaped license
 *
 * Usage:
 *   node scripts/check-licenses.js
 *   node scripts/check-licenses.js --json
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SKILLS_DIR = path.join(ROOT, "skills");
const REGISTRY_FILE = path.join(ROOT, "registry", "skills.json");
const SOURCES_FILE = path.join(ROOT, "registry", "sources.json");

const SPDX_LIKE = /^(MIT|Apache-2\.0|BSD-[23]-Clause|ISC|MPL-2\.0|GPL-[23]\.0(-only|-or-later)?|LGPL-3\.0|AGPL-3\.0|CC0-1\.0|CC-BY-4\.0|Unlicense|LicenseRef-[A-Za-z0-9.-]+)$/;

const problems = [];
const warnings = [];
const add = (list, code, message) => list.push({ code, message });

const sources = JSON.parse(fs.readFileSync(SOURCES_FILE, "utf8")).sources;

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

// --- 1. Non-publishable sources must not be vendored -----------------------
for (const [key, source] of Object.entries(sources)) {
  if (source.publish !== false) continue;
  const dir = path.join(SKILLS_DIR, key);
  if (!fs.existsSync(dir)) continue;
  const leaked = fs
    .readdirSync(dir, { recursive: true })
    .filter((file) => fs.statSync(path.join(dir, file)).isFile())
    .filter((file) => !/^README(\.md)?$/i.test(path.basename(file)));

  if (leaked.length) {
    add(
      problems,
      "LICENSE_LEAK",
      `${key} is not redistributable (${source.license}) but ${leaked.length} file(s) are vendored, e.g. ${leaked
        .slice(0, 3)
        .join(", ")}. Remove the content and keep pointer entries in the registry.`
    );
  }
}

// --- 2. Vendored sources must ship their license ---------------------------
for (const [key, source] of Object.entries(sources)) {
  if (source.publish === false) continue;
  if (source.firstParty) continue;
  if (!exists(`skills/${key}`)) continue;

  const hasLicense = ["LICENSE", "LICENSE.txt", "LICENSE.md", "COPYING"].some((name) =>
    exists(`skills/${key}/${name}`)
  );
  if (!hasLicense) {
    add(problems, "MISSING_LICENSE", `skills/${key} is vendored under ${source.license} but has no LICENSE file.`);
  }
  if (source.license === "Apache-2.0" && !exists(`skills/${key}/NOTICE`)) {
    add(warnings, "MISSING_NOTICE", `skills/${key} is Apache-2.0 and should include a NOTICE file.`);
  }
}

// --- 3 & 4. Registry integrity -------------------------------------------
if (!fs.existsSync(REGISTRY_FILE)) {
  add(problems, "MISSING_REGISTRY", "registry/skills.json not found. Run: node scripts/build-registry.js");
} else {
  const registry = JSON.parse(fs.readFileSync(REGISTRY_FILE, "utf8"));
  const ids = new Set();

  for (const skill of registry.skills) {
    if (ids.has(skill.id)) add(problems, "DUPLICATE_ID", `Duplicate skill id: ${skill.id}`);
    ids.add(skill.id);

    if (!sources[skill.source.key]) {
      add(problems, "UNKNOWN_SOURCE", `${skill.id}: source "${skill.source.key}" missing from registry/sources.json`);
    }
    if (!SPDX_LIKE.test(skill.source.license || "")) {
      add(problems, "BAD_LICENSE", `${skill.id}: "${skill.source.license}" is not a valid SPDX identifier`);
    }
    if (skill.distributable && !exists(skill.path)) {
      add(problems, "MISSING_FILE", `${skill.id}: distributable but ${skill.path} does not exist`);
    }
  }
}

// --- Report ---------------------------------------------------------------
const json = process.argv.includes("--json");
const report = { ok: problems.length === 0, problems, warnings };

if (json) {
  console.log(JSON.stringify(report, null, 2));
} else {
  for (const warning of warnings) console.warn(`warn  ${warning.code}  ${warning.message}`);
  for (const problem of problems) console.error(`FAIL  ${problem.code}  ${problem.message}`);
  if (problems.length === 0) {
    console.log(`License check passed (${warnings.length} warning${warnings.length === 1 ? "" : "s"}).`);
  }
}

process.exit(problems.length === 0 ? 0 : 1);
