import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LINE_CHART_COMPONENT_IS_UNUSED } from 'recharts' // Removed unused import to simplify, but keeping line logic
import { Mic, ChevronRight, TrendingUp, BarChart3 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../api'
import ProtectedRoute from '../components/ProtectedRoute'
import DashboardLayout from '../components/DashboardLayout'

const DIFFICULTIES = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'expert', label: 'Expert' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

function DashboardContent() {
  const { authHeader } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [selectedDifficulty, setSelectedDifficulty] = useState('beginner')

  useEffect(() => {
    const token = localStorage.getItem('convoo_token')
    if (!token) return
    fetch('/interview/history', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setInterviews(data.interviews || []))
      .catch(() => setInterviews([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const id = location.hash?.slice(1)
    if (id) {
      const el = document.getElementById(id)
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [location.hash])

  const startInterview = async (difficulty) => {
    setStarting(true)
    try {
      const { data } = await apiFetch('/api/interview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ difficulty }),
      })

      navigate('/interview', {
        state: {
          interviewId: data.interviewId,
          difficulty,
          question: data.question,
          questionNumber: data.questionNumber,
          totalQuestions: data.totalQuestions,
          videoUrl: data.videoUrl,
        },
      })
    } catch (err) {
      alert(err.message || 'Failed to start interview')
    } finally {
      setStarting(false)
    }
  }

  const chartData = interviews
    .filter((i) => i.status === 'completed' && i.scores?.overall != null)
    .slice(0, 15)
    .reverse()
    .map((i, idx) => ({
      name: `#${idx + 1}`,
      score: i.scores.overall,
      date: new Date(i.createdAt).toLocaleDateString(),
    }))

  const getDifficultyBadgeClass = (d) => {
    switch (d) {
      case 'beginner':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'intermediate':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      case 'expert':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30'
      default:
        return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'
    }
  }

  return (
    <DashboardLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Hero: Start Interview */}
        <motion.section
          id="start"
          variants={itemVariants}
          className="relative rounded-2xl p-6 overflow-hidden border border-[#1f2937] bg-[#111827] shadow-lg shadow-black/20"
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-transparent to-cyan-400/10 pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent rounded-full" />
          <div className="relative">
            <h1 className="text-xl font-semibold text-zinc-100 mb-1">Start Interview</h1>
            <p className="text-zinc-400 text-sm mb-6 max-w-xl">
              Answer 10 personalized questions. Choose your difficulty—questions and evaluation are tailored to your level.
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {DIFFICULTIES.map((d) => (
                <motion.button
                  key={d.id}
                  onClick={() => setSelectedDifficulty(d.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${selectedDifficulty === d.id
                      ? 'bg-gradient-to-r from-indigo-500 to-cyan-400 text-white border-transparent shadow-lg shadow-indigo-500/25'
                      : 'bg-zinc-800/50 text-zinc-400 border-[#1f2937] hover:border-zinc-600 hover:text-zinc-300'
                    }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {d.label}
                </motion.button>
              ))}
            </div>
            <motion.button
              onClick={() => startInterview(selectedDifficulty)}
              disabled={starting}
              className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-400 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/30 transition-all duration-200 disabled:opacity-60"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Mic className="w-5 h-5" /> {starting ? 'Starting…' : 'Start Interview'}
            </motion.button>
          </div>
        </motion.section>

        {/* Score over time */}
        <motion.section
          id="progress"
          variants={itemVariants}
          className="rounded-2xl border border-[#1f2937] bg-[#111827] p-6 shadow-lg shadow-black/20"
        >
          <h2 className="text-xl font-semibold text-zinc-100 mb-1 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" /> Progress Analytics
          </h2>
          <p className="text-zinc-400 text-sm mb-6">Score over time</p>
          {chartData.length > 0 ? (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={12} />
                  <YAxis domain={[0, 10]} stroke="#71717a" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      border: '1px solid #1f2937',
                      borderRadius: 12,
                    }}
                    labelStyle={{ color: '#a1a1aa' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="url(#scoreGradient)"
                    strokeWidth={2}
                    dot={{ fill: '#6366f1' }}
                  />
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#22d3ee" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 px-4 rounded-xl bg-zinc-900/50 border border-[#1f2937] border-dashed"
            >
              <BarChart3 className="w-12 h-12 text-zinc-600 mb-3" />
              <p className="text-zinc-400 text-sm text-center max-w-xs">
                Complete interviews to visualize your progress.
              </p>
            </motion.div>
          )}
        </motion.section>

        {/* Past interviews */}
        <motion.section
          id="past"
          variants={itemVariants}
          className="rounded-2xl border border-[#1f2937] bg-[#111827] p-6 shadow-lg shadow-black/20"
        >
          <h2 className="text-xl font-semibold text-zinc-100 mb-1">Past Interviews</h2>
          <p className="text-zinc-400 text-sm mb-6">View details and scores</p>
          {loading ? (
            <div className="text-zinc-400 text-sm py-8">Loading…</div>
          ) : interviews.length === 0 ? (
            <p className="text-zinc-500 text-sm py-8">No interviews yet. Start your first one above.</p>
          ) : (
            <ul className="space-y-3">
              {interviews.map((inv) => (
                <motion.li
                  key={inv._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <button
                    onClick={() =>
                      navigate(`/interview/${inv._id}`, { state: { viewOnly: true, interview: inv } })
                    }
                    className="w-full flex items-center justify-between px-4 py-4 rounded-2xl bg-zinc-900/50 border border-[#1f2937] hover:bg-zinc-800/50 hover:border-zinc-700 transition-all duration-200 text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border capitalize ${getDifficultyBadgeClass(
                          inv.difficulty
                        )}`}
                      >
                        {inv.difficulty}
                      </span>
                      <span className="text-zinc-400 text-sm">
                        {new Date(inv.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {inv.status === 'completed' && (
                        <span className="text-sm font-medium text-zinc-100">
                          {inv.scores?.overall ?? '—'}/10
                        </span>
                      )}
                      <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </button>
                </motion.li>
              ))}
            </ul>
          )}
        </motion.section>

        {/* Settings placeholder for nav target */}
        <section id="settings" className="h-0 overflow-hidden" aria-hidden />
      </motion.div>
    </DashboardLayout>
  )
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
