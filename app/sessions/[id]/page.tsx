'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { useTheme } from '../../../contexts/ThemeContext'
import { supabase } from '../../../lib/supabase'
import { useParams, useRouter } from 'next/navigation'

type Session = {
  id: string
  title: string
  description: string
  date_time: string
  max_players: number
  gm_id: string
  status: string
  created_at: string
  deleted_at?: string | null
  deleted_by?: string | null
}

type Profile = {
  id: string
  username: string
  role: string
}

type Signup = {
  id: string
  session_id: string
  player_id: string 
  signed_up_at: string
  profile?: Profile
}

export default function SessionDetailPage() {
  const { user, profile } = useAuth()
  const { theme, styles } = useTheme()
  const params = useParams()
  const router = useRouter()

  // Ensure params is not null
  const sessionId = params?.id as string

  const [session, setSession] = useState<Session | null>(null)
  const [signups, setSignups] = useState<Signup[]>([])
  const [loading, setLoading] = useState(true)
  const [isGM, setIsGM] = useState(false)
  const [showGuestModal, setShowGuestModal] = useState(false)
  const [guestName, setGuestName] = useState('')
  const [guestError, setGuestError] = useState('')
  const [guestLoading, setGuestLoading] = useState(false)
  // Helper: is guest user (anonymous, no profile)
  const isGuest = user && (!profile || profile.role === 'guest' || profile.username?.toLowerCase().startsWith('guest'))
  // Guest sign up handler
  const handleGuestSignup = async () => {
    setGuestError('')
    if (!guestName.trim()) {
      setGuestError('Please enter a name.')
      return
    }
    setGuestLoading(true)
    try {
      // 1. Create guest profile if not exists
      let guestProfileId = user?.id
      if (!profile) {
        const { data: newProfile, error: profileErr } = await supabase
          .from('profiles')
          .insert([{ id: user?.id, username: guestName, role: 'guest' }])
          .select()
          .single()
        if (profileErr) throw profileErr
        guestProfileId = newProfile.id
      } else if (profile.username !== guestName) {
        // Update username if changed
        const { error: updateErr } = await supabase
          .from('profiles')
          .update({ username: guestName })
          .eq('id', user?.id)
        if (updateErr) throw updateErr
      }
      // 2. Add to session_players
      const { error: signupErr } = await supabase
        .from('session_players')
        .insert([{ session_id: sessionId, player_id: guestProfileId }])
      if (signupErr) throw signupErr
      setShowGuestModal(false)
      setGuestName('')
      await loadSession()
    } catch (err: any) {
      setGuestError(err.message || 'Could not sign up as guest')
    } finally {
      setGuestLoading(false)
    }
  }

  useEffect(() => {
    if (sessionId) {
      loadSession()
    }
  }, [sessionId])

  const loadSession = async () => {
    setLoading(true)
    
    try {
      // 1. Load session details
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (sessionError) throw sessionError

      if (sessionData?.deleted_at) {
        setSession(sessionData)
        setLoading(false)
        router.push('/sessions')
        return
      }

      setSession(sessionData)
      setIsGM(user?.id === sessionData.gm_id)

      // 2. Load signups
      const { data: signupsData, error: signupsError } = await supabase
        .from('session_players')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })

      if (signupsError) throw signupsError

      if (!signupsData || signupsData.length === 0) {
        setSignups([])
        return
      }

      // 3. Load profiles for all signed up players
      const playerIds = signupsData.map(s => s.player_id)  // Changed from user_id to player_id
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', playerIds)

      if (profilesError) throw profilesError

      // 4. Combine signups with profiles
      const signupsWithProfiles: Signup[] = signupsData.map(signup => ({
        id: signup.id,
        session_id: signup.session_id,
        player_id: signup.player_id,  // Changed from user_id to player_id
        signed_up_at: signup.created_at,
        profile: profilesData?.find(p => p.id === signup.player_id)  // Changed from user_id to player_id
      }))

      setSignups(signupsWithProfiles)

    } catch (error: any) {
      console.error('Error loading session:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRemovePlayer = async (signupId: string) => {
    if (!confirm('Are you sure you want to remove this player?')) return

    try {
      const { error } = await supabase
        .from('session_players')
        .delete()
        .eq('id', signupId)

      if (error) throw error
      await loadSession()
    } catch (error: any) {
      alert('Error removing player: ' + error.message)
    }
  }

  const handleDeleteSession = async () => {
    if (!confirm('Are you sure you want to delete this session? This cannot be undone.')) return

    try {
      const { error } = await supabase
        .from('sessions')
        .update({ deleted_at: new Date().toISOString(), deleted_by: user?.id || null })
        .eq('id', sessionId)

      if (error) throw error
      router.push('/sessions')
    } catch (error: any) {
      alert('Error deleting session: ' + error.message)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ status: newStatus })
        .eq('id', sessionId)

      if (error) throw error
      await loadSession()
    } catch (error: any) {
      alert('Error updating status: ' + error.message)
    }
  }

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: theme.colors.text.primary }}>Loading...</div>
  }

  if (!session) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: theme.colors.text.primary }}>Session not found</p>
        <a href="/sessions" style={{ color: theme.colors.primary }}>← Back to Sessions</a>
      </div>
    )
  }

  return (
   <main style={styles.container}>
 <div style={styles.section}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href="/sessions" style={{ color: theme.colors.primary, textDecoration: 'none' }}>
            ← Back to Sessions
          </a>
        </div>
      </div>
       {/* Session Details */}
      <div style={styles.section}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1 style={styles.heading1}>{session.title}</h1>
          
          {isGM && (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <select
                value={session.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                style={{ ...styles.select, fontSize: '1rem', padding: '.75rem 0.5rem' }}
              >
                <option value="open">Open</option>
                <option value="full">Full</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button
                onClick={() => router.push(`/sessions/${sessionId}/edit`)}
                style={styles.button.primary}
              >
                Edit
              </button>
              <button
                onClick={handleDeleteSession}
                style={styles.button.danger}
              >
                Delete
              </button>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <div>
            <span style={{ color: theme.colors.text.muted }}>📅 </span>
            <span style={{ color: theme.colors.text.primary }}>
              {new Date(session.date_time).toLocaleDateString()}
            </span>
          </div>
          <div>
            <span style={{ color: theme.colors.text.muted }}>👥 </span>
            <span style={{ color: theme.colors.text.primary }}>
              {signups.length} / {session.max_players} players
            </span>
          </div>
          <div>
            <span style={{ color: theme.colors.text.muted }}>📊 </span>
            <span style={{ 
              color: session.status === 'open' ? theme.colors.success : theme.colors.text.secondary,
              textTransform: 'capitalize'
            }}>
              {session.status}
            </span>
          </div>
        </div>
        
        {session.description && (
          <p style={{ color: theme.colors.text.secondary, marginBottom: '1rem' }}>{session.description}</p>
        )}
      </div>

      {/* Players List & Guest Signup */}
      <div style={styles.section}>
        <h2 style={styles.heading2}>
          Signed Up Players ({signups.length})
        </h2>

        {signups.length === 0 ? (
          <p style={{ color: theme.colors.text.muted, fontStyle: 'italic' }}>No players signed up yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {signups.map(signup => (
              <div
                key={signup.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.5rem',
                  background: theme.colors.background.tertiary,
                  borderRadius: theme.borderRadius
                }}
              >
                <span style={{ color: theme.colors.text.primary }}>
                  {signup.profile?.username || 'Unknown User'}
                </span>

                {isGM && (
                  <button
                    onClick={() => handleRemovePlayer(signup.id)}
                    style={{
                      padding: '0.25rem 0.5rem',
                      background: 'transparent',
                      color: theme.colors.danger,
                      border: `1px solid ${theme.colors.danger}`,
                      borderRadius: theme.borderRadius,
                      cursor: 'pointer',
                      fontSize: '0.75rem'
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Guest sign up block */}
        {isGuest && !signups.some(s => s.player_id === user?.id) && session.status === 'open' && (
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <button
              style={{
                ...styles.button.primary,
                fontSize: '1.1rem',
                padding: '0.75rem 2rem',
                margin: '0 auto',
                display: 'block'
              }}
              onClick={() => setShowGuestModal(true)}
            >
              Sign Up for This Session
            </button>
          </div>
        )}
      </div>

      {/* Guest Name Modal */}
      {showGuestModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: theme.colors.background.secondary,
            borderRadius: theme.borderRadius,
            padding: '2rem',
            minWidth: 320,
            boxShadow: '0 4px 32px rgba(0,0,0,0.25)',
            border: `1px solid ${theme.colors.border.primary}`
          }}>
            <h3 style={{ color: theme.colors.text.primary, marginBottom: '1rem' }}>Enter Your Name</h3>
            <input
              type="text"
              value={guestName}
              onChange={e => setGuestName(e.target.value)}
              placeholder="Display name for this session"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: theme.borderRadius,
                border: `1px solid ${theme.colors.border.primary}`,
                fontSize: '1rem',
                marginBottom: '1rem',
                background: theme.colors.background.input,
                color: theme.colors.text.primary
              }}
              maxLength={32}
              autoFocus
              disabled={guestLoading}
            />
            {guestError && (
              <div style={{ color: theme.colors.danger, marginBottom: '1rem', fontSize: '0.95rem' }}>{guestError}</div>
            )}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowGuestModal(false)}
                style={{ ...styles.button.secondary, minWidth: 90 }}
                disabled={guestLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleGuestSignup}
                style={{ ...styles.button.primary, minWidth: 120 }}
                disabled={guestLoading}
              >
                {guestLoading ? 'Signing Up...' : 'Sign Up'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}