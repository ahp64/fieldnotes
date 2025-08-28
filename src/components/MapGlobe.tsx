'use client'

import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

export default function MapGlobe() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    console.log('Initializing MapLibre GL...')

    try {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            'osm': {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '© OpenStreetMap contributors'
            }
          },
          layers: [
            {
              id: 'osm-background',
              type: 'background',
              paint: {
                'background-color': '#050814'
              }
            },
            {
              id: 'osm',
              type: 'raster',
              source: 'osm'
            }
          ]
        },
        center: [20, 30],
        zoom: 1.5,
        maxZoom: 18,
        minZoom: 0.5,
      })

      // Wait for map to load before adding markers
      map.current.on('style.load', () => {
        console.log('Map loaded successfully')
      })

      map.current.on('error', (e) => {
        console.error('Map error:', e)
      })

      console.log('Map instance created')
    } catch (error) {
      console.error('Failed to create map:', error)
    }

    // Add some sample markers for demo
    const sampleLocations = [
      { name: 'New York', coordinates: [-74.006, 40.7128] },
      { name: 'London', coordinates: [-0.1276, 51.5074] },
      { name: 'Tokyo', coordinates: [139.6917, 35.6895] },
      { name: 'Sydney', coordinates: [151.2093, -33.8688] },
      { name: 'Cairo', coordinates: [31.2357, 30.0444] },
    ]

    sampleLocations.forEach((location, index) => {
      const el = document.createElement('div')
      el.className = 'marker'
      el.style.backgroundColor = index === 0 ? '#7dd3fc' : '#f5c94a'
      el.style.width = '12px'
      el.style.height = '12px'
      el.style.borderRadius = '50%'
      el.style.border = '2px solid #ffffff'
      el.style.boxShadow = '0 0 10px rgba(125, 211, 252, 0.5)'
      el.style.cursor = 'pointer'

      new maplibregl.Marker(el)
        .setLngLat(location.coordinates as [number, number])
        .addTo(map.current!)

      // Add popup on click
      el.addEventListener('click', () => {
        new maplibregl.Popup({ closeOnClick: true })
          .setLngLat(location.coordinates as [number, number])
          .setHTML(`
            <div style="color: #1a202c; padding: 8px;">
              <h3 style="margin: 0 0 4px 0; font-weight: bold;">${location.name}</h3>
              <p style="margin: 0; font-size: 12px;">Sample visit location</p>
            </div>
          `)
          .addTo(map.current!)
      })
    })

    // Add smooth idle rotation
    let userInteracting = false
    let spinEnabled = true

    function spinGlobe() {
      if (spinEnabled && !userInteracting && map.current) {
        const center = map.current.getCenter()
        center.lng -= 0.2
        map.current.easeTo({ center, duration: 1000, easing: (t) => t })
        requestAnimationFrame(spinGlobe)
      }
    }

    if (map.current) {
      map.current.on('mousedown', () => { userInteracting = true })
      map.current.on('touchstart', () => { userInteracting = true })
      map.current.on('mouseup', () => { 
        userInteracting = false
        setTimeout(() => spinGlobe(), 2000)
      })
      map.current.on('touchend', () => { 
        userInteracting = false
        setTimeout(() => spinGlobe(), 2000)
      })
    }

    // Start spinning
    spinGlobe()

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  return (
    <div 
      ref={mapContainer} 
      className="w-full h-full bg-slate-900"
      style={{ 
        minHeight: '500px',
        position: 'relative'
      }}
    >
      {!map.current && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white">Loading map...</div>
        </div>
      )}
    </div>
  )
}