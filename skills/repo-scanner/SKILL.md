---
name: repo-scanner
description: Scan GitHub for new AI/agent resources and create import PRs. Use when user asks to find new tools, update repo, or discover resources.
---

# Repo Scanner Skill

Discovers and imports new AI/agent resources from GitHub.

## When to Use

- User asks to find new AI tools/resources
- User wants to update the repo with latest content
- User says "scan for new repos" or "find new skills"
- User mentions importing a specific repository

## Steps

### For Full Scan
1. Run `node scripts/scan-repos.js` to find new repos
2. Review findings in `scan-results/scan-report.md`
3. For high-value findings (1000+ stars):
   - Clone repo (shallow: `--depth 1`)
   - Copy SKILL.md files to `skills/<source>/`
   - Copy prompts to `prompts/imported/`
   - Copy agent defs to `agents/imported/`
4. Update relevant README.md with source attribution
5. Create PR with all changes using `gh pr create`

### For Specific Import
1. Clone target repo: `git clone --depth 1 https://github.com/<owner>/<repo>.git /tmp/<repo>`
2. Identify importable content:
   - SKILL.md files → `skills/<source>/`
   - Prompt files → `prompts/imported/`
   - Agent definitions → `agents/imported/`
3. Copy files maintaining structure
4. Create `README.md` with source attribution
5. Create PR with changes

## Quality Criteria

- Minimum 1000 stars for new repos
- Active maintenance (updated within 6 months)
- Clear documentation
- Compatible with SKILL.md standard

## Import Structure

```
skills/<source-name>/
├── README.md           # Source attribution & description
├── skill-1/
│   └── SKILL.md
├── skill-2/
│   └── SKILL.md
└── ...
```

## Output

PR should include:
- New skills imported with source attribution
- Updated README files
- Any configuration files needed
- Links to original repos

## Commands

```bash
# Full scan
node scripts/scan-repos.js

# Quick scan (trending only)
node scripts/scan-repos.js --quick

# Check specific repo
node scripts/scan-repos.js --repo owner/repo
```
