'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../contexts/AuthContext'
import { useTheme } from '../../../contexts/ThemeContext'
import { supabase } from '../../../lib/supabase'
import { isFutureDateInMST } from '../../../lib/sessionDate'

export default function CreateSessionPage() {
  const router = useRouter()
  const { user, profile, loading:  authLoading } = useAuth()
  const { theme, styles } = useTheme()
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('18:00')
  const [maxPlayers, setMaxPlayers] = useState(4)
  const [gameSystem, setGameSystem] = useState('Dungeons & Dragons')
  const [customGameSystem, setCustomGameSystem] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && ! user) {
      router.push('/login')
    }
    if (! authLoading && profile && profile.role !== 'gm' && profile.role !== 'admin') {
      router.push('/sessions')
    }
  }, [user, profile, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) return

    // Date-only MST validation: ensure selected date is strictly in the future (MST)
    if (!isFutureDateInMST(date)) {
      alert('Session date must be in the future (MST)')
      return
    }

    setLoading(true)

    try {
      // Use custom game system if "Other" is selected
      const finalGameSystem = gameSystem === 'Other' ? customGameSystem : gameSystem

      // Combine date and time into a single datetime
        const dateTime = `${date}T${time}:00`

        const { error } = await supabase
        .from('sessions')
        .insert({
            title,
            description,
            date_time: dateTime,
            max_players: maxPlayers,
            game_system: finalGameSystem,
            gm_id:  user.id,
        })

      if (error) throw error

      router.push('/sessions')
    } catch (error:  any) {
      console.error('Error creating session:', error)
      alert('Failed to create session:  ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div style={{ ...styles.container, textAlign: 'center', color: theme.colors.text.secondary }}>
        Loading... 
      </div>
    )
  }

  if (!user || (profile && profile.role !== 'gm' && profile.role !== 'admin')) {
    return null
  }

  return (
    <main style={styles.container}>
      <h1 style={styles.heading1}>Create New Session</h1>

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

        {/* Date and Time */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap:  '1rem' }}>
          <div>
            <label style={styles.label}>
              Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target. value)}
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

        {/* Game System */}
        <div>
          <label style={styles.label}>
            Game System *
          </label>
          <select
            value={gameSystem}
            onChange={(e) => setGameSystem(e.target. value)}
            required
            style={styles.select}
          >
            <option value="Dungeons & Dragons">Dungeons & Dragons</option>
            <option value="Daggerheart">Daggerheart</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Custom Game System (if "Other" selected) */}
        {gameSystem === 'Other' && (
          <div>
            <label style={styles.label}>
              Specify Game System *
            </label>
            <input
              type="text"
              value={customGameSystem}
              onChange={(e) => setCustomGameSystem(e.target.value)}
              required
              placeholder="e.g., Pathfinder, Call of Cthulhu"
              style={styles.input}
            />
          </div>
        )}

        {/* Max Players */}
        <div>
          <label style={styles.label}>
            Max Players:  {maxPlayers}
          </label>
          <input
            type="range"
            min="2"
            max="8"
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
            style={{
              width: '100%'
            }}
          />
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button
            type="submit"
            disabled={loading}
            style={styles.button.primary}
          >
            {loading ? 'Creating...' : 'Create Session'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/sessions')}
            style={styles.button.secondary}
          >
            Cancel
          </button>
        </div>
      </form>
    </main>
  )
}