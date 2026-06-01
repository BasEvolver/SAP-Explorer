import * as dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function run() {
  const arItems = await prisma.sapArItem.findMany({ select: { postingDate: true } });
  const apItems = await prisma.sapApItem.findMany({ select: { postingDate: true } });

  const arYears: Record<string, number> = {};
  const apYears: Record<string, number> = {};

  arItems.forEach(item => {
    const year = item.postingDate ? item.postingDate.substring(0, 4) : 'unknown';
    arYears[year] = (arYears[year] || 0) + 1;
  });

  apItems.forEach(item => {
    const year = item.postingDate ? item.postingDate.substring(0, 4) : 'unknown';
    apYears[year] = (apYears[year] || 0) + 1;
  });

  console.log('AR Items by Year:', arYears);
  console.log('AP Items by Year:', apYears);
}
run().catch(console.error).finally(() => prisma.$disconnect());
