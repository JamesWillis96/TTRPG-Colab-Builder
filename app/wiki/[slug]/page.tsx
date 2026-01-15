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
  state?: 'draft' | 'pending_review' | 'published'
  profile?: {
    username: string
  }
  deleted_at?: string | null
  deleted_by?: string | null
}

export default function WikiPageView() {
  const { user } = useAuth()
  const { theme, styles } = useTheme()
  const params = useParams()
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 500)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Ensure params is not null
  const slug = params?.slug as string
  if (!slug || typeof slug !== 'string') {
  throw new Error('Invalid slug parameter')
  }

  const [page, setPage] = useState<WikiPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [poi, setPoi] = useState<{ id: string; title: string } | null>(null)
  const [attachments, setAttachments] = useState<Array<{ name: string; url: string; type: string }>>([])
  const [revisions, setRevisions] = useState<Array<any>>([])
  const [rollingBack, setRollingBack] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const isDeleted = !!page?.deleted_at
  const canViewDeleted = isAuthorized

  useEffect(() => {
    if (slug) {
      loadPage()
    }
  }, [slug, user])

  const fetchAttachments = async (pageId: string) => {
    const bucket = supabase.storage.from('wiki_uploads')
    const { data: files, error } = await bucket.list(pageId, { limit: 50 })
    if (!error && files) {
      const withUrls = await Promise.all(files.map(async (file) => {
        const { data: signed } = await bucket.createSignedUrl(`${pageId}/${file.name}`, 60 * 60)
        return { name: file.name, url: signed?.signedUrl || '', type: (file as any).metadata?.mimetype || '' }
      }))
      setAttachments(withUrls)
    } else {
      setAttachments([])
    }
  }

  const fetchRevisions = async (pageId: string) => {
    const { data: revs } = await supabase
      .from('wiki_revisions')
      .select('*')
      .eq('wiki_page_id', pageId)
      .order('created_at', { ascending: false })
      .limit(20)
    if (revs) setRevisions(revs)
  }

  useEffect(() => {
    if (page?.id) {
      supabase
        .from('map_pois')
        .select('id, title')
        .is('deleted_at', null)
        .eq('wiki_page_id', page.id)
        .single()
        .then(({ data }) => {
          if (data) setPoi(data)
        })

      fetchAttachments(page.id)
      fetchRevisions(page.id)
    }
  }, [page?.id, page?.updated_at])

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
    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('wiki_pages')
        .update({ deleted_at: new Date().toISOString(), deleted_by: user?.id || null })
        .eq('id', page?.id)

      if (error) throw error

      router.push('/wiki')
    } catch (error: any) {
      alert('Error deleting page: ' + error.message)
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleRollback = async (revision: any) => {
    if (!page?.id) return
    if (!confirm('Restore this revision? Current content will be replaced.')) return
    setRollingBack(true)
    try {
      const { error } = await supabase
        .from('wiki_pages')
        .update({
          title: revision.title,
          slug: revision.slug,
          content: revision.content,
          category: revision.category,
          state: revision.state,
          updated_at: new Date().toISOString()
        })
        .eq('id', page.id)

      if (error) throw error
      await loadPage()
    } catch (err: any) {
      alert('Failed to restore revision: ' + err.message)
    } finally {
      setRollingBack(false)
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

  if (isDeleted && !canViewDeleted) {
    return (
      <main style={{ ...styles.container, padding: '1rem' }}>
        <a href="/wiki" style={{ color: theme.colors.primary, textDecoration: 'none', fontWeight: 'bold', marginBottom: '1rem', display: 'inline-block' }}>
          ← Back to Wiki
        </a>
        <h1 style={styles.heading1}>{page.title}</h1>
        <p style={{ color: theme.colors.text.secondary }}>
          This page is in the recycle bin. Only admins or the author can view or restore it.
        </p>
      </main>
    )
  }

  return (
    <main style={{ ...styles.container, padding: '1rem' }}>
      {isDeleted && (
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          border: `1px solid ${theme.colors.border.primary}`,
          background: theme.colors.background.secondary,
          color: theme.colors.text.secondary,
          marginBottom: '1rem'
        }}>
          This page is in the recycle bin. Restore it from the Recycle Bin to make it visible to others.
        </div>
      )}
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

    <span
      style={{
        padding: '0rem 0.75rem 0.25rem 0.75rem',
        background:
          page.state === 'draft'
            ? `${theme.colors.primary}20`
            : page.state === 'pending_review'
              ? `${theme.colors.secondary}20`
              : `${theme.colors.success}20`,
        color:
          page.state === 'draft'
            ? theme.colors.primary
            : page.state === 'pending_review'
              ? theme.colors.secondary
              : theme.colors.success,
        fontWeight: 'bold',
        borderRadius: theme.borderRadius,
        textTransform: 'capitalize'
      }}
    >
      {page.state || 'draft'}
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
      onClick={() => setShowDeleteConfirm(true)}
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
        width: '5rem',
        height: '2.5rem',
        alignSelf: 'top',
        justifySelf: 'end',
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

      {/* Attachments */}
      {attachments.length > 0 && (
        <div style={{ marginTop: '1.5rem', border: `1px solid ${theme.colors.border.primary}`, borderRadius: theme.borderRadius, padding: '1rem' }}>
          <div style={{ fontWeight: 700, marginBottom: '0.75rem', color: theme.colors.text.primary }}>Attachments</div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
            {attachments.map(file => (
              <a
                key={file.name}
                href={file.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: 8,
                  padding: '8px',
                  textDecoration: 'none',
                  color: theme.colors.text.primary,
                  backgroundColor: theme.colors.background.secondary,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                {file.type.startsWith('image') ? (
                  <img src={file.url} alt={file.name} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: 6 }} />
                ) : (
                  <div style={{
                    height: '140px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 6,
                    border: `1px dashed ${theme.colors.border.primary}`,
                    color: theme.colors.text.secondary,
                    fontSize: '12px'
                  }}>
                    {file.type || 'File'}
                  </div>
                )}
                <div style={{ fontSize: '12px', fontWeight: 600 }}>{file.name}</div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Revisions */}
      {revisions.length > 0 && (
        <div style={{ marginTop: '1.5rem', border: `1px solid ${theme.colors.border.primary}`, borderRadius: theme.borderRadius, padding: '1rem' }}>
          <div style={{ fontWeight: 700, marginBottom: '0.75rem', color: theme.colors.text.primary }}>Revision history</div>
          <div style={{ display: 'grid', gap: '8px' }}>
            {revisions.map((rev, idx) => (
              <div key={rev.id || idx} style={{
                border: `1px solid ${theme.colors.border.primary}`,
                borderRadius: 8,
                padding: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div>
                  <div style={{ fontWeight: 700, color: theme.colors.text.primary }}>{rev.title || 'Untitled revision'}</div>
                  <div style={{ fontSize: '12px', color: theme.colors.text.secondary }}>
                    {new Date(rev.created_at).toLocaleString()} · {rev.category} · {rev.state || 'draft'}
                  </div>
                </div>
                {isAuthorized && (
                  <button
                    onClick={() => handleRollback(rev)}
                    disabled={rollingBack}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 6,
                      border: `1px solid ${theme.colors.primary}`,
                      backgroundColor: `${theme.colors.primary}15`,
                      color: theme.colors.primary,
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 700
                    }}
                  >
                    {rollingBack ? 'Restoring...' : 'Restore'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 99,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={() => !isDeleting && setShowDeleteConfirm(false)}
          />
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: theme.colors.background.secondary,
              border: `2px solid ${theme.colors.danger}`,
              borderRadius: theme.borderRadius,
              padding: '2rem',
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              zIndex: 100
            }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ color: theme.colors.danger, margin: '0 0 1rem 0', fontSize: '1.5rem' }}>
              🗑️ Delete Page?
            </h2>
            <p style={{ color: theme.colors.text.primary, margin: '0 0 1.5rem 0', lineHeight: 1.6 }}>
              Are you sure you want to delete <strong>{page?.title}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: theme.colors.background.tertiary,
                  color: theme.colors.text.primary,
                  border: `1px solid ${theme.colors.border.secondary}`,
                  borderRadius: theme.borderRadius,
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  opacity: isDeleting ? 0.5 : 1
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: theme.colors.danger,
                  color: theme.colors.text.primary,
                  border: `1px solid ${theme.colors.danger}`,
                  borderRadius: theme.borderRadius,
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  opacity: isDeleting ? 0.7 : 1
                }}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  )
}