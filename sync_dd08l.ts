import * as dotenv from 'dotenv';
dotenv.config();
import { SAPExtractor } from './src/lib/sap/extractor';

async function run() {
    console.log("Triggering SAP DD08L Data Extraction...");
    
    // Use our new custom SEGW API wrapper for RFC_READ_TABLE
    const apiPath = process.env.SAP_DD08L_API_PATH || "Z_TABLE_READER_SRV/TableDataSet";
    
    const syncLog = await SAPExtractor.replicateDD08L(apiPath);
    
    console.log(`Extraction started in background!`);
    console.log(`Sync Log ID: ${syncLog.id}`);
    console.log(`Status: ${syncLog.status}`);
    console.log(`You can monitor the sync logs in your Postgres database or add a UI view for it.`);
}

run();
