'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Compass, Filter } from 'lucide-react';
import { sapModules } from '@/lib/sap-modules';

const SchemaGraph = dynamic(() => import('@/components/schema-graph/SchemaGraph'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-evolver-bg-dark">
      <div className="animate-pulse text-evolver-viridian font-mono">Initializing 3D Schema Graph...</div>
    </div>
  )
});



const ReactFlowGraph = dynamic(() => import('@/components/schema-graph/ReactFlowGraph'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-evolver-bg-dark">
      <div className="animate-pulse text-blue-500 font-mono">Initializing 2D Scope Map...</div>
    </div>
  )
});

export default function DiscoverPage() {
  const [activeModule, setActiveModule] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');

  // Dynamically generate the graph data from the curated sapModules
  const graphData = useMemo(() => {
    const nodes: any[] = [];
    const links: any[] = [];

    const moduleColors: Record<string, string> = {
      "Finance & Controlling (FI/CO)": "#06b6d4", // Cyan
      "Tax & Compliance": "#f59e0b", // Amber/Gold
      "Sales & Distribution (SD)": "#ec4899", // Pink
      "Materials Management (MM)": "#10b981", // Emerald
      "Production & Projects": "#a855f7", // Purple
      "Human Resources (HCM)": "#3b82f6"  // Blue
    };

    // Central Core Node
    nodes.push({ id: 'ARIA_CORE', description: 'Evolver Aria Intelligence', type: 'Core', color: '#ffffff' });

    sapModules.forEach(mod => {
      if (activeModule === 'All' || activeModule === mod.module) {
        const modColor = moduleColors[mod.module] || '#8b5cf6';
        
        // Module Node
        nodes.push({ id: mod.module, description: `${mod.module} Module`, type: 'Module', icon: mod.icon, color: modColor });
        links.push({ source: 'ARIA_CORE', target: mod.module, type: 'CoreLink', color: modColor });

        mod.submodules.forEach(sub => {
          sub.views.forEach(view => {
            // CDS View Node
            nodes.push({ 
              id: view.id, 
              description: view.name, 
              type: 'View', 
              category: view.category,
              parentModule: mod.module,
              color: modColor
            });
            links.push({ source: mod.module, target: view.id, type: 'ModuleLink', color: modColor });
          });
        });
      }
    });

    return { nodes, links };
  }, [activeModule]);

  return (
    <div className="relative w-full h-full flex flex-col flex-1 bg-evolver-bg-dark">
      {/* Top Navigation & Filters */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 w-full max-w-5xl px-6 flex flex-col items-center gap-4">
        <div className="bg-evolver-bg-obsidian/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl flex items-center justify-center">
            <button 
                onClick={() => setViewMode('3d')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${viewMode === '3d' ? 'bg-evolver-viridian text-white' : 'text-slate-400 hover:text-white'}`}
            >
                3D Macro Map
            </button>
            <button 
                onClick={() => setViewMode('2d')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${viewMode === '2d' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
                2D ER Diagram
            </button>
        </div>

        {/* Module Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
            <button
                onClick={() => setActiveModule('All')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors shadow-lg ${
                    activeModule === 'All' 
                    ? 'bg-white text-black border-white' 
                    : 'bg-black/40 text-slate-300 border-white/10 hover:border-white/30'
                }`}
            >
                All Modules
            </button>
            {sapModules.map(mod => (
                <button
                    key={mod.module}
                    onClick={() => setActiveModule(mod.module)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors shadow-lg ${
                        activeModule === mod.module 
                        ? 'bg-evolver-viridian text-white border-evolver-viridian' 
                        : 'bg-black/40 text-slate-300 border-white/10 hover:border-white/30'
                    }`}
                >
                    {mod.module.split(' (')[0]}
                </button>
            ))}
        </div>
      </div>

      {/* Exploratory Graph */}
      <div className="relative w-full h-full flex-1 pt-24">
        {viewMode === '3d' ? (
            <SchemaGraph rootNode="ARIA_CORE" overrideData={graphData} />
        ) : (
            <ReactFlowGraph rootNode="ARIA_CORE" overrideData={graphData} />
        )}
      </div>
    </div>
  );
}
