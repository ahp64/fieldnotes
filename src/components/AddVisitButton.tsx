import Link from 'next/link'
import { Plus, MapPin } from 'lucide-react'

export function AddVisitButton() {
  return (
    <Link
      href="/visits/new"
      className="transition-all duration-300 hover:scale-105"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '80px',
        height: '80px',
        backgroundColor: '#9333ea',
        borderRadius: '50%',
        boxShadow: '0 8px 32px rgba(147, 51, 234, 0.4), 0 4px 16px rgba(147, 51, 234, 0.3)',
        filter: 'drop-shadow(0 0 12px rgba(147, 51, 234, 0.4))',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#7c3aed'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#9333ea'
      }}
    >
      <MapPin
        className="drop-shadow-lg"
        style={{
          width: '44px',
          height: '44px',
          color: 'white'
        }}
      />
      <Plus
        className="drop-shadow-lg"
        style={{
          position: 'absolute',
          bottom: '12px',
          right: '16px',
          width: '18px',
          height: '18px',
          color: 'white'
        }}
      />
    </Link>
  )
}