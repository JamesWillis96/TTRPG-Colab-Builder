'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
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
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading... </div>
  }

  if (!session) {
    return (
      <div style={{ padding:  '2rem', textAlign: 'center' }}>
        <p>Session not found</p>
        <a href="/sessions" style={{ color: '#4f8' }}>← Back to Sessions</a>
      </div>
    )
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <a href="/sessions" style={{ color:  '#4f8', textDecoration: 'none' }}>
          ← Back to Sessions
        </a>
      </div>

      <div style={{
        background: '#111',
        border: '1px solid #333',
        borderRadius: '8px',
        padding: '2rem'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
            <h1 style={{ fontSize: '2rem' }}>{session.title}</h1>
            {isGM && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => router.push(`/sessions/${sessionId}/edit`)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#4f8',
                    color:  '#000',
                    border: 'none',
                    borderRadius:  '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={handleDeleteSession}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#ff000020',
                    color: '#ff6666',
                    border:  '1px solid #ff0000',
                    borderRadius:  '4px',
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          {session.description && (
            <p style={{ color: '#aaa', marginBottom: '1.5rem' }}>{session.description}</p>
          )}

          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <div>
              <span style={{ color: '#666' }}>📅 </span>
              <span style={{ color: '#fff' }}>
                {new Date(session.date_time).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span style={{ color: '#666' }}>👥 </span>
              <span style={{ color: '#fff' }}>
                {signups.length} / {session.max_players} players
              </span>
            </div>
            <div>
              <span style={{ color: '#666' }}>📊 </span>
              <span style={{ 
                color: session.status === 'open' ? '#4f8' :  '#888',
                textTransform: 'capitalize'
              }}>
                {session.status}
              </span>
            </div>
          </div>

          {isGM && (
            <div style={{ marginTop:  '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#666', fontSize: '0.875rem' }}>
                Change Status: 
              </label>
              <select
                value={session.status}
                onChange={(e) => handleStatusChange(e.target. value)}
                style={{
                  padding: '0.5rem',
                  background: '#222',
                  border: '1px solid #444',
                  borderRadius: '4px',
                  color: '#fff'
                }}
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
        <div style={{ height: '1px', background: '#333', margin: '2rem 0' }}></div>

        {/* Players List */}
        <div>
          <h2 style={{ fontSize:  '1.5rem', marginBottom: '1rem' }}>
            Signed Up Players ({signups.length})
          </h2>

          {signups.length === 0 ? (
            <p style={{ color: '#666', fontStyle: 'italic' }}>No players signed up yet. </p>
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
                    background: '#0a0a0a',
                    border: '1px solid #222',
                    borderRadius: '4px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ 
                      color: '#666', 
                      fontSize: '1. 25rem',
                      fontWeight: 'bold',
                      minWidth: '2rem'
                    }}>
                      {index + 1}. 
                    </span>
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#fff' }}>
                        {signup.profile?.username || 'Unknown User'}
                      </div>
                      <div style={{ fontSize:  '0.875rem', color: '#666' }}>
                        Signed up:  {new Date(signup.signed_up_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {isGM && (
                    <button
                      onClick={() => handleRemovePlayer(signup.id)}
                      style={{
                        padding: '0.25rem 0.75rem',
                        background: '#ff000020',
                        color: '#ff6666',
                        border: '1px solid #ff000060',
                        borderRadius: '4px',
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