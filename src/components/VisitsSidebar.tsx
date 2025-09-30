interface Visit {
  id: string
  placeName: string
  placeData?: {
    id: number
    name: string
    latitude: number
    longitude: number
    type: string
    importance: number
  }
  tagline?: string
  date: string
  notes: string
  tags: string[]
  photos?: string[]
  createdAt: string
}

interface VisitsSidebarProps {
  visit: Visit | null
  onClose: () => void
}

export function VisitsSidebar({ visit, onClose }: VisitsSidebarProps) {
  if (!visit) return null
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        padding: '24px 24px 16px 24px',
        display: 'flex',
        justifyContent: 'flex-end'
      }}>
        <button
          onClick={onClose}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            const target = e.target as HTMLButtonElement
            target.style.background = 'rgba(255, 255, 255, 0.2)'
            target.style.color = 'white'
          }}
          onMouseLeave={(e) => {
            const target = e.target as HTMLButtonElement
            target.style.background = 'rgba(255, 255, 255, 0.1)'
            target.style.color = 'rgba(255, 255, 255, 0.7)'
          }}
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '0 24px 24px 24px', flex: 1 }}>
        <VisitCard visit={visit} />
      </div>
    </div>
  )
}

function VisitCard({ visit }: { visit: Visit }) {
  const getRelativeDate = (dateString: string) => {
    const visitDate = new Date(dateString)
    const now = new Date()
    const diffTime = now.getTime() - visitDate.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 14) {
      return diffDays === 0 ? 'Today' : diffDays === 1 ? '1 day ago' : `${diffDays} days ago`
    } else if (diffDays < 28) {
      const weeks = Math.floor(diffDays / 7)
      return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return months === 1 ? '1 month ago' : `${months} months ago`
    } else {
      const years = Math.floor(diffDays / 365)
      return years === 1 ? '1 year ago' : `${years} years ago`
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Place Name - Large Title */}
      <div>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: 'white',
          lineHeight: '1.2',
          margin: '0 0 8px 0',
          fontFamily: 'var(--font-montserrat), sans-serif'
        }}>
          {visit.placeName.split(',')[0]}
        </h1>
        {visit.tagline && (
          <div style={{
            fontSize: '18px',
            color: 'rgba(255, 255, 255, 0.8)',
            fontStyle: 'italic',
            margin: '0 0 12px 0',
            fontFamily: 'var(--font-playfair), serif'
          }}>
            "{visit.tagline}"
          </div>
        )}
        <div style={{
          fontSize: '16px',
          color: 'rgba(255, 255, 255, 0.6)',
          fontWeight: '500',
          fontFamily: 'var(--font-montserrat), sans-serif'
        }}>
          {getRelativeDate(visit.date)}
        </div>
      </div>

      {/* Notes */}
      {visit.notes && (
        <div>
          <p style={{
            fontSize: '18px',
            color: 'rgba(255, 255, 255, 0.9)',
            lineHeight: '1.6',
            margin: 0,
            fontFamily: 'var(--font-playfair), serif'
          }}>
            {visit.notes}
          </p>
        </div>
      )}

      {/* Photos */}
      {visit.photos && visit.photos.length > 0 && (
        <div style={{
          display: 'flex',
          gap: '12px',
          overflowX: 'auto'
        }}>
          {visit.photos.slice(0, 3).map((photo, photoIndex) => (
            <img
              key={photoIndex}
              src={photo}
              alt={`${visit.placeName} ${photoIndex + 1}`}
              style={{
                width: '80px',
                height: '80px',
                objectFit: 'cover',
                borderRadius: '12px',
                flexShrink: 0
              }}
            />
          ))}
          {visit.photos.length > 3 && (
            <div style={{
              width: '80px',
              height: '80px',
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              color: 'white',
              fontWeight: '600'
            }}>
              +{visit.photos.length - 3}
            </div>
          )}
        </div>
      )}
    </div>
  )
}