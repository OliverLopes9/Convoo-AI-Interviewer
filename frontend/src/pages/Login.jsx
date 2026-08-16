import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, Mic, Github, ChevronRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { ThemeToggle } from '../components/ui/ThemeToggle'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/home', { replace: true })
    } catch (err) {
      setError(err.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-primary-bg overflow-hidden">
      {/* Left Panel - Desktop Only */}
      <div className="hidden md:flex md:w-[55%] bg-primary-secondary flex-col justify-between p-12 relative overflow-hidden">
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
              <Mic className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-text-primary">Convoo</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-2">
          <h1 className="text-5xl font-light text-text-primary">Good to see</h1>
          <h2 className="text-6xl font-bold text-accent">you again.</h2>
          <p className="text-text-muted text-lg pt-4">Sign in and continue where you left off.</p>
        </div>



        {/* Decorative Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-5 bg-[radial-gradient(circle_at_center,var(--accent)_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 bg-primary-bg flex flex-col justify-center p-8 md:p-12 relative">
        <div className="absolute top-8 right-8 flex items-center gap-4">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-sm mx-auto space-y-10">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-text-primary">Welcome back</h3>
            <p className="text-text-muted text-sm">Sign in to your Convoo account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-[10px] font-bold uppercase tracking-widest text-center">
                {error}
              </div>
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="space-y-2">
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  icon={Lock}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 bottom-3.5 text-text-muted hover:text-accent transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-border text-accent focus:ring-accent accent-accent" />
                <span className="text-xs font-medium text-text-muted group-hover:text-text-primary transition-colors">Remember me</span>
              </label>
              <Link to="/forgot-password" size="sm" className="text-xs font-bold text-accent hover:text-accent/80 transition-colors">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>



          <p className="text-center text-sm text-text-muted">
            New here?{' '}
            <Link to="/signup" className="text-accent font-bold hover:text-accent/80 transition-colors inline-flex items-center gap-1 group">
              Create account <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
