import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '@/contexts/AuthContext';
import { appPath } from '@/lib/appRoutes';
import { publicEase } from '@/lib/publicMotion';
import { Pill, Loader2, Sparkles, Shield, Clock } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';

const formVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};
const fieldVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: publicEase } },
};

export default function Login() {
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
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.detail || err?.response?.data || err?.message || 'Failed to login';
      setError(typeof msg === 'string' ? msg : 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="public-page-wrap-auth">
      <div className="public-inner grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, x: -28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: publicEase }}
          className="relative order-2 hidden lg:order-1 lg:block"
        >
          <div className="public-glow-teal" />
          <div className="public-glass-panel p-10">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
              className="absolute -right-24 -top-24 h-48 w-48 rounded-full border border-dashed border-teal-400/20"
            />
            <div className="relative space-y-8">
              <div className="public-kicker">
                <Sparkles className="h-4 w-4" />
                Caregiver portal
              </div>
              <h2 className="font-display text-3xl font-bold leading-tight text-white md:text-4xl">
                Sign in and see today&apos;s schedule in seconds.
              </h2>
              <ul className="space-y-4">
                {[
                  { icon: Clock, text: 'Live next-dose countdowns across devices' },
                  { icon: Shield, text: 'Secure session — your data stays encrypted in transit' },
                  { icon: Pill, text: 'Same account works across web and mobile' },
                ].map(({ icon: Icon, text }, i) => (
                  <motion.li
                    key={text}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
                    className="flex items-start gap-3 text-sm leading-relaxed text-zinc-400"
                  >
                    <span className="public-icon-tile mt-0.5">
                      <Icon className="h-4 w-4" />
                    </span>
                    {text}
                  </motion.li>
                ))}
              </ul>
              <motion.div
                className="flex gap-3 pt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-1.5 flex-1 origin-left rounded-full bg-gradient-to-r from-teal-400 to-violet-500"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.6 + i * 0.12, duration: 0.5, ease: 'easeOut' }}
                  />
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: publicEase }}
          className="order-1 mx-auto w-full max-w-md lg:order-2 lg:mx-0 lg:max-w-none"
        >
          <div className="public-card relative overflow-hidden p-8 md:p-10">
            <div className="pointer-events-none absolute -left-16 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-teal-500/5 blur-3xl" />
            <div className="relative">
            <motion.div
              className="mb-2 flex justify-center lg:justify-start"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: publicEase }}
            >
              <motion.div
                whileHover={{ scale: 1.05, rotate: [0, -6, 6, 0] }}
                transition={{ duration: 0.45 }}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-violet-600 shadow-lg shadow-teal-500/30"
              >
                <Pill className="h-6 w-6 text-white" />
              </motion.div>
            </motion.div>

            <motion.span
              className="public-kicker mt-4 inline-flex"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08, duration: 0.4, ease: publicEase }}
            >
              Account
            </motion.span>
            <motion.h1
              className="mt-4 text-center font-display text-2xl font-bold text-white md:text-3xl lg:text-left"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.42, ease: publicEase }}
            >
              Welcome back
            </motion.h1>
            <motion.div
              className="public-title-rule mx-auto lg:mx-0"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.18, duration: 0.55, ease: publicEase }}
              style={{ transformOrigin: 'left center' }}
            />
            <motion.p
              className="public-body-muted mt-3 text-center lg:text-left"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.22, duration: 0.4 }}
            >
              Caregiver web portal for the API (see web/README.md).
            </motion.p>

            <motion.form
              variants={formVariants}
              initial="hidden"
              animate="show"
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >
              <motion.div variants={fieldVariants}>
                <Label htmlFor="email" className="public-label">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="demo@example.com"
                  className="public-input"
                  required
                />
              </motion.div>

              <motion.div variants={fieldVariants}>
                <Label htmlFor="password" className="public-label">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="public-input"
                  required
                />
              </motion.div>

              {error ? (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300"
                >
                  {error}
                </motion.div>
              ) : null}

              <motion.div variants={fieldVariants} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full rounded-xl border-0 bg-gradient-to-r from-teal-400 to-emerald-500 text-sm font-semibold text-[#06060a] shadow-lg shadow-teal-500/25 hover:opacity-95"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </Button>
              </motion.div>
            </motion.form>

            <motion.div
              className="mt-8 space-y-5 text-center"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.45, ease: publicEase }}
            >
              <p className="public-body-muted">
                Don&apos;t have an account?{' '}
                <Link to="/register" className="public-link">
                  Sign up
                </Link>
              </p>
              <motion.div
                className="public-callout space-y-2"
                whileHover={{ borderColor: 'rgba(45,212,191,0.25)' }}
              >
                <p className="font-medium text-zinc-300">Seed users (README)</p>
                <p className="font-mono text-[11px] leading-relaxed text-zinc-400 sm:text-xs">
                  patient@demo.com / Demo123!
                  <br />
                  caregiver@demo.com / Demo123!
                  <br />
                  admin@demo.com / Demo123!
                </p>
              </motion.div>
            </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
