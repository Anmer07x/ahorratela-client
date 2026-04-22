import { useState, useEffect } from 'react'

import { type Goal, useGoalsStore } from '../../store/goalsStore'
import { X, Target } from 'lucide-react'

interface GoalModalProps {
  isOpen: boolean
  onClose: () => void
  goalToEdit: Goal | null
}

export default function GoalModal({ isOpen, onClose, goalToEdit }: GoalModalProps) {
  const { createGoal, updateGoal } = useGoalsStore()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    deadline: '',
    color: '#10b981',
    icon: '🎯',
    status: 'active' as Goal['status']
  })

  useEffect(() => {
    if (goalToEdit) {
      setFormData({
        name: goalToEdit.name,
        targetAmount: goalToEdit.target_amount ? Number(goalToEdit.target_amount).toLocaleString('es-CO') : '',
        deadline: goalToEdit.deadline ? goalToEdit.deadline.split('T')[0] : '',
        color: goalToEdit.color,
        icon: goalToEdit.icon,
        status: goalToEdit.status,
      })
    } else {
      setFormData({
        name: '',
        targetAmount: '',
        deadline: '',
        color: '#10b981',
        icon: '🎯',
        status: 'active'
      })
    }
  }, [goalToEdit, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...formData,
        targetAmount: Number(formData.targetAmount.replace(/\D/g, '')),
      }
      if (goalToEdit) {
        await updateGoal(goalToEdit.id, payload)
      } else {
        await createGoal(payload)
      }
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto ${isOpen ? '' : 'hidden'}`}>
      <div className="bg-surface-950 w-full max-w-md rounded-3xl shadow-2xl border border-white/5 animate-scale-up my-auto max-h-[95vh] flex flex-col">
        <div className="p-5 sm:p-8 overflow-y-auto custom-scrollbar relative">
          <button onClick={onClose} className="absolute right-6 top-6 text-slate-400 hover:text-white z-20">
            <X className="w-5 h-5" />
          </button>
        
        <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
          <Target className="text-brand-400" />
          {goalToEdit ? 'Editar Meta' : 'Nueva Meta'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="input-label">Nombre de la meta</label>
            <input
              required
              className="input"
              placeholder="Ej. Moto Nueva, Vacaciones"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="input-label">Monto objetivo (COP)</label>
            <input
              required
              type="text"
              className="input"
              placeholder="0"
              value={formData.targetAmount}
              onChange={e => {
                const numericValue = e.target.value.replace(/\D/g, '')
                const formatted = numericValue ? Number(numericValue).toLocaleString('es-CO') : ''
                setFormData({ ...formData, targetAmount: formatted })
              }}
            />
          </div>

          <div>
            <label className="input-label">Fecha límite (Opcional)</label>
            <input
              type="date"
              className="input"
              min={new Date().toLocaleDateString('en-CA')}
              value={formData.deadline}
              onChange={e => setFormData({ ...formData, deadline: e.target.value })}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="input-label">Emoji / Icono</label>
              <input
                className="input text-center text-xl"
                value={formData.icon}
                maxLength={2}
                onChange={e => setFormData({ ...formData, icon: e.target.value })}
              />
            </div>
            <div className="flex-1">
              <label className="input-label">Color</label>
              <input
                type="color"
                className="input p-1 h-[42px]"
                value={formData.color}
                onChange={e => setFormData({ ...formData, color: e.target.value })}
              />
            </div>
          </div>

          {goalToEdit && (
            <div>
              <label className="input-label">Estado</label>
              <select
                className="input"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as Goal['status'] })}
              >
                <option value="active">Activa</option>
                <option value="paused">Pausada</option>
                <option value="completed">Completada</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>
          )}

          <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Guardando...' : 'Guardar Meta'}
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}
