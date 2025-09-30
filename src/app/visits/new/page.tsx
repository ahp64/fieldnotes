'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { PlaceSearch } from '@/components/PlaceSearch'
import { PhotoUpload } from '@/components/PhotoUpload'
import { Navigation } from '@/components/Navigation'
import dynamic from 'next/dynamic'

const MapGlobe = dynamic(() => import('@/components/MapGlobe'), { ssr: false })

interface Place {
  id: number
  name: string
  latitude: number
  longitude: number
  type: string
  importance: number
}

export default function NewVisit() {
  const [formData, setFormData] = useState({
    placeName: '',
    placeData: null as Place | null,
    tagline: '',
    date: '',
    notes: '',
    photos: [] as string[],
  })
  const [isLoading, setIsLoading] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number, lng: number } | null>(null)
  const router = useRouter()

  // Memoize stable props to prevent unnecessary re-renders
  const globeProps = useMemo(() => ({
    visits: [],
    autoRotate: true,
    autoZoom: true
  }), [])

  const focusLocation = useMemo(() =>
    selectedLocation ? {
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
      name: formData.placeName
    } : null,
    [selectedLocation, formData.placeName]
  )

  // Update selectedLocation when place is selected
  useEffect(() => {
    if (formData.placeData) {
      setSelectedLocation({
        lat: formData.placeData.latitude,
        lng: formData.placeData.longitude
      })
    } else {
      setSelectedLocation(null)
    }
  }, [formData.placeData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!formData.placeData) {
        throw new Error('Place not selected')
      }

      const response = await fetch('/api/visits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          placeName: formData.placeName,
          latitude: formData.placeData.latitude,
          longitude: formData.placeData.longitude,
          visitedOn: formData.date,
          note: formData.notes,
          photos: formData.photos,
          privacy: 'public',
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save visit')
      }

      window.dispatchEvent(new Event('storage'))
      router.push('/')
    } catch (error: any) {
      console.error('Error saving visit:', error)
      alert(error.message || 'Failed to save visit. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePlaceSelect = (place: Place) => {
    setFormData(prev => ({
      ...prev,
      placeName: place.name,
      placeData: place
    }))
  }

  const handlePhotosChange = (photos: string[]) => {
    setFormData(prev => ({
      ...prev,
      photos
    }))
  }

  return (
    <>
      <Navigation />
      <div className="h-screen bg-black relative fixed inset-0" style={{ overflow: 'hidden' }}>
        {/* Two Column Layout */}
        <div className="flex h-full">
          {/* Left Column - Form */}
          <div className="flex-1 overflow-y-auto relative" style={{ maxHeight: '100vh' }}>
            {/* X Button in top-left */}
            <button
              type="button"
              onClick={() => router.push('/')}
              className="absolute top-4 left-4 w-10 h-10 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center z-10"
              style={{
                backgroundColor: 'transparent',
                color: '#9333ea',
                fontFamily: 'var(--font-montserrat), sans-serif',
                border: '2px solid #9333ea',
                background: 'rgba(147, 51, 234, 0.1)'
              }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLButtonElement
                target.style.backgroundColor = '#9333ea'
                target.style.color = 'white'
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLButtonElement
                target.style.backgroundColor = 'rgba(147, 51, 234, 0.1)'
                target.style.color = '#9333ea'
              }}
            >
              ✕
            </button>

            <div className="max-w-2xl mx-auto p-8 pb-16">
              {/* Header */}
              <div className="mb-12 text-center">
                <h1 className="text-5xl font-bold text-white mb-6 tracking-tight" style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}>
                  Record Your Journey
                </h1>
              </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Main Form Container */}
            <div style={{ backgroundColor: '#27272a', padding: '3rem', borderRadius: '1.5rem', border: '1px solid #3f3f46', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
              <div className="space-y-10">
                {/* Location Section */}
                <div>
                  <h2 className="text-3xl font-semibold text-white text-center mb-8" style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}>
                    Location
                  </h2>
                  <div className="flex justify-center">
                    <div style={{ width: '400px', maxWidth: '100%' }}>
                      <PlaceSearch
                        onPlaceSelect={handlePlaceSelect}
                        initialValue={formData.placeName}
                      />
                    </div>
                  </div>
                </div>

                {/* Tagline Section */}
                <div>
                  <h2 className="text-3xl font-semibold text-white text-center mb-8" style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}>
                    Tagline
                  </h2>
                  <div className="flex justify-center">
                    <input
                      type="text"
                      id="tagline"
                      name="tagline"
                      className="px-6 py-4 focus:outline-none transition-all duration-300 text-lg"
                      style={{
                        backgroundColor: '#1a1a1a',
                        color: '#f8f8f8',
                        fontFamily: 'var(--font-roboto-serif), serif',
                        border: '2px solid #4b5563',
                        borderRadius: '12px',
                        width: '400px',
                        maxWidth: '100%'
                      }}
                      placeholder="A magical sunset over the mountains..."
                      value={formData.tagline}
                      onChange={handleChange}
                      onFocus={(e) => e.target.style.borderColor = '#9333ea'}
                      onBlur={(e) => e.target.style.borderColor = '#4b5563'}
                    />
                  </div>
                </div>

                {/* Date Section */}
                <div>
                  <h2 className="text-3xl font-semibold text-white text-center mb-8" style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}>
                    Visit Date
                  </h2>
                  <div className="flex justify-center">
                    <input
                      type="date"
                      id="date"
                      name="date"
                      required
                      className="px-6 py-4 focus:outline-none transition-all duration-300 text-lg"
                      style={{
                        backgroundColor: '#1a1a1a',
                        color: '#f8f8f8',
                        fontFamily: 'var(--font-roboto-serif), serif',
                        border: '2px solid #4b5563',
                        borderRadius: '12px',
                        width: '400px',
                        maxWidth: '100%'
                      }}
                      value={formData.date}
                      onChange={handleChange}
                      onFocus={(e) => e.target.style.borderColor = '#9333ea'}
                      onBlur={(e) => e.target.style.borderColor = '#4b5563'}
                    />
                  </div>
                </div>

                {/* Notes Section */}
                <div>
                  <h2 className="text-3xl font-semibold text-white text-center mb-8" style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}>
                    Your Story
                  </h2>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={6}
                    className="w-full px-6 py-4 focus:outline-none transition-all duration-300 resize-none text-lg leading-relaxed"
                    style={{
                      backgroundColor: '#1a1a1a',
                      color: '#f8f8f8',
                      fontFamily: 'var(--font-roboto-serif), serif',
                      border: '2px solid #4b5563',
                      borderRadius: '12px'
                    }}
                    placeholder="Describe your experience, the people you met, the sights you saw, the emotions you felt..."
                    value={formData.notes}
                    onChange={handleChange}
                    onFocus={(e) => e.target.style.borderColor = '#9333ea'}
                    onBlur={(e) => e.target.style.borderColor = '#4b5563'}
                  />
                </div>

                {/* Photos Section */}
                <div>
                  <h2 className="text-3xl font-semibold text-white text-center mb-8" style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}>
                    Visual Memories
                  </h2>
                  <PhotoUpload onPhotosChange={handlePhotosChange} maxPhotos={5} />
                </div>

                {/* Save Journey Button */}
                <div className="flex justify-center" style={{ marginTop: '80px' }}>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="py-12 px-16 font-bold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg"
                    style={{
                      backgroundColor: '#9333ea',
                      color: 'white',
                      fontFamily: 'var(--font-montserrat), sans-serif',
                      border: 'none',
                      borderRadius: '3rem',
                      boxShadow: '0 8px 25px rgba(147, 51, 234, 0.3)',
                      background: isLoading ? '#6d28d9' : 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      opacity: isLoading ? 0.7 : 1,
                      width: '280px',
                      fontSize: '28px'
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading) {
                        const target = e.target as HTMLButtonElement
                        target.style.background = 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading) {
                        const target = e.target as HTMLButtonElement
                        target.style.background = 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)'
                      }
                    }}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        Saving Journey...
                      </div>
                    ) : (
                      'Save Journey'
                    )}
                  </button>
                </div>
              </div>
            </div>

          </form>
            </div>
          </div>

          {/* Right Column - Globe */}
          <div className="flex-1 min-w-0">
            <MapGlobe
              {...globeProps}
              focusLocation={focusLocation}
            />
          </div>
        </div>
      </div>
    </>
  )
}