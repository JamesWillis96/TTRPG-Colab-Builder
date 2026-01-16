'use client'

import { useTheme } from '../../contexts/ThemeContext'
import { useRouter } from 'next/navigation'
import type { MadLibTemplate } from '../../lib/madlibTemplates'

interface MadLibPreviewModalProps {
  template: MadLibTemplate | null
  onClose: () => void
}

export default function MadLibPreviewModal({ template, onClose }: MadLibPreviewModalProps) {
  const { theme, styles } = useTheme()
  const router = useRouter()

  if (!template) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleStart = () => {
    router.push(`/madlibs/${template.id}`)
  }

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
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: theme.spacing.md,
      }}
    >
      <div
        style={{
          background: theme.colors.background.main,
          borderRadius: theme.borderRadius,
          maxWidth: 700,
          width: '100%',
          maxHeight: '85vh',
          overflow: 'auto',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: theme.spacing.lg,
            borderBottom: `1px solid ${theme.colors.border.primary}`,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm, marginBottom: theme.spacing.xs }}>
              <h2 style={{ margin: 0, color: theme.colors.text.primary }}>{template.title}</h2>
              <span
                style={{
                  color: difficultyColor(template.difficulty),
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                }}
              >
                {template.difficulty}
              </span>
            </div>
            <div style={{ color: theme.colors.text.secondary, fontSize: '0.95rem' }}>{template.category}</div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: theme.colors.text.secondary,
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: theme.spacing.xs,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: theme.spacing.lg }}>
          <p style={{ color: theme.colors.text.primary, marginBottom: theme.spacing.md }}>
            {template.description}
          </p>

          {/* Metadata */}
          <div style={{ marginBottom: theme.spacing.lg }}>
            <div
              style={{
                display: 'flex',
                gap: theme.spacing.md,
                fontSize: '0.9rem',
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing.sm,
              }}
            >
              <span>📝 {template.blanks.length} blanks</span>
              <span>🎲 {template.blanks.filter((b) => b.allowRoll).length} rollable</span>
            </div>
            <div style={{ display: 'flex', gap: theme.spacing.xs, flexWrap: 'wrap' }}>
              {template.tone.map((tag) => (
                <span
                  key={tag}
                  style={{
                    border: `1px solid ${theme.colors.border.secondary}`,
                    background: theme.colors.background.secondary,
                    color: theme.colors.text.secondary,
                    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                    borderRadius: theme.borderRadius,
                    fontSize: '0.8rem',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Example output */}
          {template.exampleFill && (
            <div style={{ marginBottom: theme.spacing.lg }}>
              <h3 style={{ fontSize: '1rem', marginBottom: theme.spacing.sm, color: theme.colors.text.primary }}>
                Example Output
              </h3>
              <div
                style={{
                  background: theme.colors.background.secondary,
                  border: `1px solid ${theme.colors.border.secondary}`,
                  borderRadius: theme.borderRadius,
                  padding: theme.spacing.md,
                  fontSize: '0.95rem',
                  color: theme.colors.text.primary,
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {(() => {
                  let text = template.templateText
                  Object.entries(template.exampleFill).forEach(([id, value]) => {
                    const regex = new RegExp(`\\[${id}\\]`, 'g')
                    text = text.replace(regex, `**${value}**`)
                  })
                  return text.split('**').map((part, i) =>
                    i % 2 === 0 ? (
                      <span key={i}>{part}</span>
                    ) : (
                      <strong key={i} style={{ color: theme.colors.primary }}>
                        {part}
                      </strong>
                    )
                  )
                })()}
              </div>
            </div>
          )}

          {/* Blanks preview */}
          <div style={{ marginBottom: theme.spacing.lg }}>
            <h3 style={{ fontSize: '1rem', marginBottom: theme.spacing.sm, color: theme.colors.text.primary }}>
              What You'll Fill
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
              {template.blanks.slice(0, 5).map((blank) => (
                <div
                  key={blank.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.spacing.sm,
                    fontSize: '0.9rem',
                    color: theme.colors.text.secondary,
                  }}
                >
                  <span>{blank.allowRoll ? '🎲' : '✏️'}</span>
                  <span>{blank.name}</span>
                  {blank.type === 'constrained' && blank.constraints && (
                    <span style={{ fontSize: '0.8rem', fontStyle: 'italic' }}>
                      ({blank.constraints.slice(0, 2).join(', ')})
                    </span>
                  )}
                </div>
              ))}
              {template.blanks.length > 5 && (
                <div style={{ fontSize: '0.85rem', color: theme.colors.text.secondary, fontStyle: 'italic' }}>
                  ...and {template.blanks.length - 5} more
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: theme.spacing.lg,
            borderTop: `1px solid ${theme.colors.border.primary}`,
            display: 'flex',
            gap: theme.spacing.md,
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              borderRadius: theme.borderRadius,
              border: `1px solid ${theme.colors.border.primary}`,
              background: theme.colors.background.secondary,
              color: theme.colors.text.primary,
              cursor: 'pointer',
              fontSize: '0.95rem',
            }}
          >
            Close
          </button>
          <button
            onClick={handleStart}
            style={{
              padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
              borderRadius: theme.borderRadius,
              border: 'none',
              background: theme.colors.primary,
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: 600,
            }}
          >
            Start Template
          </button>
        </div>
      </div>
    </div>
  )
}
