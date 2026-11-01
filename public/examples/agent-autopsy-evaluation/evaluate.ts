/** Synthetic capability probes against an unchanged snapshot of the real engine. */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { cpus, arch, platform } from "node:os";
import { performance } from "node:perf_hooks";
import { parseTranscript, runAutopsy } from "./engine";

const done = { role: "assistant", content: "Finished." };
const call = (tool: string, args: unknown = {}) => ({ role: "assistant", tool, args });
const result = (content: string) => ({ role: "tool", content });
const cases = [
  { id: "clean", group: "signature_controls", expected: [], why: "Ordinary completed exchange.", events: [{ role: "user", content: "Hello" }, done] },
  { id: "two-calls", group: "signature_controls", expected: [], why: "Two calls stay below the repeat threshold.", events: [call("search"), result("Found"), call("search"), result("Found"), done] },
  { id: "identical-loop", group: "signature_controls", expected: ["DEATH_LOOP"], why: "Three identical calls without new evidence.", events: [call("search"), call("search"), call("search"), done] },
  { id: "repeated-errors", group: "signature_controls", expected: ["ERROR_BLINDNESS"], why: "The same call fails twice without a changed strategy.", events: [call("search"), result("Error: denied"), call("search"), result("Error: denied"), done] },
  { id: "undeclared-tool", group: "signature_controls", expected: ["GHOST_TOOL"], why: "send_email is absent from the declared tool list.", events: [call("send_email"), done] },
  { id: "unfinished", group: "signature_controls", expected: ["FLATLINE"], why: "The log ends at a tool call.", events: [call("search")] },
  { id: "large-context", group: "signature_controls", expected: ["CONTEXT_BLOAT"], why: "More than 200,000 characters trigger this heuristic, irrespective of model context size.", events: [{ role: "user", content: "x".repeat(200_001) }, done] },
  { id: "legitimate-polling", group: "boundary_probes", expected: [], why: "Polling a changing job three times is legitimate in this fixture; identical arguments alone cannot distinguish it from a loop.", events: [call("status"), result("queued"), call("status"), result("running"), call("status"), result("complete"), done] },
  { id: "success-says-no-error", group: "boundary_probes", expected: [], why: "Two successful responses say no error; keyword matching should not mean failure.", events: [call("search"), result("Success, no error"), call("search"), result("Success, no error"), done] },
  { id: "equivalent-string-arguments", group: "boundary_probes", expected: ["DEATH_LOOP"], why: "Three semantically identical JSON argument strings differ only in whitespace/key order.", events: [call("search", '{"q":"x","limit":1}'), call("search", '{"limit":1,"q":"x"}'), call("search", '{ "q": "x", "limit": 1 }'), done] },
  { id: "second-parallel-tool", group: "boundary_probes", expected: ["GHOST_TOOL"], why: "The second parallel call is undeclared; inspecting only the first misses it.", events: [{ role: "assistant", tool_calls: [{ function: { name: "search", arguments: "{}" } }, { function: { name: "send_email", arguments: "{}" } }] }, done] },
  { id: "wrong-final-answer", group: "boundary_probes", expected: ["INCORRECT_ANSWER"], why: "Deliberate out-of-scope probe: 2 + 2 = 5. This engine has no answer-correctness evaluator; a clean scan cannot mean a correct answer.", events: [{ role: "user", content: "What is 2 + 2?" }, { role: "assistant", content: "5" }] },
];

const iterations = 100;
const rows = cases.map(test => {
  const raw = JSON.stringify(test.events);
  const scan = () => runAutopsy(parseTranscript(raw), ["search", "status"]);
  const actual = [...new Set(scan().findings.map(finding => finding.code))].sort();
  const expected = [...test.expected].sort();
  for (let i = 0; i < 10; i++) scan();
  const durations = Array.from({ length: iterations }, () => {
    const start = performance.now(); scan(); return performance.now() - start;
  }).sort((a, b) => a - b);
  return { id: test.id, group: test.group, why: test.why, expected, actual,
    matched: JSON.stringify(expected) === JSON.stringify(actual),
    input_bytes: Buffer.byteLength(raw),
    median_ms: Number(durations[Math.ceil(iterations * 0.5) - 1].toFixed(4)),
    p95_ms: Number(durations[Math.ceil(iterations * 0.95) - 1].toFixed(4)) };
});
const groups = Object.fromEntries(["signature_controls", "boundary_probes"].map(group => {
  const selected = rows.filter(row => row.group === group);
  return [group, { matched: selected.filter(row => row.matched).length, total: selected.length }];
}));
console.log(JSON.stringify({
  measured_at: new Date().toISOString(),
  upstream_commit: "0545ad32084c41d3a22275451f0903c9aabbc08c",
  engine_sha256: createHash("sha256").update(readFileSync(new URL("./engine.ts", import.meta.url))).digest("hex"),
  runtime: { node: process.version, platform: platform(), architecture: arch(), cpu: cpus()[0]?.model },
  method: { warmups_per_case: 10, timed_runs_per_case: iterations, scope: "parseTranscript + runAutopsy only; excludes UI, HTTP and Ollama", api_calls: 0 },
  limitations: "Author-created synthetic cases after source inspection; not a held-out dataset, production accuracy estimate, client outcome or proof of security. INCORRECT_ANSWER is an intentionally unsupported capability probe. Timing varies by machine and load. No paid model calls; infrastructure and engineering costs are not measured.",
  groups, rows,
}, null, 2));
