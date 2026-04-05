import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  User, Target, Activity, Salad, Dumbbell, Calendar, Edit3,
  CheckCircle, Flame, Award, Loader2, Save, X
} from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import { useAuth } from '../context/AuthContext'
import { getMyProfile, updateProfile } from '../services/profileService'
import { getStreak } from '../services/workoutService'

const GOAL_LABELS = {
  WEIGHT_LOSS: 'Weight Loss',
  MUSCLE_GAIN: 'Muscle Gain',
  ENDURANCE: 'Endurance',
  FLEXIBILITY: 'Flexibility',
  STAY_ACTIVE: 'Stay Active',
}

const fadeUp = { hidden: { opacity: 0, y: 18 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.07, ease: 'easeOut' } }) }

function InfoRow({ label, value, icon: Icon, color = '#7c3aed' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid rgba(42,45,62,0.4)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#9ca3af', fontSize: '14px' }}>
        <Icon size={15} color={color} />
        {label}
      </div>
      <span style={{ color: '#f3f4f6', fontSize: '14px', fontWeight: 600 }}>{value || '—'}</span>
    </div>
  )
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0, milestoneBadge: '' })
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({})

  useEffect(() => {
    Promise.all([
      getMyProfile().catch(() => null),
      getStreak().catch(() => ({ currentStreak: 0, longestStreak: 0 })),
    ]).then(([profileData, streakData]) => {
      setProfile(profileData)
      setStreak(streakData)
      if (profileData) setForm({
        name: profileData.name || '',
        age: profileData.age || '',
        heightCm: profileData.heightCm || '',
        weightKg: profileData.weightKg || '',
        gender: profileData.gender || '',
        fitnessGoal: profileData.fitnessGoal || '',
        activityLevel: profileData.activityLevel || '',
        dietPreference: profileData.dietPreference || '',
        equipmentAccess: profileData.equipmentAccess || '',
        workoutDaysPerWeek: profileData.workoutDaysPerWeek || '',
      })
    }).finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await updateProfile({
        name: form.name?.trim() || null,
        age: parseInt(form.age) || null,
        heightCm: parseFloat(form.heightCm) || null,
        weightKg: parseFloat(form.weightKg) || null,
        gender: form.gender || null,
        fitnessGoal: form.fitnessGoal || null,
        activityLevel: form.activityLevel || null,
        dietPreference: form.dietPreference || null,
        equipmentAccess: form.equipmentAccess || null,
        workoutDaysPerWeek: parseInt(form.workoutDaysPerWeek) || null,
      })
      setProfile(updated)
      setEditing(false)
    } catch {
      /* silently fail */
    } finally {
      setSaving(false)
    }
  }

  const completeness = profile?.profileCompleteness ?? 0

  return (
    <div style={{ minHeight: '100svh', background: '#0a0b0f' }}>
      <Navbar />
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
        <motion.div initial="hidden" animate="visible">

          {/* Header */}
          <motion.div variants={fadeUp} custom={0} style={{ marginBottom: '36px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#f3f4f6', margin: '0 0 6px', letterSpacing: '-1px' }}>My Profile</h1>
            <p style={{ color: '#6b7280', fontSize: '15px', margin: 0 }}>Manage your personal information and training preferences</p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '24px', alignItems: 'start' }}>

            {/* Left — profile card */}
            <motion.div variants={fadeUp} custom={1}>
              {/* Avatar + name card */}
              <div style={{ background: 'rgba(17,19,24,0.9)', border: '1px solid rgba(42,45,62,0.7)', borderRadius: '20px', padding: '32px', textAlign: 'center', marginBottom: '16px' }}>
                {/* Avatar */}
                <div style={{ width: '88px', height: '88px', borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '32px', fontWeight: 900, color: 'white', boxShadow: '0 0 40px rgba(124,58,237,0.4)' }}>
                  {user?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#f3f4f6', marginBottom: '4px' }}>
                  {user?.name || 'Athlete'}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>{user?.email}</div>

                {/* Goal badge */}
                {profile?.fitnessGoal && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '20px', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.35)', color: '#a855f7', fontSize: '13px', fontWeight: 700, marginBottom: '16px' }}>
                    {GOAL_LABELS[profile.fitnessGoal] || profile.fitnessGoal}
                  </div>
                )}

                {/* Streak */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'center', padding: '10px 18px', borderRadius: '12px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                    <div style={{ fontSize: '22px', fontWeight: 900, color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Flame size={20} fill="currentColor" /> {streak.currentStreak}</div>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>day streak</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '10px 18px', borderRadius: '12px', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
                    <div style={{ fontSize: '22px', fontWeight: 900, color: '#a855f7' }}>{streak.longestStreak}</div>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>best streak</div>
                  </div>
                </div>
              </div>

              {/* Profile completeness */}
              <div style={{ background: 'rgba(17,19,24,0.9)', border: '1px solid rgba(42,45,62,0.7)', borderRadius: '16px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#9ca3af' }}>Profile Completeness</span>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: completeness >= 80 ? '#22c55e' : '#f59e0b' }}>{loading ? '…' : `${completeness}%`}</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(42,45,62,0.8)', borderRadius: '6px', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completeness}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{ height: '100%', background: completeness >= 80 ? 'linear-gradient(90deg,#22c55e,#16a34a)' : 'linear-gradient(90deg,#f59e0b,#d97706)', borderRadius: '6px' }}
                  />
                </div>
                {completeness < 100 && (
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '10px 0 0' }}>
                    Complete your profile to unlock personalised diet & workout plans
                  </p>
                )}
              </div>
            </motion.div>

            {/* Right — details */}
            <motion.div variants={fadeUp} custom={2}>
              <div style={{ background: 'rgba(17,19,24,0.9)', border: '1px solid rgba(42,45,62,0.7)', borderRadius: '20px', padding: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f3f4f6', margin: 0 }}>Training Profile</h2>
                  {!editing ? (
                    <button
                      onClick={() => setEditing(true)}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', color: '#a855f7', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                    >
                      <Edit3 size={13} /> Edit
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => setEditing(false)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '8px', background: 'transparent', border: '1px solid rgba(42,45,62,0.6)', color: '#6b7280', cursor: 'pointer', fontSize: '13px' }}>
                        <X size={13} />
                      </button>
                      <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: 600, border: 'none' }}>
                        {saving ? <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Save size={13} />}
                        {saving ? 'Saving…' : 'Save'}
                      </button>
                    </div>
                  )}
                </div>

                {loading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                    <div style={{ width: '28px', height: '28px', border: '3px solid rgba(124,58,237,0.2)', borderTop: '3px solid #7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  </div>
                ) : editing ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    {[
                      { key: 'name', label: 'Name', type: 'text' },
                      { key: 'age', label: 'Age', type: 'number', suffix: 'yrs' },
                      { key: 'heightCm', label: 'Height (cm)', type: 'number', suffix: 'cm' },
                      { key: 'weightKg', label: 'Weight (kg)', type: 'number', suffix: 'kg' },
                      { key: 'workoutDaysPerWeek', label: 'Workout Days/Week', type: 'number' },
                    ].map(({ key, label, type, suffix }) => (
                      <div key={key}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '6px' }}>{label.toUpperCase()}</label>
                        <input type={type} className="input-field" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                      </div>
                    ))}
                    {[
                      { key: 'gender', label: 'Gender', options: ['MALE','FEMALE','OTHER'] },
                      { key: 'fitnessGoal', label: 'Fitness Goal', options: Object.keys(GOAL_LABELS) },
                      { key: 'activityLevel', label: 'Activity Level', options: ['SEDENTARY','LIGHTLY_ACTIVE','MODERATELY_ACTIVE','VERY_ACTIVE'] },
                      { key: 'dietPreference', label: 'Diet', options: ['NO_PREFERENCE','VEGETARIAN','VEGAN','NON_VEG','KETO'] },
                      { key: 'equipmentAccess', label: 'Equipment', options: ['NONE','RESISTANCE_BANDS','DUMBBELLS','FULL_GYM'] },
                    ].map(({ key, label, options }) => (
                      <div key={key} style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '6px' }}>{label.toUpperCase()}</label>
                        <select
                          className="input-field"
                          value={form[key]}
                          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                          style={{ cursor: 'pointer', appearance: 'auto' }}
                        >
                          <option value="">— Select —</option>
                          {options.map(o => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <InfoRow label="Age" value={profile?.age ? `${profile.age} years` : null} icon={User} />
                    <InfoRow label="Height" value={profile?.heightCm ? `${profile.heightCm} cm` : null} icon={User} />
                    <InfoRow label="Weight" value={profile?.weightKg ? `${profile.weightKg} kg` : null} icon={User} />
                    <InfoRow label="Gender" value={profile?.gender} icon={User} />
                    <InfoRow label="Fitness Goal" value={profile?.fitnessGoal ? GOAL_LABELS[profile.fitnessGoal] : null} icon={Target} color="#22c55e" />
                    <InfoRow label="Activity Level" value={profile?.activityLevel?.replace(/_/g, ' ')} icon={Activity} color="#3b82f6" />
                    <InfoRow label="Diet Preference" value={profile?.dietPreference?.replace(/_/g, ' ')} icon={Salad} color="#f59e0b" />
                    <InfoRow label="Equipment" value={profile?.equipmentAccess?.replace(/_/g, ' ')} icon={Dumbbell} color="#ef4444" />
                    <InfoRow label="Workout Days/Week" value={profile?.workoutDaysPerWeek ? `${profile.workoutDaysPerWeek} days` : null} icon={Calendar} color="#a855f7" />
                  </>
                )}
              </div>

              {/* Milestone badge */}
              {streak.milestoneBadge && (
                <motion.div variants={fadeUp} custom={3} style={{ marginTop: '16px', padding: '16px 20px', borderRadius: '14px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Award size={20} color="#f59e0b" />
                  <div>
                    <div style={{ fontWeight: 700, color: '#f59e0b', fontSize: '14px' }}>Streak Milestone!</div>
                    <div style={{ fontSize: '13px', color: '#9ca3af' }}>{streak.milestoneBadge}</div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
