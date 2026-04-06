import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Dumbbell, LayoutDashboard, History, LogOut, Zap, Salad, Video, User } from 'lucide-react'

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/workout', label: 'Workout', icon: Zap },
  { to: '/history', label: 'History', icon: History },
  { to: '/diet', label: 'Diet', icon: Salad },
  { to: '/videos', label: 'Videos', icon: Video },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const firstName = user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Athlete'

  return (
    <nav className="navbar">
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <Link
          to="/dashboard"
          style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}
        >
          <div
            style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 16px rgba(124,58,237,0.4)',
            }}
          >
            <Dumbbell size={18} color="white" />
          </div>
          <span style={{ fontSize: '18px', fontWeight: 700, color: '#f3f4f6', letterSpacing: '-0.5px' }}>
            Rep<span style={{ color: '#a855f7' }}>Mate</span>
          </span>
        </Link>

        {/* Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          {navLinks.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to
            return (
              <Link
                key={to}
                to={to}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '7px 12px', borderRadius: '8px', textDecoration: 'none',
                  fontSize: '13px', fontWeight: 500,
                  color: active ? '#a855f7' : '#9ca3af',
                  background: active ? 'rgba(124,58,237,0.1)' : 'transparent',
                  border: active ? '1px solid rgba(124,58,237,0.25)' : '1px solid transparent',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon size={14} />
                {label}
              </Link>
            )
          })}
        </div>

        {/* User + Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {user && (
            <Link
              to="/profile"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '8px', background: 'rgba(26,28,36,0.8)', border: '1px solid rgba(42,45,62,0.6)', textDecoration: 'none' }}
            >
              <div
                style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 700, color: 'white', flexShrink: 0,
                  overflow: 'hidden'
                }}
              >
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  (user.name || user.email)?.[0]?.toUpperCase()
                )}
              </div>
              <span style={{ fontSize: '13px', color: '#d1d5db', whiteSpace: 'nowrap' }}>
                Hey, <span style={{ fontWeight: 700, color: '#f3f4f6' }}>{firstName}</span>
              </span>
            </Link>
          )}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 12px', borderRadius: '8px',
              background: 'transparent', border: '1px solid rgba(42,45,62,0.6)',
              color: '#6b7280', cursor: 'pointer', fontSize: '13px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = 'rgba(42,45,62,0.6)' }}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
