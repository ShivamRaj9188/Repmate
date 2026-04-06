import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  User, Target, Activity, Salad, Dumbbell, Calendar, Edit3,
  CheckCircle, Flame, Award, Loader2, Save, X, Camera
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
  const { user, updateUser } = useAuth()
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
        profilePicture: profileData.profilePicture || '',
      })
      if (profileData && updateUser) {
        updateUser({ 
          name: profileData.name || user?.name, 
          profilePicture: profileData.profilePicture || user?.profilePicture 
        })
      }
    }).finally(() => setLoading(false))
  }, [])

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_WIDTH = 400
        const MAX_HEIGHT = 400
        let width = img.width
        let height = img.height
        if (width > height) {
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        } else {
          if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
        setForm(f => ({ ...f, profilePicture: dataUrl }))
        updateProfile({ profilePicture: dataUrl })
          .then(updated => {
            setProfile(updated)
            if (updateUser) updateUser({ profilePicture: dataUrl })
          })
          .catch(console.error)
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  }

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
        profilePicture: form.profilePicture || null,
      })
      setProfile(updated)
      if (updateUser) {
        updateUser({ 
          name: updated.name, 
          profilePicture: updated.profilePicture 
        })
      }
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
                <div style={{ position: 'relative', width: '88px', height: '88px', margin: '0 auto 16px' }}>
                  <div style={{ width: '88px', height: '88px', borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 900, color: 'white', boxShadow: '0 0 40px rgba(124,58,237,0.4)', overflow: 'hidden' }}>
                    {
                      (form.profilePicture || profile?.profilePicture) ? (
                        <img src={form.profilePicture || profile?.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        (form.name?.[0]?.toUpperCase() || (user?.name || user?.email)?.[0]?.toUpperCase()) || '?'
                      )
                    }
                  </div>
                  <label style={{ position: 'absolute', bottom: 0, right: '-4px', width: '28px', height: '28px', borderRadius: '50%', background: '#2a2d3e', border: '2px solid rgba(17,19,24,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#f3f4f6', transition: 'transform 0.2s ease', ':hover': { transform: 'scale(1.1)' } }}>
                    <Camera size={14} />
                    <input type="file" accept="image/png, image/jpeg, image/webp" style={{ display: 'none' }} onChange={handleImageUpload} />
                  </label>
                </div>
                {editing ? (
                  <input
                    className="input-field"
                    style={{ textAlign: 'center', fontSize: '18px', fontWeight: 800, padding: '8px', marginBottom: '8px' }}
                    value={form.name || ''}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Your Name"
                    minLength={2}
                    maxLength={50}
                    pattern="^[A-Za-z\s.'-]+$"
                    title="Only letters, spaces, hyphens, dots, and apostrophes allowed."
                  />
                ) : (
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#f3f4f6', marginBottom: '4px' }}>
                    {profile?.name || user?.name || 'Athlete'}
                  </div>
                )}
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
                      <Edit3 size={13} /> Edit Profile
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[1, 2, 3, 4, 5, 6, 7].map(i => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid rgba(42,45,62,0.4)' }}>
                        <div style={{ height: '16px', width: '120px', borderRadius: '4px', background: 'rgba(42,45,62,0.4)', animation: 'shimmer 1.5s infinite linear', backgroundImage: 'linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.04) 50%,transparent 100%)', backgroundSize: '200% 100%' }} />
                        <div style={{ height: '16px', width: '80px', borderRadius: '4px', background: 'rgba(42,45,62,0.3)', animation: 'shimmer 1.5s infinite linear', backgroundImage: 'linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.04) 50%,transparent 100%)', backgroundSize: '200% 100%' }} />
                      </div>
                    ))}
                  </div>
                ) : editing ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    {[
                      { key: 'age', label: 'Age', type: 'number', suffix: 'yrs', min: 13, max: 120 },
                      { key: 'heightCm', label: 'Height (cm)', type: 'number', suffix: 'cm', min: 50, max: 300 },
                      { key: 'weightKg', label: 'Weight (kg)', type: 'number', suffix: 'kg', min: 20, max: 500 },
                      { key: 'workoutDaysPerWeek', label: 'Workout Days/Week', type: 'number', min: 1, max: 7 },
                    ].map(({ key, label, type, suffix, min, max }) => (
                      <div key={key}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '6px' }}>{label.toUpperCase()}</label>
                        <input
                          type={type}
                          className="input-field"
                          value={form[key] || ''}
                          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                          min={min}
                          max={max}
                        />
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
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
      `}</style>
    </div>
  )
}
