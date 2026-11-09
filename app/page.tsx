'use client'

import { useEffect, useState } from 'react'
import {
  ArrowDownRight,
  ArrowUpRight,
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
  Zap,
} from 'lucide-react'
import { ModuleManagement } from '@/components/module-management'
import { PlatformLogin } from '@/components/platform-login'
import { PlatformRecords } from '@/components/platform-records'
import { ApiError, apiBaseUrl, getPlatformList, getPlatformUser, platformLogin, platformLogout, platformRequest, type PlatformUser } from '@/lib/platform-api'

type Section = 'Overview' | 'Tenants' | 'Field Management' | 'Module Management' | 'Plan Management' | 'Subscription Management' | 'User Management' | 'Settings'
type Theme = 'light' | 'dark'
type Tenant = { id: string; name: string; slug: string; email: string; status: string; created_at: string }
type TenantApiRecord = { id: string; name: string; slug: string; contact_email: string; status: string; created_at: string }
type Analytics = {
  tenants: Record<string, number>
  subscriptions: Record<string, number>
  mrr: Record<string, number>
  active_employees: number
  new_tenants_30d: number
  open_tickets: number
}

const navigation: { label: Section; icon: typeof LayoutDashboard }[] = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Tenants', icon: Building2 },
  { label: 'Field Management', icon: FileCog },
  { label: 'Module Management', icon: Package },
  { label: 'Plan Management', icon: ClipboardList },
  { label: 'Subscription Management', icon: CreditCard },
  { label: 'User Management', icon: Users },
  { label: 'Settings', icon: Settings },
]

const sectionDescriptions: Record<Section, string> = {
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

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase()
  const style = normalized === 'active' ? 'status-active' : normalized === 'trial' || normalized === 'trialing' ? 'status-trial' : normalized === 'suspended' ? 'status-suspended' : 'status-neutral'
  return <span className={`status-badge ${style}`}><span className="status-dot" />{status}</span>
}

function MetricCard({ icon: Icon, label, value, trend, positive = true, accent, context }: {
  icon: typeof Users
  label: string
  value: string
  trend: string
  positive?: boolean
  accent: string
  context: string
}) {
  return (
    <div className="metric-card">
      <div className="metric-top"><div className={`metric-icon ${accent}`}><Icon size={18} /></div><MoreHorizontal size={17} className="muted" /></div>
      <p className="metric-label">{label}</p><div className="metric-value">{value}</div>
      <div className="metric-trend">{positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}<span className={positive ? 'trend-up' : 'trend-down'}>{trend}</span><span className="muted">{context}</span></div>
    </div>
  )
}

function TenantTable({ rows }: { rows: Tenant[] }) {
  return (
    <div className="table-scroll"><table><thead><tr><th>Organization</th><th>Slug</th><th>Contact email</th><th>Status</th><th>Created</th></tr></thead>
      <tbody>{rows.map(tenant => <tr key={tenant.id}>
        <td><strong>{tenant.name}</strong></td><td>{tenant.slug}</td><td>{tenant.email}</td><td><StatusBadge status={tenant.status} /></td>
        <td>{tenant.created_at ? new Date(tenant.created_at).toLocaleDateString() : '—'}</td>
      </tr>)}
        {!rows.length && <tr><td colSpan={5}>No tenant records returned by the backend.</td></tr>}</tbody>
    </table></div>
  )
}

function Overview({ goTo }: { goTo: (section: Section) => void }) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [moduleCount, setModuleCount] = useState<number | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      const results = await Promise.allSettled([
        platformRequest<Analytics>('/platform/analytics/overview/'),
        getPlatformList<TenantApiRecord>('/platform/tenants/?ordering=-created_at'),
        getPlatformList<{ id: string }>('/platform/modules/'),
      ])
      if (!active) return
      const messages: string[] = []
      const [analyticsResult, tenantResult, moduleResult] = results
      if (analyticsResult.status === 'fulfilled') setAnalytics(analyticsResult.value)
      else messages.push(`Analytics: ${analyticsResult.reason instanceof Error ? analyticsResult.reason.message : 'request failed'}`)
      if (tenantResult.status === 'fulfilled') {
        setTenants(tenantResult.value.results.slice(0, 5).map(tenant => ({
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          email: tenant.contact_email,
          status: tenant.status,
          created_at: tenant.created_at,
        })))
      } else messages.push(`Tenants: ${tenantResult.reason instanceof Error ? tenantResult.reason.message : 'request failed'}`)
      if (moduleResult.status === 'fulfilled') setModuleCount(moduleResult.value.count)
      else messages.push(`Modules: ${moduleResult.reason instanceof Error ? moduleResult.reason.message : 'request failed'}`)
      setErrors(messages)
      setLoading(false)
    }
    void load()
    return () => { active = false }
  }, [])

  const totalTenants = analytics ? Object.values(analytics.tenants).reduce((sum, count) => sum + count, 0) : 0
  const totalSubscriptions = analytics ? Object.values(analytics.subscriptions).reduce((sum, count) => sum + count, 0) : 0
  const activeTenants = analytics?.tenants.active ?? 0
  const activeSubscriptions = analytics?.subscriptions.active ?? 0

  return <>
    {errors.map(error => <div className="api-error overview-error" role="alert" key={error}>{error}</div>)}
    <div className="metrics-grid">
      <MetricCard icon={Building2} label="Total tenants" value={loading ? '…' : String(totalTenants)} trend={String(analytics?.new_tenants_30d ?? 0)} context="new in 30 days" accent="purple" />
      <MetricCard icon={Zap} label="Active tenants" value={loading ? '…' : String(activeTenants)} trend={`${totalTenants ? Math.round(activeTenants / totalTenants * 100) : 0}%`} context="of all tenants" accent="blue" />
      <MetricCard icon={Package} label="Available modules" value={moduleCount === null ? '…' : String(moduleCount)} trend="Live" context="from catalogue" accent="orange" />
      <MetricCard icon={CreditCard} label="Active subscriptions" value={loading ? '…' : String(activeSubscriptions)} trend={`${totalSubscriptions} total`} context="all statuses" accent="green" />
    </div>
    <div className="content-grid">
      <section className="panel">
        <div className="panel-heading"><div><h2>Tenant accounts</h2><p>Current tenant status counts from the backend</p></div></div>
        <div className="live-status-list">
          {Object.entries(analytics?.tenants ?? {}).map(([status, count]) => <div key={status}><StatusBadge status={status} /><strong>{count}</strong></div>)}
          {!analytics && !loading && <p>Analytics are unavailable.</p>}
        </div>
      </section>
      <section className="panel">
        <div className="panel-heading"><div><h2>Monthly recurring revenue</h2><p>Active subscriptions, grouped by currency</p></div></div>
        <div className="live-mrr">{Object.entries(analytics?.mrr ?? {}).map(([currency, amount]) => <div key={currency}><span>{currency}</span><strong>{/^[A-Z]{3}$/.test(currency) ? new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount) : `${amount} ${currency}`}</strong></div>)}
          {analytics && Object.keys(analytics.mrr).length === 0 && <p>No active subscription revenue yet.</p>}
          {!analytics && !loading && <p>Analytics are unavailable.</p>}
        </div>
      </section>
    </div>
    <div className="content-grid lower-grid">
      <section className="panel table-panel"><div className="panel-heading"><div><h2>Recently added tenants</h2><p>Latest organizations returned by the API</p></div><button className="text-button" onClick={() => goTo('Tenants')}>View all <ChevronRight size={15} /></button></div>
        {loading ? <p className="muted">Loading dashboard data…</p> : <TenantTable rows={tenants} />}
      </section>
      <section className="panel">
        <div className="panel-heading"><div><h2>Platform activity</h2><p>Live totals from backend analytics</p></div></div>
        <div className="live-mrr"><div><span>Active employees</span><strong>{analytics?.active_employees ?? '—'}</strong></div><div><span>Open support tickets</span><strong>{analytics?.open_tickets ?? '—'}</strong></div></div>
      </section>
    </div>
    <section className="quick-actions"><div><h2>Platform directories</h2><p>Open live records managed by the backend.</p></div><div className="action-buttons">
      <button onClick={() => goTo('Tenants')}>View tenants</button><button onClick={() => goTo('Module Management')}>Manage modules</button><button onClick={() => goTo('Plan Management')}>View plans</button>
    </div></section>
  </>
}

function Page() {
  const [section, setSection] = useState<Section>('Overview')
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

  const heading = section === 'Overview' ? `Welcome, ${user?.full_name || user?.email}` : section
  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="brand"><div className="brand-mark"><Sparkles size={17} /></div><span>ERP Management</span><span className="brand-badge">ADMIN</span><button className="mobile-close" onClick={() => setSidebarOpen(false)} aria-label="Close menu"><X size={18} /></button></div>
        <div className="workspace-switch"><div className="workspace-logo">E</div><div><strong>Platform workspace</strong><small>Super Admin</small></div><ChevronDown size={15} /></div>
        <nav><span className="nav-label">Workspace</span>{navigation.map(({ label, icon: Icon }) => <button key={label} className={`nav-item ${section === label ? 'active' : ''}`} onClick={() => { setSection(label); setSidebarOpen(false) }}><Icon size={17} /><span>{label}</span></button>)}</nav>
        <div className="sidebar-bottom"><a className="nav-item payroll-app-link" href={PAYROLL_APP_URL} target="_blank" rel="noreferrer"><WalletCards size={17} /><span>Open Payroll Flow</span><ChevronRight size={14} /></a><div className="help-card"><div className="help-icon"><CircleHelp size={17} /></div><div><strong>Backend connected</strong><small>{new URL(apiBaseUrl).host}</small></div></div>
          <div className="profile"><div className="profile-avatar">{(user?.full_name || user?.email || 'SA').split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase()}</div><div><strong>{user?.full_name || user?.email}</strong><small>{user?.role || (user?.is_superuser ? 'Super Admin' : 'Platform staff')}</small></div><button className="icon-button logout-button" onClick={() => void signOut()} title="Sign out" aria-label="Sign out"><MoreHorizontal size={17} /></button></div>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar"><button className="menu-button" onClick={() => setSidebarOpen(true)} aria-label="Open menu"><Menu size={20} /></button><div className="breadcrumbs"><span>ERP Management</span><ChevronRight size={14} /><strong>{section}</strong></div>
          <div className="top-actions"><div className="command-search"><Search size={16} /><span>{user?.email}</span></div><button className="top-icon" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label="Toggle theme">{theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}</button><button className="top-avatar" title="Sign out" onClick={() => void signOut()}>{(user?.full_name || user?.email || 'SA').slice(0, 1).toUpperCase()}</button></div>
        </header>
        <div className="page-content"><div className="page-heading"><div><div className="eyebrow">{section === 'Overview' ? 'Live platform data' : 'Super Admin / Workspace'}</div><h1>{heading}</h1><p>{sectionDescriptions[section]}</p></div>{section === 'Overview' && <button className="outline-button"><Zap size={15} />Live data</button>}</div>
          {section === 'Overview' ? <Overview goTo={setSection} />
            : section === 'Module Management' ? <ModuleManagement />
              : <PlatformRecords section={section} />}
        </div>
      </main>
    </div>
  )
}

export default Page
