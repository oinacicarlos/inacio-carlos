'use client'

import nextDynamic from 'next/dynamic'

const AuthCallbackClient = nextDynamic(
  () => import('@/app/auth/callback/auth-callback-client'),
  { ssr: false }
)

export default function NoSSRAuthCallback() {
  return <AuthCallbackClient />
}
