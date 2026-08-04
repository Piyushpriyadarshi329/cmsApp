import { theme } from '../theme'

const STATS = [
  { label: 'Active contracts', value: '128' },
  { label: 'Pending renewals', value: '14' },
  { label: 'Tenants', value: '32' },
]

export default function Home({ user }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">
        Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}
      </h1>
      <p className="mt-1 text-sm text-slate-500">Here's what's happening with your contracts today.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {STATS.map((stat) => (
          <div key={stat.label} className={`${theme.card} p-5`}>
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
