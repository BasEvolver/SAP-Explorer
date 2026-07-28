"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Database, Search, Loader2, AlertCircle, Key, Hash } from "lucide-react";

function DictionaryContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') || "";
  
  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tableData, setTableData] = useState<any>(null);

  const performSearch = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setTableData(null);
    try {
      const res = await fetch(`/api/sap/dictionary?table=${query.trim()}`);
      if (!res.ok) throw new Error("Failed to fetch table data. Make sure you have synced DD03L.");
      const data = await res.json();
      setTableData(data);
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

  return (
    <div className="flex-1 w-full h-full p-8 overflow-y-auto bg-evolver-bg-dark text-slate-200">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/50 p-6 rounded-2xl border border-white/5 shadow-lg backdrop-blur-xl">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
              <Database className="w-8 h-8 text-evolver-viridian" />
              Data Dictionary
            </h1>
            <p className="text-slate-400 mt-2">Search and inspect SAP table fields.</p>
          </div>
          
          <form onSubmit={handleSearch} className="relative w-full md:w-96 group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-evolver-viridian group-focus-within:animate-pulse" />
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Table (e.g., MARA)..."
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-evolver-viridian/50 transition-all shadow-inner"
            />
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-evolver-viridian animate-spin" />
            <p className="mt-4 text-slate-400 font-mono animate-pulse">Querying Database...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="glass-panel p-6 rounded-2xl flex items-start gap-4 border-red-500/30 bg-red-500/5">
            <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-lg text-red-400">Search Failed</h3>
              <p className="mt-2 text-slate-300">{error}</p>
            </div>
          </div>
        )}

        {/* Curated Discover Section */}
        {!searchQuery && !tableData && !loading && (
          <div className="space-y-8 mt-4">
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                <div className="w-2 h-6 bg-evolver-viridian rounded-full"></div>
                Core SAP Tables
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { id: 'MARA', desc: 'Material Master Data' },
                  { id: 'KNA1', desc: 'General Customer Master' },
                  { id: 'VBAK', desc: 'Sales Document Header' },
                  { id: 'EKKO', desc: 'Purchasing Document Header' },
                  { id: 'BKPF', desc: 'Accounting Document Header' },
                  { id: 'LFA1', desc: 'Vendor Master (General Section)' }
                ].map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => {
                        setSearchQuery(item.id);
                        handleSearch({ preventDefault: () => {} } as any);
                    }} 
                    className="glass-panel p-5 rounded-xl cursor-pointer hover:border-evolver-viridian/50 transition-colors group"
                  >
                    <h3 className="font-bold text-white font-mono text-xl group-hover:text-evolver-viridian">{item.id}</h3>
                    <p className="text-sm text-slate-400 mt-2">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {tableData && !loading && (
          <div className="space-y-6">
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 shadow-lg backdrop-blur-xl flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white tracking-tight">{tableData.tableName}</h2>
                    <span className="px-3 py-1 bg-evolver-viridian/20 text-evolver-viridian-light rounded-full text-xs font-bold tracking-wider uppercase border border-evolver-viridian/30">
                        {tableData.tabClass}
                    </span>
                </div>
                <p className="text-slate-300 text-lg">{tableData.description || "No description available."}</p>
                <div className="text-sm text-slate-500 mt-2 font-mono flex items-center gap-2">
                    <Hash className="w-4 h-4" /> {tableData.fields?.length || 0} Fields found
                </div>
            </div>

            {tableData.fields && tableData.fields.length > 0 ? (
                <div className="bg-slate-900/50 border border-white/5 shadow-lg backdrop-blur-xl rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-black/20 text-slate-400 text-sm uppercase tracking-wider">
                                    <th className="p-4 font-semibold">Pos</th>
                                    <th className="p-4 font-semibold">Key</th>
                                    <th className="p-4 font-semibold">Field Name</th>
                                    <th className="p-4 font-semibold">Version</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {tableData.fields.map((field: any, idx: number) => (
                                    <tr key={`${field.FIELDNAME}-${idx}`} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 text-slate-500 font-mono text-sm">{field.POSITION?.padStart(4, '0')}</td>
                                        <td className="p-4">
                                            {field.KEYFLAG === 'X' && (
                                                <span title="Primary Key">
                                                    <Key className="w-4 h-4 text-amber-500" />
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 font-medium text-slate-200 font-mono">{field.FIELDNAME}</td>
                                        <td className="p-4 text-slate-500 text-sm">{field.AS4VERS}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-white/5 border-dashed">
                    <Database className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No fields found for this table.</p>
                    <p className="text-slate-500 text-sm mt-2">Have you run the core extraction sync?</p>
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DictionaryPage() {
    return (
        <Suspense fallback={<div className="p-8 text-white">Loading dictionary...</div>}>
            <DictionaryContent />
        </Suspense>
    );
}
