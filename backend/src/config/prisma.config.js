import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.ts";

// Use the pg driver adapter so Prisma connects via the DATABASE_URL connection string.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// Export a single shared Prisma client instance used by all controllers.
export const prisma = new PrismaClient({ adapter });
