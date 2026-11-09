'use client'

import { ModuleManagement } from '@/components/module-management'
import { SectionPageHeading, SuperAdminShell } from '@/components/super-admin-shell'

export default function ModuleManagementPage() {
  return (
    <SuperAdminShell>
      <div className="page-content">
        <SectionPageHeading section="Module Management" />
        <ModuleManagement />
      </div>
    </SuperAdminShell>
  )
}
