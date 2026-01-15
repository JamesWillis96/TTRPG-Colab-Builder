'use client'

import { useTheme } from '../contexts/ThemeContext'

export default function Footer() {
  const { theme } = useTheme()

  return (
    <footer style={{
      position: 'fixed',
      bottom: theme.spacing.sm,
      left: '50%',
      transform: 'translateX(-50%)',
      background: theme.colors.background.tertiary,
      border: `1px solid ${theme.colors.border.primary}`,
      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
      paddingRight: '0rem',
      textAlign: 'center',
      fontSize: theme.fontSize.sm,
      color: theme.colors.text.secondary,
      zIndex: 100,
      backdropFilter: 'blur(8px)',
      backgroundColor: `${theme.colors.background.tertiary}ee`,
      borderRadius: theme.borderRadius,
      boxShadow: theme.shadow,
      maxWidth: '90vw',
      minWidth: '320px'
    }}>
      <p style={{ margin: 0 }}>
        ⚠️ <strong>Beta Version</strong> - This site is in active development. Report bugs here:
      </p>
    </footer>
  )
}
