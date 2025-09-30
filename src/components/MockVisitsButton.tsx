'use client'

import { useState } from 'react'

export function MockVisitsButton() {
  const [loading, setLoading] = useState(false)

  const addMockVisits = async () => {
    setLoading(true)

    const mockVisits = [
      {
        placeName: 'Paris, France',
        latitude: 48.8566,
        longitude: 2.3522,
        visitedOn: '2024-06-15',
        note: 'Amazing city with incredible architecture and food!',
        photos: [],
        privacy: 'public'
      },
      {
        placeName: 'Rio de Janeiro, Brazil',
        latitude: -22.9068,
        longitude: -43.1729,
        visitedOn: '2024-07-20',
        note: 'Beautiful beaches and vibrant culture. Christ the Redeemer was breathtaking!',
        photos: [],
        privacy: 'public'
      },
      {
        placeName: 'Reykjavik, Iceland',
        latitude: 64.1466,
        longitude: -21.9426,
        visitedOn: '2024-08-10',
        note: 'Northern lights and geothermal pools were magical. Such a unique landscape!',
        photos: [],
        privacy: 'public'
      },
      {
        placeName: 'Cape Town, South Africa',
        latitude: -33.9249,
        longitude: 18.4241,
        visitedOn: '2024-09-05',
        note: 'Table Mountain views and wine country were unforgettable. Great food scene too!',
        photos: [],
        privacy: 'public'
      }
    ]

    try {
      for (const visit of mockVisits) {
        const response = await fetch('/api/visits', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(visit),
        })

        if (!response.ok) {
          throw new Error(`Failed to add ${visit.placeName}`)
        }
      }

      window.dispatchEvent(new Event('storage'))
    } catch (error) {
      console.error('Error adding mock visits:', error)
      alert('Failed to add mock visits. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={addMockVisits}
      disabled={loading}
      className="w-12 h-12 bg-red-500 hover:bg-red-600 disabled:bg-red-300 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center text-white font-bold text-sm"
      title="Add 4 mock visits"
    >
      {loading ? '...' : '+4'}
    </button>
  )
}