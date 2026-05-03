import { NextRequest, NextResponse } from "next/server";
import { SAPClient } from "@/lib/sap/client";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { apiPath, filter } = body;

        if (!apiPath) {
            return NextResponse.json({ error: "Missing apiPath parameter" }, { status: 400 });
        }

        const client = SAPClient.getInstance();
        const data = await client.odataQuery(apiPath, filter);

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("API Proxy Error:", error);
        return NextResponse.json(
            { error: error.message || "An error occurred while fetching data from SAP." }, 
            { status: 500 }
        );
    }
}
