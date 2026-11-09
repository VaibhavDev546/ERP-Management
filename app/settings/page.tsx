'use client'

import { PlatformRecords } from '@/components/platform-records'
import { SectionPageHeading, SuperAdminShell } from '@/components/super-admin-shell'

export default function SettingsPage() {
  return (
    <SuperAdminShell>
      <div className="page-content">
        <SectionPageHeading section="Settings" />
        <PlatformRecords section="Settings" />
      </div>
    </SuperAdminShell>
  )
}
