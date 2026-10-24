import { aiDeliveryStages } from '@/data/ai-delivery-roadmap';
import styles from './AIDeliveryRoadmap.module.css';

/** Native links and disclosures keep the roadmap usable without JavaScript. */
export default function AIDeliveryRoadmap() {
  return (
    <section className={styles.roadmap} aria-labelledby="delivery-map-heading">
      <p className={styles.eyebrow}>From a useful question to an owned service</p>
      <h2 id="delivery-map-heading">Seven stages. Evidence at every step.</h2>
      <p className={styles.intro}>
        Start at the first unresolved stage. Open its evidence checklist, or follow the title to the full guide.
        Revisit earlier decisions when the evidence changes.
      </p>
      <ol className={styles.stages}>
        {aiDeliveryStages.map((stage, index) => (
          <li key={stage.id} className={styles.stage}>
            <a className={styles.stageLink} href={`#${stage.id}`}>
              <span className={styles.number} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <span>{stage.title}</span>
              <span className={styles.arrow} aria-hidden="true">↗</span>
            </a>
            <p className={styles.question}>{stage.question}</p>
            <details className={styles.evidence}>
              <summary>Evidence for stage {index + 1}</summary>
              <dl>
                <dt>Produce</dt><dd>{stage.artifact}</dd>
                <dt>Review with</dt><dd>{stage.owner}</dd>
                <dt>Move forward when</dt><dd>{stage.gate}</dd>
                <dt>Pause if</dt><dd>{stage.stop}</dd>
              </dl>
            </details>
          </li>
        ))}
      </ol>
      <div className={styles.downloads}>
        <a href="/examples/ai-delivery-roadmap/delivery-checklist.md" download>Download the delivery checklist ↓</a>
        <a href="/examples/ai-delivery-roadmap/release-decision.md" download>Download the release decision template ↓</a>
      </div>
      <p className={styles.note}>Editable Markdown files. Choose thresholds for your workflow; completing a checklist does not certify a release.</p>
    </section>
  );
}
