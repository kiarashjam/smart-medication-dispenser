import { motion } from 'motion/react';
import { Heart, Target, Users } from 'lucide-react';
import PublicPageShell from '@/components/PublicPageShell';
import PublicAnimatedSection from '@/components/PublicAnimatedSection';
import { LIMITATION_NOTE, PRODUCT } from '@/lib/productCopy';
import { publicEase } from '@/lib/publicMotion';

const cards = [
  {
    icon: Heart,
    title: 'Patient flow',
    body: 'Mobile: today’s schedule, confirm intake, history, notifications (Expo local in MVP—not full push).',
  },
  {
    icon: Users,
    title: 'Caregiver & admin',
    body: 'Web: dashboard, devices (pause/resume), containers, schedules, history, travel, integrations, settings.',
  },
  {
    icon: Target,
    title: 'Cloud behavior',
    body: 'Core path: schedule → dispense → confirm → decrement inventory; missed-dose job after ~60 minutes; low-stock notifications + webhooks per docs.',
  },
];

export default function About() {
  return (
    <PublicPageShell
      kicker="Project"
      title={`About ${PRODUCT.name}`}
      subtitle="Open-source MVP monorepo documented in README.md and software-docs/MVP_APPLICATION.md—patients miss doses; caregivers need adherence and device status in one place."
    >
      <PublicAnimatedSection>
        <p className="public-body-emphasis">
          The platform combines a <strong className="text-white">logical dispensing device</strong> (represented via the
          device API in this MVP), a <strong className="text-white">React + TypeScript caregiver portal</strong>, a{' '}
          <strong className="text-white">Expo patient app</strong>, and an{' '}
          <strong className="text-white">ASP.NET Core 8 API</strong> with PostgreSQL, JWT auth, and optional webhooks.
        </p>
      </PublicAnimatedSection>

      <PublicAnimatedSection showDivider delay={0.08}>
        <div className="grid gap-5 pt-2 sm:grid-cols-3">
          {cards.map(({ icon: Icon, title: t, body }, i) => (
            <motion.div
              key={t}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.09, duration: 0.48, ease: publicEase }}
              whileHover={{ y: -6, transition: { duration: 0.22 } }}
              className="public-card-quiet group relative overflow-hidden p-5 transition-colors hover:border-teal-500/25"
            >
              <motion.div
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-teal-500/0 to-violet-600/0 opacity-0 transition-opacity duration-500 group-hover:from-teal-500/10 group-hover:to-violet-600/5 group-hover:opacity-100"
                initial={false}
              />
              <motion.div whileHover={{ rotate: [0, -6, 6, 0], scale: 1.05 }} transition={{ duration: 0.45 }}>
                <Icon className="relative mb-3 h-8 w-8 text-teal-400" />
              </motion.div>
              <h2 className="public-h3-card relative">{t}</h2>
              <p className="public-body-muted relative mt-2">{body}</p>
            </motion.div>
          ))}
        </div>
      </PublicAnimatedSection>

      <PublicAnimatedSection showDivider delay={0.06}>
        <p className="public-body-muted text-sm">
          Optional hosting: the repository includes{' '}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-zinc-300">azure/</code> Bicep and GitHub workflows (see
          root README)—you supply the Azure subscription and secrets.
        </p>
      </PublicAnimatedSection>

      <PublicAnimatedSection delay={0.04}>
        <motion.div
          className="public-callout !text-sm"
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: publicEase }}
        >
          {LIMITATION_NOTE}
        </motion.div>
      </PublicAnimatedSection>
    </PublicPageShell>
  );
}
