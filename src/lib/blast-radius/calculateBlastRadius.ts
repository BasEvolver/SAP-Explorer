import { GraphData, PropagationStep, GraphEdge, GraphNode } from './types';

export function calculateBlastRadius(
  graph: GraphData,
  epicenterNodeId: string,
  injectedRisk: number,
  riskThreshold: number = 0.15
): PropagationStep[] {
  const steps: PropagationStep[] = [];
  
  // Create a map for quick node lookup
  const nodeMap = new Map<string, GraphNode>();
  graph.nodes.forEach(n => nodeMap.set(n.id, n));

  // Adjacency list for outgoing edges
  const adjList = new Map<string, GraphEdge[]>();
  graph.links.forEach(link => {
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    if (!adjList.has(sourceId)) {
      adjList.set(sourceId, []);
    }
    adjList.get(sourceId)!.push(link);
  });

  // Track the highest risk reached for each node to prevent infinite loops and only process when risk increases
  const currentRiskMap = new Map<string, number>();
  graph.nodes.forEach(n => currentRiskMap.set(n.id, n.currentRisk));

  // BFS Queue: [currentNodeId, currentRisk, path, sourceNodeId]
  const queue: [string, number, string[], string | null][] = [];
  
  // Initial injection
  queue.push([epicenterNodeId, injectedRisk, [epicenterNodeId], null]);
  
  let stepIndex = 0;

  while (queue.length > 0) {
    // Process level by level to simulate time steps
    const levelSize = queue.length;
    
    for (let i = 0; i < levelSize; i++) {
      const [nodeId, incomingRisk, path, sourceId] = queue.shift()!;
      
      const node = nodeMap.get(nodeId);
      if (!node) continue;

      const previousRisk = currentRiskMap.get(nodeId)!;
      
      // If the incoming risk is higher than what the node currently has, we update it and propagate
      if (incomingRisk > previousRisk && incomingRisk >= riskThreshold) {
        currentRiskMap.set(nodeId, incomingRisk);
        
        steps.push({
          stepIndex,
          nodeId,
          previousRisk,
          newRisk: incomingRisk,
          sourceNodeId: sourceId,
          path
        });

        // Propagate to neighbors
        const edges = adjList.get(nodeId) || [];
        for (const edge of edges) {
          const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;
          const propagatedRisk = incomingRisk * edge.attenuation;
          
          if (propagatedRisk >= riskThreshold) {
             queue.push([targetId, propagatedRisk, [...path, targetId], nodeId]);
          }
        }
      }
    }
    stepIndex++;
  }

  // Sort steps primarily by stepIndex
  return steps.sort((a, b) => a.stepIndex - b.stepIndex);
}
