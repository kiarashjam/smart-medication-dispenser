import PublicPageShell from '@/components/PublicPageShell';
import PublicAnimatedSection from '@/components/PublicAnimatedSection';
import { LIMITATION_NOTE, PRODUCT } from '@/lib/productCopy';

const sections = [
  {
    title: '1. What this site is',
    body: `${PRODUCT.name} is an open MVP monorepo. This Vite app can run locally or on your Static Web Apps / CDN instance. We do not operate a centralized “MediCare” SaaS on your behalf—you or your team control the deployment.`,
  },
  {
    title: '2. Demo and seed data',
    body: 'The API seeds demo users (patient, caregiver, admin) and sample devices for evaluation. Do not load real PHI into a demo stack without legal review and proper safeguards.',
  },
  {
    title: '3. Data the stack may process',
    body: 'When you run the full platform, the API stores accounts, device metadata, schedules, dispense events, and notifications in PostgreSQL as described in software-docs. Analytics on this static marketing site, if any, depend entirely on how you host it.',
  },
  {
    title: '4. Your responsibilities',
    body: 'Configure TLS, backups, access control, retention, and subprocessors for your environment. See software-docs/12_COMPLIANCE_DATA_GOVERNANCE.md for long-form governance topics; MVP_APPLICATION.md for what the code actually implements today.',
  },
  {
    title: '5. Changes',
    body: 'Forks should maintain their own policy text for production use.',
  },
];

export default function Privacy() {
  return (
    <PublicPageShell
      kicker="Legal"
      title="Privacy policy"
      subtitle="Placeholder for the public marketing shell. Authoritative handling of data in a real deployment must follow your own privacy program and the backend you operate—not this paragraph alone."
    >
      <div className="space-y-0 text-sm">
        {sections.map((s, i) => (
          <PublicAnimatedSection key={s.title} showDivider={i > 0} delay={i * 0.05} yOffset={18}>
            <h2 className="public-legal-h2">{s.title}</h2>
            <p className="public-body-muted mt-3">{s.body}</p>
          </PublicAnimatedSection>
        ))}
      </div>
      <PublicAnimatedSection showDivider delay={0.15}>
        <p className="public-body-muted text-xs">{LIMITATION_NOTE}</p>
      </PublicAnimatedSection>
    </PublicPageShell>
  );
}
