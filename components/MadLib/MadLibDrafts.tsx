'use client'

import { useEffect, useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useMadLib } from '../../contexts/MadLibContext'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

interface DraftRow {
  id: string
  updated_at: string
  answers: Record<string, { value: string; rolled?: boolean }>
}

export default function MadLibDrafts() {
  const { theme } = useTheme()
  const { selectedTemplate, loadLatestDraft } = useMadLib()
  const { user } = useAuth()
  const [drafts, setDrafts] = useState<DraftRow[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!user || !selectedTemplate) return
      setLoading(true)
      const { data } = await supabase
        .from('madlib_fills')
        .select('id, updated_at, answers')
        .eq('user_id', user.id)
        .eq('template_id', selectedTemplate.id)
        .eq('is_draft', true)
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })
        .limit(10)
      setDrafts((data as any) || [])
      setLoading(false)
    }
    load()
  }, [user, selectedTemplate?.id])

  if (!user || !selectedTemplate) return null

  return (
    <div style={{
      border: `1px solid ${theme.colors.border.secondary}`,
      borderRadius: theme.borderRadius,
      background: theme.colors.background.secondary,
      color: theme.colors.text.primary,
      padding: theme.spacing.md,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Draft History</h3>
        {loading ? <span style={{ color: theme.colors.text.secondary }}>Loading…</span> : null}
      </div>
      {drafts.length === 0 ? (
        <div style={{ color: theme.colors.text.secondary }}>No drafts yet.</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {drafts.map(d => {
            const filled = Object.values(d.answers || {}).filter(a => (a?.value ?? '').trim()).length
            return (
              <li key={d.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: `1px solid ${theme.colors.border.primary}`,
                paddingTop: theme.spacing.sm,
                marginTop: theme.spacing.sm,
              }}>
                <div>
                  <div style={{ fontWeight: 600 }}>Draft from {new Date(d.updated_at).toLocaleString()}</div>
                  <div style={{ color: theme.colors.text.secondary }}>{filled} filled</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    // loadLatestDraft loads the most recent; for specific draft, extend context later
                    loadLatestDraft()
                  }}
                  style={{
                    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                    borderRadius: theme.borderRadius,
                    border: `1px solid ${theme.colors.border.primary}`,
                    background: theme.colors.background.main,
                    color: theme.colors.text.primary,
                  }}
                >
                  Load
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
