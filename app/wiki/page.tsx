'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { WikiProvider } from '../../contexts/WikiContext'
import { WikiLayout } from '../../components/Wiki/WikiLayout'

export default function WikiPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  if (authLoading) return null
  if (!user) return null

  return (
    <WikiProvider>
      <WikiLayout />
    </WikiProvider>
  )
}
