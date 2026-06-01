import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config();

import { SAPClient } from './src/lib/sap/client';

async function run() {
    const client = SAPClient.getInstance();
    try {
        console.log("Querying CATALOGSERVICE for services containing 'PROD' or 'MAT' and starting with 'ZAPI_' or 'API_'...");
        const url = "https://172.211.212.84:44301/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/ServiceCollection?$format=json";
        const response = await (client as any).makeRequest(url, 'application/json');
        const data = JSON.parse(response);
        const services = data.d?.results || [];
        
        const matching = services.filter((s: any) => {
            const title = s.Title || "";
            const id = s.ID || "";
            return (title.toUpperCase().includes("PROD") || title.toUpperCase().includes("MAT")) &&
                   (id.toUpperCase().includes("API_") || title.toUpperCase().includes("API_"));
        });
        
        console.log(`Found ${matching.length} services:`);
        matching.forEach((s: any) => {
            console.log(` - ID: ${s.ID}, Title: ${s.Title}, ServiceUrl: ${s.ServiceUrl}`);
        });
    } catch(e: any) {
        console.error("Error querying Catalog Service:", e.message);
    }
}
run();
