'use client'

import React from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useWiki } from '../../contexts/WikiContext'
import ReactMarkdown from 'react-markdown'
import { calculateReadingTime } from '../../lib/wiki'

/**
 * WikiContentPane - Right side content display
 * Shows selected entry with markdown rendering
 * Displays metadata (category, author, date)
 * Provides edit/delete/revisions actions
 */
export function WikiContentPane() {
  const { theme } = useTheme()
  const { selectedEntry, openEditModal, deleteEntry, openRevisionsModal } = useWiki()

  if (!selectedEntry) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: theme.colors.text.secondary,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '16px' }}>Select an entry to begin</p>
        </div>
      </div>
    )
  }

  const readingTime = calculateReadingTime(selectedEntry.content)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Entry header with metadata */}
      <div
        style={{
        padding: theme.spacing.lg,
        borderBottom: `1px solid ${theme.colors.border.primary}`,
        backgroundColor: theme.colors.background.secondary,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <div style={{ flex: 1 }}>
            <h1
              style={{
                margin: `0 0 ${theme.spacing.sm} 0`,
                fontSize: '28px',
                fontWeight: 700,
                color: theme.colors.text.primary,
              }}
            >
              {selectedEntry.title}
            </h1>
            <div
              style={{
                display: 'flex',
                gap: theme.spacing.lg,
                fontSize: '14px',
                color: theme.colors.text.secondary,
              }}
            >
              <span>Category: {selectedEntry.category}</span>
              <span>
                Updated: {new Date(selectedEntry.updated_at).toLocaleDateString()}
              </span>
              <span>{readingTime} min read</span>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: theme.spacing.md }}>
            <button
              onClick={() => openRevisionsModal()}
              style={{
                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                backgroundColor: theme.colors.background.main,
                color: theme.colors.text.primary,
                border: `1px solid ${theme.colors.border.primary}`,
                borderRadius: theme.borderRadius,
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.colors.background.secondary)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.colors.background.main)}
            >
              History
            </button>
            <button
              onClick={() => openEditModal(selectedEntry)}
              style={{
                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                backgroundColor: theme.colors.primary,
                color: '#fff',
                border: 'none',
                borderRadius: theme.borderRadius,
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              Edit
            </button>
            <button
              onClick={() => deleteEntry(selectedEntry.id)}
              style={{
                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: theme.borderRadius,
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: theme.spacing.lg,
        }}
      >
        <article
          className="markdown-content"
          style={{
            color: theme.colors.text.primary,
            fontSize: '15px',
            lineHeight: '1.6',
            maxWidth: '800px',
          }}
        >
          <ReactMarkdown>{selectedEntry.content}</ReactMarkdown>
        </article>
      </div>
    </div>
  )
}
