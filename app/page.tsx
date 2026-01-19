'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

type WikiPage = {
  id: string
  title: string
  slug: string
  category: string
  updated_at: string
}

type POI = {
  id: string
  x: number
  y: number
  title: string
}

type Profile = {
  username: string
}

type SessionRow = {
  id: string
  title: string
  description?: string
  date_time: string
  max_players?: number | null
  game_system?: string
  gm_id: string
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const { theme, styles, isDark } = useTheme()
  const router = useRouter()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [recentWikiPages, setRecentWikiPages] = useState<WikiPage[]>([])
  const [loading, setLoading] = useState(true)
  const [mapPois, setMapPois] = useState<POI[]>([])
  const [upcomingSessions, setUpcomingSessions] = useState<SessionRow[]>([])
  const [sessionStats, setSessionStats] = useState({ total: 0, players: 0 })
  const [wikiPageCount, setWikiPageCount] = useState(0)
  const [gmNames, setGmNames] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login')
      } else {
        loadDashboardData()
      }
    }
  }, [user, authLoading, router])

  const loadDashboardData = async () => {
    if (!user) return
    setLoading(true)
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single()
      setProfile(profileData)

      // Fetch all sessions to get counts and upcoming
      const { data: allSessions } = await supabase
        .from('sessions')
        .select('*')
        .is('deleted_at', null)
        .order('date_time', { ascending: true })
      
      const now = new Date()
      const upcoming = (allSessions || []).filter(s => new Date(s.date_time) > now).slice(0, 4)
      setUpcomingSessions(upcoming)
      setSessionStats({ total: allSessions?.length || 0, players: 0 })

      // Fetch all GM names for upcoming sessions
      if (upcoming.length > 0) {
        const gmIds = [...new Set(upcoming.map(s => s.gm_id))]
        const { data: gmProfiles } = await supabase
          .from('profiles')
          .select('id,username')
          .in('id', gmIds)
        const gmMap: Record<string, string> = {}
        ;(gmProfiles || []).forEach(p => { gmMap[p.id] = p.username })
        setGmNames(gmMap)
      }

      // Fetch unique player count
      const { data: allPlayers } = await supabase
        .from('session_players')
        .select('player_id')
      const uniquePlayers = new Set(allPlayers?.map(p => p.player_id) || [])
      setSessionStats(prev => ({ ...prev, players: uniquePlayers.size }))

      // Fetch recent wiki pages
      const { data: wikiData } = await supabase
        .from('wiki_pages')
        .select('id, title, slug, category, updated_at')
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })
        .limit(4)
      setRecentWikiPages(wikiData || [])

      // Fetch wiki page count
      const { data: wikiCountData } = await supabase
        .from('wiki_pages')
        .select('id', { count: 'exact' })
        .is('deleted_at', null)
      setWikiPageCount(wikiCountData?.length || 0)

      // Fetch map POIs
      const { data: poisData } = await supabase
        .from('map_pois')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: true })
      setMapPois(poisData || [])
    } catch (error: any) {
      console.error('Error loading dashboard:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      npc: '🧍',
      location: '📍',
      lore: '📜',
      item: '⚔️',
      faction: '🛡️',
      playercharacter: '🎭'
    }
    return icons[category] || '🎭'
  }

  if (authLoading || loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 80px)',
        fontSize: '1.25rem',
        color: theme.colors.text.secondary
      }}>
        Loading...
      </div>
    )
  }

  if (!user || !profile) return null

  return (
    <main style={{
      minHeight: 'calc(100vh - 80px)',
      overflow: 'visible',
      backgroundImage: isDark 
        ? 'url(https://i.pinimg.com/736x/b1/5f/5d/b15f5d26bbe913ff5d5368a92565dd92.jpg)'
        : 'url(https://images.pdimagearchive.org/collections/bracelli-s-bizzarie-di-varie-figure-1624/46848687324_d613e135b4_b.jpg?width=1000&height=800)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      position: 'relative',
      borderLeft: `8px solid ${theme.colors.primary}`,
      borderRight: `8px solid ${theme.colors.primary}`
    }}>
      {/* Radial gradient overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: isDark
          ? 'radial-gradient(ellipse at center, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.7) 50%, rgba(15, 23, 42, 0.5) 100%)'
          : 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.6) 50%, rgba(255, 255, 255, 0.4) 100%)',
        pointerEvents: 'none'
      }} />

      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '2.5rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2.5rem',
        position: 'relative',
        zIndex: 1,
        background: isDark
          ? 'rgba(30, 41, 59, 0.6)'
          : 'rgba(255, 255, 255, 0.6)',
        borderRadius: '12px',
        marginTop: '2rem',
        marginBottom: '2rem',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`
      }}>

        {/* Welcome Section */}
        <section>
          <h1 style={{
            ...styles.heading1,
            marginBottom: '0.5rem',
            color: theme.colors.text.primary,
            fontSize: '2.2rem',
            fontWeight: '700'
          }}>
            Welcome back, {profile.username}! 👋
          </h1>
          <p style={{
            color: theme.colors.text.secondary,
            fontSize: '1rem',
            margin: 0
          }}>
            Continue weaving your epic tale
          </p>
        </section>

        {/* Campaign Stats with Enhanced Styling */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{
            background: isDark 
              ? 'linear-gradient(135deg, rgba(71, 85, 105, 0.4) 0%, rgba(51, 65, 85, 0.3) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(245, 245, 250, 0.4) 100%)',
            border: `2px solid ${theme.colors.primary}`,
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            boxShadow: isDark 
              ? '0 8px 16px rgba(0, 0, 0, 0.2)'
              : '0 4px 12px rgba(0, 0, 0, 0.05)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.borderColor = theme.colors.primary
            e.currentTarget.style.boxShadow = isDark 
              ? `0 12px 24px rgba(${theme.colors.primary.replace(/[^\d,]/g, '')}, 0.3)`
              : `0 8px 16px rgba(${theme.colors.primary.replace(/[^\d,]/g, '')}, 0.15)`
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
          }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: theme.colors.primary,
              marginBottom: '0.5rem'
            }}>
              {sessionStats.total}
            </div>
            <div style={{
              fontSize: '0.9rem',
              color: theme.colors.text.secondary,
              textTransform: 'uppercase',
              letterSpacing: '0.75px',
              fontWeight: '600'
            }}>
              Sessions
            </div>
          </div>

          <div style={{
            background: isDark 
              ? 'linear-gradient(135deg, rgba(71, 85, 105, 0.4) 0%, rgba(51, 65, 85, 0.3) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(245, 245, 250, 0.4) 100%)',
            border: `2px solid ${theme.colors.primary}`,
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            boxShadow: isDark 
              ? '0 8px 16px rgba(0, 0, 0, 0.2)'
              : '0 4px 12px rgba(0, 0, 0, 0.05)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.borderColor = theme.colors.primary
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
          }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: theme.colors.primary,
              marginBottom: '0.5rem'
            }}>
              {wikiPageCount}
            </div>
            <div style={{
              fontSize: '0.9rem',
              color: theme.colors.text.secondary,
              textTransform: 'uppercase',
              letterSpacing: '0.75px',
              fontWeight: '600'
            }}>
              Wiki Pages
            </div>
          </div>

          <div style={{
            background: isDark 
              ? 'linear-gradient(135deg, rgba(71, 85, 105, 0.4) 0%, rgba(51, 65, 85, 0.3) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(245, 245, 250, 0.4) 100%)',
            border: `2px solid ${theme.colors.primary}`,
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            boxShadow: isDark 
              ? '0 8px 16px rgba(0, 0, 0, 0.2)'
              : '0 4px 12px rgba(0, 0, 0, 0.05)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.borderColor = theme.colors.primary
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
          }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: theme.colors.primary,
              marginBottom: '0.5rem'
            }}>
              {sessionStats.players}
            </div>
            <div style={{
              fontSize: '0.9rem',
              color: theme.colors.text.secondary,
              textTransform: 'uppercase',
              letterSpacing: '0.75px',
              fontWeight: '600'
            }}>
              Active Players
            </div>
          </div>
        </section>

        {/* Creative Tools */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{
            background: isDark 
              ? 'linear-gradient(135deg, rgba(71, 85, 105, 0.3) 0%, rgba(51, 65, 85, 0.25) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(245, 245, 250, 0.4) 100%)',
            border: `1.5px solid ${theme.colors.border.primary}`,
            borderRadius: '12px',
            padding: '1.25rem',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, color: theme.colors.text.primary, fontSize: '1.1rem', fontWeight: '600' }}>Mad Libs</h3>
              <span style={{ color: theme.colors.text.secondary, fontSize: '0.8rem', fontWeight: '500' }}>idea generator</span>
            </div>
            <p style={{ color: theme.colors.text.secondary, margin: '0 0 1rem 0', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Quickly spin up NPCs, encounters, items, and hooks with guided blanks.
            </p>
            <button
              onClick={() => router.push('/madlibs')}
              style={{
                padding: '10px 18px',
                background: theme.colors.primary,
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease',
                width: '100%'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9'
                e.currentTarget.style.transform = 'scale(1.02)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              Open Mad Libs
            </button>
          </div>
        </section>

        {/* Primary CTAs */}
        <section style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => router.push('/sessions/create')}
            style={{
              ...styles.button.primary,
              flex: '1',
              minWidth: '180px',
              padding: '12px 20px',
              fontSize: '0.95rem',
              borderRadius: '8px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              boxShadow: `0 4px 12px rgba(${theme.colors.primary.replace(/[^\d,]/g, '')}, 0.3)`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = `0 6px 16px rgba(${theme.colors.primary.replace(/[^\d,]/g, '')}, 0.4)`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            + Create Session
          </button>
          <button
            onClick={() => router.push('/wiki?new-entry')}
            style={{
              ...styles.button.secondary,
              flex: '1',
              minWidth: '180px',
              padding: '12px 20px',
              fontSize: '0.95rem',
              borderRadius: '8px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              border: `2px solid ${theme.colors.primary}`,
              background: 'transparent',
              color: theme.colors.primary
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.background = isDark 
                ? 'rgba(71, 85, 105, 0.2)'
                : 'rgba(255, 255, 255, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            + Create Wiki Page
          </button>
          <button
            onClick={() => router.push('/map')}
            style={{
              ...styles.button.secondary,
              flex: '1',
              minWidth: '180px',
              padding: '12px 20px',
              fontSize: '0.95rem',
              borderRadius: '8px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              border: `2px solid ${theme.colors.primary}`,
              background: 'transparent',
              color: theme.colors.primary
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.background = isDark 
                ? 'rgba(71, 85, 105, 0.2)'
                : 'rgba(255, 255, 255, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            🗺️ Explore Map
          </button>
        </section>

        {/* Upcoming Sessions */}
        <section>
          <h2 style={{ ...styles.heading2, marginBottom: '1.25rem', fontSize: '1.4rem' }}>📅 Upcoming Sessions</h2>
          {upcomingSessions.length === 0 ? (
            <div style={{
              background: isDark 
                ? 'linear-gradient(135deg, rgba(71, 85, 105, 0.3) 0%, rgba(51, 65, 85, 0.25) 100%)'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(245, 245, 250, 0.4) 100%)',
              border: `1.5px solid ${theme.colors.border.primary}`,
              borderRadius: '12px',
              padding: '2rem',
              textAlign: 'center',
              color: theme.colors.text.secondary,
              backdropFilter: 'blur(8px)'
            }}>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.95rem' }}>No sessions scheduled yet.</p>
              <button
                onClick={() => router.push('/sessions/create')}
                style={{
                  ...styles.button.primary,
                  fontSize: '0.85rem',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Create Your First Session
              </button>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.875rem'
            }}>
              {upcomingSessions.map(session => {
                const dateTime = new Date(session.date_time)
                const dateStr = dateTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                const timeStr = dateTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
                const gmName = gmNames[session.gm_id] || 'Loading...'

                return (
                  <div
                    key={session.id}
                    onClick={() => router.push(`/sessions/${session.id}`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1.25rem',
                      background: isDark 
                        ? 'linear-gradient(135deg, rgba(71, 85, 105, 0.3) 0%, rgba(51, 65, 85, 0.25) 100%)'
                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(245, 245, 250, 0.4) 100%)',
                      border: `1.5px solid ${theme.colors.border.primary}`,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.3s ease',
                      color: 'inherit',
                      backdropFilter: 'blur(8px)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = theme.colors.primary
                      e.currentTarget.style.background = isDark 
                        ? 'rgba(71, 85, 105, 0.4)'
                        : 'rgba(255, 255, 255, 0.6)'
                      e.currentTarget.style.transform = 'translateX(4px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = theme.colors.border.primary
                      e.currentTarget.style.background = isDark 
                        ? 'linear-gradient(135deg, rgba(71, 85, 105, 0.3) 0%, rgba(51, 65, 85, 0.25) 100%)'
                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(245, 245, 250, 0.4) 100%)'
                      e.currentTarget.style.transform = 'translateX(0)'
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        router.push(`/sessions/${session.id}`)
                      }
                    }}
                  >
                    <div>
                      <div style={{
                        fontSize: '1rem',
                        fontWeight: '700',
                        color: theme.colors.text.primary,
                        marginBottom: '0.5rem'
                      }}>
                        {session.title}
                      </div>
                      <div style={{
                        fontSize: '0.85rem',
                        color: theme.colors.text.secondary,
                        display: 'flex',
                        gap: '1.5rem',
                        flexWrap: 'wrap'
                      }}>
                        <span>📅 {dateStr} at {timeStr}</span>
                        <span>👤 GM: {gmName}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/sessions/${session.id}`)
                      }}
                      style={{
                        ...styles.button.primary,
                        padding: '8px 16px',
                        fontSize: '0.8rem',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                        marginLeft: '1rem',
                        borderRadius: '6px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.9'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1'
                      }}
                    >
                      View Details
                    </button>
                  </div>
                )
              })}
              <button
                onClick={() => router.push('/sessions')}
                style={{
                  ...styles.button.secondary,
                  marginTop: '0.75rem',
                  borderRadius: '8px',
                  fontWeight: '600',
                  padding: '12px 20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1'
                }}
              >
                View All Sessions
              </button>
            </div>
          )}
        </section>

        {/* Recent Wiki Updates */}
        <section>
          <h2 style={{ ...styles.heading2, marginBottom: '1.25rem', fontSize: '1.4rem' }}>📚 Recent Wiki Updates</h2>
          {recentWikiPages.length === 0 ? (
            <div style={{
              background: isDark 
                ? 'linear-gradient(135deg, rgba(71, 85, 105, 0.3) 0%, rgba(51, 65, 85, 0.25) 100%)'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(245, 245, 250, 0.4) 100%)',
              border: `1.5px solid ${theme.colors.border.primary}`,
              borderRadius: '12px',
              padding: '2rem',
              textAlign: 'center',
              color: theme.colors.text.secondary,
              backdropFilter: 'blur(8px)'
            }}>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.95rem' }}>Build your campaign world.</p>
              <button
                onClick={() => router.push('/wiki/create')}
                style={{
                  ...styles.button.primary,
                  fontSize: '0.85rem',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Create Your First Page
              </button>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.875rem'
            }}>
              {recentWikiPages.map(page => (
                <a
                  key={page.id}
                  href={`/wiki/${page.slug}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1.25rem',
                    background: isDark 
                      ? 'linear-gradient(135deg, rgba(71, 85, 105, 0.3) 0%, rgba(51, 65, 85, 0.25) 100%)'
                      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(245, 245, 250, 0.4) 100%)',
                    border: `1.5px solid ${theme.colors.border.primary}`,
                    borderRadius: '12px',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(8px)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.primary
                    e.currentTarget.style.background = isDark 
                      ? 'rgba(71, 85, 105, 0.4)'
                      : 'rgba(255, 255, 255, 0.6)'
                    e.currentTarget.style.transform = 'translateX(4px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.border.primary
                    e.currentTarget.style.background = isDark 
                      ? 'linear-gradient(135deg, rgba(71, 85, 105, 0.3) 0%, rgba(51, 65, 85, 0.25) 100%)'
                      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(245, 245, 250, 0.4) 100%)'
                    e.currentTarget.style.transform = 'translateX(0)'
                  }}
                >
                  <span style={{ fontSize: '1.75rem', flexShrink: 0 }}>
                    {getCategoryIcon(page.category)}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '0.95rem',
                      fontWeight: '700',
                      color: theme.colors.text.primary,
                      marginBottom: '0.25rem'
                    }}>
                      {page.title}
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      color: theme.colors.text.secondary,
                      fontWeight: '500'
                    }}>
                      {page.category.toUpperCase()} • Updated {new Date(page.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                </a>
              ))}
              <button
                onClick={() => router.push('/wiki')}
                style={{
                  ...styles.button.secondary,
                  marginTop: '0.75rem',
                  borderRadius: '8px',
                  fontWeight: '600',
                  padding: '12px 20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1'
                }}
              >
                View All Wiki Pages
              </button>
            </div>
          )}
        </section>

        {/* World Map Preview */}
        <section>
          <h2 style={{ ...styles.heading2, marginBottom: '1.25rem', fontSize: '1.4rem' }}>🗺️ World Map Preview</h2>
          {mapPois.length === 0 ? (
            <div style={{
              background: isDark 
                ? 'linear-gradient(135deg, rgba(71, 85, 105, 0.3) 0%, rgba(51, 65, 85, 0.25) 100%)'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(245, 245, 250, 0.4) 100%)',
              border: `1.5px solid ${theme.colors.border.primary}`,
              borderRadius: '12px',
              padding: '2rem',
              textAlign: 'center',
              color: theme.colors.text.secondary,
              backdropFilter: 'blur(8px)'
            }}>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.95rem' }}>No locations added to your map yet.</p>
              <button
                onClick={() => router.push('/map')}
                style={{
                  ...styles.button.primary,
                  fontSize: '0.85rem',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Add Your First Location
              </button>
            </div>
          ) : (
            <div style={{
              background: isDark 
                ? 'linear-gradient(135deg, rgba(71, 85, 105, 0.3) 0%, rgba(51, 65, 85, 0.25) 100%)'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(245, 245, 250, 0.4) 100%)',
              border: `1.5px solid ${theme.colors.border.primary}`,
              borderRadius: '12px',
              padding: '1.5rem',
              backdropFilter: 'blur(8px)'
            }}>
              <p style={{
                color: theme.colors.text.secondary,
                margin: '0 0 1rem 0',
                fontSize: '0.9rem'
              }}>
                {mapPois.length} location{mapPois.length !== 1 ? 's' : ''} on your map
              </p>
              <button
                onClick={() => router.push('/map')}
                style={{
                  ...styles.button.primary,
                  borderRadius: '8px',
                  fontWeight: '600',
                  padding: '12px 20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1'
                }}
              >
                Open Map Editor
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
