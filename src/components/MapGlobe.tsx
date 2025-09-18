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
  rating: number
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
              el.addEventListener('click', () => {
                if (onVisitSelect) {
                  onVisitSelect(visit)
                }
              })

              // Add marker to map
              new mapboxgl.Marker(el)
                .setLngLat([visit.placeData.longitude, visit.placeData.latitude])
                .addTo(map.current)
            }
          })
        }

        // Wait for map to load before adding markers
        map.current.on('load', () => {
          console.log('MapGlobe: Map loaded')
          setIsLoading(false)
          addMarkers()
          console.log('Mapbox globe fully loaded')
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

    console.log('MapGlobe: Auto-rotation effect triggered, autoRotate:', autoRotate, 'focusLocation:', focusLocation)

    if (autoRotate && !focusLocation) {
      console.log('MapGlobe: Starting auto-rotation from effect after delay')
      // Small delay to ensure map is fully ready
      const timeout = setTimeout(() => {
        startRotation()
      }, 500)
      return () => clearTimeout(timeout)
    } else {
      console.log('MapGlobe: Stopping auto-rotation from effect')
      stopRotation()
    }
  }, [autoRotate, focusLocation, isLoading])

  const startRotation = () => {
    console.log('MapGlobe: startRotation called, map exists:', !!map.current, 'already rotating:', !!rotationRef.current)
    if (!map.current || rotationRef.current) return

    console.log('MapGlobe: Starting rotation animation')

    const rotateCamera = () => {
      if (!map.current || focusLocation) {
        console.log('MapGlobe: Stopping rotation - map gone or focus location set')
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
        console.error('Rotation error:', error)
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

  // Handle focus location changes (for seamless zoom without reload)
  useEffect(() => {
    if (!map.current || !autoZoom || isLoading) return

    console.log('MapGlobe: Focus location effect triggered, focusLocation:', focusLocation)

    if (focusLocation) {
      console.log('MapGlobe: Focusing on location:', focusLocation)
      stopRotation()

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
        duration: 2000,
        essential: true
      })
    } else {
      console.log('MapGlobe: Returning to global view')
      // Remove focus marker and return to global view
      if (focusMarker.current) {
        focusMarker.current.remove()
        focusMarker.current = null
      }

      map.current.flyTo({
        center: [0, 20],
        zoom: 1.5,
        duration: 2000,
        essential: true
      })

      if (autoRotate) {
        console.log('MapGlobe: Will restart rotation after return to global view')
        setTimeout(() => startRotation(), 2000)
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

      {/* Map Instructions */}
      {!isLoading && !error && (
        <div
          style={{
            position: 'absolute',
            bottom: '50px',
            left: '20px',
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            zIndex: 10
          }}
        >
🌍 Interactive Globe • Scroll to zoom • Drag to rotate
        </div>
      )}
    </div>
  )
}