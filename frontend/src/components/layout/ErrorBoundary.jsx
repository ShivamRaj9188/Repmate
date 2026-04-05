import { Component } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100svh',
            background: '#0a0b0f',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: '480px' }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(239,68,68,0.1)',
                border: '2px solid rgba(239,68,68,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
              }}
            >
              <AlertTriangle size={36} color="#ef4444" />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#f3f4f6', margin: '0 0 12px' }}>
              Something went wrong
            </h1>
            <p style={{ color: '#6b7280', fontSize: '15px', margin: '0 0 32px', lineHeight: 1.7 }}>
              An unexpected error occurred. Try refreshing the page — if the problem persists, please contact support.
            </p>
            {this.state.error && (
              <pre
                style={{
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: '10px',
                  padding: '14px',
                  fontSize: '12px',
                  color: '#ef4444',
                  textAlign: 'left',
                  overflow: 'auto',
                  marginBottom: '28px',
                  maxHeight: '120px',
                }}
              >
                {this.state.error.message}
              </pre>
            )}
            <button
              className="btn-primary"
              onClick={() => window.location.reload()}
              style={{ justifyContent: 'center' }}
            >
              <RotateCcw size={15} />
              Reload Page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
