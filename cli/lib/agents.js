/**
 * Agent targets: where each supported coding agent keeps its skills, rules,
 * subagents, commands and hooks.
 *
 * Kept in its own module so the installer, the setup engine and the app can all
 * import it without a circular dependency.
 */

const AGENT_TARGETS = {
  claude: {
    label: "Claude Code",
    rootDir: ".claude",
    skillsDir: ".claude/skills",
    rulesDir: ".claude/rules",
    agentsDir: ".claude/agents",
    commandsDir: ".claude/commands",
    hooksDir: ".claude/hooks",
    settingsFile: ".claude/settings.json",
  },
  cursor: {
    label: "Cursor",
    rootDir: ".cursor",
    skillsDir: ".cursor/skills",
    rulesDir: ".cursor/rules",
    agentsDir: ".cursor/agents",
    commandsDir: ".cursor/commands",
    hooksDir: ".cursor/hooks",
  },
  codex: {
    label: "Codex",
    rootDir: ".codex",
    skillsDir: ".codex/skills",
    rulesDir: ".codex/rules",
    agentsDir: ".codex/agents",
    commandsDir: ".codex/commands",
    hooksDir: ".codex/hooks",
  },
  gemini: {
    label: "Gemini CLI",
    rootDir: ".gemini",
    skillsDir: ".gemini/skills",
    rulesDir: ".gemini/rules",
    agentsDir: ".gemini/agents",
    commandsDir: ".gemini/commands",
    hooksDir: ".gemini/hooks",
  },
  opencode: {
    label: "OpenCode",
    rootDir: ".opencode",
    skillsDir: ".opencode/skills",
    rulesDir: ".opencode/rules",
    agentsDir: ".opencode/agents",
    commandsDir: ".opencode/commands",
    hooksDir: ".opencode/hooks",
  },
  copilot: {
    label: "GitHub Copilot",
    rootDir: ".github",
    skillsDir: ".github/skills",
    rulesDir: ".github/rules",
    agentsDir: ".github/agents",
    commandsDir: ".github/commands",
    hooksDir: ".github/hooks",
  },
};

/**
 * Detect which agent a directory is set up for. An exact skills directory is a
 * real signal; a bare `.github/` is not, because almost every repo has one.
 */
function detectAgent(cwd = process.cwd(), fs) {
  const fileSystem = fs || require("fs");
  for (const [key, target] of Object.entries(AGENT_TARGETS)) {
    if (fileSystem.existsSync(require("path").join(cwd, target.skillsDir))) return key;
  }
  for (const [key, target] of Object.entries(AGENT_TARGETS)) {
    if (key === "copilot") continue;
    if (fileSystem.existsSync(require("path").join(cwd, target.rootDir))) return key;
  }
  return null;
}

module.exports = { AGENT_TARGETS, detectAgent };
