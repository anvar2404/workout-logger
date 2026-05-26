'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/workouts', label: 'History' },
  { href: '/progress', label: 'Progress' },
]

export default function NavLinks() {
  const pathname = usePathname()
  return (
    <>
      {links.map(({ href, label }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className="font-data text-xs tracking-widest uppercase transition-colors"
            style={{ color: active ? 'var(--lime)' : 'var(--smoke)' }}
            onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = 'var(--iron)' }}
            onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = 'var(--smoke)' }}
          >
            {label}
          </Link>
        )
      })}
    </>
  )
}
