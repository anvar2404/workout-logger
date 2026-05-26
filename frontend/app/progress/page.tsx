'use client'

import { useEffect, useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import api from '@/lib/api'
import { ProgressPoint } from '@/lib/types'
import AuthGuard from '@/components/AuthGuard'

function ProgressContent() {
  const [exercises, setExercises] = useState<string[]>([])
  const [exercise, setExercise] = useState('')
  const [data, setData] = useState<ProgressPoint[]>([])
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
    api
      .get(`/workouts/progress?exercise=${encodeURIComponent(exercise)}`)
      .then((r) => setData(r.data))
      .finally(() => setLoading(false))
  }, [exercise])

  const first = data[0]?.maxWeight ?? 0
  const last = data[data.length - 1]?.maxWeight ?? 0
  const gain = last - first
  const hasData = data.length > 0

  return (
    <div>
      {/* Header */}
      <div className="mb-8 anim-up">
        <p className="font-data text-xs tracking-widest uppercase mb-1" style={{ color: 'var(--smoke)' }}>
          Strength
        </p>
        <h1 className="font-display text-4xl leading-none" style={{ color: 'var(--iron)' }}>
          PROGRESS
        </h1>
      </div>

      {/* Exercise pills */}
      {loadingExercises ? (
        <div className="flex items-center gap-3 mb-8" style={{ color: 'var(--smoke)' }}>
          <span className="spin inline-block w-4 h-4 rounded-full border-2" style={{ borderColor: 'var(--lime)', borderTopColor: 'transparent' }} />
          <span className="font-data text-xs tracking-widest uppercase">Loading</span>
        </div>
      ) : exercises.length === 0 ? (
        <div className="py-24 text-center anim-in">
          <p className="font-display text-5xl mb-2" style={{ color: 'var(--edge-2)' }}>NO DATA</p>
          <p className="text-sm" style={{ color: 'var(--smoke)' }}>Log some sessions first to see progress</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 mb-8 anim-up" style={{ animationDelay: '40ms' }}>
          {exercises.map((name) => {
            const active = name === exercise
            return (
              <button
                key={name}
                onClick={() => setExercise(name)}
                className="font-data text-xs tracking-wider uppercase px-3 py-1.5 rounded-full transition-all"
                style={{
                  background: active ? 'var(--lime)' : 'var(--card)',
                  color: active ? 'var(--void)' : 'var(--smoke)',
                  border: `1px solid ${active ? 'var(--lime)' : 'var(--edge-2)'}`,
                }}
              >
                {name}
              </button>
            )
          })}
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-3 py-10" style={{ color: 'var(--smoke)' }}>
          <span className="spin inline-block w-4 h-4 rounded-full border-2" style={{ borderColor: 'var(--lime)', borderTopColor: 'transparent' }} />
          <span className="font-data text-xs tracking-widest uppercase">Loading</span>
        </div>
      )}

      {!loading && !hasData && (
        <div className="py-20 text-center anim-in">
          <p className="font-display text-5xl mb-2" style={{ color: 'var(--edge-2)' }}>NO DATA</p>
          <p className="text-sm" style={{ color: 'var(--smoke)' }}>
            Log a session with {exercise} to see progress
          </p>
        </div>
      )}

      {!loading && hasData && (
        <div className="anim-in">
          {/* Stat cards */}
          {data.length >= 2 && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'STARTED', value: first, color: 'var(--iron)' },
                { label: 'CURRENT', value: last, color: 'var(--lime)' },
                {
                  label: 'GAINED',
                  value: gain,
                  color: gain >= 0 ? 'var(--lime)' : 'var(--danger)',
                  prefix: gain >= 0 ? '+' : '',
                },
              ].map(({ label, value, color, prefix = '' }) => (
                <div
                  key={label}
                  className="rounded-xl p-4 text-center"
                  style={{ background: 'var(--card)', border: '1px solid var(--edge)' }}
                >
                  <p className="font-data text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--smoke)' }}>
                    {label}
                  </p>
                  <p className="font-data text-3xl font-bold leading-none" style={{ color }}>
                    {prefix}{value}
                    <span className="text-sm font-normal ml-1" style={{ color: 'var(--smoke)' }}>kg</span>
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Chart */}
          <div
            className="rounded-xl p-6"
            style={{ background: 'var(--card)', border: '1px solid var(--edge)' }}
          >
            <p className="font-data text-xs tracking-widest uppercase mb-6" style={{ color: 'var(--smoke)' }}>
              Max weight over time
            </p>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={data} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="limeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C9FF47" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#C9FF47" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--edge)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'var(--smoke)', fontSize: 10, fontFamily: 'var(--font-jetbrains)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--smoke)', fontSize: 10, fontFamily: 'var(--font-jetbrains)' }}
                  axisLine={false}
                  tickLine={false}
                  unit="kg"
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--card-2)',
                    border: '1px solid var(--lime)',
                    borderRadius: 8,
                    fontFamily: 'var(--font-jetbrains)',
                  }}
                  labelStyle={{ color: 'var(--smoke)', fontSize: 10 }}
                  itemStyle={{ color: 'var(--lime)', fontSize: 14, fontWeight: 700 }}
                  formatter={(val) => [`${val ?? ''} kg`, '']}
                />
                <Area
                  type="monotone"
                  dataKey="maxWeight"
                  stroke="#C9FF47"
                  strokeWidth={2}
                  fill="url(#limeGrad)"
                  dot={{ fill: '#C9FF47', r: 3, strokeWidth: 0 }}
                  activeDot={{ fill: '#C9FF47', r: 5, strokeWidth: 2, stroke: 'var(--void)' }}
                />
              </AreaChart>
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
