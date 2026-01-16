'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { useTheme } from '../../../contexts/ThemeContext'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

import type { MadLibBlank, MadLibTemplate } from '../../../lib/madlibTemplates'

const CATEGORIES = ['NPCs', 'Encounters', 'Items', 'Locations', 'Session Hooks'] as const
const DIFFICULTIES = ['simple', 'moderate', 'complex'] as const
const STAKES = ['low', 'medium', 'high'] as const
const BLANK_TYPES = ['creative', 'constrained', 'consequence', 'specific'] as const

type Step = 'basics' | 'blanks' | 'template' | 'preview'

export default function CreateMadLibTemplatePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { theme, styles } = useTheme()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const [currentStep, setCurrentStep] = useState<Step>('basics')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('NPCs')
  const [difficulty, setDifficulty] = useState<(typeof DIFFICULTIES)[number]>('simple')
  const [stakes, setStakes] = useState<(typeof STAKES)[number]>('medium')
  const [toneInput, setToneInput] = useState('')
  const tones = useMemo(() => toneInput.split(',').map(t => t.trim()).filter(Boolean), [toneInput])
  const [templateText, setTemplateText] = useState('# [TITLE]\n\nYour content with [BLANK_IDS] here...')
  const [blanks, setBlanks] = useState<MadLibBlank[]>([])
  const [saving, setSaving] = useState(false)

  const addBlank = () => {
    const id = prompt('Blank ID (UPPERCASE letters, underscores)')?.trim()
    if (!id) return
    setBlanks(prev => ([...prev, { id, name: id, type: 'creative', description: '', allowRoll: false } as MadLibBlank]))
  }

  const updateBlank = (index: number, patch: Partial<MadLibBlank>) => {
    setBlanks(prev => prev.map((b, i) => i === index ? { ...b, ...patch } : b))
  }

  const removeBlank = (index: number) => {
    setBlanks(prev => prev.filter((_, i) => i !== index))
  }

  const canSave = useMemo(() => (
    !!user && title.trim() && templateText.trim() && blanks.length > 0
  ), [user, title, templateText, blanks])

  const handleSave = async () => {
    if (!user || !canSave) return
    setSaving(true)
    const payload = {
      title,
      description,
      category,
      difficulty,
      tone: tones,
      stakes,
      template_text: templateText,
      blanks,
      notes: '',
      example_fill: null,
      is_official: false,
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const { data, error } = await supabase
      .from('madlib_templates')
      .insert(payload)
      .select('id')
      .single()
    setSaving(false)
    if (error) {
      console.error(error)
      alert('Failed to save template')
      return
    }
    router.push(`/madlibs/${data.id}`)
  }

  const steps: { id: Step; label: string; icon: string }[] = [
    { id: 'basics', label: 'Basic Info', icon: '📝' },
    { id: 'blanks', label: 'Define Blanks', icon: '🎯' },
    { id: 'template', label: 'Template Text', icon: '✍️' },
    { id: 'preview', label: 'Preview & Save', icon: '👁️' },
  ]

  const canProceed = useMemo(() => {
    if (currentStep === 'basics') return title.trim() && description.trim()
    if (currentStep === 'blanks') return blanks.length > 0
    if (currentStep === 'template') return templateText.trim().length > 20
    return true
  }, [currentStep, title, description, blanks, templateText])

  const renderPreview = () => {
    let text = templateText
    blanks.forEach((blank) => {
      const regex = new RegExp(`\\[${blank.id}\\]`, 'g')
      text = text.replace(regex, `**[${blank.name}]**`)
    })
    return text
  }

  return (
    <main style={{ ...styles.container, paddingTop: 0 }}>
      {/* Hero Header */}
      <div
        style={{
          background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
          padding: theme.spacing.xl,
          borderRadius: theme.borderRadius,
          marginBottom: theme.spacing.lg,
        }}
      >
        <h1 style={{ margin: 0, color: '#fff', fontSize: '2rem', marginBottom: theme.spacing.sm }}>
          Create Custom Template
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.9)', margin: 0, fontSize: '1.05rem' }}>
          Build your own Mad Lib template with guided blanks and reusable structure
        </p>
      </div>

      {/* Step Navigation */}
      <div
        style={{
          display: 'flex',
          gap: theme.spacing.sm,
          marginBottom: theme.spacing.lg,
          overflowX: 'auto',
          paddingBottom: theme.spacing.sm,
        }}
      >
        {steps.map((step, idx) => (
          <button
            key={step.id}
            onClick={() => setCurrentStep(step.id)}
            style={{
              flex: '1 0 auto',
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              borderRadius: theme.borderRadius,
              border: currentStep === step.id ? 'none' : `1px solid ${theme.colors.border.primary}`,
              background: currentStep === step.id ? theme.colors.primary : theme.colors.background.secondary,
              color: currentStep === step.id ? '#fff' : theme.colors.text.primary,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.xs,
              fontSize: '0.95rem',
              fontWeight: currentStep === step.id ? 600 : 400,
              whiteSpace: 'nowrap',
            }}
          >
            <span>{step.icon}</span>
            <span>{step.label}</span>
          </button>
        ))}
      </div>

      {/* Step Content */}
      <div
        style={{
          background: theme.colors.background.secondary,
          border: `1px solid ${theme.colors.border.primary}`,
          borderRadius: theme.borderRadius,
          padding: theme.spacing.lg,
          minHeight: 400,
        }}
      >
        {/* Step 1: Basics */}
        {currentStep === 'basics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md, maxWidth: 700 }}>
            <h2 style={{ margin: 0, color: theme.colors.text.primary, fontSize: '1.3rem' }}>
              Basic Information
            </h2>
            <div>
              <label style={{ display: 'block', marginBottom: theme.spacing.xs, color: theme.colors.text.secondary, fontSize: '0.9rem' }}>
                Template Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., The Mysterious Quest-Giver"
                style={{
                  width: '100%',
                  padding: theme.spacing.sm,
                  borderRadius: theme.borderRadius,
                  border: `1px solid ${theme.colors.border.primary}`,
                  background: theme.colors.background.main,
                  color: theme.colors.text.primary,
                  fontSize: '1rem',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: theme.spacing.xs, color: theme.colors.text.secondary, fontSize: '0.9rem' }}>
                Description *
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of what this template generates..."
                style={{
                  width: '100%',
                  padding: theme.spacing.sm,
                  borderRadius: theme.borderRadius,
                  border: `1px solid ${theme.colors.border.primary}`,
                  background: theme.colors.background.main,
                  color: theme.colors.text.primary,
                  fontSize: '0.95rem',
                }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: theme.spacing.md }}>
              <div>
                <label style={{ display: 'block', marginBottom: theme.spacing.xs, color: theme.colors.text.secondary, fontSize: '0.9rem' }}>
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: theme.spacing.sm,
                    borderRadius: theme.borderRadius,
                    border: `1px solid ${theme.colors.border.primary}`,
                    background: theme.colors.background.main,
                    color: theme.colors.text.primary,
                  }}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: theme.spacing.xs, color: theme.colors.text.secondary, fontSize: '0.9rem' }}>
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: theme.spacing.sm,
                    borderRadius: theme.borderRadius,
                    border: `1px solid ${theme.colors.border.primary}`,
                    background: theme.colors.background.main,
                    color: theme.colors.text.primary,
                  }}
                >
                  {DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: theme.spacing.xs, color: theme.colors.text.secondary, fontSize: '0.9rem' }}>
                  Stakes
                </label>
                <select
                  value={stakes}
                  onChange={(e) => setStakes(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: theme.spacing.sm,
                    borderRadius: theme.borderRadius,
                    border: `1px solid ${theme.colors.border.primary}`,
                    background: theme.colors.background.main,
                    color: theme.colors.text.primary,
                  }}
                >
                  {STAKES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: theme.spacing.xs, color: theme.colors.text.secondary, fontSize: '0.9rem' }}>
                Tone Tags (comma-separated)
              </label>
              <input
                type="text"
                value={toneInput}
                onChange={(e) => setToneInput(e.target.value)}
                placeholder="e.g., dark, mysterious, humorous"
                style={{
                  width: '100%',
                  padding: theme.spacing.sm,
                  borderRadius: theme.borderRadius,
                  border: `1px solid ${theme.colors.border.primary}`,
                  background: theme.colors.background.main,
                  color: theme.colors.text.primary,
                }}
              />
              {tones.length > 0 && (
                <div style={{ display: 'flex', gap: theme.spacing.xs, flexWrap: 'wrap', marginTop: theme.spacing.sm }}>
                  {tones.map((tone) => (
                    <span
                      key={tone}
                      style={{
                        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                        background: theme.colors.background.main,
                        border: `1px solid ${theme.colors.border.secondary}`,
                        borderRadius: theme.borderRadius,
                        fontSize: '0.85rem',
                        color: theme.colors.text.secondary,
                      }}
                    >
                      {tone}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Blanks */}
        {currentStep === 'blanks' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, color: theme.colors.text.primary, fontSize: '1.3rem' }}>Define Blanks</h2>
                <p style={{ margin: `${theme.spacing.xs} 0 0 0`, color: theme.colors.text.secondary, fontSize: '0.9rem' }}>
                  Add blanks that users will fill in. Use UPPERCASE_IDS like CHARACTER_NAME.
                </p>
              </div>
              <button
                type="button"
                onClick={addBlank}
                style={{
                  padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                  borderRadius: theme.borderRadius,
                  border: 'none',
                  background: theme.colors.primary,
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                + Add Blank
              </button>
            </div>
            {blanks.length === 0 ? (
              <div
                style={{
                  padding: theme.spacing.xl,
                  textAlign: 'center',
                  color: theme.colors.text.secondary,
                  border: `2px dashed ${theme.colors.border.secondary}`,
                  borderRadius: theme.borderRadius,
                }}
              >
                No blanks yet. Click "Add Blank" to get started.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: theme.spacing.md, maxHeight: 500, overflowY: 'auto', paddingRight: theme.spacing.sm }}>
                {blanks.map((b, idx) => (
                  <div
                    key={b.id}
                    style={{
                      border: `1px solid ${theme.colors.border.primary}`,
                      borderRadius: theme.borderRadius,
                      padding: theme.spacing.md,
                      background: theme.colors.background.main,
                    }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: theme.spacing.sm, marginBottom: theme.spacing.sm }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: theme.spacing.xs, color: theme.colors.text.secondary, fontSize: '0.85rem' }}>
                          Blank Name
                        </label>
                        <input
                          type="text"
                          value={b.name}
                          onChange={(e) => updateBlank(idx, { name: e.target.value })}
                          placeholder="Display name"
                          style={{
                            width: '100%',
                            padding: theme.spacing.xs,
                            borderRadius: theme.borderRadius,
                            border: `1px solid ${theme.colors.border.primary}`,
                            background: theme.colors.background.secondary,
                            color: theme.colors.text.primary,
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: theme.spacing.xs, color: theme.colors.text.secondary, fontSize: '0.85rem' }}>
                          Type
                        </label>
                        <select
                          value={b.type}
                          onChange={(e) => updateBlank(idx, { type: e.target.value as any })}
                          style={{
                            width: '100%',
                            padding: theme.spacing.xs,
                            borderRadius: theme.borderRadius,
                            border: `1px solid ${theme.colors.border.primary}`,
                            background: theme.colors.background.secondary,
                            color: theme.colors.text.primary,
                          }}
                        >
                          {BLANK_TYPES.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div style={{ marginBottom: theme.spacing.sm }}>
                      <label style={{ display: 'block', marginBottom: theme.spacing.xs, color: theme.colors.text.secondary, fontSize: '0.85rem' }}>
                        Description / Guidance
                      </label>
                      <textarea
                        rows={2}
                        value={b.description}
                        onChange={(e) => updateBlank(idx, { description: e.target.value })}
                        placeholder="Help text for users filling this blank..."
                        style={{
                          width: '100%',
                          padding: theme.spacing.xs,
                          borderRadius: theme.borderRadius,
                          border: `1px solid ${theme.colors.border.primary}`,
                          background: theme.colors.background.secondary,
                          color: theme.colors.text.primary,
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: theme.spacing.xs,
                          color: theme.colors.text.secondary,
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={!!b.allowRoll}
                          onChange={(e) => updateBlank(idx, { allowRoll: e.target.checked })}
                          style={{ cursor: 'pointer' }}
                        />
                        Allow Random Roll
                      </label>
                      <button
                        type="button"
                        onClick={() => removeBlank(idx)}
                        style={{
                          padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                          borderRadius: theme.borderRadius,
                          border: `1px solid ${theme.colors.danger}`,
                          color: theme.colors.danger,
                          background: 'transparent',
                          cursor: 'pointer',
                        }}
                      >
                        Remove
                      </button>
                    </div>
                    <div
                      style={{
                        marginTop: theme.spacing.sm,
                        padding: theme.spacing.xs,
                        background: theme.colors.background.secondary,
                        borderRadius: theme.borderRadius,
                        fontSize: '0.85rem',
                        color: theme.colors.text.secondary,
                        fontFamily: 'monospace',
                      }}
                    >
                      Use in template: [{b.id}]
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Template */}
        {currentStep === 'template' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md, height: '100%' }}>
            <div>
              <h2 style={{ margin: 0, color: theme.colors.text.primary, fontSize: '1.3rem' }}>Template Text</h2>
              <p style={{ margin: `${theme.spacing.xs} 0 0 0`, color: theme.colors.text.secondary, fontSize: '0.9rem' }}>
                Write your template using markdown. Insert blanks using [BLANK_ID] syntax.
              </p>
            </div>
            <div style={{ flex: 1, minHeight: 400 }}>
              <textarea
                value={templateText}
                onChange={(e) => setTemplateText(e.target.value)}
                placeholder="# [TITLE]&#10;&#10;Your template content with [BLANK_IDS]..."
                style={{
                  width: '100%',
                  height: '100%',
                  padding: theme.spacing.md,
                  borderRadius: theme.borderRadius,
                  border: `1px solid ${theme.colors.border.primary}`,
                  background: theme.colors.background.main,
                  color: theme.colors.text.primary,
                  fontFamily: 'monospace',
                  fontSize: '0.95rem',
                  resize: 'vertical',
                }}
              />
            </div>
            {blanks.length > 0 && (
              <div
                style={{
                  padding: theme.spacing.sm,
                  background: theme.colors.background.main,
                  border: `1px solid ${theme.colors.border.secondary}`,
                  borderRadius: theme.borderRadius,
                }}
              >
                <div style={{ fontSize: '0.85rem', color: theme.colors.text.secondary, marginBottom: theme.spacing.xs }}>
                  Available blanks:
                </div>
                <div style={{ display: 'flex', gap: theme.spacing.xs, flexWrap: 'wrap' }}>
                  {blanks.map((b) => (
                    <code
                      key={b.id}
                      style={{
                        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                        background: theme.colors.background.secondary,
                        borderRadius: theme.borderRadius,
                        fontSize: '0.8rem',
                        color: theme.colors.primary,
                      }}
                    >
                      [{b.id}]
                    </code>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Preview */}
        {currentStep === 'preview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
            <h2 style={{ margin: 0, color: theme.colors.text.primary, fontSize: '1.3rem' }}>Preview & Save</h2>
            
            {/* Template Summary */}
            <div
              style={{
                padding: theme.spacing.md,
                background: theme.colors.background.main,
                border: `1px solid ${theme.colors.border.primary}`,
                borderRadius: theme.borderRadius,
              }}
            >
              <h3 style={{ margin: `0 0 ${theme.spacing.sm} 0`, fontSize: '1.1rem', color: theme.colors.text.primary }}>
                {title || 'Untitled Template'}
              </h3>
              <div style={{ color: theme.colors.text.secondary, fontSize: '0.9rem', marginBottom: theme.spacing.sm }}>
                {description || 'No description'}
              </div>
              <div style={{ display: 'flex', gap: theme.spacing.md, fontSize: '0.85rem', color: theme.colors.text.secondary }}>
                <span>📂 {category}</span>
                <span>⚡ {difficulty}</span>
                <span>🎯 {stakes} stakes</span>
                <span>📝 {blanks.length} blanks</span>
              </div>
              {tones.length > 0 && (
                <div style={{ display: 'flex', gap: theme.spacing.xs, flexWrap: 'wrap', marginTop: theme.spacing.sm }}>
                  {tones.map((tone) => (
                    <span
                      key={tone}
                      style={{
                        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                        background: theme.colors.background.secondary,
                        border: `1px solid ${theme.colors.border.secondary}`,
                        borderRadius: theme.borderRadius,
                        fontSize: '0.75rem',
                        color: theme.colors.text.secondary,
                      }}
                    >
                      {tone}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Template Preview */}
            <div>
              <h3 style={{ margin: `0 0 ${theme.spacing.sm} 0`, fontSize: '1rem', color: theme.colors.text.primary }}>
                Template Preview
              </h3>
              <div
                style={{
                  padding: theme.spacing.md,
                  background: theme.colors.background.main,
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: theme.borderRadius,
                  maxHeight: 400,
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                  color: theme.colors.text.primary,
                }}
              >
                {renderPreview().split('**').map((part, i) =>
                  i % 2 === 0 ? (
                    <span key={i}>{part}</span>
                  ) : (
                    <strong key={i} style={{ color: theme.colors.primary, background: theme.colors.background.secondary, padding: '2px 4px', borderRadius: 3 }}>
                      {part}
                    </strong>
                  )
                )}
              </div>
            </div>

            {!canSave && (
              <div
                style={{
                  padding: theme.spacing.md,
                  background: theme.colors.background.main,
                  border: `1px solid ${theme.colors.danger}`,
                  borderRadius: theme.borderRadius,
                  color: theme.colors.danger,
                  fontSize: '0.9rem',
                }}
              >
                ⚠️ Please complete all required fields: title, description, at least one blank, and template text.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: theme.spacing.lg,
          paddingTop: theme.spacing.md,
          borderTop: `1px solid ${theme.colors.border.primary}`,
        }}
      >
        <button
          onClick={() => router.push('/madlibs')}
          style={{
            padding: `${theme.spacing.sm} ${theme.spacing.md}`,
            borderRadius: theme.borderRadius,
            border: `1px solid ${theme.colors.border.primary}`,
            background: theme.colors.background.secondary,
            color: theme.colors.text.primary,
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <div style={{ display: 'flex', gap: theme.spacing.sm }}>
          {currentStep !== 'basics' && (
            <button
              onClick={() => {
                const idx = steps.findIndex((s) => s.id === currentStep)
                if (idx > 0) setCurrentStep(steps[idx - 1].id)
              }}
              style={{
                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                borderRadius: theme.borderRadius,
                border: `1px solid ${theme.colors.border.primary}`,
                background: theme.colors.background.secondary,
                color: theme.colors.text.primary,
                cursor: 'pointer',
              }}
            >
              ← Previous
            </button>
          )}
          {currentStep !== 'preview' ? (
            <button
              onClick={() => {
                const idx = steps.findIndex((s) => s.id === currentStep)
                if (idx < steps.length - 1) setCurrentStep(steps[idx + 1].id)
              }}
              disabled={!canProceed}
              style={{
                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                borderRadius: theme.borderRadius,
                border: 'none',
                background: canProceed ? theme.colors.primary : theme.colors.background.secondary,
                color: canProceed ? '#fff' : theme.colors.text.secondary,
                cursor: canProceed ? 'pointer' : 'not-allowed',
                fontWeight: 600,
              }}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={!canSave || saving}
              style={{
                padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                borderRadius: theme.borderRadius,
                border: 'none',
                background: canSave && !saving ? theme.colors.primary : theme.colors.background.secondary,
                color: canSave && !saving ? '#fff' : theme.colors.text.secondary,
                cursor: canSave && !saving ? 'pointer' : 'not-allowed',
                fontWeight: 600,
              }}
            >
              {saving ? 'Saving...' : '💾 Save Template'}
            </button>
          )}
        </div>
      </div>
    </main>
  )
}
