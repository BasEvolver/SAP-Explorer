'use client';

import { useState } from 'react';
import { Database, Search, Loader2, AlertCircle } from 'lucide-react';

const SAP_ENTITIES = [
    { id: 'API_GLACCOUNTINCHARTOFACCOUNTS_SRV/A_GLAccountInChartOfAccounts', name: 'G/L Master Data (SKA1)' },
    { id: 'C_TRIALBALANCE_CDS/Results', name: 'Trial Balance (ACDOCA)' },
    { id: 'API_BUSINESS_PARTNER/A_BusinessPartner', name: 'Business Partners (KNA1)' },
    { id: 'API_PRODUCT_SRV/A_Product', name: 'Material Master (MARA)' }
];

export function DataPreviewGrid() {
    const [apiPath, setApiPath] = useState(SAP_ENTITIES[0].id);
    const [filter, setFilter] = useState('&$top=20');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<any>(null);

    const handleExtract = async () => {
        setLoading(true);
        setError(null);
        setData(null);

        try {
            const response = await fetch('/api/sap/tables', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiPath, filter })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to fetch data');
            }

            const result = await response.json();
            setData(result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Database className="w-5 h-5 text-blue-500" />
                        Data Browser
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">SE16 Proxy to SAP CAL OData</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Target Entity</label>
                    <select 
                        value={apiPath}
                        onChange={(e) => setApiPath(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    >
                        {SAP_ENTITIES.map(entity => (
                            <option key={entity.id} value={entity.id}>{entity.name}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">OData Filter</label>
                    <input 
                        type="text" 
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        placeholder="e.g. &$top=50"
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                </div>
                
                <button 
                    onClick={handleExtract}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-sm shadow-blue-500/20"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                    {loading ? 'Extracting...' : 'Extract Data'}
                </button>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="text-sm">{error}</p>
                </div>
            )}

            <div className="flex-1 bg-slate-900 rounded-xl overflow-hidden flex flex-col border border-slate-800 shadow-inner min-h-[300px]">
                <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex justify-between items-center text-xs text-slate-400 font-mono">
                    <span>JSON Output</span>
                    {data && data.d && data.d.results && <span>{data.d.results.length} records</span>}
                </div>
                <div className="p-4 overflow-y-auto max-h-[500px] text-sm font-mono text-emerald-400 whitespace-pre">
                    {data ? JSON.stringify(data, null, 2) : (
                        <span className="text-slate-600 italic">Ready to fetch data from SAP...</span>
                    )}
                </div>
            </div>
        </div>
    );
}
