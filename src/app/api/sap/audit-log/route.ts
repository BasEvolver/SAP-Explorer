import { NextRequest, NextResponse } from "next/server";
import { getUpdates, executeReversion, clearLog } from "@/lib/sap/update-logger";

export async function GET(req: NextRequest) {
  try {
    const entries = getUpdates();
    const pending = entries.filter(e => e.status === "pending");

    return NextResponse.json({
      status: "success",
      count: pending.length,
      updates: pending
    });
  } catch (error: any) {
    console.error("[SAPAuditLogAPI] GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "REVERT_ALL") {
      const logs = await executeReversion();
      return NextResponse.json({
        status: "success",
        message: "Successfully reverted registered SAP demo updates.",
        logs
      });
    }

    if (action === "CLEAR") {
      clearLog();
      return NextResponse.json({
        status: "success",
        message: "Successfully cleared SAP update logs."
      });
    }

    return NextResponse.json({ error: "Invalid action parameter" }, { status: 400 });
  } catch (error: any) {
    console.error("[SAPAuditLogAPI] POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
