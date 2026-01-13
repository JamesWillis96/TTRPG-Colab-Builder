'use client'

import React from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useWiki } from '../../contexts/WikiContext'

/**
 * WikiRevisionsModal - Show revision history for selected entry
 * Displays list of revisions with timestamps
 * Can view/restore previous versions (future enhancement)
 */
export function WikiRevisionsModal() {
  const { theme } = useTheme()
  const { isRevisionsModalOpen, closeRevisionsModal, selectedEntry } = useWiki()

  if (!isRevisionsModalOpen || !selectedEntry) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1001,
      }}
      onClick={() => closeRevisionsModal()}
    >
      <div
        style={{
          backgroundColor: theme.colors.background.main,
          borderRadius: theme.borderRadius,
          maxWidth: '600px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: theme.spacing.lg,
            borderBottom: `1px solid ${theme.colors.border}`,
            backgroundColor: theme.colors.background.secondary,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: 600,
              color: theme.colors.text.primary,
            }}
          >
            Revision History: {selectedEntry.title}
          </h2>
          <button
            onClick={() => closeRevisionsModal()}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: theme.colors.text.secondary,
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: theme.spacing.lg }}>
          <div style={{ color: theme.colors.text.secondary, textAlign: 'center', padding: theme.spacing.lg }}>
            <p>Revision history feature coming soon</p>
            <p style={{ fontSize: '12px' }}>
              Database schema supports wiki_revisions table for tracking all edits
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: theme.spacing.lg,
            borderTop: `1px solid ${theme.colors.border}`,
            backgroundColor: theme.colors.background.secondary,
            textAlign: 'right',
          }}
        >
          <button
            onClick={() => closeRevisionsModal()}
            style={{
              padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
              backgroundColor: theme.colors.primary,
              color: '#fff',
              border: 'none',
              borderRadius: theme.borderRadius,
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
