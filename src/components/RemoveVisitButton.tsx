'use client'

export function RemoveVisitButton() {
  const removeLastVisit = () => {
    // Get existing visits
    const existingVisits = JSON.parse(localStorage.getItem('fieldnotes-visits') || '[]')

    if (existingVisits.length === 0) {
      return // Nothing to remove
    }

    // Remove the last visit (most recently added)
    const updatedVisits = existingVisits.slice(0, -1)
    localStorage.setItem('fieldnotes-visits', JSON.stringify(updatedVisits))

    // Refresh page to show updated visits
    window.location.reload()
  }

  return (
    <button
      onClick={removeLastVisit}
      className="w-12 h-12 bg-red-600 hover:bg-red-700 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center text-white font-bold text-sm"
      title="Remove last visit"
    >
      -1
    </button>
  )
}