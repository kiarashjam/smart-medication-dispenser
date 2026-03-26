import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { publicEase } from '@/lib/publicMotion';

const formInputClass =
  'mt-2 h-11 w-full rounded-xl border border-gray-200 bg-gray-50/90 px-3.5 text-sm text-gray-900 shadow-sm transition-[border-color,box-shadow] placeholder:text-gray-400 focus-visible:border-brand-500/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/20';

const formLabelClass = 'text-sm font-medium text-gray-800';

type AuthPageSplitProps = {
  aside: ReactNode;
  children: ReactNode;
  /** Visual accent for aside glow */
  accent?: 'teal' | 'violet';
};

/**
 * Large screens: brand panel + light form. Small screens: form only (full width).
 */
export default function AuthPageSplit({ aside, children, accent = 'teal' }: AuthPageSplitProps) {
  const reduceMotion = useReducedMotion();
  const off = !!reduceMotion;

  return (
    <motion.div
      className="flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-10 lg:py-12"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: publicEase }}
    >
      <motion.div
        className="relative w-full max-w-[1100px] overflow-hidden rounded-2xl border border-white/10 bg-white shadow-[0_24px_80px_-20px_rgba(0,0,0,0.55)] lg:flex lg:min-h-[min(620px,calc(100dvh-7rem))] lg:rounded-3xl"
        initial={off ? false : { scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 26, delay: 0.06 }}
      >
        {!off && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-[1] rounded-2xl lg:rounded-3xl"
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(45,212,191,0)',
                '0 0 50px 0 rgba(45,212,191,0.12)',
                '0 0 0 0 rgba(45,212,191,0)',
              ],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        <aside className="relative hidden w-[44%] shrink-0 flex-col justify-between overflow-hidden bg-gradient-to-br from-gray-950 via-[#1e1b4b] to-gray-950 p-10 text-white lg:flex xl:p-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_0%,rgba(45,212,191,0.14),transparent_50%)]" />
          <div
            className={`pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full blur-3xl ${
              accent === 'violet' ? 'bg-violet-600/25' : 'bg-brand-600/25'
            }`}
          />
          {!off && (
            <>
              <motion.div
                className="pointer-events-none absolute -left-20 top-1/4 h-40 w-40 rounded-full border border-teal-400/20"
                animate={{ rotate: 360, scale: [1, 1.08, 1] }}
                transition={{ rotate: { duration: 32, repeat: Infinity, ease: 'linear' }, scale: { duration: 5, repeat: Infinity } }}
              />
              <motion.div
                className="pointer-events-none absolute right-8 top-8 h-24 w-24 rounded-full border border-violet-400/15"
                animate={{ rotate: -360 }}
                transition={{ duration: 48, repeat: Infinity, ease: 'linear' }}
              />
            </>
          )}
          <motion.div
            className="relative z-[2]"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.5, ease: publicEase }}
          >
            {aside}
          </motion.div>
        </aside>

        <div className="relative flex flex-1 flex-col justify-center overflow-hidden bg-white px-6 py-10 sm:px-10 sm:py-12 lg:px-12 lg:py-14">
          {!off && (
            <>
              <motion.div
                className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-brand-100/90 to-teal-100/50 blur-3xl"
                animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.85, 0.5] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="pointer-events-none absolute bottom-0 left-0 h-32 w-full bg-gradient-to-t from-brand-50/40 to-transparent"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              />
            </>
          )}
          <motion.div
            className="relative z-[2]"
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12, duration: 0.55, type: 'spring', stiffness: 220, damping: 28 }}
          >
            {children}
          </motion.div>

          {!off && (
            <motion.div
              className="pointer-events-none absolute bottom-6 right-6 h-20 w-20 rounded-2xl border border-brand-200/40 bg-gradient-to-tr from-brand-500/5 to-transparent"
              animate={{ y: [0, -8, 0], rotate: [0, 4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export { formInputClass, formLabelClass };
