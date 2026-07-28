import { Network } from "lucide-react";

export default function ODataPage() {
  return (
    <div className="flex-1 w-full h-full p-8 overflow-y-auto bg-evolver-bg-dark">
      <div className="max-w-6xl mx-auto mt-24">
        <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
          <Network className="w-8 h-8 text-evolver-viridian" />
          OData Services
        </h1>
        <p className="text-slate-400 mt-2 text-lg">
          RESTful APIs exposed via SAP Gateway (SEGW).
        </p>
      </div>
    </div>
  );
}
