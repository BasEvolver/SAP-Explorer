import { GraphData, GraphNode, GraphEdge, EdgeType } from './types';
import { generateEnterprise3DGraph, Node3D, Link3D } from '../manifold/cognitive3DData';

export function generateCustomGraphData(): GraphData {
  const cognitiveData = generateEnterprise3DGraph();

  // Filter to the System Landscape, Master Data, and Organizational objects
  const systemNodes = cognitiveData.nodes.filter((n: Node3D) => 
    ['System', 'MasterData', 'SalesOrg', 'Plant', 'PurchOrg', 'CompanyCode'].includes(n.type)
  );
  
  // Create a Set of valid node IDs
  const systemIds = new Set(systemNodes.map(n => n.id));

  // Map to GraphNode format
  const nodes: GraphNode[] = systemNodes.map((n: Node3D) => {
    // Determine risk based on domain
    let risk = 0.05;
    if (n.group === 'Finance & ERP Kernel') risk = 0.15;
    if (n.group === 'Procurement & Sourcing Hub') risk = 0.10;
    
    // Set a scenario epicenter
    if (n.id.includes('SAP S/4HANA')) {
      risk = 0.85;
    }

    let type = 'business_application'; // default fallback for operational apps

    const dataAnalytics = ['Snowflake Data Cloud', 'Databricks Lakehouse', 'SAP BW/4HANA', 'Tableau Analytics', 'ThoughtSpot Search'];
    const infrastructure = ['Microsoft Azure AD', 'Okta Identity', 'CyberArk PAM', 'ServiceNow ITSM', 'Palo Alto Prisma', 'MuleSoft Integration', 'Kafka Event Streaming', 'SAP BTP', 'Dun & Bradstreet'];

    if ((n as any).type === 'MasterData') {
      type = 'master_data';
    } else if (['SalesOrg', 'Plant', 'PurchOrg', 'CompanyCode'].includes((n as any).type)) {
      type = 'organizational';
    } else if (dataAnalytics.some(s => n.id.includes(s))) {
      type = 'analytics_system';
    } else if (infrastructure.some(s => n.id.includes(s))) {
      type = 'infrastructure';
    }

    return {
      id: n.id,
      name: n.label,
      type: type,
      group: n.group,
      baseRisk: risk,
      currentRisk: risk,
      criticality: risk > 0.5 ? 'critical' : risk > 0.1 ? 'medium' : 'low',
      val: n.val ? Math.max(3, n.val / 6) : 5, // scale down val so spheres aren't massive
      baseColor: n.color
    };
  });

  // Extract only links that flow between these systems
  const links: GraphEdge[] = cognitiveData.links
    .filter((l: Link3D) => systemIds.has(l.source) && systemIds.has(l.target))
    .map((l: Link3D) => {
       return {
         source: l.source,
         target: l.target,
         type: l.type as EdgeType,
         attenuation: 0.8 // strong transmission between systems
       };
    });

  return { nodes, links };
}
