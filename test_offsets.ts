import * as dotenv from 'dotenv';
dotenv.config();
import { SAPClient } from './src/lib/sap/client';

async function testLayout() {
    const client = SAPClient.getInstance();
    const tables = ['DD02L', 'DD03L', 'TFDIR', 'TFTIT', 'LDBN'];
    
    for (const tbl of tables) {
        console.log(`\n--- Fetching layout for ${tbl} ---`);
        try {
            // we use skip=0, top=1
            const filters = `&$filter=QueryTable eq '${tbl}' and Rowcount eq 1 and Rowskips eq 0`;
            const response = await client.odataQuery("Z_TABLE_READER_SRV/TableDataSet", filters);
            const results = response.d?.results || [];
            if (results.length > 0) {
                console.log(`Wa: [${results[0].Wa}]`);
                console.log(`Length: ${results[0].Wa.length}`);
            } else {
                console.log('No data found.');
            }
        } catch (e: any) {
            console.error(e.message);
        }
    }
}

testLayout();
