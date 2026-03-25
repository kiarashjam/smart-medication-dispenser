import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, Server, FileCheck, Shield } from 'lucide-react';
import PublicPageShell from '@/components/PublicPageShell';
import PublicAnimatedSection from '@/components/PublicAnimatedSection';
import { LIMITATION_NOTE, PRODUCT } from '@/lib/productCopy';
import { publicEase } from '@/lib/publicMotion';

const blocks = [
  {
    icon: Lock,
    title: 'Authentication',
    body: 'JWT bearer tokens issued by the ASP.NET Core API; roles for patient, caregiver, and admin. MFA and full production RBAC hardening are post-MVP in the scope doc.',
  },
  {
    icon: Server,
    title: 'Data store',
    body: 'PostgreSQL behind EF Core migrations. Encryption at rest and network isolation depend on how you host (Docker locally vs Azure PostgreSQL Flexible Server, etc.).',
  },
  {
    icon: FileCheck,
    title: 'Webhooks',
    body: 'Optional HMAC-SHA256 on outgoing webhook bodies (see WEBHOOKS_JSON_REFERENCE.md). No retry queue or delivery log UI in MVP.',
  },
  {
    icon: Shield,
    title: 'HIPAA / enterprise',
    body: 'BAAs, full audit exports, SSO, and multi-tenant org features are roadmap items—not claims of this repository. A production HIPAA assessment is your responsibility.',
  },
];

export default function Security() {
  return (
    <PublicPageShell
      kicker="Engineering"
      title="Security overview"
      subtitle={`What the ${PRODUCT.name} MVP is designed around—and what is explicitly out of scope until you add it (per MVP_APPLICATION.md).`}
    >
      <PublicAnimatedSection>
        <div className="grid gap-5 sm:grid-cols-2">
          {blocks.map(({ icon: Icon, title: t, body }, i) => (
            <motion.div
              key={t}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.07, duration: 0.48, ease: publicEase }}
              whileHover={{ y: -5, transition: { duration: 0.22 } }}
              className="public-card-quiet group relative overflow-hidden p-5 transition-colors hover:border-violet-500/30"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-600/0 to-teal-600/0 opacity-0 transition-opacity duration-500 group-hover:from-violet-600/10 group-hover:to-teal-600/5 group-hover:opacity-100" />
              <motion.div
                whileHover={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.5 }}
                className="relative mb-3 inline-block"
              >
                <Icon className="h-7 w-7 text-violet-400" />
              </motion.div>
              <h2 className="public-h3-card relative">{t}</h2>
              <p className="public-body-muted relative mt-2 text-sm">{body}</p>
            </motion.div>
          ))}
        </div>
      </PublicAnimatedSection>

      <PublicAnimatedSection showDivider delay={0.06}>
        <p className="public-body-muted text-sm">
          Device API rate limits and heartbeat behavior are specified in device protocol docs; not all checklist items in
          IMPLEMENTATION_CHECKLIST.md may match every build—verify against your branch.
        </p>
      </PublicAnimatedSection>

      <PublicAnimatedSection delay={0.04}>
        <p className="public-body-muted text-sm">
          Questions about deployment hardening belong with your team or fork maintainers.{' '}
          <Link to="/contact" className="public-link">
            Contact
          </Link>{' '}
          explains how this site relates to documentation.
        </p>
      </PublicAnimatedSection>

      <PublicAnimatedSection delay={0.03}>
        <p className="public-body-muted text-xs">{LIMITATION_NOTE}</p>
      </PublicAnimatedSection>
    </PublicPageShell>
  );
}
