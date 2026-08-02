import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function OnboardingClientesPage() {
  redirect('/clientes/online')
}
