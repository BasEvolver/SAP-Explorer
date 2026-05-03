import { Download, Filter, Columns, RefreshCw } from "lucide-react";

export default function GridPage() {
  const dummyData = [
    { table: "VBAK", type: "Sales Document: Header", count: "1,204,551", lastUpdated: "2 mins ago", status: "Active" },
    { table: "MARA", type: "General Material Data", count: "450,112", lastUpdated: "5 mins ago", status: "Active" },
    { table: "EKKO", type: "Purchasing Document Header", count: "890,223", lastUpdated: "12 mins ago", status: "Syncing" },
    { table: "BSEG", type: "Accounting Document Segment", count: "15,400,998", lastUpdated: "1 hour ago", status: "Archived" },
    { table: "KNA1", type: "General Data in Customer Master", count: "55,210", lastUpdated: "Just now", status: "Active" },
  ];

  return (
    <div className="w-full h-full flex flex-col p-8 space-y-6 pt-24 overflow-y-auto">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Data Grid</h1>
          <p className="text-slate-400 mt-1">High-performance exploration of tabular metadata.</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 rounded-lg glass-panel hover:bg-white/10 transition-colors text-sm font-medium">
            <Filter className="w-4 h-4 text-evolver-viridian" />
            <span>Filter</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 rounded-lg glass-panel hover:bg-white/10 transition-colors text-sm font-medium">
            <Columns className="w-4 h-4 text-evolver-blue" />
            <span>Columns</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-evolver-viridian text-white hover:bg-evolver-viridian-light transition-colors text-sm font-medium shadow-[0_0_15px_rgba(64,130,109,0.4)]">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="flex-1 glass-panel rounded-2xl overflow-hidden flex flex-col border-white/5">
        <div className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-white/5 bg-white/5 text-xs font-semibold text-slate-300 uppercase tracking-wider">
          <div>Table ID</div>
          <div className="col-span-2">Description</div>
          <div>Record Count</div>
          <div>Status</div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {dummyData.map((row, i) => (
            <div key={i} className="grid grid-cols-5 gap-4 px-4 py-4 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
              <div className="flex items-center font-mono text-evolver-viridian-light font-medium">
                {row.table}
              </div>
              <div className="col-span-2 flex items-center text-slate-200">
                {row.type}
              </div>
              <div className="flex items-center text-slate-400 font-mono text-sm">
                {row.count}
              </div>
              <div className="flex items-center">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                  row.status === 'Active' 
                    ? 'bg-evolver-viridian/10 text-evolver-viridian border-evolver-viridian/20' 
                    : row.status === 'Syncing'
                    ? 'bg-evolver-blue/10 text-blue-400 border-evolver-blue/20'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {row.status}
                </span>
                <RefreshCw className="w-3 h-3 text-slate-600 ml-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
