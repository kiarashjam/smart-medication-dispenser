import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
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
  Sparkles,
  Search,
  Home,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { mockNotifications } from '@/lib/mockData';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const unreadCount = mockNotifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowProfileMenu(false);
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/devices', label: 'Devices', icon: Box },
    { path: '/schedules', label: 'Schedules', icon: Calendar },
    { path: '/history', label: 'History', icon: History },
    { path: '/travel', label: 'Travel', icon: Plane },
    { path: '/integrations', label: 'Integrations', icon: Plug },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 relative">
      {/* Subtle animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-40">
        <motion.div
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-200/20 to-transparent rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-200/20 to-transparent rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Modern Floating Navigation */}
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'py-3' : 'py-6'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.nav
            className={`relative rounded-2xl lg:rounded-3xl border transition-all duration-500 ${
              scrolled
                ? 'bg-white/95 backdrop-blur-2xl shadow-2xl border-gray-200/50'
                : 'bg-white/90 backdrop-blur-xl shadow-xl border-gray-200/30'
            }`}
            layout
          >
            <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 lg:py-5">
              {/* Logo Section - Left */}
              <Link to="/">
                <motion.div
                  className="flex items-center gap-3 cursor-pointer group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="relative">
                    {/* Glow effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500"
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                      }}
                    />
                    
                    {/* Icon container */}
                    <div className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 p-2.5 rounded-2xl shadow-lg">
                      <Pill className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  <div className="hidden sm:block">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-gray-900">MediCare</span>
                      <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 text-xs px-2 py-0.5">
                        Pro
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">Smart Dispenser</p>
                  </div>
                </motion.div>
              </Link>

              {/* Center Navigation - Desktop Only */}
              <div className="hidden lg:flex items-center gap-2">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link key={item.path} to={item.path}>
                      <motion.button
                        className={`relative px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? 'text-blue-600'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Active indicator */}
                        {isActive && (
                          <motion.div
                            className="absolute inset-0 bg-blue-50 rounded-xl"
                            layoutId="activeNav"
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                          />
                        )}
                        
                        <div className="relative flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : ''}`} />
                          <span>{item.label}</span>
                        </div>

                        {/* Hover indicator */}
                        {!isActive && (
                          <motion.div
                            className="absolute inset-0 bg-gray-50 rounded-xl opacity-0 hover:opacity-100 transition-opacity"
                            initial={false}
                          />
                        )}
                      </motion.button>
                    </Link>
                  );
                })}
              </div>

              {/* Right Section - Actions */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Search Button - Hidden on mobile */}
                <motion.button
                  className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 text-sm font-medium transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Search className="w-4 h-4" />
                  <span className="hidden lg:inline">Search</span>
                </motion.button>

                {/* Notifications */}
                <Link to="/notifications">
                  <motion.button
                    className="relative p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Bell className="w-5 h-5 text-gray-600" />
                    {unreadCount > 0 && (
                      <>
                        <motion.div
                          className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center px-1.5"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500 }}
                        >
                          <span className="text-white text-xs font-bold">{unreadCount}</span>
                        </motion.div>
                        <motion.div
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full"
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 0, 0.5],
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </>
                    )}
                  </motion.button>
                </Link>

                {/* Profile Button */}
                <div className="relative">
                  <motion.button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-sm">
                      {user?.fullName?.charAt(0) || 'U'}
                    </div>
                    <span className="hidden sm:block text-white font-medium text-sm">
                      {user?.fullName?.split(' ')[0] || 'User'}
                    </span>
                  </motion.button>

                  {/* Profile Dropdown */}
                  <AnimatePresence>
                    {showProfileMenu && (
                      <>
                        <motion.div
                          className="fixed inset-0 z-40"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setShowProfileMenu(false)}
                        />
                        <motion.div
                          className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        >
                          {/* Profile Header */}
                          <div className="relative p-6 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
                            <motion.div
                              className="absolute inset-0 bg-white/10"
                              animate={{
                                x: ['-100%', '100%'],
                              }}
                              transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: 'linear',
                              }}
                            />
                            <div className="relative flex items-center gap-4">
                              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center text-white font-bold text-2xl border-2 border-white/30">
                                {user?.fullName?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <p className="font-bold text-white text-lg">{user?.fullName}</p>
                                <p className="text-sm text-blue-100">{user?.email}</p>
                                <Badge className="mt-2 bg-white/20 text-white border-white/30 text-xs">
                                  {user?.role}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* Menu Items */}
                          <div className="p-2">
                            <motion.button
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-left group"
                              whileHover={{ x: 4 }}
                              onClick={() => setShowProfileMenu(false)}
                            >
                              <div className="w-9 h-9 rounded-lg bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                                <User className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">My Profile</p>
                                <p className="text-xs text-gray-500">View and edit profile</p>
                              </div>
                            </motion.button>
                            
                            <motion.button
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-left group"
                              whileHover={{ x: 4 }}
                              onClick={() => setShowProfileMenu(false)}
                            >
                              <div className="w-9 h-9 rounded-lg bg-purple-50 group-hover:bg-purple-100 flex items-center justify-center transition-colors">
                                <Settings className="w-4 h-4 text-purple-600" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">Settings</p>
                                <p className="text-xs text-gray-500">Preferences & privacy</p>
                              </div>
                            </motion.button>

                            <div className="my-2 h-px bg-gray-100" />

                            <motion.button
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 transition-colors text-left group"
                              whileHover={{ x: 4 }}
                              onClick={handleLogout}
                            >
                              <div className="w-9 h-9 rounded-lg bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors">
                                <LogOut className="w-4 h-4 text-red-600" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-red-600">Logout</p>
                                <p className="text-xs text-gray-500">Sign out of your account</p>
                              </div>
                            </motion.button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* Mobile Menu Toggle */}
                <motion.button
                  className="lg:hidden p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <AnimatePresence mode="wait">
                    {showMobileMenu ? (
                      <motion.div
                        key="close"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <X className="w-6 h-6 text-gray-600" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="menu"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Menu className="w-6 h-6 text-gray-600" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </div>
          </motion.nav>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {showMobileMenu && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileMenu(false)}
            />
            <motion.div
              className="fixed top-24 left-4 right-4 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 lg:hidden overflow-hidden"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              <div className="p-3 space-y-1 max-h-[calc(100vh-8rem)] overflow-y-auto">
                {navItems.map((item, index) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link key={item.path} to={item.path} onClick={() => setShowMobileMenu(false)}>
                      <motion.div
                        className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isActive ? 'bg-white/20' : 'bg-white'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-sm">{item.label}</span>
                        {isActive && (
                          <motion.div
                            className="ml-auto w-2 h-2 bg-white rounded-full"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500 }}
                          />
                        )}
                      </motion.div>
                    </Link>
                  );
                })}

                {/* Mobile-only items */}
                <div className="pt-2 mt-2 border-t border-gray-100">
                  <Link to="/notifications" onClick={() => setShowMobileMenu(false)}>
                    <motion.div
                      className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium transition-all"
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: navItems.length * 0.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                          <Bell className="w-5 h-5" />
                        </div>
                        <span className="text-sm">Notifications</span>
                      </div>
                      {unreadCount > 0 && (
                        <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0">
                          {unreadCount}
                        </Badge>
                      )}
                    </motion.div>
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="relative pt-32 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
