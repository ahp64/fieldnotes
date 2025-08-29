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
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Add New Visit</h1>
          <p className="text-muted-foreground">Document your travel experience</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-lg border border-border">
          <div>
            <label htmlFor="placeName" className="block text-sm font-medium text-foreground mb-2">
              Place Name *
            </label>
            <PlaceSearch
              onPlaceSelect={handlePlaceSelect}
              initialValue={formData.placeName}
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-foreground mb-2">
              Visit Date *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              required
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              value={formData.date}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="rating" className="block text-sm font-medium text-foreground mb-2">
              Rating
            </label>
            <select
              id="rating"
              name="rating"
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              value={formData.rating}
              onChange={handleChange}
            >
              <option value={1}>1 - Poor</option>
              <option value={2}>2 - Fair</option>
              <option value={3}>3 - Good</option>
              <option value={4}>4 - Very Good</option>
              <option value={5}>5 - Excellent</option>
            </select>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-2">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Share your thoughts about this place..."
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-foreground mb-2">
              Tags
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="food, nature, museum (comma separated)"
              value={formData.tags}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Photos
            </label>
            <PhotoUpload onPhotosChange={handlePhotosChange} maxPhotos={3} />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push('/')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Saving...' : 'Save Visit'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}