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
  updated_at: string
  profile?: {
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
  const [poi, setPoi] = useState(null)

  useEffect(() => {
    if (slug) {
      loadPage()
    }
  }, [slug, user])

  useEffect(() => {
    if (page?.id) {
      // Fetch POI for this wiki page
      supabase
        .from('map_pois')
        .select('*')
        .eq('wiki_page_id', page.id)
        .single()
        .then(({ data }) => {
          if (data) setPoi(data)
        })
    }
  }, [page?.id])

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
          .from('profiles')
          .select('*')
          .eq('id', data.author_id)
          .single()

        const pageData = {
          ...data,
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
    } catch (error: any) {
      console.error('Error loading wiki page:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this page? This cannot be undone.')) return

    try {
      const { error } = await supabase
        .from('wiki_pages')
        .delete()
        .eq('id', page?.id)

      if (error) throw error

      router.push('/wiki')
    } catch (error: any) {
      alert('Error deleting page: ' + error.message)
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      npc: theme.colors.secondary,
      location: theme.colors.secondary,
      lore: theme.colors.secondary,
      item: theme.colors.secondary,
      faction: theme.colors.secondary,
      'player character': theme.colors.secondary,
      general: theme.colors.secondary
    }
    return colors[category] || theme.colors.secondary
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      npc: '👤',
      location: '📍',
      lore: '📜',
      item: '⚔️',
      faction: '🛡️',
      'player character': '🎭'  // Changed from general to player character
    }
    return icons[category] || '📄'
  }

  if (loading) {
    return <div style={{ ...styles.container, textAlign: 'center', color: theme.colors.text.secondary }}>Loading... </div>
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
      {/* Back Link and Go to Map */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/wiki" style={{ color: theme.colors.primary, textDecoration: 'none' }}>
          ← Back to Wiki
        </a>
        {poi && (
          <a 
            href={`/map?poi=${poi.id}`} 
            style={{ color: theme.colors.primary, textDecoration: 'none' }}
            title={`Go to map location: ${poi.title}`}
          >
            Go to Map →
          </a>
        )}
      </div>

      {/* Page Header */}
      <div style={{
        background: theme.colors.background.secondary,
        border: `1px solid ${theme.colors.border.primary}`,
        borderRadius: theme.borderRadius,
        padding: '0.5rem',
        paddingLeft: '1rem',
        marginBottom: '.5rem',
        position: 'relative', // For button positioning
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0rem' }}>
              <span style={{ fontSize: '1.75rem' }}>
                {getCategoryIcon(page.category)}
              </span>
              <h1 style={{...styles.heading1, marginTop: '2rem', color: theme.colors.primary}}>
                {page.title}
              </h1>
            </div>

            <div style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
              fontSize: '0.875rem',
              color: theme.colors.text.secondary,
              flexWrap: 'wrap'
            }}>
              <span style={{
                padding: '0.25rem 0.75rem',
                background: getCategoryColor(page.category) + '20',
                color: getCategoryColor(page.category),
                fontWeight: 'bold',
                textTransform: 'capitalize',
                borderRadius: theme.borderRadius
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

              {page.created_at !== page.updated_at && (
                <>
                  <span style={{ color: theme.colors.text.secondary }}>•</span>
                  <span>
                    <strong>Updated: </strong> {new Date(page.updated_at).toLocaleDateString()}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          {isAuthorized && (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between', 
              marginTop: '0.25rem',
              marginBottom: '0rem',
              marginRight: '.75rem',
              gap: '0.75rem' }}>
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
        ...styles.preview,
        background: '#f9f7f3',
        color: '#222',
        borderRadius: '6px',
        border: '1px solid #ddd',
        padding: '1.5rem',
        paddingTop: '1rem',
        minHeight: '400px',
      }}>
        <div className="markdown-content">
          <style>{`
            .markdown-content h3 {
              background: linear-gradient(90deg, #7c4a03 0%, #3e2a13 80%, #111 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              text-fill-color: transparent;
              font-weight: 700;
            }
            .markdown-content h1 {
              color: ${theme.colors.primary};
              font-weight: 700;
              letter-spacing: 0.5px;
            }
            .markdown-content strong {
              color: ${theme.colors.primary};  /* Bold text color */
              font-weight: 700;
            }
            .markdown-content strong em, em strong {
              color: ${theme.colors.secondary} !important;  /* Bold italic text color (different) */
            }
            .markdown-content hr {
              border: none;
              border-top: 2px solid #e0c9a6;
              margin: 1.5rem 0;
            }
            .markdown-content code {
              background: #f4efe6;
              color: #7c4a03;
              border-radius: 4px;
              padding: 2px 6px;
              font-size: 0.98em;
            }
            .markdown-content pre code {
              background: #f4efe6;
              color: #7c4a03;
              border-radius: 6px;
              padding: 1em;
              display: block;
              font-size: 1em;
            }
            .markdown-content ul, .markdown-content ol {
              margin-left: 1.5em;
            }
            .markdown-content blockquote {
              border-left: 4px solid #e0c9a6;
              background: #f9f7f3;
              color: #7c4a03;
              margin: 1em 0;
              padding: 0.5em 1em;
              font-style: italic;
            }
          `}</style>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{page.content}</ReactMarkdown>
        </div>
      </div>
    </main>
  )
}