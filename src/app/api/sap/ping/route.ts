import { NextResponse } from "next/server";
import { SAPClient } from "@/lib/sap/client";

export async function GET() {
    try {
        const client = SAPClient.getInstance();
        const result = await client.ping();
        
        if (result.status === "connected") {
            return NextResponse.json({ status: "alive" });
        } else {
            return NextResponse.json({ status: "dead", error: result.message }, { status: 503 });
        }
    } catch (error: any) {
        return NextResponse.json({ status: "dead", error: error.message }, { status: 503 });
    }
}
