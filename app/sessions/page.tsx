'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

type Session = {
  id: string
  title: string
  description:  string
  date_time: string
  max_players: number
  gm_id: string
  status: string
  created_at: string
  signups?:  any[]
}

export default function SessionsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          *,
          signups: session_signups(player_id)
        `)
        .order('date_time', { ascending:  true })

      if (error) throw error
      setSessions(data || [])
    } catch (error:  any) {
      console.error('Error loading sessions:', error. message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (sessionId: string) => {
    if (!user) {
      router.push('/login')
      return
    }

    try {
      const { error } = await supabase
        .from('session_signups')
        .insert({ session_id: sessionId, player_id: user.id })

      if (error) throw error
      
      // Reload sessions to show updated signup
      loadSessions()
    } catch (error: any) {
      alert('Error signing up: ' + error.message)
    }
  }

  const handleCancelSignup = async (sessionId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('session_signups')
        .delete()
        .eq('session_id', sessionId)
        .eq('player_id', user.id)

      if (error) throw error
      
      // Reload sessions to show updated signup
      loadSessions()
    } catch (error: any) {
      alert('Error cancelling signup: ' + error.message)
    }
  }

  const isSignedUp = (session: Session) => {
    if (!user || !session.signups) return false
    return session.signups.some((signup: any) => signup.player_id === user.id)
  }

  const isFull = (session: Session) => {
    return session.signups && session.signups.length >= session.max_players
  }

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading sessions...</div>
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem' }}>Game Sessions</h1>
        {user && (
          <a
            href="/sessions/create"
            style={{
              padding: '0.75rem 1.5rem',
              background: '#4f8',
              color: '#000',
              textDecoration: 'none',
              borderRadius:  '4px',
              fontWeight: 'bold'
            }}
          >
            + Create Session
          </a>
        )}
      </div>

      {sessions.length === 0 ?  (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem', 
          background: '#111', 
          borderRadius: '8px',
          border: '1px solid #333'
        }}>
          <p style={{ fontSize: '1.25rem', color: '#888' }}>No sessions scheduled yet. </p>
          {user && (
            <p style={{ marginTop: '1rem', color: '#666' }}>
              Be the first to create one! 
            </p>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {sessions.map((session) => {
            const signedUp = isSignedUp(session)
            const full = isFull(session)
            const signupCount = session.signups?. length || 0

            return (
              <div
                key={session.id}
                style={{
                  background: '#111',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  padding: '1.5rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                        <a 
                            href={`/sessions/${session.id}`}
                            style={{ color: '#fff', textDecoration: 'none' }}
                        >
                            {session.title}
                        </a>
                    </h2>
                    <p style={{ color: '#888', marginBottom: '1rem' }}>
                      {session.description}
                    </p>
                    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                      <div>
                        <span style={{ color: '#666' }}>📅 </span>
                        <span style={{ color: '#aaa' }}>
                            {new Date(session.date_time).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span style={{ color: '#666' }}>👥 </span>
                        <span style={{ color: full ? '#f84' : '#4f8' }}>
                          {signupCount} / {session.max_players} players
                        </span>
                      </div>
                      <div>
                        <span style={{ color: '#666' }}>📊 </span>
                        <span style={{ 
                          color: session.status === 'open' ?  '#4f8' : '#888',
                          textTransform: 'capitalize'
                        }}>
                          {session.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginLeft: '1rem' }}>
                    {user ?  (
                      signedUp ? (
                        <button
                          onClick={() => handleCancelSignup(session.id)}
                          style={{
                            padding: '0.5rem 1rem',
                            background:  '#ff000020',
                            border: '1px solid #ff0000',
                            borderRadius: '4px',
                            color: '#ff6666',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                          }}
                        >
                          Cancel Signup
                        </button>
                      ) : full ? (
                        <button
                          disabled
                          style={{
                            padding: '0.5rem 1rem',
                            background:  '#333',
                            border: '1px solid #555',
                            borderRadius: '4px',
                            color:  '#666',
                            cursor: 'not-allowed'
                          }}
                        >
                          Session Full
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSignup(session.id)}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#4f8',
                            border: 'none',
                            borderRadius: '4px',
                            color: '#000',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                          }}
                        >
                          Sign Up
                        </button>
                      )
                    ) : (
                      <a
                        href="/login"
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#333',
                          border: '1px solid #555',
                          borderRadius: '4px',
                          color: '#aaa',
                          textDecoration: 'none',
                          display: 'inline-block'
                        }}
                      >
                        Login to Sign Up
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}