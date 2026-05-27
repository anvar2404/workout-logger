'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth'

const NAV = [
  {
    href: '/',
    label: 'Home',
    icon: (active: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? 'var(--accent)' : 'none'}>
        <path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z" stroke={active ? 'var(--accent)' : 'var(--text-3)'} strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '/workouts/new',
    label: 'Start Workout',
    icon: (active: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke={active ? 'var(--accent)' : 'var(--text-3)'} strokeWidth="1.8" />
        <path d="M12 8V16M8 12H16" stroke={active ? 'var(--accent)' : 'var(--text-3)'} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/workouts',
    label: 'History',
    icon: (active: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
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
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <polyline points="3,17 8,11 12,14 17,7 21,9" stroke={active ? 'var(--accent)' : 'var(--text-3)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 21H21" stroke={active ? 'var(--accent)' : 'var(--text-3)'} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <aside
      style={{
        width: 'var(--sidebar-w)',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 40,
      }}
    >
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border)' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: 'var(--accent)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16M4 12h10M4 18h7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <span style={{ fontFamily: 'var(--font-bebas)', fontSize: 22, color: 'var(--text)', letterSpacing: '0.04em', lineHeight: 1 }}>
            IRONLOG
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(({ href, label, icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                borderRadius: 10,
                textDecoration: 'none',
                background: active ? 'var(--accent-light)' : 'transparent',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--surface-2, #F0F3EE)' }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}
            >
              {icon(active)}
              <span
                style={{
                  fontFamily: 'var(--font-dm)',
                  fontSize: 14,
                  fontWeight: active ? 600 : 400,
                  color: active ? 'var(--accent)' : 'var(--text-2)',
                  transition: 'color 0.15s',
                }}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: 'var(--accent-dim)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-dm)',
                fontWeight: 700,
                fontSize: 13,
                color: 'var(--accent)',
                flexShrink: 0,
              }}
            >
              {(user.name || user.email)[0].toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: 'var(--font-dm)', fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name || user.email.split('@')[0]}
              </p>
            </div>
            <button
              onClick={logout}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 4,
                color: 'var(--text-3)',
                transition: 'color 0.15s',
              }}
              title="Sign out"
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-3)')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: 'var(--font-dm)',
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--accent)',
              textDecoration: 'none',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Sign in
          </Link>
        )}
      </div>
    </aside>
  )
}
