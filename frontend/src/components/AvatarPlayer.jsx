import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'

const AvatarPlayer = forwardRef(function AvatarPlayer({ videoUrl, onEnded, subtitle, isLoading }, ref) {
  const audioRef = useRef(null)
  const synthRef = useRef(null)
  const prevVideoUrlRef = useRef(null)
  const prevSubtitleRef = useRef(null)
  const [needsTap, setNeedsTap] = useState(false)

  // Expose play() so parent can trigger replay on demand
  useImperativeHandle(ref, () => ({
    play() {
      if (audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.play().catch(() => { })
      } else if (subtitle && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(subtitle)
        utterance.lang = 'en-US'
        utterance.rate = 0.9
        utterance.pitch = 1
        utterance.onend = () => { if (onEnded) onEnded() }
        window.speechSynthesis.speak(utterance)
      }
    }
  }), [subtitle, onEnded])

  useEffect(() => {
    const videoChanged = videoUrl !== prevVideoUrlRef.current
    const subtitleChanged = subtitle !== prevSubtitleRef.current

    // Only act when something actually changes
    if (!videoChanged && !subtitleChanged) return

    prevVideoUrlRef.current = videoUrl
    prevSubtitleRef.current = subtitle
    setNeedsTap(false)

    // Cancel any ongoing TTS
    if (synthRef.current) {
      synthRef.current.cancel()
    }

    // If no videoUrl but subtitle changed, use browser TTS (play once)
    if (!videoUrl && subtitle && !isLoading) {
      if ('speechSynthesis' in window) {
        synthRef.current = window.speechSynthesis
        const utterance = new SpeechSynthesisUtterance(subtitle)
        utterance.lang = 'en-US'
        utterance.rate = 0.9
        utterance.pitch = 1
        utterance.onend = () => {
          if (onEnded) onEnded()
        }
        utterance.onerror = () => {
          console.warn('Browser TTS failed')
          if (onEnded) onEnded()
        }
        synthRef.current.speak(utterance)
      }
      return
    }

    if (!videoUrl || !audioRef.current) return

    // New audio URL — load and play once
    const a = audioRef.current
    a.load()

    const tryPlay = async () => {
      try {
        await a.play()
      } catch (e) {
        // Autoplay blocked — show tap-to-play
        setNeedsTap(true)
      }
    }

    void tryPlay()
  }, [videoUrl, subtitle, isLoading, onEnded])

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [])

  const handleTapToPlay = async () => {
    if (audioRef.current) {
      try {
        await audioRef.current.play()
        setNeedsTap(false)
      } catch (e) {
        // no-op
      }
    } else if (subtitle && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(subtitle)
      utterance.lang = 'en-US'
      utterance.rate = 0.9
      utterance.onend = () => {
        if (onEnded) onEnded()
      }
      window.speechSynthesis.speak(utterance)
      setNeedsTap(false)
    }
  }

  return (
    <div className="w-full flex items-center justify-center">
      <div className="relative w-full max-w-3xl aspect-video rounded-2xl overflow-hidden bg-gray-950 shadow-lg border border-gray-800">
        {/* Simple animated avatar placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center shadow-lg">
              <div className={`w-14 h-14 rounded-full bg-gray-950 flex items-center justify-center ${videoUrl ? 'animate-pulse' : ''}`}>
                <span className="w-8 h-1.5 rounded-full bg-primary-400" />
              </div>
            </div>
            <div className="text-sm text-gray-300">
              {videoUrl ? 'Interviewer is speaking…' : 'Interviewer avatar'}
            </div>
          </div>
        </div>

        {/* Hidden audio element driving the avatar */}
        {videoUrl && (
          <audio
            ref={audioRef}
            src={videoUrl}
            onEnded={onEnded}
          />
        )}

        {/* Subtitle */}
        {subtitle && (
          <div className="absolute left-0 right-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
            <div className="text-center text-white text-sm md:text-base leading-relaxed drop-shadow">
              {subtitle}
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500 mx-auto mb-3" />
              <div className="text-gray-200 text-sm">Generating avatar response…</div>
            </div>
          </div>
        )}

        {/* Tap-to-play overlay */}
        {needsTap && videoUrl && !isLoading && (
          <button
            onClick={handleTapToPlay}
            className="absolute inset-0 bg-black/40 text-white flex items-center justify-center"
          >
            <div className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 backdrop-blur">
              Tap to play interviewer
            </div>
          </button>
        )}
      </div>
    </div>
  )
})

export default AvatarPlayer
