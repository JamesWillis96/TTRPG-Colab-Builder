'use client'

import React, { useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useWiki } from '../../contexts/WikiContext'
import { wikiTemplates } from '../../lib/wikiTemplates'
import { wikiCategories } from '../../lib/wikiCategories'

/**
 * WikiEditorModal - Create/edit entry modal
 * Form for entering title, category, content
 * Template selection for new entries
 * Save and cancel actions
 */
export function WikiEditorModal() {
  const { theme } = useTheme()
  const { isEditModalOpen, closeEditModal, editingEntry, saveEntry } = useWiki()
  const [title, setTitle] = useState(editingEntry?.title || '')
  const [category, setCategory] = useState(editingEntry?.category || 'npc')
  const [content, setContent] = useState(editingEntry?.content || '')
  const [showPreview, setShowPreview] = useState(false)
  const [saving, setSaving] = useState(false)

  React.useEffect(() => {
    if (editingEntry) {
      setTitle(editingEntry.title)
      setCategory(editingEntry.category)
      setContent(editingEntry.content)
    } else {
      setTitle('')
      setCategory('npc')
      setContent('')
    }
    setShowPreview(false)
  }, [editingEntry, isEditModalOpen])

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Title is required')
      return
    }
    setSaving(true)
    await saveEntry({
      title: title.trim(),
      category,
      content,
      slug: '',
      state: 'draft',
    })
    setSaving(false)
    closeEditModal()
  }

  const applyTemplate = (templateKey: string) => {
    const template = wikiTemplates[templateKey as keyof typeof wikiTemplates]
    setContent(template)
  }

  if (!isEditModalOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={() => closeEditModal()}
    >
      <div
        style={{
          backgroundColor: theme.colors.background.main,
          borderRadius: theme.borderRadius,
          maxWidth: '900px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: theme.spacing.lg,
            borderBottom: `1px solid ${theme.colors.border.primary}`,
            backgroundColor: theme.colors.background.secondary,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: 600,
              color: theme.colors.text.primary,
            }}
          >
            {editingEntry ? 'Edit Entry' : 'New Entry'}
          </h2>
          <button
            onClick={() => closeEditModal()}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: theme.colors.text.secondary,
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: theme.spacing.lg }}>
          {/* Title and Category */}
          <div style={{ marginBottom: theme.spacing.lg }}>
            <label
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing.sm,
              }}
            >
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Entry title"
              style={{
                width: '100%',
                padding: theme.spacing.md,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.borderRadius,
                backgroundColor: theme.colors.background.secondary,
                color: theme.colors.text.primary,
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: theme.spacing.lg, marginBottom: theme.spacing.lg }}>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: theme.colors.text.secondary,
                  marginBottom: theme.spacing.sm,
                }}
              >
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: theme.spacing.md,
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: theme.borderRadius,
                  backgroundColor: theme.colors.background.secondary,
                  color: theme.colors.text.primary,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                {wikiCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {!editingEntry && (
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: theme.colors.text.secondary,
                    marginBottom: theme.spacing.sm,
                  }}
                >
                  Template
                </label>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      applyTemplate(e.target.value)
                      e.target.value = ''
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: theme.spacing.md,
                    border: `1px solid ${theme.colors.border.primary}`,
                    borderRadius: theme.borderRadius,
                    backgroundColor: theme.colors.background.secondary,
                    color: theme.colors.text.primary,
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">Use template...</option>
                  {Object.keys(wikiTemplates).map((key) => (
                    <option key={key} value={key}>
                      {key.charAt(0).toUpperCase() + key.slice(1)} Template
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Content Editor */}
          <div style={{ marginBottom: theme.spacing.lg }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: theme.spacing.sm,
              }}
            >
              <label
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: theme.colors.text.secondary,
                }}
              >
                Content (Markdown)
              </label>
              <button
                onClick={() => setShowPreview(!showPreview)}
                style={{
                  padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                  background: 'none',
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: theme.borderRadius,
                  color: theme.colors.text.secondary,
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                {showPreview ? 'Edit' : 'Preview'}
              </button>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your content in Markdown format..."
              style={{
                width: '100%',
                height: '300px',
                padding: theme.spacing.md,
                border: `1px solid ${theme.colors.border.primary}`,
                borderRadius: theme.borderRadius,
                backgroundColor: theme.colors.background.secondary,
                color: theme.colors.text.primary,
                fontSize: '14px',
                fontFamily: 'monospace',
                boxSizing: 'border-box',
                display: showPreview ? 'none' : 'block',
              }}
            />
            {showPreview && (
              <div
                style={{
                  minHeight: '300px',
                  padding: theme.spacing.md,
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: theme.borderRadius,
                  backgroundColor: theme.colors.background.secondary,
                  overflow: 'auto',
                }}
                className="markdown-content"
              >
                {/* Preview would be rendered with markdown parser here */}
                <p style={{ color: theme.colors.text.secondary }}>Preview not implemented yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer with actions */}
        <div
          style={{
            padding: theme.spacing.lg,
            borderTop: `1px solid ${theme.colors.border.primary}`,
            backgroundColor: theme.colors.background.secondary,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: theme.spacing.md,
          }}
        >
          <button
            onClick={() => closeEditModal()}
            disabled={saving}
            style={{
              padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
              backgroundColor: theme.colors.background.main,
              color: theme.colors.text.primary,
              border: `1px solid ${theme.colors.border.primary}`,
              borderRadius: theme.borderRadius,
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              opacity: saving ? 0.6 : 1,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            style={{
              padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
              backgroundColor: theme.colors.primary,
              color: '#fff',
              border: 'none',
              borderRadius: theme.borderRadius,
              cursor: saving || !title.trim() ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              opacity: saving || !title.trim() ? 0.6 : 1,
            }}
          >
            {saving ? 'Saving...' : editingEntry ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}
