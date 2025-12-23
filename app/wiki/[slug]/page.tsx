'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { supabase } from '../../../lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { theme, styles } from '../../../lib/theme'

type WikiPage = {
  id: string
  title: string
  slug: string
  content: string
  category: string
  author_id: string
  created_at: string
  updated_at:  string
  profile?:  {
    username: string
  }
}

export default function WikiPageView() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [page, setPage] = useState<WikiPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (slug) {
      loadPage()
    }
  }, [slug, user])

  const loadPage = async () => {
    setLoading(true)
    
    try {
      const { data, error } = await supabase
        .from('wiki_pages')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error) throw error

      // Get the author profile
      if (data) {
        const { data: profileData } = await supabase
          . from('profiles')
          .select('*')
          .eq('id', data.author_id)
          .single()

        const pageData = {
          ... data,
          profile: profileData
        }

        setPage(pageData)

        // Check if user is author or admin
        if (user) {
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

          const isAuthor = user.id === data.author_id
          const isAdmin = userProfile?.role === 'admin'
          
          setIsAuthorized(isAuthor || isAdmin)
        } else {
          setIsAuthorized(false)
        }
      }
    } catch (error:  any) {
      console.error('Error loading wiki page:', error. message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (! confirm('Are you sure you want to delete this page?  This cannot be undone.')) return

    try {
      const { error } = await supabase
        .from('wiki_pages')
        .delete()
        .eq('id', page?.id)

      if (error) throw error

      router.push('/wiki')
    } catch (error: any) {
      alert('Error deleting page: ' + error. message)
    }
  }

  const getCategoryColor = (category: string) => {
    const colors:  Record<string, string> = {
      npc: theme.colors.primary, // Blood red for NPCs
      location: theme.colors.secondary, // Forest green for locations
      lore: '#6B5B47', // Tertiary brown for lore
      item: '#857564', // Muted for items
      faction: '#4A3F35', // Secondary text for factions
      general: theme.colors.text.secondary
    }
    return colors[category] || theme.colors.text.secondary
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      npc: '👤',
      location: '📍',
      lore: '📜',
      item: '⚔️',
      faction:  '🛡️',
      general: '📄'
    }
    return icons[category] || '📄'
  }

  if (loading) {
    return <div style={{ ...styles.container, textAlign:  'center', color: theme.colors.text.secondary }}>Loading... </div>
  }

  if (!page) {
    return (
      <div style={styles.container}>
        <h1 style={styles.heading1}>Page Not Found</h1>
        <p style={{ color: theme.colors.text.secondary, marginBottom: '2rem' }}>
          The wiki page you're looking for doesn't exist.
        </p>
        <a href="/wiki" style={{ color: theme.colors.primary }}>← Back to Wiki</a>
      </div>
    )
  }

  return (
    <main style={styles.container}>
      {/* Back Link */}
      <div style={{ marginBottom: '2rem' }}>
        <a href="/wiki" style={{ color: theme.colors.primary, textDecoration: 'none' }}>
          ← Back to Wiki
        </a>
      </div>

      {/* Page Header */}
      <div style={{
        background: theme.colors.background.secondary,
        border: `1px solid ${theme.colors.border.primary}`,
        borderRadius: theme.borderRadius,
        padding: '2rem',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems:  'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '2rem' }}>
                {getCategoryIcon(page.category)}
              </span>
              <h1 style={styles.heading1}>
                {page.title}
              </h1>
            </div>

            <div style={{
              display:  'flex',
              gap:  '1rem',
              alignItems: 'center',
              fontSize: '0.875rem',
              color: theme.colors.text.secondary,
              flexWrap:  'wrap'
            }}>
              <span style={{
                padding: '0.25rem 0.75rem',
                background: getCategoryColor(page.category) + '20',
                color: getCategoryColor(page.category),
                fontWeight: 'bold',
                textTransform:  'capitalize',
                borderRadius: '4px'
              }}>
                {page.category}
              </span>

              <span style={{ color: theme.colors.text.secondary }}>•</span>

              <span>
                <strong>By: </strong> {page.profile?.username || 'Unknown'}
              </span>

              <span style={{ color: theme.colors.text.secondary }}>•</span>

              <span>
                <strong>Created:</strong> {new Date(page.created_at).toLocaleDateString()}
              </span>

              {page.created_at !== page. updated_at && (
                <>
                  <span style={{ color: theme.colors.text.secondary }}>•</span>
                  <span>
                    <strong>Updated: </strong> {new Date(page. updated_at).toLocaleDateString()}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          {isAuthorized && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => router.push(`/wiki/${slug}/edit`)}
                style={styles.buttonPrimary}
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                style={styles.buttonDanger}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Page Content */}
      <div style={{
        background: theme.colors.background.secondary,
        border: `1px solid ${theme.colors.border.primary}`,
        borderRadius: theme.borderRadius,
        padding: '2rem'
      }}>
        <div className="markdown-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {page.content}
          </ReactMarkdown>
        </div>
      </div>
    </main>
  )
}