'use client'

import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

export default function WorkingGlobe() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    console.log('Initializing Working Globe...')
    console.log('MapLibre version:', maplibregl.version)
    console.log('Supported projections:', maplibregl.supported?.())

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'satellite': {
            type: 'raster',
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            ],
            tileSize: 256
          }
        },
        layers: [
          {
            id: 'background',
            type: 'background',
            paint: {
              'background-color': '#000'
            }
          },
          {
            id: 'satellite',
            type: 'raster',
            source: 'satellite'
          }
        ]
      },
      center: [0, 20],
      zoom: 1,
      maxZoom: 18,
      minZoom: 0.5,
      projection: 'globe'
    })

    map.current.on('load', () => {
      console.log('Globe loaded successfully!')
      setIsLoading(false)
      
      // Add fog for 3D globe effect
      if (map.current) {
        map.current.setFog({
          range: [0.5, 10],
          color: '#220040',
          'horizon-blend': 0.1,
          'high-color': '#245bde',
          'space-color': '#000000',
          'star-intensity': 0.8
        })
      }
      
      // Add some sample markers
      const sampleLocations = [
        { name: 'New York', coordinates: [-74.006, 40.7128] },
        { name: 'London', coordinates: [-0.1276, 51.5074] },
        { name: 'Tokyo', coordinates: [139.6917, 35.6895] },
        { name: 'Sydney', coordinates: [151.2093, -33.8688] },
      ]

      sampleLocations.forEach(location => {
        const el = document.createElement('div')
        el.className = 'marker'
        el.style.backgroundColor = '#3b82f6'
        el.style.width = '12px'
        el.style.height = '12px'
        el.style.borderRadius = '50%'
        el.style.border = '2px solid #ffffff'
        el.style.boxShadow = '0 0 10px rgba(59, 130, 246, 0.6)'
        el.style.cursor = 'pointer'

        new maplibregl.Marker(el)
          .setLngLat(location.coordinates as [number, number])
          .addTo(map.current!)

        el.addEventListener('click', () => {
          new maplibregl.Popup({ closeOnClick: true })
            .setLngLat(location.coordinates as [number, number])
            .setHTML(`<div style="color: #1a202c; padding: 8px;"><h3 style="margin: 0; font-weight: bold;">${location.name}</h3></div>`)
            .addTo(map.current!)
        })
      })

      // Globe rotation
      let userInteracting = false
      const spinGlobe = () => {
        if (!userInteracting && map.current) {
          const center = map.current.getCenter()
          center.lng -= 0.2
          map.current.easeTo({ center, duration: 1000, easing: (t) => t })
          requestAnimationFrame(spinGlobe)
        }
      }

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

      // Start spinning
      setTimeout(() => spinGlobe(), 1000)

      // Zoom transitions
      map.current.on('zoom', () => {
        if (!map.current) return
        const zoom = map.current.getZoom()
        
        if (zoom > 4) {
          map.current.setProjection('mercator')
        } else if (zoom <= 3) {
          map.current.setProjection('globe')
        }
      })
    })

    map.current.on('error', (e) => {
      console.error('Map error:', e)
      setIsLoading(false)
    })

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  return (
    <div 
      style={{
        width: '100%',
        height: '100%',
        position: 'relative'
      }}
    >
      <div 
        ref={mapContainer}
        style={{
          width: '100%',
          height: '100%'
        }}
      />
      
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
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            color: '#e2e8f0',
            zIndex: 10
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🌍</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Loading Globe...</div>
          <div style={{ fontSize: '16px', opacity: 0.7 }}>Rendering your travel world</div>
        </div>
      )}

      {!isLoading && (
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
          🌍 Globe View • Zoom in to switch to map
        </div>
      )}
    </div>
  )
}