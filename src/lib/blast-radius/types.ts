export type NodeType = string;

export interface GraphNode {
  id: string;
  name: string;
  type: NodeType;
  baseRisk: number; // 0.0 to 1.0
  currentRisk: number; // 0.0 to 1.0
  criticality: 'low' | 'medium' | 'high' | 'critical';
  // 3D placement and styling
  x?: number;
  y?: number;
  z?: number;
  color?: string;
  baseColor?: string;
  group?: string; // e.g. "Identity & Cyber Hub", "ERP Digital Core"
  val?: number; // Size/volume in 3d-force-graph
}

export type EdgeType = string;

export interface GraphEdge {
  source: string | GraphNode;
  target: string | GraphNode;
  type: EdgeType;
  attenuation: number; // 0.1 to 1.0 (multiplier for risk decay)
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphEdge[];
}

export interface PropagationStep {
  stepIndex: number;
  nodeId: string;
  previousRisk: number;
  newRisk: number;
  sourceNodeId: string | null; // null if it's the epicenter
  path: string[]; // sequence of node IDs from epicenter
}
