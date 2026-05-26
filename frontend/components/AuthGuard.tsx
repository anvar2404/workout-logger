'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-20" style={{ color: 'var(--smoke)' }}>
        <span
          className="spin inline-block w-4 h-4 rounded-full border-2"
          style={{ borderColor: 'var(--lime)', borderTopColor: 'transparent' }}
        />
        <span className="font-data text-xs tracking-widest uppercase">Loading</span>
      </div>
    )
  }

  if (!user) return null

  return <>{children}</>
}
