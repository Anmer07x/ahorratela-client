import { Outlet, useNavigate } from 'react-router-dom'
import { ExternalLink, Power, User } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'

export default function AppLayout() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const handleExitApp = () => {
    navigate('/login?exit=true')
  }

  return (
    <div className="flex min-h-screen bg-surface-900 text-slate-200">
      <Sidebar />
      <main className="flex-1 overflow-y-auto min-h-screen relative pb-24 md:pb-0">
        
        {/* Mobile Header (Solo visible en celular) */}
        <div className="md:hidden flex items-center justify-between px-4 pb-3 bg-surface-800/90 backdrop-blur-md border-b border-white/5 sticky top-0 z-30 shadow-xl"
          style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
        >
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 flex items-center justify-center bg-white/5 rounded-lg border border-white/5 shadow-sm overflow-hidden flex-shrink-0">
              <img src="/logo.png" alt="Logo" className="w-7 h-7 object-contain" />
            </div>
            <h1 className="font-bold text-slate-100 uppercase tracking-wide text-sm whitespace-nowrap">
              Ahorra<span style={{ color: '#8EDF3E' }}>Tela</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://www.linkedin.com/in/andr%C3%A9s-david-mena-renter%C3%ADa-b34463269/" target="_blank" rel="noopener noreferrer" className="text-xs font-medium flex items-center gap-1 hover:text-brand-300" style={{ color: '#8EDF3E' }}>
              Andrés Dev <ExternalLink className="w-3 h-3" />
            </a>
            <div className="w-9 h-9 rounded-full bg-surface-700 flex items-center justify-center flex-shrink-0 text-brand-400 overflow-hidden border border-white/10 shadow-glow-green relative">
              {user?.photoUrl ? (
                <img 
                  src={user.photoUrl} 
                  alt={user.displayName} 
                  className="w-full h-full object-cover block"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>
            <button 
              onClick={handleExitApp}
              className="p-2 text-slate-400 hover:text-brand-400 bg-white/5 rounded-lg border border-white/5"
            >
              <Power className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
          <Outlet />
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
