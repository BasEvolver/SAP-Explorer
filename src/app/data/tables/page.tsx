import { Table } from "lucide-react";

export default function TablesPage() {
  return (
    <div className="flex-1 w-full h-full p-8 overflow-y-auto bg-evolver-bg-dark">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
          <Table className="w-8 h-8 text-evolver-viridian" />
          Transparent Tables
        </h1>
        <p className="text-slate-400 mt-2 text-lg">
          Browse and explore standard transparent database tables.
        </p>
      </div>
    </div>
  );
}
