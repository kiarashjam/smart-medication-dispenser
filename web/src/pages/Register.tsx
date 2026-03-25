import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '@/contexts/AuthContext';
import { appPath } from '@/lib/appRoutes';
import { PRODUCT } from '@/lib/productCopy';
import { publicEase } from '@/lib/publicMotion';
import { Pill, Loader2, Users, Zap, HeartHandshake } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

const formVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.055, delayChildren: 0.04 } },
};
const fieldVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.36, ease: publicEase } },
};

export default function Register() {
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
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.detail || err?.response?.data || err?.message || 'Failed to register';
      setError(typeof msg === 'string' ? msg : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="public-page-wrap-auth">
      <div className="public-inner grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: publicEase }}
          className="order-1 mx-auto w-full max-w-md lg:mx-0 lg:max-w-none"
        >
          <div className="public-card relative overflow-hidden p-8 md:p-10">
            <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />
            <div className="relative">
            <motion.div className="flex justify-center lg:justify-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/30"
              >
                <Pill className="h-6 w-6 text-white" />
              </motion.div>
            </motion.div>

            <motion.span
              className="public-kicker mt-4 inline-flex"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.06, duration: 0.4, ease: publicEase }}
            >
              New account
            </motion.span>
            <motion.h1
              className="mt-4 text-center font-display text-2xl font-bold text-white md:text-3xl lg:text-left"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.42, ease: publicEase }}
            >
              Create your account
            </motion.h1>
            <motion.div
              className="public-title-rule mx-auto lg:mx-0"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.16, duration: 0.55, ease: publicEase }}
              style={{ transformOrigin: 'left center' }}
            />
            <motion.p
              className="public-body-muted mt-3 text-center lg:text-left"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              Create a user against the local API for {PRODUCT.name} (evaluation).
            </motion.p>

            <motion.form
              variants={formVariants}
              initial="hidden"
              animate="show"
              onSubmit={handleSubmit}
              className="mt-8 space-y-4"
            >
              <motion.div variants={fieldVariants}>
                <Label htmlFor="fullName" className="public-label">
                  Full name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="public-input"
                  required
                />
              </motion.div>

              <motion.div variants={fieldVariants}>
                <Label htmlFor="email" className="public-label">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
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
                  minLength={6}
                  required
                />
                <p className="mt-1 text-xs text-zinc-600">Minimum 6 characters</p>
              </motion.div>

              <motion.div variants={fieldVariants}>
                <Label htmlFor="role" className="public-label">
                  Role
                </Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="public-select-trigger [&>span]:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-zinc-900 text-white">
                    <SelectItem value="Patient">Patient</SelectItem>
                    <SelectItem value="Caregiver">Caregiver</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
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

              <motion.div variants={fieldVariants} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full rounded-xl border-0 bg-gradient-to-r from-teal-400 to-emerald-500 text-sm font-semibold text-[#06060a] shadow-lg shadow-teal-500/25 hover:opacity-95"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create account'
                  )}
                </Button>
              </motion.div>
            </motion.form>

            <motion.p
              className="public-body-muted mt-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.32, duration: 0.4 }}
            >
              Already have an account?{' '}
              <Link to="/login" className="public-link">
                Sign in
              </Link>
            </motion.p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: publicEase }}
          className="relative order-2 hidden lg:block"
        >
          <div className="public-glow-violet" />
          <div className="public-glass-panel p-10">
            <motion.span
              className="public-kicker inline-flex"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: publicEase }}
            >
              Why join
            </motion.span>
            <motion.h2
              className="font-display mt-4 text-3xl font-bold text-white"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.5, ease: publicEase }}
            >
              Built for real households
            </motion.h2>
            <motion.div
              className="public-title-rule"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.14, duration: 0.55, ease: publicEase }}
              style={{ transformOrigin: 'left center' }}
            />
            <div className="mt-8 space-y-4">
              {[
                { icon: Users, title: 'Multi-role', body: 'Patients, caregivers, and admins—each with tailored views.' },
                { icon: Zap, title: 'Fast setup', body: 'Connect a device, map slots, and ship your first schedule today.' },
                { icon: HeartHandshake, title: 'Human-centered', body: 'Clear language, bold hierarchy, fewer taps to clarity.' },
              ].map(({ icon: Icon, title: t, body }, i) => (
                <motion.div
                  key={t}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.1 }}
                  whileHover={{ x: 6 }}
                  className="public-card-quiet flex gap-4 p-4 transition-colors hover:border-violet-500/25"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500/15">
                    <Icon className="h-6 w-6 text-violet-300" />
                  </div>
                  <div>
                    <h3 className="public-h3-card">{t}</h3>
                    <p className="public-body-muted mt-1">{body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <motion.div
              className="mt-10 flex h-32 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div
                className="flex gap-2"
                animate={{ x: [0, -40, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              >
                {[...Array(12)].map((_, j) => (
                  <span
                    key={j}
                    className="h-16 w-8 shrink-0 rounded-lg bg-gradient-to-b from-violet-500/40 to-fuchsia-500/20"
                  />
                ))}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
