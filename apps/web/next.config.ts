import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@crib/ui', '@crib/lib', '@crib/types'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'qjjetqtzexiydyfqohih.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  }
}

export default nextConfig
