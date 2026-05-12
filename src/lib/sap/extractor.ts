import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { SAPClient } from "./client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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

    // Replicate DD08L Table in chunks
    static async replicateDD08L(apiPath: string = "Z_TABLE_READER_SRV/TableDataSet") {
        const syncLog = await prisma.syncLog.create({
            data: {
                entityType: "DD08L_REPLICATION",
                status: "RUNNING",
                message: "Starting extraction of SAP DD08L..."
            }
        });

        // Run asynchronously
        setTimeout(async () => {
            try {
                const client = SAPClient.getInstance();
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/_'.split('');
                const prefixes: string[] = [];
                
                // Generate 1-char exact matches and 2-char LIKE prefixes
                for (const c1 of chars) {
                    prefixes.push(c1); // Exact match for 1-char table names
                    for (const c2 of chars) {
                        prefixes.push(c1 + c2 + '%'); // e.g., 'AA%', 'AB%'
                    }
                }
                
                let totalInserted = 0;

                for (const prefix of prefixes) {
                    await prisma.syncLog.update({
                        where: { id: syncLog.id },
                        data: { message: `Extracting DD08L (Prefix: ${prefix})... (Fetched: ${totalInserted})` }
                    });

                    // We bump the max limit to 150,000 because some prefixes (like /S) have over 30,000 tables.
                    const top = 150000; 
                    const skip = 0;
                    
                    let optionsStr = "";
                    if (prefix.length === 1) {
                        optionsStr = `TABNAME EQ ''${prefix}''`;
                    } else {
                        optionsStr = `TABNAME LIKE ''${prefix}''`;
                    }

                    // URL Encode the string because it contains spaces and the % character
                    const encodedOptions = encodeURIComponent(optionsStr);
                    const filters = `&$filter=QueryTable eq 'DD08L' and Text eq '${encodedOptions}' and Rowcount eq ${top} and Rowskips eq ${skip}`;
                    
                    try {
                        const response = await client.odataQuery(apiPath, filters);
                        const results = response.d?.results || [];

                        if (results.length === 0) continue;

                        // Parse the RFC_READ_TABLE output
                        const mappedData = results.map((row: any) => {
                            const wa = row.Wa || "";
                            if (!wa) return null;
                            
                            return {
                                TABNAME: wa.substring(0, 30).trim(),
                                FIELDNAME: wa.substring(30, 60).trim(),
                                AS4LOCAL: wa.substring(60, 61).trim(),
                                AS4VERS: wa.substring(61, 65).trim(),
                                CHECKTABLE: wa.substring(65, 95).trim() || null,
                                FRKART: wa.substring(95, 99).trim() || null,
                                CLASFIELD: wa.substring(99, 129).trim() || null,
                                CLASVALUE: wa.substring(129, 139).trim() || null,
                                CARDLEFT: wa.substring(139, 141).trim() || null,
                                CARD: wa.substring(141, 143).trim() || null,
                                CHECKFLAG: wa.substring(143, 144).trim() || null,
                                ARBGB: wa.substring(144, 164).trim() || null,
                                MSGNR: wa.substring(164, 167).trim() || null,
                                NOINHERIT: wa.substring(167, 168).trim() || null
                            };
                        }).filter((row: any) => row && row.TABNAME && row.FIELDNAME);

                        if (mappedData.length > 0) {
                            await prisma.sapDD08L.createMany({
                                data: mappedData,
                                skipDuplicates: true 
                            });
                            totalInserted += mappedData.length;
                            
                            // Live Progress Update
                            await prisma.syncLog.update({
                                where: { id: syncLog.id },
                                data: { records: totalInserted }
                            });
                        }
                    } catch (err: any) {
                        console.error(`Failed on prefix ${prefix}:`, err.message);
                    }
                }

                await prisma.syncLog.update({
                    where: { id: syncLog.id },
                    data: {
                        status: "COMPLETED",
                        records: totalInserted,
                        completedAt: new Date(),
                        message: "DD08L extraction successful."
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
        }, 0);

        return syncLog;
    }

    // Replicate DD02T (Table Texts)
    static async replicateDD02T(apiPath: string = "Z_TABLE_READER_SRV/TableDataSet") {
        const syncLog = await prisma.syncLog.create({
            data: {
                entityType: "DD02T_REPLICATION",
                status: "RUNNING",
                message: "Starting extraction of SAP DD02T (English)..."
            }
        });

        setTimeout(async () => {
            try {
                const client = SAPClient.getInstance();
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ/_'.split('');
                const prefixes: string[] = [];
                
                // DD02T is huge, so we use 2-char prefixes
                for (const c1 of chars) {
                    for (const c2 of chars) {
                        prefixes.push(c1 + c2 + '%');
                    }
                }
                
                let totalInserted = 0;

                for (const prefix of prefixes) {
                    await prisma.syncLog.update({
                        where: { id: syncLog.id },
                        data: { message: `Extracting DD02T (Prefix: ${prefix})... (Fetched: ${totalInserted})` }
                    });

                    const top = 150000; 
                    const skip = 0;
                    
                    const optionsStr = `DDLANGUAGE EQ ''E'' AND TABNAME LIKE ''${prefix}''`;
                    const encodedOptions = encodeURIComponent(optionsStr);
                    const filters = `&$filter=QueryTable eq 'DD02T' and Text eq '${encodedOptions}' and Rowcount eq ${top} and Rowskips eq ${skip}`;
                    
                    try {
                        const response = await client.odataQuery(apiPath, filters);
                        const results = response.d?.results || [];

                        if (results.length === 0) continue;

                        const mappedData = results.map((row: any) => {
                            const wa = row.Wa || "";
                            if (!wa || wa.length < 37) return null;
                            
                            // Wa: [P0303_AF                      EA0000Additional Query Fields]
                            // TABNAME 0-30, DDLANGUAGE 30-31, AS4LOCAL 31-32, AS4VERS 32-36, DDTEXT 36+
                            return {
                                TABNAME: wa.substring(0, 30).trim(),
                                DDLANGUAGE: wa.substring(30, 31).trim(),
                                AS4LOCAL: wa.substring(31, 32).trim(),
                                AS4VERS: wa.substring(32, 36).trim(),
                                DDTEXT: wa.substring(36).trim()
                            };
                        }).filter((row: any) => row && row.TABNAME);

                        if (mappedData.length > 0) {
                            await prisma.sapDD02T.createMany({
                                data: mappedData,
                                skipDuplicates: true 
                            });
                            totalInserted += mappedData.length;

                            // Live Progress Update
                            await prisma.syncLog.update({
                                where: { id: syncLog.id },
                                data: { records: totalInserted }
                            });
                        }
                    } catch (err: any) {
                        console.error(`Failed on prefix ${prefix}:`, err.message);
                    }
                }

                await prisma.syncLog.update({
                    where: { id: syncLog.id },
                    data: {
                        status: "COMPLETED",
                        records: totalInserted,
                        completedAt: new Date(),
                        message: "DD02T extraction successful."
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
        }, 0);

        return syncLog;
    }

    // Replicate Logical Databases (TLDB & TLDBT)
    static async replicateLogicalDatabases(apiPath: string = "Z_TABLE_READER_SRV/TableDataSet") {
        const syncLog = await prisma.syncLog.create({
            data: {
                entityType: "LDB_REPLICATION",
                status: "RUNNING",
                message: "Starting extraction of Logical Databases..."
            }
        });

        setTimeout(async () => {
            try {
                const client = SAPClient.getInstance();
                let totalInserted = 0;

                // 1. Extract TLDB
                await prisma.syncLog.update({ where: { id: syncLog.id }, data: { message: `Extracting TLDB...` } });
                const tldbFilters = `&$filter=QueryTable eq 'TLDB' and Rowcount eq 150000 and Rowskips eq 0`;
                
                try {
                    const response = await client.odataQuery(apiPath, tldbFilters);
                    const results = response.d?.results || [];
                    const mappedData = results.map((row: any) => {
                        const wa = row.Wa || "";
                        if (!wa || wa.length < 20) return null;
                        return {
                            LDBNAME: wa.substring(0, 20).trim(),
                            LDBNA_NODE: wa.substring(20).trim() || null
                        };
                    }).filter((row: any) => row && row.LDBNAME);

                    if (mappedData.length > 0) {
                        await prisma.sapTLDB.createMany({ data: mappedData, skipDuplicates: true });
                        totalInserted += mappedData.length;
                    }
                } catch (err: any) {
                    console.error("TLDB extraction failed:", err);
                }

                // 2. Extract TLDBT
                await prisma.syncLog.update({ where: { id: syncLog.id }, data: { message: `Extracting TLDBT (English)...` } });
                const tldbtOptions = encodeURIComponent(`SPRAS EQ ''E''`);
                const tldbtFilters = `&$filter=QueryTable eq 'TLDBT' and Text eq '${tldbtOptions}' and Rowcount eq 150000 and Rowskips eq 0`;
                
                try {
                    const response = await client.odataQuery(apiPath, tldbtFilters);
                    const results = response.d?.results || [];
                    const mappedData = results.map((row: any) => {
                        const wa = row.Wa || "";
                        if (!wa || wa.length < 21) return null;
                        return {
                            SPRAS: wa.substring(0, 1).trim(),
                            LDBNAME: wa.substring(1, 21).trim(),
                            LDBTEXT: wa.substring(21).trim() || null
                        };
                    }).filter((row: any) => row && row.LDBNAME);

                    if (mappedData.length > 0) {
                        await prisma.sapTLDBT.createMany({ data: mappedData, skipDuplicates: true });
                        totalInserted += mappedData.length;
                    }
                } catch (err: any) {
                    console.error("TLDBT extraction failed:", err);
                }

                await prisma.syncLog.update({
                    where: { id: syncLog.id },
                    data: {
                        status: "COMPLETED",
                        records: totalInserted,
                        completedAt: new Date(),
                        message: "Logical Database extraction successful."
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
        }, 0);

        return syncLog;
    }

    // Replicate Core Metadata (DD02L, DD03L, TFDIR, TFTIT, LDBN)
    static async replicateCoreMetadata(apiPath: string = "Z_TABLE_READER_SRV/TableDataSet") {
        const syncLog = await prisma.syncLog.create({
            data: {
                entityType: "CORE_METADATA",
                status: "RUNNING",
                message: "Starting core metadata extraction..."
            }
        });

        setTimeout(async () => {
            try {
                const client = SAPClient.getInstance();
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ/_0123456789'.split('');
                
                // --- 1. SapLDBN (Logical DB Nodes) ---
                await prisma.syncLog.update({ where: { id: syncLog.id }, data: { message: `Extracting LDBN...` } });
                try {
                    const response = await client.odataQuery(apiPath, `&$filter=QueryTable eq 'LDBN' and Rowcount eq 150000 and Rowskips eq 0`);
                    const mappedData = (response.d?.results || []).map((row: any) => {
                        const wa = row.Wa || "";
                        if (wa.length < 50) return null;
                        return {
                            LDBNAME: wa.substring(0, 20).trim(),
                            NODEID: wa.substring(20, 50).trim(),
                            PARENTID: wa.substring(50, 80).trim() || null
                        };
                    }).filter((r: any) => r && r.LDBNAME && r.NODEID);
                    if (mappedData.length > 0) await prisma.sapLDBN.createMany({ data: mappedData, skipDuplicates: true });
                } catch (e: any) { console.error("LDBN error:", e.message); }

                // --- 2. SapTFDIR & SapTFTIT (RFCs) ---
                for (const c1 of chars) {
                    await prisma.syncLog.update({ where: { id: syncLog.id }, data: { message: `Extracting TFDIR & TFTIT (Prefix: ${c1})...` } });
                    
                    // TFDIR
                    try {
                        const options = encodeURIComponent(`FUNCNAME LIKE ''${c1}%''`);
                        const response = await client.odataQuery(apiPath, `&$filter=QueryTable eq 'TFDIR' and Text eq '${options}' and Rowcount eq 150000 and Rowskips eq 0`);
                        const mappedData = (response.d?.results || []).map((row: any) => {
                            const wa = row.Wa || "";
                            if (wa.length < 30) return null;
                            return {
                                FUNCNAME: wa.substring(0, 30).trim(),
                                PNAME: wa.substring(30, 70).trim() || null,
                                INCLUDE: wa.substring(70, 72).trim() || null,
                                FMODE: wa.substring(72).trim() || null
                            };
                        }).filter((r: any) => r && r.FUNCNAME);
                        if (mappedData.length > 0) await prisma.sapTFDIR.createMany({ data: mappedData, skipDuplicates: true });
                    } catch (e: any) {}

                    // TFTIT (English only)
                    try {
                        const options = encodeURIComponent(`SPRAS EQ ''E'' AND FUNCNAME LIKE ''${c1}%''`);
                        const response = await client.odataQuery(apiPath, `&$filter=QueryTable eq 'TFTIT' and Text eq '${options}' and Rowcount eq 150000 and Rowskips eq 0`);
                        const mappedData = (response.d?.results || []).map((row: any) => {
                            const wa = row.Wa || "";
                            if (wa.length < 32) return null;
                            return {
                                SPRAS: wa.substring(0, 1).trim(),
                                FUNCNAME: wa.substring(1, 31).trim(),
                                STEXT: wa.substring(31).trim() || null
                            };
                        }).filter((r: any) => r && r.FUNCNAME);
                        if (mappedData.length > 0) await prisma.sapTFTIT.createMany({ data: mappedData, skipDuplicates: true });
                    } catch (e: any) {}
                }

                // --- 3. SapDD02L (Tables) ---
                for (const c1 of chars) {
                    for (const c2 of chars) {
                        const prefix = c1 + c2 + '%';
                        await prisma.syncLog.update({ where: { id: syncLog.id }, data: { message: `Extracting DD02L (Prefix: ${prefix})...` } });
                        try {
                            const options = encodeURIComponent(`TABNAME LIKE ''${prefix}''`);
                            const response = await client.odataQuery(apiPath, `&$filter=QueryTable eq 'DD02L' and Text eq '${options}' and Rowcount eq 150000 and Rowskips eq 0`);
                            const mappedData = (response.d?.results || []).map((row: any) => {
                                const wa = row.Wa || "";
                                if (wa.length < 30) return null;
                                return {
                                    TABNAME: wa.substring(0, 30).trim(),
                                    TABCLASS: wa.substring(35, 43).trim() || null,
                                    AS4LOCAL: wa.substring(30, 31).trim() || null,
                                    AS4VERS: wa.substring(31, 35).trim() || null
                                };
                            }).filter((r: any) => r && r.TABNAME);
                            if (mappedData.length > 0) await prisma.sapDD02L.createMany({ data: mappedData, skipDuplicates: true });
                        } catch (e: any) {}
                    }
                }

                // --- 4. SapDD03L (Fields - On Demand Strategy usually, but we chunk it anyway) ---
                // We use 3-char prefixes because DD03L is 5M+ rows.
                for (const c1 of chars) {
                    for (const c2 of chars) {
                        const prefix = c1 + c2 + '%';
                        await prisma.syncLog.update({ where: { id: syncLog.id }, data: { message: `Extracting DD03L (Prefix: ${prefix})...` } });
                        try {
                            const options = encodeURIComponent(`TABNAME LIKE ''${prefix}''`);
                            const response = await client.odataQuery(apiPath, `&$filter=QueryTable eq 'DD03L' and Text eq '${options}' and Rowcount eq 150000 and Rowskips eq 0`);
                            const mappedData = (response.d?.results || []).map((row: any) => {
                                const wa = row.Wa || "";
                                if (wa.length < 65) return null;
                                return {
                                    TABNAME: wa.substring(0, 30).trim(),
                                    FIELDNAME: wa.substring(30, 60).trim(),
                                    AS4LOCAL: wa.substring(60, 61).trim(),
                                    AS4VERS: wa.substring(61, 65).trim(),
                                    POSITION: wa.substring(65, 69).trim() || null,
                                    KEYFLAG: wa.substring(69, 70).trim() || null
                                };
                            }).filter((r: any) => r && r.TABNAME && r.FIELDNAME);
                            if (mappedData.length > 0) await prisma.sapDD03L.createMany({ data: mappedData, skipDuplicates: true });
                        } catch (e: any) {}
                    }
                }

                await prisma.syncLog.update({
                    where: { id: syncLog.id },
                    data: {
                        status: "COMPLETED",
                        completedAt: new Date(),
                        message: "Core Metadata extraction successfully queued!"
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
        }, 0);

        return syncLog;
    }
}
