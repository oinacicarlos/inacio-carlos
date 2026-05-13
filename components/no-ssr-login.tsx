'use client'

import nextDynamic from 'next/dynamic'

const LoginClient = nextDynamic(
  () => import('@/app/login/login-client'),
  { ssr: false }
)

export default function NoSSRLogin() {
  return <LoginClient />
}
