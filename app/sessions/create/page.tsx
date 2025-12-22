'use client'

import { useState } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function CreateSessionPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [maxPlayers, setMaxPlayers] = useState(5)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      router.push('/login')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { error: insertError } = await supabase
        .from('sessions')
        .insert({
          title,
          description,
          date_time: date,
          max_players: maxPlayers,
          gm_id: user.id,
          status: 'open'
        })

      if (insertError) throw insertError

      router.push('/sessions')
    } catch (err:  any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Please log in to create a session. </p>
        <a href="/login" style={{ color: '#4f8' }}>Go to Login</a>
      </div>
    )
  }

  return (
    <main style={{
      maxWidth: '600px',
      margin: '2rem auto',
      padding: '2rem',
      border: '1px solid #333',
      borderRadius: '8px',
      background: '#111'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Create New Session</h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>
            Session Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g., Exploring the Dark Forest"
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

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this session about?"
            rows={4}
            style={{
              width: '100%',
              padding: '0.5rem',
              background: '#222',
              border: '1px solid #444',
              borderRadius: '4px',
              color: '#fff',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>
            Date *
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
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

        <div style={{ marginBottom:  '1.5rem' }}>
          <label style={{ display:  'block', marginBottom: '0.5rem', color: '#aaa' }}>
            Max Players *
          </label>
          <input
            type="number"
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
            required
            min={1}
            max={10}
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
            padding:  '0.75rem',
            marginBottom: '1rem',
            background: '#ff000020',
            border: '1px solid #ff0000',
            borderRadius: '4px',
            color: '#ff6666'
          }}>
            {error}
          </div>
        )}

        <div style={{ display:  'flex', gap: '1rem' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: loading ? '#444' : '#4f8',
              color: loading ? '#888' : '#000',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Creating.. .' : 'Create Session'}
          </button>

          <a
            href="/sessions"
            style={{
              flex: 1,
              padding: '0.75rem',
              background: '#333',
              color: '#fff',
              border: '1px solid #555',
              borderRadius: '4px',
              fontSize: '1rem',
              fontWeight: 'bold',
              textAlign: 'center',
              textDecoration: 'none',
              display: 'block'
            }}
          >
            Cancel
          </a>
        </div>
      </form>
    </main>
  )
}