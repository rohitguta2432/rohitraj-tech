# AI delivery brief

Editable planning template. Replace every placeholder with a project decision; example cases are not promised results.

- Workflow and intended users:
- Business owner and receiving engineer:
- Input sources, formats and source-of-truth owner:
- User/tenant authorization rules:
- Expected output and human review step:
- Explicitly excluded actions:
- Refresh, deletion and access-revocation behavior:
- Environments and accounts owned by:
- Open dependencies and decision dates:
- Implementation scope and estimate assumptions:
- Monthly usage, infrastructure and maintenance assumptions:

## Acceptance matrix

| Case | Expected behavior | Evidence | Threshold / reviewer |
|---|---|---|---|
| Representative normal task | Produce an answer supported by approved sources | Versioned input, source snapshot and reviewed output | Agree before testing |
| Missing evidence | Abstain or request clarification | Recorded result and review | Agree before testing |
| Cross-tenant request | Never expose unauthorized text | Integration trace using synthetic tenants | Release blocker |
| Revoked access | Honor current permissions throughout retrieval and caching | Revocation integration test | Agree propagation window |
| Dependency failure | Use the agreed fallback without duplicate actions | Failure drill | Agree before testing |
| Source update or deletion | Refresh or remove derived content | Replayable update/deletion test | Agree freshness window |

## Handover

- Source repository and build instructions:
- Versioned evaluation set and latest report:
- Deployment and rollback runbook:
- Monitoring, spend limits and alert owner:
- Support hours and escalation route:
- Known limitations and accepted exceptions:
- Access removal and receiving-owner sign-off:

## Handover rehearsal record

Agree the required tasks before the final review. Use approved test inputs in staging and the receiving team's accounts. The receiving person performs the task using the runbook while the delivering engineer observes. These are planning checks, not recorded client results or a certification.

- Release commit and model/prompt configuration:
- Environment, rehearsal date and runbook version:

| Task | Receiving person | Evidence to save | Result / help needed / next action |
|---|---|---|---|
| Build from a clean checkout and deploy to staging | Engineer | Commands, release identifier and deployment result | |
| Run the versioned evaluation and explain a failed case | Engineer and acceptance reviewer | Evaluation command, per-case report and reviewer note | |
| Complete an approved workflow and handle a failed integration | Operator and engineer | Task identifier, recorded outcome and escalation destination | |
| Exercise the documented fallback or disable procedure | Engineer and operator | Observed state and location of unresolved work | |

Keep evidence in approved storage; record links here without copying credentials or sensitive payloads. Mark an inapplicable task with a reason. For blocked tasks, name the repair owner and retest date. Correct the instructions and repeat the affected task before recording it as passed.

- Open gaps, their impact and any workflow that must remain disabled:
- Receiving owner's transfer decision and date:
- Support end date, covered hours and escalation contact:
- Outgoing access to remove, responsible account owner and removal evidence:

Use this brief with the [freelance AI engineering scope](/services/fractional-ai-engineer) or [forward deployed engineering pilot](/services/forward-deployed-engineer). Agree the tasks for the actual engagement; completing the template does not establish that the system is ready.
