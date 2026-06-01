import { NextResponse } from "next/server";
import { SAPCalClient } from "@/lib/sap/cal";
import { AzureVMClient } from "@/lib/sap/azure-vm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const calClient = SAPCalClient.getInstance();
    
    // If SAP CAL API credentials are fully set up, use them
    if (calClient.isConfigured()) {
      const details = await calClient.getApplianceStatus();
      return NextResponse.json(details);
    }
    
    // Fall back to direct Azure VM control via local Azure CLI
    const azureClient = AzureVMClient.getInstance();
    const details = await azureClient.getStatus();
    return NextResponse.json(details);
  } catch (error: any) {
    return NextResponse.json(
      { status: "ERROR", error: error.message || "Unknown error occurred" },
      { status: 500 }
    );
  }
}
