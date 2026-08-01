import { generateEnterprise3DGraph, Node3D, Link3D } from '../manifold/cognitive3DData';
import { GraphData, GraphNode, GraphEdge, EdgeType } from './types';

function assignCriticality(risk: number): GraphNode['criticality'] {
  if (risk < 0.25) return 'low';
  if (risk < 0.5) return 'medium';
  if (risk < 0.75) return 'high';
  return 'critical';
}

export function generateCognitiveGraphData(): GraphData {
  const cognitiveData = generateEnterprise3DGraph();
  
  // Clean up data to reduce hairball noise
  // We exclude dense IT infrastructure hubs that connect to everything (SSO, ESB, Data Lakes)
  // so the graph focuses purely on the business/supply chain blast radius.
  const EXCLUDED_GROUPS = [
    'Identity & Cyber Hub',
    'Integration & ESB Hub',
    'Data Lakehouse & AI',
    'Network & Telecom Routing'
  ];

  const filteredNodes = cognitiveData.nodes.filter((n: Node3D) => !EXCLUDED_GROUPS.includes(n.group || ''));

  const nodes: GraphNode[] = filteredNodes.map((n: Node3D) => {
    let risk = 0.05;
    if (n.type === 'Vendor') risk = 0.3;
    if (n.type === 'System') risk = 0.15;
    if (n.type === 'Material') risk = 0.1;
    
    // TPRM Scenario: SwissOptics has a high base risk
    if (n.label.includes('SwissOptics')) {
      risk = 0.95; 
    }
    
    return {
      id: n.id,
      name: n.label,
      type: n.type.toLowerCase(),
      baseRisk: risk,
      currentRisk: risk,
      criticality: assignCriticality(risk),
      val: n.val,
      baseColor: n.color,
      group: n.group
      // Explicitly dropping x,y,z so d3-force can calculate optimal layout 
      // without calculating massive physics differentials from hardcoded coordinates.
    };
  });
  
  const validNodeIds = new Set(nodes.map(n => n.id));

  const links: GraphEdge[] = cognitiveData.links
    .filter((l: Link3D) => validNodeIds.has(l.source) && validNodeIds.has(l.target))
    .map((l: Link3D) => {
    let attenuation = 0.65;
    
    // Higher coupling = higher risk transfer
    if (l.type === 'Hosts' || l.type === 'Contains' || l.type === 'Powers') {
       attenuation = 0.9;
    }
    if (l.type === 'Supplies' || l.type === 'Procures' || l.type === 'Dependent') {
       attenuation = 0.85;
    }
    if (l.type === 'Employs' || l.type === 'Located') {
       attenuation = 0.4;
    }
    
    // Add small random noise to attenuation
    attenuation = Math.min(0.99, attenuation + (Math.random() * 0.15 - 0.075));
    
    return {
      source: l.source,
      target: l.target,
      type: l.type as EdgeType,
      attenuation
    };
  });
  
  return { nodes, links };
}
