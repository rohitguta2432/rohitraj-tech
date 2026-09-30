// Synced from github.com/rohitguta2432/chainlens (src/chains.ts) — edit there, then run scripts/sync-to-site.sh.
// Supported EVM chains. Every data source is public and keyless: Blockscout's
// REST API for history, labels and verified source, and public JSON-RPC nodes
// (with Blockscout's own RPC as a fallback) for live contract state.

export type ChainKey = "ethereum" | "base" | "arbitrum" | "optimism" | "polygon";

export interface ChainConfig {
    key: ChainKey;
    id: number;
    name: string;
    nativeSymbol: string;
    /** Explorer UI base, used for evidence links. */
    explorer: string;
    /** Blockscout REST API v2 base. */
    api: string;
    /** JSON-RPC endpoints, tried in order. */
    rpc: string[];
}

export const CHAINS: Record<ChainKey, ChainConfig> = {
    ethereum: {
        key: "ethereum",
        id: 1,
        name: "Ethereum",
        nativeSymbol: "ETH",
        explorer: "https://eth.blockscout.com",
        api: "https://eth.blockscout.com/api/v2",
        rpc: ["https://ethereum-rpc.publicnode.com", "https://eth.blockscout.com/api/eth-rpc"],
    },
    base: {
        key: "base",
        id: 8453,
        name: "Base",
        nativeSymbol: "ETH",
        explorer: "https://base.blockscout.com",
        api: "https://base.blockscout.com/api/v2",
        rpc: ["https://base-rpc.publicnode.com", "https://base.blockscout.com/api/eth-rpc"],
    },
    arbitrum: {
        key: "arbitrum",
        id: 42161,
        name: "Arbitrum One",
        nativeSymbol: "ETH",
        explorer: "https://arbitrum.blockscout.com",
        api: "https://arbitrum.blockscout.com/api/v2",
        rpc: ["https://arbitrum-one-rpc.publicnode.com", "https://arbitrum.blockscout.com/api/eth-rpc"],
    },
    optimism: {
        key: "optimism",
        id: 10,
        name: "OP Mainnet",
        nativeSymbol: "ETH",
        explorer: "https://explorer.optimism.io",
        api: "https://explorer.optimism.io/api/v2",
        rpc: ["https://optimism-rpc.publicnode.com", "https://explorer.optimism.io/api/eth-rpc"],
    },
    polygon: {
        key: "polygon",
        id: 137,
        name: "Polygon PoS",
        nativeSymbol: "POL",
        explorer: "https://polygon.blockscout.com",
        api: "https://polygon.blockscout.com/api/v2",
        rpc: ["https://polygon-bor-rpc.publicnode.com", "https://polygon.blockscout.com/api/eth-rpc"],
    },
};

export const CHAIN_KEYS = Object.keys(CHAINS) as ChainKey[];

export function isChainKey(v: unknown): v is ChainKey {
    return typeof v === "string" && v in CHAINS;
}

export function addressUrl(chain: ChainKey, address: string): string {
    return `${CHAINS[chain].explorer}/address/${address}`;
}

export function txUrl(chain: ChainKey, hash: string): string {
    return `${CHAINS[chain].explorer}/tx/${hash}`;
}
