'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { theme, styles } from '../../lib/theme'

export default function ProfilePage() {
  const { user } = useAuth()
  const [username, setUsername] = useState('')
  const [role, setRole] = useState('player')
  const [aboutMe, setAboutMe] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single()

      if (error) throw error

      setUsername(data.username)
      setRole(data.role)
      setAboutMe(data.aboutMe || '')
    } catch (error: any) {
      console.error('Error loading profile:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username, role, aboutMe })
        .eq('id', user!.id)

      if (error) throw error

      setMessage('Profile updated successfully!')
    } catch (error:  any) {
      setMessage('Error:  ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return <div style={{ ...styles.container, textAlign: 'center', color: theme.colors.text.secondary }}>Please log in to view your profile.</div>
  }

  if (loading) {
    return <div style={{ ...styles.container, textAlign: 'center', color: theme.colors.text.secondary }}>Loading...</div>
  }

  return (
    <main style={styles.card}>
      <h1 style={styles.heading1}>Your Profile</h1>

      <div style={{ 
        marginBottom: '2rem', 
        padding: '1rem', 
        background: theme.colors.background.secondary, 
        borderRadius: theme.borderRadius,
        border: `1px solid ${theme.colors.border.secondary}`
      }}>
        <p style={{ marginBottom: '0.5rem', color: theme.colors.text.secondary }}>
          <strong style={{ color: theme.colors.text.primary }}>Email:</strong> {user.email}
        </p>
        <p style={{ color: theme.colors.text.secondary }}>
          <strong style={{ color: theme.colors.text.primary }}>User ID:</strong> {user.id.substring(0, 8)}...
        </p>
      </div>

      <form onSubmit={handleSave}>
        <div style={{ marginBottom: '1rem' }}>
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

        <div style={{ marginBottom:  '1.5rem' }}>
          <label style={styles.label}>
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={styles.select}
          >
            <option value="player">Player</option>
            <option value="gm">Game Master</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={styles.label}>
            About Me
          </label>
          <textarea
            value={aboutMe}
            onChange={(e) => setAboutMe(e.target.value)}
            rows={4}
            style={{ ...styles.input, resize: 'vertical', minHeight: 80 }}
            placeholder="Tell us a bit about yourself..."
          />
        </div>

        {message && (
          <div style={{ 
            padding: '0.75rem', 
            marginBottom: '1rem',
            background: message.startsWith('Error') ? theme.colors.background.error : theme.colors.background.success,
            border: message.startsWith('Error') ? `1px solid ${theme.colors.danger}` : `1px solid ${theme.colors.success}`,
            borderRadius: theme.borderRadius,
            color: message.startsWith('Error') ? theme.colors.danger : theme.colors.success
          }}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          style={styles.button.primary}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </main>
  )
}