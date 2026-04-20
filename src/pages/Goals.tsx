import { useState, useEffect } from 'react'
import { Target, Plus, Search, Edit2, Trash2 } from 'lucide-react'
import { useGoalsStore, type Goal } from '../store/goalsStore'
import { formatCurrency } from '../utils/format'
import GoalModal from '../components/goals/GoalModal'
import ConfirmModal from '../components/ui/ConfirmModal'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

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

  const filteredGoals = goals.filter(goal => {
    const matchesSearch = goal.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || goal.status === statusFilter
    return matchesSearch && matchesStatus
  })

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
  const activeGoals = filteredGoals.filter(g => g.status === 'active')
  const completedGoals = filteredGoals.filter(g => g.status === 'completed')

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

      {isLoading ? (
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

function GoalCard({ goal, onEdit, onDelete }: { goal: Goal, onEdit: () => void, onDelete: () => void }) {
  const pct = Math.min(100, Number(goal.progress_percentage) || 0)
  return (
    <div className="card p-5 space-y-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: `${goal.color}20` }}>
            {goal.icon || '🎯'}
          </div>
          <div>
            <h4 className="font-semibold text-slate-100">{goal.name}</h4>
            {goal.deadline && (
              <p className="text-xs text-slate-400">
                Hasta: {format(parseISO(goal.deadline), 'd MMM yyyy', { locale: es })}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onEdit} className="p-1.5 text-slate-400 hover:text-brand-400 bg-white/5 rounded-lg hover:bg-brand-500/10 transition-colors">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="p-1.5 text-slate-400 hover:text-red-400 bg-white/5 rounded-lg hover:bg-red-500/10 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Progreso</span>
          <span className="font-medium text-slate-200">
             {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
          </span>
        </div>
        <div className="progress-bar h-2.5">
          <div
            className="progress-fill h-full"
            style={{
              width: `${pct}%`,
              background: pct >= 100 ? '#3b82f6' : `linear-gradient(90deg, ${goal.color}80, ${goal.color})`,
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>{pct.toFixed(1)}% completado</span>
          {pct < 100 && <span>Falta {formatCurrency(goal.remaining_amount)}</span>}
        </div>
      </div>
    </div>
  )
}
