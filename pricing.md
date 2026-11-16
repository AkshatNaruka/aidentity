# Pricing — Aidentity

Last updated: 2026-11-16

Aidentity is 100% free and open-source. There are no paid tiers, no seat limits, no API keys required, and no paywalls.

## Individual Profile (`--profile individual`)
- Price: $0 / forever
- Limits: Unlimited installs, unlimited repositories, unlimited developers
- Included: All 507 installable skills, 20 role setup playbooks, coding rules, subagents, slash commands, `block-dangerous.js` and `scan-secrets.js` hooks, SHA-256 verification
- Install command: `npx aidentity setup <role> --profile individual`

## Enterprise Profile (`--profile enterprise`)
- Price: $0 / forever (self-hosted directly in your repository)
- Limits: Unlimited seats, unlimited CI/CD runs, zero external telemetry
- Included: Everything in Individual + 4 mandatory security/supply-chain audit skills (`addyosmani/security-and-hardening`, `trailofbits/supply-chain-risk-auditor`, `trailofbits/agentic-actions-auditor`, `addyosmani/code-review-and-quality`), all 4 runtime hooks (`block-dangerous.js`, `scan-secrets.js`, `format-on-save.js`, `test-on-stop.js`), and `.aidentity-lock.json` SHA-256 integrity auditing via `npx aidentity audit`
- Install command: `npx aidentity setup <role> --profile enterprise`

## Licensing
- CLI & site generator code: MIT
- Registry metadata (`registry/skills.json`, `roles/roles.json`, `registry/security.json`): CC0 1.0 Universal
- Vendored skills: MIT, Apache-2.0, or CC BY-SA 4.0 (per skill entry in `registry.json`)
- Index-only skills (`distributable: false`): Metadata & upstream link only; not redistributed
