'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { SuperAdminShell } from '@/components/super-admin-shell'
import { PlatformRecords } from '@/components/platform-records'

export default function TenantsPage() {
  return (
    <SuperAdminShell>
      <div className="page-content">
        <div className="page-heading">
          <div><div className="eyebrow">Super Admin / Workspace</div><h1>Tenants</h1><p>Organizations registered on your platform.</p></div>
          <Link href="/" className="outline-button"><ArrowLeft size={15} />Overview</Link>
        </div>
        <PlatformRecords section="Tenants" />
      </div>
    </SuperAdminShell>
  )
}
