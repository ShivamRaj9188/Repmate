import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Target, Activity, Salad, Dumbbell, Calendar,
  ChevronRight, ChevronLeft, CheckCircle, Loader2, Dumbbell as DumbbellIcon,
  Flame, Zap, Utensils, Leaf, Home, Building2, CircleDot
} from 'lucide-react'
import { updateProfile } from '../services/profileService'

const TOTAL_STEPS = 6

const STEP_CONFIG = [
  {
    id: 1,
    icon: User,
    title: 'Body Stats',
    subtitle: 'Let us know about your body to personalise your plan',
    color: '#7c3aed',
  },
  {
    id: 2,
    icon: Target,
    title: 'Fitness Goal',
    subtitle: 'What are you training for?',
    color: '#22c55e',
  },
  {
    id: 3,
    icon: Activity,
    title: 'Activity Level',
    subtitle: 'How active are you on a typical day?',
    color: '#3b82f6',
  },
  {
    id: 4,
    icon: Salad,
    title: 'Dietary Preferences',
    subtitle: 'We\'ll build your meal plan around this',
    color: '#f59e0b',
  },
  {
    id: 5,
    icon: DumbbellIcon,
    title: 'Equipment Access',
    subtitle: 'What do you have available to train with?',
    color: '#ef4444',
  },
  {
    id: 6,
    icon: Calendar,
    title: 'Workout Schedule',
    subtitle: 'How many days a week can you commit?',
    color: '#a855f7',
  },
]

const FITNESS_GOALS = [
  { value: 'WEIGHT_LOSS',  label: 'Weight Loss',   icon: <Flame size={22} />, desc: 'Burn fat, improve body composition' },
  { value: 'MUSCLE_GAIN',  label: 'Muscle Gain',   icon: <Dumbbell size={22} />, desc: 'Build strength and muscle mass' },
  { value: 'ENDURANCE',    label: 'Endurance',      icon: <Target size={22} />, desc: 'Run farther, last longer' },
  { value: 'FLEXIBILITY',  label: 'Flexibility',    icon: <Activity size={22} />, desc: 'Improve mobility and reduce stiffness' },
  { value: 'STAY_ACTIVE',  label: 'Stay Active',    icon: <Zap size={22} />, desc: 'General fitness and wellness' },
]

const ACTIVITY_LEVELS = [
  { value: 'SEDENTARY',         label: 'Sedentary',          desc: 'Little or no exercise' },
  { value: 'LIGHTLY_ACTIVE',    label: 'Lightly Active',     desc: '1–3 days/week' },
  { value: 'MODERATELY_ACTIVE', label: 'Moderately Active',  desc: '3–5 days/week' },
  { value: 'VERY_ACTIVE',       label: 'Very Active',        desc: '6–7 days/week or physical job' },
]

const DIET_PREFS = [
  { value: 'NO_PREFERENCE', label: 'No Preference', icon: <Utensils size={22} /> },
  { value: 'VEGETARIAN',    label: 'Vegetarian',    icon: <Salad size={22} /> },
  { value: 'VEGAN',         label: 'Vegan',         icon: <Leaf size={22} /> },
  { value: 'NON_VEG',       label: 'Non-Veg',       icon: <Utensils size={22} /> },
  { value: 'KETO',          label: 'Keto',           icon: <Zap size={22} /> },
]

const EQUIPMENT = [
  { value: 'NONE',             label: 'No Equipment',     icon: <Home size={22} />, desc: 'Bodyweight only' },
  { value: 'RESISTANCE_BANDS', label: 'Resistance Bands', icon: <CircleDot size={22} />, desc: 'Bands + bodyweight' },
  { value: 'DUMBBELLS',        label: 'Dumbbells',        icon: <Dumbbell size={22} />, desc: 'Free weights at home' },
  { value: 'FULL_GYM',         label: 'Full Gym',         icon: <Building2 size={22} />, desc: 'Machines + free weights' },
]

function OptionCard({ value, selected, onClick, children, accent = '#7c3aed' }) {
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      style={{
        width: '100%',
        padding: '14px 18px',
        borderRadius: '12px',
        background: selected ? `${accent}18` : 'rgba(26,28,36,0.6)',
        border: `1.5px solid ${selected ? accent : 'rgba(42,45,62,0.6)'}`,
        color: selected ? '#f3f4f6' : '#9ca3af',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      {children}
      {selected && <CheckCircle size={16} color={accent} style={{ marginLeft: 'auto', flexShrink: 0 }} />}
    </button>
  )
}

export default function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState({
    age: '',
    heightCm: '',
    weightKg: '',
    gender: '',
    fitnessGoal: '',
    activityLevel: '',
    dietPreference: '',
    equipmentAccess: '',
    workoutDaysPerWeek: 3,
  })

  const set = (key, val) => setData(d => ({ ...d, [key]: val }))
  const config = STEP_CONFIG[step - 1]
  const Icon = config.icon

  const canProceed = () => {
    switch (step) {
      case 1: return data.age && data.heightCm && data.weightKg && data.gender
      case 2: return !!data.fitnessGoal
      case 3: return !!data.activityLevel
      case 4: return !!data.dietPreference
      case 5: return !!data.equipmentAccess
      case 6: return data.workoutDaysPerWeek >= 1
      default: return true
    }
  }

  const handleNext = () => {
    if (step < TOTAL_STEPS) setStep(s => s + 1)
    else handleSubmit()
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await updateProfile({
        age: parseInt(data.age),
        heightCm: parseFloat(data.heightCm),
        weightKg: parseFloat(data.weightKg),
        gender: data.gender,
        fitnessGoal: data.fitnessGoal,
        activityLevel: data.activityLevel,
        dietPreference: data.dietPreference,
        equipmentAccess: data.equipmentAccess,
        workoutDaysPerWeek: data.workoutDaysPerWeek,
      })
      navigate('/dashboard')
    } catch {
      // Still navigate on error — questionnaire is optional
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const slideVariants = {
    enter: (dir) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit: (dir) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
  }

  return (
    <div
      style={{
        minHeight: '100svh',
        background: '#0a0b0f',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '10%', right: '5%', width: '500px', height: '500px', borderRadius: '50%', background: `radial-gradient(circle,${config.color}18 0%,transparent 70%)`, filter: 'blur(60px)', transition: 'background 0.6s ease' }} />
      </div>

      <div style={{ width: '100%', maxWidth: '560px', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DumbbellIcon size={18} color="white" />
            </div>
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#f3f4f6' }}>
              Rep<span style={{ color: '#a855f7' }}>Mate</span>
            </span>
          </div>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
            Step {step} of {TOTAL_STEPS} — Let's personalise your experience
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ height: '4px', background: 'rgba(42,45,62,0.8)', borderRadius: '4px', marginBottom: '32px', overflow: 'hidden' }}>
          <motion.div
            animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{ height: '100%', background: `linear-gradient(90deg,${config.color},${config.color}99)`, borderRadius: '4px' }}
          />
        </div>

        {/* Card */}
        <div style={{ background: 'rgba(17,19,24,0.9)', border: '1px solid rgba(42,45,62,0.7)', borderRadius: '24px', padding: '36px', backdropFilter: 'blur(16px)', minHeight: '440px', display: 'flex', flexDirection: 'column' }}>
          {/* Step header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: `${config.color}18`, border: `1px solid ${config.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={24} color={config.color} />
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#f3f4f6', letterSpacing: '-0.5px' }}>{config.title}</div>
              <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>{config.subtitle}</div>
            </div>
          </div>

          {/* Step content */}
          <AnimatePresence mode="wait" custom={1}>
            <motion.div
              key={step}
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeOut' }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              {step === 1 && (
                <>
                  {/* Gender */}
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '4px' }}>
                    {['MALE', 'FEMALE', 'OTHER'].map(g => (
                      <OptionCard key={g} value={g} selected={data.gender === g} onClick={v => set('gender', v)} accent={config.color}>
                        <span style={{ fontWeight: 600, fontSize: '14px' }}>{g === 'MALE' ? 'Male' : g === 'FEMALE' ? 'Female' : 'Other'}</span>
                      </OptionCard>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    {[
                      { key: 'age',      label: 'Age', placeholder: '25', suffix: 'yrs', min: 13, max: 120 },
                      { key: 'heightCm', label: 'Height', placeholder: '175', suffix: 'cm', min: 50, max: 300 },
                      { key: 'weightKg', label: 'Weight', placeholder: '70', suffix: 'kg', min: 20, max: 500 },
                    ].map(({ key, label, placeholder, suffix, min, max }) => (
                      <div key={key}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '6px', letterSpacing: '0.5px' }}>{label.toUpperCase()}</label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type="number"
                            className="input-field"
                            placeholder={placeholder}
                            value={data[key]}
                            onChange={e => set(key, e.target.value)}
                            min={min}
                            max={max}
                            required
                            style={{ paddingRight: '36px' }}
                          />
                          <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: '#4b5563' }}>{suffix}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {step === 2 && FITNESS_GOALS.map(({ value, label, icon, desc }) => (
                <OptionCard key={value} value={value} selected={data.fitnessGoal === value} onClick={v => set('fitnessGoal', v)} accent={config.color}>
                  <span>{icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px' }}>{label}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{desc}</div>
                  </div>
                </OptionCard>
              ))}

              {step === 3 && ACTIVITY_LEVELS.map(({ value, label, desc }) => (
                <OptionCard key={value} value={value} selected={data.activityLevel === value} onClick={v => set('activityLevel', v)} accent={config.color}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px' }}>{label}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{desc}</div>
                  </div>
                </OptionCard>
              ))}

              {step === 4 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {DIET_PREFS.map(({ value, label, icon }) => (
                    <OptionCard key={value} value={value} selected={data.dietPreference === value} onClick={v => set('dietPreference', v)} accent={config.color}>
                      <span>{icon}</span>
                      <span style={{ fontWeight: 600, fontSize: '14px' }}>{label}</span>
                    </OptionCard>
                  ))}
                </div>
              )}

              {step === 5 && EQUIPMENT.map(({ value, label, icon, desc }) => (
                <OptionCard key={value} value={value} selected={data.equipmentAccess === value} onClick={v => set('equipmentAccess', v)} accent={config.color}>
                  <span>{icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px' }}>{label}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{desc}</div>
                  </div>
                </OptionCard>
              ))}

              {step === 6 && (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ fontSize: '72px', fontWeight: 900, color: config.color, lineHeight: 1, marginBottom: '12px' }}>
                    {data.workoutDaysPerWeek}
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: '16px', marginBottom: '32px' }}>days per week</div>
                  <input
                    type="range"
                    min={1} max={7}
                    value={data.workoutDaysPerWeek}
                    onChange={e => set('workoutDaysPerWeek', parseInt(e.target.value))}
                    style={{ width: '100%', accentColor: config.color, cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                    {[1,2,3,4,5,6,7].map(n => (
                      <span key={n} style={{ fontSize: '12px', color: n === data.workoutDaysPerWeek ? config.color : '#4b5563', fontWeight: n === data.workoutDaysPerWeek ? 700 : 400 }}>{n}</span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
            {step > 1 && (
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setStep(s => s - 1)}
                style={{ width: '52px', height: '52px', padding: 0, justifyContent: 'center', borderRadius: '12px', flexShrink: 0 }}
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <button
              type="button"
              className="btn-primary"
              onClick={handleNext}
              disabled={!canProceed() || loading}
              style={{ flex: 1, justifyContent: 'center', padding: '15px', fontSize: '15px', borderRadius: '12px', background: canProceed() ? `linear-gradient(135deg,${config.color},${config.color}cc)` : undefined, boxShadow: canProceed() ? `0 0 28px ${config.color}44` : undefined }}
            >
              {loading ? (
                <><Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> Saving…</>
              ) : step === TOTAL_STEPS ? (
                <><CheckCircle size={16} /> Complete Setup</>
              ) : (
                <>Next <ChevronRight size={16} /></>
              )}
            </button>
          </div>

          {/* Skip */}
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            style={{ background: 'none', border: 'none', color: '#4b5563', fontSize: '13px', cursor: 'pointer', marginTop: '16px', textAlign: 'center' }}
          >
            Skip for now — I'll do this later
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
