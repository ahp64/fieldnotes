'use client'

import { useState } from 'react'

export function RemoveVisitButton() {
  const [loading, setLoading] = useState(false)

  const removeLastVisit = async () => {
    setLoading(true)

    try {
      // Get current visits from API
      const response = await fetch('/api/visits')
      if (!response.ok) throw new Error('Failed to fetch visits')

      const { visits } = await response.json()

      if (visits.length === 0) {
        alert('No visits to remove')
        return
      }

      // Remove the most recent visit (first in the array since they're ordered by date desc)
      const lastVisit = visits[0]

      const deleteResponse = await fetch(`/api/visits/${lastVisit.id}`, {
        method: 'DELETE',
      })

      if (!deleteResponse.ok) {
        throw new Error('Failed to delete visit')
      }

      // Trigger refresh
      window.dispatchEvent(new Event('storage'))
    } catch (error) {
      console.error('Error removing visit:', error)
      alert('Failed to remove visit. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={removeLastVisit}
      disabled={loading}
      className="w-12 h-12 bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center text-white font-bold text-sm"
      title="Remove last visit"
    >
      {loading ? '...' : '-1'}
    </button>
  )
}