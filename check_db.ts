import * as dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function run() {
  const count = await prisma.sapDD08L.count();
  console.log('DD08L Replica count:', count);
  const log = await prisma.syncLog.findFirst({ orderBy: { startedAt: 'desc' }});
  console.log('Last Sync Log:', log);
}
run().catch(console.error).finally(() => prisma.$disconnect());
