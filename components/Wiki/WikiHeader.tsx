'use client'

import React, { useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useWiki } from '../../contexts/WikiContext'
import { useAuth } from '../../contexts/AuthContext'

/**
 * WikiHeader - Top navigation bar
 * Shows title, entry count, create button, mobile sidebar toggle
 */
export function WikiHeader() {
  const { theme } = useTheme()
  const { entries, isMobile, sidebarOpen, setSidebarOpen, openEditModal, selectedEntry, isPublic, isAuthorOrAdmin, togglePublicStatus } = useWiki()
  const { user, profile } = useAuth()
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingPublic, setPendingPublic] = useState(false)

  // Simple toast using window.alert for demo; replace with your toast system
  function showToast(msg: string) {
    if (window && window['showToast']) {
      window['showToast'](msg)
    } else {
      alert(msg)
    }
  }

  // Handle switch click
  const handleSwitchClick = (makePublic: boolean) => {
    setPendingPublic(makePublic)
    setShowConfirm(true)
  }

  // Confirm dialog action
  const handleConfirm = async () => {
    setShowConfirm(false)
    await togglePublicStatus(pendingPublic)
    showToast(pendingPublic ? 'Page is now public.' : 'Page is now private.')
  }

  // Cancel dialog
  const handleCancel = () => setShowConfirm(false)

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
      {/* Left: Title, entry count, author, public indicator */}
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
        {selectedEntry && (
          <span style={{ marginLeft: theme.spacing.md, fontSize: '14px', color: theme.colors.text.secondary }}>
            by <b>{selectedEntry.author_id}</b>
            {isPublic && (
              <span title="Publicly editable" style={{ marginLeft: 8, verticalAlign: 'middle' }}>
                {/* Globe SVG icon */}
                <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="-5.0 -10.0 110.0 135.0" width="18" height="18" style={{ display: 'inline', marginLeft: 2 }}>
                  <path d="m23.102 24.461c3.7734 0 7.1758 2.2734 8.6172 5.7578 1.4453 3.4883 0.64844 7.5-2.0195 10.168-2.6719 2.668-6.6836 3.4688-10.168 2.0234-3.4883-1.4453-5.7617-4.8477-5.7617-8.6211 0-5.1523 4.1758-9.3281 9.332-9.3281zm50.738 44.129v7.7891c-0.003906 2.4805-2.0117 4.4844-4.4883 4.4922h-38.703c-2.4766-0.007813-4.4844-2.0117-4.4883-4.4922v-7.7891c0-8.5156 4.543-16.387 11.918-20.645 7.3789-4.2617 16.465-4.2617 23.844 0 7.375 4.2578 11.918 12.129 11.918 20.645zm-23.84-49.461c4.6133 0 8.7773 2.7812 10.543 7.043 1.7656 4.2656 0.78906 9.1719-2.4766 12.438-3.2617 3.2617-8.168 4.2383-12.434 2.4727-4.2617-1.7656-7.043-5.9258-7.043-10.543 0-6.3008 5.1094-11.41 11.41-11.41zm26.898 5.3281v0.003907c3.7734 0 7.1758 2.2734 8.6211 5.7578 1.4453 3.4883 0.64453 7.5-2.0234 10.168-2.668 2.668-6.6797 3.4688-10.168 2.0234-3.4844-1.4453-5.7578-4.8477-5.7578-8.6211 0-5.1523 4.1758-9.3281 9.3281-9.3281zm-53.059 50.184v-6c0.007812-7.9219 3.6094-15.414 9.7891-20.371-3.9414-2.5352-8.6641-3.5625-13.301-2.8945s-8.8789 2.9844-11.949 6.5273c-3.0664 3.543-4.7539 8.0703-4.75 12.758v6.3398c0.007813 2.0234 1.6484 3.6641 3.6719 3.6719zm72.551-10c0.003906-4.6875-1.6836-9.2148-4.75-12.758-3.0703-3.543-7.3086-5.8594-11.949-6.5273-4.6367-0.66797-9.3594 0.35938-13.301 2.8945 6.1797 4.957 9.7812 12.449 9.7891 20.371v6h16.539c2.0078-0.007813 3.6367-1.6172 3.6719-3.6211z" fill-rule="evenodd" fill="#4caf50"/>
                </svg>
                <span style={{ marginLeft: 4, color: '#4caf50', fontWeight: 500 }}>Public</span>
              </span>
            )}
          </span>
        )}
      </div>

      {/* Right: Create button and public toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
        {user && (
          <button
            onClick={() => openEditModal()}
            style={{
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              backgroundColor: theme.colors.primary,
              color: '#fff',
              border: 'none',
              borderRadius: theme.borderRadius,
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            + Add Entry
          </button>
        )}
      </div>

      {/* Confirmation dialog */}
      {showConfirm && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: theme.colors.background.main,
              color: theme.colors.text.primary,
              padding: 32,
              borderRadius: theme.borderRadius,
              boxShadow: theme.shadow,
              minWidth: 320,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 16, marginBottom: 16 }}>
              Are you sure you want to make this page {pendingPublic ? 'public' : 'private'}?
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
              <button
                onClick={handleConfirm}
                style={{
                  padding: '8px 20px',
                  background: theme.colors.primary,
                  color: '#fff',
                  border: 'none',
                  borderRadius: theme.borderRadius,
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Yes
              </button>
              <button
                onClick={handleCancel}
                style={{
                  padding: '8px 20px',
                  background: theme.colors.background.secondary,
                  color: theme.colors.text.primary,
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: theme.borderRadius,
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
