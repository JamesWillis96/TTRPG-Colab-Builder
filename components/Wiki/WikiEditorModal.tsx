'use client'

import React, { useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useWiki } from '../../contexts/WikiContext'
import { wikiTemplates } from '../../lib/wikiTemplates'
import { wikiCategories } from '../../lib/wikiCategories'
import { getMarkdownThemeOptions, getMarkdownThemeCSS } from '../../lib/markdownThemes'
import type { MarkdownTheme } from '../../lib/markdownThemes'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

function ImageComponent({ src, alt }: { src?: string; alt?: string }) {
  return (
    <img
      src={src}
      alt={alt || ''}
      style={{
        float: 'left',
        marginRight: '16px',
        marginBottom: '16px',
        maxWidth: '300px',
        height: 'auto',
        borderRadius: '8px',
      }}
    />
  )
}

/**
 * WikiEditorModal - Create/edit entry modal
 * Form for entering title, category, content
 * Template selection for new entries
 * Save and cancel actions
 */
export function WikiEditorModal() {
  const { theme } = useTheme()
  const { isEditModalOpen, closeEditModal, editingEntry, saveEntry, selectedMarkdownTheme, setSelectedMarkdownTheme } = useWiki()
  const [title, setTitle] = useState(editingEntry?.title || '')
  const [category, setCategory] = useState(editingEntry?.category || 'npc')
  const [content, setContent] = useState(editingEntry?.content || '')
  const [markdownTheme, setMarkdownTheme] = useState<MarkdownTheme>(editingEntry?.markdown_theme || selectedMarkdownTheme || 'github')
  const [featuredImage, setFeaturedImage] = useState(editingEntry?.featured_image || '')
  const [showPreview, setShowPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [showFeaturedImageModal, setShowFeaturedImageModal] = useState(false)
  const [imageAlt, setImageAlt] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  React.useEffect(() => {
    if (editingEntry) {
      setTitle(editingEntry.title)
      setCategory(editingEntry.category)
      setContent(editingEntry.content)
      setFeaturedImage(editingEntry.featured_image || '')
      setMarkdownTheme(editingEntry.markdown_theme || 'github')
    } else {
      setTitle('')
      setCategory('npc')
      setContent('')
      setFeaturedImage('')
      setMarkdownTheme('github')
    }
    setShowPreview(false)
  }, [editingEntry, isEditModalOpen])

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Title is required')
      return
    }
    setSaving(true)
    try {
      // Generate slug from title
      const slug = title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 100) // Limit length
      
      await saveEntry({
        title: title.trim(),
        category,
        content,
        markdown_theme: markdownTheme,
        featured_image: featuredImage.trim() || undefined,
        slug: slug || `entry-${Date.now()}`, // Fallback if slug is empty
      })
      closeEditModal()
    } catch (err: any) {
      console.error('Error saving entry:', err)
      alert(err?.message || 'Failed to save entry. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const applyTemplate = (templateKey: string) => {
    const template = wikiTemplates[templateKey as keyof typeof wikiTemplates]
    setContent(template)
  }

  const insertImage = () => {
    if (!imageUrl.trim()) {
      alert('Image URL is required')
      return
    }

    const imageMarkdown = `![${imageAlt.trim() || 'image'}](${imageUrl.trim()})`
    
    // Insert at cursor position
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart
      const end = textareaRef.current.selectionEnd
      const newContent = content.substring(0, start) + imageMarkdown + content.substring(end)
      setContent(newContent)
      
      // Move cursor after inserted image
      setTimeout(() => {
        if (textareaRef.current) {
          const newPosition = start + imageMarkdown.length
          textareaRef.current.selectionStart = newPosition
          textareaRef.current.selectionEnd = newPosition
          textareaRef.current.focus()
        }
      }, 0)
    }
    
    // Close modal and reset
    setShowImageModal(false)
    setImageAlt('')
    setImageUrl('')
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
                Markdown Style
              </label>
              <select
                value={markdownTheme}
                onChange={(e) => {
                  const newTheme = e.target.value as MarkdownTheme
                  setMarkdownTheme(newTheme)
                  setSelectedMarkdownTheme(newTheme)
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
                {getMarkdownThemeOptions().map((option) => (
                  <option key={option.value} value={option.value} title={option.description}>
                    {option.label}
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
              <div style={{ display: 'flex', gap: theme.spacing.xs }}>
                <button
                  onClick={() => setShowImageModal(true)}
                  type="button"
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
                  + Image
                </button>
                <button
                  onClick={() => setShowFeaturedImageModal(true)}
                  type="button"
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
                  + Featured Image
                </button>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  type="button"
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
            </div>
            <textarea
              ref={textareaRef}
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
              <div>
                <style>{getMarkdownThemeCSS(markdownTheme)}</style>
                <div
                  style={{
                    minHeight: '300px',
                    maxHeight: '300px',
                    padding: theme.spacing.md,
                    border: `1px solid ${theme.colors.border.primary}`,
                    borderRadius: theme.borderRadius,
                    backgroundColor: theme.colors.background.secondary,
                    overflow: 'auto',
                    color: theme.colors.text.primary,
                  }}
                  className="markdown-content"
                >
                  {content ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        img: (props) => (
                          <ImageComponent 
                            src={typeof props.src === 'string' ? props.src : undefined} 
                            alt={typeof props.alt === 'string' ? props.alt : undefined} 
                          />
                        ),
                      }}
                    >
                      {content}
                    </ReactMarkdown>
                  ) : (
                    <p style={{ color: theme.colors.text.secondary, fontStyle: 'italic' }}>
                      No content to preview
                    </p>
                  )}
                </div>
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

      {/* Image Insert Modal */}
      {showImageModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
          }}
          onClick={() => {
            setShowImageModal(false)
            setImageAlt('')
            setImageUrl('')
          }}
        >
          <div
            style={{
              backgroundColor: theme.colors.background.main,
              borderRadius: theme.borderRadius,
              padding: theme.spacing.lg,
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                margin: `0 0 ${theme.spacing.md} 0`,
                fontSize: '18px',
                fontWeight: 600,
                color: theme.colors.text.primary,
              }}
            >
              Insert Image
            </h3>

            <div style={{ marginBottom: theme.spacing.md }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: theme.colors.text.secondary,
                  marginBottom: theme.spacing.sm,
                }}
              >
                Alt Text (optional)
              </label>
              <input
                type="text"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="Description of the image"
                style={{
                  width: '100%',
                  padding: theme.spacing.md,
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: theme.borderRadius,
                  backgroundColor: theme.colors.background.secondary,
                  color: theme.colors.text.primary,
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: theme.spacing.md }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: theme.colors.text.secondary,
                  marginBottom: theme.spacing.sm,
                }}
              >
                Image URL *
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                style={{
                  width: '100%',
                  padding: theme.spacing.md,
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: theme.borderRadius,
                  backgroundColor: theme.colors.background.secondary,
                  color: theme.colors.text.primary,
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
              <p
                style={{
                  margin: `${theme.spacing.xs} 0 0 0`,
                  fontSize: '12px',
                  color: theme.colors.text.secondary,
                }}
              >
                Tip: Use a direct link ending in .jpg, .png, or .gif
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: theme.spacing.md }}>
              <button
                onClick={() => {
                  setShowImageModal(false)
                  setImageAlt('')
                  setImageUrl('')
                }}
                style={{
                  padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                  backgroundColor: theme.colors.background.secondary,
                  color: theme.colors.text.primary,
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: theme.borderRadius,
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Cancel
              </button>
              <button
                onClick={insertImage}
                disabled={!imageUrl.trim()}
                style={{
                  padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                  backgroundColor: theme.colors.primary,
                  color: '#fff',
                  border: 'none',
                  borderRadius: theme.borderRadius,
                  cursor: imageUrl.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: 600,
                  opacity: imageUrl.trim() ? 1 : 0.6,
                }}
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Featured Image Modal */}
      {showFeaturedImageModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
          }}
          onClick={() => {
            setShowFeaturedImageModal(false)
          }}
        >
          <div
            style={{
              backgroundColor: theme.colors.background.main,
              borderRadius: theme.borderRadius,
              padding: theme.spacing.lg,
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                margin: `0 0 ${theme.spacing.md} 0`,
                fontSize: '18px',
                fontWeight: 600,
                color: theme.colors.text.primary,
              }}
            >
              Set Featured Image
            </h3>

            {featuredImage && (
              <div style={{ marginBottom: theme.spacing.md }}>
                <p
                  style={{
                    fontSize: '12px',
                    color: theme.colors.text.secondary,
                    marginBottom: theme.spacing.sm,
                  }}
                >
                  Current image:
                </p>
                <img
                  src={featuredImage}
                  alt="Featured"
                  style={{
                    width: '100%',
                    maxHeight: '200px',
                    objectFit: 'cover',
                    borderRadius: theme.borderRadius,
                  }}
                />
              </div>
            )}

            <div style={{ marginBottom: theme.spacing.md }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: theme.colors.text.secondary,
                  marginBottom: theme.spacing.sm,
                }}
              >
                Image URL *
              </label>
              <input
                type="url"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
                style={{
                  width: '100%',
                  padding: theme.spacing.md,
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: theme.borderRadius,
                  backgroundColor: theme.colors.background.secondary,
                  color: theme.colors.text.primary,
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
              <p
                style={{
                  margin: `${theme.spacing.xs} 0 0 0`,
                  fontSize: '12px',
                  color: theme.colors.text.secondary,
                }}
              >
                Tip: Use a direct link ending in .jpg, .png, or .gif
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: theme.spacing.md }}>
              <button
                onClick={() => {
                  setShowFeaturedImageModal(false)
                }}
                style={{
                  padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                  backgroundColor: theme.colors.background.secondary,
                  color: theme.colors.text.primary,
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: theme.borderRadius,
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Cancel
              </button>
              {featuredImage && (
                <button
                  onClick={() => {
                    setFeaturedImage('')
                    setShowFeaturedImageModal(false)
                  }}
                  style={{
                    padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                    backgroundColor: '#dc3545',
                    color: '#fff',
                    border: 'none',
                    borderRadius: theme.borderRadius,
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Remove
                </button>
              )}
              <button
                onClick={() => {
                  setShowFeaturedImageModal(false)
                }}
                disabled={!featuredImage.trim()}
                style={{
                  padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                  backgroundColor: theme.colors.primary,
                  color: '#fff',
                  border: 'none',
                  borderRadius: theme.borderRadius,
                  cursor: featuredImage.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: 600,
                  opacity: featuredImage.trim() ? 1 : 0.6,
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
