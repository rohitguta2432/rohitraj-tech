import type { BlogPost } from '@/types/blog';

export const ragEvaluationHarness: BlogPost = {
  "slug": "rag-evaluation-harness-retrieval-permissions",
  "title": "RAG Evaluation: A Runnable Retrieval and Permissions Harness",
  "seoTitle": "RAG Evaluation: A Runnable Retrieval and Permissions Harness",
  "seoDescription": "Run an offline RAG evaluation harness for recall, ranking, access boundaries and abstention. Includes synthetic fixtures, failure reports and Python code.",
  "date": "2026-10-24",
  "excerpt": "Run an offline RAG evaluation harness for recall, ranking, access boundaries and abstention. Includes synthetic fixtures, failure reports and Python code.",
  "readingTime": "7 min read",
  "keywords": [
    "rag evaluation",
    "rag evaluation harness",
    "retrieval recall at k",
    "rag permissions testing",
    "rag acceptance tests"
  ],
  "relatedProject": "stellarmind",
  "coverImage": {"src": "/images/notes/rag-evaluation-harness-retrieval-permissions-cover.png", "alt": "Check each boundary: Relevant evidence, Permitted context, Supported answer"},
  "sections": [
    {
      "heading": "What should a RAG evaluation measure?",
      "content": "A useful RAG evaluation separates retrieval quality, access control and answer quality. First check whether the right documents reach the model and whether every retrieved document is permitted for that user. Then check whether the answer is supported by those documents and handles missing evidence correctly. A plausible answer with a citation can still be wrong.\n\nThis guide includes a small **offline Python harness** that checks document IDs, retrieval order and abstention. The six cases and two result files are deliberately constructed synthetic fixtures. They demonstrate which regressions the harness catches; they are not model outputs, a production benchmark or a client case study.\n\nBy [Rohit Raj](/about). For a working project context, see [StellarMIND’s chat-to-SQL architecture](/projects/stellarmind). The downloadable harness is a separate teaching example."
    },
    {
      "heading": "Run the example without an API key",
      "content": "Download these files into one directory: [evaluate.py](/examples/rag-evaluation/evaluate.py), [cases.json](/examples/rag-evaluation/cases.json), [failing-results.json](/examples/rag-evaluation/failing-results.json) and [passing-results.json](/examples/rag-evaluation/passing-results.json). Python 3.10 or later is sufficient; no packages or model credentials are needed.\n\n```bash\npython3 evaluate.py cases.json failing-results.json --k 3\npython3 evaluate.py cases.json passing-results.json --k 3\n```\n\nThe first command intentionally exits with code 1. The second exits with code 0. Invalid input exits with code 2. These distinct outcomes let a CI job distinguish a failed evaluation from a broken data export. Review the code before running any downloaded script.\n\nThe fixture contains a refund question, a question needing two sources, a tenant boundary, revoked access, missing evidence and a policy-version question. Replace these with representative cases from your own workflow before using the harness as a release check."
    },
    {
      "heading": "Define the contract before scoring",
      "content": "Each case identifies the expected relevant documents, documents the current user may access, and whether the system must abstain. Each result records the retrieved document IDs in rank order, cited IDs and an explicit abstention flag.\n\n```json\n{\n  \"id\": \"tenant-boundary\",\n  \"question\": \"Show this tenant’s contract.\",\n  \"relevant_ids\": [\"tenant-a-contract\"],\n  \"allowed_ids\": [\"tenant-a-contract\"],\n  \"must_abstain\": false\n}\n```\n\nThe harness rejects missing, extra or duplicate case IDs. It also rejects repeated retrieved IDs, invalid booleans and references that are outside the allowed set. A truncated export must not quietly improve a score by dropping difficult cases.\n\nThe allowed set is a test oracle supplied by the evaluator, not a list copied from the retriever. In an integration test, derive it independently from the identity and authorization rules. If the retrieval layer supplies both the result and its own expected permissions, the test can confirm the same mistake twice.\n\nThis minimal format assumes a case either has relevant accessible evidence or requires abstention. Multi-turn clarification, partially answerable questions and graded relevance need a richer format."
    },
    {
      "heading": "Read the measured fixture results",
      "content": "These numbers were produced by running the published script against the published fixtures with k = 3 on 24 October 2026. “Passing” means the fixture meets these checks; it does not certify a RAG application.\n\n| Check | Deliberately failing fixture | Passing fixture |\n|---|---|---|\n| Cases passing all checks | 1 of 6 | 6 of 6 |\n| Mean recall@3, four answerable cases | 0.625 | 1.000 |\n| MRR@3, four answerable cases | 0.625 | 1.000 |\n| Cases exposing forbidden document IDs | 2 | 0 |\n\nOpen the full [failing report](/examples/rag-evaluation/failing-report.json) and [passing report](/examples/rag-evaluation/passing-report.json) to inspect individual failures. The second fixture is manually corrected, so the difference is a check of evaluator behavior, not evidence that a retrieval technique improved quality.\n\nRecall@k is the fraction of relevant IDs present in the first k results. MRR@k averages the reciprocal rank of the first relevant result; a result at rank two contributes 0.5. Both averages here exclude abstention cases, which are reported separately. This avoids awarding retrieval credit to a question with no answerable source. Ragas also documents [ID-based context recall](https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/context_recall/) when document references are available."
    },
    {
      "heading": "Keep access failures separate from average quality",
      "content": "The harness checks every returned document and citation against the allowed set, including results beyond k. A forbidden document at rank ten is still a boundary failure even if the relevance report only scores the first three results. Hiding that failure inside an average can make a dangerous release look acceptable.\n\nFor a deployed system, add integration cases for revoked membership, stale permission caches, tenant switches and deleted sources. Run them at the point where context is assembled for the model. The model should not receive unauthorized text in the first place; asking it to ignore that text is not an authorization control. Microsoft’s [RAG architecture overview](https://learn.microsoft.com/en-us/azure/search/retrieval-augmented-generation-overview) identifies granular access control as a core retrieval requirement.\n\nThe offline harness only sees IDs in your export. It cannot detect document text that was logged, cached, sent to another service or omitted from the export. Pair it with end-to-end authorization tests and telemetry review."
    },
    {
      "heading": "Add answer evaluation as a separate layer",
      "content": "A citation ID appearing in the retrieved set proves an association, not that the source supports the answer. This script deliberately does not assign a faithfulness or correctness score.\n\nFor answer review, split the generated response into factual claims and inspect whether the supplied passages support them. Keep correctness against the authoritative reference separate from consistency with retrieved context: an answer can faithfully repeat an outdated policy. The [Ragas faithfulness definition](https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/faithfulness/) is useful for the support check, but an automated judge should be calibrated against human-reviewed examples.\n\nFor each failed answer, record the question, source versions, retrieved passages, prompt version and model identifier. Classify the cause: missing source, poor retrieval, contradictory evidence, unsupported inference or failure to abstain. Change one component and rerun a held-out set. Do not rewrite expected answers just to make the new pipeline pass."
    },
    {
      "heading": "Turn the harness into an acceptance pack",
      "content": "Start with actual questions collected from the people who will use the feature, after removing private data or obtaining permission. Include ordinary tasks and known failure conditions. Keep a development set for tuning and a separate holdout for release decisions. Version both alongside the pipeline.\n\nAgree thresholds before testing. The downloadable example requires full recall for each answerable case because it is a small, deterministic fixture. A real retrieval task may need a different quality threshold, while an access violation can remain a release blocker. Record who accepts exceptions and why.\n\nExport your application’s results into the same format, run the script in CI and retain the report with the build. Add latency, token cost, source freshness and manually reviewed answer quality as separate measurements. Six synthetic cases cannot establish production reliability.\n\nThe [AI project scope guide](/notes/freelance-ai-engineer-project-scope-2026) explains how to put this evidence in an engagement’s deliverables. The [RAG cost worksheet](/notes/rag-implementation-cost-worked-budget) includes the evaluation and maintenance work in the budget. If you need help implementing these checks, the [AI engineering engagement](/services/fractional-ai-engineer) starts with the workflow and acceptance criteria."
    }
  ],
  "cta": {
    "text": "Discuss your AI implementation",
    "href": "/services/fractional-ai-engineer"
  }
};
