import { NextRequest, NextResponse } from "next/server";
import { SAPClient } from "@/lib/sap/client";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const tabname = searchParams.get('table')?.toUpperCase();

        if (!tabname) {
            return NextResponse.json({ error: "Table parameter is required" }, { status: 400 });
        }

        const client = SAPClient.getInstance();
        
        // We assume the user has exposed Z_GET_TABLE_ROW_COUNT via SEGW as a Function Import named 'GetTableRowCount'
        const apiPath = `Z_TABLE_READER_SRV/GetTableRowCount`;

        try {
            const response = await client.odataQuery(apiPath, `&Tabname='${tabname}'`);
            
            // The exact JSON structure depends on how SEGW maps the export parameter.
            // For Complex Types mapped to Function Imports, the response is usually wrapped in the function name.
            const dataObj = response.d?.GetTableRowCount || response.d;
            const count = dataObj?.Count || dataObj?.EvCount || 0;

            return NextResponse.json({ table: tabname, count: parseInt(count, 10) });
        } catch (sapError: any) {
            console.error(`SAP Error fetching count for ${tabname}:`, sapError.message);
            // If the OData endpoint isn't set up yet, return 0 gracefully
            return NextResponse.json({ table: tabname, count: "Pending ABAP Setup" });
        }

    } catch (error: any) {
        console.error("Table Count API Error:", error);
        return NextResponse.json(
            { error: error.message || "An error occurred." }, 
            { status: 500 }
        );
    }
}
