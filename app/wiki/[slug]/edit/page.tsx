'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../../../../contexts/AuthContext'
import { supabase } from '../../../../lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { theme, styles } from '../../../../lib/theme'

type WikiPage = {
  id: string
  title: string
  slug: string
  content: string
  category: string
  author_id: string
  created_at: string
  updated_at: string
}

export default function EditWikiPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [page, setPage] = useState<WikiPage | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('general')
  const [showPreview, setShowPreview] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [isAuthorized, setIsAuthorized] = useState(false)

  const categories = ['npc', 'location', 'lore', 'item', 'faction', 'general']

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

      setPage(data)
      setTitle(data.title)
      setContent(data. content)
      setCategory(data.category)

      // Check if user is authorized (author or admin)
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        const isAuthor = user.id === data.author_id
        const isAdmin = profile?.role === 'admin'
        
        setIsAuthorized(isAuthor || isAdmin)
      }
    } catch (error:  any) {
      console.error('Error loading wiki page:', error. message)
      setError('Failed to load page')
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !page) return

    setSaving(true)
    setError('')

    try {
      const newSlug = generateSlug(title)
      
      // If title changed, check if new slug already exists
      if (newSlug !== page.slug) {
        const { data: existing } = await supabase
          .from('wiki_pages')
          .select('id')
          .eq('slug', newSlug)
          .single()

        if (existing) {
          setError('A page with this title already exists.  Please choose a different title.')
          setSaving(false)
          return
        }
      }

      const { error:  updateError } = await supabase
        .from('wiki_pages')
        .update({
          title,
          slug: newSlug,
          content,
          category,
          updated_at: new Date().toISOString()
        })
        .eq('id', page.id)

      if (updateError) throw updateError

      // Redirect to the (possibly new) slug
      router.push(`/wiki/${newSlug}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div style={{ ...styles.container, textAlign: 'center', color: theme.colors.text.secondary }}>Loading...</div>
  }

  if (! page) {
    return (
      <div style={styles.container}>
        <h1 style={styles.heading1}>Page Not Found</h1>
        <p style={{ color: theme.colors.text.secondary, marginBottom: '2rem' }}>
          The wiki page you're trying to edit doesn't exist.
        </p>
        <a href="/wiki" style={{ color: theme.colors.primary }}>← Back to Wiki</a>
      </div>
    )
  }

  if (!user) {
    return (
      <div style={styles.container}>
        <p style={{ color: theme.colors.text.secondary }}>Please log in to edit this page. </p>
        <a href="/login" style={{ color: theme.colors.primary }}>Go to Login</a>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div style={styles.container}>
        <h1 style={styles.heading1}>Unauthorized</h1>
        <p style={{ color: theme.colors.text.secondary, marginBottom: '2rem' }}>
          You don't have permission to edit this page.
        </p>
        <a href={`/wiki/${slug}`} style={{ color: theme.colors.primary }}>← Back to Page</a>
      </div>
    )
  }

  return (
    <main style={styles.container}>
      <div style={{ marginBottom: '2rem' }}>
        <a href={`/wiki/${slug}`} style={{ color: theme.colors.primary, textDecoration: 'none' }}>
          ← Back to Page
        </a>
      </div>

      <h1 style={styles.heading1}>Edit Wiki Page</h1>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {/* Title and Category Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div>
              <label style={styles.label}>
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={styles.input}
              />
            </div>

            <div>
              <label style={styles.label}>
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={styles.select}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat. charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Editor Tabs */}
          <div>
            <div style={{ 
              display: 'flex', 
              gap: '0.5rem', 
              marginBottom: '0.5rem',
              borderBottom: '1px solid #333'
            }}>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                style={{
                  padding: '0.5rem 1rem',
                  background: ! showPreview ? '#333' : 'transparent',
                  color:  ! showPreview ? '#fff' :  '#888',
                  border: 'none',
                  borderBottom: ! showPreview ? '2px solid #4f8' : '2px solid transparent',
                  cursor: 'pointer',
                  fontSize:  '0.875rem'
                }}
              >
                ✏️ Edit
              </button>
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                style={{
                  padding: '0.5rem 1rem',
                  background: showPreview ?  '#333' : 'transparent',
                  color: showPreview ? '#fff' : '#888',
                  border: 'none',
                  borderBottom: showPreview ? '2px solid #4f8' : '2px solid transparent',
                  cursor:  'pointer',
                  fontSize: '0.875rem'
                }}
              >
                👁️ Preview
              </button>
            </div>

            {! showPreview ?  (
              <div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={20}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: theme.colors.background.secondary,
                    border: `1px solid ${theme.colors.border.secondary}`,
                    borderRadius:  theme.borderRadius,
                    color: theme.colors.text.primary,
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    resize: 'vertical',
                    lineHeight: '1.6'
                  }}
                />
                <div style={{ 
                  marginTop: '0.5rem', 
                  fontSize: '0.75rem', 
                  color: '#666' 
                }}>
                  Supports Markdown formatting
                </div>
              </div>
            ) : (
              <div style={{
                padding: '1rem',
                background: '#0a0a0a',
                border: '1px solid #444',
                borderRadius: '4px',
                minHeight: '400px'
              }}>
                {content ?  (
                  <div className="markdown-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p style={{ color: theme.colors.text.muted, fontStyle: 'italic' }}>
                    Nothing to preview yet.  Start writing in the Edit tab!
                  </p>
                )}
              </div>
            )}
          </div>

          {error && (
            <div style={{
              padding: '0.75rem',
              background: theme.colors.background.error,
              border: `1px solid ${theme.colors.danger}`,
              borderRadius: theme.borderRadius,
              color: theme.colors.danger
            }}>
              {error}
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="submit"
              disabled={saving}
              style={styles.buttonPrimary}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>

            <a
              href={`/wiki/${slug}`}
              style={styles.buttonSecondary}
            >
              Cancel
            </a>
          </div>
        </div>
      </form>
    </main>
  )
}