import type { BlogPost } from '@/types/blog';

export const ragForSql: BlogPost = {
  slug: 'rag-for-sql',
  updated: '2026-10-25',
  seoTitle: 'RAG for SQL Generation: A Practical Guide',
  seoDescription: 'Build schema context for text-to-SQL, test business results with a runnable join-error example, and separate query accuracy from database permissions.',
  title: 'RAG for SQL Generation: Schema Context and Acceptance Tests',
  date: '2026-01-28',
  excerpt: 'A runnable synthetic SQL example, inspectable StellarMIND source and a checklist for evaluating retrieved schema, business results and database access.',
  readingTime: '7 min read',
  keywords: ['rag sql generation', 'pgvector embeddings sql', 'text to sql pgvector', 'llm sql accuracy', 'chat to sql'],
  coverImage: {
    src: '/images/notes/rag-for-sql-cover.jpg',
    alt: 'Abstract editorial cover for schema retrieval and SQL acceptance tests',
  },
  relatedProject: 'stellarmind',
  sections: [
    {
      heading: 'Start with the question and the expected result',
      content: `RAG for SQL retrieves database context before a model proposes a query. That context can include tables, relationships, approved metric definitions and example queries. Retrieval is useful only if it supplies the evidence needed to answer the question correctly; fewer prompt tokens alone do not establish that.

A SQL query can execute successfully and still return the wrong business total. The runnable example below demonstrates that failure without an LLM, API key or external database. Its numbers come from invented rows, not a StellarMIND benchmark or a client result.

For a small, approved schema, start by evaluating a complete schema prompt. Compare retrieval against that baseline on the same held-out questions before adding complexity. There is no universal table-count cutoff or best retrieval count.`,
    },
    {
      heading: 'Retrieve business meaning alongside table names',
      content: `For a question such as “What were last month's sales?”, first resolve what sales means: paid order value, invoiced value or net revenue after refunds? Confirm the reporting timezone, currency and whether the month is complete. Ask for clarification when these decisions are missing.

Create a reviewed context record for each supported reporting domain:

- Approved tables or views, columns and descriptions, limited to the user's authorized scope.
- Join keys and cardinality: whether one order has several line items, for example.
- Metric definitions, exclusions, units, date fields and reporting boundaries.
- Reviewed example questions and queries, with a schema version and an owner for updates.

Retrieve the relevant records and any relationships needed to connect them. A semantically similar table is not necessarily the correct source. Check for missing join context and stale definitions before increasing the number of retrieved chunks. Use synthetic or approved samples; embedding raw customer rows needs its own data-use approval.

[AWS's enterprise text-to-SQL design](https://aws.amazon.com/blogs/machine-learning/enterprise-grade-natural-language-to-sql-generation-using-llms-balancing-accuracy-latency-and-scale/) describes narrowing to a data domain and augmenting schema definitions with descriptions and business rules. Treat this as a design pattern to evaluate against your workload, not a promised accuracy gain.`,
    },
    {
      heading: 'Run a query that succeeds but gives the wrong total',
      content: `Download the [Python example](/examples/sql-acceptance/demo.py), [fixture notes](/examples/sql-acceptance/README.md) and [recorded result](/examples/sql-acceptance/result.json). Run the downloaded file with Python 3:

\`\`\`bash
python3 demo.py
\`\`\`

The script creates an in-memory SQLite database with seven synthetic orders and their line items. The agreed metric is paid order value in USD for September 2026 UTC, counting each order once. Orders 1, 2 and 3 qualify: 10,000 + 5,000 + 10,000 = 25,000 cents. Cancelled orders, another currency and timestamps outside that month are excluded.

| Query | Result, cents | Expected, cents | Result check |
| --- | ---: | ---: | --- |
| Sum order totals after joining line items | 35,000 | 25,000 | Fail |
| Apply SUM(DISTINCT total_cents) to that join | 15,000 | 25,000 | Fail |
| Sum from orders at the agreed grain | 25,000 | 25,000 | Pass |

All three statements execute. The first repeats order 1 because it has two line items. The attempted DISTINCT fix drops a legitimate equal amount: orders 1 and 3 are different orders with the same value. The accepted query needs no line-item join for this metric. This follows the row-matching behavior described in [PostgreSQL's join documentation](https://www.postgresql.org/docs/current/queries-table-expressions.html).

The script deliberately prints two rejected results and one accepted result, then exits normally. It does not measure model accuracy, retrieval quality, latency or production permissions. Its UTC strings and integer cents avoid timezone conversion and rounding; refunds, tax and currency conversion need additional cases for a real system.`,
    },
    {
      heading: 'What you can inspect in StellarMIND',
      content: `[StellarMIND](/projects/stellarmind) is a public engineering example of a Spring Boot MCP application with schema retrieval. The source references here are pinned to revision b1b08b6, inspected on 25 October 2026:

- The [schema loader](https://github.com/rohitguta2432/spring-ai-mcp-server/blob/b1b08b614edc588164413f722f6e9338db4c59bf/stellarmind-client/src/main/java/com/stellantis/lwm2m/mcp/client/knowledge/JsonSchemaLoaderWithRelationships.java) loads JSON definitions at application startup when embedding is enabled. It has configurable table-level chunking and includes descriptions, relationships and sample queries.
- The [prompt builder](https://github.com/rohitguta2432/spring-ai-mcp-server/blob/b1b08b614edc588164413f722f6e9338db4c59bf/stellarmind-client/src/main/java/com/stellantis/lwm2m/mcp/client/semantics/Text2SQLPromptBuilderNew.java) assembles table, column and relationship context with application-specific query rules. Review those rules before adapting them to a different domain.
- The [evaluation example](https://github.com/rohitguta2432/spring-ai-mcp-server/blob/b1b08b614edc588164413f722f6e9338db4c59bf/stellarmind-client/src/test/java/com/stellantis/lwm2m/mcp/client/SqlGenerationEvaluatorTests.java) passes predefined SQL into fake evaluators. It illustrates test structure; it is not a measured end-to-end model accuracy result.

These files support an architecture discussion. They do not establish a production security guarantee, a nightly schema-refresh service or a numerical improvement over another system. The synthetic exercise above is separate from the repository and does not run StellarMIND.`,
    },
    {
      heading: 'Separate result correctness from database access controls',
      content: `A correct total does not prove that a query stayed within the user's permissions. Test both dimensions independently.

Do not accept a query merely because it starts with SELECT or WITH. PostgreSQL explicitly supports [data-modifying statements inside WITH](https://www.postgresql.org/docs/current/queries-with.html#QUERIES-WITH-MODIFYING). Review the query structure and permitted functions, and enforce the approved data scope with database grants and any required row-level policies. Have the database owner review [read-only transaction behavior and its limits](https://www.postgresql.org/docs/current/sql-set-transaction.html).

A result-row limit is not a cap on database work. An aggregate can return one row after processing many input rows; joins and sorts can also be expensive. Inspect plans in staging using [PostgreSQL EXPLAIN guidance](https://www.postgresql.org/docs/current/using-explain.html), set timeouts and resource limits appropriate to the environment, and test cancellation and failure reporting. EXPLAIN ANALYZE executes the statement, so use only approved queries in a suitable test environment.

Keep credentials outside model context. Test denied writes and restricted reads with the actual staging role; a prompt instruction or a model's confidence score is not an authorization control.`,
    },
    {
      heading: 'Agree the acceptance record before building',
      content: `Use a separate held-out set of approved questions and a fixed data snapshot. A domain owner should verify expected rows and totals independently of the generated SQL. Equivalent queries can be valid, so compare results rather than requiring identical SQL text.

| Check | Evidence to retain |
| --- | --- |
| Retrieval | Expected tables, relationships and metric definitions; context actually supplied |
| Business result | Expected rows, units and totals; duplicate joins, empty results and date-boundary cases |
| Ambiguity | Questions that require clarification rather than a guessed metric or reporting period |
| Access | Identity and role used, denied operations, and absence of restricted data in results |
| Operations | Query failures, timeouts, measured usage and the fallback shown to the user |

Repeat against another approved snapshot so accidental agreement on one dataset is less likely to pass. Keep development examples separate from acceptance cases, record unresolved failures, and rerun checks after schema, retrieval, prompt or model changes. The [RAG evaluation harness](/notes/rag-evaluation-harness-retrieval-permissions) provides a separate synthetic example for document retrieval and access checks.

For a product feature, my [freelance AI engineering service](/services/fractional-ai-engineer) covers schema context, evaluation and implementation. For a reporting workflow that needs discovery with operators and a database owner, [hire a forward deployed engineer](/services/forward-deployed-engineer) to define the pilot, integration and handover. Bring representative questions, approved data access and the person who can confirm what each answer should mean.`,
    },
  ],
  cta: {
    text: 'Discuss a scoped chat-to-SQL implementation',
    href: '/services/fractional-ai-engineer',
  },
};
