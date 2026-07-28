'use client';

import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Compass, Filter, BookOpen, Layers, ShieldCheck, Database, HelpCircle, ArrowRight, Table } from 'lucide-react';
import { sapOrgData, OrgNode, OrgLink } from '@/lib/sap-org-structure';
import Link from 'next/link';

// Dynamically import 3D force graph to prevent SSR mismatch
const OrgStructureGraph = dynamic(() => import('@/components/schema-graph/OrgStructureGraph'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-evolver-bg-dark">
      <div className="animate-pulse text-evolver-viridian font-mono">Initializing 3D Org Canvas...</div>
    </div>
  )
});

// Dynamically import 2D flow diagram
const ReactFlowGraph = dynamic(() => import('@/components/schema-graph/ReactFlowGraph'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-evolver-bg-dark">
      <div className="animate-pulse text-blue-500 font-mono">Initializing 2D Org Diagram...</div>
    </div>
  )
});

export default function OrgStructurePage() {
  const [activeDomain, setActiveDomain] = useState<string>('All');
  const [selectedCoCode, setSelectedCoCode] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [selectedNode, setSelectedNode] = useState<OrgNode | null>(null);
  const [isolatePivot, setIsolatePivot] = useState<boolean>(false);

  // Group focus nodes by their S/4HANA type for nice categorized selectors
  const groupedFocusNodes = useMemo(() => {
    const groups: { [key: string]: OrgNode[] } = {};
    sapOrgData.nodes.forEach(node => {
      if (node.type === 'Client') return; // Skip Client as it is the global root
      if (!groups[node.type]) {
        groups[node.type] = [];
      }
      groups[node.type].push(node);
    });
    return groups;
  }, []);

  // Initialize selected node to the Client node on load
  useEffect(() => {
    const clientNode = sapOrgData.nodes.find(n => n.type === 'Client');
    if (clientNode) {
      setSelectedNode(clientNode);
    }
  }, []);

  // Filter nodes and links based on selected domain & selected company code (compound routing)
  const filteredData = useMemo(() => {
    // If isolatePivot is checked and a node is selected, ego-network takes precedence!
    if (isolatePivot && selectedNode) {
      const neighborIds = new Set<string>([selectedNode.id]);
      
      sapOrgData.links.forEach(link => {
        const src = typeof link.source === 'object' ? (link.source as any).id : link.source;
        const tgt = typeof link.target === 'object' ? (link.target as any).id : link.target;
        
        if (src === selectedNode.id) {
          neighborIds.add(tgt);
        } else if (tgt === selectedNode.id) {
          neighborIds.add(src);
        }
      });
      
      const isolatedNodes = sapOrgData.nodes.filter(n => neighborIds.has(n.id));
      const isolatedLinks = sapOrgData.links.filter(link => {
        const src = typeof link.source === 'object' ? (link.source as any).id : link.source;
        const tgt = typeof link.target === 'object' ? (link.target as any).id : link.target;
        return neighborIds.has(src) && neighborIds.has(tgt);
      });
      
      return {
        nodes: isolatedNodes,
        links: isolatedLinks
      };
    }

    let baseNodes = sapOrgData.nodes;
    const baseLinks = sapOrgData.links;

    // 1. First Pass: Scope by Company Code (DE, US, WALD, etc.)
    if (selectedCoCode !== 'All') {
      const allowedNodeIds = new Set<string>(['Client 100']);
      
      // Shared Master registries that support both regions
      allowedNodeIds.add('Controlling Area A000');
      allowedNodeIds.add('G/L COA YCOA');
      allowedNodeIds.add('G/L Account Master (SKA1/SKB1)');
      allowedNodeIds.add('Cost Center Master (CSKS)');
      allowedNodeIds.add('Profit Center Master (CEPC)');
      allowedNodeIds.add('Customer Master (KNA1)');
      allowedNodeIds.add('Supplier Master (LFA1)');
      allowedNodeIds.add('Material Master (MARA)');
      allowedNodeIds.add('Equipment Master (EQUI)');
      
      // Shared transaction ledgers that store records for both regions
      allowedNodeIds.add('Journal Items (ACDOCA)');
      allowedNodeIds.add('G/L Document Segment (BSEG)');
      allowedNodeIds.add('Sales Orders (VBAK)');
      allowedNodeIds.add('Purchase Orders (EKKO)');
      allowedNodeIds.add('Production Orders (AUFK)');
      allowedNodeIds.add('Maintenance Orders (PM)');

      if (selectedCoCode === '1010') {
        allowedNodeIds.add('CoCode 1010');
        allowedNodeIds.add('PurchOrg 1010');
        allowedNodeIds.add('PurchGroup DE1');
        allowedNodeIds.add('SalesOrg 1010');
        allowedNodeIds.add('DistrChannel 20');
        allowedNodeIds.add('Division 00');
        allowedNodeIds.add('SalesArea DE-Whs');
        allowedNodeIds.add('Plant 1010');
        allowedNodeIds.add('StorageLoc 101A');
        allowedNodeIds.add('ShippingPoint 1010');
        allowedNodeIds.add('MaintPlanning 1010');
        allowedNodeIds.add('WorkCenter WC-MACH1');
      } else if (selectedCoCode === '1710') {
        allowedNodeIds.add('CoCode 1710');
        allowedNodeIds.add('PurchOrg 1710');
        allowedNodeIds.add('PurchGroup US1');
        allowedNodeIds.add('SalesOrg 1710');
        allowedNodeIds.add('DistrChannel 10');
        allowedNodeIds.add('Division 00');
        allowedNodeIds.add('SalesArea US-Direct');
        allowedNodeIds.add('Plant 1710');
        allowedNodeIds.add('Plant 1720');
        allowedNodeIds.add('StorageLoc 171A');
        allowedNodeIds.add('StorageLoc 171B');
        allowedNodeIds.add('ShippingPoint 1710');
        allowedNodeIds.add('MaintPlanning 1710');
        allowedNodeIds.add('WorkCenter WC-ASSEM1');
        allowedNodeIds.add('MaintGroup PM-US');
      } else {
        // Standard regional branches (SAP AG, India, France, etc.)
        allowedNodeIds.add(`CoCode ${selectedCoCode}`);
        allowedNodeIds.add(`Plant ${selectedCoCode}`);
      }

      baseNodes = baseNodes.filter(n => allowedNodeIds.has(n.id));
    }

    // 2. Second Pass: Filter by Domain View (Finance, Sales, Procurement, Logistics, Maintenance)
    if (activeDomain !== 'All') {
      const visibleGroups = new Set<string>(['Client']);
      
      if (activeDomain === 'Finance') {
        visibleGroups.add('Finance');
        visibleGroups.add('Master');
        visibleGroups.add('Transaction');
      } else if (activeDomain === 'Procurement') {
        visibleGroups.add('Finance');
        visibleGroups.add('Procurement');
        visibleGroups.add('Master');
        visibleGroups.add('Transaction');
      } else if (activeDomain === 'Sales') {
        visibleGroups.add('Finance');
        visibleGroups.add('Sales');
        visibleGroups.add('Master');
        visibleGroups.add('Transaction');
      } else if (activeDomain === 'Logistics') {
        visibleGroups.add('Finance');
        visibleGroups.add('Logistics');
        visibleGroups.add('Master');
        visibleGroups.add('Transaction');
      } else if (activeDomain === 'Maintenance') {
        visibleGroups.add('Logistics');
        visibleGroups.add('Maintenance');
        visibleGroups.add('Master');
        visibleGroups.add('Transaction');
      }

      baseNodes = baseNodes.filter(node => {
        if (node.type === 'Client') return true;

        if (node.group === 'Master' || node.group === 'Transaction') {
          if (activeDomain === 'Finance') {
            return node.id.includes('G/L') || node.id.includes('Journal') || node.id.includes('Cost Center') || node.id.includes('Profit Center') || node.id.includes('Controlling');
          }
          if (activeDomain === 'Procurement') {
            return node.id.includes('Supplier') || node.id.includes('Purchase');
          }
          if (activeDomain === 'Sales') {
            return node.id.includes('Customer') || node.id.includes('Sales Order');
          }
          if (activeDomain === 'Logistics') {
            return node.id.includes('Material') || node.id.includes('Production');
          }
          if (activeDomain === 'Maintenance') {
            return node.id.includes('Equipment') || node.id.includes('Maintenance') || node.id.includes('Work Center');
          }
          return false;
        }

        return visibleGroups.has(node.group);
      });
    }

    const nodeIds = new Set(baseNodes.map(n => n.id));

    // 3. Filter links connecting only active scoped nodes
    const filteredLinks = baseLinks.filter(link => {
      const sourceId = typeof link.source === 'object' ? (link.source as any).id : link.source;
      const targetId = typeof link.target === 'object' ? (link.target as any).id : link.target;
      return nodeIds.has(sourceId) && nodeIds.has(targetId);
    });

    return {
      nodes: baseNodes,
      links: filteredLinks
    };
  }, [activeDomain, selectedCoCode, isolatePivot, selectedNode]);

  // Find relationships for the selected node to show in the info panel
  const currentRelationships = useMemo(() => {
    if (!selectedNode) return [];
    
    return sapOrgData.links
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
        const relatedNode = sapOrgData.nodes.find(n => n.id === relatedId);
        
        return {
          node: relatedNode,
          direction: isSource ? 'Outbound' : 'Inbound',
          table: link.sapTable,
          relation: link.type
        };
      })
      .filter(rel => rel.node !== undefined) as { node: OrgNode; direction: string; table?: string; relation: string }[];
  }, [selectedNode]);

  const handleNodeSelect = (node: OrgNode) => {
    setSelectedNode(node);
  };

  const domainPills = [
    { id: 'All', label: 'All Structures' },
    { id: 'Finance', label: 'Finance & Ledger' },
    { id: 'Procurement', label: 'Procurement (MM)' },
    { id: 'Sales', label: 'Sales & Billing (SD)' },
    { id: 'Logistics', label: 'Logistics & Shipping' },
    { id: 'Maintenance', label: 'Plant Maintenance (PM)' }
  ];

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
                3D Org Map
              </button>
              <button 
                onClick={() => setViewMode('2d')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === '2d' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                2D Org Diagram
              </button>
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-slate-200 dark:bg-white/10 hidden md:block" />

            {/* Company Code Selector Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest font-mono">Company Code:</span>
              <select
                value={selectedCoCode}
                onChange={(e) => {
                  setSelectedCoCode(e.target.value);
                  if (e.target.value !== 'All') {
                    const node = sapOrgData.nodes.find(n => n.id === `CoCode ${e.target.value}`);
                    if (node) setSelectedNode(node);
                  } else {
                    const clientNode = sapOrgData.nodes.find(n => n.type === 'Client');
                    if (clientNode) setSelectedNode(clientNode);
                  }
                }}
                className="bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-evolver-viridian transition-colors shadow-sm dark:shadow-inner"
              >
                <option value="All">All Company Codes (Global)</option>
                <option value="1710">1710 - US Operations (Domestic)</option>
                <option value="1010">1010 - Germany Operations (DE)</option>
                <option value="0001">0001 - SAP A.G. (Walldorf HQ)</option>
                <option value="0003">0003 - SAP US (Software Sales)</option>
                <option value="IN01">IN01 - India Operations</option>
                <option value="FR01">FR01 - France Template</option>
                <option value="GB01">GB01 - UK Template</option>
                <option value="JP01">JP01 - Japan Template</option>
              </select>
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-slate-200 dark:bg-white/10 hidden lg:block" />

            {/* Focal Pivot Selector */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest font-mono">Focal Pivot:</span>
              <select
                value={selectedNode?.id || ''}
                onChange={(e) => {
                  const node = sapOrgData.nodes.find(n => n.id === e.target.value);
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
              <span className="text-[10px] font-extrabold text-slate-650 dark:text-slate-400 uppercase tracking-wider font-mono">Isolate Connections</span>
            </label>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-full">
            {domainPills.map(pill => (
              <button
                key={pill.id}
                onClick={() => {
                  setActiveDomain(pill.id);
                  // Auto-focus the corresponding primary node on domain change
                  if (pill.id === 'All') {
                    const clientNode = sapOrgData.nodes.find(n => n.type === 'Client');
                    if (clientNode) setSelectedNode(clientNode);
                  } else {
                    const primary = sapOrgData.nodes.find(n => n.group === pill.id || (pill.id === 'Maintenance' && n.group === 'Maintenance'));
                    if (primary) setSelectedNode(primary);
                  }
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 shadow-md ${
                  activeDomain === pill.id 
                    ? 'bg-evolver-viridian text-white border-evolver-viridian' 
                    : 'bg-white dark:bg-black/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-slate-350 dark:hover:border-white/30 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {/* The Graphic Canvas Container */}
        <div className="relative w-full h-full flex-1 pt-28">
          {viewMode === '3d' ? (
            <OrgStructureGraph 
              data={filteredData as any} 
              onNodeClick={handleNodeSelect} 
              activeDomain={activeDomain}
              selectedNode={selectedNode}
            />
          ) : (
            <ReactFlowGraph 
              rootNode="Client 100" 
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
                      {selectedNode.sapTable !== "MANDT" ? (
                        <Link 
                           href={`/data/dictionary?table=${selectedNode.sapTable}`}
                           className="text-sm font-semibold font-mono text-evolver-viridian-light hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <Table className="w-3.5 h-3.5 shrink-0" />
                          {selectedNode.sapTable}
                        </Link>
                      ) : (
                        <span className="text-sm font-semibold font-mono text-slate-750 dark:text-slate-300 mt-0.5">
                          {selectedNode.sapTable}
                        </span>
                      )}
                    </div>
                  )}
                  {selectedNode.tcode && (
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Customizing T-Code</span>
                      <span className="text-sm font-semibold font-mono text-amber-500 dark:text-amber-400 mt-0.5">
                        {selectedNode.tcode}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Document Status Summary Table (For transactional nodes) */}
            {selectedNode.type === 'TransactionData' && (
              <div className="bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 rounded-2xl p-4 flex flex-col gap-3">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wider font-mono">
                  <Table className="w-3.5 h-3.5 text-pink-400" />
                  Document Status Summary
                </h3>
                <div className="overflow-hidden border border-slate-200 dark:border-white/5 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100/50 dark:bg-white/[0.03] border-b border-slate-200 dark:border-white/5 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2 text-right">Count</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 dark:divide-white/5 font-sans">
                      {selectedNode.id.includes('Purchase Orders') && (
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
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Blocked
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">64</td>
                          </tr>
                          <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                            <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total</td>
                            <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">23,084</td>
                          </tr>
                        </>
                      )}
                      {selectedNode.id.includes('Sales Orders') && (
                        <>
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                            <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Open (Pending Delivery)
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">3,109</td>
                          </tr>
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                            <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" /> Completed
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">25,480</td>
                          </tr>
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                            <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> On Credit Block
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">145</td>
                          </tr>
                          <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                            <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total</td>
                            <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">28,734</td>
                          </tr>
                        </>
                      )}
                      {selectedNode.id.includes('Journal Items') && (
                        <>
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                            <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Posted (Standard Ledger)
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">849,203</td>
                          </tr>
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                            <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Parked (Pending Release)
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">1,412</td>
                          </tr>
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                            <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Reversed
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">324</td>
                          </tr>
                          <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                            <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total</td>
                            <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">850,939</td>
                          </tr>
                        </>
                      )}
                      {selectedNode.id.includes('G/L Document Segment') && (
                        <>
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                            <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Standard General Postings
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">345,920</td>
                          </tr>
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                            <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Vendor Open Items (AP)
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">42,890</td>
                          </tr>
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                            <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Customer Open Items (AR)
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">35,480</td>
                          </tr>
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                            <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Asset & Inventory Postings
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">18,910</td>
                          </tr>
                          <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                            <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total Postings</td>
                            <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">443,200</td>
                          </tr>
                        </>
                      )}
                      {selectedNode.id.includes('Production Orders') && (
                        <>
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                            <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Released (Active)
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">812</td>
                          </tr>
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                            <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" /> Completed (TECO)
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">9,450</td>
                          </tr>
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                            <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Created (Draft)
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">94</td>
                          </tr>
                          <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                            <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total</td>
                            <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">10,356</td>
                          </tr>
                        </>
                      )}
                      {selectedNode.id.includes('Maintenance Orders') && (
                        <>
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                            <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Outstanding (Planned)
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">180</td>
                          </tr>
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                            <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Released (Active)
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">412</td>
                          </tr>
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                            <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" /> Completed (TECO)
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">3,200</td>
                          </tr>
                          <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                            <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total</td>
                            <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">3,792</td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Finance Master Data Breakdown Tables */}
            {(selectedNode.id.includes('G/L COA') || selectedNode.id.includes('G/L Account Master') || selectedNode.id.includes('Cost Center Master') || selectedNode.id.includes('Profit Center Master')) && (
              <div className="bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 rounded-2xl p-4 flex flex-col gap-3">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wider font-mono">
                  <Table className="w-3.5 h-3.5 text-blue-400" />
                  Financial Data Breakdown
                </h3>
                <div className="overflow-hidden border border-slate-200 dark:border-white/5 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100/50 dark:bg-white/[0.03] border-b border-slate-200 dark:border-white/5 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        <th className="px-3 py-2">
                          {selectedNode.id.includes('Cost Center') ? 'Functional Area / Category' : 
                           selectedNode.id.includes('Profit Center') ? 'Division / Segment' : 
                           selectedNode.id.includes('COA') ? 'Chart of Accounts Config' : 'Account Class (SKA1)'}
                        </th>
                        <th className="px-3 py-2 text-right">Count</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 dark:divide-white/5 font-sans">
                      {selectedNode.id.includes('G/L COA') && (
                        <>
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                            <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Primary COA Code
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400 font-bold">YCOA</td>
                          </tr>
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                            <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Account Groups Classes
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">12</td>
                          </tr>
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                            <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" /> Assigned Company Codes
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">8</td>
                          </tr>
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                            <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Controlling Areas Using
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">1</td>
                          </tr>
                          <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                            <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total Account Definitions</td>
                            <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">685</td>
                          </tr>
                        </>
                      )}
                      {selectedNode.id.includes('G/L Account Master') && (
                        <>
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                            <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Assets (1xxxxxxx)
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">185</td>
                          </tr>
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                            <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Liabilities (2xxxxxxx)
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">120</td>
                          </tr>
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                            <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Equity (3xxxxxxx)
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">35</td>
                          </tr>
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                            <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" /> Primary Costs/Revenues (4xxxxxxx)
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">245</td>
                          </tr>
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                            <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Secondary Costs (5xxxxxxx)
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">85</td>
                          </tr>
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                            <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" /> Non-Operating Expense (6xxxxxxx)
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">15</td>
                          </tr>
                          <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                            <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total Accounts (SKA1/SKB1)</td>
                            <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">685</td>
                          </tr>
                        </>
                      )}
                      {selectedNode.id.includes('Cost Center Master') && (
                        <>
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                            <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Administration (ADMIN)
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">45</td>
                          </tr>
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                            <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Production/Operations (PROD)
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">110</td>
                          </tr>
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                            <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-pink-500" /> Sales & Marketing (SALES)
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">35</td>
                          </tr>
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                            <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Research & Development (RD)
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">20</td>
                          </tr>
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                            <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" /> Service & Support (SRV)
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">30</td>
                          </tr>
                          <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                            <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total Cost Centers (CSKS)</td>
                            <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">240</td>
                          </tr>
                        </>
                      )}
                      {selectedNode.id.includes('Profit Center Master') && (
                        <>
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                            <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Corporate Segment (CORP)
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">12</td>
                          </tr>
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                            <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> European Region (EU)
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">28</td>
                          </tr>
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                            <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" /> Americas Region (US)
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">28</td>
                          </tr>
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                            <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Asia-Pacific Region (APAC)
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">15</td>
                          </tr>
                          <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                            <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total Profit Centers (CEPC)</td>
                            <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">83</td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Material Type Breakdown Table (For Plants & Material Master) */}
            {(selectedNode.type === 'Plant' || selectedNode.id.includes('Material Master')) && (
              <div className="bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 rounded-2xl p-4 flex flex-col gap-3">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wider font-mono">
                  <Table className="w-3.5 h-3.5 text-blue-400" />
                  Material Type Breakdown
                </h3>
                <div className="overflow-hidden border border-slate-200 dark:border-white/5 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100/50 dark:bg-white/[0.03] border-b border-slate-200 dark:border-white/5 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        <th className="px-3 py-2">Material Type (MTART)</th>
                        <th className="px-3 py-2 text-right">Stocked Items</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 dark:divide-white/5 font-sans">
                      {/* Render specific Plant material counts */}
                      {selectedNode.id === 'Plant 1710' && (
                        <>
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                            <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ROH (Raw Materials)
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">5,400</td>
                          </tr>
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                            <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> FERT (Finished Goods)
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">1,200</td>
                          </tr>
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                            <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> HALB (Semifinished)
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">900</td>
                          </tr>
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                            <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> ERSA (Spare Parts)
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">1,100</td>
                          </tr>
                          <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                            <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total Plant Stock</td>
                            <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">8,600</td>
                          </tr>
                        </>
                      )}
                      {selectedNode.id === 'Plant 1010' && (
                        <>
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                            <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ROH (Raw Materials)
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">4,100</td>
                          </tr>
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                            <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> FERT (Finished Goods)
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">950</td>
                          </tr>
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                            <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> HALB (Semifinished)
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">720</td>
                          </tr>
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                            <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> ERSA (Spare Parts)
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">980</td>
                          </tr>
                          <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                            <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total Plant Stock</td>
                            <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">6,750</td>
                          </tr>
                        </>
                      )}
                      {/* Default counts for other plants to keep it generic & robust */}
                      {selectedNode.type === 'Plant' && selectedNode.id !== 'Plant 1710' && selectedNode.id !== 'Plant 1010' && (
                        <>
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                            <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ROH (Raw Materials)
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">2,400</td>
                          </tr>
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                            <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> FERT (Finished Goods)
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">480</td>
                          </tr>
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                            <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> HALB (Semifinished)
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">350</td>
                          </tr>
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                            <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> ERSA (Spare Parts)
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">120</td>
                          </tr>
                          <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                            <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total Plant Stock</td>
                            <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">3,350</td>
                          </tr>
                        </>
                      )}
                      {/* Global Material Master counts */}
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
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                            <td className="px-3 py-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> DIEN (Services)
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">350</td>
                          </tr>
                          <tr className="bg-slate-100/40 dark:bg-white/[0.02] font-semibold">
                            <td className="px-3 py-2 text-slate-900 dark:text-slate-200">Total Material Types</td>
                            <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-200">24,420</td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Business Role Description */}
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                Enterprise Role
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans bg-slate-100/50 dark:bg-black/20 rounded-xl p-3.5 border border-slate-200 dark:border-white/5">
                {selectedNode.details || "This node serves as a key configuration element supporting transaction processing and data separation in the CAL demo environment."}
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
                            {rel.direction === 'Outbound' ? 'Owns' : 'Linked via'}{' '}
                            <span className="font-semibold text-slate-600 dark:text-slate-400">{rel.table || 'Config'}</span>
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
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 max-w-[200px]">
              Click on any node in the 3D map or 2D flow diagram to explore its SAP customization and relationships.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
