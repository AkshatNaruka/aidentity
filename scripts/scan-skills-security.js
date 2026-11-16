#!/usr/bin/env node

/**
 * Security scanner and integrity verifier for vendored AI agent skills.
 *
 * Scans every file in skills/** and verifies:
 *   1. No hidden/invisible Unicode characters (zero-width spaces, BiDi overrides)
 *   2. No live credentials or private keys (AWS, GitHub, OpenAI, Anthropic, Slack, Google, PEM)
 *   3. No destructive commands (rm -rf /, fork bombs, mkfs, dd to /dev, chmod 777 /)
 *   4. No malicious prompt injection payloads or jailbreak instructions
 *   5. No unverified remote script execution (curl/wget | sh from untrusted hosts)
 *   6. No symlinks escaping the skill directory or unexpected executable binaries
 *   7. Computes SHA-256 content digest and file count per skill
 *
 * Usage:
 *   node scripts/scan-skills-security.js           # write registry/security.json
 *   node scripts/scan-skills-security.js --check   # verify registry/security.json is up to date & 0 critical issues
 *   node scripts/scan-skills-security.js --json    # output JSON report to stdout
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.join(__dirname, "..");
const SKILLS_DIR = path.join(ROOT, "skills");
const REGISTRY_FILE = path.join(ROOT, "registry", "skills.json");
const OUT_FILE = path.join(ROOT, "registry", "security.json");

const BINARY_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".ico",
  ".pdf",
  ".zip",
  ".gz",
  ".tar",
  ".woff",
  ".woff2",
  ".ttf",
  ".otf",
]);

// Known official vendor CLI installers documented in Google Cloud / Astral upstream docs
const TRUSTED_PIPE_SH_DOMAINS = [
  /^curl\s+-[A-Za-z]+\s+(https?:\/\/)?cli\.genkit\.dev\s*\|\s*(bash|sh)\b/i,
  /^`?curl\s+-[A-Za-z]+\s+https:\/\/astral\.sh\/uv\/install\.sh\s*\|\s*(bash|sh)`?$/i,
];

// Defensive documentation / evaluation contexts where an injection phrase or exploit example is quoted as a warning or security test fixture
const DEFENSIVE_CONTEXT_RE =
  /(?:\b(?:never|do not|don't|avoid|block|blocked|prevent|detect|flag|refuse|fail loudly|rather than|malicious|attacker|example|such as|prompt[- ]injection|false sense of security|treat it as data|untrusted data|guardrail|directive|payload|test_case|expected_behavior|expected_output)\b|e\.g\.)/i;
const DEFENSIVE_FILE_RE = /(?:\/evals\/|model-armor-payload\.json$)/i;

const SECRET_RULES = [
  { id: "AWS_ACCESS_KEY", re: /\b(AKIA|ASIA)[0-9A-Z]{16}\b/, label: "AWS access key ID" },
  { id: "GITHUB_TOKEN", re: /\bgh[pousr]_[A-Za-z0-9]{36,}\b/, label: "GitHub personal access token" },
  { id: "GITHUB_PAT", re: /\bgithub_pat_[A-Za-z0-9_]{40,}\b/, label: "GitHub fine-grained token" },
  { id: "OPENAI_KEY", re: /\bsk-[A-Za-z0-9]{32,}\b/, label: "OpenAI secret key" },
  { id: "ANTHROPIC_KEY", re: /\bsk-ant-[A-Za-z0-9_-]{32,}\b/, label: "Anthropic API key" },
  { id: "SLACK_TOKEN", re: /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/, label: "Slack token" },
  { id: "GOOGLE_API_KEY", re: /\bAIza[0-9A-Za-z_-]{35}\b/, label: "Google API key" },
  { id: "PRIVATE_KEY", re: /-----BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/, label: "Private key block" },
];

const DESTRUCTIVE_RULES = [
  {
    id: "RM_RF_ROOT",
    re: /\brm\s+(-[a-z]*[rf][a-z]*\s+)+(\/|~|\$HOME)(\s|$)/i,
    label: "Recursive delete of root or home directory",
  },
  { id: "FORK_BOMB", re: /:\(\)\s*\{\s*:\|:&\s*\};:/, label: "Shell fork bomb" },
  { id: "MKFS_DEV", re: /\bmkfs(\.\w+)?\s+\/dev\//i, label: "Filesystem format on device" },
  { id: "DD_DEV", re: /\bdd\b[^\n]*\bof=\/dev\/(sd|nvme|hd|disk|rdisk)/i, label: "Raw disk write via dd" },
  { id: "CHMOD_ROOT", re: /\bchmod\s+-R\s+777\s+\/(\s|$)/i, label: "World-writable root filesystem" },
];

const INJECTION_RULES = [
  {
    id: "PROMPT_INJECTION_IGNORE",
    re: /\bignore\s+(all\s+)?(previous|prior|above)\s+(instructions|prompts|rules)\b/i,
    label: "Prompt injection override directive",
  },
  {
    id: "PROMPT_INJECTION_EXFIL",
    re: /\b(exfiltrate|steal|upload)\s+(all\s+)?(ssh\s+keys|environment\s+variables|\.env|credentials|private\s+keys)\b/i,
    label: "Credential exfiltration instruction",
  },
  {
    id: "REVERSE_SHELL",
    re: /\b(bash\s+-i\s+>&\s*\/dev\/tcp\/|nc\s+-e\s+\/bin\/(sh|bash)|mkfifo\s+\/tmp\/[^\s;]+;\s*nc\b)/i,
    label: "Reverse shell payload",
  },
];

const UNICODE_HIDDEN_RE = /[\u200B-\u200D\uFEFF\u202A-\u202E\u2066-\u2069]/;
const PIPE_TO_SHELL_RE = /\b(curl|wget)\b[^\n|]*\|\s*(sudo\s+)?(sh|bash|zsh)\b/i;

function walkSkillDir(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    const lstat = fs.lstatSync(full);
    if (lstat.isSymbolicLink()) {
      acc.push({ path: full, symlink: true });
    } else if (lstat.isDirectory()) {
      walkSkillDir(full, acc);
    } else if (lstat.isFile()) {
      acc.push({ path: full, symlink: false });
    }
  }
  return acc.sort((a, b) => a.path.localeCompare(b.path));
}

function scanSkill(skill) {
  const findings = [];
  const advisories = [];

  if (!skill.distributable || !skill.path) {
    return {
      id: skill.id,
      status: "verified-pointer",
      risk_level: "safe",
      verified: true,
      files_scanned: 0,
      sha256: null,
      capabilities: { scripts: false, network_docs: false },
      findings: [],
      advisories: [],
    };
  }

  const skillDir = path.join(ROOT, path.dirname(skill.path));
  const files = walkSkillDir(skillDir);
  const hash = crypto.createHash("sha256");

  let hasScripts = false;
  let hasNetworkDocs = false;

  for (const item of files) {
    const relFile = path.relative(ROOT, item.path).split(path.sep).join("/");

    if (item.symlink) {
      findings.push({
        severity: "critical",
        rule: "SYMLINK_FORBIDDEN",
        file: relFile,
        line: 0,
        message: "Symlinks are not permitted inside skill directories",
      });
      continue;
    }

    const ext = path.extname(item.path).toLowerCase();
    const rawBytes = fs.readFileSync(item.path);
    hash.update(relFile + "\0");
    hash.update(rawBytes);

    if ([".py", ".sh", ".js", ".mjs", ".cjs", ".ps1"].includes(ext)) {
      hasScripts = true;
    }

    if (BINARY_EXTENSIONS.has(ext)) {
      continue;
    }

    // Check for unexpected null bytes in non-binary files
    if (rawBytes.includes(0)) {
      findings.push({
        severity: "critical",
        rule: "UNEXPECTED_BINARY",
        file: relFile,
        line: 0,
        message: `Unexpected binary null byte in text file (${ext || "no extension"})`,
      });
      continue;
    }

    const content = rawBytes.toString("utf8");
    const lines = content.split(/\r?\n/);

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      const lineNo = i + 1;
      const contextWindow = [lines[i - 2] || "", lines[i - 1] || "", line, lines[i + 1] || ""].join(" ");
      const isDefensive = DEFENSIVE_CONTEXT_RE.test(contextWindow) || DEFENSIVE_FILE_RE.test(relFile);

      // 1. Hidden Unicode
      if (UNICODE_HIDDEN_RE.test(line)) {
        findings.push({
          severity: "critical",
          rule: "HIDDEN_UNICODE",
          file: relFile,
          line: lineNo,
          message: "Contains invisible Unicode or bidirectional override characters",
        });
      }

      // 2. Live secrets
      for (const rule of SECRET_RULES) {
        if (rule.re.test(line)) {
          // Ignore obvious dummy/example placeholders (e.g. AKIAIOSFODNN7EXAMPLE)
          if (/EXAMPLE|DUMMY|FAKE|REDACTED|YOUR_|XXXX/i.test(line)) continue;
          findings.push({
            severity: "critical",
            rule: rule.id,
            file: relFile,
            line: lineNo,
            message: `Potential ${rule.label} detected`,
          });
        }
      }

      // 3. Destructive commands
      for (const rule of DESTRUCTIVE_RULES) {
        if (rule.re.test(line) && !isDefensive) {
          findings.push({
            severity: "critical",
            rule: rule.id,
            file: relFile,
            line: lineNo,
            message: `${rule.label} outside defensive guardrail context`,
          });
        }
      }

      // 4. Prompt injection / exfiltration / reverse shells
      for (const rule of INJECTION_RULES) {
        if (rule.re.test(line) && !isDefensive) {
          findings.push({
            severity: "critical",
            rule: rule.id,
            file: relFile,
            line: lineNo,
            message: `${rule.label} outside defensive documentation context`,
          });
        }
      }

      // 5. Pipe remote script to shell
      if (PIPE_TO_SHELL_RE.test(line)) {
        const trimmed = line.trim();
        const isTrustedVendor = TRUSTED_PIPE_SH_DOMAINS.some((re) => re.test(trimmed));
        if (isTrustedVendor) {
          hasNetworkDocs = true;
          advisories.push({
            rule: "VENDOR_INSTALL_SCRIPT",
            file: relFile,
            line: lineNo,
            message: "Documents official vendor CLI install script via curl|sh",
          });
        } else if (!isDefensive) {
          findings.push({
            severity: "critical",
            rule: "UNTRUSTED_PIPE_TO_SHELL",
            file: relFile,
            line: lineNo,
            message: `Pipes remote content to shell: ${trimmed.slice(0, 90)}`,
          });
        }
      }
    }
  }

  const verified = findings.length === 0;
  return {
    id: skill.id,
    status: verified ? "verified" : "failed",
    risk_level: verified ? "safe" : "critical",
    verified,
    files_scanned: files.length,
    sha256: hash.digest("hex"),
    capabilities: {
      scripts: hasScripts,
      network_docs: hasNetworkDocs,
    },
    findings,
    advisories,
  };
}

function scanAll() {
  const registry = JSON.parse(fs.readFileSync(REGISTRY_FILE, "utf8"));
  const results = [];
  let totalFiles = 0;
  let criticalCount = 0;
  let advisoryCount = 0;

  for (const skill of registry.skills) {
    const res = scanSkill(skill);
    totalFiles += res.files_scanned;
    criticalCount += res.findings.length;
    advisoryCount += res.advisories.length;
    results.push(res);
  }

  // Also scan first-party rules, agents, commands, hooks, and prompts/setup
  const firstPartyDirs = ["rules", "agents", "commands", "hooks", "prompts/setup"];
  const firstPartyFindings = [];
  for (const dir of firstPartyDirs) {
    const fullDir = path.join(ROOT, dir);
    if (!fs.existsSync(fullDir)) continue;
    const files = walkSkillDir(fullDir);
    for (const item of files) {
      const relFile = path.relative(ROOT, item.path).split(path.sep).join("/");
      // hooks/block-dangerous.js and hooks/scan-secrets.js intentionally contain regexes for bad patterns
      if (relFile.startsWith("hooks/")) continue;
      const ext = path.extname(item.path).toLowerCase();
      if (BINARY_EXTENSIONS.has(ext)) continue;
      const content = fs.readFileSync(item.path, "utf8");
      if (UNICODE_HIDDEN_RE.test(content)) {
        firstPartyFindings.push({
          severity: "critical",
          rule: "HIDDEN_UNICODE",
          file: relFile,
          line: 0,
          message: "Contains hidden Unicode characters",
        });
      }
    }
  }

  criticalCount += firstPartyFindings.length;

  const skillsMap = {};
  for (const res of results) {
    skillsMap[res.id] = {
      status: res.status,
      risk_level: res.risk_level,
      verified: res.verified,
      files_scanned: res.files_scanned,
      sha256: res.sha256,
      capabilities: res.capabilities,
      findings_count: res.findings.length,
      ...(res.findings.length ? { findings: res.findings } : {}),
      ...(res.advisories.length ? { advisories: res.advisories } : {}),
    };
  }

  return {
    report: {
      name: "aidentity-security",
      version: "1.0.0",
      total_skills: results.length,
      verified_skills: results.filter((r) => r.verified).length,
      failed_skills: results.filter((r) => !r.verified).length,
      total_files_scanned: totalFiles,
      critical_findings: criticalCount,
      advisories: advisoryCount,
      policy: {
        checks: [
          "no-hidden-unicode-or-bidi",
          "no-hardcoded-secrets-or-keys",
          "no-destructive-shell-commands",
          "no-prompt-injection-or-exfiltration",
          "no-untrusted-pipe-to-shell",
          "no-symlinks-or-unexpected-binaries",
          "sha256-content-integrity",
        ],
      },
      skills: skillsMap,
    },
    criticalFindings: [...results.flatMap((r) => r.findings), ...firstPartyFindings],
  };
}

if (require.main === module) {
  const { report, criticalFindings } = scanAll();
  const serialized = JSON.stringify(report, null, 2) + "\n";

  if (process.argv.includes("--json")) {
    console.log(JSON.stringify({ ok: criticalFindings.length === 0, ...report }, null, 2));
    process.exit(criticalFindings.length === 0 ? 0 : 1);
  }

  if (process.argv.includes("--check")) {
    if (criticalFindings.length > 0) {
      for (const f of criticalFindings) {
        console.error(`FAIL  [${f.rule}] ${f.file}:${f.line} — ${f.message}`);
      }
      process.exit(1);
    }
    const current = fs.existsSync(OUT_FILE) ? fs.readFileSync(OUT_FILE, "utf8") : "";
    if (current !== serialized) {
      console.error("registry/security.json is stale. Run: node scripts/scan-skills-security.js");
      process.exit(1);
    }
    console.log(
      `Security check passed: ${report.verified_skills}/${report.total_skills} skills verified (${report.total_files_scanned} files, 0 critical findings).`
    );
    process.exit(0);
  }

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, serialized);

  if (criticalFindings.length > 0) {
    for (const f of criticalFindings) {
      console.error(`FAIL  [${f.rule}] ${f.file}:${f.line} — ${f.message}`);
    }
    process.exit(1);
  }

  console.log(
    `Scanned ${report.total_skills} skills (${report.total_files_scanned} files): ${report.verified_skills} verified, 0 critical findings, ${report.advisories} advisories.`
  );
  console.log(`Wrote ${path.relative(ROOT, OUT_FILE)}`);
}

module.exports = { scanAll, scanSkill };
