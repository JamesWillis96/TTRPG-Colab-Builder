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
  const { user } = useAuth()
  const { theme, styles } = useTheme()
  const params = useParams()
  const router = useRouter()

  // Ensure params is not null
  const sessionId = params?.id as string

  const [session, setSession] = useState<Session | null>(null)
  const [signups, setSignups] = useState<Signup[]>([])
  const [loading, setLoading] = useState(true)
  const [isGM, setIsGM] = useState(false)

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

      {/* Players List */}
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
      </div>
    </main>
  )
}