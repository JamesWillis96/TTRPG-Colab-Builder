"use client"

import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react'
import { madlibTemplates, madlibTemplatesMap, MadLibTemplate } from '../lib/madlibTemplates'
import { useAuth } from './AuthContext'
import { supabase } from '../lib/supabase'

interface MadLibContextValue {
  templates: MadLibTemplate[]
  selectedTemplate?: MadLibTemplate
  selectTemplateById: (id: string) => void
  answers: Record<string, string>
  setAnswer: (blankId: string, value: string) => void
  resetAnswers: () => void
  rolled: Record<string, boolean>
  filledCount: number
  totalCount: number
  renderOutput: () => string
  saveDraft: () => Promise<void>
  loadLatestDraft: () => Promise<void>
  rollBlank: (blankId: string) => Promise<void>
  getCandidateTables: (blankId: string) => Promise<Array<{ id: string; title: string; category: string }>>
  rollFromTable: (blankId: string, tableId: string) => Promise<void>
  isSaving: boolean
  lastSavedAt?: Date
}

const MadLibContext = createContext<MadLibContextValue | undefined>(undefined)

export function MadLibProvider({ children, initialTemplateId }: { children: React.ReactNode; initialTemplateId?: string }) {
  const { user } = useAuth()
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>(initialTemplateId)
  const selectedTemplate = useMemo(() => (selectedTemplateId ? madlibTemplatesMap[selectedTemplateId] : undefined), [selectedTemplateId])

  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [rolled, setRolled] = useState<Record<string, boolean>>({})
  const [currentDraftId, setCurrentDraftId] = useState<string | undefined>(undefined)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<Date | undefined>(undefined)

  const selectTemplateById = useCallback((id: string) => {
    setSelectedTemplateId(id)
    setAnswers({})
  }, [])

  const setAnswer = useCallback((blankId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [blankId]: value }))
    setRolled(prev => ({ ...prev, [blankId]: false }))
  }, [])

  const resetAnswers = useCallback(() => setAnswers({}), [])

  const totalCount = selectedTemplate?.blanks.length ?? 0
  const filledCount = useMemo(() => {
    if (!selectedTemplate) return 0
    const ids = new Set(selectedTemplate.blanks.map(b => b.id))
    return Object.entries(answers).reduce((acc, [k, v]) => (ids.has(k) && v?.trim() ? acc + 1 : acc), 0)
  }, [answers, selectedTemplate])

  const renderOutput = useCallback(() => {
    const text = selectedTemplate?.templateText ?? ''
    if (!selectedTemplate) return ''

    let output = text
    for (const blank of selectedTemplate.blanks) {
      const value = (answers[blank.id] ?? '').trim()
      const replacement = value || `[${blank.id}]`
      const pattern = new RegExp(`\\\[${blank.id}\\\]`, 'g')
      output = output.replace(pattern, replacement)
    }
    return output
  }, [answers, selectedTemplate])

  const value: MadLibContextValue = {
    templates: madlibTemplates,
    selectedTemplate,
    selectTemplateById,
    answers,
    setAnswer,
    resetAnswers,
    rolled,
    filledCount,
    totalCount,
    renderOutput,
    saveDraft: async () => {
      if (!user || !selectedTemplate) return
      setIsSaving(true)
      const answersJson: Record<string, { value: string; rolled: boolean }> = {}
      selectedTemplate.blanks.forEach(b => {
        const val = (answers[b.id] ?? '').trim()
        if (val) answersJson[b.id] = { value: val, rolled: !!rolled[b.id] }
      })

      const payload = {
        template_id: selectedTemplate.id,
        user_id: user.id,
        answers: answersJson,
        output: renderOutput(),
        is_draft: true,
      }

      if (currentDraftId) {
        const { error } = await supabase
          .from('madlib_fills')
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq('id', currentDraftId)
        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('madlib_fills')
          .insert(payload)
          .select('id')
          .single()
        if (error) throw error
        if (data?.id) setCurrentDraftId(data.id)
      }
      setLastSavedAt(new Date())
      setIsSaving(false)
    },
    loadLatestDraft: async () => {
      if (!user || !selectedTemplate) return
      const { data, error } = await supabase
        .from('madlib_fills')
        .select('id, answers')
        .eq('user_id', user.id)
        .eq('template_id', selectedTemplate.id)
        .eq('is_draft', true)
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (error) throw error
      if (data) {
        setCurrentDraftId(data.id)
        const restored: Record<string, string> = {}
        const restoredRolled: Record<string, boolean> = {}
        const ans = (data as any).answers as Record<string, { value: string }>
        Object.entries(ans || {}).forEach(([k, v]: any) => {
          restored[k] = (v?.value ?? '') as string
          restoredRolled[k] = !!v?.rolled
        })
        setAnswers(restored)
        setRolled(restoredRolled)
      }
    },
    rollBlank: async (blankId: string) => {
      if (!selectedTemplate) return

      const intent = resolveIntent(blankId)
      if (!intent) return

      const tables = await findTables(intent, ['category+tags', 'category', 'tags', 'title'])
      if (!tables.length) return

      // pick first table with entries
      let entries: Array<{ text: string; weight?: number }> = []
      for (const t of tables) {
        const e = Array.isArray((t as any).entries) ? (t as any).entries : []
        if (e.length) { entries = e; break }
      }
      if (!entries.length) return

      const totalWeight = entries.reduce((sum, e) => sum + (e.weight || 1), 0)
      let r = Math.random() * totalWeight
      for (const e of entries) {
        r -= (e.weight || 1)
        if (r <= 0) {
          const value = String(e.text ?? '').trim()
          if (value) {
            setAnswers(prev => ({ ...prev, [blankId]: value }))
            setRolled(prev => ({ ...prev, [blankId]: true }))
          }
          break
        }
      }
    },
    getCandidateTables: async (blankId: string) => {
      const intent = resolveIntent(blankId)
      if (!intent) return []
      const tables = await findTables(intent, ['category+tags', 'category', 'tags', 'title'])
      // Return minimal shape without entries
      return tables.map(t => ({ id: (t as any).id, title: (t as any).title, category: (t as any).category }))
    },
    rollFromTable: async (blankId: string, tableId: string) => {
      const { data, error } = await supabase
        .from('random_tables')
        .select('entries')
        .eq('id', tableId)
        .single()
      if (error) throw error
      const entries = Array.isArray((data as any)?.entries) ? (data as any)?.entries : []
      if (!entries.length) return
      const totalWeight = entries.reduce((sum: number, e: any) => sum + (e.weight || 1), 0)
      let r = Math.random() * totalWeight
      for (const e of entries) {
        r -= (e.weight || 1)
        if (r <= 0) {
          const value = String(e.text ?? '').trim()
          if (value) {
            setAnswers(prev => ({ ...prev, [blankId]: value }))
            setRolled(prev => ({ ...prev, [blankId]: true }))
          }
          break
        }
      }
    },
    isSaving,
    lastSavedAt,
  }

  function resolveIntent(blankId: string): { categories: string[]; tags: string[]; keywords?: string[] } | undefined {
    const id = blankId.toLowerCase()
    const intents = [
      { test: /(race|species|ancestry)/, categories: ['NPCs'], tags: ['race', 'ancestry', 'species'], keywords: ['race','species','ancestry'] },
      { test: /(role|profession|job|title)/, categories: ['NPCs'], tags: ['role', 'profession'], keywords: ['role','profession','job','title'] },
      { test: /(name)/, categories: ['Names', 'NPCs', 'Locations'], tags: ['name'], keywords: ['name','names'] },
      { test: /(location|place|city|town|village|keep|fort|lair)/, categories: ['Locations'], tags: ['location','place','city','town','village'], keywords: ['location','place','city','town','village','keep','fort','lair'] },
      { test: /(item|artifact|weapon|armor|trinket|relic)/, categories: ['Items'], tags: ['item','artifact','weapon','armor','trinket','relic'], keywords: ['item','artifact','weapon','armor','trinket','relic'] },
    ]
    for (const intent of intents) {
      if (intent.test.test(id)) return { categories: intent.categories, tags: intent.tags, keywords: intent.keywords }
    }
    return undefined
  }

  async function findTables(
    intent: { categories: string[]; tags: string[]; keywords?: string[] },
    strategies: Array<'category+tags' | 'category' | 'tags' | 'title'>
  ) {
    // Try multiple strategies to avoid zero results
    for (const strat of strategies) {
      let query = supabase
        .from('random_tables')
        .select(strat === 'title' ? 'id,title,category,tags,entries' : 'id,title,category,tags,entries')
        .eq('is_official', true)
        .limit(50)
      if (strat === 'category+tags') {
        if (intent.categories?.length) query = query.in('category', intent.categories)
        if (intent.tags?.length) query = query.contains('tags', intent.tags) as any
      } else if (strat === 'category') {
        if (intent.categories?.length) query = query.in('category', intent.categories)
      } else if (strat === 'tags') {
        if (intent.tags?.length) query = query.contains('tags', intent.tags) as any
      } else if (strat === 'title') {
        if (intent.keywords && intent.keywords.length) {
          // Try OR ilike on title
          const ors = intent.keywords.map(k => `title.ilike.%${k}%`).join(',')
          query = (query as any).or(ors)
        }
      }
      const { data, error } = await query
      if (error) throw error
      const tables = (data ?? []) as Array<{ id: string; title: string; category: string; entries: any }>
      if (tables.length) return tables
    }
    return []
  }

  // Autosave drafts: debounce on answers change
  useEffect(() => {
    if (!user || !selectedTemplate) return
    const handle = setTimeout(() => {
      value.saveDraft().catch(() => {})
    }, 1200)
    return () => clearTimeout(handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, selectedTemplate?.id, user?.id])

  return <MadLibContext.Provider value={value}>{children}</MadLibContext.Provider>
}

export function useMadLib() {
  const ctx = useContext(MadLibContext)
  if (!ctx) throw new Error('useMadLib must be used within MadLibProvider')
  return ctx
}
