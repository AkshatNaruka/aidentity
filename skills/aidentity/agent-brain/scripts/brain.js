#!/usr/bin/env node

/**
 * agent-brain: a local, file-based learning loop for AI agent sessions.
 *
 * Zero dependencies. No network. Reads session exports, writes metrics,
 * reports, lessons, proposals, and reversible edits to agent instruction files.
 *
 * Usage:
 *   node scripts/brain.js init
 *   node scripts/brain.js collect [--from <path>] [--days 14] [--all]
 *   node scripts/brain.js analyze [--days 7] [--all]
 *   node scripts/brain.js lessons [--status candidate|promoted|reverted]
 *   node scripts/brain.js propose [--min 2] [--target AGENTS.md]
 *   node scripts/brain.js apply <id> --yes
 *   node scripts/brain.js verify <id> --result keep|revert [--window 14]
 *   node scripts/brain.js export
 *   node scripts/brain.js doctor
 *   node scripts/brain.js demo
 *
 * Global flags:
 *   --dir <path>   brain directory (default: .agent-brain in cwd)
 *   --json         machine-readable output where supported
 */

"use strict";

const fs = require("fs");
const path = require("path");
const os = require("os");
const crypto = require("crypto");
const { spawnSync } = require("child_process");

const PROJECT = (() => {
  try {
    return fs.realpathSync(process.cwd());
  } catch {
    return process.cwd();
  }
})();
const argv = process.argv.slice(2);
const rawCommand = argv[0] || "help";
const command = rawCommand === "--help" || rawCommand === "-h" ? "help" : rawCommand;

function flag(name, fallback = null) {
  const i = argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const next = argv[i + 1];
  if (!next || next.startsWith("--")) return true;
  return next;
}

function has(name) {
  return argv.includes(`--${name}`);
}

const BRAIN = path.resolve(
  process.env.AGENT_BRAIN_DIR || flag("dir") || path.join(PROJECT, ".agent-brain")
);

const P = {
  config: path.join(BRAIN, "brain.json"),
  sessions: path.join(BRAIN, "sessions.jsonl"),
  lessons: path.join(BRAIN, "lessons.jsonl"),
  experiments: path.join(BRAIN, "experiments.jsonl"),
  profile: path.join(BRAIN, "profile.md"),
  playbook: path.join(BRAIN, "playbook.md"),
  changelog: path.join(BRAIN, "CHANGELOG.md"),
  reports: path.join(BRAIN, "reports"),
  proposals: path.join(BRAIN, "proposals"),
  backups: path.join(BRAIN, "backups"),
  inbox: path.join(BRAIN, "inbox"),
};

// ---------------------------------------------------------------------------
// small utilities
// ---------------------------------------------------------------------------

function ensureDirs() {
  for (const dir of [BRAIN, P.reports, P.proposals, P.backups, P.inbox]) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function readJsonl(file) {
  if (!fs.existsSync(file)) return [];
  const out = [];
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      out.push(JSON.parse(trimmed));
    } catch {
      // Skip a damaged line rather than fail the whole brain.
    }
  }
  return out;
}

function writeJsonl(file, rows) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, rows.map((row) => JSON.stringify(row)).join("\n") + (rows.length ? "\n" : ""));
}

function appendJsonl(file, row) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.appendFileSync(file, JSON.stringify(row) + "\n");
}

function writeIfAbsent(file, content) {
  if (fs.existsSync(file)) return false;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  return true;
}

function shortHash(value) {
  return crypto.createHash("sha1").update(value).digest("hex").slice(0, 10);
}

function nowIso() {
  return new Date().toISOString();
}

function daysAgoIso(days) {
  return new Date(Date.now() - days * 86400000).toISOString();
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const SECRET_PATTERNS = [
  [/\bsk-[A-Za-z0-9_-]{16,}\b/g, "[redacted-key]"],
  [/\bgh[pousr]_[A-Za-z0-9]{20,}\b/g, "[redacted-token]"],
  [/\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g, "[redacted-token]"],
  [/\bAIza[0-9A-Za-z_-]{20,}\b/g, "[redacted-key]"],
  [/\bAKIA[0-9A-Z]{12,}\b/g, "[redacted-key]"],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g, "[redacted-private-key]"],
  [/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, "[redacted-email]"],
  [new RegExp(escapeRegExp(os.homedir()), "g"), "~"],
];

function redact(value, max = 240) {
  let text = String(value == null ? "" : value);
  for (const [pattern, replacement] of SECRET_PATTERNS) {
    text = text.replace(pattern, replacement);
  }
  text = text.replace(/\s+/g, " ").trim();
  if (text.length > max) text = text.slice(0, max - 1).trimEnd() + "…";
  return text;
}

function line(message = "") {
  process.stdout.write(message + "\n");
}

// ---------------------------------------------------------------------------
// config
// ---------------------------------------------------------------------------

const DEFAULT_CONFIG = {
  version: 1,
  device: os.hostname(),
  project: path.basename(PROJECT),
  createdAt: nowIso(),
  thresholds: {
    minEvidence: 2,
    minSessionsForPromotion: 3,
    minScoreDelta: 3,
  },
  capture: {
    storeSnippets: true,
    maxSnippet: 200,
  },
};

function loadConfig() {
  const config = readJson(P.config, null);
  if (!config) return { ...DEFAULT_CONFIG, thresholds: { ...DEFAULT_CONFIG.thresholds } };
  return {
    ...DEFAULT_CONFIG,
    ...config,
    thresholds: { ...DEFAULT_CONFIG.thresholds, ...(config.thresholds || {}) },
    capture: { ...DEFAULT_CONFIG.capture, ...(config.capture || {}) },
  };
}

const PROFILE_TEMPLATE = `# Device profile

Edit this once. The brain and every later session read it. Keep it short and factual.

## Person and context

- Role:
- Main projects:
- Time zone:
- Preferred language and units:

## Non-negotiables

- Approval before destructive actions:
- Never touch:
- Verification commands the agent must run:

## Current focus

- This week:
- Not now:
`;

const PLAYBOOK_TEMPLATE = `# Agent playbook

Operating rules for this device. The brain appends learned rules inside the managed block and keeps a changelog.

## How to start a session

1. Read this playbook and the profile.
2. Restate the task in one line.
3. Name the verification step before writing code.

## How to finish a session

1. Run the verification command and quote its result.
2. Record what changed and what remains.
3. Export session evidence to the brain inbox when asked.

<!-- agent-brain:start -->
<!-- agent-brain:end -->
`;

const CHANGELOG_TEMPLATE = `# Agent brain changelog

Every applied self-edit is listed here with its evidence, target, and rollback path.

`;

function init() {
  ensureDirs();
  const config = loadConfig();
  if (!fs.existsSync(P.config)) fs.writeFileSync(P.config, JSON.stringify(config, null, 2) + "\n");
  const created = [];
  if (writeIfAbsent(P.profile, PROFILE_TEMPLATE)) created.push(P.profile);
  if (writeIfAbsent(P.playbook, PLAYBOOK_TEMPLATE)) created.push(P.playbook);
  if (writeIfAbsent(P.changelog, CHANGELOG_TEMPLATE)) created.push(P.changelog);
  for (const file of [P.sessions, P.lessons, P.experiments]) {
    if (!fs.existsSync(file)) fs.writeFileSync(file, "");
  }
  line(`Brain ready at ${BRAIN}`);
  line(`Device: ${config.device}`);
  if (created.length) {
    line("Created:");
    for (const file of created) line(`  ${file}`);
  } else {
    line("Kept existing files.");
  }
  line("Next: edit the profile, then run collect, analyze, propose.");
}

// ---------------------------------------------------------------------------
// session adapters
// ---------------------------------------------------------------------------

function textOf(node) {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(textOf).filter(Boolean).join("\n");
  if (!node || typeof node !== "object") return "";
  if (typeof node.text === "string") return node.text;
  if (typeof node.content === "string") return node.content;
  if (Array.isArray(node.content)) return textOf(node.content);
  if (typeof node.message === "string") return node.message;
  if (typeof node.output === "string") return node.output;
  if (typeof node.summary === "string") return node.summary;
  return "";
}

function normalizeRole(node, inherited) {
  const raw = String(node.role || node.sender || inherited || "").toLowerCase();
  if (raw.includes("user") || raw.includes("human")) return "user";
  if (raw.includes("tool") || raw.includes("function")) return "tool";
  if (raw.includes("system")) return "system";
  if (raw.includes("assistant") || raw.includes("agent") || raw.includes("model")) return "assistant";
  return inherited || "";
}

function collectEvents(node, out, inheritedRole = "", depth = 0) {
  if (node == null || depth > 8) return;
  if (Array.isArray(node)) {
    for (const item of node) collectEvents(item, out, inheritedRole, depth + 1);
    return;
  }
  if (typeof node !== "object") return;

  const role = normalizeRole(node, inheritedRole);
  const type = String(node.type || node.kind || "").toLowerCase();
  const text = textOf(node);
  const looksLikeMessage =
    Boolean(role) ||
    type.includes("message") ||
    type === "text" ||
    type === "output" ||
    type === "result";

  if (text && looksLikeMessage) {
    out.push({
      role: role || (type.includes("user") ? "user" : "assistant"),
      text,
      ts: node.timestamp || node.ts || node.created_at || node.time || null,
    });
    return;
  }

  const containerKeys = [
    "messages",
    "parts",
    "payload",
    "data",
    "item",
    "message",
    "response",
    "content",
    "entries",
    "events",
    "items",
    "info",
    "body",
    "request",
    "result",
  ];
  for (const key of containerKeys) {
    if (node[key] && typeof node[key] === "object") {
      collectEvents(node[key], out, role || inheritedRole, depth + 1);
    }
  }
}

function parseSessionFile(file) {
  const stat = fs.statSync(file);
  if (stat.size > 25 * 1024 * 1024) return { events: [], note: "skipped: file larger than 25 MB" };
  const raw = fs.readFileSync(file, "utf8");
  const events = [];
  const ext = path.extname(file).toLowerCase();

  if (ext === ".jsonl") {
    for (const rawLine of raw.split(/\r?\n/)) {
      const rawTrim = rawLine.trim();
      if (!rawTrim) continue;
      let parsed;
      try {
        parsed = JSON.parse(rawTrim);
      } catch {
        continue;
      }
      collectEvents(parsed, events);
    }
  } else {
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return { events: [], note: "skipped: not valid JSON" };
    }
    collectEvents(parsed, events);
  }

  const seen = new Set();
  const unique = [];
  for (const event of events) {
    const key = event.role + "\u0000" + (event.ts || "") + "\u0000" + event.text.slice(0, 400);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(event);
  }
  return { events: unique, note: null };
}

const VERIFY_RE =
  /\b(npm|pnpm|yarn|bun)\s+(run\s+)?(test|tests|lint|typecheck|build|check)\b|\b(pytest|ruff|mypy|go\s+test|cargo\s+test|swift\s+test|xcodebuild|make\s+test|jest|vitest|playwright|ctest)\b/i;
const ERROR_RE = /\b(error|failed|failure|exception|traceback|exit\s+code\s+[1-9]|cannot|undefined is not)\b/i;
const CORRECTION_RE =
  /^(no\b|nope\b)|(\b(actually|i said|i meant|not what i asked|that'?s wrong|you (forgot|missed|ignored)|stop doing|don'?t do that|use .{1,40} instead|still (failing|broken)|try again)\b)/i;
const BLOCKED_RE = /\b(permission denied|not permitted|denied|not allowed|unauthorized|forbidden)\b/i;
const FILE_RE =
  /(?:^|[\s"'`(])([\w@./-]+\.(?:ts|tsx|js|jsx|mjs|cjs|py|go|rs|swift|kt|java|rb|php|md|json|css|scss|html|sql|sh|yml|yaml|toml|plist))(?=$|[\s"'`),.:;])/g;

function analyzeEvents(events, file) {
  const texts = events.map((event) => event.text).filter(Boolean);
  const allText = texts.join("\n");
  const userEvents = events.filter((event) => event.role === "user");
  const userText = userEvents.map((event) => event.text).join("\n");

  const errors = (allText.match(new RegExp(ERROR_RE.source, "gi")) || []).length;
  const verifies = events.filter((event) => VERIFY_RE.test(event.text)).length;
  const corrections = userEvents.filter((event) => CORRECTION_RE.test(event.text.trim())).length;
  const blocked = BLOCKED_RE.test(allText) ? 1 : 0;

  const seen = new Map();
  let duplicates = 0;
  for (const text of texts) {
    const normalized = text.replace(/\s+/g, " ").trim().slice(0, 240);
    if (normalized.length < 30) continue;
    const count = (seen.get(normalized) || 0) + 1;
    if (count > 1) duplicates += 1;
    seen.set(normalized, count);
  }

  const files = new Set();
  for (const match of allText.matchAll(FILE_RE)) {
    if (!match[1].includes("://")) files.add(match[1]);
  }

  const looksLikeCode =
    files.size > 0 || /\b(code|repo|repository|build|test|compile|deploy|bug|function|api)\b/i.test(allText);

  const penalties =
    Math.min(errors * 6, 24) +
    Math.min(duplicates * 5, 20) +
    Math.min(corrections * 8, 24) +
    (looksLikeCode && verifies === 0 ? 12 : 0) +
    (files.size > 12 ? 8 : 0);

  const score = clamp(100 - penalties, 0, 100);
  const task = redact(userEvents[0] ? userEvents[0].text : "Untitled session", 120);
  const errorLine = (allText.split(/\r?\n/).find((l) => ERROR_RE.test(l)) || "").trim();

  const signals = [];
  if (looksLikeCode && verifies === 0) {
    signals.push({ key: "unverified_work", severity: "high", evidence: redact(`${task}: no verification command`, 180) });
  }
  if (errors >= 4 || duplicates >= 2) {
    signals.push({
      key: "repeated_failure",
      severity: "high",
      evidence: redact(errorLine || `${duplicates} repeated blocks, ${errors} error mentions`, 180),
    });
  }
  if (corrections > 0) {
    const correctionLine = userEvents.find((event) => CORRECTION_RE.test(event.text.trim()));
    signals.push({
      key: "user_correction",
      severity: "medium",
      evidence: redact(correctionLine ? correctionLine.text : userText, 180),
    });
  }
  if (duplicates >= 3) {
    signals.push({
      key: "retry_loop",
      severity: "medium",
      evidence: redact(`${duplicates} repeated blocks in one session`, 180),
    });
  }
  if (files.size > 12) {
    signals.push({
      key: "scope_wide",
      severity: "low",
      evidence: redact(`${files.size} distinct files touched`, 180),
    });
  }
  if (blocked) {
    signals.push({ key: "blocked_tool", severity: "medium", evidence: redact(errorLine || "tool denial detected", 180) });
  }

  const firstTs = events.map((event) => event.ts).filter(Boolean).sort()[0] || null;
  const lastTs = events.map((event) => event.ts).filter(Boolean).sort().slice(-1)[0] || null;

  return {
    id: "ses_" + shortHash(`${path.basename(file)}:${fs.statSync(file).size}:${task}:${events.length}`),
    file: path.basename(file),
    agent: detectAgent(file, allText),
    startedAt: firstTs || fs.statSync(file).birthtime.toISOString(),
    endedAt: lastTs || fs.statSync(file).mtime.toISOString(),
    collectedAt: nowIso(),
    task,
    metrics: {
      score,
      steps: events.length,
      errors,
      duplicates,
      corrections,
      verifies,
      files: files.size,
      looksLikeCode,
    },
    signals,
  };
}

function detectAgent(file, text) {
  const lower = file.toLowerCase();
  if (lower.includes("codex") || /\bcodex\b/i.test(text)) return "codex";
  if (lower.includes("opencode") || /\bopencode\b/i.test(text)) return "opencode";
  if (lower.includes("cursor")) return "cursor";
  if (lower.includes("copilot")) return "copilot";
  if (lower.includes("gemini")) return "gemini";
  if (lower.includes("pi-") || /\/pi\//.test(lower)) return "pi";
  return "generic";
}

function walkFiles(dir, maxDepth = 6, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const entry of entries) {
    if (entry.name.startsWith(".") && entry.name !== ".agent-brain") continue;
    if (entry.name === "node_modules" || entry.name === ".git") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && maxDepth > 0) {
      walkFiles(full, maxDepth - 1, acc);
    } else if (entry.isFile() && /\.(jsonl|json)$/i.test(entry.name)) {
      acc.push(full);
    }
    if (acc.length >= 2000) return acc;
  }
  return acc;
}

function discoverRoots() {
  const home = os.homedir();
  const candidates = [
    path.join(home, ".codex", "sessions"),
    path.join(home, ".local", "share", "opencode", "storage"),
    path.join(home, ".local", "share", "opencode", "project"),
    path.join(home, ".cursor", "projects"),
    P.inbox,
  ];
  return candidates.filter((candidate) => fs.existsSync(candidate));
}

function collect() {
  ensureDirs();
  const since = has("all") ? null : Number(flag("days", 14));
  const cutoff = since === null ? 0 : Date.now() - since * 86400000;
  const from = flag("from");
  const roots = from ? [path.resolve(String(from))] : discoverRoots();
  if (!roots.length) {
    line("No session roots found. Pass --from <file-or-dir> or drop exports into the inbox.");
    return;
  }

  const existing = new Set(readJsonl(P.sessions).map((session) => session.id));
  const files = [];
  for (const root of roots) {
    if (!fs.existsSync(root)) {
      line(`Skip missing path: ${root}`);
      continue;
    }
    const stat = fs.statSync(root);
    if (stat.isFile()) files.push(root);
    else files.push(...walkFiles(root));
  }

  let ingested = 0;
  let skipped = 0;
  for (const file of files) {
    const stat = fs.statSync(file);
    if (stat.mtimeMs < cutoff) {
      skipped += 1;
      continue;
    }
    const parsed = parseSessionFile(file);
    if (parsed.events.length < 2) {
      skipped += 1;
      continue;
    }
    const session = analyzeEvents(parsed.events, file);
    if (existing.has(session.id)) {
      skipped += 1;
      continue;
    }
    existing.add(session.id);
    appendJsonl(P.sessions, session);
    ingested += 1;
  }

  line(`Collected ${ingested} session${ingested === 1 ? "" : "s"} from ${roots.length} root${roots.length === 1 ? "" : "s"}.`);
  line(`Skipped ${skipped} file${skipped === 1 ? "" : "s"} (too small, duplicate, or older than the window).`);
  line(`Store: ${P.sessions}`);
}

// ---------------------------------------------------------------------------
// lessons and reports
// ---------------------------------------------------------------------------

const SIGNAL_DEFS = {
  unverified_work: {
    severity: "high",
    target: "AGENTS.md",
    statement:
      "When a coding task looks done, run the repository's own verification command (test, lint, typecheck, or build) and quote the result before claiming completion.",
  },
  repeated_failure: {
    severity: "high",
    target: "AGENTS.md",
    statement:
      "After two identical failures, stop retrying, re-read the error and the last successful state, then change the approach.",
  },
  user_correction: {
    severity: "medium",
    target: "AGENTS.md",
    statement:
      "Before starting, restate the request in one line. An explicit instruction from the person overrides a familiar default.",
  },
  retry_loop: {
    severity: "medium",
    target: "AGENTS.md",
    statement:
      "Cap identical retries at two. On the third attempt, change the approach or ask one precise question instead of repeating the same call.",
  },
  scope_wide: {
    severity: "low",
    target: "AGENTS.md",
    statement:
      "Keep a task to the files the request names. List any extra file and get agreement before editing it.",
  },
  blocked_tool: {
    severity: "medium",
    target: "AGENTS.md",
    statement:
      "When a tool call is denied, report the exact command and the denial, then use the approved alternative instead of silently retrying.",
  },
};

function sessionsInWindow(days) {
  const sessions = readJsonl(P.sessions);
  if (days === null) return sessions;
  const cutoff = Date.now() - days * 86400000;
  return sessions.filter((session) => new Date(session.endedAt).getTime() >= cutoff);
}

function aggregate(sessions) {
  if (!sessions.length) {
    return { count: 0, score: 0, verifyRate: 0, corrections: 0, errors: 0 };
  }
  const total = sessions.reduce((sum, session) => sum + session.metrics.score, 0);
  const verified = sessions.filter((session) => session.metrics.verifies > 0).length;
  return {
    count: sessions.length,
    score: Math.round(total / sessions.length),
    verifyRate: Math.round((verified / sessions.length) * 100),
    corrections: sessions.reduce((sum, session) => sum + session.metrics.corrections, 0),
    errors: sessions.reduce((sum, session) => sum + session.metrics.errors, 0),
  };
}

function mergeLessons(sessions) {
  const existing = readJsonl(P.lessons);
  const byKey = new Map(existing.map((lesson) => [lesson.key, lesson]));

  for (const session of sessions) {
    for (const signal of session.signals || []) {
      const def = SIGNAL_DEFS[signal.key];
      if (!def) continue;
      const key = signal.key;
      const current =
        byKey.get(key) || {
          id: "lsn_" + shortHash(key),
          key,
          statement: def.statement,
          target: def.target,
          severity: def.severity,
          count: 0,
          sessions: [],
          evidence: [],
          status: "candidate",
          confidence: "low",
          firstSeen: session.endedAt,
          lastSeen: session.endedAt,
        };
      if (!current.sessions.includes(session.id)) {
        current.count += 1;
        current.sessions.push(session.id);
        if (current.evidence.length < 8) {
          current.evidence.push({ date: session.endedAt.slice(0, 10), text: signal.evidence });
        }
      }
      current.lastSeen = session.endedAt;
      current.severity = def.severity;
      current.statement = current.statement || def.statement;
      current.target = current.target || def.target;
      current.confidence = current.count >= 3 ? "high" : current.count === 2 ? "medium" : "low";
      byKey.set(key, current);
    }
  }

  const merged = Array.from(byKey.values()).sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
  writeJsonl(P.lessons, merged);
  return merged;
}

function analyze() {
  ensureDirs();
  const days = has("all") ? null : Number(flag("days", 7));
  const sessions = sessionsInWindow(days);
  if (!sessions.length) {
    line("No sessions in the window. Run collect first, or widen with --days 30 or --all.");
    return;
  }
  const previousDays = days === null ? null : days * 2;
  const previous = previousDays === null ? [] : sessionsInWindow(previousDays).filter((s) => !sessions.includes(s));
  const current = aggregate(sessions);
  const before = aggregate(previous);
  const lessons = mergeLessons(sessions);

  const delta = previous.length ? current.score - before.score : null;
  const top = lessons[0];
  const date = new Date().toISOString().slice(0, 10);
  const reportPath = path.join(P.reports, `${date}.md`);

  const rows = sessions
    .slice()
    .sort((a, b) => new Date(b.endedAt) - new Date(a.endedAt))
    .map(
      (session) =>
        `| ${session.task.slice(0, 60)} | ${session.agent} | ${session.metrics.score} | ${
          session.metrics.verifies ? "yes" : "no"
        } | ${session.metrics.corrections} | ${session.metrics.errors} |`
    )
    .join("\n");

  const lessonRows = lessons
    .map(
      (lesson) =>
        `| ${lesson.key} | ${lesson.count} | ${lesson.severity} | ${lesson.status} | ${
          lesson.evidence[0] ? lesson.evidence[0].text.replace(/\|/g, "/") : ""
        } |`
    )
    .join("\n");

  const body = `# Agent brain report, ${date}

## Verdict

${current.count} session${current.count === 1 ? "" : "s"} in the window. Average process score ${current.score}/100${
    delta === null ? "" : ` (previous window ${before.score}, change ${delta >= 0 ? "+" : ""}${delta})`
  }. Verification command present in ${current.verifyRate}% of sessions.
${
  top
    ? `Top repeated cause: **${top.key}** in ${top.count} session${top.count === 1 ? "" : "s"}.`
    : "No repeated cause crossed the threshold."
}

## Repeated failures

| Lesson | Sessions | Severity | Status | First evidence |
|---|---:|---|---|---|
${lessonRows || "| none | 0 | - | - | - |"}

## Sessions

| Task | Agent | Score | Verified | Corrections | Errors |
|---|---|---:|---|---:|---:|
${rows}

## Recommended next action

1. ${top ? `Run \`node scripts/brain.js propose\` and review the change for ${top.key}.` : "Keep collecting. One session is not a pattern."}
2. Run \`node scripts/brain.js export\` so the next session starts with the playbook.
3. After the next sessions, run \`node scripts/brain.js verify <id>\` and keep or revert on evidence.

## Method

Scores follow the published formula in references/loop.md. Evidence is redacted and truncated. No raw transcript is stored.
`;

  fs.writeFileSync(reportPath, body);
  line(`Analyzed ${sessions.length} session${sessions.length === 1 ? "" : "s"}. Average score ${current.score}/100.`);
  if (delta !== null) line(`Previous window ${before.score}/100. Change ${delta >= 0 ? "+" : ""}${delta}.`);
  if (top) line(`Top repeated cause: ${top.key} (${top.count} sessions).`);
  line(`Report: ${reportPath}`);
  if (lessons.length) line(`Lessons: ${lessons.length}. Run propose to turn eligible ones into reviewable edits.`);
}

function listLessons() {
  const status = flag("status");
  const lessons = readJsonl(P.lessons).filter((lesson) => !status || lesson.status === status);
  if (!lessons.length) {
    line("No lessons yet. Run analyze after collecting sessions.");
    return;
  }
  for (const lesson of lessons) {
    line(`[${lesson.status}] ${lesson.id}  ${lesson.key}  ${lesson.count} session(s)  ${lesson.severity}`);
    line(`  ${lesson.statement}`);
  }
}

// ---------------------------------------------------------------------------
// proposals
// ---------------------------------------------------------------------------

function managedBlock(existingText) {
  const start = "<!-- agent-brain:start -->";
  const end = "<!-- agent-brain:end -->";
  const startIndex = existingText.indexOf(start);
  const endIndex = existingText.indexOf(end);
  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    return {
      exists: true,
      startIndex,
      endIndex: endIndex + end.length,
      inner: existingText.slice(startIndex + start.length, endIndex).trim(),
    };
  }
  return { exists: false, startIndex: -1, endIndex: -1, inner: "" };
}

function resolveTarget(targetFlag) {
  if (targetFlag) {
    if (targetFlag === "playbook") return P.playbook;
    return path.isAbsolute(String(targetFlag)) ? String(targetFlag) : path.join(PROJECT, String(targetFlag));
  }
  return P.playbook;
}

function propose() {
  ensureDirs();
  const lessons = readJsonl(P.lessons);
  const config = loadConfig();
  const minEvidence = Number(flag("min", config.thresholds.minEvidence));
  const targetFlag = flag("target");
  const experiments = readJsonl(P.experiments);
  const openKeys = new Set(
    experiments.filter((exp) => exp.status === "open" || exp.status === "applied").map((exp) => exp.lessonKey)
  );

  const eligible = lessons.filter(
    (lesson) =>
      lesson.status === "candidate" &&
      !openKeys.has(lesson.key) &&
      lesson.count >= minEvidence &&
      (lesson.severity !== "low" || lesson.count >= minEvidence + 1)
  );

  if (!eligible.length) {
    line(`No eligible lessons. Need ${minEvidence} sessions per lesson. Run analyze, or lower with --min 1.`);
    return;
  }

  const created = [];
  for (const lesson of eligible) {
    const targetPath = resolveTarget(targetFlag);
    const id = "exp_" + shortHash(lesson.id + targetPath + Date.now());
    const rule = `- ${lesson.statement} (${lesson.count} sessions, ${lesson.severity}, seen ${lesson.lastSeen.slice(0, 10)})`;
    const experiment = {
      id,
      lessonId: lesson.id,
      lessonKey: lesson.key,
      statement: lesson.statement,
      target: path.relative(PROJECT, targetPath) || targetPath,
      targetPath,
      rule,
      rationale: `${lesson.count} sessions show ${lesson.key}. One small rule should change the next session.`,
      evidence: lesson.evidence.slice(0, 4),
      status: "open",
      createdAt: nowIso(),
      appliedAt: null,
      backup: null,
      result: null,
    };
    appendJsonl(P.experiments, experiment);

    const md = `# Proposal ${id}

## Change

Target: \`${experiment.target}\`

Add inside the managed block:

\`\`\`markdown
${rule}
\`\`\`

## Why

${experiment.rationale}

## Evidence

${lesson.evidence.map((item) => `- ${item.date}: ${item.text}`).join("\n")}

## Apply

\`\`\`bash
node scripts/brain.js apply ${id} --yes
\`\`\`

## Revert

\`\`\`bash
node scripts/brain.js verify ${id} --result revert
\`\`\`
`;
    fs.writeFileSync(path.join(P.proposals, `${id}.md`), md);
    created.push(experiment);
  }

  line(`Created ${created.length} proposal${created.length === 1 ? "" : "s"}.`);
  for (const experiment of created) {
    line(`  ${experiment.id}  ${experiment.lessonKey}  -> ${experiment.target}`);
  }
  line(`Review in ${P.proposals}`);
  line(`Apply one with: node scripts/brain.js apply <id> --yes`);
}

function apply(experimentArg) {
  ensureDirs();
  if (!experimentArg) {
    line("Pass a proposal id. See: node scripts/brain.js propose");
    process.exitCode = 1;
    return;
  }
  if (!has("yes")) {
    line("Refusing to edit without --yes. Review the proposal first.");
    process.exitCode = 1;
    return;
  }
  const experiments = readJsonl(P.experiments);
  const index = experiments.findIndex((exp) => exp.id === experimentArg || exp.id.startsWith(experimentArg));
  if (index === -1) {
    line(`No proposal matches ${experimentArg}.`);
    process.exitCode = 1;
    return;
  }
  const experiment = experiments[index];
  if (experiment.status !== "open") {
    line(`Proposal is already ${experiment.status}.`);
    process.exitCode = 1;
    return;
  }

  const targetPath = experiment.targetPath;
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  if (!fs.existsSync(targetPath)) {
    fs.writeFileSync(targetPath, "# Agent notes\n\n<!-- agent-brain:start -->\n<!-- agent-brain:end -->\n");
  }
  const before = fs.readFileSync(targetPath, "utf8");
  const block = managedBlock(before);
  let after;
  if (block.exists) {
    const innerLines = block.inner.split(/\r?\n/).filter(Boolean);
    if (!innerLines.includes(experiment.rule)) innerLines.push(experiment.rule);
    const replacement = `<!-- agent-brain:start -->\n${innerLines.join("\n")}\n<!-- agent-brain:end -->`;
    after = before.slice(0, block.startIndex) + replacement + before.slice(block.endIndex);
  } else {
    after =
      before.replace(/\s*$/, "") +
      "\n\n## Learned rules\n\n<!-- agent-brain:start -->\n" +
      experiment.rule +
      "\n<!-- agent-brain:end -->\n";
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(P.backups, `${stamp}-${path.basename(targetPath)}`);
  fs.writeFileSync(backupPath, before);
  fs.writeFileSync(targetPath, after);

  experiments[index] = {
    ...experiment,
    status: "applied",
    appliedAt: nowIso(),
    backup: path.relative(PROJECT, backupPath) || backupPath,
  };
  writeJsonl(P.experiments, experiments);

  const lessons = readJsonl(P.lessons);
  const lessonIndex = lessons.findIndex((lesson) => lesson.key === experiment.lessonKey);
  if (lessonIndex !== -1) lessons[lessonIndex].status = "applied";
  writeJsonl(P.lessons, lessons);

  fs.appendFileSync(
    P.changelog,
    `## ${new Date().toISOString().slice(0, 10)} ${experiment.id}\n\n- Added to \`${experiment.target}\`: ${experiment.statement}\n- Evidence: ${experiment.evidence.length} snippets, ${experiment.lessonKey}\n- Backup: \`${experiment.backup}\`\n- Revert: \`node scripts/brain.js verify ${experiment.id} --result revert\`\n\n`
  );

  line(`Applied ${experiment.id} to ${targetPath}`);
  line(`Backup: ${backupPath}`);
  line(`Verify after the next sessions: node scripts/brain.js verify ${experiment.id} --result keep --window 14`);
}

function verify(experimentArg) {
  ensureDirs();
  if (!experimentArg) {
    line("Pass a proposal id.");
    process.exitCode = 1;
    return;
  }
  const result = String(flag("result", "")).toLowerCase();
  if (!["keep", "revert"].includes(result)) {
    line("Pass --result keep or --result revert.");
    process.exitCode = 1;
    return;
  }
  const experiments = readJsonl(P.experiments);
  const index = experiments.findIndex((exp) => exp.id === experimentArg || exp.id.startsWith(experimentArg));
  if (index === -1) {
    line(`No proposal matches ${experimentArg}.`);
    process.exitCode = 1;
    return;
  }
  const experiment = experiments[index];
  if (experiment.status !== "applied") {
    line(`Proposal is ${experiment.status}; only applied proposals can be verified.`);
    process.exitCode = 1;
    return;
  }

  const windowDays = Number(flag("window", 14));
  const appliedAt = new Date(experiment.appliedAt).getTime();
  const all = readJsonl(P.sessions);
  const at = (session) => new Date(session.collectedAt || session.endedAt).getTime();
  const after = all.filter(
    (session) => at(session) >= appliedAt && Date.now() - at(session) <= windowDays * 86400000
  );
  const before = all
    .filter((session) => at(session) < appliedAt)
    .sort((a, b) => at(b) - at(a))
    .slice(0, Math.max(after.length, 1));

  if (result === "revert") {
    const backupPath = path.isAbsolute(experiment.backup || "")
      ? experiment.backup
      : path.join(PROJECT, experiment.backup || "");
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, experiment.targetPath);
      line(`Reverted ${experiment.id} from backup ${backupPath}.`);
    } else {
      line(`Backup missing at ${backupPath}. Remove the rule by hand from ${experiment.target}.`);
    }
    experiments[index] = { ...experiment, status: "reverted", result: "reverted", verifiedAt: nowIso() };
    writeJsonl(P.experiments, experiments);
    const lessons = readJsonl(P.lessons);
    const lessonIndex = lessons.findIndex((lesson) => lesson.key === experiment.lessonKey);
    if (lessonIndex !== -1) lessons[lessonIndex].status = "reverted";
    writeJsonl(P.lessons, lessons);
    fs.appendFileSync(P.changelog, `## ${new Date().toISOString().slice(0, 10)} ${experiment.id}\n\n- Reverted by the owner.\n\n`);
    return;
  }

  const config = loadConfig();
  const need = config.thresholds.minSessionsForPromotion;
  const target = config.thresholds.minScoreDelta;
  const afterAgg = aggregate(after);
  const beforeAgg = aggregate(before);
  const delta = after.length && before.length ? afterAgg.score - beforeAgg.score : null;
  const enough = after.length >= need && before.length >= 1;

  line(`Evidence after change: ${after.length} session${after.length === 1 ? "" : "s"} (need ${need}).`);
  if (before.length) line(`Before: ${beforeAgg.score}/100 on ${before.length} session${before.length === 1 ? "" : "s"}.`);
  if (after.length) line(`After: ${afterAgg.score}/100.`);
  if (delta !== null) line(`Change: ${delta >= 0 ? "+" : ""}${delta} points (need +${target}).`);

  if (!enough) {
    line("Inconclusive: not enough post-change sessions. The rule stays applied and provisional.");
    experiments[index] = {
      ...experiment,
      status: "applied",
      result: "inconclusive",
      verifiedAt: nowIso(),
      afterSessions: after.length,
      delta,
    };
  } else if (delta >= target) {
    line("Promoted: the rule improved the measured window.");
    experiments[index] = {
      ...experiment,
      status: "promoted",
      result: "kept",
      verifiedAt: nowIso(),
      afterSessions: after.length,
      delta,
    };
  } else {
    line("Not proven: keep it provisional or revert with --result revert.");
    experiments[index] = {
      ...experiment,
      status: "applied",
      result: "no-improvement",
      verifiedAt: nowIso(),
      afterSessions: after.length,
      delta,
    };
  }
  writeJsonl(P.experiments, experiments);

  const lessons = readJsonl(P.lessons);
  const lessonIndex = lessons.findIndex((lesson) => lesson.key === experiment.lessonKey);
  if (lessonIndex !== -1) {
    lessons[lessonIndex].status = experiments[index].status === "promoted" ? "promoted" : "applied";
  }
  writeJsonl(P.lessons, lessons);

  fs.appendFileSync(
    P.changelog,
    `## ${new Date().toISOString().slice(0, 10)} ${experiment.id}\n\n- Verification: ${experiments[index].result}, delta ${delta}, after ${after.length} sessions.\n\n`
  );
}

// ---------------------------------------------------------------------------
// export, doctor, demo
// ---------------------------------------------------------------------------

function exportBrain() {
  ensureDirs();
  const profile = fs.existsSync(P.profile) ? fs.readFileSync(P.profile, "utf8").trim() : "";
  const playbook = fs.existsSync(P.playbook) ? fs.readFileSync(P.playbook, "utf8").trim() : "";
  const lessons = readJsonl(P.lessons)
    .filter((lesson) => lesson.status === "promoted" || lesson.status === "applied")
    .slice(0, 8);
  const experiments = readJsonl(P.experiments).filter((exp) => exp.status === "promoted");

  const body = `# Agent brain bootstrap

Read this before work on this device. It is generated from local evidence. Editing this file does nothing; edit the brain sources and re-export.

## Profile

${profile || "No profile yet. Run init and edit .agent-brain/profile.md."}

## Playbook

${playbook || "No playbook yet."}

## Learned rules in force

${experiments.length ? experiments.map((exp) => `- ${exp.statement} (${exp.lessonKey}, ${exp.result})`).join("\n") : "- None promoted yet."}

## Candidate lessons

${lessons.length ? lessons.map((lesson) => `- ${lesson.statement} (${lesson.count} sessions, ${lesson.status})`).join("\n") : "- None yet."}

## How to feed the brain

1. Export or point at session files: \`node scripts/brain.js collect --from <path>\`.
2. Score and report: \`node scripts/brain.js analyze\`.
3. Propose and review: \`node scripts/brain.js propose\`.
4. Apply with approval: \`node scripts/brain.js apply <id> --yes\`.
5. Verify on new evidence: \`node scripts/brain.js verify <id> --result keep\`.
`;

  const out = path.join(BRAIN, "BRAIN.md");
  fs.writeFileSync(out, body);
  line(`Wrote ${out}`);
  if (!has("quiet")) line("Point every agent at this file at session start.");
}

function doctor() {
  ensureDirs();
  const problems = [];
  const config = readJson(P.config, null);
  if (!config) problems.push("brain.json missing or invalid. Run init.");
  const sessions = readJsonl(P.sessions);
  const lessons = readJsonl(P.lessons);
  const experiments = readJsonl(P.experiments);

  const sessionIds = new Set();
  for (const session of sessions) {
    if (!session.id) problems.push("session without id in sessions.jsonl");
    if (sessionIds.has(session.id)) problems.push(`duplicate session id ${session.id}`);
    sessionIds.add(session.id);
  }
  for (const exp of experiments) {
    if (exp.status === "applied" && !exp.backup) problems.push(`${exp.id} applied without a backup path`);
    if (exp.status === "applied" && exp.backup) {
      const backupPath = path.isAbsolute(exp.backup) ? exp.backup : path.join(PROJECT, exp.backup);
      if (!fs.existsSync(backupPath)) problems.push(`${exp.id} backup missing: ${exp.backup}`);
    }
  }

  line(`Brain: ${BRAIN}`);
  line(`Sessions: ${sessions.length}. Lessons: ${lessons.length}. Experiments: ${experiments.length}.`);
  line(`Open proposals: ${experiments.filter((exp) => exp.status === "open").length}. Applied: ${
    experiments.filter((exp) => exp.status === "applied").length
  }. Promoted: ${experiments.filter((exp) => exp.status === "promoted").length}.`);

  if (problems.length) {
    line("Problems:");
    for (const problem of problems) line(`  - ${problem}`);
    process.exitCode = 1;
  } else {
    line("Doctor: ok.");
  }
}

function demoFixtures(root) {
  const pre = path.join(root, "fixtures", "pre");
  const post = path.join(root, "fixtures", "post");
  fs.mkdirSync(pre, { recursive: true });
  fs.mkdirSync(post, { recursive: true });
  const day = 86400000;
  const at = (offset) => new Date(Date.now() - offset).toISOString();

  const write = (dir, name, rows) => fs.writeFileSync(path.join(dir, name), JSON.stringify(rows, null, 2));

  write(pre, "session-good.json", [
    { role: "user", content: "Fix the failing price rounding test in checkout.ts.", timestamp: at(6 * day) },
    { role: "assistant", content: "I will read checkout.ts and the test, then run pnpm test.", timestamp: at(6 * day + 1000) },
    { role: "tool", content: "$ pnpm test checkout.test.ts\nAll tests passed (14).", timestamp: at(6 * day + 40000) },
    { role: "assistant", content: "Rounding now uses integer cents. pnpm test passes.", timestamp: at(6 * day + 45000) },
  ]);

  const unverified = (offset) => [
    { role: "user", content: "Update the invoice PDF layout to match the new brand.", timestamp: at(offset) },
    { role: "assistant", content: "Edited invoice.ts, brand.css, header.tsx, footer.tsx, totals.ts.", timestamp: at(offset + 20000) },
    { role: "assistant", content: "The layout is updated and ready.", timestamp: at(offset + 30000) },
  ];
  write(pre, "session-unverified-1.json", unverified(5 * day));
  write(pre, "session-unverified-2.json", unverified(4 * day));

  write(pre, "session-retry.json", [
    { role: "user", content: "Build the app and fix the TypeScript error.", timestamp: at(3 * day) },
    { role: "assistant", content: "$ npm run build\nError: Cannot find module '@/lib/env'.", timestamp: at(3 * day + 5000) },
    { role: "assistant", content: "$ npm run build\nError: Cannot find module '@/lib/env'.", timestamp: at(3 * day + 9000) },
    { role: "assistant", content: "$ npm run build\nError: Cannot find module '@/lib/env'.", timestamp: at(3 * day + 13000) },
    { role: "assistant", content: "$ npm run build\nError: Cannot find module '@/lib/env'.", timestamp: at(3 * day + 17000) },
  ]);

  write(pre, "session-correction.json", [
    { role: "user", content: "Ship the settings page with pnpm, not npm.", timestamp: at(2 * day) },
    { role: "assistant", content: "Ran npm install and npm run build. Build passed.", timestamp: at(2 * day + 10000) },
    { role: "user", content: "No, I said use pnpm. That is wrong.", timestamp: at(2 * day + 20000) },
    { role: "assistant", content: "Switched to pnpm and rebuilt.", timestamp: at(2 * day + 40000) },
  ]);

  const improved = (offset, name) => [
    { role: "user", content: `Apply the copy fix to pricing page ${name}.`, timestamp: at(offset) },
    { role: "assistant", content: "Restating: update pricing copy, then run pnpm lint and pnpm test.", timestamp: at(offset + 2000) },
    { role: "tool", content: "$ pnpm lint\n$ pnpm test\nAll tests passed (22). No lint errors.", timestamp: at(offset + 60000) },
    { role: "assistant", content: "Changed pricing.tsx only. Verification passed.", timestamp: at(offset + 65000) },
  ];
  write(post, "session-after-1.json", improved(120000, "A"));
  write(post, "session-after-2.json", improved(90000, "B"));
  write(post, "session-after-3.json", improved(60000, "C"));

  return { pre, post };
}

function demo() {
  let root = fs.mkdtempSync(path.join(os.tmpdir(), "agent-brain-demo-"));
  try {
    root = fs.realpathSync(root);
  } catch {
  }
  const brain = path.join(root, ".agent-brain");
  const fixtures = demoFixtures(root);
  const run = (args) => {
    const result = spawnSync(process.execPath, [__filename, ...args, "--dir", brain], {
      cwd: root,
      env: { ...process.env, AGENT_BRAIN_DIR: brain },
      encoding: "utf8",
      stdio: "pipe",
    });
    process.stdout.write(result.stdout || "");
    if (result.stderr) process.stderr.write(result.stderr);
    if (result.status !== 0) {
      line(`Demo step failed: ${args.join(" ")}`);
      process.exitCode = result.status || 1;
      return false;
    }
    return true;
  };

  line(`Demo root: ${root}`);
  if (!run(["init"])) return;
  if (!run(["collect", "--from", fixtures.pre])) return;
  if (!run(["analyze", "--days", "30"])) return;
  if (!run(["propose", "--min", "2"])) return;

  const experiments = readJsonl(path.join(brain, "experiments.jsonl"));
  const open = experiments.find((exp) => exp.status === "open");
  if (!open) {
    line("Demo stopped: no proposal was eligible.");
    return;
  }
  if (!run(["apply", open.id, "--yes"])) return;
  if (!run(["collect", "--from", fixtures.post])) return;
  if (!run(["verify", open.id, "--result", "keep", "--window", "30"])) return;
  if (!run(["export"])) return;
  if (!run(["doctor"])) return;

  line("");
  line("Demo complete. Read the report and the exported bootstrap:");
  line(`  ${path.join(brain, "BRAIN.md")}`);
  line(`  ${path.join(brain, "reports")}`);
}

// ---------------------------------------------------------------------------
// entry
// ---------------------------------------------------------------------------

function help() {
  line("agent-brain: local self-improving loop for agent sessions");
  line("");
  line("Commands:");
  line("  init                       create the brain folder and templates");
  line("  collect [--from path]      ingest sessions (default: known local stores)");
  line("  analyze [--days 7]         score sessions, write a report, update lessons");
  line("  lessons [--status s]       list lessons");
  line("  propose [--min 2]          create reviewable edits from eligible lessons");
  line("  apply <id> --yes           apply one proposal with a backup");
  line("  verify <id> --result keep|revert [--window 14]");
  line("  export                     write BRAIN.md for the next session");
  line("  doctor                     check integrity");
  line("  demo                       run the whole loop on synthetic sessions");
  line("");
  line("Global: --dir <path> overrides the brain folder.");
}

const commands = {
  init,
  collect,
  analyze,
  lessons: listLessons,
  propose,
  apply: () => apply(argv[1]),
  verify: () => verify(argv[1]),
  export: exportBrain,
  doctor,
  demo,
  help,
};

if (!commands[command]) {
  help();
  process.exitCode = 1;
} else {
  try {
    commands[command]();
  } catch (error) {
    line(`agent-brain failed: ${error.message}`);
    process.exitCode = 1;
  }
}
