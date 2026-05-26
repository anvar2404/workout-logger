'use client'

import { useEffect, useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts'
import api from '@/lib/api'
import { ProgressPoint, Workout } from '@/lib/types'
import AuthGuard from '@/components/AuthGuard'
import { estimate1RM } from '@/lib/utils'

type Tab = 'strength' | 'volume'

interface VolumePoint {
  date: string
  volume: number
}

function ProgressContent() {
  const [tab, setTab] = useState<Tab>('strength')
  const [exercises, setExercises] = useState<string[]>([])
  const [exercise, setExercise] = useState('')
  const [strengthData, setStrengthData] = useState<ProgressPoint[]>([])
  const [volumeData, setVolumeData] = useState<VolumePoint[]>([])
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

    const strengthReq = api.get(`/workouts/progress?exercise=${encodeURIComponent(exercise)}`)
    const volumeReq = api.get(`/workouts?limit=50`)

    Promise.all([strengthReq, volumeReq]).then(([sRes, vRes]) => {
      setStrengthData(sRes.data)
      // Build volume data from workouts
      const workouts: Workout[] = vRes.data.workouts ?? []
      const points: VolumePoint[] = workouts
        .filter((w) => w.exercises.some((ex) => ex.name === exercise))
        .map((w) => {
          const ex = w.exercises.find((e) => e.name === exercise)!
          const vol = ex.sets.reduce((s, set) => s + set.weight * set.reps, 0)
          return { date: w.date.split('T')[0], volume: vol }
        })
        .reverse()
      setVolumeData(points)
    }).finally(() => setLoading(false))
  }, [exercise])

  const first = strengthData[0]?.maxWeight ?? 0
  const last = strengthData[strengthData.length - 1]?.maxWeight ?? 0
  const gain = last - first
  const topRM = strengthData.length > 0
    ? Math.max(...strengthData.map((d) => estimate1RM(d.maxWeight, 5)))
    : 0
  const hasData = tab === 'strength' ? strengthData.length > 0 : volumeData.length > 0

  return (
    <div>
      {/* Header */}
      <div className="anim-up" style={{ marginBottom: 20 }}>
        <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--smoke)', textTransform: 'uppercase', marginBottom: 2 }}>
          Strength
        </p>
        <h1 style={{ fontFamily: 'var(--font-bebas)', fontSize: 42, color: 'var(--iron)', lineHeight: 0.95, letterSpacing: '0.02em' }}>
          PROGRESS
        </h1>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--card)', padding: 4, borderRadius: 12, border: '1px solid var(--edge)' }}>
        {([['strength', 'MAX WEIGHT'], ['volume', 'VOLUME']] as [Tab, string][]).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              fontFamily: 'var(--font-jetbrains)',
              fontSize: 11,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '9px',
              borderRadius: 9,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s',
              background: tab === t ? 'var(--lime)' : 'transparent',
              color: tab === t ? 'var(--void)' : 'var(--smoke)',
              fontWeight: tab === t ? 700 : 400,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Exercise pills */}
      {loadingExercises ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, color: 'var(--smoke)' }}>
          <span className="spin" style={{ display: 'inline-block', width: 14, height: 14, borderRadius: '50%', border: '2px solid var(--lime)', borderTopColor: 'transparent' }} />
          <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Loading</span>
        </div>
      ) : exercises.length === 0 ? (
        <div className="anim-in" style={{ paddingTop: 60, textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-bebas)', fontSize: 52, color: 'var(--edge-2)' }}>NO DATA</p>
          <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 12, color: 'var(--smoke)' }}>Log some sessions first</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }} className="anim-up">
          {exercises.map((name) => {
            const active = name === exercise
            return (
              <button
                key={name}
                onClick={() => setExercise(name)}
                style={{
                  fontFamily: 'var(--font-jetbrains)',
                  fontSize: 10,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  padding: '6px 12px',
                  borderRadius: 999,
                  border: `1px solid ${active ? 'var(--lime)' : 'var(--edge-2)'}`,
                  background: active ? 'var(--lime)' : 'var(--card)',
                  color: active ? 'var(--void)' : 'var(--smoke)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {name}
              </button>
            )
          })}
        </div>
      )}

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '30px 0', color: 'var(--smoke)' }}>
          <span className="spin" style={{ display: 'inline-block', width: 14, height: 14, borderRadius: '50%', border: '2px solid var(--lime)', borderTopColor: 'transparent' }} />
          <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Loading</span>
        </div>
      )}

      {!loading && !hasData && exercises.length > 0 && (
        <div className="anim-in" style={{ paddingTop: 40, textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-bebas)', fontSize: 52, color: 'var(--edge-2)' }}>NO DATA</p>
          <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 12, color: 'var(--smoke)' }}>
            Log {exercise} to see progress
          </p>
        </div>
      )}

      {!loading && hasData && (
        <div className="anim-in">
          {/* Stat cards — strength tab only */}
          {tab === 'strength' && strengthData.length >= 2 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
              {[
                { label: 'STARTED', value: first, color: 'var(--iron)', suffix: 'kg' },
                { label: 'CURRENT', value: last, color: 'var(--lime)', suffix: 'kg' },
                { label: 'GAINED', value: gain, color: gain >= 0 ? 'var(--lime)' : 'var(--danger)', suffix: 'kg', prefix: gain >= 0 ? '+' : '' },
              ].map(({ label, value, color, suffix, prefix = '' }) => (
                <div
                  key={label}
                  style={{ background: 'var(--card)', border: '1px solid var(--edge)', borderRadius: 12, padding: '12px 10px', textAlign: 'center' }}
                >
                  <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 8, letterSpacing: '0.1em', color: 'var(--smoke)', textTransform: 'uppercase', marginBottom: 6 }}>
                    {label}
                  </p>
                  <p style={{ fontFamily: 'var(--font-bebas)', fontSize: 28, color, lineHeight: 1 }}>
                    {prefix}{value}
                    <span style={{ fontSize: 12, color: 'var(--smoke)', marginLeft: 2, fontFamily: 'var(--font-jetbrains)' }}>{suffix}</span>
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Est 1RM */}
          {tab === 'strength' && topRM > 0 && (
            <div
              style={{
                background: 'rgba(201,255,71,0.05)',
                border: '1px solid rgba(201,255,71,0.15)',
                borderRadius: 12,
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 10, letterSpacing: '0.08em', color: 'var(--smoke)', textTransform: 'uppercase' }}>
                Est. 1RM (Epley)
              </span>
              <span style={{ fontFamily: 'var(--font-bebas)', fontSize: 28, color: 'var(--lime)', lineHeight: 1 }}>
                ~{topRM}<span style={{ fontSize: 14, color: 'var(--smoke)', marginLeft: 3, fontFamily: 'var(--font-jetbrains)' }}>kg</span>
              </span>
            </div>
          )}

          {/* Chart */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--edge)', borderRadius: 14, padding: '16px 12px' }}>
            <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 9, letterSpacing: '0.1em', color: 'var(--smoke)', textTransform: 'uppercase', marginBottom: 16 }}>
              {tab === 'strength' ? 'Max weight over time' : 'Volume (kg×reps) over time'}
            </p>
            <ResponsiveContainer width="100%" height={240}>
              {tab === 'strength' ? (
                <AreaChart data={strengthData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="limeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C9FF47" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#C9FF47" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--edge)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: 'var(--smoke)', fontSize: 9, fontFamily: 'var(--font-jetbrains)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--smoke)', fontSize: 9, fontFamily: 'var(--font-jetbrains)' }} axisLine={false} tickLine={false} unit="kg" />
                  <Tooltip
                    contentStyle={{ background: 'var(--card-2)', border: '1px solid var(--lime)', borderRadius: 8, fontFamily: 'var(--font-jetbrains)' }}
                    labelStyle={{ color: 'var(--smoke)', fontSize: 9 }}
                    itemStyle={{ color: 'var(--lime)', fontSize: 14, fontWeight: 700 }}
                    formatter={(val) => [`${val ?? ''} kg`, '']}
                  />
                  <Area type="monotone" dataKey="maxWeight" stroke="#C9FF47" strokeWidth={2} fill="url(#limeGrad)" dot={{ fill: '#C9FF47', r: 3, strokeWidth: 0 }} activeDot={{ fill: '#C9FF47', r: 5, strokeWidth: 2, stroke: 'var(--void)' }} />
                </AreaChart>
              ) : (
                <BarChart data={volumeData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--edge)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: 'var(--smoke)', fontSize: 9, fontFamily: 'var(--font-jetbrains)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--smoke)', fontSize: 9, fontFamily: 'var(--font-jetbrains)' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'var(--card-2)', border: '1px solid var(--amber)', borderRadius: 8, fontFamily: 'var(--font-jetbrains)' }}
                    labelStyle={{ color: 'var(--smoke)', fontSize: 9 }}
                    itemStyle={{ color: 'var(--amber)', fontSize: 14, fontWeight: 700 }}
                    formatter={(val) => [`${val ?? ''} kg·reps`, '']}
                  />
                  <Bar dataKey="volume" fill="var(--amber)" radius={[4, 4, 0, 0]} opacity={0.8} />
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
