import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '../contexts/AuthContext'
import Navbar from '../components/NavBar'

export const metadata: Metadata = {
  title: 'TTRPG Colab Builder',
  description: 'Collaborative worldbuilding and session management for West Marches TTRPG campaigns',
}

export default function RootLayout({
  children,
}: {
  children:  React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}