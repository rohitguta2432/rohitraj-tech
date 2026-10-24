# AI project delivery checklist

A planning template for moving one AI workflow from scope to an owned service.

Source: https://rohitraj.tech/notes/ai-project-delivery-roadmap
Template version: 2026-10-24

Copy this into your project. Replace placeholders, attach evidence and name reviewers. Checking a box records a review; it does not certify a system. The stages may overlap or need to be revisited. Keep private test data in approved storage and link to it with appropriate access controls.

## Project boundary

- Workflow / intended users: [fill in]
- Business owner / technical owner: [fill in]
- Trigger / approved inputs / expected output: [fill in]
- Permitted actions / explicit exclusions: [fill in]
- Baseline and how it is measured: [fill in]
- Most serious unacceptable failure: [fill in]
- Source owners and access dependencies: [fill in]
- Acceptance criteria, denominator and workload: [fill in]
- Evidence location / retention rules: [fill in]
- Review date and decision maker: [fill in]

## 1. Define the workflow

Question: What useful outcome are we delivering?

Expected artifact: A one-page brief, baseline and explicit exclusions.

Review with: Business owner + delivery engineer

- [ ] Write the workflow, exclusions and baseline.
- [ ] Collect approved representative examples and define expected outcomes.
- [ ] Agree measurable acceptance criteria before final evaluation.
- [ ] Name business, technical and receiving owners.

Evidence link / tested version: [fill in]
Reviewer / date: [fill in]
Decision: [continue / narrow / revisit / stop]
Unresolved issues / owner / next review: [fill in]

Move forward when: The reviewer can describe a useful result and an unacceptable failure.
Pause if: No one can supply representative inputs or judge the output.

## 2. Map data and access

Question: Which sources may each user see?

Expected artifact: A source inventory, permission matrix and freshness rules.

Review with: Data owner + application engineer

- [ ] Inventory sources, freshness expectations and deletion handling.
- [ ] Document per-user and per-tenant access rules.
- [ ] Exercise restricted users, revoked access and source changes.
- [ ] Review model-context, cache and log access boundaries.

Evidence link / tested version: [fill in]
Reviewer / date: [fill in]
Decision: [continue / narrow / revisit / stop]
Unresolved issues / owner / next review: [fill in]

Move forward when: Restricted-user, revoked-access and source-update checks are demonstrated.
Pause if: The prototype uses a shared admin identity or an unapproved export.

## 3. Choose the smallest design

Question: Does this need retrieval, tools or an agent?

Expected artifact: An architecture decision and a comparison against the baseline.

Review with: AI engineer + technical owner

- [ ] Compare the smallest credible approach with the existing process.
- [ ] Record alternatives, chosen design and reasons to revisit it.
- [ ] Separate build effort from operating and maintenance costs.
- [ ] Identify dependencies and assumptions behind the estimate.

Evidence link / tested version: [fill in]
Reviewer / date: [fill in]
Decision: [continue / narrow / revisit / stop]
Unresolved issues / owner / next review: [fill in]

Move forward when: The chosen approach earns its complexity on representative tasks.
Pause if: The design is selected before testing the simplest credible alternative.

## 4. Build one complete path

Question: Can a real user finish the task?

Expected artifact: A working flow through login, data, model, review and the receiving system.

Review with: Delivery engineer + integration owner

- [ ] Run the path from authenticated input to the receiving system.
- [ ] Expose permitted source evidence for review where appropriate.
- [ ] Demonstrate missing evidence and unavailable dependencies.
- [ ] Test request identity, timeout outcomes and duplicate prevention.

Evidence link / tested version: [fill in]
Reviewer / date: [fill in]
Decision: [continue / narrow / revisit / stop]
Unresolved issues / owner / next review: [fill in]

Move forward when: A useful result and a recoverable failure both work in the application.
Pause if: Only a notebook or a success-path recording is available.

## 5. Evaluate the release

Question: What evidence supports a launch?

Expected artifact: Versioned cases, held-out results and a reviewed failure register.

Review with: Domain reviewer + AI engineer

- [ ] Keep development and held-out evaluation cases separate.
- [ ] Record application, model, prompt, source and index versions.
- [ ] Review retrieval, authorization, answer and workflow outcomes separately.
- [ ] Measure latency, cost and human review effort under a stated workload.

Evidence link / tested version: [fill in]
Reviewer / date: [fill in]
Decision: [continue / narrow / revisit / stop]
Unresolved issues / owner / next review: [fill in]

Move forward when: Agreed quality, access, latency and cost criteria are reviewed separately.
Pause if: An average score hides a boundary failure or missing test cases.

## 6. Release with a fallback

Question: Can we pause and recover safely?

Expected artifact: A staged release plan, tested rollback and an operating runbook.

Review with: Technical owner + operator

- [ ] Set the initial user/action boundary and pause conditions.
- [ ] Rehearse an outage, repeated request, fallback and rollback.
- [ ] Check configuration, data/index compatibility and persistent side effects.
- [ ] Complete the release decision record with evidence and reviewers.

Evidence link / tested version: [fill in]
Reviewer / date: [fill in]
Decision: [continue / narrow / revisit / stop]
Unresolved issues / owner / next review: [fill in]

Move forward when: The team rehearses an outage, a repeated request and a rollback.
Pause if: No one can stop the feature or complete the original task manually.

## 7. Hand over and improve

Question: Who owns the next incident or change?

Expected artifact: Receiving-owner sign-off, monitoring and a repeatable evaluation command.

Review with: Receiving engineer + business owner

- [ ] Have the receiving engineer run deployment and evaluation commands.
- [ ] Assign incident, cost, data-source and change-review responsibilities.
- [ ] Define monitoring and a practical escalation path.
- [ ] Turn approved incident examples into tests and re-evaluate relevant changes.

Evidence link / tested version: [fill in]
Reviewer / date: [fill in]
Decision: [continue / narrow / revisit / stop]
Unresolved issues / owner / next review: [fill in]

Move forward when: The receiving team runs the checks and explains when to re-evaluate.
Pause if: Only the original builder can deploy, diagnose or restore the service.

## Supporting resources

- Scope brief: https://rohitraj.tech/examples/ai-delivery-brief.md
- Retrieval/permissions harness (synthetic fixtures): https://rohitraj.tech/notes/rag-evaluation-harness-retrieval-permissions
- Cost worksheet (hypothetical editable assumptions): https://rohitraj.tech/notes/rag-implementation-cost-worked-budget
- Release decision template: https://rohitraj.tech/examples/ai-delivery-roadmap/release-decision.md
- Public architecture reference: https://rohitraj.tech/projects/stellarmind
