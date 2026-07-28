"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ServerCog, Search, Loader2, AlertCircle, ChevronRight, ChevronDown, Database, LayoutTemplate } from "lucide-react";

function LogicalDBsContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') || "";

  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedLdb, setSelectedLdb] = useState<any>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Fetch initial list on mount
  useEffect(() => {
    const fetchInitial = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/sap/logical-dbs');
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch (err) {
        console.error("Failed to load initial LDBs", err);
      } finally {
        setLoading(false);
      }
    };
    if (!initialQ) fetchInitial();
  }, [initialQ]);

  const performSearch = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setSelectedLdb(null);
    try {
      const res = await fetch(`/api/sap/logical-dbs?search=${query.trim()}`);
      if (!res.ok) throw new Error("Search failed.");
      const data = await res.json();
      setSearchResults(data);
      if (data.length === 0) setError("No Logical Databases found.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQ) performSearch(initialQ);
  }, [initialQ]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  const loadLdbDetails = async (ldbName: string) => {
    setLoading(true);
    setError(null);
    setSearchResults([]);

    try {
      const res = await fetch(`/api/sap/logical-dbs?ldb=${ldbName}`);
      if (!res.ok) throw new Error("Failed to load Logical Database details.");
      const data = await res.json();
      
      // Auto-expand the root node
      const newExpanded = new Set<string>();
      if (data.rootNode) newExpanded.add(data.rootNode);
      setExpandedNodes(newExpanded);
      
      setSelectedLdb(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleNode = (nodeId: string) => {
    const next = new Set(expandedNodes);
    if (next.has(nodeId)) {
        next.delete(nodeId);
    } else {
        next.add(nodeId);
    }
    setExpandedNodes(next);
  };

  // Recursive Tree Component
  const TreeNode = ({ node, allNodes, depth = 0 }: { node: any, allNodes: any[], depth?: number }) => {
    const children = allNodes.filter(n => n.PARENTID === node.NODEID);
    const hasChildren = children.length > 0;
    const isExpanded = expandedNodes.has(node.NODEID);

    return (
        <div className="flex flex-col">
            <div 
                className={`flex items-center gap-2 py-2 px-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer ${depth === 0 ? 'bg-white/5 font-semibold mt-2' : ''}`}
                style={{ paddingLeft: `${depth * 1.5 + 0.75}rem` }}
                onClick={() => hasChildren && toggleNode(node.NODEID)}
            >
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                    {hasChildren ? (
                        isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />
                    ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                    )}
                </div>
                <LayoutTemplate className={`w-4 h-4 shrink-0 ${depth === 0 ? 'text-evolver-viridian' : 'text-slate-500'}`} />
                <span className={`font-mono tracking-tight ${depth === 0 ? 'text-white' : 'text-slate-300'}`}>{node.NODEID}</span>
                {node.description && (
                    <span className="text-slate-500 text-sm ml-2 truncate">{node.description}</span>
                )}
            </div>
            
            {hasChildren && isExpanded && (
                <div className="flex flex-col relative before:absolute before:left-[1.375rem] before:top-0 before:bottom-0 before:w-px before:bg-white/10">
                    {children.map(child => (
                        <TreeNode key={child.NODEID} node={child} allNodes={allNodes} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
  };

  return (
    <div className="flex-1 w-full h-full p-8 overflow-y-auto bg-evolver-bg-dark text-slate-200">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/50 p-6 rounded-2xl border border-white/5 shadow-lg backdrop-blur-xl">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
              <ServerCog className="w-8 h-8 text-evolver-viridian" />
              Logical Databases
            </h1>
            <p className="text-slate-400 mt-2">Explore specific SAP business hierarchies (e.g. ADA, VAV).</p>
          </div>
          
          <form onSubmit={handleSearch} className="relative w-full md:w-96 group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-evolver-viridian group-focus-within:animate-pulse" />
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search LDB (e.g., ADA)..."
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-evolver-viridian/50 transition-all shadow-inner"
            />
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-evolver-viridian animate-spin" />
            <p className="mt-4 text-slate-400 font-mono animate-pulse">Loading Hierarchy...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="glass-panel p-6 rounded-2xl flex items-start gap-4 border-amber-500/30 bg-amber-500/5">
            <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-lg text-amber-400">Notice</h3>
              <p className="mt-2 text-slate-300">{error}</p>
            </div>
          </div>
        )}

        {/* Curated Discover Section */}
        {!searchQuery && !selectedLdb && !loading && (
          <div className="space-y-8 mt-4">
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                <div className="w-2 h-6 bg-evolver-blue rounded-full"></div>
                Finance & Controlling (FI/CO)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { id: 'ADA', desc: 'Asset Accounting Database' },
                  { id: 'SDF', desc: 'G/L Account Database' },
                  { id: 'KDF', desc: 'Vendor Database' },
                  { id: 'DDF', desc: 'Customer Database' }
                ].map(item => (
                  <div key={item.id} onClick={() => loadLdbDetails(item.id)} className="glass-panel p-5 rounded-xl cursor-pointer hover:border-evolver-blue/50 transition-colors group">
                    <h3 className="font-bold text-white font-mono text-xl group-hover:text-evolver-blue">{item.id}</h3>
                    <p className="text-sm text-slate-400 mt-2">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                <div className="w-2 h-6 bg-amber-500 rounded-full"></div>
                Sales & Distribution (SD)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { id: 'VAV', desc: 'Sales Document' },
                  { id: 'VAK', desc: 'Sales Index' }
                ].map(item => (
                  <div key={item.id} onClick={() => loadLdbDetails(item.id)} className="glass-panel p-5 rounded-xl cursor-pointer hover:border-amber-500/50 transition-colors group">
                    <h3 className="font-bold text-white font-mono text-xl group-hover:text-amber-500">{item.id}</h3>
                    <p className="text-sm text-slate-400 mt-2">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                <div className="w-2 h-6 bg-emerald-500 rounded-full"></div>
                Materials Management (MM)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { id: 'ELM', desc: 'Purchasing Documents' },
                  { id: 'EMM', desc: 'Material Master' }
                ].map(item => (
                  <div key={item.id} onClick={() => loadLdbDetails(item.id)} className="glass-panel p-5 rounded-xl cursor-pointer hover:border-emerald-500/50 transition-colors group">
                    <h3 className="font-bold text-white font-mono text-xl group-hover:text-emerald-500">{item.id}</h3>
                    <p className="text-sm text-slate-400 mt-2">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search Results List */}
        {searchQuery && searchResults.length > 0 && !selectedLdb && !loading && (
            <div className="bg-slate-900/50 border border-white/5 shadow-lg backdrop-blur-xl rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-white/5 bg-black/20">
                    <h3 className="font-semibold text-slate-300">Select a Logical Database to view hierarchy</h3>
                </div>
                <div className="divide-y divide-white/5">
                    {searchResults.map((ldb) => (
                        <div 
                            key={ldb.LDBNAME}
                            onClick={() => loadLdbDetails(ldb.LDBNAME)}
                            className="p-4 flex items-center justify-between hover:bg-white/5 cursor-pointer transition-colors group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-evolver-viridian/10 border border-evolver-viridian/20 flex items-center justify-center text-evolver-viridian font-bold font-mono">
                                    {ldb.LDBNAME.substring(0, 3)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-white font-mono tracking-tight group-hover:text-evolver-viridian transition-colors">{ldb.LDBNAME}</h4>
                                    <p className="text-sm text-slate-400">{ldb.LDBTEXT || "No description available"}</p>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-evolver-viridian transition-colors" />
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Selected LDB Hierarchy View */}
        {selectedLdb && !loading && (
            <div className="space-y-6">
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 shadow-lg backdrop-blur-xl flex flex-col gap-2">
                    <div className="flex items-center gap-3 mb-2">
                        <button 
                            onClick={() => { setSelectedLdb(null); handleSearch({ preventDefault: () => {} } as any); }}
                            className="text-slate-400 hover:text-white flex items-center gap-1 text-sm bg-black/20 px-3 py-1.5 rounded-lg border border-white/5 transition-colors"
                        >
                            <Search className="w-3.5 h-3.5" /> Back to Search
                        </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                        <h2 className="text-3xl font-bold text-white tracking-tight font-mono">{selectedLdb.ldb}</h2>
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold tracking-wider uppercase border border-blue-500/30">
                            Logical Database
                        </span>
                    </div>
                    <p className="text-slate-300 text-lg">{selectedLdb.description || "No description available."}</p>
                </div>

                <div className="bg-slate-900/50 p-6 border border-white/5 shadow-lg backdrop-blur-xl rounded-2xl overflow-hidden min-h-[400px]">
                    <h3 className="font-semibold text-slate-400 uppercase tracking-wider text-xs mb-4 flex items-center gap-2">
                        <Database className="w-4 h-4" /> Node Hierarchy Tree
                    </h3>
                    
                    <div className="font-mono text-sm">
                        {selectedLdb.nodes && selectedLdb.nodes.length > 0 ? (
                            selectedLdb.nodes.filter((n: any) => !n.PARENTID).map((rootNode: any) => (
                                <TreeNode key={rootNode.NODEID} node={rootNode} allNodes={selectedLdb.nodes} />
                            ))
                        ) : (
                            <div className="text-slate-500 p-8 text-center italic">No hierarchy nodes extracted for this database.</div>
                        )}
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}

export default function LogicalDBsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-white">Loading logical databases...</div>}>
            <LogicalDBsContent />
        </Suspense>
    );
}
