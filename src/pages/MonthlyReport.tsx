import { useState, useEffect, useCallback } from 'react'
import { CalendarDays, RefreshCw } from 'lucide-react'
import api from '../lib/api'
import { formatCurrency } from '../utils/format'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface MonthlyData {
  month: number
  year: number
  total_income: number
  total_expenses: number
  total_savings: number
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export default function MonthlyReport() {
  const [data, setData] = useState<MonthlyData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true)
    else setRefreshing(true)
    try {
      const res = await api.get('/transactions/monthly')
      setData(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (isLoading && data.length === 0) {
    return <div className="text-center py-10 text-slate-400">Cargando reporte mensual...</div>
  }

  const chartData = data.map(d => ({
    name: `${MONTHS[d.month - 1]} ${d.year}`,
    Ingresos: Number(d.total_income),
    Gastos: Number(d.total_expenses),
    Ahorro: Number(d.total_savings)
  }))

  const globalTotals = data.reduce((acc, curr) => {
    acc.income += Number(curr.total_income)
    acc.expenses += Number(curr.total_expenses)
    acc.savings += Number(curr.total_savings)
    return acc
  }, { income: 0, expenses: 0, savings: 0 })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <CalendarDays className="text-brand-400" /> Mes a mes
          </h2>
          <p className="text-slate-400 text-sm mt-1">Tu historial financiero detallado por meses</p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="btn-secondary flex items-center gap-2 text-sm"
          title="Actualizar datos"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{refreshing ? 'Actualizando...' : 'Actualizar'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5 border-l-4 border-l-brand-500">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Total Ingresos Histórico</p>
          <p className="text-2xl font-bold text-brand-400">{formatCurrency(globalTotals.income)}</p>
        </div>
        <div className="card p-5 border-l-4 border-l-red-500">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Total Gastos Histórico</p>
          <p className="text-2xl font-bold text-red-400">{formatCurrency(globalTotals.expenses)}</p>
        </div>
        <div className="card p-5 border-l-4 border-l-blue-500">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Total Ahorrado Histórico</p>
          <p className="text-2xl font-bold text-blue-400">{formatCurrency(globalTotals.savings)}</p>
        </div>
      </div>

      <div className="card p-6 min-h-[400px]">
        <h3 className="section-title mb-6">Gráfico Mensual</h3>
        {chartData.length > 0 ? (
          <div className="h-80 w-full min-h-[320px]">
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
        ) : (
          <div className="h-80 flex items-center justify-center text-slate-500">
            No hay datos suficientes para mostrar
          </div>
        )}
      </div>
    </div>
  )
}
