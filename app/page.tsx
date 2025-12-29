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

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [recentWikiPages, setRecentWikiPages] = useState<WikiPage[]>([])
  const [loading, setLoading] = useState(true)
  const [mapPois, setMapPois] = useState<POI[]>([])

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
      const { data: profileData } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single()
      setProfile(profileData)

      const { data: wikiData } = await supabase
        .from('wiki_pages')
        .select('id, title, slug, category, updated_at')
        .order('updated_at', { ascending: false })
        .limit(6)  // Changed from 5 to 4
      setRecentWikiPages(wikiData || [])

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
        color: '#888'
      }}>
        Loading...
      </div>
    )
  }

  if (!user || !profile) return null

   return (
    <main style={{ minHeight: 'calc(100vh - 80px)', overflow: 'visible'  }}>
      {/* Username Link - Top Right */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        zIndex: 10
      }}>
        <a
          href="/profile"
          style={{
            color: theme.colors.text.secondary,
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: 'bold',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = theme.colors.primary
            e.currentTarget.style.textDecoration = 'underline'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = theme.colors.text.secondary
            e.currentTarget.style.textDecoration = 'none'
          }}
        >
          {profile.username}
        </a>
      </div>
{/* Dashboard Content */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 2rem',
        display: 'grid',
        gridTemplateColumns: '2fr 300px',  // Changed to two columns: map on the left (2fr), wiki on the right (300px)
        gap: '3rem',
        alignItems: 'start'
      }}>
        {/* World Map - Left Column */}
        <section>
          <h2 style={{ ...styles.heading2, marginTop: '2.5rem'}}>🗺️ World Map</h2>
          <a
            href="/map"
            style={{
              display: 'block',
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            <div style={{
              background: 'transparent',
              border: 'none',
              borderRadius: theme.borderRadius,
              marginTop: '0.5rem',  // Reduced from 0.75rem to 0.5rem to move the map up by 0.25rem
              padding: '.75rem',
              paddingTop: '.55rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'border-color 0.2s, transform 0.2s',
              position: 'relative',
              minHeight: '400px',
              overflow: 'visible'
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

        {/* Recent Wiki Pages - Right Column */}
        <section>
          <h2 style={{ ...styles.heading2, marginTop: '2.5rem', marginBottom: '1.5rem' }}>📚 Recent Wiki Updates</h2>
          {recentWikiPages.length === 0 ? (
            <div style={{
              background: theme.colors.background.secondary,
              border: `1px solid ${theme.colors.border.primary}`,
              borderRadius: theme.borderRadius,
              padding: '1rem',
              marginBottom: '1rem',
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
                gap: '.75rem',
                marginBottom: '2rem'
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
                      padding: '0.5rem',
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
                    <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.25rem', marginTop: '1rem' }}>
                        {getCategoryIcon(page.category)}
                      </span>
                      <div>
                        <div style={{
                          display: 'inline-block',
                          padding: '0.2rem 0.4rem',
                          background: theme.colors.background.secondary,
                          color: theme.colors.text.secondary,
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
                          color: theme.colors.text.primary
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
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <a href="/wiki" style={styles.button.secondary}>
                  View All
                </a>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  )
}