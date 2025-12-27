'use client'

import { useEffect, useState, useRef } from 'react'
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
  const [pendingCategory, setPendingCategory] = useState<string | null>(null)
  const [showCategoryConfirm, setShowCategoryConfirm] = useState(false)
  const prevCategoryRef = useRef(category)

  const categories = ['npc', 'location', 'lore', 'item', 'faction', 'player character']

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
      setContent(data.content)
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

  const getTemplate = (cat: string) => {
    const templates: Record<string, string> = {
      npc: `# [NPC Name]

---
**Race:** [Race]  
**Class/Profession:** [Class/Profession]  
**Background:** [Background]  
**Alignment:** [Alignment]
---

### Who is this character? What is their role in the world?

### What do they look like? What stands out about their appearance?

### What motivates them? What are their goals, fears, or secrets?

### Who are their friends, allies, or enemies?

### What is a memorable quote or saying from this character?

### What is something unexpected about them?

## Additional Notes
[Add any other interesting details or story hooks.]
`,
      'player character': `# [Player Character Name]

---
**Race:** [Race]  
**Class:** [Class]  
**Background:** [Background]  
**Alignment:** [Alignment]  
**Favorite Color:** [Color]
---

## What is your character's background and origin story?

## What are their core beliefs, values, or driving motivations?

## What do they look like? Any distinguishing features?

## What is their greatest strength? What is their greatest flaw?

## Who are their closest allies or rivals?

## What is a secret your character keeps (from the party or the world)?

## What is a goal your character wants to achieve?

## What is a memorable moment from their adventures so far?

## Additional Notes
[Add any other personal details, quirks, or aspirations.]
`,
      location: `# [Location Name]

---
**Type:** [e.g., City, Forest, Dungeon, etc.]  
**Region:** [Region or area]  
**Notable NPCs:** [Key NPCs]  
**Factions Present:** [Factions]
---

## What makes this place unique or important?

## What is the environment like? (Climate, terrain, notable features)

## Who lives here or frequents this location?

## What is the history or legend behind this place?

## What dangers or mysteries might visitors encounter?

## What is a rumor or secret about this location?

## Additional Notes
[Add any other interesting facts, hooks, or connections.]
`,
      lore: `# [Lore Topic]

---
**Origin:** [How did this lore begin?]  
**Key Figures:** [People or creatures involved]  
**Era:** [Time period]
---

## What is the essence of this lore or story element?

## How did it originate? Who or what is involved?

## What are the key events or turning points?

## How does this lore impact the world or its people?

## What mysteries or unresolved questions surround it?

## Why does this matter to the campaign or characters?

## Additional Notes
[Add any other context, theories, or implications.]
`,
      item: `# [Item Name]

---
**Type:** [Weapon, Armor, Potion, Artifact, etc.]  
**Rarity:** [Common, Uncommon, Rare, Legendary, etc.]  
**Value:** [Gold piece equivalent or other value]
---

## What is this item and what does it look like?

## What is its origin or history?

## What powers, abilities, or properties does it have?

## Who can use it, and are there any requirements or restrictions?

## What is a story or rumor associated with this item?

## What is a drawback, risk, or cost of using it?

## Additional Notes
[Add any other details, plot hooks, or secrets.]
`,
      faction: `# [Faction Name]

---
**Leader:** [Name and title]  
**Base of Operations:** [Location]  
**Primary Goal:** [Goal or ideology]
---

## What is the purpose or ideology of this group?

## Who leads it, and how is it organized?

## What is the group's history or origin?

## Who are its allies and enemies?

## What resources, power, or influence does it have?

## What are its current goals or activities?

## What is a secret or internal conflict within the faction?

## Additional Notes
[Add any other relevant information, rumors, or story hooks.]
`
    }
    return templates[cat] || templates['player character']
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
      setContent(getTemplate(pendingCategory))
      prevCategoryRef.current = pendingCategory
    }
    setShowCategoryConfirm(false)
    setPendingCategory(null)
  }

  const handleCancelCategoryChange = () => {
    setShowCategoryConfirm(false)
    setPendingCategory(null)
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
                </div>
              )}
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
                background: '#f9f7f3', // off-white background
                border: '1px solid #ddd',
                borderRadius: '4px',
                minHeight: '400px',
                color: '#222',
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