import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, Loader2, ChevronDown, ChevronUp, Zap, Wheat, Droplet, Flame as FlameCal, Sunrise, Sun, Moon, Apple, Utensils, Salad } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import { getDietPlan, regenerateDietPlan } from '../services/profileService'

const DAY_COLORS = ['#7c3aed','#3b82f6','#22c55e','#f59e0b','#ef4444','#ec4899','#a855f7']
const MEAL_ICONS = {
  breakfast: <Sunrise size={16} color="#f59e0b" />,
  lunch: <Sun size={16} color="#eab308" />,
  dinner: <Moon size={16} color="#3b82f6" />,
  snack: <Apple size={16} color="#ef4444" />
}

function MacroBadge({ label, value, unit, color }) {
  return (
    <div style={{ textAlign: 'center', padding: '8px 12px', borderRadius: '10px', background: `${color}12`, border: `1px solid ${color}25` }}>
      <div style={{ fontSize: '16px', fontWeight: 800, color }}>{value}{unit}</div>
      <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>{label}</div>
    </div>
  )
}

function MealCard({ type, items }) {
  const meal = Array.isArray(items) ? items[0] : items
  if (!meal) return null
  return (
    <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(26,28,36,0.7)', border: '1px solid rgba(42,45,62,0.5)', marginBottom: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span style={{ display: 'flex', alignItems: 'center' }}>{MEAL_ICONS[type] || <Utensils size={16} color="#6b7280" />}</span>
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#6b7280', letterSpacing: '0.5px' }}>{type.toUpperCase()}</span>
        <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#4b5563' }}>{meal.calories} kcal</span>
      </div>
      <div style={{ fontSize: '14px', fontWeight: 600, color: '#f3f4f6', marginBottom: '10px' }}>{meal.name}</div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <MacroBadge label="Protein" value={meal.proteinG} unit="g" color="#22c55e" />
        <MacroBadge label="Carbs"   value={meal.carbG}    unit="g" color="#3b82f6" />
        <MacroBadge label="Fat"     value={meal.fatG}     unit="g" color="#f59e0b" />
      </div>
    </div>
  )
}

function DayCard({ dayData, color, index }) {
  const [open, setOpen] = useState(index === 0)
  const { day, totalCalories, macros, breakfast, lunch, dinner, snack } = dayData

  return (
    <div style={{ background: 'rgba(17,19,24,0.9)', border: `1px solid ${open ? color + '44' : 'rgba(42,45,62,0.6)'}`, borderRadius: '16px', overflow: 'hidden', transition: 'border-color 0.2s' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', padding: '18px 20px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px', textAlign: 'left' }}
      >
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${color}18`, border: `1px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color }}>{index + 1}</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: '#f3f4f6', fontSize: '15px' }}>{day}</div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{totalCalories} kcal · {macros?.proteinG}g P · {macros?.carbG}g C · {macros?.fatG}g F</div>
        </div>
        {open ? <ChevronUp size={16} color="#6b7280" /> : <ChevronDown size={16} color="#6b7280" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 20px 20px' }}>
              <MealCard type="breakfast" items={breakfast} />
              <MealCard type="lunch"     items={lunch}     />
              <MealCard type="dinner"    items={dinner}    />
              <MealCard type="snack"     items={snack}     />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div style={{ background: 'rgba(17,19,24,0.9)', border: '1px solid rgba(42,45,62,0.6)', borderRadius: '16px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(42,45,62,0.6)', animation: 'shimmer 1.5s infinite linear', backgroundImage: 'linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.04) 50%,transparent 100%)', backgroundSize: '200% 100%' }} />
      <div style={{ flex: 1 }}>
        <div style={{ height: '14px', width: '100px', borderRadius: '6px', background: 'rgba(42,45,62,0.6)', marginBottom: '8px' }} />
        <div style={{ height: '11px', width: '180px', borderRadius: '6px', background: 'rgba(42,45,62,0.4)' }} />
      </div>
    </div>
  )
}

export default function DietPage() {
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [regenerating, setRegenerating] = useState(false)
  const [error, setError] = useState(null)

  const loadPlan = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getDietPlan()
      setPlan(data)
    } catch {
      setError('Could not load your diet plan. Complete your profile first to unlock personalised meal planning.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerate = async () => {
    setRegenerating(true)
    try {
      const data = await regenerateDietPlan()
      setPlan(data)
    } catch { /* ignore */ }
    finally { setRegenerating(false) }
  }

  useEffect(() => { loadPlan() }, [])

  return (
    <div style={{ minHeight: '100svh', background: '#0a0b0f' }}>
      <Navbar />
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#f3f4f6', margin: '0 0 6px', letterSpacing: '-1px' }}>Diet Plan</h1>
            <p style={{ color: '#6b7280', fontSize: '15px', margin: 0 }}>Your personalised 7-day meal plan based on your goals</p>
          </div>
          {plan && (
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="btn-ghost"
              style={{ fontSize: '14px' }}
            >
              {regenerating ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : <RefreshCw size={14} />}
              {regenerating ? 'Regenerating…' : 'Regenerate Plan'}
            </button>
          )}
        </div>

        {/* Summary cards */}
        {plan && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '14px', marginBottom: '32px' }}
          >
            {[
              { label: 'Daily TDEE', value: plan.tdee?.toLocaleString(), unit: 'kcal', color: '#7c3aed', Icon: Zap },
              { label: 'Target Calories', value: plan.targetCalories?.toLocaleString(), unit: 'kcal', color: '#22c55e', Icon: FlameCal },
              { label: 'Protein', value: Math.round(plan.targetCalories * 0.30 / 4), unit: 'g/day', color: '#3b82f6', Icon: Droplet },
              { label: 'Carbs', value: Math.round(plan.targetCalories * 0.45 / 4), unit: 'g/day', color: '#f59e0b', Icon: Wheat },
            ].map(({ label, value, unit, color, Icon }) => (
              <div key={label} style={{ background: 'rgba(17,19,24,0.9)', border: `1px solid ${color}25`, borderRadius: '14px', padding: '18px', textAlign: 'center' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${color}12`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                  <Icon size={15} color={color} />
                </div>
                <div style={{ fontSize: '22px', fontWeight: 900, color, letterSpacing: '-0.5px' }}>{value}</div>
                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>{unit}</div>
                <div style={{ fontSize: '12px', color: '#4b5563', marginTop: '4px' }}>{label}</div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Plan */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[...Array(7)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: 'rgba(17,19,24,0.6)', border: '1px dashed rgba(42,45,62,0.6)', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}><Salad size={40} color="#22c55e" /></div>
            <p style={{ color: '#6b7280', fontSize: '15px', margin: '0 0 24px', lineHeight: 1.7, maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>{error}</p>
            <a href="/profile" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 22px', borderRadius: '10px', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#a855f7', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
              Complete Profile →
            </a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {plan?.weekPlan?.map((day, i) => (
              <DayCard key={day.day} dayData={day} color={DAY_COLORS[i % DAY_COLORS.length]} index={i} />
            ))}
          </div>
        )}
      </main>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
      `}</style>
    </div>
  )
}
