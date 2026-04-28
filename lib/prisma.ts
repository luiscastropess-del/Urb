import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  let url = process.env.DATABASE_URL || '';
  // No need to clean if it is a single valid URL
  
  return new PrismaClient({
    datasources: {
      db: {
        url,
      },
    },
  })
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

export const db = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prisma = db
