import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, House, Sparkles } from 'lucide-react';
import AuthAmbientBackground from '@/components/AuthAmbientBackground';
import { publicSpring } from '@/lib/publicMotion';

/**
 * Auth routes only: no marketing nav or footer — single exit to Home.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#0b0b0f] font-public text-zinc-100">
      <AuthAmbientBackground reduceMotion={reduceMotion} />

      <header className="relative z-20 shrink-0 border-b border-white/[0.06] bg-[#0b0b0f]/65 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex h-14 w-full max-w-[1920px] items-center px-4 sm:h-[3.75rem] sm:px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 260, damping: 28 }}
          >
            <Link
              to="/"
              aria-label="Back to marketing home"
              className="group relative inline-flex overflow-hidden rounded-2xl p-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b0f]"
            >
              {!reduceMotion && (
                <motion.span
                  className="pointer-events-none absolute inset-[-120%] z-0 opacity-[0.45]"
                  style={{
                    background:
                      'conic-gradient(from 0deg, rgba(45,212,191,0.55), rgba(129,140,248,0.5), rgba(20,184,166,0.15), rgba(167,139,250,0.4), rgba(45,212,191,0.55))',
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
                  aria-hidden
                />
              )}

              <motion.span
                className="relative z-[1] flex items-center gap-3 overflow-hidden rounded-[15px] border border-white/[0.09] bg-gradient-to-br from-white/[0.09] via-[#12121a]/95 to-[#0b0b0f]/98 py-1.5 pl-1.5 pr-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_8px_28px_-12px_rgba(0,0,0,0.75)] backdrop-blur-md transition-[border-color,box-shadow] duration-300 group-hover:border-teal-400/25 group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_12px_40px_-10px_rgba(45,212,191,0.22)]"
                whileHover={reduceMotion ? undefined : { scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={publicSpring}
              >
                {!reduceMotion && (
                  <>
                    <motion.span
                      className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_0%,rgba(45,212,191,0.12),transparent_55%)]"
                      animate={{ opacity: [0.5, 0.9, 0.5] }}
                      transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.span
                      className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent"
                      initial={{ x: '-120%' }}
                      animate={{ x: ['-120%', '140%'] }}
                      transition={{ duration: 3.8, repeat: Infinity, ease: 'linear', repeatDelay: 2.8 }}
                    />
                  </>
                )}

                <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/[0.12] bg-gradient-to-br from-teal-500/15 via-white/[0.06] to-violet-500/15 shadow-inner shadow-black/40 ring-1 ring-white/[0.04] transition-[border-color,box-shadow] duration-300 group-hover:border-teal-300/30 group-hover:shadow-[0_0_20px_-4px_rgba(45,212,191,0.35)]">
                  {!reduceMotion && (
                    <motion.span
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent"
                      animate={{ y: ['60%', '-60%'] }}
                      transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
                    />
                  )}
                  <House
                    className="pointer-events-none absolute h-6 w-6 text-white/[0.06]"
                    strokeWidth={1.25}
                    aria-hidden
                  />
                  <motion.span
                    className="relative flex items-center justify-center text-teal-200"
                    animate={reduceMotion ? undefined : { x: [0, -4, 0] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <ArrowLeft className="h-4 w-4 drop-shadow-[0_0_8px_rgba(45,212,191,0.35)]" strokeWidth={2.25} aria-hidden />
                  </motion.span>
                  {!reduceMotion && (
                    <motion.span
                      className="pointer-events-none absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-teal-400/90 shadow-[0_0_10px_rgba(45,212,191,0.8)]"
                      animate={{ scale: [1, 1.35, 1], opacity: [0.65, 1, 0.65] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      aria-hidden
                    />
                  )}
                </span>

                <span className="relative flex min-w-0 flex-col items-start gap-0.5">
                  <span className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold tracking-tight text-white">Home</span>
                    {!reduceMotion && (
                      <motion.span
                        className="text-amber-300/85"
                        animate={{ rotate: [0, 12, -8, 0], scale: [1, 1.08, 1] }}
                        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <Sparkles className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                      </motion.span>
                    )}
                  </span>
                  <span className="text-[10px] font-semibold uppercase leading-none tracking-[0.16em] text-zinc-500 transition-colors duration-300 group-hover:text-teal-300/75">
                    Product overview
                  </span>
                </span>

                {!reduceMotion && (
                  <motion.span
                    className="pointer-events-none absolute bottom-1.5 right-3 hidden text-[9px] font-mono text-zinc-600/90 sm:block"
                    animate={{ opacity: [0.35, 0.7, 0.35] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                    aria-hidden
                  >
                    /
                  </motion.span>
                )}
              </motion.span>
            </Link>
          </motion.div>
        </div>
      </header>

      <motion.main
        className="relative z-10 flex flex-1 flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        {children}
      </motion.main>
    </div>
  );
}
