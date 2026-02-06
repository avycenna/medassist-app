let prismaInstance: any = null

export function getPrismaClient() {
  if (prismaInstance) {
    return prismaInstance
  }

  const globalForPrisma = globalThis as unknown as {
    prisma: any
    pool: any
  }

  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set")
  }

  // Lazy load Prisma only when needed
  const { PrismaClient } = require("@prisma/client")
  const { PrismaPg } = require("@prisma/adapter-pg")
  const { Pool } = require("pg")

  // Create a connection pool
  const pool = globalForPrisma.pool ?? new Pool({ connectionString: process.env.DATABASE_URL })
  if (process.env.NODE_ENV !== "production") globalForPrisma.pool = pool

  // Create the adapter
  const adapter = new PrismaPg(pool)

  prismaInstance = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })

  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prismaInstance

  return prismaInstance
}

export const prisma = getPrismaClient()
export default prisma
