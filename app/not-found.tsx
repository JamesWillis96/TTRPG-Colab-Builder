'use client'

import { useTheme } from '../contexts/ThemeContext'
import Link from 'next/link'

export default function NotFound() {
  const { theme } = useTheme()

  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 80px)',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <h1 style={{
        fontSize: '4rem',
        fontWeight: 'bold',
        color: theme.colors.primary,
        marginBottom: '1rem'
      }}>
        404
      </h1>
      <h2 style={{
        fontSize: '1.5rem',
        color: theme.colors.text.primary,
        marginBottom: '1rem'
      }}>
        Page Not Found
      </h2>
      <p style={{
        color: theme.colors.text.secondary,
        marginBottom: '2rem',
        maxWidth: '400px'
      }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        href="/"
        style={{
          padding: '0.75rem 1.5rem',
          background: theme.colors.primary,
          color: '#FFFFFF',
          borderRadius: theme.borderRadius,
          fontWeight: 'bold',
          textDecoration: 'none'
        }}
      >
        Return Home
      </Link>
    </main>
  )
}
