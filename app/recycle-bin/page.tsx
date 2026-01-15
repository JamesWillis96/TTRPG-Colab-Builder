'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { supabase } from '../../lib/supabase'

interface DeletedRecord {
  id: string
  title: string
  deleted_at: string
  deleted_by?: string | null
  extra?: string
}

type TableName = 'sessions' | 'map_pois' | 'wiki_pages' | 'random_tables'

type Section = {
  label: string
  table: TableName
  items: DeletedRecord[]
}

export default function RecycleBinPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const { theme, styles } = useTheme()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [restoring, setRestoring] = useState<Record<string, boolean>>({})
  const [sessions, setSessions] = useState<DeletedRecord[]>([])
  const [pois, setPois] = useState<DeletedRecord[]>([])
  const [wikiPages, setWikiPages] = useState<DeletedRecord[]>([])
  const [tables, setTables] = useState<DeletedRecord[]>([])

  const isAdmin = profile?.role === 'admin'

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, router, user])

  useEffect(() => {
    if (user && isAdmin) {
      loadDeleted()
    } else if (user && !isAdmin) {
      setLoading(false)
    }
  }, [user, isAdmin])

  const loadDeleted = async () => {
    setLoading(true)
    try {
      const [sessionRes, poiRes, wikiRes, tableRes] = await Promise.all([
        supabase
          .from('sessions')
          .select('id, title, deleted_at, deleted_by, date_time')
          .not('deleted_at', 'is', null)
          .order('deleted_at', { ascending: false }),
        supabase
          .from('map_pois')
          .select('id, title, deleted_at, deleted_by, category')
          .not('deleted_at', 'is', null)
          .order('deleted_at', { ascending: false }),
        supabase
          .from('wiki_pages')
          .select('id, title, slug, deleted_at, deleted_by, category')
          .not('deleted_at', 'is', null)
          .order('deleted_at', { ascending: false }),
        supabase
          .from('random_tables')
          .select('id, title, deleted_at, deleted_by, category')
          .not('deleted_at', 'is', null)
          .order('deleted_at', { ascending: false })
      ])

      setSessions((sessionRes.data || []).map(row => ({
        id: row.id,
        title: row.title || 'Untitled session',
        deleted_at: row.deleted_at,
        deleted_by: (row as any).deleted_by || null,
        extra: row.date_time ? new Date(row.date_time).toLocaleString() : undefined
      })))

      setPois((poiRes.data || []).map(row => ({
        id: row.id,
        title: row.title || 'Untitled POI',
        deleted_at: row.deleted_at,
        deleted_by: (row as any).deleted_by || null,
        extra: row.category ? `Category: ${row.category}` : undefined
      })))

      setWikiPages((wikiRes.data || []).map(row => ({
        id: row.id,
        title: row.title || 'Untitled page',
        deleted_at: row.deleted_at,
        deleted_by: (row as any).deleted_by || null,
        extra: row.category ? `Category: ${row.category}` : undefined
      })))

      setTables((tableRes.data || []).map(row => ({
        id: row.id,
        title: row.title || 'Untitled table',
        deleted_at: row.deleted_at,
        deleted_by: (row as any).deleted_by || null,
        extra: row.category ? `Category: ${row.category}` : undefined
      })))
    } catch (err) {
      console.error('Failed to load recycle bin', err)
    } finally {
      setLoading(false)
    }
  }

  const restoreItem = async (table: TableName, id: string) => {
    const key = `${table}-${id}`
    setRestoring(prev => ({ ...prev, [key]: true }))
    try {
      const { error } = await supabase
        .from(table)
        .update({ deleted_at: null, deleted_by: null })
        .eq('id', id)
      if (error) throw error
      await loadDeleted()
    } catch (err) {
      alert('Restore failed. ' + ((err as any)?.message || ''))
    } finally {
      setRestoring(prev => ({ ...prev, [key]: false }))
    }
  }

  const sections: Section[] = useMemo(() => ([
    { label: 'Sessions', table: 'sessions', items: sessions },
    { label: 'Map POIs', table: 'map_pois', items: pois },
    { label: 'Wiki Pages', table: 'wiki_pages', items: wikiPages },
    { label: 'Random Tables', table: 'random_tables', items: tables }
  ]), [sessions, pois, wikiPages, tables])

  if (authLoading || loading) {
    return <div style={{ padding: '2rem', color: theme.colors.text.secondary }}>Loading…</div>
  }

  if (!user) return null

  if (!isAdmin) {
    return (
      <main style={styles.container}>
        <h1 style={styles.heading1}>Recycle Bin</h1>
        <p style={{ color: theme.colors.text.secondary }}>Admins only.</p>
      </main>
    )
  }

  return (
    <main style={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <h1 style={styles.heading1}>Recycle Bin</h1>
          <p style={{ color: theme.colors.text.secondary, marginTop: '0.25rem' }}>
            Recently deleted items stay here until you restore them. Hard deletes are disabled.
          </p>
        </div>
        <button onClick={loadDeleted} style={styles.button.secondary}>Refresh</button>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {sections.map(section => (
          <div key={section.table} style={{ ...styles.card, padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h2 style={{ ...styles.heading2, margin: 0 }}>{section.label}</h2>
              <span style={{ color: theme.colors.text.secondary, fontSize: '0.9em' }}>
                {section.items.length} item{section.items.length === 1 ? '' : 's'}
              </span>
            </div>

            {section.items.length === 0 ? (
              <div style={{ color: theme.colors.text.secondary }}>Nothing here.</div>
            ) : (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {section.items.map(item => {
                  const key = `${section.table}-${item.id}`
                  return (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        alignItems: 'center',
                        border: `1px solid ${theme.colors.border.primary}`,
                        borderRadius: theme.borderRadius,
                        padding: '0.75rem',
                        background: theme.colors.background.secondary
                      }}
                    >
                      <div style={{ display: 'grid', gap: '0.25rem' }}>
                        <div style={{ color: theme.colors.text.primary, fontWeight: 600 }}>{item.title}</div>
                        <div style={{ color: theme.colors.text.secondary, fontSize: '0.9em' }}>
                          Deleted {new Date(item.deleted_at).toLocaleString()}{item.extra ? ` • ${item.extra}` : ''}
                        </div>
                      </div>
                      <button
                        onClick={() => restoreItem(section.table, item.id)}
                        style={styles.button.primary}
                        disabled={!!restoring[key]}
                      >
                        {restoring[key] ? 'Restoring…' : 'Restore'}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  )
}
