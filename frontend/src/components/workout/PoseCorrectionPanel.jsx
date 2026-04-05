import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, VolumeX, Activity } from 'lucide-react'

/**
 * PoseCorrectionPanel
 * Props:
 *   feedbacks: [{joint, status, cue, angle}]
 *   formScore: number (0-100)
 *   isActive: boolean
 */
export default function PoseCorrectionPanel({ feedbacks = [], formScore = 0, isActive }) {
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const lastSpokenCue = useRef(null)
  const speechTimeout = useRef(null)

  // Voice feedback — only speak new BAD/WARN cues when voice is enabled
  useEffect(() => {
    if (!voiceEnabled || !isActive || !window.speechSynthesis) return
    const badCues = feedbacks.filter(f => f.status === 'BAD' || f.status === 'WARN').map(f => f.cue)
    if (badCues.length === 0) return

    const cueToSpeak = badCues[0]
    if (cueToSpeak === lastSpokenCue.current) return

    clearTimeout(speechTimeout.current)
    speechTimeout.current = setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(cueToSpeak.replace(/[✅⚠️]/g, '').trim())
      utterance.rate = 0.92
      utterance.pitch = 1.05
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(utterance)
      lastSpokenCue.current = cueToSpeak
    }, 1200)

    return () => clearTimeout(speechTimeout.current)
  }, [feedbacks, voiceEnabled, isActive])

  // Stop voice when session ends
  useEffect(() => {
    if (!isActive && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      lastSpokenCue.current = null
    }
  }, [isActive])

  if (!isActive) return null

  const scoreColor = formScore >= 80 ? '#22c55e' : formScore >= 50 ? '#f59e0b' : '#ef4444'
  const hasFeedback = feedbacks.length > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

      {/* Form score card */}
      <div style={{ background: 'rgba(17,19,24,0.9)', border: `1px solid ${scoreColor}30`, borderRadius: '14px', padding: '16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', fontWeight: 700, color: '#6b7280', letterSpacing: '1px' }}>
            <Activity size={13} color="#7c3aed" /> FORM SCORE
          </div>
          {/* Voice toggle */}
          <button
            onClick={() => setVoiceEnabled(v => !v)}
            title={voiceEnabled ? 'Mute voice coaching' : 'Enable voice coaching'}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '8px', background: voiceEnabled ? 'rgba(124,58,237,0.12)' : 'transparent', border: voiceEnabled ? '1px solid rgba(124,58,237,0.3)' : '1px solid rgba(42,45,62,0.6)', color: voiceEnabled ? '#a855f7' : '#6b7280', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}
          >
            {voiceEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
            {voiceEnabled ? 'Voice ON' : 'Voice OFF'}
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '28px', fontWeight: 900, color: scoreColor, letterSpacing: '-1px', lineHeight: 1 }}>
            {hasFeedback ? `${Math.round(formScore)}%` : '—'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ height: '5px', background: 'rgba(42,45,62,0.8)', borderRadius: '5px', overflow: 'hidden' }}>
              <motion.div
                animate={{ width: `${formScore}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                style={{ height: '100%', background: `linear-gradient(90deg,${scoreColor},${scoreColor}99)`, borderRadius: '5px' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Coaching cues */}
      {hasFeedback && (
        <div style={{ background: 'rgba(17,19,24,0.9)', border: '1px solid rgba(42,45,62,0.6)', borderRadius: '14px', padding: '14px 16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', letterSpacing: '1px', marginBottom: '10px' }}>COACHING CUES</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <AnimatePresence mode="sync">
              {feedbacks.slice(0, 3).map((fb, i) => {
                const bg = fb.status === 'GOOD'
                  ? 'rgba(34,197,94,0.08)' : fb.status === 'WARN'
                  ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)'
                const border = fb.status === 'GOOD'
                  ? 'rgba(34,197,94,0.25)' : fb.status === 'WARN'
                  ? 'rgba(245,158,11,0.25)' : 'rgba(239,68,68,0.25)'
                const textColor = fb.status === 'GOOD' ? '#22c55e' : fb.status === 'WARN' ? '#f59e0b' : '#ef4444'
                return (
                  <motion.div
                    key={`${fb.joint}-${fb.status}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2, delay: i * 0.05 }}
                    style={{ padding: '10px 12px', borderRadius: '10px', background: bg, border: `1px solid ${border}` }}
                  >
                    <div style={{ fontSize: '13px', color: textColor, fontWeight: 600, lineHeight: 1.5 }}>
                      {fb.cue}
                    </div>
                    <div style={{ fontSize: '11px', color: '#4b5563', marginTop: '3px' }}>
                      {fb.joint} · {fb.angle}°
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  )
}
