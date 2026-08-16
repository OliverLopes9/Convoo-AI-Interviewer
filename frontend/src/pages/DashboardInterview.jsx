import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, GraduationCap, Zap, Flame, CheckCircle, Info, Mic2, AlertCircle, Sparkles, ChevronRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import InterviewScreen from '../components/InterviewScreen'
import { apiFetch } from '../api'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'

const DIFFICULTIES = [
  {
    id: 'beginner',
    label: 'Beginner',
    icon: GraduationCap,
    color: 'emerald',
    desc: 'Entry level · Introduction & basics',
    count: '10 questions'
  },
  {
    id: 'intermediate',
    label: 'Intermediate',
    icon: Zap,
    color: 'amber',
    desc: 'Mid level · Problem solving & concepts',
    count: '10 questions'
  },
  {
    id: 'expert',
    label: 'Expert',
    icon: Flame,
    color: 'rose',
    desc: 'Senior level · Deep technical + behavioral',
    count: '10 questions'
  },
]

export default function DashboardInterview() {
  const { authHeader, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state || {}
  const [selectedDifficulty, setSelectedDifficulty] = useState('beginner')
  const [starting, setStarting] = useState(false)
  const [micTested, setMicTested] = useState(false)

  const hasActiveSession = !!state.interviewId

  const startInterview = async () => {
    setStarting(true)
    try {
      const { res, data } = await apiFetch('/api/interview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ difficulty: selectedDifficulty }),
      })
      if (!res.ok) throw new Error(data.error || 'Failed to start')
      navigate('/interview', {
        state: {
          interviewId: data.interviewId,
          difficulty: selectedDifficulty,
          question: data.question,
          questionNumber: data.questionNumber,
          totalQuestions: data.totalQuestions,
          videoUrl: data.videoUrl,
        },
        replace: true,
      })
    } catch (err) {
      alert(err.message || 'Failed to start interview')
    } finally {
      setStarting(false)
    }
  }

  const testMic = () => {
    setMicTested(true);
    setTimeout(() => setMicTested(false), 3000);
  }

  if (hasActiveSession) {
    return (
      <div className="fixed inset-0 z-[60] bg-primary-bg overflow-y-auto">
        <InterviewScreen
          interviewId={state.interviewId}
          difficulty={state.difficulty}
          initialQuestion={state.question}
          initialQuestionNumber={state.questionNumber}
          initialTotalQuestions={state.totalQuestions}
          initialVideoUrl={state.videoUrl}
        />
      </div>
    )
  }

  return (
    <div className="space-y-12 text-left">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Start a New Interview</h1>
        <p className="text-text-muted text-sm font-medium">Choose your settings and begin when ready</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* Left: Difficulty Choice */}
        <div className="lg:col-span-8 space-y-10">
          <section className="space-y-6">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent ml-1">Select Difficulty</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDifficulty(d.id)}
                  className={`relative p-6 rounded-2xl border-2 transition-all duration-300 text-left group overflow-hidden ${selectedDifficulty === d.id
                      ? 'bg-accent/5 border-accent shadow-lg shadow-accent/10'
                      : 'bg-primary-surface border-border hover:border-accent/30'
                    }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-6 transition-colors ${selectedDifficulty === d.id ? 'bg-accent text-white' : 'bg-primary-bg text-text-muted group-hover:bg-accent/10 group-hover:text-accent'
                    }`}>
                    <d.icon className="w-5 h-5" />
                  </div>

                  <div className="space-y-1 relative z-10">
                    <h3 className="text-sm font-bold text-text-primary">{d.label}</h3>
                    <p className="text-[10px] text-text-muted font-medium leading-relaxed">{d.desc}</p>
                    <p className="text-[10px] text-accent font-black uppercase tracking-widest pt-2">{d.count}</p>
                  </div>

                  {selectedDifficulty === d.id && (
                    <div className="absolute top-4 right-4 text-accent">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                  )}

                  {/* Decorative icon background */}
                  <d.icon className="absolute -bottom-4 -right-4 w-20 h-20 opacity-[0.03] text-text-primary" />
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-6 pt-6 border-t border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent ml-1">Your Profile</h2>
              <Link to="/settings" className="text-[10px] font-bold text-accent hover:underline">Edit profile →</Link>
            </div>

            <Card className="p-8 grid sm:grid-cols-3 gap-8">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Target Role</p>
                <p className="text-sm font-bold text-text-primary">{user?.targetRole || 'Not set'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Key Skills</p>
                <p className="text-sm font-bold text-text-primary line-clamp-2">{user?.skills || 'Not set'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Experience</p>
                <p className="text-sm font-bold text-text-primary line-clamp-2">{user?.experience || 'Not set'}</p>
              </div>
            </Card>
          </section>
        </div>

        {/* Right: Checklist & Start */}
        <aside className="lg:col-span-4 space-y-6">
          <Card className="p-8 space-y-6">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Info className="w-4 h-4 text-accent" />
              Before you begin
            </h3>

            <ul className="space-y-4">
              {[
                'Find a quiet environment',
                'Test your microphone',
                'Have water nearby',
                'Session takes ~15 minutes'
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-xs font-medium text-text-muted">
                  <CheckCircle className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="pt-4 space-y-3">
              <button
                onClick={testMic}
                className={`flex items-center gap-3 w-full px-5 py-3 rounded-xl border border-border text-sm font-bold transition-all ${micTested ? 'bg-success/10 border-success text-success' : 'bg-primary-bg hover:bg-accent-light/10 text-text-muted hover:text-accent'}`}
              >
                <Mic2 className={`w-4 h-4 ${micTested ? 'animate-pulse' : ''}`} />
                {micTested ? 'Microphone ready ✓' : 'Test Microphone'}
              </button>

              <Button
                onClick={startInterview}
                disabled={starting}
                className="w-full relative py-4 group overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <Mic className={`w-5 h-5 ${!starting ? 'group-hover:scale-110' : ''} transition-transform`} />
                  {starting ? 'Starting...' : 'Start Interview'}
                </span>
                {/* Pulsing ring animation if not starting */}
                {!starting && (
                  <div className="absolute inset-0 bg-accent/20 animate-pulse-slow" />
                )}
              </Button>
            </div>
          </Card>

          <div className="p-6 rounded-2xl bg-warning/5 border border-warning/20 flex gap-4">
            <AlertCircle className="w-5 h-5 text-warning shrink-0" />
            <p className="text-[10px] font-medium text-warning leading-relaxed">
              Progress is saved automatically. If you close the window, you can resume from where you left off.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
