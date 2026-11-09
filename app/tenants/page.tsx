'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft, Building2, ChevronDown, ChevronRight, LayoutDashboard, Menu, WalletCards, X } from 'lucide-react'
import { PlatformLogin } from '@/components/platform-login'
import { PlatformRecords } from '@/components/platform-records'
import { ApiError, apiBaseUrl, getPlatformUser, platformLogin, platformLogout, type PlatformUser } from '@/lib/platform-api'

type AuthStatus = 'checking' | 'signed-out' | 'signed-in'
const PAYROLL_APP_URL = process.env.NEXT_PUBLIC_PAYROLL_APP_URL ?? 'http://localhost:3000'

export default function TenantsPage() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('checking')
  const [user, setUser] = useState<PlatformUser | null>(null)
  const [authError, setAuthError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('super-admin-theme')
    document.documentElement.classList.toggle('dark', savedTheme === 'dark')
  }, [])

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

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="brand"><div className="brand-mark"><Building2 size={17} /></div><span>ERP Management</span><span className="brand-badge">ADMIN</span><button className="mobile-close" onClick={() => setSidebarOpen(false)} aria-label="Close menu"><X size={18} /></button></div>
        <div className="workspace-switch"><div className="workspace-logo">E</div><div><strong>Platform workspace</strong><small>Super Admin</small></div><ChevronDown size={15} /></div>
        <nav><span className="nav-label">Workspace</span>
          <Link href="/" className="nav-item"><LayoutDashboard size={17} /><span>Overview</span></Link>
          <Link href="/tenants" className="nav-item active" aria-current="page"><Building2 size={17} /><span>Tenants</span></Link>
        </nav>
        <div className="sidebar-bottom">
          <a className="nav-item payroll-app-link" href={PAYROLL_APP_URL} target="_blank" rel="noreferrer"><WalletCards size={17} /><span>Open Payroll Flow</span><ChevronRight size={14} /></a>
          <div className="help-card"><div className="help-icon"><Building2 size={17} /></div><div><strong>Backend connected</strong><small>{new URL(apiBaseUrl).host}</small></div></div>
          <div className="profile"><div className="profile-avatar">{(user?.full_name || user?.email || 'SA').slice(0, 1).toUpperCase()}</div><div><strong>{user?.full_name || user?.email}</strong><small>{user?.role || (user?.is_superuser ? 'Super Admin' : 'Platform staff')}</small></div></div>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <button className="menu-button" onClick={() => setSidebarOpen(true)} aria-label="Open menu"><Menu size={20} /></button>
          <div className="breadcrumbs"><Link href="/">ERP Management</Link><ChevronRight size={14} /><strong>Tenants</strong></div>
          <div className="top-actions"><span className="command-search">{user?.email}</span><button className="top-avatar" title="Sign out" onClick={() => void signOut()}>{(user?.full_name || user?.email || 'SA').slice(0, 1).toUpperCase()}</button></div>
        </header>
        <div className="page-content">
          <div className="page-heading"><div><div className="eyebrow">Super Admin / Workspace</div><h1>Tenants</h1><p>Organizations registered on your platform.</p></div><Link href="/" className="outline-button"><ArrowLeft size={15} />Overview</Link></div>
          <PlatformRecords section="Tenants" />
        </div>
      </main>
    </div>
  )
}