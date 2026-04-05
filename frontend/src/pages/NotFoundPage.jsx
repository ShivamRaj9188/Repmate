import { Link } from 'react-router-dom'
import { Home, Dumbbell } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div
      style={{
        minHeight: '100svh',
        background: '#0a0b0f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background orbs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '20%', left: '15%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.12) 0%,transparent 70%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '15%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(168,85,247,0.08) 0%,transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        {/* Animated 404 */}
        <div
          style={{
            fontSize: 'clamp(80px,18vw,160px)',
            fontWeight: 900,
            letterSpacing: '-8px',
            lineHeight: 1,
            background: 'linear-gradient(135deg, rgba(124,58,237,0.4) 0%, rgba(168,85,247,0.2) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '8px',
          }}
        >
          404
        </div>

        {/* Icon */}
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '20px',
            background: 'rgba(124,58,237,0.1)',
            border: '2px solid rgba(124,58,237,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 28px',
            boxShadow: '0 0 40px rgba(124,58,237,0.2)',
          }}
        >
          <Dumbbell size={32} color="#a855f7" />
        </div>

        <h1 style={{ fontSize: 'clamp(22px,4vw,32px)', fontWeight: 800, color: '#f3f4f6', margin: '0 0 12px', letterSpacing: '-1px' }}>
          Page Not Found
        </h1>
        <p style={{ color: '#6b7280', fontSize: '16px', margin: '0 0 40px', lineHeight: 1.7, maxWidth: '380px' }}>
          Looks like you wandered off the track. Let's get you back to your workout.
        </p>

        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/dashboard" className="btn-primary" style={{ textDecoration: 'none' }}>
            <Home size={16} />
            Go to Dashboard
          </Link>
          <Link to="/" className="btn-ghost" style={{ textDecoration: 'none' }}>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
