import { ChevronDown } from 'lucide-react'

const EXERCISES = [
  { value: 'PUSHUP', label: 'Push-Ups', available: true },
  { value: 'SQUAT', label: 'Squats', available: true },
  { value: 'CURL', label: 'Bicep Curls', available: true },
  { value: 'PULLUP', label: 'Pull-Ups', available: true },
]

export default function ExercisePicker({ value, onChange, disabled }) {
  return (
    <div style={{ position: 'relative' }}>
      <label
        style={{
          display: 'block',
          marginBottom: '8px',
          fontSize: '13px',
          fontWeight: 600,
          color: '#9ca3af',
          letterSpacing: '0.5px',
        }}
      >
        EXERCISE TYPE
      </label>
      <div style={{ position: 'relative' }}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          style={{
            width: '100%',
            padding: '13px 40px 13px 16px',
            background: 'rgba(26,28,36,0.9)',
            border: '1px solid rgba(42,45,62,0.8)',
            borderRadius: '10px',
            color: '#f3f4f6',
            fontSize: '15px',
            fontFamily: 'Inter, inherit',
            outline: 'none',
            appearance: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.6 : 1,
          }}
        >
          {EXERCISES.map(({ value: v, label, available }) => (
            <option key={v} value={v} disabled={!available}>
              {label} {!available ? '(Coming Soon)' : ''}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          color="#6b7280"
          style={{
            position: 'absolute',
            right: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  )
}
