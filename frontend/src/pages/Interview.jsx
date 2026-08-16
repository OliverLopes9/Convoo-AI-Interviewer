import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import InterviewScreen from '../components/InterviewScreen'
import ProtectedRoute from '../components/ProtectedRoute'

export default function Interview() {
  const navigate = useNavigate()
  const location = useLocation()
  const { interviewId, difficulty, question, questionNumber, totalQuestions, videoUrl } = location.state || {}

  if (!interviewId) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
          <div className="text-center text-gray-400">
            <p className="mb-4">No active interview. Start one from the dashboard.</p>
            <button onClick={() => navigate('/dashboard')} className="text-white hover:underline">Go to Dashboard</button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0f0f0f]">
        <header className="border-b border-white/5 bg-[#0f0f0f]/80 backdrop-blur">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" /> Back
            </button>
            <div className="text-center">
              <h1 className="text-lg font-semibold text-white capitalize">{difficulty || 'Interview'}</h1>
              <p className="text-xs text-gray-500">10 questions · AI interviewer</p>
            </div>
            <div className="w-16" />
          </div>
        </header>
        <main>
          <InterviewScreen
            interviewId={interviewId}
            difficulty={difficulty}
            initialQuestion={question}
            initialQuestionNumber={questionNumber}
            initialTotalQuestions={totalQuestions}
            initialVideoUrl={videoUrl}
          />
        </main>
      </div>
    </ProtectedRoute>
  )
}
