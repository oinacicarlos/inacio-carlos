import LoginClient from './login-client'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Login | Inácio Carlos',
  description: 'Acesse o hub administrativo.',
}

export default function LoginPage() {
  return <LoginClient />
}
