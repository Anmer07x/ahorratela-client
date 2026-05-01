import { create } from 'zustand'
import api from '../lib/api'

export interface Loan {
  id: string
  person_name: string
  amount: number
  interest_rate: number
  loan_date: string
  note?: string
  source_type: 'external' | 'balance' | 'goal'
  source_goal_id?: string
  created_at: string
}

export interface LoanStats {
  total_loans: number
  total_principal: number
  total_to_recover: number
}

interface LoansState {
  loans: Loan[]
  stats: LoanStats | null
  isLoading: boolean
  error: string | null
  fetchLoans: () => Promise<void>
  fetchStats: () => Promise<void>
  createLoan: (data: { personName: string; amount: number; interestRate: number; loanDate: string; note?: string; sourceType?: string; sourceGoalId?: string }) => Promise<void>
  deleteLoan: (id: string) => Promise<void>
  cancelLoan: (id: string) => Promise<void>
}

export const useLoansStore = create<LoansState>((set, get) => ({
  loans: [],
  stats: null,
  isLoading: false,
  error: null,

  fetchLoans: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await api.get('/loans')
      set({ loans: res.data.data })
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error al cargar préstamos' })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchStats: async () => {
    try {
      const res = await api.get('/loans/stats')
      set({ stats: res.data.data })
    } catch (err) {
      console.error('Fetch stats error:', err)
    }
  },

  createLoan: async (data) => {
    set({ isLoading: true })
    try {
      await api.post('/loans', data)
      await get().fetchLoans()
      await get().fetchStats()
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error al crear préstamo' })
      throw err
    } finally {
      set({ isLoading: false })
    }
  },

  deleteLoan: async (id) => {
    try {
      await api.delete(`/loans/${id}`)
      set((state) => ({
        loans: state.loans.filter((l) => l.id !== id)
      }))
      await get().fetchStats()
    } catch (err) {
      console.error('Delete loan error:', err)
      throw err
    }
  },

  cancelLoan: async (id) => {
    try {
      await api.delete(`/loans/${id}/cancel`)
      set((state) => ({
        loans: state.loans.filter((l) => l.id !== id)
      }))
      await get().fetchStats()
    } catch (err) {
      console.error('Cancel loan error:', err)
      throw err
    }
  }
}))
