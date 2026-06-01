import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

import { SAPClient } from './src/lib/sap/client';

async function run() {
    const client = SAPClient.getInstance();
    console.log("Querying SAP Gateway Catalog relative to OData root...");
    
    try {
        const response = await client.odataQuery('IWFND/CATALOGSERVICE;v=2/ServiceCollection', '&$top=200');
        const services = response.d?.results || [];
        console.log(`\nFound ${services.length} active Gateway OData services.`);
        
        console.log("\nActive services matching 'PLANT' or 'COMPANY' or 'ORG' or 'STRUCTURE':");
        services.forEach((srv: any) => {
            const name = srv.TechnicalServiceName || "";
            if (name.toUpperCase().includes("PLANT") || name.toUpperCase().includes("COMPANY") || name.toUpperCase().includes("ORG") || name.toUpperCase().includes("STRUCTURE")) {
                console.log(` - Name: ${srv.TechnicalServiceName}, Version: ${srv.Version}, Title: ${srv.ServiceTitle || 'N/A'}`);
            }
        });
    } catch(e: any) {
        console.error("Catalog query failed:", e.message);
    }
}

run();
