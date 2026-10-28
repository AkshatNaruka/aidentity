# Hooks

Four working Claude Code hooks that stop the most expensive mistakes. Node only — no install step.

| Hook | Event | What it does |
|---|---|---|
| `block-dangerous.js` | PreToolUse · Bash | Blocks `rm -rf ~/`, `git push --force`, hard resets, destructive SQL, `curl \| sh`, fork bombs |
| `scan-secrets.js` | PreToolUse · Write/Edit | Blocks content that looks like an AWS/GitHub/OpenAI/Anthropic/Slack/Google credential or a private key |
| `format-on-save.js` | PostToolUse · Write/Edit | Runs the project's own Prettier / Ruff / gofmt / rustfmt if installed |
| `test-on-stop.js` | Stop | Runs `npm test` when the agent tries to finish; failure sends it back to work |

## Install

Copy [`settings.example.json`](settings.example.json) into `.claude/settings.json` (project) or merge it into `~/.claude/settings.json` (global):

```json
{
  "hooks": {
    "PreToolUse": [
      { "matcher": "Bash", "hooks": [{ "type": "command", "command": "node hooks/block-dangerous.js" }] },
      { "matcher": "Write|Edit", "hooks": [{ "type": "command", "command": "node hooks/scan-secrets.js" }] }
    ],
    "PostToolUse": [
      { "matcher": "Write|Edit", "hooks": [{ "type": "command", "command": "node hooks/format-on-save.js" }] }
    ],
    "Stop": [
      { "hooks": [{ "type": "command", "command": "node hooks/test-on-stop.js" }] }
    ]
  }
}
```

If your hooks live elsewhere, use an absolute path. Test one hook directly before wiring it:

```bash
echo '{"tool_input":{"command":"git push --force"}}' | node hooks/block-dangerous.js; echo "exit=$?"
# → Blocked: force push.  exit=2
```

## Design rules these follow

- **Exit 2 blocks, exit 0 allows.** Never exit non-zero for a warning; it stops the agent for no reason.
- **No network, no installs.** A hook runs on every edit; it must be fast and offline.
- **Skip missing tools silently.** `format-on-save` does nothing if Prettier is not installed.
- **Avoid loops.** `test-on-stop` exits when `stop_hook_active` is true.
- **Seatbelt, not a scanner.** `scan-secrets` catches obvious shapes. Keep a real scanner (gitleaks, trufflehog) in CI.

## Platform support

Hooks are a **Claude Code** feature. The scripts are plain Node and can be adapted:

- **OpenCode** — plugins can subscribe to tool events; call these scripts from a plugin.
- **Codex / Gemini CLI / Cursor** — no equivalent lifecycle hook today. Use the same logic as a pre-commit hook (`husky` + `lint-staged`) or in CI.

## Disable one without editing settings

```bash
TEST_ON_STOP=0 claude      # skip test-on-stop for this session
```
