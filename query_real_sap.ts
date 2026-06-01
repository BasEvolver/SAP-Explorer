import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config();

import { SAPClient } from './src/lib/sap/client';

async function run() {
    const client = SAPClient.getInstance();
    
    console.log("=== QUERYING TOP 30 REAL BILLING DOCUMENTS (CB_BILLING_DOCUMENT_SRV) ===");
    try {
        const response = await client.odataQuery(
            "CB_BILLING_DOCUMENT_SRV/BillingDocuments",
            "&$top=30"
        );
        const results = response.d?.results || [];
        console.log(`Found ${results.length} real Billing Documents:`);
        results.forEach((doc: any, i: number) => {
            console.log(`- [${i+1}] Doc #: ${doc.BillingDocument}, NetValue: $${doc.NetValue || 'N/A'}, SoldTo: ${doc.SOLD_TO_KUNNR || 'N/A'}, SoldToName: ${doc.SOLD_TO_NAME1 || 'N/A'}`);
        });
    } catch (e: any) {
        console.error("Billing document query error:", e.message);
    }

    console.log("\n=== QUERYING TOP 30 REAL PURCHASE ORDERS (C_PURCHASEORDER_FS_SRV) ===");
    try {
        const response = await client.odataQuery(
            "C_PURCHASEORDER_FS_SRV/I_PurchaseOrder",
            "&$top=30"
        );
        const results = response.d?.results || [];
        console.log(`Found ${results.length} real Purchase Orders:`);
        results.forEach((po: any, i: number) => {
            console.log(`- [${i+1}] PO #: ${po.PurchaseOrder}, Supplier: ${po.Supplier || 'N/A'}, Date: ${po.CreationDate || 'N/A'}`);
        });
    } catch (e: any) {
        console.error("Purchase Order query error:", e.message);
    }
}
run();
