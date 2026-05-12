import { NextRequest, NextResponse } from "next/server";
import { SAPClient } from "@/lib/sap/client";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const viewId = searchParams.get("viewId")?.toUpperCase();

        if (!viewId) {
            return NextResponse.json({ error: "Missing viewId parameter" }, { status: 400 });
        }

        const client = SAPClient.getInstance();
        const apiPath = "Z_TABLE_READER_SRV/TableDataSet"; // Generic table reader API

        // 1. Fetch DDLDEPENDENCY to get the associations and SQL View Name
        const depOptions = encodeURIComponent(`DDLNAME EQ '${viewId}'`);
        const depFilters = `&$filter=QueryTable eq 'DDLDEPENDENCY' and Text eq '${depOptions}' and Rowcount eq 1000 and Rowskips eq 0`;
        
        const depResponse = await client.odataQuery(apiPath, depFilters);
        const depResults = depResponse.d?.results || [];
        
        let sqlViewName = viewId;
        const navigationProperties: any[] = [];
        
        depResults.forEach((row: any) => {
            const wa = row.Wa || "";
            if (!wa) return;
            // Structure: DDLNAME (40), OBJECTTYPE (4), OBJECTNAME (30), STATE (1)
            const objType = wa.substring(40, 44).trim();
            const objName = wa.substring(44, 74).trim();
            
            if (objType === 'VIEW') {
                sqlViewName = objName; // This is the actual SQL View Name
            } else if (objType === 'STOB' || objType === 'TABL') {
                navigationProperties.push({
                    name: objName,
                    relationship: "Association",
                    toRole: objName
                });
            }
        });

        // 2. Fetch DD03L for Fields using the SQL View Name
        const fieldOptions = encodeURIComponent(`TABNAME EQ '${sqlViewName}'`);
        const fieldFilters = `&$filter=QueryTable eq 'DD03L' and Text eq '${fieldOptions}' and Rowcount eq 1000 and Rowskips eq 0`;
        
        const fieldResponse = await client.odataQuery(apiPath, fieldFilters);
        const fieldResults = fieldResponse.d?.results || [];
        
        const properties = fieldResults.map((row: any) => {
            const wa = row.Wa || "";
            if (!wa) return null;
            // Structure: TABNAME (30), FIELDNAME (30), AS4LOCAL (1), AS4VERS (4), POSITION (4), KEYFLAG (1)
            return {
                name: wa.substring(30, 60).trim(),
                type: "DataElement",
                maxLength: "-",
                description: wa.substring(30, 60).trim() // Fallback description
            };
        }).filter((f: any) => f && f.name && !f.name.startsWith('.INCLU'));

        // 3. Fetch DDHEADANNO for Annotations
        const annoOptions = encodeURIComponent(`STRUCOBJN EQ '${viewId}'`);
        const annoFilters = `&$filter=QueryTable eq 'DDHEADANNO' and Text eq '${annoOptions}' and Rowcount eq 1000 and Rowskips eq 0`;
        
        let annotations: any[] = [];
        try {
            const annoResponse = await client.odataQuery(apiPath, annoFilters);
            const annoResults = annoResponse.d?.results || [];
            annotations = annoResults.map((row: any) => {
                const wa = row.Wa || "";
                if (!wa) return null;
                // Structure: STRUCOBJN (30), NAME (60), POSITION (4), VALUE (255)
                return {
                    term: wa.substring(30, 90).trim(),
                    value: wa.substring(94).trim()
                };
            }).filter((a: any) => a && a.term);
        } catch (e) {
            console.warn("Failed to fetch annotations, moving on", e);
        }

        return NextResponse.json({
            properties,
            navigationProperties,
            annotations,
            sqlViewName
        });

    } catch (error: any) {
        console.error("SAP Universal Dictionary Fetch Error:", error);
        return NextResponse.json(
            { error: error.message || "An error occurred while fetching Dictionary data." }, 
            { status: 500 }
        );
    }
}
