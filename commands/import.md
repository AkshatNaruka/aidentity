---
description: Import a skill source into the registry, with license verification
argument-hint: <owner/repo>
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(git clone:*), Bash(git rev-parse:*), Bash(node scripts/*)
---

Import `$ARGUMENTS` into this repository. Follow the gates; do not skip them.

1. **Verify upstream.** Record stars, last commit date, license, and whether it is archived.
   Reject if unlicensed, archived, or no commits in six months.
2. **Check duplication.** Search `registry/skills.json` for the same skill names or concepts.
   If it duplicates an existing source, stop and report the overlap.
3. **Inspect before copying.** List every `SKILL.md`. Read scripts for network calls,
   package installs, or credential access. Never execute them.
4. **Copy.** `skills/<source>/<skill>/`, preserving `SKILL.md` frontmatter.
   Add `skills/<source>/LICENSE` and `ATTRIBUTION.md` with repo, commit SHA, date, license.
5. **Record.** Add the source to `registry/sources.json`, the import to
   `registry/manifests/<source>.json`, and update `THIRD_PARTY_NOTICES.md`.
6. **Gate.** `node scripts/build-registry.js && node scripts/check-licenses.js`.
7. **Commit.** One source per commit. Report what was added and what was excluded, with reasons.
