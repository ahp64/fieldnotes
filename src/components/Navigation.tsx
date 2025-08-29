'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'

export function Navigation() {
  const { user, loading, signOut } = useAuth()

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-primary hover:text-primary/80 transition-colors">
              Fieldnotes
            </Link>
          </div>
          
          <div className="flex items-center space-x-6">
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : user ? (
              <>
                <Link
                  href="/visits/new"
                  className="text-sm text-foreground hover:text-primary transition-colors"
                >
                  Add Visit
                </Link>
                <button className="text-sm text-foreground hover:text-primary transition-colors">
                  Profile
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
                  className="text-sm"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/about"
                  className="text-sm text-foreground hover:text-primary transition-colors"
                >
                  About
                </Link>
                <Link
                  href="/auth/sign-in"
                  className="text-sm text-foreground hover:text-primary transition-colors"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}