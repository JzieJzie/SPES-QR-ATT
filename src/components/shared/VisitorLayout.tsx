import { Link, NavLink, Outlet } from 'react-router-dom'
import { ClipboardList, MapPinned, LogIn } from 'lucide-react'

const links = [
  { to: '/visitor', label: 'Dashboard', icon: ClipboardList },
  { to: '/visitor/barangay-map', label: 'Barangay Map', icon: MapPinned },
]

export const VisitorLayout = () => {
  return (
    <div className="min-h-screen bg-zinc-100 text-black">
      <header className="sticky top-0 z-30 border-b-4 border-black bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-2 md:py-3">
          <Link to="/visitor" className="font-heading text-sm uppercase tracking-wide md:text-lg">
            SPES QR ATT - Visitor
          </Link>
          <Link to="/login" className="inline-flex items-center gap-1 border-2 border-black bg-white px-3 py-2 text-xs font-medium md:text-sm">
            <LogIn className="h-4 w-4" />
            Login
          </Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-3 p-2 md:gap-4 md:p-3 md:grid-cols-[200px,1fr] lg:grid-cols-[220px,1fr]">
        <aside className="border-2 border-black bg-white p-2">
          <nav className="grid gap-1 md:gap-2">
            {links.map((link) => {
              const Icon = link.icon
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-2 border-2 border-black px-2 py-2 text-xs font-medium md:text-sm md:px-3',
                      isActive ? 'bg-black text-white' : 'bg-white text-black',
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
