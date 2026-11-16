---
type: Course
title: "Quantitative Trading, Risk Management & Institutional Financial Modeling"
description: "Combine institutional 3-statement/DCF/LBO financial modeling with systematic backtesting (Backtrader, VectorBT), Kelly position sizing, regime detection, and risk management."
level: "Advanced"
audience: "Quant researchers, systematic traders, and investment analysts"
resource: https://akshatnaruka.github.io/aidentity/courses/quantitative-finance-investment-workflows/
timestamp: 2026-11-16
---

# Quantitative Trading, Risk Management & Institutional Financial Modeling

Combine institutional 3-statement/DCF/LBO financial modeling with systematic backtesting (Backtrader, VectorBT), Kelly position sizing, regime detection, and risk management.

**Level:** Advanced · **Target Audience:** Quant researchers, systematic traders, and investment analysts · **Skills Included:** 11

## 1. Quick Setup Command

```bash
npx aidentity setup quant-researcher --profile individual
```

## 2. Learning Outcomes

- Build institutional-grade 3-statement, DCF, LBO, and comparable company models.
- Backtest systematic strategies in Python with VectorBT and Backtrader without lookahead bias.
- Size positions and manage drawdown risk using Kelly criterion and market regime detection.

## 3. Curriculum Modules & Verified Skills

### Module 1: Institutional Financial Modeling & Valuation

- **3-statement** (`agentii-ai-agentii-investment-intelligence/3-statement`, undefined): 3-statement financial model, integrated IS BS CF, income statement projection, balance sheet forecast, cash flow statement, cross-statement balancing, financial model build, operating model, three statement model, integrated financial statements
- **dcf** (`agentii-ai-agentii-investment-intelligence/dcf`, undefined): DCF valuation model, discounted cash flow, intrinsic value, WACC calculation, terminal value, free cash flow projection, equity value per share, DCF sensitivity analysis, unlevered free cash flow, present value calculation, build a DCF
- **comps** (`agentii-ai-agentii-investment-intelligence/comps`, undefined): Comparable company analysis, trading comps, peer multiples, EV/EBITDA comparison, P/E benchmarking, comps table, relative valuation, industry multiples, precedent transactions, trading comparable analysis # Curated subset — provenance RECORDED 2026-09-21 (spec 058 T004/T005, FR-051). # # This value was NOT curated and reviewed. It reached the generated # `skill-registry.yaml` first, by a hand-edit of that file on 2026-09-20 (commit # `aea28b1`, "test and debug"), which put the repo red on Check 31 — the registry said # `[retrieval-scope]` while this file declared no `essentials_modes` at all. Spec 058 # then reconciled the divergence by declaring the registry's value here, which is the # declaration FR-051 asks for (the source of truth is this file; `sync-registry.sh` # regenerates the registry from it — `sync_registry.build_entries()` reads # `essentials_modes` straight from this frontmatter, so a hand-edit to the registry # cannot survive a check). # # What is still OPEN is the curation itself: nobody has judged whether # `retrieval-scope` is the right default for this skill. The kit's only documented # derivation, `essentials_modes = first <=3 modes` (scripts/mode_backfill.py), would # give `[preflight, triggers, defaults]` — this file's own document sections, not # analysis modes — which is why that derivation is not what was applied. Note the # asymmetry a reviewer should start from: `reverse-dcf` declares the SAME five modes # (`preflight, triggers, defaults, methodology, retrieval-scope`) and defaulted to # `[methodology]`, which is what `depth_to_modes`'s own fallback prefers where it # exists. Two skills, identical declared sets, different answers, no recorded reason. # Owner: whoever owns this skill's methodology.
- **lbo** (`agentii-ai-agentii-investment-intelligence/lbo`, undefined): LBO model, leveraged buyout, private equity acquisition, sources and uses, debt schedule, returns waterfall, sponsor IRR, MOIC calculation, PE exit analysis, LBO valuation

### Module 2: Systematic Backtesting & Signal Research

- **backtrader** (`agiprolabs-claude-trading-skills/backtrader`, undefined): Event-driven backtesting with bar-by-bar execution, complex order types, multiple analyzers, and custom indicators
- **vectorbt** (`agiprolabs-claude-trading-skills/vectorbt`, undefined): High-performance vectorized backtesting with parameter optimization, portfolio simulation, and rich performance metrics
- **regime-detection** (`agiprolabs-claude-trading-skills/regime-detection`, undefined): Market regime identification using volatility clustering, trend detection, and statistical methods for adaptive trading

### Module 3: Position Sizing, Fixed Income & Risk Control

- **kelly-criterion** (`agiprolabs-claude-trading-skills/kelly-criterion`, undefined): Kelly criterion optimal sizing with fractional variants, edge estimation, and practical application for crypto trading
- **position-sizing** (`agiprolabs-claude-trading-skills/position-sizing`, undefined): Trade sizing methods including fixed fractional, volatility-adjusted, Kelly criterion, and liquidity-constrained sizing
- **risk-management** (`agiprolabs-claude-trading-skills/risk-management`, undefined): Portfolio-level risk controls, drawdown management, exposure limits, and circuit breakers for crypto trading
- **fixed-income** (`agiprolabs-claude-trading-skills/fixed-income`, undefined): [STUB] Bond pricing, yield curves, duration and convexity analysis, and DeFi lending rate modeling

## 4. Matching Role Playbook

Read the full role blueprint at: https://akshatnaruka.github.io/aidentity/playbooks/quant-researcher/
