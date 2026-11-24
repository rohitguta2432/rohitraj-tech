# Short AI project scoping brief

Use this before a first conversation about a defined AI feature or an embedded FDE pilot. Copy the prompts below and answer what you know; mark the rest **unknown**. A chosen model, production access and a completed evaluation plan are not prerequisites for discussing scope. This is a planning template, not an agreed proposal or evidence of results.

## Common inputs

- **One task:** Who does it, what starts it, and what output or decision do they need?
- **Current process and baseline:** How is it done today? Note observed errors, handling time or volume, with the measurement period; mark estimates as estimates. If unmeasured, say so.
- **Desired change:** What should improve, what must stay correct, and which tasks are outside the first scope?
- **Approved examples:** Describe a routine input and expected output, plus a difficult or failed case. Use synthetic or redacted material initially; keep private records in your approved environment. Do not paste credentials.
- **Systems and access:** List sources and destinations, read versus write needs, the owner who can approve access, and whether access is ready, pending or unknown.
- **Decision and delivery owners:** Who accepts the result, who reviews examples, and who receives the code and runbook? Note when they can participate.
- **Constraints:** Data-processing restrictions, an existing repository, deadline and its reason, and dependencies that could delay the first staging path. State any operating-cost limit separately from the engineering scope.

## Choose the starting point

| Starting point | Add these details |
|---|---|
| A defined AI feature | Existing application or prototype, the behavior to add or repair, known failures and what the receiving engineer needs. A repository summary is enough initially; agree access separately. |
| An embedded FDE pilot | Operator role, current workflow steps, handoffs between people and systems, manual fallback, and the internal owner who can make scope and release decisions. |
| Still deciding | The problem and available examples. Record open questions rather than choosing an agent, RAG or a provider before the task is understood. |

Use the [freelance AI engineering service](/services/fractional-ai-engineer) for a defined feature or an evolving AI backlog. Use the [forward deployed engineering service](/services/forward-deployed-engineer) when discovery with operators and integration across their workflow need to happen together.

## Record the scope-review decision

Complete this part together after the initial review; leaving a field blank does not imply approval.

- Proposed first deliverable and explicit exclusions:
- Baseline to measure or validate; acceptance reviewer and evidence needed:
- Data/access gaps, repair owner and next review date:
- Next step: scope a build / validate a dependency first / consider an ordinary software solution / defer:
- Availability and milestone dependencies to confirm before committing dates:

When a build is agreed, move the relevant decisions into the [delivery and handover brief](/examples/ai-delivery-brief.md). Its evaluation, release and recovery checks belong to delivery planning; you do not need to fill that whole record for the first conversation.
