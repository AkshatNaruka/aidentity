#!/usr/bin/env node

/**
 * Verify that every indexed skill still exists upstream.
 *
 * The thing that separates a registry from a link dump: it is checked.
 * Run weekly by .github/workflows/verify.yml. Writes registry/verified.json
 * so the site can show "verified on <date>" and CI can open an issue when
 * an entry disappears.
 *
 * Usage:
 *   node scripts/verify-sources.js             # check all
 *   node scripts/verify-sources.js --limit 50  # sample
 *   node scripts/verify-sources.js --json
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const REGISTRY = path.join(ROOT, "registry", "skills.json");
const OUT = path.join(ROOT, "registry", "verified.json");
const CONCURRENCY = 8;
const TIMEOUT_MS = 15000;

const args = process.argv.slice(2);
const limitArg = args.indexOf("--limit");
const limit = limitArg !== -1 ? Number(args[limitArg + 1]) : Infinity;

const registry = JSON.parse(fs.readFileSync(REGISTRY, "utf8"));
const sources = JSON.parse(fs.readFileSync(path.join(ROOT, "registry", "sources.json"), "utf8")).sources;

// Only verify each upstream repository once, not each skill.
const targets = Object.entries(sources)
  .filter(([, source]) => !source.firstParty)
  .map(([key, source]) => ({
    key,
    url: `${source.url.replace(/\.git$/, "")}`,
    license: source.license,
  }));

async function check(target) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(target.url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "aidentity-verify/1.0" },
    });
    return { ...target, ok: response.ok, status: response.status };
  } catch (error) {
    return { ...target, ok: false, status: 0, error: error.name };
  } finally {
    clearTimeout(timer);
  }
}

async function run() {
  const results = [];
  const queue = targets.slice(0, Number.isFinite(limit) ? limit : undefined);

  for (let i = 0; i < queue.length; i += CONCURRENCY) {
    const batch = queue.slice(i, i + CONCURRENCY);
    results.push(...(await Promise.all(batch.map(check))));
  }

  const checkedAt = new Date().toISOString();
  const dead = results.filter((r) => !r.ok);

  const payload = {
    checked_at: checkedAt,
    total_sources: results.length,
    ok: results.length - dead.length,
    dead: dead.length,
    sources: Object.fromEntries(
      results.map((r) => [r.key, { url: r.url, ok: r.ok, status: r.status, checked_at: checkedAt }])
    ),
  };

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(payload, null, 2) + "\n");

  if (args.includes("--json")) {
    console.log(JSON.stringify(payload, null, 2));
  } else {
    for (const r of results) console.log(`${r.ok ? "ok  " : "DEAD"} ${r.key.padEnd(22)} ${r.status} ${r.url}`);
    console.log(`\n${payload.ok}/${payload.total_sources} sources reachable → registry/verified.json`);
  }

  if (dead.length) {
    console.error(`\nDead sources: ${dead.map((d) => d.key).join(", ")}`);
    process.exitCode = 1;
  }

  return payload;
}

run();
