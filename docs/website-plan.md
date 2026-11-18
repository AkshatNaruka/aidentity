# Website plan: from catalogue to "the vetted shortlist"

Status: phase 1 and 2 implemented in this PR. Phase 3 is backlog.

## 1. Is the project useful?

**Yes, but the site undersells why.**

The agent-skills ecosystem in 2026 has a distribution problem that looks like npm's early days:

| Channel | What it optimises for | Gap |
| --- | --- | --- |
| skills.sh (Vercel) | Reach. Leaderboard ranked by install telemetry, `npx skills add owner/repo` | No review step. Popularity is not safety. |
| SkillsMP and similar aggregators | Volume. Hundreds of thousands of scraped skills | No licence or security filter. |
| Agent-native marketplaces (Claude Code `/plugin`, Codex `$skill-installer`) | Convenience inside one agent | One agent at a time. |
| Copying folders from GitHub | Control | Manual. No provenance trail, no integrity check. |

Practitioner guidance now says to treat third-party skills like `curl | sh` from an unmoderated forum. A skill is a prompt that runs with your agent's tools, so hidden Unicode, a pasted secret, or a `curl | sh` line is a real supply-chain risk.

Aidentity's real assets, all verifiable in this repo:

1. **Curation with provenance.** 533 skills from 30 named upstreams (Anthropic, Google, Microsoft, Vercel, Trail of Bits, Supabase, Expo, shadcn, Matt Pocock, Addy Osmani, obra/superpowers and more). Every entry carries author, SPDX licence and upstream link.
2. **A security gate in CI.** `scripts/scan-skills-security.js` runs six static checks per file: hidden Unicode, live credentials, destructive commands, prompt-injection payloads, unverified remote execution, and symlink or binary escapes. It also publishes a SHA-256 digest per skill in `security.json`.
3. **A licence gate.** Content that cannot be redistributed is indexed as a pointer, never mirrored.
4. **Role setups.** 21 role playbooks turn "which of 533 skills?" into one command.
5. **An agent-native surface.** `llms.txt`, `agent.json`, OpenAPI, an MCP server, and raw `SKILL.md` URLs.

**Positioning:** Aidentity will not win on volume, so it should not try. It wins as *the vetted shortlist*: fewer skills, each one checked, attributed and installable into six agents with the same command.

## 2. What the current site gets wrong

Audit method: CRO framework (value proposition, headline, CTA hierarchy, trust, objections, friction), the repo's `seo-audit`, `schema` and `programmatic-seo` skills, `design:ux-copy` principles, plus a markup crawl with `scripts/check-site.js`.

### Conversion and copy
- **The value proposition is a feature list.** The lede packs nine claims into one paragraph. A first-time visitor can't tell what problem it solves.
- **CTAs compete.** Three equal-weight buttons, followed by a share row in the hero.
- **It overclaims.** "100% security-verified" and "100% Safe" describe a pattern-based static scan. A sceptical developer reads that as marketing, and it costs trust on the one axis the product competes on.
- **No objection handling.** "Why not skills.sh?", "What does verified mean?" and "Does it work with my agent?" are not answered anywhere on the homepage.
- **Weak proof.** The strongest proof (skills from Anthropic, Google, Microsoft, Vercel, Trail of Bits) sits in a 30-row table at the bottom of the page.

### SEO
- **Skill pages use the raw slug** as H1 and title (`<h1>tdd</h1>`, "tdd | testing AI agent skill"). They don't match how people search ("TDD skill for Claude Code").
- **Untruthful freshness signals.** Every sitemap `lastmod` and every `dateModified` is the build date, and `changefreq` says "daily" everywhere. Search engines learn to ignore lastmod that always changes.
- **Wrong security label.** The skill page "Security" field says `verified` even when no scan record exists, including index-only skills whose content is not hosted. This is a correctness bug as well as a trust problem.
- **Wrong schema type.** Skills are typed only as `TechArticle`. `SoftwareSourceCode` (with `codeRepository`, `license`, `programmingLanguage`) describes them better.
- **No page targets comparison intent** ("skills.sh alternative", "safe Claude Code skills").
- **No answer content** for AI answer engines on the homepage (no FAQ). This matters for GEO: LLM answers quote short, factual Q&A blocks.

## 3. Plan

### Phase 1: Truth and trust (this PR)
- [x] Replace "100%" claims with what the scanner actually does.
- [x] Skill-page security field: `scanned, 0 findings` / `not scanned (not hosted)` / `not scanned`.
- [x] Stable `lastmod` and `dateModified`, taken from the registry's content date. Drop `changefreq` and `priority`, which Google ignores.

### Phase 2: Homepage that converts, plus SEO surfaces (this PR)
- [x] **Hero:** one sentence on the problem and one on the outcome. One primary CTA ("Browse 533 skills"), one secondary ("Build my role setup"). Move the share row out of the hero.
- [x] **Proof strip:** upstream maintainers named directly under the hero.
- [x] **How it works:** find, check, install, with the real command and the real directories written.
- [x] **Comparison block** with honest "use the others when..." rows. Links to a full `/compare/` page.
- [x] **FAQ** (visible) with `FAQPage` JSON-LD: what a skill is, what "scanned" means, agent support, cost, licensing.
- [x] **Skill pages:** human-readable names in H1 and title, with a title pattern matching search intent (`<Name>: agent skill for Claude Code, Codex & Cursor`). Add `SoftwareSourceCode` schema.
- [x] **New `/compare/` page:** "Aidentity vs skills.sh vs SkillsMP vs copying from GitHub". Factual and fair, targets alternative and comparison queries, in the sitemap and `llms.txt`.

### Phase 3: Backlog (not in this PR)
- **Per-skill OG images** generated at build time. Social shares currently all use one image.
- **Category landing pages** at real URLs (`/skills/category/testing/`) instead of `?category=`, with an intro and the top skills. Query-string URLs are weak breadcrumb and landing targets.
- **Real usage proof:** GitHub stars and an install count from the CLI (opt-in, aggregated), shown honestly.
- **Search Console and IndexNow monitoring:** track impressions for "<skill> skill claude code" queries and tune titles.
- **Slim the 755 KB `/skills/` page:** render the first 100 rows server-side and hydrate the rest from `search.json`, keeping a crawlable paginated fallback.
- **Version consistency:** `package.json` (0.1.0), the MCP server (1.1.0) and the site JSON-LD (1.2.0) should come from one source.

## 4. Writing rules used

From `AGENTS.md` and the `ux-copy` skill:
- Numbers over adjectives, and verbs first on CTAs.
- No em dashes.
- No "seamless", "supercharge" or "revolutionary".
- Never claim more than the code does.
- Name competitors fairly and say when they are the better choice.

## Sources
- skills.sh launch and leaderboard: https://vercel.com/blog/introducing-skills, https://vercel.com/blog/building-a-self-driving-skills-sh-leaderboard
- Ecosystem overview: https://codex.danielvaughan.com/2026/05/09/cross-agent-skills-ecosystem-maturity-npm-analogy-codex-cli-portability/
- Registry roundup: https://dev.to/williamwangai/top-10-agent-skills-registries-for-claude-code-codex-gemini-cli-2026-5dm0
