import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

import { SAPClient } from './src/lib/sap/client';

async function run() {
    const client = SAPClient.getInstance();
    const lineItemPath = "API_GLACCOUNTLINEITEM/GLAccountLineItem";
    const apQuery = `&$filter=CompanyCode eq '1710' and FinancialAccountType eq 'K' and ClearingDate eq null&$top=5`;
    try {
        const response = await client.odataQuery(lineItemPath, apQuery);
        const results = response.d?.results || [];
        console.log(`Successfully fetched ${results.length} AP items matching CompanyCode eq '1710'`);
        if (results.length > 0) {
            results.forEach((row: any, idx: number) => {
                console.log(`Row ${idx}:`, {
                    AccountingDocument: row.AccountingDocument,
                    DocumentReferenceID: row.DocumentReferenceID,
                    ReferenceDocument: row.ReferenceDocument,
                    ReferenceDocumentID: row.ReferenceDocumentID,
                    DocumentReference: row.DocumentReference,
                    GLAccount: row.GLAccount,
                    Supplier: row.Supplier,
                    AmountInTransactionCurrency: row.AmountInTransactionCurrency
                });
            });
        }
    } catch(e: any) {
        console.error("Query failed:", e.message);
    }
}

run();
