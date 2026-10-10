'use client'

import { useEffect, useMemo, useState } from 'react'
import { ModuleManagement } from '@/components/module-management'
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Building2,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Clock3,
  Command,
  CreditCard,
  Database,
  Ellipsis,
  FileCog,
  Filter,
  FolderKanban,
  Globe2,
  LayoutDashboard,
  LibraryBig,
  Menu,
  MoreHorizontal,
  Moon,
  Package,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  Users,
  X,
  Zap,
} from 'lucide-react'

type Section = 'Overview' | 'Tenants' | 'Field Management' | 'Module Management' | 'Plan Management' | 'Subscription Management' | 'User Management' | 'Settings'
type Theme = 'light' | 'dark'

type Tenant = { name: string; owner: string; email: string; plan: string; users: number; status: 'Active' | 'Trial' | 'Suspended'; initials: string; color: string }

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

const tenants: Tenant[] = [
  { name: 'Northstar Academy', owner: 'Amelia Stone', email: 'amelia@northstar.edu', plan: 'Professional', users: 128, status: 'Active', initials: 'NA', color: 'violet' },
  { name: 'Cedar & Co.', owner: 'Marcus Chen', email: 'marcus@cedarco.com', plan: 'Growth', users: 46, status: 'Active', initials: 'CC', color: 'orange' },
  { name: 'Lumina Health', owner: 'Priya Nair', email: 'priya@lumina.health', plan: 'Enterprise', users: 284, status: 'Active', initials: 'LH', color: 'sky' },
  { name: 'Harbor Logistics', owner: 'Jon Bell', email: 'jon@harborlogistics.io', plan: 'Starter', users: 18, status: 'Trial', initials: 'HL', color: 'emerald' },
  { name: 'Atlas Creative', owner: 'Nia Woods', email: 'nia@atlascreative.co', plan: 'Growth', users: 62, status: 'Suspended', initials: 'AC', color: 'rose' },
]

const sectionDescriptions: Record<Section, string> = {
  Overview: 'A high-level view of your platform performance.',
  Tenants: 'Manage every organization on your platform.',
  'Field Management': 'Define reusable fields for future business modules.',
  'Module Management': 'Control the business capabilities available to tenants.',
  'Plan Management': 'Create and configure subscription packages.',
  'Subscription Management': 'Monitor tenant subscriptions and billing status.',
  'User Management': 'Manage platform users and tenant membership.',
  Settings: 'Configure platform-wide preferences and defaults.',
}

function StatusBadge({ status }: { status: string }) {
  const style = status === 'Active' ? 'status-active' : status === 'Trial' ? 'status-trial' : status === 'Suspended' ? 'status-suspended' : 'status-neutral'
  return <span className={`status-badge ${style}`}><span className="status-dot" />{status}</span>
}

function MetricCard({ icon: Icon, label, value, trend, positive = true, accent }: { icon: typeof Users; label: string; value: string; trend: string; positive?: boolean; accent: string }) {
  return (
    <div className="metric-card">
      <div className="metric-top"><div className={`metric-icon ${accent}`}><Icon size={18} /></div><button className="icon-button"><MoreHorizontal size={17} /></button></div>
      <p className="metric-label">{label}</p><div className="metric-value">{value}</div>
      <div className="metric-trend">{positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}<span className={positive ? 'trend-up' : 'trend-down'}>{trend}</span><span className="muted">vs last month</span></div>
    </div>
  )
}

function Overview({ goTo }: { goTo: (section: Section) => void }) {
  return <>
    <div className="metrics-grid">
      <MetricCard icon={Building2} label="Total tenants" value="1,284" trend="12.8%" accent="purple" />
      <MetricCard icon={Zap} label="Active tenants" value="1,196" trend="8.4%" accent="blue" />
      <MetricCard icon={Package} label="Available modules" value="24" trend="4.2%" accent="orange" />
      <MetricCard icon={CreditCard} label="Active subscriptions" value="1,108" trend="16.2%" accent="green" />
    </div>
    <div className="content-grid">
      <section className="panel chart-panel"><div className="panel-heading"><div><h2>Tenant growth</h2><p>New tenant registrations over the last 30 days</p></div><button className="select-button">Last 30 days <ChevronDown size={15} /></button></div><div className="chart-area"><div className="chart-y"><span>1.4k</span><span>1.0k</span><span>600</span><span>200</span><span>0</span></div><div className="chart"><div className="grid-lines"><i /><i /><i /><i /><i /></div><svg viewBox="0 0 600 190" preserveAspectRatio="none" aria-label="Tenant growth chart"><defs><linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#7c5cff" stopOpacity=".25" /><stop offset="100%" stopColor="#7c5cff" stopOpacity="0" /></linearGradient></defs><path d="M0,155 C35,148 52,132 78,138 S124,104 153,117 S190,88 218,99 S255,77 288,90 S322,46 355,65 S395,33 430,53 S467,26 496,41 S542,15 600,18 L600,190 L0,190 Z" fill="url(#area)" /><path d="M0,155 C35,148 52,132 78,138 S124,104 153,117 S190,88 218,99 S255,77 288,90 S322,46 355,65 S395,33 430,53 S467,26 496,41 S542,15 600,18" fill="none" stroke="#8068ff" strokeWidth="3" strokeLinecap="round" /></svg><div className="chart-x"><span>01 May</span><span>08 May</span><span>15 May</span><span>22 May</span><span>30 May</span></div></div></div></section>
      <section className="panel"><div className="panel-heading"><div><h2>Tenant status</h2><p>Distribution by account status</p></div><button className="icon-button"><Ellipsis size={17} /></button></div><div className="donut-wrap"><div className="donut"><div><strong>1,284</strong><small>Total</small></div></div><div className="legend"><div><span className="legend-dot purple-dot" />Active <b>93.1%</b></div><div><span className="legend-dot orange-dot" />Trial <b>4.8%</b></div><div><span className="legend-dot gray-dot" />Suspended <b>2.1%</b></div></div></div></section>
    </div>
    <div className="content-grid lower-grid"><section className="panel table-panel"><div className="panel-heading"><div><h2>Recent tenants</h2><p>Latest organizations to join your platform</p></div><button className="text-button" onClick={() => goTo('Tenants')}>View all <ChevronRight size={15} /></button></div><TenantTable rows={tenants.slice(0, 4)} /></section><section className="panel"><div className="panel-heading"><div><h2>Most-used modules</h2><p>Adoption across active tenants</p></div><button className="icon-button"><Ellipsis size={17} /></button></div><div className="module-list">{[['School Management','78%','purple'],['Inventory Management','64%','blue'],['CRM','52%','orange'],['HR & Payroll','41%','green']].map(([name, percent, color], index) => <div className="module-row" key={name}><div className={`module-symbol ${color}`}>{index === 0 ? <LibraryBig size={16} /> : index === 1 ? <Database size={16} /> : index === 2 ? <Users size={16} /> : <FolderKanban size={16} />}</div><div className="module-copy"><span>{name}</span><div className="progress"><i style={{ width: percent }} className={color} /></div></div><b>{percent}</b></div>)}</div></section></div>
    <section className="quick-actions"><div><h2>Quick actions</h2><p>Jump into the most common admin tasks.</p></div><div className="action-buttons"><button onClick={() => goTo('Tenants')}><Plus size={16} />Create tenant</button><button onClick={() => goTo('Module Management')}><Plus size={16} />Create module</button><button onClick={() => goTo('Plan Management')}><Plus size={16} />Create plan</button></div></section>
  </>
}

function TenantTable({ rows }: { rows: Tenant[] }) { return <div className="table-scroll"><table><thead><tr><th>Organization</th><th>Owner</th><th>Plan</th><th>Users</th><th>Status</th><th /></tr></thead><tbody>{rows.map(t => <tr key={t.name}><td><div className="org-cell"><span className={`avatar ${t.color}`}>{t.initials}</span><div><strong>{t.name}</strong><small>{t.email}</small></div></div></td><td>{t.owner}</td><td><span className="plan-pill">{t.plan}</span></td><td>{t.users}</td><td><StatusBadge status={t.status} /></td><td><button className="icon-button"><Ellipsis size={16} /></button></td></tr>)}</tbody></table></div> }

function RecordsSection({ section, onCreate }: { section: Section; onCreate: () => void }) {
  const isUsers = section === 'User Management'; const isSubs = section === 'Subscription Management';
  const rows = isUsers ? [['Amelia Stone','amelia@northstar.edu','Northstar Academy','TENANT_OWNER','Active'],['Marcus Chen','marcus@cedarco.com','Cedar & Co.','TENANT_OWNER','Active'],['Priya Nair','priya@lumina.health','Lumina Health','TENANT_ADMIN','Active'],['Jon Bell','jon@harborlogistics.io','Harbor Logistics','TENANT_OWNER','Trial']] : isSubs ? [['Northstar Academy','Professional','May 04, 2024','May 04, 2025','$249 / mo','Active'],['Cedar & Co.','Growth','May 12, 2024','May 12, 2025','$99 / mo','Active'],['Lumina Health','Enterprise','Apr 28, 2024','Apr 28, 2025','$499 / mo','Active'],['Harbor Logistics','Starter','Jun 01, 2024','Jun 01, 2024','$29 / mo','Trial']] : [['Northstar Academy','northstar-academy','Professional','128','Active'],['Cedar & Co.','cedar-co','Growth','46','Active'],['Lumina Health','lumina-health','Enterprise','284','Active'],['Harbor Logistics','harbor-logistics','Starter','18','Trial']];
  const titles = isUsers ? ['Name','Tenant','Role','Status'] : isSubs ? ['Tenant','Plan','Start date','Renewal','Amount','Status'] : ['Organization','Slug','Plan','Users','Status'];
  return <section className="panel full-panel"><div className="panel-heading"><div><div className="eyebrow">Directory</div><h2>{section}</h2><p>{sectionDescriptions[section]}</p></div><button className="primary-button" onClick={onCreate}><Plus size={16} />Create {isUsers ? 'user' : isSubs ? 'subscription' : section === 'Tenants' ? 'tenant' : 'record'}</button></div><div className="toolbar"><div className="search-box"><Search size={16} /><input placeholder={`Search ${section.toLowerCase()}...`} /></div><button className="filter-button"><Filter size={15} />Filters</button><button className="filter-button">All statuses <ChevronDown size={15} /></button></div><div className="table-scroll"><table><thead><tr>{titles.map(t => <th key={t}>{t}</th>)}<th /></tr></thead><tbody>{rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{j === row.length - 1 ? <StatusBadge status={cell} /> : j === 0 && !isSubs ? <div className="org-cell"><span className={`avatar ${['violet','orange','sky','emerald'][i]}`}>{cell.split(' ').map(w => w[0]).join('').slice(0,2)}</span><strong>{cell}</strong></div> : <span className={j === 2 && isUsers ? 'role-text' : ''}>{cell}</span>}</td>)}<td><button className="icon-button"><Ellipsis size={16} /></button></td></tr>)}</tbody></table></div><div className="pagination"><span>Showing 1–4 of 1,284 results</span><div><button className="page-button"><ChevronLeft size={15} /></button><button className="page-button active-page">1</button><button className="page-button">2</button><button className="page-button">3</button><button className="page-button"><ChevronRight size={15} /></button></div></div></section>
}

function ConfigSection({ section, onCreate }: { section: Section; onCreate: () => void }) {
  const isFields = section === 'Field Management'; const isModules = section === 'Module Management'; const isPlans = section === 'Plan Management';
  if (isModules) return <ModuleManagement />
  const cards = isFields ? [['Student ID','student_id','Text · School Management','Required'],['Emergency contact','emergency_contact','Phone · HR & Payroll','Optional'],['Enrollment date','enrollment_date','Date · School Management','Required'],['Department','department','Single select · HR & Payroll','Optional']] : isModules ? [['School Management','school-management','Education · v2.4','8 tenants'],['Inventory Management','inventory-management','Operations · v1.8','24 tenants'],['HR & Payroll','hr-payroll','People · v1.6','18 tenants'],['CRM','crm','Sales · v3.1','31 tenants']] : [['Starter','starter','$29 / month · 5 modules','42 tenants'],['Growth','growth','$99 / month · 12 modules','86 tenants'],['Professional','professional','$249 / month · 18 modules','64 tenants'],['Enterprise','enterprise','Custom pricing · All modules','22 tenants']];
  return <section className="panel full-panel"><div className="panel-heading"><div><div className="eyebrow">Configuration</div><h2>{section}</h2><p>{sectionDescriptions[section]}</p></div><button className="primary-button" onClick={onCreate}><Plus size={16} />Create {isFields ? 'field' : isModules ? 'module' : 'plan'}</button></div><div className="toolbar"><div className="search-box"><Search size={16} /><input placeholder={`Search ${section.toLowerCase()}...`} /></div><button className="filter-button"><Filter size={15} />Filters</button><button className="filter-button">Recently updated <ChevronDown size={15} /></button></div><div className="config-grid">{cards.map((card, i) => <div className="config-card" key={card[0]}><div className="config-card-top"><div className={`config-icon icon-${i}`}>{isFields ? <FileCog size={18} /> : isModules ? <Package size={18} /> : <ClipboardList size={18} />}</div><button className="icon-button"><Ellipsis size={17} /></button></div><h3>{card[0]}</h3><code>{card[1]}</code><p>{card[2]}</p><div className="config-footer"><StatusBadge status="Active" /><span>{card[3]}</span></div></div>)}</div></section>
}

function SettingsSection({ theme, setTheme }: { theme: Theme; setTheme: (theme: Theme) => void }) { return <section className="panel full-panel settings-panel"><div className="eyebrow">Workspace configuration</div><h2>Platform settings</h2><p>Manage defaults and preferences for the entire platform.</p><div className="settings-tabs"><button className="active-tab">General</button><button>Branding</button><button>Registration</button><button>Notifications</button></div><div className="settings-form"><label>Platform name<input defaultValue="Northstar Platform" /></label><label>Support email<input defaultValue="support@northstar.io" /></label><label>Default timezone<select defaultValue="UTC -05:00"><option>UTC -05:00</option><option>UTC +00:00</option><option>UTC +05:30</option></select></label><label>Default currency<select defaultValue="USD — US Dollar"><option>USD — US Dollar</option><option>EUR — Euro</option><option>GBP — Pound sterling</option></select></label></div><div className="preference-row"><div><strong>Appearance</strong><p>Choose the default workspace appearance.</p></div><div className="theme-options"><button className={theme === 'light' ? 'theme-option selected' : 'theme-option'} onClick={() => setTheme('light')}><Sun size={15} />Light</button><button className={theme === 'dark' ? 'theme-option selected' : 'theme-option'} onClick={() => setTheme('dark')}><Moon size={15} />Dark</button></div></div><div className="settings-actions"><button className="secondary-button">Reset</button><button className="primary-button"><Check size={15} />Save changes</button></div></section> }

export default function Page() {
  const [section, setSection] = useState<Section>('Overview'); const [theme, setTheme] = useState<Theme>('light'); const [sidebarOpen, setSidebarOpen] = useState(false); const [toast, setToast] = useState('');
  useEffect(() => { const saved = window.localStorage.getItem('super-admin-theme') as Theme | null; if (saved) setTheme(saved) }, []); useEffect(() => { document.documentElement.classList.toggle('dark', theme === 'dark'); window.localStorage.setItem('super-admin-theme', theme) }, [theme]);
  const heading = useMemo(() => section === 'Overview' ? 'Good morning, Alex' : section, [section]);
  const create = () => { setToast(`${section === 'Overview' ? 'Tenant' : section.replace(' Management','').replace('Plan','plan').replace('Field','field').replace('Module','module')} creation flow is ready in this demo.`); window.setTimeout(() => setToast(''), 3000) };
  return <div className="app-shell"><aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}><div className="brand"><div className="brand-mark"><Sparkles size={17} /></div><span>northstar</span><span className="brand-badge">ADMIN</span><button className="mobile-close" onClick={() => setSidebarOpen(false)}><X size={18} /></button></div><div className="workspace-switch"><div className="workspace-logo">N</div><div><strong>Northstar Inc.</strong><small>Platform workspace</small></div><ChevronDown size={15} /></div><nav><span className="nav-label">Workspace</span>{navigation.map(({ label, icon: Icon }) => <button key={label} className={`nav-item ${section === label ? 'active' : ''}`} onClick={() => { setSection(label); setSidebarOpen(false) }}><Icon size={17} /><span>{label}</span>{label === 'Tenants' && <em>1,284</em>}</button>)}</nav><div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><CircleHelp size={17} /></div><div><strong>Need a hand?</strong><small>Visit help center</small></div><ChevronRight size={14} /></div><div className="profile"><div className="profile-avatar">AS</div><div><strong>Alex Morgan</strong><small>Super Admin</small></div><MoreHorizontal size={17} /></div></div></aside><main className="main-content"><header className="topbar"><button className="menu-button" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button><div className="breadcrumbs"><span>Super Admin</span><ChevronRight size={14} /><strong>{section}</strong></div><div className="top-actions"><div className="command-search"><Search size={16} /><span>Search</span><kbd><Command size={11} />K</kbd></div><button className="top-icon"><Bell size={18} /><i /></button><button className="top-icon" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>{theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}</button><div className="top-avatar">AM</div></div></header><div className="page-content"><div className="page-heading"><div><div className="eyebrow">{section === 'Overview' ? 'Monday, June 24, 2024' : 'Super Admin / Workspace'}</div><h1>{heading}</h1><p>{sectionDescriptions[section]}</p></div>{section === 'Overview' && <button className="outline-button"><Clock3 size={15} />Last 30 days <ChevronDown size={15} /></button>}</div>{section === 'Overview' ? <Overview goTo={setSection} /> : section === 'Settings' ? <SettingsSection theme={theme} setTheme={setTheme} /> : ['Field Management','Module Management','Plan Management'].includes(section) ? <ConfigSection section={section} onCreate={create} /> : <RecordsSection section={section} onCreate={create} />}</div></main>{toast && <div className="toast"><Check size={16} />{toast}</div>}</div>
}
