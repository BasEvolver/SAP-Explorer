import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

import { SAPClient } from './src/lib/sap/client';

async function querySAPOData(apiPath: string, entitySet: string, filters: string = "") {
    const client = SAPClient.getInstance();
    try {
        const response = await client.odataQuery(`${apiPath}/${entitySet}`, filters);
        return response.d?.results || [];
    } catch (e: any) {
        console.error(`Error querying OData ${apiPath}/${entitySet}:`, e.message);
        return [];
    }
}

async function run() {
    console.log("Querying Company Codes via standard API_COMPANYCODE_SRV/A_CompanyCode...");
    const coCodes = await querySAPOData('API_COMPANYCODE_SRV', 'A_CompanyCode', '&$top=50');
    console.log(`Found ${coCodes.length} Company Codes:`);
    coCodes.forEach((row: any) => {
        console.log(` - ${row.CompanyCode}: ${row.CompanyCodeName} (Currency: ${row.Currency}, Country: ${row.Country})`);
    });

    console.log("\nQuerying Plants via standard API_PLANT_SRV/A_Plant...");
    const plants = await querySAPOData('API_PLANT_SRV', 'A_Plant', '&$top=50');
    console.log(`Found ${plants.length} Plants:`);
    plants.forEach((row: any) => {
        console.log(` - ${row.Plant}: ${row.PlantName} (CoCode: ${row.CompanyCode || 'N/A'}, Country: ${row.Country || 'N/A'})`);
    });
}

run();
