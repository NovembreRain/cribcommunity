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
    // Required for server components in workspace packages
    serverComponentsExternalPackages: ['@prisma/client', '@crib/db'],
  },
}

export default nextConfig
