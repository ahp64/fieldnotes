'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, MapPin } from 'lucide-react'
import MapGlobe from '@/components/MapGlobe'
import { useAuth } from '@/contexts/AuthContext'

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
  const { user } = useAuth()

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
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 1
        }}
      >
        <MapGlobe visits={visits} />
      </div>

      {/* Top right auth buttons */}
      <div className="absolute top-6 right-6 z-10">
        {user ? (
          <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-lg px-4 py-2">
            <div className="text-sm text-white font-medium">Welcome back</div>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <Link 
              href="/about" 
              className="text-sm text-white/90 hover:text-white transition-colors bg-black/30 backdrop-blur-md border border-white/20 hover:border-white/30 px-4 py-2 rounded-lg hover:bg-black/40"
            >
              About
            </Link>
            <Link 
              href="/auth/sign-in" 
              className="text-sm text-white font-medium bg-sky-500/80 hover:bg-sky-500 backdrop-blur-md border border-sky-400/50 hover:border-sky-300 px-5 py-2 rounded-lg transition-all shadow-lg"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
      
      {/* Top Status - styled */}
      <div className="absolute top-6 left-6 z-10">
        <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl px-6 py-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-sky-400 animate-pulse shadow-lg shadow-sky-400/50"></div>
            <div>
              <h2 className="text-lg font-bold text-white mb-0.5">Your Travel Globe</h2>
              <p className="text-sm text-white/80 font-medium">{visits.length} places visited</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom left branding */}
      <div className="absolute bottom-6 left-6 z-10">
        <div className="bg-black/30 backdrop-blur-md border border-white/15 rounded-lg px-4 py-2">
          <div className="text-white/80 text-sm font-bold tracking-wide">
            fieldnotes
          </div>
        </div>
      </div>

      {/* Floating Add Button - bottom right */}
      <div className="absolute bottom-6 right-6 z-10">
        <Link 
          href="/visits/new"
          className="w-16 h-16 bg-gradient-to-br from-sky-400 to-sky-600 hover:from-sky-500 hover:to-sky-700 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center group border-2 border-white/20 hover:border-white/30"
        >
          <div className="relative">
            <MapPin className="w-6 h-6 text-white drop-shadow-lg" />
            <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full border-2 border-white flex items-center justify-center">
              <Plus className="w-3 h-3 text-white font-bold" />
            </div>
          </div>
        </Link>
      </div>

      {/* Visits Sidebar - only show if we have visits and enough screen space */}
      {visits.length > 0 && (
        <div className="absolute right-6 top-32 bottom-24 w-80 z-10 hidden lg:block">
          <div className="bg-black/40 backdrop-blur-md rounded-xl border border-white/20 shadow-xl h-full flex flex-col">
            <div className="p-5 border-b border-white/20">
              <h3 className="text-lg font-bold text-white mb-1">Recent Visits</h3>
              <p className="text-sm text-white/80">Your latest adventures</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {visits.slice(-5).reverse().map((visit) => (
                <div key={visit.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-200 shadow-lg">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-bold text-white text-sm leading-tight">{visit.placeName.split(',')[0]}</h4>
                    <span className="text-xs text-white/70 font-medium bg-white/10 px-2 py-1 rounded">{visit.date}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-sm ${i < visit.rating ? 'text-yellow-400 drop-shadow-sm' : 'text-white/30'}`}>
                        ★
                      </span>
                    ))}
                  </div>
                  {visit.notes && (
                    <p className="text-xs text-white/80 mb-3 line-clamp-2 bg-white/5 p-2 rounded border border-white/10">{visit.notes}</p>
                  )}
                  {visit.photos && visit.photos.length > 0 && (
                    <div className="flex gap-2 mb-3 overflow-x-auto">
                      {visit.photos.slice(0, 3).map((photo, photoIndex) => (
                        <img
                          key={photoIndex}
                          src={photo}
                          alt={`${visit.placeName} ${photoIndex + 1}`}
                          className="w-12 h-12 object-cover rounded-lg border-2 border-white/30 flex-shrink-0 shadow-md"
                        />
                      ))}
                      {visit.photos.length > 3 && (
                        <div className="w-12 h-12 bg-white/20 rounded-lg border-2 border-white/30 flex items-center justify-center text-xs text-white font-bold shadow-md">
                          +{visit.photos.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                  {visit.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {visit.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="text-xs bg-sky-500/30 text-white font-medium px-3 py-1 rounded-full border border-sky-400/30">
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