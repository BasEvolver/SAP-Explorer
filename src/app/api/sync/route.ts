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
        
        const tableCount = await prisma.sapTable.count();
        const relCount = await prisma.sapRelationship.count();
        const configs = await prisma.objectConfig.findMany({
            orderBy: { id: 'asc' }
        });

        // Pre-seed some default configs if the table is empty for the demo
        if (configs.length === 0) {
            const defaults = [
                { id: 'T000', category: 'System Metadata', strategy: 'REPLICATED' as const, isEnabled: true },
                { id: 'DD02L', category: 'System Metadata', strategy: 'REPLICATED' as const, isEnabled: true },
                { id: 'DD08L', category: 'System Metadata', strategy: 'REPLICATED' as const, isEnabled: true },
                { id: 'TVKO', category: 'Configuration Data', strategy: 'REPLICATED' as const, isEnabled: true },
                { id: 'T001', category: 'Configuration Data', strategy: 'REPLICATED' as const, isEnabled: true },
                { id: 'MARA', category: 'Master Data', strategy: 'ON_DEMAND' as const, isEnabled: true },
                { id: 'KNA1', category: 'Master Data', strategy: 'ON_DEMAND' as const, isEnabled: true },
                { id: 'LFA1', category: 'Master Data', strategy: 'ON_DEMAND' as const, isEnabled: true },
                { id: 'VBAK', category: 'Transaction Data', strategy: 'ON_DEMAND' as const, isEnabled: true },
                { id: 'BSEG', category: 'Transaction Data', strategy: 'ON_DEMAND' as const, isEnabled: true },
                { id: 'EKKO', category: 'Transaction Data', strategy: 'ON_DEMAND' as const, isEnabled: true }
            ];
            await prisma.objectConfig.createMany({ data: defaults });
            configs.push(...defaults.map(d => ({ ...d, lastSync: null, updatedAt: new Date() })));
        }

        return NextResponse.json({ 
            logs, 
            stats: { tables: tableCount, relationships: relCount },
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
            // Trigger background extraction
            const log = await SAPExtractor.triggerMockFullLoad();
            return NextResponse.json({ message: "Extraction started", logId: log.id });
        }
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
