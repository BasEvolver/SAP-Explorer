import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q')?.toUpperCase() || '';

        if (!query) {
            return NextResponse.json({ tables: [], ldbs: [] });
        }

        // Search Data Dictionary Texts
        const tables = await prisma.sapDD02T.findMany({
            where: {
                OR: [
                    { TABNAME: { contains: query } },
                    { DDTEXT: { contains: query, mode: 'insensitive' } }
                ],
                DDLANGUAGE: 'E'
            },
            take: 20
        });

        // Search Logical Databases
        const ldbs = await prisma.sapTLDBT.findMany({
            where: {
                OR: [
                    { LDBNAME: { contains: query } },
                    { LDBTEXT: { contains: query, mode: 'insensitive' } }
                ],
                SPRAS: 'E'
            },
            take: 20
        });

        return NextResponse.json({ tables, ldbs });

    } catch (error: any) {
        console.error("Search API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
