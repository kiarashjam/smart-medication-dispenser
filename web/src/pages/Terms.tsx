import PublicPageShell from '@/components/PublicPageShell';
import PublicAnimatedSection from '@/components/PublicAnimatedSection';
import { LIMITATION_NOTE, PRODUCT } from '@/lib/productCopy';

const sections = [
  {
    title: '1. Software as-is',
    body: `${PRODUCT.name} is provided under the repository’s license for evaluation and extension. There is no warranty of fitness for a particular purpose, including clinical or regulated use.`,
  },
  {
    title: '2. Not medical advice',
    body: 'The application does not diagnose or prescribe. Medication decisions remain with licensed professionals and applicable regulations.',
  },
  {
    title: '3. MVP limitations',
    body: LIMITATION_NOTE,
  },
  {
    title: '4. Acceptable use',
    body: 'Do not misuse credentials, attempt unauthorized access to others’ deployments, or represent the demo as a certified medical device unless you have completed your own regulatory path.',
  },
  {
    title: '5. Contact',
    body: 'Use your organization’s process for forks and production deployments; see Contact page for how this site relates to the repo.',
  },
];

export default function Terms() {
  return (
    <PublicPageShell
      kicker="Legal"
      title="Terms of service"
      subtitle="Placeholder terms for the evaluation software described in the repository. Not a substitute for counsel."
    >
      <div className="space-y-0 text-sm">
        {sections.map((s, i) => (
          <PublicAnimatedSection key={s.title} showDivider={i > 0} delay={i * 0.05} yOffset={18}>
            <h2 className="public-legal-h2">{s.title}</h2>
            <p className="public-body-muted mt-3">{s.body}</p>
          </PublicAnimatedSection>
        ))}
      </div>
    </PublicPageShell>
  );
}
