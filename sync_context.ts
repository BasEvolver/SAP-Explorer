import * as dotenv from 'dotenv';
dotenv.config();
import { SAPExtractor } from './src/lib/sap/extractor';

async function run() {
    console.log("Triggering SAP Context Extraction...");
    
    const apiPath = process.env.SAP_API_PATH || "Z_TABLE_READER_SRV/TableDataSet";
    
    const syncLogDD02T = await SAPExtractor.replicateDD02T(apiPath);
    console.log(`DD02T Extraction started in background! Sync Log ID: ${syncLogDD02T.id}`);

    const syncLogLDB = await SAPExtractor.replicateLogicalDatabases(apiPath);
    console.log(`Logical Database Extraction started in background! Sync Log ID: ${syncLogLDB.id}`);
}

run();
