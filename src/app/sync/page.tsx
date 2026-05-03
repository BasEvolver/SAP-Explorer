"use client";

import { useState, useEffect } from "react";
import { Database, RefreshCw, Server, AlertCircle, CheckCircle2 } from "lucide-react";

export default function SyncDashboard() {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState({ tables: 0, relationships: 0 });
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/sync');
      const data = await res.json();
      if (data.logs) setLogs(data.logs);
      if (data.stats) setStats(data.stats);
      if (data.configs) setConfigs(data.configs);
      
      // Check if actively syncing
      const isRunning = data.logs.some((l: any) => l.status === 'RUNNING');
      setSyncing(isRunning);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const triggerFullLoad = async () => {
    setSyncing(true);
    try {
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'FULL_LOAD' })
      });
      fetchStatus();
    } catch (err) {
      console.error(err);
      setSyncing(false);
    }
  };

  const toggleStrategy = async (id: string, currentStrategy: string) => {
    const newStrategy = currentStrategy === 'REPLICATED' ? 'ON_DEMAND' : 'REPLICATED';
    // Optimistic update
    setConfigs(configs.map(c => c.id === id ? { ...c, strategy: newStrategy } : c));
    try {
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'UPDATE_STRATEGY', id, strategy: newStrategy })
      });
    } catch (err) {
      console.error(err);
      fetchStatus(); // Revert on failure
    }
  };

  const toggleEnable = async (id: string, currentEnabled: boolean) => {
    const newEnabled = !currentEnabled;
    // Optimistic update
    setConfigs(configs.map(c => c.id === id ? { ...c, isEnabled: newEnabled } : c));
    try {
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'TOGGLE_ENABLE', id, isEnabled: newEnabled })
      });
    } catch (err) {
      console.error(err);
      fetchStatus(); // Revert on failure
    }
  };

  const groupedConfigs = configs.reduce((acc, config) => {
    if (!acc[config.category]) acc[config.category] = [];
    acc[config.category].push(config);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="flex-1 w-full h-full p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto mt-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Database className="w-8 h-8 text-evolver-viridian" />
              S/4HANA Cache Engine
            </h1>
            <p className="text-slate-400 mt-2">Manage local PostgreSQL replicas of SAP Data Dictionary metadata.</p>
          </div>
          
          <button 
            onClick={triggerFullLoad}
            disabled={syncing}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                syncing 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-evolver-viridian hover:bg-emerald-600 text-white shadow-[0_0_20px_rgba(64,130,109,0.3)]'
            }`}
          >
            <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Extraction in Progress...' : 'Trigger Full Load (DDIC)'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-evolver-blue">
            <h3 className="text-slate-400 font-semibold mb-2">Cached Tables (DD02L)</h3>
            <p className="text-4xl font-mono text-white">{stats.tables.toLocaleString()}</p>
          </div>
          <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-evolver-viridian">
            <h3 className="text-slate-400 font-semibold mb-2">Cached Relationships (DD08L)</h3>
            <p className="text-4xl font-mono text-white">{stats.relationships.toLocaleString()}</p>
          </div>
        </div>

        {/* Object Strategy Configuration */}
        <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Object Replication Strategy</h2>
            
            {Object.keys(groupedConfigs).length === 0 ? (
                <div className="glass-panel p-8 text-center text-slate-500 rounded-2xl">Loading configurations...</div>
            ) : (
                <div className="space-y-6">
                    {(Object.entries(groupedConfigs) as [string, any[]][]).map(([category, items]) => {
                        const replicatedCount = items.filter(i => i.strategy === 'REPLICATED').length;
                        return (
                        <div key={category} className="glass-panel rounded-2xl overflow-hidden">
                            <div className="bg-black/20 px-6 py-4 border-b border-white/5 flex items-center justify-between">
                                <h3 className="font-semibold text-slate-200">{category}</h3>
                                <span className="text-xs font-medium text-slate-400 bg-white/5 px-2.5 py-1 rounded-full">{replicatedCount} Replicated / {items.length} Total</span>
                            </div>
                            <table className="w-full text-left">
                                <thead className="border-b border-white/5 text-xs text-slate-400">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Object ID</th>
                                        <th className="px-6 py-3 font-medium">Current Status</th>
                                        <th className="px-6 py-3 font-medium text-right">Sync Strategy</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {items.map((config) => (
                                        <tr key={config.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-mono font-bold text-slate-200">{config.id}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button 
                                                    onClick={() => toggleEnable(config.id, config.isEnabled)}
                                                    className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded border transition-colors ${
                                                        config.isEnabled 
                                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20' 
                                                        : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-700'
                                                    }`}
                                                >
                                                    <div className={`w-1.5 h-1.5 rounded-full ${config.isEnabled ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-500'}`} />
                                                    {config.isEnabled ? 'Sync Active' : 'Sync Paused'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button 
                                                    onClick={() => toggleStrategy(config.id, config.strategy)}
                                                    className={`text-xs px-3 py-1.5 rounded font-medium border transition-colors ${
                                                        config.strategy === 'REPLICATED' 
                                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20' 
                                                        : 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
                                                    }`}
                                                >
                                                    {config.strategy === 'REPLICATED' ? 'Replicated' : 'On-Demand'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        );
                    })}
                </div>
            )}
        </div>

        <h2 className="text-xl font-bold mb-4">Sync History</h2>
        <div className="glass-panel rounded-2xl overflow-hidden">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No sync history available. Trigger a load to begin.</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-black/20 border-b border-white/5">
                <tr>
                  <th className="p-4 font-semibold text-slate-300">Job Target</th>
                  <th className="p-4 font-semibold text-slate-300">Status</th>
                  <th className="p-4 font-semibold text-slate-300">Records Processed</th>
                  <th className="p-4 font-semibold text-slate-300">Duration</th>
                  <th className="p-4 font-semibold text-slate-300">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-mono text-sm">{log.entityType}</td>
                    <td className="p-4">
                      {log.status === 'COMPLETED' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CheckCircle2 className="w-3.5 h-3.5" /> Success</span>}
                      {log.status === 'RUNNING' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> In Progress</span>}
                      {log.status === 'FAILED' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20"><AlertCircle className="w-3.5 h-3.5" /> Failed</span>}
                    </td>
                    <td className="p-4 font-mono text-sm">{log.records.toLocaleString()}</td>
                    <td className="p-4 text-sm text-slate-400">
                        {new Date(log.startedAt).toLocaleTimeString()}
                    </td>
                    <td className="p-4 text-sm text-slate-400 truncate max-w-xs" title={log.message || ''}>
                        {log.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
