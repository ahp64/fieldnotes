'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useMapboxGlobe } from '@/hooks/useMapboxGlobe'

interface BackgroundGlobeProps {
  selectedLocation?: { lat: number, lng: number } | null
}

export default function BackgroundGlobe({ selectedLocation }: BackgroundGlobeProps) {
  const marker = useRef<mapboxgl.Marker | null>(null)
  const rotationRef = useRef<number | null>(null)

  const { mapContainer, mapRef, isLoading, error } = useMapboxGlobe({
    interactive: false,
    onLoad: () => {
      console.log('Background globe loaded')
      startRotation()
    }
  })

  const startRotation = () => {
    if (!mapRef.current || rotationRef.current) return

    const rotateCamera = () => {
      if (!mapRef.current || selectedLocation) return

      try {
        const center = mapRef.current.getCenter()
        center.lng += 0.2 // Slow rotation speed
        mapRef.current.easeTo({
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

  useEffect(() => {
    return () => {
      stopRotation()
      if (marker.current) {
        marker.current.remove()
        marker.current = null
      }
    }
  }, [])

  // Handle location changes
  useEffect(() => {
    if (!mapRef.current || isLoading) return

    if (selectedLocation) {
      // Stop rotation when location is selected
      stopRotation()

      // Remove existing marker
      if (marker.current) {
        marker.current.remove()
      }

      // Create yellow marker
      const el = document.createElement('div')
      el.style.cssText = `
        background-color: #f1c40f;
        border: 3px solid #ffffff;
        border-radius: 50%;
        width: 16px;
        height: 16px;
        box-shadow: 0 0 20px rgba(241, 196, 15, 0.8);
      `

      // Add marker
      marker.current = new mapboxgl.Marker(el)
        .setLngLat([selectedLocation.lng, selectedLocation.lat])
        .addTo(mapRef.current)

      // Smoothly fly to location
      mapRef.current.flyTo({
        center: [selectedLocation.lng, selectedLocation.lat],
        zoom: 4,
        duration: 2000,
        essential: true
      })
    } else {
      // Remove marker and return to global view
      if (marker.current) {
        marker.current.remove()
        marker.current = null
      }

      // Return to global view
      mapRef.current.flyTo({
        center: [0, 20],
        zoom: 1.5,
        duration: 2000,
        essential: true
      })

      // Restart rotation after return to global view
      setTimeout(() => startRotation(), 2000)
    }
  }, [selectedLocation, isLoading])

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
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0c1222 0%, #000814 100%)',
            color: '#e2e8f0',
            zIndex: 1
          }}
        >
          <div style={{ fontSize: '32px', opacity: 0.5, animation: 'pulse 2s infinite' }}>🌍</div>
        </div>
      )}

      {/* Error fallback - just show space background */}
      {error && !isLoading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, #0c1222 0%, #000814 100%)',
            opacity: 0.7
          }}
        />
      )}
    </div>
  )
}