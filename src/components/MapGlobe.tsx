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
}

export default function MapGlobe({ visits = [] }: MapGlobeProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    console.log('Initializing Mapbox Globe...')
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
              
              // 2) Dark land with tiny brightness increase
              {
                id: 'land',
                type: 'fill',
                source: 'countries',
                'source-layer': 'country_boundaries',
                filter: ['==', ['get','disputed'], 'false'],
                paint: {
                  'fill-color': ['interpolate', ['linear'], ['zoom'], 0, '#121416', 5, '#141618', 8, '#16181A'],
                  'fill-opacity': 1
                }
              },
              
              // 2a) Subtle green sheen overlay 
              {
                id: 'land-green-sheen',
                type: 'fill',
                source: 'countries',
                'source-layer': 'country_boundaries',
                filter: ['==', ['get','disputed'], 'false'],
                paint: {
                  'fill-color': '#1A4D2A', // More vibrant green
                  'fill-opacity': 0.12 // Dialed back green sheen
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
            
            // Add directional lighting for day/night effect
            if (map.current.setLight) {
              map.current.setLight({
                'color': '#ffffff',
                'intensity': 0.8,
                'position': [1.5, 90, 80] // Position sun to create light/shadow
              })
            }
            
            console.log('Mapbox globe with day/night lighting loaded')
          }
        })

        // Add visit markers
        const addMarkers = () => {
          if (!map.current) return

          const locations = visits.length > 0 ? visits : [
            { placeName: 'New York', placeData: { latitude: 40.7128, longitude: -74.0060 } },
            { placeName: 'London', placeData: { latitude: 51.5074, longitude: -0.1278 } },
            { placeName: 'Tokyo', placeData: { latitude: 35.6762, longitude: 139.6503 } },
            { placeName: 'Sydney', placeData: { latitude: -33.8688, longitude: 151.2093 } }
          ]

          locations.forEach((location) => {
            if (location.placeData && map.current) {
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
              
              // Add marker to map
              new mapboxgl.Marker(el)
                .setLngLat([location.placeData.longitude, location.placeData.latitude])
                .addTo(map.current)
            }
          })
        }

        // Wait for map to load before adding markers
        map.current.on('load', () => {
          setIsLoading(false)
          addMarkers()
          console.log('Mapbox globe fully loaded')
        })

        console.log('Mapbox globe initialized')

      } catch (error) {
        console.error('Failed to initialize Mapbox:', error)
        setError('Failed to load map: ' + (error as Error).message)
        setIsLoading(false)
      }
    }

    initializeMap()

    return () => {
      // Cleanup Mapbox instance
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [visits])

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
            bottom: '20px',
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