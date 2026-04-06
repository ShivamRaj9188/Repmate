import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, Calendar, TrendingUp, Award, Clock, Play, ChevronRight, Dumbbell, Flame, Sun, Moon, CloudSun } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import { useAuth } from '../context/AuthContext'
import { getSessionsByUser, getStreak } from '../services/workoutService'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08, ease: 'easeOut' } }),
}

function StatCard({ icon: Icon, label, value, sub, color, delay }) {
  return (
    <motion.div
      variants={fadeUp}
      custom={delay}
      className="stat-card"
      style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ color: '#9ca3af', fontSize: '13px', fontWeight: 600, letterSpacing: '0.5px' }}>{label}</div>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: `${color}18`,
            border: `1px solid ${color}33`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={18} color={color} />
        </div>
      </div>
      <div>
        <div style={{ fontSize: '36px', fontWeight: 800, color: '#f3f4f6', letterSpacing: '-1.5px', lineHeight: 1 }}>
          {value}
        </div>
        {sub && <div style={{ color: '#6b7280', fontSize: '13px', marginTop: '6px' }}>{sub}</div>}
      </div>
    </motion.div>
  )
}

function SkeletonRow() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(42,45,62,0.4)', animation: 'shimmer 1.5s infinite linear', backgroundImage: 'linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.04) 50%,transparent 100%)', backgroundSize: '200% 100%' }} />
        <div>
          <div style={{ height: '14px', width: '120px', borderRadius: '6px', background: 'rgba(42,45,62,0.4)', marginBottom: '8px', animation: 'shimmer 1.5s infinite linear', backgroundImage: 'linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.04) 50%,transparent 100%)', backgroundSize: '200% 100%' }} />
          <div style={{ height: '12px', width: '80px', borderRadius: '6px', background: 'rgba(42,45,62,0.3)', animation: 'shimmer 1.5s infinite linear', backgroundImage: 'linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.04) 50%,transparent 100%)', backgroundSize: '200% 100%' }} />
        </div>
      </div>
      <div style={{ height: '24px', width: '80px', borderRadius: '6px', background: 'rgba(42,45,62,0.4)', animation: 'shimmer 1.5s infinite linear', backgroundImage: 'linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.04) 50%,transparent 100%)', backgroundSize: '200% 100%' }} />
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0, streakAtRisk: false, milestoneBadge: '' })

  useEffect(() => {
    if (!user?.id) { setLoading(false); return }

    // Load sessions and streak in parallel
    Promise.all([
      getSessionsByUser(user.id).catch(() => []),
      getStreak().catch(() => ({ currentStreak: 0, longestStreak: 0 })),
    ]).then(([sessionData, streakData]) => {
      setSessions(sessionData)
      setStreak(streakData)
    }).finally(() => setLoading(false))
  }, [user])

  const completedSessions = sessions.filter((s) => s.status === 'COMPLETED')
  const recentSessions = [...sessions].reverse().slice(0, 5)

  const greetingHour = new Date().getHours()
  let greeting = 'Good morning'
  let GreetingIcon = CloudSun
  if (greetingHour >= 12 && greetingHour < 17) {
    greeting = 'Good afternoon'
    GreetingIcon = Sun
  } else if (greetingHour >= 17) {
    greeting = 'Good evening'
    GreetingIcon = Moon
  }

  return (
    <div style={{ minHeight: '100svh', background: '#0a0b0f' }}>
      <Navbar />

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
        <motion.div initial="hidden" animate="visible">
          {/* Header */}
          <motion.div variants={fadeUp} custom={0} style={{ marginBottom: '40px' }}>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <GreetingIcon size={16} /> {greeting}
            </p>
            <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, color: '#f3f4f6', margin: '0 0 4px', letterSpacing: '-1.5px' }}>
              {user?.name || 'Athlete'}
            </h1>
            <p style={{ color: '#6b7280', fontSize: '15px', margin: 0 }}>
              {sessions.length === 0
                ? "Ready to start your first session?"
                : `You've completed ${completedSessions.length} workout${completedSessions.length !== 1 ? 's' : ''} so far.`}
            </p>
          </motion.div>

          {/* Streak at-risk banner */}
          {!loading && streak.streakAtRisk && streak.currentStreak > 0 && (
            <motion.div
              variants={fadeUp}
              custom={0.5}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '14px 20px', borderRadius: '14px',
                background: 'rgba(245,158,11,0.08)',
                border: '1px solid rgba(245,158,11,0.35)',
                marginBottom: '24px',
              }}
            >
              <Flame size={18} color="#f59e0b" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, color: '#f59e0b', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}><Flame size={16} fill="currentColor" /> Streak at risk!</div>
                <div style={{ color: '#9ca3af', fontSize: '13px', marginTop: '2px' }}>
                  Log a workout today to keep your {streak.currentStreak}-day streak alive.
                </div>
              </div>
            </motion.div>
          )}

          {/* Milestone badge */}
          {!loading && streak.milestoneBadge && (
            <motion.div
              variants={fadeUp}
              custom={0.6}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '14px 20px', borderRadius: '14px',
                background: 'rgba(168,85,247,0.08)',
                border: '1px solid rgba(168,85,247,0.35)',
                marginBottom: '24px',
              }}
            >
              <Award size={18} color="#a855f7" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, color: '#a855f7', fontSize: '14px' }}>Milestone unlocked!</div>
                <div style={{ color: '#9ca3af', fontSize: '13px', marginTop: '2px' }}>{streak.milestoneBadge}</div>
              </div>
            </motion.div>
          )}

          {/* Start Workout CTA */}
          <motion.div variants={fadeUp} custom={1} style={{ marginBottom: '40px' }}>
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(99,102,241,0.08) 100%)',
                border: '1px solid rgba(124,58,237,0.3)',
                borderRadius: '20px',
                padding: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 24px rgba(124,58,237,0.45)',
                    flexShrink: 0,
                  }}
                >
                  <Dumbbell size={28} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#f3f4f6', marginBottom: '4px' }}>
                    Start a Workout
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: '14px' }}>
                    AI will count your reps and analyze your form in real-time
                  </div>
                </div>
              </div>
              <Link
                to="/workout"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '14px 28px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '15px',
                  fontWeight: 700,
                  boxShadow: '0 0 24px rgba(124,58,237,0.4)',
                  flexShrink: 0,
                }}
              >
                <Play size={16} />
                Begin Session
              </Link>
            </div>
          </motion.div>

          {/* Stat Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '20px',
              marginBottom: '44px',
            }}
          >
            <StatCard icon={Calendar} label="TOTAL SESSIONS" value={sessions.length} sub="all time" color="#7c3aed" delay={2} />
            <StatCard icon={Zap} label="COMPLETED" value={completedSessions.length} sub="finished sessions" color="#22c55e" delay={3} />
            <StatCard icon={TrendingUp} label="IN PROGRESS" value={sessions.filter((s) => s.status === 'IN_PROGRESS').length} sub="active sessions" color="#f59e0b" delay={4} />
            {/* Fix: streak now shows real live data from GET /api/streaks/me */}
            <StatCard
              icon={streak.currentStreak > 0 ? Flame : Award}
              label="STREAK"
              value={loading ? '…' : `${streak.currentStreak}`}
              sub={`best: ${streak.longestStreak} days`}
              color="#a855f7"
              delay={5}
            />
          </div>

          {/* Recent Sessions */}
          <motion.div variants={fadeUp} custom={6}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#f3f4f6', margin: 0, letterSpacing: '-0.5px' }}>
                Recent Sessions
              </h2>
              <Link
                to="/history"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: '#a855f7',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                View all <ChevronRight size={14} />
              </Link>
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <SkeletonRow /><SkeletonRow /><SkeletonRow />
              </div>
            ) : recentSessions.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '60px 24px',
                  background: 'rgba(17,19,24,0.6)',
                  border: '1px dashed rgba(42,45,62,0.6)',
                  borderRadius: '16px',
                }}
              >
                <Dumbbell size={40} color="#2a2d3e" style={{ marginBottom: '16px' }} />
                <p style={{ color: '#4b5563', fontSize: '15px', margin: '0 0 20px' }}>No sessions yet. Start your first workout!</p>
                <Link
                  to="/workout"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 22px',
                    borderRadius: '10px',
                    background: 'rgba(124,58,237,0.15)',
                    border: '1px solid rgba(124,58,237,0.3)',
                    color: '#a855f7',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: 600,
                  }}
                >
                  <Play size={14} /> Start Now
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {recentSessions.map((session, i) => (
                  <motion.div
                    key={session.id}
                    variants={fadeUp}
                    custom={i + 7}
                    className="session-row"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          background: 'rgba(124,58,237,0.12)',
                          border: '1px solid rgba(124,58,237,0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Dumbbell size={18} color="#a855f7" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#f3f4f6', fontSize: '15px' }}>
                          {session.exerciseType?.replace('_', ' ')}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <Clock size={12} />
                          {new Date(session.startTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        letterSpacing: '0.5px',
                        background:
                          session.status === 'COMPLETED' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
                        border: `1px solid ${session.status === 'COMPLETED' ? 'rgba(34,197,94,0.35)' : 'rgba(245,158,11,0.35)'}`,
                        color: session.status === 'COMPLETED' ? '#22c55e' : '#f59e0b',
                      }}
                    >
                      {session.status}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
      `}</style>
    </div>
  )
}
