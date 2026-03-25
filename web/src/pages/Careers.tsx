import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import PublicPageShell from '@/components/PublicPageShell';
import PublicAnimatedSection from '@/components/PublicAnimatedSection';
import { PRODUCT } from '@/lib/productCopy';
import { publicEase } from '@/lib/publicMotion';

const roles = [
  { title: 'Backend (.NET 8)', location: 'API, EF Core, jobs', type: 'Open source' },
  { title: 'Web (React + Vite)', location: 'Caregiver portal', type: 'Open source' },
  { title: 'Mobile (Expo)', location: 'Patient app', type: 'Open source' },
];

export default function Careers() {
  return (
    <PublicPageShell
      kicker="Contribute"
      title="Careers"
      subtitle={`${PRODUCT.name} is a documentation-driven MVP monorepo—not an active hiring board on this static site.`}
    >
      <PublicAnimatedSection>
        <p className="public-body-emphasis">
          If you are extending the product, work from{' '}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-sm text-zinc-300">MVP_APPLICATION.md</code> so features
          match shipped code. For collaboration, use your team’s process (issues, PRs, or internal channels) after you
          clone the repository.
        </p>
        <p className="public-body-muted mt-4 text-sm">
          Need a human contact? This deployment does not publish staffing inboxes—see{' '}
          <Link to="/contact" className="public-link">
            Contact
          </Link>
          .
        </p>
      </PublicAnimatedSection>

      <PublicAnimatedSection showDivider delay={0.08}>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Skill areas in the repo</h2>
        <div className="mt-4 space-y-3">
          {roles.map((r, i) => (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, x: -14 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ delay: i * 0.08, duration: 0.45, ease: publicEase }}
              whileHover={{ x: 6, transition: { duration: 0.2 } }}
              className="public-card-quiet flex flex-col gap-2 px-4 py-4 transition-colors hover:border-teal-500/30 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-white">{r.title}</p>
                <p className="public-body-muted text-sm">{r.location}</p>
              </div>
              <span className="w-fit rounded-lg border border-teal-500/30 px-2 py-1 text-xs font-medium text-teal-300/90">
                {r.type}
              </span>
            </motion.div>
          ))}
        </div>
      </PublicAnimatedSection>
    </PublicPageShell>
  );
}
