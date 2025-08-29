'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import MapGlobe from '@/components/MapGlobe'
import SimpleMap from '@/components/SimpleMap'
import TestContainer from '@/components/TestContainer'
import WorkingGlobe from '@/components/WorkingGlobe'

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

export default function Home() {
  const [visits, setVisits] = useState<Visit[]>([])

  useEffect(() => {
    const storedVisits = localStorage.getItem('fieldnotes-visits')
    if (storedVisits) {
      setVisits(JSON.parse(storedVisits))
    }
  }, [])

  return (
    <>
      {/* Globe Container - Full Screen */}
      <div 
        style={{
          position: 'fixed',
          top: '4rem', // Account for navbar
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: 'calc(100vh - 4rem)',
          zIndex: 1
        }}
      >
        <MapGlobe visits={visits} />
      </div>
      
      {/* Top Status Bar */}
      <div className="absolute top-6 left-6 z-10">
        <div className="bg-background/95 backdrop-blur-sm rounded-xl p-4 border border-border shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Your Travel Globe</h2>
              <p className="text-xs text-muted-foreground">{visits.length} places visited</p>
            </div>
          </div>
        </div>
      </div>

      {/* Legend - hide on smaller screens to avoid overlap */}
      <div className="absolute top-6 right-6 z-10 hidden xl:block">
        <div className="bg-background/90 backdrop-blur-sm rounded-xl p-3 border border-border/50 shadow-lg">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              <span className="text-xs text-foreground">Your visits</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
              <span className="text-xs text-foreground">Sample locations</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-background/95 backdrop-blur-sm rounded-2xl px-6 py-3 border border-border shadow-lg">
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors">
              <span className="text-base">🌍</span>
              Globe View
            </button>
            <div className="w-px h-5 bg-border"></div>
            <Link href="/visits/new" className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors bg-primary/10 hover:bg-primary/20 px-3 py-2 rounded-lg">
              <span className="text-base">📍</span>
              Add Visit
            </Link>
            <div className="w-px h-5 bg-border"></div>
            <button className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors">
              <span className="text-base">🔍</span>
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Visits Sidebar - only show if we have visits and enough screen space */}
      {visits.length > 0 && (
        <div className="absolute right-6 top-24 bottom-24 w-80 z-10 hidden lg:block">
          <div className="bg-background/90 backdrop-blur-sm rounded-xl border border-border/50 shadow-lg h-full flex flex-col">
            <div className="p-4 border-b border-border/50">
              <h3 className="text-base font-semibold text-foreground">Recent Visits</h3>
              <p className="text-sm text-muted-foreground">Your latest adventures</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {visits.slice(-5).reverse().map((visit) => (
                <div key={visit.id} className="bg-card/40 rounded-lg p-3 border border-border/30 hover:bg-card/60 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-foreground text-sm leading-tight">{visit.placeName.split(',')[0]}</h4>
                    <span className="text-xs text-muted-foreground">{visit.date}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-sm ${i < visit.rating ? 'text-yellow-400' : 'text-muted-foreground/30'}`}>
                        ★
                      </span>
                    ))}
                  </div>
                  {visit.notes && (
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{visit.notes}</p>
                  )}
                  {visit.photos && visit.photos.length > 0 && (
                    <div className="flex gap-1 mb-2 overflow-x-auto">
                      {visit.photos.slice(0, 3).map((photo, photoIndex) => (
                        <img
                          key={photoIndex}
                          src={photo}
                          alt={`${visit.placeName} ${photoIndex + 1}`}
                          className="w-10 h-10 object-cover rounded border border-border/50 flex-shrink-0"
                        />
                      ))}
                      {visit.photos.length > 3 && (
                        <div className="w-10 h-10 bg-muted rounded border border-border/50 flex items-center justify-center text-xs text-muted-foreground">
                          +{visit.photos.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                  {visit.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {visit.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="text-xs bg-muted/60 text-muted-foreground px-2 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}