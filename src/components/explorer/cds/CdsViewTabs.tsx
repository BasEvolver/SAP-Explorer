"use client";

import { useState, useEffect, useMemo } from "react";
import { Info, LayoutGrid, DatabaseZap, Code2, Download, AlertTriangle, Loader2, TableProperties, Tags, Link as LinkIcon, Search, ChevronDown } from "lucide-react";
import clsx from "clsx";
import dynamic from "next/dynamic";

const SchemaGraph = dynamic(() => import("@/components/schema-graph/SchemaGraph"), {
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center text-slate-500"><Loader2 className="w-8 h-8 animate-spin" /></div>
});

interface CdsView {
  id: string;
  name: string;
  description: string;
  category: string;
}

// Flattens OData expanded nested objects/arrays for a flat grid display
const flattenODataResults = (results: any[]) => {
    return results.map(row => {
        const flatRow: any = {};
        for (const [key, value] of Object.entries(row)) {
            if (key === '__metadata') continue;
            
            if (value && typeof value === 'object') {
                // Handle nested object or nested { results: [] } array
                let itemsToFlatten = [];
                if (Array.isArray((value as any).results)) {
                    itemsToFlatten = (value as any).results;
                } else if (!Array.isArray(value)) {
                    itemsToFlatten = [value];
                }
                
                if (itemsToFlatten.length > 0) {
                    // Just take the first item from the expanded association
                    const firstItem = itemsToFlatten[0];
                    for (const [subKey, subVal] of Object.entries(firstItem)) {
                        if (subKey === '__metadata') continue;
                        // Avoid deep nesting
                        if (subVal !== null && typeof subVal !== 'object') {
                            flatRow[`${key}.${subKey}`] = subVal;
                        }
                    }
                }
            } else {
                flatRow[key] = value;
            }
        }
        return flatRow;
    });
};

export default function CdsViewTabs({ selectedView }: { selectedView: CdsView | null }) {
  const [activeTab, setActiveTab] = useState<"definition" | "annotations" | "crossref" | "data">("definition");
  
  // Data States
  const [liveData, setLiveData] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // UI Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [rowLimit, setRowLimit] = useState(500);

  // Metadata States
  const [metadata, setMetadata] = useState<any>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const [showGraph, setShowGraph] = useState(false);

  useEffect(() => {
      setActiveTab("definition");
      setLiveData([]);
      setDataError(null);
      setMetadata(null);
      setMetadataError(null);
      setSearchQuery("");
      setShowGraph(false);
      
      if (selectedView) {
          fetchMetadata();
      }
  }, [selectedView?.id]);

  useEffect(() => {
      // Auto-fetch data if switching to data tab and we haven't fetched yet
      if (activeTab === "data" && selectedView && liveData.length === 0 && !dataError && !isLoadingData) {
          fetchData(rowLimit);
      }
  }, [activeTab, selectedView]);

  const fetchMetadata = async () => {
      setIsLoadingMetadata(true);
      setMetadataError(null);
      try {
          const res = await fetch(`/api/sap/cds/metadata?viewId=${selectedView?.id}`);
          const json = await res.json();
          if (!res.ok) throw new Error(json.error || "Failed to fetch metadata");
          setMetadata(json);
      } catch (err: any) {
          setMetadataError(err.message);
      } finally {
          setIsLoadingMetadata(false);
      }
  };

  const fetchData = async (limit: number) => {
      setIsLoadingData(true);
      setDataError(null);
      try {
          // Determine auto-expand paths (look for Nav properties ending in Text)
          let expandParam = "";
          if (metadata && metadata.navigationProperties) {
              const textNavs = metadata.navigationProperties
                  .filter((nav: any) => nav.name.toLowerCase().includes('text'))
                  .map((nav: any) => nav.name);
              
              if (textNavs.length > 0) {
                  expandParam = textNavs.join(',');
              }
          }

          const res = await fetch(`/api/sap/cds?viewId=${selectedView?.id}&top=${limit}&expand=${expandParam}`);
          const json = await res.json();
          if (!res.ok) throw new Error(json.error || "Failed to fetch data");
          
          const flattened = flattenODataResults(json.results || []);
          setLiveData(flattened);
      } catch (err: any) {
          setDataError(err.message);
      } finally {
          setIsLoadingData(false);
      }
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newLimit = parseInt(e.target.value, 10);
      setRowLimit(newLimit);
      fetchData(newLimit);
  };

  const downloadCSV = () => {
      if (!liveData || liveData.length === 0) return;
      const headers = Object.keys(liveData[0]).filter(k => k !== '__metadata');
      const csvRows = liveData.map(row => 
          headers.map(header => `"${(row[header] !== null && row[header] !== undefined ? String(row[header]) : '').replace(/"/g, '""')}"`).join(',')
      );
      const csvString = [headers.join(','), ...csvRows].join('\\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${selectedView?.id}_export.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const graphData = useMemo(() => {
      if (!metadata || !selectedView || !metadata.navigationProperties) return null;
      const nodesMap = new Map();
      const links: any[] = [];
      
      nodesMap.set(selectedView.id, { id: selectedView.id, type: 'Root', val: 25, description: selectedView.name });

      metadata.navigationProperties.forEach((nav: any) => {
          const target = nav.toRole?.split('Type')[0] || nav.name;
          if (!nodesMap.has(target)) {
              nodesMap.set(target, { id: target, type: 'Master', val: 10, description: nav.name });
          }
          links.push({ source: selectedView.id, target: target, name: nav.relationship });
      });

      return { nodes: Array.from(nodesMap.values()), links };
  }, [metadata, selectedView]);

  const filteredData = useMemo(() => {
      if (!searchQuery) return liveData;
      const query = searchQuery.toLowerCase();
      return liveData.filter(row => {
          return Object.values(row).some(val => 
              val !== null && val !== undefined && String(val).toLowerCase().includes(query)
          );
      });
  }, [liveData, searchQuery]);

  if (!selectedView) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 h-full">
        <DatabaseZap className="w-16 h-16 mb-4 text-slate-600" />
        <h2 className="text-xl font-medium text-slate-300">No CDS View Selected</h2>
        <p className="mt-2 text-sm text-slate-500 max-w-sm text-center">Select a CDS view from the sidebar to explore its definition, cross references, and data.</p>
      </div>
    );
  }

  const tabs = [
    { id: "definition", label: "Definition", icon: TableProperties },
    { id: "annotations", label: "Annotations", icon: Tags },
    { id: "crossref", label: "Cross Reference", icon: LinkIcon },
    { id: "data", label: "Data Preview", icon: DatabaseZap },
  ] as const;

  return (
    <div className="flex flex-col h-full bg-evolver-bg-dark">
      <div className="flex-shrink-0 p-8 border-b border-white/5 bg-gradient-to-r from-indigo-900/10 to-transparent">
        <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                <DatabaseZap className="text-indigo-400 w-5 h-5" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
                {selectedView.id}
            </h1>
        </div>
        <p className="text-slate-400 text-lg ml-13 pl-1">{selectedView.name}</p>
      </div>

      <div className="flex border-b border-white/5 px-8 pt-4 space-x-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={clsx(
              "flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-all duration-300 rounded-t-lg",
              activeTab === tab.id
                ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
            )}
          >
            <tab.icon className={clsx("w-4 h-4", activeTab === tab.id ? "animate-pulse" : "")} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-8 relative">
        
        {/* Loading / Error Overlays for Metadata Tabs */}
        {activeTab !== "data" && isLoadingMetadata && (
             <div className="absolute inset-8 flex flex-col items-center justify-center z-10 bg-evolver-bg-dark/80 backdrop-blur-sm rounded-2xl">
                 <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-4" />
                 <p className="text-slate-400 font-mono animate-pulse">Extracting OData Metadata...</p>
             </div>
        )}
        {activeTab !== "data" && metadataError && !isLoadingMetadata && (
            <div className="absolute inset-8 flex items-center justify-center z-10 bg-evolver-bg-dark/80 backdrop-blur-sm rounded-2xl">
                <div className="glass-panel p-6 border-amber-500/30 text-center max-w-md">
                    <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-white mb-2">Metadata Unavailable</h3>
                    <p className="text-slate-400 text-sm">{metadataError}</p>
                </div>
            </div>
        )}

        {/* DEFINITION TAB */}
        {activeTab === "definition" && (
            <div className="h-full border border-white/10 rounded-2xl overflow-hidden bg-evolver-bg-obsidian shadow-2xl flex flex-col animate-in fade-in duration-500">
                <div className="flex-1 overflow-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead className="sticky top-0 z-10 bg-evolver-bg-obsidian border-b border-white/10 shadow-sm">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-white/5 border-r border-white/5">Column Name</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-white/5 border-r border-white/5">Description</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-white/5 border-r border-white/5">Data Type</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-white/5 border-r border-white/5">Length</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {metadata?.properties?.map((prop: any, i: number) => (
                                <tr key={i} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-3.5 text-sm font-medium text-slate-200 border-r border-white/5 group-hover:text-white">{prop.name}</td>
                                    <td className="px-6 py-3.5 text-sm text-slate-400 border-r border-white/5">{prop.description}</td>
                                    <td className="px-6 py-3.5 text-sm text-slate-400 border-r border-white/5">{prop.type}</td>
                                    <td className="px-6 py-3.5 text-sm text-slate-400 border-r border-white/5">{prop.maxLength || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* ANNOTATIONS TAB */}
        {activeTab === "annotations" && (
          <div className="h-full border border-white/10 rounded-2xl overflow-hidden bg-evolver-bg-obsidian shadow-2xl flex flex-col animate-in fade-in duration-500">
               <div className="flex-1 overflow-auto custom-scrollbar p-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {metadata?.annotations?.map((ann: any, i: number) => (
                           <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-xl hover:border-indigo-500/30 transition-colors">
                               <div className="text-xs text-indigo-400 font-mono mb-1 truncate" title={ann.term}>@{ann.term}</div>
                               <div className="text-slate-300 text-sm font-medium truncate" title={String(ann.value)}>{String(ann.value)}</div>
                           </div>
                       ))}
                   </div>
               </div>
          </div>
        )}

        {/* CROSS REFERENCE TAB */}
        {activeTab === "crossref" && (
          <div className="h-full border border-white/10 rounded-2xl overflow-hidden bg-evolver-bg-obsidian flex flex-col animate-in fade-in duration-500 shadow-2xl relative">
             <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5 z-10 relative">
                 <h3 className="text-white font-medium flex items-center gap-2">
                     Associated Entities
                 </h3>
                 <button 
                     onClick={() => setShowGraph(!showGraph)}
                     disabled={!graphData || graphData.nodes.length <= 1}
                     className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                     <LayoutGrid className="w-4 h-4" />
                     {showGraph ? "View Table" : "Visualize Graph"}
                 </button>
             </div>
             
             {showGraph ? (
                 <div className="flex-1 absolute inset-0 pt-16">
                     {graphData ? (
                         <SchemaGraph rootNode={selectedView.id} overrideData={graphData} />
                     ) : (
                         <div className="h-full flex items-center justify-center">
                             <p className="text-slate-500">No cross references found to graph.</p>
                         </div>
                     )}
                 </div>
             ) : (
                 <div className="flex-1 overflow-auto custom-scrollbar">
                    {metadata?.navigationProperties && metadata.navigationProperties.length > 0 ? (
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead className="sticky top-0 z-10 bg-evolver-bg-obsidian border-b border-white/10 shadow-sm">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-white/5 border-r border-white/5">Association Name</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-white/5 border-r border-white/5">Target Entity</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-white/5 border-r border-white/5">Relationship Type</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {metadata.navigationProperties.map((nav: any, i: number) => (
                                    <tr key={i} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-3.5 text-sm font-medium text-slate-200 border-r border-white/5 group-hover:text-white">{nav.name}</td>
                                        <td className="px-6 py-3.5 text-sm text-slate-400 border-r border-white/5">{nav.toRole?.split('Type')[0] || '-'}</td>
                                        <td className="px-6 py-3.5 text-sm text-slate-400 border-r border-white/5">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                {nav.relationship || 'Association'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="h-full flex items-center justify-center">
                             <p className="text-slate-500">No cross references defined in OData metadata.</p>
                        </div>
                    )}
                 </div>
             )}
          </div>
        )}

        {/* DATA TAB */}
        {activeTab === "data" && (
          <div className="h-full border border-white/10 rounded-2xl overflow-hidden bg-evolver-bg-obsidian flex flex-col animate-in fade-in duration-500 shadow-2xl">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5 gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                    <h3 className="text-white font-medium flex items-center gap-2">
                        Live Preview
                        {isLoadingData && <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />}
                    </h3>
                    <div className="relative group ml-4 w-64">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                        <input 
                            type="text"
                            placeholder="Filter data locally..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner"
                        />
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        <span>Limit:</span>
                        <div className="relative">
                            <select 
                                value={rowLimit} 
                                onChange={handleLimitChange}
                                disabled={isLoadingData}
                                className="appearance-none bg-black/40 border border-white/10 rounded-lg pl-3 pr-8 py-1.5 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 disabled:opacity-50 cursor-pointer"
                            >
                                <option value={50}>50 rows</option>
                                <option value={100}>100 rows</option>
                                <option value={500}>500 rows</option>
                                <option value={1000}>1000 rows</option>
                            </select>
                            <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                        </div>
                    </div>
                    <button 
                        onClick={downloadCSV}
                        disabled={isLoadingData || filteredData.length === 0}
                        className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Error / Empty States */}
            {dataError && !isLoadingData && (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-transparent to-white/5">
                   <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
                   <h3 className="text-lg font-medium text-white mb-2">Data Fetch Failed</h3>
                   <p className="text-slate-500 max-w-md mx-auto text-sm">{dataError}</p>
                </div>
            )}

            {!dataError && !isLoadingData && filteredData.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-transparent to-white/5">
                   <DatabaseZap className="w-12 h-12 text-slate-600 mb-4" />
                   <h3 className="text-lg font-medium text-white mb-2">No Records Found</h3>
                   <p className="text-slate-500 max-w-md mx-auto text-sm">
                       {searchQuery ? "No records matched your search query." : "The query returned zero records."}
                   </p>
                </div>
            )}

            {/* Grid */}
            {!dataError && filteredData.length > 0 && (
                <div className="flex-1 overflow-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead className="sticky top-0 z-10 bg-evolver-bg-obsidian border-b border-white/10 shadow-sm">
                            <tr>
                                {Object.keys(filteredData[0]).filter(k => k !== '__metadata').map((header) => (
                                    <th key={header} className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-white/5 border-r border-white/5 last:border-r-0">
                                        {header.replace(/\\./g, ' ')}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredData.map((row, i) => (
                                <tr key={i} className="hover:bg-white/5 transition-colors group">
                                    {Object.keys(row).filter(k => k !== '__metadata').map((header) => {
                                        const val = row[header];
                                        return (
                                            <td key={header} className="px-6 py-3 text-sm text-slate-300 border-r border-white/5 last:border-r-0 group-hover:text-white">
                                                {val !== null && val !== undefined ? String(val) : <span className="text-slate-600 italic">null</span>}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
