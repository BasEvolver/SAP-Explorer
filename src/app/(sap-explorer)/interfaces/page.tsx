import { Code2, Network, Blocks, ServerCog } from "lucide-react";

export default function InterfacesDashboard() {
  return (
    <div className="flex-1 w-full h-full p-8 overflow-y-auto bg-evolver-bg-dark">
      <div className="max-w-6xl mx-auto mt-24">
        <div className="mb-12">
          <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
            <ServerCog className="w-8 h-8 text-evolver-viridian" />
            Technical Interfaces
          </h1>
          <p className="text-slate-400 mt-2 text-lg">
            Explore APIs, Remote Function Calls, and integration points exposed by your SAP system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* BAPIs Card */}
          <div className="glass-panel p-6 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group border border-white/5 hover:border-emerald-500/50">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Blocks className="w-6 h-6 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">BAPIs</h2>
            <p className="text-slate-400 text-sm">
              Business Application Programming Interfaces. Standardized methods for business objects.
            </p>
          </div>

          {/* RFCs Card */}
          <div className="glass-panel p-6 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group border border-white/5 hover:border-blue-500/50">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Code2 className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Remote Function Calls</h2>
            <p className="text-slate-400 text-sm">
              Explore raw ABAP Function Modules that are RFC-enabled for external integration.
            </p>
          </div>

          {/* OData Services Card */}
          <div className="glass-panel p-6 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group border border-white/5 hover:border-amber-500/50">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Network className="w-6 h-6 text-amber-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">OData Services</h2>
            <p className="text-slate-400 text-sm">
              RESTful APIs exposed via SAP Gateway (SEGW) for modern web and mobile applications.
            </p>
          </div>
        </div>

        {/* Future Expansion / Details Area */}
        <div className="glass-panel p-8 rounded-3xl border border-white/5">
            <div className="text-center py-12">
                <ServerCog className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-300 mb-2">Interface Extractor Pending</h3>
                <p className="text-slate-500 max-w-md mx-auto">
                    We currently have a staging replica of the Data Dictionary. We will need to build the extractors for `TFDIR`, `SWOTDV`, and Gateway repositories to populate this view.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
