# Role & Enterprise Setup Prompts

One-command and one-prompt initial setups for **Individuals** and **Enterprises** across all 20 roles.
Every skill included in a role setup is verified by `scripts/scan-skills-security.js` (`registry/security.json`) for zero hidden Unicode, zero leaked credentials, zero destructive commands, and zero prompt-injection payloads.

## Universal Onboarding Prompts

- **[Universal Individual Setup Prompt](universal-individual.md)** — interactive prompt that interviews you about your role and stack, then configures verified skills, rules, and safety hooks.
- **[Universal Enterprise Setup Prompt](universal-enterprise.md)** — strict governance prompt for engineering teams and enterprises with SHA-256 verification, SPDX license checks, supply-chain auditing, and all 4 lifecycle guardrail hooks.

## CLI Usage

```bash
# List all 20 role setups
npx aidentity setup --list

# Set up your current workspace for a role (auto-detects agent or pass --agent)
npx aidentity setup software-engineer --profile individual --agent claude

# Enterprise setup for an architect
npx aidentity setup architect --profile enterprise --agent cursor

# Output a copy-paste setup prompt for any role + custom requirement
npx aidentity setup software-engineer --profile enterprise --task "Next.js + Supabase SaaS" --prompt

# Run the full security audit across all 526 skills
npx aidentity audit
```

## Role Setup Catalog (20 Roles)

| Role | CLI Command | Individual Profile | Enterprise Profile |
|---|---|---|---|
| **[Software engineer](roles/software-engineer.md)** | `npx aidentity setup software-engineer` | 8 skills · 3 rules · 3 agents | 11 skills · 4 hooks |
| **[Software architect](roles/architect.md)** | `npx aidentity setup architect` | 8 skills · 2 rules · 3 agents | 11 skills · 4 hooks |
| **[Product manager](roles/product-manager.md)** | `npx aidentity setup product-manager` | 8 skills · 0 rules · 3 agents | 12 skills · 4 hooks |
| **[Engineering manager](roles/engineering-manager.md)** | `npx aidentity setup engineering-manager` | 8 skills · 0 rules · 3 agents | 11 skills · 4 hooks |
| **[Product designer](roles/designer.md)** | `npx aidentity setup designer` | 8 skills · 2 rules · 2 agents | 12 skills · 4 hooks |
| **[Motion designer](roles/motion-designer.md)** | `npx aidentity setup motion-designer` | 7 skills · 1 rules · 2 agents | 11 skills · 4 hooks |
| **[Content creator](roles/content-creator.md)** | `npx aidentity setup content-creator` | 8 skills · 0 rules · 2 agents | 12 skills · 4 hooks |
| **[Growth marketer](roles/marketer.md)** | `npx aidentity setup marketer` | 8 skills · 0 rules · 3 agents | 12 skills · 4 hooks |
| **[SEO specialist](roles/seo-specialist.md)** | `npx aidentity setup seo-specialist` | 8 skills · 0 rules · 2 agents | 12 skills · 4 hooks |
| **[Finance analyst](roles/finance-analyst.md)** | `npx aidentity setup finance-analyst` | 8 skills · 1 rules · 3 agents | 12 skills · 4 hooks |
| **[Quant researcher](roles/quant-researcher.md)** | `npx aidentity setup quant-researcher` | 8 skills · 1 rules · 3 agents | 12 skills · 4 hooks |
| **[Music producer](roles/music-producer.md)** | `npx aidentity setup music-producer` | 7 skills · 0 rules · 2 agents | 11 skills · 4 hooks |
| **[Filmmaker](roles/filmmaker.md)** | `npx aidentity setup filmmaker` | 7 skills · 0 rules · 2 agents | 11 skills · 4 hooks |
| **[Journalist](roles/journalist.md)** | `npx aidentity setup journalist` | 6 skills · 0 rules · 2 agents | 10 skills · 4 hooks |
| **[Legal counsel](roles/legal-counsel.md)** | `npx aidentity setup legal-counsel` | 6 skills · 0 rules · 3 agents | 9 skills · 4 hooks |
| **[Sales](roles/sales.md)** | `npx aidentity setup sales` | 8 skills · 0 rules · 2 agents | 12 skills · 4 hooks |
| **[Customer support](roles/support.md)** | `npx aidentity setup support` | 6 skills · 0 rules · 3 agents | 10 skills · 4 hooks |
| **[Teacher](roles/teacher.md)** | `npx aidentity setup teacher` | 6 skills · 0 rules · 3 agents | 10 skills · 4 hooks |
| **[HR / people ops](roles/hr-people.md)** | `npx aidentity setup hr-people` | 6 skills · 0 rules · 2 agents | 10 skills · 4 hooks |
| **[Data analyst](roles/data-analyst.md)** | `npx aidentity setup data-analyst` | 8 skills · 1 rules · 3 agents | 12 skills · 4 hooks |
