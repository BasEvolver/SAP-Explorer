"use client";

import { useState } from "react";
import { Plug, Search, Loader2, AlertCircle, TerminalSquare } from "lucide-react";

export default function RFCsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rfcs, setRfcs] = useState<any[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    setRfcs([]);

    try {
      const res = await fetch(`/api/sap/rfcs?search=${searchQuery.trim()}`);
      if (!res.ok) throw new Error("Search failed. Did you extract TFDIR?");
      const data = await res.json();
      setRfcs(data);
      if (data.length === 0) setError("No Remote-Enabled Function Modules (RFCs) found.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full h-full p-8 overflow-y-auto bg-evolver-bg-dark text-slate-200">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/50 p-6 rounded-2xl border border-white/5 shadow-lg backdrop-blur-xl">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
              <Plug className="w-8 h-8 text-evolver-viridian" />
              RFC Explorer
            </h1>
            <p className="text-slate-400 mt-2">Discover Remote-Enabled Function Modules.</p>
          </div>
          
          <form onSubmit={handleSearch} className="relative w-full md:w-96 group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-evolver-viridian group-focus-within:animate-pulse" />
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search RFC (e.g., BAPI_USER)..."
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-evolver-viridian/50 transition-all shadow-inner"
            />
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-evolver-viridian animate-spin" />
            <p className="mt-4 text-slate-400 font-mono animate-pulse">Scanning Directory...</p>
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

        {/* Results */}
        {rfcs.length > 0 && !loading && (
          <div className="bg-slate-900/50 border border-white/5 shadow-lg backdrop-blur-xl rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-white/5 bg-black/20 flex justify-between items-center">
                  <h3 className="font-semibold text-slate-300">Function Modules</h3>
                  <span className="text-xs text-slate-500 font-mono">{rfcs.length} Results</span>
              </div>
              <div className="divide-y divide-white/5">
                  {rfcs.map((rfc) => (
                      <div key={rfc.FUNCNAME} className="p-6 hover:bg-white/5 transition-colors">
                          <div className="flex items-start justify-between">
                              <div className="flex gap-4">
                                  <div className="mt-1">
                                      <TerminalSquare className="w-6 h-6 text-evolver-viridian" />
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-lg text-white font-mono tracking-tight">{rfc.FUNCNAME}</h4>
                                      <p className="text-slate-400 mt-1">{rfc.description || "No description available"}</p>
                                      <div className="flex gap-3 mt-3">
                                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                              Remote-Enabled (RFC)
                                          </span>
                                          {rfc.PNAME && (
                                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-white/5 text-slate-400 border border-white/10">
                                                  Group: {rfc.PNAME}
                                              </span>
                                          )}
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
        )}
      </div>
    </div>
  );
}
