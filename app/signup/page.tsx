'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'

export default function SignupPage() {
  const router = useRouter()
  const { user, signUp, loading: authLoading } = useAuth()
  const { theme, styles } = useTheme()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [signedUp, setSignedUp] = useState(false)  // Add state for signup success

  useEffect(() => {
    if (!authLoading && user && signedUp) {
      router.push('/')
    }
  }, [user, authLoading, signedUp, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signUp(email, password, username)
      setSignedUp(true)  // Set signed up to true on success
      // Do not redirect here; wait for email confirmation
    } catch (err: any) {
      setError(err.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 'calc(100vh - 80px)',
        color: theme.colors.text.secondary
      }}>
        Loading...
      </div>
    )
  }

  if (user) {
    return null
  }

  if (signedUp) {
    return (
      <main style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 80px)',
        padding: '2rem'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '400px',
          background: theme.colors.background.secondary,
          border: `1px solid ${theme.colors.border.primary}`,
          borderRadius: theme.borderRadius,
          padding: '2rem',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: theme.colors.text.primary }}>
            Check Your Email
          </h1>
          <p style={{ color: theme.colors.text.secondary, marginBottom: '1.5rem' }}>
            We've sent a confirmation link to <strong>{email}</strong>. Click the link to activate your account.
          </p>
          <p style={{ color: theme.colors.text.secondary }}>
            Already confirmed? <a href="/login" style={{ color: theme.colors.primary, textDecoration: 'none', fontWeight: 'bold' }}>Log In</a>
          </p>
        </div>
      </main>
    )
  }

  return (
    <main style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
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
        width: '100%',
        maxWidth: '400px',
        background: theme.colors.background.secondary,
        border: `1px solid ${theme.colors.border.primary}`,
        borderRadius: theme.borderRadius,
        padding: '2rem',
        position: 'relative',
        zIndex: 1,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center', color: theme.colors.text.primary }}>
          Create Account
        </h1>

        {error && (
          <div style={{
            padding: '1rem',
            background: '#8B000020',
            border: `1px solid ${theme.colors.danger}`,
            borderRadius: theme.borderRadius,
            color: theme.colors.danger,
            marginBottom: '1.5rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={styles.label}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div>
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

          <div>
            <label style={styles.label}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={styles.input}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '1rem',
              background: loading ? theme.colors.background.tertiary : theme.colors.primary,
              color: loading ? theme.colors.text.muted : '#2F1B14',
              border: 'none',
              borderRadius: theme.borderRadius,
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: theme.colors.text.secondary }}>
          Already have an account? {' '}
          <a href="/login" style={{ color: theme.colors.primary, textDecoration: 'none', fontWeight: 'bold' }}>
            Log In
          </a>
        </p>
      </div>
    </main>
  )
}