import { useState, useEffect, useMemo } from 'react'
import { Target, Plus, Search, Edit2, Trash2, Lightbulb, TrendingUp, Clock } from 'lucide-react'
import { useGoalsStore, type Goal } from '../store/goalsStore'
import { formatCurrency } from '../utils/format'
import GoalModal from '../components/goals/GoalModal'
import ConfirmModal from '../components/ui/ConfirmModal'
import { format, parseISO, differenceInCalendarDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { parseLocalDate } from '../utils/dates'

export default function Goals() {
  const { goals, fetchGoals, deleteGoal, isLoading } = useGoalsStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('active')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)

  // Custom confirm state
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null; name: string; loading: boolean }>({
    isOpen: false,
    id: null,
    name: '',
    loading: false
  })

  useEffect(() => {
    fetchGoals()
  }, [])

  const filteredGoals = useMemo(() => {
    return goals.filter(goal => {
      const matchesSearch = goal.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || goal.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [goals, searchTerm, statusFilter])

  const openDeleteConfirm = (id: string, name: string) => {
    setDeleteModal({ isOpen: true, id, name, loading: false })
  }

  const handleDelete = async () => {
    if (!deleteModal.id) return
    setDeleteModal(prev => ({ ...prev, loading: true }))
    try {
      await deleteGoal(deleteModal.id)
      setDeleteModal({ isOpen: false, id: null, name: '', loading: false })
    } catch (err) {
      console.error(err)
      setDeleteModal(prev => ({ ...prev, loading: false }))
    }
  }

  const openModal = (goal?: Goal) => {
    setEditingGoal(goal || null)
    setIsModalOpen(true)
  }

  // Group goals by status
  const activeGoals = useMemo(() => filteredGoals.filter(g => g.status === 'active'), [filteredGoals])
  const completedGoals = useMemo(() => filteredGoals.filter(g => g.status === 'completed'), [filteredGoals])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Target className="text-brand-400" /> Metas de Ahorro
          </h2>
          <p className="text-slate-400 text-sm mt-1">Gestiona y haz seguimiento a tus objetivos</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary">
          <Plus className="w-4 h-4" /> Nueva Meta
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar meta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input md:w-48 appearance-none bg-surface-800"
        >
          <option value="active">Activas</option>
          <option value="completed">Completadas</option>
          <option value="paused">Pausadas</option>
          <option value="all">Todas</option>
        </select>
      </div>

      {isLoading && goals.length === 0 ? (
        <div className="text-center py-10 text-slate-400">Cargando metas...</div>
      ) : filteredGoals.length === 0 ? (
        <div className="card p-10 text-center space-y-4">
          <Target className="w-12 h-12 text-slate-600 mx-auto" />
          <div className="text-slate-400">No se encontraron metas con los filtros actuales.</div>
        </div>
      ) : (
        <div className="space-y-8">
          {activeGoals.length > 0 && (
            <div className="space-y-4">
              <h3 className="section-title text-brand-300">En progreso</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {activeGoals.map(goal => (
                   <GoalCard key={goal.id} goal={goal} onEdit={() => openModal(goal)} onDelete={() => openDeleteConfirm(goal.id, goal.name)} />
                ))}
              </div>
            </div>
          )}

          {completedGoals.length > 0 && (
            <div className="space-y-4">
              <h3 className="section-title text-blue-300">Alcanzadas 🎉</h3>
              <div className="grid md:grid-cols-2 gap-4 opacity-80">
                 {completedGoals.map(goal => (
                   <GoalCard key={goal.id} goal={goal} onEdit={() => openModal(goal)} onDelete={() => openDeleteConfirm(goal.id, goal.name)} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <GoalModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          goalToEdit={editingGoal}
        />
      )}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleDelete}
        loading={deleteModal.loading}
        title="¿Eliminar meta?"
        description={`¿Estás seguro de que deseas eliminar la meta "${deleteModal.name}"? Los ahorros asociados podrían desvincularse.`}
        confirmText="Eliminar permanentemente"
        variant="danger"
      />
    </div>
  )
}

// ─── Savings advice calculator ────────────────────────────────────────────────
function getSavingsAdvice(goal: Goal): { weekly: number; monthly: number; daysLeft: number } | null {
  const deadlineDate = parseLocalDate(goal.deadline)
  if (!deadlineDate) return null

  const remaining = Number(goal.remaining_amount)
  if (remaining <= 0) return null
  
  const today = new Date()
  today.setHours(12, 0, 0, 0)

  const daysLeft = differenceInCalendarDays(deadlineDate, today)
  if (daysLeft <= 0) return null

  const weekly = remaining / (daysLeft / 7)
  const monthly = remaining / (daysLeft / 30)
  return { weekly, monthly, daysLeft }
}

function GoalCard({ goal, onEdit, onDelete }: { goal: Goal, onEdit: () => void, onDelete: () => void }) {
  // Ensure numeric safety for Android/Older browsers
  const current_amount = Number(goal.current_amount) || 0
  const target_amount = Number(goal.target_amount) || 0
  const remaining_amount = Number(goal.remaining_amount) || 0
  const isCompleted = current_amount >= target_amount
  const excess = current_amount > target_amount ? current_amount - target_amount : 0
  const pct = Math.min(100, progress_percentage)
  const advice = getSavingsAdvice(goal)

  return (
    <div className={`card p-5 space-y-4 transition-all ${isCompleted ? 'border-brand-500/30 bg-brand-500/[0.01]' : ''}`}>
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl relative" style={{ backgroundColor: isCompleted ? '#10b98120' : `${goal.color}20` }}>
            {isCompleted ? '✅' : (goal.icon || '🎯')}
            {isCompleted && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-brand-500 rounded-full flex items-center justify-center border-2 border-surface-950">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              </div>
            )}
          </div>
          <div>
            <h4 className={`font-semibold ${isCompleted ? 'text-brand-400' : 'text-slate-100'}`}>
              {goal.name}
              {isCompleted && <span className="ml-2 text-[10px] bg-brand-500 text-white px-1.5 py-0.5 rounded uppercase tracking-tighter">Meta Cumplida</span>}
            </h4>
            {goal.deadline && !isCompleted && (
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Hasta: {format(parseLocalDate(goal.deadline)!, 'd MMM yyyy', { locale: es })}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onEdit} title="Editar" className="p-1.5 text-slate-400 hover:text-brand-400 bg-white/5 rounded-lg hover:bg-brand-500/10 transition-colors">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={onDelete} title="Eliminar" className="p-1.5 text-slate-400 hover:text-red-400 bg-white/5 rounded-lg hover:bg-red-500/10 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Progreso</span>
          <span className={`font-medium ${isCompleted ? 'text-brand-400' : 'text-slate-200'}`}>
             {formatCurrency(current_amount)}
             {excess > 0 && <span className="text-brand-500 font-bold ml-1">(+{formatCurrency(excess)})</span>}
             <span className="mx-1 text-slate-600">/</span>
             {formatCurrency(target_amount)}
          </span>
        </div>
        <div className="progress-bar h-2.5">
          <div
            className="progress-fill h-full shadow-glow-green"
            style={{
              width: `${pct}%`,
              backgroundColor: isCompleted ? '#10b981' : goal.color,
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span className={isCompleted ? 'text-brand-500 font-bold' : ''}>{pct.toFixed(1)}% completado</span>
          {isCompleted ? (
             <span className="text-brand-500 font-medium italic">¡Objetivo superado!</span>
          ) : (
             <span>Falta {formatCurrency(remaining_amount)}</span>
          )}
        </div>
      </div>

      {/* ─ Savings advice panel ─ */}
      {goal.status === 'active' && pct < 100 && (
        <div className={`rounded-xl p-3 border text-xs space-y-2 ${
          advice
            ? 'bg-brand-500/5 border-brand-500/15'
            : 'bg-white/[0.03] border-white/5'
        }`}>
          <p className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-brand-400/80">
            <Lightbulb className="w-3.5 h-3.5" />
            Consejo para cumplir tu meta
          </p>

          {advice ? (
            <div className="space-y-1.5">
              <p className="text-slate-400">
                Te quedan <strong className="text-slate-200">{advice.daysLeft} días</strong>. Para llegar a tiempo necesitas ahorrar:
              </p>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div className="bg-surface-900/60 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Por semana</p>
                  <p className="font-black text-brand-400 text-sm mt-0.5">{formatCurrency(Math.ceil(advice.weekly))}</p>
                </div>
                <div className="bg-surface-900/60 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Por mes</p>
                  <p className="font-black text-blue-400 text-sm mt-0.5">{formatCurrency(Math.ceil(advice.monthly))}</p>
                </div>
              </div>
            </div>
          ) : advice === null && goal.deadline && remaining_amount > 0 ? (
            <p className="text-yellow-500/80 flex items-center gap-1">
              ⚠️ La fecha límite ya pasó. Considera actualizar tu meta.
            </p>
          ) : (
            <p className="text-slate-500 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-slate-600" />
              Agrega una fecha límite para ver cuánto debes ahorrar
            </p>
          )}
        </div>
      )}
    </div>
  )
}
