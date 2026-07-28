"use client";

import { useState, useEffect } from "react";
import { Database, Search, Trash2, ChevronLeft, ChevronRight, Loader2, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";

interface ModelInfo {
  name: string;
  count: number;
  error?: string;
}

interface FieldMeta {
  name: string;
  kind: string;
  isList: boolean;
  isRequired: boolean;
  isUnique: boolean;
  isId: boolean;
  type: string;
}

interface ModelDetails {
  model: string;
  count: number;
  page: number;
  pageSize: number;
  fields: FieldMeta[];
  records: any[];
}

export default function PrismaDatabaseStudio() {
  // Model list state
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [modelSearch, setModelSearch] = useState("");
  const [loadingModels, setLoadingModels] = useState(true);

  // Selected model state
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [modelDetails, setModelDetails] = useState<ModelDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Search within table rows
  const [rowSearch, setRowSearch] = useState("");

  // Feedback states
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<any>(null);

  // Fetch all models
  const fetchModels = async (silent = false) => {
    if (!silent) setLoadingModels(true);
    try {
      const res = await fetch("/api/db-studio");
      if (!res.ok) throw new Error("Failed to load models");
      const data = await res.json();
      setModels(data.models || []);
    } catch (e: any) {
      setError(e.message || "Could not fetch database models");
    } finally {
      setLoadingModels(false);
    }
  };

  // Fetch specific model records
  const fetchModelDetails = async (modelName: string, pageNum: number) => {
    setLoadingDetails(true);
    setError(null);
    try {
      const res = await fetch(`/api/db-studio?model=${modelName}&page=${pageNum}&pageSize=${pageSize}`);
      if (!res.ok) throw new Error(`Failed to load data for ${modelName}`);
      const data = await res.json();
      setModelDetails(data);
      setCurrentPage(data.page);
    } catch (e: any) {
      setError(e.message || `Could not fetch records for ${modelName}`);
      setModelDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  // When model selection changes
  const handleSelectModel = (modelName: string) => {
    setSelectedModel(modelName);
    setCurrentPage(1);
    setRowSearch("");
    setError(null);
    setSuccess(null);
    fetchModelDetails(modelName, 1);
  };

  // Delete row handler
  const handleDeleteRow = async (record: any) => {
    if (!selectedModel || !modelDetails) return;

    // Find the ID field
    const idField = modelDetails.fields.find(f => f.isId);
    if (!idField) {
      setError("This table does not have a unique identifier field mapped to delete records.");
      return;
    }

    const idValue = record[idField.name];
    if (idValue === undefined) {
      setError("Identifier field value not found for this record.");
      return;
    }

    if (!confirm(`Are you sure you want to delete this record from ${selectedModel}?`)) {
      return;
    }

    setDeletingId(idValue);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/db-studio", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          idField: idField.name,
          idValue
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to delete record");
      }

      setSuccess("Record deleted successfully.");
      // Refresh page details and model counts
      fetchModelDetails(selectedModel, currentPage);
      fetchModels(true);
    } catch (e: any) {
      setError(e.message || "Failed to delete record");
    } finally {
      setDeletingId(null);
    }
  };

  // Filter models list
  const filteredModels = models.filter(m => 
    m.name.toLowerCase().includes(modelSearch.toLowerCase())
  );

  // Helper to format values for display
  const renderValue = (val: any) => {
    if (val === null || val === undefined) return <span className="text-slate-500 italic">null</span>;
    if (typeof val === "boolean") {
      return (
        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${val ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
          {val ? "TRUE" : "FALSE"}
        </span>
      );
    }
    if (typeof val === "object") {
      return <span className="text-amber-400 font-mono text-xs">{JSON.stringify(val)}</span>;
    }
    return <span className="font-mono text-xs truncate max-w-xs block">{String(val)}</span>;
  };

  // Filter rows locally if needed
  const filteredRecords = modelDetails?.records.filter(r => {
    if (!rowSearch) return true;
    return Object.values(r).some(val => 
      String(val).toLowerCase().includes(rowSearch.toLowerCase())
    );
  }) || [];

  return (
    <div className="flex-1 w-full h-full flex flex-col overflow-hidden bg-slate-900 text-slate-100">
      {/* Top Banner / Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-slate-800 bg-slate-950 mt-14">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-evolver-viridian/10 flex items-center justify-center">
            <Database className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Prisma Database Studio</h1>
            <p className="text-xs text-slate-400">Live Client Data Explorer & Cache Inspector</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              fetchModels();
              if (selectedModel) fetchModelDetails(selectedModel, currentPage);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-300 text-sm font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </header>

      {/* Main Workspace split panel */}
      <div className="flex-1 w-full flex overflow-hidden">
        {/* Left Side Panel: Models List */}
        <aside className="w-64 md:w-80 border-r border-slate-800 bg-slate-950/50 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search models/tables..." 
                value={modelSearch}
                onChange={(e) => setModelSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 pl-9 pr-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2 mb-3">Database Models</h3>
            
            {loadingModels ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-500 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                <span className="text-xs">Loading database schema...</span>
              </div>
            ) : filteredModels.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                No matching models found.
              </div>
            ) : (
              filteredModels.map(m => {
                const isActive = selectedModel === m.name;
                return (
                  <button
                    key={m.name}
                    onClick={() => handleSelectModel(m.name)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between text-sm transition-all ${
                      isActive 
                        ? "bg-emerald-600/10 text-emerald-400 border-l-2 border-emerald-500 shadow-[inset_4px_0_0_0_rgba(16,185,129,0.05)]"
                        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                    }`}
                  >
                    <span className="font-semibold truncate">{m.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                      isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-850 text-slate-500"
                    }`}>
                      {m.count}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Right Area: Tables View */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-900/40">
          {/* Notifications */}
          {error && (
            <div className="mx-6 mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm font-medium">{error}</div>
            </div>
          )}
          {success && (
            <div className="mx-6 mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm font-medium">{success}</div>
            </div>
          )}

          {!selectedModel ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <Database className="w-16 h-16 text-slate-700 mb-4 stroke-1" />
              <h2 className="text-xl font-bold text-slate-300 mb-1">Select a database table</h2>
              <p className="text-slate-500 text-sm max-w-md">
                Choose one of the synced SAP models from the left sidebar to view fields, examine cached database rows, and inspect keys.
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Table Toolbar */}
              <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/20 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    {selectedModel}
                    <span className="text-xs font-normal text-slate-400">
                      ({modelDetails?.count || 0} records)
                    </span>
                  </h2>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="relative w-full md:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      type="text" 
                      placeholder="Filter visible rows..." 
                      value={rowSearch}
                      onChange={(e) => setRowSearch(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 pl-9 pr-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Loader */}
              {loadingDetails ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
                  <span className="text-sm text-slate-400">Querying {selectedModel} cache...</span>
                </div>
              ) : !modelDetails || modelDetails.records.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <span className="text-3xl">📭</span>
                  <h3 className="text-md font-bold text-slate-400 mt-3">No records found</h3>
                  <p className="text-slate-600 text-xs mt-1">This database table is currently empty.</p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Grid Container */}
                  <div className="flex-1 overflow-auto">
                    <table className="w-full border-collapse text-left text-sm text-slate-300">
                      <thead className="bg-slate-950/60 sticky top-0 z-10 border-b border-slate-800 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-3 bg-slate-950/80">Actions</th>
                          {modelDetails.fields.map(f => (
                            <th key={f.name} className="px-6 py-3 whitespace-nowrap bg-slate-950/80 font-semibold">
                              <div className="flex flex-col">
                                <span>{f.name}</span>
                                <span className="text-[10px] text-slate-600 font-mono font-normal normal-case">
                                  {f.type}{f.isId && " 🔑"}{f.isRequired && "*"}
                                </span>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {filteredRecords.map((record, idx) => {
                          const idField = modelDetails.fields.find(f => f.isId);
                          const idValue = idField ? record[idField.name] : idx;
                          
                          return (
                            <tr key={idx} className="hover:bg-slate-800/20 transition-colors">
                              <td className="px-6 py-3 whitespace-nowrap">
                                <button
                                  onClick={() => handleDeleteRow(record)}
                                  disabled={deletingId !== null}
                                  className="text-slate-500 hover:text-rose-400 p-1.5 rounded bg-slate-850 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/20 transition-all flex items-center justify-center disabled:opacity-30"
                                  title="Delete record"
                                >
                                  {deletingId === idValue ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </td>
                              {modelDetails.fields.map(f => (
                                <td key={f.name} className="px-6 py-3 whitespace-nowrap border-r border-slate-800/40">
                                  {renderValue(record[f.name])}
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Footer */}
                  <footer className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
                    <div className="text-xs text-slate-400 font-medium">
                      Showing <span className="text-slate-200">{filteredRecords.length}</span> rows on this page (out of <span className="text-slate-200">{modelDetails.count}</span> total records)
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-xs text-slate-400 font-medium">
                        Page <span className="text-slate-200">{currentPage}</span> of <span className="text-slate-200">{Math.ceil(modelDetails.count / pageSize) || 1}</span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => fetchModelDetails(selectedModel, currentPage - 1)}
                          disabled={currentPage === 1 || loadingDetails}
                          className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-300 disabled:opacity-40 disabled:hover:bg-slate-800 transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => fetchModelDetails(selectedModel, currentPage + 1)}
                          disabled={currentPage >= Math.ceil(modelDetails.count / pageSize) || loadingDetails}
                          className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-300 disabled:opacity-40 disabled:hover:bg-slate-800 transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </footer>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
