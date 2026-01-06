'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

type WikiPage = {
  id: string
  title: string
  slug: string
  category: string
  author_id: string
  created_at: string
  updated_at: string
  profiles?: {
    username: string
  }
}

export default function WikiHomePage() {
  const { user } = useAuth()
  const { theme, styles } = useTheme()
  const router = useRouter()
  const [pages, setPages] = useState<WikiPage[]>([])
  const [filteredPages, setFilteredPages] = useState<WikiPage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')  // Changed from categoryFilter
  const [sortBy, setSortBy] = useState('created')
  const isMobile = window.innerWidth <= 500

  const categories = ['all', 'npc', 'location', 'lore', 'item', 'faction', 'player character']
  const sortOptions = [
    { value: 'created', label: 'Most Recent' },
    { value: 'title', label: 'Title A-Z' },
    { value: 'title-desc', label: 'Title Z-A' },
    { value: 'author', label: 'Author' }
  ]

  useEffect(() => {
    loadPages()
  }, [])

  useEffect(() => {
    filterPages()
  }, [searchTerm, selectedCategory, sortBy, pages])  // Updated dependency

  const loadPages = async () => {
    try {
      // First get all wiki pages
      const { data: pagesData, error: pagesError } = await supabase
        .from('wiki_pages')
        .select('*')
        .order('updated_at', { ascending: false })

      if (pagesError) throw pagesError

      if (!pagesData || pagesData.length === 0) {
        setPages([])
        setLoading(false)
        return
      }

      // Then get profiles for all authors
      const authorIds = pagesData.map(p => p.author_id).filter(Boolean)
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .in('id', authorIds)

      // Merge the data
      const pagesWithProfiles = pagesData.map(page => ({
        ...page,
        profiles: profilesData?.find(p => p.id === page.author_id)
      }))

      setPages(pagesWithProfiles)
    } catch (error: any) {
      console.error('Error loading wiki pages:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const filterPages = () => {
    let filtered = [...pages] // Create a new array copy

    // Filter by selected category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory)
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
    const colors: Record<string, string> = {
      npc: theme.colors.secondary,
      location: theme.colors.secondary,
      lore: theme.colors.secondary,
      item: theme.colors.secondary,
      faction: theme.colors.secondary,
      'player character': theme.colors.secondary
    }
    return colors[category] || theme.colors.text.secondary
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      npc: '🧍',
      location: '📍',
      lore: '📜',
      item: '⚔️',
      faction: '🛡️',
      'player character': '🎭',
      general: '📄'
    }
    return icons[category] || '📄'
  }

  if (loading) {
    return <div style={{ ...styles.container, textAlign: 'center', color: theme.colors.text.secondary }}>Loading wiki...</div>
  }

  return (
    isMobile ? ( 
      
     <main style={{ padding: '1rem', fontFamily: 'Arial, sans-serif' }}>
  {/* Header */}
  <h1
    style={{
      fontSize: '1.5rem',
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: '1rem',
      color: theme.colors.text.primary, // Match desktop header color
    }}
  >
    📚 Wiki
  </h1>

  {/* Search Input */}
  <input
    type="text"
    placeholder="Search pages..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    style={{
      width: '100%',
      padding: '0.75rem',
      border: `1px solid ${theme.colors.border.primary}`, // Match desktop border color
      borderRadius: theme.borderRadius,
      marginBottom: '1rem',
      fontSize: '1rem',
      color: theme.colors.text.primary, // Match desktop text color
      backgroundColor: theme.colors.background.input, // Match desktop input background
    }}
  />

  {/* Category Selector */}
  <select
    value={selectedCategory}
    onChange={(e) => setSelectedCategory(e.target.value)}
    style={{
      width: '100%',
      padding: '0.75rem',
      border: `1px solid ${theme.colors.border.primary}`, // Match desktop border color
      borderRadius: theme.borderRadius,
      marginBottom: '1rem',
      fontSize: '1rem',
      color: theme.colors.text.primary, // Match desktop text color
      backgroundColor: theme.colors.background.input, // Match desktop input background
    }}
  >
    <option value="all">All Categories</option>
    <option value="npc">NPCs</option>
    <option value="location">Locations</option>
    <option value="lore">Lore</option>
    <option value="item">Items</option>
    <option value="faction">Factions</option>
    <option value="player character">Player Characters</option>
  </select>

  {/* Sort Dropdown and Create Page Button */}
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '1rem',
    }}
  >
    {/* Sort Dropdown */}
    <select
      value={sortBy}
      onChange={(e) => setSortBy(e.target.value)}
      style={{
        flex: 1,
        padding: '0.75rem',
        border: `1px solid ${theme.colors.border.primary}`, // Match desktop border color
        borderRadius: theme.borderRadius,
        fontSize: '1rem',
        color: theme.colors.text.primary, // Match desktop text color
        backgroundColor: theme.colors.background.input, // Match desktop input background
      }}
    >
      <option value="created">Most Recent</option>
      <option value="title">Title A-Z</option>
      <option value="title-desc">Title Z-A</option>
      <option value="author">Author</option>
    </select>

    {/* Create Page Button */}
    <a
      href="/wiki/create"
      style={{
        padding: '0.75rem 1rem',
        background: theme.colors.primary, // Match desktop button background
        borderRadius: theme.borderRadius,
        color: theme.colors.text.primary, // Match desktop button text color
        fontWeight: '600',
        textAlign: 'center',
        textDecoration: 'none',
        fontSize: '1rem',
        whiteSpace: 'nowrap',
        border: `1px solid ${theme.colors.primary}`, // Match desktop button border
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
      + Create Page
    </a>
  </div>

  {/* Content Section */}
    <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(1, 1fr)',
              marginTop: '2rem',
              gap: '1rem'
            }}>
              {filteredPages.map((page) => (
                <a
                  key={page.id}
                  href={`/wiki/${page.slug}`}
                  className="entry"  // Added class for hover styling
                  style={{
                    display: 'block',
                    background: 'transparent',
                    border: `1px solid ${theme.colors.border.secondary}`,
                    borderRadius: theme.borderRadius,
                    padding: '1rem',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.primary
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.border.secondary
                  }}
                >
                  <h3 style={{ 
                    fontSize: '1rem',
                    margin: '0 0 0.5rem 0',
                    color: theme.colors.secondary // Changed from primary to text.primary for default
                  }}>
                    {page.title}
                  </h3>
                  {/* <div style={{ 
                    fontSize: '0.875rem',
                    color: theme.colors.text.secondary,
                    marginBottom: '0.5rem'
                  }}>
                    Category: {page.category.charAt(0).toUpperCase() + page.category.slice(1)}
                  </div> */}
                  <div style={{ 
                    fontSize: '0.875rem',
                    color: theme.colors.text.secondary
                  }}>
                    by {page.profiles?.username || 'Unknown'} • Updated {new Date(page.updated_at).toLocaleDateString()}
                  </div>
                </a>
              ))}
            </div>
    </main>
      
    ) : (

      // Desktop Layout
    <main style={styles.container}>
      {/* Add style block for hover effect */}
      <style>{`
        .entry:hover h3 {
          color: ${theme.colors.primary} !important;
        }
      `}</style>

      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '0.5rem',
        gap: '1rem'  // Removed flexWrap: 'wrap'
      }}>
        <h1 style={{...styles.heading1, minWidth: '215px'}}>📚 Wiki</h1>
        <input
          type="text"
          placeholder="Search pages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            minWidth: '200px',
            paddingLeft: '8px',
            maxHeight: '36px',
            textAlign: 'left',
            ...styles.input
          }}
        />
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

      {/* Layout: Left sidebar for categories, Right for content */}
      <div style={{ display: 'flex', gap: '2rem' }}>
        {/* Left Sidebar: Category Buttons */}
        <div style={{ width: '200px', flexShrink: 0 }}>
          <h3 style={{ marginBottom: '1rem', color: theme.colors.text.primary, display: 'flex', alignItems:'center', marginTop: '-.4rem' }}>Categories</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
             {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = theme.colors.primary  // Change to primary on hover
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = selectedCategory === category 
                    ? theme.colors.primary  // Keep primary if selected
                    : theme.colors.text.secondary  // Revert to secondary if not selected
                }}
                style={{
                  padding: '0.75rem',
                  background: 'transparent',
                  border: selectedCategory === category 
                    ? `2px solid ${theme.colors.primary}`  // Primary red border when selected
                    : `1px solid ${theme.colors.border.primary}`,
                  borderRadius: theme.borderRadius,
                  color: selectedCategory === category 
                    ? theme.colors.primary  // Primary red text when selected
                    : theme.colors.text.secondary,
                  fontWeight: '600',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  textTransform: 'capitalize',
                  transition: 'border-color 0.2s, color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span style={{ width: '1.5rem', textAlign: 'center', display: 'inline-block' }}>
                  {category === 'all' ? '' : getCategoryIcon(category)}
                </span>
                {category === 'all' ? 'All' : category}
              </button>
            ))}
          </div>
          {/* Create Page Button */}
          {user && (
            <div style={{ marginTop: '2rem' }}>
              <a
                href="/wiki/create"
                style={{
                  padding: '0.75rem',
                  background: theme.colors.primary,
                  borderRadius: theme.borderRadius,
                  color: '#ffffff',
                  fontWeight: '600',
                  textAlign: 'center',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  textTransform: 'capitalize',
                  transition: 'background-color 0.2s',
                  display: 'block',
                  textDecoration: 'none',
                  border: `1px solid ${theme.colors.primary}`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff'
                  e.currentTarget.style.color = theme.colors.primary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.primary
                  e.currentTarget.style.color = '#ffffff'
                }}
              >
                + Create Page
              </a>
            </div>
          )}
        </div>

        {/* Right Content Area */}
        <div style={{ flex: 1, paddingTop: '0rem' }}>  {/* Added paddingTop to align with category buttons */}

          {/* Stats */}
          <div style={{ 
            marginBottom: '2rem',
            display: 'flex',
            gap: '1rem',
            alignItems: 'center'
          }}>
            {/* <div style={{ 
              color: theme.colors.text.secondary,
              fontSize: '0.875rem',
              whiteSpace: 'nowrap',
              minWidth: 'fit-content'
            }}>
              {filteredPages.length} pages
            </div> */}
          </div>

          {/* Pages Grid */}
          {filteredPages.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '2rem', 
              paddingTop: '4rem',
              background: 'transparent', 
              borderRadius: theme.borderRadius,
            }}>
              <p style={{ fontSize: '1.25rem', color: theme.colors.text.secondary }}>
                {pages.length === 0 ? 'No wiki pages yet.' : 'No pages match your search.'}
              </p>
              {user && pages.length === 0 && (
                <p style={{ marginTop: '2rem', color: theme.colors.text.muted }}>
                  Be the first to create one! 
                </p>
              )}
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)',
              marginTop: '2rem',
              gap: '1rem'
            }}>
              {filteredPages.map((page) => (
                <a
                  key={page.id}
                  href={`/wiki/${page.slug}`}
                  className="entry"  // Added class for hover styling
                  style={{
                    display: 'block',
                    background: 'transparent',
                    border: `1px solid ${theme.colors.border.secondary}`,
                    borderRadius: theme.borderRadius,
                    padding: '1rem',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.primary
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.border.secondary
                  }}
                >
                  <h3 style={{ 
                    fontSize: '1rem',
                    margin: '0 0 0.5rem 0',
                    color: theme.colors.secondary // Changed from primary to text.primary for default
                  }}>
                    {page.title}
                  </h3>
                  {/* <div style={{ 
                    fontSize: '0.875rem',
                    color: theme.colors.text.secondary,
                    marginBottom: '0.5rem'
                  }}>
                    Category: {page.category.charAt(0).toUpperCase() + page.category.slice(1)}
                  </div> */}
                  <div style={{ 
                    fontSize: '0.875rem',
                    color: theme.colors.text.secondary
                  }}>
                    by {page.profiles?.username || 'Unknown'} • Updated {new Date(page.updated_at).toLocaleDateString()}
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
  )
}