import type { BlogPost } from '@/types/blog';

export const forwardDeployedEngineerHiringProcess2026: BlogPost = {
  slug: 'forward-deployed-engineer-hiring-process-2026',
  updated: '2026-10-18',
  seoTitle: 'How to Hire a Forward Deployed Engineer',
  seoDescription: "A practical FDE hiring guide: define the workflow, inspect delivery evidence, run a paid trial, and agree acceptance and handover before work starts.",
  title: "How to Hire a Forward Deployed Engineer: Scope, Trial and Handover",
  date: '2026-09-19',
  excerpt: "Use a real workflow, a paid work sample and explicit acceptance criteria to assess a forward deployed engineer. This guide covers a pilot, fractional engagement and full-time hire.",
  readingTime: '8 min read',
  keywords: [
    "how to hire a forward deployed engineer",
    "hire a forward deployed engineer",
    "forward deployed engineer hiring process",
    "fde interview loop",
    "fractional forward deployed engineer",
    "forward deployed engineer trial project",
    "ai consultant vs full time hire",
  ],
  relatedProject: 'stellarmind',
  coverImage: {
    src: '/images/notes/forward-deployed-engineer-hiring-process-2026-cover.jpg',
    alt: 'Abstract converging pathways on a dark grid illustrating the forward deployed engineer hiring process',
  },
  sections: [
    {
      heading: "TL;DR",
      content: "To hire a forward deployed engineer, name one workflow and the person who can approve its result. Ask candidates to show what they built, how they tested it and what happened at handover. Use a paid, bounded work sample with approved data and access. Agree acceptance criteria, release ownership and support before work begins. Choose a pilot for one defined outcome, fractional capacity for a changing backlog, or a full-time hire for continuing full-week ownership.",
    },
    {
      heading: "Start with the work, then choose the role",
      content: "By [Rohit Raj](/about) — AI Consultant · Forward Deployed Engineer · [LinkedIn](https://www.linkedin.com/in/rohitraj2/)\n\nAn FDE works with users and engineers to turn a specific workflow into deployed software. The job can include discovery, integration, testing and rollout, but the boundaries differ between companies. [What a forward deployed engineer does](/notes/what-does-a-forward-deployed-engineer-do-2026) explains the role in more detail.\n\nBefore writing a job description, write down the task: who uses the system, which data and tools it needs, who approves a result, and what fails today. An agent that cannot yet access internal data has a different hiring need from a well-specified feature that simply needs implementation. If your team has not chosen the workflow or cannot make product decisions, appoint an internal owner first.\n\nFor a customer-specific integration, ask who will work with the users and who will write the code. For a defined AI feature in your own product backlog, a [freelance AI engineer](/services/fractional-ai-engineer) may fit. The labels overlap; the work and decision rights are the useful comparison.",
    },
    {
      heading: "Write a scorecard a candidate can actually answer",
      content: "Use the same short scorecard for each candidate or provider. Keep the answers tied to a project they can discuss and evidence you are allowed to inspect.\n\n| Question | Evidence to request |\n| --- | --- |\n| Who discovered the workflow? | The users involved, a scoped problem statement and a decision they changed after seeing real use. |\n| What did you implement? | A repository, architecture note, demonstration or another artifact they are allowed to share; ask which parts they personally built. |\n| How was it checked? | Representative inputs, expected outputs, failure cases and a release decision. |\n| What access was allowed? | How credentials, permissions and sensitive data were limited. |\n| What happened after release? | The monitoring, support boundary, receiving owner and handover artifacts. |\n\nClient work can be confidential. If a candidate cannot share code, ask them to walk through a sanitized design and a failure they investigated. Public portfolio projects can show engineering choices, but they are not evidence of a client's production result. For example, [StellarMIND](/projects/stellarmind) is an inspectable MCP and chat-to-SQL engineering example; any proposed result for your system still needs its own acceptance test.\n\nAsk for the candidate's contribution rather than assuming that a project title proves ownership. A strong answer names a tradeoff, a limit and the next check that would reduce uncertainty.",
    },
    {
      heading: "Run a paid work sample with safe access",
      content: "A small work sample can test collaboration and engineering judgment before a larger commitment. Pay for the agreed work, limit the scope, and make the evaluation criteria visible to both sides. An interview can still cover communication and team fit; the work sample gives you an artifact to discuss.\n\n1. **Choose one bounded task.** A staging integration, a retrieval evaluation or a permission test is easier to assess than a vague request to build an agent.\n2. **Agree inputs and access.** Use approved, representative examples in your environment. Grant only the repository and system permissions the task needs; do not make production credentials a condition of a trial.\n3. **Set the acceptance check.** Record the expected behavior, relevant failure cases and who will review the result before implementation starts.\n4. **Ask for a handover.** Require a short explanation of what was changed, how to run it, what is still uncertain and what your team would need to maintain it.\n\nScore the result against the written task. If access is delayed or the examples do not represent the real workflow, record that as a scope constraint rather than treating the result as a prediction of production performance.",
    },
    {
      heading: "Choose the engagement shape and first milestone",
      content: "The right model follows the amount and continuity of work. Timelines depend on availability, access, procurement and the systems involved; ask each provider for a plan against your actual prerequisites.\n\n| Model | Useful when | First milestone to agree |\n| --- | --- | --- |\n| Fixed-scope pilot | One workflow has a defined acceptance decision. | A working path in staging, evaluation examples and a release plan. |\n| Fractional FDE | The backlog changes and benefits from the same engineer returning on agreed days. | Priorities, reserved days, review cadence and an internal decision-maker. |\n| Full-time FDE | The organization needs continuing, full-week embedded engineering ownership. | An onboarding plan, first customer workflow and team responsibilities. |\n| Agency team | Several disciplines need to work in parallel. | Named delivery owners, repository and account ownership, review points and handover. |\n\nFor a bounded outcome, see my [forward deployed engineer pilot](/services/forward-deployed-engineer). For an ongoing part-week backlog, see the [fractional FDE engagement](/services/fractional-forward-deployed-engineer). Both descriptions state what is delivered and what must be agreed before rollout.",
    },
    {
      heading: "Agree acceptance, release and support before the build",
      content: "A useful first milestone is a decision supported by evidence, not a date promised without access to the system. Write down:\n\n- **Scope:** the users, one workflow, connected systems and tasks explicitly left out.\n- **Quality:** approved examples, a baseline where one exists, expected outputs, failure cases and who sets the threshold.\n- **Permissions:** which actions the software may take, how disallowed actions are tested and who grants credentials.\n- **Operations:** a staged rollout, monitoring, fallback, cost and latency limits, and a person who can stop or approve release.\n- **Handover:** code and configuration in the agreed accounts, evaluation results, deployment instructions and a receiving engineer.\n\nThe [AI project scope and acceptance checklist](/notes/freelance-ai-engineer-project-scope-2026) provides a brief you can adapt. If the required data, security review or receiving owner is unavailable, the first deliverable may be a gap assessment and a narrower staging slice. Do not represent that slice as a production outcome.",
    },
    {
      heading: "Questions to settle before you sign",
      content: "**How quickly can an FDE start?** Ask about the engineer's actual availability and your access prerequisites. A pilot, retainer and employee search each have different dependencies; a fixed industry-wide start time would be misleading.\n\n**Should the first milestone be live in production?** Only if your data, integration, review and release owners are ready. Otherwise agree a staging result and the evidence needed for a production decision.\n\n**How is an FDE different from a solutions engineer?** Titles vary. Compare who works with users, who writes and deploys code, and who owns the system after the evaluation. Do not infer those responsibilities from the title alone.\n\n**Can an FDE work part-time?** Yes, when the backlog and decision cadence fit agreed delivery days. Set response and incident coverage separately; a part-week delivery commitment does not imply continuous on-call support.\n\n**What should a candidate show when client code is private?** A permitted, sanitized design review, a public project, a demonstration, or a paid work sample. Ask which outcomes are directly evidenced and which are illustrative.",
    },
    {
      heading: "Make the next decision concrete",
      content: "Bring one workflow, approved examples, the systems involved and a named person who can accept the result. Use the scorecard to compare candidates, then agree a small first milestone with explicit access and handover. That process makes it easier to decide whether you need a pilot, recurring fractional capacity or a permanent team member.\n\nIf the embedded pilot model fits, [discuss hiring me as a forward deployed engineer](/services/forward-deployed-engineer). I will review the scope and dependencies before proposing a delivery plan; the portfolio examples on that page show implementation patterns, not promised results for your environment.",
    },
  ],
  cta: {
    text: 'Discuss an FDE pilot',
    href: '/services/forward-deployed-engineer',
  },
};
