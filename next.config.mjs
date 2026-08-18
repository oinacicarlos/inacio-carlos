/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  async redirects() {
    return [
      {
        source: '/abrir-cnpj',
        destination: '/abrir-empresa',
        permanent: true,
      },
      {
        source: '/blog/quanto-pj-fatura-5-mil-paga-imposto',
        destination: '/blog/quanto-pj-paga-de-imposto-por-faturamento',
        permanent: true,
      },
      {
        source: '/blog/quanto-pj-fatura-10-mil-paga-imposto',
        destination: '/blog/quanto-pj-paga-de-imposto-por-faturamento',
        permanent: true,
      },
      {
        source: '/blog/quanto-pj-fatura-15-mil-paga-imposto',
        destination: '/blog/quanto-pj-paga-de-imposto-por-faturamento',
        permanent: true,
      },
      {
        source: '/blog/quanto-pj-fatura-20-mil-paga-imposto',
        destination: '/blog/quanto-pj-paga-de-imposto-por-faturamento',
        permanent: true,
      },
      {
        source: '/blog/quanto-pj-fatura-30-mil-paga-imposto',
        destination: '/blog/quanto-pj-paga-de-imposto-por-faturamento',
        permanent: true,
      },
    ]
  },
}

export default nextConfig

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
