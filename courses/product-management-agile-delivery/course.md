---
type: Course
title: "AI-Native Product Management, Spec Writing & Sprint Delivery"
description: "Run discovery, write unambiguous PRDs and user stories, slice backlogs, plan sprint capacity, and generate release notes using verified product and agile skills."
level: "All Levels"
audience: "Product managers, product owners, scrum masters, and engineering managers"
resource: https://akshatnaruka.github.io/aidentity/courses/product-management-agile-delivery/
timestamp: 2026-11-16
---

# AI-Native Product Management, Spec Writing & Sprint Delivery

Run discovery, write unambiguous PRDs and user stories, slice backlogs, plan sprint capacity, and generate release notes using verified product and agile skills.

**Level:** All Levels · **Target Audience:** Product managers, product owners, scrum masters, and engineering managers · **Skills Included:** 9

## 1. Quick Setup Command

```bash
npx aidentity setup product-manager --profile individual
```

## 2. Learning Outcomes

- Draft structured specs and user stories with clear acceptance criteria.
- Audit sprint capacity, Jira/ADO backlogs, and retrospectives with data-backed workflows.
- Coordinate engineering handoffs and automated release notes.

## 3. Curriculum Modules & Verified Skills

### Module 1: Discovery & Specification Writing

- **to-spec** (`mattpocock/engineering/to-spec`, undefined): Turn the current conversation into a spec and publish it to the project issue tracker: no interview, just synthesis of what you've already discussed.
- **spec-driven-development** (`addyosmani/spec-driven-development`, undefined): Creates specs before coding. Use when starting a new project, feature, or significant change and no specification exists yet. Use when requirements are unclear, ambiguous, or only exist as a vague idea. Use when a single requirement spans several independently testable capabilities and needs decomposing into a capability map of modules before specifying.
- **planning-and-task-breakdown** (`addyosmani/planning-and-task-breakdown`, undefined): Breaks work into ordered tasks. Use when you have a spec or clear requirements and need to break work into implementable tasks. Use when a task feels too large to start, when you need to estimate scope, or when parallel work is possible.

### Module 2: User Stories & Backlog Architecture

- **po-create-user-story** (`abrahamferga-scrum-skills/po-create-user-story`, undefined): Writes a high-quality user story from a plain-English prompt. Drafts immediately, refines through conversation, validates against INVEST, and creates the story in the connected PM tool after confirmation. Use when a Product Owner or Product Manager says things like "I need a story for…", "write a user story about…", "add to the backlog…", "create a PBI for…", "create a ticket for…", or describes a feature, user need, or problem to capture. Don't use for technical tasks with no user value framing, bug reports, spike investigations, or general Scrum questions. Don't use when the request is clearly for an epic or a full feature breakdown — write the single most valuable story and offer to split the rest.
- **po-split-story** (`abrahamferga-scrum-skills/po-split-story`, undefined): Applies proven story splitting patterns to break an oversized user story or epic into sprint-sized, independently deliverable stories. Use when a Product Owner or developer says things like "this story is too big", "we need to split this", "this will not fit in a sprint", "break this epic down", "help me slice this story", or when a story fails the Small criterion in INVEST. Do not use for writing new stories from scratch — use po-create-user-story instead. Do not use for sprint planning or backlog prioritization.
- **audit-backlog-ado** (`abrahamferga-scrum-skills/audit-backlog-ado`, undefined): Audits the Azure DevOps product backlog for hygiene, story quality, and refinement readiness — identifying items that are too large, missing acceptance criteria, stale, unestimated, or out of priority order. Use when a Scrum Master or Product Owner says things like "audit the backlog", "is the backlog healthy", "review the backlog before refinement", "clean up the backlog", "check backlog hygiene", or "prepare the backlog for planning". Do not use for individual story audits — use audit-user-story for that. Do not use for sprint planning or velocity review.

### Module 3: Sprint Capacity, Delivery & Release Notes

- **sm-capacity-planning** (`abrahamferga-scrum-skills/sm-capacity-planning`, undefined): Calculates team capacity for the upcoming Sprint by accounting for team size, Sprint length, planned time off, ceremony overhead, and individual focus factors. Outputs total developer-days available and a recommended story point commitment range. Use when a Scrum Master or team says things like "plan our capacity", "how many points can we commit to", "capacity for next sprint", "how much can we take on", or "account for holidays in the sprint". Do not use for sprint planning facilitation — use sprint-planning for that. Do not use for velocity analysis — use sm-velocity-review for that.
- **audit-sprint-jira** (`abrahamferga-scrum-skills/audit-sprint-jira`, undefined): Audits a completed or in-progress Jira sprint against Scrum and Jira best practices — checks Sprint Goal presence, issue hygiene, workflow transitions, field completeness, story point coverage, and sub-task consistency. Surfaces findings with severity levels and offers to add comments to specific issues or export a summary report. Use when anyone says things like "audit our sprint in Jira", "review the Jira sprint", "check our Jira sprint health", "are our issues following best practices", or "sprint health check in Jira". Don't use for Azure DevOps — use audit-sprint-ado instead. Don't use for Sprint Planning, Daily Scrum, or Retrospective. Requires a Jira MCP connection.
- **po-release-notes** (`abrahamferga-scrum-skills/po-release-notes`, undefined): Generates audience-appropriate release notes from completed Sprint work items — translating technical changes into plain-language user outcomes for stakeholders, customers, or internal teams. Use when a Product Owner says things like "write release notes", "what shipped this Sprint", "generate a changelog", "what did we deliver", "draft the release email", or "summarise what we released". Do not use for sprint review facilitation — use sprint-review for that. Do not use for velocity analysis.

## 4. Matching Role Playbook

Read the full role blueprint at: https://akshatnaruka.github.io/aidentity/playbooks/product-manager/
