import { Database, Table, Layers, FileDigit, DatabaseZap } from "lucide-react";
import Link from "next/link";

export default function DataDashboard() {
  return (
    <div className="flex-1 w-full h-full p-8 overflow-y-auto bg-evolver-bg-dark">
      <div className="max-w-6xl mx-auto mt-24">
        <div className="mb-12">
          <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
            <Database className="w-8 h-8 text-evolver-viridian" />
            Data Objects
          </h1>
          <p className="text-slate-400 mt-2 text-lg">
            Explore core SAP data structures, logical groupings, and raw tables directly from the Data Dictionary.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
          {/* Data Dictionary Card */}
          <Link href="/data/dictionary" className="glass-panel p-6 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group border border-white/5 hover:border-evolver-viridian/50 block">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileDigit className="w-6 h-6 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Data Dictionary (DDIC)</h2>
            <p className="text-slate-400 text-sm">
              Explore domains, data elements, structures, and table types that define the SAP foundation.
            </p>
          </Link>

          {/* Tables Card */}
          <Link href="/data/tables" className="glass-panel p-6 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group border border-white/5 hover:border-blue-500/50 block">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Table className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Transparent Tables</h2>
            <p className="text-slate-400 text-sm">
              Direct access to database tables (e.g. MARA, EKKO) and their fields, foreign keys, and indexes.
            </p>
          </Link>

          {/* Logical DBs Card */}
          <Link href="/data/logical-dbs" className="glass-panel p-6 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group border border-white/5 hover:border-amber-500/50 block">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6 text-amber-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Logical Databases</h2>
            <p className="text-slate-400 text-sm">
              View hierarchical data retrieval structures used by classical ABAP reports and queries.
            </p>
          </Link>

          {/* CDS Views Card */}
          <Link href="/data/cds-views" className="glass-panel p-6 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group border border-white/5 hover:border-indigo-500/50 block">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <DatabaseZap className="w-6 h-6 text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Core Data Services</h2>
            <p className="text-slate-400 text-sm">
              Explore semantic models, standard CDS views, annotations, and underlying database relations.
            </p>
          </Link>

          {/* Prisma Database UI Card */}
          <Link href="/data/database" className="glass-panel p-6 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group border border-white/5 hover:border-emerald-500/50 block">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Database className="w-6 h-6 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Prisma Database UI</h2>
            <p className="text-slate-400 text-sm">
              Live explorer and browser to read, filter, inspect schema, and manage cached tables.
            </p>
          </Link>
        </div>

        {/* Future Expansion / Details Area */}
        <div className="glass-panel p-8 rounded-3xl border border-white/5">
            <div className="text-center py-12">
                <Database className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-300 mb-2">Select a Category to Explore</h3>
                <p className="text-slate-500 max-w-md mx-auto">
                    Click on one of the categories above to view the metadata and actual data housed within your SAP instance.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
