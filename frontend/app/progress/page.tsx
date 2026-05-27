'use client'

import { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import api from '@/lib/api'
import { ProgressPoint, Workout } from '@/lib/types'
import AuthGuard from '@/components/AuthGuard'
import { estimate1RM } from '@/lib/utils'

type Tab = 'strength' | 'volume'

function ProgressContent() {
  const [tab, setTab] = useState<Tab>('strength')
  const [exercises, setExercises] = useState<string[]>([])
  const [exercise, setExercise] = useState('')
  const [strengthData, setStrengthData] = useState<ProgressPoint[]>([])
  const [volumeData, setVolumeData] = useState<{ date: string; volume: number }[]>([])
  const [loadingExercises, setLoadingExercises] = useState(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/workouts/exercises').then((r) => {
      setExercises(r.data)
      if (r.data.length > 0) setExercise(r.data[0])
    }).finally(() => setLoadingExercises(false))
  }, [])

  useEffect(() => {
    if (!exercise) return
    setLoading(true)
    Promise.all([
      api.get(`/workouts/progress?exercise=${encodeURIComponent(exercise)}`),
      api.get('/workouts?limit=50'),
    ]).then(([sRes, vRes]) => {
      setStrengthData(sRes.data)
      const workouts: Workout[] = vRes.data.workouts ?? []
      const pts = workouts
        .filter((w) => w.exercises.some((ex) => ex.name === exercise))
        .map((w) => {
          const ex = w.exercises.find((e) => e.name === exercise)!
          return { date: w.date.split('T')[0], volume: ex.sets.reduce((s, set) => s + set.weight * set.reps, 0) }
        }).reverse()
      setVolumeData(pts)
    }).finally(() => setLoading(false))
  }, [exercise])

  const first = strengthData[0]?.maxWeight ?? 0
  const last = strengthData[strengthData.length - 1]?.maxWeight ?? 0
  const gain = last - first
  const topRM = strengthData.length > 0 ? Math.max(...strengthData.map((d) => estimate1RM(d.maxWeight, 5))) : 0
  const hasData = tab === 'strength' ? strengthData.length > 0 : volumeData.length > 0

  return (
    <div>
      {/* Header */}
      <div className="anim-up" style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-dm)', fontWeight: 800, fontSize: 26, color: 'var(--text)', margin: 0 }}>Progress</h1>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--border)', padding: 3, borderRadius: 11 }}>
        {([['strength', 'Max Weight'], ['volume', 'Volume']] as [Tab, string][]).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, fontFamily: 'var(--font-dm)', fontSize: 13, fontWeight: tab === t ? 600 : 400, padding: '8px', borderRadius: 9, border: 'none', cursor: 'pointer', transition: 'all 0.15s', background: tab === t ? 'var(--surface)' : 'transparent', color: tab === t ? 'var(--text)' : 'var(--text-3)', boxShadow: tab === t ? 'var(--shadow-sm)' : 'none' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Exercise pills */}
      {loadingExercises ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <span className="spin" style={{ display: 'inline-block', width: 14, height: 14, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent' }} />
          <span style={{ fontFamily: 'var(--font-dm)', fontSize: 12, color: 'var(--text-3)' }}>Loading...</span>
        </div>
      ) : exercises.length === 0 ? (
        <div className="anim-in" style={{ paddingTop: 60, textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-dm)', fontWeight: 700, fontSize: 18, color: 'var(--text)', marginBottom: 8 }}>No data yet</p>
          <p style={{ fontFamily: 'var(--font-dm)', fontSize: 14, color: 'var(--text-2)' }}>Log some sessions first to see progress</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
          {exercises.map((name) => {
            const active = name === exercise
            return (
              <button key={name} onClick={() => setExercise(name)} style={{ fontFamily: 'var(--font-dm)', fontSize: 12, fontWeight: active ? 600 : 400, padding: '6px 14px', borderRadius: 999, border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border)'}`, background: active ? 'var(--accent)' : 'var(--surface)', color: active ? '#fff' : 'var(--text-2)', cursor: 'pointer', transition: 'all 0.15s', boxShadow: active ? '0 2px 8px rgba(37,99,235,0.2)' : 'none' }}>
                {name}
              </button>
            )
          })}
        </div>
      )}

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '30px 0' }}>
          <span className="spin" style={{ display: 'inline-block', width: 14, height: 14, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent' }} />
          <span style={{ fontFamily: 'var(--font-dm)', fontSize: 12, color: 'var(--text-3)' }}>Loading...</span>
        </div>
      )}

      {!loading && !hasData && exercises.length > 0 && (
        <div className="anim-in" style={{ paddingTop: 40, textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-dm)', fontWeight: 700, fontSize: 16, color: 'var(--text)', marginBottom: 6 }}>No data for {exercise}</p>
          <p style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: 'var(--text-3)' }}>Log a session with this exercise</p>
        </div>
      )}

      {!loading && hasData && (
        <div className="anim-in">
          {/* Stat cards — strength only */}
          {tab === 'strength' && strengthData.length >= 2 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
              {[
                { label: 'Started', value: first, color: 'var(--text)', suffix: 'kg' },
                { label: 'Current', value: last, color: 'var(--accent)', suffix: 'kg' },
                { label: 'Gained', value: gain, color: gain >= 0 ? 'var(--success)' : 'var(--danger)', suffix: 'kg', prefix: gain >= 0 ? '+' : '' },
              ].map(({ label, value, color, suffix, prefix = '' }) => (
                <div key={label} className="card" style={{ padding: '12px', textAlign: 'center' }}>
                  <p style={{ fontFamily: 'var(--font-dm)', fontSize: 10, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</p>
                  <p style={{ fontFamily: 'var(--font-jetbrains)', fontWeight: 700, fontSize: 22, color, lineHeight: 1 }}>
                    {prefix}{value}<span style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 2, fontWeight: 400 }}>{suffix}</span>
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* 1RM */}
          {tab === 'strength' && topRM > 0 && (
            <div className="card" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderLeft: '3px solid var(--accent)' }}>
              <span style={{ fontFamily: 'var(--font-dm)', fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>Estimated 1RM (Epley)</span>
              <span style={{ fontFamily: 'var(--font-jetbrains)', fontWeight: 700, fontSize: 22, color: 'var(--accent)' }}>
                ~{topRM}<span style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 400, marginLeft: 2 }}>kg</span>
              </span>
            </div>
          )}

          {/* Chart */}
          <div className="card" style={{ padding: '16px' }}>
            <p style={{ fontFamily: 'var(--font-dm)', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 16 }}>
              {tab === 'strength' ? 'Max weight over time' : 'Volume over time'}
            </p>
            <ResponsiveContainer width="100%" height={220}>
              {tab === 'strength' ? (
                <AreaChart data={strengthData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563EB" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: 'var(--text-3)', fontSize: 10, fontFamily: 'var(--font-jetbrains)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-3)', fontSize: 10, fontFamily: 'var(--font-jetbrains)' }} axisLine={false} tickLine={false} unit="kg" />
                  <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, fontFamily: 'var(--font-dm)', boxShadow: 'var(--shadow-md)' }} labelStyle={{ color: 'var(--text-3)', fontSize: 11 }} itemStyle={{ color: 'var(--accent)', fontSize: 14, fontWeight: 700 }} formatter={(val) => [`${val ?? ''} kg`, '']} />
                  <Area type="monotone" dataKey="maxWeight" stroke="#2563EB" strokeWidth={2} fill="url(#blueGrad)" dot={{ fill: '#2563EB', r: 3, strokeWidth: 0 }} activeDot={{ fill: '#2563EB', r: 5, strokeWidth: 2, stroke: '#fff' }} />
                </AreaChart>
              ) : (
                <BarChart data={volumeData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: 'var(--text-3)', fontSize: 10, fontFamily: 'var(--font-jetbrains)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-3)', fontSize: 10, fontFamily: 'var(--font-jetbrains)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, fontFamily: 'var(--font-dm)', boxShadow: 'var(--shadow-md)' }} labelStyle={{ color: 'var(--text-3)', fontSize: 11 }} itemStyle={{ color: 'var(--amber)', fontSize: 14, fontWeight: 700 }} formatter={(val) => [`${val ?? ''} kg·reps`, '']} />
                  <Bar dataKey="volume" fill="var(--accent)" radius={[4, 4, 0, 0]} opacity={0.75} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Progress() {
  return <AuthGuard><ProgressContent /></AuthGuard>
}
