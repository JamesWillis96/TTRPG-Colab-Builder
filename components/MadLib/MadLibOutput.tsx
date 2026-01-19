'use client'

import { useMemo, useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useMadLib } from '../../contexts/MadLibContext'
import type { MadLibTemplate } from '../../lib/madlibTemplates'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { toSlug, WIKI_CATEGORIES } from '../../lib/wiki'

export default function MadLibOutput({ template }: { template: MadLibTemplate }) {
  const { theme } = useTheme()
  const { renderOutput, filledCount, totalCount } = useMadLib()
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [wikiCategory, setWikiCategory] = useState<string>('Lore')
  const [markdownTheme, setMarkdownTheme] = useState<'air' | 'modest' | 'retro' | 'splendor' | 'github'>('github')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const output = useMemo(() => renderOutput(), [renderOutput])

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    window.setTimeout(() => setToast(null), 2200)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output)
      showToast('Copied to clipboard')
    } catch (_) {
      showToast('Copy failed', 'error')
    }
  }

  const extractTitle = (): string => {
    const m = output.match(/^#\s+(.*)$/m)
    if (m && m[1]) return m[1].trim()
    return template.title
  }

  const mapCategory = (): string => {
    switch (template.category) {
      case 'NPCs': return 'NPC'
      case 'Locations': return 'Location'
      case 'Items': return 'Item'
      case 'Encounters': return 'Event'
      case 'Session Hooks': return 'Event'
      default: return 'Lore'
    }
  }

  const handleSaveToWiki = async () => {
    if (!user) return
    setSaving(true)
    try {
      const title = extractTitle()
      const slug = toSlug(title)
      const category = wikiCategory || mapCategory()
      const content = output
      const { data, error } = await supabase
        .from('wiki_pages')
        .insert({
          title,
          slug,
          category,
          content,
          author_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          markdown_theme: markdownTheme,
        })
        .select()
        .single()
      if (error) throw error
      showToast('Saved to Wiki')
    } catch (_) {
      showToast('Save failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md, position: 'relative' }}>
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: theme.spacing.lg,
            right: theme.spacing.lg,
            background: toast.type === 'success' ? theme.colors.background.success : theme.colors.background.error,
            color: toast.type === 'success' ? theme.colors.text.primary : theme.colors.danger,
            border: `1px solid ${toast.type === 'success' ? theme.colors.success : theme.colors.danger}`,
            padding: `${theme.spacing.sm} ${theme.spacing.md}`,
            borderRadius: theme.borderRadius,
            boxShadow: theme.shadow,
            fontSize: '0.9rem',
            zIndex: 9999,
          }}
        >
          {toast.message}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `2px solid ${theme.colors.border.primary}`, paddingBottom: theme.spacing.xs }}>
        <h2 style={{ margin: 0, color: theme.colors.text.primary, fontSize: '1.4rem' }}>Story Output</h2>
        <span style={{ color: theme.colors.text.secondary, fontSize: '0.9rem', fontWeight: 600 }}>
             {filledCount}/{totalCount} Blanks Filled
        </span>
      </div>
      
      <div
        className="markdown-content"
        style={{
          border: `1px solid ${theme.colors.border.secondary}`,
          borderRadius: theme.borderRadius,
          background: theme.colors.background.secondary,
          color: theme.colors.text.primary,
          padding: theme.spacing.lg,
          whiteSpace: 'pre-wrap',
          minHeight: '300px',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
        }}
      >
        {output}
        <div style={{ marginTop: theme.spacing.xl, borderTop: `1px dashed ${theme.colors.border.primary}`, paddingTop: theme.spacing.sm, fontSize: '0.85rem', color: theme.colors.text.secondary }}>
            Generated from Mad Lib template: {template.title}
        </div>
      </div>

       {/* Footer Controls */}
       <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: theme.spacing.md,
        padding: theme.spacing.md,
        background: theme.colors.background.tertiary,
        borderRadius: theme.borderRadius,
        border: `1px solid ${theme.colors.border.primary}`
      }}>
        
        {/* Style Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
             <label style={{ fontSize: '0.9rem', color: theme.colors.text.secondary, fontWeight: 600 }}>Theme:</label>
             <select
                value={markdownTheme}
                onChange={(e) => setMarkdownTheme(e.target.value as any)}
                style={{
                  padding: theme.spacing.xs,
                  borderRadius: theme.borderRadius,
                  border: `1px solid ${theme.colors.border.primary}`,
                  background: theme.colors.background.main,
                  color: theme.colors.text.primary,
                  minWidth: 120,
                  fontSize: '0.9rem'
                }}
              >
                {['github','air','modest','retro','splendor'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: theme.spacing.sm, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs, marginRight: theme.spacing.sm }}>
                 <label style={{ fontSize: '0.9rem', color: theme.colors.text.secondary }}>Category:</label>
                 <select
                    value={wikiCategory}
                    onChange={(e) => setWikiCategory(e.target.value)}
                    style={{
                      padding: theme.spacing.xs,
                      borderRadius: theme.borderRadius,
                      border: `1px solid ${theme.colors.border.primary}`,
                      background: theme.colors.background.main,
                      color: theme.colors.text.primary,
                       minWidth: 140,
                       fontSize: '0.9rem'
                    }}
                  >
                    {Array.from(WIKI_CATEGORIES).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
            </div>

            <button
                type="button"
                onClick={handleCopy}
                style={{
                  padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                  borderRadius: theme.borderRadius,
                  border: `1px solid ${theme.colors.border.secondary}`,
                  background: theme.colors.background.main,
                  color: theme.colors.text.primary,
                  cursor: 'pointer',
                  fontWeight: 600
                }}
            >
                📋 Copy
            </button>
            <button
                type="button"
                disabled={!user || saving}
                onClick={handleSaveToWiki}
                style={{
                  padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                  borderRadius: theme.borderRadius,
                  border: 'none',
                  background: !user || saving ? theme.colors.background.tertiary : theme.colors.primary,
                  color: !user || saving ? theme.colors.text.muted : '#fff', // Better disabled state
                  cursor: !user || saving ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  boxShadow: !user || saving ? 'none' : theme.shadow
                }}
            >
                {saving ? 'Saving...' : '💾 Save to Wiki'}
            </button>
        </div>
      </div>
    </div>
  )
}
