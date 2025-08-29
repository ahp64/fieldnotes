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
        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        placeholder="Search for a place..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setShowResults(true)}
      />
      
      {isLoading && (
        <div className="absolute right-3 top-2.5">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        </div>
      )}

      {showResults && results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {results.map((place) => (
            <button
              key={place.id}
              className="w-full text-left px-3 py-2 hover:bg-muted focus:bg-muted focus:outline-none border-b border-border last:border-b-0"
              onClick={() => handlePlaceSelect(place)}
            >
              <div className="font-medium text-foreground">{place.name.split(',')[0]}</div>
              <div className="text-sm text-muted-foreground">{place.name}</div>
            </button>
          ))}
        </div>
      )}

      {showResults && results.length === 0 && query.length >= 3 && !isLoading && (
        <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg p-3">
          <div className="text-muted-foreground text-sm">No places found for "{query}"</div>
        </div>
      )}
    </div>
  )
}