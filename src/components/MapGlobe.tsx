'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

interface Visit {
  id: string
  placeName: string
  placeData?: {
    id: number
    name: string
    latitude: number
    longitude: number
    type: string
    importance: number
  }
  date: string
  notes: string
  tags: string[]
  photos?: string[]
  createdAt: string
}

interface MapGlobeProps {
  visits?: Visit[]
  selectedVisit?: Visit | null
  onVisitSelect?: (visit: Visit | null) => void
  autoRotate?: boolean
  autoZoom?: boolean
  focusLocation?: { lat: number, lng: number, name: string } | null
}

export default function MapGlobe({ visits = [], selectedVisit, onVisitSelect, autoRotate = false, autoZoom = false, focusLocation = null }: MapGlobeProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const rotationRef = useRef<number | null>(null)
  const focusMarker = useRef<mapboxgl.Marker | null>(null)
  const focusLocationRef = useRef(focusLocation)
  const rotationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [selectedLabelIds, setSelectedLabelIds] = useState<Set<string>>(new Set())
  const markersRef = useRef<Map<string, { marker: mapboxgl.Marker, labelMarker?: mapboxgl.Marker }>>(new Map())

  // Keep focusLocationRef in sync with focusLocation prop
  useEffect(() => {
    focusLocationRef.current = focusLocation
  }, [focusLocation])

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    console.log('MapGlobe: Initializing map')
    setIsLoading(true)
    setError(null)

    const initializeMap = async () => {
      try {
        // Set access token from environment variable
        const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
        if (!mapboxToken) {
          throw new Error('NEXT_PUBLIC_MAPBOX_TOKEN is required')
        }
        mapboxgl.accessToken = mapboxToken

        // Create Mapbox map with minimal 80-Days style from MAPBOX.md
        map.current = new mapboxgl.Map({
          container: mapContainer.current!,
          projection: { name: 'globe' },
          style: {
            version: 8,
            glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
            sources: {
              streets: {
                type: 'vector',
                url: 'mapbox://mapbox.mapbox-streets-v8'
              },
              countries: {
                type: 'vector',
                url: 'mapbox://mapbox.country-boundaries-v1'
              }
            },
            layers: [
              // 1) Background as dark blue ocean
              {
                id: 'bg',
                type: 'background',
                paint: { 'background-color': '#0D1B2A' } // Dark blue water
              },

              // 2) Dark black land base
              {
                id: 'land',
                type: 'fill',
                source: 'countries',
                'source-layer': 'country_boundaries',
                filter: ['==', ['get','disputed'], 'false'],
                paint: {
                  'fill-color': ['interpolate', ['linear'], ['zoom'], 0, '#0A0A0A', 5, '#0C0C0C', 8, '#0E0E0E'],
                  'fill-opacity': 1
                }
              },

              // 2a) Very subtle green sheen overlay with shine
              {
                id: 'land-green-sheen',
                type: 'fill',
                source: 'countries',
                'source-layer': 'country_boundaries',
                filter: ['==', ['get','disputed'], 'false'],
                paint: {
                  'fill-color': '#1A2A1A', // Slightly brighter subtle green for shine
                  'fill-opacity': 0.15 // Increased opacity for more sheen
                }
              },

              // 2b) Pearlescent highlight layer - more noticeable
              {
                id: 'land-pearlescent',
                type: 'fill',
                source: 'countries',
                'source-layer': 'country_boundaries',
                filter: ['==', ['get','disputed'], 'false'],
                paint: {
                  'fill-color': [
                    'interpolate',
                    ['linear'],
                    ['get', 'scalerank'], // Use a property that varies across features
                    0, '#5A7A5A', // Much brighter green highlight
                    3, '#4A6A4A', // Medium bright green
                    6, '#3A5A3A', // Medium green
                    10, '#2A4A2A' // Still visible darker green
                  ],
                  'fill-opacity': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    0, 0.25, // Much more visible at low zoom
                    3, 0.35, // Peak visibility at medium zoom
                    6, 0.30, // Still strong
                    10, 0.20 // Visible at high zoom
                  ]
                }
              },

              // 3) Water above land - dark blue like background
              {
                id: 'water',
                type: 'fill',
                source: 'streets',
                'source-layer': 'water',
                filter: ['>=', ['get', 'area'], 1000000],
                paint: {
                  'fill-color': '#0D1B2A', // Dark blue water
                  'fill-opacity': 0.92,
                  'fill-antialias': false
                }
              },

              // 4) Translucent grey international borders
              {
                id: 'borders-intl',
                type: 'line',
                source: 'streets',
                'source-layer': 'admin',
                filter: ['all',
                  ['==', ['get','admin_level'], 0],
                  ['==', ['get','maritime'], false],
                  ['match', ['get','worldview'], ['US','all','IN','JP','CN'], true, false]
                ],
                paint: {
                  'line-color': '#808080',
                  'line-width': ['interpolate', ['linear'], ['zoom'], 0, 0.4, 6, 1.0],
                  'line-opacity': 0.6,
                  'line-blur': 0.2
                }
              },

              // 5) Additional grey border glow
              {
                id: 'borders-glow',
                type: 'line',
                source: 'streets',
                'source-layer': 'admin',
                filter: ['all',
                  ['==', ['get','admin_level'], 0],
                  ['==', ['get','maritime'], false],
                  ['match', ['get','worldview'], ['US','all','IN','JP','CN'], true, false]
                ],
                paint: {
                  'line-color': '#808080',
                  'line-width': ['interpolate', ['linear'], ['zoom'], 0, 0.8, 6, 2.0],
                  'line-opacity': 0.2,
                  'line-blur': 1.0
                }
              },

              // 6) Political boundaries - translucent grey
              {
                id: 'borders-admin1',
                type: 'line',
                source: 'streets',
                'source-layer': 'admin',
                filter: ['all',
                  ['in', ['get','admin_level'], ['literal', [1, 2]]],
                  ['==', ['get','maritime'], false],
                  ['match', ['get','worldview'], ['US','all'], true, false]
                ],
                paint: {
                  'line-color': '#909090',
                  'line-width': ['interpolate', ['linear'], ['zoom'], 2, 0.05, 4, 0.15, 6, 0.3],
                  'line-opacity': ['interpolate', ['linear'], ['zoom'], 2, 0.3, 4, 0.4, 6, 0.5],
                  'line-blur': 0.3
                }
              },

              // 7) Political boundaries backup - translucent grey
              {
                id: 'borders-country-admin',
                type: 'line',
                source: 'countries',
                'source-layer': 'country_boundaries',
                filter: ['==', ['get','disputed'], 'false'],
                paint: {
                  'line-color': '#909090',
                  'line-width': ['interpolate', ['linear'], ['zoom'], 2, 0.08, 4, 0.2, 6, 0.4],
                  'line-opacity': ['interpolate', ['linear'], ['zoom'], 2, 0.35, 4, 0.45, 6, 0.55],
                  'line-blur': 0.4
                }
              }
            ]
          },
          center: [0, 20],
          zoom: 1.5
        })

        // Add enhanced fog effect and lighting for day/night globe
        map.current.on('style.load', () => {
          if (map.current) {
            // Enhanced fog with atmospheric lighting
            map.current.setFog({
              color: 'rgba(10,61,115,0.6)', // Darker blue matching water
              'horizon-blend': 0.15, // More defined horizon
              'high-color': 'rgba(255,255,255,0.25)', // Brighter highlight for sheen
              'space-color': '#000810', // Deep space background
              'star-intensity': 0.8 // Subtle stars for elegance
            })

            console.log('Mapbox globe loaded')
          }
        })

        // Add visit markers
        const addMarkers = () => {
          if (!map.current) return

          // Clear existing markers
          markersRef.current.forEach(({ marker, labelMarker }) => {
            marker.remove()
            if (labelMarker) labelMarker.remove()
          })
          markersRef.current.clear()

          visits.forEach((visit) => {
            if (visit.placeData && map.current) {
              // Create marker element
              const el = document.createElement('div')
              el.className = 'visit-marker'
              el.style.cssText = `
                background-color: #f1c40f;
                border: 2px solid #ffffff;
                border-radius: 50%;
                width: 12px;
                height: 12px;
                cursor: pointer;
              `

              // Add click handler
              el.addEventListener('click', (e) => {
                e.stopPropagation()
                if (onVisitSelect) {
                  onVisitSelect(visit)
                }
              })

              // Add marker to map and store reference
              const marker = new mapboxgl.Marker(el)
                .setLngLat([visit.placeData.longitude, visit.placeData.latitude])
                .addTo(map.current)

              markersRef.current.set(visit.id, { marker })
            }
          })
        }

        // Disable user interaction if autoRotate is enabled (viewing other user's profile)
        if (autoRotate) {
          map.current.scrollZoom.disable()
          map.current.boxZoom.disable()
          map.current.dragRotate.disable()
          map.current.dragPan.disable()
          map.current.keyboard.disable()
          map.current.doubleClickZoom.disable()
          map.current.touchZoomRotate.disable()
        }

        // Wait for map to load before adding markers
        map.current.on('load', () => {
          setIsLoading(false)
          addMarkers()
        })


      } catch (error) {
        console.error('Failed to initialize Mapbox:', error)
        setError('Failed to load map: ' + (error as Error).message)
        setIsLoading(false)
      }
    }

    initializeMap()

    return () => {
      // Cleanup rotation, markers, and Mapbox instance
      stopRotation()
      if (focusMarker.current) {
        focusMarker.current.remove()
        focusMarker.current = null
      }
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [visits])

  // Handle initial auto-rotation setup
  useEffect(() => {
    if (!map.current || isLoading) return

    // Only start rotation on initial load, not when focusLocation changes
    // (focusLocation effect will handle restarting after zoom out)
    if (autoRotate && !focusLocation) {
      // Small delay to ensure map is fully ready
      const timeout = setTimeout(() => {
        startRotation()
      }, 500)
      return () => clearTimeout(timeout)
    }
  }, [autoRotate, isLoading])

  // Update label visibility based on whether markers are on visible side of globe
  const updateLabelVisibility = () => {
    if (!map.current) return

    markersRef.current.forEach(({ marker, labelMarker }, visitId) => {
      if (!labelMarker) return

      const lngLat = marker.getLngLat()
      const point = map.current!.project(lngLat)

      // Get the camera position to check if point is on visible hemisphere
      const center = map.current!.getCenter()
      const markerLng = lngLat.lng

      // Calculate if marker is on visible side (within ~90 degrees of center)
      let diff = Math.abs(markerLng - center.lng)
      if (diff > 180) diff = 360 - diff

      const isVisible = diff < 90

      // Show/hide label based on visibility
      const labelEl = labelMarker.getElement()
      if (labelEl) {
        labelEl.style.opacity = isVisible ? '1' : '0'
        labelEl.style.transition = 'opacity 0.2s'
      }
    })
  }

  // Update floating labels periodically when rotating
  useEffect(() => {
    if (!map.current || isLoading || !autoRotate || focusLocation) {
      // Remove all label markers
      markersRef.current.forEach(({ labelMarker }) => {
        if (labelMarker) labelMarker.remove()
      })
      setSelectedLabelIds(new Set())
      return
    }

    // Wait for markers to be created and map to be fully loaded
    const startLabelUpdates = () => {
      if (markersRef.current.size === 0) {
        setTimeout(startLabelUpdates, 100)
        return
      }

      // Initial update
      updateFloatingLabels()

      // Update which labels are shown every 3 seconds
      const updateInterval = setInterval(() => {
        updateFloatingLabels()
      }, 3000)

      // Update label visibility every frame to hide labels on back of globe
      let visibilityFrameId: number
      const visibilityLoop = () => {
        updateLabelVisibility()
        visibilityFrameId = requestAnimationFrame(visibilityLoop)
      }
      visibilityFrameId = requestAnimationFrame(visibilityLoop)

      // Store interval for cleanup
      return { updateInterval, visibilityFrameId }
    }

    const intervals = startLabelUpdates()

    return () => {
      if (intervals) {
        clearInterval(intervals.updateInterval)
        cancelAnimationFrame(intervals.visibilityFrameId)
      }
    }
  }, [autoRotate, focusLocation, isLoading])

  const startRotation = () => {
    if (!map.current || rotationRef.current) return

    const rotateCamera = () => {
      if (!map.current || focusLocationRef.current) {
        return
      }

      try {
        const center = map.current.getCenter()
        center.lng += 0.2 // Slow rotation speed
        map.current.easeTo({
          center,
          duration: 100,
          easing: (t) => t
        })

        rotationRef.current = requestAnimationFrame(rotateCamera)
      } catch (error) {
        stopRotation()
      }
    }

    rotationRef.current = requestAnimationFrame(rotateCamera)
  }

  const stopRotation = () => {
    if (rotationRef.current) {
      cancelAnimationFrame(rotationRef.current)
      rotationRef.current = null
    }
  }

  // Create label marker element
  const createLabelElement = (visit: Visit, index: number, onReadMore: () => void) => {
    const placeName = visit.placeData!.name.split(',')[0]
    // Use first sentence or first 60 chars of notes as tagline
    const fullNotes = visit.notes || 'No notes'
    const firstSentence = fullNotes.split(/[.!?]/)[0]
    const tagline = firstSentence.length > 60 ? firstSentence.substring(0, 60) : firstSentence
    const date = new Date(visit.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

    const container = document.createElement('div')
    container.className = 'label-marker'
    container.style.cssText = `
      pointer-events: auto;
      cursor: pointer;
    `

    // Position above if northern hemisphere, below if southern hemisphere
    const latitude = visit.placeData!.latitude
    const isAbove = latitude >= 0 // Northern hemisphere = above
    const offsetY = isAbove ? -120 : 60 // Moved further away from dot

    container.innerHTML = `
      <div style="position: relative;">
        <!-- Connector line from dot to label -->
        <svg width="2" height="${Math.abs(offsetY)}" style="
          position: absolute;
          left: -1px;
          top: ${isAbove ? offsetY + 'px' : '0px'};
          overflow: visible;
        ">
          <line
            x1="1"
            y1="${isAbove ? Math.abs(offsetY) - 20 : 0}"
            x2="1"
            y2="${isAbove ? Math.abs(offsetY) : 20}"
            stroke="rgba(255, 255, 255, 0.3)"
            stroke-width="1"
            stroke-dasharray="2,2"
          />
        </svg>

        <!-- Label content -->
        <div class="label-content" style="
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.15) 100%);
          backdrop-filter: blur(12px);
          padding: 10px 14px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          min-width: 180px;
          max-width: 220px;
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          top: ${offsetY}px;
          transition: all 0.2s ease;
        ">
          <div style="
            color: #f1c40f;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 4px;
            font-family: var(--font-montserrat), sans-serif;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          ">${placeName}</div>
          <div style="
            color: rgba(255, 255, 255, 0.75);
            font-size: 11px;
            margin-bottom: 6px;
            font-style: italic;
            line-height: 1.3;
          ">"${tagline}"</div>
          <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;
          ">
            <div style="
              color: rgba(255, 255, 255, 0.5);
              font-size: 10px;
              font-family: var(--font-montserrat), sans-serif;
            ">${date}</div>
            <div style="
              color: #f1c40f;
              font-size: 11px;
              font-weight: 600;
              display: flex;
              align-items: center;
              gap: 4px;
            ">
              Read More
              <span style="font-size: 14px;">»</span>
            </div>
          </div>
        </div>
      </div>
    `

    // Add click handler
    const labelContent = container.querySelector('.label-content') as HTMLElement
    if (labelContent) {
      labelContent.addEventListener('click', (e) => {
        e.stopPropagation()
        onReadMore()
      })

      // Add hover effect
      labelContent.addEventListener('mouseenter', () => {
        labelContent.style.background = 'linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.25) 100%)'
        labelContent.style.borderColor = 'rgba(255, 255, 255, 0.15)'
      })
      labelContent.addEventListener('mouseleave', () => {
        labelContent.style.background = 'linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.15) 100%)'
        labelContent.style.borderColor = 'rgba(255, 255, 255, 0.08)'
      })
    }

    return container
  }

  // Update floating labels based on visible markers
  const updateFloatingLabels = () => {
    if (!map.current || visits.length === 0 || !autoRotate || !onVisitSelect) {
      return
    }

    const bounds = map.current.getBounds()
    if (!bounds) {
      return
    }

    const visibleVisits = visits.filter(visit => {
      if (!visit.placeData) return false
      const { latitude, longitude } = visit.placeData
      return bounds.contains([longitude, latitude])
    })

    if (visibleVisits.length === 0) {
      // Remove all labels
      markersRef.current.forEach(({ labelMarker }) => {
        if (labelMarker) labelMarker.remove()
      })
      setSelectedLabelIds(new Set())
      return
    }

    // Shuffle visible visits with time-based seed for variation
    const seed = Math.floor(Date.now() / 3000)
    const shuffled = [...visibleVisits].sort((a, b) => {
      const hashA = (a.id.charCodeAt(0) * seed) % 1000
      const hashB = (b.id.charCodeAt(0) * seed) % 1000
      return hashA - hashB
    })

    // Always select exactly 2 labels (or fewer if not enough visible)
    const labelCount = Math.min(2, visibleVisits.length)
    const selectedVisits = shuffled.slice(0, labelCount)
    const newSelectedIds = new Set(selectedVisits.map(v => v.id))

    // Remove labels that are no longer selected
    markersRef.current.forEach(({ labelMarker }, visitId) => {
      if (labelMarker && !newSelectedIds.has(visitId)) {
        labelMarker.remove()
        const entry = markersRef.current.get(visitId)
        if (entry) {
          entry.labelMarker = undefined
        }
      }
    })

    // Add new labels
    selectedVisits.forEach((visit, index) => {
      const entry = markersRef.current.get(visit.id)
      if (!entry || !visit.placeData) {
        return
      }

      // Remove old label if exists
      if (entry.labelMarker) {
        entry.labelMarker.remove()
      }

      // Create new label marker with click handler
      const labelEl = createLabelElement(visit, index, () => {
        onVisitSelect(visit)
      })
      const labelMarker = new mapboxgl.Marker(labelEl, { anchor: 'center' })
        .setLngLat([visit.placeData.longitude, visit.placeData.latitude])
        .addTo(map.current!)

      entry.labelMarker = labelMarker
    })

    setSelectedLabelIds(newSelectedIds)
  }

  // Handle focus location changes (for seamless zoom without reload)
  useEffect(() => {
    if (!map.current || !autoZoom || isLoading) return

    if (focusLocation) {
      // Stop rotation immediately
      stopRotation()

      // Clear any pending rotation restart
      if (rotationTimeoutRef.current) {
        clearTimeout(rotationTimeoutRef.current)
        rotationTimeoutRef.current = null
      }

      // Remove existing focus marker
      if (focusMarker.current) {
        focusMarker.current.remove()
      }

      // Create yellow marker for focus location
      const el = document.createElement('div')
      el.style.cssText = `
        background-color: #f1c40f;
        border: 3px solid #ffffff;
        border-radius: 50%;
        width: 16px;
        height: 16px;
        box-shadow: 0 0 20px rgba(241, 196, 15, 0.8);
      `

      // Add focus marker
      focusMarker.current = new mapboxgl.Marker(el)
        .setLngLat([focusLocation.lng, focusLocation.lat])
        .addTo(map.current)

      // Seamlessly zoom to the location
      map.current.flyTo({
        center: [focusLocation.lng, focusLocation.lat],
        zoom: 4,
        pitch: 0,
        bearing: 0,
        duration: 2000,
        essential: true
      })
    } else {
      // Zooming out - remove focus marker first
      if (focusMarker.current) {
        focusMarker.current.remove()
        focusMarker.current = null
      }

      // Return to global view
      map.current.flyTo({
        center: [0, 20],
        zoom: 1.2,
        pitch: 0,
        bearing: 0,
        duration: 2000,
        essential: true
      })

      // Restart rotation after zoom out completes (only if autoRotate is enabled)
      if (autoRotate) {
        // Clear any existing timeout first
        if (rotationTimeoutRef.current) {
          clearTimeout(rotationTimeoutRef.current)
        }

        // Stop any current rotation
        stopRotation()

        // Set new timeout to restart rotation after flyTo completes
        rotationTimeoutRef.current = setTimeout(() => {
          console.log('Restarting rotation after zoom out')
          startRotation()
          rotationTimeoutRef.current = null
        }, 2100) // Wait slightly longer than flyTo duration
      }
    }

    // Cleanup function
    return () => {
      if (rotationTimeoutRef.current) {
        clearTimeout(rotationTimeoutRef.current)
        rotationTimeoutRef.current = null
      }
    }
  }, [focusLocation, autoZoom, autoRotate, isLoading])

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div
        ref={mapContainer}
        style={{
          width: '100%',
          height: '100%'
        }}
      />

      {/* Loading State */}
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0c1222 0%, #000814 100%)',
            color: '#e2e8f0',
            zIndex: 10
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '20px', animation: 'pulse 2s infinite' }}>🗺️</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Loading Map...</div>
          <div style={{ fontSize: '16px', opacity: 0.7 }}>Powered by Mapbox</div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            color: '#e2e8f0',
            zIndex: 10
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Map Error</div>
          <div style={{ fontSize: '16px', opacity: 0.7, textAlign: 'center', maxWidth: '400px' }}>
            {error}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Refresh Page
          </button>
        </div>
      )}

    </div>
  )
}