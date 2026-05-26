"use client";

import { Table, ArrowRight, ShieldCheck, Database, Link2 } from "lucide-react";
import clsx from "clsx";

interface EvidenceGraphProps {
  arTerms: string;
  apExtension: number;
  dbSynced: boolean;
  companyCode: string;
  arCustomerName: string;
  arCustomerID: string;
  arAmount: number;
  apAmount: number;
}

export default function EvidenceGraph({
  arTerms,
  apExtension,
  dbSynced,
  companyCode,
  arCustomerName,
  arCustomerID,
  arAmount,
  apAmount,
}: EvidenceGraphProps) {
  return (
    <div className="w-full h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold dark:text-white text-slate-900 flex items-center">
            <Link2 className="w-5 h-5 mr-2 text-evolver-viridian" />
            Source Data Connectors & Evidence Graph
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Typographic lineage tracing active documents to S/4HANA relational tables and historical ledgers.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-mono text-emerald-400">Live RFC Agent Connected</span>
        </div>
      </div>

      {/* Visual Canvas of Nodes & SVG Links */}
      <div className="relative flex-1 min-h-[480px] rounded-2xl border border-white/10 bg-black/40 p-6 overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-6">
        {/* Animated Connection Background Paths */}
        <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-30">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            {/* Top link (AP Flow) */}
            <path
              d="M 180,140 Q 380,100 600,160"
              fill="none"
              stroke="#40826D"
              strokeWidth="2"
              strokeDasharray="5,5"
              className="animate-dash-slow"
            />
            {/* Bottom link (AR Flow) */}
            <path
              d="M 180,340 Q 380,380 600,320"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2"
              strokeDasharray="5,5"
              className="animate-dash-fast"
            />
            {/* Cross-linking (ACDOCA analysis) */}
            <path
              d="M 180,240 Q 380,240 600,320"
              fill="none"
              stroke="#a855f7"
              strokeWidth="1.5"
              strokeDasharray="3,3"
            />
          </svg>
        </div>

        {/* Column 1: SAP Relational Tables (Source Node) */}
        <div className="flex flex-col space-y-6 w-full lg:w-[280px] z-10">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center mb-1">
            <Database className="w-3.5 h-3.5 mr-1" /> SAP Core Database
          </div>

          {/* BSIK AP Table */}
          <div className="glass-panel p-4 rounded-xl relative overflow-hidden group hover:border-evolver-viridian/40 transition-all shadow-lg">
            <div className="absolute top-0 right-0 px-2 py-0.5 bg-evolver-viridian/20 rounded-bl-lg font-mono text-[9px] text-evolver-viridian-light font-bold">
              BSIK
            </div>
            <div className="flex items-center space-x-3">
              <Table className="w-5 h-5 text-evolver-viridian" />
              <div>
                <h4 className="font-mono text-sm font-bold text-slate-200">BSIK Table</h4>
                <p className="text-[10px] text-slate-500">Accounts Payable: Open Items</p>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-white/5 flex flex-wrap gap-1.5 font-mono text-[9px] text-slate-400">
              <span className="bg-white/5 px-1.5 py-0.5 rounded">BELNR (Doc)</span>
              <span className="bg-white/5 px-1.5 py-0.5 rounded">BUKRS</span>
              <span className="bg-white/5 px-1.5 py-0.5 rounded">ZFBDT (Base)</span>
            </div>
          </div>

          {/* BSID AR Table */}
          <div className="glass-panel p-4 rounded-xl relative overflow-hidden group hover:border-cyan-500/40 transition-all shadow-lg">
            <div className="absolute top-0 right-0 px-2 py-0.5 bg-cyan-500/20 rounded-bl-lg font-mono text-[9px] text-cyan-400 font-bold">
              BSID
            </div>
            <div className="flex items-center space-x-3">
              <Table className="w-5 h-5 text-cyan-400" />
              <div>
                <h4 className="font-mono text-sm font-bold text-slate-200">BSID Table</h4>
                <p className="text-[10px] text-slate-500">Accounts Receivable: Open Items</p>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-white/5 flex flex-wrap gap-1.5 font-mono text-[9px] text-slate-400">
              <span className="bg-white/5 px-1.5 py-0.5 rounded">KUNNR (Cust)</span>
              <span className="bg-white/5 px-1.5 py-0.5 rounded">ZTERM</span>
              <span className="bg-white/5 px-1.5 py-0.5 rounded">WRBTR</span>
            </div>
          </div>

          {/* T052 Terms of Payment */}
          <div className="glass-panel p-4 rounded-xl relative overflow-hidden group hover:border-amber-500/40 transition-all shadow-lg">
            <div className="absolute top-0 right-0 px-2 py-0.5 bg-amber-500/20 rounded-bl-lg font-mono text-[9px] text-amber-400 font-bold">
              T052
            </div>
            <div className="flex items-center space-x-3">
              <Table className="w-5 h-5 text-amber-500" />
              <div>
                <h4 className="font-mono text-sm font-bold text-slate-200">T052 Table</h4>
                <p className="text-[10px] text-slate-500">Terms of Payment Master</p>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-white/5 flex flex-wrap gap-1.5 font-mono text-[9px] text-slate-400">
              <span className="bg-white/5 px-1.5 py-0.5 rounded">ZTERM</span>
              <span className="bg-white/5 px-1.5 py-0.5 rounded">ZTAG1</span>
              <span className="bg-white/5 px-1.5 py-0.5 rounded">ZPRZ1</span>
            </div>
          </div>

          {/* ACDOCA Unified Ledger */}
          <div className="glass-panel p-4 rounded-xl relative overflow-hidden group hover:border-purple-500/40 transition-all shadow-lg">
            <div className="absolute top-0 right-0 px-2 py-0.5 bg-purple-500/20 rounded-bl-lg font-mono text-[9px] text-purple-400 font-bold">
              ACDOCA
            </div>
            <div className="flex items-center space-x-3">
              <Table className="w-5 h-5 text-purple-400" />
              <div>
                <h4 className="font-mono text-sm font-bold text-slate-200">ACDOCA Table</h4>
                <p className="text-[10px] text-slate-500">Universal Ledger (Historical)</p>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-white/5 flex flex-wrap gap-1.5 font-mono text-[9px] text-slate-400">
              <span className="bg-white/5 px-1.5 py-0.5 rounded">BUIDEX</span>
              <span className="bg-white/5 px-1.5 py-0.5 rounded">WSL</span>
              <span className="bg-white/5 px-1.5 py-0.5 rounded">LAG_DAYS</span>
            </div>
          </div>
        </div>

        {/* Central Lineage Pipeline Indicator */}
        <div className="hidden lg:flex flex-col items-center justify-center flex-1">
          <div className="w-8 h-8 rounded-full border border-white/10 bg-black/60 flex items-center justify-center text-slate-400 animate-pulse">
            <ArrowRight className="w-4 h-4" />
          </div>
          <div className="h-24 w-[1px] bg-gradient-to-b from-white/10 via-white/5 to-transparent mt-2"></div>
        </div>

        {/* Column 2: Active Ledger & Lineage Records (Wired Target Node) */}
        <div className="flex flex-col space-y-6 w-full lg:w-[320px] z-10">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center mb-1">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verified Lineage Records
          </div>

          {/* Active AP Document Record (ASML Invoice) */}
          <div className="glass-panel p-4 rounded-xl border-l-4 border-l-evolver-viridian shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300">ASML (Vendor: 100082)</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400">
                AP Liability
              </span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Company Code:</span>
                <span className="font-mono font-bold text-white">{companyCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Document No:</span>
                <span className="font-mono text-slate-300">1900004121</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount:</span>
                <span className="font-bold text-white">${apAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Baseline Date (ZFBDT):</span>
                <span className={clsx("font-mono font-bold transition-colors duration-300", apExtension > 0 ? "text-evolver-viridian-light" : "text-slate-300")}>
                  {apExtension > 0 ? `June 15, 2026 (+${apExtension}d)` : "May 31, 2026"}
                </span>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
              <span className="text-slate-500">Source: BSIK ➜ Item 001</span>
              <span className={clsx("font-mono text-[9px] px-1.5 py-0.5 rounded", dbSynced ? "bg-emerald-500/20 text-emerald-300" : "bg-yellow-500/10 text-yellow-400")}>
                {dbSynced ? "Synced to SAP" : "Pending Write-back"}
              </span>
            </div>
          </div>

          {/* Active AR Document Record (Actual Customer Invoice from S/4HANA) */}
          <div className="glass-panel p-4 rounded-xl border-l-4 border-l-cyan-500 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 truncate max-w-[170px] block" title={arCustomerName}>
                {arCustomerName}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-400">
                AR Asset
              </span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Company Code:</span>
                <span className="font-mono font-bold text-white">{companyCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Customer ID:</span>
                <span className="font-mono font-bold text-white">{arCustomerID}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Receivable:</span>
                <span className="font-bold text-white">${arAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Terms (ZTERM):</span>
                <span className={clsx("font-mono font-bold transition-colors duration-300", arTerms !== "Standard" ? "text-cyan-400" : "text-slate-300")}>
                  {arTerms !== "Standard" ? "Z010 (2% 10 / Net 30)" : "Z030 (Net 30)"}
                </span>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
              <span className="text-slate-500">Source: BSID ➜ Customer Profile</span>
              <span className={clsx("font-mono text-[9px] px-1.5 py-0.5 rounded", dbSynced ? "bg-emerald-500/20 text-emerald-300" : "bg-yellow-500/10 text-yellow-400")}>
                {dbSynced ? "Synced to SAP" : "Pending Write-back"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
