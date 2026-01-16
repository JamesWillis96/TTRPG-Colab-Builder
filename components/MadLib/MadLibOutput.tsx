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

  const output = useMemo(() => renderOutput(), [renderOutput])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output)
      // Silently succeed; future: toast
    } catch (_) {
      // ignore
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
      // Optional: navigate to wiki page or signal success
    } catch (_) {
      // silent fail for now
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0, color: theme.colors.text.primary }}>Preview</h2>
        <div style={{ display: 'flex', gap: theme.spacing.sm, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ color: theme.colors.text.secondary }}>{filledCount}/{totalCount}</span>
          <select
            value={wikiCategory}
            onChange={(e) => setWikiCategory(e.target.value)}
            style={{
              padding: theme.spacing.xs,
              borderRadius: theme.borderRadius,
              border: `1px solid ${theme.colors.border.primary}`,
              background: theme.colors.background.main,
              color: theme.colors.text.primary,
              minWidth: 160,
            }}
          >
            {Array.from(WIKI_CATEGORIES).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={markdownTheme}
            onChange={(e) => setMarkdownTheme(e.target.value as any)}
            style={{
              padding: theme.spacing.xs,
              borderRadius: theme.borderRadius,
              border: `1px solid ${theme.colors.border.primary}`,
              background: theme.colors.background.main,
              color: theme.colors.text.primary,
              minWidth: 140,
            }}
          >
            {['github','air','modest','retro','splendor'].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleCopy}
            style={{
              padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
              borderRadius: theme.borderRadius,
              border: `1px solid ${theme.colors.border.primary}`,
              background: theme.colors.background.main,
              color: theme.colors.text.primary,
            }}
          >
            Copy
          </button>
          <button
            type="button"
            disabled={!user || saving}
            onClick={handleSaveToWiki}
            style={{
              padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
              borderRadius: theme.borderRadius,
              border: `1px solid ${theme.colors.border.primary}`,
              background: theme.colors.primary,
              color: '#fff',
              opacity: !user || saving ? 0.7 : 1,
            }}
          >
            Save to Wiki
          </button>
        </div>
      </div>
      <div
        className="markdown-content"
        style={{
          border: `1px solid ${theme.colors.border.secondary}`,
          borderRadius: theme.borderRadius,
          background: theme.colors.background.secondary,
          color: theme.colors.text.primary,
          padding: theme.spacing.md,
          whiteSpace: 'pre-wrap',
        }}
      >
        {output}\n\n---\n\nGenerated from Mad Lib template: {template.title}
      </div>
    </div>
  )
}
