import { useState, useEffect } from 'react'
import { X, ArrowLeftRight, CalendarClock, TrendingUp, TrendingDown, PiggyBank, CheckCircle2, PlusCircle, Info, Wallet } from 'lucide-react'
import { useTransactionsStore, type Transaction } from '../../store/transactionsStore'
import { useGoalsStore } from '../../store/goalsStore'
import { formatCurrency } from '../../utils/format'

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function TransactionModal({ isOpen, onClose }: TransactionModalProps) {
  const { summary, createTransaction } = useTransactionsStore()
  const { goals, fetchGoals } = useGoalsStore()
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [splitIncome, setSplitIncome] = useState(false)
  const [splitPercent, setSplitPercent] = useState(70)
  const [splitGoalId, setSplitGoalId] = useState('')
  const [isProjected, setIsProjected] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  
  const [formData, setFormData] = useState({
    type: 'expense' as Transaction['type'],
    amount: '',
    description: '',
    goalId: '',
    source: '',
    transactionDate: new Date().toLocaleDateString('en-CA'),
    isProjected: false
  })

  useEffect(() => {
    if (isOpen) {
      fetchGoals()
      setShowSuccess(false)
    }
  }, [isOpen])

  const resetForm = () => {
    setFormData({
      type: 'expense',
      amount: '',
      description: '',
      goalId: '',
      source: '',
      transactionDate: new Date().toLocaleDateString('en-CA'),
      isProjected: false
    })
    setSplitIncome(false)
    setSplitPercent(70)
    setSplitGoalId('')
    setIsProjected(false)
    setShowSuccess(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const rawAmount = Number(formData.amount.replace(/\D/g, '') || 0)
  const splitSavingAmount = Math.round((rawAmount * splitPercent) / 100)

  // Mensajes informativos por tipo
  const typeDescriptions: Record<string, { desc: string, impact: string }> = {
    income: {
      desc: 'Dinero nuevo que entra a tu cuenta.',
      impact: 'Aumenta tu Disponible y tu Saldo Total.'
    },
    expense: {
      desc: 'Dinero que sale para pagar algo.',
      impact: 'Disminuye tu Disponible y tu Saldo Total.'
    },
    saving: {
      desc: 'Mueves dinero de tu bolsillo a una meta.',
      impact: 'Baja tu Disponible, pero NO afecta tu Saldo Total.'
    }
  }

  // Simulación de impacto
  const currentAvailable = Number(summary?.available_balance ?? 0)
  const currentTotal = Number(summary?.total_net_worth ?? 0)
  
  let simulatedAvailable = currentAvailable
  let simulatedTotal = currentTotal

  if (!isProjected && rawAmount > 0) {
    if (formData.type === 'income') {
      simulatedAvailable += rawAmount
      simulatedTotal += rawAmount
    } else if (formData.type === 'expense') {
      simulatedAvailable -= rawAmount
      simulatedTotal -= rawAmount
    } else if (formData.type === 'saving') {
      simulatedAvailable -= rawAmount
      // Saldo total stays the same for savings
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    
    // Validar fondos si es gasto o ahorro manual
    if ((formData.type === 'expense' || formData.type === 'saving') && !isProjected) {
      const state = useTransactionsStore.getState()
      const summary = state.summary
      const availablePocketMoney = Number(summary?.available_balance ?? 0)

      if (rawAmount > availablePocketMoney) {
        const msg = formData.type === 'expense' 
          ? 'Oe, y vos de donde estas sacando esa plata? (Saldo disponible insuficiente)' 
          : 'No puedes ahorrar lo que no tienes. (Saldo insuficiente en el bolsillo)'
        setErrorMsg(msg)
        return
      }
    }

    setLoading(true)
    try {
      const payload: any = {
        type: formData.type,
        amount: rawAmount,
        description: formData.description,
        transactionDate: formData.transactionDate,
        isProjected: isProjected
      }
      
      if (formData.type === 'income' && splitIncome) {
        payload.splitPercent = splitPercent;
      }

      const mainTx = await createTransaction(payload)

      if (formData.type === 'income' && splitIncome && splitGoalId && mainTx?.id) {
        await createTransaction({
          type: 'saving',
          amount: splitSavingAmount,
          description: `Ahorro automático (${splitPercent}%) de: ${formData.description}`,
          goalId: splitGoalId,
          transactionDate: formData.transactionDate,
          parentId: mainTx.id,
          splitPercent: splitPercent,
          isProjected: isProjected
        })
      }

      // Refresh goals so current_amount updates immediately in the UI
      await fetchGoals()

      setShowSuccess(true)
    } catch (err: any) {
      console.error('Submit error:', err)
      setErrorMsg('Error al guardar el movimiento. Por favor intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const activeGoals = goals.filter(g => g.status === 'active')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-surface-950 w-full max-w-lg rounded-3xl shadow-2xl border border-white/5 animate-scale-up my-auto max-h-[95vh] flex flex-col">
        <div className="p-5 sm:p-8 overflow-y-auto custom-scrollbar">
        <button onClick={handleClose} className="absolute right-6 top-6 text-slate-400 hover:text-white z-20">
          <X className="w-5 h-5" />
        </button>
        
          {showSuccess ? (
            <div className="py-10 flex flex-col items-center text-center space-y-6 animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-brand-500/10 flex items-center justify-center border border-brand-500/20 shadow-glow-green">
                <CheckCircle2 className="w-10 h-10 text-brand-400 animate-bounce-short" />
              </div>
              <div>
                <h4 className="text-2xl font-bold text-white mb-2">¡Movimiento Guardado!</h4>
                <p className="text-slate-400">Tu registro se ha procesado exitosamente en el sistema.</p>
              </div>
              <div className="flex flex-col w-full gap-3 pt-4">
                <button onClick={handleClose} className="btn-primary w-full py-4 text-base">
                  Listo
                </button>
                <button 
                  onClick={() => setShowSuccess(false)}
                  className="flex items-center justify-center gap-2 text-sm font-bold text-brand-400 hover:text-brand-300 py-2 transition-colors"
                >
                  <PlusCircle className="w-4 h-4" /> Registrar otro movimiento
                </button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="text-xl font-bold flex items-center gap-2 mb-6 text-white">
                <ArrowLeftRight className="text-brand-400" />
                Registrar Movimiento
              </h3>

              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm font-medium flex items-center gap-2">
                  <span className="text-xl shrink-0">🤔</span>
                  {errorMsg}
                </div>
              )}

              <div className="flex bg-surface-900/60 rounded-xl p-1">
                {[
                  { id: 'expense', label: 'Gasto', color: 'red' },
                  { id: 'income', label: 'Ingreso', color: 'brand' },
                  { id: 'saving', label: 'Ahorro', color: 'blue' }
                ].map(type => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type.id as any })}
                    className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition-all ${
                      formData.type === type.id 
                        ? `bg-${type.color}-500 text-white shadow-lg` 
                        : 'text-slate-400 hover:text-slate-100'
                    }`}
                    style={{
                      backgroundColor: formData.type === type.id ? `var(--color-${type.color === 'brand' ? 'brand-500' : type.color + '-500'})` : undefined
                    }}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              {/* Tipo Info Box con más espacio y mejor diseño */}
              <div className="mt-6 mb-8 bg-brand-500/[0.03] border border-brand-500/10 rounded-2xl p-4 flex gap-4 items-start animate-fade-in shadow-inner">
                <div className={`p-2 rounded-xl bg-surface-900 border border-white/5 shadow-sm ${
                  formData.type === 'income' ? 'text-green-400' : 
                  formData.type === 'expense' ? 'text-red-400' : 'text-blue-400'
                }`}>
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-300 font-bold mb-0.5">{typeDescriptions[formData.type].desc}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-tight">{typeDescriptions[formData.type].impact}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="input-label">Monto (COP)</label>
                  <input
                    required
                    type="text"
                    inputMode="numeric"
                    className="input text-2xl h-14"
                    placeholder="0"
                    value={formData.amount}
                    onChange={e => {
                      const numericValue = e.target.value.replace(/\D/g, '')
                      const formatted = numericValue ? Number(numericValue).toLocaleString('es-CO') : ''
                      setFormData({ ...formData, amount: formatted })
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="input-label">
                    {formData.type === 'expense' ? '¿En qué te lo gastaste?' : 'Descripción'}
                  </label>
                  <input
                    required
                    className="input h-12"
                    placeholder={formData.type === 'expense' ? 'Ej. Almuerzo, Mercado, Luz...' : 'Ej. Salario, Ahorro quincena...'}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className={`p-4 rounded-2xl border transition-all duration-300 ${
                  isProjected 
                    ? 'bg-yellow-500/10 border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.1)]' 
                    : 'bg-surface-900/40 border-white/5'
                }`}>
                  <label className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl transition-colors ${isProjected ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/5 text-slate-500'}`}>
                        <CalendarClock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className={`text-sm font-bold transition-colors ${isProjected ? 'text-yellow-400' : 'text-slate-300'}`}>
                          Planificar a futuro
                        </p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">No afecta tu saldo real</p>
                      </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${isProjected ? 'bg-yellow-500' : 'bg-slate-700'}`}>
                      <div className={`bg-white w-4 h-4 rounded-full transition-transform duration-300 ${isProjected ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={isProjected} 
                      onChange={e => setIsProjected(e.target.checked)} 
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="input-label">Fecha</label>
                      <input
                        required
                        type="date"
                        className="input h-12"
                        min={new Date().toLocaleDateString('en-CA')}
                        value={formData.transactionDate}
                        onChange={e => setFormData({ ...formData, transactionDate: e.target.value })}
                      />
                  </div>

                  {formData.type === 'saving' && (
                    <div className="space-y-2">
                      <label className="input-label">Destino (Meta)</label>
                      <select
                        required
                        className="input h-12"
                        value={formData.goalId}
                        onChange={e => setFormData({ ...formData, goalId: e.target.value })}
                      >
                        <option value="">Seleccionar meta...</option>
                        {activeGoals.map(g => (
                          <option key={g.id} value={g.id}>{g.icon} {g.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {formData.type === 'income' && (
                    <div className="space-y-2">
                      <label className="input-label">Fuente</label>
                      <input
                        required
                        className="input h-12"
                        placeholder="Ej. Nómina, Proyecto..."
                        value={formData.source}
                        onChange={e => setFormData({ ...formData, source: e.target.value })}
                      />
                    </div>
                  )}
                </div>

                {formData.type === 'income' && (
                  <div className="pt-4 mt-2 border-t border-white/5 space-y-4 animate-fade-in">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={splitIncome} 
                        onChange={e => setSplitIncome(e.target.checked)} 
                        className="w-5 h-5 rounded border-slate-600 text-brand-500 focus:ring-brand-500 bg-surface-900 cursor-pointer" 
                      />
                      <span className="text-xs font-bold text-brand-400 group-hover:text-brand-300 transition-colors uppercase tracking-wider">Destinar parte a una meta de ahorro</span>
                    </label>
                    
                    {splitIncome && (
                      <div className="bg-surface-900/60 p-5 rounded-2xl border border-brand-500/20 space-y-5 animate-slide-up">
                        <div className="space-y-4">
                          <div className="flex justify-between items-end">
                            <span className="text-xs text-slate-400 font-bold uppercase">Porcentaje de ahorro</span>
                            <span className="text-xl font-black text-brand-400">{splitPercent}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="1" 
                            max="100" 
                            value={splitPercent} 
                            onChange={e => setSplitPercent(Number(e.target.value))} 
                            className="w-full accent-brand-500 h-1.5 bg-surface-800 rounded-lg appearance-none cursor-pointer" 
                          />
                          
                          {/* Desglose solicitado por el usuario */}
                          <div className="grid grid-cols-2 gap-2 mt-4">
                            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                              <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Para ti ({100 - splitPercent}%)</p>
                              <p className="text-sm font-black text-white">
                                ${ (rawAmount - splitSavingAmount).toLocaleString('es-CO') }
                              </p>
                            </div>
                            <div className="bg-brand-500/5 p-3 rounded-xl border border-brand-500/10">
                              <p className="text-[10px] text-brand-500/70 uppercase font-bold mb-1">Ahorro ({splitPercent}%)</p>
                              <p className="text-sm font-black text-brand-400">
                                ${ splitSavingAmount.toLocaleString('es-CO') }
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="input-label text-[10px]">Meta de destino</label>
                          <select required={splitIncome} className="input h-10 text-sm" value={splitGoalId} onChange={e => setSplitGoalId(e.target.value)}>
                            <option value="">Seleccionar...</option>
                            {activeGoals.map(g => (
                              <option key={g.id} value={g.id}>{g.icon} {g.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Balance Simulation Display */}
                {!isProjected && rawAmount > 0 && (
                  <div className="bg-brand-500/5 border border-brand-500/10 rounded-2xl p-4 space-y-3 animate-fade-in shadow-inner">
                    <p className="text-[10px] text-brand-400 uppercase tracking-widest font-bold flex items-center gap-2">
                        <ArrowLeftRight className="w-3 h-3" /> Visualización de impacto
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <PiggyBank className="w-3 h-3 text-slate-500" />
                          <span className="text-[10px] text-slate-400 font-medium">Bolsillo (Disponible)</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <p className={`text-sm font-bold ${simulatedAvailable < 0 ? 'text-red-400' : 'text-slate-200'}`}>
                            {formatCurrency(simulatedAvailable)}
                          </p>
                          <span className={`text-[10px] font-bold ${formData.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                            {formData.type === 'income' ? '+' : '-'}{formatCurrency(rawAmount)}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1 border-l border-white/5 pl-4">
                        <div className="flex items-center gap-1.5">
                          <Wallet className="w-3 h-3 text-slate-500" />
                          <span className="text-[10px] text-slate-400 font-medium">Saldo Total</span>
                        </div>
                        <p className="text-sm font-bold text-slate-200">
                          {formatCurrency(simulatedTotal)}
                        </p>
                        {formData.type === 'saving' ? (
                          <span className="text-[8px] text-slate-500 uppercase">Sin cambios (Ahorro)</span>
                        ) : (
                          <span className={`text-[10px] font-bold ${formData.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                            {formData.type === 'income' ? '+' : '-'}{formatCurrency(rawAmount)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-6 flex flex-col md:flex-row gap-3">
                  <button type="button" onClick={handleClose} className="btn-secondary flex-1 h-12 order-2 md:order-1">
                    Cancelar
                  </button>
                  <button type="submit" disabled={loading} className="btn-primary flex-1 h-12 order-1 md:order-2">
                    {loading ? 'Guardando...' : 'Guardar movimiento'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
