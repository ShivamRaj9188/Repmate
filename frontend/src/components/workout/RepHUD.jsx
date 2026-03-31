import { motion, AnimatePresence } from 'framer-motion'
import { Activity, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react'

export default function RepHUD({ repCount, stage, posture, speed, isActive }) {
  const isGood = posture === 'GOOD'

  return (
    <div
      className="hud-overlay"
      style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
    >
      {/* Top row — stage + posture */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        {/* Stage badge */}
        {isActive && stage && (
          <AnimatePresence mode="wait">
            <motion.div
              key={stage}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                background: 'rgba(0,0,0,0.7)',
                border: '1px solid rgba(124,58,237,0.4)',
                color: '#a855f7',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '1.5px',
              }}
            >
              {stage}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Posture badge */}
        {isActive && posture && (
          <div
            className={isGood ? 'badge-good' : 'badge-bad'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              background: isGood ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
              border: `1px solid ${isGood ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)'}`,
              color: isGood ? '#22c55e' : '#ef4444',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.5px',
            }}
          >
            {isGood ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
            {isGood ? 'GOOD FORM' : 'FIX FORM'}
          </div>
        )}
      </div>

      {/* Bottom row — rep count + speed */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        {/* Big rep counter */}
        <div
          style={{
            background: 'rgba(0,0,0,0.75)',
            borderRadius: '16px',
            padding: '16px 24px',
            border: '1px solid rgba(124,58,237,0.3)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div style={{ color: '#6b7280', fontSize: '11px', fontWeight: 600, letterSpacing: '1.5px', marginBottom: '4px' }}>
            REPS
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={repCount}
              initial={{ scale: 1.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              style={{
                fontSize: '56px',
                fontWeight: 900,
                color: '#f3f4f6',
                lineHeight: 1,
                letterSpacing: '-2px',
              }}
            >
              {repCount}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Speed */}
        {isActive && (
          <div
            style={{
              background: 'rgba(0,0,0,0.75)',
              borderRadius: '12px',
              padding: '12px 18px',
              border: '1px solid rgba(42,45,62,0.6)',
              backdropFilter: 'blur(8px)',
              textAlign: 'right',
            }}
          >
            <div style={{ color: '#6b7280', fontSize: '11px', fontWeight: 600, letterSpacing: '1.5px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
              <TrendingUp size={11} /> AVG SPEED
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#a855f7', lineHeight: 1 }}>
              {speed > 0 ? `${speed}s` : '—'}
            </div>
            <div style={{ color: '#4b5563', fontSize: '11px', marginTop: '2px' }}>per rep</div>
          </div>
        )}
      </div>
    </div>
  )
}
