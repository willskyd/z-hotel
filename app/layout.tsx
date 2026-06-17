import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Zinuel-ch Hotel | Enterprise Property Management System',
  description: 'Premium hotel property management system for efficient operations, reservations, and guest management',
  generator: 'v0.app',
  metadataBase: new URL('https://zinuel-ch.hotel'),
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'Zinuel-ch Hotel PMS',
    description: 'Enterprise-grade hotel management solution',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 200,
        height: 200,
        alt: 'Zinuel-ch Hotel',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="font-sans antialiased bg-background">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
