'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { theme, styles } from '../../lib/theme'

type WikiPage = {
  id:  string
  title: string
  slug: string
  category: string
  author_id: string
  created_at: string
  updated_at: string
  profiles?:  {
    username: string
  }
}

export default function WikiHomePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [pages, setPages] = useState<WikiPage[]>([])
  const [filteredPages, setFilteredPages] = useState<WikiPage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState('created')

  const categories = ['all', 'npc', 'location', 'lore', 'item', 'faction', 'player character']
  const sortOptions = [
    { value: 'created', label: 'Most Recent' },
    { value: 'title', label: 'Title A-Z' },
    { value: 'title-desc', label: 'Title Z-A' },
    { value: 'category', label: 'Category' },
    { value: 'author', label: 'Author' }
  ]

  useEffect(() => {
    loadPages()
  }, [])

  useEffect(() => {
    filterPages()
  }, [searchTerm, categoryFilter, sortBy, pages])

  const loadPages = async () => {
  try {
    // First get all wiki pages
    const { data: pagesData, error:  pagesError } = await supabase
      .from('wiki_pages')
      .select('*')
      .order('updated_at', { ascending: false })

    if (pagesError) throw pagesError

    if (! pagesData || pagesData. length === 0) {
      setPages([])
      setLoading(false)
      return
    }

    // Then get profiles for all authors
    const authorIds = pagesData.map(p => p.author_id).filter(Boolean)
    const { data: profilesData } = await supabase
      . from('profiles')
      .select('*')
      .in('id', authorIds)

    // Merge the data
    const pagesWithProfiles = pagesData.map(page => ({
      ...page,
      profiles: profilesData?.find(p => p.id === page.author_id)
    }))

    setPages(pagesWithProfiles)
  } catch (error:  any) {
    console.error('Error loading wiki pages:', error. message)
  } finally {
    setLoading(false)
  }
}

  const filterPages = () => {
    let filtered = [...pages] // Create a new array copy

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.category === categoryFilter)
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchLower) ||
        (p.profiles?.username || '').toLowerCase().includes(searchLower)
      )
    }

    // Sort the filtered results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title)
        case 'title-desc':
          return b.title.localeCompare(a.title)
        case 'category':
          // Primary sort: by category alphabetically
          const categoryCompare = a.category.localeCompare(b.category)
          if (categoryCompare !== 0) return categoryCompare
          // Secondary sort: by title within the same category
          return a.title.localeCompare(b.title)
        case 'author':
          const authorA = a.profiles?.username || ''
          const authorB = b.profiles?.username || ''
          return authorA.localeCompare(authorB)
        case 'created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

    setFilteredPages(filtered)
  }

  const getCategoryColor = (category: string) => {
    const colors:  Record<string, string> = {
      npc: theme.colors.secondary, // Blood red for NPCs
      location: theme.colors.secondary, // Forest green for locations
      lore: theme.colors.secondary, // Tertiary brown for lore
      item: theme.colors.secondary, // Muted for items
      faction: theme.colors.secondary, // Secondary text for factions
      'player character': theme.colors.secondary
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
      'player character': '🎭',
      general: '📄'
    }
    return icons[category] || '📄'
  }

  if (loading) {
    return <div style={{ ...styles.container, textAlign: 'center', color: theme.colors.text.secondary }}>Loading wiki... </div>
  }

  return (
    <main style={styles.container}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <h1 style={styles.heading1}>📚 Wiki</h1>
        {user && (
          <a
            href="/wiki/create"
            style={styles.button.primary}
          >
            + Create Page
          </a>
        )}
      </div>

      {/* Search, Filters, Sort and Stats */}
      <div style={{ 
        marginBottom: '1rem',
        display: 'flex',
        gap: '1rem',
        alignItems: 'center'
      }}>
        <input
          type="text"
          placeholder="Search pages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            minWidth: '150px',
            maxHeight: '36px',
            textAlign: 'left',
            ...styles.input
          }}
        />
        
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{
            ...styles.select,
            minWidth: '120px',
            maxHeight: '36px',
            paddingTop: '7px',
            paddingLeft: '8px',
            textAlign: 'left',
            width: '120px'
          }}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            ...styles.select,
            minWidth: '120px',
            maxHeight: '36px',
            paddingTop: '7px',
            paddingLeft: '8px',
            width: '120px',
            textAlign: 'left',
          }}
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Pages List */}
      {filteredPages.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '2rem', 
          background: theme.colors.background.success, 
          borderRadius: theme.borderRadius,
          border: `1px solid ${theme.colors.border.primary}`
        }}>
          <p style={{ fontSize: '1.25rem', color: theme.colors.text.secondary }}>
            {pages.length === 0 ? 'No wiki pages yet.' : 'No pages match your search.'}
          </p>
          {user && pages.length === 0 && (
            <p style={{ marginTop: '1rem', color: theme.colors.text.muted }}>
              Be the first to create one! 
            </p>
          )}
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
        }}>
          {filteredPages.map((page) => (
            <a
              key={page.id}
              href={`/wiki/${page.slug}`}
              style={{
                display: 'block',
                background: theme.colors.background.success,
                border: `1px solid ${theme.colors.border.primary}`,
                borderRadius: theme.borderRadius,
                padding: '1. 5rem',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = theme.colors.primary
              }}
              onMouseLeave={(e) => {
                e.currentTarget. style.borderColor = theme.colors.border.primary
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ 
                  fontSize: '1.1rem',
                  width: '3rem',
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {getCategoryIcon(page.category)}
                </div>
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h2 style={{ 
                    fontSize: '1rem',
                    marginTop: '0.25rem', 
                    marginLeft: '-1rem',
                    marginBottom: '0.15rem',
                    color: theme.colors.primary
                  }}>
                    {page.title}
                  </h2>
                  
                  <div style={{ 
                    display:  'flex', 
                    gap: '0.05rem', 
                    fontSize: '0.875rem',
                    marginLeft: '-1rem',
                    marginBottom: '0.25rem',
                    color: theme.colors.text.secondary,
                    flexWrap: 'wrap'
                  }}>
                    <span style={{ 
                      color: getCategoryColor(page.category),
                      fontWeight: 'bold',
                      textTransform: 'capitalize'
                    }}>
                      {page.category}
                    </span>
                    
                    <span>
                     &nbsp;by {page.profiles?.username || 'Unknown'}
                    </span>
                    
                    <span>
                      &nbsp;Updated {new Date(page.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </main>
  )
}