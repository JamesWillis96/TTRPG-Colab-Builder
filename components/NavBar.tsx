'use client'

import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { theme } from '../lib/theme'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <nav style={{
      padding: '1rem 2rem',
      background: theme.colors.background.main,
      borderBottom: `1px solid ${theme.colors.border.primary}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
        <div style={{ display: 'flex', gap:  '2rem', alignItems: 'center' }}>
            <a href="/" style={{ fontSize:  '1.25rem', fontWeight: 'bold', color: theme.colors.primary }}>
                🎲 TTRPG Colab Builder
            </a>
            <a href="/sessions" style={{ color: theme.colors.text.secondary, fontSize: '1rem' }}>
                Sessions
            </a>
            <a href="/wiki" style={{ color: theme.colors.text.secondary, fontSize: '1rem' }}>
                Wiki
            </a>
            <a href="/map" style={{ color: theme.colors.text.primary, textDecoration: 'none' }}>
            🗺️ Map
            </a>
        </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {user ? (
          <>
            <a href="/profile" style={{ color:  theme.colors.primary }}>Profile</a>
            <span style={{ color: theme.colors.text.secondary }}>
              Logged in as: <strong style={{ color: theme.colors.text.primary }}>{user.email}</strong>
            </span>
            <button
              onClick={handleSignOut}
              style={{
                padding: '0.5rem 1rem',
                background: theme.colors.background.secondary,
                border: `1px solid ${theme.colors.border.secondary}`,
                borderRadius: theme.borderRadius,
                color: theme.colors.text.primary,
                cursor:  'pointer'
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <a href="/login" style={{ color: theme.colors.primary }}>Login</a>
            <a href="/signup" style={{ color: theme.colors.primary }}>Sign Up</a>
          </>
        )}
      </div>
    </nav>
  )
}