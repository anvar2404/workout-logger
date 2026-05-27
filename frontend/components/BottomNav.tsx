'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth'

const TABS = [
  {
    href: '/',
    label: 'Home',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'var(--accent-light)' : 'none'}>
        <path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z" stroke={active ? 'var(--accent)' : 'var(--text-3)'} strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '/workouts/new',
    label: 'Workout',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke={active ? 'var(--accent)' : 'var(--text-3)'} strokeWidth="1.8" />
        <path d="M12 8V16M8 12H16" stroke={active ? 'var(--accent)' : 'var(--text-3)'} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/workouts',
    label: 'History',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="17" rx="2" stroke={active ? 'var(--accent)' : 'var(--text-3)'} strokeWidth="1.8" />
        <path d="M7 9H17M7 13H13M7 17H10" stroke={active ? 'var(--accent)' : 'var(--text-3)'} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M8 2V6M16 2V6" stroke={active ? 'var(--accent)' : 'var(--text-3)'} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/progress',
    label: 'Progress',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <polyline points="3,17 8,11 12,14 17,7 21,9" stroke={active ? 'var(--accent)' : 'var(--text-3)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 21H21" stroke={active ? 'var(--accent)' : 'var(--text-3)'} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'var(--bottom-nav-h)',
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'stretch',
      }}
    >
      {TABS.map(({ href, label, icon }) => {
        const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              textDecoration: 'none',
            }}
          >
            {icon(active)}
            <span style={{ fontFamily: 'var(--font-dm)', fontSize: 10, fontWeight: active ? 600 : 400, color: active ? 'var(--accent)' : 'var(--text-3)', transition: 'color 0.15s' }}>
              {label}
            </span>
          </Link>
        )
      })}

      {/* Auth tab */}
      {user ? (
        <button
          onClick={logout}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" stroke="var(--text-3)" strokeWidth="1.8" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="var(--text-3)" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <span style={{ fontFamily: 'var(--font-dm)', fontSize: 10, color: 'var(--text-3)' }}>Exit</span>
        </button>
      ) : (
        <Link href="/login" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, textDecoration: 'none' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontFamily: 'var(--font-dm)', fontSize: 10, fontWeight: 600, color: 'var(--accent)' }}>Login</span>
        </Link>
      )}
    </nav>
  )
}
