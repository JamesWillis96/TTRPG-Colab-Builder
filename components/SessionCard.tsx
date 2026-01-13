'use client'

import React from 'react'
import { useTheme } from '../contexts/ThemeContext'
import PlayerCountBadge from './PlayerCountBadge'

// Re-use SessionRow type shape from page.tsx (keeps this file small & focused)
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

type Props = {
  session: SessionRow
  joined: boolean
  isJoining?: boolean
  playerCount: number
  onView: () => void
  onJoinClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  onLeave: () => void
}

export default function SessionCard({
  session,
  joined,
  isJoining,
  playerCount,
  onView,
  onJoinClick,
  onLeave
}: Props) {
  const { theme, styles } = useTheme()

  return (
    <div
      style={{
        ...styles.sessionCard,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '260px',
        border: joined ? `2px solid ${theme.colors.primary}` : theme.colors.border.primary
      }}
    >
      <div style={{ padding: '1rem' }}>
        <div style={styles.section}>
          <h3 style={styles.heading2}>{session.title}</h3>
        </div>

        {session.description && (
          <p style={{ color: theme.colors.text.tertiary, marginTop: '0.5rem' }}>{session.description}</p>
        )}

        <div style={{ marginTop: '1rem', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ color: theme.colors.text.tertiary }}>{session.game_system}</div>
          <div style={{ color: theme.colors.text.tertiary }}>{new Date(session.date_time).toLocaleString()}</div>
          <PlayerCountBadge count={playerCount} max={session.max_players} />
        </div>
      </div>

      <div style={{ marginTop: 'auto', padding: '0.75rem', display: 'flex', gap: '0.5rem', justifyContent: 'space-between' }}>
        <button onClick={onView} style={styles.button.secondary}>View</button>

        {joined ? (
          <button onClick={onLeave} disabled={isJoining} style={styles.button.danger}>
            {isJoining ? 'Leaving…' : 'Leave'}
          </button>
        ) : (
          <button onClick={onJoinClick} disabled={isJoining} style={styles.button.primary}>
            {isJoining ? 'Joining…' : 'Join'}
          </button>
        )}
      </div>
    </div>
  )
}