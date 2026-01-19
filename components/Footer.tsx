'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useTheme } from '../contexts/ThemeContext'

export default function Footer() {
  const { theme } = useTheme()
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(true)
  const [isHidden, setIsHidden] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    setIsHidden(false)
    const hideTimer = setTimeout(() => setIsVisible(false), 5000)
    const removeTimer = setTimeout(() => setIsHidden(true), 5500)
    return () => {
      clearTimeout(hideTimer)
      clearTimeout(removeTimer)
    }
  }, [pathname])

  if (isHidden) return null

  return (
    <footer style={{
      position: 'fixed',
      bottom: theme.spacing.sm,
      left: '50%',
      transform: 'translateX(-50%)',
      background: theme.colors.background.tertiary,
      border: `1px solid ${theme.colors.border.primary}`,
      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
      paddingRight: theme.spacing.md,
      textAlign: 'center',
      fontSize: theme.fontSize.sm,
      color: theme.colors.text.secondary,
      zIndex: 100,
      backdropFilter: 'blur(8px)',
      backgroundColor: `${theme.colors.background.tertiary}ee`,
      borderRadius: theme.borderRadius,
      boxShadow: theme.shadow,
      maxWidth: '90vw',
      minWidth: '320px',
      opacity: isVisible ? 1 : 0,
      transition: 'opacity 0.5s ease',
      pointerEvents: isVisible ? 'auto' : 'none'
    }}>
      <p style={{ margin: 0 }}>
        ⚠️ <strong>Beta Version</strong> - This site is in active development.
      </p>
    </footer>
  )
}
