import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

import { SAPClient } from './src/lib/sap/client';

async function test() {
    const client = SAPClient.getInstance();
    console.log("Testing OData connection to S/4HANA...");
    
    // 1. Test A_Customer
    try {
        console.log("Querying API_BUSINESS_PARTNER/A_Customer...");
        const res = await client.odataQuery("API_BUSINESS_PARTNER/A_Customer", "&$top=5");
        console.log("A_Customer Response Success! Found:", res?.d?.results?.length || 0, "records.");
        if (res?.d?.results) {
            res.d.results.forEach((row: any) => {
                console.log(` - ID: ${row.Customer}, Name: ${row.CustomerName}`);
            });
        }
    } catch (e: any) {
        console.error("A_Customer query failed:", e.message);
    }

    // 2. Test A_BusinessPartner
    try {
        console.log("\nQuerying API_BUSINESS_PARTNER/A_BusinessPartner...");
        const res = await client.odataQuery("API_BUSINESS_PARTNER/A_BusinessPartner", "&$top=5");
        console.log("A_BusinessPartner Response Success! Found:", res?.d?.results?.length || 0, "records.");
        if (res?.d?.results) {
            res.d.results.forEach((row: any) => {
                console.log(` - BP ID: ${row.BusinessPartner}, Name: ${row.BusinessPartnerFullName || row.BusinessPartnerName}`);
            });
        }
    } catch (e: any) {
        console.error("A_BusinessPartner query failed:", e.message);
    }
}

test();
