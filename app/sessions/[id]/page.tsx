'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { supabase } from '../../../lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import { styles, theme } from '../../../lib/theme'

type Session = {
  id: string
  title: string
  description: string
  date_time: string
  max_players: number
  gm_id: string
  status: string
  created_at: string
}

type Profile = {
  id: string
  username: string
  role: string
}

type Signup = {
  id:  string
  session_id: string
  player_id: string
  signed_up_at: string
  profile?:  Profile
}

export default function SessionDetailPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string

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
      const { data: sessionData, error:  sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (sessionError) throw sessionError
      
      setSession(sessionData)
      setIsGM(user?.id === sessionData.gm_id)

      // 2. Load signups
      const { data: signupsData, error: signupsError } = await supabase
        .from('session_signups')
        .select('*')
        .eq('session_id', sessionId)
        .order('signed_up_at', { ascending: true })

      if (signupsError) throw signupsError

      if (! signupsData || signupsData.length === 0) {
        setSignups([])
        return
      }

      // 3. Load profiles for all signed up players
      const playerIds = signupsData.map(s => s.player_id)
      const { data: profilesData, error:  profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', playerIds)

      if (profilesError) throw profilesError

      // 4. Combine signups with profiles
      const signupsWithProfiles:  Signup[] = signupsData.map(signup => ({
        id: signup.id,
        session_id: signup.session_id,
        player_id: signup.player_id,
        signed_up_at: signup.signed_up_at,
        profile: profilesData?.find(p => p.id === signup.player_id)
      }))

      setSignups(signupsWithProfiles)

    } catch (error:  any) {
      console.error('Error loading session:', error. message)
    } finally {
      setLoading(false)
    }
  }

  const handleRemovePlayer = async (signupId: string) => {
    if (! confirm('Are you sure you want to remove this player?')) return

    try {
      const { error } = await supabase
        .from('session_signups')
        .delete()
        .eq('id', signupId)

      if (error) throw error
      await loadSession()
    } catch (error: any) {
      alert('Error removing player: ' + error.message)
    }
  }

  const handleDeleteSession = async () => {
    if (!confirm('Are you sure you want to delete this session?  This cannot be undone.')) return

    try {
      const { error } = await supabase
        . from('sessions')
        .delete()
        .eq('id', sessionId)

      if (error) throw error
      router.push('/sessions')
    } catch (error: any) {
      alert('Error deleting session:  ' + error.message)
    }
  }

  const handleStatusChange = async (newStatus:  string) => {
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
    return <div style={{ padding: '2rem', textAlign: 'center', color: theme.colors.text.primary }}>Loading... </div>
  }

  if (!session) {
    return (
      <div style={{ padding:  '2rem', textAlign: 'center' }}>
        <p style={{ color: theme.colors.text.primary }}>Session not found</p>
        <a href="/sessions" style={{ color: theme.colors.primary }}>← Back to Sessions</a>
      </div>
    )
  }

  return (
    <main style={styles.container}>
      <div style={styles.section}>
        <a href="/sessions" style={{ color: theme.colors.primary, textDecoration: 'none' }}>
          ← Back to Sessions
        </a>
      </div>

      <div style={styles.card}>
        {/* Header */}
        <div style={styles.section}>
          <div style={{...styles.flexBetween, marginBottom: '1rem'}}>
            <h1 style={styles.heading1}>{session.title}</h1>
            {isGM && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
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

          {session.description && (
            <p style={{ color: theme.colors.text.secondary, marginBottom: '1.5rem' }}>{session.description}</p>
          )}

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

          {isGM && (
            <div style={{ marginTop:  '1rem' }}>
              <label style={styles.label}>
                Change Status: 
              </label>
              <select
                value={session.status}
                onChange={(e) => handleStatusChange(e.target. value)}
                style={styles.select}
              >
                <option value="open">Open</option>
                <option value="full">Full</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: theme.colors.border.primary, margin: '2rem 0' }}></div>

        {/* Players List */}
        <div style={styles.section}>
          <h2 style={styles.heading2}>
            Signed Up Players ({signups.length})
          </h2>

          {signups.length === 0 ? (
            <p style={{ color: theme.colors.text.muted, fontStyle: 'italic' }}>No players signed up yet. </p>
          ) : (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {signups.map((signup, index) => (
                <div
                  key={signup.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding:  '1rem',
                    background: theme.colors.background.tertiary,
                    border: `1px solid ${theme.colors.border.secondary}`,
                    borderRadius: theme.borderRadius
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ 
                      color: theme.colors.text.muted, 
                      fontSize: '1. 25rem',
                      fontWeight: 'bold',
                      minWidth: '2rem'
                    }}>
                      {index + 1}. 
                    </span>
                    <div>
                      <div style={{ fontWeight: 'bold', color: theme.colors.text.primary }}>
                        {signup.profile?.username || 'Unknown User'}
                      </div>
                      <div style={{ fontSize:  '0.875rem', color: theme.colors.text.secondary }}>
                        Signed up:  {new Date(signup.signed_up_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {isGM && (
                    <button
                      onClick={() => handleRemovePlayer(signup.id)}
                      style={{
                        padding: '0.25rem 0.75rem',
                        background: 'transparent',
                        color: theme.colors.danger,
                        border: `1px solid ${theme.colors.danger}`,
                        borderRadius: theme.borderRadius,
                        cursor:  'pointer',
                        fontSize: '0.875rem'
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
      </div>
    </main>
  )
}