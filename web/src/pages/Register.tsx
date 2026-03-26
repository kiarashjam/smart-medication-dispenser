import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { useAuth } from '@/contexts/AuthContext';
import { appPath } from '@/lib/appRoutes';
import { PRODUCT } from '@/lib/productCopy';
import { publicEase, publicSpring } from '@/lib/publicMotion';
import { Pill, Loader2, UserPlus, Check, Layers, Link2, Sparkles, Shield } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
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

const checklist = [
  'JWT-secured sessions',
  'Pick patient or caregiver at signup (profile can link a caregiver later)',
  'Works with seed or fresh databases',
];

const benefits = [
  {
    icon: Layers,
    title: 'Role-based access',
    body: 'Patient vs caregiver: the API scopes devices by owner; the web app shows a different dashboard and nav for each role.',
  },
  {
    icon: Link2,
    title: 'Same stack as production',
    body: 'Accounts live in your PostgreSQL database behind the .NET API; no separate “demo-only” auth.',
  },
];

const asideContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.08 } },
};
const asideItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: publicEase } },
};

export default function Register() {
  const reduceMotion = useReducedMotion();
  const off = !!reduceMotion;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Patient');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(email, password, fullName, role);
      navigate(appPath());
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string; detail?: string } | string }; message?: string };
      const raw = ax?.response?.data;
      const msg =
        (typeof raw === 'object' && raw && 'message' in raw && raw.message) ||
        (typeof raw === 'object' && raw && 'detail' in raw && raw.detail) ||
        (typeof raw === 'string' ? raw : null) ||
        ax?.message ||
        'Failed to register';
      setError(typeof msg === 'string' ? msg : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageSplit
      accent="violet"
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
                        '0 0 0 0 rgba(167,139,250,0)',
                        '0 0 28px 0 rgba(167,139,250,0.35)',
                        '0 0 0 0 rgba(167,139,250,0)',
                      ],
                    }
              }
              transition={
                off
                  ? publicSpring
                  : { ...publicSpring, boxShadow: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }
              }
            >
              <motion.span
                animate={off ? undefined : { y: [0, -3, 0] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <Pill className="h-5 w-5 text-violet-300" aria-hidden />
              </motion.span>
            </motion.div>
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-200/80">
                {!off && (
                  <motion.span
                    animate={{ rotate: [0, 15, -10, 0], scale: [1, 1.2, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Sparkles className="h-3 w-3 text-amber-300/90" aria-hidden />
                  </motion.span>
                )}
                New user
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
              Create an account for evaluation
            </motion.h2>
            <p className="text-sm leading-relaxed text-zinc-400">
              Register against your running API to explore the caregiver portal and align with MVP_APPLICATION.md
              roles—ideal for local Docker or dev deployments.
            </p>
            <ul className="space-y-4 pt-2">
              {checklist.map((t, i) => (
                <motion.li
                  key={t}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.12, duration: 0.45, ease: publicEase }}
                  whileHover={off ? undefined : { x: 6, transition: { duration: 0.2 } }}
                  className="flex gap-3 text-sm leading-relaxed text-zinc-300"
                >
                  <motion.span
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/25 text-violet-200"
                    animate={off ? undefined : { scale: [1, 1.15, 1] }}
                    transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.4 }}
                  >
                    <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden />
                  </motion.span>
                  {t}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={asideItem} className="mt-10 space-y-4">
            {benefits.map(({ icon: Icon, title, body }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.45, ease: publicEase }}
                whileHover={off ? undefined : { y: -4, borderColor: 'rgba(255,255,255,0.22)' }}
                className="rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm transition-colors"
              >
                <div className="flex gap-3">
                  <motion.div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/20 text-violet-200"
                    whileHover={off ? undefined : { rotate: [0, -8, 8, 0], scale: 1.06 }}
                    transition={publicSpring}
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                  </motion.div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-500">{body}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            variants={asideItem}
            className="mt-12 flex items-center gap-3 border-t border-white/10 pt-8 text-xs text-zinc-500"
          >
            <motion.span
              animate={off ? undefined : { rotate: [0, 8, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              <Shield className="h-4 w-4 shrink-0 text-zinc-600" aria-hidden />
            </motion.span>
            <span>HTTPS in production; passwords handled per your API deployment.</span>
          </motion.div>
        </motion.div>
      }
    >
      <div className="mx-auto w-full max-w-[400px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, rotate: 8 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className="mb-8 flex justify-center lg:justify-start"
        >
          <motion.div
            className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-brand-600 shadow-lg shadow-violet-600/35"
            whileHover={off ? undefined : { scale: 1.06, rotate: [0, 4, -4, 0] }}
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
                animate={{ opacity: [0.2, 0.45, 0.2], scale: [1, 1.05, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
            )}
            <UserPlus className="relative h-7 w-7 text-white" aria-hidden />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.45, ease: publicEase }}
        >
          <motion.p
            className="text-xs font-semibold uppercase tracking-widest text-violet-600"
            animate={off ? undefined : { letterSpacing: ['0.22em', '0.3em', '0.22em'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            Registration
          </motion.p>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Create your account
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            Add a user to <span className="font-medium text-gray-800">{PRODUCT.name}</span> for testing or demos.
          </p>
        </motion.div>

        <motion.form
          variants={formVariants}
          initial="hidden"
          animate="show"
          onSubmit={handleSubmit}
          className="mt-8 space-y-4"
        >
          <motion.div variants={fieldVariants}>
            <Label htmlFor="fullName" className={formLabelClass}>
              Full name
            </Label>
            <Input
              id="fullName"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Alex Rivera"
              className={formInputClass}
              required
            />
          </motion.div>

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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className={formInputClass}
              minLength={6}
              required
            />
            <p className="mt-1.5 text-xs text-gray-500">Minimum 6 characters, per API validation.</p>
          </motion.div>

          <motion.div variants={fieldVariants}>
            <Label htmlFor="role" className={formLabelClass}>
              Role
            </Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger
                id="role"
                className="mt-2 h-11 w-full rounded-xl border-gray-200 bg-gray-50/90 text-sm text-gray-900 shadow-sm focus:ring-2 focus:ring-violet-500/20"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-200 bg-white text-gray-900 shadow-lg">
                <SelectItem value="Patient" className="cursor-pointer focus:bg-gray-50">
                  Patient
                </SelectItem>
                <SelectItem value="Caregiver" className="cursor-pointer focus:bg-gray-50">
                  Caregiver
                </SelectItem>
              </SelectContent>
            </Select>
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

          <motion.div variants={fieldVariants} className="pt-2">
            <motion.div whileHover={off ? undefined : { scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={publicSpring}>
              <Button
                type="submit"
                disabled={loading}
                className="relative h-12 w-full overflow-hidden rounded-xl border-0 bg-gradient-to-r from-violet-600 via-brand-600 to-violet-500 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition-shadow hover:shadow-xl hover:shadow-violet-600/35 disabled:opacity-60"
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
                      Creating account…
                    </>
                  ) : (
                    'Create account'
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
            Already registered?{' '}
            <motion.span whileHover={{ scale: 1.05 }} className="inline-block">
              <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
                Sign in
              </Link>
            </motion.span>
          </p>

          <motion.div
            className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50/90 px-4 py-3"
            whileHover={off ? undefined : { borderColor: 'rgba(124,58,237,0.35)', boxShadow: '0 0 24px rgba(124,58,237,0.1)' }}
            transition={publicSpring}
          >
            {!off && (
              <motion.div
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/[0.07] to-brand-500/0"
                animate={{ x: ['-50%', '150%'] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
              />
            )}
            <p className="relative text-xs font-semibold text-gray-800">After signup</p>
            <p className="relative mt-2 text-xs leading-relaxed text-gray-600">
              Use the same API base URL as login. Seed users from the README if you prefer not to register manually.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </AuthPageSplit>
  );
}
