'use client'

import { useTheme } from '../contexts/ThemeContext'

export default function Footer() {
  const { theme } = useTheme()

  return (
    <footer style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: theme.colors.background.tertiary,
      borderTop: `1px solid ${theme.colors.border.primary}`,
      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
      textAlign: 'center',
      fontSize: theme.fontSize.sm,
      color: theme.colors.text.secondary,
      zIndex: 100,
      backdropFilter: 'blur(8px)',
      backgroundColor: `${theme.colors.background.tertiary}ee`
    }}>
      <p style={{ margin: 0 }}>
        ⚠️ <strong>Beta Version</strong> - This site is in active development. Changes and improvements are sure to happen.
      </p>
    </footer>
  )
}
