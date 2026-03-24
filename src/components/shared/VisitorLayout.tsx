import { Link, NavLink, Outlet } from 'react-router-dom'
import { ClipboardList, MapPinned, LogIn, Moon, Sun } from 'lucide-react'

import { useTheme } from '../../lib/theme/ThemeContext'

const links = [
  { to: '/visitor', label: 'Dashboard', icon: ClipboardList },
  { to: '/visitor/barangay-map', label: 'Barangay Map', icon: MapPinned },
]

export const VisitorLayout = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <header className="sticky top-0 z-30 border-b-4 border-black dark:border-white bg-white dark:bg-black">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-2 md:py-3">
          <Link to="/visitor" className="font-heading text-sm uppercase tracking-wide md:text-lg">
            SPES QR ATT - Visitor
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="border-2 border-black dark:border-white bg-white dark:bg-black p-2 text-black dark:text-white transition hover:opacity-80"
              aria-label="Toggle theme"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
            <Link to="/login" className="inline-flex items-center gap-1 border-2 border-black dark:border-white bg-white dark:bg-black px-3 py-2 text-xs font-medium md:text-sm text-black dark:text-white">
              <LogIn className="h-4 w-4" />
              Login
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-3 p-2 md:gap-4 md:p-3 md:grid-cols-[200px,1fr] lg:grid-cols-[220px,1fr]">
        <aside className="border-2 border-black dark:border-white bg-white dark:bg-black p-2">
          <nav className="grid gap-1 md:gap-2">
            {links.map((link) => {
              const Icon = link.icon
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-2 border-2 border-black dark:border-white px-2 py-2 text-xs font-medium md:text-sm md:px-3',
                      isActive ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-white dark:bg-black text-black dark:text-white',
                    ].join(' ')
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span className="truncate">{link.label}</span>
                </NavLink>
              )
            })}
          </nav>
        </aside>

        <section className="space-y-3 md:space-y-4">
          <Outlet />
        </section>
      </main>
    </div>
  )
}
