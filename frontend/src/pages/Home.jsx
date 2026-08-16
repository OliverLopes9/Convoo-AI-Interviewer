import React, { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mic, ArrowRight, Play, GraduationCap, Zap, Flame, Sparkles, BarChart2, Calendar, Check, Sun, Moon, RotateCcw } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ThemeToggle } from '../components/ui/ThemeToggle'

export default function Home() {
  const { user, loading } = useAuth()
  const { theme } = useTheme()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-accent/20 border-t-accent" />
      </div>
    )
  }

  if (user) {
    return <Navigate to="/home" replace />
  }

  return (
    <div className="min-h-screen bg-primary-bg text-text-primary selection:bg-accent/20 overflow-x-hidden">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${scrolled ? 'bg-primary-bg/80 backdrop-blur-md border-border py-3' : 'bg-transparent border-transparent py-5'}`}>
        <div className="container mx-auto px-6 h-[60px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
              <Mic className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-text-primary">Convoo</span>
          </Link>

          <div className="flex items-center gap-6">
            <ThemeToggle />
            <Link to="/login" className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors">Sign in</Link>
            <Link to="/signup">
              <Button size="sm" className="rounded-full">Get started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-6 min-h-screen flex items-center pt-20">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-8 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-[10px] font-bold uppercase tracking-widest text-accent">
                <Sparkles className="w-3 h-3" />
                AI Mock Interviews
              </div>

              <div className="space-y-2">
                <h1 className="text-muted text-5xl font-light tracking-tight leading-none">Prepare smarter.</h1>
                <h2 className="text-text-primary text-6xl font-bold tracking-tight leading-none">Interview with</h2>
                <h2 className="text-accent text-6xl font-bold tracking-tight leading-none">confidence.</h2>
              </div>

              <p className="text-text-muted text-lg max-w-md leading-relaxed">
                Voice-powered mock interviews that adapt to you. Get real questions, honest feedback, and track your growth — session by session.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
                <Link to="/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto">Start Practicing Free</Button>
                </Link>

              </div>


            </div>

            {/* Right Column - Desktop Only */}
            <div className="hidden lg:block lg:col-span-5 relative">
              <motion.div
                animate={{ y: [0, -10, 0], rotate: [2, 1, 2] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="relative z-10"
              >
                <Card className="p-6 w-[380px] shadow-2xl rotate-2 bg-primary-surface border-border">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="h-2 w-1/3 bg-border rounded-full mb-2" />
                      <div className="h-1.5 w-1/4 bg-accent-light/30 rounded-full" />
                    </div>
                    <div className="text-xs font-mono font-bold text-accent">1:45</div>
                  </div>

                  <div className="space-y-3 mb-8">
                    <div className="h-2.5 w-full bg-border rounded-full" />
                    <div className="h-2.5 w-5/6 bg-border rounded-full" />
                    <div className="h-2.5 w-4/6 bg-border rounded-full opacity-50" />
                  </div>

                  <div className="flex items-end justify-center gap-1.5 h-16">
                    {[0.4, 0.7, 1, 0.6, 0.8, 0.4, 0.5, 0.9, 0.6].map((h, i) => (
                      <motion.div
                        key={i}
                        animate={{ height: [h * 20, h * 60, h * 20] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                        className="w-1.5 bg-accent rounded-full"
                      />
                    ))}
                  </div>
                </Card>
              </motion.div>

              {/* Background Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-accent/10 blur-[80px] rounded-full pointer-events-none" />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 bg-primary-secondary">
          <div className="container mx-auto px-6">
            <div className="text-center space-y-4 mb-20">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">What you get</h4>
              <h2 className="text-4xl font-bold text-text-primary tracking-tight max-w-lg mx-auto">Built for real interview prep</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto auto-rows-[280px]">
              {/* Voice Intelligence */}
              <Card className="md:col-span-2 p-10 flex flex-col justify-between group overflow-hidden relative">
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-6 group-hover:bg-accent group-hover:text-white transition-all">
                    <Mic className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-text-primary mb-4">Voice Intelligence</h3>
                  <p className="text-text-muted max-w-md leading-relaxed">
                    Speak your answers naturally. Our AI listens, transcribes, and understands context in real-time.
                  </p>
                </div>
                {/* Visual Waveform background decoration */}
                <div className="absolute right-0 bottom-0 p-8 flex items-end gap-2 opacity-10">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="w-2 rounded-full bg-accent" style={{ height: `${Math.random() * 100 + 20}px` }} />
                  ))}
                </div>
              </Card>

              {/* Difficulty Levels */}
              <Card className="row-span-2 p-10 flex flex-col group">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6 group-hover:bg-amber-500 group-hover:text-white transition-all">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-text-primary mb-4">Difficulty Levels</h3>
                <p className="text-text-muted mb-10 leading-relaxed">Questions that scale with your journey.</p>

                <div className="space-y-4 mt-auto">
                  {[
                    { icon: GraduationCap, label: 'Beginner', color: 'emerald' },
                    { icon: Zap, label: 'Intermediate', color: 'amber' },
                    { icon: Flame, label: 'Expert', color: 'rose' }
                  ].map((level) => (
                    <div key={level.label} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-primary-bg/50">
                      <div className={`p-2 rounded-lg bg-${level.color}-500/10 text-${level.color}-500`}>
                        <level.icon className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-sm text-text-primary">{level.label}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Smart Scoring */}
              <Card className="p-10 flex flex-col group">
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-6 group-hover:bg-violet-500 group-hover:text-white transition-all">
                  <BarChart2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-2">Smart Scoring</h3>
                <p className="text-text-muted text-sm mb-6">Relevance, Fluency and Confidence.</p>

                <div className="space-y-3 mt-auto">
                  {[75, 90, 60].map((w, i) => (
                    <div key={i} className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full" style={{ width: `${w}%` }} />
                    </div>
                  ))}
                </div>
              </Card>

              {/* Full History */}
              <Card className="p-10 flex flex-col group">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6 group-hover:bg-cyan-500 group-hover:text-white transition-all">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-2">Full History</h3>
                <p className="text-text-muted text-sm leading-relaxed">
                  Every session saved. Review anytime.
                </p>
                <div className="flex gap-2 mt-auto">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-[8px] font-bold text-text-muted">
                      AI
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full bg-accent-light/30 border border-accent/20" />
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-32 bg-primary-bg">
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="grid md:grid-cols-3 gap-12 relative">
              {/* Dotted Line connector */}
              <div className="hidden md:block absolute top-[60px] left-[15%] right-[15%] h-px border-t-2 border-dotted border-border z-0" />

              {[
                { step: '01', title: 'Set your level', desc: 'Choose your desired difficulty and role.', icon: GraduationCap },
                { step: '02', title: 'Answer with voice', desc: 'AI asks the questions, you just speak.', icon: Mic },
                { step: '03', title: 'Get your score', desc: 'Receive instant, detailed breakdown.', icon: BarChart2 }
              ].map((step, i) => (
                <div key={i} className="relative z-10 flex flex-col items-center text-center space-y-4">
                  <div className="text-6xl font-black text-border absolute -top-4 opacity-50 select-none">{step.step}</div>
                  <div className="w-14 h-14 rounded-2xl bg-primary-surface border-2 border-accent flex items-center justify-center text-accent shadow-xl">
                    <step.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary pt-2">{step.title}</h3>
                  <p className="text-text-muted text-sm leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-primary-secondary">
        <div className="container mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-text-muted text-sm">
            &copy; 2026 Convoo &middot; Built for interview success
          </div>

          <div className="flex items-center gap-8">
            <Link to="/privacy" className="text-xs text-text-muted hover:text-text-primary transition-all">Privacy</Link>
            <Link to="/terms" className="text-xs text-text-muted hover:text-text-primary transition-all">Terms</Link>
            <ThemeToggle />
          </div>
        </div>
      </footer>
    </div>
  )
}
