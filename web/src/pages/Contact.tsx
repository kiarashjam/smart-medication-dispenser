import { useState } from 'react';
import { motion } from 'motion/react';
import { Send, CheckCircle2, BookOpen } from 'lucide-react';
import PublicPageShell from '@/components/PublicPageShell';
import PublicAnimatedSection from '@/components/PublicAnimatedSection';
import { DOC_LINKS, PRODUCT } from '@/lib/productCopy';
import { publicEase } from '@/lib/publicMotion';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';

const formVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.08 },
  },
};

const fieldVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: publicEase } },
};

export default function Contact() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <PublicPageShell
      contentWidth="full"
      kicker="Reach us"
      title="Contact"
      subtitle={`This marketing site ships with ${PRODUCT.name}; it does not define a public support mailbox. Use the repository and docs for real project contact paths.`}
    >
      <div className="grid items-start gap-12 lg:grid-cols-2">
        <PublicAnimatedSection>
          <p className="public-body-emphasis">
            For setup, demo users, Docker, and API URLs, start with the root <strong className="text-white">README.md</strong>.
            For product vs documentation scope, read <strong className="text-white">{DOC_LINKS.mvpScope}</strong>. For
            webhook JSON, use <strong className="text-white">{DOC_LINKS.webhooks}</strong>.
          </p>
          <ul className="mt-8 space-y-4">
            {[
              {
                title: 'Documentation',
                body: 'software-docs/, business-docs/MVP_BUSINESS_SUMMARY.md, and INTEGRATION.md at the monorepo root.',
              },
              {
                title: 'Caregiver portal',
                body: 'After npm run dev, sign in with seed accounts from README (patient, caregiver, admin).',
              },
            ].map((row, i) => (
              <motion.li
                key={row.title}
                initial={{ opacity: 0, x: -18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ delay: 0.12 + i * 0.1, duration: 0.45, ease: publicEase }}
                whileHover={{ x: 4, transition: { duration: 0.2 } }}
                className="public-card-quiet flex gap-3 p-4 transition-colors hover:border-teal-500/25"
              >
                <motion.span
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
                >
                  <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-teal-400" />
                </motion.span>
                <div>
                  <p className="text-sm font-medium text-white">{row.title}</p>
                  <p className="public-body-muted mt-1 text-sm">{row.body}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </PublicAnimatedSection>

        <motion.div
          initial={{ opacity: 0, x: 24, rotateY: -4 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          transition={{ duration: 0.55, delay: 0.12, ease: publicEase }}
          style={{ transformStyle: 'preserve-3d' }}
          className="public-card relative overflow-hidden p-6 md:p-8"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-teal-500/10 blur-3xl" />
          <div className="relative">
            {sent ? (
              <motion.div
                className="flex flex-col items-center py-8 text-center"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45, ease: publicEase }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                >
                  <CheckCircle2 className="mb-4 h-14 w-14 text-teal-400" />
                </motion.div>
                <p className="font-display text-lg font-semibold text-white">Message recorded (demo only)</p>
                <p className="public-body-muted mx-auto mt-2 max-w-xs text-sm">
                  No backend email is wired for this form. Track requests through your own issue tracker or support
                  process when you fork the project.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-6 border-white/15 text-white hover:bg-white/5"
                  onClick={() => setSent(false)}
                >
                  Reset form
                </Button>
              </motion.div>
            ) : (
              <motion.form
                variants={formVariants}
                initial="hidden"
                animate="show"
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <motion.p variants={fieldVariants} className="public-body-muted mb-2 text-sm">
                  Placeholder form for UI only—does not send mail to the API in the MVP web app.
                </motion.p>
                <motion.div variants={fieldVariants}>
                  <Label htmlFor="contact-name" className="public-label">
                    Name
                  </Label>
                  <Input id="contact-name" required className="public-input" placeholder="Your name" />
                </motion.div>
                <motion.div variants={fieldVariants}>
                  <Label htmlFor="contact-email" className="public-label">
                    Email
                  </Label>
                  <Input
                    id="contact-email"
                    type="email"
                    required
                    className="public-input"
                    placeholder="you@organization.com"
                  />
                </motion.div>
                <motion.div variants={fieldVariants}>
                  <Label htmlFor="contact-msg" className="public-label">
                    Message
                  </Label>
                  <Textarea
                    id="contact-msg"
                    required
                    rows={4}
                    className="public-input min-h-[120px] resize-none"
                    placeholder="How can we help?"
                  />
                </motion.div>
                <motion.div variants={fieldVariants} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Button
                    type="submit"
                    className="h-12 w-full rounded-xl border-0 bg-gradient-to-r from-teal-400 to-emerald-500 font-semibold text-[#06060a] shadow-lg shadow-teal-500/25 hover:opacity-95"
                  >
                    <Send className="mr-2 inline h-4 w-4" />
                    Submit (demo)
                  </Button>
                </motion.div>
              </motion.form>
            )}
          </div>
        </motion.div>
      </div>
    </PublicPageShell>
  );
}
