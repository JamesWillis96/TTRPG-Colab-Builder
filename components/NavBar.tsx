'use client'

import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import Link from 'next/link'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const { isDark, toggleTheme, theme, themeReady } = useTheme()

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/login'
  }

  if (!themeReady) {
    return null // Wait until theme is initialized
  }

  return (
    <nav
      style={{
        padding: '0.5rem 2rem',
        background: theme.colors.background.main,
        borderBottom: `1px solid ${theme.colors.border.primary}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}
    >
      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
        <Link
          href="/"
          style={{ fontSize: '1.25rem', fontWeight: 'bold', color: theme.colors.primary }}
        >
          🎲 TTRPG Colab Builder
        </Link>
        <Link
          href="/sessions"
          style={{ color: theme.colors.text.primary, fontSize: '1.1rem' }}
        >
          Sessions
        </Link>
        <Link
          href="/wiki"
          style={{ color: theme.colors.text.primary, fontSize: '1.1rem' }}
        >
          Wiki
        </Link>
        <Link
          href="/map"
          style={{ color: theme.colors.text.primary, fontSize: '1rem' }}
        >
          Map
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <label className="switch" title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
          <input
            type="checkbox"
            checked={!isDark}
            onChange={toggleTheme}
          />
          <span className="slider"></span>
        </label>
        {user ? (
          <>
            <Link
              href="/profile"
              style={{
                color: theme.colors.text.secondary,
                textDecoration: 'none',
                fontSize: '1rem',
                fontWeight: 'bold',
              }}
            >
              {profile?.username}
            </Link>
            <button
              onClick={handleSignOut}
              style={{
                padding: '0.5rem 1rem',
                background: theme.colors.background.secondary,
                border: `1px solid ${theme.colors.border.secondary}`,
                borderRadius: theme.borderRadius,
                color: theme.colors.text.primary,
                cursor: 'pointer',
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              style={{ color: theme.colors.primary }}
            >
              Login
            </Link>
            <Link
              href="/signup"
              style={{ color: theme.colors.primary }}
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}