'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { useTheme } from './ThemeContext'
import type { MarkdownTheme } from '../lib/markdownThemes'

export type WikiEntryState = 'draft' | 'pending_review' | 'published'

export interface WikiEntry {
  id: string
  title: string
  slug: string
  category: string
  content: string
  state: WikiEntryState
  author_id: string
  is_public: boolean // <-- new field
  markdown_theme?: MarkdownTheme
  featured_image?: string
  created_at: string
  updated_at: string
}

export interface EntryFormData {
  title: string
  slug: string
  category: string
  content: string
  changeSummary?: string
  markdown_theme?: MarkdownTheme
  featured_image?: string
}

export interface WikiRevision {
  id: string
  wiki_page_id: string
  title: string
  slug: string
  content: string
  category: string
  author_id: string
  change_summary: string
  created_at: string
}

export interface WikiContextType {
  // Data
  entries: WikiEntry[]
  selectedEntry: WikiEntry | null
  revisions: WikiRevision[]
  recentlyViewed: string[]
  loading: boolean
  revisionsLoading: boolean
  error: string | null

  // Filters
  searchQuery: string
  selectedCategory: string

  // Public status helpers
  isPublic: boolean
  isAuthorOrAdmin: boolean
  togglePublicStatus: (makePublic: boolean) => Promise<void>

  // UI State
  isMobile: boolean
  sidebarOpen: boolean
  isEditModalOpen: boolean
  isRevisionsModalOpen: boolean
  editingEntry: WikiEntry | null
  selectedMarkdownTheme: MarkdownTheme

  // Categories (derived)
  categories: string[]

  // Filtered entries (derived)
  filteredEntries: WikiEntry[]
  recentEntries: WikiEntry[]

  // Actions
  selectEntry: (entry: WikiEntry, options?: { suppressUrl?: boolean }) => void
  updateSearchQuery: (query: string) => void
  updateCategory: (category: string) => void
  setSidebarOpen: (open: boolean) => void
  openEditModal: (entry?: WikiEntry) => void
  closeEditModal: () => void
  openRevisionsModal: () => void
  closeRevisionsModal: () => void
  loadRevisions: (entryId: string) => Promise<void>
  setSelectedMarkdownTheme: (theme: MarkdownTheme) => void
  saveEntry: (data: EntryFormData, entryIdToUpdate?: string) => Promise<void>
  deleteEntry: (id: string) => Promise<void>
  reloadEntries: () => Promise<void>
}

const WikiContext = createContext<WikiContextType | undefined>(undefined)

export function useWiki() {
  const context = useContext(WikiContext)
  if (!context) {
    throw new Error('useWiki must be used within WikiProvider')
  }
  return context
}

const STORAGE_KEY_PREFIX = 'wiki_recent_'

export function WikiProvider({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth()
  const { theme } = useTheme()

  // Core data
  const [entries, setEntries] = useState<WikiEntry[]>([])
  const [selectedEntry, setSelectedEntry] = useState<WikiEntry | null>(null)
  const [isPublic, setIsPublic] = useState(false)
  const [revisions, setRevisions] = useState<WikiRevision[]>([])
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [revisionsLoading, setRevisionsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  // UI State
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isRevisionsModalOpen, setIsRevisionsModalOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<WikiEntry | null>(null)
  const [selectedMarkdownTheme, setSelectedMarkdownTheme] = useState<MarkdownTheme>('github')
  const [initialEntrySlug, setInitialEntrySlug] = useState<string | null>(null)

  // Derived data
  const categories = ['All', ...new Set(entries.map(e => e.category))]

  const filteredEntries = entries.filter(entry => {
    const matchesSearch =
      searchQuery === '' ||
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory =
      selectedCategory === 'All' || entry.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const recentEntries = recentlyViewed
    .map(id => entries.find(e => e.id === id))
    .filter((entry): entry is WikiEntry => !!entry)
    .slice(0, 5)

  // Load entries on mount
  useEffect(() => {
    if (user) {
      reloadEntries()
    }
  }, [user])

  // Capture initial entry slug from query string (for deep link /wiki?entry=slug)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const slug = params.get('entry')
    if (slug) setInitialEntrySlug(slug)
  }, [])

  // Load recently viewed from localStorage
  useEffect(() => {
    if (!user) return
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${user.id}`)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setRecentlyViewed(parsed)
        }
      }
    } catch (e) {
      console.warn('Failed to load recent entries from storage', e)
    }
  }, [user])

  // Handle mobile responsiveness
  useEffect(() => {
    const checkMobile = () => {
      const isMobileNow = window.innerWidth < 768
      setIsMobile(isMobileNow)
      // Auto-close sidebar on mobile
      if (isMobileNow && sidebarOpen) {
        setSidebarOpen(false)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Load all entries
  async function reloadEntries() {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('wiki_pages')
        .select('*')
        .is('deleted_at', null)
        .order('title', { ascending: true })

      if (err) throw err
      setEntries(data || [])
    } catch (err: any) {
      const message = err.message || 'Failed to load wiki entries'
      setError(message)
      console.error('Error loading wiki entries:', err)
    } finally {
      setLoading(false)
    }
  }


  // Determine if current user is author or admin (reactively)
  const isAuthorOrAdmin = React.useMemo(() => {
    if (!user || !selectedEntry) return false;
    return selectedEntry.author_id === user.id || profile?.role === 'admin';
  }, [user, selectedEntry, profile]);

  // Toggle public status
  async function togglePublicStatus(makePublic: boolean) {
    if (!selectedEntry) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('wiki_pages')
        .update({ is_public: makePublic })
        .eq('id', selectedEntry.id);
      if (error) throw error;
      setIsPublic(makePublic);
      setSelectedEntry({ ...selectedEntry, is_public: makePublic });
      // Optionally reload entries for sidebar update
      await reloadEntries();
    } catch (err: any) {
      setError(err.message || 'Failed to update public status');
    } finally {
      setLoading(false);
    }
  }

  // Select an entry and update tracking
  function selectEntry(entry: WikiEntry, options?: { suppressUrl?: boolean }) {
    setSelectedEntry(entry)
    setIsPublic(entry.is_public)

    // Close sidebar on mobile after selection
    if (isMobile) {
      setSidebarOpen(false)
    }

    // Update recently viewed
    const updated = [entry.id, ...recentlyViewed.filter(id => id !== entry.id)].slice(0, 12)
    setRecentlyViewed(updated)

    // Persist to localStorage
    if (user) {
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}${user.id}`, JSON.stringify(updated))
      } catch (e) {
        console.warn('Failed to save recent entries', e)
      }
    }

    // Update URL for deep linking
    if (!options?.suppressUrl) {
      const slug = entry.slug || entry.id
      window.history.pushState(
        { entryId: entry.id },
        entry.title,
        `/wiki?entry=${slug}`
      )
    }
  }

  // Auto-select entry if query param matches after entries load
  useEffect(() => {
    if (!initialEntrySlug || selectedEntry || entries.length === 0) return
    const match = entries.find(e => e.slug === initialEntrySlug || e.id === initialEntrySlug)
    if (match) {
      selectEntry(match, { suppressUrl: true })
      setInitialEntrySlug(null)
    }
  }, [initialEntrySlug, entries, selectedEntry])

  // Save (create or update) an entry
  async function saveEntry(data: EntryFormData, entryIdToUpdate?: string) {
    if (!user) throw new Error('Must be logged in to save')

    try {
      // Determine if we're updating or creating
      const targetEntry = entryIdToUpdate 
        ? entries.find(e => e.id === entryIdToUpdate) || editingEntry
        : editingEntry

      if (targetEntry) {
        // Editing existing entry
        // 1. Create revision snapshot
        const { error: revisionError } = await supabase.from('wiki_revisions').insert({
          wiki_page_id: targetEntry.id,
          title: targetEntry.title,
          slug: targetEntry.slug,
          content: targetEntry.content,
          category: targetEntry.category,
          author_id: user.id,
          change_summary: data.changeSummary || 'Updated entry',
          created_at: new Date().toISOString()
        })

        if (revisionError) {
          console.error('Revision error:', revisionError)
          throw new Error(`Failed to save revision: ${revisionError.message}. Check RLS policies for wiki_revisions table.`)
        }

        // 2. Update entry
        const { data: updated, error: err } = await supabase
          .from('wiki_pages')
          .update({
            title: data.title,
            slug: data.slug,
            content: data.content,
            category: data.category,
            markdown_theme: data.markdown_theme || 'github',
            featured_image: data.featured_image || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', targetEntry.id)
          .select()

        if (err) {
          console.error('Update error:', err)
          throw err
        }
        if (!updated || updated.length === 0) {
          console.error('No data returned from update')
          throw new Error('Failed to update entry - no data returned. Check RLS policies.')
        }

        const updatedEntry = updated[0]

        // 3. Update local state
        setEntries(prev =>
          prev
            .map(e => (e.id === updatedEntry.id ? updatedEntry : e))
            .sort((a, b) => a.title.localeCompare(b.title))
        )
        setSelectedEntry(updatedEntry)
      } else {
        // Creating new entry
        const { data: created, error: err } = await supabase
          .from('wiki_pages')
          .insert({
            title: data.title,
            slug: data.slug,
            category: data.category,
            content: data.content,
            author_id: user.id,
            markdown_theme: data.markdown_theme || 'github',
            featured_image: data.featured_image || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (err) throw err

        // Update local state and auto-select
        setEntries(prev =>
          [...prev, created].sort((a, b) => a.title.localeCompare(b.title))
        )
        selectEntry(created)
      }

      // Close modal
      setIsEditModalOpen(false)
      setEditingEntry(null)
    } catch (err: any) {
      const message = err.message || 'Failed to save entry'
      setError(message)
      throw err
    }
  }

  // Delete an entry
  async function deleteEntry(id: string) {
    if (!user) throw new Error('Must be logged in to delete')

    try {
      const { error: err } = await supabase
        .from('wiki_pages')
        .update({ deleted_at: new Date().toISOString(), deleted_by: user.id })
        .eq('id', id)

      if (err) throw err

      setEntries(prev => prev.filter(e => e.id !== id))
      if (selectedEntry?.id === id) {
        setSelectedEntry(null)
      }
    } catch (err: any) {
      const message = err.message || 'Failed to delete entry'
      setError(message)
      throw err
    }
  }

  // Load revisions for an entry
  async function loadRevisions(entryId: string) {
    setRevisionsLoading(true)
    try {
      const { data, error: err } = await supabase
        .from('wiki_revisions')
        .select('*')
        .eq('wiki_page_id', entryId)
        .order('created_at', { ascending: false })

      if (err) throw err
      setRevisions(data || [])
    } catch (err: any) {
      console.error('Error loading revisions:', err)
      setError(err.message || 'Failed to load revisions')
    } finally {
      setRevisionsLoading(false)
    }
  }

  const value: WikiContextType = {
    entries,
    selectedEntry,
    revisions,
    recentlyViewed,
    loading,
    revisionsLoading,
    error,
    searchQuery,
    selectedCategory,
    isMobile,
    sidebarOpen,
    isEditModalOpen,
    isRevisionsModalOpen,
    editingEntry,
    selectedMarkdownTheme,
    categories,
    filteredEntries,
    recentEntries,
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
    openRevisionsModal: () => setIsRevisionsModalOpen(true),
    closeRevisionsModal: () => setIsRevisionsModalOpen(false),
    loadRevisions,
    setSelectedMarkdownTheme,
    saveEntry,
    deleteEntry,
    reloadEntries,
    isPublic,
    isAuthorOrAdmin,
    togglePublicStatus,
  }

  return (
    <WikiContext.Provider value={value}>
      {children}
    </WikiContext.Provider>
  )
}
