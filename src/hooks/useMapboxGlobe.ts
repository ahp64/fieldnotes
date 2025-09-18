'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'

interface UseMapboxGlobeOptions {
  interactive?: boolean
  onLoad?: () => void
}

export function useMapboxGlobe(options: UseMapboxGlobeOptions = {}) {
  const { interactive = true, onLoad } = options
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

        // Create Mapbox map with shared style
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
          zoom: 1.5,
          // Conditionally disable interactions
          interactive,
          scrollZoom: interactive,
          boxZoom: interactive,
          dragRotate: interactive,
          dragPan: interactive,
          keyboard: interactive,
          doubleClickZoom: interactive,
          touchZoomRotate: interactive
        })

        // Add enhanced fog effect and lighting for day/night globe with stars
        map.current.on('style.load', () => {
          if (map.current) {
            // Enhanced fog with atmospheric lighting and stars
            map.current.setFog({
              color: 'rgba(10,61,115,0.6)', // Darker blue matching water
              'horizon-blend': 0.15, // More defined horizon
              'high-color': 'rgba(255,255,255,0.25)', // Brighter highlight for sheen
              'space-color': '#000810', // Deep space background
              'star-intensity': 0.8 // Starry background
            })
          }
        })

        map.current.on('load', () => {
          setIsLoading(false)
          if (onLoad) onLoad()
        })

      } catch (error) {
        console.error('Failed to initialize Mapbox globe:', error)
        setError('Failed to load globe: ' + (error as Error).message)
        setIsLoading(false)
      }
    }

    initializeMap()

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [interactive, onLoad])

  return {
    mapContainer,
    mapRef: map,
    isLoading,
    error
  }
}