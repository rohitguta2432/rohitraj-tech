# Agent Autopsy: reproducible boundary evaluation

This experiment measures the real, unchanged heuristic engine from
[Agent Autopsy commit 0545ad3](https://github.com/rohitguta2432/agent-autopsy/blob/0545ad32084c41d3a22275451f0903c9aabbc08c/lib/autopsy.ts).
`engine.ts` is an exact snapshot; its SHA-256 is recorded in `result.json`.

Download these files into the same directory:
- [engine.ts](https://rohitraj.tech/examples/agent-autopsy-evaluation/engine.ts)
- [evaluate.ts](https://rohitraj.tech/examples/agent-autopsy-evaluation/evaluate.ts)
- [result.json](https://rohitraj.tech/examples/agent-autopsy-evaluation/result.json)

With Node 22 and tsx 4.20.4 available, run:

```sh
npx --yes tsx@4.20.4 evaluate.ts > my-result.json
```

In the portfolio repository, use the lockfile-installed runner:

```sh
node node_modules/tsx/dist/cli.mjs public/examples/agent-autopsy-evaluation/evaluate.ts > my-result.json
```

The report records actual classifications, exact-set agreement, input sizes,
per-case median and nearest-rank p95 times, source hash, runtime and CPU.
Each case has ten warmups and 100 timed executions. Parsing is included;
HTTP, browser rendering, model inference and external services are excluded.
The engine makes no model/API calls. This is not a total-cost estimate.

Seven signature controls matched their expected outcomes. Five boundary probes
did not: legitimate polling and “no error” responses caused false alarms;
JSON string formatting and the second parallel tool call caused misses; a
wrong final answer went undetected. The last case deliberately probes a
capability the engine does not implement (`INCORRECT_ANSWER`), so it must not
be presented as a regression in one of its five advertised signatures.

These twelve fixtures were written by the site author after reading the code.
They are synthetic, not held-out, not representative of client traffic, and
not a statistical accuracy estimate. Expected classifications are explicit
in the runner, with a reason for each. Do not average control and boundary
results into a marketing accuracy score. The engine has not been modified to
pass these probes. Timings and timestamps vary; classification results should
reproduce on the pinned source.

The immediate engineering priorities are format-aware argument normalization,
inspection of every parallel call, structured error status, and a way to
suppress expected polling. None of those alone checks answer correctness.
Validate any fixes on a separate dataset before claiming broader improvement.

[Case study](https://rohitraj.tech/projects/agent-autopsy)
