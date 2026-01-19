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

export default function CreateMadLibTemplatePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { theme, styles } = useTheme()

  // --- State ---
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('NPCs')
  const [difficulty, setDifficulty] = useState<(typeof DIFFICULTIES)[number]>('simple')
  const [stakes, setStakes] = useState<(typeof STAKES)[number]>('medium')
  const [toneInput, setToneInput] = useState('')
  const [templateText, setTemplateText] = useState('# [TITLE]\n\nYour content with [BLANK_IDS] here...')
  const [blanks, setBlanks] = useState<MadLibBlank[]>([])
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor')
  const [showMetadata, setShowMetadata] = useState(true)

  const tones = useMemo(() => toneInput.split(',').map(t => t.trim()).filter(Boolean), [toneInput])

  // --- Auth Check ---
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // --- Handlers ---
  const addBlank = () => {
    const id = prompt('Blank ID (UPPERCASE letters, underscores). E.g. HERO_NAME')?.trim()
    if (!id) return
    
    // Check for duplicate ID
    if (blanks.some(b => b.id === id)) {
        alert('A blank with this ID already exists.')
        return
    }

    setBlanks(prev => ([...prev, { id, name: id, type: 'creative', description: '', allowRoll: false } as MadLibBlank]))
  }

  const updateBlank = (index: number, patch: Partial<MadLibBlank>) => {
    setBlanks(prev => prev.map((b, i) => i === index ? { ...b, ...patch } : b))
  }

  const removeBlank = (index: number) => {
    if (confirm('Are you sure you want to remove this blank?')) {
        setBlanks(prev => prev.filter((_, i) => i !== index))
    }
  }

  const insertBlankToken = (blankId: string) => {
    navigator.clipboard.writeText(`[${blankId}]`)
    alert(`Copied [${blankId}] to clipboard!`)
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
      alert('Failed to save template. Check console for details.')
      return
    }
    router.push(`/madlibs/${data.id}`)
  }

  const renderPreview = () => {
    let text = templateText
    blanks.forEach((blank) => {
      // Escape special regex chars in ID if any
      const regex = new RegExp(`\\[${blank.id}\\]`, 'g')
      text = text.replace(regex, `**[${blank.name}]**`)
    })
    return text
  }

  return (
    <div style={{ 
        minHeight: '100vh', 
        background: theme.colors.background.main,
        display: 'flex',
        flexDirection: 'column' 
    }}>
      {/* 1. Top Bar: Global Actions */}
      <header style={{
        padding: `${theme.spacing.sm} ${theme.spacing.xl}`,
        background: theme.colors.background.secondary,
        borderBottom: `1px solid ${theme.colors.border.primary}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md, flex: 1 }}>
            <button 
                onClick={() => router.push('/madlibs')}
                style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    color: theme.colors.text.secondary
                }}
                title="Back"
            >
                ←
            </button>
            <input 
                type="text" 
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Untitled MadLib Template"
                style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    color: theme.colors.text.primary,
                    width: '100%',
                    outline: 'none'
                }}
            />
        </div>
        <div style={{ display: 'flex', gap: theme.spacing.sm }}>
            <button
                onClick={handleSave}
                disabled={!canSave || saving}
                style={{
                    padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                    borderRadius: theme.borderRadius,
                    border: 'none',
                    background: canSave ? theme.colors.primary : theme.colors.background.tertiary,
                    color: canSave ? '#fff' : theme.colors.text.muted,
                    cursor: canSave ? 'pointer' : 'not-allowed',
                    fontWeight: 600,
                    boxShadow: canSave ? theme.shadow : 'none'
                }}
            >
                {saving ? 'Saving...' : 'Save Template'}
            </button>
        </div>
      </header>

      {/* 2. Main Workspace */}
      <div style={{ 
          flex: 1, 
          display: 'flex', 
          overflow: 'hidden',
          flexDirection: 'row', // Default desktop
          height: 'calc(100vh - 65px)' 
        }}>
        
        {/* LEFT SIDEBAR: Config & Blanks */}
        <aside style={{ 
            width: '350px', 
            minWidth: '300px',
            borderRight: `1px solid ${theme.colors.border.primary}`,
            background: theme.colors.background.secondary,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto'
        }}>
            
            {/* Metadata Section */}
            <div style={{ borderBottom: `1px solid ${theme.colors.border.primary}` }}>
                <button 
                    onClick={() => setShowMetadata(!showMetadata)}
                    style={{
                        width: '100%',
                        padding: theme.spacing.md,
                        background: 'transparent',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontWeight: 600,
                        color: theme.colors.text.primary,
                        display: 'flex',
                        justifyContent: 'space-between'
                    }}
                >
                    <span>Template Settings</span>
                    <span>{showMetadata ? '▼' : '▶'}</span>
                </button>
                
                {showMetadata && (
                    <div style={{ padding: theme.spacing.md, paddingTop: 0, display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                        <div>
                            <label style={{ display: 'block', fontSize: theme.fontSize.xs, color: theme.colors.text.secondary, marginBottom: theme.spacing.xs }}>Description</label>
                            <textarea
                                rows={2}
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="What is this template for?"
                                style={{
                                    width: '100%',
                                    padding: theme.spacing.sm,
                                    borderRadius: theme.borderRadius,
                                    border: `1px solid ${theme.colors.border.primary}`,
                                    background: theme.colors.background.input,
                                    color: theme.colors.text.primary,
                                    fontSize: theme.fontSize.sm
                                }}
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.sm }}>
                            <div>
                                <label style={{ display: 'block', fontSize: theme.fontSize.xs, color: theme.colors.text.secondary, marginBottom: theme.spacing.xs }}>Category</label>
                                <select 
                                    value={category}
                                    onChange={e => setCategory(e.target.value as any)}
                                    style={{ width: '100%', padding: theme.spacing.xs, borderRadius: theme.borderRadius, border: `1px solid ${theme.colors.border.primary}`, background: theme.colors.background.input, color: theme.colors.text.primary, fontSize: theme.fontSize.sm }}
                                >
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: theme.fontSize.xs, color: theme.colors.text.secondary, marginBottom: theme.spacing.xs }}>Difficulty</label>
                                <select 
                                    value={difficulty}
                                    onChange={e => setDifficulty(e.target.value as any)}
                                    style={{ width: '100%', padding: theme.spacing.xs, borderRadius: theme.borderRadius, border: `1px solid ${theme.colors.border.primary}`, background: theme.colors.background.input, color: theme.colors.text.primary, fontSize: theme.fontSize.sm }}
                                >
                                    {DIFFICULTIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: theme.fontSize.xs, color: theme.colors.text.secondary, marginBottom: theme.spacing.xs }}>Tags (comma separated)</label>
                            <input
                                type="text"
                                value={toneInput}
                                onChange={e => setToneInput(e.target.value)}
                                placeholder="dark, funny, gritty..."
                                style={{
                                    width: '100%',
                                    padding: theme.spacing.sm,
                                    borderRadius: theme.borderRadius,
                                    border: `1px solid ${theme.colors.border.primary}`,
                                    background: theme.colors.background.input,
                                    color: theme.colors.text.primary,
                                    fontSize: theme.fontSize.sm
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Blanks List */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ 
                    padding: theme.spacing.md, 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    borderBottom: `1px solid ${theme.colors.border.primary}`,
                    background: theme.colors.background.secondary
                }}>
                    <h3 style={{ margin: 0, fontSize: theme.fontSize.md, color: theme.colors.text.primary }}>Blanks ({blanks.length})</h3>
                    <button
                        onClick={addBlank}
                        style={{
                            padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                            fontSize: theme.fontSize.sm,
                            background: theme.colors.primary,
                            color: '#fff',
                            border: 'none',
                            borderRadius: theme.borderRadius,
                            cursor: 'pointer'
                        }}
                    >
                        + Add
                    </button>
                </div>
                
                <div style={{ padding: theme.spacing.sm, overflowY: 'auto', flex: 1, gap: theme.spacing.sm, display: 'flex', flexDirection: 'column' }}>
                    {blanks.length === 0 && (
                        <div style={{ textAlign: 'center', padding: theme.spacing.lg, color: theme.colors.text.muted, fontSize: theme.fontSize.sm, fontStyle: 'italic' }}>
                            No blanks yet. Add one to start building your template!
                        </div>
                    )}
                    {blanks.map((b, idx) => (
                        <div key={idx} style={{ 
                            padding: theme.spacing.sm, 
                            background: theme.colors.background.main, 
                            border: `1px solid ${theme.colors.border.primary}`,
                            borderRadius: theme.borderRadius,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: theme.spacing.xs
                        }}>
                             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 'bold', fontSize: theme.fontSize.sm, color: theme.colors.primary }}>[{b.id}]</span>
                                <div style={{ display: 'flex', gap: theme.spacing.xs }}>
                                    <button 
                                        onClick={() => insertBlankToken(b.id)}
                                        title="Copy token to clipboard"
                                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
                                    >📋</button>
                                    <button 
                                        onClick={() => removeBlank(idx)}
                                        title="Remove blank"
                                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', color: theme.colors.danger }}
                                    >×</button>
                                </div>
                             </div>
                             
                             <input 
                                type="text"
                                placeholder="Display Name"
                                value={b.name}
                                onChange={e => updateBlank(idx, { name: e.target.value })}
                                style={{ width: '100%', padding: 4, fontSize: theme.fontSize.xs, border: `1px solid ${theme.colors.border.primary}`, borderRadius: 4, background: theme.colors.background.input }}
                             />
                             
                             <select
                                value={b.type}
                                onChange={e => updateBlank(idx, { type: e.target.value as any })}
                                style={{ width: '100%', padding: 4, fontSize: theme.fontSize.xs, border: `1px solid ${theme.colors.border.primary}`, borderRadius: 4, background: theme.colors.background.input }}
                             >
                                 {BLANK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                             </select>

                             <input 
                                type="text"
                                placeholder="Description/Hint..."
                                value={b.description}
                                onChange={e => updateBlank(idx, { description: e.target.value })}
                                style={{ width: '100%', padding: 4, fontSize: theme.fontSize.xs, border: `1px solid ${theme.colors.border.primary}`, borderRadius: 4, background: theme.colors.background.input }}
                             />
                        </div>
                    ))}
                </div>
            </div>
        </aside>

        {/* RIGHT Editor */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: theme.colors.background.main }}>
            {/* Toolbar */}
            <div style={{ 
                padding: theme.spacing.sm, 
                borderBottom: `1px solid ${theme.colors.border.primary}`,
                display: 'flex',
                gap: theme.spacing.md 
            }}>
                <button
                    onClick={() => setActiveTab('editor')}
                    style={{
                        padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                        background: activeTab === 'editor' ? theme.colors.background.secondary : 'transparent',
                        border: 'none',
                        borderRadius: theme.borderRadius,
                        fontWeight: activeTab === 'editor' ? 600 : 400,
                        color: activeTab === 'editor' ? theme.colors.text.primary : theme.colors.text.muted,
                        cursor: 'pointer'
                    }}
                >
                    Write Template
                </button>
                <button
                    onClick={() => setActiveTab('preview')}
                    style={{
                        padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                        background: activeTab === 'preview' ? theme.colors.background.secondary : 'transparent',
                        border: 'none',
                        borderRadius: theme.borderRadius,
                        fontWeight: activeTab === 'preview' ? 600 : 400,
                        color: activeTab === 'preview' ? theme.colors.text.primary : theme.colors.text.muted,
                        cursor: 'pointer'
                    }}
                >
                    Preview
                </button>
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, position: 'relative' }}>
                {activeTab === 'editor' ? (
                    <textarea
                        value={templateText}
                        onChange={e => setTemplateText(e.target.value)}
                        placeholder="Start writing your madlib here..."
                        style={{
                            width: '100%',
                            height: '100%',
                            padding: theme.spacing.lg,
                            border: 'none',
                            outline: 'none',
                            resize: 'none',
                            background: theme.colors.background.main,
                            color: theme.colors.text.primary,
                            fontSize: '1rem',
                            fontFamily: 'monospace',
                            lineHeight: 1.6
                        }}
                    />
                ) : (
                    <div style={{ 
                        padding: theme.spacing.lg, 
                        height: '100%', 
                        overflowY: 'auto'
                    }}>
                        <div style={{ 
                            background: theme.colors.background.main, 
                            border: `1px solid ${theme.colors.border.primary}`, 
                            padding: theme.spacing.xl,
                            maxWidth: '800px',
                            margin: '0 auto',
                            boxShadow: theme.shadow,
                            borderRadius: theme.borderRadius
                        }}>
                             <h2 style={{ textAlign: 'center', marginBottom: theme.spacing.md }}>{title || 'Untitled'}</h2>
                             <div style={{ 
                                 whiteSpace: 'pre-wrap', 
                                 lineHeight: 1.8, 
                                 fontSize: '1.1rem',
                                 color: theme.colors.text.primary 
                             }}>
                                {renderPreview().split('**').map((part, i) =>
                                    i % 2 === 0 ? (
                                        <span key={i}>{part}</span>
                                    ) : (
                                        <span key={i} style={{ 
                                            color: theme.colors.primary, 
                                            fontWeight: 'bold',
                                            paddingBottom: '2px',
                                            borderBottom: `2px dashed ${theme.colors.primary}40`
                                        }}>
                                        {part}
                                        </span>
                                    )
                                )}
                             </div>
                        </div>
                    </div>
                )}
            </div>
            {/* Helper Bar */}
            {activeTab === 'editor' && (
                <div style={{ 
                    padding: `${theme.spacing.xs} ${theme.spacing.md}`, 
                    background: theme.colors.background.secondary, 
                    borderTop: `1px solid ${theme.colors.border.primary}`,
                    fontSize: theme.fontSize.sm,
                    color: theme.colors.text.secondary
                }}>
                    Tip: Use the clipboard icon on the left to copy blank tokens like [NAME].
                </div>
            )}
        </main>

      </div>
    </div>
  )
}
