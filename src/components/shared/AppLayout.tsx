import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { QrCode, Users, ScanLine, ClipboardList, FileText, Shield, Settings, LogOut, FileSpreadsheet, Menu, X } from 'lucide-react'

import { Button } from '../ui/Button'
import { supabase } from '../../lib/supabase/client'

const links = [
  { to: '/', label: 'Dashboard', icon: ClipboardList },
  { to: '/beneficiaries', label: 'Beneficiaries', icon: Users },
  { to: '/beneficiaries/import', label: 'Import XLSX', icon: FileSpreadsheet },
  { to: '/scanner', label: 'Scanner', icon: ScanLine },
  { to: '/attendance/daily', label: 'Daily Attendance', icon: QrCode },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/users', label: 'Users', icon: Shield },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export const AppLayout = () => {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const logout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="min-h-screen bg-zinc-100 text-black">
      <header className="sticky top-0 z-30 border-b-4 border-black bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-2 md:py-3">
          <Link to="/" className="font-heading text-sm uppercase tracking-wide md:text-lg">
            SPES QR ATT
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={logout} size="md" className="text-xs md:text-sm md:h-11">
              <LogOut className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden border-2 border-black bg-white p-2"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-3 p-2 md:gap-4 md:p-3 md:grid-cols-[200px,1fr] lg:grid-cols-[220px,1fr]">
        <aside
          className={`border-2 border-black bg-white p-2 fixed inset-0 top-20 z-20 md:static md:border-2 transition-transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <nav className="grid gap-1 md:gap-2">
            {links.map((link) => {
              const Icon = link.icon
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={closeSidebar}
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
