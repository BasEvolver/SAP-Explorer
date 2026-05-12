"use client";

import { useState } from "react";
import CdsViewTabs from "@/components/explorer/cds/CdsViewTabs";
import { DatabaseZap, Search, ChevronDown, ChevronRight, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import clsx from "clsx";

const cdsCategories = [
  {
    category: "General Ledger",
    views: [
      { id: "I_GLAccountInChartOfAccounts", name: "G/L Account in Chart of Accounts", description: "Master data for General Ledger Accounts.", category: "Master Data" },
      { id: "I_ProfitCenter", name: "Profit Center", description: "Master data for Profit Centers.", category: "Master Data" },
      { id: "I_CostCenter", name: "Cost Center", description: "Master data for Cost Centers.", category: "Master Data" },
      { id: "I_JournalEntry", name: "Journal Entry Header", description: "Financial Posting Header.", category: "Transaction Data" },
      { id: "I_JournalEntryItem", name: "Journal Entry Line Item", description: "Financial Posting line items.", category: "Transaction Data" },
    ]
  },
  {
    category: "Accounts Payable",
    views: [
      { id: "I_Supplier", name: "Supplier master data", description: "Master data for Suppliers (vendors).", category: "Master Data" },
      { id: "I_SupplierLineItem", name: "Supplier (vendor) line items", description: "Vendor Open/closed Items.", category: "Transaction Data" },
      { id: "I_SupplierInvoice", name: "Supplier Invoice Header", description: "Vendor Invoice Header.", category: "Transaction Data" },
      { id: "I_SupplierInvoiceItem", name: "Supplier Invoice Line Item", description: "Vendor Invoice Line item.", category: "Transaction Data" },
    ]
  },
  {
    category: "Accounts Receivable",
    views: [
      { id: "I_Customer", name: "Customer master data", description: "Master Data for Customers.", category: "Master Data" },
      { id: "I_CustomerLineItem", name: "Customer line items", description: "Customer open/closed Items.", category: "Transaction Data" },
      { id: "I_BillingDocument", name: "Billing Document Header", description: "Customer Invoice header.", category: "Transaction Data" },
      { id: "I_BillingDocumentItem", name: "Billing Document Line Item", description: "Customer Invoice line item.", category: "Transaction Data" },
    ]
  }
];

export default function CdsViewsExplorer() {
  const [selectedViewId, setSelectedViewId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "General Ledger": true,
    "Accounts Payable": false,
    "Accounts Receivable": false
  });

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const selectedView = cdsCategories
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

        <div className={clsx("flex-1 overflow-y-auto space-y-2 custom-scrollbar", isSidebarCollapsed ? "p-2" : "p-4")}>
          {cdsCategories.map((group) => {
            const filteredViews = group.views.filter(v => 
              v.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
              v.name.toLowerCase().includes(searchQuery.toLowerCase())
            );

            if (filteredViews.length === 0) return null;

            const isExpanded = expandedCategories[group.category] || searchQuery.length > 0;

            return (
              <div key={group.category} className="animate-in fade-in duration-500">
                {!isSidebarCollapsed ? (
                    <button 
                        onClick={() => toggleCategory(group.category)}
                        className="w-full flex items-center justify-between px-2 py-2 mb-1 hover:bg-white/5 rounded-lg transition-colors group"
                    >
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest group-hover:text-slate-300">
                            {group.category}
                        </h3>
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                    </button>
                ) : (
                    <div className="flex justify-center py-2 border-b border-white/5 mb-2" title={group.category}>
                        <DatabaseZap className="w-4 h-4 text-slate-600" />
                    </div>
                )}
                
                {(isExpanded || isSidebarCollapsed) && (
                    <div className={clsx("space-y-1.5", isSidebarCollapsed ? "px-0" : "px-2")}>
                      {filteredViews.map((view) => {
                        const isSelected = selectedViewId === view.id;
                        return (
                        <button
                          key={view.id}
                          onClick={() => setSelectedViewId(view.id)}
                          className={clsx(
                            "w-full text-left rounded-xl transition-all duration-300 group relative overflow-hidden flex items-center",
                            isSidebarCollapsed ? "justify-center p-3" : "px-4 py-3",
                            isSelected
                              ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30 shadow-[inset_4px_0_0_0_#818cf8]"
                              : "text-slate-400 hover:bg-white/5 hover:text-slate-200 border-transparent"
                          )}
                          title={isSidebarCollapsed ? `${view.id} - ${view.name}` : undefined}
                        >
                          {/* Hover background effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                          
                          {isSidebarCollapsed ? (
                              <span className="font-semibold text-xs tracking-tighter truncate w-full text-center relative z-10">{view.id.substring(2, 4)}</span>
                          ) : (
                              <div className="w-full">
                                  <div className="font-medium truncate relative z-10">{view.id}</div>
                                  <div className={clsx(
                                    "text-xs mt-1 truncate relative z-10 transition-colors duration-300",
                                    isSelected ? "text-indigo-200/80" : "text-slate-500 group-hover:text-slate-400"
                                  )}>
                                    {view.name}
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
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden h-full">
        <CdsViewTabs selectedView={selectedView} />
      </div>
    </div>
  );
}
