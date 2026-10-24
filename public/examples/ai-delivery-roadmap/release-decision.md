# AI release decision record

An editable evidence record for a specific application version and launch boundary.

Source: https://rohitraj.tech/notes/ai-project-delivery-roadmap
Template version: 2026-10-24

This is a blank planning template, not approval or certification. Replace placeholders and retain supporting evidence in approved storage. Do not place credentials or private source content in this document.

## Decision

- Project / workflow: [fill in]
- Decision date: [fill in]
- Decision: [hold / narrow and retest / staged launch / stop]
- Initial users and permitted actions: [fill in]
- Explicit exclusions: [fill in]
- Business decision maker / technical reviewer: [fill in]
- Receiving owner / incident contact: [fill in]
- Next review date: [fill in]

## Reproducible version

- Application commit / build: [fill in]
- Model provider / model identifier / configuration: [fill in]
- Prompt and tool definitions: [fill in]
- Source snapshot / connector / index / permission rules: [fill in]
- Evaluation dataset version / command / environment: [fill in]
- Workload and sample limitations: [fill in]

## Criteria and evidence

Choose thresholds before scoring. Keep access failures separate from averages. Report missing or excluded cases and their reasons.

| Criterion | Agreed threshold and denominator | Observed result | Evidence / reviewer | Decision |
| --- | --- | --- | --- | --- |
| Useful workflow completion | [fill in] | [not tested] | [link] | [pending] |
| Retrieval relevance, if used | [fill in] | [not tested] | [link] | [pending] |
| Per-user and tenant authorization | [fill in] | [not tested] | [link] | [pending] |
| Revoked access / source deletion | [fill in] | [not tested] | [link] | [pending] |
| Answer support and source currency | [fill in] | [not tested] | [link] | [pending] |
| Appropriate refusal or handoff | [fill in] | [not tested] | [link] | [pending] |
| Latency under stated load | [fill in] | [not tested] | [link] | [pending] |
| Cost per task, including retries | [fill in] | [not tested] | [link] | [pending] |
| Human review and correction effort | [fill in] | [not tested] | [link] | [pending] |

## Failure and exception register

For each failure record:
- Case identifier and category: [fill in]
- Expected / observed behavior: [fill in]
- Consequence within the launch boundary: [fill in]
- Blocking / accepted exception with rationale: [fill in]
- Remediation owner / due date / retest evidence: [fill in]
- Exception reviewer / expiry: [fill in]

Do not mark a release accepted by default when a required check is missing.

## Recovery rehearsal

- Dependency outage / timeout result and evidence: [fill in]
- Repeated request / uncertain write outcome / duplicate check: [fill in]
- Fallback workflow and unfinished-work handling: [fill in]
- Pause control and person authorized to use it: [fill in]
- Rollback procedure / last-known version / rehearsal evidence: [fill in]
- Index, cache, schema and persisted-side-effect implications: [fill in]
- Recovery verification and operator: [fill in]

## Monitoring and handover

- Metrics, alert conditions, recipients and response expectations: [fill in]
- Source freshness and ingestion-failure monitoring: [fill in]
- Cost limits and escalation: [fill in]
- Approved telemetry fields / access / retention: [fill in]
- Repository, cloud and secret-management ownership: [fill in]
- Receiving engineer's deployment/evaluation run: [evidence link]
- Re-evaluation triggers (model, prompt, data, permissions, tools): [fill in]
- Known limits communicated to users: [fill in]

## Recorded review

- Business owner / date / decision / rationale: [fill in]
- Technical reviewer / date / decision / rationale: [fill in]
- Receiving owner / date / unresolved work: [fill in]
