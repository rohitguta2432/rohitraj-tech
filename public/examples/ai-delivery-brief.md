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
