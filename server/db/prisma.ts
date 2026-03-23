import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg'; // NEW: The bridge between Prisma and Postgres

// 2. Initialize the Adapter
// This tells Prisma to create its Postgres adapter from connection config
// directly, which avoids the local pg type-version mismatch during builds.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

declare global {
  var prisma: PrismaClient | undefined;
}

// 3. Instantiate PrismaClient with the Adapter
// We MUST pass the 'adapter' property here, or Prisma 7 will throw the 
// [PrismaClientConstructorValidationError] you saw earlier.
export const prisma =
  global.prisma ||
  new PrismaClient({
    adapter, // <--- THIS IS THE KEY FIX FOR PRISMA 7
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
