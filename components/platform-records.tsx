'use client'

import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { getPlatformList } from '@/lib/platform-api'

type Props = {
  section: 'Tenants' | 'User Management' | 'Subscription Management' | 'Plan Management' | 'Field Management' | 'Settings'
}

type RecordRow = Record<string, unknown>

const resourceBySection = {
  Tenants: { path: '/platform/tenants/', columns: ['Organization', 'Slug', 'Contact email', 'Status', 'Country'] },
  'User Management': { path: '/platform/users/', columns: ['Name', 'Email', 'Platform role', 'Status', 'Last login'] },
  'Subscription Management': { path: '/platform/subscriptions/', columns: ['Tenant', 'Plan', 'Billing cycle', 'Status', 'Period ends'] },
  'Plan Management': { path: '/platform/plans/', columns: ['Plan', 'Code', 'Monthly price', 'Yearly price', 'Status'] },
  'Field Management': { path: '/platform/custom-fields/', columns: ['Field', 'Key', 'Entity', 'Type', 'Status'] },
  Settings: { path: '/platform/system-settings/', columns: ['Setting', 'Value', 'Public', 'Updated'] },
} as const

function cellValue(section: Props['section'], row: RecordRow, column: string) {
  if (section === 'Settings') {
    const values: Record<string, unknown> = {
      Setting: row.key,
      Value: typeof row.value === 'object' ? JSON.stringify(row.value) : row.value,
      Public: row.is_public ? 'Yes' : 'No',
      Updated: row.updated_at ? new Date(String(row.updated_at)).toLocaleDateString() : '—',
    }
    return values[column]
  }
  switch (section) {
    case 'Tenants': {
      const values: Record<string, unknown> = {
        Organization: row.name,
        Slug: row.slug,
        'Contact email': row.contact_email,
        Status: row.status,
        Country: row.country,
      }
      return values[column]
    }
    case 'User Management': {
      const values: Record<string, unknown> = {
        Name: row.full_name,
        Email: row.email,
        'Platform role': row.role_name ?? (row.is_superuser ? 'Superuser' : '—'),
        Status: row.is_active ? 'Active' : 'Inactive',
        'Last login': row.last_login ? new Date(String(row.last_login)).toLocaleDateString() : '—',
      }
      return values[column]
    }
    case 'Subscription Management': {
      const values: Record<string, unknown> = {
        Tenant: row.tenant_slug,
        Plan: row.plan_code,
        'Billing cycle': row.billing_cycle,
        Status: row.status,
        'Period ends': row.current_period_end ? new Date(String(row.current_period_end)).toLocaleDateString() : '—',
      }
      return values[column]
    }
    case 'Plan Management': {
      const values: Record<string, unknown> = {
        Plan: row.name,
        Code: row.code,
        'Monthly price': `${row.currency ?? ''} ${row.monthly_price ?? '—'}`,
        'Yearly price': `${row.currency ?? ''} ${row.yearly_price ?? '—'}`,
        Status: row.is_active ? 'Active' : 'Inactive',
      }
      return values[column]
    }
    case 'Field Management': {
      const values: Record<string, unknown> = {
        Field: row.label,
        Key: row.key,
        Entity: row.entity,
        Type: row.field_type,
        Status: row.is_active ? 'Active' : 'Inactive',
      }
      return values[column]
    }
  }
}

export function PlatformRecords({ section }: Props) {
  const [rows, setRows] = useState<RecordRow[]>([])
  const [count, setCount] = useState(0)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const resource = resourceBySection[section]

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    setRows([])
    getPlatformList<RecordRow>(resource.path, page, 20).then(response => {
      if (!active) return
      setRows(response.results)
      setCount(response.count)
    }).catch(loadError => {
      if (active) setError(loadError instanceof Error ? loadError.message : `Unable to load ${section.toLowerCase()}.`)
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [page, resource.path, section])

  const columns = resource.columns as readonly string[]
  const filtered = rows.filter(row => columns.some(column => String(cellValue(section, row, column) ?? '').toLowerCase().includes(query.toLowerCase())))
  const pageCount = Math.max(1, Math.ceil(count / 20))

  return (
    <section className="panel full-panel">
      <div className="panel-heading"><div><div className="eyebrow">Live backend data</div><h2>{section}</h2><p>Loaded from the platform API. {count} total records.</p></div></div>
      <div className="toolbar"><div className="search-box"><Search size={16} /><input value={query} onChange={event => { setQuery(event.target.value); setPage(1) }} placeholder={`Search this page of ${section.toLowerCase()}...`} /></div></div>
      {error && <div className="api-error" role="alert">{error}</div>}
      <div className="table-scroll"><table><thead><tr>{columns.map(column => <th key={column}>{column}</th>)}</tr></thead>
        <tbody>
          {filtered.map((row, index) => <tr key={String(row.id ?? index)}>{columns.map(column => <td key={column}>{String(cellValue(section, row, column) ?? '—')}</td>)}</tr>)}
          {!loading && filtered.length === 0 && <tr><td colSpan={columns.length}>{query ? 'No matching records.' : 'No records returned by the backend.'}</td></tr>}
          {loading && <tr><td colSpan={columns.length}>Loading records…</td></tr>}
        </tbody>
      </table></div>
      <div className="pagination"><span>Page {page} of {pageCount} · {count} total records</span><div><button className="page-button" disabled={page <= 1 || loading} onClick={() => setPage(current => current - 1)}>Previous</button><button className="page-button" disabled={page >= pageCount || loading} onClick={() => setPage(current => current + 1)}>Next</button></div></div>
    </section>
  )
}
