'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../../../../contexts/AuthContext'
import { useTheme } from '../../../../contexts/ThemeContext'
import { supabase } from '../../../../lib/supabase'
import { useParams, useRouter } from 'next/navigation'

export default function EditSessionPage() {
  const { user } = useAuth()
  const { theme, styles } = useTheme()
  const params = useParams()
  const router = useRouter()
  const sessionId = params?.id as string;

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('18:00')
  const [maxPlayers, setMaxPlayers] = useState(5)
  const [gameSystem, setGameSystem] = useState('Dungeons & Dragons')
  const [customGameSystem, setCustomGameSystem] = useState('')
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
      // Split timestamp into date and time
      const dateTime = new Date(data.date_time)
      setDate(dateTime.toISOString().split('T')[0])
      setTime(dateTime.toTimeString().slice(0, 5))
      setMaxPlayers(data.max_players)
      setGameSystem(data.game_system || 'Dungeons & Dragons')
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

    // Validation
    if (gameSystem === 'Other' && !customGameSystem.trim()) {
      setError('Please enter a custom game system')
      setSaving(false)
      return
    }

    try {
      // Use custom game system if "Other" is selected
      const finalGameSystem = gameSystem === 'Other' ? customGameSystem : gameSystem

      // Combine date and time into a single datetime
      const dateTime = `${date}T${time}:00`

      const { error: updateError } = await supabase
        .from('sessions')
        .update({
          title,
          description,
          date_time: dateTime,
          max_players: maxPlayers,
          game_system: finalGameSystem
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
    return <div style={{ ...styles.container, textAlign: 'center', color: theme.colors.text.secondary }}>Loading...</div>
  }

  return (
    <main style={styles.container}>
      <div style={{ marginBottom: '2rem' }}>
        <a href={`/sessions/${sessionId}`} style={{ color: theme.colors.primary, textDecoration: 'none' }}>
          ← Back to Session
        </a>
      </div>

      <h1 style={styles.heading1}>Edit Session</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Title */}
        <div>
          <label style={styles.label}>
            Session Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g., The Dragon's Lair"
            style={styles.input}
          />
        </div>

        {/* Description */}
        <div>
          <label style={styles.label}>
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what players can expect..."
            rows={5}
            style={styles.textarea}
          />
        </div>

        {/* Game System */}
        <div>
          <label style={styles.label}>
            Game System *
          </label>
          <select
            value={gameSystem}
            onChange={(e) => setGameSystem(e.target.value)}
            style={styles.select}
            required
          >
            <option value="Dungeons & Dragons">Dungeons & Dragons</option>
            <option value="Pathfinder">Pathfinder</option>
            <option value="Call of Cthulhu">Call of Cthulhu</option>
            <option value="Warhammer">Warhammer</option>
            <option value="Shadowrun">Shadowrun</option>
            <option value="Other">Other</option>
          </select>
          {gameSystem === 'Other' && (
            <input
              type="text"
              placeholder="Enter custom game system"
              value={customGameSystem}
              onChange={(e) => setCustomGameSystem(e.target.value)}
              style={{ ...styles.input, marginTop: '0.5rem' }}
              required
            />
          )}
        </div>

        {/* Date and Time */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={styles.label}>
              Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div>
            <label style={styles.label}>
              Time *
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              style={styles.input}
            />
          </div>
        </div>

        {/* Max Players */}
        <div>
          <label style={styles.label}>
            Max Players *
          </label>
          <input
            type="number"
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(parseInt(e.target. value))}
            required
            min={1}
            max={10}
            style={styles.input}
          />
        </div>

        {error && (
          <div style={{
            padding: '0.75rem',
            marginBottom:  '1rem',
            background: theme.colors.background.error,
            border: `1px solid ${theme.colors.danger}`,
            borderRadius: theme.borderRadius,
            color: theme.colors.danger
          }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button
            type="submit"
            disabled={saving}
            style={styles.button.primary}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>

          <a
            href={`/sessions/${sessionId}`}
            style={styles.button.secondary}
          >
            Cancel
          </a>
        </div>
      </form>
    </main>
  )
}