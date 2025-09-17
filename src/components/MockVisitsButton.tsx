'use client'

export function MockVisitsButton() {
  const addMockVisits = () => {
    // Create 4 mock visits using the same structure as the form
    const mockVisits = [
      {
        id: Date.now().toString(),
        placeName: 'Paris',
        placeData: {
          id: 1,
          name: 'Paris',
          latitude: 48.8566,
          longitude: 2.3522,
          type: 'city',
          importance: 0.8
        },
        date: '2024-06-15',
        rating: 5,
        notes: 'Amazing city with incredible architecture and food!',
        tags: ['culture', 'food', 'history'],
        photos: [],
        createdAt: new Date().toISOString(),
      },
      {
        id: (Date.now() + 1).toString(),
        placeName: 'Rio de Janeiro',
        placeData: {
          id: 2,
          name: 'Rio de Janeiro',
          latitude: -22.9068,
          longitude: -43.1729,
          type: 'city',
          importance: 0.7
        },
        date: '2024-07-20',
        rating: 4,
        notes: 'Beautiful beaches and vibrant culture. Christ the Redeemer was breathtaking!',
        tags: ['beach', 'culture', 'mountains'],
        photos: [],
        createdAt: new Date().toISOString(),
      },
      {
        id: (Date.now() + 2).toString(),
        placeName: 'Reykjavik',
        placeData: {
          id: 3,
          name: 'Reykjavik',
          latitude: 64.1466,
          longitude: -21.9426,
          type: 'city',
          importance: 0.6
        },
        date: '2024-08-10',
        rating: 5,
        notes: 'Northern lights and geothermal pools were magical. Such a unique landscape!',
        tags: ['nature', 'adventure', 'northern-lights'],
        photos: [],
        createdAt: new Date().toISOString(),
      },
      {
        id: (Date.now() + 3).toString(),
        placeName: 'Cape Town',
        placeData: {
          id: 4,
          name: 'Cape Town',
          latitude: -33.9249,
          longitude: 18.4241,
          type: 'city',
          importance: 0.7
        },
        date: '2024-09-05',
        rating: 4,
        notes: 'Table Mountain views and wine country were unforgettable. Great food scene too!',
        tags: ['mountains', 'wine', 'food'],
        photos: [],
        createdAt: new Date().toISOString(),
      }
    ]

    // Get existing visits and append mock visits
    const existingVisits = JSON.parse(localStorage.getItem('fieldnotes-visits') || '[]')
    const allVisits = [...existingVisits, ...mockVisits]
    localStorage.setItem('fieldnotes-visits', JSON.stringify(allVisits))

    // Refresh page to show new visits
    window.location.reload()
  }

  return (
    <button
      onClick={addMockVisits}
      className="w-12 h-12 bg-red-500 hover:bg-red-600 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center text-white font-bold text-sm"
      title="Add 4 mock visits"
    >
      +4
    </button>
  )
}