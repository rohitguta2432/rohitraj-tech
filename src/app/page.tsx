import Header from "@/components/Header";
import Hero from "@/components/Hero";
import WritingIndex from "@/components/WritingIndex";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import SixWeeks from "@/components/landing/SixWeeks";
import { Asks, Billboards, StreetNext, Who } from "@/components/landing/Sections";
import { getDictionary } from "@/lib/i18n";
import { webSiteSchema } from "@/lib/seo-config";
import "./landing.css";


export default async function Home() {


    const dict = await getDictionary();

    return (
        <>
            <script type="application/ld+json">{JSON.stringify(webSiteSchema)}</script>
            <Header dict={dict.common} />
            {/* The film opens on today's street and ends on the finished city, and the
                page stays in that city: the six weeks as a drag, what founders ask for,
                the work as billboards, who they are hiring, then the closing call. The
                notes card keeps its sheet, since its links are how the posts get crawled. */}
            <main id="main" className="stage">
                <Hero dict={dict.home} />
                <SixWeeks />
                <Asks />
                <Billboards />
                <Who />
                <div className="sheet">
                    <WritingIndex />
                    <Testimonials />
                </div>
                <StreetNext />
            </main>
            <Footer dict={dict.common} />
        </>
    );
}
