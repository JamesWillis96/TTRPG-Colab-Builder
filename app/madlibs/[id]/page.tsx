'use client'

import { useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '../../../contexts/AuthContext'
import { useTheme } from '../../../contexts/ThemeContext'
import { MadLibProvider, useMadLib } from '../../../contexts/MadLibContext'
import { madlibTemplatesMap } from '../../../lib/madlibTemplates'
import MadLibForm from '../../../components/MadLib/MadLibForm'
import MadLibOutput from '../../../components/MadLib/MadLibOutput'
import MadLibDrafts from '../../../components/MadLib/MadLibDrafts'

export default function MadLibDetailPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const { theme, styles } = useTheme()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const id = Array.isArray(params?.id) ? params?.id[0] : (params?.id as string)
  const template = useMemo(() => (id ? madlibTemplatesMap[id] : undefined), [id])

  if (!template) {
    return (
      <main style={styles.container}>
        <h1 style={{ color: theme.colors.text.primary }}>Template not found</h1>
      </main>
    )
  }

  function DraftToolbar() {
    const { theme } = useTheme()
    const { saveDraft, loadLatestDraft } = useMadLib()
    return (
      <div style={{ display: 'flex', gap: theme.spacing.sm }}>
        <button
          type="button"
          onClick={loadLatestDraft}
          style={{
            padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
            borderRadius: theme.borderRadius,
            border: `1px solid ${theme.colors.border.primary}`,
            background: theme.colors.background.main,
            color: theme.colors.text.primary,
          }}
        >
          Load Draft
        </button>
        <button
          type="button"
          onClick={saveDraft}
          style={{
            padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
            borderRadius: theme.borderRadius,
            border: `1px solid ${theme.colors.border.primary}`,
            background: theme.colors.primary,
            color: '#fff',
          }}
        >
          Save Draft
        </button>
      </div>
    )
  }

  return (
    <MadLibProvider initialTemplateId={template.id}>
      <main style={{ ...styles.container, display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
        <div>
          <h1 style={{ margin: 0, color: theme.colors.text.primary }}>{template.title}</h1>
          <div style={{ color: theme.colors.text.secondary }}>{template.category} • {template.difficulty} • stakes: {template.stakes}</div>
          <p style={{ color: theme.colors.text.secondary, marginTop: theme.spacing.sm }}>{template.description}</p>
          <DraftToolbar />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.lg }}>
          <div>
            <MadLibForm template={template} />
          </div>
          <div>
            <MadLibOutput template={template} />
            <div style={{ marginTop: theme.spacing.lg }}>
              <MadLibDrafts />
            </div>
          </div>
        </div>
      </main>
    </MadLibProvider>
  )
}
