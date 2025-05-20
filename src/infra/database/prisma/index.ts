import { PrismaClient } from "@prisma/client"
import { env } from "@/infra/env"
import Logger from "@/shared/utils/logger"

// Configure Prisma client with connection handling for Neon
const prismaClientSingleton = () => {
  const prisma = new PrismaClient({
    log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
  })

  // Handle connection events
  prisma
    .$connect()
    .then(() => {
      Logger.info("Successfully connected to Neon database")
    })
    .catch((error) => {
      Logger.error("Failed to connect to Neon database", error)
      process.exit(1)
    })

  // Add connection handling for Neon's pooled connections
  prisma.$on("query", (e) => {
    if (env.NODE_ENV === "development") {
      Logger.info(`Query: ${e.query}`)
    }
  })

  return prisma
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
