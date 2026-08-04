import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldIcon } from '../components/icons'
import { NAV_ITEMS } from '../components/navItems'
import { BRAND_NAME, theme } from '../theme'

const BAR_HEIGHTS = [55, 78, 62, 92, 70, 100, 84]

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) {
      setError('Please enter both your email and password.')
      return
    }
    setError('')
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      onLogin?.({ email })
      navigate('/', { replace: true })
    }, 700)
  }

  return (
    <div className={`flex min-h-screen w-full ${theme.page}`}>
      {/* Left panel */}
      <div className={`relative hidden w-1/2 flex-col justify-between overflow-hidden ${theme.gradient} px-12 py-10 lg:flex`}>
        <div className="flex items-center gap-2 text-white">
          <ShieldIcon />
          <span className="text-lg font-semibold">{BRAND_NAME}</span>
        </div>

        {/* Dashboard preview card */}
        <div className="mx-auto w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
          <div className="flex gap-4">
            <div className="flex flex-col gap-2">
              {NAV_ITEMS.map((item, i) => (
                <div
                  key={item.path}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    i === 0 ? theme.navActive : 'text-slate-300'
                  }`}
                >
                  <item.icon />
                </div>
              ))}
            </div>

            <div className="flex flex-1 flex-col gap-3 border-l border-slate-100 pl-4">
              <div className="h-2.5 w-16 rounded-full bg-slate-200" />
              <div className="flex gap-2">
                <div className="h-8 flex-1 rounded-lg bg-slate-100" />
                <div className="h-8 flex-1 rounded-lg bg-slate-100" />
                <div className="h-8 flex-1 rounded-lg bg-slate-100" />
              </div>
              <div className="h-px w-full bg-slate-100" />
              <div className="flex h-32 items-end gap-1.5">
                {BAR_HEIGHTS.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm bg-linear-to-b from-violet-400 to-indigo-400"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="text-white">
          <h2 className="text-2xl font-bold">CMS Dashboard</h2>
          <p className="mt-1 text-sm text-white/80">Manage your tenants in one place</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to manage your tenants</p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className={theme.input}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={theme.input}
              />
            </label>

            {error && (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-500">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className={`mt-2 flex items-center justify-center py-2.5 text-sm font-semibold ${theme.primaryButton}`}
            >
              {submitting ? 'Logging in…' : 'Log In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
