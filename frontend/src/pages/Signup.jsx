import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User as UserIcon, Mic, ChevronRight, CheckCircle2 } from 'lucide-react'
import { apiFetch } from '../api'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { ThemeToggle } from '../components/ui/ThemeToggle'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const passwordStrength = (pw) => {
    if (pw.length === 0) return 0
    if (pw.length < 6) return 1
    if (pw.length < 10) return 2
    return 3
  }

  const strength = passwordStrength(password)
  const strengthColors = ['bg-border', 'bg-danger', 'bg-warning', 'bg-success']
  const strengthLabels = ['', 'Weak', 'Medium', 'Strong']

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setError('')
    setLoading(true)
    try {
      const { res, data } = await apiFetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      if (!res.ok) throw new Error(data.error || 'Signup failed')
      localStorage.setItem('convoo_token', data.token)
      localStorage.setItem('convoo_user', JSON.stringify(data.user))
      navigate('/home', { replace: true })
      window.location.reload()
    } catch (err) {
      setError(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-primary-bg overflow-hidden">
      {/* Left Panel */}
      <div className="hidden md:flex md:w-[55%] bg-primary-secondary flex-col justify-between p-12 relative overflow-hidden text-left">
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
              <Mic className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-text-primary">Convoo</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-2">
          <h1 className="text-5xl font-light text-text-primary tracking-tight">Practice for</h1>
          <h2 className="text-6xl font-bold text-accent tracking-tight">your future.</h2>



        </div>



        {/* Decorative */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-5 bg-[radial-gradient(circle_at_center,var(--accent)_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      {/* Right Panel */}
      <div className="flex-1 bg-primary-bg flex flex-col justify-center p-8 md:p-12 relative overflow-y-auto">
        <div className="absolute top-8 right-8">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-sm mx-auto space-y-8 py-12">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-text-primary">Create account</h3>
            <p className="text-text-muted text-sm">Join the next generation of top talent</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-[10px] font-bold uppercase tracking-widest text-center">
                {error}
              </div>
            )}

            <Input
              label="Full Name"
              placeholder="Elon Musk"
              icon={UserIcon}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="elon@mars.com"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="space-y-4">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                icon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {/* Strength indicators */}
              {password.length > 0 && (
                <div className="space-y-1.5 px-1">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-text-muted">
                    <span>Strength</span>
                    <span className={strength === 1 ? 'text-danger' : strength === 2 ? 'text-warning' : 'text-success'}>
                      {strengthLabels[strength]}
                    </span>
                  </div>
                  <div className="flex gap-1 h-1">
                    {[1, 2, 3].map((s) => (
                      <div
                        key={s}
                        className={`flex-1 rounded-full transition-all duration-300 ${s <= strength ? strengthColors[strength] : 'bg-border'}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                icon={Lock}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-4"
            >
              {loading ? 'Creating...' : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-sm text-text-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-accent font-bold hover:text-accent/80 transition-colors inline-flex items-center gap-1 group">
              Sign in <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
