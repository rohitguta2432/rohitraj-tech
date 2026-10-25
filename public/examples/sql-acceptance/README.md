# SQL result acceptance: a synthetic join error

Download `demo.py` and run `python3 demo.py`. It uses only Python's standard
library and a fresh in-memory SQLite database. It does not connect to a model,
StellarMIND or a production system. `result.json` is the recorded output.

The agreed metric is paid order value in USD for September 2026 UTC, counting
each order once. The seven invented orders include a cancelled order, another
currency, both period boundaries and two distinct orders with the same amount.
Amounts are integer cents; timestamps share one UTC ISO format. This example
does not model refunds, tax, currency conversion or local calendar rules.

All three SQL statements execute:

| Query | Result in cents | Expected in cents | Accepted? |
| --- | ---: | ---: | --- |
| Sum order totals after joining line items | 35000 | 25000 | No |
| Use SUM(DISTINCT total_cents) after that join | 15000 | 25000 | No |
| Sum at the agreed order grain | 25000 | 25000 | Yes |

The join repeats order 1, which has two line items. DISTINCT removes repeated
amounts, including the valid equal amounts on orders 1 and 3. The correct query
uses orders directly because this metric needs no line-item fields. A different
metric can require a join and a different expected result.

When adapting this exercise, have a domain owner approve the metric, eligible
rows, time window, currency and expected output. Include ambiguous questions
that should trigger clarification. Keep acceptance cases separate from prompt
tuning and test more than one database snapshot. Compare result rows and totals,
not just SQL strings or successful execution.

This is a deterministic arithmetic counterexample, not an LLM accuracy benchmark,
a SQL sandbox or evidence of production security. SQLite does not verify
PostgreSQL roles, tenant isolation, function permissions or timeouts. Test those
in your actual staging environment using scoped credentials and approved data.
The script prints expected failures and exits normally; inspect matches_expected
for each case. Repository regression tests run with
`python3 scripts/test-seo-examples.py`.

Guide: https://rohitraj.tech/notes/rag-for-sql
AI engineering: https://rohitraj.tech/services/fractional-ai-engineer
FDE delivery: https://rohitraj.tech/services/forward-deployed-engineer
