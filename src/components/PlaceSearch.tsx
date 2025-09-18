'use client'

import { useState, useEffect } from 'react'

interface Place {
  id: number
  name: string
  latitude: number
  longitude: number
  type: string
  importance: number
}

interface PlaceSearchProps {
  onPlaceSelect: (place: Place) => void
  initialValue?: string
}

export function PlaceSearch({ onPlaceSelect, initialValue = '' }: PlaceSearchProps) {
  const [query, setQuery] = useState(initialValue)
  const [results, setResults] = useState<Place[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    const searchPlaces = async () => {
      if (query.length < 3) {
        setResults([])
        setShowResults(false)
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`/api/places/search?q=${encodeURIComponent(query)}`)
        if (response.ok) {
          const places = await response.json()
          setResults(places)
          setShowResults(true)
        }
      } catch (error) {
        console.error('Error searching places:', error)
      } finally {
        setIsLoading(false)
      }
    }

    const timeoutId = setTimeout(searchPlaces, 300)
    return () => clearTimeout(timeoutId)
  }, [query])

  const handlePlaceSelect = (place: Place) => {
    setQuery(place.name)
    setShowResults(false)
    onPlaceSelect(place)
  }

  return (
    <div className="relative">
      <input
        type="text"
        className="w-full px-6 py-4 focus:outline-none transition-all duration-300 text-lg"
        style={{
          backgroundColor: '#1a1a1a',
          color: '#f8f8f8',
          fontFamily: 'var(--font-roboto-serif), serif',
          border: '2px solid #4b5563',
          borderRadius: '12px'
        }}
        placeholder="Search for any place around the world"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={(e) => {
          results.length > 0 && setShowResults(true)
          e.target.style.borderColor = '#9333ea'
        }}
        onBlur={(e) => {
          setTimeout(() => setShowResults(false), 200) // Delay to allow click on result
          e.target.style.borderColor = '#4b5563'
        }}
      />
      
      {isLoading && (
        <div className="absolute right-3 top-2.5">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        </div>
      )}

      {showResults && results.length > 0 && (
        <div
          className="absolute z-10 w-full mt-2 shadow-lg max-h-60 overflow-y-auto"
          style={{
            backgroundColor: '#1a1a1a',
            border: '2px solid #4b5563',
            borderRadius: '12px'
          }}
        >
          {results.map((place) => (
            <button
              key={place.id}
              className="w-full text-left px-6 py-3 focus:outline-none transition-all duration-200 border-b last:border-b-0"
              style={{
                borderColor: '#4b5563',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#2a2a2a'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent'
              }}
              onClick={() => handlePlaceSelect(place)}
            >
              <div
                className="font-medium text-lg"
                style={{
                  color: '#f8f8f8',
                  fontFamily: 'var(--font-roboto-serif), serif'
                }}
              >
                {place.name.split(',')[0]}
              </div>
              <div
                className="text-sm"
                style={{
                  color: '#a0a0a0',
                  fontFamily: 'var(--font-roboto-serif), serif'
                }}
              >
                {place.name}
              </div>
            </button>
          ))}
        </div>
      )}

      {showResults && results.length === 0 && query.length >= 3 && !isLoading && (
        <div
          className="absolute z-10 w-full mt-2 shadow-lg p-4"
          style={{
            backgroundColor: '#1a1a1a',
            border: '2px solid #4b5563',
            borderRadius: '12px'
          }}
        >
          <div
            className="text-sm"
            style={{
              color: '#a0a0a0',
              fontFamily: 'var(--font-roboto-serif), serif'
            }}
          >
            No places found for "{query}"
          </div>
        </div>
      )}
    </div>
  )
}