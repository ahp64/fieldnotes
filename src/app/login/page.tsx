'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      setMessage('Check your email for the magic link!')
    } catch (error: any) {
      setMessage(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b1021]">
      <div className="max-w-md w-full space-y-8 p-8 bg-[#1a1f35] rounded-lg shadow-xl">
        <div>
          <h2 className="text-3xl font-bold text-center text-[#e4e4e7]">
            Welcome to Fieldnotes
          </h2>
          <p className="mt-2 text-center text-zinc-400">
            Sign in with your email to continue
          </p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none relative block w-full px-3 py-3 border border-zinc-700 placeholder-zinc-500 text-[#e4e4e7] bg-[#0b1021] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7dd3fc] focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-[#0b1021] bg-[#7dd3fc] hover:bg-[#5fc3fc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7dd3fc] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Sending magic link...' : 'Send magic link'}
          </button>

          {message && (
            <div className={`text-center text-sm ${message.includes('error') || message.includes('An error') ? 'text-red-400' : 'text-[#7dd3fc]'}`}>
              {message}
            </div>
          )}
        </form>

        <div className="text-center text-sm text-zinc-500">
          No password needed. We'll send you a magic link to sign in.
        </div>
      </div>
    </div>
  )
}