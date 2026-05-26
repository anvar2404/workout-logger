import type { Metadata } from 'next'
import { Bebas_Neue, JetBrains_Mono, DM_Sans } from 'next/font/google'
import Link from 'next/link'
import { AuthProvider } from '@/lib/auth'
import NavLinks from '@/components/NavLinks'
import NavUser from '@/components/NavUser'
import './globals.css'

const bebas = Bebas_Neue({ weight: '400', subsets: ['latin'], variable: '--font-bebas' })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', weight: ['400', '500', '700'] })
const dm = DM_Sans({ subsets: ['latin'], variable: '--font-dm' })

export const metadata: Metadata = {
  title: 'IRONLOG',
  description: 'Track your gym progress',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bebas.variable} ${jetbrains.variable} ${dm.variable} h-full antialiased`}>
      <body>
        <AuthProvider>
          <header
            style={{
              borderBottom: '1px solid var(--edge)',
              background: 'rgba(8,10,8,0.88)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              position: 'sticky',
              top: 0,
              zIndex: 50,
            }}
          >
            <div className="max-w-4xl mx-auto px-6 h-14 flex items-center gap-7">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 shrink-0">
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--lime)', display: 'inline-block' }} />
                <span className="font-display text-xl tracking-wide" style={{ color: 'var(--iron)', lineHeight: 1 }}>
                  IRONLOG
                </span>
              </Link>

              {/* Nav links */}
              <nav className="flex items-center gap-6">
                <NavLinks />
              </nav>

              {/* Right side */}
              <div className="ml-auto flex items-center gap-3">
                <Link
                  href="/workouts/new"
                  className="btn-lime px-4 py-1.5 rounded text-sm"
                  style={{ fontSize: 14 }}
                >
                  + LOG SESSION
                </Link>
                <NavUser />
              </div>
            </div>
          </header>

          <main className="max-w-4xl mx-auto px-6 py-8">{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}
