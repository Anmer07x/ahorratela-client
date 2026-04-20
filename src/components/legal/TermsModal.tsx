import React from 'react'
import { X, ShieldCheck, Lock, EyeOff, ScrollText } from 'lucide-react'

interface TermsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-500/10 rounded-lg text-brand-400">
              <ScrollText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Términos de Uso</h2>
              <p className="text-xs text-slate-400">Última actualización: Abril 2026</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-white/5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {/* Privacy Note */}
          <div className="p-4 bg-brand-500/5 border border-brand-500/10 rounded-xl flex gap-4">
            <ShieldCheck className="w-6 h-6 text-brand-400 flex-shrink-0" />
            <div className="text-sm">
              <h3 className="font-semibold text-brand-400 mb-1">Tu privacidad es nuestra prioridad</h3>
              <p className="text-slate-300 leading-relaxed">
                Tus datos financieros viajan y se almacenan bajo cifrado de grado bancario (AES-256). 
                Ni siquiera nosotros como desarrolladores podemos ver tus montos de dinero directamente en la base de datos.
              </p>
            </div>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Lock className="w-4 h-4 text-brand-400" />
              1. Protección de Datos
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              <strong>AhorraTela</strong> utiliza tecnología de cifrado asimétrico para asegurar que la información 
              de tus cuentas, metas y ahorros sea confidencial. La aplicación solo descifra esta información en tu sesión 
              activa para mostrarte tus reportes y balances.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-brand-400" />
              2. Confidencialidad Bancaria
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Nos comprometemos a no compartir, vender ni analizar tu comportamiento financiero con fines 
              publicitarios de terceros. Los datos ingresados son exclusivamente para tu gestión personal 
              de ahorro y visualización de metas.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <ScrollText className="w-4 h-4 text-brand-400" />
              3. Responsabilidad del Usuario
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              <strong>AhorraTela</strong> es una herramienta de gestión y no proporciona asesoría financiera 
              legal o profesional. Los cálculos proyectados son herramientas de ayuda y el usuario es el 
              único responsable de sus decisiones económicas.
            </p>
          </section>

          {/* Footer of modal */}
          <div className="pt-6 border-t border-white/5">
            <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest font-bold">
              Desarrollado con seguridad por Andrés Dev
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-900/50 border-t border-white/5 text-right">
          <button 
            onClick={onClose}
            className="btn-primary"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}
