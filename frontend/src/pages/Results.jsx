import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Target, TrendingUp, Star, MessageCircle, CheckCircle, Brain, AlertCircle, Sparkles, Home, ChevronRight } from 'lucide-react'
import ProtectedRoute from '../components/ProtectedRoute'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'

export default function Results() {
  const location = useLocation()
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)

  const state = location.state || {}
  const scores = state.scores || {}
  const overall = scores.overall ?? 0
  const relevance = scores.relevance ?? 0
  const fluency = scores.fluency ?? 0
  const confidence = scores.confidence ?? 0
  const strengths = state.strengths || ''
  const improvements = state.improvements || ''
  const finalFeedback = state.finalFeedback || ''
  const difficulty = state.difficulty || ''

  useEffect(() => {
    if (!state.scores && !state.finalFeedback) {
      navigate('/home', { replace: true })
      return
    }
    setMounted(true)
  }, [state.scores, state.finalFeedback, navigate])

  if (!mounted) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-primary-bg flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-accent/20 border-t-accent" />
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-primary-bg text-text-primary py-10 lg:py-16 text-left">
        <div className="max-w-4xl mx-auto px-6 space-y-12">
          <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate('/home')}
                className="w-12 h-12 rounded-xl bg-primary-surface border border-border flex items-center justify-center text-text-muted hover:text-text-primary hover:border-accent/40 shadow-sm transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Interview Results</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={difficulty}>{difficulty}</Badge>
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Level Session</span>
                </div>
              </div>
            </div>

            <Link to="/home">
              <Button variant="ghost" size="sm">Back to Dashboard</Button>
            </Link>
          </header>

          <main className="space-y-8">
            {/* Overall Score Card */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-12 bg-gradient-to-br from-accent/10 to-transparent border-accent/20 relative overflow-hidden shadow-2xl">
                <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                  <div className={`w-36 h-36 rounded-3xl flex flex-col items-center justify-center border-4 border-white/10 shadow-2xl relative overflow-hidden ${overall >= 7 ? 'bg-success text-white' : overall >= 4 ? 'bg-warning text-white' : 'bg-danger text-white'
                    }`}>
                    <span className="text-5xl font-black">{overall}</span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">Score</span>
                  </div>

                  <div className="flex-1 text-center md:text-left space-y-6">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold tracking-tight">Great performance!</h2>
                      <p className="text-text-muted font-medium leading-relaxed max-w-xl">
                        You demonstrated solid understanding and clear articulation. Based on the {difficulty} parameters, here is your breakdown.
                      </p>
                    </div>

                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                      {[
                        { icon: Target, label: 'Relevance', value: relevance, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
                        { icon: TrendingUp, label: 'Fluency', value: fluency, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                        { icon: Star, label: 'Confidence', value: confidence, color: 'text-warning', bg: 'bg-warning/10' },
                      ].map((stat) => (
                        <div key={stat.label} className="flex items-center gap-4 px-5 py-3 rounded-2xl bg-primary-surface border border-border shadow-sm">
                          <div className={`w-8 h-8 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center`}>
                            <stat.icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-base font-bold text-text-primary block">{stat.value}/10</span>
                            <span className="text-[10px] text-text-muted font-black uppercase tracking-widest">{stat.label}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Decorative */}
                <Sparkles className="absolute -top-6 -right-6 w-32 h-32 text-accent opacity-[0.05] rotate-12" />
              </Card>
            </motion.section>

            {/* Detailed Feedback Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              {strengths && (
                <motion.section
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="p-10 h-full border-success/20">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center shadow-sm">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-bold tracking-tight">Strengths</h3>
                    </div>
                    <p className="text-text-muted text-sm font-medium leading-relaxed">{strengths}</p>
                  </Card>
                </motion.section>
              )}

              {improvements && (
                <motion.section
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <Card className="p-10 h-full border-danger/20">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 rounded-xl bg-danger/10 text-danger flex items-center justify-center shadow-sm">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-bold tracking-tight">Improvements</h3>
                    </div>
                    <p className="text-text-muted text-sm font-medium leading-relaxed">{improvements}</p>
                  </Card>
                </motion.section>
              )}
            </div>

            {finalFeedback && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-10 bg-primary-surface overflow-hidden relative border-none shadow-xl">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold tracking-tight">AI Overall Analysis</h3>
                  </div>
                  <div className="relative">
                    <p className="text-text-primary text-lg font-medium leading-relaxed italic pl-8 border-l-4 border-accent/20 py-2">
                      "{finalFeedback}"
                    </p>
                  </div>
                  {/* Decorative background logo */}
                  <Brain className="absolute -bottom-10 -right-10 w-48 h-48 text-accent opacity-[0.02]" />
                </Card>
              </motion.section>
            )}

            <div className="pt-8">
              <Button
                onClick={() => navigate('/home')}
                className="w-full py-5 rounded-3xl text-lg relative group overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Back to Dashboard <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
