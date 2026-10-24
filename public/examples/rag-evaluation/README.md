# Offline RAG regression example

Python 3.10+, standard library. All data is synthetic. These fixtures are manually constructed, not outputs from a model or a retriever.

Run `python3 evaluate.py cases.json failing-results.json --k 3` (expected exit 1), then `python3 evaluate.py cases.json passing-results.json --k 3` (expected exit 0). Malformed input exits 2. Reports are included for reproducibility.

Checks: recall@k and reciprocal rank on answerable cases; all retrieved/cited IDs against an independent permission oracle; citations belong to retrieved results; explicit abstention behavior. Every answerable case requires full recall in this tiny demonstration.

Does not evaluate answer text, faithfulness, source correctness, runtime authorization, latency or cost. A passing export does not prove application security. Use independent integration and answer-quality evaluations before deployment.

Adapt the JSON export to your own system; do not tune on the release holdout. No API key is used.
