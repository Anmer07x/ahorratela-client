import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp, TrendingDown, PiggyBank, Target,
  ArrowRight, Plus, Lightbulb, User as UserIcon, CalendarClock, Wallet
} from 'lucide-react'
import { getRandomTip } from '../utils/tips'
import { useAuthStore } from '../store/authStore'
import { useGoalsStore } from '../store/goalsStore'
import { useTransactionsStore } from '../store/transactionsStore'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

const formatCurrency = (n: number | string) => {
  const num = typeof n === 'string' ? parseFloat(n) : n
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(num || 0)
}

// Custom chart tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="card px-4 py-3 text-xs space-y-1">
        <p className="text-slate-400">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }} className="font-medium">
            {p.name}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

const ProjectionBadge = () => (
  <span className="ml-2 px-1.5 py-0.5 bg-yellow-500/20 text-yellow-500 text-[9px] font-bold uppercase tracking-tighter rounded-md border border-yellow-500/20">
    Proyectado
  </span>
)

export default function Dashboard() {
  const { user } = useAuthStore()
  const { goals, fetchGoals, isLoading: goalsLoading } = useGoalsStore()
  const { transactions, summary, fetchTransactions, fetchSummary } = useTransactionsStore()

  // Fix: Memoize tip to prevent flicker on re-renders
  const dailyTip = useMemo(() => getRandomTip(), [])

  const [showProjected, setShowProjected] = useState(false)

  useEffect(() => {
    fetchGoals()
    fetchTransactions({ limit: 10 })
    fetchSummary()
  }, [])

  const activeGoals = goals.filter(g => g.status === 'active')
  const chartData = [...transactions]
    .slice(0, 14)
    .reverse()
    .map(t => ({
      date: format(parseISO(t.transaction_date || t.created_at), 'd MMM', { locale: es }),
      Ingresos: t.type === 'income' ? Number(t.amount) : 0,
      Gastos: t.type === 'expense' ? Number(t.amount) : 0,
      Ahorros: t.type === 'saving' ? Number(t.amount) : 0,
    }))

  // Dinero disponible (Acumulado)
  const availableBalance = Number(summary?.available_balance ?? 0)
  const totalNetWorth = Number(summary?.total_net_worth ?? 0)

  const statCards = [
    {
      id: 'total-net-card',
      label: 'Saldo Total',
      value: formatCurrency(totalNetWorth),
      icon: Wallet,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      className: 'col-span-2 lg:col-span-1 border-blue-500/30 shadow-glow-blue/10',
    },
    {
      id: 'available-card',
      label: showProjected ? 'Disponible (Supuesto)' : 'Dinero disponible',
      value: formatCurrency(availableBalance),
      icon: PiggyBank,
      color: availableBalance >= 0 ? 'text-brand-400' : 'text-red-400',
      bg: availableBalance >= 0 ? 'bg-brand-500/10' : 'bg-red-500/10',
      border: availableBalance >= 0 ? 'border-brand-500/20' : 'border-red-500/20',
      className: 'col-span-2 lg:col-span-1',
    },
    {
      id: 'gross-income-card',
      label: showProjected ? 'Ingreso Mes (Supuesto)' : 'Ingreso del mes',
      value: formatCurrency(showProjected ? summary?.projected_income ?? 0 : summary?.monthly_income ?? 0),
      icon: TrendingUp,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
    },
    {
      id: 'expenses-card',
      label: showProjected ? 'Gastos Mes (Supuesto)' : 'Gastos del mes',
      value: formatCurrency(showProjected ? summary?.projected_expenses ?? 0 : summary?.monthly_expenses ?? 0),
      icon: TrendingDown,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
    },
    {
      id: 'savings-card',
      label: showProjected ? 'Ahorro Mes (Supuesto)' : 'Ahorro del mes',
      value: formatCurrency(showProjected ? summary?.projected_savings ?? 0 : summary?.monthly_savings ?? 0),
      icon: Target,
      color: 'text-brand-400',
      bg: 'bg-brand-500/10',
      border: 'border-brand-500/20',
      style: { color: '#8EDF3E' }
    }
  ]

  return (
    <div className="space-y-8 pb-24 md:pb-0">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-surface-800 border border-white/10 flex items-center justify-center p-0 shadow-2xl overflow-hidden shadow-glow-green shrink-0 relative">
            {user?.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={user.displayName}
                className="w-full h-full object-cover block"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <UserIcon className="w-6 h-6 text-brand-400" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-100">
              Hola, {user?.displayName?.split(' ')[0] || 'Usuario'} 👋
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              {format(new Date(), "EEEE, d 'de' MMMM yyyy", { locale: es })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-surface-800 rounded-xl p-1 border border-white/5">
            <button
              onClick={() => setShowProjected(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${!showProjected ? 'bg-brand-500 text-white shadow-glow-green' : 'text-slate-500 hover:text-slate-300'}`}
            >
              REAL
            </button>
            <button
              onClick={() => setShowProjected(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${showProjected ? 'bg-yellow-500 text-slate-900 shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <CalendarClock className="w-3 h-3" />
              SUPOSICIONES
            </button>
          </div>
          <Link to="/transactions" id="add-transaction-btn" className="btn-primary shrink-0 hidden md:flex">
            <Plus className="w-4 h-4" /> Nuevo movimiento
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map(({ id, label, value, realValue, icon: Icon, color, bg, border, style, isProjected, className }: any) => (
          <div key={id} id={id} className={`card p-5 border ${border} ${className || ''} space-y-3 relative overflow-hidden group`}>
            {isProjected && (
              <div className="absolute top-0 right-0 px-2 py-0.5 bg-yellow-500 text-slate-900 text-[8px] font-black uppercase tracking-tighter rounded-bl-lg">
                Proyectado
              </div>
            )}
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400 font-medium">{label}</p>
              <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${color}`} style={style} />
              </div>
            </div>
            <div className="space-y-1">
              <p className={`text-xl font-bold ${color}`} style={style}>{value}</p>
              {realValue && (
                <p className="text-[10px] text-slate-500 font-medium">
                  Real: <span className="text-slate-400">{realValue}</span>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic Tip Card - Moved & Redesigned */}
      <div className="bg-brand-500/5 border border-brand-500/10 rounded-2xl p-4 flex items-center gap-4 animate-fade-in group hover:bg-brand-500/10 transition-all">
        <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center shrink-0 border border-brand-500/10 shadow-glow-green">
          <Lightbulb className="w-5 h-5 text-brand-400 group-hover:animate-pulse" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-400/80 mb-0.5">Consejo de ahorro</p>
          <p className="text-slate-300 text-sm leading-relaxed font-medium">
            "{dailyTip}"
          </p>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="section-title">Actividad reciente</h3>
            <Link to="/transactions" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
              Ver todo <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={60}
                tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Ingresos" stroke="#10b981" strokeWidth={2} fill="url(#colorIncome)" />
              <Area type="monotone" dataKey="Gastos" stroke="#ef4444" strokeWidth={2} fill="url(#colorExpenses)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Goals progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="section-title">Metas de ahorro</h3>
          <Link to="/goals" id="see-all-goals-btn" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
            Ver todas <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {goalsLoading ? (
          <div className="card p-8 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activeGoals.length === 0 ? (
          <div className="card p-8 text-center space-y-3">
            <Target className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-slate-400">No tienes metas activas aún</p>
            <Link to="/goals" className="btn-primary inline-flex">
              <Plus className="w-4 h-4" /> Crear primera meta
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {activeGoals.slice(0, 4).map(goal => {
              // Calculate projected amount for this goal if showProjected is true
              const projectedAmount = showProjected
                ? transactions
                  .filter(t => t.type === 'saving' && t.goal_id === goal.id && t.is_projected)
                  .reduce((acc, t) => acc + Number(t.amount), Number(goal.current_amount))
                : Number(goal.current_amount)

              const displayCurrent = showProjected ? projectedAmount : Number(goal.current_amount)
              const displayTarget = Number(goal.target_amount)
              const pct = Math.min(100, (displayCurrent / displayTarget) * 100)
              const isImproved = showProjected && (projectedAmount > Number(goal.current_amount))

              return (
                <Link
                  key={goal.id}
                  to={`/goals/${goal.id}`}
                  className={`card-hover p-5 block space-y-4 relative overflow-hidden ${isImproved ? 'border-yellow-500/20 bg-yellow-500/[0.02]' : ''
                    }`}
                >
                  {isImproved && (
                    <div className="absolute top-0 right-0 px-2 py-0.5 bg-yellow-500 text-slate-900 text-[8px] font-black uppercase tracking-tighter rounded-bl-lg">
                      Proyectado
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
                        style={{ background: `${goal.color}20` }}
                      >
                        🎯
                      </div>
                      <div>
                        <p className="font-semibold text-slate-100 text-sm flex items-center gap-2">
                          {goal.name}
                          {isImproved && <CalendarClock className="w-3 h-3 text-yellow-500" />}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatCurrency(displayCurrent)} / {formatCurrency(displayTarget)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-sm font-bold ${isImproved ? 'text-yellow-500' :
                          pct >= 80 ? 'text-brand-400' : pct >= 40 ? 'text-yellow-400' : 'text-slate-400'
                        }`}
                    >
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="progress-bar h-2">
                    <div
                      className="progress-fill h-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background: isImproved
                          ? 'linear-gradient(90deg, #ca8a0480, #eab308)'
                          : pct >= 100
                            ? '#3b82f6'
                            : pct >= 1
                              ? 'linear-gradient(90deg, #8EDF3E80, #8EDF3E)'
                              : '#1e293b',
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Falta {formatCurrency(Math.max(0, displayTarget - displayCurrent))}
                    {goal.deadline && ` · Hasta ${format(parseISO(goal.deadline), 'd MMM yyyy', { locale: es })}`}
                  </p>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Recent transactions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="section-title">Últimos movimientos</h3>
          <Link to="/transactions" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
            Ver todos <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="card divide-y divide-white/5">
          {transactions.slice(0, 5).map(tx => (
            <div key={tx.id} className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm relative
                  ${tx.type === 'income' ? 'bg-brand-500/10' : tx.type === 'expense' ? 'bg-red-500/10' : 'bg-blue-500/10'}`}>
                  {tx.type === 'income' ? '💰' : tx.type === 'expense' ? '💸' : '🐷'}
                  {tx.is_projected && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full border-2 border-surface-800 flex items-center justify-center">
                      <CalendarClock className="w-1.5 h-1.5 text-slate-900" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200 flex items-center">
                    {tx.description || (tx.type === 'income' ? 'Ingreso' : tx.type === 'expense' ? 'Gasto' : 'Ahorro')}
                    {tx.is_projected && <ProjectionBadge />}
                  </p>
                  <p className="text-xs text-slate-500">
                    {tx.category_name || tx.source || format(parseISO(tx.transaction_date || tx.created_at), 'd MMM', { locale: es })}
                  </p>
                </div>
              </div>
              <span className={`text-sm font-semibold ${tx.type === 'income' ? 'text-brand-400' : tx.type === 'expense' ? 'text-red-400' : 'text-blue-400'
                } ${tx.is_projected ? 'opacity-60 italic' : ''}`}>
                {tx.type === 'expense' ? '-' : '+'}{formatCurrency(tx.amount)}
              </span>
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="px-5 py-8 text-center text-slate-500 text-sm">
              No hay movimientos registrados
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
