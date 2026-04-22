import { useState, useEffect, Fragment } from 'react'
import { ArrowLeftRight, Plus, Trash2, CheckCircle2, Loader2 } from 'lucide-react'
import { useTransactionsStore } from '../store/transactionsStore'
import { formatCurrency } from '../utils/format'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import TransactionModal from '../components/transactions/TransactionModal'
import ConfirmModal from '../components/ui/ConfirmModal'

export default function Transactions() {
  const { transactions, fetchTransactions, deleteTransaction, confirmTransaction, isLoading } = useTransactionsStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [filterType, setFilterType] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  
  // Custom confirm state
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null; loading: boolean }>({
    isOpen: false,
    id: null,
    loading: false
  })

  useEffect(() => {
    fetchTransactions()
  }, [])

  const filtered = transactions.filter(t => (filterType === 'all' || t.type === filterType) && !t.parent_id)

  const openDeleteConfirm = (id: string) => {
    setDeleteModal({ isOpen: true, id, loading: false })
  }

  const handleDelete = async () => {
    if (!deleteModal.id) return
    setDeleteModal(prev => ({ ...prev, loading: true }))
    try {
      await deleteTransaction(deleteModal.id)
      setDeleteModal({ isOpen: false, id: null, loading: false })
    } catch (err) {
      console.error(err)
      setDeleteModal(prev => ({ ...prev, loading: false }))
    }
  }

  const handleConfirm = async (id: string) => {
    setConfirmingId(id)
    try {
      await confirmTransaction(id)
      setToastMsg('¡Suposición confirmada exitosamente!')
      setTimeout(() => setToastMsg(null), 3000)
    } finally {
      setConfirmingId(null)
    }
  }

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-brand-500/10 border border-brand-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)] text-brand-400 px-6 py-3 rounded-full flex items-center gap-2 animate-fade-in backdrop-blur-md">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-semibold text-sm">{toastMsg}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <ArrowLeftRight className="text-brand-400" /> Movimientos
          </h2>
          <p className="text-slate-400 text-sm mt-1">Registra tus ingresos, gastos y ahorros</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Nuevo Movimiento
        </button>
      </div>

      <div className="flex flex-col sm:flex-row bg-surface-800 p-1 rounded-xl w-full md:w-max gap-1">
        {['all', 'income', 'expense', 'saving'].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              filterType === type ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {type === 'all' ? 'Todos' : type === 'income' ? 'Ingresos' : type === 'expense' ? 'Gastos' : 'Ahorros'}
          </button>
        ))}
      </div>

      {isLoading && transactions.length === 0 ? (
         <div className="text-center py-10 text-slate-400">Cargando movimientos...</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-surface-900/50 text-slate-400 border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 font-medium">Fecha</th>
                  <th className="px-6 py-4 font-medium">Detalle</th>
                  <th className="px-6 py-4 font-medium">Categoría/Destino</th>
                  <th className="px-6 py-4 font-medium text-right">Monto</th>
                  <th className="px-6 py-4 font-medium text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(tx => (
                  <Fragment key={tx.id}>
                    <tr 
                      onClick={() => setExpandedId(expandedId === tx.id ? null : tx.id)}
                      className={`group hover:bg-white/[0.02] cursor-pointer transition-all ${expandedId === tx.id ? 'bg-white/[0.03] shadow-inner' : ''}`}
                    >
                      <td className="px-6 py-4 text-slate-300">
                        {format(parseISO(tx.transaction_date || tx.created_at), 'd MMM yyyy', { locale: es })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0
                            ${tx.type === 'income' ? 'bg-brand-500/10 text-brand-400' : 
                              tx.type === 'expense' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                            {tx.type === 'income' ? '💰' : tx.type === 'expense' ? '💸' : '🎯'}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-200 flex items-center gap-2">
                              {tx.description || 'Sin detalle'}
                              {tx.is_projected && (
                                <span className="px-1.5 py-0.5 bg-yellow-500/10 text-yellow-500 text-[9px] font-bold uppercase rounded border border-yellow-500/20">
                                  Suposición
                                </span>
                              )}
                              {tx.split_percent && (
                                <span className="px-1.5 py-0.5 bg-brand-500/10 text-brand-400 text-[9px] font-bold uppercase rounded border border-brand-500/20">
                                  Dividido {tx.split_percent}%
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-medium">
                        {tx.type === 'expense' ? (tx.category_name || 'Sin categoría') : 
                         tx.type === 'saving' ? (tx.goal_name || 'Meta eliminada') : 
                         (tx.source || 'Fuente general')}
                      </td>
                      <td className={`px-6 py-4 text-right font-semibold ${
                         tx.type === 'income' ? 'text-brand-400' : tx.type === 'expense' ? 'text-red-400' : 'text-blue-400'
                      }`}>
                        {tx.type === 'expense' ? '-' : '+'}{formatCurrency(tx.amount)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {tx.is_projected && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleConfirm(tx.id); }}
                              disabled={confirmingId === tx.id}
                              className="bg-brand-500/10 text-brand-400 hover:bg-brand-500 hover:text-white transition-all p-1.5 rounded-lg border border-brand-500/10"
                              title="Confirmar movimiento real"
                            >
                              {confirmingId === tx.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          <button onClick={(e) => { e.stopPropagation(); openDeleteConfirm(tx.id); }} className="text-slate-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-white/5">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Panel de Detalle Expandido */}
                    {expandedId === tx.id && (
                      <tr className="bg-surface-900/30">
                        <td colSpan={5} className="px-6 py-4">
                          <div className="flex flex-col gap-4 animate-slide-up">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Detalles del movimiento</h4>
                              <span className="text-[10px] text-slate-500">ID: {tx.id.slice(0, 8)}...</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {/* Tarjeta de Resumen Base */}
                              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col justify-center">
                                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Monto Total Ingresado</p>
                                <p className="text-xl font-black text-white">{formatCurrency(tx.amount)}</p>
                              </div>

                              {/* Si es un ingreso con división - LADO A LADO */}
                              {tx.type === 'income' && tx.split_percent && (
                                <div className="col-span-1 md:col-span-1 grid grid-cols-2 gap-3">
                                  <div className="bg-brand-500/10 p-4 rounded-2xl border border-brand-500/20 shadow-glow-green/10">
                                    <p className="text-[10px] text-brand-400 uppercase font-black mb-1">Ahorro ({tx.split_percent}%)</p>
                                    <p className="text-lg font-black text-brand-300">
                                      {formatCurrency((tx.amount * tx.split_percent) / 100)}
                                    </p>
                                  </div>
                                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                    <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Para ti ({100 - tx.split_percent}%)</p>
                                    <p className="text-lg font-black text-slate-100">
                                      {formatCurrency(tx.amount - (tx.amount * tx.split_percent) / 100)}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {!tx.split_percent && !tx.parent_id && (
                              <div className="text-xs text-slate-500 italic">No hay desgloses adicionales para este movimiento simple.</div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      No hay movimientos para mostrar
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleDelete}
        loading={deleteModal.loading}
        title="¿Eliminar movimiento?"
        description="Esta acción no se puede deshacer y recalculará tus progresos actuales."
        confirmText="Eliminar permanentemente"
        variant="danger"
      />
    </div>
  )
}
