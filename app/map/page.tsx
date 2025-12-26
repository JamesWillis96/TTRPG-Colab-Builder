'use client'

import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { theme, styles } from '../../lib/theme'

type POI = {
  id: string
  x: number  // Now stored as ratio (0-1) of map width
  y: number  // Now stored as ratio (0-1) of map height
  title: string
  wiki_page_id?:  string
  created_by?:  string
}

export default function MapEditorPage() {
  const { user, loading:  authLoading } = useAuth()
  const router = useRouter()
  
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.2)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y:  0 })
  const [pois, setPois] = useState<POI[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newPoiPosition, setNewPoiPosition] = useState({ x: 0, y: 0 })
  const [poiTitle, setPoiTitle] = useState('')
  const [poiCategory, setPoiCategory] = useState('location')
  const [loading, setLoading] = useState(true)
  const [mapDimensions, setMapDimensions] = useState({ width: 1920, height: 1080 }) // Default dimensions
  const [movingPoiId, setMovingPoiId] = useState<string | null>(null)
  const [movingOffset, setMovingOffset] = useState<{x: number, y: number}>({x: 0, y: 0})

  useEffect(() => {
    if (!authLoading && ! user) {
      router.push('/login')
    } else if (user) {
      loadMapDimensions()
      loadPOIs()
    }
  }, [user, authLoading, router])

  // Load the actual map image dimensions
  const loadMapDimensions = () => {
    const img = new Image()
    img.onload = () => {
      setMapDimensions({ width: img.width, height: img.height })
      console.log('Map dimensions:', img.width, 'x', img.height)
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
    } catch (error:  any) {
      console.error('Error loading POIs:', error)
    } finally {
      setLoading(false)
    }
  }


  // Handle mouse wheel for zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    
    if (! containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    
    // Get mouse position relative to container
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    
    // Calculate mouse position in map coordinates (before zoom)
    const mapX = (mouseX - position.x) / scale
    const mapY = (mouseY - position.y) / scale
    
    // Calculate new scale
    const delta = e.deltaY * -0.001
    const newScale = Math. min(Math.max(0.1, scale + delta), 5)
    
    // Calculate new position to keep mouse point fixed
    const newX = mouseX - mapX * newScale
    const newY = mouseY - mapY * newScale
    
    setScale(newScale)
    setPosition({ x: newX, y: newY })
    }

  // Handle mouse down to start dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return // Only left click for dragging
    
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  // Handle mouse move for panning
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    setPosition({
      x: e. clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }

  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Handle right click to add POI
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    
    // Calculate click position relative to container
    const clickX = e.clientX - rect.left
    const clickY = e. clientY - rect.top
    
    // Calculate position on the actual map (accounting for pan and zoom)
    const mapX = (clickX - position.x) / scale
    const mapY = (clickY - position.y) / scale
    
    // Convert to ratio (0-1) of map dimensions
    const ratioX = mapX / mapDimensions.width
    const ratioY = mapY / mapDimensions.height

    console.log('POI position:', { mapX, mapY, ratioX, ratioY, mapDimensions })

    setNewPoiPosition({ x: ratioX, y: ratioY })
    setShowCreateModal(true)
    setPoiTitle('')
  }

  // Create POI and wiki page
  const handleCreatePOI = async () => {
    if (!poiTitle.trim() || !user) return

    try {
      // Create wiki page
      const slug = poiTitle. toLowerCase().replace(/[^a-z0-9]+/g, '-')
      
      const { data: wikiPage, error:  wikiError } = await supabase
        .from('wiki_pages')
        .insert({
          title: poiTitle,
          slug: slug,
          content: `# ${poiTitle}\n\nA location on the world map.\n\n## Description\n\n*Add description here*`,
          category: poiCategory,
          author_id: user.id
        })
        .select()
        .single()

      if (wikiError) {
        console.error('Error creating wiki page:', wikiError)
        alert('Error creating wiki page:  ' + wikiError.message)
        return
      }

      // Create POI in database (storing as ratio 0-1)
      const { data: newPoi, error: poiError } = await supabase
        .from('map_pois')
        .insert({
          x: newPoiPosition.x,
          y: newPoiPosition.y,
          title: poiTitle,
          wiki_page_id: wikiPage.id,
          created_by: user.id
        })
        .select()
        .single()

      if (poiError) {
        console.error('Error creating POI:', poiError)
        alert('Error creating POI: ' + poiError.message)
        return
      }

      // Add to local state
      setPois([...pois, newPoi])

      setShowCreateModal(false)
      setPoiTitle('')
      
    } catch (error: any) {
      console.error('Error creating POI:', error)
      alert('Error creating POI: ' + error.message)
    }
  }

  // Delete POI
  const handleDeletePOI = async (poi: POI) => {
    // Check if user owns this POI
    if (poi.created_by !== user?. id) {
      alert('You can only delete POIs you created!')
      return
    }

    if (! confirm('Delete this POI?')) return
    
    try {
      const { error } = await supabase
        .from('map_pois')
        .delete()
        .eq('id', poi.id)

      if (error) {
        console.error('Error deleting POI:', error)
        alert('Error deleting POI: ' + error.message)
        return
      }

      // Remove from local state
      setPois(pois.filter(p => p.id !== poi.id))
    } catch (error: any) {
      console.error('Error deleting POI:', error)
      alert('Error deleting POI: ' + error.message)
    }
  }

  // Reset view
  const resetView = () => {
    setScale(0.1)
    setPosition({ x: 0, y:  0 })
  }

  const handleMapMouseMove = (e: React.MouseEvent) => {
    if (!movingPoiId) return
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    // Calculate position on the actual map (accounting for pan and zoom)
    const mapX = (mouseX - position.x) / scale
    const mapY = (mouseY - position.y) / scale
    // Convert to ratio (0-1) of map dimensions
    const ratioX = mapX / mapDimensions.width
    const ratioY = mapY / mapDimensions.height
    setMovingOffset({ x: ratioX, y: ratioY })
  }

  const handleMapMouseUp = async () => {
    if (!movingPoiId) return
    // Update POI in database and local state
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

  if (!user) {
    return null
  }

  return (
    <main style={{
      height: 'calc(100vh - 80px)',
      overflow: 'hidden',
      position: 'relative',
      background: theme.colors.background.main
    }}>
      {/* Controls Overlay */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        {/* Zoom Level Display */}
        <div style={{
          background: theme.colors.background.secondary,
          border: `1px solid ${theme.colors.border.primary}`,
          borderRadius: theme.borderRadius,
          padding: '0.75rem 1rem',
          color: theme.colors.text.primary,
          fontSize: '0.875rem',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          Zoom: {Math.round(scale * 100)}%
        </div>

        {/* Zoom Controls */}
        <div style={{
          background: theme.colors.background.secondary,
          border:  `1px solid ${theme.colors.border.primary}`,
          borderRadius: theme.borderRadius,
          padding: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <button
            onClick={() => setScale(Math.min(5, scale + 0.1))}
            style={{
              padding: '0.5rem 1rem',
              background: theme.colors.background.tertiary,
              color: theme.colors.text.primary,
              border: `1px solid ${theme.colors.border.secondary}`,
              borderRadius: theme.borderRadius,
              cursor: 'pointer',
              fontSize: '1. 25rem',
              fontWeight: 'bold'
            }}
          >
            +
          </button>
          <button
            onClick={() => setScale(Math.max(0.1, scale - 0.1))}
            style={{
              padding: '0.5rem 1rem',
              background: theme.colors.background.tertiary,
              color: theme.colors.text.primary,
              border: `1px solid ${theme.colors.border.secondary}`,
              borderRadius:  theme.borderRadius,
              cursor:  'pointer',
              fontSize:  '1.25rem',
              fontWeight: 'bold'
            }}
          >
            −
          </button>
          <button
            onClick={resetView}
            style={{
              padding: '0.5rem 1rem',
              background:  theme.colors.background.tertiary,
              color: theme.colors.text.primary,
              border: `1px solid ${theme.colors.border.secondary}`,
              borderRadius: theme.borderRadius,
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 'bold'
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Instructions Overlay */}
      <div style={{
        position: 'absolute',
        bottom: '1rem',
        left: '1rem',
        zIndex: 10,
        background: theme.colors.background.secondary,
        border: `1px solid ${theme.colors.border.primary}`,
        borderRadius: theme.borderRadius,
        padding: '1rem',
        color: theme.colors.text.secondary,
        fontSize: '0.875rem'
      }}>
        <div style={{ marginBottom: '0.5rem', color: theme.colors.primary, fontWeight: 'bold' }}>
          Controls:
        </div>
        <div>🖱️ Click and drag to pan</div>
        <div>🔍 Scroll to zoom</div>
        <div>📍 Right-click to add POI</div>
        <div style={{ marginTop: '0.5rem', color: theme.colors.text.muted }}>
          POIs:  {pois.length}
        </div>
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
          backgroundSize: `${mapDimensions.width * scale}px ${mapDimensions.height * scale}px`,          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* POI Markers */}
        {pois.map(poi => (
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
          />
        ))}
      </div>

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
          justifyContent:  'center',
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
            <h2 style={styles.heading1}>
              📍 Create Point of Interest
            </h2>

            <div style={{ marginBottom:  '1rem' }}>
              <label style={styles.label}>
                Location Name
              </label>
              <input
                type="text"
                value={poiTitle}
                onChange={(e) => setPoiTitle(e.target. value)}
                placeholder="e.g., Dragon's Peak, The Forgotten Temple"
                autoFocus
                style={styles.input}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreatePOI()
                  }
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={styles.label}>
                Category
              </label>
              <select
                value={poiCategory}
                onChange={(e) => setPoiCategory(e.target.value)}
                style={styles.select}
              >
                <option value="location">📍 Location</option>
                <option value="npc">👤 NPC</option>
                <option value="faction">🛡️ Faction</option>
                <option value="lore">📜 Lore</option>
                <option value="general">📄 General</option>
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

// Separate component for POI markers to manage individual hover states
function POIMarker({ poi, scale, position, mapDimensions, onDelete, router, canDelete, movingPoiId, setMovingPoiId, movingOffset, setMovingOffset }: {
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
}) {
  const [isHovered, setIsHovered] = useState(false)
  // Convert ratio (0-1) back to pixel coordinates
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
          // Set initial offset to current position
          setMovingOffset({ x: poi.x, y: poi.y })
        }
      }}
      onClick={e => {
        if (e.ctrlKey) return // Don't navigate if ctrl is pressed
        e.stopPropagation()
        if (poi.wiki_page_id) {
          supabase
            .from('wiki_pages')
            .select('slug')
            .eq('id', poi.wiki_page_id)
            .single()
            .then(({ data }) => {
              if (data) {
                router.push(`/wiki/${data.slug}`)
              }
            })
        }
      }}
      onContextMenu={e => {
        e.preventDefault()
        e.stopPropagation()
        if (canDelete) {
          onDelete(poi)
        } else {
          alert('You can only delete POIs you created!')
        }
      }}
    >
      {/* Pin Icon */}
      <div 
        style={{
          fontSize: '6rem',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))',
          color: theme.colors.danger,
          transition: 'transform 0.2s',
          transform: isHovered ? 'scale(1.3)' : 'scale(1)'
        }}
      >
        📍
      </div>
      {/* Label - Only shows on hover */}
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
            borderRadius:  theme.borderRadius,
            color:  theme.colors.text.primary,
            fontSize: '4rem',
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