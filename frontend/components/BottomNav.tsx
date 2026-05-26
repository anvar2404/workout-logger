'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth'

const TABS = [
  {
    href: '/',
    label: 'HOME',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z"
          stroke={active ? '#C9FF47' : '#566356'}
          strokeWidth="1.5"
          strokeLinejoin="round"
          fill={active ? 'rgba(201,255,71,0.1)' : 'none'}
        />
      </svg>
    ),
  },
  {
    href: '/workouts/new',
    label: 'WORKOUT',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke={active ? '#C9FF47' : '#566356'} strokeWidth="1.5" fill={active ? 'rgba(201,255,71,0.1)' : 'none'} />
        <path d="M12 8V16M8 12H16" stroke={active ? '#C9FF47' : '#566356'} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/workouts',
    label: 'HISTORY',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="17" rx="2" stroke={active ? '#C9FF47' : '#566356'} strokeWidth="1.5" fill={active ? 'rgba(201,255,71,0.1)' : 'none'} />
        <path d="M7 9H17M7 13H13M7 17H10" stroke={active ? '#C9FF47' : '#566356'} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M8 2V6M16 2V6" stroke={active ? '#C9FF47' : '#566356'} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/progress',
    label: 'PROGRESS',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <polyline
          points="3,17 8,11 12,14 17,7 21,9"
          stroke={active ? '#C9FF47' : '#566356'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path d="M3 21H21" stroke={active ? '#C9FF47' : '#566356'} strokeWidth="1.5" strokeLinecap="round" />
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
        background: 'rgba(8,10,8,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--edge)',
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
            <span style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: 9, letterSpacing: '0.08em', color: active ? 'var(--lime)' : 'var(--smoke)', transition: 'color 0.15s' }}>
              {label}
            </span>
          </Link>
        )
      })}

      {/* Auth tab */}
      {user ? (
        <button
          onClick={logout}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" stroke="var(--smoke)" strokeWidth="1.5" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="var(--smoke)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: 9, letterSpacing: '0.08em', color: 'var(--smoke)' }}>
            EXIT
          </span>
        </button>
      ) : (
        <Link
          href="/login"
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
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" stroke="var(--lime)" strokeWidth="1.5" strokeLinecap="round" />
            <polyline points="10,17 15,12 10,7" stroke="var(--lime)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="15" y1="12" x2="3" y2="12" stroke="var(--lime)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: 9, letterSpacing: '0.08em', color: 'var(--lime)' }}>
            LOGIN
          </span>
        </Link>
      )}
    </nav>
  )
}
