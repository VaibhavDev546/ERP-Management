'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  Building2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  CreditCard,
  FileCog,
  LayoutDashboard,
  Menu,
  Moon,
  MoreHorizontal,
  Package,
  Search,
  Settings,
  Sparkles,
  Sun,
  Users,
  WalletCards,
  X,
} from 'lucide-react'
import { PlatformLogin } from '@/components/platform-login'
import { ApiError, apiBaseUrl, getPlatformUser, platformLogin, platformLogout, type PlatformUser } from '@/lib/platform-api'

export type Section =
  | 'Overview'
  | 'Tenants'
  | 'Field Management'
  | 'Module Management'
  | 'Plan Management'
  | 'Subscription Management'
  | 'User Management'
  | 'Settings'

type Theme = 'light' | 'dark'

export const sections: { label: Section; href: string; icon: typeof LayoutDashboard }[] = [
  { label: 'Overview', href: '/', icon: LayoutDashboard },
  { label: 'Tenants', href: '/tenants', icon: Building2 },
  { label: 'Field Management', href: '/fields', icon: FileCog },
  { label: 'Module Management', href: '/modules', icon: Package },
  { label: 'Plan Management', href: '/plans', icon: ClipboardList },
  { label: 'Subscription Management', href: '/subscriptions', icon: CreditCard },
  { label: 'User Management', href: '/users', icon: Users },
  { label: 'Settings', href: '/settings', icon: Settings },
]

export const sectionDescriptions: Record<Section, string> = {
  Overview: 'A live view of your platform performance.',
  Tenants: 'Organizations registered on your platform.',
  'Field Management': 'Custom fields configured in the backend.',
  'Module Management': 'Backend product modules and dependencies.',
  'Plan Management': 'Subscription plans configured for your platform.',
  'Subscription Management': 'Tenant subscriptions and billing periods.',
  'User Management': 'Platform staff accounts.',
  Settings: 'Platform-wide backend settings.',
}

const PAYROLL_APP_URL = process.env.NEXT_PUBLIC_PAYROLL_APP_URL ?? 'http://localhost:3000'

type SuperAdminContextValue = {
  user: PlatformUser | null
  signOut: () => Promise<void>
}

const SuperAdminContext = createContext<SuperAdminContextValue | null>(null)

export function useSuperAdmin() {
  const context = useContext(SuperAdminContext)
  if (!context) throw new Error('useSuperAdmin must be used within SuperAdminShell.')
  return context
}

export function SectionPageHeading({ section }: { section: Exclude<Section, 'Overview'> }) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">Super Admin / Workspace</div>
        <h1>{section}</h1>
        <p>{sectionDescriptions[section]}</p>
      </div>
    </div>
  )
}

export function SuperAdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [theme, setTheme] = useState<Theme>('light')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [authStatus, setAuthStatus] = useState<'checking' | 'signed-out' | 'signed-in'>('checking')
  const [user, setUser] = useState<PlatformUser | null>(null)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    const saved = window.localStorage.getItem('super-admin-theme') as Theme | null
    if (saved) setTheme(saved)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    window.localStorage.setItem('super-admin-theme', theme)
  }, [theme])

  useEffect(() => {
    let active = true
    getPlatformUser().then(currentUser => {
      if (!active) return
      setUser(currentUser)
      setAuthStatus('signed-in')
    }).catch(error => {
      if (!active) return
      if (!(error instanceof ApiError && error.status === 401)) {
        setAuthError(error instanceof Error ? error.message : `Could not connect to ${apiBaseUrl}.`)
      }
      setAuthStatus('signed-out')
    })
    return () => { active = false }
  }, [])

  async function signIn(email: string, password: string) {
    setAuthError('')
    await platformLogin(email, password)
    const currentUser = await getPlatformUser()
    setUser(currentUser)
    setAuthStatus('signed-in')
  }

  async function signOut() {
    try {
      await platformLogout()
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'The backend could not end the session.')
    } finally {
      setUser(null)
      setAuthStatus('signed-out')
    }
  }

  if (authStatus === 'checking') {
    return <main className="login-page"><p className="muted">Connecting to the backend…</p></main>
  }
  if (authStatus === 'signed-out') return <PlatformLogin error={authError} onLogin={signIn} />

  const active = sections.find(item => item.href === pathname)?.label
  const avatarInitials = (user?.full_name || user?.email || 'SA').split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase()

  return (
    <SuperAdminContext.Provider value={{ user, signOut }}>
      <div className="app-shell">
        <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="brand"><div className="brand-mark"><Sparkles size={17} /></div><span>ERP Management</span><span className="brand-badge">ADMIN</span><button className="mobile-close" onClick={() => setSidebarOpen(false)} aria-label="Close menu"><X size={18} /></button></div>
          <div className="workspace-switch"><div className="workspace-logo">E</div><div><strong>Platform workspace</strong><small>Super Admin</small></div><ChevronDown size={15} /></div>
          <nav>
            <span className="nav-label">Workspace</span>
            {sections.map(({ label, href, icon: Icon }) => (
              <Link key={label} href={href} className={`nav-item ${pathname === href ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                <Icon size={17} /><span>{label}</span>
              </Link>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <a className="nav-item payroll-app-link" href={PAYROLL_APP_URL} target="_blank" rel="noreferrer"><WalletCards size={17} /><span>Open Payroll Flow</span><ChevronRight size={14} /></a>
            <div className="help-card"><div className="help-icon"><CircleHelp size={17} /></div><div><strong>Backend connected</strong><small>{new URL(apiBaseUrl).host}</small></div></div>
            <div className="profile"><div className="profile-avatar">{avatarInitials}</div><div><strong>{user?.full_name || user?.email}</strong><small>{user?.role || (user?.is_superuser ? 'Super Admin' : 'Platform staff')}</small></div><button className="icon-button logout-button" onClick={() => void signOut()} title="Sign out" aria-label="Sign out"><MoreHorizontal size={17} /></button></div>
          </div>
        </aside>
        <main className="main-content">
          <header className="topbar">
            <button className="menu-button" onClick={() => setSidebarOpen(true)} aria-label="Open menu"><Menu size={20} /></button>
            <div className="breadcrumbs"><Link href="/">ERP Management</Link><ChevronRight size={14} /><strong>{active}</strong></div>
            <div className="top-actions">
              <div className="command-search"><Search size={16} /><span>{user?.email}</span></div>
              <button className="top-icon" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label="Toggle theme">{theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}</button>
              <button className="top-avatar" title="Sign out" onClick={() => void signOut()}>{(user?.full_name || user?.email || 'SA').slice(0, 1).toUpperCase()}</button>
            </div>
          </header>
          {children}
        </main>
      </div>
    </SuperAdminContext.Provider>
  )
}
