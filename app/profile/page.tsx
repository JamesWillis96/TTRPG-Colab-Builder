'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

export default function ProfilePage() {
  const { user } = useAuth()
  const [username, setUsername] = useState('')
  const [role, setRole] = useState('player')
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
        .update({ username, role })
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
    return <div style={{ padding:  '2rem' }}>Please log in to view your profile.</div>
  }

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading...</div>
  }

  return (
    <main style={{ 
      maxWidth: '600px', 
      margin: '2rem auto', 
      padding:  '2rem',
      border: '1px solid #333',
      borderRadius: '8px',
      background: '#111'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1. 5rem' }}>Your Profile</h1>

      <div style={{ 
        marginBottom: '2rem', 
        padding: '1rem', 
        background: '#0a0a0a', 
        borderRadius: '4px',
        border: '1px solid #222'
      }}>
        <p style={{ marginBottom: '0.5rem', color: '#888' }}>
          <strong>Email:</strong> {user.email}
        </p>
        <p style={{ color: '#888' }}>
          <strong>User ID:</strong> {user.id. substring(0, 8)}...
        </p>
      </div>

      <form onSubmit={handleSave}>
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
              border: '1px solid #444',
              borderRadius: '4px',
              color: '#fff'
            }}
          />
        </div>

        <div style={{ marginBottom:  '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              background: '#222',
              border: '1px solid #444',
              borderRadius: '4px',
              color: '#fff'
            }}
          >
            <option value="player">Player</option>
            <option value="gm">Game Master</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {message && (
          <div style={{ 
            padding: '0.75rem', 
            marginBottom: '1rem',
            background: message.startsWith('Error') ? '#ff000020' : '#00ff0020',
            border: message.startsWith('Error') ? '1px solid #ff0000' : '1px solid #00ff00',
            borderRadius: '4px',
            color: message.startsWith('Error') ? '#ff6666' : '#4f8'
          }}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          style={{
            width: '100%',
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
      </form>
    </main>
  )
}