'use client'

import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

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

    // Clear existing markers and add visit markers
    const markers: maplibregl.Marker[] = []

    visits.forEach((visit) => {
      if (visit.placeData) {
        const el = document.createElement('div')
        el.className = 'marker'
        el.style.backgroundColor = '#7dd3fc'
        el.style.width = '14px'
        el.style.height = '14px'
        el.style.borderRadius = '50%'
        el.style.border = '3px solid #ffffff'
        el.style.boxShadow = '0 0 10px rgba(125, 211, 252, 0.6)'
        el.style.cursor = 'pointer'

        const marker = new maplibregl.Marker(el)
          .setLngLat([visit.placeData.longitude, visit.placeData.latitude])
          .addTo(map.current!)

        markers.push(marker)

        // Add popup on click
        el.addEventListener('click', () => {
          new maplibregl.Popup({ closeOnClick: true })
            .setLngLat([visit.placeData!.longitude, visit.placeData!.latitude])
            .setHTML(`
              <div style="color: #1a202c; padding: 12px; max-width: 280px;">
                <h3 style="margin: 0 0 8px 0; font-weight: bold;">${visit.placeName.split(',')[0]}</h3>
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">${visit.date}</p>
                <div style="margin: 4px 0;">
                  ${'★'.repeat(visit.rating)}${'☆'.repeat(5 - visit.rating)}
                </div>
                ${visit.photos && visit.photos.length > 0 ? `
                  <div style="margin: 8px 0; display: flex; gap: 4px; overflow-x: auto;">
                    ${visit.photos.slice(0, 3).map(photo => `
                      <img src="${photo}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; flex-shrink: 0;" alt="Visit photo" />
                    `).join('')}
                    ${visit.photos.length > 3 ? `
                      <div style="width: 50px; height: 50px; background: #f1f5f9; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #64748b;">
                        +${visit.photos.length - 3}
                      </div>
                    ` : ''}
                  </div>
                ` : ''}
                ${visit.notes ? `<p style="margin: 4px 0 0 0; font-size: 12px;">${visit.notes.slice(0, 100)}${visit.notes.length > 100 ? '...' : ''}</p>` : ''}
                ${visit.tags.length > 0 ? `
                  <div style="margin-top: 8px;">
                    ${visit.tags.map(tag => `<span style="background: #e2e8f0; color: #4a5568; font-size: 10px; padding: 2px 6px; border-radius: 12px; margin-right: 4px;">${tag}</span>`).join('')}
                  </div>
                ` : ''}
              </div>
            `)
            .addTo(map.current!)
        })
      }
    })

    // Add some sample markers if no visits exist
    if (visits.length === 0) {
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

        const marker = new maplibregl.Marker(el)
          .setLngLat(location.coordinates as [number, number])
          .addTo(map.current!)

        markers.push(marker)

        // Add popup on click
        el.addEventListener('click', () => {
          new maplibregl.Popup({ closeOnClick: true })
            .setLngLat(location.coordinates as [number, number])
            .setHTML(`
              <div style="color: #1a202c; padding: 8px;">
                <h3 style="margin: 0 0 4px 0; font-weight: bold;">${location.name}</h3>
                <p style="margin: 0; font-size: 12px;">Sample location - Add your first visit!</p>
              </div>
            `)
            .addTo(map.current!)
        })
      })
    }

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
      // Clean up markers
      markers.forEach(marker => marker.remove())
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [visits])

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