'use client'

import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { wikiTemplates } from '../../lib/wikiTemplates'

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
  color?: string
  deleted_at?: string | null
  deleted_by?: string | null
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
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [visibleCategories, setVisibleCategories] = useState<Record<string, boolean>>({
    location: true,
    npc: true,
    faction: true,
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
  const [didInitialFit, setDidInitialFit] = useState(false)
  const [navOffset, setNavOffset] = useState(0)

  // POI State
  const [pois, setPois] = useState<POI[]>([])
  const [loading, setLoading] = useState(true)
  const [newPoiPosition, setNewPoiPosition] = useState({ x: 0, y: 0 })
  const [poiTitle, setPoiTitle] = useState('')
  const [poiCategory, setPoiCategory] = useState('location')
  const [poiVisibility, setPoiVisibility] = useState('public')
  const [poiColor, setPoiColor] = useState('#ef4444')
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

  // Force player view for non-GM roles
  useEffect(() => {
    if (!profile?.role) return
    if (profile.role === 'player') {
      setPlayerViewMode(true)
    } else if (profile.role === 'gm' || profile.role === 'admin') {
      setPlayerViewMode(false)
    }
  }, [profile?.role])

  // Measure navbar height so map fits between nav and bottom
  useEffect(() => {
    const measureNav = () => {
      const nav = document.querySelector('nav') as HTMLElement | null
      setNavOffset(nav ? nav.offsetHeight : 0)
    }

    measureNav()
    window.addEventListener('resize', measureNav)
    return () => window.removeEventListener('resize', measureNav)
  }, [])

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

  const centerMapToContainer = (container: HTMLDivElement, mapWidth: number, mapHeight: number, mapScale: number) => {
    const centerX = (container.clientWidth - mapWidth * mapScale) / 2
    const centerY = (container.clientHeight - mapHeight * mapScale) / 2
    setPosition({ x: centerX, y: centerY })
  }

  const fitMapToHeight = (container: HTMLDivElement, mapWidth: number, mapHeight: number) => {
    // Uses container height which already excludes the navbar offset
    const availableHeight = container.clientHeight
    const fitScale = availableHeight / mapHeight
    setScale(fitScale)
    centerMapToContainer(container, mapWidth, mapHeight, fitScale)
  }

  const fitMapToWidth = (container: HTMLDivElement, mapWidth: number, mapHeight: number) => {
    const fitScale = container.clientWidth / mapWidth
    setScale(fitScale)
    centerMapToContainer(container, mapWidth, mapHeight, fitScale)
  }

  const fitMapToContainer = (container: HTMLDivElement, mapWidth: number, mapHeight: number) => {
    const fitScale = Math.min(
      container.clientWidth / mapWidth,
      container.clientHeight / mapHeight
    )
    setScale(fitScale)
    centerMapToContainer(container, mapWidth, mapHeight, fitScale)
  }

  // Load map image dimensions
  const loadMapDimensions = () => {
    const img = new Image()
    img.onload = () => {
      setMapDimensions({ width: img.width, height: img.height })
      setMapLoading(false)
    }
    img.src = '/world-map.png'
  }

  // Ensure initial fit once container is ready
  useEffect(() => {
    if (didInitialFit || mapLoading || loading) return
    const container = containerRef.current
    if (!container) return
    if (container.clientWidth === 0 || container.clientHeight === 0) return

    const id = window.requestAnimationFrame(() => {
      fitMapToContainer(container, mapDimensions.width, mapDimensions.height)
      // fitMapToWidth(container, mapDimensions.width, mapDimensions.height)
      // fitMapToHeight(container, mapDimensions.width, mapDimensions.height)
      setDidInitialFit(true)
    })

    return () => window.cancelAnimationFrame(id)
  }, [didInitialFit, mapLoading, loading, mapDimensions.width, mapDimensions.height, scale])

  // Load POIs
  const loadPOIs = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('map_pois')
        .select('*')
        .is('deleted_at', null)
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
        .is('deleted_at', null)
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
  const getPOIIcon = (category: string, color?: string) => {
    if (category === 'location') {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="19.785 65.718 63.181 125"
          style={{ width: '28px', height: '56px', filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.8))` }}
        >
          <path
            d="M67.463,129.923C54.3,148.789,52.398,164.73,52.398,164.73c-0.292,1.316-1.462,1.316-1.755,0 c0,0-2.486-15.941-15.356-34.808c-10.676-14.918-15.502-20.769-15.502-32.907c0-17.404,13.894-31.298,31.444-31.298 c17.404,0,31.737,13.894,31.737,31.298C82.966,109.154,73.605,121.001,67.463,129.923z M63.66,97.601 c0-6.728-5.265-11.992-12.139-11.992c-6.436,0-11.847,5.265-11.847,11.992s5.411,12.432,11.847,12.432 C58.396,110.032,63.66,104.328,63.66,97.601z"
            fill={color || '#ef4444'}
          />
        </svg>
      )
    }
    switch (category) {
      case 'npc':
      case 'player character':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            version="1.1"
            viewBox="-5.0 -10.0 110.0 135.0"
            style={{ width: '35px', height: '45px', filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.6))` }}
          >
            <path
              d="m70.961 54.422c11.398 3.5898 19.664 14.246 19.664 26.828v3.125c0 2.4844-0.98828 4.8711-2.7461 6.6289-1.7578 1.7578-4.1445 2.7461-6.6289 2.7461h-62.5c-2.4844 0-4.8711-0.98828-6.6289-2.7461-1.7578-1.7578-2.7461-4.1445-2.7461-6.6289v-3.125c0-12.586 8.2656-23.238 19.664-26.828 5.5469 5.0195 12.898 8.0781 20.961 8.0781s15.414-3.0586 20.961-8.0781zm-20.961-48.172c13.797 0 25 11.203 25 25s-11.203 25-25 25-25-11.203-25-25 11.203-25 25-25z"
              fillRule="evenodd"
              fill={color || '#4b5563'}
            />
          </svg>
        )
      case 'faction':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 243 446.25"
            style={{ width: '35px', height: '45px', filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.6))` }}
          >
            <path
              d="M243 3c-75,140 -149,-78 -224,32l0 -25c0,-13 -19,-13 -19,0l0 338c0,13 19,13 19,0l0 -166c75,-110 149,108 224,-32 0,-49 0,-98 0,-146z"
              fill={color || '#4b5563'}
              fillRule="evenodd"
              clipRule="evenodd"
            />
          </svg>
        )
      case 'item':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 60"
            style={{ width: '35px', height: '45px', filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.6))` }}
          >
            <path
              d="M44,9.44l-5.2-5.91a4,4,0,0,0-.79-.7h0a5.07,5.07,0,0,0-.64-.37c-.09-.05-.19-.08-.28-.12s-.36-.13-.54-.18l-.27-.06A4.58,4.58,0,0,0,35.48,2H11.76A4.46,4.46,0,0,0,8.2,3.76L3.77,9.52a4.58,4.58,0,0,0-.93,3,4.42,4.42,0,0,0,.67,2.56l16.74,28.3a4.45,4.45,0,0,0,1.62,1.52,4.4,4.4,0,0,0,2.18.57,4.51,4.51,0,0,0,3.81-2.12l16.61-28.1a4.52,4.52,0,0,0,.69-2.67A4.6,4.6,0,0,0,44,9.44ZM24,4.51,29.77,11H18.23ZM5.35,10.74,9.77,5l4.29,6H5.19A2.26,2.26,0,0,1,5.35,10.74Zm18.7,29.33L17.28,13H30.72ZM33.85,11l3.8-5.81,4.89,5.57c.07.08.12.16.18.24Z"
              fill={color || '#4b5563'}
            />
          </svg>
        )
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
    if (e.button !== 0) return
    if (movingPoiId) return
    // Don't start map dragging if Ctrl is held (reserved for POI movement)
    if (e.ctrlKey) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    // Only pan the map if we're not moving a POI
    if (isDragging && !movingPoiId) {
      setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
    }

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

    // Players are restricted to rumored locations
    if (!isGM) {
      setPoiCategory('location')
      setPoiVisibility('rumored')
      setPoiColor('#ef4444')
    }
    setShowCreatePopup(true)
  }

  // Create POI
  const handleCreatePOI = async () => {
    if (!poiTitle.trim() || !user) return
    try {
      const slug = poiTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      const enforcedCategory = isGM ? poiCategory : 'location'
      const enforcedVisibility = isGM ? poiVisibility : 'rumored'
      const enforcedColor = poiColor
      const baseTemplate = wikiTemplates[enforcedCategory] || wikiTemplates.location
      const templateWithTitle = baseTemplate.replace(/^#\s+.*$/m, `# ${poiTitle}`)
      const content = `${templateWithTitle}\n\n---\n\n**Map Note:** This entry is linked to a map point of interest.\n`
      // Try server-side RPC to atomically rename soft-deleted wiki pages and insert.
      // Fallback to client-side insert if RPC isn't available.
      let wikiPage: any = null
      try {
        const { data: rpcData, error: rpcErr } = await supabase.rpc('create_wiki_page_with_rename', {
          p_title: poiTitle,
          p_slug: slug,
          p_category: enforcedCategory,
          p_content: content,
          p_author_id: user.id,
          p_markdown_theme: 'github',
          p_featured_image: null
        })
        if (!rpcErr && rpcData) wikiPage = Array.isArray(rpcData) ? rpcData[0] : rpcData
      } catch (e) {
        // ignore and fall back
        console.debug('RPC create_wiki_page_with_rename not available, falling back to client insert', e)
      }

      if (!wikiPage) {
        // Client-side fallback: try renaming soft-deleted conflicts, insert,
        // retry on unique-constraint, and finally create with fallback slug.
        const renameDeletedConflicts = async () => {
          const { data: conflictingRows, error: fetchErr } = await supabase
            .from('wiki_pages')
            .select('*')
            .eq('slug', slug)

          if (fetchErr) throw fetchErr

          const deletedConflicts = (conflictingRows || []).filter((p: any) => p.deleted_at)
          for (const [idx, old] of deletedConflicts.entries()) {
            try {
              const uniqueSuffix = `${Date.now()}-${Math.floor(Math.random() * 100000)}`
              const newSlug = `${old.slug}-deprecated-${uniqueSuffix}${idx > 0 ? `-${idx}` : ''}`
              const newTitle = old.title && old.title.includes('(deprecated)') ? old.title : `${old.title} (deprecated)`
              const { error: updErr } = await supabase
                .from('wiki_pages')
                .update({ title: newTitle, slug: newSlug })
                .eq('id', old.id)
              if (updErr) console.warn('Failed to rename soft-deleted wiki page:', updErr)
            } catch (e) {
              console.warn('Error handling soft-deleted conflict for wiki page', e)
            }
          }
        }

        // First attempt
        await renameDeletedConflicts()

        try {
          const res = await supabase
            .from('wiki_pages')
            .insert({
              title: poiTitle,
              slug,
              content,
              category: enforcedCategory,
              author_id: user.id
            })
            .select()
            .single()
          if (res.error) throw res.error
          wikiPage = res.data
        } catch (insertErr: any) {
          const msg = insertErr?.message || ''
          const isUniqueViolation = msg.includes('duplicate key') || msg.includes('unique') || insertErr?.code === '23505'
          if (isUniqueViolation) {
            // rename again and retry
            await renameDeletedConflicts()
            const retry = await supabase
              .from('wiki_pages')
              .insert({
                title: poiTitle,
                slug,
                content,
                category: enforcedCategory,
                author_id: user.id
              })
              .select()
              .single()

            if (retry.error) {
              // Final fallback: create with unique slug
              console.warn('Slug still in use after attempts; creating with fallback slug', retry.error)
              const fallbackSlug = `${slug}-${Date.now()}`
              const fallback = await supabase
                .from('wiki_pages')
                .insert({
                  title: poiTitle,
                  slug: fallbackSlug,
                  content,
                  category: enforcedCategory,
                  author_id: user.id
                })
                .select()
                .single()
              if (fallback.error) throw fallback.error
              wikiPage = fallback.data
            } else {
              wikiPage = retry.data
            }
          } else {
            throw insertErr
          }
        }
      }

      const { data: newPoi, error: poiError } = await supabase
        .from('map_pois')
        .insert({
          x: newPoiPosition.x,
          y: newPoiPosition.y,
          title: poiTitle,
          wiki_page_id: wikiPage.id,
          created_by: user.id,
          category: enforcedCategory,
          visibility: enforcedVisibility,
          color: enforcedColor
        })
        .select()
        .single()
      if (poiError) throw poiError

      setPois([...pois, newPoi])
      setShowCreatePopup(false)
      setPoiTitle('')
      setPoiVisibility('public')
      setPoiColor('#ef4444')
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
      const { error } = await supabase
        .from('map_pois')
        .update({ deleted_at: new Date().toISOString(), deleted_by: user?.id || null })
        .eq('id', selectedPoi.id)
      if (error) throw error

      if (selectedPoi.wiki_page_id) {
        const { error: wikiError } = await supabase
          .from('wiki_pages')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', selectedPoi.wiki_page_id)
        if (wikiError) throw wikiError
      }

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
        position: 'fixed',
        inset: 0,
        top: navOffset,
        height: `calc(100dvh - ${navOffset}px)`,
        minHeight: `calc(100dvh - ${navOffset}px)`,
        maxHeight: `calc(100dvh - ${navOffset}px)`,
        width: '100%',
        overflow: 'hidden',
        background: theme.colors.background.main,
        display: 'flex'
      }}
    >
      {/* Left Sidebar - Filters & Search */}
      <div
        style={{
          width: leftSidebarOpen ? '280px' : '0px',
          height: '100%',
          maxHeight: '100%',
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
              fontSize: '0.5rem',
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
            {Object.entries(visibleCategories).map(([category, visible]) => {
              const categoryCount = pois.filter(p => (p.category || 'location') === category && getVisiblePois().some(vp => vp.id === p.id)).length
              return (
                <button
                  key={category}
                  onClick={() => setVisibleCategories({ ...visibleCategories, [category]: !visible })}
                  style={{
                    padding: '6px 10px',
                    fontSize: '0.75rem',
                    background: visible ? theme.colors.primary : theme.colors.background.tertiary,
                    color: visible ? 'white' : theme.colors.text.secondary,
                    border: `1px solid ${theme.colors.border.secondary}`,
                    borderRadius: theme.borderRadius,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontWeight: visible ? 'bold' : 'normal',
                    display: 'flex',
                    gap: '4px',
                    alignItems: 'center'
                  }}
                  title={`${visible ? 'Click to hide' : 'Click to show'} ${category}`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                  <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>({categoryCount})</span>
                </button>
              )
            })}
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
            <div style={{ color: theme.colors.text.tertiary, fontSize: '0.875rem', padding: '1rem 0.5rem', fontStyle: 'italic', textAlign: 'center' }}>
              {searchQuery 
                ? `No matches for "${searchQuery}"` 
                : pois.length === 0 
                  ? 'No locations yet. Right-click on the map to create one!'
                  : 'No visible locations. Try adjusting your filters.'}
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
                  <span
                    style={{
                      width: '18px',
                      height: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-flex',
                        transform: 'scale(0.35)',
                        transformOrigin: 'center'
                      }}
                    >
                      {getPOIIcon(poi.category || 'location', poi.color)}
                    </span>
                  </span>
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

        {/* Create POI Button (players limited to rumored locations) */}
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
              if (!isGM) {
                setPoiCategory('location')
                setPoiVisibility('rumored')
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
      </div>


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
        {/* Overlay: Visibility Legend (top-left, offset by sidebar) */}
        <div
          style={{
            position: 'absolute',
            top: '4.75rem',
            left: '8px',
            background: theme.colors.background.secondary,
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: theme.borderRadius,
            padding: '0.6rem 0.75rem',
            zIndex: 5,
            minWidth: '170px'
          }}
        >
          <label style={{ fontSize: '0.75rem', color: theme.colors.text.secondary, marginBottom: '6px', display: 'block' }}>
            Visibility Legend
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem' }}>👁️</span>
              <span style={{ color: theme.colors.text.primary }}>Public</span>
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem' }}>❓</span>
              <span style={{ color: theme.colors.text.primary }}>Rumored</span>
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem' }}>🔒</span>
              <span style={{ color: theme.colors.text.primary }}>GM Only</span>
            </div>
          </div>
        </div>

        {/* Overlay: Quick Tips (bottom-left, offset by sidebar) */}
        <div
          style={{
            position: 'absolute',
            bottom: '0.75rem',
            left: '8px',
            background: theme.colors.background.secondary,
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: theme.borderRadius,
            padding: '0.6rem 0.75rem',
            zIndex: 5,
            minWidth: '220px'
          }}
        >
          <label style={{ fontSize: '0.75rem', color: theme.colors.text.secondary, marginBottom: '6px', display: 'block' }}>
            💡 Quick Tips
          </label>
          <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.8rem', color: theme.colors.text.primary }}>
            <li>Right-click on map to create</li>
            <li>Ctrl+drag to move POIs {isGM ? '' : '(GM only)'}</li>
            <li>Click name to view details</li>
          </ul>
        </div>
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
                  // Don't stop propagation - let the container handle mousemove/mouseup
                  setMovingPoiId(poi.id)
                  setMovingOffset({ x: poi.x, y: poi.y })
                  setIsDragging(true)
                  setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
                } else {
                  e.stopPropagation()
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
                  fontSize: '0.6rem',
                  filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.8))`,
                  transition: 'transform 0.2s',
                  transform: isHovered || isSelected ? 'scale(1.3)' : 'scale(1)',
                  border: poi.visibility === 'gm_only' && isGM ? '4px solid #dc2626' : 'none',
                  borderRadius: '50%',
                  position: 'relative'
                }}
              >
                {getPOIIcon(poi.category || 'location', poi.color)}
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
              {isHovered && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginTop: '0.25rem',
                    padding: '0.75rem',
                    background: theme.colors.background.secondary,
                    border: `2px solid ${theme.colors.primary}`,
                    borderRadius: theme.borderRadius,
                    color: theme.colors.text.primary,
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    zIndex: 50
                  }}
                >
                  <span>{poi.title}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Sidebar Toggle */}
      <button
        type="button"
        onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
        style={{
          position: 'absolute',
          left: leftSidebarOpen ? '280px' : '0px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 200,
          width: '12px',
          height: '72px',
          padding: 0,
          background: theme.colors.background.secondary,
          border: `1px solid ${theme.colors.border.primary}`,
          borderRadius: theme.borderRadius,
          color: theme.colors.text.primary,
          cursor: 'pointer',
          fontSize: '0.85rem',
          boxShadow: theme.shadow,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        aria-label={leftSidebarOpen ? 'Retract left panel' : 'Expand left panel'}
      >
        <span
          style={{
            display: 'flex',
            gap: '2px',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <span style={{ width: '2px', height: '12px', background: theme.colors.text.primary, borderRadius: '2px' }} />
          <span style={{ width: '1.5px', height: '12px', background: theme.colors.text.primary, borderRadius: '2px' }} />
          <span style={{ width: '1.5px', height: '12px', background: theme.colors.text.primary, borderRadius: '2px' }} />
          <span style={{ width: '1.5px', height: '12px', background: theme.colors.text.primary, borderRadius: '2px' }} />
        </span>
      </button>

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

        {/* Help Button */}
        <button
          onClick={() => setShowHelpModal(!showHelpModal)}
          style={{
            padding: '0.5rem 0.75rem',
            background: showHelpModal ? theme.colors.primary : theme.colors.background.secondary,
            color: showHelpModal ? 'white' : theme.colors.text.primary,
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: theme.borderRadius,
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 'bold'
          }}
          title="Keyboard shortcuts and interactions"
        >
          ❓ Help
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
          maxHeight: '100%',
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
                  {getPOIIcon(selectedPoi.category || 'location', selectedPoi.color)} {selectedPoi.title}
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
                    <div className="markdown-content" style={{ fontSize: '0.875rem', color: theme.colors.text.primary, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                      {selectedWikiPage.content}
                    </div>
                    <style>{`
                      .markdown-content h1, .markdown-content h2, .markdown-content h3, .markdown-content h4, .markdown-content h5, .markdown-content h6 {
                        color: ${theme.colors.primary};
                        margin: 1rem 0 0.5rem 0;
                        font-weight: bold;
                      }
                      .markdown-content h1 { font-size: 1.5rem; }
                      .markdown-content h2 { font-size: 1.3rem; }
                      .markdown-content h3 { font-size: 1.1rem; }
                      .markdown-content strong { font-weight: bold; color: ${theme.colors.primary}; }
                      .markdown-content em { font-style: italic; }
                      .markdown-content code { 
                        background: ${theme.colors.background.main}; 
                        padding: 0.2rem 0.4rem; 
                        border-radius: 3px; 
                        font-family: monospace; 
                        font-size: 0.85em; 
                      }
                      .markdown-content pre { 
                        background: ${theme.colors.background.main}; 
                        padding: 0.75rem; 
                        border-radius: 4px; 
                        overflow-x: auto; 
                      }
                      .markdown-content ul, .markdown-content ol { 
                        margin: 0.5rem 0; 
                        padding-left: 1.5rem; 
                      }
                      .markdown-content li { margin: 0.25rem 0; }
                      .markdown-content blockquote { 
                        border-left: 4px solid ${theme.colors.primary}; 
                        padding-left: 0.75rem; 
                        margin: 0.5rem 0; 
                        color: ${theme.colors.text.secondary}; 
                        font-style: italic; 
                      }
                      .markdown-content hr { 
                        border: none; 
                        border-top: 1px solid ${theme.colors.border.primary}; 
                        margin: 1rem 0; 
                      }
                    `}</style>
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
                disabled={!isGM}
              >
                <option value="location">📍 Location</option>
                {isGM && <option value="npc">👤 NPC</option>}
                {isGM && <option value="faction">🛡️ Faction</option>}
                {isGM && <option value="item">⚔️ Item</option>}
              </select>
              {!isGM && (
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: theme.colors.text.secondary }}>
                  Players can add locations only.
                </p>
              )}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={styles.label}>Visibility</label>
              <select
                value={poiVisibility}
                onChange={e => setPoiVisibility(e.target.value)}
                style={styles.select}
                disabled={!isGM}
              >
                <option value="public">👁️ Public (All players can see)</option>
                <option value="rumored">❓ Rumored (Players know vaguely)</option>
                {isGM && <option value="gm_only">🔒 GM Only (Hidden from players)</option>}
              </select>
              {!isGM && (
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: theme.colors.text.secondary }}>
                  Players add rumored locations only.
                </p>
              )}
            </div>

            {(isGM && (poiCategory === 'location' || poiCategory === 'npc' || poiCategory === 'faction' || poiCategory === 'item')) && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={styles.label}>Pin Color</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={poiColor}
                    onChange={e => setPoiColor(e.target.value)}
                    style={{ width: '80px', height: '40px', cursor: 'pointer', border: 'none', borderRadius: theme.borderRadius }}
                  />
                  <span style={{ fontSize: '0.875rem', color: theme.colors.text.secondary }}>{poiColor}</span>
                </div>
              </div>
            )}

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
                  setPoiColor('#ef4444')
                }} 
                style={{ ...styles.button.secondary, flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 99,
              background: 'rgba(0,0,0,0.5)'
            }}
            onClick={() => setShowHelpModal(false)}
          />
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: theme.colors.background.secondary,
              border: `2px solid ${theme.colors.primary}`,
              borderRadius: theme.borderRadius,
              padding: '2rem',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              zIndex: 100
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ ...styles.heading1, margin: 0 }}>🗺️ Map Controls</h2>
              <button
                onClick={() => setShowHelpModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: theme.colors.text.secondary,
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  padding: 0
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Navigation */}
              <div>
                <h3 style={{ ...styles.heading2, margin: '0 0 0.75rem 0', color: theme.colors.primary }}>Navigation</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <span style={{ fontWeight: 'bold', minWidth: '100px', color: theme.colors.text.secondary }}>🖱️ Drag</span>
                    <span style={{ color: theme.colors.text.primary }}>Pan the map by clicking and dragging</span>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <span style={{ fontWeight: 'bold', minWidth: '100px', color: theme.colors.text.secondary }}>🔄 Scroll</span>
                    <span style={{ color: theme.colors.text.primary }}>Zoom in and out using your mouse wheel</span>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <span style={{ fontWeight: 'bold', minWidth: '100px', color: theme.colors.text.secondary }}>📍 Touch</span>
                    <span style={{ color: theme.colors.text.primary }}>Pinch to zoom on touch devices</span>
                  </div>
                </div>
              </div>

              {/* Creating POIs */}
              <div>
                <h3 style={{ ...styles.heading2, margin: '0 0 0.75rem 0', color: theme.colors.primary }}>Creating Locations</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <span style={{ fontWeight: 'bold', minWidth: '100px', color: theme.colors.text.secondary }}>Right-Click</span>
                    <span style={{ color: theme.colors.text.primary }}>Right-click anywhere on the map to create a new location</span>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <span style={{ fontWeight: 'bold', minWidth: '100px', color: theme.colors.text.secondary }}>+ Button</span>
                    <span style={{ color: theme.colors.text.primary }}>Use the create button in the left sidebar (for other categories)</span>
                  </div>
                </div>
              </div>

              {/* Editing */}
              {isGM && (
                <div>
                  <h3 style={{ ...styles.heading2, margin: '0 0 0.75rem 0', color: theme.colors.primary }}>Editing Locations (GM Only)</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <span style={{ fontWeight: 'bold', minWidth: '100px', color: theme.colors.text.secondary }}>Ctrl + Drag</span>
                      <span style={{ color: theme.colors.text.primary }}>Drag a location while holding Ctrl to move it</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <span style={{ fontWeight: 'bold', minWidth: '100px', color: theme.colors.text.secondary }}>Click</span>
                      <span style={{ color: theme.colors.text.primary }}>Click a location to select it and view/edit details</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Visibility */}
              <div>
                <h3 style={{ ...styles.heading2, margin: '0 0 0.75rem 0', color: theme.colors.primary }}>Visibility Levels</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.2rem' }}>👁️</span>
                    <span style={{ color: theme.colors.text.primary }}><strong>Public:</strong> All players can see this location</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.2rem' }}>❓</span>
                    <span style={{ color: theme.colors.text.primary }}><strong>Rumored:</strong> Players know about it vaguely</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.2rem' }}>🔒</span>
                    <span style={{ color: theme.colors.text.primary }}><strong>GM Only:</strong> Hidden from players (GM view only)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  )
}
