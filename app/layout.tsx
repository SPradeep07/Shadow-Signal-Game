import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Shadow Signal - Social Deduction Game',
  description: 'Realtime multiplayer social deduction game',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
