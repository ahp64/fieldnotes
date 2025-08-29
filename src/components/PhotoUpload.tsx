'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'

interface PhotoUploadProps {
  onPhotosChange: (photos: string[]) => void
  maxPhotos?: number
}

export function PhotoUpload({ onPhotosChange, maxPhotos = 3 }: PhotoUploadProps) {
  const [photos, setPhotos] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    setIsUploading(true)

    try {
      const newPhotos: string[] = []

      for (const file of files) {
        // Check file size (limit to 5MB for MVP)
        if (file.size > 5 * 1024 * 1024) {
          alert(`File ${file.name} is too large. Please choose files under 5MB.`)
          continue
        }

        // Check file type
        if (!file.type.startsWith('image/')) {
          alert(`File ${file.name} is not an image.`)
          continue
        }

        // Convert to base64 for MVP (in production, would upload to Supabase Storage)
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })

        newPhotos.push(base64)

        // Stop if we've reached the limit
        if (photos.length + newPhotos.length >= maxPhotos) break
      }

      const updatedPhotos = [...photos, ...newPhotos].slice(0, maxPhotos)
      setPhotos(updatedPhotos)
      onPhotosChange(updatedPhotos)
    } catch (error) {
      console.error('Error uploading photos:', error)
      alert('Error uploading photos. Please try again.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removePhoto = (index: number) => {
    const updatedPhotos = photos.filter((_, i) => i !== index)
    setPhotos(updatedPhotos)
    onPhotosChange(updatedPhotos)
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-3">
        {photos.map((photo, index) => (
          <div key={index} className="relative">
            <img
              src={photo}
              alt={`Upload ${index + 1}`}
              className="w-20 h-20 object-cover rounded-lg border border-border"
            />
            <button
              type="button"
              onClick={() => removePhoto(index)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {photos.length < maxPhotos && (
        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="ghost"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border hover:border-primary transition-colors"
          >
            {isUploading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                Uploading...
              </div>
            ) : (
              <>📷 Add Photos ({photos.length}/{maxPhotos})</>
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            Upload up to {maxPhotos} photos. Max 5MB each. JPG, PNG, GIF supported.
          </p>
        </div>
      )}
    </div>
  )
}