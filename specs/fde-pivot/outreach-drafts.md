# Outreach drafts: third-party links to the FDE service pages

Written 2026-10-03. Goal: a first followed link from a third-party site to
`/services/forward-deployed-engineer` or `/services/fractional-forward-deployed-engineer`.
Both have been "Discovered – currently not indexed" since 2026-09-05. Internal links and manual
index requests haven't triggered a crawl.

You send everything here. Each item needs your email or an account.

Ruled out:
- **aiagentsdirectory.com guest post.** Its /write-for-us page sells "two permanent
  contextual dofollow links" for $399. Google's spam policies treat paid links that pass
  ranking credit as a link scheme. Don't buy it.
- dev.to crossposts. They're noindex and nofollow, so they pass no ranking value.
- Links on your own product sites or repo READMEs. You ruled these out on 2026-09-26.

---

## 1. AI Agents Directory: agency listing (check the price first)

The site already has an FDE topic hub
(aiagentsdirectory.com/blog/tag/forward-deployed-engineer-for-hire) and a "best FDE teams"
article that lists firms only (CHI Software, OpenAI, AWS). The /submit-agency form doesn't
state a price, so email first. If the listing is paid, skip it, for the same reason as above.

**To:** hello@aiagentsdirectory.com
**Subject:** Agency listing for an independent forward deployed engineer

> Hi,
>
> I'm an independent forward deployed engineer based in Bengaluru. I embed with a client
> team and take AI agents, MCP integrations and LLM features through to production.
> Your FDE hub lists firms only. Do you list independent practitioners on /submit-agency,
> and is the listing free?
>
> If it helps the "best FDE teams" piece, I'm happy to contribute a short section on the
> independent model: when a single embedded engineer beats a firm, and when it doesn't.
>
> Work: https://rohitraj.tech/services/forward-deployed-engineer
> Open source: github.com/rohitguta2432 (agent-autopsy, claude-autodev, spring-ai-mcp-server)
>
> Rohit Raj

Form values if you go ahead: Company Website =
`https://rohitraj.tech/services/forward-deployed-engineer` (the service page, not the
homepage). Founded 2026. Employees 1. The form also asks for a minimum budget and an hourly
rate. The no-pricing rule only covers rohitraj.tech, so choose these privately, or leave the
listing if you'd rather not publish a rate anywhere.

---

## 2. SE Rockstars: PreSales Unleashed podcast guest pitch

SE Rockstars ranks on page 1 for "forward deployed engineer vs solutions engineer". Their
audience is solution engineers asking whether they should move into FDE roles. The site has
no write-for-us page, but it runs a podcast and a contact inbox. Guest episodes usually link
to the guest in the show notes. Ask for a link to the FDE page, not the homepage.

**To:** kontakt@serockstars.com
**Subject:** Podcast idea: what a forward deployed engineer actually does that an SE doesn't

> Hi,
>
> Your FDE vs Solutions Engineer guide is one of the few that gets the difference right. I
> work as an independent forward deployed engineer, embedded with client teams to take AI
> agents to production, and I hear the same question from SEs every month: is FDE just
> SE with commit access?
>
> I'd like to offer an episode of PreSales Unleashed on that:
> - where SE work stops and FDE work starts (owning production after the demo)
> - the skills SEs already have that transfer, and the two that don't
> - why most AI pilots stall between demo and production, and who catches them
>
> Background: rohitraj.tech/services/forward-deployed-engineer, and an explainer I wrote
> on the role at rohitraj.tech/notes/what-does-a-forward-deployed-engineer-do-2026
>
> Happy to fit your format.
>
> Rohit Raj

---

## 3. Go Fractional profile

The draft is already in `marketplace-profiles.md` §1. gofractional.com ranks #2 for
"fractional forward deployed engineer". Use the profile's website field for
`https://rohitraj.tech/services/fractional-forward-deployed-engineer`.

---

## Follow-up rules

- Wait 5 working days, then send one follow-up, then stop.
- When a link goes live, record the URL and whether it's followed, then request indexing for
  the linking page in GSC. Google has to crawl that page before the link counts.
- Recheck the two FDE pages' crawl status 7 days after the first live link:
  `python3 scripts/gsc-inspect.py ~/.config/gsc/indexing-sa.json <url>`
