---
type: EnterpriseGovernancePolicy
title: Aidentity Enterprise AI Agent Trust & Security Architecture
description: Complete enterprise governance framework: zero external telemetry, SHA-256 lockfile immutability, 7-gate AST static analysis, runtime pre-execution hooks, air-gapped private VPC mirroring, and compliance mapping (NIST SSDF & OWASP LLM).
resource: https://akshatnaruka.github.io/aidentity/enterprise/
tags: [enterprise, ciso-approval, zero-telemetry, sha256-lockfile, air-gapped, nist-ssdf, owasp-llm, runtime-hooks]
timestamp: 2026-11-27
---

# Aidentity Enterprise AI Agent Security & Trust Architecture

See [OKF Index](./index.md) · [Skill Security Standard](./security.md) · [Role Setup Playbooks](./playbooks.md).

## 5 Enterprise Guarantees

1. **Zero External Telemetry**: 100% local execution. Code, prompts, and tokens never leave developer machines or VPCs.
2. **Cryptographic SHA-256 Lockfile**: `.aidentity-lock.json` records immutable content hashes. Upstream tampering halts execution in CI.
3. **7-Gate Static AST Analysis**: Scans every file for Trojan Unicode, hardcoded secrets, destructive shell patterns, and prompt injections.
4. **Active Runtime Guardrails**: Synchronous pre-tool hooks (`block-dangerous.js` and `scan-secrets.js`) intercept and block unauthorized operations before execution.
5. **Air-Gapped & Self-Hosted Ready**: Complete repository mirrors cleanly into internal GitLab or GitHub Enterprise servers with zero external network access required.

## Compliance & Standards Alignment

- **NIST SP 800-218 (SSDF v1.1)**: PO.3.1 (Software Tampering Protection), PS.1.1 (Pre-release Software Security Testing), PW.1.2 (Security Review Checklists).
- **OWASP Top 10 for LLMs (2025)**: LLM01:2025 Prompt Injection, LLM02:2025 Sensitive Information Disclosure, LLM05:2025 Supply Chain Vulnerabilities, LLM07:2025 System Prompt Leakage.
- **SOC 2 Type II**: CC6.1 (Logical Access Controls), CC6.6 (Boundary Protection & Exfiltration Prevention), CC7.1 (Vulnerability Detection & Static Analysis).

## CISO Architecture Review Ticket Template

Ready-to-file security clearance request template available at [Enterprise Trust Center](https://akshatnaruka.github.io/aidentity/enterprise/#ciso-ticket).
