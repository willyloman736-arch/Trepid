'use client'

/* ============================================================
   Offline fallback page — shown by the service worker when
   the user navigates to a page that isn't cached and the
   device has no network connection. Styled to match the
   Trepid dark aesthetic with minimal dependencies.
   ============================================================ */

export default function OfflinePage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#000000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        textAlign: 'center',
        fontFamily: 'Inter, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          border: '2px solid rgba(255,255,255,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 32,
          fontSize: 28,
          color: 'rgba(255,255,255,0.3)',
        }}
      >
        ◎
      </div>

      <h1
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: 'white',
          marginBottom: 12,
          letterSpacing: '-0.03em',
        }}
      >
        You are offline.
      </h1>

      <p
        style={{
          fontSize: 15,
          color: 'rgba(255,255,255,0.4)',
          maxWidth: 300,
          lineHeight: 1.6,
          marginBottom: 40,
        }}
      >
        Your session data is saved locally. Any trades you log will sync
        automatically when you reconnect.
      </p>

      <button
        onClick={() => {
          if (typeof window !== 'undefined') window.location.reload()
        }}
        style={{
          background: '#4F6EF7',
          color: 'white',
          border: 'none',
          borderRadius: 14,
          padding: '14px 32px',
          fontSize: 15,
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'Inter, -apple-system, sans-serif',
        }}
      >
        Try reconnecting
      </button>
    </div>
  )
}
