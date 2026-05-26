'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth'

export default function NavUser() {
  const { user, logout } = useAuth()

  if (!user) {
    return (
      <Link
        href="/login"
        className="font-data text-xs tracking-widest uppercase transition-colors"
        style={{ color: 'var(--smoke)' }}
      >
        LOGIN
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <span className="font-data text-xs" style={{ color: 'var(--smoke)' }}>
        {user.name || user.email.split('@')[0].toUpperCase()}
      </span>
      <button
        onClick={logout}
        className="font-data text-xs tracking-widest uppercase transition-colors"
        style={{ color: 'var(--smoke-2)' } as React.CSSProperties}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--smoke-2)')}
      >
        EXIT
      </button>
    </div>
  )
}
