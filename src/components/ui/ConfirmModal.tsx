import { useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'brand'
  loading?: boolean
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'brand',
  loading = false
}: ConfirmModalProps) {
  // Bloquear scroll de la página cuando el modal está abierto - iOS Fix
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.top = `-${scrollY}px`;
      document.body.classList.add('no-scroll');
    } else {
      const scrollY = document.body.style.top;
      document.body.classList.remove('no-scroll');
      document.body.style.top = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
    return () => {
      document.body.classList.remove('no-scroll');
      document.body.style.top = '';
    };
  }, [isOpen]);

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-x-hidden">
      {/* Backdrop - Sin onClick para evitar cierres accidentales */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md animate-fade-in" 
      />
      
      {/* Modal */}
      <div className="bg-surface-800 rounded-3xl w-full max-w-sm p-6 relative z-10 shadow-2xl border border-white/10 animate-slide-up">
        {!loading && (
          <button 
            onClick={onClose} 
            className="absolute right-4 top-4 text-slate-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="flex flex-col items-center text-center space-y-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
            variant === 'danger' ? 'bg-red-500/10 text-red-400' : 'bg-brand-500/10 text-brand-400'
          }`}>
            <AlertTriangle className="w-7 h-7" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              {description}
            </p>
          </div>

          <div className="flex flex-col w-full gap-3 pt-4">
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95 ${
                variant === 'danger' 
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' 
                  : 'bg-brand-500 hover:bg-brand-600 text-white shadow-brand-500/20'
              } disabled:opacity-50 disabled:pointer-events-none`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Procesando...
                </div>
              ) : confirmText}
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
