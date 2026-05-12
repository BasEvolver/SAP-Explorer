import { NextRequest, NextResponse } from "next/server";
import { SAPClient } from "@/lib/sap/client";

const cdsODataMap: Record<string, string> = {
    // Finance & Controlling
    "I_GLAccountInChartOfAccounts": "API_GLACCOUNTINCHARTOFACCOUNTS_SRV/A_GLAccountInChartOfAccounts",
    "I_CostCenter": "API_COSTCENTER_SRV/A_CostCenter",
    "I_ProfitCenter": "API_PROFITCENTER_SRV/A_ProfitCenter",
    "I_JournalEntryItem": "API_JOURNALENTRYITEMBASIC_SRV/A_JournalEntryItemBasic",
    "Z_SalesUseTaxLookback": "Z_SALESUSETAXLOOKBACK_CDS/Z_SalesUseTaxLookback",
    "Z_VatRegister": "Z_VATREGISTER_CDS/Z_VatRegister",
    "Z_WithholdingTax": "Z_WITHHOLDINGTAX_CDS/Z_WithholdingTax",
    
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

        if (!viewId) {
            return NextResponse.json({ error: "Missing viewId parameter" }, { status: 400 });
        }

        const apiPath = cdsODataMap[viewId];
        if (!apiPath) {
            return NextResponse.json({ 
                error: `Metadata fetch for CDS View ${viewId} is currently not mapped to a standard OData service.`,
                unmapped: true 
            }, { status: 404 });
        }

        const client = SAPClient.getInstance();
        const metadataXml = await client.getMetadata(apiPath);
        
        let schema = metadataXml?.['edmx:Edmx']?.['edmx:DataServices']?.['Schema'];
        if (Array.isArray(schema)) {
            schema = schema[0]; // Sometimes it's an array of schemas
        }

        if (!schema) {
            throw new Error("Invalid OData Metadata format.");
        }

        // 1. Extract Definitions (Properties)
        let entityType = schema.EntityType;
        if (Array.isArray(entityType)) {
            const expectedName = apiPath.split('/')[1] + 'Type';
            entityType = entityType.find((e: any) => e.$.Name === expectedName) || entityType[0];
        }

        const properties = [];
        if (entityType && entityType.Property) {
            const props = Array.isArray(entityType.Property) ? entityType.Property : [entityType.Property];
            for (const prop of props) {
                const attrs = prop.$;
                let label = attrs.Name;
                
                // Try to get sap:label from attributes
                if (attrs['sap:label']) {
                    label = attrs['sap:label'];
                } else if (prop.Annotation) {
                    const annots = Array.isArray(prop.Annotation) ? prop.Annotation : [prop.Annotation];
                    const labelAnnot = annots.find((a: any) => a.$.Term === "sap.label");
                    if (labelAnnot) label = labelAnnot.$.String || label;
                }

                properties.push({
                    name: attrs.Name,
                    type: attrs.Type.replace('Edm.', ''),
                    maxLength: attrs.MaxLength || null,
                    description: label
                });
            }
        }

        // 2. Extract Cross References (NavigationProperties)
        const navigationProperties = [];
        if (entityType && entityType.NavigationProperty) {
            const navProps = Array.isArray(entityType.NavigationProperty) ? entityType.NavigationProperty : [entityType.NavigationProperty];
            for (const navProp of navProps) {
                navigationProperties.push({
                    name: navProp.$.Name,
                    relationship: navProp.$.Relationship,
                    toRole: navProp.$.ToRole
                });
            }
        }

        // 3. Extract Annotations (Entity level)
        const annotations = [];
        if (entityType && entityType.Annotation) {
            const annots = Array.isArray(entityType.Annotation) ? entityType.Annotation : [entityType.Annotation];
            for (const annot of annots) {
                annotations.push({
                    term: annot.$.Term,
                    value: annot.$.String || annot.$.Bool || annot.$.EnumMember || "Complex"
                });
            }
        }
        
        if (entityType && entityType.$) {
             for (const key of Object.keys(entityType.$)) {
                 if (key.startsWith('sap:')) {
                     annotations.push({
                         term: key,
                         value: entityType.$[key]
                     });
                 }
             }
        }

        return NextResponse.json({
            properties,
            navigationProperties,
            annotations
        });

    } catch (error: any) {
        console.error("SAP Metadata Fetch Error:", error);
        return NextResponse.json(
            { error: error.message || "An error occurred while fetching metadata from SAP." }, 
            { status: 500 }
        );
    }
}
