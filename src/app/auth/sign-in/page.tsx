'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setMessage(error.message)
      } else {
        setMessage('Check your email for a magic link!')
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground">Welcome to Fieldnotes</h2>
          <p className="mt-2 text-muted-foreground">
            Sign in to start mapping your travels
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSignIn}>
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="relative block w-full px-3 py-2 border border-border rounded-md placeholder-muted-foreground text-foreground bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <Button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4"
            >
              {isLoading ? 'Sending...' : 'Send Magic Link'}
            </Button>
          </div>

          {message && (
            <div className={`text-center text-sm ${message.includes('Check') ? 'text-primary' : 'text-red-500'}`}>
              {message}
            </div>
          )}
        </form>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            No password required. We'll send you a secure link to sign in.
          </p>
        </div>
      </div>
    </div>
  )
}