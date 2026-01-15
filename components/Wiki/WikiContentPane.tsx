'use client'

import React, { useEffect, useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useWiki } from '../../contexts/WikiContext'
import { useAuth } from '../../contexts/AuthContext'
import { getMarkdownThemeCSS } from '../../lib/markdownThemes'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import { calculateReadingTime } from '../../lib/wiki'
import { supabase } from '../../lib/supabase'

type AuthorProfile = {
  id: string
  username: string
  profile_image?: string
  image_zoom?: number
  image_position_x?: number
  image_position_y?: number
}

/**
 * WikiContentPane - Right side content display
 * Shows selected entry with markdown rendering
 * Displays metadata (category, author, date)
 * Provides edit/delete/revisions actions
 */

function ImageComponent({ src, alt }: { src?: string; alt?: string }) {
  return (
    <img
      src={src}
      alt={alt || ''}
      style={{
        float: 'right',
        marginLeft: '16px',
        marginBottom: '16px',
        maxWidth: '100%',
        width: '300px',
        height: 'auto',
        borderRadius: '8px',
        position: 'sticky',
        top: '16px',
      }}
    />
  )
}

export function WikiContentPane() {
  const { theme, isDark } = useTheme()
  const { user, profile } = useAuth()
  const { selectedEntry, openEditModal, deleteEntry, openRevisionsModal } = useWiki()
  const [authorProfile, setAuthorProfile] = useState<AuthorProfile | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Reset delete confirmation state when entry changes
  useEffect(() => {
    setShowDeleteConfirm(false)
    setIsDeleting(false)
  }, [selectedEntry?.id])

  // Fetch author profile when selected entry changes
  useEffect(() => {
    if (!selectedEntry?.author_id) {
      setAuthorProfile(null)
      return
    }

    const fetchAuthorProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id,username,profile_image,image_zoom,image_position_x,image_position_y')
        .eq('id', selectedEntry.author_id)
        .single()

      if (!error && data) {
        setAuthorProfile({
          id: data.id,
          username: data.username,
          profile_image: data.profile_image || undefined,
          image_zoom: data.image_zoom || 1,
          image_position_x: data.image_position_x || 0,
          image_position_y: data.image_position_y || 0
        })
      }
    }

    fetchAuthorProfile()
  }, [selectedEntry?.author_id])

  // Pre-process content to convert :::spoiler[...] blocks to HTML
  const processedContent = React.useMemo(() => {
    if (!selectedEntry) return ''
    
    let content = selectedEntry.content
    
    // Replace :::spoiler[Title] ... ::: with <details><summary>Title</summary>...</details>
    const spoilerRegex = /:::spoiler\[([^\]]+)\]\s*\n([\s\S]*?)\n:::/g
    content = content.replace(spoilerRegex, (match, title, body) => {
      return `<details>\n<summary>${title}</summary>\n\n${body}\n\n</details>`
    })
    
    // Also support :::spoiler without brackets (default title)
    const spoilerRegex2 = /:::spoiler\s*\n([\s\S]*?)\n:::/g
    content = content.replace(spoilerRegex2, (match, body) => {
      return `<details>\n<summary>Spoiler</summary>\n\n${body}\n\n</details>`
    })
    
    return content
  }, [selectedEntry])

  if (!selectedEntry) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: theme.colors.text.secondary,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '16px' }}>Select an entry to begin</p>
        </div>
      </div>
    )
  }

  const readingTime = calculateReadingTime(selectedEntry.content)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Entry header with metadata */}
      <div
        style={{
        padding: theme.spacing.lg,
        borderBottom: `1px solid ${theme.colors.border.primary}`,
        backgroundColor: theme.colors.background.secondary,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <div style={{ flex: 1 }}>
            <h1
              style={{
                margin: `0 0 ${theme.spacing.sm} 0`,
                fontSize: '28px',
                fontWeight: 700,
                color: theme.colors.text.primary,
              }}
            >
              {selectedEntry.title}
            </h1>
            <div
              style={{
                display: 'flex',
                gap: theme.spacing.lg,
                fontSize: '14px',
                color: theme.colors.text.secondary,
                alignItems: 'center',
                flexWrap: 'wrap'
              }}
            >
              {/* Author bubble */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 12px 6px 6px',
                backgroundColor: theme.colors.background.main,
                borderRadius: '20px',
                border: `1px solid ${theme.colors.border.primary}`,
                fontSize: '0.85em',
                color: theme.colors.text.secondary
              }}>
                {authorProfile?.profile_image ? (
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme.colors.background.secondary,
                    flexShrink: 0
                  }}>
                    <img
                      src={authorProfile.profile_image}
                      alt={authorProfile.username}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transform: `scale(${authorProfile.image_zoom || 1}) translate(${(authorProfile.image_position_x || 0) / 5}px, ${(authorProfile.image_position_y || 0) / 5}px)`
                      }}
                    />
                  </div>
                ) : (
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: theme.colors.background.secondary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    color: theme.colors.text.secondary,
                    flexShrink: 0,
                    fontWeight: 'bold'
                  }}>
                    {authorProfile?.username?.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
                {authorProfile?.username || 'Loading...'}
              </div>
              
              <span>Category: {selectedEntry.category}</span>
              <span>
                Updated: {new Date(selectedEntry.updated_at).toLocaleDateString()}
              </span>
              <span>{readingTime} min read</span>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: theme.spacing.md }}>
            <button
              onClick={() => openRevisionsModal()}
              style={{
                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                backgroundColor: theme.colors.background.main,
                color: theme.colors.text.primary,
                border: `1px solid ${theme.colors.border.primary}`,
                borderRadius: theme.borderRadius,
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.colors.background.secondary)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.colors.background.main)}
            >
              History
            </button>
            {/* Show Edit/Delete only if user is the author or an admin */}
            {(user?.id === selectedEntry.author_id || profile?.role === 'admin') && (
              <>
                <button
                  onClick={() => openEditModal(selectedEntry)}
                  style={{
                    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                    backgroundColor: theme.colors.primary,
                    color: '#fff',
                    border: 'none',
                    borderRadius: theme.borderRadius,
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  Edit
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  style={{
                    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: theme.borderRadius,
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: theme.spacing.lg,
          paddingBottom: '80px',
          display: 'flex',
          gap: theme.spacing.xl,
        }}
      >
        <style>{getMarkdownThemeCSS(selectedEntry.markdown_theme || 'github')}</style>
        
        {/* Main content area */}
        <article
          className="markdown-content"
          style={{
            color: theme.colors.text.primary,
            fontSize: '15px',
            lineHeight: '1.6',
            flex: selectedEntry.featured_image ? '1 1 60%' : '1 1 100%',
            maxWidth: selectedEntry.featured_image ? '60%' : '900px',
            minWidth: 0,
          }}
        >
          {/* HTML spoilers supported via <details>/<summary>. */}
          
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[
              rehypeRaw,
              [
                rehypeSanitize,
                {
                  ...defaultSchema,
                  tagNames: [
                    ...(defaultSchema.tagNames || []),
                    'details',
                    'summary'
                  ],
                  attributes: {
                    ...(defaultSchema.attributes || {}),
                    details: ['open'],
                    summary: ['aria-label']
                  }
                }
              ]
            ]}
            components={{
              img: (props) => (
                <ImageComponent 
                  src={typeof props.src === 'string' ? props.src : undefined} 
                  alt={typeof props.alt === 'string' ? props.alt : undefined} 
                />
              ),
              details: ({ children }) => (
                <details
                  style={{
                    margin: `${theme.spacing.sm} 0`,
                    display: 'inline-block',
                    width: '100%',
                  }}
                >
                  {children}
                </details>  
              ),
              summary: ({ children }) => (
                <summary
                  style={{
                    cursor: 'pointer',
                    fontWeight: 500,
                    color: theme.colors.text.secondary,
                    padding: '4px 10px',
                    listStyle: 'none',
                    display: 'inline-block',
                    borderRadius: '4px',
                    border: `1px solid ${theme.colors.border.secondary}`,
                    backgroundColor: 'transparent',
                    fontSize: '0.9em',
                    transition: 'all 0.2s ease',
                    userSelect: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.background.secondary
                    e.currentTarget.style.borderColor = theme.colors.border.primary
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.borderColor = theme.colors.border.secondary
                  }}
                >
                  ▸ {children}
                </summary>
              ),
            }}
          >
            {processedContent}
          </ReactMarkdown>
        </article>

        {/* Featured image sidebar */}
        {selectedEntry.featured_image && (
          <div
            style={{
              flex: '0 0 35%',
              maxWidth: '400px',
              minWidth: '250px',
              alignSelf: 'flex-start',
            }}
          >
            <div style={{
              position: 'sticky',
              top: '16px',
            }}>
              <img
                src={selectedEntry.featured_image}
                alt={selectedEntry.title}
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: theme.borderRadius,
                  objectFit: 'cover',
                  boxShadow: theme.shadow,
                }}
              />
              <p style={{
                fontSize: theme.fontSize.sm,
                color: theme.colors.text.tertiary,
                marginTop: '2rem',
                fontStyle: 'italic',
                textAlign: 'center'
              }}>
                {selectedEntry.title}
              </p>
            </div>
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <>
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}>
            <div style={{
              background: isDark ? theme.colors.background.secondary : '#ffffff',
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.borderRadius,
              padding: theme.spacing.lg,
              maxWidth: '400px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
            }}>
              <h3 style={{
                color: theme.colors.text.primary,
                marginTop: 0,
                marginBottom: theme.spacing.md,
                fontSize: '1.1rem'
              }}>
                🗑️ Delete Entry?
              </h3>
              <p style={{
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing.lg
              }}>
                Are you sure you want to delete <strong>"{selectedEntry?.title}"</strong>? This action cannot be undone.
              </p>
              <div style={{
                display: 'flex',
                gap: theme.spacing.sm,
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{
                    background: theme.colors.background.tertiary,
                    color: theme.colors.text.primary,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: theme.borderRadius,
                    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isDark ? 'rgba(100, 116, 139, 0.3)' : 'rgba(0, 0, 0, 0.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = theme.colors.background.tertiary
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setIsDeleting(true)
                    try {
                      await deleteEntry(selectedEntry.id)
                    } finally {
                      setIsDeleting(false)
                    }
                  }}
                  disabled={isDeleting}
                  style={{
                    background: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: theme.borderRadius,
                    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s ease',
                    opacity: isDeleting ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!isDeleting) e.currentTarget.style.background = '#b91c1c'
                  }}
                  onMouseLeave={(e) => {
                    if (!isDeleting) e.currentTarget.style.background = '#dc2626'
                  }}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
