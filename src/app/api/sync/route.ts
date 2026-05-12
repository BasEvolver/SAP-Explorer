import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { SAPExtractor } from "@/lib/sap/extractor";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function GET() {
    try {
        const logs = await prisma.syncLog.findMany({
            orderBy: { startedAt: 'desc' },
            take: 10
        });
        
        // Fetch actual counts from our replicated tables
        const stats = {
            dd08l: await prisma.sapDD08L.count(),
            dd02t: await prisma.sapDD02T.count(),
            dd02l: await prisma.sapDD02L.count(),
            dd03l: await prisma.sapDD03L.count(),
            ldbn: await prisma.sapLDBN.count(),
            tldb: await prisma.sapTLDB.count(),
            tldbt: await prisma.sapTLDBT.count(),
            tfdir: await prisma.sapTFDIR.count(),
            tftit: await prisma.sapTFTIT.count(),
        };

        const configs = await prisma.objectConfig.findMany({
            orderBy: { id: 'asc' }
        });

        // Ensure all default configs exist for our ACTUAL metadata tables
        const defaultConfigs = [
            { id: 'DD08L', category: 'Metadata (Relationships)', strategy: 'REPLICATED' as const, isEnabled: true },
            { id: 'DD02L', category: 'Metadata (Tables)', strategy: 'REPLICATED' as const, isEnabled: true },
            { id: 'DD02T', category: 'Metadata (Descriptions)', strategy: 'REPLICATED' as const, isEnabled: true },
            { id: 'DD03L', category: 'Metadata (Fields)', strategy: 'ON_DEMAND' as const, isEnabled: true },
            { id: 'TLDB', category: 'Logical Databases', strategy: 'REPLICATED' as const, isEnabled: true },
            { id: 'TLDBT', category: 'Logical Databases', strategy: 'REPLICATED' as const, isEnabled: true },
            { id: 'LDBN', category: 'Logical Databases', strategy: 'REPLICATED' as const, isEnabled: true },
            { id: 'TFDIR', category: 'Interfaces (Functions)', strategy: 'REPLICATED' as const, isEnabled: true },
            { id: 'TFTIT', category: 'Interfaces (Texts)', strategy: 'REPLICATED' as const, isEnabled: true }
        ];

        const existingIds = new Set(configs.map(c => c.id));
        const missingDefaults = defaultConfigs.filter(d => !existingIds.has(d.id));

        if (missingDefaults.length > 0) {
            await prisma.objectConfig.createMany({ data: missingDefaults });
            configs.push(...missingDefaults.map(d => ({ 
                ...d, 
                lastSync: null, 
                updatedAt: new Date() 
            })));
        }

        return NextResponse.json({ 
            logs, 
            stats,
            configs
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        
        // Handle Strategy Toggle
        if (body.action === 'UPDATE_STRATEGY') {
            const { id, strategy } = body;
            const updated = await prisma.objectConfig.update({
                where: { id },
                data: { strategy }
            });
            return NextResponse.json(updated);
        }

        // Handle Enable Toggle
        if (body.action === 'TOGGLE_ENABLE') {
            const { id, isEnabled } = body;
            const updated = await prisma.objectConfig.update({
                where: { id },
                data: { isEnabled }
            });
            return NextResponse.json(updated);
        }

        // Handle Full Extraction
        if (body.action === 'FULL_LOAD') {
            // Trigger actual background extraction
            const apiPath = process.env.SAP_API_PATH || "Z_TABLE_READER_SRV/TableDataSet";
            const log1 = await SAPExtractor.replicateDD02T(apiPath);
            const log2 = await SAPExtractor.replicateLogicalDatabases(apiPath);
            const log3 = await SAPExtractor.replicateCoreMetadata(apiPath);
            
            return NextResponse.json({ message: "Extraction started", logId: log3.id });
        }
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
