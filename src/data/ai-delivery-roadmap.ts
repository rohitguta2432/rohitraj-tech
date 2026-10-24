/** Delivery milestones are recommendations, not a release certification. */
export const aiDeliveryStages = [
  {
    "id": "scope",
    "title": "Define the workflow",
    "question": "What useful outcome are we delivering?",
    "artifact": "A one-page brief, baseline and explicit exclusions.",
    "owner": "Business owner + delivery engineer",
    "gate": "The reviewer can describe a useful result and an unacceptable failure.",
    "stop": "No one can supply representative inputs or judge the output."
  },
  {
    "id": "data",
    "title": "Map data and access",
    "question": "Which sources may each user see?",
    "artifact": "A source inventory, permission matrix and freshness rules.",
    "owner": "Data owner + application engineer",
    "gate": "Restricted-user, revoked-access and source-update checks are demonstrated.",
    "stop": "The prototype uses a shared admin identity or an unapproved export."
  },
  {
    "id": "architecture",
    "title": "Choose the smallest design",
    "question": "Does this need retrieval, tools or an agent?",
    "artifact": "An architecture decision and a comparison against the baseline.",
    "owner": "AI engineer + technical owner",
    "gate": "The chosen approach earns its complexity on representative tasks.",
    "stop": "The design is selected before testing the simplest credible alternative."
  },
  {
    "id": "build",
    "title": "Build one complete path",
    "question": "Can a real user finish the task?",
    "artifact": "A working flow through login, data, model, review and the receiving system.",
    "owner": "Delivery engineer + integration owner",
    "gate": "A useful result and a recoverable failure both work in the application.",
    "stop": "Only a notebook or a success-path recording is available."
  },
  {
    "id": "evaluate",
    "title": "Evaluate the release",
    "question": "What evidence supports a launch?",
    "artifact": "Versioned cases, held-out results and a reviewed failure register.",
    "owner": "Domain reviewer + AI engineer",
    "gate": "Agreed quality, access, latency and cost criteria are reviewed separately.",
    "stop": "An average score hides a boundary failure or missing test cases."
  },
  {
    "id": "deploy",
    "title": "Release with a fallback",
    "question": "Can we pause and recover safely?",
    "artifact": "A staged release plan, tested rollback and an operating runbook.",
    "owner": "Technical owner + operator",
    "gate": "The team rehearses an outage, a repeated request and a rollback.",
    "stop": "No one can stop the feature or complete the original task manually."
  },
  {
    "id": "operate",
    "title": "Hand over and improve",
    "question": "Who owns the next incident or change?",
    "artifact": "Receiving-owner sign-off, monitoring and a repeatable evaluation command.",
    "owner": "Receiving engineer + business owner",
    "gate": "The receiving team runs the checks and explains when to re-evaluate.",
    "stop": "Only the original builder can deploy, diagnose or restore the service."
  }
] as const;
