'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useRouter } from 'next/navigation'
import { madlibTemplates, type MadLibTemplate } from '../../lib/madlibTemplates'
import MadLibPreviewModal from '../../components/MadLib/MadLibPreviewModal'

export default function MadLibsHubPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { theme, styles } = useTheme()

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<'All' | 'NPCs' | 'Encounters' | 'Items' | 'Locations' | 'Session Hooks'>('All')
  const [difficulty, setDifficulty] = useState<'All' | 'simple' | 'moderate' | 'complex'>('All')
  const [toneFilter, setToneFilter] = useState<string>('All')
  const [hasRolls, setHasRolls] = useState(false)
  const [sort, setSort] = useState<'title' | 'difficulty' | 'recent' | 'popular'>('title')
  const [previewTemplate, setPreviewTemplate] = useState<MadLibTemplate | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const categories = useMemo(() => ['All', ...Array.from(new Set(madlibTemplates.map(t => t.category)))] as const, [])
  
  const allTones = useMemo(() => {
    const tones = new Set<string>()
    madlibTemplates.forEach(t => t.tone.forEach(tone => tones.add(tone)))
    return ['All', ...Array.from(tones).sort()]
  }, [])

  const filtered = useMemo(() => {
    const base = madlibTemplates.filter(t => {
      const matchesCategory = category === 'All' || t.category === category
      const q = query.trim().toLowerCase()
      const matchesQuery = !q || t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
      const matchesDifficulty = difficulty === 'All' || t.difficulty === difficulty
      const matchesTone = toneFilter === 'All' || t.tone.includes(toneFilter)
      const matchesRolls = !hasRolls || t.blanks.some(b => b.allowRoll)
      return matchesCategory && matchesQuery && matchesDifficulty && matchesTone && matchesRolls
    })
    const arr = [...base]
    if (sort === 'title') {
      arr.sort((a, b) => a.title.localeCompare(b.title))
    } else if (sort === 'difficulty') {
      const order = { simple: 0, moderate: 1, complex: 2 } as const
      arr.sort((a, b) => order[a.difficulty] - order[b.difficulty])
    } else if (sort === 'recent') {
      // Recent first (reverse ID order for now)
      arr.sort((a, b) => b.id.localeCompare(a.id))
    } else if (sort === 'popular') {
      // Popular - could track usage; for now alphabetical
      arr.sort((a, b) => a.title.localeCompare(b.title))
    }
    return arr
  }, [query, category, difficulty, toneFilter, hasRolls, sort])

  const difficultyColor = (d: string) => {
    switch (d) {
      case 'simple':
        return theme.colors.success
      case 'moderate':
        return theme.colors.secondary
      case 'complex':
        return theme.colors.danger
      default:
        return theme.colors.text.secondary
    }
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
          Mad Libs for D&D
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.9)', margin: 0, fontSize: '1.05rem' }}>
          Guided templates that spark creativity and deliver ready-to-use content
        </p>
        
        {/* Search */}
        <div style={{ marginTop: theme.spacing.lg }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search templates..."
            style={{
              padding: theme.spacing.md,
              borderRadius: theme.borderRadius,
              border: 'none',
              background: 'rgba(255, 255, 255, 0.95)',
              color: theme.colors.text.primary,
              width: '100%',
              fontSize: '1rem',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
          />
        </div>
        
        {/* Category Chips */}
        <div style={{ display: 'flex', gap: theme.spacing.sm, flexWrap: 'wrap', marginTop: theme.spacing.md }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat as any)}
              style={{
                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                borderRadius: theme.borderRadius,
                border: 'none',
                background: category === cat ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.2)',
                color: category === cat ? theme.colors.primary : '#fff',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: category === cat ? 600 : 400,
                transition: 'all 0.2s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Sticky Filter Bar */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          background: theme.colors.background.main,
          zIndex: 10,
          padding: `${theme.spacing.md} 0`,
          borderBottom: `1px solid ${theme.colors.border.primary}`,
          marginBottom: theme.spacing.lg,
        }}
      >
        <div style={{ display: 'flex', gap: theme.spacing.sm, flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as any)}
            style={{
              padding: theme.spacing.sm,
              borderRadius: theme.borderRadius,
              border: `1px solid ${theme.colors.border.primary}`,
              background: theme.colors.background.secondary,
              color: theme.colors.text.primary,
              fontSize: '0.9rem',
            }}
          >
            <option value="All">All Difficulties</option>
            <option value="simple">Simple</option>
            <option value="moderate">Moderate</option>
            <option value="complex">Complex</option>
          </select>

          <select
            value={toneFilter}
            onChange={(e) => setToneFilter(e.target.value)}
            style={{
              padding: theme.spacing.sm,
              borderRadius: theme.borderRadius,
              border: `1px solid ${theme.colors.border.primary}`,
              background: theme.colors.background.secondary,
              color: theme.colors.text.primary,
              fontSize: '0.9rem',
            }}
          >
            {allTones.map((tone) => (
              <option key={tone} value={tone}>
                {tone === 'All' ? 'All Tones' : tone}
              </option>
            ))}
          </select>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.xs,
              cursor: 'pointer',
              fontSize: '0.9rem',
              color: theme.colors.text.primary,
            }}
          >
            <input
              type="checkbox"
              checked={hasRolls}
              onChange={(e) => setHasRolls(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            Has Random Rolls
          </label>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: theme.spacing.sm, alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: theme.colors.text.secondary }}>Sort:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              style={{
                padding: theme.spacing.sm,
                borderRadius: theme.borderRadius,
                border: `1px solid ${theme.colors.border.primary}`,
                background: theme.colors.background.secondary,
                color: theme.colors.text.primary,
                fontSize: '0.9rem',
              }}
            >
              <option value="title">A → Z</option>
              <option value="difficulty">Difficulty</option>
              <option value="recent">Recent</option>
              <option value="popular">Popular</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div style={{ marginBottom: theme.spacing.md, color: theme.colors.text.secondary, fontSize: '0.95rem' }}>
        {filtered.length} {filtered.length === 1 ? 'template' : 'templates'} found
      </div>

      {/* Masonry Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: theme.spacing.md,
          marginBottom: theme.spacing.xl,
        }}
      >
        {filtered.map((t) => (
          <div
            key={t.id}
            style={{
              border: `1px solid ${theme.colors.border.secondary}`,
              borderRadius: theme.borderRadius,
              background: theme.colors.background.secondary,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.2s',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = `0 4px 12px ${theme.colors.border.primary}`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            {/* Card header */}
            <div style={{ padding: theme.spacing.md, borderBottom: `1px solid ${theme.colors.border.primary}` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: theme.spacing.xs }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: theme.colors.text.primary, flex: 1 }}>
                  {t.title}
                </h3>
                <span
                  style={{
                    color: difficultyColor(t.difficulty),
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  {t.difficulty}
                </span>
              </div>
              <div style={{ color: theme.colors.text.secondary, fontSize: '0.85rem' }}>{t.category}</div>
            </div>

            {/* Card body */}
            <div style={{ padding: theme.spacing.md, flex: 1 }}>
              <p style={{ color: theme.colors.text.secondary, fontSize: '0.9rem', marginBottom: theme.spacing.md, lineHeight: 1.5 }}>
                {t.description}
              </p>
              
              {/* Metadata */}
              <div style={{ fontSize: '0.85rem', color: theme.colors.text.secondary, marginBottom: theme.spacing.sm }}>
                <div>📝 {t.blanks.length} blanks</div>
                {t.blanks.some(b => b.allowRoll) && <div>🎲 {t.blanks.filter(b => b.allowRoll).length} rollable</div>}
              </div>

              {/* Tone tags */}
              <div style={{ display: 'flex', gap: theme.spacing.xs, flexWrap: 'wrap' }}>
                {t.tone.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    style={{
                      border: `1px solid ${theme.colors.border.secondary}`,
                      background: theme.colors.background.main,
                      color: theme.colors.text.secondary,
                      padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                      borderRadius: theme.borderRadius,
                      fontSize: '0.75rem',
                    }}
                  >
                    {tag}
                  </span>
                ))}
                {t.tone.length > 3 && (
                  <span
                    style={{
                      color: theme.colors.text.secondary,
                      fontSize: '0.75rem',
                      padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                    }}
                  >
                    +{t.tone.length - 3}
                  </span>
                )}
              </div>
            </div>

            {/* Card actions */}
            <div
              style={{
                padding: theme.spacing.md,
                borderTop: `1px solid ${theme.colors.border.primary}`,
                display: 'flex',
                gap: theme.spacing.sm,
              }}
            >
              <button
                onClick={() => setPreviewTemplate(t)}
                style={{
                  flex: 1,
                  padding: theme.spacing.sm,
                  borderRadius: theme.borderRadius,
                  border: `1px solid ${theme.colors.border.primary}`,
                  background: theme.colors.background.main,
                  color: theme.colors.text.primary,
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                Preview
              </button>
              <button
                onClick={() => router.push(`/madlibs/${t.id}`)}
                style={{
                  flex: 1,
                  padding: theme.spacing.sm,
                  borderRadius: theme.borderRadius,
                  border: 'none',
                  background: theme.colors.primary,
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                }}
              >
                Start
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      <MadLibPreviewModal template={previewTemplate} onClose={() => setPreviewTemplate(null)} />
    </main>
  )
}
