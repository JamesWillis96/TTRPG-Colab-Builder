'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { supabase } from '../../lib/supabase'

export default function ProfilePage() {
  const { user } = useAuth()
  const { theme } = useTheme()
  const [username, setUsername] = useState('')
  const [role, setRole] = useState('player')
  const [aboutMe, setAboutMe] = useState('')
  const [profileImage, setProfileImage] = useState('')
  const [imageZoom, setImageZoom] = useState(1)
  const [imagePositionX, setImagePositionX] = useState(0)
  const [imagePositionY, setImagePositionY] = useState(0)
  const [showImageEditor, setShowImageEditor] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single()

      if (error) throw error

      setUsername(data.username)
      setRole(data.role)
      setAboutMe(data.aboutme || '')
      setProfileImage(data.profile_image || '')
      setImageZoom(data.image_zoom || 1)
      setImagePositionX(data.image_position_x || 0)
      setImagePositionY(data.image_position_y || 0)
    } catch (error: any) {
      console.error('Error loading profile:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          username, 
          role, 
          aboutme: aboutMe, 
          profile_image: profileImage || null,
          image_zoom: imageZoom,
          image_position_x: imagePositionX,
          image_position_y: imagePositionY
        })
        .eq('id', user!.id)

      if (error) throw error

      setMessage('Profile updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error: any) {
      setMessage('Error: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return (
      <main
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: theme.colors.background.main,
          color: theme.colors.text.secondary,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '16px' }}>Please log in to view your profile.</p>
        </div>
      </main>
    )
  }

  if (loading) {
    return (
      <main
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: theme.colors.background.main,
          color: theme.colors.text.secondary,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '16px' }}>Loading...</p>
        </div>
      </main>
    )
  }

  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: theme.colors.background.main,
        color: theme.colors.text.primary,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: theme.spacing.lg,
          borderBottom: `1px solid ${theme.colors.border.primary}`,
          backgroundColor: theme.colors.background.secondary,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: '28px',
            fontWeight: 700,
            color: theme.colors.text.primary,
          }}
        >
          Your Profile
        </h1>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: theme.spacing.lg,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '600px',
          }}
        >
          {/* User Info Card */}
          <div
            style={{
              marginBottom: theme.spacing.lg,
              padding: theme.spacing.lg,
              backgroundColor: theme.colors.background.secondary,
              borderRadius: theme.borderRadius,
              border: `1px solid ${theme.colors.border.primary}`,
              display: 'flex',
              gap: theme.spacing.lg,
              alignItems: 'flex-start',
            }}
          >
            {/* Profile Image Circle */}
            <div
              style={{
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: theme.spacing.sm,
              }}
            >
              <div
                onClick={() => setShowImageEditor(true)}
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  border: `2px solid ${theme.colors.border.primary}`,
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.colors.background.main,
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transform: `scale(${imageZoom}) translate(${imagePositionX}px, ${imagePositionY}px)`,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      fontSize: '40px',
                      color: theme.colors.text.secondary,
                    }}
                  >
                    {username ? username.charAt(0).toUpperCase() : '?'}
                  </div>
                )}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    width: '30px',
                    height: '30px',
                    backgroundColor: theme.colors.primary,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    color: '#fff',
                    border: `2px solid ${theme.colors.background.secondary}`,
                  }}
                >
                  ✎
                </div>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: '12px',
                  color: theme.colors.text.secondary,
                  textAlign: 'center',
                  maxWidth: '120px',
                }}
              >
                Click to edit
              </p>
            </div>

            {/* User Info */}
            <div
              style={{
                flex: 1,
              }}
            >
              <div style={{ marginBottom: theme.spacing.md }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: '12px',
                    fontWeight: 600,
                    color: theme.colors.text.secondary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: theme.spacing.xs,
                  }}
                >
                  Email
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: '14px',
                    color: theme.colors.text.primary,
                  }}
                >
                  {user.email}
                </p>
              </div>

              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: '12px',
                    fontWeight: 600,
                    color: theme.colors.text.secondary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: theme.spacing.xs,
                  }}
                >
                  User ID
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    color: theme.colors.text.primary,
                  }}
                >
                  {user.id}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave}>
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
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: theme.spacing.md,
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: theme.borderRadius,
                  backgroundColor: theme.colors.background.main,
                  color: theme.colors.text.primary,
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

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
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: theme.spacing.md,
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: theme.borderRadius,
                  backgroundColor: theme.colors.background.main,
                  color: theme.colors.text.primary,
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                }}
              >
                <option value="player">Player</option>
                <option value="gm">Game Master</option>
              </select>
              <p
                style={{
                  margin: `${theme.spacing.xs} 0 0 0`,
                  fontSize: '12px',
                  color: theme.colors.text.secondary,
                }}
              >
                Adjust your role to customize your experience
              </p>
            </div>

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
                About Me
              </label>
              <textarea
                value={aboutMe}
                onChange={(e) => setAboutMe(e.target.value)}
                rows={5}
                style={{
                  width: '100%',
                  padding: theme.spacing.md,
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: theme.borderRadius,
                  backgroundColor: theme.colors.background.main,
                  color: theme.colors.text.primary,
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                  minHeight: '120px',
                }}
                placeholder="Tell us a bit about yourself..."
              />
            </div>

            {message && (
              <div
                style={{
                  padding: theme.spacing.md,
                  marginBottom: theme.spacing.lg,
                  backgroundColor: message.startsWith('Error')
                    ? theme.colors.background.main
                    : theme.colors.background.main,
                  border: message.startsWith('Error')
                    ? `1px solid #dc3545`
                    : `1px solid #28a745`,
                  borderRadius: theme.borderRadius,
                  color: message.startsWith('Error') ? '#dc3545' : '#28a745',
                  fontSize: '14px',
                }}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              style={{
                padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                backgroundColor: theme.colors.primary,
                color: '#fff',
                border: 'none',
                borderRadius: theme.borderRadius,
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                opacity: saving ? 0.6 : 1,
                width: '100%',
                transition: 'opacity 0.2s',
              }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>

          {/* Image Editor Modal */}
          {showImageEditor && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
              }}
              onClick={() => setShowImageEditor(false)}
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
                <h2
                  style={{
                    margin: `0 0 ${theme.spacing.lg} 0`,
                    fontSize: '20px',
                    fontWeight: 600,
                    color: theme.colors.text.primary,
                  }}
                >
                  Edit Profile Image
                </h2>

                {/* Image URL Input */}
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
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={profileImage}
                    onChange={(e) => setProfileImage(e.target.value)}
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
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {profileImage && (
                  <>
                    {/* Preview Circle */}
                    <div style={{ marginBottom: theme.spacing.lg }}>
                      <p
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: theme.colors.text.secondary,
                          marginBottom: theme.spacing.sm,
                          textTransform: 'uppercase',
                        }}
                      >
                        Preview
                      </p>
                      <div
                        style={{
                          width: '200px',
                          height: '200px',
                          borderRadius: '50%',
                          border: `2px solid ${theme.colors.border.primary}`,
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: theme.colors.background.secondary,
                          margin: '0 auto',
                        }}
                      >
                        <img
                          src={profileImage}
                          alt="Preview"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transform: `scale(${imageZoom}) translate(${imagePositionX}px, ${imagePositionY}px)`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Zoom Control */}
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
                        Zoom: {imageZoom.toFixed(2)}x
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="3"
                        step="0.1"
                        value={imageZoom}
                        onChange={(e) => setImageZoom(parseFloat(e.target.value))}
                        style={{
                          width: '100%',
                        }}
                      />
                    </div>

                    {/* Position Controls */}
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
                        Horizontal Position: {imagePositionX}px
                      </label>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        step="1"
                        value={imagePositionX}
                        onChange={(e) => setImagePositionX(parseInt(e.target.value))}
                        style={{
                          width: '100%',
                          marginBottom: theme.spacing.md,
                        }}
                      />

                      <label
                        style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: 600,
                          color: theme.colors.text.secondary,
                          marginBottom: theme.spacing.sm,
                        }}
                      >
                        Vertical Position: {imagePositionY}px
                      </label>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        step="1"
                        value={imagePositionY}
                        onChange={(e) => setImagePositionY(parseInt(e.target.value))}
                        style={{
                          width: '100%',
                        }}
                      />
                    </div>

                    {/* Reset Button */}
                    <div style={{ marginBottom: theme.spacing.lg }}>
                      <button
                        onClick={() => {
                          setImageZoom(1)
                          setImagePositionX(0)
                          setImagePositionY(0)
                        }}
                        type="button"
                        style={{
                          padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                          backgroundColor: theme.colors.background.secondary,
                          color: theme.colors.text.primary,
                          border: `1px solid ${theme.colors.border.primary}`,
                          borderRadius: theme.borderRadius,
                          cursor: 'pointer',
                          fontSize: '14px',
                          width: '100%',
                        }}
                      >
                        Reset Position & Zoom
                      </button>
                    </div>
                  </>
                )}

                {/* Remove Button */}
                {profileImage && (
                  <div style={{ marginBottom: theme.spacing.lg }}>
                    <button
                      onClick={() => {
                        setProfileImage('')
                        setImageZoom(1)
                        setImagePositionX(0)
                        setImagePositionY(0)
                      }}
                      type="button"
                      style={{
                        padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                        backgroundColor: '#dc3545',
                        color: '#fff',
                        border: 'none',
                        borderRadius: theme.borderRadius,
                        cursor: 'pointer',
                        fontSize: '14px',
                        width: '100%',
                      }}
                    >
                      Remove Image
                    </button>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: theme.spacing.md }}>
                  <button
                    onClick={() => setShowImageEditor(false)}
                    type="button"
                    style={{
                      flex: 1,
                      padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                      backgroundColor: theme.colors.background.secondary,
                      color: theme.colors.text.primary,
                      border: `1px solid ${theme.colors.border.primary}`,
                      borderRadius: theme.borderRadius,
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 600,
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setShowImageEditor(false)}
                    type="button"
                    style={{
                      flex: 1,
                      padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                      backgroundColor: theme.colors.primary,
                      color: '#fff',
                      border: 'none',
                      borderRadius: theme.borderRadius,
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 600,
                    }}
                  >
                    Apply Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}