'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { VisitsSidebar } from '@/components/VisitsSidebar'

const MapGlobe = dynamic(() => import('@/components/MapGlobe'), { ssr: false })

interface User {
  id: string
  username: string
  displayName: string | null
  bio: string | null
  avatarUrl: string | null
}

interface Visit {
  id: string
  visitedOn: string
  note: string | null
  photos: string[] | null
  likeCount: number
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

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const username = params.username as string

  const [user, setUser] = useState<User | null>(null)
  const [visits, setVisits] = useState<Visit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null)
  const [showProfile, setShowProfile] = useState(true)
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number, lng: number, name: string } | null>(null)

  // Memoize focusLocation to prevent map reloads
  const focusLocation = useMemo(() => selectedLocation, [selectedLocation])

  // Memoize formatted visits to prevent map reloads - MUST be before early returns
  const formattedVisits = useMemo(() => visits.map((v) => ({
      id: v.id,
      placeName: v.place.name,
      placeData: {
        id: v.place.id,
        name: v.place.name,
        latitude: v.place.lat,
        longitude: v.place.lon,
        type: 'place',
        importance: 1,
      },
      date: v.visitedOn,
      notes: v.note || '',
      tags: [],
      photos: v.photos || [],
      createdAt: v.visitedOn,
    })), [visits])

  const formattedSelectedVisit = useMemo(() => selectedVisit ? {
    id: selectedVisit.id,
    placeName: selectedVisit.place.name,
    placeData: {
      id: selectedVisit.place.id,
      name: selectedVisit.place.name,
      latitude: selectedVisit.place.lat,
      longitude: selectedVisit.place.lon,
      type: 'place',
      importance: 1,
    },
    date: selectedVisit.visitedOn,
    notes: selectedVisit.note || '',
    tags: [],
    photos: selectedVisit.photos || [],
    createdAt: selectedVisit.visitedOn,
  } : null, [selectedVisit])

  useEffect(() => {
    loadUserProfile()
  }, [username])

  const loadUserProfile = async () => {
    try {
      const response = await fetch(`/api/users/${username}`)
      if (!response.ok) {
        throw new Error('Failed to load user profile')
      }

      const data = await response.json()
      setUser(data.user)
      setVisits(data.visits)
    } catch (error) {
      console.error('Error loading user profile:', error)
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
        loadUserProfile()
      }
    } catch (error) {
      console.error('Error liking visit:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b1021] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0b1021] flex items-center justify-center">
        <div className="text-white text-xl">User not found</div>
      </div>
    )
  }

  return (
    <>

      {/* Globe Container - Centered like home page */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: '-400px',
          right: '-400px',
          bottom: 0,
          width: 'calc(100vw + 800px)',
          height: '100vh',
          transform: (selectedVisit || showProfile) ? 'translateX(-200px)' : 'translateX(0px)',
          transition: 'transform 0.3s ease-out',
          zIndex: 1
        }}
      >
        <MapGlobe
          visits={formattedVisits}
          onVisitSelect={(visit) => {
            const fullVisit = visits.find((v) => v.id === visit.id)
            if (fullVisit) {
              setSelectedVisit(fullVisit)
              setShowProfile(false)
              setSelectedLocation({
                lat: fullVisit.place.lat,
                lng: fullVisit.place.lon,
                name: fullVisit.place.name
              })
            }
          }}
          autoRotate={true}
          autoZoom={true}
          focusLocation={focusLocation}
        />
      </div>

      {/* Sliding Sidebar - Profile or Visit */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: (selectedVisit || showProfile) ? '0px' : '-400px',
          width: '400px',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.15)',
          backdropFilter: 'blur(2px)',
          boxShadow: (selectedVisit || showProfile) ? '-20px 0 60px rgba(0, 0, 0, 0.5)' : 'none',
          transition: 'right 0.3s ease-out, box-shadow 0.3s ease-out',
          zIndex: 10,
          overflow: 'hidden'
        }}
      >
        {/* Gradient blur overlay */}
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

        {(selectedVisit || showProfile) && (
          selectedVisit ? (
            <VisitsSidebar
              visit={formattedSelectedVisit!}
              onClose={() => {
                setSelectedVisit(null)
                setShowProfile(true)
                setSelectedLocation(null)
              }}
            />
          ) : (
            <UserProfileContent
              user={user}
              visits={visits}
              onVisitSelect={(visit) => {
                setSelectedVisit(visit)
                setShowProfile(false)
                setSelectedLocation({
                  lat: visit.place.lat,
                  lng: visit.place.lon,
                  name: visit.place.name
                })
              }}
              onClose={() => router.push('/')}
              onLike={handleLike}
            />
          )
        )}
      </div>
    </>
  )
}

function UserProfileContent({
  user,
  visits,
  onVisitSelect,
  onClose,
  onLike
}: {
  user: User
  visits: Visit[]
  onVisitSelect: (visit: Visit) => void
  onClose: () => void
  onLike: (visitId: string) => void
}) {
  const getRelativeDate = (dateString: string) => {
    const visitDate = new Date(dateString)
    const now = new Date()
    const diffTime = now.getTime() - visitDate.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 14) {
      return diffDays === 0 ? 'Today' : diffDays === 1 ? '1 day ago' : `${diffDays} days ago`
    } else if (diffDays < 28) {
      const weeks = Math.floor(diffDays / 7)
      return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return months === 1 ? '1 month ago' : `${months} months ago`
    } else {
      const years = Math.floor(diffDays / 365)
      return years === 1 ? '1 year ago' : `${years} years ago`
    }
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        padding: '24px 24px 16px 24px',
        display: 'flex',
        justifyContent: 'flex-end'
      }}>
        <button
          onClick={onClose}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
            e.currentTarget.style.color = 'white'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'
          }}
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '0 24px 24px 24px', flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* User Header */}
          <div>
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.username}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  marginBottom: '16px'
                }}
              />
            ) : (
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundColor: '#9333ea',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '32px',
                  fontWeight: 'bold',
                  marginBottom: '16px'
                }}
              >
                {user.username[0].toUpperCase()}
              </div>
            )}
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: 'white',
              lineHeight: '1.2',
              margin: '0 0 8px 0',
              fontFamily: 'var(--font-montserrat), sans-serif'
            }}>
              {user.displayName || user.username}
            </h1>
            <div style={{
              fontSize: '16px',
              color: 'rgba(255, 255, 255, 0.6)',
              fontWeight: '500',
              fontFamily: 'var(--font-montserrat), sans-serif',
              marginBottom: '8px'
            }}>
              @{user.username}
            </div>
            {user.bio && (
              <p style={{
                fontSize: '16px',
                color: 'rgba(255, 255, 255, 0.8)',
                lineHeight: '1.5',
                margin: 0
              }}>
                {user.bio}
              </p>
            )}
          </div>

          {/* Visit Stats */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '4px'
            }}>
              {visits.length}
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Places Visited
            </div>
          </div>

          {/* Visits List */}
          <div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: 'white',
              marginBottom: '12px',
              fontFamily: 'var(--font-montserrat), sans-serif'
            }}>
              Recent Visits
            </h2>
            {visits.map((visit) => (
              <button
                key={visit.id}
                onClick={() => onVisitSelect(visit)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '16px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: 'none',
                  cursor: 'pointer',
                  marginBottom: '12px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
                }}
              >
                <div style={{
                  fontWeight: '600',
                  color: 'white',
                  marginBottom: '4px',
                  fontSize: '16px',
                  fontFamily: 'var(--font-montserrat), sans-serif'
                }}>
                  {visit.place.name}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  marginBottom: '8px'
                }}>
                  {getRelativeDate(visit.visitedOn)}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14 9V5a3 3 0 0 0-6 0v4H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V11a2 2 0 0 0-2-2h-4z"/>
                    <path d="M8 9V5a3 3 0 1 1 6 0v4"/>
                  </svg>
                  {visit.likeCount}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
