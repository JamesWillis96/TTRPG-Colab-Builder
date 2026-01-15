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
        .order('date_time', { ascending: true })
      
      const now = new Date()
      const upcoming = (allSessions || []).filter(s => new Date(s.date_time) > now).slice(0, 4)
      setUpcomingSessions(upcoming)
      setSessionStats({ total: allSessions?.length || 0, players: 0 }) // Will update below

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
        .order('updated_at', { ascending: false })
        .limit(4)
      setRecentWikiPages(wikiData || [])

      // Fetch wiki page count
      const { data: wikiCountData } = await supabase
        .from('wiki_pages')
        .select('id', { count: 'exact' })
      setWikiPageCount(wikiCountData?.length || 0)

      // Fetch map POIs
      const { data: poisData } = await supabase
        .from('map_pois')
        .select('*')
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
      {/* Radial gradient overlay - darker in center, lighter on edges */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: isDark
          ? 'radial-gradient(ellipse at center, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.7) 50%, rgba(15, 23, 42, 0.5) 100%)'
          : 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.6) 50%, rgba(255, 255, 255, 0.4) 100%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '2rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        position: 'relative',
        zIndex: 1,
        background: isDark
          ? 'rgba(30, 41, 59, 0.5)'
          : 'rgba(255, 255, 255, 0.5)',
        borderRadius: '8px',
        marginTop: '2rem',
        marginBottom: '2rem'
      }}>

        {/* Welcome Section */}
        <section>
          <h1 style={{
            ...styles.heading1,
            marginBottom: '0.5rem',
            color: theme.colors.text.primary
          }}>
            Welcome back, {profile.username}! 👋
          </h1>
        </section>

        {/* Campaign Stats */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{
            background: theme.colors.background.secondary,
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: theme.borderRadius,
            padding: '1.25rem',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '1.75rem',
              fontWeight: 'bold',
              color: theme.colors.primary,
              marginBottom: '0.25rem'
            }}>
              {sessionStats.total}
            </div>
            <div style={{
              fontSize: '0.85rem',
              color: theme.colors.text.secondary,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Sessions
            </div>
          </div>
          <div style={{
            background: theme.colors.background.secondary,
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: theme.borderRadius,
            padding: '1.25rem',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '1.75rem',
              fontWeight: 'bold',
              color: theme.colors.primary,
              marginBottom: '0.25rem'
            }}>
              {wikiPageCount}
            </div>
            <div style={{
              fontSize: '0.85rem',
              color: theme.colors.text.secondary,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Wiki Pages
            </div>
          </div>
          <div style={{
            background: theme.colors.background.secondary,
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: theme.borderRadius,
            padding: '1.25rem',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '1.75rem',
              fontWeight: 'bold',
              color: theme.colors.primary,
              marginBottom: '0.25rem'
            }}>
              {sessionStats.players}
            </div>
            <div style={{
              fontSize: '0.85rem',
              color: theme.colors.text.secondary,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Active Players
            </div>
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
              fontSize: '0.95rem'
            }}
          >
            + Create Session
          </button>
          <button
            onClick={() => router.push('/wiki/create')}
            style={{
              ...styles.button.secondary,
              flex: '1',
              minWidth: '180px',
              padding: '12px 20px',
              fontSize: '0.95rem'
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
              fontSize: '0.95rem'
            }}
          >
            🗺️ Explore Map
          </button>
        </section>

        {/* Upcoming Sessions */}
        <section>
          <h2 style={{ ...styles.heading2, marginBottom: '1rem' }}>📅 Upcoming Sessions</h2>
          {upcomingSessions.length === 0 ? (
            <div style={{
              background: theme.colors.background.secondary,
              border: `1px solid ${theme.colors.border.primary}`,
              borderRadius: theme.borderRadius,
              padding: '1.5rem',
              textAlign: 'center',
              color: theme.colors.text.secondary
            }}>
              <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem' }}>No sessions scheduled yet.</p>
              <button
                onClick={() => router.push('/sessions/create')}
                style={{
                  ...styles.button.primary,
                  fontSize: '0.85rem',
                  padding: '8px 16px'
                }}
              >
                Create Your First Session
              </button>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              {upcomingSessions.map(session => {
                const dateTime = new Date(session.date_time)
                const dateStr = dateTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                const timeStr = dateTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
                const gmName = gmNames[session.gm_id] || 'Loading...'

                return (
                  <button
                    key={session.id}
                    onClick={() => router.push(`/sessions/${session.id}`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem',
                      background: theme.colors.background.secondary,
                      border: `1px solid ${theme.colors.border.primary}`,
                      borderRadius: theme.borderRadius,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'border-color 0.2s, background 0.2s',
                      color: 'inherit'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = theme.colors.primary
                      e.currentTarget.style.background = theme.colors.background.main
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = theme.colors.border.primary
                      e.currentTarget.style.background = theme.colors.background.secondary
                    }}
                  >
                    <div>
                      <div style={{
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        color: theme.colors.text.primary,
                        marginBottom: '0.25rem'
                      }}>
                        {session.title}
                      </div>
                      <div style={{
                        fontSize: '0.8rem',
                        color: theme.colors.text.secondary,
                        display: 'flex',
                        gap: '1rem',
                        flexWrap: 'wrap'
                      }}>
                        <span>📅 {dateStr} at {timeStr}</span>
                        <span>GM: {gmName}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/sessions/${session.id}`)
                      }}
                      style={{
                        ...styles.button.primary,
                        padding: '6px 14px',
                        fontSize: '0.8rem',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                        marginLeft: '1rem'
                      }}
                    >
                      View Details
                    </button>
                  </button>
                )
              })}
              <button
                onClick={() => router.push('/sessions')}
                style={{
                  ...styles.button.secondary,
                  marginTop: '0.5rem'
                }}
              >
                View All Sessions
              </button>
            </div>
          )}
        </section>

        {/* Recent Wiki Updates */}
        <section>
          <h2 style={{ ...styles.heading2, marginBottom: '1rem' }}>📚 Recent Wiki Updates</h2>
          {recentWikiPages.length === 0 ? (
            <div style={{
              background: theme.colors.background.secondary,
              border: `1px solid ${theme.colors.border.primary}`,
              borderRadius: theme.borderRadius,
              padding: '1.5rem',
              textAlign: 'center',
              color: theme.colors.text.secondary
            }}>
              <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem' }}>Build your campaign world.</p>
              <button
                onClick={() => router.push('/wiki/create')}
                style={{
                  ...styles.button.primary,
                  fontSize: '0.85rem',
                  padding: '8px 16px'
                }}
              >
                Create Your First Page
              </button>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              {recentWikiPages.map(page => (
                <a
                  key={page.id}
                  href={`/wiki/${page.slug}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1rem',
                    background: theme.colors.background.secondary,
                    border: `1px solid ${theme.colors.border.primary}`,
                    borderRadius: theme.borderRadius,
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'border-color 0.2s, background 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.primary
                    e.currentTarget.style.background = theme.colors.background.main
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.border.primary
                    e.currentTarget.style.background = theme.colors.background.secondary
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>
                    {getCategoryIcon(page.category)}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      color: theme.colors.text.primary,
                      marginBottom: '0.2rem'
                    }}>
                      {page.title}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: theme.colors.text.secondary
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
                  marginTop: '0.5rem'
                }}
              >
                View All Wiki Pages
              </button>
            </div>
          )}
        </section>

        {/* World Map Preview */}
        <section>
          <h2 style={{ ...styles.heading2, marginBottom: '1rem' }}>🗺️ World Map</h2>
          <a
            href="/map"
            style={{
              display: 'block',
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            <div
              style={{
                background: 'transparent',
                borderRadius: theme.borderRadius,
                padding: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'border-color 0.2s, transform 0.2s',
                position: 'relative',
                minHeight: '300px',
                overflow: 'visible',
                border: `1px solid ${theme.colors.border.secondary}`,
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = theme.colors.primary
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = theme.colors.border.secondary
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <img
                src="/world-map.png"
                alt="World Map"
                style={{
                  maxWidth: '105%',
                  height: 'auto',
                  borderRadius: theme.borderRadius,
                  border: `1px solid ${theme.colors.border.secondary}`
                }}
              />
              {mapPois.map(poi => (
                <div
                  key={poi.id}
                  style={{
                    position: 'absolute',
                    left: `${poi.x * 100}%`,
                    top: `${poi.y * 100}%`,
                    transform: 'translate(-50%, -100%)',
                    fontSize: '1rem',
                    color: theme.colors.danger,
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))',
                    pointerEvents: 'none',
                    zIndex: 1
                  }}
                >
                  📍
                </div>
              ))}
            </div>
          </a>
        </section>

      </div>
    </main>
  )
}