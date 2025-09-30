'use client'

interface User {
  id: string
  username: string
  displayName: string | null
  bio: string | null
  avatarUrl: string | null
}

interface Visit {
  id: string
  visitedOn: string
  note: string | null
  photos: string[] | null
  likeCount: number
  place: {
    id: string
    name: string
    lat: number
    lon: number
    country: string | null
    region: string | null
    city: string | null
  }
}

interface UserProfileSidebarProps {
  user: User
  visits: Visit[]
  selectedVisit: Visit | null
  onVisitSelect: (visit: Visit | null) => void
  onLike?: (visitId: string) => void
}

export function UserProfileSidebar({
  user,
  visits,
  selectedVisit,
  onVisitSelect,
  onLike
}: UserProfileSidebarProps) {
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
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        padding: '24px 24px 16px 24px',
        display: 'flex',
        justifyContent: 'flex-end'
      }}>
        <button
          onClick={() => onVisitSelect(null)}
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
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
            e.currentTarget.style.color = 'white'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'
          }}
        >
          {selectedVisit ? '←' : '✕'}
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '0 24px 24px 24px', flex: 1, overflowY: 'auto' }}>
        {selectedVisit ? (
          // Show visit details
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h1 style={{
                fontSize: '32px',
                fontWeight: '700',
                color: 'white',
                lineHeight: '1.2',
                margin: '0 0 8px 0',
                fontFamily: 'var(--font-montserrat), sans-serif'
              }}>
                {selectedVisit.place.name}
              </h1>
              <div style={{
                fontSize: '16px',
                color: 'rgba(255, 255, 255, 0.6)',
                fontWeight: '500',
                fontFamily: 'var(--font-montserrat), sans-serif'
              }}>
                {getRelativeDate(selectedVisit.visitedOn)}
              </div>
            </div>

            {selectedVisit.note && (
              <div>
                <p style={{
                  fontSize: '18px',
                  color: 'rgba(255, 255, 255, 0.9)',
                  lineHeight: '1.6',
                  margin: 0,
                  fontFamily: 'var(--font-playfair), serif'
                }}>
                  {selectedVisit.note}
                </p>
              </div>
            )}

            {selectedVisit.photos && selectedVisit.photos.length > 0 && (
              <div style={{
                display: 'flex',
                gap: '12px',
                overflowX: 'auto'
              }}>
                {selectedVisit.photos.slice(0, 3).map((photo, photoIndex) => (
                  <img
                    key={photoIndex}
                    src={photo}
                    alt={`${selectedVisit.place.name} ${photoIndex + 1}`}
                    style={{
                      width: '80px',
                      height: '80px',
                      objectFit: 'cover',
                      borderRadius: '12px',
                      flexShrink: 0
                    }}
                  />
                ))}
                {selectedVisit.photos.length > 3 && (
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
                    +{selectedVisit.photos.length - 3}
                  </div>
                )}
              </div>
            )}

            {onLike && (
              <button
                onClick={() => onLike(selectedVisit.id)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#9333ea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7c3aed'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#9333ea'}
              >
                👍 {selectedVisit.likeCount}
              </button>
            )}
          </div>
        ) : (
          // Show user profile and visits list
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* User Header */}
            <div>
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  style={{ width: '96px', height: '96px', borderRadius: '50%', marginBottom: '16px' }}
                />
              ) : (
                <div
                  style={{
                    width: '96px',
                    height: '96px',
                    borderRadius: '50%',
                    backgroundColor: '#9333ea',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '36px',
                    fontWeight: 'bold',
                    marginBottom: '16px'
                  }}
                >
                  {user.username[0].toUpperCase()}
                </div>
              )}
              <h1 style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '4px',
                fontFamily: 'var(--font-montserrat), sans-serif'
              }}>
                {user.displayName || user.username}
              </h1>
              <p style={{ color: '#a1a1aa', marginBottom: '8px' }}>@{user.username}</p>
              {user.bio && (
                <p style={{ color: '#d4d4d8' }}>{user.bio}</p>
              )}
            </div>

            {/* Visit Stats */}
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '16px'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>
                {visits.length}
              </div>
              <div style={{ color: '#a1a1aa' }}>Places Visited</div>
            </div>

            {/* Visits List */}
            <div>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: 'white',
                marginBottom: '12px',
                fontFamily: 'var(--font-montserrat), sans-serif'
              }}>
                Recent Visits
              </h2>
              {visits.map((visit) => (
                <button
                  key={visit.id}
                  onClick={() => onVisitSelect(visit)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '16px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: 'none',
                    cursor: 'pointer',
                    marginBottom: '8px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
                  }}
                >
                  <div style={{
                    fontWeight: '500',
                    color: 'white',
                    marginBottom: '4px',
                    fontFamily: 'var(--font-montserrat), sans-serif'
                  }}>
                    {visit.place.name}
                  </div>
                  <div style={{ fontSize: '13px', color: '#a1a1aa', marginBottom: '8px' }}>
                    {getRelativeDate(visit.visitedOn)}
                  </div>
                  <div style={{ fontSize: '13px', color: '#a1a1aa' }}>
                    👍 {visit.likeCount}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
