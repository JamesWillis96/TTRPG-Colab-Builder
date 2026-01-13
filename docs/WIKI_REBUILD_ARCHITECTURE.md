# Wiki System - Architectural Rebuild

## Executive Summary

The current Wiki implementation has structural issues:
- Monolithic component with 30+ state variables
- React hook ordering violations
- Tightly coupled state and UI
- Poor separation of concerns

**Solution**: Rebuild with clear component hierarchy, centralized context state, and focused responsibility.

---

## Architecture Overview

### High-Level Structure

```
WikiPage (main container, layout management)
├── WikiSidebar (navigation, search, entry list)
│   ├── SearchBar
│   └── EntryList
├── WikiContentPane (content display)
│   ├── WikiHeader (title, actions)
│   ├── WikiContent (markdown renderer)
│   ├── WikiTableOfContents (sticky)
│   └── RelatedEntries
├── WikiEditor (modal for create/edit)
│   ├── TemplateSelector
│   ├── TemplateForm
│   └── MediaUploader
└── WikiRevisionsModal (revision history viewer)
```

### State Management Strategy

**Use React Context to avoid prop drilling:**

```typescript
interface WikiContextType {
  // Data
  entries: WikiEntry[];
  selectedEntry: WikiEntry | null;
  recentlyViewed: string[];
  
  // Filters
  searchQuery: string;
  selectedCategory: string;
  
  // UI State
  isMobile: boolean;
  sidebarOpen: boolean;
  editingEntry: WikiEntry | null;
  isEditModalOpen: boolean;
  
  // Actions
  selectEntry: (entry: WikiEntry) => void;
  updateSearchQuery: (query: string) => void;
  updateCategory: (category: string) => void;
  openEditModal: (entry?: WikiEntry) => void;
  closeEditModal: () => void;
  saveEntry: (data: EntryFormData) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
}
```

---

## Component Architecture

### 1. WikiPage (Container)

**Responsibilities:**
- Fetch initial data
- Provide context to all children
- Handle auth redirects
- Manage mobile responsiveness
- Coordinate data loading

```typescript
'use client'

interface WikiPageProps {}

export default function WikiPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  // Fetch data on mount
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  if (authLoading) return null

  return (
    <WikiProvider>
      <WikiLayout />
    </WikiProvider>
  )
}
```

### 2. WikiProvider (Context + Data Fetching)

**Responsibilities:**
- Hold all Wiki state
- Fetch entries from Supabase
- Expose actions via context
- Handle cache invalidation

```typescript
'use client'

interface WikiProviderProps {
  children: React.ReactNode
}

export function WikiProvider({ children }: WikiProviderProps) {
  const { user } = useAuth()

  // Core data
  const [entries, setEntries] = useState<WikiEntry[]>([])
  const [selectedEntry, setSelectedEntry] = useState<WikiEntry | null>(null)
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([])

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  // UI State
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [editingEntry, setEditingEntry] = useState<WikiEntry | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Load entries on mount
  useEffect(() => {
    loadEntries()
  }, [user])

  // Handle mobile responsiveness
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Load from localStorage
  useEffect(() => {
    if (!user) return
    try {
      const stored = localStorage.getItem(`wiki_recent_${user.id}`)
      if (stored) {
        setRecentlyViewed(JSON.parse(stored))
      }
    } catch (e) {
      console.warn('Failed to load recent entries')
    }
  }, [user])

  async function loadEntries() {
    try {
      const { data, error } = await supabase
        .from('wiki_pages')
        .select('*')
        .order('title', { ascending: true })

      if (error) throw error
      setEntries(data || [])
    } catch (err) {
      console.error('Failed to load wiki entries:', err)
    }
  }

  async function selectEntry(entry: WikiEntry) {
    setSelectedEntry(entry)
    if (isMobile) setSidebarOpen(false)

    // Update recently viewed
    const updated = [entry.id, ...recentlyViewed.filter(id => id !== entry.id)].slice(0, 12)
    setRecentlyViewed(updated)
    if (user) {
      localStorage.setItem(`wiki_recent_${user.id}`, JSON.stringify(updated))
    }

    // Update URL
    window.history.pushState(
      { entryId: entry.id },
      entry.title,
      `/wiki?entry=${entry.slug || entry.id}`
    )
  }

  async function saveEntry(data: EntryFormData) {
    if (!user) return

    try {
      if (editingEntry) {
        // Create revision snapshot
        await supabase.from('wiki_revisions').insert({
          wiki_page_id: editingEntry.id,
          title: editingEntry.title,
          slug: editingEntry.slug,
          content: editingEntry.content,
          category: editingEntry.category,
          state: editingEntry.state,
          author_id: user.id,
          change_summary: data.changeSummary || 'Updated',
          created_at: new Date().toISOString()
        })

        // Update entry
        const { data: updated, error } = await supabase
          .from('wiki_pages')
          .update({
            title: data.title,
            slug: toSlug(data.title),
            content: data.content,
            category: data.category,
            state: data.state,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingEntry.id)
          .select()
          .single()

        if (error) throw error
        setEntries(prev =>
          prev.map(e => e.id === updated.id ? updated : e)
            .sort((a, b) => a.title.localeCompare(b.title))
        )
        setSelectedEntry(updated)
      } else {
        // Create new entry
        const { data: created, error } = await supabase
          .from('wiki_pages')
          .insert({
            title: data.title,
            slug: toSlug(data.title),
            content: data.content,
            category: data.category,
            state: data.state,
            author_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) throw error
        setEntries(prev =>
          [...prev, created].sort((a, b) => a.title.localeCompare(b.title))
        )
        selectEntry(created)
      }

      setIsEditModalOpen(false)
      setEditingEntry(null)
    } catch (err) {
      console.error('Failed to save entry:', err)
      throw err
    }
  }

  const value: WikiContextType = {
    entries,
    selectedEntry,
    recentlyViewed,
    searchQuery,
    selectedCategory,
    isMobile,
    sidebarOpen,
    editingEntry,
    isEditModalOpen,
    selectEntry,
    updateSearchQuery: setSearchQuery,
    updateCategory: setSelectedCategory,
    setSidebarOpen,
    openEditModal: (entry?: WikiEntry) => {
      setEditingEntry(entry || null)
      setIsEditModalOpen(true)
    },
    closeEditModal: () => {
      setIsEditModalOpen(false)
      setEditingEntry(null)
    },
    saveEntry,
    deleteEntry: async (id: string) => {
      try {
        await supabase.from('wiki_pages').delete().eq('id', id)
        setEntries(prev => prev.filter(e => e.id !== id))
        if (selectedEntry?.id === id) setSelectedEntry(null)
      } catch (err) {
        console.error('Failed to delete entry:', err)
        throw err
      }
    }
  }

  return (
    <WikiContext.Provider value={value}>
      {children}
    </WikiContext.Provider>
  )
}
```

### 3. WikiLayout (Layout & Route Management)

**Responsibilities:**
- Two-pane layout
- URL synchronization
- Mobile responsiveness

```typescript
'use client'

export function WikiLayout() {
  const { isMobile, sidebarOpen, selectedEntry } = useWiki()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Load from URL on mount
  useEffect(() => {
    const slug = searchParams.get('entry')
    if (slug) {
      // Find and select entry by slug
    }
  }, [searchParams])

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '320px 1fr',
      gridTemplateRows: 'auto 1fr',
      height: '100vh',
      backgroundColor: theme.colors.background.main
    }}>
      {/* Header */}
      <WikiHeader />

      {/* Sidebar */}
      {(!isMobile || sidebarOpen) && <WikiSidebar />}

      {/* Content */}
      {(!isMobile || !sidebarOpen) && <WikiContentPane />}

      {/* Modals */}
      <WikiEditorModal />
      <WikiRevisionsModal />
    </div>
  )
}
```

### 4. WikiSidebar (Entry Navigation)

**Responsibilities:**
- Render entry list
- Search filtering
- Category filtering
- Recent entries display

```typescript
'use client'

export function WikiSidebar() {
  const {
    entries,
    selectedEntry,
    searchQuery,
    updateSearchQuery,
    selectedCategory,
    updateCategory,
    recentlyViewed,
    selectEntry
  } = useWiki()

  const categories = useMemo(() => {
    return ['All', ...new Set(entries.map(e => e.category))]
  }, [entries])

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const matchesSearch =
        searchQuery === '' ||
        entry.title.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory =
        selectedCategory === 'All' || entry.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [entries, searchQuery, selectedCategory])

  const recentEntries = useMemo(() => {
    return recentlyViewed
      .map(id => entries.find(e => e.id === id))
      .filter(Boolean as any)
      .slice(0, 5)
  }, [recentlyViewed, entries])

  return (
    <div style={{ gridColumn: 1, gridRow: 2, overflowY: 'auto', borderRight: '1px solid' }}>
      {/* Search */}
      <input
        value={searchQuery}
        onChange={e => updateSearchQuery(e.target.value)}
        placeholder="Search..."
        style={{ width: '100%', padding: '12px' }}
      />

      {/* Categories */}
      <div style={{ display: 'flex', gap: '8px', padding: '12px', flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => updateCategory(cat)}
            style={{
              padding: '6px 12px',
              backgroundColor: selectedCategory === cat ? '#007bff' : '#f0f0f0',
              color: selectedCategory === cat ? '#fff' : '#000',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Recently Viewed */}
      {recentEntries.length > 0 && (
        <div style={{ padding: '16px', borderBottom: '1px solid #eee' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>
            RECENT
          </div>
          {recentEntries.map(entry => (
            <div
              key={entry.id}
              onClick={() => selectEntry(entry)}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                backgroundColor: selectedEntry?.id === entry.id ? '#f0f0f0' : 'transparent',
                borderLeft: selectedEntry?.id === entry.id ? '3px solid #007bff' : 'none'
              }}
            >
              {entry.title}
            </div>
          ))}
        </div>
      )}

      {/* All Entries */}
      <div style={{ padding: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>
          ENTRIES ({filteredEntries.length})
        </div>
        {filteredEntries.map(entry => (
          <div
            key={entry.id}
            onClick={() => selectEntry(entry)}
            style={{
              padding: '12px',
              cursor: 'pointer',
              backgroundColor: selectedEntry?.id === entry.id ? '#f0f0f0' : 'transparent',
              borderLeft: selectedEntry?.id === entry.id ? '3px solid #007bff' : 'none'
            }}
          >
            <div style={{ fontWeight: 600, fontSize: '14px' }}>
              {entry.title}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {entry.category}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 5. WikiContentPane (Content Display)

**Responsibilities:**
- Display selected entry
- Render markdown
- Show table of contents
- Show related entries
- Provide edit/delete actions

```typescript
'use client'

export function WikiContentPane() {
  const { selectedEntry, openEditModal, theme } = useWiki()
  const [headings, setHeadings] = useState<Heading[]>([])

  if (!selectedEntry) {
    return (
      <div style={{
        gridColumn: 2,
        gridRow: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#999'
      }}>
        Select an entry to view
      </div>
    )
  }

  return (
    <div style={{ gridColumn: 2, gridRow: 2, overflowY: 'auto', padding: '32px 48px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '32px' }}>
          {selectedEntry.title}
        </h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ color: '#666', fontSize: '14px' }}>
            {selectedEntry.category} • Updated {new Date(selectedEntry.updated_at).toLocaleDateString()}
          </span>
          <button onClick={() => openEditModal(selectedEntry)}>
            Edit
          </button>
        </div>
      </div>

      {/* Content + TOC */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 280px', gap: '24px' }}>
        {/* Main content */}
        <div>
          <ReactMarkdown>
            {selectedEntry.content}
          </ReactMarkdown>
        </div>

        {/* Sidebar: TOC + Related */}
        <div style={{ position: 'sticky', top: '24px' }}>
          {headings.length > 0 && (
            <div style={{ marginBottom: '24px', border: '1px solid #eee', padding: '12px', borderRadius: '4px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                Contents
              </div>
              {headings.map(h => (
                <a
                  key={h.id}
                  href={`#${h.id}`}
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    paddingLeft: `${(h.level - 1) * 12}px`,
                    marginBottom: '4px'
                  }}
                >
                  {h.text}
                </a>
              ))}
            </div>
          )}

          <WikiRelatedEntries entry={selectedEntry} />
        </div>
      </div>
    </div>
  )
}
```

---

## Database Schema

```sql
-- Wiki Pages
CREATE TABLE wiki_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  state TEXT DEFAULT 'draft' CHECK (state IN ('draft', 'pending_review', 'published')),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Revisions
CREATE TABLE wiki_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wiki_page_id UUID NOT NULL REFERENCES wiki_pages(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  state TEXT,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  change_summary TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Media/Uploads
CREATE TABLE wiki_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wiki_page_id UUID NOT NULL REFERENCES wiki_pages(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INT,
  mime_type TEXT,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now()
);

-- Indexes
CREATE INDEX idx_wiki_pages_slug ON wiki_pages(slug);
CREATE INDEX idx_wiki_pages_category ON wiki_pages(category);
CREATE INDEX idx_wiki_pages_author ON wiki_pages(author_id);
CREATE INDEX idx_wiki_revisions_page ON wiki_revisions(wiki_page_id);
```

---

## Data Flow Diagrams

### Entry Selection Flow

```
User clicks entry in sidebar
    ↓
selectEntry(entry) called in context
    ↓
setSelectedEntry(entry)
setRecentlyViewed([entry.id, ...])
localStorage.setItem(...)
window.history.pushState(...) → URL updated
    ↓
WikiContentPane re-renders with selected entry
    ↓
Content displays with markdown
TOC auto-generated
Related entries loaded
```

### Create Entry Flow

```
User clicks "+ Create"
    ↓
openEditModal() in context
    ↓
WikiEditorModal renders with empty form
    ↓
User fills template sections + uploads media
    ↓
User clicks "Create"
    ↓
saveEntry(formData) in context
    ↓
INSERT into wiki_pages
INSERT into wiki_media (if files uploaded)
    ↓
Update local entries state
selectEntry(newEntry) → auto-select created entry
    ↓
Sidebar shows new entry
Content pane displays it
```

### Edit Entry Flow

```
User clicks "Edit" on current entry
    ↓
openEditModal(selectedEntry)
    ↓
WikiEditorModal renders with entry data
    ↓
User edits form + optionally uploads new media
    ↓
User clicks "Save"
    ↓
saveEntry(formData) in context
    ↓
INSERT INTO wiki_revisions (snapshot old version)
UPDATE wiki_pages (new data)
    ↓
Update local entries state
setSelectedEntry(updated)
    ↓
Content pane refreshes with new content
```

---

## Component Checklist

- [ ] `contexts/WikiContext.tsx` - State management
- [ ] `components/Wiki/WikiLayout.tsx` - Main container
- [ ] `components/Wiki/WikiSidebar.tsx` - Entry list & search
- [ ] `components/Wiki/WikiContentPane.tsx` - Content display
- [ ] `components/Wiki/WikiHeader.tsx` - Top bar
- [ ] `components/Wiki/WikiTableOfContents.tsx` - Auto-generated TOC
- [ ] `components/Wiki/WikiRelatedEntries.tsx` - Related entries panel
- [ ] `components/Wiki/WikiEditorModal.tsx` - Create/edit modal
- [ ] `components/Wiki/WikiRevisionsModal.tsx` - History viewer
- [ ] `components/Wiki/MediaUploader.tsx` - File upload handler
- [ ] `app/wiki/page.tsx` - Main page (thin wrapper)
- [ ] `lib/wiki.ts` - Utilities (slug generation, parsing)

---

## Key Improvements

1. **State Organization**: Single context instead of 30+ useState calls
2. **No Prop Drilling**: Context provides all data to nested components
3. **Clear Boundaries**: Each component has a single responsibility
4. **Separation of Concerns**: Data fetching in provider, UI in components
5. **Hook Safety**: All hooks called unconditionally
6. **Testability**: Context can be mocked for testing components
7. **Performance**: Memoization of filtered entries, headings
8. **Extensibility**: Easy to add features without restructuring

---

## Migration Notes

- Do not attempt to salvage old component logic
- Rebuild from type definitions first
- Test each component in isolation
- Use old page as reference for UI patterns only
- Update auth + theme context references as needed
