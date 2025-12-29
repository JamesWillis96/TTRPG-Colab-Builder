'use client'

import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { theme } from '../lib/theme'

export default function Navbar() {
  const { user,profile, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <nav style={{
      padding: '0.5rem 2rem',
      background: theme.colors.background.main,
      borderBottom: `1px solid ${theme.colors.border.primary}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
        <div style={{ display: 'flex', gap:'1.25rem', alignItems: 'center' }}>
            <a href="/" style={{ fontSize:  '1.25rem', fontWeight: 'bold', color: theme.colors.primary, marginTop: '-0.25rem' }}>
                🎲 TTRPG Colab Builder
            </a>
            <a href="/sessions" style={{ color: theme.colors.text.primary, fontSize: '1.1rem' }}>
                Sessions
            </a>
            <a href="/wiki" style={{ color: theme.colors.text.primary, fontSize: '1.1rem' }}>
                Wiki
            </a>
            <a href="/map" style={{ color: theme.colors.text.primary, fontSize: '1rem' }}>
                Map
            </a>
        </div>

       <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {user ? (
          <>
            <a
              href="/profile"
              style={{
                color: theme.colors.text.secondary,  // Changed from primary to secondary
                textDecoration: 'none',
                fontSize: '1rem',
                fontWeight: 'bold',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = theme.colors.primary
                e.currentTarget.style.textDecoration = 'none'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = theme.colors.text.secondary
                e.currentTarget.style.textDecoration = 'none'
              }}
            >
              {profile?.username}
            </a>
            <button
              onClick={handleSignOut}
              style={{
                padding: '0.5rem 1rem',
                background: theme.colors.background.secondary,
                border: `1px solid ${theme.colors.border.secondary}`,
                borderRadius: theme.borderRadius,
                color: theme.colors.text.primary,
                cursor: 'pointer'
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