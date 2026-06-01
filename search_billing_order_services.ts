import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config();

import { SAPClient } from './src/lib/sap/client';

async function run() {
    const client = SAPClient.getInstance();
    try {
        console.log("Searching catalog for billing-related services specifically...");
        const url = "https://172.211.212.84:44301/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/ServiceCollection?$format=json";
        const response = await (client as any).makeRequest(url, 'application/json');
        const data = JSON.parse(response);
        const services = data.d?.results || [];
        
        const billingServices = services.filter((s: any) => {
            const id = s.ID || s.id || "";
            return id.toLowerCase().includes("billing");
        });
        
        console.log(`Found ${billingServices.length} billing services.`);
        billingServices.forEach((s: any) => {
            console.log(`- ID: ${s.ID}, TechnicalName: ${s.TechnicalName || 'N/A'}, Title: ${s.Title || 'N/A'}, Url: ${s.Url || s.url}`);
        });

        console.log("\nSearching catalog for order-related services specifically...");
        const orderServices = services.filter((s: any) => {
            const id = s.ID || s.id || "";
            return id.toLowerCase().includes("order");
        });
        
        console.log(`Found ${orderServices.length} order services.`);
        orderServices.slice(0, 15).forEach((s: any) => {
            console.log(`- ID: ${s.ID}, Title: ${s.Title || 'N/A'}`);
        });

    } catch(e: any) {
        console.error("Error querying Catalog Service:", e.message);
    }
}
run();
