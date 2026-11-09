'use client'

import { PlatformRecords } from '@/components/platform-records'
import { SectionPageHeading, SuperAdminShell } from '@/components/super-admin-shell'

export default function SubscriptionManagementPage() {
  return (
    <SuperAdminShell>
      <div className="page-content">
        <SectionPageHeading section="Subscription Management" />
        <PlatformRecords section="Subscription Management" />
      </div>
    </SuperAdminShell>
  )
}
