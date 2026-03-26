import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import PublicPageShell from '@/components/PublicPageShell';
import PublicAnimatedSection from '@/components/PublicAnimatedSection';
import { DOC_LINKS, LIMITATION_NOTE, PRODUCT } from '@/lib/productCopy';
import { publicEase } from '@/lib/publicMotion';

const tiers = [
  {
    name: 'Local evaluation',
    price: 'Free',
    period: 'open source',
    desc: 'Clone the monorepo, run docker-compose for API + PostgreSQL, npm run dev for web, Expo for mobile.',
    features: [
      'Full MVP feature set in MVP_APPLICATION.md',
      'Seed users & sample devices/schedules',
      'Swagger at /swagger on the API',
      'No vendor support—use issues/docs',
    ],
    cta: 'Create account',
    href: '/register',
    highlight: false,
  },
  {
    name: 'Self-hosted',
    price: 'Your cost',
    period: 'Azure optional',
    desc: 'Repository includes azure/ Bicep and workflows for Linux App Service + PostgreSQL Flexible + Static Web Apps (you provide subscription & secrets).',
    features: [
      'Deploy API + web per azure/README.md',
      'You own backups, TLS, and secrets',
      'Same codebase as local evaluation',
      'Still single-tenant MVP semantics',
    ],
    cta: 'About the platform',
    href: '/about',
    highlight: true,
  },
  {
    name: 'Roadmap / enterprise',
    price: 'N/A',
    period: 'not shipped here',
    desc: 'MVP_APPLICATION.md lists post-MVP items: webhook retries, FCM/APNs, multi-tenant orgs, FHIR, full MFA matrix, etc.',
    features: ['Not implemented in this repo', 'Requires separate product/legal work', 'HIPAA/BAA not included in MVP'],
    cta: 'See MVP scope',
    href: '/faq',
    highlight: false,
  },
];

export default function Pricing() {
  return (
    <PublicPageShell
      contentWidth="full"
      kicker="How to run it"
      title="Pricing & deployment"
      subtitle={`${PRODUCT.name} is documented as an MVP monorepo. There is no commercial price list here—only how evaluation and optional self-hosting align with the docs.`}
    >
      <PublicAnimatedSection>
        <div className="grid gap-6 md:grid-cols-3">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: publicEase }}
              whileHover={{ y: -8, transition: { duration: 0.25 } }}
              className={`relative flex flex-col rounded-2xl border p-6 ${
                tier.highlight
                  ? 'border-teal-500/40 bg-gradient-to-b from-teal-500/12 to-transparent shadow-lg shadow-teal-500/15 ring-1 ring-teal-500/20'
                  : 'public-card-quiet hover:border-white/15'
              }`}
            >
              {tier.highlight ? <span className="public-pill-badge">Optional cloud</span> : null}
              <h2 className="public-h3-card text-xl">{tier.name}</h2>
              <p className="public-body-muted mt-1">{tier.desc}</p>
              <div className="mb-6 mt-6">
                <span className="text-3xl font-bold text-white">{tier.price}</span>
                <span className="ml-2 text-sm text-zinc-500">{tier.period}</span>
              </div>
              <ul className="mb-8 flex-1 space-y-3">
                {tier.features.map((f, fi) => (
                  <motion.li
                    key={f}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 + fi * 0.05 + 0.15, duration: 0.35 }}
                    className="flex gap-2 text-sm text-zinc-400"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-400" />
                    {f}
                  </motion.li>
                ))}
              </ul>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to={tier.href}
                  className={`block rounded-xl py-3 text-center text-sm font-semibold transition-colors ${
                    tier.highlight
                      ? 'bg-gradient-to-r from-teal-400 to-emerald-500 text-[#06060a] shadow-md shadow-teal-500/20'
                      : 'border border-white/15 text-white hover:bg-white/5'
                  }`}
                >
                  {tier.cta}
                </Link>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </PublicAnimatedSection>

      <PublicAnimatedSection showDivider delay={0.06}>
        <p className="public-body-muted text-center text-xs">
          Authoritative scope: {DOC_LINKS.mvpScope}. Azure: azure/README.md in the repository. This page is not a quote
          or legally binding offer.
        </p>
      </PublicAnimatedSection>

      <PublicAnimatedSection delay={0.04}>
        <p className="public-body-muted text-sm">{LIMITATION_NOTE}</p>
      </PublicAnimatedSection>
    </PublicPageShell>
  );
}
