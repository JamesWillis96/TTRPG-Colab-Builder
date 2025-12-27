'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { styles, theme } from '../../../lib/theme'
import { createPortal } from 'react-dom'
import { getWikiTemplate } from '../../../lib/wikiTemplates'

export default function CreateWikiPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState(getWikiTemplate('player character'))
  const [category, setCategory] = useState('player character')
  const [showPreview, setShowPreview] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showCategoryConfirm, setShowCategoryConfirm] = useState(false)
  const [pendingCategory, setPendingCategory] = useState<string | null>(null)
  const prevCategoryRef = useRef(category)
  const selectRef = useRef<HTMLSelectElement>(null)
  const [bubblePos, setBubblePos] = useState<{top: number, left: number} | null>(null)

  const categories = ['npc', 'location', 'lore', 'item', 'faction', 'player character']

  useEffect(() => {
    if (showCategoryConfirm && selectRef.current) {
      const rect = selectRef.current.getBoundingClientRect()
      setBubblePos({
        top: rect.top + window.scrollY,
        left: rect.right + 12 + window.scrollX // 12px padding
      })
    }
  }, [showCategoryConfirm])

  // When category changes, show confirmation bubble before applying
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
      prevCategoryRef.current = pendingCategory
    }
    setShowCategoryConfirm(false)
    setPendingCategory(null)
  }

  const handleCancelCategoryChange = () => {
    setShowCategoryConfirm(false)
    setPendingCategory(null)
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      router.push('/login')
      return
    }

    setLoading(true)
    setError('')

    try {
      const slug = generateSlug(title)
      
      // Check if slug already exists
      const { data:  existing } = await supabase
        .from('wiki_pages')
        .select('id')
        .eq('slug', slug)
        .single()

      if (existing) {
        setError('A page with this title already exists.  Please choose a different title.')
        setLoading(false)
        return
      }

      const { error: insertError } = await supabase
        .from('wiki_pages')
        .insert({
          title,
          slug,
          content,
          category,
          author_id: user.id
        })

      if (insertError) throw insertError

      router.push(`/wiki/${slug}`)
    } catch (err:  any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (! user) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Please log in to create a wiki page.</p>
        <a href="/login" style={{ color: '#4f8' }}>Go to Login</a>
      </div>
    )
  }

  return (
    <main style={styles.container}>
      <div style={styles.section}>
        <a href="/wiki" style={{ color: theme.colors.primary, textDecoration: 'none' }}>
          ← Back to Wiki
        </a>
      </div>

      <h1 style={styles.heading1}>Create Wiki Page</h1>

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
                placeholder="e.g., The Crimson Dragon Inn"
                style={styles.input}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <label style={styles.label}>
                Category *
              </label>
              <select
                ref={selectRef}
                value={pendingCategory || category}
                onChange={handleCategoryChange}
                style={styles.select}
                disabled={showCategoryConfirm}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
              {/* Confirmation Bubble for Category Change */}
              {showCategoryConfirm && bubblePos && createPortal(
                <div style={{
                  position: 'absolute',
                  top: bubblePos.top,
                  left: bubblePos.left,
                  background: '#fff',
                  border: `2px solid ${theme.colors.danger}`,
                  borderRadius: '8px',
                  boxShadow: '0 2px 12px #0002',
                  padding: '1rem',
                  zIndex: 1000,
                  maxWidth: '320px',
                  color: theme.colors.primary,
                  minWidth: '220px',
                }}>
                  <div style={{ fontWeight: 600, color: theme.colors.danger, marginBottom: '0.5rem' }}>
                    Change Category?
                  </div>
                  <div style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>
                    Changing the category will <b>replace all text</b> in the editor with a new template. Are you sure?
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={handleCancelCategoryChange}
                      style={{ ...styles.buttonSecondary, minWidth: 80 }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmCategoryChange}
                      style={{ ...styles.buttonPrimary, minWidth: 80 }}
                    >
                      Confirm
                    </button>
                  </div>
                </div>,
                document.body
              )}
            </div>
          </div>

          {/* Editor Tabs */}
          <div>
            <div style={styles.tabContainer}>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                style={showPreview ? styles.tab.inactive : styles.tab.active}
              >
                ✏️ Edit
              </button>
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                style={showPreview ? styles.tab.active : styles.tab.inactive}
              >
                👁️ Preview
              </button>
            </div>

            {!showPreview ?  (
              <div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  placeholder="Write your content in Markdown... \n\n## Heading 2\n### Heading 3\n\n**Bold text**\n*Italic text*\n\n- List item 1\n- List item 2\n\n[Link text](https://example.com)\n\n![Image alt text](image-url)"
                  rows={20}
                  style={styles.textarea}
                />
              </div>
            ) : (
              <div style={{
                ...styles.preview,
                background: '#f9f7f3', // off-white background
                color: '#222',
                borderRadius: '6px',
                border: '1px solid #ddd',
                padding: '1.5rem',
                minHeight: '400px',
              }}>
                {content ?  (
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
                    `}</style>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p style={{ color: '#aaa', fontStyle: 'italic' }}>
                    Nothing to preview yet.  Start writing in the Edit tab!
                  </p>
                )}
              </div>
            )}
          </div>

          {error && (
            <div style={{
              padding: '0.75rem',
              background: '#ff000020',
              border: '1px solid #ff0000',
              borderRadius: '4px',
              color: '#ff6666'
            }}>
              {error}
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.buttonPrimary,
                flex: 1,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Creating...' : 'Create Page'}
            </button>

            <a
              href="/wiki"
              style={{
                ...styles.buttonSecondary,
                flex: 1,
                textAlign: 'center',
                textDecoration: 'none',
                display: 'block'
              }}
            >
              Cancel
            </a>
          </div>
        </div>
      </form>
    </main>
  )
}