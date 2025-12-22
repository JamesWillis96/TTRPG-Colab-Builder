'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React. FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Create the auth user
      const { data, error:  signUpError } = await supabase. auth.signUp({
        email,
        password,
      })

      if (signUpError) throw signUpError

      // Update the profile with username
      if (data.user) {
        const { error:  profileError } = await supabase
          .from('profiles')
          .update({ username })
          .eq('id', data.user.id)

        if (profileError) throw profileError
      }

      // Redirect to login
      router. push('/login? message=Check your email to confirm your account')
    } catch (err:  any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ 
      maxWidth: '400px', 
      margin: '4rem auto', 
      padding:  '2rem',
      border: '1px solid #333',
      borderRadius: '8px',
      background: '#111'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom:  '1. 5rem' }}>Create Account</h1>
      
      <form onSubmit={handleSignup}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              background: '#222',
              border:  '1px solid #444',
              borderRadius: '4px',
              color: '#fff'
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              background: '#222',
              border: '1px solid #444',
              borderRadius:  '4px',
              color:  '#fff'
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target. value)}
            required
            minLength={6}
            style={{
              width: '100%',
              padding: '0.5rem',
              background: '#222',
              border: '1px solid #444',
              borderRadius: '4px',
              color: '#fff'
            }}
          />
        </div>

        {error && (
          <div style={{ 
            padding: '0.75rem', 
            marginBottom: '1rem',
            background: '#ff000020',
            border: '1px solid #ff0000',
            borderRadius: '4px',
            color: '#ff6666'
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
            background: loading ? '#444' : '#4f8',
            color: loading ? '#888' : '#000',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' :  'pointer'
          }}
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      <p style={{ marginTop:  '1.5rem', textAlign: 'center', color: '#888' }}>
        Already have an account? {' '}
        <a href="/login" style={{ color:  '#4f8' }}>Log in</a>
      </p>
    </main>
  )
}