import { Blocks } from "lucide-react";

export default function BAPIsPage() {
  return (
    <div className="flex-1 w-full h-full p-8 overflow-y-auto bg-evolver-bg-dark">
      <div className="max-w-6xl mx-auto mt-24">
        <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
          <Blocks className="w-8 h-8 text-evolver-viridian" />
          BAPIs
        </h1>
        <p className="text-slate-400 mt-2 text-lg">
          Business Application Programming Interfaces.
        </p>
      </div>
    </div>
  );
}
