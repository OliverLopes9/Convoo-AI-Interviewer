import React, { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Play, Pause } from 'lucide-react'

const MicRecorder = ({ onRecordingComplete, isRecording, onRecordingChange, disabled = false }) => {
  const [recording, setRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)

  const mediaRecorderRef = useRef(null)
  const audioRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  const startRecording = useCallback(async () => {
    try {
      if (disabled) return
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      })

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        onRecordingComplete(blob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setRecording(true)
      onRecordingChange(true)

      setRecordingTime(0)
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

    } catch (error) {
      console.error('Error accessing microphone:', error)
    }
  }, [onRecordingComplete, onRecordingChange, disabled])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop()
      setRecording(false)
      onRecordingChange(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [recording, onRecordingChange])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-6">
        {/* Subtle Wave Animation behind button */}
        <AnimatePresence>
          {recording && (
            <>
              <motion.div
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.8, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full border-2 border-violet-500/50"
              />
              <motion.div
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 2.2, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
                className="absolute inset-0 rounded-full border-2 border-violet-500/30"
              />
            </>
          )}
        </AnimatePresence>

        <motion.button
          onClick={disabled ? undefined : (recording ? stopRecording : startRecording)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={disabled}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 relative z-10 ${disabled
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-white/5'
              : recording
                ? 'bg-red-500 text-white shadow-xl shadow-red-500/30'
                : 'bg-violet-600 text-white shadow-xl shadow-violet-600/30 hover:bg-violet-500'
            }`}
        >
          {recording ? (
            <MicOff className="w-8 h-8" />
          ) : (
            <Mic className="w-8 h-8" />
          )}
        </motion.button>
      </div>

      <div className="text-center">
        {recording ? (
          <div className="flex items-center gap-2 text-red-500 font-bold tracking-tight">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Recording... {formatTime(recordingTime)}
          </div>
        ) : (
          <p className="text-slate-500 text-sm font-medium">
            {audioBlob ? 'Answer recorded' : (disabled ? 'AI is thinking...' : 'Click to start recording')}
          </p>
        )}
      </div>
    </div>
  )
}

export default MicRecorder
