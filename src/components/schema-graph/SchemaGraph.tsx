"use client";

import { useEffect, useRef, useState } from "react";
import ForceGraph3D from "react-force-graph-3d";
import * as THREE from 'three';
import SpriteText from 'three-spritetext';
import { useTheme } from "next-themes";
import { Loader2, AlertCircle, Filter } from "lucide-react";

const MODULES = ['All', 'Finance', 'Sales', 'Procurement'];

export default function SchemaGraph() {
  const graphRef = useRef<any>(null);
  const [data, setData] = useState({ nodes: [], links: [] });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeModule, setActiveModule] = useState('All');
  const { resolvedTheme } = useTheme();

  const fetchSchema = async (module: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sap/schema?module=${module}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to fetch schema');
      }
      const json = await res.json();
      
      // If the API returns too many nodes, the graph can freeze. We'll cap it at 300 nodes for the POC.
      if (json.nodes.length > 300) {
          const limitedNodes = json.nodes.slice(0, 300);
          const nodeIds = new Set(limitedNodes.map((n: any) => n.id));
          const limitedLinks = json.links.filter((l: any) => nodeIds.has(l.source) && nodeIds.has(l.target));
          setData({ nodes: limitedNodes, links: limitedLinks });
      } else {
          setData(json);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchema(activeModule);
  }, [activeModule]);

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth - (window.innerWidth >= 1024 ? 256 : 80), // Adjust for sidebar
        height: window.innerHeight,
      });
    };
    
    window.addEventListener('resize', updateDimensions);
    updateDimensions();
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const handleNodeClick = (node: any) => {
    // Aim at node from outside it
    const distance = 100;
    const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);

    if (graphRef.current) {
      graphRef.current.cameraPosition(
        { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
        node, // lookAt ({ x, y, z })
        3000  // ms transition duration
      );
    }
  };

  const isDark = resolvedTheme === 'dark';

  if (!dimensions.width) return <div className="w-full h-full bg-evolver-bg-dark flex items-center justify-center">Initializing Schema Graph...</div>;

  return (
    <div className={`absolute inset-0 transition-colors duration-500 ${isDark ? 'bg-evolver-bg-dark' : 'bg-slate-50'}`}>
      {/* Background ambient gradient */}
      <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] pointer-events-none transition-colors duration-500 ${
        isDark ? 'from-evolver-blue/10 via-evolver-bg-dark to-evolver-bg-obsidian' : 'from-evolver-viridian/5 via-slate-50 to-slate-200'
      }`} />
      
      {!loading && !error && data.nodes.length > 0 && (
        <ForceGraph3D
          ref={graphRef}
          graphData={data}
          width={dimensions.width}
          height={dimensions.height}
          nodeLabel="id"
          nodeColor={(node: any) => node.type === 'Master' ? '#40826D' : '#1D4E89'} // Viridian for master, Blue for transaction
          nodeRelSize={6}
          linkColor={() => isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'} // Highly visible lines
          linkWidth={1}
          nodeThreeObject={(node: any) => {
            if (node.type === 'Master') {
              const sprite = new SpriteText(node.id);
              sprite.color = isDark ? '#fff' : '#000';
              sprite.textHeight = 8;
              sprite.fontWeight = 'bold';
              sprite.backgroundColor = isDark ? 'rgba(64, 130, 109, 0.4)' : 'rgba(64, 130, 109, 0.2)';
              sprite.padding = 2;
              sprite.borderRadius = 4;
              return sprite;
            }
            return false;
          }}
          nodeThreeObjectExtend={true}
          onNodeClick={handleNodeClick}
          backgroundColor="#00000000" // transparent to show gradient
          enableNodeDrag={false}
        />
      )}

      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Loader2 className={`w-12 h-12 animate-spin ${isDark ? 'text-evolver-viridian' : 'text-blue-600'}`} />
            <p className={`mt-4 font-mono animate-pulse ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Extracting S/4HANA Metadata...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="glass-panel p-6 rounded-2xl flex items-start gap-4 max-w-xl border-red-500/30">
                <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                <div>
                    <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>Metadata Extraction Failed</h3>
                    <p className={`mt-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{error}</p>
                </div>
            </div>
        </div>
      )}
      
      {/* Overlay UI elements */}
      <div className="absolute bottom-6 left-6 flex flex-col gap-4">
        <div className="glass-panel px-4 py-3 rounded-xl flex items-center gap-3 shadow-lg">
            <Filter className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            <select 
                value={activeModule}
                onChange={(e) => setActiveModule(e.target.value)}
                className={`bg-transparent border-none outline-none font-semibold cursor-pointer ${isDark ? 'text-white' : 'text-slate-900'}`}
            >
                {MODULES.map(m => (
                    <option key={m} value={m} className="bg-slate-800 text-white">{m}</option>
                ))}
            </select>
        </div>

        <div className="glass-panel px-4 py-3 rounded-xl shadow-lg">
          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Schema Graph</h3>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {data.nodes.length} Entities | {data.links.length} Relationships
          </p>
        </div>
      </div>
    </div>
  );
}
