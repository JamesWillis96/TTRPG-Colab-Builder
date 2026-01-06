'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { supabase } from '../../lib/supabase'
import confetti from 'canvas-confetti'

// Constants
const SESSION_TABLE_NAMES = ['session_players', 'session_signups']
const GRID_COLUMNS = 'repeat(2, 1fr)'
const CARD_MIN_HEIGHT = '300px'
const isMobile = window.innerWidth <= 500

// Types
type Player = { session_id: string; player_id: string }
type SessionRow = {
  id: string
  title: string
  description?: string
  date_time: string
  max_players?: number
  game_system?: string
  gm_id?: string | null
  status?: string
}

export default function SessionsPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const { theme, styles } = useTheme()
  const [sessions, setSessions] = useState<SessionRow[]>([])
  const [playersBySession, setPlayersBySession] = useState<Record<string, Player[]>>({})
  const [profilesMap, setProfilesMap] = useState<Record<string, { username?: string }>>({})
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [joining, setJoining] = useState<Record<string, boolean>>({})
  // confetti controls
  const [particleCount, setParticleCount] = useState(30)
  const [spread, setSpread] = useState(360)
  const [angle, setAngle] = useState(90)
  const [startVelocity, setStartVelocity] = useState(100)
  const [decay, setDecay] = useState(.8)



  // Styles defined inside component
  const cardStyle = {
    ...styles.sessionCard,
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: CARD_MIN_HEIGHT
  }

  const buttonContainerStyle = {
    display: 'flex',
    gap: '0.25rem',
    marginTop: 'auto',
    paddingTop: '0.5rem',
    justifyContent: 'space-between'
  }

const descriptionStyle = {
  color: theme.colors.text.tertiary,
  marginBottom: '1.5rem',
  display: '-webkit-box',
  WebkitLineClamp: isMobile ? 3 : 4, // Adjust the number of lines to clamp
  WebkitBoxOrient: 'vertical' as const,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
    if (user && !loaded) {
      load()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, loaded])

  const load = async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      // Load sessions
      const sessionsRes = await supabase.from('sessions').select('*').order('date_time', { ascending: true })
      if (sessionsRes.error) throw sessionsRes.error
      const sessionsList = sessionsRes.data || []
      setSessions(sessionsList)

      // Load GM profiles
      const gmIds = Array.from(new Set(sessionsList.map(s => s.gm_id).filter(Boolean)))
      if (gmIds.length > 0) {
        const profRes = await supabase.from('profiles').select('id,username').in('id', gmIds)
        if (profRes.error) throw profRes.error
        setProfilesMap(Object.fromEntries(profRes.data.map((r: any) => [r.id, { username: r.username }])))
      }

      // Load players
      if (sessionsList.length > 0) {
        const result = await tryTableOperation(async (tableName) =>
          supabase.from(tableName).select('session_id,player_id').in('session_id', sessionsList.map(s => s.id))
        )
        if (result?.data) {
          const playersBySession = result.data.reduce((acc: Record<string, Player[]>, cur: Player) => {
            acc[cur.session_id] ??= []
            acc[cur.session_id].push(cur)
            return acc
          }, {})
          setPlayersBySession(playersBySession)
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || String(err))
      setSessions([])
      setPlayersBySession({})
      setProfilesMap({})
    } finally {
      setLoading(false)
      setLoaded(true)
    }
  }

  const joinSession = async (sessionId: string, x: number, y: number) => {
    if (!user) return
    setJoining(s => ({ ...s, [sessionId]: true }))
    try {
      const result = await tryTableOperation(async (tableName) =>
        supabase.from(tableName).insert({ session_id: sessionId, player_id: user.id })
      )
      if (!result) {
        alert('Joining is not enabled on this instance (no signup table).')
        return
      }
      if (result.error) {
        const msg = result.error.message || ''
        if (result.error.code === '23505' || msg.toLowerCase().includes('duplicate')) {
          alert('You are already signed up for this session.')
          return
        }
        throw result.error
      }
      // Optimistic update: add user to players
      setPlayersBySession(prev => ({
        ...prev,
        [sessionId]: [...(prev[sessionId] || []), { session_id: sessionId, player_id: user.id }]
      }))
      // Trigger confetti after button changes to "Leave" (with a small delay to ensure render)
      setTimeout(() => {
        confetti({
          particleCount,
          spread,
          angle,
          startVelocity,
          decay,
          origin: { x, y }
        })
      }, 100)
    } catch (e: any) {
      console.error(e)
      alert('Failed to join: ' + (e.message || e))
    } finally {
      setJoining(s => ({ ...s, [sessionId]: false }))
    }
  }

  const leaveSession = async (sessionId: string) => {
    if (!user) return
    setJoining(s => ({ ...s, [sessionId]: true }))
    try {
      const result = await tryTableOperation(async (tableName) =>
        supabase.from(tableName).delete().eq('session_id', sessionId).eq('player_id', user.id)
      )
      if (!result) {
        alert('Leaving is not enabled on this instance (no signup table).')
        return
      }
      // Optimistic update: remove user from players
      setPlayersBySession(prev => ({
        ...prev,
        [sessionId]: (prev[sessionId] || []).filter(p => p.player_id !== user.id)
      }))
    } catch (e: any) {
      console.error(e)
      alert('Failed to leave: ' + (e.message || e))
    } finally {
      setJoining(s => ({ ...s, [sessionId]: false }))
    }
  }

  // Helper functions
  const tryTableOperation = async (operation: (tableName: string) => Promise<any>) => {
    for (const tableName of SESSION_TABLE_NAMES) {
      try {
        const result = await operation(tableName)
        if (!result.error) return result
        const msg = result.error.message || ''
        const isMissingTable = result.error.code === 'PGRST205' ||
                              msg.includes('Could not find the table') ||
                              msg.includes('relation')
        if (!isMissingTable) throw result.error
      } catch (error: any) {
        const msg = error.message || ''
        const isMissingTable = error.code === 'PGRST205' ||
                              msg.includes('Could not find the table') ||
                              msg.includes('relation')
        if (!isMissingTable) throw error
      }
    }
    return null
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })

  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

  if (loading || authLoading) return <div style={{ padding: 24 }}>Loading...</div>
  if (!user) return null

  return (
    <main style={styles.container}>
      <div style={{...styles.flexBetween, marginBottom: '2rem'}}>
        <h1 style={isMobile ? styles.heading2 : styles.heading1}>Game Sessions</h1>
        {(profile?.role === 'gm' || profile?.role === 'admin') && (
          <a
            href="/sessions/create"
            style={isMobile ? styles.button.primary : styles.button.primary}
          >
            + Create Session
          </a>
        )}
      </div>

      {errorMsg && <div style={{ color: 'salmon' }}>Error: {errorMsg}</div>}

      {sessions.length === 0 ? (
        <div style={styles.card}>
          <p style={{ fontSize: '1.25rem', color: theme.colors.text.tertiary }}>No sessions scheduled yet</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : GRID_COLUMNS, // Use one column for mobile
          gap: '2rem',
          rowGap: '0.8rem',
        }}>
          {sessions.map(session => {
            const players = playersBySession[session.id] || []
            const joined = players.some(p => p.player_id === user.id)
            const gmName = session.gm_id ? (profilesMap[session.gm_id]?.username || 'Unknown') : 'Unassigned'
            return (
              <div key={session.id} style={{ ...cardStyle, border: joined ? `2px solid ${theme.colors.primary}` : theme.colors.border.primary }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div>
                    <div style={styles.section}>
                      <h2 style={styles.heading2}>{session.title}</h2>
                    </div>

                    {session.description && (
                      <p style={descriptionStyle}>{session.description}</p>
                    )}
                  </div>

                  <div style={{ marginTop: 'auto', marginBottom: '1rem' }}>
                    <div style={styles.sessionDetails}>
                      <div style={{...styles.gameSystemItem, padding: '0rem', marginTop: '0rem'}}> 
                        {session.game_system}
                      </div>
                      
                      <div style={{...styles.detailItem, marginTop: '0rem'}}>
                        {formatDate(session.date_time)}
                      </div>
                      <div style={{...styles.detailItem, marginTop: '0rem'}}>
                        {formatTime(session.date_time)}
                      </div>
                      <div style={{...styles.detailItem, marginTop: '0rem'}}>
                        GM: {gmName}
                      </div> 
                      <div style={{...styles.detailItem, marginTop: '0rem'}}>
                        {players.length} / {session.max_players} players
                      </div>
                    </div>
                  </div>
                </div>

                <div style={buttonContainerStyle}>
                  <button
                    onClick={() => router.push(`/sessions/${session.id}`)}
                    style={styles.button.secondary}
                  >
                    View Details
                  </button>
                  {!joined ? (
                    <button
                      onClick={(e) => {
                        const rect = (e.target as HTMLElement).getBoundingClientRect()
                        const x = (rect.left + rect.width / 2) / window.innerWidth
                        const y = (rect.top + rect.height / 2) / window.innerHeight
                        joinSession(session.id, x, y)
                      }}
                      disabled={!!joining[session.id]}
                      style={styles.button.primary}
                    >
                      {joining[session.id] ? 'Joining…' : 'Join'}
                    </button>
                  ) : (
                    <button
                      onClick={() => leaveSession(session.id)}
                      disabled={!!joining[session.id]}
                      style={styles.button.danger}
                    >
                      {joining[session.id] ? 'Leaving…' : 'Leave'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}