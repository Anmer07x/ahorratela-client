import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, User, ArrowRight, Loader2 } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { GoogleLogin } from '@react-oauth/google'
import api from '../lib/api'
import TermsModal from '../components/legal/TermsModal'

type Mode = 'login' | 'register'

export default function Login() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showTerms, setShowTerms] = useState(false)
  const { setAuth, isAuthenticated, user, setLoading } = useAuthStore()
  const navigate = useNavigate()
  const searchParams = new URLSearchParams(window.location.search)
  const isLocked = searchParams.get('exit') === 'true'

  const handleGoogleLogin = async (credential: string) => {
    setIsLoading(true)
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/auth/google', { token: credential })
      if (data.success) {
        setAuth(data.data.user, data.data.accessToken, data.data.refreshToken)
        navigate('/dashboard')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión con Google')
    } finally {
      setIsLoading(false)
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    setLoading(true)
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register'
      const payload = mode === 'register'
        ? { email, password, displayName }
        : { email, password }
      const res = await api.post(endpoint, payload)
      const { user, accessToken, refreshToken } = res.data.data
      setAuth(user, accessToken, refreshToken)
      navigate('/dashboard')
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error de conexión'
      const fieldErrors = err.response?.data?.errors
      if (fieldErrors?.length) {
        setError(fieldErrors.map((e: any) => e.message).join(', '))
      } else {
        setError(msg)
      }
    } finally {
      setIsLoading(false)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center p-4">
      {/* Animated Wave Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden bg-surface-900">
        <svg className="absolute bottom-0 w-[200vw] h-[60vh] opacity-40 animate-wave-slow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="#10b981" fillOpacity="0.15" d="M0,160L48,170.7C96,181,192,203,288,181.3C384,160,480,96,576,90.7C672,85,768,139,864,165.3C960,192,1056,192,1152,165.3C1248,139,1344,85,1392,58.7L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          <path fill="#34d399" fillOpacity="0.2" d="M0,256L48,229.3C96,203,192,149,288,154.7C384,160,480,224,576,218.7C672,213,768,139,864,128C960,117,1056,171,1152,197.3C1248,224,1344,224,1392,224L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
        <svg className="absolute bottom-0 w-[200vw] h-[55vh] opacity-30 animate-wave-fast" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="#059669" fillOpacity="0.25" d="M0,64L60,74.7C120,85,240,107,360,128C480,149,600,171,720,165.3C840,160,960,128,1080,112C1200,96,1320,96,1380,96L1440,96L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
        </svg>
        <div className="absolute -top-40 -left-20 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-1/2 -right-20 w-80 h-80 bg-brand-700/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md space-y-6 animate-slide-up relative z-10">
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="AhorraTela Logo" className="w-32 h-32 object-contain animate-float drop-shadow-[0_0_20px_#8EDF3E]" />
          </div>
          <div>
            <p className="text-brand-400 font-semibold tracking-wide text-sm uppercase mb-1">¡Bienvenido!</p>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Ahorra<span style={{ color: '#8EDF3E' }}>Tela</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Tu futuro financiero comienza aquí</p>
          </div>
        </div>

        {/* Card */}
        <div className="card p-8 space-y-6">
          {isAuthenticated && isLocked ? (
            <div className="space-y-6 animate-fade-in text-center py-4">
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-brand-500/10 flex items-center justify-center border border-brand-500/20 shadow-glow-green">
                  {user?.photoUrl ? (
                    <img src={user.photoUrl} alt="Perfil" className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User className="w-10 h-10 text-brand-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">¡Hola de nuevo!</h3>
                  <p className="text-slate-400 text-sm">{user?.displayName || user?.email}</p>
                </div>
              </div>

              <button
                onClick={() => navigate('/dashboard')}
                className="btn-primary w-full py-4 text-base gap-2 group"
              >
                Continuar a mi cuenta <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => {
                  useAuthStore.getState().logout()
                  navigate('/login', { replace: true })
                }}
                className="text-xs text-slate-500 hover:text-red-400 transition-colors uppercase tracking-widest font-semibold"
              >
                Cerrar sesión definitivamente
              </button>
            </div>
          ) : (
            <>
              {/* Tab switcher */}
              <div className="flex bg-surface-900/60 rounded-xl p-1 gap-1">
                <button
                  onClick={() => { setMode('login'); setError('') }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    mode === 'login'
                      ? 'bg-brand-500 text-white shadow-glow-green'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Entrar
                </button>
                <button
                  onClick={() => { setMode('register'); setError('') }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    mode === 'register'
                      ? 'bg-brand-500 text-white shadow-glow-green'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Registrarse
                </button>
              </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name field (register only) */}
            {mode === 'register' && (
              <div className="animate-fade-in">
                <label className="input-label">Nombre</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    className="input pl-10"
                    placeholder="Tu nombre"
                    required={mode === 'register'}
                  />
                </div>
              </div>
            )}
            <div>
              <label className="input-label">Correo electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="correo@ejemplo.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="input-label">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input pl-10 pr-10"
                  placeholder={mode === 'register' ? 'Mínimo 8 caracteres, 1 mayúscula, 1 número' : '••••••••'}
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm animate-fade-in">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              id="submit-btn"
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3 text-base gap-2"
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Procesando...</>
              ) : (
                <>{mode === 'login' ? 'Entrar' : 'Crear cuenta'} <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="relative mt-6 mb-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
            <div className="relative flex justify-center text-sm"><span className="bg-surface-800/80 px-2 text-slate-500">Inicia rápidamente con</span></div>
          </div>
          
          <div className="flex justify-center mb-6">
            <GoogleLogin
              onSuccess={res => { if (res.credential) handleGoogleLogin(res.credential) }}
              onError={() => setError('Conexión anulada')}
              theme="filled_black"
              shape="pill"
            />
          </div>



          {mode === 'register' && (
            <p className="text-xs text-slate-500 text-center">
              Al registrarte aceptas nuestros{' '}
              <span 
                onClick={() => setShowTerms(true)}
                className="text-brand-400 cursor-pointer hover:underline"
              >
                términos de uso
              </span>
            </p>
          )}

          <TermsModal 
            isOpen={showTerms}
            onClose={() => setShowTerms(false)}
          />
          </>
        )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center bg-surface-900/40 backdrop-blur-md rounded-2xl p-4 border border-white/5 space-y-2">
          <p className="text-sm font-medium text-slate-400">
            Diseñado y desarrollado por
          </p>
          <a
            href="https://www.linkedin.com/in/andr%C3%A9s-david-mena-renter%C3%ADa-b34463269/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center font-bold hover:text-brand-300 transition-colors text-lg rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            style={{ color: '#8EDF3E' }}
          >
            Andrés Dev
            <svg className="w-4 h-4 ml-1 mb-1" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
          </a>
        </div>
      </div>
    </div>
  )
}
