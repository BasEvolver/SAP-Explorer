import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

import { SAPClient } from './src/lib/sap/client';

async function querySAPTable(tableName: string, options: string = "") {
    const client = SAPClient.getInstance();
    const top = 100;
    const skip = 0;
    const encodedOptions = encodeURIComponent(options);
    const filters = `&$filter=QueryTable eq '${tableName}' and Text eq '${encodedOptions}' and Rowcount eq ${top} and Rowskips eq ${skip}`;
    
    try {
        const response = await client.odataQuery("Z_TABLE_READER_SRV/TableDataSet", filters);
        const results = response.d?.results || [];
        return results.map((row: any) => row.Wa || "");
    } catch (e: any) {
        console.error(`Error querying ${tableName}:`, e.message);
        return [];
    }
}

async function run() {
    console.log("Querying Real Company Codes from T001 (using .env.local)...");
    const coCodes = await querySAPTable('T001');
    console.log(`Found ${coCodes.length} Company Codes:`);
    coCodes.forEach((wa: string) => {
        console.log(" - Raw CoCode:", wa);
    });

    console.log("\nQuerying Real Plants from T001W (using .env.local)...");
    const plants = await querySAPTable('T001W');
    console.log(`Found ${plants.length} Plants:`);
    plants.forEach((wa: string) => {
        console.log(" - Raw Plant:", wa);
    });
}

run();
