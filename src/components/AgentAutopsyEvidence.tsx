import Link from "next/link";
import result from "../../public/examples/agent-autopsy-evaluation/result.json";

export default function AgentAutopsyEvidence() {
  const controls = result.groups.signature_controls;
  const probes = result.groups.boundary_probes;
  return (
    <section className="project-detail-section" aria-labelledby="autopsy-evidence">
      <h2 id="autopsy-evidence">Measured case study: what a clean scan can miss</h2>
      <p>
        On {result.measured_at.slice(0, 10)}, I ran the unchanged Agent Autopsy engine against
        twelve synthetic transcripts. The seven controls matched its documented signatures
        ({controls.matched}/{controls.total}); none of the five boundary probes matched the desired
        outcome ({probes.matched}/{probes.total}). These are cases I wrote after inspecting the code,
        not client results or an estimate of production accuracy.
      </p>
      <h3>What the boundary probes revealed</h3>
      <ul>
        <li>Legitimate job polling was marked as a death loop because the arguments repeated.</li>
        <li>Successful responses containing “no error” triggered error blindness.</li>
        <li>Equivalent JSON argument strings with different formatting escaped loop detection.</li>
        <li>An undeclared tool in the second parallel call was missed.</li>
        <li>A wrong final answer produced no finding. Answer correctness is outside this engine’s scope.</li>
      </ul>
      <h3>How I measured it</h3>
      <p>
        Each case had ten warmup runs and {result.method.timed_runs_per_case} timed runs on {result.runtime.cpu},
        using Node {result.runtime.node}. The largest input was about 200 KB; its observed p95 was{" "}
        {result.rows.find(row => row.id === "large-context")?.p95_ms} ms.
        Timing includes parsing and heuristic analysis only. It excludes the web interface,
        HTTP and the optional Ollama diagnosis. No model API was called; this does not measure
        infrastructure or engineering costs. Timings vary by hardware and load.
      </p>
      <p>
        The practical lesson: use these findings to prioritize investigation, then verify the
        action and final answer against the task. A clean scan is not a release approval.
        Before using this on a team’s traces, define the supported transcript format and evaluate
        both false alarms and missed failures on approved examples from that workflow.
      </p>
      <p>
        <a href="/examples/agent-autopsy-evaluation/README.md">Reproduce the experiment</a>{" · "}
        <a href="/examples/agent-autopsy-evaluation/result.json">Read every measured result</a>{" · "}
        <a href="/examples/agent-autopsy-evaluation/evaluate.ts">Evaluation cases and runner</a>{" · "}
        <a href="/examples/agent-autopsy-evaluation/engine.ts">Pinned engine source</a>
      </p>
      <p>
        For a defined evaluation or repair, <Link href="/services/fractional-ai-engineer">discuss an AI engineering scope</Link>.{" "}
        If interpreting failures needs work with your operators and internal systems,{" "}
        <Link href="/services/forward-deployed-engineer">scope a forward deployed engineering pilot</Link>{" "}
        with agreed task-outcome checks, an alert reviewer and a handover.
      </p>
    </section>
  );
}
