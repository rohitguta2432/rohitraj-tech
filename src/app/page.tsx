import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HireBlock from "@/components/HireBlock";
import WorkIndex from "@/components/WorkIndex";
import WritingIndex from "@/components/WritingIndex";
import ProcessTimeline from "@/components/ProcessTimeline";
import ReliabilitySection from "@/components/ReliabilitySection";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import ClosingCta from "@/components/ClosingCta";
import Footer from "@/components/Footer";
import { getDictionary } from "@/lib/i18n";
import { webSiteSchema, generateFAQSchema } from "@/lib/seo-config";


export default async function Home() {


    const dict = await getDictionary();

    const faqSchema = dict.home.faq
        ? generateFAQSchema(
              dict.home.faq.items.map((item) => ({
                  question: item.q,
                  answer: item.a,
              }))
          )
        : null;

    return (
        <>
            <script type="application/ld+json">{JSON.stringify(webSiteSchema)}</script>
            {faqSchema && (
                <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
            )}
            <Header dict={dict.common} />
            <main id="main">
                <Hero dict={dict.home} />
                <HireBlock dict={dict.home} />
                <WorkIndex />
                <WritingIndex />
                <ProcessTimeline dict={dict.home} />
                <ReliabilitySection dictionary={dict.home} />
                <Testimonials />
                <FAQ dict={dict.home} />
                <ClosingCta />
            </main>
            <Footer dict={dict.common} />
        </>
    );
}
