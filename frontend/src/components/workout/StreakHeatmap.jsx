import { useMemo } from 'react'

/**
 * StreakHeatmap — GitHub-style activity grid.
 *
 * Props:
 *   activeDates: string[] — array of ISO date strings ('2025-04-01')
 *   weeks: number — how many weeks to display (default 26 = 6 months)
 */
export default function StreakHeatmap({ activeDates = [], weeks = 26 }) {
  const activeSet = useMemo(() => new Set(activeDates), [activeDates])

  // Build a grid of the last `weeks` weeks (7 days each)
  const grid = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    // Start from the most-recent Sunday
    const startDay = new Date(today)
    startDay.setDate(today.getDate() - today.getDay() - (weeks - 1) * 7)

    const cols = []
    for (let w = 0; w < weeks; w++) {
      const week = []
      for (let d = 0; d < 7; d++) {
        const date = new Date(startDay)
        date.setDate(startDay.getDate() + w * 7 + d)
        const iso = date.toISOString().split('T')[0]
        week.push({ iso, future: date > today })
      }
      cols.push(week)
    }
    return cols
  }, [weeks])

  const CELL = 12
  const GAP  = 3
  const DAY_LABELS = ['', 'M', '', 'W', '', 'F', '']

  return (
    <div>
      <div style={{ display: 'flex', gap: `${GAP}px`, alignItems: 'flex-end' }}>
        {/* Day labels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${GAP}px`, marginRight: '2px' }}>
          {DAY_LABELS.map((label, i) => (
            <div key={i} style={{ width: '10px', height: `${CELL}px`, fontSize: '9px', color: '#4b5563', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              {label}
            </div>
          ))}
        </div>

        {/* Week columns */}
        {grid.map((week, wi) => (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: `${GAP}px` }}>
            {week.map(({ iso, future }) => {
              const active = !future && activeSet.has(iso)
              const isToday = iso === new Date().toISOString().split('T')[0]
              return (
                <div
                  key={iso}
                  title={iso}
                  style={{
                    width: `${CELL}px`, height: `${CELL}px`, borderRadius: '3px',
                    background: future ? 'transparent' : active ? '#7c3aed' : 'rgba(42,45,62,0.5)',
                    outline: isToday ? '1px solid #a855f7' : active ? '1px solid rgba(168,85,247,0.4)' : 'none',
                    outlineOffset: '1px',
                    opacity: future ? 0 : 1,
                    boxShadow: active ? '0 0 6px rgba(124,58,237,0.5)' : 'none',
                    transition: 'background 0.2s ease',
                    cursor: 'default',
                  }}
                />
              )
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', justifyContent: 'flex-end' }}>
        <span style={{ fontSize: '10px', color: '#4b5563' }}>Less</span>
        {['rgba(42,45,62,0.5)', '#4c2d8f', '#7c3aed', '#9d4edd', '#a855f7'].map((c, i) => (
          <div key={i} style={{ width: '10px', height: '10px', borderRadius: '2px', background: c }} />
        ))}
        <span style={{ fontSize: '10px', color: '#4b5563' }}>More</span>
      </div>
    </div>
  )
}
