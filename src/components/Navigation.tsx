'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Plus, User, LogOut, Globe, MapPin, Search } from 'lucide-react'

export function Navigation() {
  const { user, loading, signOut } = useAuth()

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800/30 bg-slate-950/90 backdrop-blur-xl supports-[backdrop-filter]:bg-slate-950/75">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 via-blue-500 to-blue-600 shadow-lg shadow-blue-500/25">
                <Globe className="w-5 h-5 text-white drop-shadow-sm" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-sm"></div>
            </div>
            <Link 
              href="/" 
              className="flex flex-col"
            >
              <div className="text-xl font-bold bg-gradient-to-r from-slate-100 via-slate-200 to-slate-300 bg-clip-text text-transparent hover:from-sky-200 hover:via-blue-200 hover:to-cyan-200 transition-all duration-300 font-montserrat">
                Fieldnotes
              </div>
              <div className="text-xs text-slate-500 font-medium -mt-1 hidden lg:block">
                Travel mapping
              </div>
            </Link>
          </div>
          
          {/* Navigation Actions */}
          <div className="flex items-center space-x-2">
            {loading ? (
              <div className="flex items-center space-x-3 px-4 py-2 rounded-lg bg-slate-900/50">
                <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-slate-400">Loading...</span>
              </div>
            ) : user ? (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  asChild 
                  className="text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent hover:border-slate-700/50 transition-all duration-200"
                >
                  <Link href="/visits/new" className="flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add Visit</span>
                  </Link>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent hover:border-slate-700/50 transition-all duration-200"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline ml-2">Profile</span>
                </Button>
                
                <div className="w-px h-6 bg-slate-700/50"></div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
                  className="text-slate-400 hover:text-red-300 hover:bg-red-950/30 border border-transparent hover:border-red-900/30 transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline ml-2">Sign Out</span>
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  asChild 
                  className="text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent hover:border-slate-700/50 transition-all duration-200"
                >
                  <Link href="/about">About</Link>
                </Button>
                
                <Button 
                  variant="default" 
                  size="sm" 
                  asChild 
                  className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white border-0 shadow-lg shadow-sky-500/25 hover:shadow-sky-500/30 transition-all duration-200"
                >
                  <Link href="/auth/sign-in" className="font-medium">
                    Sign In
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Subtle bottom border gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent"></div>
    </nav>
  )
}