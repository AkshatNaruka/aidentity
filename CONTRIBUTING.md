# Contributing to Aidentity

> **Automation is optional.** You can submit through the issue form or a pull
> request; a maintainer runs the same checks locally. No GitHub Actions minutes
> are required. See [manual submission](docs/manual-submission.md).

The fastest way to contribute is to add one skill. It takes about 30 seconds.

## Add a skill

1. **Fork and clone**

   ```bash
   git clone https://github.com/<you>/aidentity.git
   cd aidentity
   ```

2. **Add the record** to `registry/skills.json` (append to `skills`, keep the array sorted by `id`):

   ```json
   {
     "id": "author/skill-name",
     "name": "skill-name",
     "description": "One or two sentences. What it does and when to use it. No marketing.",
     "category": "engineering",
     "tags": ["testing", "code-review"],
     "status": "stable",
     "path": "skills/author/skill-name/SKILL.md",
     "source": {
       "key": "author",
       "repo": "author/skills",
       "url": "https://github.com/author/skills",
       "author": "Author Name",
       "license": "MIT"
     },
     "distributable": true,
     "install": "npx aidentity add author/skill-name"
   }
   ```

3. **Validate**

   ```bash
   ./scripts/check-all.sh
   ```

4. **Open a PR.** One skill per PR. Don't reformat the whole file.

## Rules (enforced in CI)

| Rule | Why |
|---|---|
| `id` is lowercase, `author/...`, and globally unique | Stable install path forever |
| `license` is a valid SPDX identifier | Legal clarity is the product |
| `distributable: false` for anything not under an open license | We index, we don't redistribute |
| `description` is factual and under ~300 chars | It renders in the site and the CLI |
| Source URL resolves and contains the skill | Verified, not assumed |
| No duplicate `id` | Breaks installs |

**Skills under a proprietary license are welcome as pointer entries.** They are indexed with `distributable: false` and no content is hosted. That is not a second-class listing — it is the honest one.

## Add a tool

Tools live in `registry/tools.json`: editors, CLIs, MCP servers, eval harnesses, observability. Same shape, same rules.

## Add a bundle

Bundles are curated stacks in `bundles/<slug>/bundle.json`:

```json
{
  "slug": "ship-a-saas",
  "name": "Ship a SaaS",
  "description": "What to install before you write the first line of your product.",
  "skills": ["mattpocock/engineering/code-review", "addyosmani/test-driven-development"],
  "order": ["planning", "build", "review", "ship"]
}
```

Bundles are editorial. Open an issue first if you want to add one.

## What we won't merge

- Scraped content with no license
- A copy of an entire upstream repo (link to it instead)
- Prompt-only "skills" with no workflow
- Anything that requires a paid account the description doesn't mention

## Reporting a broken entry

Use the **broken entry** issue template. Include the `id` and what failed. CI re-verifies weekly, but reports are faster.

## Review SLA

We aim to review every PR within 24 hours. If yours is stale after two days, ping the thread.

## Code of conduct

Be direct about the work, generous with the person. Harassment, gatekeeping, and "just use X" comments are not welcome.
