import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { appPath } from '@/lib/appRoutes';
import { AnimatePresence, motion } from 'motion/react';
import {
  Pill,
  LayoutDashboard,
  Box,
  History,
  Plane,
  Bell,
  Plug,
  LogOut,
  Calendar,
  User,
  Settings,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { notificationsApi } from '@/api/client';
import { PRODUCT } from '@/lib/productCopy';

function navIsActive(pathname: string, itemPath: string) {
  const base = appPath();
  if (itemPath === base) {
    return pathname === base || pathname === `${base}/`;
  }
  return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
}

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    notificationsApi
      .list(50)
      .then((res) => {
        const count = res.data.filter((n) => !n.isRead).length;
        setUnreadCount(count);
      })
      .catch(() => {});
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowProfileMenu(false);
  };

  const showMvpBadge = import.meta.env.VITE_MVP_MODE === 'true';

  const navItems = [
    { path: appPath(), label: 'Dashboard', icon: LayoutDashboard },
    { path: appPath('/devices'), label: 'Devices', icon: Box },
    { path: appPath('/schedules'), label: 'Schedules', icon: Calendar },
    { path: appPath('/history'), label: 'History', icon: History },
    { path: appPath('/travel'), label: 'Travel', icon: Plane },
    { path: appPath('/integrations'), label: 'Integrations', icon: Plug },
    { path: appPath('/settings'), label: 'Settings', icon: Settings },
  ];

  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col w-full">
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full bg-white border-b transition-shadow duration-200 ${
          scrolled ? 'shadow-sm border-gray-200' : 'border-gray-100'
        }`}
      >
        <div className="w-full flex justify-center">
          <div className="w-full max-w-[min(100%,1920px)] flex items-center justify-between h-14 px-4 sm:px-6 lg:px-10 xl:px-14">
            <Link to={appPath()} className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                <Pill className="w-4 h-4 text-white" />
              </div>
              <span className="hidden max-w-[10rem] truncate text-base font-semibold text-gray-900 sm:block sm:max-w-[14rem]">
                {PRODUCT.nameLine1}
              </span>
              {showMvpBadge && (
                <span className="hidden sm:inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                  MVP
                </span>
              )}
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = navIsActive(location.pathname, item.path);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <Link
                to={appPath('/notifications')}
                className="relative p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-[9px] font-bold">{unreadCount > 9 ? '9+' : unreadCount}</span>
                  </span>
                )}
              </Link>

              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 pl-2 pr-1.5 py-1.5 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-semibold">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700">
                    {user?.fullName?.split(' ')[0] || 'User'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
                </button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                      <motion.div
                        className="absolute right-0 mt-1 w-56 bg-white rounded-lg border border-gray-200 shadow-lg z-50 py-1"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.15 }}
                      >
                        <div className="px-3 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                        <Link
                          to={appPath('/settings')}
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <User className="w-4 h-4 text-gray-400" />
                          Profile
                        </Link>
                        <Link
                          to={appPath('/settings')}
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Settings className="w-4 h-4 text-gray-400" />
                          Settings
                        </Link>
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <button
                className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-50 transition-colors"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {showMobileMenu && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/20 z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileMenu(false)}
            />
            <motion.div
              className="fixed top-14 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50 lg:hidden"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              <div className="p-2 max-h-[calc(100vh-3.5rem)] overflow-y-auto">
                {navItems.map((item) => {
                  const isActive = navIsActive(location.pathname, item.path);
                  const Icon = item.icon;
                  return (
                    <Link key={item.path} to={item.path} onClick={() => setShowMobileMenu(false)}>
                      <div
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                          isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </div>
                    </Link>
                  );
                })}
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <Link to={appPath('/notifications')} onClick={() => setShowMobileMenu(false)}>
                    <div className="flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <Bell className="w-4 h-4" />
                        Notifications
                      </div>
                      {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="pt-14 flex-1 w-full min-h-0 flex flex-col">
        <div className="w-full flex justify-center flex-1">
          <div className="w-full max-w-[min(100%,1920px)] px-4 sm:px-6 lg:px-10 xl:px-14 py-6">
            <Outlet />
          </div>
        </div>
      </main>

      <footer className="w-full border-t border-gray-200 bg-white mt-auto">
        <div className="w-full flex justify-center">
          <div className="w-full max-w-[min(100%,1920px)] px-4 sm:px-6 lg:px-10 xl:px-14 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
            <p>
              © {year} {PRODUCT.name} — caregiver portal
            </p>
            <div className="flex items-center gap-4">
              <Link to="/" className="hover:text-brand-600 transition-colors">
                Marketing site
              </Link>
              <Link to={appPath('/settings')} className="hover:text-brand-600 transition-colors">
                Settings
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
