import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Square, RotateCcw, CheckCircle, AlertCircle, Wifi, WifiOff, Lightbulb } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import CameraFeed from '../components/workout/CameraFeed'
import RepHUD from '../components/workout/RepHUD'
import ExercisePicker from '../components/workout/ExercisePicker'
import { useAuth } from '../context/AuthContext'
import { createSession, saveMetrics, completeSession } from '../services/workoutService'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000'
const FPS = 12 // frames per second sent to AI module

export default function WorkoutPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [exercise, setExercise] = useState('PUSHUP')
  const [isRunning, setIsRunning] = useState(false)
  const [wsStatus, setWsStatus] = useState('idle') // idle | connecting | connected | error
  const [repCount, setRepCount] = useState(0)
  const [stage, setStage] = useState(null)
  const [posture, setPosture] = useState(null)
  const [speed, setSpeed] = useState(0)
  const [sessionId, setSessionId] = useState(null)
  const [toast, setToast] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [goodPostureCount, setGoodPostureCount] = useState(0)
  const [totalPostureFrames, setTotalPostureFrames] = useState(0)

  const cameraRef = useRef(null)
  const displayCanvasRef = useRef(null)
  const wsRef = useRef(null)
  const frameLoopRef = useRef(null)
  // Keep a ref to repCount / speed so stopWorkout (which closes over stale state) gets fresh values
  const repCountRef = useRef(0)
  const speedRef = useRef(0)
  const goodPostureRef = useRef(0)
  const totalPostureRef = useRef(0)

  const showToast = useCallback((msg, type = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }, [])

  // Keep refs in sync with state so closures inside WebSocket handlers stay fresh
  useEffect(() => { repCountRef.current = repCount }, [repCount])
  useEffect(() => { speedRef.current = speed }, [speed])
  useEffect(() => { goodPostureRef.current = goodPostureCount }, [goodPostureCount])
  useEffect(() => { totalPostureRef.current = totalPostureFrames }, [totalPostureFrames])

  // Render AI-annotated frame onto display canvas
  const renderFrame = useCallback((base64Frame) => {
    const canvas = displayCanvasRef.current
    if (!canvas) return
    const img = new Image()
    img.onload = () => {
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      canvas.getContext('2d').drawImage(img, 0, 0)
    }
    img.src = base64Frame
  }, [])

  const startWorkout = async () => {
    setRepCount(0)
    setStage(null)
    setPosture(null)
    setSpeed(0)
    setGoodPostureCount(0)
    setTotalPostureFrames(0)
    repCountRef.current = 0
    speedRef.current = 0
    goodPostureRef.current = 0
    totalPostureRef.current = 0

    // Create session in backend
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

    // Open WebSocket to AI module
    const ws = new WebSocket(`${WS_URL}/ws/workout`)
    wsRef.current = ws

    ws.onopen = () => {
      setWsStatus('connected')
      // Fix: send exercise type as JSON init handshake so AI uses the correct counting logic
      ws.send(JSON.stringify({ type: 'init', exercise }))
      startFrameLoop()
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        // Ignore ack messages from AI init handshake
        if (data.type === 'ack') return
        if (data.frame) renderFrame(data.frame)
        if (data.count !== undefined) setRepCount(data.count)
        if (data.stage) setStage(data.stage)
        if (data.posture_status) {
          setPosture(data.posture_status)
          setTotalPostureFrames((p) => p + 1)
          if (data.posture_status === 'GOOD') setGoodPostureCount((p) => p + 1)
        }
        if (data.speed !== undefined) setSpeed(data.speed)
      } catch { /* ignore malformed messages */ }
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
    stopFrameLoop()
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setIsRunning(false)
    setWsStatus('idle')

    const finalReps = repCountRef.current
    const finalSpeed = speedRef.current
    const finalGood = goodPostureRef.current
    const finalTotal = totalPostureRef.current

    // Save metrics + mark session COMPLETED
    if (sessionId && finalReps > 0) {
      setIsSaving(true)
      try {
        const accuracy = finalTotal > 0
          ? parseFloat(((finalGood / finalTotal) * 100).toFixed(2))
          : 0
        // Save metrics
        await saveMetrics(sessionId, finalReps, finalSpeed || 0, accuracy)
        // Fix: mark session as COMPLETED (was permanently IN_PROGRESS)
        await completeSession(sessionId)
        showToast('Session saved! Great work', 'success')
        setTimeout(() => navigate('/history'), 1500)
      } catch {
        showToast('Could not save session — backend may be offline', 'error')
      } finally {
        setIsSaving(false)
      }
    } else {
      showToast('Session ended. No reps recorded.', 'info')
    }
  }

  const reset = () => {
    setRepCount(0)
    setStage(null)
    setPosture(null)
    setSpeed(0)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopFrameLoop()
      if (wsRef.current) wsRef.current.close()
    }
  }, [])

  const wsStatusColor = wsStatus === 'connected' ? '#22c55e' : wsStatus === 'error' ? '#ef4444' : '#f59e0b'
  const wsStatusLabel = { idle: 'Not connected', connecting: 'Connecting…', connected: 'AI Connected', error: 'Connection error' }

  return (
    <div style={{ minHeight: '100svh', background: '#0a0b0f' }}>
      <Navbar />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed',
              top: '80px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 200,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 20px',
              borderRadius: '12px',
              background: toast.type === 'success' ? 'rgba(34,197,94,0.15)' : toast.type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(124,58,237,0.15)',
              border: `1px solid ${toast.type === 'success' ? 'rgba(34,197,94,0.4)' : toast.type === 'error' ? 'rgba(239,68,68,0.4)' : 'rgba(124,58,237,0.4)'}`,
              color: toast.type === 'success' ? '#22c55e' : toast.type === 'error' ? '#ef4444' : '#a855f7',
              backdropFilter: 'blur(16px)',
              fontSize: '14px',
              fontWeight: 500,
              whiteSpace: 'nowrap',
            }}
          >
            {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#f3f4f6', margin: '0 0 6px', letterSpacing: '-1px' }}>
            Live Workout
          </h1>
          <p style={{ color: '#6b7280', fontSize: '15px', margin: 0 }}>
            Position your camera so your full body is visible, then start the session.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 340px',
            gap: '28px',
            alignItems: 'start',
          }}
        >
          {/* Camera panel */}
          <div>
            <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(42,45,62,0.6)', boxShadow: isRunning ? '0 0 40px rgba(124,58,237,0.15)' : 'none', transition: 'box-shadow 0.4s ease' }}>
              <CameraFeed
                ref={cameraRef}
                isActive={isRunning}
                displayCanvasRef={displayCanvasRef}
              />
              {isRunning && (
                <div style={{ position: 'absolute', inset: 0 }}>
                  <RepHUD
                    repCount={repCount}
                    stage={stage}
                    posture={posture}
                    speed={speed}
                    isActive={isRunning}
                  />
                </div>
              )}

              {/* REC indicator */}
              {isRunning && (
                <div
                  style={{
                    position: 'absolute',
                    top: '14px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 12px',
                    borderRadius: '6px',
                    background: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'pulse-bad 1s infinite' }} />
                  <span style={{ color: '#f3f4f6', fontSize: '12px', fontWeight: 700, letterSpacing: '1px' }}>REC</span>
                </div>
              )}
            </div>
          </div>

          {/* Control panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* WS status */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '10px',
                background: 'rgba(17,19,24,0.9)',
                border: '1px solid rgba(42,45,62,0.6)',
              }}
            >
              {wsStatus === 'connected' ? <Wifi size={14} color={wsStatusColor} /> : <WifiOff size={14} color={wsStatusColor} />}
              <span style={{ fontSize: '13px', fontWeight: 500, color: wsStatusColor }}>{wsStatusLabel[wsStatus]}</span>
            </div>

            {/* Exercise picker */}
            <div style={{ background: 'rgba(17,19,24,0.9)', border: '1px solid rgba(42,45,62,0.6)', borderRadius: '16px', padding: '20px' }}>
              <ExercisePicker
                value={exercise}
                onChange={setExercise}
                disabled={isRunning}
              />
            </div>

            {/* Rep counter card */}
            <div
              style={{
                background: 'rgba(17,19,24,0.9)',
                border: '1px solid rgba(42,45,62,0.6)',
                borderRadius: '16px',
                padding: '28px 20px',
                textAlign: 'center',
              }}
            >
              <div style={{ color: '#6b7280', fontSize: '12px', fontWeight: 600, letterSpacing: '1.5px', marginBottom: '12px' }}>
                REPS COMPLETED
              </div>
              <div className="rep-ring" style={{ margin: '0 auto 16px' }}>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={repCount}
                    initial={{ scale: 1.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    style={{ fontSize: '64px', fontWeight: 900, color: '#f3f4f6', letterSpacing: '-3px', lineHeight: 1 }}
                  >
                    {repCount}
                  </motion.span>
                </AnimatePresence>
              </div>
              {stage && (
                <div style={{ color: '#a855f7', fontSize: '13px', fontWeight: 700, letterSpacing: '1px' }}>
                  STAGE: {stage}
                </div>
              )}
            </div>

            {/* Speed + Posture mini cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: 'rgba(17,19,24,0.9)', border: '1px solid rgba(42,45,62,0.6)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                <div style={{ color: '#6b7280', fontSize: '11px', fontWeight: 600, letterSpacing: '1px', marginBottom: '6px' }}>SPEED</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: speed > 0 ? '#a855f7' : '#2a2d3e', letterSpacing: '-0.5px' }}>
                  {speed > 0 ? `${speed}s` : '—'}
                </div>
              </div>
              <div
                style={{
                  background: 'rgba(17,19,24,0.9)',
                  border: `1px solid ${posture === 'GOOD' ? 'rgba(34,197,94,0.35)' : posture ? 'rgba(239,68,68,0.35)' : 'rgba(42,45,62,0.6)'}`,
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                }}
              >
                <div style={{ color: '#6b7280', fontSize: '11px', fontWeight: 600, letterSpacing: '1px', marginBottom: '6px' }}>FORM</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: posture === 'GOOD' ? '#22c55e' : posture ? '#ef4444' : '#2a2d3e' }}>
                  {posture || '—'}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {!isRunning ? (
                <button
                  id="start-workout"
                  className="btn-primary"
                  onClick={startWorkout}
                  style={{ width: '100%', justifyContent: 'center', padding: '15px', fontSize: '15px' }}
                >
                  <Play size={17} />
                  Start Session
                </button>
              ) : (
                <>
                  <button
                    id="stop-workout"
                    className="btn-danger"
                    onClick={stopWorkout}
                    disabled={isSaving}
                    style={{ width: '100%', justifyContent: 'center', padding: '15px', fontSize: '15px' }}
                  >
                    <Square size={16} />
                    {isSaving ? 'Saving…' : 'Stop & Save'}
                  </button>
                  <button
                    className="btn-ghost"
                    onClick={reset}
                    style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: '14px' }}
                  >
                    <RotateCcw size={14} />
                    Reset Counter
                  </button>
                </>
              )}
            </div>

            {/* Tips */}
            <div
              style={{
                padding: '16px',
                borderRadius: '12px',
                background: 'rgba(124,58,237,0.06)',
                border: '1px solid rgba(124,58,237,0.2)',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#7c3aed', letterSpacing: '0.5px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lightbulb size={14} color="#7c3aed" /> TIPS
              </div>
              <ul style={{ margin: 0, padding: '0 0 0 16px', color: '#6b7280', fontSize: '13px', lineHeight: 1.8 }}>
                <li>Ensure good lighting on your body</li>
                <li>Keep full body in frame</li>
                <li>Camera should be at side angle</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
