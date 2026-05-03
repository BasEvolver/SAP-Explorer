import { SAPSchemaTree } from "@/components/explorer/SAPSchemaTree";
import { DataPreviewGrid } from "@/components/explorer/DataPreviewGrid";
import { ExtractionPipeline } from "@/components/explorer/ExtractionPipeline";

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="mb-8">
          <h1 className="text-3xl font-black tracking-tight">SAP Explorer</h1>
          <p className="text-slate-500">Extract, Map, and Query SAP BAPIs and Tables.</p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <SAPSchemaTree />
          </div>
          <div className="md:col-span-2 space-y-6">
            <DataPreviewGrid />
            <ExtractionPipeline />
          </div>
        </div>
      </div>
    </main>
  );
}
