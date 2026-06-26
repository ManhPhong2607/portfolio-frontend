// app/layout.tsx 
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from 'next-themes'
import { QueryProvider } from '@/components/providers/query-provider'
import { RegisterServiceWorker } from '@/components/pwa/register-sw'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: 'Portfolio | Full-Stack Developer',
  description: 'Personal portfolio showcasing projects, skills, and experience.',
  manifest: '/manifest.json',
  themeColor: '#0f0f0f',
  appleWebApp: {
    capable: true,
    title: 'Portfolio',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/apple-touch-icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <QueryProvider>
            {children}
            <Toaster richColors position="top-right" />
          </QueryProvider>
        </ThemeProvider>
        <RegisterServiceWorker />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}