import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Pill, ArrowRight, Github, Twitter, Linkedin, Mail, Menu, X } from 'lucide-react';
import { publicEase } from '@/lib/publicMotion';
import { FOOTER_TAGLINE, PRODUCT } from '@/lib/productCopy';

const navLink =
  'relative text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors duration-300 group';

const ROUTE_NAV = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Contact' },
] as const;

function PublicNavLink({ to, children, onNavigate }: { to: string; children: React.ReactNode; onNavigate?: () => void }) {
  const { pathname } = useLocation();
  const active = pathname === to || (to !== '/' && pathname.startsWith(`${to}/`));
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className={`${navLink} ${active ? '!text-teal-700 font-semibold' : ''}`}
      aria-current={active ? 'page' : undefined}
    >
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
  'text-sm text-zinc-600 hover:text-teal-700 transition-colors inline-flex items-center gap-1 group';

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
    <div className="min-h-screen flex flex-col font-public bg-[#0c0c0f] text-zinc-100 overflow-x-hidden selection:bg-teal-500/25 selection:text-teal-50">
      {/* Calm page backdrop: one soft wash, no grid, no animated blobs */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_55%_at_50%_-15%,rgba(45,212,191,0.055),transparent_58%)]" />
      </div>

      <header className="relative z-50 w-full border-b border-zinc-200/90 bg-white/95 shadow-sm shadow-zinc-900/[0.04] backdrop-blur-xl backdrop-saturate-150">
        <div className="w-full flex justify-center">
          <div className="public-inner flex h-16 md:h-[4.5rem] items-center justify-between px-4 sm:px-6 lg:px-10 xl:px-14">
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ rotate: [0, -8, 8, 0], scale: 1.05 }}
                transition={{ duration: 0.5 }}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 via-emerald-500 to-violet-600 shadow-md shadow-teal-600/20"
              >
                <Pill className="h-5 w-5 text-white" />
              </motion.div>
              <div className="flex flex-col leading-tight">
                <span className="font-display text-base font-bold tracking-tight text-zinc-900 sm:text-lg">{PRODUCT.nameLine1}</span>
                <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-teal-600">{PRODUCT.nameLine2}</span>
              </div>
            </Link>

            <nav className="hidden items-center gap-5 xl:gap-7 lg:flex" aria-label="Main">
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
                className="public-btn-outline-header border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 lg:hidden"
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
                      ? 'border-teal-500/40 bg-teal-50 text-teal-800'
                      : 'border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50'
                  }`}
                >
                  Sign in
                </motion.span>
              </Link>
              <Link to="/register">
                <motion.span
                  whileHover={{ scale: 1.03, boxShadow: '0 0 32px rgba(45,212,191,0.35)' }}
                  whileTap={{ scale: 0.98 }}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold shadow-md transition-all duration-300 ${
                    pathname === '/register'
                      ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white ring-2 ring-teal-400/35 ring-offset-2 ring-offset-white'
                      : 'bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-600 text-white shadow-teal-600/25'
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
              className="fixed inset-0 z-[70] bg-zinc-900/25 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              key="nav-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.35, ease: publicEase }}
              className="fixed bottom-0 right-0 top-0 z-[80] flex w-[min(100%,20rem)] flex-col border-l border-zinc-200 bg-white shadow-2xl shadow-zinc-900/10 backdrop-blur-xl lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/80 p-4">
                <span className="font-display text-sm font-semibold text-zinc-900">Menu</span>
                <button
                  type="button"
                  aria-label="Close"
                  className="rounded-xl border border-zinc-200 p-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4" aria-label="Main">
                {ROUTE_NAV.map(({ to, label }) => {
                  const active = pathname === to || (to !== '/' && pathname.startsWith(`${to}/`));
                  return (
                    <Link
                      key={to}
                      to={to}
                      aria-current={active ? 'page' : undefined}
                      className={`rounded-xl px-3 py-3 text-sm font-medium ${
                        active
                          ? 'bg-teal-50 text-teal-800 ring-1 ring-teal-200/80'
                          : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900'
                      }`}
                      onClick={() => setMobileOpen(false)}
                    >
                      {label}
                    </Link>
                  );
                })}
                <div className="mt-auto flex flex-col gap-2 border-t border-zinc-100 pt-4">
                  <Link
                    to="/login"
                    className="public-btn-outline-header justify-center border-zinc-200 py-3 text-zinc-800 hover:bg-zinc-50"
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

      <footer className="relative z-10 mt-auto w-full border-t border-zinc-200/90 bg-zinc-50/95 shadow-[0_-1px_0_0_rgba(0,0,0,0.03)]">
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
                  <span className="font-display text-sm font-bold leading-snug text-zinc-900 sm:text-base">{PRODUCT.name}</span>
                </div>
                <p className="max-w-sm text-sm leading-relaxed text-zinc-600">{FOOTER_TAGLINE}</p>
                <div className="mt-6 flex gap-3">
                  {[Twitter, Github, Linkedin, Mail].map((Icon, i) => (
                    <motion.a
                      key={i}
                      href="#"
                      aria-label="Social"
                      whileHover={{ y: -3, scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
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
                  <h3 className="mb-4 font-display text-sm font-semibold tracking-wide text-zinc-900">{col.title}</h3>
                  <ul className="space-y-3">
                    {col.links.map((l) => (
                      <li key={l.label}>
                        {l.external ? (
                          <a href={l.to} className={footerLinkClass}>
                            <span className="h-px w-0 bg-teal-600 transition-all duration-300 group-hover:w-2" />
                            {l.label}
                          </a>
                        ) : (
                          <Link to={l.to} className={footerLinkClass}>
                            <span className="h-px w-0 bg-teal-600 transition-all duration-300 group-hover:w-2" />
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
              className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-zinc-200/80 pt-8 text-xs text-zinc-500 sm:flex-row"
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
