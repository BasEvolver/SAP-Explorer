import { NextRequest, NextResponse } from "next/server";
import { SAPClient } from "@/lib/sap/client";

// Mapping of requested CDS views to standard SAP S/4HANA OData services
// Note: In a production environment, this might be handled by a generic OData service 
// or custom CDS OData exposures (e.g., @OData.publish: true).
const cdsODataMap: Record<string, string> = {
    // Finance & Controlling
    "I_GLAccountInChartOfAccounts": "API_GLACCOUNTINCHARTOFACCOUNTS_SRV/A_GLAccountInChartOfAccounts",
    "I_CostCenter": "API_COSTCENTER_SRV/A_CostCenter",
    "I_ProfitCenter": "API_PROFITCENTER_SRV/A_ProfitCenter",
    "I_JournalEntryItem": "API_JOURNALENTRYITEMBASIC_SRV/A_JournalEntryItemBasic",
    "Z_SalesUseTaxLookback": "Z_SALESUSETAXLOOKBACK_CDS/Z_SalesUseTaxLookback",
    
    // Sales and Distribution
    "I_SalesOrder": "API_SALES_ORDER_SRV/A_SalesOrder",
    "I_BillingDocument": "API_BILLING_DOCUMENT_SRV/A_BillingDocument",
    "I_Customer": "API_BUSINESS_PARTNER/A_BusinessPartner",
    
    // Materials Management
    "I_Product": "API_PRODUCT_SRV/A_Product",
    "I_PurchaseOrderAPI01": "API_PURCHASEORDER_PROCESS_SRV/A_PurchaseOrder",
    "I_Supplier": "API_BUSINESS_PARTNER/A_BusinessPartner",
    
    // Production Planning
    "I_ManufacturingOrder": "API_PRODUCTION_ORDER_2_SRV/A_ProductionOrder",
    "I_EnterpriseProject": "API_ENTERPRISE_PROJECT_SRV/A_EnterpriseProject",
    
    // Human Resources
    "I_WorkforcePerson": "HCMFAB_EMPLOYEELOOKUP_SRV/EmployeeDetailSet"
};

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const viewId = searchParams.get("viewId");
        const top = searchParams.get("top") || "50";
        const expand = searchParams.get("expand") || "";

        if (!viewId) {
            return NextResponse.json({ error: "Missing viewId parameter" }, { status: 400 });
        }

        const apiPath = cdsODataMap[viewId];
        if (!apiPath) {
            return NextResponse.json({ 
                error: `Live fetch for CDS View ${viewId} is currently not mapped to a standard OData service. Fallback to sample data if needed.`,
                unmapped: true 
            }, { status: 404 });
        }

        const client = SAPClient.getInstance();
        
        let queryParams = `&$top=${top}`;
        if (expand) {
            queryParams += `&$expand=${expand}`;
        }

        const data = await client.odataQuery(apiPath, queryParams);

        // The data is usually in data.d.results
        const results = data.d?.results || [];

        return NextResponse.json({ results });
    } catch (error: any) {
        console.error("SAP CDS Fetch Error:", error);
        return NextResponse.json(
            { error: error.message || "An error occurred while fetching data from SAP." }, 
            { status: 500 }
        );
    }
}
