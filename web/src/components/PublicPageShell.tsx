import { motion } from 'motion/react';
import { publicEase } from '@/lib/publicMotion';

type PublicPageShellProps = {
  title: string;
  subtitle?: string;
  kicker?: string;
  children: React.ReactNode;
  wide?: boolean;
};

export default function PublicPageShell({ title, subtitle, kicker, children, wide }: PublicPageShellProps) {
  return (
    <div className="public-page-wrap">
      <div className={wide ? 'public-inner-wide' : 'public-inner-prose'}>
        {kicker ? (
          <motion.span
            className="public-kicker inline-flex"
            initial={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.45, ease: publicEase }}
          >
            {kicker}
          </motion.span>
        ) : null}

        <motion.h1
          className={`public-h1 ${kicker ? 'mt-5' : ''}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: kicker ? 0.06 : 0, ease: publicEase }}
        >
          {title}
        </motion.h1>

        <motion.div
          className="public-title-rule"
          aria-hidden
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.65, delay: kicker ? 0.14 : 0.08, ease: publicEase }}
          style={{ transformOrigin: 'left center' }}
        />

        {subtitle ? (
          <motion.p
            className="public-subtitle"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: kicker ? 0.2 : 0.12, ease: publicEase }}
          >
            {subtitle}
          </motion.p>
        ) : null}

        <motion.div
          className="mt-10 space-y-8 md:mt-12 md:space-y-10 public-body"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: kicker ? 0.28 : 0.18 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
