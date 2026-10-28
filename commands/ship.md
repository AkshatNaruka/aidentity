---
description: Run the full pre-ship check and open a pull request
argument-hint: [commit message]
allowed-tools: Read, Grep, Glob, Bash(git status:*), Bash(git diff:*), Bash(git add:*), Bash(git commit:*), Bash(git push:*), Bash(npm test:*), Bash(npm run build:*), Bash(node scripts/*), Bash(gh pr create:*)
---

Ship the current changes.

1. **Inspect** — `git status` and `git diff`. If unrelated files are modified, stop and ask.
2. **Validate** — run the repository's own gates:
   - `node scripts/build-registry.js --check`
   - `node scripts/check-licenses.js`
   - `node scripts/validate.js` (if present)
   - the project's tests and build
3. **Review your own diff** — debug leftovers, commented code, secrets, TODOs without an owner.
4. **Commit** — message: `$ARGUMENTS` or a concise summary. One logical change per commit.
5. **Push and open a PR** — include what changed, why, how it was verified, and anything
   intentionally left out.

If any gate fails, fix it or stop. Never push with a red gate and a note saying so.
