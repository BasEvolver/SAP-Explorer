import { NextRequest, NextResponse } from "next/server";
import { SAPClient } from "@/lib/sap/client";

const MODULE_SERVICES = {
    'Finance': ['API_GLACCOUNTINCHARTOFACCOUNTS_SRV'],
    'Sales': ['API_SALES_ORDER_SRV', 'API_BUSINESS_PARTNER'],
    'Procurement': ['API_PURCHASEREQ_PROCESS_SRV', 'API_PRODUCT_SRV']
};

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const module = searchParams.get('module') || 'All';
        
        let servicesToFetch: string[] = [];
        if (module === 'All') {
            servicesToFetch = Object.values(MODULE_SERVICES).flat();
        } else {
            servicesToFetch = MODULE_SERVICES[module as keyof typeof MODULE_SERVICES] || [];
        }

        const client = SAPClient.getInstance();
        const nodesMap = new Map();
        const links: any[] = [];
        let groupCounter = 0;

        for (const service of servicesToFetch) {
            groupCounter++;
            try {
                const metadata = await client.getMetadata(service);
                const schema = metadata['edmx:Edmx']['edmx:DataServices']['Schema'];
                
                // Ensure schema is an array (sometimes it's a single object if only 1 schema exists)
                const schemas = Array.isArray(schema) ? schema : [schema];

                for (const s of schemas) {
                    const entityTypes = s.EntityType ? (Array.isArray(s.EntityType) ? s.EntityType : [s.EntityType]) : [];
                    const associations = s.Association ? (Array.isArray(s.Association) ? s.Association : [s.Association]) : [];

                    // Extract Nodes
                    for (const entity of entityTypes) {
                        const id = entity.$.Name;
                        if (!nodesMap.has(id)) {
                            // Simple heuristic for master vs transaction: transaction usually has 'Item' or 'Header'
                            const isMasterData = !id.includes('Item') && !id.includes('Header') && !id.includes('Result');
                            nodesMap.set(id, {
                                id,
                                name: id,
                                group: groupCounter,
                                val: isMasterData ? 20 : 5, // Larger nodes for core/master data
                                type: isMasterData ? 'Master' : 'Transaction'
                            });
                        }
                    }

                    // Extract Links (Associations)
                    for (const assoc of associations) {
                        const ends = assoc.End ? (Array.isArray(assoc.End) ? assoc.End : [assoc.End]) : [];
                        if (ends.length === 2) {
                            const source = ends[0].$.Type.split('.').pop();
                            const target = ends[1].$.Type.split('.').pop();
                            
                            // Only add link if both nodes exist (to avoid dangling links in partial module loads)
                            if (source && target) {
                                links.push({
                                    source,
                                    target,
                                    name: assoc.$.Name
                                });
                            }
                        }
                    }
                }
            } catch (err) {
                console.warn(`Failed to fetch metadata for ${service}:`, err);
                // Continue to the next service even if one fails
            }
        }

        // Filter out links where source or target isn't in our nodes list (cross-module links we didn't fetch)
        const validLinks = links.filter(l => nodesMap.has(l.source) && nodesMap.has(l.target));

        return NextResponse.json({
            nodes: Array.from(nodesMap.values()),
            links: validLinks
        });

    } catch (error: any) {
        console.error("Schema API Error:", error);
        return NextResponse.json(
            { error: error.message || "An error occurred while fetching SAP schema metadata." }, 
            { status: 500 }
        );
    }
}
