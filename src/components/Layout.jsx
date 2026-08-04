import { NavLink, Outlet } from 'react-router-dom'
import { ShieldIcon } from './icons'
import { NAV_ITEMS } from './navItems'
import { BRAND_NAME, theme } from '../theme'

export default function Layout({ user, onLogout }) {
  return (
    <div className={`flex min-h-screen w-full ${theme.page}`}>
      <aside className="flex w-56 flex-col justify-between border-r border-slate-100 px-4 py-6">
        <div>
          <div className="flex items-center gap-2 px-2 text-indigo-600">
            <ShieldIcon width={22} height={22} />
            <span className="text-sm font-semibold">{BRAND_NAME}</span>
          </div>

          <nav className="mt-8 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive ? theme.navActive : theme.navInactive
                  }`
                }
              >
                <item.icon />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <button
          onClick={onLogout}
          className={`px-3 py-2 text-sm ${theme.secondaryButton}`}
        >
          Sign out
        </button>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-end border-b border-slate-100 px-8 py-4">
          <span className="text-sm text-slate-500">{user?.email}</span>
        </header>

        <main className="flex-1 px-8 py-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
