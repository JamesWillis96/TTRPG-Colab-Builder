'use client'

import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'

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
      background: '#111',
      borderBottom: '1px solid #333',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <a href="/" style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#4f8' }}>
                🎲 TTRPG Colab Builder
            </a>
            <a href="/sessions" style={{ color: '#aaa', fontSize: '1rem' }}>
                Sessions
            </a>
        </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {user ? (
          <>
            <a href="/profile" style={{ color:  '#4f8' }}>Profile</a>
            <span style={{ color: '#888' }}>
              Logged in as: <strong style={{ color: '#fff' }}>{user.email}</strong>
            </span>
            <button
              onClick={handleSignOut}
              style={{
                padding: '0.5rem 1rem',
                background: '#333',
                border: '1px solid #555',
                borderRadius: '4px',
                color: '#fff',
                cursor:  'pointer'
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <a href="/login" style={{ color: '#4f8' }}>Login</a>
            <a href="/signup" style={{ color: '#4f8' }}>Sign Up</a>
          </>
        )}
      </div>
    </nav>
  )
}