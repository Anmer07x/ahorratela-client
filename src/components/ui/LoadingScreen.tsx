import { Target, Lightbulb } from 'lucide-react'
import { getRandomTip } from '../../utils/tips'
import { useState, useEffect } from 'react'

export default function LoadingScreen({ message = 'Cargando...' }: { message?: string }) {
  const [tip, setTip] = useState('')

  useEffect(() => {
    setTip(getRandomTip())
  }, [])
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-surface-950 overflow-hidden">
      {/* Background blobs for depth */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] animate-pulse delay-700" />

      <div className="relative flex flex-col items-center space-y-8 animate-fade-in">
        {/* Raw Logo - No Background */}
        <div className="relative animate-float">
          <img
            src="/logo.png"
            alt="AhorraTela Logo"
            className="w-32 h-32 object-contain drop-shadow-[0_0_15px_#8EDF3E60]"
          />
        </div>

        {/* Loading text and indicator */}
        <div className="text-center space-y-4">
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-bold text-slate-100 flex items-center ">
              Ahorra<span style={{ color: '#8EDF3E' }}>Tela</span>
            </h2>
            <div className="flex items-center gap-2 mt-4 max-w-xs mx-auto px-4 py-2 bg-brand-500/10 border border-brand-500/20 rounded-xl animate-fade-in group">
              <Lightbulb className="w-4 h-4 text-brand-400 shrink-0 group-hover:animate-pulse" />
              <p className="text-slate-300 text-xs italic leading-tight text-left">
                {tip || message}
              </p>
            </div>
          </div>

          {/* Progress bar simulation */}
          <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-brand-500 animate-shimmer" style={{ width: '60%', borderRadius: 'inherit' }} />
          </div>
        </div>
      </div>

      {/* Footer Text */}
      <div className="absolute bottom-10 flex flex-col items-center gap-1 opacity-60">
        <span className="text-slate-500 text-[10px] tracking-[0.8em] uppercase font-bold">Consejos para el ahorro</span>
        <div className="w-8 h-0.5 bg-brand-500 rounded-full" />
      </div>
    </div>
  )
}
