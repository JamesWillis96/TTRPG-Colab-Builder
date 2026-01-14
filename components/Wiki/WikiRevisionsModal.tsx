'use client'

import React, { useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useWiki } from '../../contexts/WikiContext'
import { useAuth } from '../../contexts/AuthContext'

/**
 * WikiRevisionsModal - Show revision history for selected entry
 * Displays list of revisions with timestamps
 * Can view/restore previous versions
 */
export function WikiRevisionsModal() {
  const { theme } = useTheme()
  const { isRevisionsModalOpen, closeRevisionsModal, selectedEntry, revisions, revisionsLoading, loadRevisions, saveEntry } = useWiki()
  const { profile } = useAuth()

  // Load revisions when modal opens
  useEffect(() => {
    if (isRevisionsModalOpen && selectedEntry) {
      loadRevisions(selectedEntry.id)
    }
  }, [isRevisionsModalOpen, selectedEntry?.id])

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
          {revisionsLoading ? (
            <div style={{ color: theme.colors.text.secondary, textAlign: 'center', padding: theme.spacing.lg }}>
              Loading revisions...
            </div>
          ) : revisions.length === 0 ? (
            <div style={{ color: theme.colors.text.secondary, textAlign: 'center', padding: theme.spacing.lg }}>
              <p>No revision history available</p>
              <p style={{ fontSize: '12px' }}>Revisions are created when you edit this page.</p>
            </div>
          ) : (
            <div>
              {revisions.map((revision, index) => {
                const isLatest = index === 0
                const date = new Date(revision.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
                const isAuthorized = profile?.role === 'admin'

                return (
                  <div
                    key={revision.id}
                    style={{
                      padding: theme.spacing.md,
                      borderBottom: `1px solid ${theme.colors.border}`,
                      backgroundColor: isLatest ? theme.colors.background.secondary : undefined,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: theme.spacing.md }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm, marginBottom: theme.spacing.sm }}>
                          <span style={{ fontWeight: 600, color: theme.colors.text.primary }}>
                            {date}
                          </span>
                          {isLatest && (
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 600,
                                backgroundColor: theme.colors.primary,
                                color: '#fff',
                                padding: `2px 8px`,
                                borderRadius: '4px',
                              }}
                            >
                              Current
                            </span>
                          )}
                        </div>
                        <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: theme.colors.text.secondary }}>
                          {revision.change_summary}
                        </p>
                        <p style={{ margin: 0, fontSize: '12px', color: theme.colors.text.secondary }}>
                          Saved by {revision.author_id === selectedEntry.author_id ? 'author' : 'editor'}
                        </p>
                      </div>
                      {!isLatest && isAuthorized && (
                        <button
                          onClick={async () => {
                            // Restore this revision
                            if (confirm('Restore this version? Current version will be saved as a new revision.\n\nNote: The page URL (slug) will remain unchanged.')) {
                              try {
                                await saveEntry({
                                  title: revision.title,
                                  slug: selectedEntry.slug, // Keep current slug to preserve URL
                                  content: revision.content,
                                  category: revision.category,
                                  changeSummary: `Restored version from ${date}`,
                                }, selectedEntry.id)
                                alert('Version restored successfully!')
                                closeRevisionsModal()
                              } catch (err: any) {
                                console.error('Failed to restore revision:', err)
                                alert(`Failed to restore version: ${err.message || 'Unknown error'}`)
                              }
                            }
                          }}
                          style={{
                            padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                            backgroundColor: theme.colors.primary,
                            color: '#fff',
                            border: 'none',
                            borderRadius: theme.borderRadius,
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 500,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Restore
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
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
