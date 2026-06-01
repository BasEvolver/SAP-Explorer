import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config();

import { SAPClient } from './src/lib/sap/client';

async function run() {
    const client = SAPClient.getInstance();
    const payload = {
      ProductType: "ROH",
      IndustrySector: "M",
      BaseUnit: "PC",
      to_Description: [
        {
          Language: "EN",
          ProductDescription: "Test Material by ARIA Agent"
        }
      ]
    };
    
    console.log("Sending POST payload to API_PRODUCT_SRV/A_Product...");
    try {
        const response = await client.odataPost("API_PRODUCT_SRV/A_Product", payload);
        console.log("Success! Response:", response);
    } catch(e: any) {
        console.error("Post error message:", e.message);
    }
}
run();
