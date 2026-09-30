// Synced from github.com/rohitguta2432/chainlens (src/source.ts) — edit there, then run scripts/sync-to-site.sh.
// Lightweight static checks over verified Solidity/Vyper source. Not a parser —
// a handful of targeted patterns, each covered by tests.

import type { SourceFlags } from "./types";

/** Remove // and /* *\/ comments so NatSpec and commented-out code never count. */
export function stripComments(src: string): string {
    return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
}

export function scanFlags(src: string): SourceFlags {
    const code = stripComments(src);
    return {
        selfdestruct: /\b(selfdestruct|suicide)\s*\(/.test(code),
        delegatecall: /\bdelegatecall\s*\(/.test(code),
    };
}

/** Access-control modifiers on a function header: onlyOwner, onlyRole(X), onlyMinters, auth, requiresAuth … */
const GUARD_MODIFIER_RE = /\b(only[A-Z_]\w*|auth|requiresAuth|ownerOnly|adminOnly)\b/;

/** Inline checks at the top of a function body. */
const GUARD_BODY_RE =
    /msg\.sender\s*[!=]=\s*(owner|_owner|admin|_admin|governance|gov|minter|operator|owner\(\))|_msgSender\(\)\s*[!=]=\s*owner\(\)|_checkOwner\s*\(|_checkRole\s*\(|_onlyOwner\s*\(|_requireOwner\s*\(|require\s*\(\s*hasRole\s*\(|require\s*\(\s*isOwner\s*\(/;

/**
 * Names of functions whose definition is access-controlled — i.e. callable
 * only by an owner, admin or role holder. Interface declarations (no body)
 * are ignored.
 */
export function guardedFunctions(src: string): string[] {
    const code = stripComments(src);
    const guarded = new Set<string>();
    const re = /\bfunction\s+([A-Za-z_]\w*)\s*\(/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(code))) {
        const rest = code.slice(m.index + m[0].length);
        const open = rest.indexOf("{");
        const semi = rest.indexOf(";");
        if (open === -1 || (semi !== -1 && semi < open)) continue; // declaration only
        const header = rest.slice(0, open);
        // Only this function's own body, capped: checks sit at the top of a body.
        const bodyHead = body(rest, open).slice(0, 600);
        if (GUARD_MODIFIER_RE.test(header) || GUARD_BODY_RE.test(bodyHead)) guarded.add(m[1]);
    }
    return [...guarded];
}

/** Text from the `{` at `open` to its matching `}` (brace counting; comments already stripped). */
function body(code: string, open: number): string {
    let depth = 0;
    for (let i = open; i < code.length; i++) {
        const ch = code[i];
        if (ch === "{") depth++;
        else if (ch === "}" && --depth === 0) return code.slice(open, i + 1);
    }
    return code.slice(open);
}
