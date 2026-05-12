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
        const ldbname = searchParams.get('ldb')?.toUpperCase();
        const search = searchParams.get('search')?.toUpperCase();

        // 1. Fetch details and hierarchy for a specific LDB
        if (ldbname) {
            const ldb = await prisma.sapTLDB.findUnique({
                where: { LDBNAME: ldbname }
            });

            if (!ldb) {
                return NextResponse.json({ error: "Logical Database not found" }, { status: 404 });
            }

            const text = await prisma.sapTLDBT.findFirst({
                where: { LDBNAME: ldbname, SPRAS: 'E' }
            });

            const nodes = await prisma.sapLDBN.findMany({
                where: { LDBNAME: ldbname }
            });

            // Fetch table descriptions for the nodes
            const nodeIds = nodes.map(n => n.NODEID);
            const descriptions = await prisma.sapDD02T.findMany({
                where: { TABNAME: { in: nodeIds }, DDLANGUAGE: 'E' }
            });
            const descMap = new Map(descriptions.map(d => [d.TABNAME, d.DDTEXT]));

            const enrichedNodes = nodes.map(n => ({
                ...n,
                description: descMap.get(n.NODEID) || null
            }));

            return NextResponse.json({
                ldb: ldb.LDBNAME,
                rootNode: ldb.LDBNA_NODE,
                description: text?.LDBTEXT || null,
                nodes: enrichedNodes
            });
        }

        // 2. Search/List Logical Databases
        let query: any = {};
        if (search) {
            query = {
                LDBNAME: { contains: search }
            };
        }

        const ldbs = await prisma.sapTLDB.findMany({
            where: query,
            take: 100
        });

        // Attach descriptions
        const ldbNames = ldbs.map(l => l.LDBNAME);
        const texts = await prisma.sapTLDBT.findMany({
            where: { LDBNAME: { in: ldbNames }, SPRAS: 'E' }
        });
        const textMap = new Map(texts.map(t => [t.LDBNAME, t.LDBTEXT]));

        const results = ldbs.map(l => ({
            LDBNAME: l.LDBNAME,
            LDBNA_NODE: l.LDBNA_NODE,
            LDBTEXT: textMap.get(l.LDBNAME) || null
        }));

        return NextResponse.json(results);

    } catch (error: any) {
        console.error("LDB API Error:", error);
        return NextResponse.json(
            { error: error.message || "An error occurred while fetching LDB data." }, 
            { status: 500 }
        );
    }
}
