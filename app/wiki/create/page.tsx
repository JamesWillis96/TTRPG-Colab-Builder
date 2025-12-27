'use client'

import { useState, useRef } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { styles, theme } from '../../../lib/theme'

export default function CreateWikiPage() {
  const { user } = useAuth()
  const router = useRouter()
  
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
      player: `# [Player Character Name]

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
    return templates[cat] || templates.player
  }

  const [title, setTitle] = useState('')
  const [content, setContent] = useState(getTemplate('player character'))
  const [category, setCategory] = useState('player character')
  const [showPreview, setShowPreview] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showCategoryConfirm, setShowCategoryConfirm] = useState(false)
  const [pendingCategory, setPendingCategory] = useState<string | null>(null)
  const prevCategoryRef = useRef(category)

  const categories = ['npc', 'location', 'lore', 'item', 'faction', 'player character']

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
                  top: 0,
                  left: 'calc(100% + 12px)', // stick to right of select with 12px padding
                  background: '#fff',
                  border: `2px solid ${theme.colors.danger}`,
                  borderRadius: '8px',
                  boxShadow: '0 2px 12px #0002',
                  padding: '1rem',
                  zIndex: 10,
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
                </div>
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
              <div style={styles.preview}>
                {content ?  (
                  <div className="markdown-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p style={{ color: '#666', fontStyle: 'italic' }}>
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