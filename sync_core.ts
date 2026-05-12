import * as dotenv from 'dotenv';
dotenv.config();
import { SAPExtractor } from './src/lib/sap/extractor';

async function run() {
    console.log("Triggering Core Metadata Extraction...");
    
    const apiPath = process.env.SAP_API_PATH || "Z_TABLE_READER_SRV/TableDataSet";
    
    const syncLog = await SAPExtractor.replicateCoreMetadata(apiPath);
    console.log(`Core Metadata Extraction started in background! Sync Log ID: ${syncLog.id}`);
}

run();
