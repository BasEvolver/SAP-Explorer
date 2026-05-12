import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Initialize Prisma once per module
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const rootNode = searchParams.get('root') || 'MARA';

        // 1. Get 1st Degree relationships (Root Node Outgoing & Incoming)
        const rootOutgoing = await prisma.sapDD08L.findMany({
            where: { TABNAME: rootNode },
            select: { TABNAME: true, CHECKTABLE: true, FIELDNAME: true }
        });

        const rootIncoming = await prisma.sapDD08L.findMany({
            where: { CHECKTABLE: rootNode },
            select: { TABNAME: true, CHECKTABLE: true, FIELDNAME: true },
            take: 50 // Cap incoming to prevent massive hairballs for generic tables like T000
        });

        const firstDegreeTables = new Set<string>();
        rootOutgoing.forEach(r => { if(r.CHECKTABLE && r.CHECKTABLE !== '*' && r.CHECKTABLE !== ' ') firstDegreeTables.add(r.CHECKTABLE) });
        rootIncoming.forEach(r => { if(r.TABNAME) firstDegreeTables.add(r.TABNAME) });

        // 2. Get 2nd Degree relationships (Outgoing dependencies of the 1st degree nodes)
        // We only fetch outgoing to prevent exploding the graph size.
        const secondDegreeRels = await prisma.sapDD08L.findMany({
            where: { 
                TABNAME: { in: Array.from(firstDegreeTables) }
            },
            select: { TABNAME: true, CHECKTABLE: true, FIELDNAME: true }
        });

        // Group 2nd degree by TABNAME and limit to 5 per table to keep graph clean
        const groupedSecondDegree: any[] = [];
        const countMap = new Map<string, number>();
        
        for (const rel of secondDegreeRels) {
            const count = countMap.get(rel.TABNAME) || 0;
            if (count < 5) {
                groupedSecondDegree.push(rel);
                countMap.set(rel.TABNAME, count + 1);
            }
        }

        const outgoing = [...rootOutgoing, ...groupedSecondDegree];
        const incoming = rootIncoming;

        const nodesMap = new Map();
        const links: any[] = [];
        
        // Add root node explicitly
        nodesMap.set(rootNode, { id: rootNode, type: 'Root', val: 25 });

        const processRels = (rels: any[]) => {
            for (const rel of rels) {
                // Ignore empty or wildcard check tables
                if (!rel.CHECKTABLE || rel.CHECKTABLE === '*' || rel.CHECKTABLE === ' ') continue;
                
                const source = rel.TABNAME;
                const target = rel.CHECKTABLE;
                
                // Add nodes if they don't exist
                if (!nodesMap.has(source)) {
                    nodesMap.set(source, { id: source, type: 'Transaction', val: 5 });
                }
                if (!nodesMap.has(target)) {
                    nodesMap.set(target, { id: target, type: 'Master', val: 10 });
                }
                
                // Add link
                links.push({
                    source,
                    target,
                    name: rel.FIELDNAME
                });
            }
        };

        processRels(outgoing);
        processRels(incoming);

        // Deduplicate links (some tables might have multiple fields pointing to the same check table)
        const uniqueLinks = [];
        const seenLinks = new Set();
        for (const link of links) {
            const key = `${link.source}-${link.target}`;
            if (!seenLinks.has(key)) {
                seenLinks.add(key);
                uniqueLinks.push(link);
            }
        }

        const nodesArray = Array.from(nodesMap.values());
        const tableNames = nodesArray.map((n: any) => n.id);

        // Fetch descriptions from our newly extracted SapDD02T cache
        const descriptions = await prisma.sapDD02T.findMany({
            where: { 
                TABNAME: { in: tableNames },
                DDLANGUAGE: 'E' // English only
            },
            select: { TABNAME: true, DDTEXT: true }
        });

        const descMap = new Map();
        for (const desc of descriptions) {
            descMap.set(desc.TABNAME, desc.DDTEXT);
        }

        // Attach descriptions to nodes
        for (const node of nodesArray as any[]) {
            node.description = descMap.get(node.id) || null;
        }

        return NextResponse.json({
            nodes: nodesArray,
            links: uniqueLinks
        });

    } catch (error: any) {
        console.error("Schema API Error:", error);
        return NextResponse.json(
            { error: error.message || "An error occurred while fetching DD08L graph data." }, 
            { status: 500 }
        );
    }
}
