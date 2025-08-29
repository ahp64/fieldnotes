'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { PlaceSearch } from '@/components/PlaceSearch'
import { PhotoUpload } from '@/components/PhotoUpload'

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
    date: '',
    rating: 5,
    notes: '',
    tags: '',
    photos: [] as string[],
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // For now, just store in localStorage as MVP
      const visits = JSON.parse(localStorage.getItem('fieldnotes-visits') || '[]')
      const newVisit = {
        id: Date.now().toString(),
        placeName: formData.placeName,
        placeData: formData.placeData,
        date: formData.date,
        rating: formData.rating,
        notes: formData.notes,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        photos: formData.photos,
        createdAt: new Date().toISOString(),
      }
      
      visits.push(newVisit)
      localStorage.setItem('fieldnotes-visits', JSON.stringify(visits))
      
      router.push('/')
    } catch (error) {
      console.error('Error saving visit:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value
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
    <div className="min-h-[calc(100vh-4rem)] bg-background p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-lg">📍</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Add New Visit</h1>
          </div>
          <p className="text-muted-foreground max-w-md mx-auto">
            Share your travel experience and add it to your personal globe
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 bg-card/50 backdrop-blur-sm p-8 rounded-2xl border border-border/50 shadow-lg">
          {/* Location Section */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-foreground">
              🌍 Where did you visit?
            </label>
            <p className="text-xs text-muted-foreground mb-3">Search for any location worldwide</p>
            <PlaceSearch
              onPlaceSelect={handlePlaceSelect}
              initialValue={formData.placeName}
            />
          </div>

          {/* Basic Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="date" className="block text-sm font-semibold text-foreground">
                📅 When did you visit?
              </label>
              <input
                type="date"
                id="date"
                name="date"
                required
                className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                value={formData.date}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="rating" className="block text-sm font-semibold text-foreground">
                ⭐ How was your experience?
              </label>
              <div className="relative">
                <select
                  id="rating"
                  name="rating"
                  className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary appearance-none transition-colors"
                  value={formData.rating}
                  onChange={handleChange}
                >
                  <option value={1}>⭐ Poor</option>
                  <option value={2}>⭐⭐ Fair</option>
                  <option value={3}>⭐⭐⭐ Good</option>
                  <option value={4}>⭐⭐⭐⭐ Very Good</option>
                  <option value={5}>⭐⭐⭐⭐⭐ Excellent</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="space-y-2">
            <label htmlFor="notes" className="block text-sm font-semibold text-foreground">
              ✍️ Share your experience
            </label>
            <p className="text-xs text-muted-foreground mb-3">What made this place special?</p>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-none"
              placeholder="Describe your experience, what you loved about this place, memorable moments..."
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          {/* Tags and Photos Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="tags" className="block text-sm font-semibold text-foreground">
                🏷️ Add tags
              </label>
              <p className="text-xs text-muted-foreground mb-3">Help categorize your visit</p>
              <input
                type="text"
                id="tags"
                name="tags"
                className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                placeholder="food, nature, museum, adventure..."
                value={formData.tags}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">
                📸 Add photos
              </label>
              <p className="text-xs text-muted-foreground mb-3">Capture your memories</p>
              <PhotoUpload onPhotosChange={handlePhotosChange} maxPhotos={3} />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-border/50">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push('/')}
              className="flex-1 py-3 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                  Saving...
                </div>
              ) : (
                'Save Visit'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}