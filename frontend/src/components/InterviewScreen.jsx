import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Sparkles, Brain, Info, AlertCircle, PlayCircle, Home, ChevronRight, CheckCircle2, Timer as TimerIcon } from 'lucide-react'
import MicRecorder from './MicRecorder'
import AvatarPlayer from './AvatarPlayer'
import CountdownTimer from './CountdownTimer'
import { useAuth } from '../context/AuthContext'
import { apiUrl, apiFetch } from '../api'
import { Card } from './ui/Card'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'

const STATES = { idle: 'idle', listening: 'listening', processing: 'processing', avatarSpeaking: 'avatarSpeaking' }

const TOTAL_QUESTIONS = 10

export default function InterviewScreen({
  interviewId,
  difficulty = 'beginner',
  initialQuestion = '',
  initialQuestionNumber = 1,
  initialTotalQuestions = TOTAL_QUESTIONS,
  initialVideoUrl = '',
}) {
  const { authHeader } = useAuth()
  const navigate = useNavigate()
  const avatarRef = useRef(null)
  const [state, setState] = useState(initialQuestion ? STATES.avatarSpeaking : STATES.idle)
  const [isRecording, setIsRecording] = useState(false)
  const [replyText, setReplyText] = useState(initialQuestion)
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl || '')
  const [error, setError] = useState('')
  const [questionNumber, setQuestionNumber] = useState(initialQuestionNumber ?? 1)
  const [totalQuestions, setTotalQuestions] = useState(initialTotalQuestions ?? TOTAL_QUESTIONS)
  const [isComplete, setIsComplete] = useState(false)
  const [readyToFinish, setReadyToFinish] = useState(false)
  const [resultPayload, setResultPayload] = useState(null)
  const [hasPlayedFirst, setHasPlayedFirst] = useState(!initialQuestion)
  const [hasPlayed, setHasPlayed] = useState(false)
  const [timerPaused, setTimerPaused] = useState(false)

  useEffect(() => {
    setHasPlayed(false)
  }, [replyText])

  const handleAvatarEndedInternal = useCallback(() => {
    if (!hasPlayedFirst) setHasPlayedFirst(true)
    setHasPlayed(true)
    setState(STATES.idle)
  }, [hasPlayedFirst])

  const isBusy = useMemo(
    () => state === STATES.processing || state === STATES.avatarSpeaking || isComplete,
    [state, isComplete]
  )

  useEffect(() => {
    if (isRecording) setState(STATES.listening)
    else if (state === STATES.listening) setState(STATES.idle)
  }, [isRecording, state])

  const handleRecordingComplete = useCallback(
    async (blob) => {
      if (!interviewId || isComplete) return
      setState(STATES.processing)
      setTimerPaused(true)
      setError('')
      try {
        const formData = new FormData()
        formData.append('audio', blob, 'recording.webm')
        const transcribeRes = await fetch(apiUrl('/api/transcribe'), {
          method: 'POST',
          headers: authHeader,
          body: formData,
        })
        const transcribeData = await transcribeRes.json()
        const transcript = transcribeData?.transcription?.trim() || ''
        if (!transcript) {
          setError("Couldn't transcribe. Please try again.")
          setState(STATES.idle)
          return
        }
        const { res, data } = await apiFetch('/api/interview/answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeader },
          body: JSON.stringify({ interviewId, transcript }),
        })
        if (!res.ok) throw new Error(data?.error || 'Failed to submit answer')
        setReplyText(data.question)
        setVideoUrl(data.videoUrl || '')
        setQuestionNumber(data.questionNumber ?? questionNumber + 1)
        setTotalQuestions(data.totalQuestions ?? totalQuestions)
        if (data.isComplete) {
          setIsComplete(true)
          setResultPayload({
            scores: data.scores,
            strengths: data.strengths,
            improvements: data.improvements,
            finalFeedback: data.finalFeedback,
            difficulty,
          })
          setReadyToFinish(true)
        } else {
          setHasPlayed(false)
          setTimerPaused(false)
          setState(STATES.avatarSpeaking)
        }
      } catch (err) {
        setError(err?.message || 'Something went wrong')
        setState(STATES.idle)
      }
    },
    [interviewId, isComplete, authHeader, questionNumber, totalQuestions, difficulty]
  )

  const goToResults = useCallback(() => {
    navigate('/results', { state: resultPayload })
  }, [navigate, resultPayload])

  return (
    <div className="min-h-screen bg-primary-bg text-text-primary flex flex-col">
      {/* Immersive Top Bar */}
      <header className="h-20 border-b border-border bg-primary-surface/50 backdrop-blur-md px-8 flex items-center justify-between z-50">
        <div className="flex items-center gap-6">
          <Link to="/home" className="p-2 rounded-xl hover:bg-primary-bg transition-colors text-text-muted hover:text-text-primary">
            <Home className="w-5 h-5" />
          </Link>
          <div className="h-6 w-px bg-border hidden sm:block" />
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-text-muted">
            <span>Interview</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-text-primary">Session #{interviewId?.slice(-4)}</span>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-primary-bg border border-border">
            <TimerIcon className="w-4 h-4 text-accent" />
            <CountdownTimer totalSeconds={120} onTimeUp={() => { }} paused={timerPaused} isRecording={isRecording} />
          </div>

          <div className="flex items-center gap-1.5">
            {[...Array(totalQuestions)].map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-6 rounded-full transition-all duration-500 ${i + 1 < questionNumber ? 'bg-success' : i + 1 === questionNumber ? 'bg-accent grow' : 'bg-border'
                  }`}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Main Layout Area */}
      <main className="flex-1 overflow-hidden relative p-8">
        <div className="max-w-[1400px] mx-auto h-full grid lg:grid-cols-12 gap-8">

          {/* Left Content - AI & Subtitles */}
          <div className="lg:col-span-8 flex flex-col gap-6 h-full">
            <Card className="flex-1 p-0 overflow-hidden relative shadow-2xl bg-black group border-none">
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                <div className="px-4 py-2 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest">
                  AI Avatar Stream
                </div>
              </div>

              <AvatarPlayer
                ref={avatarRef}
                videoUrl={videoUrl}
                subtitle={replyText}
                isLoading={state === STATES.processing}
                onEnded={handleAvatarEndedInternal}
              />

              {/* Question Overlay - Redesigned */}
              <AnimatePresence>
                {(state === STATES.avatarSpeaking || state === STATES.idle) && replyText && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute bottom-8 left-8 right-8 z-20"
                  >
                    <div className="p-8 pb-10 rounded-3xl bg-black/40 backdrop-blur-2xl border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative overflow-hidden text-left">
                      <div className="flex items-start gap-6 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-white shrink-0 shadow-lg shadow-accent/40">
                          <Sparkles className="w-6 h-6" />
                        </div>
                        <div className="space-y-2">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-light opacity-80">Question {questionNumber}</span>
                          <p className="text-xl md:text-2xl font-bold text-white leading-tight">{replyText}</p>
                        </div>
                      </div>
                      {/* Animated wave line at bottom */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-[10px] font-bold uppercase tracking-widest flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5" />
                {error}
              </motion.div>
            )}
          </div>

          {/* Right Content Sidebar */}
          <aside className="lg:col-span-4 flex flex-col gap-6">
            <Card className="p-10 flex flex-col items-center justify-center bg-primary-surface border-accent/10 relative overflow-hidden min-h-[400px]">
              <div className="space-y-1 text-center mb-10 relative z-10">
                <h3 className="text-sm font-black uppercase tracking-widest text-text-primary">Voice Control</h3>
                <p className="text-xs font-medium text-text-muted">
                  {state === STATES.avatarSpeaking ? 'Interviewer is speaking...' : state === STATES.processing ? 'Analyzing your response...' : 'Your turn to speak'}
                </p>
              </div>

              <div className="relative z-10">
                <MicRecorder
                  onRecordingComplete={handleRecordingComplete}
                  isRecording={isRecording}
                  onRecordingChange={setIsRecording}
                  disabled={isBusy}
                />
              </div>

              <div className="mt-10 flex flex-col gap-4 w-full relative z-10">
                <div className="flex items-center justify-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${state === STATES.listening ? 'bg-danger animate-ping' : 'bg-success'}`} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">{state === STATES.listening ? 'System Listening' : 'System Ready'}</span>
                </div>

                {replyText && !isComplete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => avatarRef.current?.play()}
                    disabled={state === STATES.avatarSpeaking || state === STATES.processing}
                    className="mx-auto"
                  >
                    <PlayCircle className="w-4 h-4 mr-2" /> Replay Question
                  </Button>
                )}
              </div>

              {/* Decorative background grid */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--accent) 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
            </Card>

            <Card className="p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                  <Info className="w-4 h-4" />
                </div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-text-primary">Interview Tips</h4>
              </div>
              <ul className="space-y-4">
                {[
                  'Keep eye contact with the avatar',
                  'Use the STAR method for examples',
                  'Speak clearly and pause for emphasis',
                  'Answer duration: 1-2 minutes'
                ].map((tip, i) => (
                  <li key={i} className="flex gap-3 text-xs font-medium text-text-muted leading-relaxed group">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0 group-hover:scale-110 transition-transform" />
                    {tip}
                  </li>
                ))}
              </ul>
            </Card>
          </aside>
        </div>
      </main>

      {/* Completion Modal / Overlay */}
      <AnimatePresence>
        {isComplete && readyToFinish && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="max-w-md w-full"
            >
              <Card className="p-12 text-center space-y-8 border-accent/20">
                <div className="w-20 h-20 rounded-3xl bg-accent text-white flex items-center justify-center mx-auto shadow-2xl shadow-accent/40">
                  <Sparkles className="w-10 h-10" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-3xl font-bold text-text-primary tracking-tight">Well Done!</h2>
                  <p className="text-text-muted text-sm font-medium leading-relaxed">
                    You've successfully completed the interview. Your answers have been analyzed by our AI.
                  </p>
                </div>
                <Button
                  size="lg"
                  onClick={goToResults}
                  className="w-full py-4 rounded-full"
                >
                  View My Performance
                </Button>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
