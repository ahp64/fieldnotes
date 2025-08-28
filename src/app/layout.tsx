import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Fieldnotes',
  description: 'A map-based, personalized travelogue with social features',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-primary">Fieldnotes</h1>
              </div>
              <div className="flex items-center space-x-6">
                <a
                  href="/about"
                  className="text-sm text-foreground hover:text-primary transition-colors"
                >
                  About
                </a>
                <a
                  href="/auth/sign-in"
                  className="text-sm text-foreground hover:text-primary transition-colors"
                >
                  Sign In
                </a>
              </div>
            </div>
          </div>
        </nav>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}