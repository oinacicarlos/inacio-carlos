/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
}

export default nextConfig

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
