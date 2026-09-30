// Synced from github.com/rohitguta2432/chainlens (src/tags.ts) — edit there, then run scripts/sync-to-site.sh.
// Threat-intel classification over Blockscout's public tag registry plus a few
// on-chain naming heuristics. Kept separate so the rules are easy to audit.

import type { Party, Tag, TokenRef } from "./types";

/** Registry tags that mark an address as malicious (Phish / Hack, Fake_Phishing123, SCAM, Exploiter …). */
const THREAT_TAG_RE = /phish|scam|hack|exploit|drain|heist|attacker|rug ?pull|ponzi|fraud|malicious/i;

/** Tags that look like threats but are informational. */
const BENIGN_TAG_RE = /credible|hackathon|whitehat|white-hat|bug-?bounty/i;

export function threatTags(tags: Tag[]): Tag[] {
    return tags.filter(
        (t) =>
            t.type !== "token_reputation" &&
            (THREAT_TAG_RE.test(t.slug) || THREAT_TAG_RE.test(t.name)) &&
            !BENIGN_TAG_RE.test(t.slug) &&
            !BENIGN_TAG_RE.test(t.name),
    );
}

/**
 * "Lure" names: scam contracts and tokens name themselves after a phishing
 * site so the name renders as an ad in wallets and explorers
 * ("Visit pool-ether.com to claim rewards").
 */
const URL_IN_NAME_RE = /(https?:\/\/|www\.|\b[a-z0-9-]{2,}\.(?:com|io|org|net|xyz|app|site|online|live|finance|claims?|gift|top|pro|fi|cc|co|me|vip|club|link|to)\b)/i;
const LURE_WORDS_RE = /\b(claim|visit|reward|airdrop|voucher|bonus|redeem)\b/i;

export function isLureName(name: string | null | undefined): boolean {
    if (!name) return false;
    return URL_IN_NAME_RE.test(name) || (LURE_WORDS_RE.test(name) && /[.$]/.test(name));
}

export interface ThreatVerdict {
    flagged: boolean;
    reasons: string[];
}

export function partyThreat(p: Party | null | undefined): ThreatVerdict {
    if (!p) return { flagged: false, reasons: [] };
    const reasons: string[] = [];
    if (p.isScam) reasons.push("flagged as scam by Blockscout");
    for (const t of threatTags(p.tags)) reasons.push(`tagged "${t.name}"`);
    if (p.isContract && isLureName(p.name)) reasons.push(`named "${p.name}" (phishing lure)`);
    return { flagged: reasons.length > 0, reasons };
}

export function isScamToken(t: TokenRef): boolean {
    return t.isScam || isLureName(t.name) || isLureName(t.symbol);
}

/** A recognisable label for evidence lines: name, first name-type tag, or null. */
export function displayName(p: Party): string | null {
    if (p.name) return p.name;
    const named = p.tags.find((t) => t.type === "name" || t.type === "protocol");
    return named ? named.name : null;
}
