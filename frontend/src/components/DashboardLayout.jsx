import React, { useState, useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  Mic,
  BarChart2,
  Settings,
  Menu,
  X,
  LogOut,
  Sun,
  Moon
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const SIDEBAR_LINKS = [
  { to: '/home', label: 'Home', icon: Home, end: true },
  { to: '/interview', label: 'Interview', icon: Mic, end: false },
  { to: '/analytics', label: 'Analytics', icon: BarChart2, end: true },
  { to: '/settings', label: 'Settings', icon: Settings, end: true },
]

function NavItem({ to, label, icon: Icon, end, onClose }) {
  return (
    <NavLink to={to} end={end} onClick={onClose}>
      {({ isActive }) => (
        <div className="px-3">
          <motion.span
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${isActive
              ? 'bg-accent text-white shadow-lg shadow-accent/20'
              : 'text-text-muted hover:text-text-primary hover:bg-accent-light/10'
              }`}
            whileHover={!isActive ? { x: 4 } : {}}
            transition={{ duration: 0.2 }}
          >
            <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-text-muted group-hover:text-accent transition-colors'}`} />
            {label}
          </motion.span>
        </div>
      )}
    </NavLink>
  )
}

function Sidebar({ onClose }) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : (user?.email?.charAt(0).toUpperCase() || '?')

  return (
    <aside className="w-60 h-full flex flex-col bg-primary-surface border-r border-border shadow-2xl relative z-50">
      <div className="p-8">
        <Link to="/home" className="flex items-center gap-2.5 group" onClick={onClose}>
          <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center shadow-lg shadow-accent/20 group-hover:scale-110 transition-transform">
            <Mic className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-text-primary">Convoo</span>
        </Link>
      </div>

      <nav className="flex-1 px-1 space-y-1">
        {SIDEBAR_LINKS.map((link) => (
          <NavItem key={link.to} {...link} onClose={onClose} />
        ))}
      </nav>

      <div className="mt-auto space-y-px">
        {/* Theme Toggle row */}
        <div className="px-3 pb-2">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-text-muted hover:text-text-primary hover:bg-accent-light/10 transition-all group"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 group-hover:text-accent transition-colors" />
            ) : (
              <Sun className="w-5 h-5 group-hover:text-accent transition-colors" />
            )}
            {theme === 'light' ? 'Dark mode' : 'Light mode'}
          </button>
        </div>

        <div className="border-t border-border">
          <div className="flex items-center gap-3 px-6 py-5">
            <div className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm shadow-accent/20">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-text-primary truncate">{user?.name || 'User'}</p>
              <p className="text-[10px] font-medium text-text-muted truncate uppercase tracking-widest">{user?.email}</p>
            </div>
          </div>

          <div className="px-3 pb-6">
            <button
              onClick={() => { onClose?.(); logout(); }}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-text-muted hover:text-danger hover:bg-danger/10 transition-all group"
            >
              <LogOut className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
              Log out
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-primary-bg text-text-primary flex overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex fixed left-0 top-0 bottom-0 z-40">
        <Sidebar />
      </div>

      {/* Mobile Menu Toggle */}
      {!sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-5 left-5 z-20 p-2.5 rounded-xl bg-primary-surface border border-border text-text-muted hover:text-text-primary shadow-xl"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-64 shadow-2xl"
            >
              <button
                type="button"
                className="absolute top-4 right-4 p-2 rounded-xl bg-primary-surface border border-border text-text-muted hover:text-text-primary"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-60 min-h-screen relative overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-10 lg:py-12">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  )
}
