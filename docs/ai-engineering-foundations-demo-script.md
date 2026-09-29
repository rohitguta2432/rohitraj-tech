# Demo video script — AI Engineering Foundations

Target: 7–8 minutes, screen recording + voice. Embeds on `/services/ai-engineering-foundations#demo`.
Chapters must match `DEMO_CHAPTERS` in `src/components/services/AiEngineeringFoundations.tsx`.

## Before recording

- Pick a small, real feature in a demo repo (e.g. "export a report as CSV with a date filter").
- Terminal font 18pt+, editor zoom 150%, hide notifications, hide API keys and account emails.
- Claude Code installed, Spec Kit installed: `uv tool install specify-cli`.
- Record with Screen Studio or QuickTime (1080p+). Keep raw takes per chapter; cut together after.

## 0:00 — Setup (≈1 min)

Say: "Most teams type a one-line request into chat and hope. Here's the same feature done spec-first."

```bash
cd demo-repo
specify init --here --integration claude
claude --model opusplan
```

Show the new `.specify/` folder and `.claude/skills/speckit-*`. One line on `opusplan`: Opus plans, Sonnet implements.

## 1:00 — Constitution (≈1 min)

```text
/speckit-constitution Every change has unit tests. No customer data in logs. Public APIs are versioned. Keep dependencies minimal.
```

Open `.specify/memory/constitution.md`. Say: "Written once. Every later step is checked against this."

## 2:00 — Specify + clarify (≈1.5 min)

```text
/effort high
/speckit-specify Users can export the reports table as CSV, filtered by date range, so finance can reconcile monthly without copy-paste.
/speckit-clarify
```

Answer 2–3 of the clarify questions on screen. Open `specs/001-*/spec.md`, point at user stories and acceptance criteria.
Say why effort is high: "Wrong requirements cost days. This is where depth pays."

## 3:30 — Plan + tasks (≈1.5 min)

```text
/speckit-plan Node + Express API, React front end, streaming CSV so large exports don't block.
/speckit-tasks
```

Open `plan.md` and `tasks.md`. Point at phases and parallel markers.

## 5:00 — Implement (≈1.5 min)

```text
/model sonnet
/effort medium
/speckit-implement
```

Say: "The thinking is already in the spec, so a faster model at medium effort is enough." Speed up footage 4–8×.

## 6:30 — Converge + review (≈1 min)

```text
/speckit-converge
```

Show "Converged" (or appended tasks → implement again). Show the diff, tests passing, open the PR.
Close: "Spec, plan, tasks, code, check — every step reviewable. That's what the two-week programme teaches your team on your codebase."

## After recording

1. Upload to YouTube (title: "Spec-Driven Development Demo: Spec Kit from Ticket to Pull Request"; paste the chapter list in the description).
2. Set `DEMO_VIDEO_ID` and `DEMO_VIDEO_UPLOAD_DATE` in `src/components/services/AiEngineeringFoundations.tsx` — the embed and the VideoObject schema turn on automatically.
3. If real chapter times differ, update `DEMO_CHAPTERS` to match.
