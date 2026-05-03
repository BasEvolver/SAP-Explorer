import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class SAPExtractor {
    
    // Simulate a DD02L / DD08L Extraction
    static async triggerMockFullLoad() {
        // Create a SyncLog
        const syncLog = await prisma.syncLog.create({
            data: {
                entityType: "FULL_LOAD",
                status: "RUNNING",
                message: "Starting mock extraction of S/4HANA Data Dictionary..."
            }
        });

        // Run asynchronously
        setTimeout(async () => {
            try {
                // Clear existing cache for full load
                await prisma.sapRelationship.deleteMany({});
                await prisma.sapField.deleteMany({});
                await prisma.sapTable.deleteMany({});

                // 1. Mock Tables
                const tables = [
                    { id: 'MARA', description: 'General Material Data', module: 'Procurement', isMaster: true },
                    { id: 'EKKO', description: 'Purchasing Document Header', module: 'Procurement', isMaster: false },
                    { id: 'EKPO', description: 'Purchasing Document Item', module: 'Procurement', isMaster: false },
                    { id: 'VBAK', description: 'Sales Document: Header Data', module: 'Sales', isMaster: false },
                    { id: 'VBAP', description: 'Sales Document: Item Data', module: 'Sales', isMaster: false },
                    { id: 'KNA1', description: 'General Data in Customer Master', module: 'Sales', isMaster: true },
                    { id: 'BKPF', description: 'Accounting Document Header', module: 'Finance', isMaster: false },
                    { id: 'BSEG', description: 'Accounting Document Segment', module: 'Finance', isMaster: false }
                ];

                await prisma.sapTable.createMany({ data: tables });

                // 2. Mock Fields
                await prisma.sapField.createMany({
                    data: [
                        { tableId: 'MARA', name: 'MATNR', description: 'Material Number', dataType: 'CHAR', length: 18, isKey: true },
                        { tableId: 'VBAK', name: 'VBELN', description: 'Sales Document', dataType: 'CHAR', length: 10, isKey: true },
                        { tableId: 'KNA1', name: 'KUNNR', description: 'Customer Number', dataType: 'CHAR', length: 10, isKey: true }
                    ]
                });

                // 3. Mock Relationships
                const rels = [
                    { sourceId: 'EKKO', targetId: 'EKPO', cardinality: '1:N' },
                    { sourceId: 'EKPO', targetId: 'MARA', cardinality: 'N:1' },
                    { sourceId: 'VBAK', targetId: 'VBAP', cardinality: '1:N' },
                    { sourceId: 'VBAP', targetId: 'MARA', cardinality: 'N:1' },
                    { sourceId: 'VBAK', targetId: 'KNA1', cardinality: 'N:1' },
                    { sourceId: 'BKPF', targetId: 'BSEG', cardinality: '1:N' },
                    { sourceId: 'VBAK', targetId: 'BKPF', cardinality: '1:1' }
                ];

                await prisma.sapRelationship.createMany({ data: rels });

                // Mark complete
                await prisma.syncLog.update({
                    where: { id: syncLog.id },
                    data: {
                        status: "COMPLETED",
                        records: tables.length + rels.length,
                        completedAt: new Date(),
                        message: "Mock extraction successful."
                    }
                });

            } catch (error: any) {
                await prisma.syncLog.update({
                    where: { id: syncLog.id },
                    data: {
                        status: "FAILED",
                        completedAt: new Date(),
                        message: error.message
                    }
                });
            }
        }, 3000); // Simulate a 3 second delay

        return syncLog;
    }
}
