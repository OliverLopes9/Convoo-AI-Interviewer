import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TrendingUp, BarChart2, ChevronRight, Activity, Calendar, Award, Star, ArrowUpRight } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../api'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'

export default function DashboardAnalytics() {
  const navigate = useNavigate()
  const { authHeader } = useAuth()
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('Last 15')

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

  const completed = interviews.filter((i) => i.status === 'completed' && i.scores?.overall != null)
  const chartData = [...completed]
    .slice(0, 15)
    .reverse()
    .map((i, idx) => ({
      name: idx + 1,
      score: i.scores.overall,
      date: new Date(i.createdAt).toLocaleDateString(),
    }))

  const bestScore = completed.length ? Math.max(...completed.map(i => i.scores.overall)) : 0
  const avgScore = completed.length ? (completed.reduce((a, b) => a + b.scores.overall, 0) / completed.length).toFixed(1) : 0

  const difficultyData = [
    { name: 'Beginner', value: completed.filter(i => i.difficulty === 'beginner').length, color: '#10b981' },
    { name: 'Intermediate', value: completed.filter(i => i.difficulty === 'intermediate').length, color: '#f59e0b' },
    { name: 'Expert', value: completed.filter(i => i.difficulty === 'expert').length, color: '#f87171' }
  ].filter(d => d.value > 0)

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1 text-left">
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Performance Analytics</h1>
          <p className="text-text-muted text-sm font-medium">Visualize your growth and review past performance.</p>
        </div>

        <div className="flex p-1 bg-primary-secondary rounded-xl border border-border">
          {['Last 7', 'Last 15', 'All Time'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === f ? 'bg-primary-surface text-accent shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Sessions', value: completed.length, icon: Calendar, color: 'text-accent' },
          { label: 'Best Score', value: `${bestScore}/10`, icon: Award, color: 'text-warning' },
          { label: 'Average Score', value: `${avgScore}/10`, icon: Star, color: 'text-success' },
          { label: 'Improvement', value: '+14%', icon: TrendingUp, color: 'text-cyan-500' }
        ].map((stat, i) => (
          <Card key={i} className="p-6 flex flex-col gap-4">
            <div className={`w-8 h-8 rounded-lg bg-primary-bg border border-border flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">{stat.label}</p>
              <p className="text-xl font-bold text-text-primary mt-0.5">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Chart */}
      <Card className="p-8 lg:p-10">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary tracking-tight">Score Progression</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Last 15 Sessions</p>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border opacity-20" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="currentColor"
                className="text-text-muted"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                domain={[0, 10]}
                stroke="currentColor"
                className="text-text-muted"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                dx={-10}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                }}
                itemStyle={{ color: 'var(--text-primary)', fontSize: '12px', fontWeight: 'bold' }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="var(--accent)"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#scoreColor)"
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Secondary Row: Difficulty Distribution & Levels */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-10 flex flex-col md:flex-row items-center gap-10">
          <div className="w-48 h-48 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={difficultyData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {difficultyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-4 w-full text-left">
            <h3 className="text-lg font-bold text-text-primary tracking-tight">Difficulty Breakdown</h3>
            <div className="space-y-3">
              {['Beginner', 'Intermediate', 'Expert'].map(level => {
                const count = completed.filter(i => i.difficulty === level.toLowerCase()).length;
                const pct = completed.length ? Math.round((count / completed.length) * 100) : 0;
                return (
                  <div key={level} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-text-muted uppercase tracking-widest">
                      <span>{level}</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-primary-bg rounded-full overflow-hidden border border-border">
                      <div
                        className={`h-full rounded-full ${level === 'Beginner' ? 'bg-emerald-500' : level === 'Intermediate' ? 'bg-amber-500' : 'bg-rose-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* History Table */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 text-left">
          <div className="w-8 h-8 rounded-lg bg-primary-surface border border-border flex items-center justify-center text-text-muted">
            <Calendar className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-text-primary tracking-tight">Full History</h2>
        </div>

        <Card className="p-0 overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-text-muted font-medium">Loading history...</div>
          ) : interviews.length === 0 ? (
            <div className="p-20 text-center text-text-muted italic">No interviews recorded.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-primary-secondary/50 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted border-b border-border">
                    <th className="px-10 py-5">Date</th>
                    <th className="px-6 py-5">Difficulty</th>
                    <th className="px-6 py-5">Performance</th>
                    <th className="px-10 py-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {interviews.map((inv) => (
                    <tr
                      key={inv._id}
                      onClick={() => navigate(`/interview/${inv._id}`, { state: { viewOnly: true, interview: inv } })}
                      className="group cursor-pointer hover:bg-accent-light/5 transition-all text-left"
                    >
                      <td className="px-10 py-6">
                        <span className="text-sm font-bold text-text-primary">
                          {new Date(inv.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <Badge variant={inv.difficulty}>{inv.difficulty}</Badge>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-1 rounded-full bg-border overflow-hidden">
                            <div
                              className="h-full bg-accent transition-all duration-1000"
                              style={{ width: `${(inv.scores?.overall || 0) * 10}%` }}
                            />
                          </div>
                          <span className="text-xs font-black text-text-primary">{inv.scores?.overall ?? '—'} <span className="text-[10px] text-text-muted font-bold">/10</span></span>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <span className="text-xs font-bold text-accent group-hover:underline">View Results</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </section>
    </div>
  )
}
