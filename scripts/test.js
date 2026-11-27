#!/usr/bin/env node

/**
 * Zero-dependency tests for the parts that must not silently break:
 * retrieval, the install lifecycle, and the manifest.
 *
 *   node scripts/test.js
 */

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const { search, recommend, suggest, defaults, registry } = require("../cli/lib/search");
const {
  installSkills,
  listInstalled,
  removeSkill,
  updateSkills,
  doctor,
  contentHash,
} = require("../cli/lib/installed");

let passed = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`  ok   ${name}`);
  } catch (error) {
    failures.push({ name, error });
    console.log(`  FAIL ${name}`);
    console.log(`       ${error.message}`);
  }
}

function workspace() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "aidentity-test-"));
  fs.mkdirSync(path.join(dir, ".claude", "skills"), { recursive: true });
  return dir;
}

// ---------------------------------------------------------------------------
console.log("\nretrieval");

test("multi-word query returns the obvious skill", () => {
  const results = search("postgres migrations", 5);
  assert.ok(results.length > 0, "expected results");
  assert.ok(
    results.some((entry) => /postgres|supabase/.test(entry.id)),
    `expected a postgres skill, got ${results.map((r) => r.id).join(", ")}`
  );
});

test("code review ranks a code-review skill first", () => {
  const [first] = search("code review", 3);
  assert.ok(first, "expected a result");
  assert.ok(/code-review|review/.test(first.id), `got ${first.id}`);
});

test("synonyms bridge the vocabulary gap", () => {
  const results = search("k8s cluster", 5);
  assert.ok(results.length > 0, "expected results for a synonym-only query");
});

test("every result explains why it matched", () => {
  const results = search("animate a react component", 3);
  assert.ok(results.length > 0);
  for (const entry of results) assert.ok(entry.why.length > 0, `${entry.id} has no reason`);
});

test("empty query returns nothing rather than everything", () => {
  assert.deepStrictEqual(search("", 5), []);
});

test("nonsense query returns nothing", () => {
  assert.deepStrictEqual(search("zzqxvbnm", 5), []);
});

test("did-you-mean finds a near miss", () => {
  const suggestions = suggest("kubernetis", 5);
  assert.ok(suggestions.length > 0, "expected suggestions");
});

test("browse defaults are installable and stable", () => {
  const list = defaults(12);
  assert.strictEqual(list.length, 12);
  for (const entry of list) {
    assert.ok(entry.distributable, `${entry.id} is not installable`);
    assert.strictEqual(entry.status, "stable");
  }
});

// ---------------------------------------------------------------------------
console.log("\nrecommendation");

test("postgres migrations routes to the data bundle", () => {
  const result = recommend("postgres migrations", 4);
  assert.ok(result.bundle, "expected a bundle");
  assert.strictEqual(result.bundle.slug, "data-ai");
});

test("expo task routes to the mobile bundle", () => {
  const result = recommend("build a mobile app with expo", 4);
  assert.ok(result.bundle);
  assert.strictEqual(result.bundle.slug, "mobile-app");
});

test("a task with no bundle does not invent one", () => {
  const result = recommend("water the plants", 4);
  assert.strictEqual(result.bundle, null);
});

test("bundle reports its context cost", () => {
  const result = recommend("postgres migrations", 4);
  assert.ok(result.bundle.tokens > 0, "expected a token estimate");
});

// ---------------------------------------------------------------------------
console.log("\ninstall lifecycle");

const dir = workspace();
const skill = registry.skills.find((entry) => entry.id === "supabase/supabase-postgres-best-practices");

test("install writes the skill and a manifest", () => {
  const result = installSkills([skill], { agentKey: "claude", cwd: dir, allSkills: registry.skills });
  assert.strictEqual(result.installed.length, 1);
  assert.strictEqual(result.failed.length, 0);
  assert.ok(fs.existsSync(path.join(dir, ".claude/skills/supabase-postgres-best-practices/SKILL.md")));
  assert.ok(fs.existsSync(path.join(dir, ".aidentity/installed.json")));
});

test("installed entry is intact", () => {
  const items = listInstalled({ cwd: dir });
  assert.strictEqual(items.length, 1);
  assert.strictEqual(items[0].status, "ok");
});

test("installing twice without force is refused, not silently overwritten", () => {
  const result = installSkills([skill], { agentKey: "claude", cwd: dir, allSkills: registry.skills });
  assert.strictEqual(result.failed.length, 1);
  assert.match(result.failed[0].error, /already exists/);
});

test("doctor reports a healthy workspace", () => {
  const report = doctor({ cwd: dir });
  assert.strictEqual(report.healthy, true);
  assert.ok(report.agents.some((agent) => agent.agent === "claude"));
});

test("tampering is detected", () => {
  const file = path.join(dir, ".claude/skills/supabase-postgres-best-practices/SKILL.md");
  fs.appendFileSync(file, "\n<!-- tampered -->\n");
  const items = listInstalled({ cwd: dir });
  assert.strictEqual(items[0].status, "modified");
});

test("update repairs a tampered install", () => {
  const results = updateSkills({ cwd: dir, registry });
  assert.strictEqual(results[0].status, "repaired");
  assert.strictEqual(listInstalled({ cwd: dir })[0].status, "ok");
});

test("update is a no-op when nothing changed", () => {
  const results = updateSkills({ cwd: dir, registry });
  assert.strictEqual(results[0].status, "current");
});

test("remove deletes the files and the manifest entry", () => {
  removeSkill({ id: skill.id, cwd: dir });
  assert.strictEqual(listInstalled({ cwd: dir }).length, 0);
  assert.ok(!fs.existsSync(path.join(dir, ".claude/skills/supabase-postgres-best-practices")));
});

test("content hash is path independent", () => {
  const source = path.join(__dirname, "..", path.dirname(skill.path));
  const copy = path.join(dir, "elsewhere");
  fs.cpSync(source, copy, { recursive: true });
  assert.strictEqual(contentHash(source), contentHash(copy));
});

// ---------------------------------------------------------------------------
console.log("\nregistry integrity");

test("every installable skill has a path that exists", () => {
  const root = path.join(__dirname, "..");
  for (const entry of registry.skills.filter((skill) => skill.distributable)) {
    assert.ok(entry.path, `${entry.id} has no path`);
    assert.ok(fs.existsSync(path.join(root, entry.path)), `${entry.id} points at a missing file`);
  }
});

test("every index-only skill says where to read it", () => {
  for (const entry of registry.skills.filter((skill) => !skill.distributable)) {
    assert.ok(entry.upstream || entry.source.url, `${entry.id} has no upstream`);
  }
});

test("ids are unique", () => {
  const ids = registry.skills.map((entry) => entry.id);
  assert.strictEqual(new Set(ids).size, ids.length);
});

test("context cost is recorded for hosted skills", () => {
  const hosted = registry.skills.filter((entry) => entry.distributable);
  const withTokens = hosted.filter((entry) => entry.tokens > 0);
  assert.ok(withTokens.length / hosted.length > 0.95, "expected token estimates on hosted skills");
});

// ---------------------------------------------------------------------------
fs.rmSync(dir, { recursive: true, force: true });

console.log(`\n${passed} passed, ${failures.length} failed\n`);
process.exit(failures.length ? 1 : 0);
