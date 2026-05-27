import type { Metadata } from 'next'
import { Bebas_Neue, JetBrains_Mono, DM_Sans } from 'next/font/google'
import { AuthProvider } from '@/lib/auth'
import BottomNav from '@/components/BottomNav'
import Sidebar from '@/components/Sidebar'
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
          {/* Desktop sidebar — hidden on mobile */}
          <div className="hidden md:block">
            <Sidebar />
          </div>

          {/* Main content */}
          <main
            style={{
              minHeight: '100vh',
              padding: '28px 20px',
            }}
            className="md:pl-[calc(var(--sidebar-w)+32px)] md:pr-8 md:py-8 max-w-[900px] md:max-w-none"
          >
            <div className="max-w-2xl mx-auto md:mx-0">
              {children}
            </div>
          </main>

          {/* Mobile bottom nav — hidden on desktop */}
          <div className="md:hidden">
            <BottomNav />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
