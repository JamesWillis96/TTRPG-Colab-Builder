'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { useTheme } from '../../../contexts/ThemeContext'
import { supabase } from '../../../lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

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
  const { theme, styles } = useTheme()
  const params = useParams()
  const router = useRouter()
  const isMobile = window.innerWidth <= 500

  // Ensure params is not null
  const slug = params?.slug as string
  if (!slug || typeof slug !== 'string') {
  throw new Error('Invalid slug parameter')
  }

  const [page, setPage] = useState<WikiPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [poi, setPoi] = useState<{ id: string; title: string } | null>(null)

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
        .select('id, title')
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
        <a href="/wiki" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>← Back to Wiki</a>
      </div>
    )
  }

  return (
    <main style={{ ...styles.container, padding: '1rem' }}>
      {/* Back Link and Go to Map */}
      <div
        style={{
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap', // Ensure proper wrapping on smaller screens
        }}
      >
        <a
          href="/wiki"
          style={{
            color: theme.colors.primary,
            textDecoration: 'none',
            fontWeight: 'bold',
            marginBottom: '1rem', // Add spacing for mobile
          }}
        >
          ← Back to Wiki
        </a>
        {poi && (
          <a
            href={`/map?poi=${poi.id}`}
            style={{
              color: theme.colors.primary,
              textDecoration: 'none',
              fontWeight: 'bold',
              marginBottom: '1rem', // Add spacing for mobile
            }}
            title={`Go to map location: ${poi.title}`}
          >
            Go to Map →
          </a>
        )}
      </div>

{/* Page Header */}
<div
  style={{
    display: 'grid',
    gridTemplateAreas: `
      "title edit"
      "info delete"
    `,
    gridTemplateColumns: '1fr auto', // Left column takes most space, right column auto-sizes
    gap: '1rem',
    background: theme.colors.background.secondary,
    border: `1px solid ${theme.colors.border.primary}`,
    borderRadius: theme.borderRadius,
    padding: '1rem',
    marginBottom: '1rem',
  }}
>
  {/* Title (Top Left) */}
  <div style={{ gridArea: 'title', display: 'flex', alignItems: 'center', gap: '1rem' }}>
    <span style={{ fontSize: '1.75rem' }}>{getCategoryIcon(page.category)}</span>
    <h1
      style={{
        ...styles.heading1,
        color: theme.colors.primary,
        fontSize: '1.5rem', // Adjust font size for mobile
      }}
    >
      {page.title}
    </h1>
  </div>

  {/* Info (Bottom Left) */}
  <div
    style={{
      gridArea: 'info',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
      fontSize: '0.875rem',
      color: theme.colors.text.secondary,
    }}
  >
    <span
      style={{
        padding: '0rem 0.75rem 0.25rem 0.75rem',
        background: getCategoryColor(page.category) + '20',
        color: getCategoryColor(page.category),
        fontWeight: 'bold',
        textTransform: 'capitalize',
        borderRadius: theme.borderRadius,
      }}
    >
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

  {/* Edit Button (Top Right) */}
  {isAuthorized && (
    <a
      href={`/wiki/${page.slug}/edit`}
      style={{
        gridArea: 'edit',
        padding: '0.5rem 0.5rem',
        background: theme.colors.primary,
        color: theme.colors.text.primary,
        textDecoration: 'none',
        fontWeight: 'bold',
        borderRadius: theme.borderRadius,
        border: `1px solid ${theme.colors.primary}`,
        transition: 'background-color 0.2s',
        textAlign: 'center',
        width: '5rem', // Ensure the button only takes up as much space as its content
        height: '2.5rem',
        marginTop: '0.5rem', // Move the button down slightly
        justifySelf: 'end', // Align the button to the right within the grid cell
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = theme.colors.text.primary
        e.currentTarget.style.color = theme.colors.primary
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = theme.colors.primary
        e.currentTarget.style.color = theme.colors.text.primary
      }}
    >
      Edit
    </a>
  )}

  {/* Delete Button (Bottom Right) */}
  {isAuthorized && (
    <button
      onClick={handleDelete}
      style={{
        gridArea: 'delete',
        padding: '0.5rem 1rem',
        background: theme.colors.danger,
        color: theme.colors.text.primary,
        fontWeight: 'bold',
        borderRadius: theme.borderRadius,
        border: `1px solid ${theme.colors.danger}`,
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        textAlign: 'center',
        width: '5rem', // Ensure the button only takes up as much space as its content
        height: '2.5rem',
        alignSelf: 'top', // Vertically align the button within the grid cell
      justifySelf: 'end', // Horizontally align the button to the right
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = theme.colors.text.primary
        e.currentTarget.style.color = theme.colors.danger
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = theme.colors.danger
        e.currentTarget.style.color = theme.colors.text.primary
      }}
    >
      Delete
    </button>
  )}
</div>
      



      {/* Page Content */}
      <div
        style={{
          ...styles.preview,
          background: theme.colors.background.main,
          color: theme.colors.text.primary,
          borderRadius: theme.borderRadius,
          border: `1px solid ${theme.colors.border.primary}`,
          padding: '1rem',
          fontSize: '1rem', // Adjust font size for readability on mobile
        }}
      >
        <div className="markdown-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{page.content}</ReactMarkdown>
        </div>
      </div>
    </main>
  )
}