'use client'

import { PlatformRecords } from '@/components/platform-records'
import { SectionPageHeading, SuperAdminShell } from '@/components/super-admin-shell'

export default function PlanManagementPage() {
  return (
    <SuperAdminShell>
      <div className="page-content">
        <SectionPageHeading section="Plan Management" />
        <PlatformRecords section="Plan Management" />
      </div>
    </SuperAdminShell>
  )
}
