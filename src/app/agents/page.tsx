import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Agents from "@/components/Agents";
import AgentLab from "@/components/AgentLab";
import { getDictionary } from "@/lib/i18n";
import { createPageMetadata } from "@/lib/seo-config";
import type { Metadata } from "next";


const TITLE = "AI Agent Host — Autonomous Agents for Billion-Dollar Markets";
const DESCRIPTION =
    "Live, autonomous AI agents built by Rohit Raj — try them in your browser. An AI home-services dispatcher that quotes and books, a contract risk reviewer, an educational portfolio X-ray, and an MCP manifest security scanner. Each runs deterministically with no API key.";

export async function generateMetadata(): Promise<Metadata> {
    return createPageMetadata(TITLE, DESCRIPTION, "/agents", { translated: false });
}

export default async function AgentsPage() {
    const dict = await getDictionary();

    return (
        <>
            <Header dict={dict.common} />
            <main id="main">
                <div className="page-header">
                    <div className="container">
                        <span className="agent-host-eyebrow">AI Agent Host</span>
                        <h1 className="page-title">Autonomous agents that finish the job</h1>
                        <p className="page-description">
                            I don&apos;t just talk about AI agents — I build and run them. These are autonomous systems that
                            decide, call tools, and complete real work on their own, each aimed at a billion-dollar market.
                            Seven of them are live below: try them.
                        </p>
                    </div>
                </div>

                <AgentLab />

                <Agents variant="full" />
            </main>
            <Footer dict={dict.common} />
        </>
    );
}
