import { SAPClient } from './src/lib/sap/client';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
    const client = SAPClient.getInstance();
    try {
        console.log("Pinging SAP System...");
        const url = `${process.env.SAP_BASE_URL}/API_GLACCOUNTINCHARTOFACCOUNTS_SRV/A_GLAccountInChartOfAccounts?$top=1`;
        const auth = 'Basic ' + Buffer.from(`${process.env.SAP_USER}:${process.env.SAP_PASSWORD}`).toString('base64');
        const res = await fetch(url, { headers: { Authorization: auth }});
        console.log("Status:", res.status);
        if (!res.ok) console.log(await res.text());
    } catch(e) {
        console.error("Fetch error:", e);
    }
}
run();
