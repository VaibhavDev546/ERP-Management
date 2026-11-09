'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  ChevronRight,
  CreditCard,
  MoreHorizontal,
  Package,
  Zap,
} from 'lucide-react'
import { SuperAdminShell, sectionDescriptions, useSuperAdmin } from '@/components/super-admin-shell'
import { getPlatformList, platformRequest } from '@/lib/platform-api'

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

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase()
  const style = normalized === 'active' ? 'status-active' : normalized === 'trial' || normalized === 'trialing' ? 'status-trial' : normalized === 'suspended' ? 'status-suspended' : 'status-neutral'
  return <span className={`status-badge ${style}`}><span className="status-dot" />{status}</span>
}

function MetricCard({ icon: Icon, label, value, trend, positive = true, accent, context }: {
  icon: typeof Building2
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

function Overview() {
  const router = useRouter()
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
      <section className="panel table-panel"><div className="panel-heading"><div><h2>Recently added tenants</h2><p>Latest organizations returned by the API</p></div><Link className="text-button" href="/tenants">View all <ChevronRight size={15} /></Link></div>
        {loading ? <p className="muted">Loading dashboard data…</p> : <TenantTable rows={tenants} />}
      </section>
      <section className="panel">
        <div className="panel-heading"><div><h2>Platform activity</h2><p>Live totals from backend analytics</p></div></div>
        <div className="live-mrr"><div><span>Active employees</span><strong>{analytics?.active_employees ?? '—'}</strong></div><div><span>Open support tickets</span><strong>{analytics?.open_tickets ?? '—'}</strong></div></div>
      </section>
    </div>
    <section className="quick-actions"><div><h2>Platform directories</h2><p>Open live records managed by the backend.</p></div><div className="action-buttons">
      <Link href="/tenants">View tenants</Link><button onClick={() => router.push('/modules')}>Manage modules</button><button onClick={() => router.push('/plans')}>View plans</button>
    </div></section>
  </>
}

export default function Page() {
  const { user } = useSuperAdmin()
  return (
    <SuperAdminShell>
      <div className="page-content">
        <div className="page-heading">
          <div>
            <div className="eyebrow">Live platform data</div>
            <h1>Welcome, {user?.full_name || user?.email}</h1>
            <p>{sectionDescriptions.Overview}</p>
          </div>
          <button className="outline-button"><Zap size={15} />Live data</button>
        </div>
        <Overview />
      </div>
    </SuperAdminShell>
  )
}
