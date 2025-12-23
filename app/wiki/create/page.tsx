'use client'

import { useState } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { styles, theme } from '../../../lib/theme'

export default function CreateWikiPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('general')
  const [showPreview, setShowPreview] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const categories = ['npc', 'location', 'lore', 'item', 'faction', 'general']

  const getTemplate = (cat: string) => {
    const templates: Record<string, string> = {
      npc: `# [NPC Name]

## Basic Information
- **Race:** [Race]
- **Class:** [Class/Profession]
- **Alignment:** [Alignment]
- **Background:** [Brief background story]

## Appearance
[Physical description, clothing, notable features]

## Personality
[Personality traits, motivations, quirks]

## Abilities & Skills
- **Strengths:** [List key strengths]
- **Weaknesses:** [List key weaknesses]
- **Skills:** [Notable skills or abilities]

## Relationships
- **Allies:** [Friends or allies]
- **Enemies:** [Rivals or enemies]
- **Affiliations:** [Organizations or groups]

## Notable Quotes
> "[Memorable quote]"

## Additional Notes
[Any other relevant information]`,
      location: `# [Location Name]

## Overview
[Brief description of the location]

## Geography & Environment
- **Type:** [e.g., City, Forest, Dungeon, etc.]
- **Size:** [Dimensions or scale]
- **Climate:** [Weather and environmental conditions]
- **Notable Features:** [Landmarks, natural features]

## History
[Historical background or significant events]

## Points of Interest
- **[POI 1]:** [Description]
- **[POI 2]:** [Description]

## Inhabitants
- **Population:** [Number and types of inhabitants]
- **Key NPCs:** [Important characters]
- **Factions:** [Groups present]

## Economy & Resources
[Trade, resources, or economic aspects]

## Dangers & Encounters
[Potential threats or adventure hooks]

## Additional Notes
[Any other relevant information]`,
      lore: `# [Lore Topic]

## Overview
[Brief summary of the lore or story element]

## Background
[Detailed history or origin story]

## Key Events
- **[Event 1]:** [Description and significance]
- **[Event 2]:** [Description and significance]

## Involved Parties
- **Characters:** [Key individuals]
- **Organizations:** [Groups involved]
- **Races/Creatures:** [Relevant beings]

## Impact
[How this lore affects the world, characters, or plot]

## Mysteries & Secrets
[Unresolved questions or hidden truths]

## Additional Notes
[Any other relevant information]`,
      item: `# [Item Name]

## Basic Information
- **Type:** [Weapon, Armor, Potion, Artifact, etc.]
- **Rarity:** [Common, Uncommon, Rare, Legendary, etc.]
- **Value:** [Gold piece equivalent or other value]

## Description
[Physical appearance and general description]

## Properties
- **Effects:** [Magical or special abilities]
- **Requirements:** [Who can use it, prerequisites]
- **Limitations:** [Drawbacks or restrictions]

## History
[Origin story or notable owners/users]

## Usage
[How to use the item, mechanics]

## Additional Notes
[Any other relevant information]`,
      faction: `# [Faction Name]

## Overview
[Brief description of the faction]

## Leadership
- **Leader:** [Name and title]
- **Key Members:** [Important individuals]
- **Structure:** [Hierarchy or organization]

## Goals & Ideology
[Primary objectives and beliefs]

## History
[Background and significant events]

## Territory & Influence
- **Bases:** [Locations controlled]
- **Allies:** [Friendly factions]
- **Enemies:** [Rival factions]

## Resources & Power
[Military, economic, magical strength]

## Notable Activities
[Common actions or operations]

## Additional Notes
[Any other relevant information]`,
      general: `# [Page Title]

## Overview
[Brief introduction or summary]

## Details
[Detailed information, broken into sections as needed]

## Additional Notes
[Any other relevant information]`
    }
    return templates[cat] || templates.general
  }

  const handleAddTemplate = () => {
    if (content.trim() !== '') {
      if (!confirm('You have existing content. Adding a template will replace it. Are you sure?')) {
        return
      }
    }
    setContent(getTemplate(category))
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

            {! showPreview ?  (
              <div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  placeholder="Write your content in Markdown... 

## Heading 2
### Heading 3

**Bold text**
*Italic text*

- List item 1
- List item 2

[Link text](https://example.com)

![Image alt text](image-url)"
                  rows={20}
                  style={styles.textarea}
                />
                <div style={{ 
                  marginTop: '0.5rem', 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: '#666' 
                  }}>
                    Supports Markdown formatting
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTemplate}
                    style={styles.button.primary}
                  >
                    Add Template
                  </button>
                </div>
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