# Discovery

Weekly automation that finds, verifies and imports agent skills.

## What runs

`.github/workflows/discover.yml` on manual dispatch. Scheduled runs are disabled
so the repository does not depend on Actions minutes; run it locally or trigger
it from the Actions tab when you want a new batch.

`scripts/discover-skills.js`:

1. Searches GitHub for each domain (video, design, specs, testing, security,
   data, devops, content, docs, mobile, backend, product).
2. Rejects archived repos, forks, missing licenses, fewer than 100 stars,
   pushes older than 180 days, known sources, aggregator lists and dumps with
   more than 200 skills.
3. Validates sample `SKILL.md` files: frontmatter name + description, body length,
   duplicate names, prompt-injection shapes.
4. Picks the best source per domain by stars, recency, skill count and quality.
5. Imports at most 12 skills, with `LICENSE`, `ATTRIBUTION.md` and a manifest
   recording repo, commit SHA, date, license and script count.
6. Runs `build-registry`, `build-catalog`, `check-licenses` and `validate`.
7. Opens a PR with `reports/discovery-latest.md` as the body.

## Guarantees

- **No code is executed** from a candidate repo. Scripts are copied and flagged.
- **No unlicensed content.** The license allowlist is in `scripts/discover-skills.js`.
- **No duplicate names** against the existing registry.
- **Small PRs.** One source per domain per run, max 12 skills.
- **Human review.** The PR is never auto-merged.

## Run it locally

```bash
GITHUB_TOKEN=$(gh auth token) node scripts/discover-skills.js --domain video --dry-run
GITHUB_TOKEN=$(gh auth token) node scripts/discover-skills.js --domain all --dry-run
GITHUB_TOKEN=$(gh auth token) node scripts/discover-skills.js --domain design --import
```

Dry runs write `reports/discovery-latest.md` and change nothing else.
