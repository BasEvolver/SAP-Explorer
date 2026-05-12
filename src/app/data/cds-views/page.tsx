"use client";

import { useState } from "react";
import CdsViewTabs from "@/components/explorer/cds/CdsViewTabs";
import { DatabaseZap, Search, ChevronDown, ChevronRight, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import clsx from "clsx";

import { sapModules } from "@/lib/sap-modules";

export default function CdsViewsExplorer() {
  const [selectedViewId, setSelectedViewId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    "Finance & Controlling (FI/CO)": false,
    "Tax & Compliance": true,
    "Sales & Distribution (SD)": false,
    "Materials Management (MM)": false,
    "Production & Projects": false,
    "Human Resources (HCM)": false
  });
  
  const [expandedSubmodules, setExpandedSubmodules] = useState<Record<string, boolean>>({
    "General Ledger": false,
    "Accounts Payable": false,
    "Accounts Receivable": false,
    "Sales & Use Tax": true,
    "VAT Registers": false,
    "Withholding Tax": false,
    "Property Tax (Pending)": false,
    "Exemptions (Pending)": false,
    "Customs & Trade (Pending)": false,
    "Sales Processing": false,
    "Purchasing & Inventory": false,
    "Manufacturing": false,
    "Workforce": false
  });

  const toggleModule = (mod: string) => {
    setExpandedModules(prev => ({ ...prev, [mod]: !prev[mod] }));
  };

  const toggleSubmodule = (cat: string) => {
    setExpandedSubmodules(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const selectedView = sapModules
    .flatMap(m => m.submodules)
    .flatMap(c => c.views)
    .find(v => v.id === selectedViewId) || null;

  return (
    <div className="flex h-full w-full overflow-hidden bg-evolver-bg-dark">
      {/* Left Sidebar - View List */}
      <div className={clsx(
        "flex-shrink-0 border-r border-white/5 bg-black/20 flex flex-col h-full backdrop-blur-md z-10 transition-all duration-300",
        isSidebarCollapsed ? "w-16 items-center" : "w-80"
      )}>
        <div className={clsx("p-6 border-b border-white/5 bg-gradient-to-b from-indigo-900/10 to-transparent flex flex-col", isSidebarCollapsed ? "items-center px-2" : "")}>
          <div className={clsx("flex items-center justify-between mb-6", isSidebarCollapsed ? "flex-col gap-4" : "")}>
            <h2 className={clsx("font-bold text-white flex items-center gap-3", isSidebarCollapsed ? "hidden" : "text-xl")}>
              <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
                  <DatabaseZap className="w-5 h-5 text-indigo-400" />
              </div>
              CDS Views
            </h2>
            {isSidebarCollapsed && (
                <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30 mt-2 mb-2">
                    <DatabaseZap className="w-5 h-5 text-indigo-400" />
                </div>
            )}
            <button 
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="text-slate-500 hover:text-white transition-colors"
            >
                {isSidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>
          </div>
          
          {!isSidebarCollapsed && (
              <div className="relative group">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type="text"
                  placeholder="Search views..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner"
                />
              </div>
          )}
          {isSidebarCollapsed && (
              <div className="p-2 bg-black/40 border border-white/10 rounded-xl flex items-center justify-center cursor-pointer hover:border-indigo-500/50 transition-colors" onClick={() => setIsSidebarCollapsed(false)}>
                  <Search className="w-4 h-4 text-slate-500" />
              </div>
          )}
        </div>

        <div className={clsx("flex-1 overflow-y-auto space-y-3 custom-scrollbar", isSidebarCollapsed ? "p-2" : "p-4")}>
          {sapModules.map((sapMod) => {
            // Check if module has any views matching search
            const matchingSubmodules = sapMod.submodules.map(sub => ({
                ...sub,
                views: sub.views.filter(v => 
                    v.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    v.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
            })).filter(sub => sub.views.length > 0);

            if (matchingSubmodules.length === 0) return null;

            const isModExpanded = expandedModules[sapMod.module] || searchQuery.length > 0;

            return (
              <div key={sapMod.module} className="animate-in fade-in duration-500 bg-black/20 rounded-2xl border border-white/5 overflow-hidden">
                {!isSidebarCollapsed ? (
                    <button 
                        onClick={() => toggleModule(sapMod.module)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 transition-colors group"
                    >
                        <h3 className="text-sm font-bold text-white tracking-wide group-hover:text-indigo-300 transition-colors">
                            {sapMod.module}
                        </h3>
                        {isModExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                    </button>
                ) : (
                    <div className="flex justify-center py-3 bg-white/5 border-b border-white/5" title={sapMod.module}>
                        <DatabaseZap className="w-5 h-5 text-indigo-400/80" />
                    </div>
                )}
                
                {(isModExpanded || isSidebarCollapsed) && (
                    <div className={clsx("p-2 space-y-2")}>
                      {matchingSubmodules.map((subMod) => {
                          const isSubExpanded = expandedSubmodules[subMod.category] || searchQuery.length > 0;
                          
                          return (
                              <div key={subMod.category} className="rounded-xl overflow-hidden border border-white/5">
                                 {!isSidebarCollapsed ? (
                                    <button 
                                        onClick={() => toggleSubmodule(subMod.category)}
                                        className="w-full flex items-center justify-between px-3 py-2 bg-black/40 hover:bg-black/60 transition-colors group"
                                    >
                                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest group-hover:text-slate-300">
                                            {subMod.category}
                                        </h4>
                                        {isSubExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                                    </button>
                                 ) : (
                                    <div className="flex justify-center py-2 bg-black/40 border-b border-white/5" title={subMod.category}>
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
                                    </div>
                                 )}
                                 
                                 {(isSubExpanded || isSidebarCollapsed) && (
                                     <div className={clsx("space-y-1 py-1.5", isSidebarCollapsed ? "px-0" : "px-1.5 bg-black/20")}>
                                          {subMod.views.map((view) => {
                                            const isSelected = selectedViewId === view.id;
                                            return (
                                            <button
                                              key={view.id}
                                              onClick={() => setSelectedViewId(view.id)}
                                              className={clsx(
                                                "w-full text-left rounded-lg transition-all duration-300 group relative overflow-hidden flex items-center",
                                                isSidebarCollapsed ? "justify-center p-3" : "px-3 py-2.5",
                                                isSelected
                                                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                                                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent"
                                              )}
                                              title={isSidebarCollapsed ? `${view.id} - ${view.name}` : undefined}
                                            >
                                              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                                              
                                              {isSidebarCollapsed ? (
                                                  <span className="font-semibold text-[10px] tracking-tighter truncate w-full text-center relative z-10">{view.id.substring(2, 4)}</span>
                                              ) : (
                                                  <div className="w-full">
                                                      <div className="font-medium text-sm truncate relative z-10">{view.name}</div>
                                                      <div className={clsx(
                                                        "text-[10px] mt-0.5 truncate relative z-10 transition-colors duration-300 font-mono",
                                                        isSelected ? "text-indigo-300/80" : "text-slate-500 group-hover:text-slate-400"
                                                      )}>
                                                        {view.id}
                                                      </div>
                                                  </div>
                                              )}
                                            </button>
                                          )})}
                                     </div>
                                 )}
                              </div>
                          );
                      })}
                    </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden h-full">
        <CdsViewTabs selectedView={selectedView} />
      </div>
    </div>
  );
}
