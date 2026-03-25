import { motion } from 'motion/react';
import { publicEase } from '@/lib/publicMotion';

type PublicAnimatedSectionProps = {
  children: React.ReactNode;
  className?: string;
  /** Stagger relative to siblings (seconds) */
  delay?: number;
  /** Gradient line that draws in above content */
  showDivider?: boolean;
  /** Larger motion offset for hero-style blocks */
  yOffset?: number;
};

/**
 * Scroll-reveal wrapper for public inner pages — use between major blocks for consistent motion.
 */
export default function PublicAnimatedSection({
  children,
  className = '',
  delay = 0,
  showDivider,
  yOffset = 26,
}: PublicAnimatedSectionProps) {
  return (
    <div className="relative">
      {showDivider ? (
        <motion.div
          aria-hidden
          className="mb-8 h-px w-full max-w-lg bg-gradient-to-r from-teal-500/45 via-violet-500/35 to-transparent"
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          style={{ transformOrigin: 'left center' }}
          transition={{ duration: 0.65, delay: Math.max(0, delay - 0.05), ease: publicEase }}
        />
      ) : null}
      <motion.div
        initial={{ opacity: 0, y: yOffset }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
        transition={{ duration: 0.52, delay, ease: publicEase }}
        className={className}
      >
        {children}
      </motion.div>
    </div>
  );
}
