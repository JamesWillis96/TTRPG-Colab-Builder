'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { supabase } from '../../lib/supabase'

type RandomTable = {
  id: string
  title: string
  description?: string
  category: string
  tags?: string[]
  entries: TableEntry[]
  is_official: boolean
  created_by: string
  created_at: string
}

type TableEntry = {
  text: string
  weight?: number
}

type RollResult = {
  text: string
  tableTitle: string
  timestamp: Date
  locked: boolean
}

const CATEGORIES = [
  'All',
  'Names',
  'NPCs',
  'Locations',
  'Items',
  'Events',
  'Encounters',
  'Weather',
  'Quests',
  'Treasures',
  'Other'
]

export default function TablesPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const { theme, styles } = useTheme()

  // Data states
  const [tables, setTables] = useState<RandomTable[]>([])
  const [filteredTables, setFilteredTables] = useState<RandomTable[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [rollHistory, setRollHistory] = useState<RollResult[]>([])
  
  // UI states
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [expandedTableId, setExpandedTableId] = useState<string | null>(null)
  const [isRolling, setIsRolling] = useState(false)
  
  // Create/Edit states
  const [editingTable, setEditingTable] = useState<RandomTable | null>(null)
  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formCategory, setFormCategory] = useState('Other')
  const [formTags, setFormTags] = useState('')
  const [formEntries, setFormEntries] = useState<TableEntry[]>([{ text: '', weight: 1 }])

  const isAdmin = profile?.role === 'admin'

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Load tables
  const loadTables = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('random_tables')
        .select('*')
        .order('is_official', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error

      setTables(data || [])
      setFilteredTables(data || [])
    } catch (err: any) {
      console.error('Error loading tables:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) loadTables()
  }, [user, loadTables])

  // Filter tables
  useEffect(() => {
    let filtered = tables

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(t => t.category === selectedCategory)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query) ||
        t.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }

    setFilteredTables(filtered)
  }, [selectedCategory, searchQuery, tables])

  // Roll on table with animation
  const rollOnTable = async (table: RandomTable) => {
    if (isRolling || table.entries.length === 0) return
    
    setIsRolling(true)
    
    // Simulate dice roll animation delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Weighted random selection
    const totalWeight = table.entries.reduce((sum, e) => sum + (e.weight || 1), 0)
    let random = Math.random() * totalWeight
    
    let selectedEntry = table.entries[0]
    for (const entry of table.entries) {
      random -= (entry.weight || 1)
      if (random <= 0) {
        selectedEntry = entry
        break
      }
    }

    const result: RollResult = {
      text: selectedEntry.text,
      tableTitle: table.title,
      timestamp: new Date(),
      locked: false
    }

    setRollHistory(prev => [result, ...prev.slice(0, 19)]) // Keep last 20
    setIsRolling(false)
  }

  // Toggle result lock
  const toggleLock = (index: number) => {
    setRollHistory(prev => prev.map((r, i) => 
      i === index ? { ...r, locked: !r.locked } : r
    ))
  }

  // Copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert('Copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Toggle favorite
  const toggleFavorite = (tableId: string) => {
    setFavorites(prev => 
      prev.includes(tableId) 
        ? prev.filter(id => id !== tableId)
        : [...prev, tableId]
    )
  }

  // Create table
  const createTable = async () => {
    if (!user || !formTitle.trim() || formEntries.length === 0) return

    const validEntries = formEntries.filter(e => e.text.trim())
    if (validEntries.length === 0) return

    try {
      const { data, error } = await supabase
        .from('random_tables')
        .insert({
          title: formTitle,
          description: formDescription || null,
          category: formCategory,
          tags: formTags ? formTags.split(',').map(t => t.trim()).filter(t => t) : [],
          entries: validEntries,
          is_official: false,
          created_by: user.id
        })
        .select()
        .single()

      if (error) throw error

      const newTable = data

      setTables([newTable, ...tables])
      resetForm()
      setShowCreateModal(false)
    } catch (err: any) {
      console.error('Error creating table:', err)
      alert('Failed to create table: ' + err.message)
    }
  }

  // Update table
  const updateTable = async () => {
    if (!editingTable || !formTitle.trim()) return

    const validEntries = formEntries.filter(e => e.text.trim())
    if (validEntries.length === 0) return

    try {
      const { data, error } = await supabase
        .from('random_tables')
        .update({
          title: formTitle,
          description: formDescription || null,
          category: formCategory,
          tags: formTags ? formTags.split(',').map(t => t.trim()).filter(t => t) : [],
          entries: validEntries
        })
        .eq('id', editingTable.id)
        .select()
        .single()

      if (error) throw error

      const updatedTable = data

      setTables(tables.map(t => t.id === updatedTable.id ? updatedTable : t))
      resetForm()
      setShowCreateModal(false)
      setEditingTable(null)
    } catch (err: any) {
      console.error('Error updating table:', err)
      alert('Failed to update table: ' + err.message)
    }
  }

  // Delete table
  const deleteTable = async (tableId: string) => {
    if (!confirm('Delete this table permanently?')) return

    try {
      const { error } = await supabase
        .from('random_tables')
        .delete()
        .eq('id', tableId)

      if (error) throw error

      setTables(tables.filter(t => t.id !== tableId))
      if (editingTable?.id === tableId) {
        resetForm()
        setShowCreateModal(false)
        setEditingTable(null)
      }
    } catch (err: any) {
      console.error('Error deleting table:', err)
      alert('Failed to delete table: ' + err.message)
    }
  }

  // Form helpers
  const resetForm = () => {
    setFormTitle('')
    setFormDescription('')
    setFormCategory('Other')
    setFormTags('')
    setFormEntries([{ text: '', weight: 1 }])
  }

  const openEditModal = (table: RandomTable) => {
    setEditingTable(table)
    setFormTitle(table.title)
    setFormDescription(table.description || '')
    setFormCategory(table.category)
    setFormTags(table.tags?.join(', ') || '')
    setFormEntries(table.entries.length > 0 ? table.entries : [{ text: '', weight: 1 }])
    setShowCreateModal(true)
  }

  const addEntry = () => {
    setFormEntries([...formEntries, { text: '', weight: 1 }])
  }

  const updateEntry = (index: number, field: 'text' | 'weight', value: string | number) => {
    const updated = [...formEntries]
    updated[index] = { ...updated[index], [field]: value }
    setFormEntries(updated)
  }

  const removeEntry = (index: number) => {
    if (formEntries.length > 1) {
      setFormEntries(formEntries.filter((_, i) => i !== index))
    }
  }

  const canEdit = (table: RandomTable) => {
    return user?.id === table.created_by || isAdmin
  }

  if (loading || authLoading) return <div style={{ padding: 24 }}>Loading...</div>
  if (!user) return null

  return (
    <main style={styles.container}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h1 style={styles.heading1}>🎲 Random Tables</h1>
          <button 
            onClick={() => { resetForm(); setEditingTable(null); setShowCreateModal(true) }} 
            style={styles.button.primary}
          >
            Create Table
          </button>
        </div>
        <p style={{ color: theme.colors.text.secondary, fontSize: '0.95em' }}>
          Roll on existing tables or create your own to generate instant ideas for your campaign.
        </p>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                ...styles.button.secondary,
                opacity: selectedCategory === cat ? 1 : 0.6,
                padding: '6px 12px',
                fontSize: '0.9em'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <input
          type="text"
          placeholder="Search tables by name, description, or tags..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: 10,
            borderRadius: 6,
            border: `1px solid ${theme.colors.border}`,
            background: theme.colors.background.secondary,
            color: theme.colors.text.primary,
            fontSize: '0.95em'
          }}
        />
      </div>

      {/* Tables Grid */}
      <div style={{ display: 'grid', gap: 16 }}>
        {filteredTables.length === 0 ? (
          <div style={styles.card}>
            <p style={{ color: theme.colors.text.tertiary, textAlign: 'center' }}>
              No tables found. Try adjusting your filters or create a new table!
            </p>
          </div>
        ) : (
          filteredTables.map(table => (
            <TableCard
              key={table.id}
              table={table}
              isExpanded={expandedTableId === table.id}
              isFavorite={favorites.includes(table.id)}
              canEdit={canEdit(table)}
              onToggleExpand={() => setExpandedTableId(expandedTableId === table.id ? null : table.id)}
              onRoll={() => rollOnTable(table)}
              onToggleFavorite={() => toggleFavorite(table.id)}
              onEdit={() => openEditModal(table)}
              onDelete={() => deleteTable(table.id)}
              isRolling={isRolling}
              theme={theme}
              styles={styles}
            />
          ))
        )}
      </div>

      {/* Roll History Sidebar */}
      {rollHistory.length > 0 && (
        <div style={{
          position: 'fixed',
          top: 80,
          right: 20,
          width: 320,
          maxHeight: 'calc(100vh - 100px)',
          overflow: 'auto',
          background: theme.colors.background.main,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: 8,
          padding: 16,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ ...styles.heading2, margin: 0 }}>Recent Rolls</h3>
            <button 
              onClick={() => setRollHistory(rollHistory.filter(r => r.locked))}
              style={{ ...styles.button.secondary, padding: '4px 8px', fontSize: '0.8em' }}
            >
              Clear
            </button>
          </div>
          
          <div style={{ display: 'grid', gap: 10 }}>
            {rollHistory.map((result, i) => (
              <div
                key={i}
                style={{
                  padding: 12,
                  background: result.locked ? theme.colors.primary + '20' : theme.colors.background.secondary,
                  borderRadius: 6,
                  border: result.locked ? `2px solid ${theme.colors.primary}` : 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div style={{ fontSize: '0.75em', color: theme.colors.text.tertiary }}>
                    {result.tableTitle}
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      onClick={() => toggleLock(i)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1em',
                        padding: 2
                      }}
                      title={result.locked ? 'Unlock' : 'Lock'}
                    >
                      {result.locked ? '🔒' : '🔓'}
                    </button>
                    <button
                      onClick={() => copyToClipboard(result.text)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1em',
                        padding: 2
                      }}
                      title="Copy"
                    >
                      📋
                    </button>
                  </div>
                </div>
                <div style={{ color: theme.colors.text.primary, fontSize: '0.9em' }}>
                  {result.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: 20
        }}>
          <div style={{
            background: theme.colors.background.main,
            borderRadius: 8,
            padding: 24,
            width: '100%',
            maxWidth: 600,
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={styles.heading2}>
                {editingTable ? 'Edit Table' : 'Create New Table'}
              </h2>
              <button 
                onClick={() => { setShowCreateModal(false); setEditingTable(null); resetForm() }}
                style={styles.button.secondary}
              >
                Close
              </button>
            </div>

            <div style={{ display: 'grid', gap: 16 }}>
              {/* Title */}
              <div>
                <label style={{ display: 'block', marginBottom: 6, color: theme.colors.text.primary, fontSize: '0.9em', fontWeight: 'bold' }}>
                  Table Name *
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="e.g., Tavern Names, Random NPCs, Weather Events"
                  style={{
                    width: '100%',
                    padding: 10,
                    borderRadius: 6,
                    border: `1px solid ${theme.colors.border}`,
                    background: theme.colors.background.secondary,
                    color: theme.colors.text.primary
                  }}
                />
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', marginBottom: 6, color: theme.colors.text.primary, fontSize: '0.9em', fontWeight: 'bold' }}>
                  Description
                </label>
                <textarea
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="Optional description of what this table generates"
                  style={{
                    width: '100%',
                    padding: 10,
                    borderRadius: 6,
                    border: `1px solid ${theme.colors.border}`,
                    background: theme.colors.background.secondary,
                    color: theme.colors.text.primary,
                    minHeight: 60,
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Category */}
              <div>
                <label style={{ display: 'block', marginBottom: 6, color: theme.colors.text.primary, fontSize: '0.9em', fontWeight: 'bold' }}>
                  Category *
                </label>
                <select
                  value={formCategory}
                  onChange={e => setFormCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 10,
                    borderRadius: 6,
                    border: `1px solid ${theme.colors.border}`,
                    background: theme.colors.background.secondary,
                    color: theme.colors.text.primary
                  }}
                >
                  {CATEGORIES.filter(c => c !== 'All').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label style={{ display: 'block', marginBottom: 6, color: theme.colors.text.primary, fontSize: '0.9em', fontWeight: 'bold' }}>
                  Tags
                </label>
                <input
                  type="text"
                  value={formTags}
                  onChange={e => setFormTags(e.target.value)}
                  placeholder="fantasy, medieval, horror (comma-separated)"
                  style={{
                    width: '100%',
                    padding: 10,
                    borderRadius: 6,
                    border: `1px solid ${theme.colors.border}`,
                    background: theme.colors.background.secondary,
                    color: theme.colors.text.primary
                  }}
                />
              </div>

              {/* Entries */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ color: theme.colors.text.primary, fontSize: '0.9em', fontWeight: 'bold' }}>
                    Table Entries *
                  </label>
                  <button onClick={addEntry} style={{ ...styles.button.secondary, padding: '4px 12px', fontSize: '0.85em' }}>
                    + Add Entry
                  </button>
                </div>
                
                <div style={{ display: 'grid', gap: 8, maxHeight: 300, overflow: 'auto' }}>
                  {formEntries.map((entry, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        type="text"
                        value={entry.text}
                        onChange={e => updateEntry(i, 'text', e.target.value)}
                        placeholder={`Entry ${i + 1}`}
                        style={{
                          flex: 1,
                          padding: 8,
                          borderRadius: 6,
                          border: `1px solid ${theme.colors.border}`,
                          background: theme.colors.background.secondary,
                          color: theme.colors.text.primary,
                          fontSize: '0.9em'
                        }}
                      />
                      <input
                        type="number"
                        value={entry.weight || 1}
                        onChange={e => updateEntry(i, 'weight', parseInt(e.target.value) || 1)}
                        min={1}
                        max={100}
                        style={{
                          width: 60,
                          padding: 8,
                          borderRadius: 6,
                          border: `1px solid ${theme.colors.border}`,
                          background: theme.colors.background.secondary,
                          color: '#000',
                          fontSize: '0.9em'
                        }}
                        title="Weight (higher = more likely)"
                      />
                      <button
                        onClick={() => removeEntry(i)}
                        disabled={formEntries.length === 1}
                        style={{
                          padding: '6px 10px',
                          borderRadius: 6,
                          background: formEntries.length === 1 ? theme.colors.background.tertiary : '#ff6b6b',
                          color: '#fff',
                          border: 'none',
                          cursor: formEntries.length === 1 ? 'not-allowed' : 'pointer',
                          fontSize: '0.9em'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 8, fontSize: '0.75em', color: theme.colors.text.tertiary }}>
                  💡 Weight controls probability (1-100). Higher weight = more likely to appear.
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                {editingTable && canEdit(editingTable) && (
                  <button
                    onClick={() => deleteTable(editingTable.id)}
                    style={{ ...styles.button.primary, background: '#ff6b6b' }}
                  >
                    Delete Table
                  </button>
                )}
                <button
                  onClick={editingTable ? updateTable : createTable}
                  style={styles.button.primary}
                  disabled={!formTitle.trim() || formEntries.filter(e => e.text.trim()).length === 0}
                >
                  {editingTable ? 'Save Changes' : 'Create Table'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

// Table Card Component
function TableCard({
  table,
  isExpanded,
  isFavorite,
  canEdit,
  onToggleExpand,
  onRoll,
  onToggleFavorite,
  onEdit,
  onDelete,
  isRolling,
  theme,
  styles
}: {
  table: RandomTable
  isExpanded: boolean
  isFavorite: boolean
  canEdit: boolean
  onToggleExpand: () => void
  onRoll: () => void
  onToggleFavorite: () => void
  onEdit: () => void
  onDelete: () => void
  isRolling: boolean
  theme: any
  styles: any
}) {
  return (
    <div style={{
      ...styles.card,
      border: table.is_official ? `2px solid ${theme.colors.primary}` : undefined
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h3 style={{ ...styles.heading2, margin: 0 }}>{table.title}</h3>
            {table.is_official && (
              <span style={{
                background: theme.colors.primary,
                color: '#fff',
                padding: '2px 8px',
                borderRadius: 12,
                fontSize: '0.7em',
                fontWeight: 'bold'
              }}>
                OFFICIAL
              </span>
            )}
          </div>
          
          {table.description && (
            <p style={{ color: theme.colors.text.secondary, fontSize: '0.9em', margin: '4px 0' }}>
              {table.description}
            </p>
          )}
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
            <span style={{
              background: theme.colors.background.secondary,
              padding: '4px 10px',
              borderRadius: 12,
              fontSize: '0.75em',
              color: theme.colors.text.secondary
            }}>
              {table.category}
            </span>
            
            <span style={{ fontSize: '0.75em', color: theme.colors.text.tertiary }}>
              {table.entries.length} entries
            </span>
          </div>
          
          {table.tags && table.tags.length > 0 && (
            <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
              {table.tags.map(tag => (
                <span
                  key={tag}
                  style={{
                    fontSize: '0.7em',
                    color: theme.colors.text.tertiary,
                    padding: '2px 8px',
                    background: theme.colors.background.tertiary,
                    borderRadius: 8
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={onToggleFavorite}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.3em',
              padding: 4
            }}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorite ? '⭐' : '☆'}
          </button>
          
          <button
            onClick={onRoll}
            disabled={isRolling || table.entries.length === 0}
            style={{
              ...styles.button.primary,
              padding: '8px 16px',
              fontSize: '1em',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            🎲 Roll
          </button>
          
          <button
            onClick={onToggleExpand}
            style={{
              ...styles.button.secondary,
              padding: '8px 12px'
            }}
          >
            {isExpanded ? '▲' : '▼'}
          </button>
          
          {canEdit && (
            <button
              onClick={onEdit}
              style={{
                ...styles.button.secondary,
                padding: '8px 12px'
              }}
            >
              ✏️
            </button>
          )}
        </div>
      </div>
      
      {/* Expanded Entries */}
      {isExpanded && (
        <div style={{
          marginTop: 16,
          padding: 16,
          background: theme.colors.background.secondary,
          borderRadius: 6
        }}>
          <div style={{ marginBottom: 8, fontSize: '0.85em', fontWeight: 'bold', color: theme.colors.text.primary }}>
            All Entries ({table.entries.length})
          </div>
          <div style={{ display: 'grid', gap: 6 }}>
            {table.entries.map((entry, i) => (
              <div
                key={i}
                style={{
                  padding: '6px 10px',
                  background: theme.colors.background.main,
                  borderRadius: 4,
                  fontSize: '0.85em',
                  color: theme.colors.text.primary,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>{entry.text}</span>
                {entry.weight && entry.weight > 1 && (
                  <span style={{
                    fontSize: '0.75em',
                    color: theme.colors.text.tertiary,
                    background: theme.colors.background.tertiary,
                    padding: '2px 6px',
                    borderRadius: 8
                  }}>
                    ×{entry.weight}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
