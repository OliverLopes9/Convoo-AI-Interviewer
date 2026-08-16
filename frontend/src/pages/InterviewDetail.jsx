import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Target, TrendingUp, Star, MessageCircle, Calendar, Sparkles, User, Brain } from 'lucide-react'
import ProtectedRoute from '../components/ProtectedRoute'
import { useAuth } from '../context/AuthContext'

export default function InterviewDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { authHeader } = useAuth()
  const [interview, setInterview] = useState(location.state?.interview)
  const [loading, setLoading] = useState(!interview)

  useEffect(() => {
    if (interview || !id) return
    fetch(`/api/interview/${id}`, { headers: authHeader })
      .then((r) => r.json())
      .then((data) => setInterview(data))
      .catch(() => setInterview(null))
      .finally(() => setLoading(false))
  }, [id, interview, authHeader])

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-600/20 border-t-primary-600" />
        </div>
      </ProtectedRoute>
    )
  }

  if (!interview) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center p-10 bg-surface rounded-3xl border border-white/5 shadow-2xl">
            <p className="text-slate-400 mb-6 font-medium">Interview record not found.</p>
            <button
              onClick={() => navigate('/home')}
              className="px-6 py-2.5 rounded-xl bg-violet-600 text-white font-bold hover:bg-violet-500 transition-all shadow-lg shadow-violet-600/20"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  const scores = interview.scores || {}
  const qa = (interview.questions || []).map((q, i) => ({ question: q, answer: (interview.answers || [])[i] ?? '' }))

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-slate-300 py-10 lg:py-16">
        <div className="max-w-4xl mx-auto px-6">
          <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                title="Go Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Session Review</h1>
                <p className="text-slate-500 text-sm capitalize">{interview.difficulty} Level • {new Date(interview.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-xs font-bold uppercase tracking-widest text-slate-400">
              <Calendar className="w-4 h-4" />
              History
            </div>
          </header>

          <main className="space-y-10">
            {/* Summary Statistics */}
            {interview.status === 'completed' && (
              <motion.section
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="convoo-card p-10 bg-gradient-to-br from-violet-900/10 to-transparent"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-bold text-white tracking-tight">AI Evaluation</h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {[
                    { icon: Target, label: 'Relevance', value: scores.relevance, color: 'text-cyan-400' },
                    { icon: TrendingUp, label: 'Fluency', value: scores.fluency, color: 'text-emerald-400' },
                    { icon: Star, label: 'Confidence', value: scores.confidence, color: 'text-amber-400' },
                    { icon: MessageCircle, label: 'Overall', value: scores.overall, color: 'text-violet-400' },
                  ].map((stat) => (
                    <div key={stat.label} className="convoo-card p-4 bg-white/[0.02] hover:bg-white/[0.05]">
                      <stat.icon className={`w-4 h-4 mb-3 ${stat.color}`} />
                      <div className="text-2xl font-bold text-white">{stat.value ?? '—'}/10</div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {interview.finalFeedback && (
                  <div className="pt-8 border-t border-white/5 relative">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 shrink-0">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Final Conclusion</h4>
                        <p className="text-slate-300 leading-relaxed italic border-l border-violet-600/30 pl-6">{interview.finalFeedback}</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.section>
            )}

            {/* Q&A Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="convoo-card p-0 overflow-hidden"
            >
              <div className="p-8 border-b border-white/5 bg-white/[0.01] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800/50 border border-white/5 flex items-center justify-center text-slate-400 font-bold">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight">Full Transcript & Answers</h2>
              </div>

              <div className="p-8">
                <ul className="space-y-12">
                  {qa.map((item, i) => (
                    <li key={i} className="relative pl-10">
                      {/* Interaction connector */}
                      <div className="absolute left-[18px] top-6 bottom-[-24px] w-0.5 bg-gradient-to-b from-violet-600/30 via-white/5 to-transparent last:bg-none" />

                      <div className="space-y-6">
                        {/* Question */}
                        <div className="relative">
                          <div className="absolute -left-10 top-0 w-9 h-9 rounded-xl bg-surface border border-white/10 flex items-center justify-center text-violet-400 shadow-xl">
                            <Brain className="w-4 h-4" />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-violet-500">AI Interviewer • Q{i + 1}</span>
                            <p className="text-white font-medium text-lg leading-relaxed">{item.question}</p>
                          </div>
                        </div>

                        {/* Answer */}
                        <div className="relative">
                          <div className="absolute -left-10 top-0 w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-xl">
                            <User className="w-4 h-4" />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Your Response</span>
                            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 text-slate-300 text-sm leading-relaxed">
                              {item.answer ? item.answer : <span className="text-slate-600 italic">No response captured.</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.section>
          </main>

          <footer className="mt-16 pt-8 border-t border-white/5 text-center">
            <button
              onClick={() => navigate('/home')}
              className="text-sm font-bold text-slate-500 hover:text-white transition-colors"
            >
              Back to Dashboard
            </button>
          </footer>
        </div>
      </div>
    </ProtectedRoute>
  )
}
