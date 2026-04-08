import { PrismaClient } from '@prisma/client'

// Singleton pattern — prevents too many connections in development with HMR.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Re-export all Prisma types — consumers import from @crib/db, never from @prisma/client directly.
export * from '@prisma/client'
