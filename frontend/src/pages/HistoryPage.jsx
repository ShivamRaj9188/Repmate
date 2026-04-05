import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Dumbbell, Clock, Zap, Target, BarChart3, Plus, Flame } from 'lucide-react'
import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import { useAuth } from '../context/AuthContext'
import { getSessionsByUser, getMetricsBySession } from '../services/workoutService'
import { getStreakHistory } from '../services/profileService'
import StreakHeatmap from '../components/workout/StreakHeatmap'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.06, ease: 'easeOut' } }),
}

function MetricBar({ label, value, max, color }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ color: '#9ca3af', fontSize: '12px' }}>{label}</span>
        <span style={{ color: '#f3f4f6', fontSize: '12px', fontWeight: 600 }}>{value}</span>
      </div>
      <div style={{ height: '4px', background: 'rgba(42,45,62,0.8)', borderRadius: '2px' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ height: '100%', borderRadius: '2px', background: color }}
        />
      </div>
    </div>
  )
}

function SessionCard({ session, index }) {
  const [expanded, setExpanded] = useState(false)
  const [metrics, setMetrics] = useState([])
  const [loadingMetrics, setLoadingMetrics] = useState(false)

  const toggleExpand = async () => {
    if (!expanded && metrics.length === 0) {
      setLoadingMetrics(true)
      try {
        const data = await getMetricsBySession(session.id)
        setMetrics(data)
      } catch {
        setMetrics([])
      } finally {
        setLoadingMetrics(false)
      }
    }
    setExpanded((e) => !e)
  }

  const duration = session.endTime
    ? Math.round((new Date(session.endTime) - new Date(session.startTime)) / 60000)
    : null

  const latestMetric = metrics.length > 0 ? metrics[metrics.length - 1] : null
  const allReps = metrics.reduce((sum, m) => sum + (m.reps || 0), 0)
  const maxReps = Math.max(...metrics.map((m) => m.reps || 0), 1)

  return (
    <motion.div variants={fadeUp} custom={index} style={{ overflow: 'hidden', borderRadius: '16px', border: '1px solid rgba(42,45,62,0.6)', background: 'rgba(17,19,24,0.9)' }}>
      {/* Header row */}
      <div
        onClick={toggleExpand}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 20px',
          cursor: 'pointer',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(124,58,237,0.12)',
              border: '1px solid rgba(124,58,237,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Dumbbell size={20} color="#a855f7" />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#f3f4f6', fontSize: '16px' }}>
              {session.exerciseType?.replace('_', ' ')}
            </div>
            <div style={{ color: '#6b7280', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', flexWrap: 'wrap' }}>
              <Clock size={12} />
              {new Date(session.startTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              {duration !== null && (
                <span style={{ color: '#4b5563' }}>· {duration}m</span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              padding: '4px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.5px',
              background: session.status === 'COMPLETED' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
              border: `1px solid ${session.status === 'COMPLETED' ? 'rgba(34,197,94,0.35)' : 'rgba(245,158,11,0.35)'}`,
              color: session.status === 'COMPLETED' ? '#22c55e' : '#f59e0b',
            }}
          >
            {session.status}
          </div>
          <div style={{ color: '#4b5563' }}>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </div>

      {/* Expanded metrics */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ borderTop: '1px solid rgba(42,45,62,0.5)', padding: '20px' }}>
              {loadingMetrics ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
                  <div style={{ width: '24px', height: '24px', border: '2px solid rgba(124,58,237,0.2)', borderTop: '2px solid #7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                </div>
              ) : metrics.length === 0 ? (
                <p style={{ color: '#4b5563', fontSize: '14px', textAlign: 'center', margin: 0 }}>
                  No metrics recorded for this session.
                </p>
              ) : (
                <>
                  {/* Summary stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#6b7280', fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '6px' }}>
                        <Zap size={11} /> TOTAL REPS
                      </div>
                      <div style={{ fontSize: '28px', fontWeight: 800, color: '#a855f7', letterSpacing: '-1px' }}>{allReps}</div>
                    </div>
                    {latestMetric?.avgSpeed && (
                      <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#6b7280', fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '6px' }}>
                          <Zap size={11} /> AVG SPEED
                        </div>
                        <div style={{ fontSize: '28px', fontWeight: 800, color: '#22c55e', letterSpacing: '-1px' }}>{Number(latestMetric.avgSpeed).toFixed(1)}s</div>
                      </div>
                    )}
                    {latestMetric?.accuracy && (
                      <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#6b7280', fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '6px' }}>
                          <Target size={11} /> ACCURACY
                        </div>
                        <div style={{ fontSize: '28px', fontWeight: 800, color: '#f59e0b', letterSpacing: '-1px' }}>{Number(latestMetric.accuracy).toFixed(0)}%</div>
                      </div>
                    )}
                  </div>

                  {/* Reps bar chart */}
                  {metrics.length > 1 && (
                    <div style={{ marginTop: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', fontSize: '12px', fontWeight: 600, marginBottom: '12px', letterSpacing: '0.5px' }}>
                        <BarChart3 size={13} /> REPS PER METRIC ENTRY
                      </div>
                      {metrics.map((m, i) => (
                        <MetricBar
                          key={m.id}
                          label={`Entry ${i + 1}`}
                          value={m.reps}
                          max={maxReps}
                          color="#7c3aed"
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function HistoryPage() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [activeDates, setActiveDates] = useState([])

  useEffect(() => {
    if (!user?.id) { setLoading(false); return }
    Promise.all([
      getSessionsByUser(user.id).catch(() => []),
      getStreakHistory().catch(() => []),
    ]).then(([sessionData, dateData]) => {
      setSessions([...sessionData].reverse())
      setActiveDates(dateData)
    }).finally(() => setLoading(false))
  }, [user])

  const filtered = filter === 'ALL' ? sessions : sessions.filter((s) => s.status === filter)

  const totalReps = sessions.length // placeholder — would need metrics aggregate
  const completed = sessions.filter((s) => s.status === 'COMPLETED').length

  return (
    <div style={{ minHeight: '100svh', background: '#0a0b0f' }}>
      <Navbar />
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
        <motion.div initial="hidden" animate="visible">
          {/* Header */}
          <motion.div variants={fadeUp} custom={0} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '36px' }}>
            <div>
              <h1 style={{ fontSize: 'clamp(26px,4vw,36px)', fontWeight: 800, color: '#f3f4f6', margin: '0 0 6px', letterSpacing: '-1px' }}>
                Workout History
              </h1>
              <p style={{ color: '#6b7280', fontSize: '15px', margin: 0 }}>
                {sessions.length} sessions · {completed} completed
              </p>
            </div>
            <Link
              to="/workout"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 20px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
                color: 'white',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 700,
                boxShadow: '0 0 20px rgba(124,58,237,0.35)',
              }}
            >
              <Plus size={15} /> New Session
            </Link>
          </motion.div>

          {/* Streak Heatmap */}
          {activeDates.length > 0 && (
            <motion.div variants={fadeUp} custom={1} style={{ marginBottom: '32px', background: 'rgba(17,19,24,0.9)', border: '1px solid rgba(42,45,62,0.6)', borderRadius: '20px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                <Flame size={16} color="#f59e0b" />
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#d1d5db' }}>Activity Heatmap</span>
                <span style={{ fontSize: '12px', color: '#4b5563', marginLeft: '4px' }}>Last 6 months</span>
              </div>
              <div style={{ overflowX: 'auto', paddingBottom: '4px' }}>
                <StreakHeatmap activeDates={activeDates} weeks={26} />
              </div>
            </motion.div>
          )}

          {/* Filter tabs */}
          <motion.div variants={fadeUp} custom={2} style={{ display: 'flex', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
            {['ALL', 'COMPLETED', 'IN_PROGRESS'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '7px 16px',
                  borderRadius: '8px',
                  background: filter === f ? 'rgba(124,58,237,0.15)' : 'transparent',
                  border: `1px solid ${filter === f ? 'rgba(124,58,237,0.4)' : 'rgba(42,45,62,0.6)'}`,
                  color: filter === f ? '#a855f7' : '#6b7280',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </motion.div>

          {/* Session list */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
              <div style={{ width: '36px', height: '36px', border: '3px solid rgba(124,58,237,0.2)', borderTop: '3px solid #7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              variants={fadeUp}
              custom={2}
              style={{ textAlign: 'center', padding: '80px 24px', background: 'rgba(17,19,24,0.6)', border: '1px dashed rgba(42,45,62,0.6)', borderRadius: '20px' }}
            >
              <Dumbbell size={48} color="#1f2130" style={{ marginBottom: '20px' }} />
              <p style={{ color: '#4b5563', fontSize: '16px', margin: '0 0 24px' }}>
                {filter === 'ALL' ? 'No sessions yet. Start your first workout!' : `No ${filter.replace('_', ' ').toLowerCase()} sessions.`}
              </p>
              <Link
                to="/workout"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '12px 24px', borderRadius: '10px', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#a855f7', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}
              >
                <Plus size={14} /> Start Now
              </Link>
            </motion.div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              {filtered.map((session, i) => (
                <SessionCard key={session.id} session={session} index={i} />
              ))}
            </motion.div>
          )}
        </motion.div>
      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
