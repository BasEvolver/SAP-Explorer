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
        const search = searchParams.get('search')?.toUpperCase();
        const limit = parseInt(searchParams.get('limit') || '50');

        if (!search) {
            return NextResponse.json({ error: "Search parameter is required" }, { status: 400 });
        }

        // Fetch Remote-Enabled Function Modules (RFCs)
        const rfcs = await prisma.sapTFDIR.findMany({
            where: {
                FUNCNAME: { contains: search },
                FMODE: 'R' // Only remote-enabled
            },
            take: limit,
            orderBy: { FUNCNAME: 'asc' }
        });

        // Fetch texts
        const funcNames = rfcs.map(r => r.FUNCNAME);
        const texts = await prisma.sapTFTIT.findMany({
            where: {
                FUNCNAME: { in: funcNames },
                SPRAS: 'E' // English
            }
        });

        const textMap = new Map(texts.map(t => [t.FUNCNAME, t.STEXT]));

        const results = rfcs.map(rfc => ({
            ...rfc,
            description: textMap.get(rfc.FUNCNAME) || null
        }));

        return NextResponse.json(results);

    } catch (error: any) {
        console.error("RFC API Error:", error);
        return NextResponse.json(
            { error: error.message || "An error occurred while fetching RFCs." }, 
            { status: 500 }
        );
    }
}
