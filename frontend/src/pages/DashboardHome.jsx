import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mic, Sparkles, BarChart2, TrendingUp, ChevronRight, Activity, ArrowUpRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../api'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1 } }),
}

export default function DashboardHome() {
  const { user, authHeader } = useAuth()
  const navigate = useNavigate()
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
      ; (async () => {
        try {
          const { res, data } = await apiFetch('/api/interview/history', { headers: { ...authHeader } })
          if (!res.ok) throw new Error(data.error || 'Failed to load history')
          if (!cancelled) setInterviews(data.interviews || [])
        } catch (_) {
          if (!cancelled) setInterviews([])
        } finally {
          if (!cancelled) setLoading(false)
        }
      })()
    return () => {
      cancelled = true
    }
  }, [authHeader])

  const completed = interviews.filter((i) => i.status === 'completed')
  const withScores = completed.filter((i) => i.scores?.overall != null)
  const totalInterviews = completed.length
  const latestScore = withScores.length ? withScores[withScores.length - 1].scores.overall : null
  const avgScore =
    withScores.length
      ? Math.round((withScores.reduce((a, i) => a + i.scores.overall, 0) / withScores.length) * 10) / 10
      : null
  const recentThree = [...interviews].slice(0, 3)

  return (
    <div className="space-y-10">
      {/* Greeting bar */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          Hello {user?.name?.split(' ')[0] || 'User'} 👋
        </h1>
        <p className="text-text-muted text-sm font-medium">Ready for your next session?</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Total Interviews */}
        <motion.div custom={0} variants={itemVariants} initial="hidden" animate="visible">
          <Card className="p-8 flex flex-col justify-between h-full group border-cyan-500/10 hover:border-cyan-500/30">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                <Activity className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                <ArrowUpRight className="w-3 h-3" />
                12%
              </div>
            </div>
            <div className="mt-8">
              <p className="text-4xl font-bold text-text-primary tracking-tighter">{totalInterviews}</p>
              <p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-1">sessions completed</p>
            </div>
          </Card>
        </motion.div>

        {/* Latest Score */}
        <motion.div custom={1} variants={itemVariants} initial="hidden" animate="visible">
          <Card className="p-8 flex flex-col justify-between h-full border-amber-500/10">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <TrendingUp className="w-5 h-5" />
              </div>
              {recentThree[0] && (
                <Badge variant={recentThree[0].difficulty}>{recentThree[0].difficulty}</Badge>
              )}
            </div>
            <div className="mt-8">
              <p className={`text-4xl font-bold tracking-tighter ${latestScore >= 7 ? 'text-success' : latestScore >= 4 ? 'text-warning' : 'text-danger'}`}>
                {latestScore != null ? `${latestScore}/10` : '—'}
              </p>
              <p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-1">latest session</p>
            </div>
          </Card>
        </motion.div>

        {/* Average Score */}
        <motion.div custom={2} variants={itemVariants} initial="hidden" animate="visible">
          <Card className="p-8 flex flex-col items-center justify-center h-full border-accent/10 relative overflow-hidden">
            {/* Circular Progress (CSS) */}
            <div className="relative w-24 h-24 mb-4">
              <svg className="w-full h-full -rotate-90">
                <circle cx="48" cy="48" r="40" className="stroke-border fill-none" strokeWidth="8" />
                <circle
                  cx="48" cy="48" r="40"
                  className="stroke-accent fill-none transition-all duration-1000 ease-out"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={2 * Math.PI * 40 * (1 - (avgScore || 0) / 10)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-text-primary">{avgScore || '—'}</span>
                <span className="text-[10px] font-bold text-text-muted">/10</span>
              </div>
            </div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest">overall average</p>
          </Card>
        </motion.div>
      </div>

      {/* AI Interviewer Banner */}
      <motion.section
        custom={3}
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="relative p-10 overflow-hidden bg-gradient-to-br from-accent/10 to-transparent border-accent/20">
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-10 z-10">
            <div className="flex items-start gap-6">
              <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center text-white shadow-xl shadow-accent/40 shrink-0">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-text-primary tracking-tight">Meet Your AI Interviewer</h2>
                <div className="flex flex-wrap gap-2">
                  {['Adaptive questions', 'Voice powered', 'Instant scoring'].map(tag => (
                    <span key={tag} className="px-2.5 py-1 rounded-md bg-accent-light/30 border border-accent/20 text-[10px] font-bold text-accent uppercase tracking-wider">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
            <Link to="/interview" className="w-full md:w-auto">
              <Button size="lg" className="w-full md:w-auto group rounded-full">
                Start Interview
                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          {/* Decorative BG */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-accent/5 blur-[100px] pointer-events-none rounded-full -translate-y-1/2 translate-x-1/4" />
        </Card>
      </motion.section>

      {/* Recent Activity */}
      <motion.section
        custom={4}
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary tracking-tight">Recent Activity</h2>
          <Link
            to="/analytics"
            className="text-sm font-bold text-accent hover:opacity-80 transition-opacity"
          >
            View all →
          </Link>
        </div>

        <Card className="p-0 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent/20 border-t-accent mx-auto mb-4" />
              <p className="text-text-muted text-sm font-medium">Loading history...</p>
            </div>
          ) : recentThree.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-20 h-20 rounded-full bg-primary-bg border border-border flex items-center justify-center text-text-muted mx-auto mb-6">
                <Mic className="w-10 h-10 opacity-20" />
              </div>
              <p className="text-text-primary font-bold mb-2">No interviews yet</p>
              <Button variant="ghost" size="sm" onClick={() => navigate('/interview')}>Start your first session</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-primary-secondary/50 text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted border-b border-border">
                    <th className="px-8 py-5">Session Date</th>
                    <th className="px-8 py-5">Difficulty</th>
                    <th className="px-8 py-5">Score</th>
                    <th className="px-8 py-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentThree.map((inv) => (
                    <tr
                      key={inv._id}
                      onClick={() => navigate(`/interview/${inv._id}`, { state: { viewOnly: true, interview: inv } })}
                      className="group cursor-pointer hover:bg-accent-light/5 transition-colors"
                    >
                      <td className="px-8 py-6">
                        <span className="text-sm font-bold text-text-primary">
                          {new Date(inv.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <Badge variant={inv.difficulty}>{inv.difficulty}</Badge>
                      </td>
                      <td className="px-8 py-6">
                        {inv.status === 'completed' ? (
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${inv.scores?.overall >= 7 ? 'bg-success' : inv.scores?.overall >= 4 ? 'bg-warning' : 'bg-danger'}`} />
                            <span className="text-sm font-bold text-text-primary">
                              {inv.scores?.overall ?? '—'} <span className="text-text-muted font-medium text-xs">/10</span>
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-text-muted font-bold uppercase tracking-widest italic opacity-50">In progress</span>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-accent group-hover:translate-x-1 transition-all ml-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </motion.section>
    </div>
  )
}
