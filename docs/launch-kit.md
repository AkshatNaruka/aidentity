# Launch kit

Copy, edit the dated bits, post. One primary channel per day; do not blast every
channel with the same text on the same morning.

## The line

> Aidentity is a verified index of 394 AI agent skills. Every entry has an author,
> a license and a last-checked date. Install any of them into Claude Code, Cursor,
> Codex, Gemini CLI, OpenCode or Copilot with one command.

## Show HN

**Title:** `Show HN: A verified index of 394 AI agent skills, installable in one command`

**First comment:**

> I kept finding skill lists that were accurate once. Links rot, licenses are
> unstated, and every agent uses a different folder.
>
> Aidentity normalizes 394 skills from 15 repositories into one registry. Each
> entry has a stable ID, category, status, upstream author, license and a
> verification date. CI re-checks every source weekly. Content whose license
> forbids redistribution (19 Anthropic skills) is indexed with a link, not copied.
>
> Install: `npx AkshatNaruka/aidentity add <id>`. It detects the agent and writes to its skills
> directory. There are 8 task bundles if you don't want to pick individually.
>
> The registry is CC0 JSON; the code is MIT. I'd like feedback on the license
> model and on which sources are missing.

Do not ask for upvotes. Answer every comment for two hours.

## Product Hunt

- **Tagline:** npm for agent skills — search, verify, install.
- **Description:** 394 skills, 15 sources, license and author on every entry. One command installs into six agents. Weekly verification, no account.
- **First comment:** the license story — why 19 skills are index-only, and why that is the honest default.
- **Gallery:** OG image, browse page, a skill page, the terminal install.

## X / Twitter thread

1. Agent skills are the new packages. There is no index.
2. 394 skills, 15 repos, six agents, four different folder conventions.
3. So I built one: stable IDs, licenses, authors, last-verified dates.
4. `npx AkshatNaruka/aidentity add <id>` — auto-detects Claude Code, Cursor, Codex, Gemini, OpenCode, Copilot.
5. 19 Anthropic skills are indexed but not hosted. Their license forbids it. Every index should say this out loud.
6. Registry is CC0 JSON: `registry.json`. Site: link. Feedback welcome.

Attach the OG image and a 20-second terminal recording.

## Reddit

- **r/ClaudeAI:** focus on Claude Code; mention the 4 hooks and 7 subagents.
- **r/LocalLLaMA:** focus on the machine-readable registry and the CC0 data.
- **r/ChatGPTCoding:** focus on cross-agent install and licenses.
- **r/ExperiencedDevs:** focus on link rot and the weekly verification, not the AI angle.

Post as a text post with the link in the body, not a bare link. Answer questions.

## LinkedIn

Short version of the X thread, no hashtags beyond three. Lead with the license
problem, not the product.

## Dev.to / Hashnode

Title: **I checked 15 agent-skill repositories. The hard part was not the skills.**
Sections: link rot, license ambiguity, folder conventions, the registry schema,
what I excluded and why, how to contribute.

## 30-day cadence

| Day | Action |
|---|---|
| 1 | Show HN + X thread |
| 2 | Product Hunt |
| 3 | Reddit (one sub) |
| 7 | "New & verified this week" post + RSS |
| 14 | Publish the link-rot report with real numbers |
| 21 | Ask the 15 upstream maintainers to link back |
| 28 | Bundle spotlight: which 10 skills and why |

## Metrics that matter

Installs (`npm` downloads), unique visitors, registry PRs merged, dead-link rate,
referring domains. Stars are a lagging indicator.
