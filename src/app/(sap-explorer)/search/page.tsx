"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Loader2, Database, AlertCircle, ServerCog, Table } from "lucide-react";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{tables: any[], ldbs: any[]}>({ tables: [], ldbs: [] });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/sap/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error("Search failed.");
        const data = await res.json();
        setResults(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <div className="flex-1 w-full h-full p-8 overflow-y-auto bg-evolver-bg-dark text-slate-200">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <Search className="w-8 h-8 text-evolver-viridian" />
          <h1 className="text-3xl font-bold text-white">Global Search</h1>
        </div>
        <p className="text-slate-400">Showing results for: <span className="text-white font-mono font-bold">"{query}"</span></p>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-evolver-viridian animate-spin" />
          </div>
        )}

        {error && (
          <div className="glass-panel p-6 rounded-2xl flex items-start gap-4 border-amber-500/30 bg-amber-500/5">
            <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
            <p className="text-amber-400">{error}</p>
          </div>
        )}

        {!loading && !error && results.tables.length === 0 && results.ldbs.length === 0 && (
          <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-white/5 border-dashed">
            <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No matching SAP entities found.</p>
          </div>
        )}

        {/* Tables Section */}
        {!loading && results.tables.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Table className="w-5 h-5 text-evolver-blue" />
              Transparent Tables
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.tables.map((t) => (
                <div 
                  key={t.TABNAME} 
                  onClick={() => router.push(`/data/dictionary?q=${t.TABNAME}`)}
                  className="glass-panel p-4 rounded-xl cursor-pointer hover:border-evolver-blue/50 transition-colors group"
                >
                  <h3 className="font-bold text-white font-mono group-hover:text-evolver-blue">{t.TABNAME}</h3>
                  <p className="text-sm text-slate-400 truncate mt-1">{t.DDTEXT || "No description"}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LDB Section */}
        {!loading && results.ldbs.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 mt-8">
              <ServerCog className="w-5 h-5 text-evolver-viridian" />
              Logical Databases
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.ldbs.map((l) => (
                <div 
                  key={l.LDBNAME} 
                  onClick={() => router.push(`/data/logical-dbs?q=${l.LDBNAME}`)}
                  className="glass-panel p-4 rounded-xl cursor-pointer hover:border-evolver-viridian/50 transition-colors group"
                >
                  <h3 className="font-bold text-white font-mono group-hover:text-evolver-viridian">{l.LDBNAME}</h3>
                  <p className="text-sm text-slate-400 truncate mt-1">{l.LDBTEXT || "No description"}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="p-8 text-white">Loading search...</div>}>
            <SearchContent />
        </Suspense>
    )
}
