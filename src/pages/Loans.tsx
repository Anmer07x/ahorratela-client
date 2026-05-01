import { useState, useEffect } from 'react'
import { HandCoins, User, DollarSign, Percent, Calendar, StickyNote, Plus, Trash2, CheckCircle2, Loader2, Info, Wallet, Target, Globe } from 'lucide-react'
import { useLoansStore } from '../store/loansStore'
import { useGoalsStore } from '../store/goalsStore'
import { formatCurrency } from '../utils/format'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import ConfirmModal from '../components/ui/ConfirmModal'

export default function Loans() {
  const { loans, stats, isLoading, fetchLoans, fetchStats, createLoan, deleteLoan } = useLoansStore()
  const { goals, fetchGoals } = useGoalsStore()
  
  // Form State
  const [formData, setFormData] = useState({
    personName: '',
    amount: '',
    interestRate: '0',
    loanDate: new Date().toISOString().split('T')[0],
    note: '',
    sourceType: 'external',
    sourceGoalId: ''
  })

  // UI State
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null; name: string; total: number }>({
    isOpen: false,
    id: null,
    name: '',
    total: 0
  })

  useEffect(() => {
    fetchLoans()
    fetchStats()
    fetchGoals()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.personName || !formData.amount) return

    setIsSubmitting(true)
    try {
      await createLoan({
        ...formData,
        amount: parseFloat(formData.amount),
        interestRate: parseFloat(formData.interestRate),
        sourceGoalId: formData.sourceType === 'goal' ? formData.sourceGoalId : undefined
      })
      setFormData({
        personName: '',
        amount: '',
        interestRate: '0',
        loanDate: new Date().toISOString().split('T')[0],
        note: '',
        sourceType: 'external',
        sourceGoalId: ''
      })
      setToastMsg('¡Préstamo registrado exitosamente!')
      setTimeout(() => setToastMsg(null), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openDeleteConfirm = (loan: any) => {
    const total = parseFloat(loan.amount) * (1 + parseFloat(loan.interest_rate) / 100)
    setDeleteModal({
      isOpen: true,
      id: loan.id,
      name: loan.person_name,
      total: total
    })
  }

  const handleDelete = async () => {
    if (!deleteModal.id) return
    try {
      await deleteLoan(deleteModal.id)
      setDeleteModal({ ...deleteModal, isOpen: false })
      setToastMsg('¡Deuda pagada y saldos actualizados!')
      setTimeout(() => setToastMsg(null), 3000)
    } catch (err) {
      console.error(err)
    }
  }

  // Real-time Preview calculations
  const principal = parseFloat(formData.amount) || 0
  const interestPercent = parseFloat(formData.interestRate) || 0
  const interestGenerated = principal * (interestPercent / 100)
  const totalToReturn = principal + interestGenerated

  return (
    <div className="space-y-8 pb-10">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-brand-500/10 border border-brand-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)] text-brand-400 px-6 py-3 rounded-full flex items-center gap-2 animate-fade-in backdrop-blur-md">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-semibold text-sm">{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <HandCoins className="text-brand-400 w-7 h-7" /> Préstamos
          </h2>
          <p className="text-slate-400 text-sm mt-1">Gestiona deudas e intereses con integración a tus ahorros</p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-800/60 backdrop-blur-md border border-white/5 rounded-2xl p-5 flex items-center justify-between group hover:border-brand-500/20 transition-all">
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Préstamos Activos</p>
            <h3 className="text-3xl font-black text-white leading-tight">{stats?.total_loans || 0}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
            <HandCoins className="w-6 h-6" />
          </div>
        </div>
        
        <div className="bg-surface-800/60 backdrop-blur-md border border-white/5 rounded-2xl p-5 flex items-center justify-between group hover:border-brand-500/20 transition-all">
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Capital Prestado</p>
            <h3 className="text-2xl font-black text-white leading-tight">{formatCurrency(stats?.total_principal || 0)}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400 group-hover:scale-110 transition-transform">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-surface-800/60 backdrop-blur-md border border-brand-500/10 rounded-2xl p-5 flex items-center justify-between group hover:border-brand-500/30 transition-all shadow-glow-green/5">
          <div>
            <p className="text-xs text-brand-500/70 font-bold uppercase tracking-wider mb-1">Total a Recuperar</p>
            <h3 className="text-2xl font-black text-brand-400 leading-tight">{formatCurrency(stats?.total_to_recover || 0)}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-400 shadow-glow-green/10 group-hover:scale-110 transition-transform">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card p-6 border-brand-500/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:bg-brand-500/10" />
            
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-brand-400" /> Registrar Nuevo Préstamo
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nombre de la persona</label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/5 group-focus-within:border-brand-500/30 group-focus-within:bg-brand-500/5 transition-all">
                    <User className="w-4 h-4 text-slate-400 group-focus-within:text-brand-400" />
                  </div>
                  <input
                    type="text"
                    name="personName"
                    value={formData.personName}
                    onChange={handleInputChange}
                    placeholder="¿A quién le prestaste?"
                    className="input pl-14 h-12 bg-surface-900/50 border-white/5 hover:border-white/10"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Monto (COP)</label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/5 group-focus-within:border-brand-500/30 group-focus-within:bg-brand-500/5 transition-all">
                      <DollarSign className="w-4 h-4 text-slate-400 group-focus-within:text-brand-400" />
                    </div>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="input pl-14 h-12 bg-surface-900/50 border-white/5 hover:border-white/10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">% Interés</label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/5 group-focus-within:border-brand-500/30 group-focus-within:bg-brand-500/5 transition-all">
                      <Percent className="w-4 h-4 text-slate-400 group-focus-within:text-brand-400" />
                    </div>
                    <input
                      type="number"
                      name="interestRate"
                      value={formData.interestRate}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="input pl-14 h-12 bg-surface-900/50 border-white/5 hover:border-white/10"
                    />
                  </div>
                </div>
              </div>

              {/* Source Selection */}
              <div className="space-y-3 p-4 bg-surface-900/40 rounded-2xl border border-white/5">
                <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                  <Wallet className="w-3.5 h-3.5" /> ¿De dónde sale el dinero?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'external', icon: Globe, label: 'Externo' },
                    { id: 'balance', icon: Wallet, label: 'Balance' },
                    { id: 'goal', icon: Target, label: 'Ahorros' },
                  ].map(source => (
                    <button
                      key={source.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, sourceType: source.id }))}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${
                        formData.sourceType === source.id 
                          ? 'bg-brand-500/10 border-brand-500/30 text-brand-400' 
                          : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'
                      }`}
                    >
                      <source.icon className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase">{source.label}</span>
                    </button>
                  ))}
                </div>

                {formData.sourceType === 'goal' && (
                  <div className="animate-fade-in pt-1">
                    <select
                      name="sourceGoalId"
                      value={formData.sourceGoalId}
                      onChange={handleInputChange}
                      className="input h-10 text-xs bg-surface-900/80"
                      required
                    >
                      <option value="">Selecciona una meta...</option>
                      {goals.filter(g => g.status === 'active').map(goal => (
                        <option key={goal.id} value={goal.id}>
                          {goal.name} ({formatCurrency(goal.current_amount)})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                <p className="text-[10px] text-slate-500 italic mt-1">
                  {formData.sourceType === 'balance' && "Se creará un gasto automático en tus movimientos."}
                  {formData.sourceType === 'goal' && "Se descontará directamente de tu meta de ahorro."}
                  {formData.sourceType === 'external' && "No afectará tus balances ni metas actuales."}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Fecha del préstamo</label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/5 group-focus-within:border-brand-500/30 group-focus-within:bg-brand-500/5 transition-all">
                    <Calendar className="w-4 h-4 text-slate-400 group-focus-within:text-brand-400" />
                  </div>
                  <input
                    type="date"
                    name="loanDate"
                    value={formData.loanDate}
                    onChange={handleInputChange}
                    className="input pl-14 h-12 bg-surface-900/50 border-white/5 hover:border-white/10 appearance-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nota (Opcional)</label>
                <div className="relative group">
                  <div className="absolute left-3 top-3 w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/5 group-focus-within:border-brand-500/30 group-focus-within:bg-brand-500/5 transition-all">
                    <StickyNote className="w-4 h-4 text-slate-400 group-focus-within:text-brand-400" />
                  </div>
                  <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    placeholder="Algún detalle adicional..."
                    className="input pl-14 pt-3 bg-surface-900/50 border-white/5 hover:border-white/10 min-h-[100px] resize-none"
                  />
                </div>
              </div>

              {/* Preview Real-time */}
              {(principal > 0) && (
                <div className="bg-surface-900/50 rounded-2xl p-4 border border-white/5 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Capital inicial:</span>
                    <span className="text-slate-200 font-medium">{formatCurrency(principal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Intereses generados ({interestPercent}%):</span>
                    <span className="text-brand-400 font-medium">+{formatCurrency(interestGenerated)}</span>
                  </div>
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-100 uppercase">Total a devolver:</span>
                    <span className="text-lg font-black text-brand-400">{formatCurrency(totalToReturn)}</span>
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isSubmitting || !formData.personName || !formData.amount || (formData.sourceType === 'goal' && !formData.sourceGoalId)}
                className="btn-primary w-full py-4 mt-2 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                Guardar Préstamo
              </button>
            </form>
          </div>
        </div>

        {/* List Section */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <HandCoins className="w-5 h-5 text-blue-400" /> Deudas Activas
            </h3>
            <span className="text-xs text-slate-500 font-medium">{loans.length} registrados</span>
          </div>

          {isLoading && loans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-surface-800/50 rounded-3xl border border-white/5">
              <Loader2 className="w-10 h-10 text-brand-400 animate-spin mb-4" />
              <p className="text-slate-400">Cargando tus préstamos...</p>
            </div>
          ) : loans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-surface-800/50 rounded-3xl border border-dashed border-white/10 text-center px-6">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <HandCoins className="w-8 h-8 text-slate-600" />
              </div>
              <h4 className="text-slate-300 font-bold">No tienes deudas activas</h4>
              <p className="text-slate-500 text-sm mt-1 max-w-xs">Registra un nuevo préstamo para empezar.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {loans.map(loan => {
                const total = parseFloat(loan.amount as any) * (1 + parseFloat(loan.interest_rate as any) / 100)
                const interests = total - parseFloat(loan.amount as any)
                
                // Find goal name if it was from a goal
                const sourceGoalName = goals.find(g => g.id === loan.source_goal_id)?.name

                return (
                  <div key={loan.id} className="card p-5 hover:bg-white/[0.02] transition-all group border-l-4 border-l-brand-500/30 hover:border-l-brand-400 shadow-lg">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-slate-100 text-lg">{loan.person_name}</h4>
                          {parseFloat(loan.interest_rate as any) > 0 ? (
                            <span className="px-2 py-0.5 bg-brand-500/10 text-brand-400 text-[10px] font-black uppercase rounded-full border border-brand-500/20">
                              {loan.interest_rate}% Interés
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-slate-500/10 text-slate-500 text-[10px] font-black uppercase rounded-full border border-white/5">
                              Sin interés
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(parseISO(loan.loan_date), 'd MMM yyyy', { locale: es })}
                          </span>
                          <span className="flex items-center gap-1">
                            {loan.source_type === 'goal' ? <Target className="w-3 h-3 text-brand-400" /> : 
                             loan.source_type === 'balance' ? <Wallet className="w-3 h-3 text-blue-400" /> : 
                             <Globe className="w-3 h-3 text-slate-500" />}
                            {loan.source_type === 'goal' ? `Meta: ${sourceGoalName || 'Cargando...'}` : 
                             loan.source_type === 'balance' ? 'Desde Balance' : 'Externo'}
                          </span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => openDeleteConfirm(loan)}
                        className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400 hover:bg-brand-500 hover:text-white transition-all shadow-glow-green/10"
                        title="Marcar como pagado"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-6">
                      <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                        <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">Capital</p>
                        <p className="text-sm font-bold text-slate-200">{formatCurrency(loan.amount)}</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                        <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">Intereses</p>
                        <p className="text-sm font-bold text-brand-400">+{formatCurrency(interests)}</p>
                      </div>
                      <div className="bg-brand-500/5 rounded-xl p-3 border border-brand-500/10">
                        <p className="text-[9px] text-brand-400 font-bold uppercase mb-1">Total</p>
                        <p className="text-sm font-black text-white">{formatCurrency(total)}</p>
                      </div>
                    </div>

                    {loan.note && (
                      <div className="mt-4 flex items-start gap-2 bg-surface-900/40 p-3 rounded-xl border border-white/5">
                        <StickyNote className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-slate-400 italic line-clamp-2">{loan.note}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Confirm Payment Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleDelete}
        title="¿Confirmar Pago Recibido?"
        description={
          <div className="space-y-3 mt-2">
            <p>Estás marcando como pagada la deuda de <span className="font-bold text-white">{deleteModal.name}</span>.</p>
            <div className="bg-brand-500/10 p-4 rounded-2xl border border-brand-500/20 text-center">
              <p className="text-xs text-brand-400 uppercase font-bold mb-1">Monto a cobrar</p>
              <p className="text-2xl font-black text-white">{formatCurrency(deleteModal.total)}</p>
            </div>
            <p className="text-xs text-slate-500 italic flex items-center gap-1">
              <Info className="w-3 h-3" /> Los fondos se reintegrarán automáticamente a tus balances o metas.
            </p>
          </div>
        }
        confirmText="Confirmar Pago"
        variant="success"
      />
    </div>
  )
}
