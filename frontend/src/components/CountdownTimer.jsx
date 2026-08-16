import React, { useState, useEffect } from 'react'

export default function CountdownTimer({ totalSeconds, onTimeUp, paused = false, isRecording = false }) {
    const [secondsLeft, setSecondsLeft] = useState(totalSeconds)

    useEffect(() => {
        if (secondsLeft <= 0) {
            onTimeUp?.()
            return
        }
        const timer = setInterval(() => {
            if (!paused) {
                setSecondsLeft((prev) => Math.max(0, prev - 1))
            }
        }, 1000)
        return () => clearInterval(timer)
    }, [secondsLeft, onTimeUp, paused])

    const mins = Math.floor(secondsLeft / 60)
    const secs = secondsLeft % 60
    const isEmergency = secondsLeft < 30

    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/5 bg-white/[0.03] transition-colors ${isEmergency ? 'text-red-400 border-red-500/20' : 'text-slate-300'}`}>
            {isRecording && (
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
            )}
            <span className="text-xs font-bold font-mono tracking-wider tabular-nums">
                {mins}:{secs.toString().padStart(2, '0')}
            </span>
        </div>
    )
}
