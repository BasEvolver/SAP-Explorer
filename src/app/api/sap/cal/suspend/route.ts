import { NextResponse } from "next/server";
import { SAPCalClient } from "@/lib/sap/cal";
import { AzureVMClient } from "@/lib/sap/azure-vm";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const calClient = SAPCalClient.getInstance();
    
    // If SAP CAL API credentials are fully set up, use them
    if (calClient.isConfigured()) {
      const result = await calClient.suspendAppliance();
      if (result.success) {
        return NextResponse.json(result);
      } else {
        return NextResponse.json(result, { status: 400 });
      }
    }
    
    // Fall back to direct Azure VM control via local Azure CLI
    const azureClient = AzureVMClient.getInstance();
    const result = await azureClient.stopVMs();
    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to trigger suspension" },
      { status: 500 }
    );
  }
}
