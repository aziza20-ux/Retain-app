import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // --- Admin user ---
  const passwordHash = await bcrypt.hash("Admin@1234", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@retain.app" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@retain.app",
      passwordHash,
      role: "ADMIN",
    },
  });


  // --- Default categories ---
  const categories = [
    { name: "Uncategorized", description: "Default fallback category" },
    {
      name: "Food & Dining",
      description: "Restaurants, groceries, and food delivery",
    },
    {
      name: "Transport",
      description: "Fuel, public transport, and ride-hailing",
    },
    { name: "Housing", description: "Rent, utilities, and home maintenance" },
    {
      name: "Healthcare",
      description: "Medical bills, pharmacy, and insurance",
    },
    { name: "Entertainment", description: "Streaming, events, and hobbies" },
    {
      name: "Shopping",
      description: "Clothing, electronics, and general shopping",
    },
    { name: "Education", description: "Tuition, books, and online courses" },
    {
      name: "Savings & Investments",
      description: "Savings deposits and investment contributions",
    },
    { name: "Other", description: "Miscellaneous expenses" },
  ];

  for (const category of categories) {
    const result = await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
    console.log(`Category ready: ${result.id} — ${result.name}`);
  }
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
