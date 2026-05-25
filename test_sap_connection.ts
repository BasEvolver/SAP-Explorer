import { SAPClient } from './src/lib/sap/client';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
    const client = SAPClient.getInstance();
    try {
        console.log("Pinging SAP System via SAPClient...");
        const result = await client.ping();
        console.log("Ping Result:", result);
    } catch(e) {
        console.error("Ping error:", e);
    }
}
run();
