// Synced from github.com/rohitguta2432/chainlens (src/types.ts) — edit there, then run scripts/sync-to-site.sh.
// Chainlens core types. The pipeline is split in two:
//
//   collect (network)  →  Snapshot (plain JSON)  →  analyze (pure)  →  Finding[]
//
// Everything the analysers need is captured in the Snapshot, so the same
// snapshot always yields the same findings. Recorded snapshots double as the
// eval fixtures.

import type { ChainKey } from "./chains";

export type Severity = "critical" | "high" | "medium" | "low";

export const SEVERITIES: Severity[] = ["critical", "high", "medium", "low"];

/** A tag from Blockscout's public metadata registry (e.g. "Phish / Hack", "Uniswap"). */
export interface Tag {
    slug: string;
    name: string;
    type: string;
}

/** Normalised view of an address as seen by the explorer and the tag registry. */
export interface Party {
    address: string;
    isContract: boolean;
    isVerified: boolean;
    /** Blockscout's scam flag or a "scam" reputation. */
    isScam: boolean;
    /** Contract name, public name tag, or ENS name. */
    name: string | null;
    tags: Tag[];
}

export type ApprovalKind = "erc20" | "erc20-increase" | "operator" | "permit2";

/** An approval decoded straight from a transaction's calldata. */
export interface DecodedApproval {
    kind: ApprovalKind;
    /** Contract whose tokens the spender may move (tx.to, or the Permit2 token argument). */
    token: string;
    spender: string;
    /** Decimal string; null for operator (setApprovalForAll) approvals. */
    amount: string | null;
    /** setApprovalForAll(operator, approved). */
    approved?: boolean;
    /** Permit2 expiration, unix seconds. */
    expiration?: number;
}

export interface TxLite {
    hash: string;
    timestamp: string;
    status: "ok" | "error";
    method: string | null;
    /** 4-byte selector ("0x" + 8 hex) or null for a plain value transfer. */
    selector: string | null;
    /** Wei, decimal string. */
    value: string;
    /** null for contract-creation transactions. */
    to: Party | null;
    approval?: DecodedApproval;
}

export interface TokenRef {
    address: string;
    symbol: string | null;
    name: string | null;
    type: string;
    isScam: boolean;
}

export interface TransferLite {
    txHash: string;
    timestamp: string;
    from: Party;
    to: Party;
    token: TokenRef;
    /** Raw integer string; null for NFTs without an amount. */
    value: string | null;
    decimals: number | null;
}

/** The latest approval per (token, spender), checked against live chain state. */
export interface ApprovalState {
    kind: ApprovalKind;
    token: { address: string; symbol: string | null; decimals: number | null; totalSupply: string | null };
    spender: Party;
    grantedAt: string;
    txHash: string;
    /** Live allowance (decimal string); "1"/"0" for operator approvals; null when it could not be read. */
    current: string | null;
    unlimited: boolean;
    expiration?: number;
}

export interface SourceFlags {
    selfdestruct: boolean;
    delegatecall: boolean;
}

export interface ContractInfo {
    isVerified: boolean;
    name: string | null;
    language: string | null;
    compiler: string | null;
    /** Names of state-changing functions in the verified ABI. */
    writeFunctions: string[];
    /** Write functions whose source shows an access-control guard (onlyOwner, onlyRole, …). */
    guardedFunctions: string[];
    sourceFlags: SourceFlags;
    proxyType: string | null;
    implementation: {
        address: string;
        name: string | null;
        isVerified: boolean;
        writeFunctions: string[];
        guardedFunctions: string[];
        sourceFlags: SourceFlags;
    } | null;
    /** Upgrade admin read from the EIP-1967 / legacy OpenZeppelin admin slot. */
    admin: { address: string; kind: "eoa" | "contract"; party: Party | null } | null;
    /** Result of owner(), when the contract exposes it. */
    owner: { address: string; kind: "eoa" | "contract" | "renounced"; party: Party | null } | null;
    createdAt: string | null;
    creator: Party | null;
    token: {
        type: string;
        symbol: string | null;
        name: string | null;
        holders: number | null;
        totalSupply: string | null;
        decimals: number | null;
        topHolders: { party: Party; value: string }[];
    } | null;
}

export interface WalletData {
    /** Most recent outgoing transactions, newest first. */
    txs: TxLite[];
    approvals: ApprovalState[];
    /** Most recent incoming / outgoing token transfers. */
    inbound: TransferLite[];
    outbound: TransferLite[];
    /** Creation time of unverified contracts this wallet called (lowercase address → ISO | null). */
    contractAges: Record<string, string | null>;
    /** Contracts this wallet deployed itself (lowercase) — a developer calling their own code isn't a red flag. */
    ownContracts: string[];
}

export interface Snapshot {
    version: 1;
    chain: ChainKey;
    /** What the user typed — an address or an ENS name. */
    input: string;
    address: string;
    fetchedAt: string;
    kind: "wallet" | "contract";
    self: Party;
    counters: { transactions: number; tokenTransfers: number };
    /** EIP-7702 delegation designator on an EOA, if any. */
    delegation: { address: string; party: Party | null } | null;
    wallet: WalletData | null;
    contract: ContractInfo | null;
    /** Checks that could not run (timeouts, missing data) — reported, never hidden. */
    gaps: string[];
}

export interface Evidence {
    label: string;
    value: string;
    href?: string;
}

export interface Finding {
    id: string;
    severity: Severity;
    title: string;
    /** Plain-English explanation of why this matters. */
    detail: string;
    evidence: Evidence[];
    remediation: string;
}
