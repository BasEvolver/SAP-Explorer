"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import ForceGraph3D from "react-force-graph-3d";
import * as THREE from 'three';
import SpriteText from 'three-spritetext';
import { useTheme } from "next-themes";
import { Loader2 } from "lucide-react";
import { OrgNode, OrgLink } from "@/lib/sap-org-structure";

interface OrgStructureGraphProps {
  data: { nodes: OrgNode[]; links: OrgLink[] };
  onNodeClick?: (node: OrgNode) => void;
  activeDomain: string;
  selectedNode?: OrgNode | null;
}

export default function OrgStructureGraph({ data, onNodeClick, activeDomain, selectedNode }: OrgStructureGraphProps) {
  const graphRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [loading, setLoading] = useState(true);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth - (window.innerWidth >= 1024 ? 256 : 80), // Adjust for sidebar
        height: window.innerHeight - 96, // Adjust for navbar
      });
    };
    
    window.addEventListener('resize', updateDimensions);
    updateDimensions();
    
    // Slight delay to simulate loading for clean visuals
    const timer = setTimeout(() => setLoading(false), 800);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
      clearTimeout(timer);
    };
  }, []);

  // Camera auto-focus on selectedNode updates (from dropdown focus pivots or linkages jumps)
  useEffect(() => {
    if (graphRef.current && selectedNode) {
      const timer = setTimeout(() => {
        const graphNodes = graphRef.current.graphData?.()?.nodes;
        if (graphNodes) {
          const foundNode = graphNodes.find((n: any) => n.id === selectedNode.id);
          if (foundNode) {
            const distance = 120;
            const distRatio = 1 + distance / Math.hypot(foundNode.x || 1, foundNode.y || 1, foundNode.z || 1);
            graphRef.current.cameraPosition(
              { x: (foundNode.x || 0) * distRatio, y: (foundNode.y || 0) * distRatio, z: (foundNode.z || 0) * distRatio },
              foundNode,
              1000
            );
          }
        }
      }, 400); // 400ms delay to allow D3 positioning tick to run
      return () => clearTimeout(timer);
    }
  }, [selectedNode]);

  const handleNodeClick = (node: any) => {
    // Aim camera at node
    const distance = 120;
    const distRatio = 1 + distance / Math.hypot(node.x || 1, node.y || 1, node.z || 1);

    if (graphRef.current) {
      graphRef.current.cameraPosition(
        { x: (node.x || 0) * distRatio, y: (node.y || 0) * distRatio, z: (node.z || 0) * distRatio }, // new position
        node, // lookAt
        1000  // transition ms
      );
    }
    
    if (onNodeClick) {
      onNodeClick(node as OrgNode);
    }
  };

  // Safe deep-clone of graph data to isolate D3 engine mutations
  const clonedData = useMemo(() => {
    return JSON.parse(JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    // Center graph on Client 100 after rendering
    if (graphRef.current) {
      setTimeout(() => {
        graphRef.current.zoomToFit(1200, 100);
      }, 900);
    }
  }, [activeDomain, data]);

  if (!dimensions.width) {
    return (
      <div className="w-full h-full bg-evolver-bg-dark flex items-center justify-center">
        <div className="animate-pulse text-evolver-viridian font-mono">Initializing 3D Org Canvas...</div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full transition-colors duration-500 ${isDark ? 'bg-evolver-bg-dark' : 'bg-slate-50'}`}>
      {/* Background ambient gradient */}
      <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] pointer-events-none transition-colors duration-500 ${
        isDark ? 'from-evolver-viridian/10 via-evolver-bg-dark to-evolver-bg-obsidian' : 'from-blue-600/5 via-slate-50 to-slate-200'
      }`} />
      
      {!loading && (
        <ForceGraph3D
          ref={graphRef}
          graphData={clonedData}
          width={dimensions.width}
          height={dimensions.height}
          nodeLabel={(node: any) => `[${node.type}] ${node.id}: ${node.description}`}
          nodeColor={(node: any) => node.color} 
          nodeVal={(node: any) => {
            switch (node.type) {
              case 'Client': return 40;
              case 'CompanyCode': return 26;
              case 'PurchOrg':
              case 'SalesOrg':
              case 'Plant':
              case 'MaintPlanning':
                return 18;
              case 'PurchGroup':
              case 'SalesArea':
              case 'StorageLoc':
              case 'ShippingPoint':
              case 'WorkCenter':
                return 12;
              case 'MasterData':
                return 8;
              case 'TransactionData':
                return 6;
              default: return 8;
            }
          }}
          nodeRelSize={2.5}
          linkColor={(link: any) => {
            return link.color || (isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.2)');
          }} 
          linkWidth={(link: any) => (link.type === 'ClientLink' ? 2.5 : 1)}
          linkDirectionalParticles={(link: any) => (link.type === 'ClientLink' ? 5 : 2)}
          linkDirectionalParticleSpeed={0.006}
          nodeThreeObject={(node: any) => {
            const isClient = node.type === 'Client';
            const isCoCode = node.type === 'CompanyCode';
            const labelText = node.id;
            
            const sprite = new SpriteText(labelText);
            sprite.color = isDark ? '#fff' : '#000';
            
            if (isClient) {
              sprite.textHeight = 13;
              sprite.fontWeight = 'bold';
              sprite.backgroundColor = 'rgba(255,255,255,0.25)';
            } else if (isCoCode) {
              sprite.textHeight = 10;
              sprite.fontWeight = 'bold';
              sprite.backgroundColor = `${node.color}50`;
            } else {
              sprite.textHeight = 6.5;
              sprite.fontWeight = 'normal';
              sprite.backgroundColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
            }
            
            sprite.padding = isClient ? 5 : (isCoCode ? 3.5 : 2);
            sprite.borderRadius = 4;
            return sprite;
          }}
          nodeThreeObjectExtend={true}
          onNodeClick={handleNodeClick}
          backgroundColor="#00000000" // transparent to let the custom background shine through
          enableNodeDrag={true}
        />
      )}

      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <Loader2 className={`w-12 h-12 animate-spin ${isDark ? 'text-evolver-viridian' : 'text-blue-600'}`} />
          <p className={`mt-4 font-mono text-sm animate-pulse ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Assembling 3D SAP Organization Model...
          </p>
        </div>
      )}
    </div>
  );
}
