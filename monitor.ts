import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

console.log("Starting Live DB Monitor (Press Ctrl+C to stop)...");

setInterval(async () => {
    try {
        const count = await prisma.sapDD08L.count();
        // Clear the console to make it look like a live dashboard
        console.clear();
        console.log(`=========================================`);
        console.log(` SAP DD08L Live Extraction Monitor       `);
        console.log(`=========================================`);
        console.log(` Current Rows: ${count.toLocaleString()}`);
        console.log(`=========================================`);
        console.log(`Updating every 2 seconds...`);
    } catch (error) {
        console.error("Error fetching count:", error);
    }
}, 2000);
