#!/usr/bin/env python3
"""Shared tag derivation for cross-post publishers (dev.to, Hashnode).

Why this exists
---------------
dev.to and Hashnode tags are a *controlled topic vocabulary*, not free text.
A tag only produces discovery traffic if it is a real, followed feed.

The previous implementation tokenized keyword phrases into single words, so
the post `ai-dev-week-2026-35` (first keyword: "ai model price war august
2026") published with tags `['model', 'price', 'war', 'august']` — four
fragments that match no real feed, i.e. zero discovery, which defeats the
whole point of cross-posting.

This module instead maps *topic signals* found in a post's keywords + title
onto a curated allowlist of real platform tags. Anything not on the allowlist
is rejected rather than passed through.

Public API
----------
    devto_tags(keywords, title)        -> ['ai', 'claude', 'llm', 'news']
    filter_devto_tags(raw_tags)        -> (kept, rejected)
    hashnode_tags(keywords, title)     -> [{'slug': 'ai', 'name': 'AI'}, ...]
    filter_hashnode_tags(raw_tags)     -> (kept, rejected)

Run this file directly to self-check the tables and preview tags for a post:

    python3 scripts/crosspost_tags.py                       # invariant check
    python3 scripts/crosspost_tags.py ai-dev-week-2026-35   # preview one post
"""

import re
import sys

# --------------------------------------------------------------------------
# dev.to's top tags, snapshotted from GET https://dev.to/api/tags?per_page=300
# on 2026-08-25. These are the tags with real followers and real feeds; a tag
# outside this set is either obscure or nonexistent, so we never emit one.
# Refresh with: curl -s "https://dev.to/api/tags?per_page=300" | jq -r '.[].name'
# --------------------------------------------------------------------------
DEVTO_TOP_TAGS = frozenset("""
webdev ai programming javascript beginners productivity tutorial python devops
react opensource career security discuss archlinux blockchain news aws
machinelearning java node automation architecture typescript web3 css api
crypto cloud database rust learning android kubernetes php testing linux llm
showdev reviews performance go github cybersecurity nextjs html frontend
startup codenewbie datascience agents docker mobile softwaredevelopment dotnet
development angular bitcoin seo design coding azure software tools marketing
watercooler saas gamedev vue softwareengineering git backend csharp
computerscience cryptocurrency ruby postgres laravel sql codepen devchallenge
flutter data algorithms community reactnative vscode ios education science
chatgpt serverless tooling mcp wordpress production indie writing privacy rails
developer streaming web cpp livestreaming microservices interview analytics
deeplearning django mongodb networking iot cli google ui ux cloudcomputing
buildinpublic help kotlin microsoft monitoring terraform claude management
dataengineering tailwindcss openai graphql cicd fintech systemdesign developers
devjournal 100daysofcode leadership resources recommendations golf webscraping
product ubuntu swift infrastructure c leetcode ethereum rag a11y code
springboot motivation pcgaming website bash hacktoberfest npm hardware
socialmedia mentalhealth agile mysql gemini sideprojects dart howto podcast
debugging nlp analysis codequality braziliandevs digital spanish googlecloud
challenge webdesign travel documentation sre infosec authentication test music
todayilearned functional books containers firebase oop robotics fullstack
freelance express githubactions movies nocode svelte devrel hiring
designpatterns distributedsystems gratitude devto vibecoding portfolio
githubcopilot redux json diy techtalks redis lambda elixir cleancode psychology
promptengineering systems datastructures oracle meta openclaw animation remote
unity3d computervision terminal cloudnative solidity dsa nestjs spring fastapi
hackathon certification network bigdata codereview raspberrypi kafka hiphop
deepseek playstation lowcode nginx freelancing jokes markdown womenintech
backenddevelopment webperf flask xbox playwright steam nuxt gatsby webassembly
vite wecoded vim frontendchallenge culture langchain twitter welcome
webcomponents webpack workplace healthydebate eventdriven perl restapi
careerdevelopment http tdd gitlab rest astro jamstack search gcp nvidia symfony
bootstrap betting selenium powerplatform manufacturing offers deployment pwa
ansible dotnetcore cms nosql smartcontract lessons shell
""".split())

# Tags always attached to every cross-post (this is an AI/dev engineering blog).
ALWAYS_TAGS = ("ai",)

# Used only to top a thin result up to MIN_TAGS; never overrides a real match.
FALLBACK_TAGS = ("programming", "webdev")

MIN_TAGS = 2
MAX_DEVTO_TAGS = 4       # dev.to hard limit is 4
MAX_HASHNODE_TAGS = 5    # Hashnode allows 5

# --------------------------------------------------------------------------
# Topic signals -> canonical dev.to tag.
#
# Evaluated top to bottom; the first MAX_TAGS matches win, so the table is
# ordered most-specific-first (a vendor/protocol tag beats a generic language
# tag, which beats a catch-all like `tutorial`). Every tag on the right-hand
# side must be in DEVTO_TOP_TAGS — enforced by selfcheck() at import.
# --------------------------------------------------------------------------
TOPIC_SIGNALS = [
    ("mcp",             r"\bmcp\b|model context protocol"),
    ("claude",          r"\bclaude\b|anthropic|\bopus\b|\bsonnet\b|\bfable\b|\bhaiku\b"),
    ("chatgpt",         r"\bchatgpt\b"),
    ("openai",          r"\bopenai\b|\bgpt-?[0-9]|\bcodex\b|\bo[134]-(mini|preview)\b"),
    ("gemini",          r"\bgemini\b|\bgemma\b|deepmind|google ai"),
    ("deepseek",        r"\bdeepseek\b"),
    ("rag",             r"\brag\b|retrieval[- ]augmented|vector (db|database|search)|\bpgvector\b|\bembeddings?\b"),
    ("langchain",       r"\blangchain\b|\bllamaindex\b|\blanggraph\b"),
    ("githubcopilot",   r"copilot"),
    ("vibecoding",      r"vibe[- ]cod|\bcursor\b|\bwindsurf\b|\blovable\b|\bbolt\.new\b|\bv0\b|\breplit\b"),
    ("agents",          r"\bagents?\b|\bagentic\b|subagent|autonomous (coding|dev)"),
    ("llm",             r"\bllms?\b|open[- ]weights?|\bquantiz|\bgguf\b|\bollama\b|\bvllm\b|"
                        r"\bqwen|\bglm-|\bkimi\b|\bminimax\b|\bmistral\b|\bllama[- ]?[0-9]|"
                        r"local (coding )?model|context window|\btokens?/s\b|frontier model|"
                        r"\bmodel (price|pricing|routing|selection)\b"),
    ("machinelearning", r"machine learning|\bfine[- ]?tun|\btraining run\b|\bml (pipeline|ops)\b"),
    ("computervision",  r"computer vision|\bocr\b|image (generation|model)|\bdiffusion\b|\bvision model\b"),
    ("nlp",             r"\bnlp\b|\bwhisper\b|speech[- ]to[- ]text|\bstt\b|transcription|translation"),
    ("promptengineering", r"prompt engineering|system prompt|prompt injection|prompting"),
    ("springboot",      r"spring boot|springboot"),
    ("java",            r"\bjava\b(?!script)"),
    ("kotlin",          r"\bkotlin\b|jetpack compose"),
    ("android",         r"\bandroid\b|play store"),
    ("ios",             r"\bios\b|\bswiftui?\b|\bxcode\b|app store"),
    ("flutter",         r"\bflutter\b|\bdart\b"),
    ("reactnative",     r"react native|\bexpo\b"),
    ("nextjs",          r"next\.?js|app router|\bvercel\b"),
    ("react",           r"\breact\b"),
    ("typescript",      r"\btypescript\b|\bts\b type"),
    ("node",            r"\bnode(\.js)?\b|\bnpm\b|\bbun\b"),
    ("python",          r"\bpython\b|\bfastapi\b|\bdjango\b|\bflask\b"),
    ("postgres",        r"\bpostgres|\bsupabase\b"),
    ("database",        r"\bdatabase\b|\bsqlite\b|\bmongodb\b|\bredis\b|\bsql\b"),
    ("aws",             r"\baws\b|\bbedrock\b|\bs3\b|\blambda\b"),
    ("devops",          r"\bdevops\b|\bdocker\b|\bkubernetes\b|\bci/?cd\b|\bdeploy(ment)?\b"),
    ("security",        r"\bsecurity\b|\bauth\b|authentication|guardrails?|\bsandbox\b|"
                        r"vulnerabilit|\bprivacy\b|\bcve\b"),
    ("api",             r"\bapis?\b|\brest\b|\bgraphql\b|\bwebhooks?\b|\bsdk\b"),
    ("architecture",    r"architecture|system design|multi[- ]tenant|microservices|\bscaling\b"),
    ("performance",     r"performance|latency|throughput|benchmark|\bvram\b|\btokens? per second\b"),
    ("cli",             r"\bcli\b|\bterminal\b|\bshell\b|\bbash\b"),
    ("opensource",      r"open[- ]source|self[- ]host|open[- ]weights?"),
    ("saas",            r"\bsaas\b|subscription (app|pricing)"),
    ("startup",         r"\bmvp\b|\bstartup\b|\bfounder\b|ship (fast|in \d)"),
    ("freelance",       r"\bfreelanc|hire (a )?(developer|engineer)|\bagency\b|contract (work|rate)"),
    ("news",            r"this week|weekly|round[- ]?up|\bweek \d+\b|\bnews\b|\bwhat shipped\b"),
    ("tutorial",        r"\bguide\b|how to|step[- ]by[- ]step|\btutorial\b|\bbuild (a|an|your)\b"),
]

# --------------------------------------------------------------------------
# Hashnode equivalents, keyed by the dev.to tag above. Hashnode auto-creates
# unknown tag slugs — which is exactly the junk-tag failure mode we are fixing
# — so this map is a hard allowlist too: a topic with no Hashnode entry is
# simply dropped rather than invented.
# --------------------------------------------------------------------------
HASHNODE_TAGS = {
    "ai":               ("ai", "AI"),
    "mcp":              ("mcp", "MCP"),
    "claude":           ("claude", "Claude"),
    "chatgpt":          ("chatgpt", "ChatGPT"),
    "openai":           ("openai", "OpenAI"),
    "gemini":           ("gemini", "Gemini"),
    "deepseek":         ("deepseek", "DeepSeek"),
    "rag":              ("rag", "RAG"),
    "langchain":        ("langchain", "LangChain"),
    "githubcopilot":    ("github-copilot", "GitHub Copilot"),
    "vibecoding":       ("developer-tools", "Developer Tools"),
    "agents":           ("ai-agents", "AI Agents"),
    "llm":              ("llm", "LLM"),
    "machinelearning":  ("machine-learning", "Machine Learning"),
    "computervision":   ("computer-vision", "Computer Vision"),
    "nlp":              ("nlp", "NLP"),
    "promptengineering": ("prompt-engineering", "Prompt Engineering"),
    "springboot":       ("spring-boot", "Spring Boot"),
    "java":             ("java", "Java"),
    "kotlin":           ("kotlin", "Kotlin"),
    "android":          ("android", "Android"),
    "ios":              ("ios", "iOS"),
    "flutter":          ("flutter", "Flutter"),
    "reactnative":      ("react-native", "React Native"),
    "nextjs":           ("nextjs", "Next.js"),
    "react":            ("reactjs", "React"),
    "typescript":       ("typescript", "TypeScript"),
    "node":             ("nodejs", "Node.js"),
    "python":           ("python", "Python"),
    "postgres":         ("postgresql", "PostgreSQL"),
    "database":         ("databases", "Databases"),
    "aws":              ("aws", "AWS"),
    "devops":           ("devops", "DevOps"),
    "security":         ("security", "Security"),
    "api":              ("apis", "APIs"),
    "architecture":     ("software-architecture", "Software Architecture"),
    "performance":      ("performance", "Performance"),
    "cli":              ("cli", "CLI"),
    "opensource":       ("opensource", "Open Source"),
    "saas":             ("saas", "SaaS"),
    "startup":          ("startups", "Startups"),
    "freelance":        ("freelancing", "Freelancing"),
    "news":             ("news", "News"),
    "tutorial":         ("tutorial", "Tutorial"),
    "programming":      ("programming", "Programming"),
    "webdev":           ("web-development", "Web Development"),
}

_COMPILED = [(tag, re.compile(pattern)) for tag, pattern in TOPIC_SIGNALS]


def selfcheck() -> None:
    """Fail loudly if a table drifts out of the allowlist."""
    mapped = {tag for tag, _ in TOPIC_SIGNALS} | set(ALWAYS_TAGS) | set(FALLBACK_TAGS)
    unknown = sorted(mapped - DEVTO_TOP_TAGS)
    if unknown:
        raise ValueError(f"TOPIC_SIGNALS emits tags not in DEVTO_TOP_TAGS: {unknown}")
    missing_hn = sorted(mapped - set(HASHNODE_TAGS))
    if missing_hn:
        raise ValueError(f"HASHNODE_TAGS missing entries for: {missing_hn}")
    dupes = [t for t, _ in TOPIC_SIGNALS if [x for x, _ in TOPIC_SIGNALS].count(t) > 1]
    if dupes:
        raise ValueError(f"Duplicate topic tags in TOPIC_SIGNALS: {sorted(set(dupes))}")


selfcheck()


def _haystack(keywords, title: str = "") -> str:
    """Lowercased search text. Keeps '.' and '-' so 'next.js' / 'gpt-5.6' match."""
    text = " ".join(list(keywords or []) + [title or ""]).lower()
    text = re.sub(r"[^a-z0-9./\- ]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def match_topics(keywords, title: str = "") -> list:
    """Canonical dev.to tags whose signals appear in the post, in table order."""
    hay = _haystack(keywords, title)
    return [tag for tag, rx in _COMPILED if rx.search(hay)]


def _assemble(topics, max_tags: int, always=ALWAYS_TAGS) -> list:
    out = []
    for tag in list(always) + list(topics):
        if tag not in out:
            out.append(tag)
        if len(out) >= max_tags:
            return out
    for tag in FALLBACK_TAGS:
        if len(out) >= MIN_TAGS:
            break
        if tag not in out:
            out.append(tag)
    return out[:max_tags]


def devto_tags(keywords, title: str = "", max_tags: int = MAX_DEVTO_TAGS) -> list:
    """Derive up to `max_tags` real dev.to tags from a post's keywords + title."""
    return _assemble(match_topics(keywords, title), max_tags)


def filter_devto_tags(raw, max_tags: int = MAX_DEVTO_TAGS) -> tuple:
    """Validate a manual --tags override. Returns (kept, rejected)."""
    kept, rejected = [], []
    for t in raw:
        tag = re.sub(r"[^a-z0-9]", "", str(t).strip().lower())
        if tag and tag in DEVTO_TOP_TAGS:
            if tag not in kept:
                kept.append(tag)
        elif str(t).strip():
            rejected.append(str(t).strip())
    return kept[:max_tags], rejected


def hashnode_tags(keywords, title: str = "", max_tags: int = MAX_HASHNODE_TAGS) -> list:
    """Derive Hashnode tag objects ([{slug, name}]) from keywords + title."""
    return [
        {"slug": HASHNODE_TAGS[t][0], "name": HASHNODE_TAGS[t][1]}
        for t in _assemble(match_topics(keywords, title), max_tags)
    ]


def filter_hashnode_tags(raw, max_tags: int = MAX_HASHNODE_TAGS) -> tuple:
    """Validate a manual --tags override against the Hashnode allowlist.

    Accepts either the canonical key ('machinelearning') or the Hashnode slug
    ('machine-learning'). Returns ([{slug, name}], rejected).
    """
    by_slug = {slug: (slug, name) for slug, name in HASHNODE_TAGS.values()}
    kept, rejected, seen = [], [], set()
    for t in raw:
        raw_t = str(t).strip()
        key = raw_t.lower()
        entry = HASHNODE_TAGS.get(key) or by_slug.get(key)
        if entry and entry[0] not in seen:
            seen.add(entry[0])
            kept.append({"slug": entry[0], "name": entry[1]})
        elif not entry and raw_t:
            rejected.append(raw_t)
    return kept[:max_tags], rejected


if __name__ == "__main__":
    from pathlib import Path

    if len(sys.argv) < 2:
        print(f"selfcheck OK — {len(TOPIC_SIGNALS)} signals, "
              f"{len(DEVTO_TOP_TAGS)} allowlisted dev.to tags.")
        sys.exit(0)

    posts = Path(__file__).resolve().parent.parent / "src" / "data" / "posts"
    for slug in sys.argv[1:]:
        text = (posts / f"{slug}.ts").read_text(encoding="utf-8")
        title_m = re.search(r"title:\s*\n?\s*['\"](.+?)['\"]\s*,", text, re.DOTALL)
        kw_m = re.search(r"keywords:\s*\[(.*?)\]", text, re.DOTALL)
        title = title_m.group(1) if title_m else ""
        kws = re.findall(r"['\"]([^'\"]+)['\"]", kw_m.group(1)) if kw_m else []
        print(f"{slug}\n  dev.to:   {devto_tags(kws, title)}")
        print(f"  hashnode: {[t['slug'] for t in hashnode_tags(kws, title)]}")
