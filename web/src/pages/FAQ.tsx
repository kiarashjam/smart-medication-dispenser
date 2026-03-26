import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import PublicPageShell from '@/components/PublicPageShell';
import PublicAnimatedSection from '@/components/PublicAnimatedSection';
import { DOC_LINKS, LIMITATION_NOTE, PRODUCT } from '@/lib/productCopy';
import { publicEase, publicSpring } from '@/lib/publicMotion';

const items = [
  {
    q: 'What exactly is in scope for the MVP?',
    a: `The monorepo intentionally matches ${DOC_LINKS.mvpScope}: JWT users (patient and caregiver), devices, containers, schedules, dispense/confirm/miss flow, notifications, travel sessions, and integrations (webhooks, device API keys, incoming webhook). If a long-form software doc describes something you cannot find in backend + web + mobile code, treat it as roadmap until implemented.`,
  },
  {
    q: 'Is there real hardware in the box?',
    a: 'No. The README states the physical device is represented as an API client—you exercise the device API and jobs against the cloud stack. Firmware protocol docs (e.g. 14_DEVICE_CLOUD_PROTOCOL.md) describe how a real device would connect; they are not bundled as shipped hardware in this repo.',
  },
  {
    q: 'How do missed doses and webhooks work?',
    a: 'Documentation (e.g. 08_INTEGRATIONS_WEBHOOKS.md) describes a background job: dispense events still pending after about 60 minutes can be marked missed, triggering notifications and an outgoing webhook such as notification.missed_dose. Payload shapes are in WEBHOOKS_JSON_REFERENCE.md. MVP delivery has no retry queue.',
  },
  {
    q: 'What are the demo logins?',
    a: 'Seed data (see root README) includes patient@demo.com and caregiver@demo.com with password Demo123!. Patient and caregiver get different web experiences; the patient owns devices while the caregiver sees linked patients’ hardware and adherence.',
  },
  {
    q: 'Can I use this for real PHI or HIPAA production?',
    a: 'Not without your own security review, hosting choices, BAAs, and hardening. MVP_APPLICATION.md lists items out of scope (MFA, multi-tenant orgs, full push, webhook retries, etc.). This site is for evaluation software aligned with the repository—not a compliance certification.',
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <PublicPageShell
      contentWidth="full"
      kicker="Support"
      title="FAQ"
      subtitle={`Answers tied to ${PRODUCT.name} repository docs—not generic marketing claims.`}
    >
      <PublicAnimatedSection>
        <div className="space-y-3">
          {items.map((item, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={item.q}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ delay: i * 0.06, duration: 0.45, ease: publicEase }}
                whileHover={{ scale: 1.008 }}
                className="public-card-quiet overflow-hidden transition-colors hover:border-teal-500/20"
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-medium text-white transition-colors hover:bg-white/[0.04]"
                >
                  <span className="pr-2">{item.q}</span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={publicSpring}
                    className="shrink-0 rounded-lg border border-white/10 bg-white/5 p-1"
                  >
                    <ChevronDown className="h-4 w-4 text-teal-400/90" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false} mode="sync">
                  {isOpen ? (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.34, ease: publicEase }}
                      className="overflow-hidden"
                    >
                      <motion.p
                        initial={{ y: -6 }}
                        animate={{ y: 0 }}
                        className="public-body-muted border-t border-white/5 px-5 pb-4 pt-3 text-sm leading-relaxed"
                      >
                        {item.a}
                      </motion.p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </PublicAnimatedSection>

      <PublicAnimatedSection showDivider delay={0.08}>
        <p className="public-body-muted text-sm">{LIMITATION_NOTE}</p>
      </PublicAnimatedSection>
    </PublicPageShell>
  );
}
