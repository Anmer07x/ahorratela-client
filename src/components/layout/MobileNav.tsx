import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Target, ArrowLeftRight, BarChart2, Settings, CalendarDays, HandCoins } from 'lucide-react'
import clsx from 'clsx'

const items = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Inicio' },
  { to: '/goals',        icon: Target,           label: 'Metas' },
  { to: '/transactions', icon: ArrowLeftRight,   label: 'Movimientos' },
  { to: '/monthly',      icon: CalendarDays,     label: 'Mensual' },
  { to: '/weekly',       icon: BarChart2,         label: 'Semanal' },
  { to: '/loans',        icon: HandCoins,        label: 'Préstamos' },
  { to: '/settings',     icon: Settings,          label: 'Config' },
]

export default function MobileNav() {
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 bg-surface-800/90 backdrop-blur-lg border-t border-white/5 z-40"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors',
                isActive ? 'text-brand-400' : 'text-slate-500 hover:text-slate-300'
              )
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
