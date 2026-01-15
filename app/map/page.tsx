'use client'

import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'

type POI = {
  id: string
  x: number
  y: number
  title: string
  wiki_page_id?: string
  created_by?: string
  category?: string
  visibility?: string
  notes?: string
  view_count?: number
  discovered_at?: string
  discovered_in_session_id?: string
}

type WikiPage = {
  id: string
  title: string
  slug: string
  content: string
  category: string
  author_id: string
  updated_at: string
}

export default function MapEditorPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const { theme, styles } = useTheme()
  const router = useRouter()
  const searchParams = useSearchParams()

  // UI State
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false)
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null)
  const [selectedWikiPage, setSelectedWikiPage] = useState<WikiPage | null>(null)
  const [playerViewMode, setPlayerViewMode] = useState(false)
  const [visibleCategories, setVisibleCategories] = useState<Record<string, boolean>>({
    location: true,
    npc: true,
    faction: true,
    lore: true,
    item: true
  })
  const [showCreatePopup, setShowCreatePopup] = useState(false)
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 })
  const [hoveredPoiId, setHoveredPoiId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Map State
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.2)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [mapDimensions, setMapDimensions] = useState({ width: 1920, height: 1080 })
  const [mapLoading, setMapLoading] = useState(true)

  // POI State
  const [pois, setPois] = useState<POI[]>([])
  const [loading, setLoading] = useState(true)
  const [newPoiPosition, setNewPoiPosition] = useState({ x: 0, y: 0 })
  const [poiTitle, setPoiTitle] = useState('')
  const [poiCategory, setPoiCategory] = useState('location')
  const [poiVisibility, setPoiVisibility] = useState('public')
  const [movingPoiId, setMovingPoiId] = useState<string | null>(null)
  const [movingOffset, setMovingOffset] = useState({ x: 0, y: 0 })

  // Editing State
  const [isEditingWiki, setIsEditingWiki] = useState(false)
  const [editedContent, setEditedContent] = useState('')

  // Touch State
  const [isPinching, setIsPinching] = useState(false)
  const [lastTouchDistance, setLastTouchDistance] = useState(0)
  const [lastTouchCenter, setLastTouchCenter] = useState({ x: 0, y: 0 })

  const isGM = profile?.role === 'gm' || profile?.role === 'admin'

  // Auth & Load
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user) {
      loadMapDimensions()
      loadPOIs()
    }
  }, [user, authLoading, router])

  // Focus POI from query param
  useEffect(() => {
    const poiId = searchParams?.get('poi')
    if (poiId && pois.length > 0 && mapDimensions.width > 0 && containerRef.current) {
      const poi = pois.find(p => p.id === poiId)
      if (poi) {
        const container = containerRef.current
        const newScale = 0.3
        const poiPixelX = poi.x * mapDimensions.width
        const poiPixelY = poi.y * mapDimensions.height
        const newPositionX = container.clientWidth / 2 - poiPixelX * newScale
        const newPositionY = container.clientHeight / 2 - poiPixelY * newScale
        setScale(newScale)
        setPosition({ x: newPositionX, y: newPositionY })
        handleSelectPoi(poi)
      }
    }
  }, [searchParams, pois, mapDimensions])

  // Load map image dimensions
  const loadMapDimensions = () => {
    const img = new Image()
    img.onload = () => {
      setMapDimensions({ width: img.width, height: img.height })
      if (containerRef.current) {
        const container = containerRef.current
        const fitScale = Math.min(
          container.clientWidth / img.width,
          container.clientHeight / img.height
        )
        const fitX = (container.clientWidth - img.width * fitScale) / 2
        const fitY = (container.clientHeight - img.height * fitScale) / 2
        setScale(fitScale)
        setPosition({ x: fitX, y: fitY })
      }
      setMapLoading(false)
    }
    img.src = '/world-map.png'
  }

  // Load POIs
  const loadPOIs = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('map_pois')
        .select('*')
        .order('created_at', { ascending: true })
      if (error) throw error
      setPois(data || [])
    } catch (error: any) {
      console.error('Error loading POIs:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle POI selection
  const handleSelectPoi = async (poi: POI) => {
    setSelectedPoi(poi)
    setRightSidebarOpen(true)
    setIsEditingWiki(false)

    // Increment view count
    await supabase
      .from('map_pois')
      .update({ 
        view_count: (poi.view_count || 0) + 1 
      })
      .eq('id', poi.id)

    // Load wiki page
    if (poi.wiki_page_id) {
      const { data, error } = await supabase
        .from('wiki_pages')
        .select('*')
        .eq('id', poi.wiki_page_id)
        .single()
      if (!error && data) {
        setSelectedWikiPage(data)
        setEditedContent(data.content)
      }
    }
  }

  // Update POI visibility
  const updatePoiVisibility = async (poiId: string, newVisibility: string) => {
    try {
      const { error } = await supabase
        .from('map_pois')
        .update({ visibility: newVisibility })
        .eq('id', poiId)
      
      if (!error) {
        setPois(pois.map(p => p.id === poiId ? { ...p, visibility: newVisibility } : p))
        if (selectedPoi?.id === poiId) {
          setSelectedPoi({ ...selectedPoi, visibility: newVisibility })
        }
      }
    } catch (error: any) {
      console.error('Error updating visibility:', error)
    }
  }

  // Save wiki content
  const saveWikiContent = async () => {
    if (!selectedWikiPage) return
    
    try {
      const { error } = await supabase
        .from('wiki_pages')
        .update({ content: editedContent })
        .eq('id', selectedWikiPage.id)
      
      if (!error) {
        setSelectedWikiPage({ ...selectedWikiPage, content: editedContent })
        setIsEditingWiki(false)
      }
    } catch (error: any) {
      alert('Error saving content: ' + error.message)
    }
  }

  // Get POI icon by category
  const getPOIIcon = (category: string) => {
    switch (category) {
      case 'npc':
      case 'player character':
        return '👤'
      case 'faction':
        return '🛡️'
      case 'item':
        return '⚔️'
      case 'lore':
        return '📜'
      default:
        return '📍'
    }
  }

  // Get visibility badge
  const getVisibilityBadge = (visibility?: string) => {
    switch (visibility) {
      case 'gm_only':
        return { icon: '🔒', label: 'GM Only', color: '#dc2626' }
      case 'rumored':
        return { icon: '❓', label: 'Rumored', color: '#f59e0b' }
      default:
        return { icon: '👁️', label: 'Public', color: '#10b981' }
    }
  }

  // Filter POIs based on visibility and player view mode
  const getVisiblePois = () => {
    return pois.filter(poi => {
      // Category filter
      if (!visibleCategories[poi.category || 'location']) return false
      
      // Search filter
      if (searchQuery && !poi.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
      
      // Visibility filter
      const vis = poi.visibility || 'public'
      if (playerViewMode && vis === 'gm_only') return false
      
      return true
    })
  }

  // Map interactions
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const mapX = (mouseX - position.x) / scale
    const mapY = (mouseY - position.y) / scale
    const delta = e.deltaY > 0 ? -0.05 : 0.05
    const newScale = Math.min(Math.max(0.1, scale + delta), 5)
    const newX = mouseX - mapX * newScale
    const newY = mouseY - mapY * newScale
    setScale(newScale)
    setPosition({ x: newX, y: newY })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || movingPoiId) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })

    if (movingPoiId && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      const mapX = (mouseX - position.x) / scale
      const mapY = (mouseY - position.y) / scale
      const ratioX = mapX / mapDimensions.width
      const ratioY = mapY / mapDimensions.height
      setMovingOffset({ x: ratioX, y: ratioY })
    }
  }

  const handleMouseUp = async () => {
    setIsDragging(false)
    if (movingPoiId) {
      try {
        const { error } = await supabase
          .from('map_pois')
          .update({ x: movingOffset.x, y: movingOffset.y })
          .eq('id', movingPoiId)
        if (!error) {
          setPois(
            pois.map(p =>
              p.id === movingPoiId ? { ...p, x: movingOffset.x, y: movingOffset.y } : p
            )
          )
        }
      } catch {}
      setMovingPoiId(null)
    }
  }

  // Touch handlers
  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return 0
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const getTouchCenter = (touches: React.TouchList) => {
    if (touches.length < 2) return { x: touches[0].clientX, y: touches[0].clientY }
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true)
      setDragStart({ x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y })
    } else if (e.touches.length === 2) {
      setIsPinching(true)
      setLastTouchDistance(getTouchDistance(e.touches))
      setLastTouchCenter(getTouchCenter(e.touches))
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    if (e.touches.length === 1 && isDragging) {
      setPosition({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y })
    } else if (e.touches.length === 2 && isPinching) {
      const newDistance = getTouchDistance(e.touches)
      const newCenter = getTouchCenter(e.touches)
      if (lastTouchDistance > 0) {
        const scaleChange = newDistance / lastTouchDistance
        const newScale = Math.min(Math.max(0.1, scale * scaleChange), 5)
        const mapCenterX = (newCenter.x - position.x) / scale
        const mapCenterY = (newCenter.y - position.y) / scale
        const newX = newCenter.x - mapCenterX * newScale
        const newY = newCenter.y - mapCenterY * newScale
        setScale(newScale)
        setPosition({ x: newX, y: newY })
      }
      setLastTouchDistance(newDistance)
      setLastTouchCenter(newCenter)
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      setIsDragging(false)
      setIsPinching(false)
    }
  }

  // Right-click to create POI
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isGM) return // Only GMs can create POIs
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top
    const mapX = (clickX - position.x) / scale
    const mapY = (clickY - position.y) / scale
    const ratioX = mapX / mapDimensions.width
    const ratioY = mapY / mapDimensions.height
    setNewPoiPosition({ x: ratioX, y: ratioY })
    setPopupPosition({ x: e.clientX, y: e.clientY })
    setShowCreatePopup(true)
  }

  // Create POI
  const handleCreatePOI = async () => {
    if (!poiTitle.trim() || !user) return
    try {
      const slug = poiTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      const { data: wikiPage, error: wikiError } = await supabase
        .from('wiki_pages')
        .insert({
          title: poiTitle,
          slug,
          content: `# ${poiTitle}\n\nA location on the world map.\n\n## Description\n\n*Add description here*`,
          category: poiCategory,
          author_id: user.id
        })
        .select()
        .single()
      if (wikiError) throw wikiError

      const { data: newPoi, error: poiError } = await supabase
        .from('map_pois')
        .insert({
          x: newPoiPosition.x,
          y: newPoiPosition.y,
          title: poiTitle,
          wiki_page_id: wikiPage.id,
          created_by: user.id,
          category: poiCategory,
          visibility: poiVisibility
        })
        .select()
        .single()
      if (poiError) throw poiError

      setPois([...pois, newPoi])
      setShowCreatePopup(false)
      setPoiTitle('')
      setPoiVisibility('public')
      handleSelectPoi(newPoi)
    } catch (error: any) {
      alert('Error creating POI: ' + error.message)
    }
  }

  // Delete POI
  const handleDeletePOI = async () => {
    if (!selectedPoi) return
    if (selectedPoi.created_by !== user?.id && !isGM) {
      alert('You can only delete POIs you created!')
      return
    }
    if (!confirm(`Delete "${selectedPoi.title}"?`)) return
    try {
      const { error } = await supabase.from('map_pois').delete().eq('id', selectedPoi.id)
      if (error) throw error
      setPois(pois.filter(p => p.id !== selectedPoi.id))
      setRightSidebarOpen(false)
      setSelectedPoi(null)
      setSelectedWikiPage(null)
    } catch (error: any) {
      alert('Error deleting POI: ' + error.message)
    }
  }

  // Reset view to fit
  const resetView = () => {
    if (containerRef.current) {
      const container = containerRef.current
      const fitScale = Math.min(
        container.clientWidth / mapDimensions.width,
        container.clientHeight / mapDimensions.height
      )
      const fitX = (container.clientWidth - mapDimensions.width * fitScale) / 2
      const fitY = (container.clientHeight - mapDimensions.height * fitScale) / 2
      setScale(fitScale)
      setPosition({ x: fitX, y: fitY })
    }
  }

  const visiblePois = getVisiblePois()

  if (authLoading || loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 'calc(100vh - 80px)',
          color: theme.colors.text.secondary
        }}
      >
        Loading...
      </div>
    )
  }

  if (!user) return null

  return (
    <main
      style={{
        height: 'calc(100vh - 55px)',
        overflow: 'hidden',
        position: 'relative',
        background: theme.colors.background.main,
        display: 'flex'
      }}
    >
      {/* Left Sidebar - Filters & Search */}
      <div
        style={{
          width: leftSidebarOpen ? '280px' : '0px',
          height: '100%',
          background: theme.colors.background.secondary,
          borderRight: `1px solid ${theme.colors.border.primary}`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'width 0.3s ease',
          zIndex: 20
        }}
      >
        <div
          style={{
            padding: '1rem',
            borderBottom: `1px solid ${theme.colors.border.primary}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <h3 style={{ ...styles.heading1, margin: 0 }}>📍 Locations</h3>
          <button
            onClick={() => setLeftSidebarOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              color: theme.colors.text.secondary,
              cursor: 'pointer',
              fontSize: '1.2rem',
              padding: 0
            }}
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '0.75rem', borderBottom: `1px solid ${theme.colors.border.primary}` }}>
          <input
            type="text"
            placeholder="Search locations..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 8px',
              fontSize: '0.875rem',
              background: theme.colors.background.main,
              color: theme.colors.text.primary,
              border: `1px solid ${theme.colors.border.secondary}`,
              borderRadius: theme.borderRadius,
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Category Filters */}
        <div style={{ padding: '0.75rem', borderBottom: `1px solid ${theme.colors.border.primary}` }}>
          <label style={{ fontSize: '0.75rem', color: theme.colors.text.secondary, marginBottom: '6px', display: 'block' }}>
            Categories
          </label>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {Object.entries(visibleCategories).map(([category, visible]) => (
              <button
                key={category}
                onClick={() => setVisibleCategories({ ...visibleCategories, [category]: !visible })}
                style={{
                  padding: '4px 8px',
                  fontSize: '0.7rem',
                  background: visible ? theme.colors.primary : theme.colors.background.tertiary,
                  color: visible ? 'white' : theme.colors.text.secondary,
                  border: `1px solid ${theme.colors.border.secondary}`,
                  borderRadius: theme.borderRadius,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Visibility Filter */}
        {isGM && (
          <div style={{ padding: '0.75rem', borderBottom: `1px solid ${theme.colors.border.primary}` }}>
            <label style={{ fontSize: '0.75rem', color: theme.colors.text.secondary, marginBottom: '6px', display: 'block' }}>
              Visibility
            </label>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={!playerViewMode}
                onChange={() => setPlayerViewMode(!playerViewMode)}
                id="gm-view"
                style={{ cursor: 'pointer' }}
              />
              <label htmlFor="gm-view" style={{ fontSize: '0.875rem', color: theme.colors.text.primary, cursor: 'pointer' }}>
                Show GM-only POIs
              </label>
            </div>
          </div>
        )}

        {/* POI List */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '0.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}
        >
          <div style={{ fontSize: '0.75rem', color: theme.colors.text.tertiary, padding: '0.5rem 0.25rem' }}>
            {visiblePois.length} location{visiblePois.length !== 1 ? 's' : ''}
          </div>
          {visiblePois.length === 0 ? (
            <div style={{ color: theme.colors.text.tertiary, fontSize: '0.875rem', padding: '0.5rem', fontStyle: 'italic' }}>
              No locations found
            </div>
          ) : (
            visiblePois.map(poi => {
              const visBadge = getVisibilityBadge(poi.visibility)
              return (
                <button
                  key={poi.id}
                  onClick={() => handleSelectPoi(poi)}
                  style={{
                    padding: '8px',
                    textAlign: 'left',
                    background: selectedPoi?.id === poi.id ? theme.colors.primary : theme.colors.background.main,
                    color: selectedPoi?.id === poi.id ? 'white' : theme.colors.text.primary,
                    border: `1px solid ${theme.colors.border.secondary}`,
                    borderRadius: theme.borderRadius,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    opacity: poi.visibility === 'rumored' ? 0.7 : 1
                  }}
                  onMouseEnter={() => setHoveredPoiId(poi.id)}
                  onMouseLeave={() => setHoveredPoiId(null)}
                >
                  <span>{getPOIIcon(poi.category || 'location')}</span>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {poi.title}
                  </span>
                  {isGM && poi.visibility !== 'public' && (
                    <span style={{ fontSize: '0.7rem' }}>{visBadge.icon}</span>
                  )}
                </button>
              )
            })
          )}
        </div>

        {/* Create POI Button */}
        {isGM && (
          <div style={{ padding: '0.75rem', borderTop: `1px solid ${theme.colors.border.primary}` }}>
            <button
              onClick={() => {
                if (containerRef.current) {
                  const rect = containerRef.current.getBoundingClientRect()
                  const centerX = (rect.width / 2 - position.x) / scale
                  const centerY = (rect.height / 2 - position.y) / scale
                  setNewPoiPosition({
                    x: centerX / mapDimensions.width,
                    y: centerY / mapDimensions.height
                  })
                  setPopupPosition({ x: rect.width / 2, y: rect.height / 2 })
                }
                setShowCreatePopup(true)
              }}
              style={{
                width: '100%',
                padding: '8px',
                background: theme.colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: theme.borderRadius,
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 'bold'
              }}
            >
              + New Location
            </button>
          </div>
        )}
      </div>

      {/* Sidebar Toggle */}
      {!leftSidebarOpen && (
        <button
          onClick={() => setLeftSidebarOpen(true)}
          style={{
            position: 'absolute',
            left: '0.5rem',
            top: '0.5rem',
            zIndex: 19,
            padding: '0.5rem 0.75rem',
            background: theme.colors.background.secondary,
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: theme.borderRadius,
            color: theme.colors.text.primary,
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          ☰
        </button>
      )}

      {/* Map Container */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          flex: 1,
          cursor: isDragging ? 'grabbing' : 'grab',
          overflow: 'hidden',
          position: 'relative',
          backgroundImage: 'url(/world-map.png)',
          backgroundPosition: `${position.x}px ${position.y}px`,
          backgroundSize: `${mapDimensions.width * scale}px ${mapDimensions.height * scale}px`,
          backgroundRepeat: 'no-repeat',
          touchAction: 'none'
        }}
      >
        {/* POI Markers */}
        {visiblePois.map(poi => {
          const visBadge = getVisibilityBadge(poi.visibility)
          const pixelX = poi.x * mapDimensions.width
          const pixelY = poi.y * mapDimensions.height
          const isMoving = movingPoiId === poi.id
          const markerX = isMoving ? movingOffset.x * mapDimensions.width : pixelX
          const markerY = isMoving ? movingOffset.y * mapDimensions.height : pixelY
          const isHovered = hoveredPoiId === poi.id
          const isSelected = selectedPoi?.id === poi.id

          return (
            <div
              key={poi.id}
              style={{
                position: 'absolute',
                left: `${markerX * scale + position.x}px`,
                top: `${markerY * scale + position.y}px`,
                transform: `translate(-50%, -100%) scale(${scale})`,
                transformOrigin: 'center bottom',
                zIndex: isSelected ? 10 : 5,
                cursor: isMoving ? 'grabbing' : 'pointer',
                opacity: poi.visibility === 'rumored' ? 0.6 : isMoving ? 0.7 : 1
              }}
              onMouseEnter={() => setHoveredPoiId(poi.id)}
              onMouseLeave={() => setHoveredPoiId(null)}
              onMouseDown={e => {
                if (e.ctrlKey && isGM) {
                  e.stopPropagation()
                  setMovingPoiId(poi.id)
                  setMovingOffset({ x: poi.x, y: poi.y })
                }
              }}
              onClick={e => {
                if (e.ctrlKey) return
                e.stopPropagation()
                handleSelectPoi(poi)
              }}
            >
              <div
                style={{
                  fontSize: '6rem',
                  filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.8))`,
                  transition: 'transform 0.2s',
                  transform: isHovered || isSelected ? 'scale(1.3)' : 'scale(1)',
                  border: poi.visibility === 'gm_only' && isGM ? '4px solid #dc2626' : 'none',
                  borderRadius: '50%',
                  position: 'relative'
                }}
              >
                {getPOIIcon(poi.category || 'location')}
                {poi.visibility === 'rumored' && (
                  <div style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    fontSize: '2.5rem',
                    background: '#f59e0b',
                    borderRadius: '50%',
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    ❓
                  </div>
                )}
              </div>
              {(isHovered || isSelected) && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginTop: '0.25rem',
                    padding: '0.5rem 0.75rem',
                    background: theme.colors.background.secondary,
                    border: `2px solid ${theme.colors.primary}`,
                    borderRadius: theme.borderRadius,
                    color: theme.colors.text.primary,
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                  }}
                >
                  {poi.title}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Controls Toolbar - Top Right */}
      <div
        style={{
          position: 'absolute',
          top: '1rem',
          right: rightSidebarOpen ? '330px' : '1rem',
          zIndex: 10,
          display: 'flex',
          gap: '0.5rem',
          transition: 'right 0.3s ease'
        }}
      >
        {/* GM/Player View Toggle */}
        {isGM && (
          <button
            onClick={() => setPlayerViewMode(!playerViewMode)}
            style={{
              padding: '0.5rem 0.75rem',
              background: playerViewMode ? theme.colors.primary : theme.colors.background.secondary,
              color: playerViewMode ? 'white' : theme.colors.text.primary,
              border: `1px solid ${theme.colors.border.primary}`,
              borderRadius: theme.borderRadius,
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {playerViewMode ? '👁️ Player View' : '🎮 GM View'}
          </button>
        )}

        {/* Fit View Button */}
        <button
          onClick={resetView}
          style={{
            padding: '0.5rem 0.75rem',
            background: theme.colors.background.secondary,
            color: theme.colors.text.primary,
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: theme.borderRadius,
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 'bold'
          }}
        >
          🏠 Fit View
        </button>

        {/* Zoom Display */}
        <div
          style={{
            padding: '0.5rem 0.75rem',
            background: theme.colors.background.secondary,
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: theme.borderRadius,
            color: theme.colors.text.primary,
            fontSize: '0.875rem',
            fontWeight: 'bold'
          }}
        >
          {Math.round(scale * 100)}%
        </div>
      </div>

      {/* Right Sidebar - POI Details */}
      <div
        style={{
          width: rightSidebarOpen ? '320px' : '0px',
          height: '100%',
          background: theme.colors.background.secondary,
          borderLeft: `1px solid ${theme.colors.border.primary}`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'width 0.3s ease',
          zIndex: 20
        }}
      >
        {selectedPoi && (
          <>
            {/* Header */}
            <div
              style={{
                padding: '1rem',
                borderBottom: `1px solid ${theme.colors.border.primary}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: theme.colors.text.primary, marginBottom: '4px' }}>
                  {getPOIIcon(selectedPoi.category || 'location')} {selectedPoi.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: theme.colors.text.tertiary }}>
                  {selectedPoi.category || 'location'}
                </div>
              </div>
              <button
                onClick={() => {
                  setRightSidebarOpen(false)
                  setSelectedPoi(null)
                  setSelectedWikiPage(null)
                  setIsEditingWiki(false)
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: theme.colors.text.secondary,
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  padding: 0
                }}
              >
                ✕
              </button>
            </div>

            {/* Visibility Controls */}
            {isGM && (
              <div style={{ padding: '0.75rem', borderBottom: `1px solid ${theme.colors.border.primary}`, background: theme.colors.background.main }}>
                <label style={{ fontSize: '0.75rem', color: theme.colors.text.secondary, marginBottom: '6px', display: 'block' }}>
                  Visibility
                </label>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[
                    { value: 'public', label: 'Public', icon: '👁️' },
                    { value: 'rumored', label: 'Rumored', icon: '❓' },
                    { value: 'gm_only', label: 'GM Only', icon: '🔒' }
                  ].map(vis => (
                    <button
                      key={vis.value}
                      onClick={() => updatePoiVisibility(selectedPoi.id, vis.value)}
                      style={{
                        flex: 1,
                        padding: '6px',
                        fontSize: '0.7rem',
                        background: (selectedPoi.visibility || 'public') === vis.value ? theme.colors.primary : theme.colors.background.tertiary,
                        color: (selectedPoi.visibility || 'public') === vis.value ? 'white' : theme.colors.text.secondary,
                        border: `1px solid ${theme.colors.border.secondary}`,
                        borderRadius: theme.borderRadius,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2px'
                      }}
                    >
                      <span>{vis.icon}</span>
                      <span>{vis.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Wiki Content */}
            <div style={{ flex: 1, overflow: 'auto', padding: '1rem' }}>
              {selectedWikiPage ? (
                isEditingWiki ? (
                  <div>
                    <textarea
                      value={editedContent}
                      onChange={e => setEditedContent(e.target.value)}
                      style={{
                        width: '100%',
                        height: '400px',
                        padding: '0.75rem',
                        background: theme.colors.background.main,
                        color: theme.colors.text.primary,
                        border: `1px solid ${theme.colors.border.secondary}`,
                        borderRadius: theme.borderRadius,
                        fontSize: '0.875rem',
                        fontFamily: 'monospace',
                        resize: 'vertical',
                        boxSizing: 'border-box'
                      }}
                    />
                    <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={saveWikiContent}
                        style={{
                          flex: 1,
                          padding: '8px',
                          background: theme.colors.primary,
                          color: 'white',
                          border: 'none',
                          borderRadius: theme.borderRadius,
                          cursor: 'pointer',
                          fontSize: '0.875rem'
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingWiki(false)
                          setEditedContent(selectedWikiPage.content)
                        }}
                        style={{
                          flex: 1,
                          padding: '8px',
                          background: theme.colors.background.tertiary,
                          color: theme.colors.text.primary,
                          border: `1px solid ${theme.colors.border.secondary}`,
                          borderRadius: theme.borderRadius,
                          cursor: 'pointer',
                          fontSize: '0.875rem'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '0.875rem', color: theme.colors.text.primary, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                      {selectedWikiPage.content}
                    </div>
                    {isGM && (
                      <button
                        onClick={() => setIsEditingWiki(true)}
                        style={{
                          marginTop: '1rem',
                          width: '100%',
                          padding: '8px',
                          background: theme.colors.background.tertiary,
                          color: theme.colors.text.primary,
                          border: `1px solid ${theme.colors.border.secondary}`,
                          borderRadius: theme.borderRadius,
                          cursor: 'pointer',
                          fontSize: '0.875rem'
                        }}
                      >
                        ✏️ Edit Content
                      </button>
                    )}
                  </div>
                )
              ) : (
                <div style={{ color: theme.colors.text.tertiary, fontStyle: 'italic' }}>
                  No wiki page linked
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ padding: '0.75rem', borderTop: `1px solid ${theme.colors.border.primary}`, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                onClick={() => {
                  if (selectedWikiPage) {
                    router.push(`/wiki?entry=${selectedWikiPage.slug}`)
                  }
                }}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: theme.colors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: theme.borderRadius,
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                📖 Open Full Wiki Page
              </button>
              {isGM && (
                <button
                  onClick={handleDeletePOI}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: theme.borderRadius,
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  🗑️ Delete Location
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Map Loading Overlay */}
      {mapLoading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            color: 'white'
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🗺️</div>
          Loading map...
        </div>
      )}

      {/* Create POI Popup */}
      {showCreatePopup && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 99,
              cursor: 'default',
              background: 'rgba(0,0,0,0.3)'
            }}
            onClick={() => setShowCreatePopup(false)}
          />
          <div
            style={{
              position: 'fixed',
              left: `${popupPosition.x}px`,
              top: `${popupPosition.y}px`,
              transform: 'translate(-50%, -50%)',
              background: theme.colors.background.secondary,
              border: `2px solid ${theme.colors.primary}`,
              borderRadius: theme.borderRadius,
              padding: '1.5rem',
              width: '340px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              zIndex: 100
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ ...styles.heading1, margin: '0 0 1rem 0' }}>📍 New Location</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={styles.label}>Name</label>
              <input
                type="text"
                value={poiTitle}
                onChange={e => setPoiTitle(e.target.value)}
                placeholder="e.g., Dragon's Peak"
                autoFocus
                style={styles.input}
                onKeyDown={e => e.key === 'Enter' && handleCreatePOI()}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={styles.label}>Category</label>
              <select
                value={poiCategory}
                onChange={e => setPoiCategory(e.target.value)}
                style={styles.select}
              >
                <option value="location">📍 Location</option>
                <option value="npc">👤 NPC</option>
                <option value="faction">🛡️ Faction</option>
                <option value="item">⚔️ Item</option>
                <option value="lore">📜 Lore</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={styles.label}>Visibility</label>
              <select
                value={poiVisibility}
                onChange={e => setPoiVisibility(e.target.value)}
                style={styles.select}
              >
                <option value="public">👁️ Public (All players can see)</option>
                <option value="rumored">❓ Rumored (Players know vaguely)</option>
                <option value="gm_only">🔒 GM Only (Hidden from players)</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={handleCreatePOI} 
                disabled={!poiTitle.trim()} 
                style={{ 
                  ...styles.button.primary, 
                  flex: 1,
                  opacity: poiTitle.trim() ? 1 : 0.5,
                  cursor: poiTitle.trim() ? 'pointer' : 'not-allowed'
                }}
              >
                Create
              </button>
              <button 
                onClick={() => {
                  setShowCreatePopup(false)
                  setPoiTitle('')
                  setPoiVisibility('public')
                }} 
                style={{ ...styles.button.secondary, flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  )
}
