import { useRef } from 'react';
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
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { appPath } from '@/lib/appRoutes';
import { FEATURES_INTRO, HERO_KICKER, HERO_SUBTITLE, LIMITATION_NOTE } from '@/lib/productCopy';
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
  show: { transition: { staggerChildren: 0.18, delayChildren: 0.06 } },
};
const howStepRow = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: publicEase } },
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

export default function Home() {
  const { user, loading } = useAuth();
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 28, restDelta: 0.001 });

  const heroRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroParallaxSlow = useTransform(heroProgress, [0, 1], [0, reduceMotion ? 0 : 90]);
  const heroParallaxFast = useTransform(heroProgress, [0, 1], [0, reduceMotion ? 0 : 140]);
  const heroOpacity = useTransform(heroProgress, [0, 0.55, 1], [1, 1, 0.35]);

  const howRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress: howProgress } = useScroll({
    target: howRef,
    offset: ['start 75%', 'end 35%'],
  });
  const lineScale = useTransform(howProgress, [0, 1], [0, 1]);

  const featuresRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress: featuresProgress } = useScroll({
    target: featuresRef,
    offset: ['start end', 'end start'],
  });
  const featuresBgY = useTransform(featuresProgress, [0, 1], [0, reduceMotion ? 0 : -48]);

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
        className="fixed left-0 right-0 top-0 z-[60] h-0.5 origin-left bg-gradient-to-r from-teal-400 via-fuchsia-500 to-amber-400"
        style={{ scaleX }}
      />

      {/* ── Hero: aurora mesh + parallax orbs + 3D headline ── */}
      <section
        ref={heroRef}
        className="relative w-full overflow-hidden pt-6 pb-24 md:pt-12 md:pb-32"
      >
        <div className="pointer-events-none absolute inset-0">
          <div
            className={`absolute inset-0 opacity-[0.4] ${reduceMotion ? '' : 'animate-home-grid-drift'}`}
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)
              `,
              backgroundSize: '48px 48px',
            }}
          />
          <motion.div
            style={{ y: heroParallaxSlow, opacity: heroOpacity }}
            className="absolute -left-1/4 top-0 h-[min(90vw,720px)] w-[min(90vw,720px)] rounded-full bg-teal-500/25 blur-[100px]"
          />
          <motion.div
            style={{ y: heroParallaxFast, opacity: heroOpacity }}
            className="absolute -right-1/4 top-1/4 h-[min(85vw,640px)] w-[min(85vw,640px)] rounded-full bg-violet-600/20 blur-[110px]"
          />
          <motion.div
            animate={
              reduceMotion
                ? undefined
                : { scale: [1, 1.08, 1], opacity: [0.15, 0.28, 0.15] }
            }
            transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-fuchsia-500/15 blur-[90px]"
          />
          <div className="absolute right-[8%] top-[18%] h-72 w-72 animate-home-spin-slow rounded-full border border-white/[0.06] opacity-40" />
          <div className="absolute bottom-[10%] left-[12%] h-48 w-48 animate-home-pulse-soft rounded-full border border-teal-400/20" />
        </div>

        <div className="relative z-[1] flex w-full justify-center px-4 sm:px-6 lg:px-10 xl:px-14">
          <div className="grid w-full max-w-[min(100%,1920px)] items-center gap-14 lg:grid-cols-2 lg:gap-10">
            <div className="perspective-[1200px]">
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: publicEase }}
                className="home-section-label mb-4"
              >
                01 — Overview
              </motion.p>
              <motion.div
                initial={{ opacity: 0, filter: 'blur(8px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                transition={{ duration: 0.7, ease: publicEase }}
                className="public-kicker mb-7"
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
                className="home-prose mt-8 border-l-2 border-teal-500/25 pl-5"
              >
                <p className="text-balance">{HERO_SUBTITLE}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.58, duration: 0.5 }}
                className="mt-10 flex flex-wrap gap-4"
              >
                <Link to="/register">
                  <motion.span
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={publicSpring}
                    className="public-btn-primary relative overflow-hidden shadow-xl shadow-teal-500/30"
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
                <Link to="/login">
                  <motion.span
                    whileHover={{ scale: 1.02, borderColor: 'rgba(45,212,191,0.35)' }}
                    whileTap={{ scale: 0.98 }}
                    className="public-btn-ghost border-white/20"
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
                className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-sm text-zinc-400/95"
              >
                {['60 min missed-dose window', 'Travel mode (≤14 days)', 'Outgoing webhooks + API keys'].map(
                  (t, i) => (
                    <motion.li
                      key={t}
                      variants={{
                        hidden: { opacity: 0, x: -16 },
                        show: { opacity: 1, x: 0, transition: { duration: 0.45, ease: publicEase } },
                      }}
                      className="flex items-center gap-2"
                    >
                      <motion.span
                        animate={reduceMotion ? undefined : { scale: [1, 1.25, 1] }}
                        transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.35 }}
                        className="h-1.5 w-1.5 rounded-full bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.85)]"
                      />
                      {t}
                    </motion.li>
                  ),
                )}
              </motion.ul>
            </div>

            {/* Hero visual — glass stack + orbit rings */}
            <div className="relative flex min-h-[400px] items-center justify-center lg:min-h-[460px]">
              <motion.div
                style={{ y: reduceMotion ? 0 : heroParallaxSlow }}
                className="relative aspect-square w-full max-w-md"
              >
                <motion.div
                  animate={reduceMotion ? undefined : { y: [0, -14, 0] }}
                  transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative z-[2] h-full p-1"
                >
                  <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-teal-400/40 via-violet-500/25 to-fuchsia-500/20 opacity-80 blur-2xl" />
                  <motion.div
                    whileHover={{ rotateY: 10, rotateX: -5, scale: 1.02 }}
                    transition={publicSpring}
                    className="public-glass-panel relative h-full overflow-hidden p-8 shadow-2xl"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <motion.div
                      className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-teal-400/20 blur-2xl"
                      animate={reduceMotion ? undefined : { opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    />
                    <div className="relative mb-8 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <motion.div
                          whileHover={{ rotate: [0, -6, 6, 0] }}
                          transition={{ duration: 0.5 }}
                          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-violet-600"
                        >
                          <Pill className="h-6 w-6 text-white" />
                        </motion.div>
                        <div>
                          <p className="text-sm font-semibold text-white">Next dose</p>
                          <p className="text-xs text-teal-400/85">In 2h 14m</p>
                        </div>
                      </div>
                      <motion.span
                        animate={reduceMotion ? undefined : { scale: [1, 1.06, 1] }}
                        transition={{ duration: 2.2, repeat: Infinity }}
                        className="rounded-lg border border-emerald-500/35 bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-300"
                      >
                        On track
                      </motion.span>
                    </div>
                    <div className="space-y-3">
                      {[85, 72, 100].map((pct, i) => (
                        <div key={i} className="space-y-1.5">
                          <div className="flex justify-between text-xs text-zinc-400/90">
                            <span>Slot {i + 1}</span>
                            <span>{pct}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-white/5">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${pct}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 1.1, delay: 0.15 + i * 0.18, ease: publicEase }}
                              className="h-full rounded-full bg-gradient-to-r from-teal-400 via-emerald-400 to-violet-500"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      animate={reduceMotion ? undefined : { boxShadow: ['0 0 0 0 rgba(45,212,191,0)', '0 0 24px 0 rgba(45,212,191,0.12)', '0 0 0 0 rgba(45,212,191,0)'] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs leading-relaxed text-zinc-300/85"
                    >
                      Low stock job → in-app notification + optional webhook (see WEBHOOKS_JSON_REFERENCE.md).
                    </motion.div>
                  </motion.div>
                </motion.div>

                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full bg-gradient-to-br from-teal-400/50 to-violet-500/30"
                    style={{
                      width: 5 + (i % 3),
                      height: 5 + (i % 3),
                      top: `${10 + (i * 11) % 80}%`,
                      left: i % 2 === 0 ? '4%' : '94%',
                    }}
                    animate={
                      reduceMotion
                        ? undefined
                        : {
                            y: [0, -18 - i * 2, 0],
                            opacity: [0.25, 0.85, 0.25],
                            scale: [1, 1.2, 1],
                          }
                    }
                    transition={{
                      duration: 3.2 + i * 0.35,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Marquee: dual rows, opposite drift ── */}
      <section
        aria-hidden
        className="relative w-full overflow-hidden border-y border-white/[0.08] bg-[#040408] py-4"
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-28 bg-gradient-to-r from-[#040408] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-28 bg-gradient-to-l from-[#040408] to-transparent" />
        <motion.div
          className="mb-3 flex w-max animate-home-marquee"
          animate={reduceMotion ? undefined : { opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
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

      {/* ── Features: bento + depth + staggered reveal ── */}
      <section
        ref={featuresRef}
        id="features"
        className="public-scroll-anchor relative w-full scroll-mt-24 py-20 md:py-32"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/25 to-teal-950/10" />
        <motion.div
          style={{ y: featuresBgY }}
          className="pointer-events-none absolute left-[-20%] top-1/4 h-[min(70vw,520px)] w-[min(70vw,520px)] rounded-full bg-violet-600/12 blur-[100px]"
          aria-hidden
        />
        <motion.div
          animate={
            reduceMotion
              ? undefined
              : { y: [0, -20, 0], x: [0, 12, 0], scale: [1, 1.05, 1] }
          }
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute bottom-[15%] right-[-10%] h-64 w-64 rounded-full bg-teal-500/10 blur-[80px]"
          aria-hidden
        />
        <div className="relative flex w-full justify-center px-4 sm:px-6 lg:px-10 xl:px-14">
          <div className="w-full max-w-[min(100%,1920px)] rounded-[2rem] border border-white/[0.06] bg-zinc-950/30 p-6 shadow-inner shadow-black/40 backdrop-blur-[2px] md:rounded-[2.5rem] md:p-10 lg:p-12">
            <motion.div
              className="mb-14 max-w-2xl md:mb-16 lg:mb-20"
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

      {/* ── How it works: vertical spine + stagger cards ── */}
      <section
        ref={howRef}
        id="how"
        className="public-scroll-anchor relative w-full scroll-mt-24 border-t border-white/10 py-20 md:py-28"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(45,212,191,0.12),transparent)]" />
        <div className="relative flex w-full justify-center px-4 sm:px-6 lg:px-10 xl:px-14">
          <div className="w-full max-w-[min(100%,1100px)]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewportOnce}
              transition={{ duration: 0.5, ease: publicEase }}
              className="mb-3 text-center home-section-label"
            >
              03 — Flow
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewportOnce}
              transition={{ duration: 0.5, delay: 0.04, ease: publicEase }}
              className="mb-6 flex items-center justify-center gap-3"
            >
              <motion.span
                animate={reduceMotion ? undefined : { scale: [1, 1.15, 1] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                className="inline-flex"
              >
                <Activity className="h-5 w-5 text-teal-400" />
              </motion.span>
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-teal-400/90">Flow</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewportOnce}
              transition={{ duration: 0.55, delay: 0.05 }}
              className="public-h2-section mx-auto mb-6 max-w-[20ch] text-balance text-center !leading-[1.12]"
            >
              How it works
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={viewportOnce}
              transition={{ delay: 0.12, duration: 0.45 }}
              className="mx-auto mb-16 max-w-lg text-center text-sm leading-relaxed text-zinc-400/95"
            >
              From device registration through schedules, dispense events, and caregiver visibility—wired to the same
              API the apps use.
            </motion.p>

            <div className="relative md:pl-8">
              <motion.div
                className="absolute left-[15px] top-2 hidden w-px bg-gradient-to-b from-teal-400/80 via-violet-500/50 to-fuchsia-500/30 md:block"
                style={{
                  height: 'calc(100% - 1rem)',
                  transformOrigin: 'top',
                  scaleY: lineScale,
                }}
              />
              <motion.div
                variants={howStepsParent}
                initial="hidden"
                whileInView="show"
                viewport={viewportOnce}
              >
              {[
                {
                  step: '01',
                  title: 'Devices & containers',
                  body: 'Register main (home) and portable (travel) devices, then define containers (slots) with medication metadata and inventory. In MVP, hardware talks to the cloud via the device API.',
                },
                {
                  step: '02',
                  title: 'Schedules & dispense',
                  body: 'Per-container schedules drive dispense events. Flow: schedule → dispense → patient confirms → inventory decrements, as documented in MVP_APPLICATION.md.',
                },
                {
                  step: '03',
                  title: 'Monitor & integrate',
                  body: 'Caregivers use history, notifications, and adherence views on the web. Configure outgoing webhooks and API keys under Integrations when you need external systems in the loop.',
                },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  variants={howStepRow}
                  className={`relative mb-12 flex flex-col gap-6 last:mb-0 md:mb-16 md:flex-row md:items-start ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
                >
                  <div className="relative z-[2] flex shrink-0 md:absolute md:left-0 md:translate-x-[-11px]">
                    {!reduceMotion && (
                      <motion.span
                        className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-teal-400/20"
                        animate={{ scale: [1, 1.45, 1], opacity: [0.4, 0, 0.4] }}
                        transition={{ duration: 3.2, repeat: Infinity, delay: i * 0.4, ease: 'easeOut' }}
                        aria-hidden
                      />
                    )}
                    <motion.div
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.96 }}
                      transition={publicSpring}
                      className="relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-teal-400/55 bg-[#06060a] shadow-[0_0_24px_rgba(45,212,191,0.4)]"
                    >
                      <span className="text-[10px] font-bold text-teal-300">{item.step}</span>
                    </motion.div>
                  </div>
                  <motion.div
                    whileHover={reduceMotion ? undefined : { y: -6, borderColor: 'rgba(255,255,255,0.14)' }}
                    transition={{ duration: 0.35, ease: publicEase }}
                    className={`flex-1 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-8 shadow-lg shadow-black/20 backdrop-blur-md md:max-w-[48%] ${i % 2 === 1 ? 'md:text-right' : ''}`}
                  >
                    <h3 className="font-display text-xl font-semibold tracking-tight text-white">{item.title}</h3>
                    <p className="home-card-text mt-4 text-zinc-300/90">{item.body}</p>
                  </motion.div>
                  <div className="hidden flex-1 md:block" />
                </motion.div>
              ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust: split panel + floating tags ── */}
      <section id="trust" className="public-scroll-anchor w-full scroll-mt-24 pb-20 pt-8 md:pb-32">
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
              className="absolute left-8 top-8 z-[2] home-section-label md:left-12 md:top-10"
            >
              04 — Try it
            </motion.p>
            <div className="absolute inset-0 bg-gradient-to-br from-teal-950/40 via-[#070712] to-fuchsia-950/35" />
            <div
              className="absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
                backgroundSize: '28px 28px',
              }}
            />
            {!reduceMotion && (
              <>
                <motion.span
                  animate={{ y: [0, -10, 0], x: [0, 4, 0] }}
                  transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                  className="pointer-events-none absolute left-[8%] top-[12%] rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-medium text-zinc-400 backdrop-blur-sm"
                >
                  Docker Compose
                </motion.span>
                <motion.span
                  animate={{ y: [0, 12, 0], x: [0, -6, 0] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="pointer-events-none absolute right-[10%] top-[20%] rounded-full border border-teal-500/25 bg-teal-500/10 px-3 py-1 text-[10px] font-medium text-teal-300/90 backdrop-blur-sm"
                >
                  .NET 8 API
                </motion.span>
                <motion.span
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  className="pointer-events-none absolute bottom-[18%] left-[15%] rounded-full border border-violet-500/25 bg-violet-500/10 px-3 py-1 text-[10px] font-medium text-violet-200/90 backdrop-blur-sm"
                >
                  Seed demo users
                </motion.span>
              </>
            )}

            <div className="relative grid gap-10 p-10 pt-16 md:grid-cols-2 md:gap-12 md:p-14 md:pt-20 lg:gap-16">
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-8 md:p-10">
                <motion.div
                  className="absolute -right-4 top-0 h-40 w-40 rounded-full bg-gradient-to-br from-teal-500/20 to-transparent blur-3xl"
                  animate={reduceMotion ? undefined : { scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
                  transition={{ duration: 6, repeat: Infinity }}
                />
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
