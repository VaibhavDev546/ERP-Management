'use client'

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { ChevronLeft, ChevronRight, Pencil, Plus, Search, X } from 'lucide-react'
import { getPlatformList, platformRequest } from '@/lib/platform-api'

type ModuleRecord = {
  id: string
  key: string
  name: string
  description: string
  is_core: boolean
  sort_order: number
  dependencies: string[]
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="module-metric"><span>{label}</span><strong>{value}</strong></div>
}

export function ModuleManagement() {
  const [modules, setModules] = useState<ModuleRecord[]>([])
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<ModuleRecord | null>(null)
  const [editing, setEditing] = useState<ModuleRecord | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const loadModules = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await getPlatformList<ModuleRecord>('/platform/modules/')
      setModules(response.results)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load modules.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadModules()
  }, [loadModules])

  const filtered = useMemo(
    () => modules.filter(module => `${module.name} ${module.key}`.toLowerCase().includes(query.toLowerCase())),
    [modules, query],
  )
  const pageCount = Math.max(1, Math.ceil(filtered.length / 8))
  const visible = filtered.slice((page - 1) * 8, page * 8)

  async function saveModule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const payload = {
      name: String(form.get('name')).trim(),
      key: String(form.get('key')).trim(),
      description: String(form.get('description')).trim(),
      is_core: form.get('is_core') === 'on',
      sort_order: Number(form.get('sort_order')),
      dependencies: String(form.get('dependencies'))
        .split(',')
        .map(value => value.trim())
        .filter(Boolean),
    }

    setSaving(true)
    setError('')
    try {
      const path = editing ? `/platform/modules/${editing.id}/` : '/platform/modules/'
      const saved = await platformRequest<ModuleRecord>(path, {
        method: editing ? 'PATCH' : 'POST',
        body: JSON.stringify(payload),
      })
      setModules(current => editing
        ? current.map(module => module.id === saved.id ? saved : module)
        : [...current, saved].sort((a, b) => a.sort_order - b.sort_order || a.key.localeCompare(b.key)))
      setShowForm(false)
      setEditing(null)
      setSelected(saved)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save module.')
    } finally {
      setSaving(false)
    }
  }

  function openForm(module: ModuleRecord | null) {
    setEditing(module)
    setSelected(null)
    setShowForm(true)
    setError('')
  }

  return (
    <section className="panel full-panel module-management">
      <div className="module-heading">
        <div>
          <div className="eyebrow">Product catalogue</div>
          <h2>Module Management</h2>
          <p>Manage backend modules and their plan dependencies.</p>
        </div>
        <button className="primary-button" onClick={() => openForm(null)}><Plus size={16} />Create module</button>
      </div>
      <div className="module-metrics">
        <Metric label="Total modules" value={modules.length} />
        <Metric label="Core modules" value={modules.filter(module => module.is_core).length} />
        <Metric label="Optional modules" value={modules.filter(module => !module.is_core).length} />
      </div>
      <div className="toolbar module-toolbar">
        <div className="search-box"><Search size={16} /><input aria-label="Search modules" value={query} onChange={event => { setQuery(event.target.value); setPage(1) }} placeholder="Search modules by name or key..." /></div>
        <button className="filter-button" onClick={() => void loadModules()} disabled={loading}>Refresh</button>
      </div>
      {error && <div className="api-error" role="alert">{error}</div>}
      <div className="table-scroll">
        <table className="module-table">
          <thead><tr><th>Module</th><th>Key</th><th>Type</th><th>Dependencies</th><th>Order</th><th /></tr></thead>
          <tbody>
            {visible.map(module => (
              <tr key={module.id}>
                <td><button className="feature-link" onClick={() => setSelected(module)}><strong>{module.name}</strong><small>{module.description || 'No description'}</small></button></td>
                <td><code>{module.key}</code></td>
                <td>{module.is_core ? 'Core' : 'Optional'}</td>
                <td>{module.dependencies.length ? module.dependencies.join(', ') : '—'}</td>
                <td>{module.sort_order}</td>
                <td><button className="icon-button" aria-label={`Edit ${module.name}`} onClick={() => openForm(module)}><Pencil size={15} /></button></td>
              </tr>
            ))}
            {!loading && visible.length === 0 && <tr><td colSpan={6}>{query ? 'No matching modules.' : 'No modules returned by the backend.'}</td></tr>}
            {loading && <tr><td colSpan={6}>Loading modules…</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="pagination">
        <span>Showing {filtered.length ? (page - 1) * 8 + 1 : 0}–{Math.min(page * 8, filtered.length)} of {filtered.length} modules</span>
        <div><button className="page-button" disabled={page <= 1} onClick={() => setPage(current => current - 1)}><ChevronLeft size={15} /></button><button className="page-button active-page">{page} / {pageCount}</button><button className="page-button" disabled={page >= pageCount} onClick={() => setPage(current => current + 1)}><ChevronRight size={15} /></button></div>
      </div>
      {selected && <div className="module-drawer-backdrop" onClick={() => setSelected(null)}><aside className="module-drawer" onClick={event => event.stopPropagation()}>
        <div className="drawer-header"><div><div className="eyebrow">{selected.key}</div><h2>{selected.name}</h2><p>{selected.description || 'No description provided.'}</p></div><button className="icon-button" onClick={() => setSelected(null)} aria-label="Close module details"><X size={18} /></button></div>
        <div className="drawer-actions"><button className="secondary-button" onClick={() => openForm(selected)}><Pencil size={15} />Edit module</button></div>
        <div className="drawer-meta"><div><span>Type</span><strong>{selected.is_core ? 'Core module' : 'Optional module'}</strong></div><div><span>Sort order</span><strong>{selected.sort_order}</strong></div><div><span>Dependencies</span><strong>{selected.dependencies.length ? selected.dependencies.join(', ') : 'None'}</strong></div></div>
      </aside></div>}
      {showForm && <div className="module-modal-backdrop"><form className="module-form" onSubmit={saveModule}>
        <div className="drawer-header"><div><div className="eyebrow">{editing ? 'Edit module' : 'New module'}</div><h2>{editing ? 'Edit module' : 'Create module'}</h2></div><button type="button" className="icon-button" onClick={() => setShowForm(false)} aria-label="Close form"><X size={18} /></button></div>
        {error && <div className="api-error" role="alert">{error}</div>}
        <div className="form-grid">
          <label>Module name<input name="name" defaultValue={editing?.name} required maxLength={100} /></label>
          <label>Key<input name="key" defaultValue={editing?.key} required maxLength={60} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" title="Use lowercase letters, numbers, and hyphens." /></label>
          <label>Sort order<input name="sort_order" type="number" min="0" defaultValue={editing?.sort_order ?? 0} required /></label>
          <label className="checkbox-field"><input name="is_core" type="checkbox" defaultChecked={editing?.is_core ?? false} />Core module</label>
          <label className="form-wide">Dependencies (module keys, comma-separated)<input name="dependencies" defaultValue={editing?.dependencies.join(', ')} placeholder="hr, attendance" /></label>
          <label className="form-wide">Description<textarea name="description" defaultValue={editing?.description} rows={3} maxLength={500} /></label>
        </div>
        <div className="form-actions"><button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Cancel</button><button className="primary-button" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save module'}</button></div>
      </form></div>}
    </section>
  )
}
