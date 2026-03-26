import { useRef, useState, useEffect, useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
} from 'motion/react';
import {
  Pill,
  Shield,
  Bell,
  LineChart,
  Smartphone,
  Sparkles,
  Zap,
  Plug,
  ChevronRight,
  Activity,
  Layers,
  Radio,
  Wifi,
  Clock,
  Users,
  CalendarClock,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { appPath } from '@/lib/appRoutes';
import {
  FEATURES_INTRO,
  HERO_HIGHLIGHTS,
  HERO_KICKER,
  HERO_SUBTITLE_PRIMARY,
  HERO_SUBTITLE_SECONDARY,
  LIMITATION_NOTE,
} from '@/lib/productCopy';
import { publicEase, publicSpring } from '@/lib/publicMotion';

const viewportOnce = { once: true, margin: '-12% 0px -8% 0px' } as const;

const heroWordContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.055, delayChildren: 0.12 },
  },
};
const heroWord = {
  hidden: { opacity: 0, y: 36, rotateX: -42 },
  show: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.55, ease: publicEase },
  },
};

const featuresIntroParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.06 } },
};
const featuresIntroChild = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.52, ease: publicEase } },
};
const featuresIntroRule = {
  hidden: { opacity: 0, scaleX: 0 },
  show: { opacity: 1, scaleX: 1, transition: { duration: 0.6, ease: publicEase } },
};

const trustInnerParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const trustInnerChild = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: publicEase } },
};

const heroDashboardParent = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.12 },
  },
};
const heroDashboardChild = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: publicEase } },
};

const featureGridParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.085, delayChildren: 0.08 } },
};
const featureGridChild = {
  hidden: { opacity: 0, y: 44, rotateX: -6, filter: 'blur(8px)' },
  show: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.58, ease: publicEase },
  },
};

const howStepsParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.22, delayChildren: 0.08 } },
};
const howFlowIntroParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
};
const howFlowIntroChild = {
  hidden: { opacity: 0, y: 22, filter: 'blur(10px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.58, ease: publicEase },
  },
};

const howFlowCardTitle = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.48, ease: publicEase } },
};
const howFlowCardBody = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.52, ease: publicEase } },
};

const howFlowRowContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.13, delayChildren: 0.02 },
  },
};

const howFlowBadgeVar = {
  hidden: { opacity: 0, scale: 0.42, y: 22, rotate: -22 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    rotate: 0,
    transition: { type: 'spring' as const, stiffness: 400, damping: 22, mass: 0.75 },
  },
};

const MARQUEE_ITEMS = [
  '60 min missed-dose window',
  'Travel ≤14 days',
  'Outgoing webhooks',
  'Device API keys',
  'JWT roles',
  'PostgreSQL + .NET 8',
  'Expo patient app',
  'Caregiver portal',
];

function HomeSectionDivider({ reduceMotion }: { reduceMotion: boolean | null }) {
  return (
    <div className="public-section-divider-wrap" aria-hidden>
      <div className="flex justify-center px-4 py-3 sm:px-6 md:py-3.5">
        <div className="relative w-full max-w-[min(100%,1200px)]">
          <div
            className={`absolute left-1/2 top-1/2 h-16 w-[min(100%,960px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-teal-500/0 via-teal-400/40 to-violet-500/0 blur-2xl ${
              reduceMotion ? 'opacity-40' : 'animate-home-pulse-soft'
            }`}
          />
          <div className="relative mx-auto h-[2px] w-full overflow-hidden rounded-full bg-zinc-950/90 shadow-[0_0_32px_rgba(45,212,191,0.45),0_0_16px_rgba(167,139,250,0.25)] ring-1 ring-teal-400/25">
            <div
              className={`absolute inset-0 bg-[length:220%_100%] bg-gradient-to-r from-teal-500/85 via-cyan-100/95 to-violet-500/80 ${
                reduceMotion ? '' : 'animate-home-section-sweep'
              }`}
            />
            {!reduceMotion ? (
              <span className="pointer-events-none absolute inset-y-0 left-0 w-[42%] bg-gradient-to-r from-transparent via-white/55 to-transparent opacity-90 animate-home-section-shimmer" />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { user, loading } = useAuth();
  const reduceMotion = useReducedMotion();
  const [isMdUp, setIsMdUp] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 768px)').matches : false,
  );
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = () => setIsMdUp(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 28, restDelta: 0.001 });

  const heroRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroParallaxSlow = useTransform(heroProgress, [0, 1], [0, reduceMotion ? 0 : 48]);

  const howRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress: howProgress } = useScroll({
    target: howRef,
    offset: ['start 75%', 'end 35%'],
  });
  const lineScale = useTransform(howProgress, [0, 1], [0, 1]);
  const lineGlow = useTransform(howProgress, [0, 0.35, 0.75, 1], [0.15, 0.55, 0.9, 1]);

  const flowCardLeft = useMemo(
    () => ({
      hidden: reduceMotion
        ? { opacity: 0, y: 16 }
        : {
            opacity: 0,
            x: -44,
            y: 26,
            rotateY: 5,
            scale: 0.96,
            filter: 'blur(8px)',
          },
      show: {
        opacity: 1,
        x: 0,
        y: 0,
        rotateY: 0,
        scale: 1,
        filter: 'blur(0px)',
        transition: {
          duration: 0.58,
          ease: publicEase,
          staggerChildren: 0.09,
          delayChildren: 0.08,
        },
      },
    }),
    [reduceMotion],
  );
  const flowCardRight = useMemo(
    () => ({
      hidden: reduceMotion
        ? { opacity: 0, y: 16 }
        : {
            opacity: 0,
            x: 44,
            y: 26,
            rotateY: -5,
            scale: 0.96,
            filter: 'blur(8px)',
          },
      show: {
        opacity: 1,
        x: 0,
        y: 0,
        rotateY: 0,
        scale: 1,
        filter: 'blur(0px)',
        transition: {
          duration: 0.58,
          ease: publicEase,
          staggerChildren: 0.09,
          delayChildren: 0.08,
        },
      },
    }),
    [reduceMotion],
  );

  if (!loading && user) {
    return <Navigate to={appPath()} replace />;
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
          className="h-10 w-10 rounded-full border-2 border-teal-400/30 border-t-teal-400"
          aria-hidden
        />
      </div>
    );
  }

  const heroTitleWords = ['Medication', 'routines,'];

  return (
    <>
      <motion.div
        className="fixed left-0 right-0 top-0 z-[60] h-0.5 origin-left bg-teal-500/70"
        style={{ scaleX }}
      />

      {/* ── Hero: quiet backdrop + headline ── */}
      <section
        ref={heroRef}
        className="relative w-full overflow-hidden pt-4 pb-10 sm:pt-5 sm:pb-12 md:pt-8 md:pb-16"
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_0%,rgba(45,212,191,0.07),transparent_55%)]" />
          <div className="absolute -right-[25%] top-[5%] h-[min(65vw,520px)] w-[min(65vw,520px)] rounded-full bg-violet-600/6 blur-[100px]" />
        </div>

        <div className="relative z-[1] flex w-full justify-center px-4 sm:px-6 lg:px-10 xl:px-14">
          <div className="grid w-full max-w-[min(100%,1920px)] items-center gap-10 sm:gap-12 lg:grid-cols-2 lg:gap-10">
            <div className="min-w-0 perspective-[1200px]">
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: publicEase }}
                className="home-section-label mb-4"
              >
                01 — Platform overview
              </motion.p>
              <motion.div
                initial={{ opacity: 0, filter: 'blur(8px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                transition={{ duration: 0.7, ease: publicEase }}
                className="public-kicker mb-5 sm:mb-7"
              >
                <motion.span
                  animate={reduceMotion ? undefined : { rotate: [0, 12, -8, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  className="inline-flex"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                </motion.span>
                {HERO_KICKER}
              </motion.div>

              <motion.div
                className="font-display text-4xl font-bold leading-[1.06] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[3.45rem]"
                style={{ transformStyle: 'preserve-3d' }}
                variants={heroWordContainer}
                initial="hidden"
                animate="show"
              >
                {heroTitleWords.map((w) => (
                  <motion.span key={w} variants={heroWord} className="mr-[0.25em] inline-block overflow-hidden">
                    {w}
                  </motion.span>
                ))}
                <motion.span
                  initial={{ opacity: 0, y: 28, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.38, duration: 0.65, ease: publicEase }}
                  className="mt-2 block bg-gradient-to-r from-teal-200 via-emerald-300 to-violet-400 bg-clip-text text-transparent"
                >
                  orchestrated beautifully.
                </motion.span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.48, duration: 0.55, ease: publicEase }}
                className="home-prose mt-8 max-w-2xl space-y-4 border-l-2 border-teal-500/25 pl-5"
              >
                <p className="text-balance leading-relaxed text-zinc-200/95">{HERO_SUBTITLE_PRIMARY}</p>
                <p className="text-balance text-sm leading-relaxed text-zinc-400/95 sm:text-[0.9375rem]">
                  {HERO_SUBTITLE_SECONDARY}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.58, duration: 0.5 }}
                className="mt-8 flex w-full max-w-lg flex-col gap-3 sm:mt-10 sm:max-w-none sm:flex-row sm:flex-wrap sm:gap-4"
              >
                <Link to="/register" className="w-full sm:w-auto">
                  <motion.span
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={publicSpring}
                    className="public-btn-primary relative flex w-full justify-center overflow-hidden shadow-xl shadow-teal-500/30 sm:inline-flex sm:w-auto"
                  >
                    <span className="relative z-[1] inline-flex items-center gap-2">
                      Start free
                      <ChevronRight
                        className={`h-5 w-5 ${reduceMotion ? '' : 'inline-block animate-home-chevron'}`}
                        aria-hidden
                      />
                    </span>
                    {!reduceMotion && (
                      <span className="pointer-events-none absolute inset-0 animate-home-shimmer bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                    )}
                  </motion.span>
                </Link>
                <Link to="/login" className="w-full sm:w-auto">
                  <motion.span
                    whileHover={{ scale: 1.02, borderColor: 'rgba(45,212,191,0.35)' }}
                    whileTap={{ scale: 0.98 }}
                    className="public-btn-ghost flex w-full justify-center border-white/20 sm:inline-flex sm:w-auto"
                  >
                    Caregiver sign in
                  </motion.span>
                </Link>
              </motion.div>

              <motion.ul
                initial="hidden"
                animate="show"
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.09, delayChildren: 0.72 } },
                }}
                className="mt-8 flex max-w-2xl flex-col gap-4 text-sm text-zinc-300/95 sm:mt-10"
              >
                {HERO_HIGHLIGHTS.map((h, i) => (
                  <motion.li
                    key={h.title}
                    variants={{
                      hidden: { opacity: 0, x: -16 },
                      show: { opacity: 1, x: 0, transition: { duration: 0.45, ease: publicEase } },
                    }}
                    className="flex gap-3"
                  >
                    <motion.span
                      animate={reduceMotion ? undefined : { scale: [1, 1.25, 1] }}
                      transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.35 }}
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.85)]"
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-zinc-100">{h.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-zinc-500 sm:text-sm">{h.detail}</p>
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
            </div>

            {/* Hero visual — dashboard preview styled like the signed-in app (gray-50 / brand / success) */}
            <div className="relative flex min-h-0 w-full items-center justify-center py-2 sm:min-h-[420px] sm:py-4 md:min-h-[480px] lg:min-h-[560px]">
              <div className="pointer-events-none absolute inset-0 hidden overflow-visible md:block" aria-hidden>
                {[...Array(7)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full bg-gradient-to-br from-brand-400/35 to-success-400/25 shadow-[0_0_10px_rgba(79,70,229,0.12)]"
                    style={{
                      width: 4 + (i % 3),
                      height: 4 + (i % 3),
                      top: `${8 + (i * 13) % 84}%`,
                      left: i % 2 === 0 ? '2%' : '96%',
                    }}
                    animate={
                      reduceMotion
                        ? undefined
                        : {
                            y: [0, -12 - i * 2, 0],
                            opacity: [0.35, 0.95, 0.35],
                            scale: [1, 1.25, 1],
                          }
                    }
                    transition={{
                      duration: 3.5 + i * 0.4,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </div>

              <motion.div
                style={{ y: reduceMotion || !isMdUp ? 0 : heroParallaxSlow }}
                className="relative w-full max-w-md"
              >
                <motion.div
                  animate={reduceMotion || !isMdUp ? undefined : { y: [0, -10, 0] }}
                  transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative z-[2] p-1"
                >
                  <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-gray-200/35 via-brand-100/25 to-success-100/20 opacity-90 blur-2xl" />
                  <motion.div
                    whileHover={
                      isMdUp && !reduceMotion
                        ? { rotateY: 9, rotateX: -4, scale: 1.015 }
                        : undefined
                    }
                    transition={publicSpring}
                    className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 text-gray-900 shadow-2xl shadow-black/25 ring-1 ring-black/[0.04] sm:rounded-[1.35rem] sm:p-6 md:p-8"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand-50/90 blur-2xl" />
                    <div className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-success-50/80 blur-2xl" />

                    <motion.div
                      className="relative mb-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3"
                      variants={heroDashboardParent}
                      initial="hidden"
                      whileInView="show"
                      viewport={{ once: true, margin: '-40px' }}
                    >
                      <motion.div variants={heroDashboardChild} className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[10px] font-medium text-gray-700">
                          <Wifi className="h-3 w-3 text-brand-600" aria-hidden />
                          Home device · Wi‑Fi
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-[10px] text-gray-500">
                          <motion.span
                            className="h-1.5 w-1.5 rounded-full bg-success-500 shadow-[0_0_6px_rgba(13,148,136,0.55)]"
                            animate={reduceMotion ? undefined : { opacity: [1, 0.35, 1], scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            aria-hidden
                          />
                          Online
                        </span>
                      </motion.div>
                      <motion.span
                        variants={heroDashboardChild}
                        className="text-[10px] font-medium uppercase tracking-widest text-gray-500"
                      >
                        Health dashboard
                      </motion.span>
                    </motion.div>

                    <motion.div
                      className="relative mb-6 grid grid-cols-1 gap-2 min-[380px]:grid-cols-3 min-[380px]:gap-2"
                      variants={heroDashboardParent}
                      initial="hidden"
                      whileInView="show"
                      viewport={{ once: true, margin: '-40px' }}
                    >
                      {[
                        { Icon: CalendarClock, label: 'Schedules' },
                        { Icon: Users, label: 'Caregiver + patient' },
                        { Icon: Smartphone, label: 'Mobile app' },
                      ].map(({ Icon, label }) => (
                        <motion.span
                          key={label}
                          variants={heroDashboardChild}
                          whileHover={
                            isMdUp && !reduceMotion ? { scale: 1.04, y: -2 } : undefined
                          }
                          className="inline-flex w-full min-w-0 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50/80 px-2.5 py-1.5 text-[10px] font-medium text-gray-800 min-[380px]:w-auto min-[380px]:justify-start sm:text-[11px]"
                        >
                          <Icon className="h-3.5 w-3.5 text-brand-600" aria-hidden />
                          {label}
                        </motion.span>
                      ))}
                    </motion.div>

                    <motion.div
                      variants={heroDashboardParent}
                      initial="hidden"
                      whileInView="show"
                      viewport={{ once: true, margin: '-40px' }}
                      className="relative mb-6 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3.5 sm:flex-row sm:items-center sm:justify-between sm:p-4"
                    >
                      <motion.div variants={heroDashboardChild} className="flex min-w-0 items-center gap-3">
                        <motion.div
                          whileHover={{ rotate: [0, -8, 8, 0] }}
                          transition={{ duration: 0.55 }}
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 shadow-sm ring-1 ring-brand-100"
                        >
                          <Pill className="h-6 w-6 text-brand-600" aria-hidden />
                        </motion.div>
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Next dose</p>
                          <p className="text-sm font-semibold text-gray-900">Metformin</p>
                          <motion.p
                            className="mt-0.5 text-xs text-gray-600"
                            animate={reduceMotion ? undefined : { opacity: [0.75, 1, 0.75] }}
                            transition={{ duration: 2.8, repeat: Infinity }}
                          >
                            <Clock className="mr-1 inline h-3 w-3 -translate-y-px text-brand-600" aria-hidden />
                            In 2h 14m · 1 pill
                          </motion.p>
                        </div>
                      </motion.div>
                      <motion.span
                        variants={heroDashboardChild}
                        animate={reduceMotion ? undefined : { scale: [1, 1.05, 1] }}
                        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-fit shrink-0 self-start rounded-lg border border-success-200 bg-success-50 px-2.5 py-1 text-xs font-medium text-success-800 sm:self-auto"
                      >
                        On track
                      </motion.span>
                    </motion.div>

                    <motion.div
                      className="space-y-3"
                      variants={heroDashboardParent}
                      initial="hidden"
                      whileInView="show"
                      viewport={{ once: true, margin: '-40px' }}
                    >
                      {[
                        { slot: 1, pct: 85, med: 'Metformin 500mg', bar: 'bg-brand-600' as const },
                        { slot: 2, pct: 72, med: 'Aspirin 100mg', bar: 'bg-accent-600' as const },
                        { slot: 3, pct: 100, med: 'Vitamin D', bar: 'bg-success-600' as const },
                      ].map(({ slot, pct, med, bar }, i) => (
                        <motion.div key={slot} variants={heroDashboardChild} className="space-y-1.5">
                          <div className="flex flex-col gap-0.5 text-xs text-gray-600 min-[360px]:flex-row min-[360px]:justify-between min-[360px]:gap-2">
                            <span className="min-w-0 break-words font-medium text-gray-900">
                              Slot {slot}{' '}
                              <span className="font-normal text-gray-500">· {med}</span>
                            </span>
                            <span className="tabular-nums text-gray-700 min-[360px]:shrink-0">{pct}%</span>
                          </div>
                          <div className="relative h-2 overflow-hidden rounded-full bg-gray-100">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${pct}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 1.15, delay: 0.12 + i * 0.16, ease: publicEase }}
                              className={`relative h-full rounded-full ${bar}`}
                            >
                              {!reduceMotion ? (
                                <motion.span
                                  className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                                  initial={{ x: '-100%' }}
                                  animate={{ x: '350%' }}
                                  transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 0.8, ease: 'easeInOut' }}
                                />
                              ) : null}
                            </motion.div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>

                    <motion.div
                      variants={heroDashboardParent}
                      initial="hidden"
                      whileInView="show"
                      viewport={{ once: true, margin: '-40px' }}
                      className="relative mt-6 rounded-xl border border-gray-200 bg-gray-50/80 p-3 sm:p-3.5"
                    >
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                        Today&apos;s schedule
                      </p>
                      <div className="space-y-2">
                        {[
                          { time: '08:00', name: 'Morning dose', done: true },
                          { time: '14:00', name: 'Afternoon', done: false },
                          { time: '20:00', name: 'Evening', done: false },
                        ].map((row, idx) => (
                          <motion.div
                            key={row.time}
                            variants={heroDashboardChild}
                            className="flex flex-col gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-[10px] min-[400px]:flex-row min-[400px]:items-center min-[400px]:justify-between min-[400px]:gap-2 min-[400px]:px-3 sm:text-[11px]"
                          >
                            <span className="font-mono text-sm text-gray-500">{row.time}</span>
                            <span className="flex-1 truncate text-gray-900">{row.name}</span>
                            <motion.span
                              className={
                                row.done
                                  ? 'rounded-md bg-success-50 px-2 py-0.5 text-[10px] font-medium text-success-800 ring-1 ring-success-100'
                                  : 'rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] text-gray-600'
                              }
                              animate={row.done || reduceMotion ? undefined : { opacity: [0.6, 1, 0.6] }}
                              transition={{ duration: 2.5, repeat: Infinity, delay: idx * 0.3 }}
                            >
                              {row.done ? 'Done' : 'Upcoming'}
                            </motion.span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>

                    <motion.div
                      variants={heroDashboardParent}
                      initial="hidden"
                      whileInView="show"
                      viewport={{ once: true, margin: '-40px' }}
                      className="relative mt-5 grid grid-cols-1 gap-2 border-t border-gray-200 pt-5 min-[420px]:grid-cols-3"
                    >
                      {[
                        { Icon: Bell, label: 'Alerts', sub: 'Missed dose' },
                        { Icon: Smartphone, label: 'Patient', sub: 'Confirms intake' },
                        { Icon: Plug, label: 'Hooks', sub: 'Webhooks' },
                      ].map(({ Icon, label, sub }) => (
                        <motion.div
                          key={label}
                          variants={heroDashboardChild}
                          whileHover={
                            isMdUp && !reduceMotion ? { y: -4, scale: 1.03 } : undefined
                          }
                          className="flex flex-row items-center gap-3 rounded-xl border border-gray-200 bg-gray-50/90 px-3 py-2.5 text-left min-[420px]:flex-col min-[420px]:items-center min-[420px]:px-2 min-[420px]:py-3 min-[420px]:text-center"
                        >
                          <motion.div
                            whileHover={{ rotate: [0, -12, 12, 0] }}
                            transition={{ duration: 0.45 }}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-brand-100 bg-brand-50 text-brand-600 min-[420px]:mb-1.5"
                          >
                            <Icon className="h-4 w-4" aria-hidden />
                          </motion.div>
                          <div className="flex min-w-0 flex-1 flex-col min-[420px]:flex-none min-[420px]:items-center">
                            <span className="text-[10px] font-semibold text-gray-900">{label}</span>
                            <span className="mt-0.5 text-[9px] leading-tight text-gray-500">{sub}</span>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.35, duration: 0.5, ease: publicEase }}
                      className="relative mt-6 overflow-hidden rounded-xl border border-brand-200 bg-brand-50/90 p-4 text-xs leading-relaxed text-gray-700"
                    >
                      {!reduceMotion ? (
                        <motion.div
                          className="pointer-events-none absolute inset-0 rounded-xl"
                          animate={{
                            boxShadow: [
                              '0 0 0 0 rgba(79,70,229,0)',
                              '0 0 24px 0 rgba(79,70,229,0.12)',
                              '0 0 0 0 rgba(79,70,229,0)',
                            ],
                          }}
                          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                          aria-hidden
                        />
                      ) : null}
                      <span className="relative mb-1 flex items-center gap-2 font-medium text-brand-900">
                        <Activity className="h-3.5 w-3.5 text-brand-600" aria-hidden />
                        What the platform does
                      </span>
                      <p className="relative">
                        Dispense on schedule → patient confirms in the app → inventory updates. Low stock and missed
                        doses can trigger <strong className="text-gray-900">in-app alerts</strong> and optional{' '}
                        <strong className="text-gray-900">outgoing webhooks</strong> for caregivers or integrations.
                      </p>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <HomeSectionDivider reduceMotion={reduceMotion} />

      {/* ── Marquee: dual rows, opposite drift ── */}
      <section
        aria-hidden
        className="relative w-full overflow-hidden border-b border-white/[0.08] bg-[#040408] py-3"
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-28 bg-gradient-to-r from-[#040408] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-28 bg-gradient-to-l from-[#040408] to-transparent" />
        <motion.div className="mb-3 flex w-max animate-home-marquee">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((label, i) => (
            <span
              key={`a-${label}-${i}`}
              className="mx-6 inline-flex items-center gap-2 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400"
            >
              <Radio className="h-3.5 w-3.5 shrink-0 text-teal-400/80" />
              {label}
            </span>
          ))}
        </motion.div>
        <div className="flex w-max animate-home-marquee-rev opacity-70">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((label, i) => (
            <span
              key={`b-${label}-${i}`}
              className="mx-8 inline-flex items-center gap-2 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.28em] text-zinc-600"
            >
              <span className="h-1 w-1 rounded-full bg-violet-400/60" />
              {label}
            </span>
          ))}
        </div>
      </section>

      <HomeSectionDivider reduceMotion={reduceMotion} />

      {/* ── Features: bento + depth + staggered reveal ── */}
      <section
        id="features"
        className="public-scroll-anchor relative w-full scroll-mt-24 py-12 md:py-16"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-zinc-900/20 to-transparent" aria-hidden />
        <div className="relative flex w-full justify-center px-4 sm:px-6 lg:px-10 xl:px-14">
          <div className="w-full max-w-[min(100%,1920px)] rounded-[2rem] border border-white/[0.06] bg-zinc-950/30 p-5 shadow-inner shadow-black/40 backdrop-blur-[2px] md:rounded-[2.5rem] md:p-8 lg:p-10">
            <motion.div
              className="mb-10 max-w-2xl md:mb-12 lg:mb-14"
              variants={featuresIntroParent}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
            >
              <motion.div
                variants={featuresIntroChild}
                className="home-section-label mb-3"
              >
                02 — Capabilities
              </motion.div>
              <motion.div
                variants={featuresIntroChild}
                className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-violet-200/95"
              >
                <motion.span
                  animate={reduceMotion ? undefined : { rotate: [0, 360] }}
                  transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                  className="inline-flex"
                >
                  <Layers className="h-3.5 w-3.5" />
                </motion.span>
                Platform
              </motion.div>
              <motion.h2
                variants={featuresIntroChild}
                className="public-h2-section text-balance !leading-[1.15]"
              >
                Everything in one calm control surface
              </motion.h2>
              <motion.div
                variants={featuresIntroRule}
                className="public-title-rule mt-7 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-amber-400"
                style={{ transformOrigin: 'left center' }}
              />
              <motion.div variants={featuresIntroChild} className="home-prose-wide mt-8">
                <p>{FEATURES_INTRO}</p>
              </motion.div>
            </motion.div>

            <motion.div
              variants={featureGridParent}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              style={{ transformStyle: 'preserve-3d' }}
              className="grid grid-cols-1 gap-4 perspective-[1000px] md:grid-cols-12 md:gap-5"
            >
              {[
                {
                  icon: Bell,
                  title: 'Notifications',
                  desc: 'In-app list in the web portal; Expo local notifications on mobile. Missed doses (60 min without confirmation) and low stock raise events the API can also send as webhooks.',
                  span: 'md:col-span-7 min-h-[260px]',
                  shell:
                    'rounded-[2rem] border border-amber-500/25 bg-gradient-to-br from-amber-950/50 via-[#0a0a12] to-transparent p-8 shadow-[inset_0_1px_0_rgba(251,191,36,0.12)]',
                  iconBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                  hover: { y: -8, rotate: -0.5 },
                },
                {
                  icon: LineChart,
                  title: 'Adherence from events',
                  desc: 'Adherence is derived from dispense events: confirmed counts as taken; missed when the timeout job runs—aligned with the backend job described in integrations docs.',
                  span: 'md:col-span-5 min-h-[260px]',
                  shell:
                    'rounded-none border-y border-r border-l-4 border-l-fuchsia-500/60 border-white/10 bg-zinc-950/60 p-8 md:rounded-r-[2rem]',
                  iconBg: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/35',
                  hover: { x: 6 },
                },
                {
                  icon: Shield,
                  title: 'Patient, caregiver, admin',
                  desc: 'JWT-authenticated roles as implemented in the API. Single-tenant MVP: no multi-organization billing or full enterprise RBAC matrix yet.',
                  span: 'md:col-span-5 min-h-[240px]',
                  shell:
                    'rounded-3xl border border-dashed border-teal-500/35 bg-teal-950/20 p-8 backdrop-blur-sm',
                  iconBg: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
                  hover: { scale: 1.02 },
                },
                {
                  icon: Smartphone,
                  title: 'Mobile + web surfaces',
                  desc: 'Patient app: today’s schedule, confirm intake, devices, history. Caregiver portal: dashboard, devices, containers, schedules, history, travel, integrations, settings.',
                  span: 'md:col-span-7 min-h-[240px]',
                  shell:
                    'rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 ring-1 ring-inset ring-white/5',
                  iconBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
                  hover: { y: -6, boxShadow: '0 20px 50px -20px rgba(16,185,129,0.25)' },
                },
                {
                  icon: Zap,
                  title: 'Travel mode',
                  desc: 'Portable device type with sessions up to 14 days; containers reference source slots (copy-on-start). End travel from the portal when the patient is home.',
                  span: 'md:col-span-6 min-h-[220px]',
                  shell:
                    'rounded-2xl border border-yellow-500/20 bg-gradient-to-tr from-yellow-950/30 to-transparent p-7 [clip-path:polygon(0_0,100%_0,100%_calc(100%-24px),calc(100%-24px)_100%,0_100%)]',
                  iconBg: 'bg-yellow-500/15 text-yellow-200 border-yellow-500/30',
                  hover: { rotate: 0.5, y: -4 },
                },
                {
                  icon: Plug,
                  title: 'Integrations (MVP)',
                  desc: 'Outgoing webhooks (no retry queue), optional HMAC signature, device API keys, and incoming webhook with optional sync—see WEBHOOKS_JSON_REFERENCE.md.',
                  span: 'md:col-span-6 min-h-[220px]',
                  shell:
                    'rounded-3xl border border-rose-500/25 bg-rose-950/25 p-7 shadow-[0_0_40px_-20px_rgba(244,63,94,0.35)]',
                  iconBg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
                  hover: { y: -5 },
                },
              ].map((card) => (
                <motion.article
                  key={card.title}
                  variants={featureGridChild}
                  whileHover={reduceMotion ? undefined : card.hover}
                  className={`group relative overflow-hidden ${card.span} ${card.shell}`}
                >
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.06] via-transparent to-violet-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <motion.div
                    className={`relative z-[1] mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border ${card.iconBg}`}
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <card.icon className="h-5 w-5" />
                  </motion.div>
                  <h3 className="relative z-[1] font-display text-xl font-semibold tracking-tight text-white">
                    {card.title}
                  </h3>
                  <p className="relative z-[1] home-card-text mt-4">{card.desc}</p>
                  {!reduceMotion && (
                    <motion.div
                      className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/5 blur-2xl"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1, scale: 1.5 }}
                      transition={{ duration: 0.45 }}
                    />
                  )}
                </motion.article>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <HomeSectionDivider reduceMotion={reduceMotion} />

      {/* ── How it works: vertical spine + stagger cards ── */}
      <section
        ref={howRef}
        id="how"
        className="public-scroll-anchor relative w-full scroll-mt-24 py-12 md:py-16"
      >
        <motion.div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(45,212,191,0.05),transparent)]"
          aria-hidden
          animate={reduceMotion ? undefined : { opacity: [0.65, 1, 0.65] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="relative flex w-full justify-center px-4 sm:px-6 lg:px-10 xl:px-14">
          <div className="w-full max-w-[min(100%,1100px)]">
            <motion.div
              variants={howFlowIntroParent}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
            >
              <motion.div variants={howFlowIntroChild} className="mb-3 text-center home-section-label">
                03 — Flow
              </motion.div>
              <motion.div
                variants={howFlowIntroChild}
                className="mb-6 flex items-center justify-center gap-3"
              >
                <motion.span
                  animate={
                    reduceMotion
                      ? undefined
                      : {
                          scale: [1, 1.14, 1],
                          rotate: [0, 8, -5, 0],
                        }
                  }
                  transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
                  className="inline-flex rounded-full border border-teal-500/20 bg-teal-500/10 p-2 shadow-[0_0_20px_rgba(45,212,191,0.2)]"
                >
                  <Activity className="h-5 w-5 text-teal-400" aria-hidden />
                </motion.span>
                <motion.span
                  animate={reduceMotion ? undefined : { opacity: [0.75, 1, 0.75] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-xs font-bold uppercase tracking-[0.25em] text-teal-400/90"
                >
                  Flow
                </motion.span>
              </motion.div>
              <motion.h2
                variants={howFlowIntroChild}
                className="public-h2-section mx-auto mb-6 max-w-[20ch] text-balance text-center !leading-[1.12]"
              >
                How it works
              </motion.h2>
              <motion.p
                variants={howFlowIntroChild}
                className="mx-auto mb-8 max-w-lg text-center text-sm leading-relaxed text-zinc-400/95 sm:mb-10"
              >
                From device registration through schedules, dispense events, and caregiver visibility—wired to the same
                API the apps use.
              </motion.p>
            </motion.div>

            <div className="relative max-md:pl-1 md:pl-8">
              <motion.div
                className="absolute left-[18px] top-8 bottom-8 z-0 w-px max-md:block md:hidden"
                style={{
                  transformOrigin: 'top',
                  scaleY: lineScale,
                  background:
                    'linear-gradient(to bottom, rgba(45,212,191,0.55), rgba(139,92,246,0.35), rgba(192,38,211,0.2))',
                }}
              />
              <motion.div
                className="pointer-events-none absolute left-[15px] top-2 z-0 hidden w-[7px] -translate-x-1/2 rounded-full bg-teal-400/35 blur-md md:block"
                style={{
                  height: 'calc(100% - 1rem)',
                  transformOrigin: 'top',
                  scaleY: lineScale,
                  opacity: lineGlow,
                }}
              />
              <motion.div
                className="absolute left-[15px] top-2 z-[1] hidden w-px md:block"
                style={{
                  height: 'calc(100% - 1rem)',
                  transformOrigin: 'top',
                  scaleY: lineScale,
                  background:
                    'linear-gradient(to bottom, rgba(45,212,191,0.9), rgba(139,92,246,0.55), rgba(192,38,211,0.35))',
                  boxShadow: '0 0 14px rgba(45,212,191,0.35)',
                }}
              />
              <motion.div
                variants={howStepsParent}
                initial="hidden"
                whileInView="show"
                viewport={viewportOnce}
                className="relative z-[2] [perspective:1000px]"
              >
                {[
                  {
                    step: '01',
                    title: 'Devices & containers',
                    body: 'Register main (home) and portable (travel) devices, then define containers (slots) with medication metadata and inventory. In MVP, hardware talks to the cloud via the device API.',
                    Icon: Layers,
                  },
                  {
                    step: '02',
                    title: 'Schedules & dispense',
                    body: 'Per-container schedules drive dispense events. Flow: schedule → dispense → patient confirms → inventory decrements, as documented in MVP_APPLICATION.md.',
                    Icon: CalendarClock,
                  },
                  {
                    step: '03',
                    title: 'Monitor & integrate',
                    body: 'Caregivers use history, notifications, and adherence views on the web. Configure outgoing webhooks and API keys under Integrations when you need external systems in the loop.',
                    Icon: Radio,
                  },
                ].map((item, i) => {
                  const StepIcon = item.Icon;
                  const cardVariants = i % 2 === 0 ? flowCardLeft : flowCardRight;
                  return (
                    <motion.div
                      key={item.step}
                      variants={howFlowRowContainer}
                      className={`relative mb-8 flex flex-col gap-5 last:mb-0 md:mb-10 md:flex-row md:items-start ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
                    >
                      <motion.div
                        variants={howFlowBadgeVar}
                        transition={
                          reduceMotion ? { duration: 0.42, ease: publicEase } : undefined
                        }
                        className="relative z-[2] flex shrink-0 md:absolute md:left-0 md:translate-x-[-11px]"
                      >
                        {!reduceMotion && (
                          <motion.span
                            className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-teal-400/25"
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 2.8, repeat: Infinity, delay: i * 0.35, ease: 'easeOut' }}
                            aria-hidden
                          />
                        )}
                        <motion.div
                          whileHover={isMdUp ? { scale: 1.1 } : { scale: 1.05 }}
                          whileTap={{ scale: 0.94 }}
                          transition={publicSpring}
                          className="relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-teal-400/55 bg-[#06060a] shadow-[0_0_24px_rgba(45,212,191,0.45)]"
                        >
                          <span className="text-[10px] font-bold text-teal-300">{item.step}</span>
                        </motion.div>
                      </motion.div>
                      <motion.div
                        variants={cardVariants}
                        style={{ transformStyle: 'preserve-3d' }}
                        whileHover={
                          reduceMotion
                            ? undefined
                            : {
                                y: -8,
                                borderColor: 'rgba(255,255,255,0.16)',
                                boxShadow: '0 24px 48px -12px rgba(0,0,0,0.45)',
                              }
                        }
                        transition={{ duration: 0.38, ease: publicEase }}
                        className={`group relative flex-1 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.015] p-7 shadow-lg shadow-black/25 backdrop-blur-md before:pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-br before:from-teal-500/[0.06] before:via-transparent before:to-violet-500/[0.05] before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100 sm:p-8 md:max-w-[48%] ${i % 2 === 1 ? 'md:text-right' : ''}`}
                      >
                        {!reduceMotion && (
                          <motion.div
                            className="pointer-events-none absolute -right-4 -top-4 opacity-[0.14]"
                            animate={{ y: [0, -10, 0], rotate: [0, 4, 0] }}
                            transition={{
                              duration: 5.5 + i * 0.4,
                              repeat: Infinity,
                              ease: 'easeInOut',
                              delay: i * 0.2,
                            }}
                            aria-hidden
                          >
                            <StepIcon className="h-20 w-20 text-teal-300" />
                          </motion.div>
                        )}
                        <motion.h3
                          variants={howFlowCardTitle}
                          className="relative font-display text-xl font-semibold tracking-tight text-white"
                        >
                          {item.title}
                        </motion.h3>
                        <motion.p
                          variants={howFlowCardBody}
                          className="relative home-card-text mt-4 text-zinc-300/90"
                        >
                          {item.body}
                        </motion.p>
                      </motion.div>
                      <div className="hidden flex-1 md:block" />
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <HomeSectionDivider reduceMotion={reduceMotion} />

      {/* ── Trust: split panel + floating tags ── */}
      <section id="trust" className="public-scroll-anchor w-full scroll-mt-24 py-10 md:py-14">
        <div className="flex w-full justify-center px-4 sm:px-6 lg:px-10 xl:px-14">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.65, ease: publicEase }}
            className="public-inner relative overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl shadow-black/40"
          >
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewportOnce}
              className="absolute left-6 top-6 z-[2] home-section-label md:left-10 md:top-8"
            >
              04 — Try it
            </motion.p>
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/80 via-[#0a0a10] to-zinc-900/90" />

            <div className="relative grid gap-8 p-8 pt-12 md:grid-cols-2 md:gap-10 md:p-10 md:pt-14 lg:gap-12">
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/25 p-6 md:p-8">
                <div className="pointer-events-none absolute -right-4 top-0 h-40 w-40 rounded-full bg-teal-500/8 blur-3xl" />
                <motion.div
                  variants={trustInnerParent}
                  initial="hidden"
                  whileInView="show"
                  viewport={viewportOnce}
                  className="relative"
                >
                  <motion.h2
                    variants={trustInnerChild}
                    className="font-display text-2xl font-bold leading-[1.2] text-white text-balance md:text-3xl lg:text-4xl"
                  >
                    Evaluate the{' '}
                    <span
                      className={`bg-gradient-to-r from-teal-200 via-emerald-300 to-violet-400 bg-clip-text text-transparent ${reduceMotion ? '' : 'animate-home-gradient-x bg-[length:220%_auto]'}`}
                    >
                      MVP locally
                    </span>
                  </motion.h2>
                  <motion.div variants={trustInnerChild} className="home-prose mt-6">
                    <p>
                      Run Docker Compose for the API + PostgreSQL, then this portal and the Expo app. Use seed demo
                      users (patient, caregiver, admin). {LIMITATION_NOTE}
                    </p>
                  </motion.div>
                </motion.div>
              </div>

              <motion.div
                variants={trustInnerParent}
                initial="hidden"
                whileInView="show"
                viewport={viewportOnce}
                className="flex flex-col items-center justify-center gap-5"
              >
                <motion.div variants={trustInnerChild} className="w-full max-w-sm space-y-4">
                  <Link to="/register" className="block w-full">
                    <motion.span
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="public-btn-light flex w-full items-center justify-center gap-2"
                    >
                      Create account
                      <ChevronRight
                        className={`h-5 w-5 ${reduceMotion ? '' : 'inline-block animate-home-chevron'}`}
                        aria-hidden
                      />
                    </motion.span>
                  </Link>
                  <Link to={appPath()} className="block w-full">
                    <motion.span
                      whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.06)' }}
                      whileTap={{ scale: 0.98 }}
                      className="public-btn-ghost flex w-full items-center justify-center border-white/20 px-8 py-4"
                    >
                      I already have access
                    </motion.span>
                  </Link>
                </motion.div>
                <motion.p
                  variants={trustInnerChild}
                  className="text-center text-xs leading-relaxed text-zinc-500"
                >
                  Same stack you can deploy to Azure via repo workflows.
                </motion.p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
