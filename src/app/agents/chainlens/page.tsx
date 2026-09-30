import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import ChainlensDemo from "@/components/ChainlensDemo";
import { getDictionary } from "@/lib/i18n";
import {
    createPageMetadata,
    generateBreadcrumbSchema,
    generateFAQSchema,
    generateTechArticleSchema,
    SITE_CONFIG,
} from "@/lib/seo-config";
import type { Metadata } from "next";

const PAGE_PATH = "/agents/chainlens";
const DATE_PUBLISHED = "2026-09-30";
const DATE_MODIFIED = "2026-09-30";
const REPO_URL = "https://github.com/rohitguta2432/chainlens";
const SCREENSHOT = "/agents/chainlens.png";

const SEO_TITLE = "Chainlens: Wallet & Smart Contract Risk Scanner";
const SEO_DESCRIPTION =
    "Scan any EVM wallet or contract for risky token approvals, address poisoning, EIP-7702 delegations and admin keys. Live on-chain data, no API key.";
const SEO_KEYWORDS = [
    "wallet risk scanner",
    "check token approvals ethereum",
    "revoke token approvals checker",
    "address poisoning detection",
    "EIP-7702 delegation checker",
    "smart contract risk scanner",
    "is this contract safe to interact with",
    "check if token contract can blacklist or mint",
    "upgradeable proxy admin checker",
    "phishing wallet drainer detection",
    "Base Arbitrum Optimism Polygon wallet scanner",
    "open source web3 security tool",
];

const DEFINITION =
    "Chainlens is an open-source risk scanner for EVM wallets and smart contracts. Paste an address or ENS name and it reads live on-chain data — transaction history, token approvals, proxy admin slots, owner() and EIP-7702 delegations — then flags approvals to phishers, address poisoning, flagged counterparties, brand-new unverified contracts and admin keys that can mint, freeze or upgrade, in a plain-English report with evidence.";

export async function generateMetadata(): Promise<Metadata> {
    const meta = createPageMetadata(SEO_TITLE, SEO_DESCRIPTION, PAGE_PATH, {
        image: { src: SCREENSHOT, alt: "Chainlens scanning USDC: no scam signals, but upgradeable by a single key" },
        translated: false,
    });
    return {
        ...meta,
        keywords: SEO_KEYWORDS,
        authors: [{ name: "Rohit Raj", url: SITE_CONFIG.url }],
        openGraph: {
            ...meta.openGraph,
            type: "article",
            publishedTime: DATE_PUBLISHED,
            modifiedTime: DATE_MODIFIED,
            authors: [SITE_CONFIG.url],
            tags: SEO_KEYWORDS,
        },
    };
}

const walletChecks = [
    { name: "Live approvals to flagged spenders", desc: "decoded from calldata, re-checked with allowance() so revoked ones stay quiet" },
    { name: "Approvals to EOAs or unverified code", desc: "including setApprovalForAll and Permit2 approvals" },
    { name: "Address poisoning", desc: "lookalike addresses planted via zero-value transferFrom or fake-token dust — and payments sent to them" },
    { name: "EIP-7702 delegation", desc: "whose code the account now runs, and whether it's verified or flagged" },
    { name: "Flagged counterparties & scam airdrops", desc: "against Blockscout's public Phish / Hack and scam registry" },
    { name: "Fresh unverified contracts", desc: "called within a week of deployment — worse if they got funds or an approval" },
];

const contractChecks = [
    { name: "Unverified source or implementation", desc: "a black box you can't audit — critical when a proxy hides it" },
    { name: "Upgrade admin", desc: "read from the EIP-1967 / legacy OpenZeppelin slot; single-key (EOA) admins flagged high" },
    { name: "Admin powers", desc: "mint, blacklist / freeze, fee or tax setters, trading switches, pause — only if the source shows an access-control guard" },
    { name: "Ownership", desc: "owner() read live: single key, contract (multisig / timelock) or renounced" },
    { name: "Holder concentration", desc: "one private wallet holding more than 20% of a token's supply" },
    { name: "Age, lure names & deployer", desc: "days-old contracts, 'Visit … to claim' names, flagged deployers" },
];

const steps = [
    {
        title: "1 · Collect",
        tag: "network, isolated",
        body: "Blockscout's REST API supplies history, labels and verified source; the public tag registry adds Phish / Hack and scam labels; one batched JSON-RPC call reads allowance(), isApprovedForAll(), Permit2 allowances, proxy storage slots, owner() and account code. Everything lands in a plain-JSON snapshot.",
    },
    {
        title: "2 · Analyse",
        tag: "pure functions",
        body: "22 checks run over the snapshot with no network and no clock — ages are measured against the snapshot's own timestamp — so the same snapshot always produces the same findings. That's what makes the eval suite replayable.",
    },
    {
        title: "3 · Report",
        tag: "grade + plain English",
        body: "Findings roll up into an A–F grade and a verdict that separates “looks malicious” from “centrally controlled”. Every finding carries explorer-linked evidence and a concrete fix. It never says “safe”: the best verdict is “no red flags in what Chainlens checked”.",
    },
];

const faqs = [
    {
        question: "What is Chainlens?",
        answer: DEFINITION,
    },
    {
        question: "How do I check if my wallet has risky token approvals?",
        answer:
            "Paste your address or ENS name into Chainlens. It decodes the approve, increaseAllowance, setApprovalForAll and Permit2 approvals in your recent transactions, re-reads each one's live allowance on-chain, and flags the ones still active to flagged addresses, plain wallets (EOAs), unverified contracts, or unlimited amounts — with a link to the approving transaction so you can revoke it.",
    },
    {
        question: "What is address poisoning and how does Chainlens detect it?",
        answer:
            "Address poisoning is when an attacker generates an address matching the first and last characters of someone you pay, then plants it in your history with a zero-value transfer or fake-token dust, hoping you copy it next time. Chainlens compares the recipients you genuinely paid with every address that appeared in transfers you didn't initiate; a match on the first and last four hex characters (about a 1-in-4-billion coincidence) is flagged, and paying two lookalikes is flagged as critical.",
    },
    {
        question: "What is an EIP-7702 delegation, and why does Chainlens check it?",
        answer:
            "Since Ethereum's Pectra upgrade, EIP-7702 lets a normal wallet (EOA) delegate its account code to a smart contract — that's how smart-account features work. It is also how 'sweeper' drainers take over wallets. Chainlens reads the account's code, extracts the delegate address from the 0xef0100 designator, and flags delegations to unverified or flagged code as critical.",
    },
    {
        question: "Why does Chainlens give USDC a C grade?",
        answer:
            "Because the grade measures risk to a holder, not legitimacy. Chainlens finds no scam signals in USDC, but it does find that the proxy's upgrade admin is a single-key account and that privileged roles can mint, blacklist and pause — normal for a regulated stablecoin, and exactly what a holder should know they are trusting. The verdict says so explicitly: “No scam signals — but this contract is centrally controlled.”",
    },
    {
        question: "Do I need to connect my wallet or give an API key?",
        answer:
            "No. Chainlens only reads public data: Blockscout's public API and public JSON-RPC nodes, all keyless. It never asks for a signature, a wallet connection or a private key — and you should be suspicious of any 'scanner' that does.",
    },
    {
        question: "Which chains does it support?",
        answer: "Ethereum, Base, Arbitrum One, OP Mainnet and Polygon PoS. ENS names resolve on Ethereum; Basenames resolve on Base.",
    },
    {
        question: "Is a Chainlens report a security audit?",
        answer:
            "No. It is an automated first pass over public data. It scans a recent window of activity, can't see off-chain signatures such as EIP-2612 permits until they're used, and relies on community labels for known-bad addresses. Its value is catching the common, costly mistakes fast — not replacing an audit.",
    },
];

const relatedLinks = [
    { href: "/agents", label: "All autonomous agents in the Agent Host" },
    { href: "/agents/resolvr", label: "Resolvr — self-hosted AI support agent" },
    { href: "/projects", label: "Full project catalog with architecture details" },
    { href: "/services", label: "Hire Rohit: build a Web3 or AI product with evals" },
];

export default async function ChainlensPage() {
    const dict = await getDictionary();

    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: "Home", url: `${SITE_CONFIG.url}` },
        { name: "AI Agents", url: `${SITE_CONFIG.url}/agents` },
        { name: "Chainlens", url: `${SITE_CONFIG.url}${PAGE_PATH}` },
    ]);

    const softwareSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "Chainlens",
        alternateName: "Chainlens — On-Chain Risk X-Ray for Wallets & Contracts",
        description: DEFINITION,
        image: `${SITE_CONFIG.url}${SCREENSHOT}`,
        applicationCategory: "SecurityApplication",
        applicationSubCategory: "Blockchain wallet and smart-contract risk analysis",
        operatingSystem: "Web, Node.js 20+",
        url: `${SITE_CONFIG.url}${PAGE_PATH}`,
        codeRepository: REPO_URL,
        isAccessibleForFree: true,
        license: "https://opensource.org/licenses/MIT",
        author: { "@type": "Person", name: SITE_CONFIG.author.name, url: SITE_CONFIG.url },
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        keywords: SEO_KEYWORDS.join(", "),
        featureList: [
            "Token approval audit with live allowance checks",
            "Address-poisoning detection",
            "EIP-7702 delegation check",
            "Proxy admin and owner() analysis",
            "Ethereum, Base, Arbitrum, OP Mainnet, Polygon",
        ],
    };

    const faqSchema = generateFAQSchema(faqs);
    const techArticleSchema = generateTechArticleSchema({
        headline: "Chainlens — Wallet & Smart-Contract Risk Scanner",
        description: SEO_DESCRIPTION,
        path: PAGE_PATH,
        datePublished: DATE_PUBLISHED,
        dateModified: DATE_MODIFIED,
        keywords: SEO_KEYWORDS,
        proficiencyLevel: "Intermediate",
        image: { src: SCREENSHOT, alt: "Chainlens report" },
    });

    return (
        <>
            <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
            <script type="application/ld+json">{JSON.stringify(softwareSchema)}</script>
            <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
            <script type="application/ld+json">{JSON.stringify(techArticleSchema)}</script>

            <Header dict={dict.common} />
            <main id="main">
                <section className="rel-hero">
                    <div className="container">
                        <nav className="rel-breadcrumb" aria-label="Breadcrumb">
                            <Link href={"/"}>Home</Link>
                            <span aria-hidden="true">→</span>
                            <Link href={`/agents`}>AI Agents</Link>
                            <span aria-hidden="true">→</span>
                            <span className="rel-breadcrumb-current">Chainlens</span>
                        </nav>
                        <span className="rel-eyebrow" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", borderColor: "rgba(16,185,129,0.25)" }}>
                            <span aria-hidden="true">🔎</span> Live on-chain data · open source · no API key
                        </span>
                        <h1 className="rel-headline">
                            Chainlens — Wallet &amp; Smart-Contract Risk Scanner for Ethereum, Base, Arbitrum, OP &amp; Polygon
                        </h1>
                        <p className="rel-lead">{DEFINITION}</p>
                        <div className="rel-byline">
                            <span>By <Link href={`/about`}>Rohit Raj</Link> · Founding Engineer</span>
                            <span aria-hidden="true">·</span>
                            <time dateTime={DATE_MODIFIED}>Last updated September 30, 2026</time>
                        </div>
                        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "1.25rem" }}>
                            <a href="#scan" className="btn btn-primary">Scan an address ↓</a>
                            <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">View on GitHub</a>
                        </div>
                    </div>
                </section>

                <section className="rel-section" id="scan">
                    <div className="container" style={{ maxWidth: 980 }}>
                        <div className="section-header">
                            <h2 className="section-title">Scan a wallet or contract</h2>
                            <p className="section-description">
                                Real data, read live from the chain. Try a sample or paste any address — it never asks you to connect a wallet or sign anything.
                            </p>
                        </div>
                        <ChainlensDemo />
                    </div>
                </section>

                <section className="rel-section rel-section-alt">
                    <div className="container">
                        <div className="section-header">
                            <h2 className="section-title">What Chainlens checks</h2>
                            <p className="section-description">The ways wallets actually get drained — and the trust assumptions hiding inside “legit” contracts.</p>
                        </div>
                        <div className="rel-grid-2">
                            <article className="rel-card">
                                <h3 className="rel-card-title">Wallets</h3>
                                <ul className="rel-metric-list">
                                    {walletChecks.map((c) => (
                                        <li key={c.name}><strong>{c.name}</strong> — {c.desc}</li>
                                    ))}
                                </ul>
                            </article>
                            <article className="rel-card">
                                <h3 className="rel-card-title">Contracts &amp; tokens</h3>
                                <ul className="rel-metric-list">
                                    {contractChecks.map((c) => (
                                        <li key={c.name}><strong>{c.name}</strong> — {c.desc}</li>
                                    ))}
                                </ul>
                            </article>
                        </div>
                    </div>
                </section>

                <section className="rel-section">
                    <div className="container">
                        <div className="section-header">
                            <h2 className="section-title">How does Chainlens work? Collect → analyse → report</h2>
                            <p className="section-description">Network I/O is isolated in one stage; the analysis is pure, replayable and eval-gated.</p>
                        </div>
                        <div className="rel-grid-2">
                            {steps.map((s) => (
                                <article key={s.title} className="rel-card">
                                    <h3 className="rel-card-title">{s.title}</h3>
                                    <p style={{ color: "var(--text-muted)", fontSize: "0.78rem", fontFamily: "var(--font-mono, monospace)" }}>{s.tag}</p>
                                    <p>{s.body}</p>
                                </article>
                            ))}
                            <article className="rel-card">
                                <h3 className="rel-card-title">Zero dependencies</h3>
                                <p style={{ color: "var(--text-muted)", fontSize: "0.78rem", fontFamily: "var(--font-mono, monospace)" }}>hand-written ABI layer</p>
                                <p>
                                    Calldata decoding, view-call encoding and storage-slot reads are ~200 lines of TypeScript. The tests re-derive every
                                    function selector and EIP-1967 slot with keccak256 and round-trip viem-encoded calldata through the decoder.
                                </p>
                            </article>
                        </div>
                    </div>
                </section>

                <section className="rel-section rel-section-alt">
                    <div className="container">
                        <div className="section-header">
                            <h2 className="section-title">Eval-gated: 35 cases, 100% recall, zero false positives</h2>
                        </div>
                        <ul className="rel-metric-list" style={{ maxWidth: 820 }}>
                            <li><strong>30 attack scenarios</strong> — drainer approvals, zero-value-transfer poisoning, a paid lookalike, EIP-7702 takeovers, honeypot and rug-pull profiles — plus negatives that must stay quiet (revoked approvals, near-miss addresses, a developer calling their own new contract, a Safe proxy).</li>
                            <li><strong>5 live mainnet fixtures</strong> — USDC on Ethereum and Base, Uniswap SwapRouter02, a registry-flagged phishing contract and the 2015 EthDev multisig — recorded from the real chain and replayed offline.</li>
                            <li><strong>Results:</strong> 100% recall, 100% severity accuracy, 0 of 41 false-positive guards tripped, 100% grade accuracy.</li>
                        </ul>
                        <p style={{ maxWidth: 820, color: "var(--text-secondary)" }}>
                            The gate earned its keep during development: it caught a phishing contract being treated as “established” because its lure name looked like a label,
                            and a <code>transfer()</code> function mis-marked as admin-only because the source scan ran past its closing brace.
                        </p>
                    </div>
                </section>

                <section className="rel-section">
                    <div className="container">
                        <div className="section-header">
                            <h2 className="section-title">Limits, stated plainly</h2>
                        </div>
                        <ul className="rel-metric-list" style={{ maxWidth: 820 }}>
                            <li>It reads a <strong>recent window</strong> — the latest 100 outgoing transactions and 50 token transfers each way — so a very old, never-touched approval can be missed.</li>
                            <li><strong>Off-chain signatures are invisible</strong> until used: an EIP-2612 permit or Permit2 signature doesn&apos;t show up on-chain before it&apos;s spent.</li>
                            <li>Known-bad labels come from Blockscout&apos;s public registry; a brand-new, untagged drainer is caught only by the structural checks (unverified, fresh, approval to an EOA).</li>
                            <li>The source checks are targeted patterns, not a Solidity parser. A report is a fast first pass, not an audit.</li>
                        </ul>
                    </div>
                </section>

                <section className="rel-section rel-section-alt">
                    <div className="container">
                        <div className="section-header">
                            <h2 className="section-title">Frequently Asked Questions</h2>
                        </div>
                        <div className="rel-faq">
                            {faqs.map((f) => (
                                <details key={f.question} className="rel-faq-item">
                                    <summary>{f.question}</summary>
                                    <p>{f.answer}</p>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="rel-section">
                    <div className="container">
                        <div className="section-header">
                            <h2 className="section-title">Related</h2>
                        </div>
                        <ul className="rel-related">
                            {relatedLinks.map((r) => (
                                <li key={r.href}><Link href={`${r.href}`}>{r.label} →</Link></li>
                            ))}
                        </ul>
                    </div>
                </section>

                <section className="rel-back-nav">
                    <div className="container">
                        <Link href={`/agents`} className="btn btn-secondary">← Back to the Agent Host</Link>
                    </div>
                </section>
            </main>
            <Footer dict={dict.common} />
        </>
    );
}
