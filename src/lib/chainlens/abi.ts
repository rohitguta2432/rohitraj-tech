// Synced from github.com/rohitguta2432/chainlens (src/abi.ts) — edit there, then run scripts/sync-to-site.sh.
// Minimal, dependency-free ABI helpers — only what Chainlens needs: decode the
// four approval calls from calldata, encode a few view calls, and decode their
// return data. Every selector and storage slot here is re-derived with keccak256
// in test/abi.test.ts, and the decoder is cross-checked against viem's encoder.

import type { DecodedApproval } from "./types";

export const SELECTORS = {
    approve: "0x095ea7b3", // approve(address,uint256)
    increaseAllowance: "0x39509351", // increaseAllowance(address,uint256)
    setApprovalForAll: "0xa22cb465", // setApprovalForAll(address,bool)
    permit2Approve: "0x87517c45", // Permit2.approve(address,address,uint160,uint48)
    allowance: "0xdd62ed3e", // allowance(address,address)
    isApprovedForAll: "0xe985e9c5", // isApprovedForAll(address,address)
    permit2Allowance: "0x927da105", // Permit2.allowance(address,address,address)
    totalSupply: "0x18160ddd", // totalSupply()
    decimals: "0x313ce567", // decimals()
    symbol: "0x95d89b41", // symbol()
    owner: "0x8da5cb5b", // owner()
} as const;

/** Uniswap's Permit2 — same address on every chain. */
export const PERMIT2 = "0x000000000022D473030F116dDEE9F6B43aC78BA3";

export const SLOTS = {
    /** bytes32(uint256(keccak256("eip1967.proxy.admin")) - 1) */
    eip1967Admin: "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103",
    /** bytes32(uint256(keccak256("eip1967.proxy.implementation")) - 1) */
    eip1967Implementation: "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc",
    /** keccak256("org.zeppelinos.proxy.admin") — legacy OpenZeppelin proxies (e.g. USDC). */
    zosAdmin: "0x10d6a54a4754c8869d6886b5f5d7fbfa5b4522237ea5c60d11bc4e7a1ff9390b",
} as const;

export const MAX_UINT256 = (BigInt(1) << BigInt(256)) - BigInt(1);

/** Allowances at or above 2^128 are "unlimited" in practice for any real token. */
export const UNLIMITED_FLOOR = BigInt(1) << BigInt(128);

/** Burn / null addresses that hold "renounced" ownership or burnt supply. */
export const BURN_ADDRESSES = new Set([
    "0x0000000000000000000000000000000000000000",
    "0x000000000000000000000000000000000000dead",
]);

const HEX_RE = /^0x[0-9a-fA-F]*$/;

export function isAddress(s: string): boolean {
    return /^0x[0-9a-fA-F]{40}$/.test(s);
}

export function sameAddress(a: string | null | undefined, b: string | null | undefined): boolean {
    return !!a && !!b && a.toLowerCase() === b.toLowerCase();
}

function strip0x(h: string): string {
    return h.startsWith("0x") || h.startsWith("0X") ? h.slice(2) : h;
}

/** 32-byte word i (0-based) of a hex blob without the 0x prefix. */
export function wordAt(hexNo0x: string, i: number): string | null {
    const w = hexNo0x.slice(i * 64, i * 64 + 64);
    return w.length === 64 ? w : null;
}

function wordToBigInt(w: string): bigint {
    return BigInt("0x" + w);
}

/** A word holds a clean address only if its top 12 bytes are zero. */
function wordToAddress(w: string): string | null {
    if (!/^0{24}/.test(w)) return null;
    return "0x" + w.slice(24);
}

/** Decode approve / increaseAllowance / setApprovalForAll / Permit2.approve calldata. */
export function decodeApprovalCall(to: string, input: string | null | undefined): DecodedApproval | null {
    if (!input || input.length < 10 || !HEX_RE.test(input)) return null;
    const selector = input.slice(0, 10).toLowerCase();
    const args = input.slice(10);

    if (selector === SELECTORS.approve || selector === SELECTORS.increaseAllowance) {
        const s = wordAt(args, 0);
        const a = wordAt(args, 1);
        const spender = s && wordToAddress(s);
        if (!spender || !a) return null;
        return {
            kind: selector === SELECTORS.approve ? "erc20" : "erc20-increase",
            token: to,
            spender,
            amount: wordToBigInt(a).toString(),
        };
    }

    if (selector === SELECTORS.setApprovalForAll) {
        const o = wordAt(args, 0);
        const b = wordAt(args, 1);
        const operator = o && wordToAddress(o);
        if (!operator || !b) return null;
        return { kind: "operator", token: to, spender: operator, amount: null, approved: wordToBigInt(b) !== BigInt(0) };
    }

    if (selector === SELECTORS.permit2Approve && sameAddress(to, PERMIT2)) {
        const [t, s, a, e] = [0, 1, 2, 3].map((i) => wordAt(args, i));
        const token = t && wordToAddress(t);
        const spender = s && wordToAddress(s);
        if (!token || !spender || !a || !e) return null;
        return {
            kind: "permit2",
            token,
            spender,
            amount: wordToBigInt(a).toString(),
            expiration: Number(wordToBigInt(e)),
        };
    }

    return null;
}

function encodeAddressArg(a: string): string {
    return strip0x(a).toLowerCase().padStart(64, "0");
}

/** selector + address arguments (all the view calls Chainlens makes take addresses only). */
export function encodeCall(selector: string, ...addresses: string[]): string {
    return selector + addresses.map(encodeAddressArg).join("");
}

export function decodeUint(ret: string | null | undefined, index = 0): bigint | null {
    if (!ret || !HEX_RE.test(ret)) return null;
    const w = wordAt(strip0x(ret), index);
    return w ? wordToBigInt(w) : null;
}

export function decodeAddress(ret: string | null | undefined): string | null {
    if (!ret || !HEX_RE.test(ret)) return null;
    const w = wordAt(strip0x(ret), 0);
    return w ? wordToAddress(w) : null;
}

/** An address stored in a raw storage slot (right-aligned); null when empty. */
export function slotToAddress(slot: string | null | undefined): string | null {
    if (!slot || !HEX_RE.test(slot)) return null;
    const h = strip0x(slot).padStart(64, "0");
    const addr = "0x" + h.slice(24);
    return /^0x0{40}$/.test(addr) ? null : addr;
}

function hexToText(hex: string): string {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
    // Drop control characters (NUL padding in bytes32 symbols, stray escapes).
    return Array.from(text)
        .filter((ch) => {
            const c = ch.codePointAt(0) ?? 0;
            return c >= 32 && c !== 127;
        })
        .join("")
        .trim();
}

/** Decode a string return (ABI dynamic string, or legacy bytes32 like MKR's symbol). */
export function decodeString(ret: string | null | undefined): string | null {
    if (!ret || !HEX_RE.test(ret)) return null;
    const h = strip0x(ret);
    if (h.length === 64) return hexToText(h) || null; // bytes32
    if (h.length < 128) return null;
    const offset = Number(wordToBigInt(h.slice(0, 64))) * 2;
    const lenWord = h.slice(offset, offset + 64);
    if (lenWord.length !== 64) return null;
    const len = Number(wordToBigInt(lenWord));
    if (len > 256) return null;
    const text = hexToText(h.slice(offset + 64, offset + 64 + len * 2));
    return text ? text.slice(0, 48) : null;
}

/** EIP-7702: delegated EOAs carry code 0xef0100 ‖ delegate address. */
export function delegationTarget(code: string | null | undefined): string | null {
    if (!code) return null;
    const h = strip0x(code).toLowerCase();
    return h.length === 46 && h.startsWith("ef0100") ? "0x" + h.slice(6) : null;
}

/** Deployed bytecode present (and not a 7702 delegation designator). */
export function hasContractCode(code: string | null | undefined): boolean {
    if (!code) return false;
    const h = strip0x(code);
    return h.length > 0 && delegationTarget(code) === null;
}

/**
 * Address-poisoning lookalike: same first and last `n` hex characters but a
 * different address. Attackers grind vanity addresses to match exactly the
 * characters wallets show in truncated form (0x1234…abcd).
 */
export function isLookalike(a: string, b: string, n = 4): boolean {
    const x = strip0x(a).toLowerCase();
    const y = strip0x(b).toLowerCase();
    return x !== y && x.length === 40 && y.length === 40 && x.slice(0, n) === y.slice(0, n) && x.slice(-n) === y.slice(-n);
}

/** Human amount from a raw integer string, e.g. ("1500000", 6) → "1.5". */
export function formatUnits(raw: string | null, decimals: number | null): string {
    if (raw === null) return "?";
    const v = BigInt(raw);
    if (v >= UNLIMITED_FLOOR) return "unlimited";
    const d = decimals ?? 0;
    if (d === 0) return v.toLocaleString("en-US");
    const base = BigInt(10) ** BigInt(d);
    const whole = v / base;
    const frac = (v % base).toString().padStart(d, "0").replace(/0+$/, "").slice(0, 4);
    return `${whole.toLocaleString("en-US")}${frac ? "." + frac : ""}`;
}

export function shortAddress(a: string): string {
    return a.length > 12 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a;
}
