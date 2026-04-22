import { create } from 'zustand'
import api from '../lib/api'

export interface Transaction {
  id: string
  user_id: string
  goal_id?: string
  category_id?: string
  type: 'income' | 'expense' | 'saving'
  amount: number
  description?: string
  source?: string
  week_number: number
  year: number
  transaction_date: string
  created_at: string
  is_projected: boolean
  category_name?: string
  category_icon?: string
  category_color?: string
  goal_name?: string
  parent_id?: string
  split_percent?: number
}

export interface Summary {
  total_income: number
  total_expenses: number
  total_savings: number
  monthly_income: number
  monthly_expenses: number
  monthly_savings: number
  projected_income: number
  projected_expenses: number
  projected_savings: number
  available_balance: number
  total_net_worth: number
}

interface TransactionsState {
  transactions: Transaction[]
  summary: Summary | null
  isLoading: boolean
  error: string | null
  fetchTransactions: (filters?: Record<string, any>) => Promise<void>
  fetchSummary: () => Promise<void>
  createTransaction: (data: Partial<Transaction>) => Promise<void>
  confirmTransaction: (id: string) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
}

export const useTransactionsStore = create<TransactionsState>((set) => ({
  transactions: [],
  summary: null,
  isLoading: false,
  error: null,

  fetchTransactions: async (filters = {}) => {
    set({ isLoading: true, error: null })
    try {
      const res = await api.get('/transactions', { params: filters })
      set({ transactions: res.data.data })
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error al cargar transacciones' })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchSummary: async () => {
    try {
      const res = await api.get('/transactions/summary')
      set({ summary: res.data.data })
    } catch (err) {
      console.error('Summary error:', err)
    }
  },

  createTransaction: async (data) => {
    const res = await api.post('/transactions', data)
    const tx = res.data.data
    set((state) => ({ transactions: [tx, ...state.transactions] }))
    // Actualizar resumen para que el dashboard se refresque
    const state = useTransactionsStore.getState()
    await state.fetchSummary()
    return tx
  },

  confirmTransaction: async (id) => {
    await api.patch(`/transactions/${id}/confirm`)
    set((state) => ({
      transactions: state.transactions.map((t) => 
        t.id === id ? { ...t, is_projected: false } : t
      )
    }))
    // Actualizar resumen para el dashboard
    const state = useTransactionsStore.getState()
    await state.fetchSummary()
  },

  deleteTransaction: async (id) => {
    await api.delete(`/transactions/${id}`)
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    }))
    // Actualizar resumen para el dashboard
    const state = useTransactionsStore.getState()
    await state.fetchSummary()
  },
}))
