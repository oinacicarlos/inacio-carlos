'use client'

import nextDynamic from 'next/dynamic'

const CadastroClient = nextDynamic(
  () => import('@/app/cadastro/cadastro-client'),
  { ssr: false }
)

export default function NoSSRCadastro() {
  return <CadastroClient />
}
