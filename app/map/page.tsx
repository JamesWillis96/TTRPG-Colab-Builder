'use client'
export const dynamic = 'force-dynamic'
export const runtime = 'edge'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { theme, styles } from '../../lib/theme'

type POI = {
  id: string
  x: number  // Stored as ratio (0-1) of map width
  y: number  // Stored as ratio (0-1) of map height
  title: string
  wiki_page_id?: string
  created_by?: string
  category?: string
}

export default function MapEditorPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [instructionsOpen, setInstructionsOpen] = useState(true)
  const [visibleCategories, setVisibleCategories] = useState<Record<string, boolean>>({ location: true, npc: true, faction: true })
  const [filterOpen, setFilterOpen] = useState(false)
  const [mapLoading, setMapLoading] = useState(true)  // Added for map loading state
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.2)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [pois, setPois] = useState<POI[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newPoiPosition, setNewPoiPosition] = useState({ x: 0, y: 0 })
  const [poiTitle, setPoiTitle] = useState('')
  const [poiCategory, setPoiCategory] = useState('location')
  const [loading, setLoading] = useState(true)
  const [mapDimensions, setMapDimensions] = useState({ width: 1920, height: 1080 })
  const [movingPoiId, setMovingPoiId] = useState<string | null>(null)
  const [movingOffset, setMovingOffset] = useState<{x: number, y: number}>({x: 0, y: 0})

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user) {
      loadMapDimensions()
      loadPOIs()
    }
  }, [user, authLoading, router])

  // Handle POI query parameter for zooming and centering
  useEffect(() => {
    const poiId = searchParams.get('poi')
    if (poiId && pois.length > 0 && mapDimensions.width > 0 && containerRef.current) {
      const poi = pois.find(p => p.id === poiId)
      if (poi) {
        const container = containerRef.current
        const containerWidth = container.clientWidth
        const containerHeight = container.clientHeight
        const newScale = 0.3
        const poiPixelX = poi.x * mapDimensions.width
        const poiPixelY = poi.y * mapDimensions.height
        const newPositionX = containerWidth / 2 - poiPixelX * newScale
        const newPositionY = containerHeight / 2 - poiPixelY * newScale
        setScale(newScale)
        setPosition({ x: newPositionX, y: newPositionY })
      }
    }
  }, [searchParams, pois, mapDimensions])

  // Load map dimensions and fit to screen
  const loadMapDimensions = () => {
    const img = new Image()
    img.onload = () => {
      setMapDimensions({ width: img.width, height: img.height })
      if (containerRef.current) {
        const container = containerRef.current
        const containerWidth = container.clientWidth
        const containerHeight = container.clientHeight
        const fitScale = Math.min(containerWidth / img.width, containerHeight / img.height)
        const fitX = (containerWidth - img.width * fitScale) / 2
        const fitY = (containerHeight - img.height * fitScale) / 2
        setScale(fitScale)
        setPosition({ x: fitX, y: fitY })
      }
      setMapLoading(false)  // Set loading to false when image loads
    }
    img.src = '/world-map.png'
  }

  const loadPOIs = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('map_pois')
        .select('*')
        .order('created_at', { ascending: true })
      if (error) {
        console.error('Error loading POIs:', error)
      } else {
        setPois(data || [])
      }
    } catch (error: any) {
      console.error('Error loading POIs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPOIIcon = (category: string) => {
    switch (category) {
      case 'npc': return '👤'
      case 'faction': return '🛡️'
      default: return '📍'
    }
  }

  // Zoom with 5% increments
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

  // Panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Add POI on right-click
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top
    const mapX = (clickX - position.x) / scale
    const mapY = (clickY - position.y) / scale
    const ratioX = mapX / mapDimensions.width
    const ratioY = mapY / mapDimensions.height
    setNewPoiPosition({ x: ratioX, y: ratioY })
    setShowCreateModal(true)
    setPoiTitle('')
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
          category: poiCategory
        })
        .select()
        .single()
      if (poiError) throw poiError
      setPois([...pois, newPoi])
      setShowCreateModal(false)
      setPoiTitle('')
    } catch (error: any) {
      alert('Error creating POI: ' + error.message)
    }
  }

  // Delete POI
  const handleDeletePOI = async (poi: POI) => {
    if (poi.created_by !== user?.id) {
      alert('You can only delete POIs you created!')
      return
    }
    if (!confirm('Delete this POI?')) return
    try {
      const { error } = await supabase
        .from('map_pois')
        .delete()
        .eq('id', poi.id)
      if (error) throw error
      setPois(pois.filter(p => p.id !== poi.id))
    } catch (error: any) {
      alert('Error deleting POI: ' + error.message)
    }
  }

  // Reset to fit view
  const resetView = () => {
    if (containerRef.current) {
      const container = containerRef.current
      const containerWidth = container.clientWidth
      const containerHeight = container.clientHeight
      const fitScale = Math.min(containerWidth / mapDimensions.width, containerHeight / mapDimensions.height)
      const fitX = (containerWidth - mapDimensions.width * fitScale) / 2
      const fitY = (containerHeight - mapDimensions.height * fitScale) / 2
      setScale(fitScale)
      setPosition({ x: fitX, y: fitY })
    }
  }

  // Moving POI
  const handleMapMouseMove = (e: React.MouseEvent) => {
    if (!movingPoiId) return
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const mapX = (mouseX - position.x) / scale
    const mapY = (mouseY - position.y) / scale
    const ratioX = mapX / mapDimensions.width
    const ratioY = mapY / mapDimensions.height
    setMovingOffset({ x: ratioX, y: ratioY })
  }

  const handleMapMouseUp = async () => {
    if (!movingPoiId) return
    const poi = pois.find(p => p.id === movingPoiId)
    if (!poi) return
    try {
      const { error } = await supabase
        .from('map_pois')
        .update({ x: movingOffset.x, y: movingOffset.y })
        .eq('id', movingPoiId)
      if (!error) {
        setPois(pois.map(p => p.id === movingPoiId ? { ...p, x: movingOffset.x, y: movingOffset.y } : p))
      }
    } catch {}
    setMovingPoiId(null)
  }

  if (authLoading || loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 'calc(100vh - 80px)',
        color: theme.colors.text.secondary
      }}>
        Loading...
      </div>
    )
  }

  if (!user) return null

  return (
    <main style={{
      height: 'calc(100vh - 55px)',
      overflow: 'hidden',
      position: 'relative',
      background: theme.colors.background.main
    }}>
      {/* Filter Dropdown */}
      <div style={{ position: 'absolute', top: '2rem', left: '2rem', zIndex: 10 }}>
        <button
          onClick={() => setFilterOpen(!filterOpen)}
          style={{
            padding: '0.5rem 1.8rem',
            background: theme.colors.background.secondary,
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: theme.borderRadius,
            color: theme.colors.text.primary,
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          Filter ▼
        </button>
        {filterOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '0.25rem',
            zIndex: 10,
            padding: 0,
            background: 'transparent',
            border: 'none'
          }}>
            {Object.keys(visibleCategories).map(category => (
              <button
                key={category}
                onClick={() => setVisibleCategories({ ...visibleCategories, [category]: !visibleCategories[category] })}
                style={{
                  display: 'block',
                  marginBottom: '0.25rem',
                  marginTop: '0.25rem',
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                  background: visibleCategories[category] ? theme.colors.primary : theme.colors.background.tertiary,
                  border: `1px solid ${theme.colors.border.secondary}`,
                  borderRadius: theme.borderRadius,
                  padding: '0.25rem',
                  paddingLeft: '1.5rem',
                  paddingRight: '1.5rem',
                  cursor: 'pointer',
                  color: visibleCategories[category] ? 'white' : theme.colors.text.secondary,
                  width: '100%',
                  textAlign: 'left'
                }}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Controls Overlay */}
      <div style={{
        position: 'absolute',
        bottom: '2rem',
        right: '2rem',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        <div style={{
          background: theme.colors.background.secondary,
          border: `1px solid ${theme.colors.border.primary}`,
          borderRadius: theme.borderRadius,
          padding: '0.75rem',
          color: theme.colors.text.primary,
          fontSize: '0.875rem',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          Zoom: {Math.round(scale * 100)}%
        </div>
        <div style={{
          background: theme.colors.background.secondary,
          border: `1px solid ${theme.colors.border.primary}`,
          borderRadius: theme.borderRadius,
          padding: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setScale(Math.min(5, scale + 0.05))}
              style={{
                width: 'calc(50% - 0.25rem)',
                height: 'calc(50% - 0.25rem)',
                background: theme.colors.background.tertiary,
                color: theme.colors.text.primary,
                border: `1px solid ${theme.colors.border.secondary}`,
                borderRadius: theme.borderRadius,
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              +
            </button>
            <button
              onClick={() => setScale(Math.max(0.1, scale - 0.05))}
              style={{
                width: 'calc(50% - 0.25rem)',
                height: 'calc(50% - 0.25rem)',
                background: theme.colors.background.tertiary,
                color: theme.colors.text.primary,
                border: `1px solid ${theme.colors.border.secondary}`,
                borderRadius: theme.borderRadius,
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              −
            </button>
          </div>
          <button
            onClick={resetView}
            style={{
              width: '100%',
              height: 'calc(50% - 0.25rem)',
              background: theme.colors.background.tertiary,
              color: theme.colors.text.primary,
              border: `1px solid ${theme.colors.border.secondary}`,
              borderRadius: theme.borderRadius,
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Instructions Overlay */}
      <div 
        onClick={() => setInstructionsOpen(false)}
        style={{
          position: 'absolute',
          bottom: '5.5rem',
          left: '2rem',
          zIndex: 10,
          background: theme.colors.background.secondary,
          border: `1px solid ${theme.colors.border.primary}`,
          borderRadius: theme.borderRadius,
          padding: '0.5rem',
          color: theme.colors.text.secondary,
          fontSize: '0.875rem',
          cursor: 'pointer',
          transform: instructionsOpen ? 'scale(1)' : 'scale(0)',
          transformOrigin: 'bottom left',
          transition: 'transform 0.3s ease',
          pointerEvents: instructionsOpen ? 'auto' : 'none'
        }}
        title="Click to hide instructions"
      >
        <div>🖱️ Click and drag to pan</div>
        <div>🔍 Scroll to zoom</div>
        <div>📍 Right-click to add pin</div>
        <div>✋ Ctrl+Click and drag a pin to move it</div>
        <div>🖱️ Click a pin to open its wiki page</div>
        <div style={{ textAlign: 'center', marginTop: '0.5rem', color: theme.colors.text.muted }}>
          -click to hide-
        </div>
      </div>

      {/* Compass Icon */}
      <div
        onClick={() => setInstructionsOpen(!instructionsOpen)}
        style={{
          position: 'absolute',
          bottom: '1rem',
          left: '1rem',
          zIndex: 10,
          padding: '0.5rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 1,
          pointerEvents: 'auto'
        }}
        title={instructionsOpen ? "Click to hide instructions" : "Click to show instructions"}
      >
        <span style={{ fontSize: '3rem' }}>🧭</span>
      </div>

      {/* Map Container */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={e => { handleMouseMove(e); handleMapMouseMove(e); }}
        onMouseUp={e => { handleMouseUp(); handleMapMouseUp(); }}
        onMouseLeave={handleMouseUp}
        onContextMenu={handleContextMenu}
        style={{
          width: '100%',
          height: '100%',
          cursor: isDragging ? 'grabbing' : 'grab',
          overflow: 'hidden',
          position: 'relative',
          backgroundImage: 'url(/world-map.png)',
          backgroundPosition: `${position.x}px ${position.y}px`,
          backgroundSize: `${mapDimensions.width * scale}px ${mapDimensions.height * scale}px`,
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* POI Markers */}
        {pois.map(poi => (
          visibleCategories[poi.category || 'location'] && (
            <POIMarker
              key={poi.id}
              poi={poi}
              scale={scale}
              position={position}
              mapDimensions={mapDimensions}
              onDelete={handleDeletePOI}
              router={router}
              canDelete={poi.created_by === user?.id}
              movingPoiId={movingPoiId}
              setMovingPoiId={setMovingPoiId}
              movingOffset={movingOffset}
              setMovingOffset={setMovingOffset}
              icon={getPOIIcon(poi.category || 'location')}
            />
          )
        ))}
      </div>

      {/* Map Loading Overlay */}
      {mapLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 20,
          color: 'white',
          fontSize: '1.5rem'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '1rem'
          }}></div>
          Loading map...
        </div>
      )}

      {/* Create POI Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}
        onClick={() => setShowCreateModal(false)}
        >
          <div style={{
            background: theme.colors.background.secondary,
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: theme.borderRadius,
            padding: '2rem',
            width: '90%',
            maxWidth: '500px'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <h2 style={styles.heading1}>📍 Create Point of Interest</h2>
            <div style={{ marginBottom: '1rem' }}>
              <label style={styles.label}>Location Name</label>
              <input
                type="text"
                value={poiTitle}
                onChange={(e) => setPoiTitle(e.target.value)}
                placeholder="e.g., Dragon's Peak, The Forgotten Temple"
                autoFocus
                style={styles.input}
                onKeyDown={(e) => e.key === 'Enter' && handleCreatePOI()}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={styles.label}>Category</label>
              <select
                value={poiCategory}
                onChange={(e) => setPoiCategory(e.target.value)}
                style={styles.select}
              >
                <option value="location">📍 Location</option>
                <option value="npc">👤 NPC</option>
                <option value="faction">🛡️ Faction</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={handleCreatePOI}
                disabled={!poiTitle.trim()}
                style={styles.button.primary}
              >
                Create POI & Wiki Page
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                style={styles.button.secondary}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

// POI Marker Component
function POIMarker({ poi, scale, position, mapDimensions, onDelete, router, canDelete, movingPoiId, setMovingPoiId, movingOffset, setMovingOffset, icon }: {
  poi: POI
  scale: number
  position: { x: number, y: number }
  mapDimensions: { width: number, height: number }
  onDelete: (poi: POI) => void
  router: any
  canDelete: boolean
  movingPoiId: string | null
  setMovingPoiId: (id: string | null) => void
  movingOffset: { x: number, y: number }
  setMovingOffset: (offset: {x: number, y: number}) => void
  icon: string
}) {
  const [isHovered, setIsHovered] = useState(false)
  const pixelX = poi.x * mapDimensions.width
  const pixelY = poi.y * mapDimensions.height
  const isMoving = movingPoiId === poi.id
  const markerX = isMoving ? movingOffset.x * mapDimensions.width : pixelX
  const markerY = isMoving ? movingOffset.y * mapDimensions.height : pixelY
  return (
    <div
      style={{
        position: 'absolute',
        left: `${markerX * scale + position.x}px`,
        top: `${markerY * scale + position.y}px`,
        transform: `translate(-50%, -100%) scale(${scale})`,
        transformOrigin: 'center bottom',
        zIndex: 5,
        cursor: isMoving ? 'grabbing' : 'pointer',
        opacity: isMoving ? 0.7 : 1
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={e => {
        if (e.ctrlKey) {
          e.stopPropagation()
          setMovingPoiId(poi.id)
          setMovingOffset({ x: poi.x, y: poi.y })
        }
      }}
      onClick={e => {
        if (e.ctrlKey) return
        e.stopPropagation()
        if (poi.wiki_page_id) {
          supabase
            .from('wiki_pages')
            .select('slug')
            .eq('id', poi.wiki_page_id)
            .single()
            .then(({ data }) => {
              if (data) router.push(`/wiki/${data.slug}`)
            })
        }
      }}
      onContextMenu={e => {
        e.preventDefault()
        e.stopPropagation()
        if (canDelete) onDelete(poi)
        else alert('You can only delete POIs you created!')
      }}
    >
      <div 
        style={{
          fontSize: '6rem',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))',
          color: theme.colors.danger,
          transition: 'transform 0.2s',
          transform: isHovered ? 'scale(1.3)' : 'scale(1)'
        }}
      >
        {icon}
      </div>
      {isHovered && (
        <div 
          style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: '0.25rem',
            padding: '0.25rem 0.5rem',
            background: theme.colors.background.secondary,
            border: `1px solid ${theme.colors.primary}`,
            borderRadius: theme.borderRadius,
            color: theme.colors.text.primary,
            fontSize: '3rem',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            pointerEvents: 'none'
          }}
        >
          {poi.title}
        </div>
      )}
    </div>
  )
}