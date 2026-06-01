'use client';

import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Compass, Filter, BookOpen, Layers, Database, HelpCircle, ArrowRight, Table, GitFork, ArrowLeftRight } from 'lucide-react';
import { 
  procureToPayData, 
  orderToCashData, 
  productionPlanningData, 
  plantMaintenanceData, 
  qualityManagementData, 
  humanResourcesData, 
  allObjectFlowData,
  FlowNode, 
  FlowLink 
} from '@/lib/sap-object-flow';
import Link from 'next/link';

// Dynamically import 3D force graph to prevent SSR mismatch
const OrgStructureGraph = dynamic(() => import('@/components/schema-graph/OrgStructureGraph'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-evolver-bg-dark">
      <div className="animate-pulse text-evolver-viridian font-mono">Initializing 3D Relationships Canvas...</div>
    </div>
  )
});

// Dynamically import 2D flow diagram
const ReactFlowGraph = dynamic(() => import('@/components/schema-graph/ReactFlowGraph'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-evolver-bg-dark">
      <div className="animate-pulse text-blue-500 font-mono">Initializing 2D Process flow...</div>
    </div>
  )
});

export default function ObjectRelationshipsPage() {
  const [activeFlowTab, setActiveFlowTab] = useState<'ALL' | 'P2P' | 'O2C' | 'PP' | 'PM' | 'QM' | 'HR'>('ALL');
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  const [isolatePivot, setIsolatePivot] = useState<boolean>(false);

  // Active base dataset based on selected Tab
  const activeFlowData = useMemo(() => {
    switch (activeFlowTab) {
      case 'ALL': return allObjectFlowData;
      case 'P2P': return procureToPayData;
      case 'O2C': return orderToCashData;
      case 'PP': return productionPlanningData;
      case 'PM': return plantMaintenanceData;
      case 'QM': return qualityManagementData;
      case 'HR': return humanResourcesData;
      default: return allObjectFlowData;
    }
  }, [activeFlowTab]);

  // Set the first node of the active tab as selected by default
  useEffect(() => {
    if (activeFlowData.nodes.length > 0) {
      setSelectedNode(activeFlowData.nodes[0]);
    }
  }, [activeFlowTab, activeFlowData]);

  // Group focus nodes by their type for categorized dropdown pivot selection
  const groupedFocusNodes = useMemo(() => {
    const groups: { [key: string]: FlowNode[] } = {};
    activeFlowData.nodes.forEach(node => {
      if (!groups[node.type]) {
        groups[node.type] = [];
      }
      groups[node.type].push(node);
    });
    return groups;
  }, [activeFlowData]);

  // Filter nodes and links based on focal isolation (ego-network isolation)
  const filteredData = useMemo(() => {
    if (isolatePivot && selectedNode) {
      const neighborIds = new Set<string>([selectedNode.id]);
      
      activeFlowData.links.forEach(link => {
        const src = typeof link.source === 'object' ? (link.source as any).id : link.source;
        const tgt = typeof link.target === 'object' ? (link.target as any).id : link.target;
        
        if (src === selectedNode.id) {
          neighborIds.add(tgt);
        } else if (tgt === selectedNode.id) {
          neighborIds.add(src);
        }
      });
      
      const isolatedNodes = activeFlowData.nodes.filter(n => neighborIds.has(n.id));
      const isolatedLinks = activeFlowData.links.filter(link => {
        const src = typeof link.source === 'object' ? (link.source as any).id : link.source;
        const tgt = typeof link.target === 'object' ? (link.target as any).id : link.target;
        return neighborIds.has(src) && neighborIds.has(tgt);
      });
      
      return {
        nodes: isolatedNodes,
        links: isolatedLinks
      };
    }

    return activeFlowData;
  }, [activeFlowData, isolatePivot, selectedNode]);

  // Find relationships for the selected node to show in the info panel
  const currentRelationships = useMemo(() => {
    if (!selectedNode) return [];
    
    return activeFlowData.links
      .filter(link => {
        const src = typeof link.source === 'object' ? (link.source as any).id : link.source;
        const tgt = typeof link.target === 'object' ? (link.target as any).id : link.target;
        return src === selectedNode.id || tgt === selectedNode.id;
      })
      .map(link => {
        const src = typeof link.source === 'object' ? (link.source as any).id : link.source;
        const tgt = typeof link.target === 'object' ? (link.target as any).id : link.target;
        const isSource = src === selectedNode.id;
        const relatedId = isSource ? tgt : src;
        const relatedNode = activeFlowData.nodes.find(n => n.id === relatedId);
        
        return {
          node: relatedNode,
          direction: isSource ? 'Outbound' : 'Inbound',
          table: link.sapTable,
          relation: link.type
        };
      })
      .filter(rel => rel.node !== undefined) as { node: FlowNode; direction: string; table?: string; relation: string }[];
  }, [selectedNode, activeFlowData]);

  const handleNodeSelect = (node: any) => {
    setSelectedNode(node as FlowNode);
  };

  return (
    <div className="relative w-full h-full flex flex-row flex-1 bg-slate-50 dark:bg-evolver-bg-dark overflow-hidden transition-colors duration-500">
      {/* Main Canvas Viewport */}
      <div className="relative flex-1 h-full flex flex-col min-w-0">
        
        {/* Top Control Bar */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 w-full max-w-4xl px-6 flex flex-col items-center gap-4">
          <div className="flex flex-wrap items-center justify-center gap-4 bg-white/90 dark:bg-evolver-bg-obsidian/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-2.5 shadow-2xl">
            {/* View Mode Toggle */}
            <div className="flex items-center p-0.5 bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-xl">
              <button 
                onClick={() => setViewMode('3d')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === '3d' ? 'bg-evolver-viridian text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                3D flow Map
              </button>
              <button 
                onClick={() => setViewMode('2d')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === '2d' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                2D Process Flow
              </button>
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-slate-200 dark:bg-white/10 hidden md:block" />

            {/* Process tab selectors */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest font-mono select-none">Workflow:</span>
              <div className="flex flex-wrap items-center gap-1 p-0.5 bg-slate-100/80 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl">
                <button
                  onClick={() => setActiveFlowTab('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    activeFlowTab === 'ALL' ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  🌐 Full View (All)
                </button>
                <button
                  onClick={() => setActiveFlowTab('P2P')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                    activeFlowTab === 'P2P' ? 'bg-evolver-viridian text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  P2P (Procure)
                </button>
                <button
                  onClick={() => setActiveFlowTab('O2C')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                    activeFlowTab === 'O2C' ? 'bg-evolver-viridian text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  O2C (Sales)
                </button>
                <button
                  onClick={() => setActiveFlowTab('PP')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                    activeFlowTab === 'PP' ? 'bg-evolver-viridian text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  PP (Prod)
                </button>
                <button
                  onClick={() => setActiveFlowTab('PM')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                    activeFlowTab === 'PM' ? 'bg-evolver-viridian text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  PM (Maint)
                </button>
                <button
                  onClick={() => setActiveFlowTab('QM')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                    activeFlowTab === 'QM' ? 'bg-evolver-viridian text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  QM (Quality)
                </button>
                <button
                  onClick={() => setActiveFlowTab('HR')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                    activeFlowTab === 'HR' ? 'bg-evolver-viridian text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  HR (Workforce)
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-slate-200 dark:bg-white/10 hidden lg:block" />

            {/* Focal Pivot Selector */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest font-mono">Focal Pivot:</span>
              <select
                value={selectedNode?.id || ''}
                onChange={(e) => {
                  const node = activeFlowData.nodes.find(n => n.id === e.target.value);
                  if (node) setSelectedNode(node);
                }}
                className="bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-evolver-viridian transition-colors shadow-sm dark:shadow-inner max-w-[150px] truncate"
              >
                <option value="">-- Focus Node --</option>
                {Object.entries(groupedFocusNodes).map(([type, nodes]) => (
                  <optgroup key={type} label={type} className="bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-sans font-bold">
                    {nodes.map(n => (
                      <option key={n.id} value={n.id} className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans font-semibold">
                        {n.id}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Isolate Toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isolatePivot}
                onChange={(e) => setIsolatePivot(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-slate-350 dark:border-white/10 bg-white dark:bg-black/40 text-evolver-viridian focus:ring-evolver-viridian focus:ring-opacity-25"
              />
              <span className="text-[10px] font-extrabold text-slate-650 dark:text-slate-400 uppercase tracking-wider font-mono">Isolate flow</span>
            </label>
          </div>
        </div>

        {/* The Graphic Canvas Container */}
        <div className="relative w-full h-full flex-1 pt-28">
          {viewMode === '3d' ? (
            <OrgStructureGraph 
              data={filteredData as any} 
              onNodeClick={handleNodeSelect} 
              activeDomain="All"
              selectedNode={selectedNode}
            />
          ) : (
            <ReactFlowGraph 
              rootNode={
                activeFlowTab === 'ALL' ? 'Material Master (MARA)' :
                activeFlowTab === 'P2P' ? 'Material Master (MARA)' :
                activeFlowTab === 'O2C' ? 'Customer Master (KNA1)' :
                activeFlowTab === 'PP' ? 'Material Master (MARA)' :
                activeFlowTab === 'PM' ? 'Equipment Master (EQUI)' :
                activeFlowTab === 'QM' ? 'Inspection Plan (PLMK)' :
                activeFlowTab === 'HR' ? 'Employee Record (PA0001)' : 'Material Master (MARA)'
              } 
              overrideData={filteredData as any} 
              onNodeClick={handleNodeSelect}
              selectedNodeId={selectedNode?.id}
            />
          )}
        </div>
      </div>

      {/* Interactive Detail Side Panel */}
      <div className="w-80 lg:w-96 border-l border-slate-200 dark:border-white/5 bg-white/95 dark:bg-evolver-bg-obsidian/95 backdrop-blur-2xl h-full flex flex-col overflow-y-auto shrink-0 z-10 select-none shadow-xl">
        {selectedNode ? (
          <div className="p-6 flex flex-col gap-6">
            
            {/* Header / Meta */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span 
                  className="w-2.5 h-2.5 rounded-full animate-pulse shadow-lg" 
                  style={{ backgroundColor: selectedNode.color, boxShadow: `0 0 8px ${selectedNode.color}` }}
                />
                <span className="text-[10px] font-extrabold tracking-widest text-slate-500 uppercase font-mono">
                  {selectedNode.type}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight font-sans">
                {selectedNode.id}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {selectedNode.description}
              </p>
            </div>

            {/* Technical Configuration Card */}
            {(selectedNode.sapTable || selectedNode.tcode) && (
              <div className="bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 rounded-2xl p-4 flex flex-col gap-3.5">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-mono uppercase tracking-wider">
                  <Database className="w-3.5 h-3.5 text-evolver-viridian" />
                  ERP Technical Config
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {selectedNode.sapTable && (
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">SAP Database Table</span>
                      <Link 
                        href={`/data/dictionary?table=${selectedNode.sapTable}`}
                        className="text-sm font-semibold font-mono text-evolver-viridian-light hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <Table className="w-3.5 h-3.5 shrink-0" />
                        {selectedNode.sapTable}
                      </Link>
                    </div>
                  )}
                  {selectedNode.tcode && (
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Customize T-Code</span>
                      <span className="text-sm font-semibold font-mono text-amber-500 dark:text-amber-400 mt-0.5">
                        {selectedNode.tcode}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* S/4HANA System object Counts Table */}
            <div className="bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 rounded-2xl p-4 flex flex-col gap-3">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wider font-mono">
                <Table className="w-3.5 h-3.5 text-pink-400" />
                S/4HANA System Object Counts
              </h3>
              <div className="overflow-hidden border border-slate-200 dark:border-white/5 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/50 dark:bg-white/[0.03] border-b border-slate-200 dark:border-white/5 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      <th className="px-3 py-2">Category / Document Status</th>
                      <th className="px-3 py-2 text-right">Count</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 dark:divide-white/5 font-sans">
                    {/* Render dynamic counts for active selected node */}
                    {selectedNode.id.includes('Material Master') && (
                      <>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ROH (Raw Materials)
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">12,490</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> FERT (Finished Goods)
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">3,102</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> HALB (Semifinished)
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">2,840</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> ERSA (Spare Parts)
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">4,118</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> HAWA (Trading Goods)
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">1,520</td>
                        </tr>
                        <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                          <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total Material Records</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">24,420</td>
                        </tr>
                      </>
                    )}
                    {selectedNode.id.includes('Supplier Master') && (
                      <>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Primary Trade Vendors
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">1,840</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Capital Asset Suppliers
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">680</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Services & Utilities
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">920</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Intercompany Vendors
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">678</td>
                        </tr>
                        <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                          <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total Suppliers</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">4,118</td>
                        </tr>
                      </>
                    )}
                    {selectedNode.id.includes('Customer Master') && (
                      <>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Wholesalers (B2B)
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">2,450</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Retail Customers (B2C)
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">3,100</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Affiliates / Intercompany
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">570</td>
                        </tr>
                        <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                          <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total Customers</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">6,120</td>
                        </tr>
                      </>
                    )}
                    {selectedNode.id.includes('Purchase Info Record') && (
                      <>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Standard Records
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">5,490</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Subcontracting Info
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">1,200</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Pipeline Supplies
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">300</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Consignment Agreements
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">1,500</td>
                        </tr>
                        <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                          <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total Price Books</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">8,490</td>
                        </tr>
                      </>
                    )}
                    {selectedNode.id.includes('Cust-Mat Price Book') && (
                      <>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Negotiated Accounts
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">3,450</td>
                        </tr>
                        <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                          <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total Cust-Mat Records</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">3,450</td>
                        </tr>
                      </>
                    )}
                    {selectedNode.id.includes('Outline Agreement') && (
                      <>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Quantity Contracts (MK)
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">810</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Value Contracts (WK)
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">310</td>
                        </tr>
                        <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                          <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total Agreements</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">1,120</td>
                        </tr>
                      </>
                    )}
                    {selectedNode.id.includes('Delivery Schedule') && (
                      <>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Open Schedule Lines
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">1,240</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" /> Fully Received
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">5,120</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Blocked / Delayed
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">480</td>
                        </tr>
                        <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                          <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total Schedule Lines</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">6,840</td>
                        </tr>
                      </>
                    )}
                    {selectedNode.id.includes('Purchase Requisition') && (
                      <>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> MRP Generated Reqs
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">9,210</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Manual Department Reqs
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">2,400</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> PM Work Order Reqs
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">880</td>
                        </tr>
                        <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                          <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total Requisitions</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">12,490</td>
                        </tr>
                      </>
                    )}
                    {selectedNode.id.includes('Purchase Order') && (
                      <>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Open POs
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">4,218</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" /> Received / Closed
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">18,490</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> In Release (Approval)
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">312</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Blocked POs
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">64</td>
                        </tr>
                        <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                          <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total Purchase Orders</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">23,084</td>
                        </tr>
                      </>
                    )}
                    {selectedNode.id.includes('Goods Receipt') && (
                      <>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Posted to Stock (101)
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">38,920</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Return Deliveries (122)
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">1,120</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Blocked GR Stock (103)
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">2,410</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Scrap/Consumptive (201)
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">5,840</td>
                        </tr>
                        <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                          <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total material Docs</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">48,290</td>
                        </tr>
                      </>
                    )}
                    {selectedNode.id.includes('Invoice Verification') && (
                      <>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Verified & Released
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">38,450</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Price Variance Blocked
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">1,890</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Quantity Variance Blocked
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">860</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" /> Parked Logistics Invoices
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">1,412</td>
                        </tr>
                        <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                          <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total Supplier Invoices</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">41,200</td>
                        </tr>
                      </>
                    )}
                    {selectedNode.id.includes('Accounts Payable') && (
                      <>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Open Unpaid Invoices
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">4,210</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Paid & Cleared Items
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">38,680</td>
                        </tr>
                        <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                          <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total AP Line Items</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">42,890</td>
                        </tr>
                      </>
                    )}
                    {selectedNode.id.includes('Outgoing Payments') && (
                      <>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Electronic Payouts (ACH)
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">32,800</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Printed Checks
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">4,110</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Manual Cleared Payouts
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">1,490</td>
                        </tr>
                        <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                          <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total Payments</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">38,400</td>
                        </tr>
                      </>
                    )}
                    {selectedNode.id.includes('Sales Inquiry') && (
                      <>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Open Inquiries
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">8,490</td>
                        </tr>
                        <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                          <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total Inquiries</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">8,490</td>
                        </tr>
                      </>
                    )}
                    {selectedNode.id.includes('Sales Quotation') && (
                      <>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Binding Quotations
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">7,120</td>
                        </tr>
                        <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                          <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total Quotations</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">7,120</td>
                        </tr>
                      </>
                    )}
                    {selectedNode.id.includes('Sales Order') && (
                      <>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Open (Pending PGI)
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">3,109</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" /> Completed Sales
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">25,480</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Credit Limit Blocked
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">145</td>
                        </tr>
                        <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                          <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total Sales Orders</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">28,734</td>
                        </tr>
                      </>
                    )}
                    {selectedNode.id.includes('Outbound Delivery') && (
                      <>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Open for Picking
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">1,890</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" /> Shipped (PGI Done)
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">29,110</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Warehouse On Hold
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">450</td>
                        </tr>
                        <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                          <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total Deliveries</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">31,450</td>
                        </tr>
                      </>
                    )}
                    {selectedNode.id.includes('Goods Issue') && (
                      <>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Standard Sales PGI (601)
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">27,450</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Physical Stock Scrapped
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">412</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Sample Outward Payouts
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">2,258</td>
                        </tr>
                        <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                          <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total Goods Issues</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">30,120</td>
                        </tr>
                      </>
                    )}
                    {selectedNode.id.includes('Billing Document') && (
                      <>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Posted to Accounting
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">25,120</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Pending FI Integration
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">890</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Credit Memos / Cancelled
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">480</td>
                        </tr>
                        <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                          <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total Invoices</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">26,490</td>
                        </tr>
                      </>
                    )}
                    {selectedNode.id.includes('Accounts Receivable') && (
                      <>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Open Unpaid Invoices
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">3,110</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Paid & Cleared Receivables
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">32,370</td>
                        </tr>
                        <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                          <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total AR Line Items</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">35,480</td>
                        </tr>
                      </>
                    )}
                    {selectedNode.id.includes('Payment Receipt') && (
                      <>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Bank Wire Receipts
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">21,800</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Cash/Check Receipts
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">3,000</td>
                        </tr>
                        <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                          <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total incoming Payments</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">24,800</td>
                        </tr>
                      </>
                    )}
                    {selectedNode.id.includes('Capacity Work Center') && (
                      <>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Machining Centers (0001)
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">84</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Assembly Lines (0007)
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">42</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Labor Crews (0003)
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">30</td>
                        </tr>
                        <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                          <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total Work Centers</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">156</td>
                        </tr>
                      </>
                    )}
                    {selectedNode.id.includes('Bill of Materials') && (
                      <>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Production BOMs (Active)
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">2,410</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Engineering BOMs (R&D)
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">180</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Costing BOMs
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">410</td>
                        </tr>
                        <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                          <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total BOM Records</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">3,000</td>
                        </tr>
                      </>
                    )}
                    {selectedNode.id.includes('Material Demand') && (
                      <>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Planned Independent Reqs (PIR)
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">8,400</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Dependent Demand Reqs
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">14,210</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Safety Stock Demands
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">3,110</td>
                        </tr>
                        <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                          <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total Demand Items</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">25,720</td>
                        </tr>
                      </>
                    )}
                    {selectedNode.id.includes('Planned Order') && (
                      <>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Firm Planned Orders
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">1,840</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Unfirm MRP Proposals
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">6,450</td>
                        </tr>
                        <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                          <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total Planned Orders</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">8,290</td>
                        </tr>
                      </>
                    )}
                    {selectedNode.id.includes('Production Order') && (
                      <>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Released Orders (REL)
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">2,410</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Completed & Settled (CNF)
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">15,800</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Created / Unreleased (CRTE)
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">480</td>
                        </tr>
                        <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                          <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total Production Orders</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">18,690</td>
                        </tr>
                      </>
                    )}
                    {selectedNode.id.includes('Component Reservation') && (
                      <>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Released Reservations
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">12,490</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Backordered / Missing Items
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">320</td>
                        </tr>
                        <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                          <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total Stock Reservations</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">12,810</td>
                        </tr>
                      </>
                    )}
                    {selectedNode.id.includes('Manufacturing Confirmation') && (
                      <>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Yield Confirmations
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">48,210</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Scrap Postings
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">1,240</td>
                        </tr>
                        <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                          <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total Yield Postings</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">49,450</td>
                        </tr>
                      </>
                    )}
                    {selectedNode.id.includes('Equipment Master') && (
                      <>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Production Machines
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">840</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Fleet Vehicles
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">120</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> HVAC/Facility Systems
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">280</td>
                        </tr>
                        <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                          <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total Managed Assets</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">1,240</td>
                        </tr>
                      </>
                    )}
                    {selectedNode.id.includes('Functional Location') && (
                      <>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Production Halls / Cells
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">8</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Plant Subsections
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">42</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Spatial Locations
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">110</td>
                        </tr>
                        <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                          <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total Locations</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">160</td>
                        </tr>
                      </>
                    )}
                    {selectedNode.id.includes('Maintenance Notification') && (
                      <>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Breakdown Reports (M1)
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">810</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Corrective Requests (M2)
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">1,240</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Preventive Notifications (M3)
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">2,490</td>
                        </tr>
                        <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                          <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total Notifications</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">4,540</td>
                        </tr>
                      </>
                    )}
                    {selectedNode.id.includes('Maintenance Order') && (
                      <>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Corrective Orders (PM01)
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">810</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Preventive Orders (PM02)
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">2,400</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Refurbishment Orders (PM04)
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">120</td>
                        </tr>
                        <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                          <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total Maintenance Orders</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">3,330</td>
                        </tr>
                      </>
                    )}
                    {selectedNode.id.includes('Maint Purchase Requisition') && (
                      <>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Stock Spare Parts Reqs
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">4,810</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> External Service Reqs
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">1,240</td>
                        </tr>
                        <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                          <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total Requisitions</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">6,050</td>
                        </tr>
                      </>
                    )}
                    {selectedNode.id.includes('Maint Confirmation') && (
                      <>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Confirmed Work Steps
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">12,400</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Damage Finding Logs
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">810</td>
                        </tr>
                        <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                          <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total Confirmations</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">13,210</td>
                        </tr>
                      </>
                    )}
                    {selectedNode.id.includes('Inspection Plan') && (
                      <>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Quality Plans (Material)
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">1,240</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Quantitative Characts
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">8,450</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Qualitative Characts
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">3,110</td>
                        </tr>
                        <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                          <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total Quality Plans</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">1,240</td>
                        </tr>
                      </>
                    )}
                    {selectedNode.id.includes('Inspection Lot') && (
                      <>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Goods Receipt Lots (01/05)
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">18,450</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> In-Process Production (03/04)
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">12,490</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Stock Transfer Lots (08)
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">1,840</td>
                        </tr>
                        <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                          <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total Quality Lots</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">32,780</td>
                        </tr>
                      </>
                    )}
                    {selectedNode.id.includes('Inspection Results') && (
                      <>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Accepted Checkpoints
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">142,500</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Out-of-Spec Defect Points
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">1,240</td>
                        </tr>
                        <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                          <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total Recorded Attributes</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">143,740</td>
                        </tr>
                      </>
                    )}
                    {selectedNode.id.includes('Usage Decision') && (
                      <>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Released to Stock (UD A)
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">31,450</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Returned to Vendor (UD R)
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">320</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Scrapped / Downgraded (UD S)
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">240</td>
                        </tr>
                        <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                          <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total Usage Decisions</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">32,010</td>
                        </tr>
                      </>
                    )}
                    {selectedNode.id.includes('Stock Transfer') && (
                      <>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Insp. to Unrestricted (321)
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">31,450</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Insp. to Blocked (322)
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">240</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Scrap from Inspection (553)
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">320</td>
                        </tr>
                        <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                          <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total Stock Transfers</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">32,010</td>
                        </tr>
                      </>
                    )}
                    {selectedNode.id.includes('Quality Notification') && (
                      <>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Customer Claims (F2)
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">310</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Vendor Non-Conformance (F1)
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">480</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Internal Defect Notifications (F3)
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">810</td>
                        </tr>
                        <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                          <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total Notifications</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">1,600</td>
                        </tr>
                      </>
                    )}
                    {selectedNode.id.includes('Employee Record') && (
                      <>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active Corporate Staff
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">1,240</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> External Contractors
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">480</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" /> Inactive / Retired Records
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">310</td>
                        </tr>
                        <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                          <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total Personnel Records</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">2,030</td>
                        </tr>
                      </>
                    )}
                    {selectedNode.id.includes('Organizational Position') && (
                      <>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Leadership Positions
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">24</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Departmental Heads
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">84</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Employee Job Positions
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">1,490</td>
                        </tr>
                        <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                          <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total Positions</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">1,598</td>
                        </tr>
                      </>
                    )}
                    {selectedNode.id.includes('Time Sheet Entries') && (
                      <>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Confirmed Production Hours
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">48,200</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Project Tasks allocations
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">12,450</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Maintenance Service hours
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">4,110</td>
                        </tr>
                        <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                          <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total TIMESHEET Entries</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">64,760</td>
                        </tr>
                      </>
                    )}
                    {selectedNode.id.includes('Payroll Run') && (
                      <>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Regular Payroll runs
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">14,880</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Off-Cycle Adjustments
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">1,240</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Benefit Cluster runs
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">16,120</td>
                        </tr>
                        <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                          <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total Payroll Clusters</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">32,240</td>
                        </tr>
                      </>
                    )}
                    {selectedNode.id.includes('G/L Ledger Postings') && (
                      <>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Standard General Postings
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">849,203</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Parked (Pending Authorization)
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">1,412</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Reversed Entries
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">324</td>
                        </tr>
                        <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                          <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total ledger Entries</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">850,939</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Business Role Description */}
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                Enterprise Role
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans bg-slate-100/50 dark:bg-black/20 rounded-xl p-3.5 border border-slate-200 dark:border-white/5">
                {selectedNode.details || "This document represents a key step in the transaction clearing and operational processing flow inside the pre-configured CAL demo environment."}
              </p>
            </div>

            {/* Relationships Explorer */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Layers className="w-3.5 h-3.5 text-pink-400" />
                Direct Linkages ({currentRelationships.length})
              </h3>
              
              {currentRelationships.length > 0 ? (
                <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                  {currentRelationships.map((rel, idx) => (
                    <button
                      key={`${rel.node.id}-${idx}`}
                      onClick={() => handleNodeSelect(rel.node)}
                      className="text-left w-full bg-slate-50 hover:bg-slate-100 dark:bg-white/[0.01] dark:hover:bg-white/[0.04] border border-slate-200/80 dark:border-white/5 hover:border-slate-350 dark:hover:border-white/10 rounded-xl p-3 flex items-center justify-between transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span 
                          className="w-2 h-2 rounded-full shrink-0" 
                          style={{ backgroundColor: rel.node.color }}
                        />
                        <div className="min-w-0 flex flex-col">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate font-sans">
                            {rel.node.id}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                            {rel.direction === 'Outbound' ? 'Triggers' : 'Linked via'}{' '}
                            <span className="font-semibold text-slate-600 dark:text-slate-400">{rel.table || 'Process'}</span>
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-600 group-hover:text-slate-800 dark:group-hover:text-white transition-colors shrink-0 pl-1" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500 text-center py-4 italic border border-dashed border-slate-200 dark:border-white/10 rounded-xl">
                  No direct relational linkages defined for this node.
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="p-6 flex flex-col items-center justify-center flex-1 text-slate-500 dark:text-slate-400 text-center">
            <Compass className="w-12 h-12 text-slate-400 dark:text-slate-600 mb-4 animate-spin-slow" />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-300">No Node Selected</p>
            <p className="text-xs text-slate-550 dark:text-slate-500 mt-1 max-w-[200px]">
              Click on any node in the flow diagram or 3D map to explore its customization footprints and transactional lifecycles.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
