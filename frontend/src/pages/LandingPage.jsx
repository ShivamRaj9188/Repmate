import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Dumbbell, Brain, ShieldCheck, TrendingUp, Zap, ArrowRight, Play, Salad, Flame, PlayCircle } from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'AI Rep Counting',
    desc: 'MediaPipe pose detection counts every rep in real-time with sub-100ms latency. No manual tracking needed.',
    color: '#7c3aed',
    glow: 'rgba(124,58,237,0.25)',
  },
  {
    icon: ShieldCheck,
    title: 'ML Form Classification',
    desc: 'Advanced Random Forest models analyze 5-frame moving windows to probabilistically score your exercise form with sub-millisecond latency.',
    color: '#22c55e',
    glow: 'rgba(34,197,94,0.2)',
  },
  {
    icon: Salad,
    title: 'Personalised Diet Plans',
    desc: 'Get a comprehensive 7-day meal plan generated from your body stats, fitness goals, and dietary preferences.',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.2)',
  },
  {
    icon: Flame,
    title: 'Streak Tracking',
    desc: 'Every session saved. Track your rep counts, speed, accuracy, and build your completion streak over time.',
    color: '#ef4444',
    glow: 'rgba(239,68,68,0.2)',
  },
  {
    icon: PlayCircle,
    title: 'Workout Video Library',
    desc: 'Access a curated collection of workout routines and tutorials seamlessly from your dashboard.',
    color: '#3b82f6',
    glow: 'rgba(59,130,246,0.2)',
  },
]

const steps = [
  { num: '01', label: 'Create Account', sub: 'Sign up in under 30 seconds' },
  { num: '02', label: 'Position Camera', sub: 'Point your webcam at yourself' },
  { num: '03', label: 'Start Moving', sub: 'AI tracks every rep automatically' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: 'easeOut' },
  }),
}

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100svh', background: '#0a0b0f', overflowX: 'hidden' }}>
      {/* ── Navbar ── */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backdropFilter: 'blur(24px)',
          background: 'rgba(10,11,15,0.85)',
          borderBottom: '1px solid rgba(42,45,62,0.4)',
          padding: '0 40px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '9px',
              background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(124,58,237,0.4)',
            }}
          >
            <Dumbbell size={16} color="white" />
          </div>
          <span style={{ fontSize: '17px', fontWeight: 700, color: '#f3f4f6', letterSpacing: '-0.5px' }}>
            Rep<span style={{ color: '#a855f7' }}>Mate</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link to="/login" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
            Sign In
          </Link>
          <Link
            to="/register"
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
              color: 'white',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 600,
              boxShadow: '0 0 16px rgba(124,58,237,0.35)',
            }}
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        style={{
          minHeight: 'calc(100svh - 64px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '80px 24px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background orbs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div
            style={{
              position: 'absolute',
              top: '15%',
              left: '10%',
              width: '500px',
              height: '500px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '20%',
              right: '10%',
              width: '400px',
              height: '400px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          style={{ position: 'relative', zIndex: 1, maxWidth: '760px' }}
        >
          {/* Badge */}
          <motion.div variants={fadeUp} custom={0}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                borderRadius: '100px',
                background: 'rgba(124,58,237,0.1)',
                border: '1px solid rgba(124,58,237,0.3)',
                marginBottom: '32px',
              }}
            >
              <Zap size={13} color="#a855f7" />
              <span style={{ color: '#a855f7', fontSize: '13px', fontWeight: 600, letterSpacing: '0.5px' }}>
                AI-Powered Fitness Tracking
              </span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            custom={1}
            style={{
              fontSize: 'clamp(42px, 7vw, 80px)',
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: '-3px',
              margin: '0 0 24px',
              color: '#f3f4f6',
            }}
          >
            Train Smarter.{' '}
            <span className="gradient-text">Move Better.</span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            variants={fadeUp}
            custom={2}
            style={{
              fontSize: '18px',
              color: '#9ca3af',
              lineHeight: 1.7,
              maxWidth: '560px',
              margin: '0 auto 48px',
            }}
          >
            RepMate uses real-time AI pose detection to count your reps, analyze your form,
            generate personalized diet plans, and track your progress—all from one platform.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            custom={3}
            style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Link
              to="/register"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '16px 32px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
                color: 'white',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: 700,
                boxShadow: '0 0 32px rgba(124,58,237,0.45)',
                transition: 'all 0.2s ease',
              }}
            >
              <Play size={16} />
              Start Training Free
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '16px 32px',
                borderRadius: '12px',
                background: 'transparent',
                color: '#9ca3af',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: 600,
                border: '1px solid rgba(42,45,62,0.8)',
                transition: 'all 0.2s ease',
              }}
            >
              Sign In
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          style={{
            position: 'absolute',
            bottom: '32px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ color: '#4b5563', fontSize: '12px', letterSpacing: '1px' }}>SCROLL</span>
          <div
            style={{
              width: '1px',
              height: '40px',
              background: 'linear-gradient(to bottom, #7c3aed, transparent)',
            }}
          />
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '100px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <motion.div variants={fadeUp} custom={0} style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontSize: '40px', fontWeight: 800, color: '#f3f4f6', margin: '0 0 16px', letterSpacing: '-1.5px' }}>
              Everything you need to{' '}
              <span className="gradient-text">level up</span>
            </h2>
            <p style={{ color: '#6b7280', fontSize: '16px', maxWidth: '480px', margin: '0 auto' }}>
              Comprehensive tracking, personalized diets, and AI pose estimation all in one place.
            </p>
          </motion.div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
            }}
          >
            {features.map(({ icon: Icon, title, desc, color, glow }, i) => (
              <motion.div
                key={title}
                variants={fadeUp}
                custom={i + 1}
                className="feature-card"
                style={{ textAlign: 'left' }}
              >
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    background: `rgba(${color === '#7c3aed' ? '124,58,237' : color === '#22c55e' ? '34,197,94' : '245,158,11'},0.12)`,
                    border: `1px solid ${color}44`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px',
                    boxShadow: `0 0 20px ${glow}`,
                  }}
                >
                  <Icon size={24} color={color} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#f3f4f6', margin: '0 0 10px', letterSpacing: '-0.5px' }}>
                  {title}
                </h3>
                <p style={{ color: '#6b7280', fontSize: '15px', lineHeight: 1.7, margin: 0 }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── How It Works ── */}
      <section style={{ padding: '100px 24px', background: 'rgba(17,19,24,0.5)', borderTop: '1px solid rgba(42,45,62,0.3)', borderBottom: '1px solid rgba(42,45,62,0.3)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>
            <motion.h2 variants={fadeUp} custom={0} style={{ fontSize: '38px', fontWeight: 800, color: '#f3f4f6', margin: '0 0 60px', letterSpacing: '-1.5px' }}>
              Up and running in <span className="gradient-text">3 steps</span>
            </motion.h2>
            <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {steps.map(({ num, label, sub }, i) => (
                <motion.div
                  key={num}
                  variants={fadeUp}
                  custom={i + 1}
                  style={{
                    flex: '1',
                    minWidth: '200px',
                    padding: '32px 24px',
                    background: 'rgba(26,28,36,0.8)',
                    border: '1px solid rgba(42,45,62,0.6)',
                    borderRadius: '20px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 800,
                      color: '#7c3aed',
                      letterSpacing: '2px',
                      marginBottom: '16px',
                    }}
                  >
                    {num}
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#f3f4f6', marginBottom: '8px' }}>{label}</div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>{sub}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={{ padding: '100px 24px', textAlign: 'center' }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>
          <motion.h2 variants={fadeUp} custom={0} style={{ fontSize: '40px', fontWeight: 800, color: '#f3f4f6', margin: '0 0 20px', letterSpacing: '-1.5px' }}>
            Ready to crush your next set?
          </motion.h2>
          <motion.p variants={fadeUp} custom={1} style={{ color: '#6b7280', fontSize: '16px', marginBottom: '40px' }}>
            Join RepMate and never miss a rep again.
          </motion.p>
          <motion.div variants={fadeUp} custom={2}>
            <Link
              to="/register"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '16px 36px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
                color: 'white',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: 700,
                boxShadow: '0 0 40px rgba(124,58,237,0.4)',
              }}
            >
              Create Free Account <ArrowRight size={16} />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid rgba(42,45,62,0.4)', padding: '24px', textAlign: 'center', color: '#4b5563', fontSize: '13px' }}>
        © {new Date().getFullYear()} RepMate — AI-Powered Fitness Tracker
      </footer>
    </div>
  )
}
