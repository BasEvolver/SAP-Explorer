"use client";

import { useState } from "react";
import LogicalTree from "./LogicalTree";
import { GitMerge, ChevronDown } from "lucide-react";
import clsx from "clsx";

// Mock Categorized Logical DBs
const LOGICAL_DBS = {
  "Sales": [
    { id: "VAV", name: "Sales Documents", description: "Logical DB for Sales Orders, Quotations, etc." },
    { id: "VAK", name: "Sales Contracts", description: "Logical DB for Sales Contracts" },
  ],
  "Purchasing": [
    { id: "ELM", name: "Purchasing Documents", description: "Logical DB for POs, Requisitions" },
  ],
  "Finance": [
    { id: "BRF", name: "Accounting Documents", description: "Logical DB for FI Documents" },
    { id: "KDF", name: "Vendor Master", description: "Logical DB for Vendor Data" },
  ],
  "Controlling": [
    { id: "C11", name: "Cost Centers", description: "Logical DB for Cost Center Accounting" },
  ],
  "Tax": [
    { id: "TAX", name: "Tax Reporting", description: "Logical DB for Tax Data" },
  ]
};

// Mock Tree Structures
const TREE_DATA: Record<string, any> = {
  "VAV": {
    name: "VBAK",
    attributes: { description: "Sales Document: Header", isRoot: true },
    children: [
      {
        name: "VBAP",
        attributes: { description: "Sales Document: Item" },
        children: [
          { name: "VBEP", attributes: { description: "Sales Document: Schedule Line" } },
          { name: "VBUK", attributes: { description: "Header Status and Administrative Data" } },
        ]
      },
      {
        name: "VBKD",
        attributes: { description: "Sales Document: Business Data" }
      },
      {
        name: "VBPA",
        attributes: { description: "Sales Document: Partner" }
      }
    ]
  },
  "ELM": {
    name: "EKKO",
    attributes: { description: "Purchasing Document Header", isRoot: true },
    children: [
      {
        name: "EKPO",
        attributes: { description: "Purchasing Document Item" },
        children: [
          { name: "EKET", attributes: { description: "Scheduling Agreement Schedule Lines" } },
        ]
      },
      {
        name: "EKKN",
        attributes: { description: "Account Assignment in Purchasing" }
      }
    ]
  }
};

export default function BlueprintView() {
  const [selectedDB, setSelectedDB] = useState("VAV");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const currentTree = TREE_DATA[selectedDB] || { name: "No structure defined yet", attributes: { description: "WIP" } };
  
  // Find current DB details
  let currentDBDetails = { name: "Select DB", id: "" };
  for (const cat in LOGICAL_DBS) {
    const found = LOGICAL_DBS[cat as keyof typeof LOGICAL_DBS].find(db => db.id === selectedDB);
    if (found) currentDBDetails = found;
  }

  return (
    <div className="w-full h-full flex flex-col p-8 pt-24">
      {/* Header & Controls */}
      <div className="flex items-center justify-between mb-8 z-10">
        <div>
          <h1 className="text-3xl font-bold dark:text-white text-slate-900 tracking-tight flex items-center">
            <GitMerge className="w-8 h-8 mr-3 text-evolver-viridian" />
            The Blueprint
          </h1>
          <p className="text-slate-500 mt-1">Explore SE36 Logical Database Hierarchies.</p>
        </div>

        {/* Custom Categorized Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-3 px-5 py-3 rounded-xl glass-panel hover:bg-white/10 transition-colors shadow-lg min-w-[280px] justify-between"
          >
            <div className="flex flex-col items-start">
              <span className="text-xs text-slate-400 font-medium">Logical Database</span>
              <span className="text-sm font-bold dark:text-white text-slate-900">{currentDBDetails.id} - {currentDBDetails.name}</span>
            </div>
            <ChevronDown className={clsx("w-5 h-5 text-slate-400 transition-transform duration-300", isDropdownOpen && "rotate-180")} />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-[320px] glass-panel rounded-xl shadow-2xl overflow-hidden max-h-[60vh] overflow-y-auto z-50">
              {Object.entries(LOGICAL_DBS).map(([category, dbs]) => (
                <div key={category} className="mb-2">
                  <div className="px-4 py-2 bg-black/10 dark:bg-white/5 border-y border-white/5 text-xs font-semibold uppercase tracking-wider text-evolver-viridian-light">
                    {category}
                  </div>
                  {dbs.map(db => (
                    <button
                      key={db.id}
                      onClick={() => {
                        setSelectedDB(db.id);
                        setIsDropdownOpen(false);
                      }}
                      className={clsx(
                        "w-full text-left px-4 py-3 hover:bg-white/5 transition-colors border-l-2",
                        selectedDB === db.id ? "border-evolver-viridian bg-white/5" : "border-transparent"
                      )}
                    >
                      <div className="font-mono text-sm dark:text-white text-slate-900 font-bold">{db.id}</div>
                      <div className="text-xs text-slate-500 mt-1">{db.name}</div>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tree Canvas */}
      <div className="flex-1 glass-panel rounded-2xl overflow-hidden relative">
        <div className="absolute top-4 left-4 z-10 glass-panel px-3 py-1.5 rounded-lg text-xs font-medium dark:text-slate-300 text-slate-700">
          Scroll to zoom. Drag to pan. Click nodes to expand/collapse.
        </div>
        <LogicalTree data={currentTree} />
      </div>
    </div>
  );
}
