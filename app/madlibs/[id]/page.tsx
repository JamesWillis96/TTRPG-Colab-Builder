'use client'

import { useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '../../../contexts/AuthContext'
import { useTheme } from '../../../contexts/ThemeContext'
import { MadLibProvider } from '../../../contexts/MadLibContext'
import { madlibTemplatesMap } from '../../../lib/madlibTemplates'
import MadLibForm from '../../../components/MadLib/MadLibForm'
import MadLibOutput from '../../../components/MadLib/MadLibOutput'

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

  return (
    <MadLibProvider initialTemplateId={template.id}>
      <main style={{ ...styles.container, maxWidth: '1200px' }}>
        
        {/* Hero Header */}
        <div
          style={{
            background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
            padding: theme.spacing.xl,
            borderRadius: theme.borderRadius,
            marginBottom: theme.spacing.lg,
            color: '#fff',
            boxShadow: theme.shadow
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '2.5rem', marginBottom: theme.spacing.xs, color: '#fff' }}>
                {template.title}
              </h1>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '1.1rem', maxWidth: '800px', lineHeight: 1.5 }}>
                {template.description}
              </p>
            </div>
            <button 
              onClick={() => router.push('/madlibs')}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: '#fff',
                padding: `${theme.spacing.xs} ${theme.spacing.md}`,
                borderRadius: theme.borderRadius,
                cursor: 'pointer',
                fontSize: '0.9rem',
                backdropFilter: 'blur(4px)'
              }}
            >
              ← Back to Library
            </button>
          </div>
          
          <div style={{ 
            marginTop: theme.spacing.md, 
            display: 'flex', 
            gap: theme.spacing.md,
            fontSize: '0.9rem',
            opacity: 0.95,
            flexWrap: 'wrap'
          }}>
            <span style={{ background: 'rgba(0,0,0,0.3)', padding: '4px 12px', borderRadius: 20 }}>📂 {template.category}</span>
            <span style={{ background: 'rgba(0,0,0,0.3)', padding: '4px 12px', borderRadius: 20 }}>⚡ {template.difficulty}</span>
            <span style={{ background: 'rgba(0,0,0,0.3)', padding: '4px 12px', borderRadius: 20 }}>🎯 {template.stakes} Stakes</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1.2fr', gap: theme.spacing.xl, alignItems: 'start' }}>
          {/* Left: Input Form */}
          <div style={{ 
            background: theme.colors.background.secondary,
            padding: theme.spacing.lg,
            borderRadius: theme.borderRadius,
            border: `1px solid ${theme.colors.border.primary}`,
            boxShadow: theme.shadow
          }}>
            <h2 style={{ marginTop: 0, color: theme.colors.text.primary, borderBottom: `1px solid ${theme.colors.border.primary}`, paddingBottom: theme.spacing.sm, fontSize: '1.25rem' }}>
              Fill In The Blanks
            </h2>
            <MadLibForm template={template} />
          </div>
          
          {/* Right: Output */}
          <div style={{ position: 'sticky', top: theme.spacing.md }}>
             <MadLibOutput template={template} />
          </div>
        </div>
      </main>
    </MadLibProvider>
  )
}
