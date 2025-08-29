'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import MapGlobe from '@/components/MapGlobe'

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
    <div className="h-screen w-full relative">
      {/* Globe Container */}
      <div className="absolute inset-0">
        <MapGlobe visits={visits} />
      </div>
      
      {/* UI Overlay */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="flex justify-between items-center">
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg p-3 border border-slate-700/50">
            <h2 className="text-lg font-semibold text-white">Your Travel Globe</h2>
            <p className="text-sm text-slate-300">{visits.length} places visited</p>
          </div>
          
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg p-3 border border-slate-700/50">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                <span className="text-sm text-slate-300">Your visits</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <span className="text-sm text-slate-300">Wishlist</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-slate-900/80 backdrop-blur-sm rounded-full px-6 py-3 border border-slate-700/50">
          <div className="flex items-center space-x-4 text-sm text-slate-300">
            <button className="hover:text-white transition-colors">🌍 Globe View</button>
            <div className="w-px h-4 bg-slate-600"></div>
            <Link href="/visits/new" className="hover:text-white transition-colors">
              📍 Add Visit
            </Link>
            <div className="w-px h-4 bg-slate-600"></div>
            <button className="hover:text-white transition-colors">🔍 Search</button>
          </div>
        </div>
      </div>

      {/* Visits List (Side Panel) */}
      {visits.length > 0 && (
        <div className="absolute right-4 top-24 bottom-20 w-80 z-10">
          <div className="bg-slate-900/90 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50 h-full overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Visits</h3>
            <div className="space-y-3">
              {visits.slice(-5).reverse().map((visit) => (
                <div key={visit.id} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
                  <h4 className="font-medium text-white">{visit.placeName}</h4>
                  <p className="text-sm text-slate-300">{visit.date}</p>
                  <div className="flex items-center mt-1">
                    <span className="text-yellow-400">{'★'.repeat(visit.rating)}</span>
                    <span className="text-slate-500">{'☆'.repeat(5 - visit.rating)}</span>
                  </div>
                  {visit.notes && (
                    <p className="text-sm text-slate-400 mt-1 line-clamp-2">{visit.notes}</p>
                  )}
                  {visit.photos && visit.photos.length > 0 && (
                    <div className="flex gap-1 mt-2 overflow-x-auto">
                      {visit.photos.slice(0, 3).map((photo, photoIndex) => (
                        <img
                          key={photoIndex}
                          src={photo}
                          alt={`${visit.placeName} photo ${photoIndex + 1}`}
                          className="w-12 h-12 object-cover rounded border border-slate-600 flex-shrink-0"
                        />
                      ))}
                      {visit.photos.length > 3 && (
                        <div className="w-12 h-12 bg-slate-700/50 rounded border border-slate-600 flex items-center justify-center text-xs text-slate-400">
                          +{visit.photos.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                  {visit.tags.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {visit.tags.map((tag, index) => (
                        <span key={index} className="text-xs bg-slate-700/50 text-slate-300 px-2 py-1 rounded-full">
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
    </div>
  )
}