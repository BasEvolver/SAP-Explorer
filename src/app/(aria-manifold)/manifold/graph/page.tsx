"use client";

import React, { useState } from "react";
import clsx from "clsx";
import Cognitive3DGraphCanvas, { ViewPerspective } from "@/components/manifold/Cognitive3DGraphCanvas";
import { 
  Network, 
  Menu, 
  ChevronDown, 
  Bell, 
  Globe, 
  Eye, 
  Layers
} from "lucide-react";

export default function CognitiveGraphPage() {
  const [activePerspective, setActivePerspective] = useState<ViewPerspective>("all");
  const [selectedCountry, setSelectedCountry] = useState<string>("ALL");

  return (
    <div className="flex-grow flex flex-col h-full overflow-y-auto pb-16 transition-colors duration-300 relative select-none font-sans bg-[#faf8f5] text-slate-800 dark:bg-[#030712] dark:text-slate-100">
      
      {/* 1. Header Toolbar Navigator */}
      <header className="relative w-full border-b border-slate-200/60 dark:border-white/5 bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl px-8 py-3 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 dark:text-slate-500 cursor-pointer">
            <Menu className="w-5 h-5 stroke-[1.5]" />
          </button>
          
          <div className="flex items-center gap-2 font-sans text-xs tracking-wide text-slate-500 dark:text-slate-405">
            <span className="font-extrabold uppercase text-slate-900 dark:text-white flex items-center gap-1.5">
              <div className="w-5 h-5 bg-slate-900 dark:bg-white rounded flex items-center justify-center shrink-0 shadow-sm mr-1 select-none">
                <svg className="w-3.5 h-3.5 text-white dark:text-slate-955" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3L2 21h20L12 3z" />
                  <circle cx="12" cy="15" r="1.5" fill="currentColor" />
                </svg>
              </div>
              Aether Precision Systems
            </span>
            <span className="text-slate-200 dark:text-slate-800">/</span>
            <button className="hover:text-slate-900 dark:hover:text-white font-medium cursor-pointer">
              Personal Space
            </button>
            <span className="text-slate-200 dark:text-slate-800">/</span>
            <button className="hover:text-slate-900 dark:hover:text-white font-medium cursor-pointer">
              ARIA
            </button>
            <span className="text-slate-200 dark:text-slate-800">/</span>
            <span className="text-slate-400 dark:text-slate-500 font-semibold select-none">3D Cognitive Graph</span>
          </div>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer select-none font-bold">
            <span>Group</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-450" />
          </button>

          <button className="p-1.5 rounded-lg text-slate-455 hover:text-slate-755 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 relative cursor-pointer">
            <Bell className="w-4 h-4 stroke-[1.5]" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
          </button>

          <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-extrabold text-slate-850 dark:text-white flex items-center justify-center border border-slate-300 dark:border-white/10 select-none">
            RD
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-[1800px] w-full mx-auto px-8 py-6 flex flex-col gap-6 flex-1">
        
        {/* Title Header & Perspective Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900/30 border border-slate-200/80 dark:border-white/5 p-6 rounded-2xl shadow-sm">
          <div className="space-y-1">
            <span className="text-[9px] font-mono font-extrabold text-indigo-505 dark:text-indigo-400 uppercase tracking-widest block flex items-center gap-1.5">
              <Network className="w-3.5 h-3.5" />
              Multi-Perspective 3D Enterprise Connectome
            </span>
            <h2 className="text-2xl font-[300] tracking-tight text-slate-900 dark:text-white">
              Aether Precision Systems Multi-Domain Topology
            </h2>
            <p className="text-xs text-slate-455 dark:text-slate-400 max-w-2xl font-medium leading-relaxed">
              Switch between Application Integration Flows, Country Legal Breakdown, TPRM Domain Scope, SAP Finance Scope, and Salesforce Revenue Scope.
            </p>
          </div>

          {/* Perspective View Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: "Full Constellation" },
              { id: "applications", label: "Applications Topology" },
              { id: "country", label: "Country Org Breakdown" },
              { id: "tprm", label: "TPRM Scope" },
              { id: "finance", label: "SAP Finance Scope" },
              { id: "sales", label: "Salesforce Revenue Scope" }
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setActivePerspective(v.id as ViewPerspective)}
                className={clsx(
                  "px-4 py-2 rounded-full text-xs font-extrabold cursor-pointer transition-all shadow-sm",
                  activePerspective === v.id
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-955"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-slate-900/40 dark:border-white/5 dark:text-slate-400 dark:hover:bg-slate-900/70"
                )}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3D Canvas Render Area */}
        <div className="flex-1 w-full min-h-[660px] flex flex-col">
          <Cognitive3DGraphCanvas 
            viewPerspective={activePerspective}
            selectedCountry={selectedCountry}
          />
        </div>

      </div>
    </div>
  );
}
