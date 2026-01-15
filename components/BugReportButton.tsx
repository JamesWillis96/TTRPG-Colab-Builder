'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

type BugCategory = 'critical' | 'bug' | 'feedback' | 'design_idea' | 'feature_idea'

export default function BugReportButton() {
  const { theme } = useTheme()
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [category, setCategory] = useState<BugCategory>('bug')
  const [description, setDescription] = useState('')
  const [pageUrl, setPageUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  // Capture page URL when modal opens
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      setPageUrl(window.location.href)
    }
  }, [isOpen])

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleClose = () => {
    setIsOpen(false)
    setDescription('')
    setCategory('bug')
    setError('')
    setSubmitted(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!description.trim()) {
      setError('Please provide a description')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const { error: submitError } = await supabase
        .from('bug_reports')
        .insert({
          category,
          description: description.trim(),
          page_url: pageUrl,
          user_id: user?.id || null,
        })

      if (submitError) throw submitError

      setSubmitted(true)
      setTimeout(() => {
        handleClose()
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to submit report')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
  <>
    {/* Floating Action Button */}
    <button
        id="bug-report-button"
        onClick={() => setIsOpen(true)}
        aria-label="Report a bug"
        style={{
            position: 'fixed',
            bottom: '0px',
            right: '24px',
            backgroundColor: 'transparent',
            border: 'none',
            padding: '0',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#dc2626', // Icon color (Red)
            transition: 'transform 0.2s',
            zIndex: 999,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
        <svg
            xmlns="http://www.w3.org/2000/svg"
            version="1.1"
            width="30" // Adjusted size for visibility without a circle
            height="30"
            viewBox="-5.0 -10.0 110.0 135.0"
            fill="currentColor" // This makes the path use the button's red color
        >
            <path d="m88.668 60.094c-2.4102-3.3047-5.2695-5.625-9.8242-4.7344-0.98047 0.17969-1.25-0.35547-1.25-1.3398-0.17969-3.0352-0.53516-6.0703-1.7852-8.8398-0.98438-2.3203-0.17969-3.125 1.6953-4.0195 1.6953-0.80469 3.75-1.3398 4.7305-3.0352 1.6953-3.0352 3.0352-6.25 4.375-9.4648 0.53516-1.0703 0.35938-2.5-1.0703-3.0352-1.25-0.44531-2.3203 0.089844-2.8555 1.3398-0.71484 1.5195-1.6055 2.9453-2.0547 4.5547-0.98047 3.3047-3.0352 5.4453-6.25 6.6094-0.089844 0.089844-0.089844 0.089844-0.17969 0.089844-0.80469 0.625-1.3398 0.44531-1.875-0.35547-1.4297-2.0547-3.2148-3.8398-5.2695-5.0898-1.5195-0.89453-1.875-1.875-1.875-3.4844 0.17969-2.8555-0.625-5.4453-2.1445-7.8594-2.7695-4.5547-1.25-10.535 3.3945-13.125 1.1602-0.625 2.1445-1.4297 1.3398-2.9453-0.71484-1.4297-1.9648-1.6055-3.3945-0.89453-0.53516 0.26953-1.0703 0.625-1.6055 1.0703-3.2148 2.5-4.9102 5.8945-5.2695 10.09-5.3594-2.8555-10.535-2.7695-15.715 0-0.17969-0.98438-0.17969-1.6953-0.35938-2.4102-1.0703-3.5703-2.8555-6.6953-6.25-8.4844-1.875-0.98047-3.3047-0.71484-3.9297 0.71484-0.71484 1.7852 0.44531 2.4102 1.875 3.0352 4.0195 1.9648 5.8047 8.4844 3.3047 12.145-1.875 2.8555-2.8555 5.8945-2.5898 9.375 0 0.98047-0.26953 1.6055-1.1602 2.2305-1.6953 0.98047-3.2148 2.3203-4.5547 3.8398-2.1445 2.5-2.1445 2.3203-5.0898 0.89453-2.1445-0.98047-3.4805-2.3203-4.2852-4.5547-0.625-1.875-1.6055-3.75-2.5-5.5352-0.53516-1.25-1.6953-1.7852-2.9453-1.1602s-1.4297 1.7852-0.89453 3.0352c0.35938 0.89453 0.98438 1.7852 1.25 2.6797 1.5195 5 4.4648 8.6602 9.5547 10.359 0.98047 0.35547 0.98047 0.80469 0.625 1.7852-0.98047 2.6797-1.6953 5.5352-1.9648 8.3945-0.35547 3.3906-0.26953 3.3047-3.6602 3.3906-1.5195 0-3.125-0.35547-4.375 1.0703-2.3203 2.7695-4.8203 5.3555-7.1445 8.0352-0.98438 0.98047-1.3398 2.3203-0.17969 3.3047 1.0703 0.89453 2.3203 0.625 3.3047-0.44531 1.7852-1.9648 3.75-3.8398 5.3555-5.8945 1.25-1.6094 2.5898-2.1445 4.5547-2.0547 1.1602 0.089844 1.6055 0.17969 1.5195 1.5195-0.26953 3.75 0.089844 7.5 1.0703 11.25 0.26953 1.25-0.17969 1.6953-1.0703 2.4102-2.0547 1.5195-4.4648 2.6797-5.4453 5.0898-1.4297 3.3945-2.6797 6.875-3.8398 10.359-0.35547 1.1602-0.35547 2.5898 1.25 3.0352 1.5195 0.44531 2.3203-0.44531 2.7695-1.7852 0.80469-2.2305 1.6953-4.375 2.4102-6.6094 0.71484-2.5898 2.0547-4.6445 4.375-6.0703 0.98047-0.625 1.3398-0.53516 1.7852 0.53516 1.3398 2.7695 2.9453 5.2695 5.0898 7.5 7.1445 7.5 15.805 10.984 26.074 8.5703 9.4648-2.3203 15.625-8.5703 19.375-17.41 3.5703 1.7852 5.2695 5 6.3398 8.5703 0.53516 1.7852 1.1602 3.5703 1.875 5.3555 0.44531 1.1602 1.3398 1.875 2.6797 1.4297 1.0703-0.44531 1.875-1.3398 1.4297-2.5-2.4102-5.8945-3.125-12.859-9.7344-16.25-0.26953-0.17969-0.44531-0.44531-0.71484-0.625-0.53516-0.35938-0.44531-0.71484-0.35938-1.1602 0.80469-4.0195 1.1602-8.125 1.3398-12.234 0-0.35938-0.17969-0.71484 0.35547-0.98438 1.3398-0.44531 4.1094 0.26953 5.0898 1.4297 1.9648 2.2305 3.9297 4.375 5.9805 6.6094 0.98438 1.0703 2.2305 1.3398 3.3047 0.44531 1.25-0.98047 0.98438-2.2305 0-3.3047-1.3281-1.4219-2.7578-2.8477-4.0078-4.457zm-18.75-18.395c1.0703 1.6055 0.80469 2.8555-0.44531 4.1094-2.9453 2.8555-6.6094 3.9297-10.445 4.7305-1.9648 0.44531-4.0195 0.44531-6.0703 0.80469-1.0703 0.089844-1.5195-0.089844-1.5195-1.3398 0.089844-2.7695 0.089844-5.4453 0.089844-8.125l-0.003906-8.3945c0-0.625-0.089844-1.1602 0.89453-1.0703 7.1406 0.625 13.391 2.9453 17.5 9.2852zm-38.844-2.4102c3.2148-4.1953 7.8594-5.8945 12.859-6.5195 3.3945-0.35547 3.3945-0.26953 3.3945 3.2148v5.9805c0 2.6797-0.089844 5.4453 0 8.125 0 1.0703-0.26953 1.25-1.3398 1.1602-4.4648-0.26953-8.9297-0.89453-12.949-3.125-6.1602-3.4766-5.4453-4.3711-1.9648-8.8359zm-5.625 24.824c-0.089844-5.1797 0.17969-10.27 1.25-15.359 1.25 0.80469 2.3203 1.9648 3.5703 2.6797 4.8203 2.7695 10.09 3.8398 15.535 3.9297 0.44531 0 0.80469 0 1.0703 0.17969 0.17969 0 0.35547 0.17969 0.44531 0.44531 0.089844 0.17969 0.089844 0.35938 0.089844 0.625-0.089844 11.34-0.089844 22.59-0.089844 33.84 0.089844 1.1602-0.35937 1.25-1.3398 1.0703-2.5898-0.625-5-1.5195-7.4102-2.6797-8.9258-5.8008-12.852-14.195-13.121-24.73zm22.324-35.805c-2.9453 0-5.8047 0.35547-8.6602 1.0703-1.0703 0.26953-1.4297 0.17969-1.1602-1.0703 1.0703-5.8945 4.5547-9.4648 10.445-10.535 6.4297-1.0703 13.035 5.1797 12.32 11.785-4.2852-1.1641-8.5703-1.3398-12.945-1.25zm22.945 48.84c-3.5703 8.4844-10 13.395-19.199 14.465 0-0.53516-0.089843-1.0703-0.089843-1.6094v-32.68c0-0.625 0.089843-1.25 0.17969-1.9648 7.6797 0.089844 14.91-1.3398 21.074-6.6953 1.4297 9.8242 1.9648 19.379-1.9648 28.484z" />
        </svg>
    </button>


      {/* Modal Overlay */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
          onClick={handleClose}
        >
          {/* Modal Content */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: theme.colors.background.main,
              borderRadius: theme.borderRadius,
              border: `1px solid ${theme.colors.border.primary}`,
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: theme.spacing.lg,
                borderBottom: `1px solid ${theme.colors.border.primary}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: theme.colors.text.primary,
                }}
              >
                Report a Bug or Suggestion
              </h2>
              <button
                onClick={handleClose}
                aria-label="Close"
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: theme.colors.text.secondary,
                  padding: '0',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ×
              </button>
            </div>

            {/* Form */}
            {submitted ? (
              <div
                style={{
                  padding: theme.spacing.xl,
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: '48px',
                    marginBottom: theme.spacing.md,
                  }}
                >
                  ✓
                </div>
                <h3
                  style={{
                    margin: 0,
                    marginBottom: theme.spacing.sm,
                    color: theme.colors.text.primary,
                  }}
                >
                  Thank you!
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: theme.colors.text.secondary,
                  }}
                >
                  Your report has been submitted.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ padding: theme.spacing.lg }}>
                  {/* Category */}
                  <div style={{ marginBottom: theme.spacing.md }}>
                    <label
                      htmlFor="bug-category"
                      style={{
                        display: 'block',
                        marginBottom: theme.spacing.sm,
                        fontWeight: 500,
                        color: theme.colors.text.primary,
                      }}
                    >
                      Category *
                    </label>
                    <select
                      id="bug-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value as BugCategory)}
                      required
                      style={{
                        width: '100%',
                        padding: theme.spacing.sm,
                        borderRadius: theme.borderRadius,
                        border: `1px solid ${theme.colors.border.primary}`,
                        backgroundColor: theme.colors.background.secondary,
                        color: theme.colors.text.primary,
                        fontSize: '14px',
                      }}
                    >
                      <option value="critical">Critical Bug</option>
                      <option value="bug">Bug / Error</option>
                      <option value="feedback">Feedback</option>
                      <option value="design_idea">Design Idea</option>
                      <option value="feature_idea">Feature Idea</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div style={{ marginBottom: theme.spacing.md }}>
                    <label
                      htmlFor="bug-description"
                      style={{
                        display: 'block',
                        marginBottom: theme.spacing.sm,
                        fontWeight: 500,
                        color: theme.colors.text.primary,
                      }}
                    >
                      Description *
                    </label>
                    <textarea
                      id="bug-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      rows={6}
                      placeholder="Please describe the issue or suggestion in detail..."
                      style={{
                        width: '100%',
                        padding: theme.spacing.sm,
                        borderRadius: theme.borderRadius,
                        border: `1px solid ${theme.colors.border.primary}`,
                        backgroundColor: theme.colors.background.secondary,
                        color: theme.colors.text.primary,
                        fontSize: '14px',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                      }}
                    />
                  </div>

                  {/* Page URL (read-only) */}
                  <div style={{ marginBottom: theme.spacing.md }}>
                    <label
                      htmlFor="bug-url"
                      style={{
                        display: 'block',
                        marginBottom: theme.spacing.sm,
                        fontWeight: 500,
                        color: theme.colors.text.primary,
                      }}
                    >
                      Page URL
                    </label>
                    <input
                      id="bug-url"
                      type="text"
                      value={pageUrl}
                      readOnly
                      style={{
                        width: '100%',
                        padding: theme.spacing.sm,
                        borderRadius: theme.borderRadius,
                        border: `1px solid ${theme.colors.border.primary}`,
                        backgroundColor: theme.colors.background.tertiary,
                        color: theme.colors.text.secondary,
                        fontSize: '14px',
                      }}
                    />
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div
                      style={{
                        padding: theme.spacing.sm,
                        backgroundColor: '#fee',
                        color: '#c33',
                        borderRadius: theme.borderRadius,
                        marginBottom: theme.spacing.md,
                        fontSize: '14px',
                      }}
                    >
                      {error}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div
                  style={{
                    padding: theme.spacing.lg,
                    borderTop: `1px solid ${theme.colors.border.primary}`,
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: theme.spacing.sm,
                  }}
                >
                  <button
                    type="button"
                    onClick={handleClose}
                    style={{
                      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                      borderRadius: theme.borderRadius,
                      border: `1px solid ${theme.colors.border.primary}`,
                      backgroundColor: theme.colors.background.secondary,
                      color: theme.colors.text.primary,
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 500,
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                      borderRadius: theme.borderRadius,
                      border: 'none',
                      backgroundColor: theme.colors.primary,
                      color: '#fff',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: 500,
                      opacity: isSubmitting ? 0.6 : 1,
                    }}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
