import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { QrCode, Users, ScanLine, ClipboardList, FileText, Shield, Settings, LogOut, FileSpreadsheet } from 'lucide-react'

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

  const logout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-zinc-100 text-black">
      <header className="sticky top-0 z-20 border-b-4 border-black bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-3">
          <Link to="/" className="font-heading text-lg uppercase tracking-wide">
            SPES QR ATTENDANCE
          </Link>
          <Button variant="outline" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-4 p-3 md:grid-cols-[220px,1fr]">
        <aside className="border-2 border-black bg-white p-2">
          <nav className="grid gap-2">
            {links.map((link) => {
              const Icon = link.icon
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-2 border-2 border-black px-3 py-2 text-sm font-medium',
                      isActive ? 'bg-black text-white' : 'bg-white text-black',
                    ].join(' ')
                  }
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </NavLink>
              )
            })}
          </nav>
        </aside>
        <section className="space-y-4">
          <Outlet />
        </section>
      </main>
    </div>
  )
}
