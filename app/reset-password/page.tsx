'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { useTheme } from '../../contexts/ThemeContext'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { theme, styles } = useTheme()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) throw updateError

      setSuccess(true)
      setTimeout(() => router.push('/login'), 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
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
        {/* Gradient overlay */}
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
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: theme.colors.text.primary }}>
            ✓ Password Reset
          </h1>
          <p style={{ color: theme.colors.text.secondary, marginBottom: '1.5rem' }}>
            Your password has been successfully reset. Redirecting to login...
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
      {/* Gradient overlay */}
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
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: theme.colors.text.primary }}>
          Set New Password
        </h1>
        <p style={{ fontSize: '0.9rem', color: theme.colors.text.secondary, marginBottom: '1.5rem' }}>
          Enter your new password below.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={styles.label}>New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
              placeholder="At least 6 characters"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={styles.label}>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={styles.input}
              placeholder="Confirm your password"
            />
          </div>

          {error && (
            <div style={{
              padding: '0.75rem',
              marginBottom: '1rem',
              background: '#8B000020',
              border: `1px solid ${theme.colors.danger}`,
              borderRadius: theme.borderRadius,
              color: theme.colors.danger,
              fontSize: '0.9rem'
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
              border: 'none',
              borderRadius: theme.borderRadius,
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', color: theme.colors.text.secondary, fontSize: '0.9rem' }}>
          <a href="/login" style={{ color: theme.colors.primary, textDecoration: 'none', fontWeight: 'bold' }}>
            Back to Login
          </a>
        </p>
      </div>
    </main>
  )
}
