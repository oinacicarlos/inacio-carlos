'use client'

import nextDynamic from 'next/dynamic'

type AdminModule = 'Contabilidade' | 'PFX' | 'Disparazap'

const AdminDashboardClient = nextDynamic(
  () => import('@/components/admin-dashboard-client'),
  { ssr: false, loading: () => <main className="admin-dashboard-page" /> }
)

export default function NoSSRDashboard({ initialModule }: { initialModule: AdminModule }) {
  return <AdminDashboardClient initialModule={initialModule} />
}
