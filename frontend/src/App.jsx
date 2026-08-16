import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { Mic } from 'lucide-react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './components/DashboardLayout'
import DashboardHome from './pages/DashboardHome'
import DashboardInterview from './pages/DashboardInterview'
import DashboardAnalytics from './pages/DashboardAnalytics'
import DashboardSettings from './pages/DashboardSettings'
import InterviewDetail from './pages/InterviewDetail'
import Results from './pages/Results'

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f14] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-white/20 border-t-white" />
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={user ? <Navigate to="/home" replace /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/home" replace /> : <Signup />} />
      <Route path="/interview/:id" element={<InterviewDetail />} />
      <Route path="/results" element={<Results />} />
      <Route path="/dashboard" element={<Navigate to="/home" replace />} />

      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/home" element={<DashboardHome />} />
        <Route path="/interview" element={<DashboardInterview />} />
        <Route path="/analytics" element={<DashboardAnalytics />} />
        <Route path="/settings" element={<DashboardSettings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function AppLayout() {
  return (
    <div className="min-h-screen bg-primary-bg text-text-primary">
      <AppRoutes />
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </Router>
  )
}
