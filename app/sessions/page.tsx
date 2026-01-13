'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { supabase } from '../../lib/supabase'

type SessionRow = {
  id: string
  title: string
  description?: string
  date_time: string
  max_players?: number | null
  game_system?: string
  gm_id: string
}

type Player = { session_id: string; player_id: string }

export default function SessionsPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const { theme, styles } = useTheme()

  const [sessions, setSessions] = useState<SessionRow[]>([])
  const [playersBySession, setPlayersBySession] = useState<Record<string, Player[]>>({})
  const [gmNames, setGmNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAllSessions, setShowAllSessions] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingSession, setEditingSession] = useState<SessionRow | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [detailsSession, setDetailsSession] = useState<SessionRow | null>(null)

  useEffect(() => {
    setIsAdmin(profile?.role === 'admin')
  }, [profile])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: sessionList, error: sessionsErr } = await supabase
        .from('sessions')
        .select('*')
        .order('date_time', { ascending: true })
      if (sessionsErr) throw sessionsErr
      
      // Filter out past sessions (only show upcoming sessions)
      const now = new Date()
      const sArray: SessionRow[] = (sessionList || []).filter(s => new Date(s.date_time) > now)
      setSessions(sArray)

      const ids = sArray.map(s => s.id)
      const gmIds = [...new Set(sArray.map(s => s.gm_id))]
      
      // Fetch GM usernames
      if (gmIds.length > 0) {
        const { data: gmProfiles, error: gmErr } = await supabase
          .from('profiles')
          .select('id,username')
          .in('id', gmIds)
        if (gmErr) throw gmErr
        const gmMap: Record<string, string> = {}
        ;(gmProfiles || []).forEach(p => { gmMap[p.id] = p.username })
        setGmNames(gmMap)
      }

      if (!ids.length) {
        setPlayersBySession({})
        return
      }

      const { data: playersRes, error: playersErr } = await supabase
        .from('session_players')
        .select('session_id,player_id')
        .in('session_id', ids)

      // DEBUG: log what the client got back from Supabase
      // console.debug('loadData -> session ids:', ids)
      // console.debug('loadData -> playersRes:', playersRes, 'playersErr:', playersErr)

      if (playersErr) throw playersErr

      const grouped: Record<string, Player[]> = {}
      ;(playersRes || []).forEach((p: any) => {
        const sid = String(p.session_id)
        const arr = (grouped[sid] ||= [])
        if (!arr.some(a => a.player_id === p.player_id)) arr.push({ session_id: sid, player_id: p.player_id })
      })
      ids.forEach(id => { grouped[id] ||= [] })
      setPlayersBySession(grouped)
    } catch (err: any) {
      console.error('loadData error', err)
      setError(err?.message || 'Failed to load')
      setSessions([])
      setPlayersBySession({})
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) loadData()
  }, [user, loadData])

  useEffect(() => {
    if (!user) return

    // Subscribe to session_players changes (joins/leaves)
    const playersSubscription = supabase
      .channel('session_players_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'session_players' },
        () => {
          loadData()
        }
      )
      .subscribe()

    // Subscribe to sessions changes (creation, updates)
    const sessionsSubscription = supabase
      .channel('sessions_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sessions' },
        () => {
          loadData()
        }
      )
      .subscribe()

    return () => {
      playersSubscription.unsubscribe()
      sessionsSubscription.unsubscribe()
    }
  }, [user, loadData])

  const createSampleSession = async () => {
    if (!user) return
    setCreating(true)
    try {
      const sample = {
        title: 'Lorem Ipsum Session',
        description: 'Short sample session description.',
        date_time: new Date().toISOString(),
        max_players: 8,
        game_system: 'West Marches'
      }
      const { data, error } = await supabase.from('sessions').insert([sample]).select()
      // DEBUG: show inserted row
      // console.debug('createSampleSession -> result:', { data, error })
      if (error) throw error
      await loadData()
    } catch (err: any) {
      console.error('createSampleSession error', err)
      alert('Failed to create session: ' + (err?.message || String(err)))
    } finally {
      setCreating(false)
    }
  }

  const joinSession = async (sessionId: string) => {
    if (!user) return
    setJoining(prev => ({ ...prev, [sessionId]: true }))
    try {
      const { data, error } = await supabase
        .from('session_players')
        .insert({ session_id: sessionId, player_id: user.id })
        .select()
      // DEBUG: show insert result
      // console.debug('joinSession -> result:', { sessionId, data, error })
      if (error) {
        if (error.code === '23505' || (error.message || '').toLowerCase().includes('duplicate')) {
          alert('You are already signed up for this session.')
        } else if (error.code === '42501') {
          setError('Permission denied. You may not have access to join sessions.')
        } else {
          throw error
        }
      }
      await loadData()
    } catch (err: any) {
      console.error('joinSession error', err)
      alert('Failed to join: ' + (err?.message || String(err)))
    } finally {
      setJoining(prev => ({ ...prev, [sessionId]: false }))
    }
  }

  const leaveSession = async (sessionId: string) => {
    if (!user) return
    setJoining(prev => ({ ...prev, [sessionId]: true }))
    try {
      const { error } = await supabase
        .from('session_players')
        .delete()
        .eq('session_id', sessionId)
        .eq('player_id', user.id)
      if (error) {
        if (error.code === '42501') {
          setError('Permission denied. You may not have access to leave sessions.')
        } else {
          throw error
        }
      }
      await loadData()
    } catch (err: any) {
      console.error('leaveSession error', err)
      alert('Failed to leave session: ' + (err?.message || String(err)))
    } finally {
      setJoining(prev => ({ ...prev, [sessionId]: false }))
    }
  }

  const createSession = async (form: {
    title: string
    description?: string
    date: string // YYYY-MM-DD
    time: string // HH:MM
    max_players?: number | null
    game_system?: string
  }) => {
    if (!user) return
    setCreating(true)
    try {
      // Combine date + time into an ISO string (UTC); DB field is timestamp with timezone
      const iso = new Date(`${form.date}T${form.time}`).toISOString()
      const row = {
        title: form.title,
        description: form.description,
        date_time: iso,
        gm_id: user.id,
        max_players: form.max_players ?? null,
        game_system: form.game_system
      }
      const { error } = await supabase.from('sessions').insert([row])
      if (error) {
        if (error.code === '42501') {
          setError('Permission denied. You may not have access to create sessions.')
        } else {
          throw error
        }
      } else {
        await loadData()
        setShowCreateModal(false)
      }
    } catch (err: any) {
      console.error('createSession error', err)
      alert('Failed to create session: ' + (err?.message || String(err)))
    } finally {
      setCreating(false)
    }
  }

  const canEditOrDelete = (session: SessionRow) => {
    return user?.id === session.gm_id || isAdmin
  }

  const editSession = async (form: {
    title: string
    description?: string
    date: string
    time: string
    max_players?: number | null
    game_system?: string
  }) => {
    if (!editingSession) return
    setCreating(true)
    try {
      const iso = new Date(`${form.date}T${form.time}`).toISOString()
      const { error } = await supabase
        .from('sessions')
        .update({
          title: form.title,
          description: form.description,
          date_time: iso,
          max_players: form.max_players ?? null,
          game_system: form.game_system
        })
        .eq('id', editingSession.id)
      if (error) {
        if (error.code === '42501') {
          setError(`Permission denied: ${error.message}. If you're an admin, the database RLS policy may need to be updated to allow admin edits.`)
        } else {
          throw error
        }
      } else {
        await loadData()
        setShowEditModal(false)
        setEditingSession(null)
      }
    } catch (err: any) {
      console.error('editSession error', err)
      alert('Failed to edit session: ' + (err?.message || String(err)))
    } finally {
      setCreating(false)
    }
  }

  const deleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this session?')) return
    try {
      const { error } = await supabase.from('sessions').delete().eq('id', sessionId)
      if (error) {
        if (error.code === '42501') {
          setError(`Permission denied: ${error.message}. If you're an admin, the database RLS policy may need to be updated to allow admin deletes.`)
        } else {
          throw error
        }
      } else {
        await loadData()
      }
    } catch (err: any) {
      console.error('deleteSession error', err)
      alert('Failed to delete session: ' + (err?.message || String(err)))
    }
  }

  const getPlayerCount = (id: string) => (playersBySession[id]?.length) ?? 0
  const hasJoined = (id: string) => (playersBySession[id] || []).some(p => p.player_id === user?.id)
  const isFull = (id: string, maxPlayers: number | null | undefined) => {
    if (!maxPlayers) return false
    return getPlayerCount(id) >= maxPlayers
  }

  const getSessionsForDate = (dateStr: string) => {
    return sessions.filter(s => {
      const sessionDate = new Date(s.date_time)
      const pad = (n: number) => String(n).padStart(2, '0')
      const sessionDateStr = `${sessionDate.getUTCFullYear()}-${pad(sessionDate.getUTCMonth() + 1)}-${pad(sessionDate.getUTCDate())}`
      return sessionDateStr === dateStr
    })
  }

  const sessionsInCurrentMonth = sessions.filter(s => {
    const sessionDate = new Date(s.date_time)
    return sessionDate.getUTCFullYear() === currentMonth.getUTCFullYear() &&
           sessionDate.getUTCMonth() === currentMonth.getUTCMonth()
  })

  const displayedSessions = selectedDate ? getSessionsForDate(selectedDate) : (showAllSessions ? sessions : sessions.slice(0, 6))
  if (loading || authLoading) return <div style={{ padding: 24 }}>Loading...</div>
  if (!user) return null

  return (
    <main style={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={styles.heading1}>Sessions</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <button 
              onClick={() => { setViewMode('list'); setSelectedDate(null) }} 
              style={{ ...styles.button.secondary, opacity: viewMode === 'list' ? 1 : 0.6 }}
            >
              List
            </button>
            <button 
              onClick={() => setViewMode('calendar')} 
              style={{ ...styles.button.secondary, opacity: viewMode === 'calendar' ? 1 : 0.6 }}
            >
              Calendar
            </button>
          </div>
          <button onClick={() => setShowCreateModal(true)} style={styles.button.primary}>Create Session</button>
          <button onClick={loadData} style={styles.button.secondary}>Refresh</button>
        </div>
      </div>

      {error && <div style={{ color: 'salmon', marginBottom: 12 }}>Error: {error}</div>}

      {viewMode === 'calendar' ? (
        <CalendarView
          sessions={sessions}
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          getSessionsForDate={getSessionsForDate}
          theme={theme}
          styles={styles}
        />
      ) : (
        <>
          <div style={{ display: 'grid', gap: 12 }}>
            {displayedSessions.map(s => {
              const showAllButtons = canEditOrDelete(s)
          const dateTime = new Date(s.date_time)
          const dateStr = dateTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          const timeStr = dateTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
          
          return (
            <div key={s.id} style={{ ...styles.card, padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <h3 style={styles.heading2}>{s.title}</h3>
                  <div style={{ color: theme.colors.text.tertiary, marginTop: 6 }}>{s.description}</div>
                  <div style={{ color: theme.colors.text.tertiary, marginTop: 8, fontSize: '0.9em' }}>
                    <div>{dateStr} at {timeStr}</div>
                    <div style={{ marginTop: 4 }}>
                      {getPlayerCount(s.id)} / {s.max_players ?? '—'} players
                    </div>
                    <div style={{ marginTop: 4 }}>
                      GM: {gmNames[s.gm_id] || 'Loading...'}
                    </div>
                  </div>
                  {isFull(s.id, s.max_players) && (
                    <div style={{ color: '#ff6b6b', marginTop: 8, fontSize: '0.9em' }}>Session Full</div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: showAllButtons ? 6 : 8 }}>
                  <button
                    onClick={() => { setDetailsSession(s); setShowDetailsModal(true) }}
                    style={{ ...styles.button.secondary, padding: showAllButtons ? '6px 10px' : undefined, fontSize: showAllButtons ? '0.85em' : undefined }}
                  >
                    Details
                  </button>
                  <button
                    onClick={() => hasJoined(s.id) ? leaveSession(s.id) : joinSession(s.id)}
                    disabled={joining[s.id] || (!hasJoined(s.id) && isFull(s.id, s.max_players))}
                    style={{ ...styles.button.primary, padding: showAllButtons ? '6px 10px' : undefined, fontSize: showAllButtons ? '0.85em' : undefined }}
                  >
                    {joining[s.id] ? 'Processing…' : hasJoined(s.id) ? 'Leave' : 'Join'}
                  </button>
                  {canEditOrDelete(s) && (
                    <>
                      <button
                        onClick={() => { setEditingSession(s); setShowEditModal(true) }}
                        style={{ ...styles.button.secondary, padding: '6px 10px', fontSize: '0.85em' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteSession(s.id)}
                        style={{ ...styles.button.primary, background: '#ff6b6b', padding: '6px 10px', fontSize: '0.85em' }}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
            })}
            {displayedSessions.length === 0 && <div style={styles.card}>
              {selectedDate ? `No sessions on this date.` : 'No sessions available. Click "Refresh" to reload.'}
            </div>}
          </div>

          {!selectedDate && sessions.length > 6 && !showAllSessions && (
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <button onClick={() => setShowAllSessions(true)} style={styles.button.secondary}>
                Show More ({sessions.length - 6} more)
              </button>
            </div>
          )}

          {showAllSessions && sessions.length > 6 && (
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <button onClick={() => setShowAllSessions(false)} style={styles.button.secondary}>
                Show Less
              </button>
            </div>
          )}
        </>
      )}

      {/* Create Session Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60
        }}>
          <div style={{ background: theme.colors.background.main, padding: 20, borderRadius: 8, width: 520 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={styles.heading2}>Create Session</h2>
              <button onClick={() => setShowCreateModal(false)} style={styles.button.primary}>Close</button>
            </div>

            <CreateSessionForm onCancel={() => setShowCreateModal(false)} onSubmit={createSession} loading={creating} theme={theme} />
          </div>
        </div>
      )}

      {/* Edit Session Modal */}
      {showEditModal && editingSession && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60
        }}>
          <div style={{ background: theme.colors.background.main, padding: 20, borderRadius: 8, width: 520 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={styles.heading2}>Edit Session</h2>
              <button onClick={() => { setShowEditModal(false); setEditingSession(null) }} style={styles.button.primary}>Close</button>
            </div>

            <EditSessionForm 
              session={editingSession}
              onCancel={() => { setShowEditModal(false); setEditingSession(null) }}
              onSubmit={editSession}
              loading={creating}
            />
          </div>
        </div>
      )}

      {/* Session Details Modal */}
      {showDetailsModal && detailsSession && (
        <SessionDetailsModal
          session={detailsSession}
          players={playersBySession[detailsSession.id] || []}
          gmName={gmNames[detailsSession.gm_id] || 'Loading...'}
          isAdmin={isAdmin}
          isGM={user?.id === detailsSession.gm_id}
          onClose={() => { setShowDetailsModal(false); setDetailsSession(null) }}
          theme={theme}
          styles={styles}
        />
      )}

    </main>
  )
}

type SessionTemplate = {
  name: string
  title: string
  description: string
  duration: number // hours
  maxPlayers: number
  gameSystem: string
}

const sessionTemplates: SessionTemplate[] = [
  {
    name: 'Custom',
    title: '',
    description: '',
    duration: 2,
    maxPlayers: 4,
    gameSystem: 'West Marches'
  },
  {
    name: '2hr Intro',
    title: 'Introduction Session',
    description: 'A 2-hour introductory session for new players.',
    duration: 2,
    maxPlayers: 4,
    gameSystem: 'West Marches'
  },
  {
    name: 'One-Shot',
    title: 'One-Shot Adventure',
    description: 'A self-contained 3-4 hour adventure.',
    duration: 3.5,
    maxPlayers: 5,  
    gameSystem: 'West Marches'
  },
  {
    name: 'Campaign Session',
    title: 'Campaign Session',
    description: 'Regular campaign session continuing the ongoing story.',
    duration: 3,
    maxPlayers: 4,
    gameSystem: 'West Marches'
  },
  {
    name: 'Boss Fight',
    title: 'Epic Boss Encounter',
    description: 'Extended session focused on a major boss fight or climactic encounter.',
    duration: 3.5,
    maxPlayers: 6,
    gameSystem: 'West Marches'
  }
]

/* Inline CreateSessionForm uses native date + time inputs (calendar/time pickers on modern browsers).
   It pre-fills with template defaults and validates required fields before calling onSubmit.
*/
function CreateSessionForm({ onCancel, onSubmit, loading, theme }: {
  onCancel: () => void
  onSubmit: (f: { title: string; description?: string; date: string; time: string; max_players?: number | null; game_system?: string }) => Promise<void>
  loading?: boolean
  theme?: any
}) {
  const today = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const isoDate = `${today.getUTCFullYear()}-${pad(today.getUTCMonth() + 1)}-${pad(today.getUTCDate())}`
  const isoTime = '18:00' // 6pm default

  const [selectedTemplate, setSelectedTemplate] = useState<string>('Custom')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(isoDate)
  const [time, setTime] = useState(isoTime)
  const [maxPlayers, setMaxPlayers] = useState<number | ''>(4)
  const [gameSystem, setGameSystem] = useState('West Marches')

  const applyTemplate = (templateName: string) => {
    const template = sessionTemplates.find(t => t.name === templateName)
    if (template) {
      setSelectedTemplate(templateName)
      setTitle(template.title)
      setDescription(template.description)
      setMaxPlayers(template.maxPlayers)
      setGameSystem(template.gameSystem)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date || !time || !title) {
      alert('Please provide a title, date and time.')
      return
    }
    await onSubmit({
      title,
      description,
      date,
      time,
      max_players: maxPlayers === '' ? null : Number(maxPlayers),
      game_system: gameSystem
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gap: 10 }}>
        <label style={{ display: 'flex', flexDirection: 'column', color: theme?.colors?.text?.primary }}>
          Template
          <select
            value={selectedTemplate}
            onChange={e => applyTemplate(e.target.value)}
            style={{ padding: 8, color: '#000' }}
          >
            {sessionTemplates.map(t => (
              <option key={t.name} value={t.name}>{t.name}</option>
            ))}
          </select>
        </label>
        <input
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{ padding: 8 }}
          required
        />
        <input
          placeholder="Game system"
          value={gameSystem}
          onChange={e => setGameSystem(e.target.value)}
          style={{ padding: 8 }}
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          style={{ padding: 8, minHeight: 80 }}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <label style={{ display: 'flex', flexDirection: 'column', color: theme?.colors?.text?.primary }}>
            Date
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ padding: 8, color: '#000' }} required />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', color: theme?.colors?.text?.primary }}>
            Time
            <input type="time" value={time} onChange={e => setTime(e.target.value)} style={{ padding: 8, color: '#000' }} required />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', color: theme?.colors?.text?.primary }}>
            Max
            <input
              type="number"
              value={maxPlayers as any}
              onChange={e => setMaxPlayers(e.target.value ? Number(e.target.value) : '')}
              style={{ padding: 8, width: 90, color: '#000' }}
              min={1}
            />
          </label>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onCancel} style={{ padding: '8px 12px' }} disabled={loading}>Cancel</button>
          <button type="submit" style={{ padding: '8px 12px' }} disabled={loading}>
            {loading ? 'Creating…' : 'Create Session'}
          </button>
        </div>
      </div>
    </form>
  )
}

function EditSessionForm({ session, onCancel, onSubmit, loading }: {
  session: SessionRow
  onCancel: () => void
  onSubmit: (f: { title: string; description?: string; date: string; time: string; max_players?: number | null; game_system?: string }) => Promise<void>
  loading?: boolean
}) {
  const dateTime = new Date(session.date_time)
  const pad = (n: number) => String(n).padStart(2, '0')
  const isoDate = `${dateTime.getUTCFullYear()}-${pad(dateTime.getUTCMonth() + 1)}-${pad(dateTime.getUTCDate())}`
  const isoTime = `${pad(dateTime.getUTCHours())}:${pad(dateTime.getUTCMinutes())}`

  const [title, setTitle] = useState(session.title)
  const [description, setDescription] = useState(session.description || '')
  const [date, setDate] = useState(isoDate)
  const [time, setTime] = useState(isoTime)
  const [maxPlayers, setMaxPlayers] = useState<number | ''>(session.max_players || '')
  const [gameSystem, setGameSystem] = useState(session.game_system || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date || !time || !title) {
      alert('Please provide a title, date and time.')
      return
    }
    await onSubmit({
      title,
      description,
      date,
      time,
      max_players: maxPlayers === '' ? null : Number(maxPlayers),
      game_system: gameSystem
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gap: 10 }}>
        <input
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{ padding: 8 }}
          required
        />
        <input
          placeholder="Game system"
          value={gameSystem}
          onChange={e => setGameSystem(e.target.value)}
          style={{ padding: 8 }}
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          style={{ padding: 8, minHeight: 80 }}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <label style={{ display: 'flex', flexDirection: 'column' }}>
            Date
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ padding: 8, color: '#000' }} required />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column' }}>
            Time
            <input type="time" value={time} onChange={e => setTime(e.target.value)} style={{ padding: 8, color: '#000' }} required />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column' }}>
            Max
            <input
              type="number"
              value={maxPlayers as any}
              onChange={e => setMaxPlayers(e.target.value ? Number(e.target.value) : '')}
              style={{ padding: 8, width: 90, color: '#000' }}
              min={1}
            />
          </label>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onCancel} style={{ padding: '8px 12px' }} disabled={loading}>Cancel</button>
          <button type="submit" style={{ padding: '8px 12px' }} disabled={loading}>
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </form>
  )
}

function CalendarView({
  sessions,
  currentMonth,
  setCurrentMonth,
  selectedDate,
  setSelectedDate,
  getSessionsForDate,
  theme,
  styles
}: {
  sessions: SessionRow[]
  currentMonth: Date
  setCurrentMonth: (d: Date) => void
  selectedDate: string | null
  setSelectedDate: (d: string | null) => void
  getSessionsForDate: (d: string) => SessionRow[]
  theme: any
  styles: any
}) {
  const daysInMonth = new Date(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth() + 1, 0).getUTCDate()
  const firstDay = new Date(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth(), 1).getUTCDay()
  const pad = (n: number) => String(n).padStart(2, '0')
  const monthStr = currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })

  const getDayString = (day: number) => {
    return `${currentMonth.getUTCFullYear()}-${pad(currentMonth.getUTCMonth() + 1)}-${pad(day)}`
  }

  const getCountForDay = (day: number) => {
    return getSessionsForDate(getDayString(day)).length
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth() - 1))
    setSelectedDate(null)
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth() + 1))
    setSelectedDate(null)
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <button onClick={prevMonth} style={styles.button.secondary}>← Prev</button>
        <h2 style={styles.heading2}>{monthStr}</h2>
        <button onClick={nextMonth} style={styles.button.secondary}>Next →</button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 8
      }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} style={{
            padding: 8,
            textAlign: 'center',
            fontWeight: 'bold',
            color: theme.colors.text.secondary
          }}>
            {day}
          </div>
        ))}

        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} style={{ padding: 8 }} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const dayStr = getDayString(day)
          const count = getCountForDay(day)
          const isSelected = selectedDate === dayStr

          return (
            <button
              key={day}
              onClick={() => setSelectedDate(isSelected ? null : dayStr)}
              style={{
                padding: 12,
                borderRadius: 8,
                background: isSelected ? theme.colors.primary : theme.colors.background.secondary,
                color: isSelected ? '#fff' : theme.colors.text.primary,
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.9em',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4
              }}
            >
              <div style={{ fontWeight: 'bold' }}>{day}</div>
              {count > 0 && <div style={{ fontSize: '0.8em', opacity: 0.8 }}>{count} session{count > 1 ? 's' : ''}</div>}
            </button>
          )
        })}
      </div>

      {selectedDate && (
        <div style={{ marginTop: 12 }}>
          <button onClick={() => setSelectedDate(null)} style={styles.button.secondary}>Clear Filter</button>
        </div>
      )}
    </div>
  )
}

function SessionDetailsModal({
  session,
  players,
  gmName,
  isAdmin,
  isGM,
  onClose,
  theme,
  styles
}: {
  session: SessionRow
  players: Player[]
  gmName: string
  isAdmin: boolean
  isGM: boolean
  onClose: () => void
  theme: any
  styles: any
}) {
  const [playerNames, setPlayerNames] = useState<Record<string, string>>({})
  const [copySuccess, setCopySuccess] = useState(false)

  useEffect(() => {
    const fetchPlayerNames = async () => {
      if (players.length === 0) return
      const { data, error } = await supabase
        .from('profiles')
        .select('id,username')
        .in('id', players.map(p => p.player_id))
      if (error) {
        console.error('Error fetching player names:', error)
        return
      }
      const names: Record<string, string> = {}
      ;(data || []).forEach(p => { names[p.id] = p.username })
      setPlayerNames(names)
    }
    fetchPlayerNames()
  }, [players])

  const copyInviteLink = () => {
    const url = `${window.location.origin}/sessions?id=${session.id}`
    navigator.clipboard.writeText(url).then(() => {
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    })
  }

  const dateTime = new Date(session.date_time)
  const dateStr = dateTime.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const timeStr = dateTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 70
    }}>
      <div style={{ background: theme.colors.background.main, padding: 24, borderRadius: 8, width: 520, maxHeight: '80vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={styles.heading2}>{session.title}</h2>
          <button onClick={onClose} style={styles.button.primary}>Close</button>
        </div>

        <div style={{ display: 'grid', gap: 16 }}>
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: 4, color: theme.colors.text.primary }}>Description</div>
            <div style={{ color: theme.colors.text.secondary }}>{session.description || 'No description'}</div>
          </div>

          <div>
            <div style={{ fontWeight: 'bold', marginBottom: 4, color: theme.colors.text.primary }}>When</div>
            <div style={{ color: theme.colors.text.secondary }}>{dateStr} at {timeStr}</div>
          </div>

          <div>
            <div style={{ fontWeight: 'bold', marginBottom: 4, color: theme.colors.text.primary }}>Game Master</div>
            <div style={{ color: theme.colors.text.secondary }}>{gmName}</div>
          </div>

          <div>
            <div style={{ fontWeight: 'bold', marginBottom: 4, color: theme.colors.text.primary }}>Game System</div>
            <div style={{ color: theme.colors.text.secondary }}>{session.game_system || 'Not specified'}</div>
          </div>

          <div>
            <div style={{ fontWeight: 'bold', marginBottom: 4, color: theme.colors.text.primary }}>
              Players ({players.length} / {session.max_players ?? '—'})
            </div>
            {players.length === 0 ? (
              <div style={{ color: theme.colors.text.tertiary, fontStyle: 'italic' }}>No players yet</div>
            ) : (
              <div style={{ display: 'grid', gap: 6 }}>
                {players.map(p => (
                  <div key={p.player_id} style={{ 
                    padding: 8, 
                    background: theme.colors.background.secondary, 
                    borderRadius: 4,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: theme.colors.text.primary
                  }}>
                    <span>{playerNames[p.player_id] || 'Loading...'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <button onClick={copyInviteLink} style={{ ...styles.button.secondary, width: '100%' }}>
              {copySuccess ? '✓ Copied!' : 'Copy Invite Link'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}