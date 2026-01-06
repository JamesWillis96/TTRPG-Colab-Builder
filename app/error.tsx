'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 80px)',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <h2 style={{
        fontSize: '1.5rem',
        marginBottom: '1rem',
        color: '#8C3131'
      }}>
        Something went wrong!
      </h2>
      <p style={{
        color: '#666',
        marginBottom: '1.5rem'
      }}>
        An unexpected error has occurred.
      </p>
      <button
        onClick={reset}
        style={{
          padding: '0.75rem 1.5rem',
          background: '#8C3131',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        Try again
      </button>
    </div>
  )
}
