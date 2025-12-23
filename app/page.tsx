'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import { styles, theme } from '../lib/theme'

type WikiPage = {
  id: string
  title: string
  slug: string
  category: string
  updated_at: string
  profiles?:  {
    username: string
  }
}

type POI = {
  id: string
  x: number  // Stored as ratio (0-1) of map width
  y: number  // Stored as ratio (0-1) of map height
  title: string
  wiki_page_id?:  string
  created_by?:  string
}

type Profile = {
  username: string
  role: string
}

export default function DashboardPage() {
  const { user, loading:  authLoading } = useAuth()
  const router = useRouter()

  // Map scaling configuration
  const MAP_SCALE = 1.5
  const BASE_PADDING_VERTICAL = 1 // rem
  const BASE_PADDING_HORIZONTAL = BASE_PADDING_VERTICAL * 1.294 // rem
  
  // Calculate scaled padding
  const scaledPaddingVertical = BASE_PADDING_VERTICAL * MAP_SCALE * 4
  const scaledPaddingHorizontal = BASE_PADDING_HORIZONTAL * MAP_SCALE * 4

  const [profile, setProfile] = useState<Profile | null>(null)
  const [recentWikiPages, setRecentWikiPages] = useState<WikiPage[]>([])
  const [loading, setLoading] = useState(true)
  const [layoutMode, setLayoutMode] = useState<'long' | 'wide'>('long')
  const [mapPois, setMapPois] = useState<POI[]>([])

  // Auto-detect layout based on screen width
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      // Switch to wide layout on screens wider than 1200px
      setLayoutMode(width >= 1200 ? 'wide' : 'long')
    }

    // Check on mount
    checkScreenSize()

    // Listen for resize events
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  useEffect(() => {
    if (! authLoading) {
      if (! user) {
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
      // Load user profile
      const { data: profileData } = await supabase
        . from('profiles')
        .select('username, role')
        .eq('id', user.id)
        .single()

      setProfile(profileData)

      // Load recent wiki pages
      const { data: wikiData } = await supabase
        .from('wiki_pages')
        .select('id, title, slug, category, updated_at')
        .order('updated_at', { ascending:  false })
        .limit(5)

      // Get authors for wiki pages
      if (wikiData && wikiData.length > 0) {
        const authorIds = wikiData.map((p: any) => p.author_id).filter(Boolean)
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', authorIds)

        const pagesWithProfiles = wikiData.map((page: any) => ({
          ... page,
          profiles: profilesData?. find((p: any) => p.id === page.author_id)
        }))

        setRecentWikiPages(pagesWithProfiles)
      } else {
        setRecentWikiPages(wikiData || [])
      }

      // Load map POIs
      const { data: poisData } = await supabase
        .from('map_pois')
        .select('*')
        .order('created_at', { ascending: true })

      setMapPois(poisData || [])

    } catch (error:  any) {
      console.error('Error loading dashboard:', error. message)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    const icons:  Record<string, string> = {
      npc: '👤',
      location: '📍',
      lore: '📜',
      item: '⚔️',
      faction: '🛡️',
      general: '📄'
    }
    return icons[category] || '📄'
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      npc: '#4f8',
      location: '#48f',
      lore: '#f84',
      item: '#ff8',
      faction: '#f4f',
      general: '#888'
    }
    return colors[category] || '#888'
  }

  if (authLoading || loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 'calc(100vh - 80px)',
        fontSize: '1.25rem',
        color: '#888'
      }}>
        Loading...
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  return (
    <main style={{ minHeight: 'calc(100vh - 80px)' }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #F5F5DC 0%, #FAF0E6 100%)',
        borderBottom: `1px solid ${theme.colors.border.primary}`,
        padding: '3rem 2rem'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: theme.colors.text.primary }}>
            Welcome back, {profile.username}!  👋
          </h1>
          <p style={{ color: theme.colors.text.secondary, fontSize: '1.125rem' }}>
            {profile.role === 'gm' || profile.role === 'admin' 
              ? "Ready to explore the world?" 
              : "Ready for your next adventure? "}
          </p>
        </div>
      </div>

      {/* Dashboard Content */}
      {layoutMode === 'long' ? (
        <div style={styles.container}>
          {/* Quick Actions - Top Row */}
          <section style={styles.section}>
            <h2 style={{ ...styles.heading2, marginTop: '2rem' }}>⚡ Quick Actions</h2>
            <div style={{ 
              display: 'flex',
              gap: '1rem',
              flexWrap: 'nowrap',
              overflowX: 'auto',
              background: theme.colors.background.secondary,
              border: `1px solid ${theme.colors.border.primary}`,
              borderRadius: theme.borderRadius,
              padding: '2rem'
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
              <a
                href="/sessions"
                style={{
                  display: 'block',
                  background: theme.colors.background.main,
                  border:  `1px solid ${theme.colors.border.primary}`,
                  borderRadius: theme.borderRadius,
                  padding: '1.5rem',
                  textDecoration:  'none',
                  color:  'inherit',
                  transition:  'border-color 0.2s, transform 0.2s',
                  height: '100%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.primary
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.border.primary
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎲</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.25rem', color: theme.colors.text.primary }}>Browse Sessions</div>
                <div style={{ fontSize: '0.875rem', color: theme.colors.text.secondary }}>Find games to join</div>
              </a>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
              <a
                href="/wiki/create"
                style={{
                  display: 'block',
                  background: theme.colors.background.main,
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: theme.borderRadius,
                  padding: '1.5rem',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'border-color 0.2s, transform 0.2s',
                  height: '100%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget. style.borderColor = theme.colors.primary
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.border.primary
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.25rem', color: theme.colors.text.primary }}>Create Wiki Page</div>
                <div style={{ fontSize: '0.875rem', color: theme.colors.text.secondary }}>Document your world</div>
              </a>
              </div>

              {(profile.role === 'gm' || profile.role === 'admin') && (
                <div style={{ flex: 1, minWidth: 0 }}>
                <a
                  href="/sessions/create"
                  style={{
                    display: 'block',
                    background: theme.colors.background.main,
                    border: `1px solid ${theme.colors.border.primary}`,
                    borderRadius: theme.borderRadius,
                    padding: '1.5rem',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'border-color 0.2s, transform 0.2s',
                    height: '100%'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.primary
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.border.primary
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
                  <div style={{ fontSize:  '1.125rem', fontWeight: 'bold', marginBottom:  '0.25rem', color: theme.colors.text.primary }}>Create Session</div>
                  <div style={{ fontSize: '0.875rem', color: theme.colors.text.secondary }}>Schedule a new game</div>
                </a>
                </div>
              )}

              <div style={{ flex: 1, minWidth: 0 }}>
              <a
                href="/wiki"
                style={{
                  display:  'block',
                  background:  theme.colors.background.main,
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: theme.borderRadius,
                  padding: '1.5rem',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'border-color 0.2s, transform 0.2s',
                  height: '100%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style. borderColor = theme.colors.primary
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget. style.borderColor = theme.colors.border.primary
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{ fontSize:  '2rem', marginBottom: '0.5rem' }}>📚</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.25rem', color: theme.colors.text.primary }}>View Wiki</div>
                <div style={{ fontSize: '0.875rem', color: theme.colors.text.secondary }}>Browse all pages</div>
              </a>
              </div>
            </div>
          </section>

          {/* World Map - Full Width */}
          <section style={styles.section}>
            <div style={{ marginBottom: '1rem' }}>
              <h2 style={{ ...styles.heading2, marginTop: '2rem' }}>🗺️ World Map</h2>
            </div>

            <a
              href="/map"
              style={{
                display: 'block',
                textDecoration: 'none',
                color: 'inherit',
                cursor: 'pointer'
              }}
            >
              <div style={{
                background: theme.colors.background.secondary,
                border: `1px solid ${theme.colors.border.primary}`,
                borderRadius: theme.borderRadius,
                padding: `${scaledPaddingVertical}rem ${scaledPaddingHorizontal}rem`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'border-color 0.2s, transform 0.2s',
                position: 'relative',
                minHeight: '400px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = theme.colors.primary
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = theme.colors.border.primary
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
                {/* Map Image */}
                <img 
                  src="/world-map.png" 
                  alt="World Map"
                  style={{
                    width:  '100%',
                    height:  'auto',
                    borderRadius: theme.borderRadius,
                    border: `1px solid ${theme.colors.border.secondary}`,
                    transform: `scale(${MAP_SCALE})`,
                    transformOrigin: 'center center'
                  }}
                />
                {/* POI Markers */}
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

          {/* Recent Wiki Pages - Grid Below Map */}
          <section>
            <div style={{ marginBottom: '1rem' }}>
              <h2 style={{ ...styles.heading2, marginTop: '2rem' }}>📚 Recent Wiki Updates</h2>
            </div>

            {recentWikiPages.length === 0 ? (
              <div style={{
                background: theme.colors.background.secondary,
                border:  `1px solid ${theme.colors.border.primary}`,
                borderRadius: theme.borderRadius,
                padding: '2rem',
                textAlign: 'center',
                color: theme.colors.text.secondary
              }}>
                <p style={{ fontSize: '1rem' }}>No wiki pages yet.</p>
                <a href="/wiki/create" style={{ color: theme.colors.primary, marginTop: '0.5rem', display: 'inline-block', fontSize: '0.875rem' }}>
                  Create the first page
                </a>
              </div>
            ) : (
              <>
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1rem'
                }}>
                  {recentWikiPages.map(page => (
                    <a
                      key={page.id}
                      href={`/wiki/${page.slug}`}
                      style={{
                        display: 'block',
                        background: theme.colors.background.main,
                        border: `1px solid ${theme.colors.border.primary}`,
                        borderRadius: theme.borderRadius,
                        padding: '1rem',
                        textDecoration: 'none',
                        color: 'inherit',
                        transition: 'border-color 0.2s, transform 0.2s',
                        height: '100%'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = getCategoryColor(page.category)
                        e.currentTarget.style.transform = 'translateY(-2px)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = theme.colors.border.primary
                        e.currentTarget.style.transform = 'translateY(0)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '1.75rem' }}>
                          {getCategoryIcon(page.category)}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            display: 'inline-block',
                            padding: '0.2rem 0.4rem',
                            background: getCategoryColor(page.category) + '20',
                            color: getCategoryColor(page.category),
                            borderRadius: theme.borderRadius,
                            fontSize: '0.6rem',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            marginBottom: '0.25rem'
                          }}>
                            {page.category}
                          </div>
                          <h3 style={{ 
                            fontSize: '1rem', 
                            marginBottom: '0.25rem',
                            fontWeight: 'bold',
                            color: theme.colors.text.primary,
                            lineHeight: '1.3'
                          }}>
                            {page.title}
                          </h3>
                          <div style={{ fontSize: '0.7rem', color: theme.colors.text.secondary }}>
                            Updated {new Date(page.updated_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <a 
                    href="/wiki"
                    style={styles.button.secondary}
                  >
                    View All
                  </a>
                </div>
              </>
            )}
          </section>
        </div>
      ) : (
        /* Wide Layout */
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 2rem',
          display: 'grid',
          gridTemplateColumns: '250px 2fr 300px',
          gap: '2rem',
          alignItems: 'start'
        }}>
          {/* Quick Actions - Left Column */}
          <section>
            <h2 style={{ ...styles.heading2, marginTop: '2rem' }}>⚡ Quick Actions</h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <a
                href="/sessions"
                style={{
                  display: 'block',
                  background: theme.colors.background.main,
                  border:  `1px solid ${theme.colors.border.primary}`,
                  borderRadius: theme.borderRadius,
                  padding: '1.5rem',
                  textDecoration:  'none',
                  color:  'inherit',
                  transition:  'border-color 0.2s, transform 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.primary
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.border.primary
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🎲</div>
                <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.25rem', color: theme.colors.text.primary }}>Browse Sessions</div>
                <div style={{ fontSize: '0.75rem', color: theme.colors.text.secondary }}>Find games to join</div>
              </a>

              <a
                href="/wiki/create"
                style={{
                  display: 'block',
                  background: theme.colors.background.main,
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: theme.borderRadius,
                  padding: '1.5rem',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'border-color 0.2s, transform 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget. style.borderColor = theme.colors.primary
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.border.primary
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📝</div>
                <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.25rem', color: theme.colors.text.primary }}>Create Wiki Page</div>
                <div style={{ fontSize: '0.75rem', color: theme.colors.text.secondary }}>Document your world</div>
              </a>

              {(profile.role === 'gm' || profile.role === 'admin') && (
                <a
                  href="/sessions/create"
                  style={{
                    display: 'block',
                    background: theme.colors.background.main,
                    border: `1px solid ${theme.colors.border.primary}`,
                    borderRadius: theme.borderRadius,
                    padding: '1.5rem',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'border-color 0.2s, transform 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.primary
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.border.primary
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🎯</div>
                  <div style={{ fontSize:  '1rem', fontWeight: 'bold', marginBottom:  '0.25rem', color: theme.colors.text.primary }}>Create Session</div>
                  <div style={{ fontSize: '0.75rem', color: theme.colors.text.secondary }}>Schedule a new game</div>
                </a>
              )}

              <a
                href="/wiki"
                style={{
                  display:  'block',
                  background:  theme.colors.background.main,
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: theme.borderRadius,
                  padding: '1.5rem',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'border-color 0.2s, transform 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style. borderColor = theme.colors.primary
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget. style.borderColor = theme.colors.border.primary
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{ fontSize:  '1.5rem', marginBottom: '0.5rem' }}>📚</div>
                <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.25rem', color: theme.colors.text.primary }}>View Wiki</div>
                <div style={{ fontSize: '0.75rem', color: theme.colors.text.secondary }}>Browse all pages</div>
              </a>
            </div>
          </section>

          {/* World Map - Middle Column */}
          <section>
            <div style={{ marginBottom: '1rem' }}>
              <h2 style={{ ...styles.heading2, marginTop: '2rem' }}>🗺️ World Map</h2>
            </div>

            <a
              href="/map"
              style={{
                display: 'block',
                textDecoration: 'none',
                color: 'inherit',
                cursor: 'pointer'
              }}
            >
              <div style={{
                background: theme.colors.background.secondary,
                border: `1px solid ${theme.colors.border.primary}`,
                borderRadius: theme.borderRadius,
                padding: `${scaledPaddingVertical}rem ${scaledPaddingHorizontal}rem`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'border-color 0.2s, transform 0.2s',
                position: 'relative',
                minHeight: '400px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = theme.colors.primary
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = theme.colors.border.primary
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
                {/* Map Image */}
                <img 
                  src="/world-map.png" 
                  alt="World Map"
                  style={{
                    width:  '100%',
                    height:  'auto',
                    borderRadius: theme.borderRadius,
                    border: `1px solid ${theme.colors.border.secondary}`,
                    transform: `scale(${MAP_SCALE})`,
                    transformOrigin: 'center center'
                  }}
                />
                {/* POI Markers */}
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

          {/* Recent Wiki Pages - Right Column */}
          <section>
            <div style={{ marginBottom: '1rem' }}>
              <h2 style={{ ...styles.heading2, marginTop: '2rem' }}>📚 Recent Wiki Updates</h2>
            </div>

            {recentWikiPages.length === 0 ? (
              <div style={{
                background: theme.colors.background.secondary,
                border:  `1px solid ${theme.colors.border.primary}`,
                borderRadius: theme.borderRadius,
                padding: '1.5rem',
                textAlign: 'center',
                color: theme.colors.text.secondary
              }}>
                <p style={{ fontSize: '0.875rem' }}>No wiki pages yet.</p>
                <a href="/wiki/create" style={{ color: theme.colors.primary, marginTop: '0.5rem', display: 'inline-block', fontSize: '0.75rem' }}>
                  Create the first page
                </a>
              </div>
            ) : (
              <>
                <div style={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  marginBottom: '1rem'
                }}>
                  {recentWikiPages.map(page => (
                    <a
                      key={page.id}
                      href={`/wiki/${page.slug}`}
                      style={{
                        display: 'block',
                        background: theme.colors.background.main,
                        border: `1px solid ${theme.colors.border.primary}`,
                        borderRadius: theme.borderRadius,
                        padding: '1rem',
                        textDecoration: 'none',
                        color: 'inherit',
                        transition: 'border-color 0.2s, transform 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = getCategoryColor(page.category)
                        e.currentTarget.style.transform = 'translateY(-2px)'
                      }}
                      onMouseLeave={(e) => {
                        e. currentTarget.style.borderColor = theme.colors.border.primary
                        e. currentTarget.style.transform = 'translateY(0)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>
                          {getCategoryIcon(page.category)}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            display: 'inline-block',
                            padding: '0.2rem 0.4rem',
                            background: getCategoryColor(page.category) + '20',
                            color: getCategoryColor(page.category),
                            borderRadius: theme.borderRadius,
                            fontSize: '0.6rem',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            marginBottom: '0.25rem'
                          }}>
                            {page.category}
                          </div>
                          <h4 style={{ 
                            fontSize: '0.9rem', 
                            marginBottom: '0.25rem',
                            fontWeight: 'bold',
                            color: theme.colors.text.primary,
                            lineHeight: '1.3'
                          }}>
                            {page.title}
                          </h4>
                          <div style={{ fontSize: '0.7rem', color: theme.colors.text.secondary }}>
                            Updated {new Date(page.updated_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <a 
                    href="/wiki"
                    style={styles.button.secondary}
                  >
                    View All
                  </a>
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  )
}