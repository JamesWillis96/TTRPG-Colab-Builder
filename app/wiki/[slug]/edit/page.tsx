'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../../../../contexts/AuthContext'
import { useTheme } from '../../../../contexts/ThemeContext'
import { supabase } from '../../../../lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getWikiTemplate } from '../../../../lib/wikiTemplates'

export default function EditWikiPage() {
  const { user } = useAuth()
  const { theme, styles } = useTheme()
  const { slug } = useParams()
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('general')
  const [showPreview, setShowPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [pendingCategory, setPendingCategory] = useState<string | null>(null)
  const [showCategoryConfirm, setShowCategoryConfirm] = useState(false)
  const [pageId, setPageId] = useState<string | null>(null)

  const categories = ['npc', 'location', 'lore', 'item', 'faction', 'player character']

  useEffect(() => {
    supabase
      .from('wiki_pages')
      .select('*')
      .eq('slug', slug)
      .single()
      .then(({ data, error }) => {
        if (data) {
          setTitle(data.title)
          setContent(data.content)
          setCategory(data.category)
          setPageId(data.id)
          console.log('Loaded page:', data)
          if (user) {
            console.log('Current user id:', user.id, 'Page author_id:', data.author_id)
          }
        }
        if (error) setError('Failed to load page')
      })
  }, [slug, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const newSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      if (!pageId) throw new Error('Page not loaded')
      console.log('Submitting update:', { pageId, title, newSlug, content, category })
      const { error: updateError, data: updateData } = await supabase
        .from('wiki_pages')
        .update({ title, slug: newSlug, content, category, updated_at: new Date().toISOString() })
        .eq('id', pageId)
        .select()
      console.log('Update result:', { updateError, updateData })
      if (!updateError && (Array.isArray(updateData) && updateData.length === 0)) {
        console.warn('Update returned no data. This may be an RLS or permission issue.')
      }
      if (updateError) throw updateError
      router.push(`/wiki/${newSlug}`)
    } catch (err: any) {
      setError(err.message)
      console.error('Update error:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value
    if (newCategory === category) return
    setPendingCategory(newCategory)
    setShowCategoryConfirm(true)
  }
  const handleConfirmCategoryChange = () => {
    if (pendingCategory) {
      setCategory(pendingCategory)
      setContent(getWikiTemplate(pendingCategory))
    }
    setShowCategoryConfirm(false)
    setPendingCategory(null)
  }
  const handleCancelCategoryChange = () => {
    setShowCategoryConfirm(false)
    setPendingCategory(null)
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
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div>
              <label style={styles.label}>Title *</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} required style={styles.input} />
            </div>
            <div style={{ position: 'relative' }}>
              <label style={styles.label}>Category *</label>
              <select
                value={pendingCategory || category}
                onChange={handleCategoryChange}
                style={styles.select}
                disabled={showCategoryConfirm}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>
              {showCategoryConfirm && (
                <div style={{
                  position: 'absolute',
                  background: '#fff',
                  border: `2px solid ${theme.colors.danger}`,
                  borderRadius: '8px',
                  boxShadow: '0 2px 12px #0002',
                  padding: '1rem',
                  zIndex: 10,
                  marginTop: '0.5rem',
                  left: 0,
                  right: 0,
                  maxWidth: '320px',
                  color: theme.colors.primary,
                }}>
                  <div style={{ fontWeight: 600, color: theme.colors.danger, marginBottom: '0.5rem' }}>Change Category?</div>
                  <div style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>
                    Changing the category will <b>replace all text</b> in the editor with a new template. Are you sure?
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={handleCancelCategoryChange} style={{ ...styles.buttonSecondary, minWidth: 80 }}>Cancel</button>
                    <button type="button" onClick={handleConfirmCategoryChange} style={{ ...styles.buttonPrimary, minWidth: 80 }}>Confirm</button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div>
            <div style={styles.tabContainer}>
              <button type="button" onClick={() => setShowPreview(false)} style={showPreview ? styles.tab.inactive : styles.tab.active}>✏️ Edit</button>
              <button type="button" onClick={() => setShowPreview(true)} style={showPreview ? styles.tab.active : styles.tab.inactive}>👁️ Preview</button>
            </div>
            {!showPreview ? (
              <div>
                <textarea value={content} onChange={e => setContent(e.target.value)} required rows={20} style={styles.textarea} />
                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#666' }}>Supports Markdown formatting</div>
              </div>
            ) : (
              <div style={{
                ...styles.preview,
                background: '#f9f7f3',
                color: '#222',
                borderRadius: '6px',
                border: '1px solid #ddd',
                padding: '1.5rem',
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
                      font-weight: 800;
                      letter-spacing: 0.5px;
                    }
                    .markdown-content strong {
                      color: ${theme.colors.secondary};
                      font-weight: 700;
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
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
          {error && (
            <div style={{ padding: '0.75rem', background: theme.colors.background.error, border: `1px solid ${theme.colors.danger}`, borderRadius: theme.borderRadius, color: theme.colors.danger }}>{error}</div>
          )}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" disabled={saving} style={styles.buttonPrimary}>{saving ? 'Saving...' : 'Save Changes'}</button>
            <a href={`/wiki/${slug}`} style={styles.buttonSecondary}>Cancel</a>
          </div>
        </div>
      </form>
    </main>
  )
}