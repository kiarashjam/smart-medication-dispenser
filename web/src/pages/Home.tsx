import { Link, Navigate } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'motion/react';
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
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { appPath } from '@/lib/appRoutes';
import { FEATURES_INTRO, HERO_KICKER, HERO_SUBTITLE, LIMITATION_NOTE } from '@/lib/productCopy';
import { publicEase } from '@/lib/publicMotion';

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
};

const featuresIntroParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};
const featuresIntroChild = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: publicEase } },
};
const featuresIntroRule = {
  hidden: { opacity: 0, scaleX: 0 },
  show: { opacity: 1, scaleX: 1, transition: { duration: 0.55, ease: publicEase } },
};

const trustInnerParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11, delayChildren: 0.08 } },
};
const trustInnerChild = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.48, ease: publicEase } },
};

export default function Home() {
  const { user, loading } = useAuth();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  if (!loading && user) {
    return <Navigate to={appPath()} replace />;
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 rounded-full border-2 border-teal-400/30 border-t-teal-400"
          aria-hidden
        />
      </div>
    );
  }

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 right-0 h-0.5 z-[60] origin-left bg-gradient-to-r from-teal-400 via-violet-500 to-teal-400"
        style={{ scaleX }}
      />

      {/* Hero — full width band, content inset */}
      <section className="relative w-full overflow-hidden pt-8 pb-20 md:pt-14 md:pb-28">
        <div className="w-full flex justify-center px-4 sm:px-6 lg:px-10 xl:px-14">
          <div className="w-full max-w-[min(100%,1920px)] grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="public-kicker mb-6"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {HERO_KICKER}
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.05 }}
                className="public-hero-h1"
              >
                Medication routines,
                <br />
                <span className="bg-gradient-to-r from-teal-300 via-emerald-300 to-violet-400 bg-clip-text text-transparent">
                  orchestrated beautifully.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="public-subtitle !mt-6 max-w-xl"
              >
                {HERO_SUBTITLE}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.28 }}
                className="mt-10 flex flex-wrap gap-4"
              >
                <Link to="/register">
                  <motion.span
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="public-btn-primary shadow-xl shadow-teal-500/25"
                  >
                    Start free
                    <ChevronRight className="w-5 h-5" />
                  </motion.span>
                </Link>
                <Link to="/login">
                  <motion.span
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.06)' }}
                    whileTap={{ scale: 0.98 }}
                    className="public-btn-ghost"
                  >
                    Caregiver sign in
                  </motion.span>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="mt-12 flex flex-wrap gap-8 text-sm text-zinc-500"
              >
                {['60 min missed-dose window', 'Travel mode (≤14 days)', 'Outgoing webhooks + API keys'].map((t, i) => (
                  <motion.span
                    key={t}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.55 + i * 0.1 }}
                    className="flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.8)]" />
                    {t}
                  </motion.span>
                ))}
              </motion.div>
            </div>

            {/* Hero visual */}
            <div className="relative lg:min-h-[420px] flex items-center justify-center">
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="relative w-full max-w-md aspect-square"
              >
                <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-violet-600/30 via-teal-500/20 to-transparent blur-2xl" />
                <motion.div
                  whileHover={{ rotateY: 8, rotateX: -4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="public-glass-panel relative h-full p-8 shadow-2xl"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 to-violet-600 flex items-center justify-center">
                        <Pill className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">Next dose</p>
                        <p className="text-teal-400/80 text-xs">In 2h 14m</p>
                      </div>
                    </div>
                    <motion.span
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-xs font-medium px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    >
                      On track
                    </motion.span>
                  </div>
                  <div className="space-y-3">
                    {[85, 72, 100].map((pct, i) => (
                      <motion.div
                        key={i}
                        initial={{ width: 0 }}
                        whileInView={{ width: '100%' }}
                        viewport={{ once: true }}
                        className="space-y-1.5"
                      >
                        <div className="flex justify-between text-xs text-zinc-500">
                          <span>Slot {i + 1}</span>
                          <span>{pct}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${pct}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.2 + i * 0.15, ease: 'easeOut' }}
                            className="h-full rounded-full bg-gradient-to-r from-teal-400 to-violet-500"
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="mt-8 p-4 rounded-xl border border-white/5 bg-white/[0.02] text-xs text-zinc-400 leading-relaxed"
                  >
                    Low stock job → in-app notification + optional webhook (see WEBHOOKS_JSON_REFERENCE.md).
                  </motion.div>
                </motion.div>

                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-teal-400/40"
                    style={{
                      top: `${15 + i * 12}%`,
                      left: i % 2 ? '8%' : '92%',
                    }}
                    animate={{
                      y: [0, -20, 0],
                      opacity: [0.3, 0.8, 0.3],
                    }}
                    transition={{
                      duration: 3 + i * 0.4,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="public-border-t-section public-scroll-anchor relative w-full py-20">
        <div className="w-full flex justify-center px-4 sm:px-6 lg:px-10 xl:px-14">
          <div className="w-full max-w-[min(100%,1920px)]">
            <motion.div
              className="max-w-2xl mb-14"
              variants={featuresIntroParent}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
            >
              <motion.h2 variants={featuresIntroChild} className="public-h2-section">
                Everything in one calm control surface
              </motion.h2>
              <motion.div
                variants={featuresIntroRule}
                className="public-title-rule mt-5"
                style={{ transformOrigin: 'left center' }}
              />
              <motion.p variants={featuresIntroChild} className="mt-5 text-lg text-zinc-500">
                {FEATURES_INTRO}
              </motion.p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {[
                {
                  icon: Bell,
                  title: 'Notifications',
                  desc: 'In-app list in the web portal; Expo local notifications on mobile. Missed doses (60 min without confirmation) and low stock raise events the API can also send as webhooks.',
                  accent: 'from-amber-500/20 to-orange-600/5',
                },
                {
                  icon: LineChart,
                  title: 'Adherence from events',
                  desc: 'Adherence is derived from dispense events: confirmed counts as taken; missed when the timeout job runs—aligned with the backend job described in integrations docs.',
                  accent: 'from-violet-500/20 to-fuchsia-600/5',
                },
                {
                  icon: Shield,
                  title: 'Patient, caregiver, admin',
                  desc: 'JWT-authenticated roles as implemented in the API. Single-tenant MVP: no multi-organization billing or full enterprise RBAC matrix yet.',
                  accent: 'from-teal-500/20 to-cyan-600/5',
                },
                {
                  icon: Smartphone,
                  title: 'Mobile + web surfaces',
                  desc: 'Patient app: today’s schedule, confirm intake, devices, history. Caregiver portal: dashboard, devices, containers, schedules, history, travel, integrations, settings.',
                  accent: 'from-emerald-500/20 to-teal-600/5',
                },
                {
                  icon: Zap,
                  title: 'Travel mode',
                  desc: 'Portable device type with sessions up to 14 days; containers reference source slots (copy-on-start). End travel from the portal when the patient is home.',
                  accent: 'from-yellow-500/15 to-amber-600/5',
                },
                {
                  icon: Plug,
                  title: 'Integrations (MVP)',
                  desc: 'Outgoing webhooks (no retry queue), optional HMAC signature, device API keys, and incoming webhook with optional sync—see WEBHOOKS_JSON_REFERENCE.md.',
                  accent: 'from-rose-500/20 to-red-600/5',
                },
              ].map((card, i) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.45, delay: i * 0.06 }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className="group public-feature-card"
                >
                  <div
                    className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${card.accent}`}
                  />
                  <div className="relative">
                    <div className="public-icon-tile mb-4 group-hover:scale-110 transition-transform duration-300">
                      <card.icon className="h-5 w-5" />
                    </div>
                    <h3 className="public-h3-card">{card.title}</h3>
                    <p className="public-body-muted mt-2">{card.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="public-border-t-section public-scroll-anchor w-full py-20">
        <div className="w-full flex justify-center px-4 sm:px-6 lg:px-10 xl:px-14">
          <div className="w-full max-w-[min(100%,1920px)]">
            <motion.h2
              {...fadeUp}
              transition={{ duration: 0.5 }}
              className="public-h2-section mb-16 text-center"
            >
              How it works
            </motion.h2>
            <div className="grid md:grid-cols-3 gap-8 relative">
              <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-teal-500/40 to-transparent" />
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
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  className="text-center relative"
                >
                  <motion.div
                    whileHover={{ scale: 1.08, rotate: [0, -3, 3, 0] }}
                    className="mx-auto w-24 h-24 rounded-3xl border border-teal-500/30 bg-gradient-to-br from-teal-500/10 to-violet-600/10 flex items-center justify-center font-display text-2xl font-bold text-teal-300 mb-6 shadow-lg shadow-teal-500/10"
                  >
                    {item.step}
                  </motion.div>
                  <h3 className="font-display text-xl font-semibold text-white">{item.title}</h3>
                  <p className="public-body-muted mx-auto mt-3 max-w-xs">{item.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust band */}
      <section id="trust" className="public-scroll-anchor w-full py-16">
        <div className="w-full flex justify-center px-4 sm:px-6 lg:px-10 xl:px-14">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="public-inner relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-10 shadow-xl shadow-black/20 md:p-14"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <motion.div
              className="relative flex flex-col lg:flex-row items-center justify-between gap-8"
              variants={trustInnerParent}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-40px' }}
            >
              <div className="max-w-lg text-center lg:text-left">
                <motion.h2
                  variants={trustInnerChild}
                  className="font-display text-2xl font-bold text-white md:text-3xl"
                >
                  Evaluate the MVP locally
                </motion.h2>
                <motion.p variants={trustInnerChild} className="public-body mt-3">
                  Run Docker Compose for the API + PostgreSQL, then this portal and the Expo app. Use seed demo users
                  (patient, caregiver, admin). {LIMITATION_NOTE}
                </motion.p>
              </div>
              <motion.div
                variants={trustInnerChild}
                className="flex flex-wrap gap-4 justify-center lg:justify-end"
              >
                <Link to="/register">
                  <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="public-btn-light">
                    Create account
                    <ChevronRight className="h-5 w-5" />
                  </motion.span>
                </Link>
                <Link to={appPath()}>
                  <motion.span
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="public-btn-ghost border-white/25 px-8 py-4"
                  >
                    I already have access
                  </motion.span>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
