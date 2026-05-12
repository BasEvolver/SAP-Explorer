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
      {/* View Mode Toggle */}
      <div className="absolute top-6 right-6 z-10 bg-evolver-bg-obsidian/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex items-center shadow-2xl">
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
