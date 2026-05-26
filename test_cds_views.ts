import { SAPClient } from './src/lib/sap/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testCDS(cdsViewName: string, entitySet: string) {
  const client = SAPClient.getInstance();
  const apiPath = `${cdsViewName}_CDS/${entitySet}`;
  const filters = "&$top=5";
  
  try {
    console.log(`\nTesting S/4HANA Financial CDS View: ${apiPath}...`);
    const response = await client.odataQuery(apiPath, filters);
    const results = response.d?.results || response.d || [];
    console.log(`✅ Success! Fetched ${Array.isArray(results) ? results.length : 'some'} live records from ${cdsViewName}.`);
    if (Array.isArray(results) && results.length > 0) {
      console.log("Sample Record Fields:", Object.keys(results[0]).slice(0, 15));
      console.log("Sample Record Values:", JSON.stringify(results[0], null, 2).substring(0, 500));
    }
  } catch (error: any) {
    console.error(`❌ Failed to read ${cdsViewName}: ${error.message}`);
  }
}

async function run() {
  // Test G/L Journal entry core items (ACDOCA)
  await testCDS("I_JOURNALENTRYITEMBASIC", "I_JournalEntryItemBasic");

  // Test Accounts Payable Open Items (BSIK)
  await testCDS("C_APOPERATIONALOPENITEMS", "C_ApOperationalOpenItems");
  
  // Test Accounts Receivable Open Items (BSID)
  await testCDS("C_AROPERATIONALOPENITEMS", "C_ArOperationalOpenItems");

  // Test Payment Terms (T052)
  await testCDS("I_PAYMENTTERMS", "I_PaymentTerms");
}

run();
