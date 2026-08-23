import Link from "next/link";

/**
 * The closing ask.
 *
 * The page previously spent five sections building a case — process, reliability,
 * testimonials, FAQ — and then ended into a footer subscribe form. There was no
 * contact or booking link anywhere in the bottom 60% of the page, so the entire
 * persuasion tail led nowhere. This is the end of the argument.
 */
export default function ClosingCta({ locale }: { locale: string }) {
    return (
        <section className="closing" id="start">
            <div className="container closing-inner">
                <h2 className="closing-h2">
                    Still reading? Then you have a build in mind.
                </h2>
                <p className="closing-body">
                    Tell me what you are shipping and I will tell you, on the call, whether six
                    weeks is realistic and what I would cut to get there. If it is not a fit I
                    will say so — that is a faster answer than a proposal.
                </p>

                <div className="closing-actions">
                    <Link href={`/${locale}/contact`} className="btn btn-primary">
                        Book a free 30-min call
                    </Link>
                    <Link href={`/${locale}/services/6-week-mvp`} className="closing-alt">
                        See how the 6-week sprint runs <span aria-hidden="true">→</span>
                    </Link>
                </div>

                <p className="closing-fineprint">
                    You own the code, the IP and the repo from week one · First production
                    commit inside 5 days · Daily Slack or WhatsApp access
                </p>
            </div>
        </section>
    );
}
