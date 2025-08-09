import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Avatar Livestream MVP',
  description: 'Real-time 3D avatars over LiveKit',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
