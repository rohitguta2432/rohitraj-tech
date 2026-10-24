# AI content strategy

Priorities agreed 24 October 2026: build useful coverage around FDE, AI engineering, AI consulting and RAG, using current Search Console evidence and competitor gaps.

| Cluster | Existing intent owner | Useful supporting evidence |
|---|---|---|
| FDE | `/services/forward-deployed-engineer`; definition article for informational intent | Delivery brief, role/engagement comparisons, inspectable handover |
| AI engineering | `/services/fractional-ai-engineer` | Scope, acceptance tests, integration and failure handling |
| AI consulting | `/`; specific engineering/MCP services for delivery | Build decisions, implementation budgets, bounded pilot criteria |
| RAG | `/notes#rag`, with the AI engineering service as delivery destination | Executable evaluation, permission tests, source freshness, cost assumptions |

The blog hub curates all four paths. Improve existing articles before creating another URL for the same question. Preserve existing service owners. New articles need a distinct intent and concrete evidence; no daily word/post quota or unrelated model-news quota.

Initial artifacts: the RAG evaluation harness and hypothetical budget worksheet under `public/examples/`; an AI delivery brief. Synthetic fixtures are never client benchmarks. Cost inputs are explicitly hypothetical, not service prices or provider quotes. Existing FDE and AI scope articles link to these artifacts.

## Measurement

Run `python3 scripts/seo-weekly-report.py --output <dated path outside git>`. It compares the latest finalized 28 days with the preceding 28 days, worldwide/all devices/web. The report includes disclosed relevant query families, exact terms, relevant pages, four URL inspections and aggregate website enquiry counts. Missing rows mean unreported. Average position is impression-weighted and varies by query mix; sparse data is noisy. Clusters overlap. Property totals differ from disclosed query totals.

Enquiries are received forms from all traffic sources, potentially including tests/spam. They are not qualified leads or proven organic conversions. The report reads only ID, form source path and timestamp from DynamoDB and writes no personal contact details. It does not count contact-link clicks as enquiries.

The existing daily Mac monitor checks all four service targets. The weekly Codex follow-up reads the latest script from production main and saves dated reports in `/Users/rohitraj/Documents/seo-reports/weekly-ai-seo/`. No repeated sitemap/indexing requests, fabricated ranks or promises of indexing.

## Baseline and discovery

Research on 24 October 2026 found the four priority services returned server-rendered HTML, 200 status, self canonicals, index/follow and sitemap entries. URL Inspection reported discovered/currently not indexed with no recorded crawl. Existing incoming contextual links were present. This does not identify a technical block or prove a cause. Preserve accepted indexing requests and observe subsequent crawl/index changes.

The original detailed research and raw evidence are outside this branch under `/Users/rohitraj/Documents/rohitraj-tech/audit/2026-10-24/`; weekly measurements supersede dated observations. Publication, verified indexing and measured ranking improvements are separate outcomes.
