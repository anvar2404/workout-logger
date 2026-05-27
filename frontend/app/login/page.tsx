'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try { await login(email, password) }
    catch { setError('Invalid email or password') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="anim-up" style={{ width: '100%', maxWidth: 360 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 52, height: 52, background: 'var(--accent)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M6 4v16M18 4v16M6 12h12M3 8h3M18 8h3M3 16h3M18 16h3" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h1 style={{ fontFamily: 'var(--font-bebas)', fontSize: 32, color: 'var(--text)', letterSpacing: '0.04em', lineHeight: 1, marginBottom: 4 }}>IRONLOG</h1>
          <p style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: 'var(--text-3)' }}>Your personal strength tracker</p>
        </div>

        <div className="card" style={{ padding: '28px 24px' }}>
          <h2 style={{ fontFamily: 'var(--font-dm)', fontWeight: 700, fontSize: 20, color: 'var(--text)', marginBottom: 20 }}>Sign in</h2>

          <form onSubmit={submit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontFamily: 'var(--font-dm)', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required style={{ width: '100%', borderRadius: 10, padding: '11px 14px', fontSize: 14 }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontFamily: 'var(--font-dm)', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required style={{ width: '100%', borderRadius: 10, padding: '11px 14px', fontSize: 14 }} />
            </div>
            {error && <p style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: 'var(--danger)', marginBottom: 14 }}>{error}</p>}
            <button type="submit" disabled={loading} className="btn-accent" style={{ width: '100%', padding: '13px', borderRadius: 11, fontSize: 15, cursor: 'pointer', border: 'none' }}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontFamily: 'var(--font-dm)', fontSize: 13, color: 'var(--text-3)' }}>
          No account?{' '}
          <Link href="/register" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Create one</Link>
        </p>
      </div>
    </div>
  )
}
