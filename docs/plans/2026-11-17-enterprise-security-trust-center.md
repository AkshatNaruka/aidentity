# Enterprise Security & Trust Center Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Provide enterprise security teams, CISOs, and compliance officers with cryptographic proof, 7-gate static analysis verification, runtime execution guardrails, air-gapped mirroring, and compliance mapping so organizations can safely adopt verified AI agent skills.

**Architecture:** A dedicated, machine-readable Enterprise Trust Center page (`/enterprise/`) generated statically via `site/build.js`, featuring the 5 Enterprise Security Guarantees, an interactive 7-Gate Security audit explorer, NIST SSDF and OWASP LLM Top 10 compliance matrices, air-gapped VPC deployment blueprints, runtime hook walkthroughs, and a copy-paste CISO security approval packet.

**Tech Stack:** Vanilla Node.js static generator (`site/build.js`), Schema.org JSON-LD (`SecurityPolicy`, `TechArticle`, `FAQPage`), CSS3 modern grid/cards, zero external runtime dependencies.

---

### Task 1: Add Enterprise Trust Center Generator (`buildEnterprise`) in `site/build.js`

**Files:**
- Modify: `site/build.js`
- Test: `site/dist/enterprise/index.html`

**Step 1: Write `buildEnterprise()` function in `site/build.js`**
Construct the complete HTML layout for `/enterprise/index.html` including:
- Hero banner with enterprise trust badges (SOC 2 alignment, NIST SSDF, Zero Telemetry, 100% SHA-256).
- **The 5 Enterprise Guarantees**:
  1. *Zero External Telemetry & 100% Air-Gapped*: Runs locally with zero HTTP callbacks; no company code or prompts ever leave developer machines.
  2. *Deterministic SHA-256 Cryptographic Lockfile*: Every skill is pinned by hash in `.aidentity-lock.json`; tampered code triggers hard execution halt.
  3. *Automated 7-Gate AST & Heuristic Static Analysis*: Scanned on every commit for Unicode trojans, hardcoded credentials, destructive commands, prompt injections, untrusted execution, and symlink jailbreaks.
  4. *Pre-Execution Runtime Guardrail Hooks*: Intercepts and blocks destructive commands (`rm -rf`, format disk) and credential leaks (`.env`, secrets) in Claude Code, Cursor, and Codex before tools execute.
  5. *Strict SPDX Open-Source Provenance*: Zero copyright contamination; proprietary and index-only skills are never mirrored.
- **Interactive 7-Gate Security Verification Breakdown** with live counts from `registry/security.json`.
- **Compliance & Governance Matrix**: Direct mapping to NIST SP 800-218 (Secure Software Development Framework) and OWASP Top 10 for LLMs (LLM01 Prompt Injection, LLM02 Sensitive Information Disclosure, LLM07 System Information Leakage).
- **Private VPC & Air-Gapped Mirroring Blueprint**: Step-by-step instructions for hosting on private GitHub Enterprise, GitLab Self-Managed, or internal npm/Artifactory registries.
- **Copy-Paste CISO Security Review Ticket**: Pre-formatted Markdown template that developers can copy and paste directly into Jira/ServiceNow to get immediate security approval from AppSec/InfoSec.
- **Enterprise CISO FAQ Accordion**: Direct answers to data retention, agent permissions, update propagation, and vulnerability disclosures.

**Step 2: Connect `buildEnterprise()` into the build pipeline**
Add `buildEnterprise()` to the build invocation chain in `site/build.js`.

---

### Task 2: Integrate Enterprise Navigation and Global CTAs

**Files:**
- Modify: `site/build.js: layout()`
- Modify: `site/build.js: buildHome()`
- Modify: `site/build.js: buildAbout()`

**Step 1: Add `Enterprise` to the Primary Navigation Header**
Include `<a href="${p}enterprise/index.html"${page === "enterprise" ? ' aria-current="page"' : ""}>Enterprise</a>` in `site-nav`.

**Step 2: Add Enterprise Trust links to the Footer**
Include `Enterprise Trust Center`, `7-Gate Audit Protocol`, and `Air-Gapped Setup Guide` in the footer link columns.

**Step 3: Add Enterprise Trust Callout on Home & About Pages**
Add a dedicated card/banner on the homepage and about page highlighting enterprise verification, SHA-256 digests, and air-gapped readiness.

---

### Task 3: Update Discovery Endpoints, Manifests & OKF Concept Files

**Files:**
- Modify: `site/build.js: buildMachineReadable()`
- Modify: `site/build.js: buildAgentSurface()`

**Step 1: Update `sitemap.xml`**
Add `{ loc: "/enterprise/", priority: "0.95", changefreq: "daily" }`.

**Step 2: Update Machine-Readable Discovery Files**
- In `llms.txt` and `llms-full.txt`: Add Enterprise Trust Center link and air-gapped setup details.
- In `agent.json` and `.well-known/agent.json`: Add `enterprise: `${SITE}/enterprise/`` to `endpoints`.
- In `.well-known/ai-catalog.json`: Add enterprise trust resource.
- In `ai.txt`: Add `Enterprise: ${SITE}/enterprise/`.
- In `okf/`: Create `okf/enterprise.md` explaining the enterprise governance and security standard.

---

### Task 4: Add Enterprise Styles in `site/assets/style.css`

**Files:**
- Modify: `site/assets/style.css`

**Step 1: Add enterprise CSS classes**
- `.enterprise-hero`, `.trust-pillars-grid`, `.trust-pillar-card`
- `.compliance-table-wrap`, `.compliance-table`
- `.ciso-ticket-card`, `.ciso-ticket-header`, `.ciso-ticket-body`
- `.audit-gate-grid`, `.audit-gate-card`

---

### Task 5: Build, Validate, and Verify

**Files:**
- Run: `node site/build.js`
- Run: `./scripts/check-all.sh`

**Step 1: Run site build**
Verify that all 573+ pages build with 0 errors and `site/dist/enterprise/index.html` is properly generated.

**Step 2: Run complete verification suite**
Run `./scripts/check-all.sh` to ensure all 533 skills, licenses, and security gates pass cleanly.
