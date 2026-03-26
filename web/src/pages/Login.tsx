import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { useAuth } from '@/contexts/AuthContext';
import { appPath } from '@/lib/appRoutes';
import { PRODUCT } from '@/lib/productCopy';
import { publicEase, publicSpring } from '@/lib/publicMotion';
import { Pill, Loader2, Check, Shield, LayoutDashboard, Sparkles, Terminal, BookOpen, KeyRound } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import AuthPageSplit, { formInputClass, formLabelClass } from '@/components/AuthPageSplit';

const formVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const fieldVariants = {
  hidden: { opacity: 0, x: -28, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.45, ease: publicEase },
  },
};

const asidePoints = [
  'Dashboard, devices, schedules, and adherence in one caregiver workspace.',
  'Same API and roles as the patient mobile app—JWT-secured, documented in-repo.',
  'Webhook-friendly for missed doses, low stock, and confirmations when you enable integrations.',
];

const asideContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.08 } },
};
const asideItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: publicEase } },
};

const demoAccounts = [
  { role: 'Caregiver', email: 'caregiver@demo.com', accent: 'from-teal-500 to-emerald-600' },
  { role: 'Patient', email: 'patient@demo.com', accent: 'from-brand-500 to-cyan-600' },
] as const;

export default function Login() {
  const reduceMotion = useReducedMotion();
  const off = !!reduceMotion;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(appPath());
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string; detail?: string } | string }; message?: string };
      const raw = ax?.response?.data;
      const msg =
        (typeof raw === 'object' && raw && 'message' in raw && raw.message) ||
        (typeof raw === 'object' && raw && 'detail' in raw && raw.detail) ||
        (typeof raw === 'string' ? raw : null) ||
        ax?.message ||
        'Failed to login';
      setError(typeof msg === 'string' ? msg : 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageSplit
      accent="teal"
      aside={
        <motion.div variants={asideContainer} initial="hidden" animate="show" className="flex min-h-full flex-col">
          <motion.div variants={asideItem} className="flex items-center gap-3">
            <motion.div
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15"
              whileHover={off ? undefined : { scale: 1.08, rotate: [0, -6, 6, 0] }}
              animate={
                off
                  ? undefined
                  : {
                      boxShadow: [
                        '0 0 0 0 rgba(45,212,191,0)',
                        '0 0 28px 0 rgba(45,212,191,0.25)',
                        '0 0 0 0 rgba(45,212,191,0)',
                      ],
                    }
              }
              transition={
                off
                  ? publicSpring
                  : { ...publicSpring, boxShadow: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }
              }
            >
              <motion.span animate={off ? undefined : { y: [0, -3, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>
                <Pill className="h-5 w-5 text-teal-300" aria-hidden />
              </motion.span>
            </motion.div>
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-200/80">
                {!off && (
                  <motion.span
                    animate={{ rotate: [0, 15, -10, 0], scale: [1, 1.2, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Sparkles className="h-3 w-3 text-amber-300/90" aria-hidden />
                  </motion.span>
                )}
                Caregiver portal
              </p>
              <p className="font-display text-lg font-bold text-white">{PRODUCT.nameLine1}</p>
            </div>
          </motion.div>

          <motion.div variants={asideItem} className="mt-12 space-y-6">
            <motion.h2
              className="font-display text-3xl font-bold leading-[1.15] tracking-tight text-white xl:text-[2rem]"
              animate={off ? undefined : { opacity: [0.92, 1, 0.92] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              Sign in to manage dosing and devices
            </motion.h2>
            <p className="text-sm leading-relaxed text-zinc-400">
              Use the account your organization created, or seed demo users from the repository README for local
              evaluation.
            </p>
            <ul className="space-y-4 pt-2">
              {asidePoints.map((text, i) => (
                <motion.li
                  key={text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.12, duration: 0.45, ease: publicEase }}
                  whileHover={off ? undefined : { x: 6, transition: { duration: 0.2 } }}
                  className="flex gap-3 text-sm leading-relaxed text-zinc-300"
                >
                  <motion.span
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-500/20 text-teal-300"
                    animate={off ? undefined : { scale: [1, 1.15, 1] }}
                    transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.4 }}
                  >
                    <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden />
                  </motion.span>
                  {text}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            variants={asideItem}
            className="mt-12 flex items-center gap-3 border-t border-white/10 pt-8 text-xs text-zinc-500"
          >
            <motion.span animate={off ? undefined : { rotate: [0, 8, -8, 0] }} transition={{ duration: 5, repeat: Infinity }}>
              <Shield className="h-4 w-4 shrink-0 text-zinc-600" aria-hidden />
            </motion.span>
            <span>HTTPS in production; passwords handled per your API deployment.</span>
          </motion.div>
        </motion.div>
      }
    >
      <div className="mx-auto w-full max-w-[400px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className="mb-8 flex justify-center lg:justify-start"
        >
          <motion.div
            className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-teal-600 shadow-lg shadow-brand-600/35"
            whileHover={off ? undefined : { scale: 1.06, rotate: [0, -4, 4, 0] }}
            animate={off ? undefined : { y: [0, -6, 0] }}
            transition={
              off
                ? publicSpring
                : { ...publicSpring, y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' } }
            }
          >
            {!off && (
              <motion.span
                className="pointer-events-none absolute inset-0 rounded-2xl bg-white/20"
                animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.05, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
            )}
            <LayoutDashboard className="relative h-7 w-7 text-white" aria-hidden />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.45, ease: publicEase }}
        >
          <motion.p
            className="text-xs font-semibold uppercase tracking-widest text-brand-600"
            animate={off ? undefined : { letterSpacing: ['0.22em', '0.28em', '0.22em'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            Account
          </motion.p>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Welcome back</h1>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            Enter your email and password to open the caregiver portal.
          </p>
        </motion.div>

        <motion.form
          variants={formVariants}
          initial="hidden"
          animate="show"
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >
          <motion.div variants={fieldVariants}>
            <Label htmlFor="email" className={formLabelClass}>
              Email
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@organization.com"
              className={formInputClass}
              required
            />
          </motion.div>

          <motion.div variants={fieldVariants}>
            <Label htmlFor="password" className={formLabelClass}>
              Password
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={formInputClass}
              required
            />
          </motion.div>

          {error ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={publicSpring}
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              role="alert"
            >
              {error}
            </motion.div>
          ) : null}

          <motion.div variants={fieldVariants}>
            <motion.div whileHover={off ? undefined : { scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={publicSpring}>
              <Button
                type="submit"
                disabled={loading}
                className="relative h-12 w-full overflow-hidden rounded-xl border-0 bg-gradient-to-r from-brand-600 via-brand-500 to-teal-600 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 transition-shadow hover:shadow-xl hover:shadow-brand-600/40 disabled:opacity-60"
              >
                {!off && !loading && (
                  <motion.span
                    className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.2, ease: 'easeInOut' }}
                  />
                )}
                <span className="relative z-[1]">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 inline h-4 w-4 animate-spin" aria-hidden />
                      Signing in…
                    </>
                  ) : (
                    'Sign in'
                  )}
                </span>
              </Button>
            </motion.div>
          </motion.div>
        </motion.form>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5, ease: publicEase }}
          className="mt-8 space-y-6 border-t border-gray-100 pt-8"
        >
          <p className="text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <motion.span whileHover={{ scale: 1.05 }} className="inline-block">
              <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
                Create one
              </Link>
            </motion.span>
          </p>

          <motion.div
            className="group relative overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-[0_1px_0_rgba(0,0,0,0.04),0_12px_40px_-24px_rgba(15,118,110,0.35)] ring-1 ring-black/[0.03]"
            whileHover={
              off
                ? undefined
                : {
                    y: -2,
                    boxShadow:
                      '0 1px 0 rgba(0,0,0,0.04), 0 20px 50px -20px rgba(20,184,166,0.35), 0 0 0 1px rgba(45,212,191,0.12)',
                  }
            }
            transition={publicSpring}
          >
            <div
              className="pointer-events-none absolute -left-px top-4 bottom-4 w-1 rounded-full bg-gradient-to-b from-brand-500 via-teal-500 to-cyan-500 opacity-90"
              aria-hidden
            />
            {!off && (
              <>
                <motion.div
                  className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-teal-400/15 blur-3xl"
                  animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.55, 0.35] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                  className="pointer-events-none absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-brand-400/12 blur-3xl"
                  animate={{ scale: [1, 1.12, 1], opacity: [0.25, 0.45, 0.25] }}
                  transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                />
                <motion.div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-r from-brand-500/0 via-teal-500/[0.07] to-cyan-500/0"
                  animate={{ x: ['-60%', '160%'] }}
                  transition={{ duration: 5.5, repeat: Infinity, ease: 'linear', repeatDelay: 2.5 }}
                />
              </>
            )}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.03)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:linear-gradient(to_bottom,black_40%,transparent)] pointer-events-none" aria-hidden />

            <div className="relative border-b border-gray-100/90 bg-gradient-to-br from-slate-50/95 via-white to-teal-50/30 px-4 pb-4 pt-4 sm:px-5 sm:pt-5">
              <div className="flex items-start gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-lg shadow-slate-900/25 ring-1 ring-white/10">
                  <Terminal className="h-5 w-5 text-teal-300" strokeWidth={2} aria-hidden />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold tracking-tight text-gray-900">Local demo access</p>
                    <span className="inline-flex items-center gap-1 rounded-full border border-teal-200/80 bg-teal-50/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-teal-800">
                      <BookOpen className="h-3 w-3 opacity-80" aria-hidden />
                      README
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-gray-500">
                    Seeded users for Docker / local API—pick any row below, same password for all.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative space-y-2 px-4 py-4 sm:px-5">
              {demoAccounts.map(({ role, email, accent }, i) => (
                <motion.div
                  key={email}
                  initial={off ? false : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + i * 0.06, duration: 0.35, ease: publicEase }}
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/50 px-3 py-2.5 transition-colors group-hover:border-gray-200/90 group-hover:bg-white/80"
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full bg-gradient-to-br ${accent} shadow-sm ring-2 ring-white`}
                      aria-hidden
                    />
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{role}</span>
                  </span>
                  <span className="truncate font-mono text-[11px] text-gray-800 sm:text-xs">{email}</span>
                </motion.div>
              ))}
            </div>

            <div className="relative mx-4 mb-4 flex items-center gap-3 rounded-xl border border-slate-200/80 bg-gradient-to-r from-slate-900/[0.04] via-slate-800/[0.06] to-teal-900/[0.04] px-3.5 py-3 sm:mx-5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-teal-300 shadow-inner">
                <KeyRound className="h-4 w-4" strokeWidth={2} aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">Shared password</p>
                <p className="mt-0.5 font-mono text-sm font-medium tracking-wide text-gray-900">Demo123!</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </AuthPageSplit>
  );
}
