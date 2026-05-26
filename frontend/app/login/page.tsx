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
    try {
      await login(email, password)
    } catch {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-sm anim-up">
        {/* Logo mark */}
        <div className="text-center mb-10">
          <p className="font-display text-5xl mb-1" style={{ color: 'var(--iron)' }}>IRONLOG</p>
          <p className="font-data text-xs tracking-widest uppercase" style={{ color: 'var(--smoke)' }}>
            Performance Tracker
          </p>
        </div>

        <div
          className="rounded-2xl p-8"
          style={{ background: 'var(--card)', border: '1px solid var(--edge)' }}
        >
          <p className="font-display text-2xl mb-6" style={{ color: 'var(--iron)' }}>SIGN IN</p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="font-data text-xs tracking-widest uppercase block mb-2" style={{ color: 'var(--smoke)' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-lg px-4 py-3 text-sm"
              />
            </div>

            <div>
              <label className="font-data text-xs tracking-widest uppercase block mb-2" style={{ color: 'var(--smoke)' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-lg px-4 py-3 text-sm"
              />
            </div>

            {error && (
              <p className="font-data text-xs" style={{ color: 'var(--danger)' }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-lime py-3.5 rounded-lg text-base mt-2"
            >
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 font-data text-xs" style={{ color: 'var(--smoke)' }}>
          No account?{' '}
          <Link
            href="/register"
            className="transition-colors"
            style={{ color: 'var(--lime)' } as React.CSSProperties}
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
