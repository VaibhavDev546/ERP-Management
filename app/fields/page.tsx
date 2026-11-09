'use client'

import { PlatformRecords } from '@/components/platform-records'
import { SectionPageHeading, SuperAdminShell } from '@/components/super-admin-shell'

export default function FieldManagementPage() {
  return (
    <SuperAdminShell>
      <div className="page-content">
        <SectionPageHeading section="Field Management" />
        <PlatformRecords section="Field Management" />
      </div>
    </SuperAdminShell>
  )
}
