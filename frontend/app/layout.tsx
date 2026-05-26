import type { Metadata } from 'next'
import { Bebas_Neue, JetBrains_Mono, DM_Sans } from 'next/font/google'
import { AuthProvider } from '@/lib/auth'
import BottomNav from '@/components/BottomNav'
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
          <main className="max-w-lg mx-auto px-4 pt-6 pb-4">{children}</main>
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  )
}
