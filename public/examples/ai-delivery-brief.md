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

## Permission-change acceptance

Use synthetic users, documents and queued jobs in staging. These are proposed acceptance cases, not measured results. A successful login or a connector's broad access does not establish the requesting user's permission. [OWASP recommends validating authorization on every request](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html#validate-the-permissions-on-every-request).

- Permission source of truth and person authorized to change it:
- User, tenant, resource and action checked at each boundary:
- Maximum accepted revocation delay and how it is measured:
- Permission-sync failure alert and owner; protected work to pause when current access cannot be established:
- Answer-cache invalidation and retained conversation-history policy:

Do not assume changing a source permission updates every derived copy immediately. Record the actual propagation path. For example, [Azure AI Search documents query-time checks against synchronized permission metadata](https://learn.microsoft.com/en-us/azure/search/search-document-level-access-overview#enforce-document-level-permissions-at-query-time-preview); assess the synchronization behavior of the chosen system.

| Staging drill | Acceptance evidence | Decision if the check fails |
|---|---|---|
| An authorized user populates an answer cache; a second user without document access asks the same question | Record both identities, cache hit/miss, retrieved source IDs and returned answer/citations; no restricted content reaches the second user | Block release of the affected cache path until isolation is repaired and retested |
| Remove document access after a conversation has started and an answer has been cached; repeat the question and a follow-up | Record revocation and enforcement times; inspect retrieval, reused context, new answers and citations, plus treatment of retained history under the agreed policy | If the permitted delay is exceeded, pause the affected path and repair synchronization or invalidation before retesting |
| Remove an operator's permission while an approved job is queued but has not started | Attempt execution; retain the job ID and denied authorization decision, and verify no destination write occurred | Keep the job on hold for an authorized system owner to cancel or explicitly reauthorize; never silently run it as a more privileged account |

Save the release/configuration version, actual results, reviewer and retest date. Use approved evidence storage; do not copy restricted payloads into this brief. Revocation controls future access and reuse under the agreed policy; it cannot erase content someone already downloaded. Retention of audit records and backups is a separate documented decision. For work that may already have executed, use the outcome checks below before deciding on another attempt.

## Write outcome and retry drills

Use this section when the workflow changes records or sends messages. For a read-only scope, mark it inapplicable. Run approved synthetic cases in staging; this is a test plan, not evidence that a client system passed.

A timeout does not establish whether the destination applied a change. Keep confirmed success, confirmed failure and unknown outcomes distinct. [AWS explains why a timed-out call may already have had side effects](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/).

- Allowed action, target system and approval owner:
- Action identifier and destination record or status lookup:
- API duplicate-prevention contract, supported operations and retention window:
- Retry owner, attempt limit and maximum elapsed time:
- Reviewer and escalation deadline for an unknown outcome:

| Staging drill | Required behavior | Evidence to retain |
|---|---|---|
| Destination accepts the write; its response is lost | Show an unknown outcome until checked. Use the agreed lookup or a retry permitted by the API contract; do not issue a fresh action simply because the caller timed out | Action identifier, destination state, attempt log and final decision |
| Same approved action is delivered twice | Apply the agreed duplicate-prevention rule and inspect the destination for extra effects | Both deliveries, destination records and any emitted messages |
| Inputs change after approval, or a retry falls outside the API's retention window | Hold for review; do not assume the old approval or identifier makes the new request safe | Changed inputs or elapsed time, review decision and any renewed approval |
| First workflow step completes; the next fails | Keep the completed step visible and resolve the failed step separately; do not replay the entire workflow blindly | Per-step outcomes, unresolved items and system-owner decision |

Record the release version, actual result, reviewer and retest date for every applicable drill. Keep payloads in approved storage and link to them here. Without a reliable lookup or documented retry guarantee, leave the outcome unresolved for the system owner; a missing log entry is not proof that nothing happened.

Duplicate prevention depends on the destination API. For example, [Stripe documents parameter matching and key retention](https://docs.stripe.com/api/idempotent_requests); use the actual integration's contract rather than assuming those rules apply everywhere. Approval and current permissions still need checking before execution.

## Data deletion and pilot closure record

Use synthetic data in staging to rehearse the agreed lifecycle before handling sensitive inputs. These are proposed checks, not proof of a completed deletion or a client outcome. Source removal, loss of search visibility and removal of every stored copy are different observations.

| Copy or resource | Responsible owner | Removal, expiry or retention decision | Evidence / remaining limit / review date |
|---|---|---|---|
| Source uploads, extracted text, chunks and embeddings | | | |
| Answer caches and conversation history | | | |
| Evaluation fixtures, traces and exported debug files | | | |
| Provider-managed files and stored responses | | | |
| Backups, previous object versions and required audit records | | | |

For each applicable row, record the synthetic document or resource IDs, request time, completion evidence and any asynchronous expiry still pending. Check the affected stores as well as repeating retrieval; a missing answer is not proof of erasure. Record the next sync result to detect accidental re-ingestion. Use approved storage for evidence links without copying the deleted content into this record.

Verify the actual storage contract. For example, [S3 current-version expiration leaves noncurrent versions unaffected](https://docs.aws.amazon.com/AmazonS3/latest/userguide/lifecycle-expire-general-considerations.html). [OWASP's log-disposal guidance includes temporary logs and copies](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html#disposal-of-logs). Agree applicable retention requirements with the data owner; do not promise immediate removal from every backup or delete required audit evidence. List retained copies, restricted access, expiry dates and the person who will verify completion.

If the pilot stops, record these decisions with the receiving system owners:

- Stop-new-work time; scheduled jobs, webhooks and consumers disabled or transferred:
- Queued and unknown-outcome actions; reconciliation evidence and owner for each unresolved item:
- Connectors and credentials retired after reconciliation, with revocation evidence:
- Resources kept running; purpose, billing owner and agreed operating cost:
- Data copies removed, retained or awaiting expiry, with follow-up owner and date:
- Account owner's closure decision, exceptions and next review:

Do not replay unresolved writes or remove the access needed to establish their outcome without an agreed recovery path. If a deletion check fails, record the affected copy, restrict its use under the agreed policy and assign repair and retest; do not mark the row complete. Closing a pilot does not undo its completed business actions.

## Retrieval migration record

Use when replacing the embedding model or rebuilding a retrieval index. This is a proposed acceptance plan, not a migration result. [Azure AI Search describes an embedding space built with the same model](https://learn.microsoft.com/en-us/azure/search/vector-search-how-to-create-index); matching vector length alone is not evidence that two models are interchangeable. Record compatible query and document encoders, including any model-specific input modes. [Cloud SQL recommends explicit stable embedding model versions](https://docs.cloud.google.com/sql/docs/postgres/generate-manage-vector-embeddings#fully_qualify_the_model_id_to_avoid_errors).

- Reason for the change and release owner:
- Current and candidate model IDs/versions, dimensions, chunking, filters and index names:
- Corpus snapshot, document IDs and source-change checkpoint:
- Planned service pause or separate build while the current index serves traffic:
- Estimated re-embedding work, temporary storage, operating budget and rollback window:

| Review | Evidence to record | Hold condition |
|---|---|---|
| Rebuild coverage | Expected source IDs, indexed IDs, failed/skipped documents and approved exclusions; compare IDs and versions rather than only chunk counts | Missing or stale required content |
| Quality and access | Same held-out questions run through each compatible encoder/index pair; per-case retrieved sources, answer review, denied-access cases, latency and cost | An agreed acceptance threshold or access check fails |
| Changes during the build | Replay approved source updates, deletions and permission changes after the snapshot; record the final checkpoint and enforcement results | Candidate index has not caught up within the agreed window |
| Switch and recovery | Staging trace showing each request uses a matching query encoder and index, including during a switch back; check old-index freshness and permissions | Mixed configuration, stale permissions or unavailable old model; use the agreed fallback |

[Azure's rebuild guidance describes testing a new production index alongside the existing one](https://learn.microsoft.com/en-us/azure/search/search-howto-reindex). Choose the method for the actual system; a planned pause may be simpler when users can accept it. An index alias alone does not prove that the application's query encoder changed with it. Before switching, name who reconciles ongoing source changes, who authorizes traffic and who can stop rollout.

Record the receiving owner's decision, exceptions, observation period and fallback drill result. Keep a recovery index only for the agreed window, with current access controls and source changes accounted for; reverting must not restore deleted or newly restricted content. After that window, record retirement of the old model/index resources under the agreed retention plan. Link the evidence here without copying sensitive payloads.

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
