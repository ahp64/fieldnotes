'use client'

import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

export default function SimpleMap() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    console.log('Container dimensions:', mapContainer.current.getBoundingClientRect())

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [0, 0],
      zoom: 2
    })

    map.current.on('load', () => {
      console.log('Simple map loaded')
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
      ref={mapContainer}
      className="w-full h-full bg-red-500"
      style={{
        width: '100%',
        height: '100%',
        minHeight: '400px'
      }}
    />
  )
}