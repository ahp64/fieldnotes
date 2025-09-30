'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Plus, User, LogOut, Globe, MapPin, Search } from 'lucide-react'
import { useState } from 'react'
import { UserSearch } from './UserSearch'

export function Navigation() {
  const { user, loading, signOut } = useAuth()
  const [showSearch, setShowSearch] = useState(false)

  return (
    <nav
      style={{
        position: 'fixed',
        top: '16px',
        right: '16px',
        zIndex: 9999
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {loading ? (
          <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
        ) : user ? (
          <>
            {/* Search bar with magnifying glass - positioned to the left of logout */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                transition: 'all 0.3s ease-in-out',
                width: showSearch ? '250px' : '40px', // Reduced from 360px to 320px
                height: '40px',
              }}
            >
              {/* Search input - slides out to the left */}
              <div
                style={{
                  position: 'absolute',
                  left: '0',
                  right: '40px',
                  opacity: showSearch ? 1 : 0,
                  transition: 'opacity 0.3s ease-in-out',
                  pointerEvents: showSearch ? 'auto' : 'none',
                }}
              >
                <UserSearch />
              </div>

              {/* Search button - stays on the right of this container */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                style={{
                  position: 'absolute',
                  right: '0',
                  top: '0',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.2s',
                  zIndex: 10
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#a78bfa'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'white'
                }}
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            {/* Logout button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="bg-transparent hover:bg-transparent border border-transparent transition-all duration-200"
              style={{ color: 'white', flexShrink: 0 }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLButtonElement
                target.style.color = '#fca5a5'
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLButtonElement
                target.style.color = 'white'
              }}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <Button
            variant="default"
            size="sm"
            asChild
            className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white border-0 shadow-lg shadow-sky-500/25 hover:shadow-sky-500/30 transition-all duration-200"
          >
            <Link href="/login" className="font-medium">
              Sign In
            </Link>
          </Button>
        )}
      </div>
    </nav>
  )
}