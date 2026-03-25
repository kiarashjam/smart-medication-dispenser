import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Pill, ArrowRight, Github, Twitter, Linkedin, Mail, Menu, X } from 'lucide-react';
import { publicEase } from '@/lib/publicMotion';
import { FOOTER_TAGLINE, PRODUCT } from '@/lib/productCopy';

const navLink =
  'relative text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-300 group';

const ANCHOR_NAV = [
  { href: '/#features', label: 'Features' },
  { href: '/#how', label: 'How it works' },
  { href: '/#trust', label: 'Trust' },
] as const;

const ROUTE_NAV = [
  { to: '/about', label: 'About' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Contact' },
] as const;

function PublicNavLink({ to, children, onNavigate }: { to: string; children: React.ReactNode; onNavigate?: () => void }) {
  const { pathname } = useLocation();
  const active = pathname === to;
  return (
    <Link to={to} onClick={onNavigate} className={`${navLink} ${active ? '!text-white' : ''}`}>
      {children}
      <span
        className={`absolute -bottom-1 left-0 h-px bg-gradient-to-r from-teal-400 to-violet-400 transition-all duration-300 ${
          active ? 'w-full' : 'w-0 group-hover:w-full'
        }`}
      />
    </Link>
  );
}

const footerLinkClass =
  'text-sm text-zinc-500 hover:text-teal-400 transition-colors inline-flex items-center gap-1 group';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const year = new Date().getFullYear();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen flex flex-col font-public bg-[#06060a] text-zinc-100 overflow-x-hidden selection:bg-teal-500/30 selection:text-teal-100">
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(45,212,191,0.12),transparent_50%)]" />
        <div className="absolute top-1/4 -left-1/4 w-[70vw] h-[70vw] rounded-full bg-violet-600/10 blur-[120px] animate-public-blob" />
        <div className="absolute bottom-0 right-0 w-[60vw] h-[60vw] rounded-full bg-teal-500/8 blur-[100px] animate-public-blob-delayed" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <header className="relative z-50 w-full border-b border-white/[0.08] bg-[#06060a]/80 backdrop-blur-2xl backdrop-saturate-150">
        <div className="w-full flex justify-center">
          <div className="public-inner flex h-16 md:h-[4.5rem] items-center justify-between px-4 sm:px-6 lg:px-10 xl:px-14">
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ rotate: [0, -8, 8, 0], scale: 1.05 }}
                transition={{ duration: 0.5 }}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 via-emerald-500 to-violet-600 shadow-lg shadow-teal-500/25"
              >
                <Pill className="h-5 w-5 text-white" />
              </motion.div>
              <div className="flex flex-col leading-tight">
                <span className="font-display text-base font-bold tracking-tight text-white sm:text-lg">{PRODUCT.nameLine1}</span>
                <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-teal-400/90">{PRODUCT.nameLine2}</span>
              </div>
            </Link>

            <nav className="hidden items-center gap-5 xl:gap-7 lg:flex">
              {ANCHOR_NAV.map(({ href, label }) => (
                <a key={href} href={href} className={navLink}>
                  {label}
                  <span className="absolute -bottom-1 left-0 h-px w-0 bg-gradient-to-r from-teal-400 to-violet-400 transition-all duration-300 group-hover:w-full" />
                </a>
              ))}
              {ROUTE_NAV.map(({ to, label }) => (
                <PublicNavLink key={to} to={to}>
                  {label}
                </PublicNavLink>
              ))}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                aria-label="Open menu"
                className="public-btn-outline-header border-white/10 text-zinc-300 hover:border-white/20 hover:bg-white/5 lg:hidden"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>

              <Link to="/login" className="hidden sm:block">
                <motion.span
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`public-btn-outline-header inline-flex items-center ${
                    pathname === '/login'
                      ? 'border-teal-400/50 bg-teal-500/10 text-teal-300'
                      : 'border-white/10 text-zinc-300 hover:border-white/20 hover:bg-white/5'
                  }`}
                >
                  Sign in
                </motion.span>
              </Link>
              <Link to="/register">
                <motion.span
                  whileHover={{ scale: 1.03, boxShadow: '0 0 32px rgba(45,212,191,0.35)' }}
                  whileTap={{ scale: 0.98 }}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold shadow-lg transition-all duration-300 ${
                    pathname === '/register'
                      ? 'bg-gradient-to-r from-emerald-300 to-teal-300 text-[#06060a] ring-2 ring-teal-400/50 ring-offset-2 ring-offset-[#06060a]'
                      : 'bg-gradient-to-r from-teal-300 via-emerald-400 to-teal-400 text-[#06060a] shadow-teal-500/20'
                  }`}
                >
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </motion.span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence mode="sync">
        {mobileOpen ? (
          <>
            <motion.div
              key="nav-backdrop"
              role="presentation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] bg-black/65 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              key="nav-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.35, ease: publicEase }}
              className="fixed bottom-0 right-0 top-0 z-[80] flex w-[min(100%,20rem)] flex-col border-l border-white/10 bg-[#08080f]/98 shadow-2xl backdrop-blur-xl lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-white/10 p-4">
                <span className="font-display text-sm font-semibold text-white">Menu</span>
                <button
                  type="button"
                  aria-label="Close"
                  className="rounded-xl border border-white/10 p-2 text-zinc-400 hover:bg-white/5 hover:text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
                {ANCHOR_NAV.map(({ href, label }) => (
                  <a
                    key={href}
                    href={href}
                    className="rounded-xl px-3 py-3 text-sm font-medium text-zinc-300 hover:bg-white/5 hover:text-white"
                    onClick={() => setMobileOpen(false)}
                  >
                    {label}
                  </a>
                ))}
                <div className="my-3 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                {ROUTE_NAV.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`rounded-xl px-3 py-3 text-sm font-medium ${
                      pathname === to ? 'bg-teal-500/10 text-teal-300' : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                    }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {label}
                  </Link>
                ))}
                <div className="mt-auto flex flex-col gap-2 border-t border-white/10 pt-4">
                  <Link
                    to="/login"
                    className="public-btn-outline-header justify-center border-white/15 py-3 text-white hover:bg-white/5"
                    onClick={() => setMobileOpen(false)}
                  >
                    Sign in
                  </Link>
                </div>
              </nav>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>

      <main className="relative z-10 flex w-full flex-1 flex-col">{children}</main>

      <footer className="relative z-10 mt-auto w-full border-t border-white/[0.08] bg-black/35">
        <div className="w-full flex justify-center">
          <div className="public-inner px-4 py-14 sm:px-6 md:py-16 lg:px-10 xl:px-14">
            <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="lg:col-span-1"
              >
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-violet-600">
                    <Pill className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-display text-sm font-bold leading-snug text-white sm:text-base">{PRODUCT.name}</span>
                </div>
                <p className="max-w-sm text-sm leading-relaxed text-zinc-500">{FOOTER_TAGLINE}</p>
                <div className="mt-6 flex gap-3">
                  {[Twitter, Github, Linkedin, Mail].map((Icon, i) => (
                    <motion.a
                      key={i}
                      href="#"
                      aria-label="Social"
                      whileHover={{ y: -3, scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-zinc-400 transition-colors hover:border-teal-500/30 hover:bg-teal-500/5 hover:text-teal-300"
                    >
                      <Icon className="h-4 w-4" />
                    </motion.a>
                  ))}
                </div>
              </motion.div>

              {[
                {
                  title: 'Product',
                  links: [
                    { label: 'Features', to: '/#features', external: true },
                    { label: 'Pricing', to: '/pricing', external: false },
                    { label: 'FAQ', to: '/faq', external: false },
                    { label: 'Portal', to: '/login', external: false },
                    { label: 'Create account', to: '/register', external: false },
                  ],
                },
                {
                  title: 'Company',
                  links: [
                    { label: 'About', to: '/about', external: false },
                    { label: 'Careers', to: '/careers', external: false },
                    { label: 'Contact', to: '/contact', external: false },
                  ],
                },
                {
                  title: 'Legal',
                  links: [
                    { label: 'Privacy', to: '/privacy', external: false },
                    { label: 'Terms', to: '/terms', external: false },
                    { label: 'Security', to: '/security', external: false },
                  ],
                },
              ].map((col, idx) => (
                <motion.div
                  key={col.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                >
                  <h3 className="mb-4 font-display text-sm font-semibold tracking-wide text-white">{col.title}</h3>
                  <ul className="space-y-3">
                    {col.links.map((l) => (
                      <li key={l.label}>
                        {l.external ? (
                          <a href={l.to} className={footerLinkClass}>
                            <span className="h-px w-0 bg-teal-400 transition-all duration-300 group-hover:w-2" />
                            {l.label}
                          </a>
                        ) : (
                          <Link to={l.to} className={footerLinkClass}>
                            <span className="h-px w-0 bg-teal-400 transition-all duration-300 group-hover:w-2" />
                            {l.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 text-xs text-zinc-600 sm:flex-row"
            >
              <p>
                © {year} {PRODUCT.name}. Open-source MVP; see repository docs for scope.
              </p>
              <p className="max-w-md text-right sm:text-left">Not a medical device listing—evaluation software only.</p>
            </motion.div>
          </div>
        </div>
      </footer>
    </div>
  );
}
