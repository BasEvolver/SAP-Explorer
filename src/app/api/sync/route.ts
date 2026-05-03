import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { SAPExtractor } from "@/lib/sap/extractor";

const prisma = new PrismaClient();

export async function GET() {
    try {
        const logs = await prisma.syncLog.findMany({
            orderBy: { startedAt: 'desc' },
            take: 10
        });
        
        const tableCount = await prisma.sapTable.count();
        const relCount = await prisma.sapRelationship.count();

        return NextResponse.json({ logs, stats: { tables: tableCount, relationships: relCount } });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
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
