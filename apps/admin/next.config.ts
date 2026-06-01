import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@crib/ui', '@crib/lib', '@crib/types'],
  experimental: {
    serverActions: {
      // Allow Server Actions through the nginx reverse proxy on port 8081
      allowedOrigins: ['13.49.178.248:8081', 'localhost:3001'],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'qjjetqtzexiydyfqohih.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.unsplash.com' },
    ],
  },
  serverExternalPackages: ['@prisma/client', '@crib/db'],
}

export default nextConfig
