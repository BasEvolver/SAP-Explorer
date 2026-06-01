"use client";

import { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  Position,
  Handle,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Loader2, AlertCircle } from 'lucide-react';
import { useTheme } from 'next-themes';
import { sapOrgData } from '@/lib/sap-org-structure';

// Custom Node for Database Tables
function TableNode({ data }: { data: any }) {
  const isDark = data.isDark;
  const isSelected = data.isSelected;
  return (
    <div className={`rounded-lg border shadow-xl overflow-hidden min-w-[200px] transition-all duration-300 ${
      isSelected 
        ? 'ring-2 ring-evolver-viridian border-evolver-viridian scale-105 bg-slate-950 shadow-evolver-viridian/20' 
        : (isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200')
    }`}>
      <Handle type="target" position={Position.Top} className="w-2 h-2 opacity-0" />
      <div className={`px-4 py-2 font-bold text-sm transition-colors duration-300 ${
        isSelected 
          ? 'bg-evolver-viridian text-white' 
          : (data.isRoot ? 'bg-evolver-viridian text-white' : (isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-800'))
      }`}>
        {data.id}
      </div>
      <div className={`px-4 py-3 text-xs ${isDark || isSelected ? 'text-slate-300' : 'text-slate-600'}`}>
        {data.description || "No Description Available"}
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 opacity-0" />
    </div>
  );
}

const nodeTypes = {
  table: TableNode,
};

export default function ReactFlowGraph({ 
  rootNode, 
  overrideData, 
  onNodeClick,
  selectedNodeId 
}: { 
  rootNode: string;
  overrideData?: { nodes: any[]; links: any[] };
  onNodeClick?: (node: any) => void;
  selectedNodeId?: string;
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const fetchGraph = async () => {
    setLoading(true);
    setError(null);
    try {
      let json = overrideData;
      if (!json) {
          const res = await fetch(`/api/sap/schema?root=${rootNode}`);
          if (!res.ok) throw new Error('Failed to fetch ER Diagram data');
          json = await res.json();
      }

      // Layout algorithm
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      // Group nodes by type for better layout
      const modules = json!.nodes.filter((n: any) => n.type === 'Module');
      
      const isOrgStructure = rootNode === 'Client 100' || json!.nodes.some(n => n.type === 'CompanyCode');
      const isObjectFlow = json!.nodes.some((n: any) => n.flowSeq !== undefined);
      
      const newNodes = json!.nodes.map((n: any, idx: number) => {
        let x = centerX;
        let y = centerY;

        if (isObjectFlow) {
          const flowSeq = n.flowSeq ?? 0;
          const yOffset = n.yOffset ?? 0;
          const maxSeq = Math.max(...json!.nodes.map((node: any) => node.flowSeq ?? 0));
          x = centerX + (flowSeq - maxSeq / 2) * 230;
          y = centerY + yOffset;
        } else if (isOrgStructure) {
          // Tiered Hierarchical Layout
          if (n.type === 'Client') {
            x = centerX;
            y = 50;
          } else if (n.type === 'CompanyCode') {
            const cocodes = json!.nodes.filter((node: any) => node.type === 'CompanyCode');
            const cocodeIdx = cocodes.findIndex((node: any) => node.id === n.id);
            const totalCoCodes = cocodes.length;
            x = centerX + (cocodeIdx - (totalCoCodes - 1) / 2) * 250;
            y = 160;
          } else if (n.type === 'PurchOrg') {
            const orgs = json!.nodes.filter((node: any) => node.type === 'PurchOrg');
            const orgIdx = orgs.findIndex((node: any) => node.id === n.id);
            x = centerX + (orgIdx - (orgs.length - 1) / 2) * 250;
            y = 270;
          } else if (n.type === 'SalesOrg') {
            const orgs = json!.nodes.filter((node: any) => node.type === 'SalesOrg');
            const orgIdx = orgs.findIndex((node: any) => node.id === n.id);
            x = centerX + (orgIdx - (orgs.length - 1) / 2) * 250;
            y = 380;
          } else if (n.type === 'Plant') {
            const plants = json!.nodes.filter((node: any) => node.type === 'Plant');
            const plantIdx = plants.findIndex((node: any) => node.id === n.id);
            x = centerX + (plantIdx - (plants.length - 1) / 2) * 250;
            y = 490;
          } else if (n.type === 'StorageLoc' || n.type === 'ShippingPoint' || n.type === 'PurchGroup' || n.type === 'SalesArea' || n.type === 'WorkCenter' || n.type === 'MaintPlanning') {
            const subConfigs = json!.nodes.filter((node: any) => 
              ['StorageLoc', 'ShippingPoint', 'PurchGroup', 'SalesArea', 'WorkCenter', 'MaintPlanning'].includes(node.type)
            );
            const subIdx = subConfigs.findIndex((node: any) => node.id === n.id);
            
            // Arrange in a grid of columns to keep it compact and beautifully spaced
            const cols = 5;
            const row = Math.floor(subIdx / cols);
            const col = subIdx % cols;
            
            const rowCount = Math.ceil(subConfigs.length / cols);
            const colCountInRow = row === rowCount - 1 ? (subConfigs.length % cols || cols) : cols;
            
            x = centerX + (col - (colCountInRow - 1) / 2) * 240;
            y = 600 + row * 110;
          } else if (n.type === 'MasterData') {
            const masterNodes = json!.nodes.filter((node: any) => node.type === 'MasterData');
            const masterIdx = masterNodes.findIndex((node: any) => node.id === n.id);
            x = centerX + (masterIdx - (masterNodes.length - 1) / 2) * 250;
            y = 820;
          } else if (n.type === 'TransactionData') {
            const txNodes = json!.nodes.filter((node: any) => node.type === 'TransactionData');
            const txIdx = txNodes.findIndex((node: any) => node.id === n.id);
            x = centerX + (txIdx - (txNodes.length - 1) / 2) * 250;
            y = 940;
          }
        } else {
          // Original Circular/Clustered Layout
          let radius = 400;
          let angle = (idx / (json!.nodes.length - 1 || 1)) * 2 * Math.PI;
          
          if (n.type === 'Core' || n.id === rootNode) {
              radius = 0;
          } else if (n.type === 'Module') {
              radius = 250;
              angle = (modules.findIndex((m: any) => m.id === n.id) / (modules.length || 1)) * 2 * Math.PI;
          } else if (n.parentModule) {
              const modIdx = modules.findIndex((m: any) => m.id === n.parentModule);
              const baseAngle = (modIdx / (modules.length || 1)) * 2 * Math.PI;
              angle = baseAngle + (Math.random() - 0.5) * 0.5;
              radius = 450 + Math.random() * 50;
          }
          x = centerX + radius * Math.cos(angle);
          y = centerY + radius * Math.sin(angle);
        }

        const isCore = n.type === 'Core' || n.type === 'Client' || n.id === rootNode;
        const isSelected = n.id === selectedNodeId;
        
        return {
          id: n.id,
          type: 'table',
          position: { 
            x: x - 100, 
            y: y - 50
          },
          data: { 
            id: n.id, 
            description: n.description,
            isRoot: isCore,
            isDark,
            isSelected
          },
        };
      });

      const newEdges = json!.links.map((l: any, idx: number) => ({
        id: `e${l.source}-${l.target}-${idx}`,
        source: l.source,
        target: l.target,
        label: l.name,
        animated: true,
        style: { stroke: l.color || (isDark ? '#40826D' : '#1D4E89'), strokeWidth: l.type === 'CoreLink' ? 3 : 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: l.color || (isDark ? '#40826D' : '#1D4E89'),
        },
      }));

      setNodes(newNodes);
      setEdges(newEdges);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (rootNode || overrideData) fetchGraph();
  }, [rootNode, isDark, overrideData, selectedNodeId]);

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const handleReactFlowNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (onNodeClick) {
      let originalNode = overrideData?.nodes.find((n: any) => n.id === node.id);
      if (!originalNode) {
        originalNode = sapOrgData.nodes.find((n: any) => n.id === node.id);
      }
      if (originalNode) {
        onNodeClick(originalNode);
      }
    }
  }, [onNodeClick, overrideData]);

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <Loader2 className={`w-12 h-12 animate-spin ${isDark ? 'text-evolver-viridian' : 'text-blue-600'}`} />
        <p className={`mt-4 font-mono animate-pulse ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Generating ER Diagram for {rootNode}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8">
        <div className="glass-panel p-6 rounded-2xl flex items-start gap-4 max-w-xl border-red-500/30">
            <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-1" />
            <div>
                <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>Diagram Generation Failed</h3>
                <p className={`mt-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{error}</p>
            </div>
        </div>
      </div>
    );
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      onNodeClick={handleReactFlowNodeClick}
      fitView
      className="w-full h-full"
      minZoom={0.1}
    >
      <Background color={isDark ? '#333' : '#ccc'} gap={16} />
      <Controls className={isDark ? 'bg-slate-800 fill-white' : ''} />
      <MiniMap 
        nodeColor={(n: any) => {
            if (n.data?.isRoot) return '#40826D';
            return isDark ? '#1e293b' : '#f1f5f9';
        }}
        maskColor={isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)'}
        className={isDark ? 'bg-slate-900' : ''}
      />
    </ReactFlow>
  );
}
