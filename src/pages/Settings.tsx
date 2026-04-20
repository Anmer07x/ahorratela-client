import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, User, Save, Percent, Bell, BellOff, Loader2 } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import api from '../lib/api'

// Helper para convertir la llave VAPID pública
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const VAPID_PUBLIC_KEY = 'BMfuCYoO9bd-TfaQAmWIbpN6cDSOlKtn7F9zzfaY81S2fK3OqYYWzq2zfNlZ70Uo5KcTiKbn3UKCf1A4jCGoyCY';

export default function Settings() {
  const { user, updateUser } = useAuthStore()
  const [formData, setFormData] = useState({
    displayName: '',
    savingsPercentage: 30
  })
  const [loading, setLoading] = useState(false)
  const [notifLoading, setNotifLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        savingsPercentage: user.savingsPercentage || 30
      })
    }
    checkNotificationSubscription()
  }, [user])

  const checkNotificationSubscription = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    }
  }

  const handleToggleNotifications = async () => {
    setNotifLoading(true)
    try {
      if (isSubscribed) {
        // Unsubscribe
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await api.post('/notifications/unsubscribe', { subscription });
          await subscription.unsubscribe();
          setIsSubscribed(false);
          setMessage({ type: 'success', text: 'Notificaciones desactivadas' });
        }
      } else {
        // Subscribe
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          throw new Error('Permiso de notificaciones denegado');
        }

        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });

        await api.post('/notifications/subscribe', { subscription });
        setIsSubscribed(true);
        setMessage({ type: 'success', text: '¡Genial! Recibirás los consejos diarios' });
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Error con las notificaciones' });
    } finally {
      setNotifLoading(false)
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })
    try {
      const res = await api.patch('/auth/profile', formData)
      updateUser(res.data.data)
      setMessage({ type: 'success', text: 'Perfil actualizado exitosamente' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error al actualizar perfil' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <SettingsIcon className="text-brand-400" /> Configuración
        </h2>
        <p className="text-slate-400 text-sm mt-1">Administra tu perfil y preferencias de ahorro</p>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold border-b border-white/5 pb-4 mb-6">Perfil de Usuario</h3>
        
        {message.text && (
          <div className={`p-4 rounded-xl mb-6 text-sm flex items-center gap-2 animate-fade-in ${
            message.type === 'success' ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' : 
            'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            <span className="flex-1">{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="input-label">Nombre para mostrar</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                required
                type="text"
                className="input pl-10"
                value={formData.displayName}
                onChange={e => setFormData({ ...formData, displayName: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="input-label">Porcentaje de ahorro recomendado (%)</label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                required
                type="number"
                min="0"
                max="100"
                className="input pl-10"
                value={formData.savingsPercentage}
                onChange={e => setFormData({ ...formData, savingsPercentage: parseInt(e.target.value) })}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Se utiliza para calcular tu "Ahorro Esperado" en el control semanal (ej: 30% de tus ingresos).
            </p>
          </div>

          <div className="pt-4 border-t border-white/5 flex justify-end">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Guardando...' : <><Save className="w-4 h-4" /> Guardar Cambios</>}
            </button>
          </div>
        </form>
      </div>

      {/* Sección de Notificaciones */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold border-b border-white/5 pb-4 mb-6">Preferencias de Alertas</h3>
        
        <div className="flex items-center gap-4 bg-surface-900/40 p-5 rounded-2xl border border-white/5 group hover:border-brand-500/20 transition-all">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
            isSubscribed ? 'bg-brand-500/10 text-brand-400 shadow-glow-green' : 'bg-white/5 text-slate-500'
          }`}>
            {isSubscribed ? <Bell className="w-6 h-6" /> : <BellOff className="w-6 h-6" />}
          </div>
          
          <div className="flex-1">
            <h4 className="font-bold text-slate-200">Consejos Diarios</h4>
            <p className="text-xs text-slate-500 mt-1">Recibe un consejo financiero cada mañana en tu celular.</p>
          </div>

          <button
            onClick={handleToggleNotifications}
            disabled={notifLoading}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
              isSubscribed 
                ? 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20' 
                : 'bg-brand-500 text-white shadow-glow-green hover:scale-105 active:scale-95'
            } disabled:opacity-50`}
          >
            {notifLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isSubscribed ? (
              'Desactivar'
            ) : (
              'Activar'
            )}
          </button>
        </div>
        {!('serviceWorker' in navigator) && (
          <p className="text-[10px] text-red-400 mt-4 text-center">
            Tu navegador no soporta notificaciones push.
          </p>
        )}
        <p className="text-[10px] text-slate-500 mt-4 italic">
          💡 Nota: Si estás en iPhone, recuerda haber agregado la app a tu pantalla de inicio primero.
        </p>
      </div>
    </div>
  )
}
