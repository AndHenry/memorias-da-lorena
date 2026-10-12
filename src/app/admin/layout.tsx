'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Images, Settings, QrCode, LogOut, Star, Menu, X } from 'lucide-react'
import StarField from '@/components/ui/StarField'
import { supabase } from '@/lib/supabase/client'

const navItems = [
  { href: '/admin/dashboard',       icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/galeria',         icon: Images,          label: 'Galeria' },
  { href: '/admin/configuracoes',   icon: Settings,        label: 'Configurações' },
  { href: '/admin/qrcode',          icon: QrCode,          label: 'QR Code' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authChecked, setAuthChecked] = useState(false)
  const [isAuth, setIsAuth] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user && pathname !== '/admin/login') {
        router.replace('/admin/login')
      } else {
        setIsAuth(!!user)
      }
      setAuthChecked(true)
    })
  }, [pathname, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  if (!authChecked) return null
  if (!isAuth && pathname !== '/admin/login') return null

  if (pathname === '/admin/login') return <>{children}</>

  return (
    <div className="flex min-h-screen">
      <StarField count={50} />

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`admin-sidebar fixed md:sticky top-0 z-50 transition-transform duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        style={{ height: '100vh' }}
      >
        {/* Logo */}
        <div className="px-6 py-6 border-b" style={{ borderColor: 'var(--glass-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(244,208,63,0.15)', border: '1px solid rgba(244,208,63,0.3)' }}>
              <Star size={16} style={{ color: 'var(--star-gold)' }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--star-gold)' }}>Memórias da Lorena</p>
              <p className="text-xs text-muted">Painel Admin</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto" aria-label="Menu administrativo">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={`admin-nav-item ${pathname === href ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t" style={{ borderColor: 'var(--glass-border)' }}>
          <button onClick={handleLogout} className="admin-nav-item w-full text-left"
            style={{ color: '#f87171' }}>
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-0 relative z-10">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-5 py-4 md:hidden"
          style={{ background: 'rgba(6,10,24,0.95)', borderBottom: '1px solid var(--glass-border)', backdropFilter: 'blur(20px)' }}>
          <p className="font-semibold text-sm" style={{ color: 'var(--star-gold)' }}>Admin</p>
          <button onClick={() => setMobileOpen((v) => !v)} aria-label="Menu">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </header>

        <main className="flex-1 p-5 md:p-8">{children}</main>
      </div>
    </div>
  )
}
