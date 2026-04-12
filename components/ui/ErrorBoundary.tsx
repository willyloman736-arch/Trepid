'use client'

import { Component, type ReactNode } from 'react'

/* ============================================================
   ErrorBoundary — catches render errors in children and shows
   a glass-styled fallback instead of the Next.js white error
   screen. Mount at the dashboard layout level.
   ============================================================ */

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div
            style={{
              minHeight: '100vh',
              background: '#000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
            }}
          >
            <div
              style={{
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,59,48,0.3)',
                borderRadius: 20,
                padding: '32px 40px',
                textAlign: 'center',
                maxWidth: 400,
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 16 }}>⚠</div>
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: 'white',
                  marginBottom: 8,
                  fontFamily: 'Inter, -apple-system, sans-serif',
                }}
              >
                Something went wrong
              </h2>
              <p
                style={{
                  fontSize: 14,
                  color: 'rgba(255,255,255,0.5)',
                  marginBottom: 24,
                  fontFamily: 'Inter, -apple-system, sans-serif',
                  lineHeight: 1.6,
                }}
              >
                {this.state.error?.message || 'An unexpected error occurred.'}
              </p>
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') window.location.reload()
                }}
                style={{
                  background: '#4F6EF7',
                  color: 'white',
                  border: 'none',
                  borderRadius: 12,
                  padding: '10px 24px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'Inter, -apple-system, sans-serif',
                }}
              >
                Reload page
              </button>
            </div>
          </div>
        )
      )
    }
    return this.props.children
  }
}
