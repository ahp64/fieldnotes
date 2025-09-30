'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import { Button } from '@/components/ui/button'

interface Visit {
  id: string
  visitedOn: string
  note: string | null
  photos: string[] | null
  likeCount: number
  user: {
    id: string
    username: string
    displayName: string | null
    avatarUrl: string | null
  }
  place: {
    id: string
    name: string
    lat: number
    lon: number
    country: string | null
    region: string | null
    city: string | null
  }
}

export default function PlaceVisitsPage() {
  const params = useParams()
  const router = useRouter()
  const placeId = params.placeId as string

  const [visits, setVisits] = useState<Visit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null)

  useEffect(() => {
    loadPlaceVisits()
  }, [placeId])

  const loadPlaceVisits = async () => {
    try {
      const response = await fetch(`/api/places/${placeId}/visits`)
      if (!response.ok) {
        throw new Error('Failed to load place visits')
      }

      const data = await response.json()
      setVisits(data.visits)
    } catch (error) {
      console.error('Error loading place visits:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLike = async (visitId: string) => {
    try {
      const response = await fetch(`/api/visits/${visitId}/like`, {
        method: 'POST',
      })

      if (response.ok) {
        // Refresh visits to update like count
        loadPlaceVisits()
      }
    } catch (error) {
      console.error('Error liking visit:', error)
    }
  }

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-[#0b1021] flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </>
    )
  }

  const placeName = visits[0]?.place.name || 'Unknown Location'

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-[#0b1021] p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="text-purple-400 hover:text-purple-300 mb-4"
            >
              ← Back
            </button>
            <h1 className="text-4xl font-bold text-white mb-2">{placeName}</h1>
            <p className="text-zinc-400">
              {visits.length} {visits.length === 1 ? 'visit' : 'visits'}
            </p>
          </div>

          {/* Visits List */}
          {visits.length === 0 ? (
            <div className="text-center text-zinc-400 py-12">
              No visits to this location yet.
            </div>
          ) : (
            <div className="space-y-4">
              {visits.map((visit) => (
                <div
                  key={visit.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-purple-600 transition-colors"
                >
                  {/* User Info */}
                  <div className="flex items-center gap-3 mb-4">
                    {visit.user.avatarUrl ? (
                      <img
                        src={visit.user.avatarUrl}
                        alt={visit.user.username}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">
                        {visit.user.username[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <button
                        onClick={() => router.push(`/users/${visit.user.username}`)}
                        className="font-medium text-white hover:text-purple-400"
                      >
                        {visit.user.displayName || visit.user.username}
                      </button>
                      <div className="text-sm text-zinc-400">
                        @{visit.user.username}
                      </div>
                    </div>
                    <div className="ml-auto text-sm text-zinc-400">
                      {new Date(visit.visitedOn).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Visit Content */}
                  {visit.note && (
                    <p className="text-white mb-4 whitespace-pre-wrap">
                      {visit.note}
                    </p>
                  )}

                  {/* Photos */}
                  {visit.photos && visit.photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {visit.photos.map((photo, i) => (
                        <img
                          key={i}
                          src={photo}
                          alt={`Photo ${i + 1}`}
                          className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90"
                          onClick={() => setSelectedVisit(visit)}
                        />
                      ))}
                    </div>
                  )}

                  {/* Like Button */}
                  <Button
                    onClick={() => handleLike(visit.id)}
                    variant="ghost"
                    size="sm"
                    className="text-zinc-400 hover:text-purple-400"
                  >
                    👍 {visit.likeCount}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Visit Detail Modal */}
        {selectedVisit && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setSelectedVisit(null)}
          >
            <div
              className="bg-zinc-900 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {selectedVisit.place.name}
                  </h2>
                  <div className="flex items-center gap-2 text-zinc-400">
                    <span>{selectedVisit.user.displayName || selectedVisit.user.username}</span>
                    <span>•</span>
                    <span>{new Date(selectedVisit.visitedOn).toLocaleDateString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedVisit(null)}
                  className="text-zinc-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              {selectedVisit.note && (
                <p className="text-white mb-4 whitespace-pre-wrap">
                  {selectedVisit.note}
                </p>
              )}

              {selectedVisit.photos && selectedVisit.photos.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {selectedVisit.photos.map((photo, i) => (
                    <img
                      key={i}
                      src={photo}
                      alt={`Photo ${i + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}

              <Button
                onClick={() => handleLike(selectedVisit.id)}
                className="w-full"
              >
                👍 Like ({selectedVisit.likeCount})
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
