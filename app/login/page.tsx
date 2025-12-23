'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { styles, theme } from '../../lib/theme'


export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { user, signIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
  if (user) {
    router.push('/sessions')
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

  return (
    <main style={{ 
      maxWidth: '400px', 
      margin:  '4rem auto', 
      padding: '2rem',
      border: `1px solid ${theme.colors.border.primary}`,
      borderRadius: theme.borderRadius,
      background: theme.colors.background.secondary
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
    </main>
  )
}