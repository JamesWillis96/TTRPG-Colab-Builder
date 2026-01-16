'use client'

import { useMemo, useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useMadLib } from '../../contexts/MadLibContext'
import type { MadLibTemplate, MadLibBlank } from '../../lib/madlibTemplates'

function InputForBlank({ blank, value, onChange }: { blank: MadLibBlank; value: string; onChange: (v: string) => void }) {
  const { theme } = useTheme()
  const isLong = blank.type === 'consequence'
  const commonStyle: React.CSSProperties = {
    width: '100%',
    padding: theme.spacing.sm,
    border: `1px solid ${theme.colors.border.primary}`,
    borderRadius: theme.borderRadius,
    background: theme.colors.background.main,
    color: theme.colors.text.primary,
  }

  if (isLong) {
    return (
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={blank.description}
        style={commonStyle}
      />
    )
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={blank.description}
      style={commonStyle}
    />
  )
}

export default function MadLibForm({ template }: { template: MadLibTemplate }) {
  const { theme } = useTheme()
  const { answers, setAnswer, filledCount, totalCount, rollBlank, isSaving, lastSavedAt, getCandidateTables, rollFromTable } = useMadLib()
  const [rolling, setRolling] = useState<Record<string, boolean>>({})
  const [tableMenu, setTableMenu] = useState<Record<string, Array<{ id: string; title: string; category: string }>>>({})
  const [noMatch, setNoMatch] = useState<Record<string, boolean>>({})

  const progressText = useMemo(() => `${filledCount}/${totalCount} filled`, [filledCount, totalCount])
  const progressPct = useMemo(() => (totalCount ? Math.round((filledCount / totalCount) * 100) : 0), [filledCount, totalCount])
  const savedText = useMemo(() => {
    if (isSaving) return 'Saving…'
    if (!lastSavedAt) return ''
    const diff = Math.round((Date.now() - lastSavedAt.getTime()) / 1000)
    if (diff < 5) return 'Saved just now'
    if (diff < 60) return `Saved ${diff}s ago`
    const mins = Math.round(diff / 60)
    return `Saved ${mins}m ago`
  }, [isSaving, lastSavedAt])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: theme.colors.background.secondary, paddingBottom: theme.spacing.sm, zIndex: 1 }}>
        <h2 style={{ margin: 0, color: theme.colors.text.primary }}>Fill Blanks</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
          <span style={{ color: theme.colors.text.secondary }}>{progressText}</span>
          <span style={{ color: theme.colors.text.muted }}>{savedText}</span>
        </div>
      </div>
      <div style={{ width: '100%', height: 6, background: theme.colors.background.tertiary, borderRadius: theme.borderRadius }}>
        <div style={{ width: `${progressPct}%`, height: '100%', background: theme.colors.primary, borderRadius: theme.borderRadius, transition: 'width 0.2s ease' }} />
      </div>
      {template.blanks.map((blank) => (
        <div key={blank.id} style={{
          border: `1px solid ${theme.colors.border.secondary}`,
          borderRadius: theme.borderRadius,
          padding: theme.spacing.md,
          background: theme.colors.background.secondary,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.sm }}>
            <div>
              <div style={{ fontWeight: 600, color: theme.colors.text.primary }}>{blank.name}</div>
              <div style={{ fontSize: '0.9rem', color: theme.colors.text.secondary }}>{blank.description}</div>
            </div>
            {blank.allowRoll && (
              <button
                type="button"
                disabled={!!rolling[blank.id]}
                title={rolling[blank.id] ? 'Rolling...' : 'Roll from Random Tables'}
                style={{
                  padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                  borderRadius: theme.borderRadius,
                  border: `1px solid ${theme.colors.border.primary}`,
                  background: theme.colors.background.main,
                  color: theme.colors.text.primary,
                  cursor: rolling[blank.id] ? 'wait' : 'pointer',
                }}
              >
                <span onClick={async () => {
                  setRolling(prev => ({ ...prev, [blank.id]: true }))
                  try {
                    setNoMatch(prev => ({ ...prev, [blank.id]: false }))
                    const prevValue = answers[blank.id] ?? ''
                    const candidates = await getCandidateTables(blank.id)
                    if (!candidates || candidates.length <= 1) {
                      await rollBlank(blank.id)
                      const afterValue = answers[blank.id] ?? ''
                      if ((!candidates || candidates.length === 0) && prevValue === afterValue) {
                        setNoMatch(prev => ({ ...prev, [blank.id]: true }))
                      }
                    } else {
                      setTableMenu(prev => ({ ...prev, [blank.id]: candidates }))
                    }
                  } finally {
                    setRolling(prev => ({ ...prev, [blank.id]: false }))
                  }
                }}>Roll</span>
              </button>
            )}
          </div>

          {noMatch[blank.id] && (
            <div style={{ fontSize: '0.85rem', color: theme.colors.text.secondary, marginBottom: theme.spacing.xs }}>
              No matching tables found for this blank.
            </div>
          )}

          {tableMenu[blank.id] && tableMenu[blank.id].length > 1 && (
            <div style={{ marginTop: theme.spacing.xs, display: 'flex', gap: theme.spacing.xs, flexWrap: 'wrap' }}>
              {tableMenu[blank.id].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={async () => {
                    await rollFromTable(blank.id, t.id)
                    setTableMenu(prev => ({ ...prev, [blank.id]: [] }))
                    setNoMatch(prev => ({ ...prev, [blank.id]: false }))
                  }}
                  style={{
                    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                    borderRadius: theme.borderRadius,
                    border: `1px solid ${theme.colors.border.secondary}`,
                    background: theme.colors.background.main,
                    color: theme.colors.text.secondary,
                  }}
                >{t.title}</button>
              ))}
            </div>
          )}

          <InputForBlank
            blank={blank}
            value={answers[blank.id] ?? ''}
            onChange={(v) => setAnswer(blank.id, v)}
          />

          {(blank.constraints && blank.constraints.length > 0) || (blank.examples && blank.examples.length > 0) ? (
            <div style={{ marginTop: theme.spacing.sm, display: 'flex', gap: theme.spacing.lg, flexWrap: 'wrap' }}>
              {blank.constraints && blank.constraints.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.85rem', color: theme.colors.text.secondary, marginBottom: 4 }}>Constraints</div>
                  <ul style={{ margin: 0, paddingLeft: '1rem', color: theme.colors.text.secondary }}>
                    {blank.constraints.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
              {blank.examples && blank.examples.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.85rem', color: theme.colors.text.secondary, marginBottom: 4 }}>Examples</div>
                  <div style={{ display: 'flex', gap: theme.spacing.xs, flexWrap: 'wrap' }}>
                    {blank.examples.map((ex, idx) => (
                      <span
                        key={idx}
                        onClick={() => setAnswer(blank.id, ex)}
                        style={{
                          border: `1px solid ${theme.colors.border.secondary}`,
                          background: theme.colors.background.main,
                          color: theme.colors.text.secondary,
                          padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                          borderRadius: theme.borderRadius,
                          cursor: 'pointer',
                          userSelect: 'none',
                        }}
                      >
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  )
}
