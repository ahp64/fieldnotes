'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import * as SunCalc from 'suncalc'

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
}

export default function MapGlobe({ visits = [], selectedVisit, onVisitSelect }: MapGlobeProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!mapContainer.current || map.current) return

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

        // Add enhanced fog effect and realistic sun lighting
        map.current.on('style.load', () => {
          if (map.current) {
            // Enhanced fog with atmospheric lighting for globe
            map.current.setFog({
              color: 'rgb(186,210,235)', // Atmospheric blue
              'high-color': 'rgb(36,92,223)', // High altitude color
              'horizon-blend': 0.02, // Crisp horizon
              'space-color': 'rgb(11,11,25)', // Deep space
              'star-intensity': 0.6 // Visible stars
            })

            // Helper to convert SunCalc angles to Mapbox light positioning
            const sunToMapboxAngles = (date: Date, lat: number, lng: number) => {
              const { azimuth, altitude } = SunCalc.getPosition(date, lat, lng) // radians
              const azimuthDeg = (azimuth * 180 / Math.PI + 180) % 360 // south→west to north-clockwise
              const elevationDeg = altitude * 180 / Math.PI // 0 horizon; +90 zenith
              const polarDeg = 90 - elevationDeg // 0 zenith; 90 horizon; >90 below
              return { azimuthDeg, polarDeg }
            }

            // Function to update sun lighting based on map center
            const updateSunLighting = () => {
              if (!map.current) return

              try {
                const center = map.current.getCenter()
                const { azimuthDeg, polarDeg } = sunToMapboxAngles(new Date(), center.lat, center.lng)

                // Set realistic sun lighting using Mapbox v2 flat light
                map.current.setLight({
                  anchor: 'map', // Sun stays fixed relative to world
                  color: '#FFE4B5', // Warm sunlight color
                  intensity: 0.8, // Bright but not overwhelming
                  position: [1.5, azimuthDeg, Math.max(0, Math.min(180, polarDeg))]
                })

                console.log(`☀️ Sun updated: azimuth ${azimuthDeg.toFixed(1)}°, polar ${polarDeg.toFixed(1)}°`)
              } catch (error) {
                console.error('❌ Sun lighting update failed:', error)
              }
            }

            // Initial sun setup
            console.log('Setting up realistic sun lighting...')
            updateSunLighting()

            // Update sun when map moves (so sun position matches geography)
            map.current.on('moveend', updateSunLighting)

            // Optional: Update sun position every 5 minutes for real-time sun movement
            const sunUpdateInterval = setInterval(updateSunLighting, 5 * 60 * 1000)

            // Cleanup interval on map removal
            map.current.on('remove', () => {
              clearInterval(sunUpdateInterval)
            })

            console.log('Mapbox globe with realistic sun lighting loaded')
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