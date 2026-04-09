import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play, Square, RotateCcw, CheckCircle, AlertCircle, Wifi, WifiOff,
  Lightbulb, Video, X, TrendingUp, Award, ArrowUpFromLine, ArrowDownUp, BicepsFlexed, ArrowUpSquare, Minus, Weight, MoveDiagonal, ArrowUpCircle
} from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import CameraFeed from '../components/workout/CameraFeed'
import RepHUD from '../components/workout/RepHUD'
import ExercisePicker from '../components/workout/ExercisePicker'
import PoseCorrectionPanel from '../components/workout/PoseCorrectionPanel'
import { useAuth } from '../context/AuthContext'
import { createSession, saveMetrics, completeSession } from '../services/workoutService'
import { EXERCISES } from '../lib/exerciseVideos'

const IconMap = { ArrowUpFromLine, ArrowDownUp, BicepsFlexed, ArrowUpSquare, Minus, Weight, MoveDiagonal, ArrowUpCircle }

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000'
const FPS = 12

export default function WorkoutPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [exercise, setExercise] = useState('PUSHUP')
  const [isRunning, setIsRunning] = useState(false)
  const [wsStatus, setWsStatus] = useState('idle')
  const [repCount, setRepCount] = useState(0)
  const [stage, setStage] = useState(null)
  const [posture, setPosture] = useState(null)
  const [speed, setSpeed] = useState(0)
  const [sessionId, setSessionId] = useState(null)
  const [toast, setToast] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [goodPostureCount, setGoodPostureCount] = useState(0)
  const [totalPostureFrames, setTotalPostureFrames] = useState(0)
  const [aiFrameReceived, setAiFrameReceived] = useState(false)

  // Section 3: Pose correction state
  const [formFeedbacks, setFormFeedbacks] = useState([])
  const [formScore, setFormScore] = useState(0)
  const [mlFormCorrect, setMlFormCorrect] = useState(true)
  const [mlScore, setMlScore] = useState(100)
  const [setHistory, setSetHistory] = useState([])     // [{score, repCount, exercise}]
  const [showSetSummary, setShowSetSummary] = useState(false)
  const [lastSetData, setLastSetData] = useState(null)

  // Section 6: Tutorial modal before start
  const [showTutorial, setShowTutorial] = useState(false)

  const cameraRef = useRef(null)
  const displayCanvasRef = useRef(null)
  const wsRef = useRef(null)
  const frameLoopRef = useRef(null)

  // Refs for closures
  const repCountRef = useRef(0)
  const speedRef = useRef(0)
  const goodPostureRef = useRef(0)
  const totalPostureRef = useRef(0)
  const formScoreRef = useRef(0)
  const formScoreHistoryRef = useRef([])
  const mlScoreHistoryRef = useRef([])

  const showToast = useCallback((msg, type = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }, [])

  useEffect(() => { repCountRef.current = repCount }, [repCount])
  useEffect(() => { speedRef.current = speed }, [speed])
  useEffect(() => { goodPostureRef.current = goodPostureCount }, [goodPostureCount])
  useEffect(() => { totalPostureRef.current = totalPostureFrames }, [totalPostureFrames])
  useEffect(() => { formScoreRef.current = formScore }, [formScore])

  const renderFrame = useCallback((base64Frame) => {
    const canvas = displayCanvasRef.current
    if (!canvas) return
    const img = new Image()
    img.onload = () => {
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      setAiFrameReceived(true)
    }
    img.src = base64Frame
  }, [])

  const startWorkout = async () => {
    setRepCount(0); setStage(null); setPosture(null); setSpeed(0)
    setGoodPostureCount(0); setTotalPostureFrames(0); setAiFrameReceived(false)
    setFormFeedbacks([]); setFormScore(0); setMlFormCorrect(true); setMlScore(100)
    repCountRef.current = 0; speedRef.current = 0
    goodPostureRef.current = 0; totalPostureRef.current = 0
    formScoreHistoryRef.current = []
    mlScoreHistoryRef.current = []

    let sid = null
    try {
      const session = await createSession(user.id, exercise)
      sid = session.id
      setSessionId(sid)
    } catch {
      showToast('Could not create session — backend may be offline', 'error')
    }

    setIsRunning(true)
    setWsStatus('connecting')

    const ws = new WebSocket(`${WS_URL}/ws/workout`)
    wsRef.current = ws

    ws.onopen = () => {
      setWsStatus('connected')
      ws.send(JSON.stringify({ type: 'init', exercise }))
      startFrameLoop()
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'ack') return
        if (data.type === 'set_summary') {
          // Post-set summary from AI
          return
        }
        if (data.frame) renderFrame(data.frame)
        if (data.count !== undefined) setRepCount(data.count)
        if (data.stage) setStage(data.stage)
        if (data.posture_status) {
          setPosture(data.posture_status)
          setTotalPostureFrames(p => p + 1)
          if (data.posture_status === 'GOOD') setGoodPostureCount(p => p + 1)
        }
        if (data.speed !== undefined) setSpeed(data.speed)
        // Section 3: form correction
        if (data.form_feedback !== undefined) setFormFeedbacks(data.form_feedback || [])
        if (data.form_score !== undefined) {
          setFormScore(data.form_score)
          if (data.form_score > 0) formScoreHistoryRef.current.push(data.form_score)
        }
        if (data.ml_form_correct !== undefined) setMlFormCorrect(data.ml_form_correct)
        if (data.ml_score !== undefined) {
          setMlScore(data.ml_score)
          if (data.ml_score > 0) mlScoreHistoryRef.current.push(data.ml_score)
        }
      } catch { /* ignore */ }
    }

    ws.onerror = () => setWsStatus('error')
    ws.onclose = () => {
      stopFrameLoop()
      setWsStatus('idle')
    }
  }

  const startFrameLoop = () => {
    const interval = 1000 / FPS
    frameLoopRef.current = setInterval(() => {
      const ws = wsRef.current
      if (!ws || ws.readyState !== WebSocket.OPEN) return
      const frame = cameraRef.current?.captureFrame()
      if (frame) ws.send(frame)
    }, interval)
  }

  const stopFrameLoop = () => {
    if (frameLoopRef.current) {
      clearInterval(frameLoopRef.current)
      frameLoopRef.current = null
    }
  }

  const stopWorkout = async () => {
    // Request set summary from AI before disconnecting
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'set_summary' }))
    }

    stopFrameLoop()
    if (wsRef.current) { wsRef.current.close(); wsRef.current = null }
    setIsRunning(false)
    setWsStatus('idle')

    const finalReps   = repCountRef.current
    const finalSpeed  = speedRef.current
    const finalGood   = goodPostureRef.current
    const finalTotal  = totalPostureRef.current
    const scores      = mlScoreHistoryRef.current.length > 0 ? mlScoreHistoryRef.current : formScoreHistoryRef.current
    const avgFormScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0

    // Build post-set summary
    const prevSet = setHistory[setHistory.length - 1] || null
    const setData = {
      exercise,
      repCount: finalReps,
      formScore: Math.round(avgFormScore),
      prevScore: prevSet?.formScore ?? null,
    }
    setLastSetData(setData)
    setSetHistory(h => [...h, setData])
    if (finalReps > 0) setShowSetSummary(true)

    if (sessionId && finalReps > 0) {
      setIsSaving(true)
      try {
        const accuracy = finalTotal > 0 ? parseFloat(((finalGood / finalTotal) * 100).toFixed(2)) : 0
        await saveMetrics(sessionId, finalReps, finalSpeed || 0, accuracy)
        await completeSession(sessionId)
        showToast('Session saved! Great work', 'success')
      } catch {
        showToast('Could not save session — backend may be offline', 'error')
      } finally {
        setIsSaving(false)
      }
    } else {
      showToast('Session ended. No reps recorded.', 'info')
    }
  }

  const reset = () => { setRepCount(0); setStage(null); setPosture(null); setSpeed(0); setFormFeedbacks([]); setFormScore(0); setMlScore(100); setMlFormCorrect(true); }

  useEffect(() => {
    return () => {
      stopFrameLoop()
      if (wsRef.current) wsRef.current.close()
    }
  }, [])

  const wsStatusColor = wsStatus === 'connected' ? '#22c55e' : wsStatus === 'error' ? '#ef4444' : '#f59e0b'
  const wsStatusLabel = { idle: 'Not connected', connecting: 'Connecting…', connected: 'AI Connected', error: 'Connection error' }

  // Find tutorial for current exercise
  const exerciseTutorial = EXERCISES.find(e => e.id === exercise.toLowerCase().replace('_', '-') || e.name.toLowerCase().includes(exercise.toLowerCase()))

  return (
    <div style={{ minHeight: '100svh', background: '#0a0b0f' }}>
      <Navbar />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            style={{ position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)', zIndex: 200, display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 20px', borderRadius: '12px', background: toast.type === 'success' ? 'rgba(34,197,94,0.15)' : toast.type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(124,58,237,0.15)', border: `1px solid ${toast.type === 'success' ? 'rgba(34,197,94,0.4)' : toast.type === 'error' ? 'rgba(239,68,68,0.4)' : 'rgba(124,58,237,0.4)'}`, color: toast.type === 'success' ? '#22c55e' : toast.type === 'error' ? '#ef4444' : '#a855f7', backdropFilter: 'blur(16px)', fontSize: '14px', fontWeight: 500, whiteSpace: 'nowrap' }}
          >
            {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Post-set Summary Modal */}
      <AnimatePresence>
        {showSetSummary && lastSetData && (
          <motion.div onClick={() => setShowSetSummary(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <motion.div onClick={e => e.stopPropagation()} initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} style={{ background: '#111318', border: '1px solid rgba(42,45,62,0.8)', borderRadius: '24px', padding: '36px', width: '100%', maxWidth: '420px', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(124,58,237,0.12)', border: '2px solid rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Award size={28} color="#a855f7" />
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#f3f4f6', margin: '0 0 6px' }}>Set Complete!</h2>
              <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 28px' }}>{lastSetData.exercise} · {lastSetData.repCount} reps</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
                  <div style={{ fontSize: '28px', fontWeight: 900, color: '#a855f7' }}>{lastSetData.formScore}%</div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Form Score</div>
                </div>
                <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <div style={{ fontSize: '28px', fontWeight: 900, color: '#22c55e' }}>{lastSetData.repCount}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Reps Done</div>
                </div>
              </div>

              {lastSetData.prevScore !== null && (
                <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <TrendingUp size={15} color="#f59e0b" />
                  <span style={{ fontSize: '13px', color: '#9ca3af' }}>
                    Form vs last set: <strong style={{ color: lastSetData.formScore >= lastSetData.prevScore ? '#22c55e' : '#ef4444' }}>
                      {lastSetData.formScore >= lastSetData.prevScore ? '+' : ''}{lastSetData.formScore - lastSetData.prevScore}%
                    </strong>
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => { setShowSetSummary(false); navigate('/history') }} className="btn-ghost" style={{ flex: 1, justifyContent: 'center', fontSize: '14px' }}>View History</button>
                <button onClick={() => setShowSetSummary(false)} className="btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: '14px' }}>Next Set</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tutorial Modal */}
      <AnimatePresence>
        {showTutorial && exerciseTutorial && (
          <motion.div onClick={() => setShowTutorial(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <motion.div onClick={e => e.stopPropagation()} initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} style={{ background: '#111318', border: '1px solid rgba(42,45,62,0.8)', borderRadius: '24px', width: '100%', maxWidth: '680px', maxHeight: '85vh', overflow: 'auto' }}>
              <div style={{ padding: '24px 28px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#f3f4f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {(() => {
                    const IconComponent = exerciseTutorial.iconName ? IconMap[exerciseTutorial.iconName] : null;
                    return IconComponent ? <IconComponent size={24} color="#a855f7" /> : null;
                  })()}
                  {exerciseTutorial.name} Tutorial
                </div>
                <button onClick={() => setShowTutorial(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}><X size={20} /></button>
              </div>
              <div style={{ padding: '20px 28px 28px' }}>
                <div style={{ position: 'relative', paddingTop: '56.25%', borderRadius: '14px', overflow: 'hidden', background: '#000', marginBottom: '20px' }}>
                  <iframe src={`https://www.youtube.com/embed/${exerciseTutorial.youtubeId}?rel=0&modestbranding=1`} title={exerciseTutorial.name} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} allowFullScreen />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                  {exerciseTutorial.tips.slice(0, 3).map((tip, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}>
                      <CheckCircle size={14} color="#22c55e" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ color: '#d1d5db', fontSize: '13px', lineHeight: 1.5 }}>{tip}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => { setShowTutorial(false); startWorkout() }} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
                  <Play size={15} /> Start Workout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#f3f4f6', margin: '0 0 6px', letterSpacing: '-1px' }}>Live Workout</h1>
          <p style={{ color: '#6b7280', fontSize: '15px', margin: 0 }}>Position your camera so your full body is visible, then start the session.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '28px', alignItems: 'start' }}>
          {/* Camera panel */}
          <div>
            <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(42,45,62,0.6)', boxShadow: isRunning ? '0 0 40px rgba(124,58,237,0.15)' : 'none', transition: 'box-shadow 0.4s ease' }}>
              <CameraFeed ref={cameraRef} isActive={isRunning} displayCanvasRef={displayCanvasRef} />
              {isRunning && (
                <div style={{ position: 'absolute', inset: 0 }}>
                  <RepHUD repCount={repCount} stage={stage} posture={posture} speed={speed} isActive={isRunning} mlFormCorrect={mlFormCorrect} mlScore={mlScore} />
                </div>
              )}
              {isRunning && (
                <div style={{ position: 'absolute', top: '14px', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'pulse-bad 1s infinite' }} />
                  <span style={{ color: '#f3f4f6', fontSize: '12px', fontWeight: 700, letterSpacing: '1px' }}>REC</span>
                </div>
              )}
            </div>
          </div>

          {/* Control panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* WS status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '10px', background: 'rgba(17,19,24,0.9)', border: '1px solid rgba(42,45,62,0.6)' }}>
              {wsStatus === 'connected' ? <Wifi size={14} color={wsStatusColor} /> : <WifiOff size={14} color={wsStatusColor} />}
              <span style={{ fontSize: '13px', fontWeight: 500, color: wsStatusColor }}>{wsStatusLabel[wsStatus]}</span>
            </div>

            {/* Exercise picker */}
            <div style={{ background: 'rgba(17,19,24,0.9)', border: '1px solid rgba(42,45,62,0.6)', borderRadius: '16px', padding: '18px' }}>
              <ExercisePicker value={exercise} onChange={setExercise} disabled={isRunning} />
            </div>

            {/* Rep counter card */}
            <div style={{ background: 'rgba(17,19,24,0.9)', border: '1px solid rgba(42,45,62,0.6)', borderRadius: '16px', padding: '24px 18px', textAlign: 'center' }}>
              <div style={{ color: '#6b7280', fontSize: '12px', fontWeight: 600, letterSpacing: '1.5px', marginBottom: '10px' }}>REPS COMPLETED</div>
              <div className="rep-ring" style={{ margin: '0 auto 14px' }}>
                <AnimatePresence mode="wait">
                  <motion.span key={repCount} initial={{ scale: 1.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 25 }} style={{ fontSize: '64px', fontWeight: 900, color: '#f3f4f6', letterSpacing: '-3px', lineHeight: 1 }}>
                    {repCount}
                  </motion.span>
                </AnimatePresence>
              </div>
              {stage && <div style={{ color: '#a855f7', fontSize: '12px', fontWeight: 700, letterSpacing: '1px' }}>STAGE: {stage}</div>}
            </div>

            {/* Speed + Form */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ background: 'rgba(17,19,24,0.9)', border: '1px solid rgba(42,45,62,0.6)', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                <div style={{ color: '#6b7280', fontSize: '11px', fontWeight: 600, letterSpacing: '1px', marginBottom: '5px' }}>SPEED</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: speed > 0 ? '#a855f7' : '#2a2d3e' }}>{speed > 0 ? `${speed}s` : '—'}</div>
              </div>
              <div style={{ background: 'rgba(17,19,24,0.9)', border: `1px solid ${(posture === 'LOW CONFIDENCE' || posture === 'TRACKING LOST') ? 'rgba(245,158,11,0.35)' : (mlFormCorrect ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.35)')}`, borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                <div style={{ color: '#6b7280', fontSize: '11px', fontWeight: 600, letterSpacing: '1px', marginBottom: '5px' }}>FORM</div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: (posture === 'LOW CONFIDENCE' || posture === 'TRACKING LOST') ? '#f59e0b' : (mlFormCorrect ? '#22c55e' : '#ef4444') }}>{(posture === 'LOW CONFIDENCE' || posture === 'TRACKING LOST') ? posture : (mlFormCorrect ? 'GOOD' : 'FIX')}</div>
              </div>
            </div>

            {/* Section 3: Pose correction panel */}
            <PoseCorrectionPanel feedbacks={formFeedbacks} formScore={formScore} isActive={isRunning} />

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {!isRunning ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button id="start-workout" className="btn-primary" onClick={startWorkout} style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px' }}>
                    <Play size={17} /> Start Session
                  </button>
                  {exerciseTutorial && (
                    <button onClick={() => setShowTutorial(true)} className="btn-ghost" style={{ width: '100%', justifyContent: 'center', padding: '11px', fontSize: '13px' }}>
                      <Video size={14} /> Watch Tutorial First
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <button id="stop-workout" className="btn-danger" onClick={stopWorkout} disabled={isSaving} style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px' }}>
                    <Square size={16} /> {isSaving ? 'Saving…' : 'Stop & Save'}
                  </button>
                  <button className="btn-ghost" onClick={reset} style={{ width: '100%', justifyContent: 'center', padding: '11px', fontSize: '13px' }}>
                    <RotateCcw size={14} /> Reset Counter
                  </button>
                </>
              )}
            </div>

            {/* Tips */}
            <div style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.2)' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#7c3aed', letterSpacing: '0.5px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lightbulb size={13} color="#7c3aed" /> TIPS
              </div>
              <ul style={{ margin: 0, padding: '0 0 0 16px', color: '#6b7280', fontSize: '12px', lineHeight: 1.8 }}>
                <li>Ensure good lighting on your body</li>
                <li>Keep your full body in frame</li>
                <li>Camera should be at a side angle</li>
                <li>Skeleton overlay shows Green (Good) / Yellow (Warning) / Red (Bad) joints</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
