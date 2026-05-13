import AdminDashboardClient from '@/components/admin-dashboard-client'

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  return <AdminDashboardClient initialModule="CRM" />
}
