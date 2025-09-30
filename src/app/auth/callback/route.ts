import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server-client'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_failed`)
    }

    if (user) {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!existingProfile) {
        const username = user.email?.split('@')[0] || `user_${user.id.slice(0, 8)}`

        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            username: username,
            display_name: user.email?.split('@')[0],
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
        }
      }
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}/`)
}