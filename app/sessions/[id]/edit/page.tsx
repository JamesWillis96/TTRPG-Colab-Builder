'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../../../../contexts/AuthContext'
import { supabase } from '../../../../lib/supabase'
import { useParams, useRouter } from 'next/navigation'

export default function EditSessionPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [maxPlayers, setMaxPlayers] = useState(5)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadSession()
  }, [sessionId])

  const loadSession = async () => {
    try {
      const { data, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (sessionError) throw sessionError

      // Check if user is the GM
      if (user && data. gm_id !== user.id) {
        router.push('/sessions')
        return
      }

      setTitle(data.title)
      setDescription(data.description || '')
      // Convert timestamp to date format (YYYY-MM-DD)
      setDate(data.date_time.split('T')[0])
      setMaxPlayers(data.max_players)
    } catch (error: any) {
      console.error('Error loading session:', error.message)
      setError('Failed to load session')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React. FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const { error: updateError } = await supabase
        .from('sessions')
        .update({
          title,
          description,
          date_time: date,
          max_players: maxPlayers
        })
        .eq('id', sessionId)

      if (updateError) throw updateError

      router. push(`/sessions/${sessionId}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
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
      <div style={{ marginBottom: '2rem' }}>
        <a href={`/sessions/${sessionId}`} style={{ color: '#4f8', textDecoration: 'none' }}>
          ← Back to Session
        </a>
      </div>

      <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Edit Session</h1>

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
            style={{
              width:  '100%',
              padding:  '0.5rem',
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
            rows={4}
            style={{
              width: '100%',
              padding: '0.5rem',
              background: '#222',
              border: '1px solid #444',
              borderRadius:  '4px',
              color:  '#fff',
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
              borderRadius:  '4px',
              color:  '#fff'
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>
            Max Players *
          </label>
          <input
            type="number"
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(parseInt(e.target. value))}
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
            padding: '0.75rem',
            marginBottom:  '1rem',
            background:  '#ff000020',
            border: '1px solid #ff0000',
            borderRadius: '4px',
            color: '#ff6666'
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: saving ? '#444' : '#4f8',
              color: saving ? '#888' : '#000',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: saving ? 'not-allowed' : 'pointer'
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>

          <a
            href={`/sessions/${sessionId}`}
            style={{
              flex:  1,
              padding: '0.75rem',
              background: '#333',
              color:  '#fff',
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