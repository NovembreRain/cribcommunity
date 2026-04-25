import type { Metadata } from 'next'
import { Outfit, Playfair_Display } from 'next/font/google'
import { AdminSidebar } from '@/components/AdminSidebar'
import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Admin — Crib Community',
    template: '%s | Crib Admin',
  },
  description: 'Crib Community admin dashboard',
  robots: { index: false, follow: false },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`dark ${outfit.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background-dark text-text-high font-sans antialiased">
        <div className="flex min-h-screen">
          <AdminSidebar />
          <main className="flex-1 min-w-0 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
