import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config();

import { SAPClient } from './src/lib/sap/client';

async function run() {
    const client = SAPClient.getInstance();
    try {
        console.log("Querying SAP NetWeaver Gateway Catalog Service for all registered services...");
        const url = "https://172.211.212.84:44301/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/ServiceCollection?$format=json";
        const response = await (client as any).makeRequest(url, 'application/json');
        const data = JSON.parse(response);
        const services = data.d?.results || [];
        console.log(`Found ${services.length} registered services.`);
        
        const matching = services.filter((s: any) => {
            const id = s.ID || s.id || "";
            const techName = s.TechnicalName || s.technicalName || s.Name || s.name || "";
            return id.toLowerCase().includes("product") || 
                   id.toLowerCase().includes("material") ||
                   techName.toLowerCase().includes("product") || 
                   techName.toLowerCase().includes("material");
        });
        
        console.log("\nMatching services (Product/Material):");
        matching.forEach((s: any) => {
            console.log(`- ID: ${s.ID || s.id || 'N/A'}, TechnicalName: ${s.TechnicalName || s.Name || 'N/A'}, Title: ${s.Title || 'N/A'}`);
        });

        console.log("\nChecking the first 5 services:");
        services.slice(0, 5).forEach((s: any) => {
            console.log(JSON.stringify(s));
        });
    } catch(e: any) {
        console.error("Error querying Catalog Service:", e.message);
    }
}
run();
