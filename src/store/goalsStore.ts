import { create } from 'zustand'
import api from '../lib/api'

export interface Goal {
  id: string
  name: string
  description?: string
  target_amount: number
  current_amount: number
  deadline?: string
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  icon: string
  color: string
  priority: number
  progress_percentage: number
  remaining_amount: number
  created_at: string
}

interface GoalsState {
  goals: Goal[]
  isLoading: boolean
  error: string | null
  fetchGoals: () => Promise<void>
  createGoal: (data: Partial<Goal>) => Promise<Goal>
  updateGoal: (id: string, data: Partial<Goal>) => Promise<void>
  deleteGoal: (id: string) => Promise<void>
}

export const useGoalsStore = create<GoalsState>((set) => ({
  goals: [],
  isLoading: false,
  error: null,

  fetchGoals: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await api.get('/goals')
      set({ goals: res.data.data })
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error al cargar metas' })
    } finally {
      set({ isLoading: false })
    }
  },

  createGoal: async (data) => {
    const res = await api.post('/goals', data)
    const goal = res.data.data
    await useGoalsStore.getState().fetchGoals()
    return goal
  },

  updateGoal: async (id, data) => {
    const res = await api.patch(`/goals/${id}`, data)
    const updated = res.data.data
    set((state) => ({
      goals: state.goals.map((g) => (g.id === id ? { ...g, ...updated } : g)),
    }))
  },

  deleteGoal: async (id) => {
    await api.delete(`/goals/${id}`)
    set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }))
  },
}))
