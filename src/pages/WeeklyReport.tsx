import { useState, useEffect, useCallback } from 'react'
import { BarChart2, RefreshCw } from 'lucide-react'
import api from '../lib/api'
import { formatCurrency } from '../utils/format'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface WeeklyData {
  id: string
  week_number: number
  year: number
  total_income: string
  total_expenses: string
  total_savings: string
  expected_savings: number
  status: 'on_track' | 'behind' | 'far_behind'
}

export default function WeeklyReport() {
  const [currentWeek, setCurrentWeek] = useState<WeeklyData | null>(null)
  const [history, setHistory] = useState<WeeklyData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true)
    else setRefreshing(true)
    try {
      const [currentRes, historyRes] = await Promise.all([
        api.get('/weekly/current'),
        api.get('/weekly')
      ])
      setCurrentWeek(currentRes.data.data)
      setHistory(historyRes.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchData()

    // Refetch when the user comes back to this tab (e.g. after deleting a transaction)
    const onFocus = () => fetchData(true)
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [fetchData])

  if (isLoading && history.length === 0 && !currentWeek) {
    return <div className="text-center py-10 text-slate-400">Cargando control semanal...</div>
  }

  // Format data for chart
  const chartData = [...history].reverse().map(h => ({
    name: `Sem ${h.week_number}`,
    Ingresos: Number(h.total_income),
    Gastos: Number(h.total_expenses),
    Ahorro: Number(h.total_savings)
  }))

  const c = currentWeek
  const currentSavings = Number(c?.total_savings || 0)
  const isGood = currentSavings >= (c?.expected_savings || 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <BarChart2 className="text-brand-400" /> Control Semanal
          </h2>
          <p className="text-slate-400 text-sm mt-1">Evalúa tu progreso en la semana actual</p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="btn-secondary flex items-center gap-2 text-sm"
          title="Actualizar datos"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {c && (
        <div className={`card p-6 border-l-4 ${isGood ? 'border-l-brand-500' : 'border-l-yellow-500'}`}>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="section-title">Semana {c.week_number}</h3>
              <p className="text-slate-400 text-sm">Estado actual</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              c.status === 'on_track' ? 'bg-brand-500/20 text-brand-400' :
              c.status === 'behind' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {c.status === 'on_track' ? 'Va por buen camino' :
               c.status === 'behind' ? 'Ligeramente atrasado' :
               'Atención requerida'}
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-surface-900/50 p-4 rounded-xl">
              <p className="text-xs text-slate-400 mb-1">Ingresos Registrados</p>
              <p className="text-lg font-semibold text-brand-400">{formatCurrency(c.total_income)}</p>
            </div>
            <div className="bg-surface-900/50 p-4 rounded-xl">
              <p className="text-xs text-slate-400 mb-1">Gastos Registrados</p>
              <p className="text-lg font-semibold text-red-400">{formatCurrency(c.total_expenses)}</p>
            </div>
            <div className="bg-surface-900/50 p-4 rounded-xl">
              <p className="text-xs text-slate-400 mb-1">Ahorro Realizado</p>
              <p className="text-lg font-semibold text-blue-400">{formatCurrency(c.total_savings)}</p>
            </div>
            <div className="bg-surface-900/50 p-4 rounded-xl border border-white/5">
              <p className="text-xs text-slate-400 mb-1">Ahorro Esperado</p>
              <p className="text-lg font-semibold text-slate-200">{formatCurrency(c.expected_savings || 0)}</p>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Progreso semanal de ahorro</span>
              <span>{Math.min(100, (currentSavings / Math.max(1, c.expected_savings || 1)) * 100).toFixed(0)}%</span>
            </div>
            <div className="progress-bar h-3">
              <div
                className={`progress-fill h-full`}
                style={{
                  width: `${Math.min(100, (currentSavings / Math.max(1, c.expected_savings || 1)) * 100)}%`,
                  background: isGood ? '#10b981' : '#f59e0b'
                }}
              />
            </div>
          </div>
        </div>
      )}

      {chartData.length > 0 && (
        <div className="card p-6">
          <h3 className="section-title mb-6">Historial Semanal</h3>
          <div className="h-72 w-full min-h-[288px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={v => v>=1000 ? `${(v/1000).toFixed(0)}k`: v} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px'}} />
                <Legend iconType="circle" />
                <Bar dataKey="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Ahorro" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
