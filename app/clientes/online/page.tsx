import AdminOnlineClients from '@/components/admin-online-clients'

export const dynamic = 'force-dynamic'

type ClientesOnlineSearchParams = Promise<Record<string, string | string[] | undefined>>

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function ClientesOnlinePage({ searchParams }: { searchParams?: ClientesOnlineSearchParams }) {
  const resolvedSearchParams = searchParams ? await searchParams : {}
  return await AdminOnlineClients({ activeModule: firstParam(resolvedSearchParams.modulo) })
}
