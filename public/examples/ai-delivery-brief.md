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

## Workflow value and pilot review

Use this alongside technical acceptance to decide whether the feature is useful to the people doing the work. This is a proposed measurement record, not a savings estimate or a client result. Agree the comparison before observing results; a deployed feature or a fast model response does not establish a better workflow.

- Task boundary, eligible users and what counts as an accepted business outcome:
- Current manual/search process, comparison period and case-selection rule:
- Agreed quality and access requirements, improvement target and review date:
- Reviewer, workflow owner and approved evidence location:

| Measure | Record for the current process and AI-assisted workflow |
|---|---|
| Coverage and outcomes | Eligible and attempted tasks, accepted outcomes, failed/unfinished tasks and manual completions; state each rate's numerator and denominator |
| Human effort | Active time across all participating roles, including preparation, review, correction and fallback; include effort spent on failed attempts |
| Elapsed time | Start-to-accepted-outcome time and pending work at the cutoff; report waiting separately from active effort |
| Quality and operating cost | Reviewed errors, reopened work and unresolved outcomes; provider/infrastructure usage separately from human effort |
| Actual use during rollout | Who could use the feature, who used it and reasons for bypassing or abandoning it; usage is not proof of correctness |

For a staging comparison, use the same approved held-out tasks and outcome rubric. For a live pilot, document differences in task difficulty, volume and users; an uncontrolled before/after comparison cannot isolate the feature's effect. Keep exclusions, missing measurements and incomplete work visible. Do not convert measured minutes into cash savings without explicit staffing and cost assumptions.

[AWS recommends describing and measuring the human workflow before assessing agent value](https://aws.amazon.com/blogs/machine-learning/optimizing-cost-per-task-and-proving-agent-roi-on-amazon-bedrock/). [Google Cloud starts use-case selection from measurable business goals](https://docs.cloud.google.com/docs/ai-ml/generative-ai/evaluate-define-generative-ai-use-case). This record applies those principles; it does not impose a universal success threshold.

- Review decision: expand within agreed limits / repair and remeasure / stop:
- Evidence, limitations, unresolved tasks and their owners:
- Next measurement date; any scope change to approve separately:

## Scope changes during delivery

Use this record when a request changes the agreed deliverable, inputs, actions or operating responsibilities. Compare it with the current scope first: a failure to meet an existing acceptance criterion is a defect to resolve under the agreement, not automatically an added feature. Keep the original criteria and evidence visible.

- Request, requester, reason and current scope version:
- Existing requirement to repair, clarification, or proposed addition; evidence for that classification:
- Added or removed deliverables, data sources, users and allowed actions:
- Integration, evaluation, access and support work affected; unresolved dependencies and their owners:
- Effort estimate and assumptions; effect on delivery dates and the agreed engagement:
- Decision: repair within scope, defer, decline, exchange named work, or approve an extension:
- Authorized product owner, written decision and date; any separate data or system-owner approvals:
- Revised scope version, acceptance cases and milestones; notify the people whose work changes:

For a fractional backlog, record which committed item moves out when a new priority moves in. For a fixed pilot, record the approved revision before starting the added work. A request remains pending until decided; a discussion or demo does not update the agreement by itself.

Illustrative AI build: adding scanned invoices to a text-document search scope may require extraction checks and source-owner review. Illustrative FDE pilot: adding CRM updates to read-only ticket triage introduces a write boundary, an approval path and a receiving-system owner. These are scoping examples, not delivered client projects. Record the actual impact instead of assuming either request fits the original milestone.

## Acceptance matrix

| Case | Expected behavior | Evidence | Threshold / reviewer |
|---|---|---|---|
| Representative normal task | Produce an answer supported by approved sources | Versioned input, source snapshot and reviewed output | Agree before testing |
| Missing evidence | Abstain or request clarification | Recorded result and review | Agree before testing |
| Cross-tenant request | Never expose unauthorized text | Integration trace using synthetic tenants | Release blocker |
| Revoked access | Honor current permissions throughout retrieval and caching | Revocation integration test | Agree propagation window |
| Dependency failure | Use the agreed fallback without duplicate actions | Failure drill | Agree before testing |
| Source update or deletion | Refresh or remove derived content | Replayable update/deletion test | Agree freshness window |

### Evaluation report and release decision

Complete this record before comparing a baseline and candidate. It is an acceptance plan, not a benchmark result. [Anthropic explains why variable agent behavior needs multiple trials](https://www.anthropic.com/research/demystifying-evals-for-ai-agents). Agree the repeat count and test budget for this workflow; rerunning until one answer passes is not the same as consistent performance.

| Decision | Record before testing | Evidence for review |
|---|---|---|
| Case coverage | Held-out question IDs, source snapshot, routine/ambiguous/sensitive groups and approved exclusions | Distinct questions per group; missing coverage remains visible |
| Repeated attempts | Runs per case, environment reset, model/prompt/tool versions and timeout limits | Every attempt ID and outcome; separate distinct-question counts from total attempts, and retain timeouts or interrupted runs |
| Grading | Written pass/fail rubric, grader version, human reviewer and sample-selection rule for checking automated grades | Per-attempt grades and reasons; disagreements and ungraded outputs remain unresolved until reviewed |
| Release | Threshold per group, mandatory permission/approval checks and named release owner | Pass/fail/unreviewed counts, inconsistent cases, hold reasons, repair owner and retest date |

State each percentage's numerator and denominator. Keep unreviewed and not-run cases separate from passes; any exclusion needs a recorded reason. A high overall score does not cancel a failed mandatory check. Repeats on the same question are not additional independent questions or a guarantee about future traffic.

[Microsoft's evaluation checklist separates test-case problems from agent-design problems](https://learn.microsoft.com/en-us/agents/agent-evaluation/evaluation-checklist). When a reviewer disputes a grade, preserve the original evidence and record the adjudication. If the rubric changes, version it and regrade both baseline and candidate consistently before comparing them. Keep repair examples separate from held-out acceptance cases, and link approved evidence without copying sensitive inputs into this brief.

## Structured outputs and destination changes

Use for extracted records or approved updates to another system. These are proposed synthetic staging drills, not client results. Mark inapplicable checks with a reason and keep payloads in approved evidence storage.

[OWASP distinguishes format checks from checks of business meaning](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html). Agree required fields, permitted values, reference identifiers, units and cross-field rules before evaluating model output. A schema-valid record still needs source and business review; authorization is a separate check.

- Output schema/version, source evidence and business-rule owner:
- Missing, conflicting or invalid field handling; correction reviewer:
- Destination API operation and documented version/precondition support:
- Record version shown at approval; fields the proposed write may change:
- Conflict owner, renewed approval path and manual fallback:

| Synthetic staging drill | Evidence to retain | Acceptance decision |
|---|---|---|
| Correct field types but the wrong customer identifier, unit or total | Source reference, failed rule and review result for each deliberately wrong value | Hold the affected output before downstream use; do not accept it merely because it parses |
| A required field is absent, or sources disagree | Validation result, visible exception and correction or rejection decision | Keep the exception explicit; no guessed default silently becomes an approved record |
| A colleague changes the target after approval but before execution | Approved version, newer version, rejected/held action and destination values | Preserve the newer edit and request a fresh decision; do not refresh the version and reuse the old approval |
| The target changes between the application's last read and its write | Destination response and final record state | The destination enforces the agreed precondition; a client-side reread alone does not pass this check |

Where an HTTP API supports it, [RFC 9110 defines If-Match with strong entity tags to prevent lost updates](https://www.rfc-editor.org/rfc/rfc9110.html#name-if-match). Verify the actual operation's contract and behavior; sending a header to an API that ignores it provides no protection. If the required condition cannot be enforced, keep automated writes disabled for that path and agree a controlled manual process with the system owner.

Save the release version, actual observations, reviewer and repair/retest date. A version conflict differs from an unknown write outcome: use the retry drills below if a write may already have completed. Duplicate prevention does not establish that the destination still matches the state the person reviewed.

## Integration compatibility and API changes

Use for a feature that consumes another system's API or tool responses. These are proposed staging checks with approved or synthetic fixtures, not measured client results. Review only the fields and meanings the workflow relies on; an unrelated added field need not break a compatible integration.

- Integration owner, workflow and dependent answers/actions:
- Operation, requested API version where supported, adapter release and contract reference:
- Required response fields, types, units, identifiers and status meanings; who approves the mapping:
- Contract-mismatch alert, held-work location and agreed manual or unavailable response:
- Evidence links, repair owner, retest date and release owner's resume-or-hold decision:

[GitHub documents removed response fields and changed types as examples of breaking API changes](https://docs.github.com/en/rest/about-the-rest-api/breaking-changes). Check your actual provider's contract and version policy; pinning a version does not replace testing the responses your workflow consumes. Keep private payloads in approved storage and retain redacted fixture references here.

| Proposed staging case | Expected behavior to agree | Evidence and decision |
|---|---|---|
| A successful HTTP response omits a required field or changes its type | Application validation identifies the mismatch before dependent answers or writes; do not coerce missing data into a plausible default | Expected/observed field, adapter version, held task and alert owner |
| A returned status has no approved business meaning | Hold the dependent decision for review; do not infer success or let the model invent a mapping | Unrecognized value, affected workflow and mapping owner's decision |
| An unrelated optional field is added | Preserve supported behavior without treating the addition itself as permission for a new action | Existing-case results, permission checks and any required adapter change |
| The owner repairs or approves a mapping | Repeat failed and previously passing workflow cases, including access and write-outcome checks, before resuming | Per-case results, remaining held work and release owner's dated decision |

Have the FDE operator locate affected and held tasks using their normal access and route the mismatch to the integration owner. Record the user-visible state and who may resume work. For the receiving AI engineer, retain fixtures and the validation command alongside the adapter. If a write might already have completed, use the write-outcome reconciliation procedure before retrying; fixing a response parser does not establish that the write failed.

## Model outage and fallback decision

Use this record before enabling an alternate model or provider. These are proposed staging checks, not availability promises or recorded client results. An alternate must meet the agreed task requirements and data-handling boundaries before it receives inputs, conversation history or tool results.

- Primary and approved alternate models, endpoints and processing regions:
- Approved data sent to each route; retention and access decision owner:
- Comparison evidence: answer quality, tool calls, structured outputs, latency and cost:
- Retry count and elapsed-time limit; hold or manual workflow if no route is usable:
- User-visible status, alert destination and owner authorized to resume service:

Routing can change where inference runs; for example, [Amazon Bedrock documents source and destination regions for cross-Region inference](https://docs.aws.amazon.com/bedrock/latest/userguide/inference-profiles-support.html). Check the actual route configuration against the agreed data boundary. A shared API format does not establish equivalent model behavior.

| Staging drill | Evidence to retain | Acceptance decision |
|---|---|---|
| Primary model times out or returns a rate-limit error | Attempt count, elapsed time, selected route and task result | Only an approved route receives data; permission and approval checks still apply |
| All approved routes are unavailable | User-visible status, operator notification and location of pending work | Retries stop at the agreed limit; work reaches the agreed hold or manual process |
| Primary service recovers | Operator's resumption decision and outstanding-task review | Resume under the agreed policy without replaying completed or unresolved external actions |

[Akka's readiness guidance includes rehearsing a provider outage with a slow or failing mock](https://doc.akka.io/deployment/production-readiness/agentic-ai.html). A mock tests routing and failure handling; evaluate the real alternate separately before approving it. Record the tested release, results, reviewer and repair date. Reconcile unknown writes using the write-outcome drills below before retrying them.

## Document source readiness

Use for document-based retrieval; mark inapplicable for other workflows. This is a proposed review record, not a completed benchmark. Choose approved or synthetic samples for the formats, languages and layouts in scope before a bulk import.

- Source owner, reviewer and authoritative document versions:
- Supported formats/languages; scan, table and image requirements:
- Required questions and source passages that should answer them:
- Parser/OCR configuration, version and approved processing environment:
- Acceptance rules for missing text, changed numbers and unsupported files:

Compare the original, extracted content and resulting chunks before judging retrieval. [Databricks describes parsing and chunking as separate preparation stages](https://docs.databricks.com/aws/en/agents/tutorials/ai-cookbook/quality-data-pipeline-rag). A tool supporting a file extension does not establish that it preserves the content your task needs. [Amazon Textract documents inconsistent extraction for some table structures](https://docs.aws.amazon.com/textract/latest/dg/textract-best-practices.html).

| Proposed sample | What the reviewer checks | Evidence / decision |
|---|---|---|
| Scanned page with a critical identifier or number | Compare the required characters with the original; record unreadable content rather than accepting empty output | Source version/page, extracted span, correction or rejection |
| Table with headers, units and a footnote | Check that each required value retains its row/column meaning, unit and qualifying note in the chunks supplied to retrieval | Original cells, resulting chunks, reviewer result |
| Multi-column or mixed-layout page | Check that reading order preserves the required statement and that its citation identifies the correct source location | Source passage, chunk IDs and citation destination |
| Unsupported, corrupt or partly processed file | Show a visible failure or partial status; reconcile required source IDs and pages against processed, failed and explicitly excluded items | Import report, affected questions and repair owner |

Save actual observations, not just a pass label. OCR confidence can help select items for review; it does not replace checking the task's required content. Keep sensitive source material in approved storage and link to evidence here.

If required content is missing or altered, hold the affected source or workflow, correct the extraction or obtain a usable source, and repeat the checks. A narrower pilot needs the owner's explicit acceptance of excluded questions and a fallback for them. After any repair, rerun retrieval and answer cases too; correct extraction alone does not establish a correct answer.

- Review decision and approved exclusions:
- Repair owner, retest date and remaining coverage limits:

### Source-sync coverage and interrupted imports

Use for paginated or incremental connectors. These are proposed synthetic staging checks, not measured project results. Define the authorized source scope before claiming coverage; a search result or a successful first page does not establish that every required item was processed.

- Source owner, connector/version, permitted collections and inventory snapshot or reconciliation boundary:
- Source IDs/versions expected within that scope; indexed, failed and explicitly excluded IDs with reasons:
- Last completed sync, in-progress checkpoint, freshness limit and alert owner:
- Source change/deletion signals, current permission checks and fallback for incomplete coverage:

[Microsoft Graph distinguishes continuation pages from the end of a change-tracking round](https://learn.microsoft.com/en-us/graph/delta-query-overview). An empty page can still have a continuation link, and an entity can appear more than once. Follow the actual connector's documented pagination and change semantics; this example is not a universal API contract. Keep opaque tokens and private payloads out of this brief.

| Synthetic staging case | Required observation | Decision and evidence |
|---|---|---|
| Interrupt an import after an early page, then resume | Incomplete status and missing IDs remain visible; resume without skipping required versions or creating duplicate indexed records | Save expected/observed IDs, completion boundary, repair owner and retest result |
| Return an empty intermediate page with a continuation, or repeat an item across pages where the API permits it | Follow continuation; reconcile distinct IDs and versions, not just total counts | Confirm all required items were handled before recording a completed sync |
| A listing stops early and omits an existing item; separately revoke access to a test item | Do not infer deletion from the incomplete listing; the revoked item stays inaccessible under current authorization | Record the authoritative deletion/access signals and hold affected content if permission cannot be established |

After recovery, the operator identifies affected questions or actions and checks coverage with the source owner. Re-run retrieval, answer and access cases for repaired sources. Record approved exclusions, remaining gaps and the resume-or-hold decision; a completed import does not by itself establish answer quality. Apply the agreed stale-data fallback while repairs remain open.

### Source authority and conflicting answers

A source can be readable and permitted yet unsuitable for the question. Agree the governing source with the business owner; upload time and search rank are not approval or effective dates. The checks below are synthetic planning examples, not observed project results. Apply them only within the user's permitted sources.

- Source IDs/versions, approval status, effective-from/to dates and superseded versions:
- Applicable product, region or workflow; how missing context is clarified:
- Business owner's precedence rule and evidence of its approval:
- Conflict reviewer, held workflow, correction owner and review deadline:

| Synthetic case | Expected decision to agree | Evidence to retain |
|---|---|---|
| An approved policy says 30 days; a more recently uploaded draft says 60 | Use the approved policy if applicable; do not treat the draft's upload time as approval | Retrieved versions and status, selected passage, answer and citation |
| A question asks about a date before the current policy took effect | Use the permitted version applicable on that date; ask for the date if needed, or explain that historical evidence is unavailable | Question date, source validity interval and expected/observed answer |
| Two approved sources disagree for the same date and scope, with no approved precedence rule | Show the unresolved conflict using permitted evidence and route it to the named owner; hold any dependent action | Both passages, visible review status, owner decision and correction/retest record |

First check whether the intended evidence was retrieved; then check whether the answer follows the agreed rule. Record missing metadata as a gap rather than guessing a version or authority. Reordering search results must not change the business rule. After a source is corrected or superseded, repeat the relevant retrieval, answer, citation and permission checks, including any cached answer path.

[Research on conflicting sources in RAG documents failures in how models handle disagreement](https://arxiv.org/abs/2506.08500). This worksheet is a proposed acceptance process, not a claim to solve every conflict. Enforce approved source eligibility in the retrieval/application layer where possible; for example, [Azure AI Search supports filters on nonvector metadata fields](https://learn.microsoft.com/en-us/azure/search/vector-search-filters). A filter can apply a recorded rule, but cannot decide which business source is authoritative.

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

## Human review capacity and overdue work

Use when a person must review an output or approve an action. This is a proposed staging worksheet, not a measured staffing requirement or client result. [AWS recommends measuring queue age and limiting backlogs](https://docs.aws.amazon.com/wellarchitected/latest/framework/rel_mitigate_interaction_failure_fail_fast.html); apply those operating checks to the review step as well as automated processing.

- Review owner, authorized backup and covered hours:
- Expected arrivals and bursts; observed review time per item:
- Pending-count and oldest-item thresholds; alert destination:
- Maximum useful wait, user-visible status and expiry decision:
- Hold or manual fallback; person responsible for reconciling the queue:

| Staging drill | Evidence to record | Required decision |
|---|---|---|
| Approved synthetic work arrives faster than reviewers can handle it | Arrival and completion times, pending count, oldest-item age and reviewer effort | Apply the agreed intake limit or fallback; record who owns every outstanding item |
| Primary reviewer is unavailable | Backup notification, acknowledgement and overdue-item status | Keep required approvals enforced; waiting longer never authorizes an action |
| Approval arrives after a task expired or was completed manually | Request ID, terminal status, late approval and destination check | Reject execution of the old request; any renewed work needs current inputs, permissions and approval |

Measure submission-to-result time separately from model latency and active review time. Record the release version, observed results, reviewer and repair/retest date. If a required drill fails, hold that workflow's rollout. Expiry prevents a pending action from starting; it does not undo an action already in progress or completed. Reconcile an unknown write using the write-outcome and retry drills below. Retain the decision record without copying sensitive payloads into this brief.

## Task cancellation and operator stop rehearsal

Use for workflows with queued work, approval waits or background actions. These are proposed staging checks using approved synthetic inputs, not measured client results. Agree what the stop control can prevent and what it cannot recall before enabling the workflow.

[Microsoft documents that terminating a Durable Task orchestration does not stop its running activities or sub-orchestrations](https://learn.microsoft.com/en-us/azure/durable-task/common/durable-task-instance-management#terminate-orchestration-instances). This is one platform example, not a universal cancellation contract. Check the actual worker, model provider and destination API used by the engagement; a closed chat or acknowledged stop request alone does not establish the final business outcome.

- Task identifier, release/configuration and authorized stop requester:
- Cancellation boundary: queued work, approval waits, model calls and external actions covered:
- Where workers check the recorded cancellation state before starting another action:
- Expected time to observe a stop; user-visible pending and final states:
- Destination lookup, unresolved-outcome owner and escalation time:

| Staging drill | Evidence to review | Hold or repair condition |
|---|---|---|
| Cancel a queued task, then allow a worker to pick it up | Recorded cancellation and worker decision; destination checks show the action did not start | Worker executes the cancelled request |
| Cancel while awaiting approval, then deliver the old approval | Approval remains unusable for the cancelled task; any renewed work needs a new decision with current inputs and permissions | Late approval revives cancelled work |
| Request a stop after the destination accepts an action but before its response arrives | Separate stop-request time from destination outcome; reconcile the action identifier and retain a late response as evidence | Interface reports cancellation as proof of no side effect, or automatically repeats the action |
| Request a stop during one step of a multi-step workflow | Record completed, prevented and unresolved steps; verify that late results do not dispatch further work after cancellation is enforced | Later steps run without a renewed decision, or completed effects disappear from the record |

Keep cancellation and business correction separate. A completed external action may need an explicitly approved correction, and some effects cannot be undone. Use the write-outcome drills below for unresolved actions. Record races or non-cancellable operations as limits; do not promise an immediate stop across systems. Check that a user cannot cancel another user's task without the required authority.

For an AI build, the receiving engineer reviews state transitions and destination evidence. For an FDE pilot, the operator performs the drill using the runbook and identifies the person who resolves each remaining item. Save the actual result, evidence links, reviewer, repair owner and retest date before accepting the stop procedure.

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

## Diagnostic evidence without copying private inputs

Agree what support needs to diagnose a failed task and which fields may be recorded. Use synthetic markers and fake credentials in staging, never real secrets. These are proposed acceptance checks, not measured results or a guarantee that every sensitive value will be detected.

[OpenTelemetry recommends minimizing collected data and reviewing what instrumentation libraries emit](https://opentelemetry.io/docs/security/handling-sensitive-data/). Record a field allowlist for each destination, rather than assuming a dashboard's hidden fields were never stored. Avoid raw prompt, document and tool-result content in routine telemetry. If a specific investigation needs content, name its approver, restricted store and expiry before enabling capture.

- Diagnostic purpose and allowed fields, including request identifier and configuration version:
- Application logs, SDK/collector exports, error reports and alert destinations in scope:
- Excluded fields; separately approved content capture, if any:
- Roles allowed to view or export evidence; access-review owner:
- Retention, temporary debug-setting expiry and removal owner:

| Staging drill | Evidence to review | Hold or repair condition |
|---|---|---|
| Send synthetic private-text and fake-secret markers through a normal request and a tool error | Inspect each configured log, trace, export and alert destination; record where each marker is absent, removed or explicitly permitted | Excluded content appears in a destination, including an error payload |
| Have an operator investigate the failed request using their assigned role | Request identifier links the failed step, release/configuration, approval and destination outcome; operator records the escalation owner | Diagnosis requires copying the full conversation into a ticket or opening unrestricted content access |
| Attempt to view and export restricted evidence as an unauthorized support role | Access is denied; save the result and the role tested | Trace or export permissions bypass the agreed access boundary |

[OWASP's logging guidance covers interaction identifiers, sensitive fields to exclude and verification of log access controls](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html). Keep enough approved metadata to investigate failures; do not solve a leak by removing required audit events. Fix collection or filtering before affected data leaves its approved boundary, then rerun the failed and normal paths. Record untested destinations as gaps. A successful synthetic-marker check establishes only the cases and destinations examined.

- Release/configuration tested, evidence links, reviewer and decision:
- Missing diagnostic fields or exposed markers; repair owner and retest date:

## Handover

- Source repository and build instructions:
- Versioned evaluation set and latest report:
- Deployment and rollback runbook:
- Monitoring, spend limits and alert owner:
- Support hours and escalation route:
- Known limitations and accepted exceptions:
- Access removal and receiving-owner sign-off:

## Integration credential handover

Use approved test credentials in staging. These are proposed checks for the receiving team, not recorded client results. [OWASP's secrets-management guidance covers rotation, revocation, expiry and dependency ownership](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html#27-secret-lifecycle). Choose the procedure for the actual provider and credential type; do not assume every API supports overlapping keys or immediate session invalidation.

- Integration, credential identifier and approved permissions (no secret values):
- Account owner, authorized renewal operator and alert destination:
- Secret-store reference, expiry or renewal trigger, and approved replacement procedure:
- Applications, scheduled jobs and workers consuming it; reload or restart requirements:
- Permitted overlap, old-credential retirement check and recovery plan:

| Staging drill | Evidence to retain | Hold or repair condition |
|---|---|---|
| Receiving engineer replaces a test credential using the runbook | Credential version identifiers, replacement time and an approved task from each consuming process; intended permissions remain unchanged | A process still depends on the old credential or requires broader access |
| Retire the old credential after the agreed overlap | A controlled request using the retired credential is rejected; record any separately issued sessions or tokens and their invalidation limits | Old access persists beyond the agreed boundary or a consumer's state is unknown |
| Expire a test credential while work is pending | Operator finds affected task IDs and alert; authorized owner restores access through the documented procedure | Silent dropped work, unbounded retries or substitution of a personal or more privileged account |

Before resuming held work, recheck current permissions, approval validity and destination outcomes. Restoring authentication does not renew an expired approval or resolve a previously unknown write. Keep such items on hold for the named owner.

Save the release/configuration, redacted evidence links, reviewer, repair owner and retest date. Never paste keys or tokens into this brief, screenshots or tickets. For suspected exposure, use the incident procedure; a planned overlap is not permission to keep a compromised credential active. If the rehearsal fails, repair the procedure and repeat the affected check before accepting credential handover.

## Stored-state recovery rehearsal

Use for stateful workflows; mark inapplicable when no application state is retained. These are proposed staging checks, not completed client results. Agree the recovery scope and owner before choosing a backup or rebuild approach. [AWS recommends exercising recovery to the specified time and state and correcting the runbook from the results](https://docs.aws.amazon.com/wellarchitected/latest/framework/rel_planning_for_recovery_dr_tested.html).

- Stores requiring backup; indexes or derived data that can be rebuilt from approved sources:
- Acceptable interruption and data-loss window; recovery owner and dependencies:
- Backup or source snapshot identifier and timestamp; compatible application, schema and index versions:
- Isolated staging target, approved synthetic data and controls preventing real messages or writes:
- Authoritative source for current deletions, permissions, approvals and destination outcomes:

Keep workers, schedules and outgoing triggers disabled in the restored environment until reconciliation is complete. A snapshot can contain outdated permissions and tasks whose external effects already happened. Reapply current access and deletion decisions before exposing restored content; keep affected paths unavailable if those decisions cannot be established.

| Synthetic staging case | Required review before resuming | Evidence to retain |
|---|---|---|
| Restore a backup or rebuild an index with its compatible configuration | Receiving engineer checks representative retrieval and application state against the approved source snapshot | Snapshot and release IDs, commands, recovered timestamps, elapsed time and missing updates |
| After the snapshot, delete a test source and revoke a user's access; then restore | Reconcile the later deletion and permission changes; check retrieval, caches and newly generated answers before allowing users back | Current authority used, rejected access and excluded source checks, unresolved gaps |
| Snapshot a queued task, complete its external action in a test destination, then restore the older queue | Operator confirms the destination outcome and suppresses replay; unresolved outcomes stay on hold | Task and destination IDs, manual actions, reconciliation result and current approval decision |

Record the actual interruption and recovered-data gap against the agreed limits, who authorizes resumption, any repairs and the retest date. Infrastructure starting successfully is only one check; the receiving engineer and operator must verify the restored workflow. Do not copy private payloads or credentials into this record.

## User interface acceptance rehearsal

Use when a user or operator interface is part of the agreed delivery; mark inapplicable for a backend-only scope. These are proposed staging checks, not completed user research or an accessibility conformance claim. Agree the tasks with representative users, including people who use the supported assistive technology.

- Workflow, user roles and representative participants:
- Supported browser, device and assistive-technology combinations:
- Release, approved synthetic inputs and expected task outcomes:
- Required checks, receiving owner and evidence location:

| Staging task | Evidence to record | Repair or hold condition |
|---|---|---|
| Inspect source evidence, correct a proposed value, then approve or reject using only the keyboard | Reachable controls, visible focus and logical focus order; observed task outcome and any help needed | A required control or source cannot be reached, or the user cannot review the actual proposed change |
| Submit a missing or invalid field, then correct it | Text identifies the affected field and problem; record whether the user can find it, retain valid entries and complete the correction | An unexplained failure or lost work prevents completion |
| Wait for a delayed task, then encounter a confirmed failure or an unresolved external outcome | Visible status and what the agreed screen reader announces; user identifies the next step without a misleading success claim | State is conveyed only by color or a spinner, is not announced when required, or suggests repeating an unresolved write |

[W3C explains keyboard operation](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html), [identifying input errors in text](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html) and [making status messages available to assistive technology without moving focus](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html). Use those references to design the relevant checks; this short rehearsal does not cover every accessibility requirement. Automated scans alone cannot establish whether users can complete the workflow.

Record each attempted task, observed behavior, participant assistance, untested combinations, repair owner and retest date. Keep participant details and sensitive content in approved storage. The receiving owner reviews unresolved barriers before accepting the interface; rerun repaired steps with the affected input method. For an unknown external write, follow the reconciliation procedure rather than offering an unconditional retry.

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
