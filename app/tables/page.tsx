'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { supabase } from '../../lib/supabase'

type RandomTable = {
  id: string
  title: string
  entries: string[]
  created_by: string
}

export default function TablesPage() {
  const { user, loading: authLoading } = useAuth()
  const { theme, styles } = useTheme()
  const [tables, setTables] = useState<RandomTable[]>([])
  const [selectedTable, setSelectedTable] = useState<RandomTable | null>(null)
  const [history, setHistory] = useState<string[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingTable, setEditingTable] = useState<RandomTable | null>(null)
  const [newTableTitle, setNewTableTitle] = useState('')
  const [newTableEntries, setNewTableEntries] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileView, setMobileView] = useState<'tables' | 'entries' | 'history'>('tables')

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 500)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!authLoading && !user) {
      // Redirect to login if needed
    } else if (user) {
      loadTables()
      loadUserRole()
    }
  }, [user, authLoading])

  const loadUserRole = async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      if (error) throw error
      setUserRole(data?.role || null)
    } catch (error: any) {
      console.error('Error loading user role:', error)
    }
  }

  const loadTables = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('random_tables')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setTables(data || [])
    } catch (error: any) {
      console.error('Error loading tables:', error)
      setError(error.message || 'Failed to load tables')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTable = async () => {
    if (!newTableTitle.trim() || !newTableEntries.trim() || !user) return
    const entries = newTableEntries.split('\n').map(e => e.trim()).filter(e => e)
    try {
      const { data, error } = await supabase
        .from('random_tables')
        .insert({
          title: newTableTitle,
          entries,
          created_by: user.id
        })
        .select()
        .single()
      if (error) throw error
      setTables([data, ...tables])
      setShowCreateModal(false)
      setNewTableTitle('')
      setNewTableEntries('')
    } catch (error: any) {
      alert('Error creating table: ' + error.message)
    }
  }

  const handleEditClick = (table: RandomTable, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingTable(table)
    setNewTableTitle(table.title)
    setNewTableEntries(table.entries.join('\n'))
    setShowEditModal(true)
  }

  const handleUpdateTable = async () => {
    if (!newTableTitle.trim() || !newTableEntries.trim() || !editingTable) return
    const entries = newTableEntries.split('\n').map(e => e.trim()).filter(e => e)
    try {
      const { data, error } = await supabase
        .from('random_tables')
        .update({
          title: newTableTitle,
          entries
        })
        .eq('id', editingTable.id)
        .select()
        .single()
      if (error) throw error
      setTables(tables.map(t => t.id === data.id ? data : t))
      if (selectedTable?.id === data.id) {
        setSelectedTable(data)
      }
      setShowEditModal(false)
      setEditingTable(null)
      setNewTableTitle('')
      setNewTableEntries('')
    } catch (error: any) {
      alert('Error updating table: ' + error.message)
    }
  }

  const handleDeleteTable = async () => {
    if (!editingTable) return
    if (!confirm(`Are you sure you want to delete "${editingTable.title}"?`)) return
    try {
      const { error } = await supabase
        .from('random_tables')
        .delete()
        .eq('id', editingTable.id)
      if (error) throw error
      setTables(tables.filter(t => t.id !== editingTable.id))
      if (selectedTable?.id === editingTable.id) {
        setSelectedTable(null)
      }
      setShowEditModal(false)
      setEditingTable(null)
      setNewTableTitle('')
      setNewTableEntries('')
    } catch (error: any) {
      alert('Error deleting table: ' + error.message)
    }
  }

  const handleRoll = () => {
    if (!selectedTable || selectedTable.entries.length === 0) return
    const randomEntry = selectedTable.entries[Math.floor(Math.random() * selectedTable.entries.length)]
    setHistory([randomEntry, ...history])
    if (isMobile) {
      setMobileView('history')
    }
  }

  const canEdit = (table: RandomTable) => {
    if (!user) return false
    
    const userId = String(user.id)
    const createdBy = String(table.created_by)
    const isCreator = userId === createdBy
    const isAdmin = userRole === 'admin'
    
    return isCreator || isAdmin
  }

  const handleTableSelect = (table: RandomTable) => {
    setSelectedTable(table)
    if (isMobile) {
      setMobileView('entries')
    }
  }

  const renderCreateModal = () => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: isMobile ? '0' : '2rem'
    }} onClick={() => setShowCreateModal(false)}>
      <div style={{
        background: theme.colors.background.secondary,
        border: `1px solid ${theme.colors.border.primary}`,
        borderRadius: isMobile ? 0 : theme.borderRadius,
        padding: isMobile ? '1rem' : '2rem',
        width: isMobile ? '100vw' : '90%',
        maxWidth: isMobile ? '100vw' : '500px',
        height: isMobile ? '100vh' : 'auto',
        maxHeight: isMobile ? '100vh' : '80vh',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        marginLeft: isMobile ? '-7rem' : '-2rem'
      }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontSize: isMobile ? '1.25rem' : '1.5rem', marginBottom: '1rem' }}>
          Create New Table
        </h2>
        <input
          type="text"
          placeholder="Table Title"
          value={newTableTitle}
          onChange={(e) => setNewTableTitle(e.target.value)}
          style={{
            ...styles.input,
            fontSize: isMobile ? '16px' : '1rem',
            marginBottom: '1rem',
            width: '100%',
            boxSizing: 'border-box'
          }}
        />
        <textarea
          placeholder="Entries (one per line)"
          value={newTableEntries}
          onChange={(e) => setNewTableEntries(e.target.value)}
          style={{
            ...styles.input,
            height: isMobile ? '150px' : '200px',
            resize: 'vertical',
            fontSize: isMobile ? '16px' : '1rem',
            marginBottom: '1rem',
            width: '100%',
            boxSizing: 'border-box',
            flex: isMobile ? 1 : 'none'
          }}
        />
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '0.75rem' : '1rem'
        }}>
          <button
            onClick={handleCreateTable}
            style={{
              ...styles.button.primary,
              flex: isMobile ? 'none' : 1,
              width: isMobile ? '100%' : 'auto',
              padding: isMobile ? '0.875rem' : '0.75rem 1.5rem'
            }}
          >
            Create
          </button>
          <button
            onClick={() => setShowCreateModal(false)}
            style={{
              ...styles.button.secondary,
              flex: isMobile ? 'none' : 1,
              width: isMobile ? '100%' : 'auto',
              padding: isMobile ? '0.875rem' : '0.75rem 1.5rem'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )

  const renderEditModal = () => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 5,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: isMobile ? '0' : '2rem'
    }} onClick={() => setShowEditModal(false)}>
      <div style={{
        background: theme.colors.background.secondary,
        border: `1px solid ${theme.colors.border.primary}`,
        borderRadius: isMobile ? 0 : theme.borderRadius,
        padding: isMobile ? '1rem' : '2rem',
        width: isMobile ? '100vw' : '90%',
        maxWidth: isMobile ? '100vw' : '500px',
        height: isMobile ? '100vh' : 'auto',
        maxHeight: isMobile ? '100vh' : '80vh',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontSize: isMobile ? '1.25rem' : '1.5rem', marginBottom: '1rem' }}>
          Edit Table
        </h2>
        <input
          type="text"
          placeholder="Table Title"
          value={newTableTitle}
          onChange={(e) => setNewTableTitle(e.target.value)}
          style={{
            ...styles.input,
            fontSize: isMobile ? '16px' : '1rem',
            marginBottom: '1rem',
            width: '100%',
            boxSizing: 'border-box'
          }}
        />
        <textarea
          placeholder="Entries (one per line)"
          value={newTableEntries}
          onChange={(e) => setNewTableEntries(e.target.value)}
          style={{
            ...styles.input,
            height: isMobile ? '150px' : '200px',
            resize: 'vertical',
            fontSize: isMobile ? '16px' : '1rem',
            marginBottom: '1rem',
            width: '100%',
            boxSizing: 'border-box',
            flex: isMobile ? 1 : 'none'
          }}
        />
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '0.75rem' : '1rem'
        }}>
          <button
            onClick={handleUpdateTable}
            style={{
              ...styles.button.primary,
              flex: isMobile ? 'none' : 1,
              width: isMobile ? '100%' : 'auto',
              padding: isMobile ? '0.875rem' : '0.75rem 1.5rem'
            }}
          >
            Update
          </button>
          <button
            onClick={handleDeleteTable}
            style={{
              ...styles.button.secondary,
              background: theme.colors.danger,
              color: 'white',
              flex: isMobile ? 'none' : 1,
              width: isMobile ? '100%' : 'auto',
              padding: isMobile ? '0.875rem' : '0.75rem 1.5rem'
            }}
          >
            Delete
          </button>
          <button
            onClick={() => {
              setShowEditModal(false)
              setEditingTable(null)
              setNewTableTitle('')
              setNewTableEntries('')
            }}
            style={{
              ...styles.button.secondary,
              flex: isMobile ? 'none' : 1,
              width: isMobile ? '100%' : 'auto',
              padding: isMobile ? '0.875rem' : '0.75rem 1.5rem'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )

  if (authLoading || loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!user) return null

  // Mobile Layout
  if (isMobile) {
    return (
      <main style={{
        padding: '1rem',
        background: theme.colors.background.main,
        color: theme.colors.text.primary,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h1 style={{ ...styles.heading1, fontSize: '1.5rem', marginBottom: '1rem' }}>Random Tables</h1>
        
        {/* Mobile Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1rem'
        }}>
          <button
            onClick={() => setMobileView('tables')}
            style={{
              ...styles.button.secondary,
              flex: 1,
              background: mobileView === 'tables' ? theme.colors.primary : theme.colors.background.secondary
            }}
          >
            Tables
          </button>
          <button
            onClick={() => setMobileView('entries')}
            style={{
              ...styles.button.secondary,
              flex: 1,
              background: mobileView === 'entries' ? theme.colors.primary : theme.colors.background.secondary,
              opacity: selectedTable ? 1 : 0.5
            }}
            disabled={!selectedTable}
          >
            Entries
          </button>
          <button
            onClick={() => setMobileView('history')}
            style={{
              ...styles.button.secondary,
              flex: 1,
              background: mobileView === 'history' ? theme.colors.primary : theme.colors.background.secondary
            }}
          >
            History
          </button>
        </div>

        {/* Mobile Content */}
        <div style={{
          border: `1px solid ${theme.colors.border.primary}`,
          borderRadius: theme.borderRadius,
          padding: '1rem',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {mobileView === 'tables' && (
            <>
              <button
                onClick={() => setShowCreateModal(true)}
                style={{ ...styles.button.primary, width: '100%', marginBottom: '1rem' }}
              >
                Create New Table
              </button>
              {/* <h2 style={{ margin: '0 0 1rem 0' }}>Tables</h2> */}
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {tables.map(table => (
                  <div
                    key={table.id}
                    style={{
                      display: 'flex',
                      gap: '0.5rem',
                      marginBottom: '0.5rem',
                      width: '100%'
                    }}
                  >
                    <button
                      onClick={() => handleTableSelect(table)}
                      style={{
                        ...styles.button.secondary,
                        flex: 1,
                        textAlign: 'left'
                      }}
                    >
                      {table.title}
                    </button>
                    {canEdit(table) && (
                      <button
                        onClick={(e) => handleEditClick(table, e)}
                        style={{
                          ...styles.button.secondary,
                          padding: '0.5rem 1rem',
                          flexShrink: 0
                        }}
                      >
                        Edit
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {mobileView === 'entries' && (
            <>
              {selectedTable ? (
                <>
                  <button onClick={handleRoll} style={{ ...styles.button.primary, marginBottom: '1rem' }}>
                    Roll on {selectedTable.title}
                  </button>
                  {/* <h3 style={{ margin: '0 0 1rem 0' }}>Entries</h3> */}
                  <div style={{ overflowY: 'auto', flex: 1 }}>
                    {selectedTable.entries.map((entry, index) => (
                      <button
                        key={index}
                        onClick={() => setHistory([entry, ...history])}
                        style={{
                          ...styles.button.secondary,
                          width: '100%',
                          marginBottom: '0.5rem',
                          textAlign: 'left'
                        }}
                      >
                        {entry}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <p>Select a table to view entries.</p>
              )}
            </>
          )}

          {mobileView === 'history' && (
            <>
              <h3 style={{ 
                margin: '0 0 1rem 0',
                fontSize: '1rem',
                textAlign: 'center',
                padding: '0.75rem',
                fontWeight: 'bold'
              }}>Generation History</h3>
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {history.length > 0 ? (
                  history.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        ...styles.button.secondary,
                        width: '100%',
                        marginBottom: '0.5rem',
                        textAlign: 'left',
                        cursor: 'default'
                      }}
                    >
                      {item}
                    </div>
                  ))
                ) : (
                  <p>No rolls yet.</p>
                )}
              </div>
            </>
          )}
        </div>

        {showCreateModal && renderCreateModal()}
        {showEditModal && renderEditModal()}
      </main>
    )
  }

  // Desktop Layout
  return (
    <main style={{
      padding: '2rem',
      background: theme.colors.background.main,
      color: theme.colors.text.primary,
      minHeight: '100vh'
    }}>
      <h1 style={styles.heading1}>Random Tables</h1>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '2rem',
        height: 'calc(100vh - 200px)'
      }}>
        {/* Left Column: Tables List */}
        <div style={{
          border: `1px solid ${theme.colors.border.primary}`,
          borderRadius: theme.borderRadius,
          padding: '1rem',
          display: 'grid',
          gridTemplateRows: 'auto auto 1fr',
          gap: '1rem',
          overflow: 'hidden'
        }}>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{ ...styles.button.primary, width: '100%' }}
          >
            Create New Table
          </button>
          {/* <h2 style={{ margin: 0 }}>Tables</h2> */}
          <div style={{ overflowY: 'auto', paddingRight: '1rem', marginRight: '-1rem' }}>
            {tables.map(table => (
              <div
                key={table.id}
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                  width: '100%'
                }}
              >
                <button
                  onClick={() => setSelectedTable(table)}
                  style={{
                    ...styles.button.secondary,
                    flex: 1,
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    const target = e.currentTarget as HTMLButtonElement
                    target.style.transform = 'scale(1.0125)'
                  }}
                  onMouseLeave={(e) => {
                    const target = e.currentTarget as HTMLButtonElement
                    target.style.transform = 'scale(1)'
                  }}
                >
                  {table.title}
                </button>
                {canEdit(table) && (
                  <button
                    onClick={(e) => handleEditClick(table, e)}
                    style={{
                      ...styles.button.secondary,
                      padding: '0.5rem 1rem',
                      flexShrink: 0
                    }}
                    onMouseEnter={(e) => {
                      const target = e.currentTarget as HTMLButtonElement
                      target.style.transform = 'scale(1.0125)'
                    }}
                    onMouseLeave={(e) => {
                      const target = e.currentTarget as HTMLButtonElement
                      target.style.transform = 'scale(1)'
                    }}
                  >
                    Edit
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Middle Column: Selected Table Entries */}
        <div style={{
          border: `1px solid ${theme.colors.border.primary}`,
          borderRadius: theme.borderRadius,
          padding: '1rem',
          display: 'grid',
          gridTemplateRows: 'auto auto 1fr',
          gap: '1rem',
          overflow: 'hidden'
        }}>
          {selectedTable ? (
            <>
              <button onClick={handleRoll} style={styles.button.primary}>
                Roll on {selectedTable.title}
              </button>
              {/* <h3 style={{ margin: 0 }}>Entries</h3> */}
              <div style={{ overflowY: 'auto', paddingRight: '1rem', marginRight: '-1rem' }}>
                {selectedTable.entries.map((entry, index) => (
                  <button
                    key={index}
                    onClick={() => setHistory([entry, ...history])}
                    style={{
                      ...styles.button.secondary,
                      width: '100%',
                      marginBottom: '0.5rem',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => {
                      const target = e.currentTarget as HTMLButtonElement
                      target.style.transform = 'scale(1.0125)'
                    }}
                    onMouseLeave={(e) => {
                      const target = e.currentTarget as HTMLButtonElement
                      target.style.transform = 'scale(1)'
                    }}
                  >
                    {entry}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p>Select a table to view entries.</p>
          )}
        </div>

        {/* Right Column: Generation History */}
        <div style={{
          border: `1px solid ${theme.colors.border.primary}`,
          borderRadius: theme.borderRadius,
          padding: '1rem',
          display: 'grid',
          gridTemplateRows: 'auto 1fr',
          gap: '1rem',
          overflow: 'hidden'
        }}>
          <h3 style={{ 
            margin: 0,
            fontSize: '1rem',
            textAlign: 'center',
            padding: '0.75rem',
            fontWeight: 'bold'
          }}>Generation History</h3>
          <div style={{ overflowY: 'auto', paddingRight: '1rem', marginRight: '-1rem' }}>
            {history.length > 0 ? (
              history.map((item, index) => (
                <div
                  key={index}
                  style={{
                    ...styles.button.secondary,
                    width: '100%',
                    marginBottom: '0.5rem',
                    textAlign: 'left',
                    cursor: 'default'
                  }}
                >
                  {item}
                </div>
              ))
            ) : (
              <p>No rolls yet.</p>
            )}
          </div>
        </div>
      </div>

      {showCreateModal && renderCreateModal()}
      {showEditModal && renderEditModal()}
    </main>
  )
}