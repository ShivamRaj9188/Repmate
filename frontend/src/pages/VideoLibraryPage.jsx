import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Play, ChevronRight, CheckCircle, AlertTriangle, ArrowUpFromLine, ArrowDownUp, BicepsFlexed, ArrowUpSquare, Minus, Weight, MoveDiagonal, ArrowUpCircle } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import { EXERCISES, DIFFICULTY_COLORS, MUSCLE_GROUP_OPTIONS, EQUIPMENT_OPTIONS } from '../lib/exerciseVideos'

const IconMap = { ArrowUpFromLine, ArrowDownUp, BicepsFlexed, ArrowUpSquare, Minus, Weight, MoveDiagonal, ArrowUpCircle }

function VideoModal({ exercise, onClose }) {
  const [tab, setTab] = useState('video')
  if (!exercise) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          onClick={e => e.stopPropagation()}
          style={{ background: '#111318', border: '1px solid rgba(42,45,62,0.8)', borderRadius: '24px', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflow: 'auto' }}
        >
          {/* Header */}
          <div style={{ padding: '24px 28px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#f3f4f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {(() => {
                  const IconComponent = exercise.iconName ? IconMap[exercise.iconName] : null;
                  return IconComponent ? <IconComponent size={24} color="#a855f7" /> : null;
                })()}
                {exercise.name}
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', background: `${DIFFICULTY_COLORS[exercise.difficulty]}18`, color: DIFFICULTY_COLORS[exercise.difficulty], border: `1px solid ${DIFFICULTY_COLORS[exercise.difficulty]}35` }}>
                  {exercise.difficulty}
                </span>
                {exercise.muscleGroups.map(m => (
                  <span key={m} style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: 'rgba(124,58,237,0.1)', color: '#a855f7', border: '1px solid rgba(124,58,237,0.25)' }}>{m}</span>
                ))}
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '4px' }}>
              <X size={22} />
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '4px', padding: '20px 28px 0' }}>
            {['video', 'tips', 'mistakes'].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 16px', borderRadius: '8px', background: tab === t ? 'rgba(124,58,237,0.15)' : 'transparent', border: tab === t ? '1px solid rgba(124,58,237,0.35)' : '1px solid transparent', color: tab === t ? '#a855f7' : '#6b7280', cursor: 'pointer', fontSize: '13px', fontWeight: 600, textTransform: 'capitalize' }}>
                {t}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ padding: '20px 28px 28px' }}>
            {tab === 'video' && (
              <>
                <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: 1.7, marginBottom: '16px' }}>{exercise.description}</p>
                <div style={{ position: 'relative', paddingTop: '56.25%', borderRadius: '14px', overflow: 'hidden', background: '#000' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${exercise.youtubeId}?rel=0&modestbranding=1`}
                    title={exercise.name}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                    allowFullScreen
                  />
                </div>
              </>
            )}
            {tab === 'tips' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {exercise.tips.map((tip, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', padding: '14px 16px', borderRadius: '12px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}>
                    <CheckCircle size={16} color="#22c55e" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ color: '#d1d5db', fontSize: '14px', lineHeight: 1.6 }}>{tip}</span>
                  </div>
                ))}
              </div>
            )}
            {tab === 'mistakes' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {exercise.mistakes.map((m, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', padding: '14px 16px', borderRadius: '12px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <AlertTriangle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ color: '#d1d5db', fontSize: '14px', lineHeight: 1.6 }}>{m}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function ExerciseCard({ exercise, onOpen }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.15 } }}
      className="feature-card"
      style={{ cursor: 'pointer', padding: '24px' }}
      onClick={() => onOpen(exercise)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(124,58,237,0.1)', color: '#a855f7' }}>
          {(() => {
             const IconComponent = exercise.iconName ? IconMap[exercise.iconName] : null;
             return IconComponent ? <IconComponent size={20} /> : null;
          })()}
        </span>
        <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', background: `${DIFFICULTY_COLORS[exercise.difficulty]}15`, color: DIFFICULTY_COLORS[exercise.difficulty], border: `1px solid ${DIFFICULTY_COLORS[exercise.difficulty]}30` }}>
          {exercise.difficulty}
        </span>
      </div>
      <div style={{ fontSize: '18px', fontWeight: 800, color: '#f3f4f6', marginBottom: '6px' }}>{exercise.name}</div>
      <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '14px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {exercise.description}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
        {exercise.muscleGroups.slice(0, 3).map(m => (
          <span key={m} style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: 'rgba(124,58,237,0.08)', color: '#a855f7', border: '1px solid rgba(124,58,237,0.2)' }}>{m}</span>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a855f7', fontSize: '13px', fontWeight: 600 }}>
        <Play size={13} /> Watch Tutorial <ChevronRight size={13} />
      </div>
    </motion.div>
  )
}

export default function VideoLibraryPage() {
  const [search, setSearch] = useState('')
  const [muscleFilter, setMuscleFilter] = useState('All')
  const [equipFilter, setEquipFilter] = useState('All')
  const [modal, setModal] = useState(null)

  const filtered = EXERCISES.filter(ex => {
    const matchSearch = ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.muscleGroups.some(m => m.toLowerCase().includes(search.toLowerCase()))
    const matchMuscle = muscleFilter === 'All' || ex.muscleGroups.some(m => m.toLowerCase().includes(muscleFilter.toLowerCase()))
    const matchEquip  = equipFilter === 'All' || ex.equipment.some(e => e.toLowerCase().includes(equipFilter.toLowerCase()))
    return matchSearch && matchMuscle && matchEquip
  })

  return (
    <div style={{ minHeight: '100svh', background: '#0a0b0f' }}>
      <Navbar />
      {modal && <VideoModal exercise={modal} onClose={() => setModal(null)} />}

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '36px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#f3f4f6', margin: '0 0 6px', letterSpacing: '-1px' }}>
            Exercise Library
          </h1>
          <p style={{ color: '#6b7280', fontSize: '15px', margin: 0 }}>
            Video tutorials, form tips, and common mistakes for every exercise
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '32px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search size={15} color="#4b5563" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search exercises or muscle groups…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                <X size={14} />
              </button>
            )}
          </div>
          <select className="input-field" value={muscleFilter} onChange={e => setMuscleFilter(e.target.value)} style={{ width: 'auto', cursor: 'pointer', appearance: 'auto' }}>
            {MUSCLE_GROUP_OPTIONS.map(o => <option key={o} value={o}>{o === 'All' ? 'Muscle Group' : o}</option>)}
          </select>
          <select className="input-field" value={equipFilter} onChange={e => setEquipFilter(e.target.value)} style={{ width: 'auto', cursor: 'pointer', appearance: 'auto' }}>
            {EQUIPMENT_OPTIONS.map(o => <option key={o} value={o}>{o === 'All' ? 'Equipment' : o}</option>)}
          </select>
        </div>

        {/* Results count */}
        <div style={{ marginBottom: '20px', fontSize: '14px', color: '#6b7280' }}>
          Showing {filtered.length} exercise{filtered.length !== 1 ? 's' : ''}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: 'rgba(17,19,24,0.6)', border: '1px dashed rgba(42,45,62,0.6)', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}><Search size={40} color="#a855f7" /></div>
            <p style={{ color: '#6b7280', fontSize: '15px', margin: 0 }}>No exercises match your filters.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '20px' }}>
            {filtered.map(ex => (
              <ExerciseCard key={ex.id} exercise={ex} onOpen={setModal} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
