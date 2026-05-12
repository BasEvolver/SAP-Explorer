'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Search, Compass } from 'lucide-react';

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
      <div className="animate-pulse text-blue-500 font-mono">Initializing 2D ER Diagram...</div>
    </div>
  )
});

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [rootNode, setRootNode] = useState('MARA'); // Default starting point
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setRootNode(searchQuery.trim().toUpperCase());
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col flex-1 bg-evolver-bg-dark">
      {/* Top Search Bar Overlay */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-full max-w-2xl z-10 px-4 flex gap-4">
        <form onSubmit={handleSearch} className="relative group flex-1">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Compass className="w-5 h-5 text-evolver-viridian group-focus-within:animate-pulse" />
          </div>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Deep Search SAP Dictionary (e.g. MARA, EKKO)..."
            className="w-full bg-evolver-bg-obsidian/80 backdrop-blur-xl border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-evolver-viridian/50 focus:border-evolver-viridian/50 transition-all shadow-2xl"
          />
          <button type="submit" className="absolute inset-y-2 right-2 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-colors">
            Explore
          </button>
        </form>

        {/* View Mode Toggle */}
        <div className="bg-evolver-bg-obsidian/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex items-center shadow-2xl">
            <button 
                onClick={() => setViewMode('3d')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${viewMode === '3d' ? 'bg-evolver-viridian text-white' : 'text-slate-400 hover:text-white'}`}
            >
                3D Macro
            </button>
            <button 
                onClick={() => setViewMode('2d')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${viewMode === '2d' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
                2D ER
            </button>
        </div>
      </div>

      {/* Exploratory Graph */}
      <div className="relative w-full h-full flex-1">
        {viewMode === '3d' ? (
            <SchemaGraph rootNode={rootNode} onNodeClick={setRootNode} />
        ) : (
            <ReactFlowGraph rootNode={rootNode} />
        )}
      </div>
    </div>
  );
}
