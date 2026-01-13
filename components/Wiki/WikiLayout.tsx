'use client'

import React from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useWiki } from '../../contexts/WikiContext'
import { WikiHeader } from './WikiHeader'
import { WikiSidebar } from './WikiSidebar'
import { WikiContentPane } from './WikiContentPane'
import { WikiEditorModal } from './WikiEditorModal'
import { WikiRevisionsModal } from './WikiRevisionsModal'

/**
 * WikiLayout - Main container for the Wiki feature
 * Manages two-pane layout: sidebar (search/filter) + content (entry display/edit)
 * Handles responsive layout changes for mobile
 */
export function WikiLayout() {
  const { theme, styles } = useTheme()
  const { isMobile, sidebarOpen } = useWiki()

  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: theme.colors.background.main,
        color: theme.colors.text.primary,
      }}
    >
      {/* Header with navigation */}
      <WikiHeader />

      {/* Two-pane content area */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
          gap: theme.spacing.md,
        }}
      >
        {/* Sidebar - search, filter, entry list */}
        {(!isMobile || sidebarOpen) && (
          <aside
            style={{
              width: isMobile ? '100%' : '300px',
              backgroundColor: theme.colors.background.secondary,
              borderRight: `1px solid ${theme.colors.border.primary}`,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'auto',
              zIndex: isMobile ? 10 : 'auto',
            }}
          >
            <WikiSidebar />
          </aside>
        )}

        {/* Content pane - entry display and editing */}
        {(!isMobile || !sidebarOpen) && (
          <section
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              backgroundColor: theme.colors.background.main,
            }}
          >
            <WikiContentPane />
          </section>
        )}
      </div>

      {/* Modals */}
      <WikiEditorModal />
      <WikiRevisionsModal />
    </main>
  )
}
