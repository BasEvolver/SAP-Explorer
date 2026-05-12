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

// Custom Node for Database Tables
function TableNode({ data }: { data: any }) {
  const isDark = data.isDark;
  return (
    <div className={`rounded-lg border shadow-lg overflow-hidden min-w-[200px] ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
      <Handle type="target" position={Position.Top} className="w-2 h-2 opacity-0" />
      <div className={`px-4 py-2 font-bold text-sm ${data.isRoot ? 'bg-evolver-viridian text-white' : (isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-800')}`}>
        {data.id}
      </div>
      <div className={`px-4 py-3 text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
        {data.description || "No Description Available"}
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 opacity-0" />
    </div>
  );
}

const nodeTypes = {
  table: TableNode,
};

export default function ReactFlowGraph({ rootNode, overrideData }: { rootNode: string, overrideData?: { nodes: any[], links: any[] } }) {
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
      
      const newNodes = json!.nodes.map((n: any, idx: number) => {
        let radius = 400;
        let angle = (idx / (json!.nodes.length - 1 || 1)) * 2 * Math.PI;
        
        if (n.type === 'Core' || n.id === rootNode) {
            radius = 0;
        } else if (n.type === 'Module') {
            radius = 250;
            angle = (modules.findIndex((m: any) => m.id === n.id) / (modules.length || 1)) * 2 * Math.PI;
        } else if (n.parentModule) {
            // Cluster views around their parent module
            const modIdx = modules.findIndex((m: any) => m.id === n.parentModule);
            const baseAngle = (modIdx / (modules.length || 1)) * 2 * Math.PI;
            // Add a small random offset so they don't stack
            angle = baseAngle + (Math.random() - 0.5) * 0.5;
            radius = 450 + Math.random() * 50;
        }

        const isCore = n.type === 'Core' || n.id === rootNode;
        
        return {
          id: n.id,
          type: 'table',
          position: { 
            x: centerX + radius * Math.cos(angle) - 100, 
            y: centerY + radius * Math.sin(angle) - 50
          },
          data: { 
            id: n.id, 
            description: n.description,
            isRoot: isCore,
            isDark
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
  }, [rootNode, isDark, overrideData]);

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

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
