'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'


export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [guestLoading, setGuestLoading] = useState(false)
  const { user } = useAuth()
  const { theme, styles } = useTheme()
  const router = useRouter()

  useEffect(() => {
  if (user) {
    router.push('/')
  }
}, [user, router])

  const handleLogin = async (e: React. FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error: signInError } = await supabase. auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      // Redirect to home page on success
      router.push('/')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGuestLogin = async () => {
    router.push('/sessions?guest')
  }

  return (
    <main style={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      backgroundImage: 'url(https://i.pinimg.com/736x/b1/5f/5d/b15f5d26bbe913ff5d5368a92565dd92.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Gradient overlay - darker on sides, lighter in center */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to right, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.4) 30%, rgba(0, 0, 0, 0.2) 50%, rgba(0, 0, 0, 0.4) 70%, rgba(0, 0, 0, 0.8) 100%)',
        zIndex: 0
      }} />
      <div style={{ 
        position: 'relative',
        zIndex: 1,
        maxWidth: '400px',
        width: '100%',
        padding: '2rem',
        border: `1px solid ${theme.colors.border.primary}`,
        borderRadius: theme.borderRadius,
        background: theme.colors.background.secondary,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: theme.colors.text.primary }}>Log In</h1>
      
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={styles.label}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={styles.label}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target. value)}
            required
            style={styles.input}
          />
          <a
            href="/forgot-password"
            style={{
              display: 'inline-block',
              marginTop: '0.5rem',
              fontSize: '0.85rem',
              color: theme.colors.primary,
              textDecoration: 'none'
            }}
          >
            Forgot password?
          </a>
        </div>

        {error && (
          <div style={{ 
            padding: '0.75rem', 
            marginBottom: '1rem',
            background: '#8B000020',
            border: `1px solid ${theme.colors.danger}`,
            borderRadius: theme.borderRadius,
            color: theme.colors.danger
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: loading ? theme.colors.background.tertiary : theme.colors.primary,
            color: loading ? theme.colors.text.muted : '#2F1B14',
            border:  'none',
            borderRadius: theme.borderRadius,
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Logging In.. .' : 'Log In'}
        </button>
      </form>

      <p style={{ marginTop: '1.5rem', textAlign: 'center', color: theme.colors.text.secondary }}>
        Don't have an account?{' '}
        <a href="/signup" style={{ color: theme.colors.primary }}>Sign up</a>
      </p>

      <div style={{
        marginTop: '1.5rem',
        paddingTop: '1.5rem',
        borderTop: `1px solid ${theme.colors.border.secondary}`
      }}>
        <h2 style={{
          margin: 0,
          marginBottom: '0.5rem',
          fontSize: '1.1rem',
          color: theme.colors.text.primary,
          textAlign: 'center'
        }}>
          Guest Signup
        </h2>
        <p style={{
          margin: 0,
          marginBottom: '1rem',
          fontSize: '0.9rem',
          color: theme.colors.text.secondary,
          textAlign: 'center'
        }}>
          Sign Up for a session as a guest.
        </p>
        <button
          type="button"
          onClick={handleGuestLogin}
          disabled={guestLoading}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: guestLoading ? theme.colors.background.tertiary : theme.colors.background.main,
            color: guestLoading ? theme.colors.text.muted : theme.colors.text.primary,
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: theme.borderRadius,
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: guestLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {guestLoading ? 'Starting Guest Session...' : 'Continue as Guest'}
        </button>
      </div>
      </div>
    </main>
  )
}