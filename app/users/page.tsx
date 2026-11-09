'use client'

import { PlatformRecords } from '@/components/platform-records'
import { SectionPageHeading, SuperAdminShell } from '@/components/super-admin-shell'

export default function UserManagementPage() {
  return (
    <SuperAdminShell>
      <div className="page-content">
        <SectionPageHeading section="User Management" />
        <PlatformRecords section="User Management" />
      </div>
    </SuperAdminShell>
  )
}
