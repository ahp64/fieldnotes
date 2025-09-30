'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import MapGlobe from '@/components/MapGlobe'
import { useAuth } from '@/contexts/AuthContext'
import { FloatingPanel } from '@/components/FloatingPanel'
import { VisitCounter } from '@/components/VisitCounter'
import { BrandingLogo } from '@/components/BrandingLogo'
import { AddVisitButton } from '@/components/AddVisitButton'
import { VisitsSidebar } from '@/components/VisitsSidebar'
import { MockVisitsButton } from '@/components/MockVisitsButton'
import { RemoveVisitButton } from '@/components/RemoveVisitButton'
import { Navigation } from '@/components/Navigation'

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
  tagline?: string
  date: string
  notes: string
  tags: string[]
  photos?: string[]
  createdAt: string
}

export default function Home() {
  const [visits, setVisits] = useState<Visit[]>([])
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null)
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      loadVisitsFromSupabase()
    }
  }, [user])

  useEffect(() => {
    const handleStorageChange = () => {
      if (user) {
        loadVisitsFromSupabase()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('focus', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleStorageChange)
    }
  }, [user])

  const loadVisitsFromSupabase = async () => {
    try {
      const response = await fetch('/api/visits')
      if (!response.ok) throw new Error('Failed to load visits')

      const { visits: data } = await response.json()

      if (data) {
        const formattedVisits = data.map((v: any) => ({
          id: v.id,
          placeName: v.places.name,
          placeData: {
            id: v.places.id,
            name: v.places.name,
            latitude: v.places.lat,
            longitude: v.places.lon,
            type: 'place',
            importance: 1,
          },
          date: v.visited_on,
          notes: v.note || '',
          tags: [],
          photos: v.photos || [],
          createdAt: v.visited_on,
        }))
        setVisits(formattedVisits)
      }
    } catch (error) {
      console.error('Error loading visits:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1021]">
        <div className="text-[#7dd3fc] text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <>
      {!selectedVisit && <Navigation />}

      {/* Globe Container - Extended width with proper math */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: '-400px', // Extend 400px to the left
          right: '-400px', // Extend 400px to the right
          bottom: 0,
          width: 'calc(100vw + 800px)', // Make container 800px wider (400px each side)
          height: '100vh',
          transform: selectedVisit ? 'translateX(-200px)' : 'translateX(0px)',
          transition: 'transform 0.3s ease-out',
          zIndex: 1
        }}
      >
        <MapGlobe
          visits={visits}
          selectedVisit={selectedVisit}
          onVisitSelect={setSelectedVisit}
        />
      </div>

      {/* UI Overlays */}
      <FloatingPanel position="bottom-left">
        <VisitCounter count={visits.length} />
      </FloatingPanel>

      <FloatingPanel position="top-left">
        <BrandingLogo />
      </FloatingPanel>

      <FloatingPanel position="top-right">
        <div className="flex flex-col gap-2">
          <MockVisitsButton />
          <RemoveVisitButton />
        </div>
      </FloatingPanel>

      <FloatingPanel position="bottom-right">
        <AddVisitButton />
      </FloatingPanel>

      {/* Sliding Sidebar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: selectedVisit ? '0px' : '-400px',
          width: '400px',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.15)',
          backdropFilter: 'blur(2px)',
          boxShadow: selectedVisit ? '-20px 0 60px rgba(0, 0, 0, 0.5)' : 'none',
          transition: 'right 0.3s ease-out, box-shadow 0.3s ease-out',
          zIndex: 10,
          overflow: 'hidden'
        }}
      >
        {/* Gradient blur overlay across full width */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(to right, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.05) 30%, transparent 70%)',
            backdropFilter: 'blur(20px)',
            mask: 'linear-gradient(to right, black 0%, black 40%, transparent 100%)',
            WebkitMask: 'linear-gradient(to right, black 0%, black 40%, transparent 100%)',
            pointerEvents: 'none',
            zIndex: -1
          }}
        />

        {selectedVisit && (
          <VisitsSidebar
            visit={selectedVisit}
            onClose={() => setSelectedVisit(null)}
          />
        )}
      </div>
    </>
  )
}