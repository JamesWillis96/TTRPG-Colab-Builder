'use client'

import React from 'react'
import { useTheme } from '../contexts/ThemeContext'

type Props = {
  count: number
  max?: number | null
}

export default function PlayerCountBadge({ count, max }: Props) {
  const { theme } = useTheme()

  return (
    <div
      style={{
        display: 'inline-block',
        padding: '6px 10px',
        borderRadius: 999,
        background: theme.colors.background.tertiary,
        color: theme.colors.text.primary,
        fontWeight: 700,
        fontSize: '0.9rem'
      }}
    >
      {count} / {max ?? '—'} players
    </div>
  )
}