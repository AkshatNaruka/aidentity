Run a full scan of GitHub for new AI/agent resources.

1. Execute `node scripts/scan-repos.js`
2. Review findings in `scan-results/scan-report.md`
3. For repos with 1000+ stars, import valuable content:
   - SKILL.md files → `skills/<source>/`
   - Prompts → `prompts/imported/`
   - Agent defs → `agents/imported/`
4. Create PR with all changes using `gh pr create`

Use the repo-scanner skill for detailed guidance.
