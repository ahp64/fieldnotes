'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/useDebounce'

interface User {
  id: string
  username: string
  displayName: string | null
  bio: string | null
  avatarUrl: string | null
}

export function UserSearch() {
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const debouncedQuery = useDebounce(query, 300)
  const router = useRouter()

  useEffect(() => {
    if (debouncedQuery.trim().length === 0) {
      setUsers([])
      return
    }

    const searchUsers = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(
          `/api/users/search?q=${encodeURIComponent(debouncedQuery)}`
        )
        if (response.ok) {
          const data = await response.json()
          setUsers(data.users)
        }
      } catch (error) {
        console.error('Error searching users:', error)
      } finally {
        setIsLoading(false)
      }
    }

    searchUsers()
  }, [debouncedQuery])

  return (
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        placeholder="Search users..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: '100%',
          backgroundColor: '#1a1a1a',
          color: '#f8f8f8',
          border: '2px solid #4b5563',
          borderRadius: '12px',
          padding: '12px 56px', // Extra right padding for the button
          fontSize: '14px',
          outline: 'none',
          fontFamily: 'var(--font-roboto-serif), serif'
        }}
        onFocus={(e) => e.currentTarget.style.borderColor = '#9333ea'}
        onBlur={(e) => e.currentTarget.style.borderColor = '#4b5563'}
      />

      {query && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '8px',
            backgroundColor: '#1a1a1a',
            border: '1px solid #3f3f46',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
            maxHeight: '384px',
            overflowY: 'auto',
            zIndex: 10000
          }}
        >
          {isLoading ? (
            <div style={{ padding: '16px', textAlign: 'center', color: '#a1a1aa' }}>Searching...</div>
          ) : users.length > 0 ? (
            <div>
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    router.push(`/users/${user.username}`)
                    setQuery('')
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    textAlign: 'left',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    borderBottom: '1px solid #3f3f46'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#27272a'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.username}
                        style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: '#9333ea',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: '600'
                        }}
                      >
                        {user.username[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div style={{ fontWeight: '500', color: 'white', marginBottom: '2px' }}>
                        {user.displayName || user.username}
                      </div>
                      <div style={{ fontSize: '13px', color: '#a1a1aa' }}>
                        @{user.username}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div style={{ padding: '16px', textAlign: 'center', color: '#a1a1aa' }}>No users found</div>
          )}
        </div>
      )}
    </div>
  )
}
