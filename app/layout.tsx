import type React from "react"
import type { Metadata } from "next"
import { Suspense } from "react"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: {
    default: "Tropa | Contabilidade Online",
    template: "%s",
  },
  applicationName: "Tropa",
  description: "Contabilidade online para prestadores de serviço, com hub do cliente, ferramentas, solicitações, rotinas e suporte especializado.",
  keywords: [
    "Tropa",
    "contabilidade online",
    "contabilidade para prestadores de serviço",
    "abrir CNPJ",
    "MEI",
    "Simples Nacional",
    "hub do cliente",
  ],
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "Tropa | Contabilidade Online",
    description: "Contabilidade online para prestadores de serviço, com ferramentas, rotinas e suporte em um só hub.",
    siteName: "Tropa",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Tropa | Contabilidade Online",
    description: "Contabilidade online para prestadores de serviço, com ferramentas, rotinas e suporte em um só hub.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=AW-18367655896" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'AW-18367655896');
gtag('config', 'G-ECR1NWWTFG');`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '941306128960696');
fbq('track', 'PageView');`,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=941306128960696&ev=PageView&noscript=1"
          />
        </noscript>
      </head>
      <body className={inter.variable}>
        <Suspense fallback={null}>{children}</Suspense>
      </body>
    </html>
  )
}
