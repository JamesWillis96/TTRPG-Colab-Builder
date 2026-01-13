'use client'

import React from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useWiki } from '../../contexts/WikiContext'

/**
 * WikiHeader - Top navigation bar
 * Shows title, entry count, create button, mobile sidebar toggle
 */
export function WikiHeader() {
  const { theme } = useTheme()
  const { entries, isMobile, sidebarOpen, setSidebarOpen, openEditModal } = useWiki()

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `${theme.spacing.md} ${theme.spacing.lg}`,
        backgroundColor: theme.colors.background.secondary,
        borderBottom: `1px solid ${theme.colors.border.primary}`,
        height: '60px',
        boxShadow: theme.shadow,
      }}
    >
      {/* Left: Title and entry count */}
      <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: theme.spacing.sm,
              color: theme.colors.text.primary,
              fontSize: '18px',
            }}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
        )}
        <h1
          style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: 600,
            color: theme.colors.text.primary,
          }}
        >
          Wiki
        </h1>
        <span
          style={{
            color: theme.colors.text.secondary,
            fontSize: '14px',
          }}
        >
          {entries.length} entries
        </span>
      </div>

      {/* Right: Create button */}
      <button
        onClick={() => openEditModal()}
        style={{
          padding: `${theme.spacing.sm} ${theme.spacing.md}`,
          backgroundColor: theme.colors.primary,
        color: '#fff',
          border: 'none',
          borderRadius: theme.borderRadius,
          cursor: 'pointer',
          fontWeight: 500,
          fontSize: '14px',
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
      >
        + New Entry
      </button>
    </header>
  )
}
