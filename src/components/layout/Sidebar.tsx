import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Target, ArrowLeftRight, BarChart2,
  Settings, LogOut, ChevronRight, User, ExternalLink, Power, CalendarDays
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import api from '../../lib/api'
import clsx from 'clsx'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/goals', icon: Target, label: 'Metas de ahorro' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Movimientos' },
  { to: '/weekly', icon: BarChart2, label: 'Control semanal' },
  { to: '/monthly', icon: CalendarDays, label: 'Mes a mes' },
  { to: '/settings', icon: Settings, label: 'Configuración' },
]

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try { await api.post('/auth/logout') } catch { }
    logout()
    navigate('/login')
  }

  const handleExitApp = () => {
    // Navigate to login with exit flag, keeping tokens in store
    navigate('/login?exit=true')
  }

  return (
    <aside className="hidden md:flex flex-col w-[260px] shrink-0 bg-surface-800/60 backdrop-blur-md border-r border-white/5 h-screen sticky top-0 z-40 overflow-hidden">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-white/5">
        <div className="w-12 h-12 flex items-center justify-center">
          <img src="/logo.png" alt="AhorraFlow Logo" className="w-full h-full object-contain drop-shadow-[0_0_8px_#8EDF3E]" />
        </div>
        <div>
          <h1 className="font-bold text-slate-100 leading-none tracking-tight">
            Ahorra<span style={{ color: '#8EDF3E' }}>Tela</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Gestión financiera</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto no-scrollbar">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(isActive ? 'sidebar-item-active' : 'sidebar-item')
            }
          >
            <Icon className="w-4.5 h-4.5 shrink-0" />
            <span className="flex-1">{label}</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-0 group-[.sidebar-item-active]:opacity-100 transition-opacity" />
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="p-4 border-t border-white/5 bg-surface-900/50 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center flex-shrink-0 text-brand-400 overflow-hidden border border-white/5 shadow-glow-green">
            {user?.photoUrl ? (
              <img src={user.photoUrl} alt={user.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <User className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{user?.displayName || 'Invitado'}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email || 'Sin conexión'}</p>
          </div>
          <div className="flex gap-1.5 shrink-0">
            <button
              onClick={handleExitApp}
              title="Salir de la aplicación"
              className="btn-icon hover:text-brand-400 hover:bg-brand-500/10 hover:border-brand-500/20"
            >
              <Power className="w-3.5 h-3.5" />
            </button>
            <button
              id="logout-btn"
              onClick={handleLogout}
              title="Cerrar sesión (Borrar datos)"
              className="btn-icon hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <p className="text-center text-xs text-slate-500 pt-2 border-t border-white/5">
          Desarrollado por{' '}
          <a href="https://www.linkedin.com/in/andr%C3%A9s-david-mena-renter%C3%ADa-b34463269/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-300 font-semibold transition-colors mt-1 flex items-center justify-center" style={{ color: '#8EDF3E' }}>
            Andrés Dev
            <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </p>
      </div>
    </aside>
  )
}
