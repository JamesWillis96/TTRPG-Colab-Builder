'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { useTheme } from './ThemeContext'

export type WikiEntryState = 'draft' | 'pending_review' | 'published'

export interface WikiEntry {
  id: string
  title: string
  slug: string
  category: string
  content: string
  state: WikiEntryState
  author_id: string
  created_at: string
  updated_at: string
}

export interface EntryFormData {
  title: string
  slug: string
  category: string
  content: string
  state: WikiEntryState
  changeSummary?: string
}

export interface WikiContextType {
  // Data
  entries: WikiEntry[]
  selectedEntry: WikiEntry | null
  recentlyViewed: string[]
  loading: boolean
  error: string | null

  // Filters
  searchQuery: string
  selectedCategory: string

  // UI State
  isMobile: boolean
  sidebarOpen: boolean
  isEditModalOpen: boolean
  isRevisionsModalOpen: boolean
  editingEntry: WikiEntry | null

  // Categories (derived)
  categories: string[]

  // Filtered entries (derived)
  filteredEntries: WikiEntry[]
  recentEntries: WikiEntry[]

  // Actions
  selectEntry: (entry: WikiEntry) => void
  updateSearchQuery: (query: string) => void
  updateCategory: (category: string) => void
  setSidebarOpen: (open: boolean) => void
  openEditModal: (entry?: WikiEntry) => void
  closeEditModal: () => void
  openRevisionsModal: () => void
  closeRevisionsModal: () => void
  saveEntry: (data: EntryFormData) => Promise<void>
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
  const { user } = useAuth()
  const { theme } = useTheme()

  // Core data
  const [entries, setEntries] = useState<WikiEntry[]>([])
  const [selectedEntry, setSelectedEntry] = useState<WikiEntry | null>(null)
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
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

  // Select an entry and update tracking
  function selectEntry(entry: WikiEntry) {
    setSelectedEntry(entry)

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
    const slug = entry.slug || entry.id
    window.history.pushState(
      { entryId: entry.id },
      entry.title,
      `/wiki?entry=${slug}`
    )
  }

  // Save (create or update) an entry
  async function saveEntry(data: EntryFormData) {
    if (!user) throw new Error('Must be logged in to save')

    try {
      if (editingEntry) {
        // Editing existing entry
        // 1. Create revision snapshot
        await supabase.from('wiki_revisions').insert({
          wiki_page_id: editingEntry.id,
          title: editingEntry.title,
          slug: editingEntry.slug,
          content: editingEntry.content,
          category: editingEntry.category,
          state: editingEntry.state,
          author_id: user.id,
          change_summary: data.changeSummary || 'Updated entry',
          created_at: new Date().toISOString()
        })

        // 2. Update entry
        const { data: updated, error: err } = await supabase
          .from('wiki_pages')
          .update({
            title: data.title,
            slug: data.slug,
            content: data.content,
            category: data.category,
            state: data.state,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingEntry.id)
          .select()
          .single()

        if (err) throw err

        // 3. Update local state
        setEntries(prev =>
          prev
            .map(e => (e.id === updated.id ? updated : e))
            .sort((a, b) => a.title.localeCompare(b.title))
        )
        setSelectedEntry(updated)
      } else {
        // Creating new entry
        const { data: created, error: err } = await supabase
          .from('wiki_pages')
          .insert({
            title: data.title,
            slug: data.slug,
            category: data.category,
            content: data.content,
            state: data.state,
            author_id: user.id,
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
      const { error: err } = await supabase.from('wiki_pages').delete().eq('id', id)

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

  const value: WikiContextType = {
    entries,
    selectedEntry,
    recentlyViewed,
    loading,
    error,
    searchQuery,
    selectedCategory,
    isMobile,
    sidebarOpen,
    isEditModalOpen,
    isRevisionsModalOpen,
    editingEntry,
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
    saveEntry,
    deleteEntry,
    reloadEntries
  }

  return (
    <WikiContext.Provider value={value}>
      {children}
    </WikiContext.Provider>
  )
}
