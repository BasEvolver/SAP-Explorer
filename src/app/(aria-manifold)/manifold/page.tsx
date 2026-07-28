"use client";

import React, { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import { 
  Brain, 
  Database, 
  TrendingUp, 
  RotateCcw, 
  ArrowRight,
  FileText,
  Send,
  Menu,
  Bell,
  Calendar,
  Search,
  Grid,
  X,
  ChevronDown,
  MoreVertical,
  Edit3,
  SlidersHorizontal,
  AlertTriangle,
  Eye,
  CheckCircle2,
  Trash2,
  Check,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// CFO-Level observations for the Aria Ledger stream
const MOCK_LEDGER_OBSERVATIONS = [
  { id: 1, time: "10:45:00", type: "TPRM ALERT", message: "SwissOptics AG D&B rating dropped from 92 to 45. Open invoice 10002841 ($450,000) flagged for cybersecurity review.", color: "text-amber-700 bg-amber-500/10 dark:text-amber-400" },
  { id: 2, time: "10:45:12", type: "SUPPLY CHAIN", message: "Strait of Hormuz shipment lanes blocked. German Cobalt Sensor (MAT_COB_4019) stock depleting in 12 days. reordering AlloyTech US.", color: "text-red-650 bg-red-500/10 dark:text-red-400" },
  { id: 3, time: "10:45:25", type: "TREASURY", message: "Capital inefficiency detected: US-20 short debt ($5M @ 8.2%) vs SG-30 idle cash ($8M @ 3.5%). Spread loss: $235,000/yr.", color: "text-purple-650 bg-purple-500/10 dark:text-purple-400" },
  { id: 4, time: "10:45:39", type: "BAPI GATE", message: "Invoice 10002841 Payment Block (BSEG-ZLSPR) set to 'A' (Blocked for Payment) via BAPI_ACC_DOCUMENT_POST. Curvature stabilized to 1.0.", color: "text-emerald-650 bg-emerald-500/10 dark:text-emerald-400" },
  { id: 5, time: "10:45:51", type: "FX HEDGING", message: "Emergency Purchase Requisition for 5,000 units created via BAPI_PR_CREATE. USD Forward FX Contract locked at strike 1.085.", color: "text-blue-650 bg-blue-500/10 dark:text-blue-400" },
  { id: 6, time: "10:46:05", type: "TAX AUDIT", message: "Intercompany tax code checked for SG-US transfer: code I0 (Intercompany Exempt) verified. Proposal SWEEP04 prepared.", color: "text-slate-550 bg-slate-500/10 dark:text-slate-400" }
];

export default function AriaManifoldPage() {
  // Custom States
  const [horizonLoading, setHorizonLoading] = useState(false);
  const [horizonMessage, setHorizonMessage] = useState("");

  // Dynamic Ledger State
  const [ledgerLogs, setLedgerLogs] = useState<typeof MOCK_LEDGER_OBSERVATIONS>(MOCK_LEDGER_OBSERVATIONS.slice(0, 3));
  const ledgerContainerRef = useRef<HTMLDivElement>(null);

  // Widget States
  const [visibleTiles, setVisibleTiles] = useState({
    diagnostics: true,
    observation: true,
    compass: true,
    suggested: true
  });

  const [tasks, setTasks] = useState([
    { id: 1, text: "Authorize SwissOptics Payment Block", category: "BSEG-ZLSPR Update Pending", due: "Immediate", urgent: true, done: false },
    { id: 2, text: "Reallocate Cobalt Sensors PO to AlloyTech US", category: "BAPI_PR_CREATE and FX Hedge", due: "12:00", urgent: true, done: false },
    { id: 3, text: "Sign-off SG-US Cash Sweep (SWEEP04)", category: "F110 Automatic Payment Program Proposal", due: "Today", urgent: false, done: false }
  ]);
  const [newTaskText, setNewTaskText] = useState("");

  // Append new logs to the Aria Ledger stream occasionally
  useEffect(() => {
    const interval = setInterval(() => {
      setLedgerLogs((prev) => {
        if (prev.length >= MOCK_LEDGER_OBSERVATIONS.length) {
          return MOCK_LEDGER_OBSERVATIONS.slice(0, 3);
        }
        return [...prev, MOCK_LEDGER_OBSERVATIONS[prev.length]];
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Auto scroll Ledger logs container
  useEffect(() => {
    if (ledgerContainerRef.current) {
      ledgerContainerRef.current.scrollTop = ledgerContainerRef.current.scrollHeight;
    }
  }, [ledgerLogs]);

  // Handle Close Tile
  const closeTile = (key: keyof typeof visibleTiles) => {
    setVisibleTiles(prev => ({ ...prev, [key]: false }));
  };

  // Reset Tiles
  const resetTiles = () => {
    setVisibleTiles({
      diagnostics: true,
      observation: true,
      compass: true,
      suggested: true
    });
  };

  // Add Task Function
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    const newTask = {
      id: Date.now(),
      text: newTaskText.trim(),
      category: "Ad-hoc task created via composer",
      due: "Due Now",
      urgent: false,
      done: false
    };
    setTasks(prev => [...prev, newTask]);
    setNewTaskText("");
  };

  // Toggle Task Completion
  const toggleTask = (id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  // Delete Task
  const deleteTask = (id: number) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // Horizon simulation trigger
  const triggerHorizonSimulation = () => {
    setHorizonLoading(true);
    setHorizonMessage("");
    setTimeout(() => {
      setHorizonLoading(false);
      setHorizonMessage("Global simulation calibrated. Click any card below to investigate target workflows step-by-step.");
    }, 2000);
  };

  const navigateToScenario = (id: string) => {
    window.location.href = `/manifold/simulations?id=${id}`;
  };

  return (
    <div className={clsx(
      "flex-grow flex flex-col h-full overflow-y-auto pb-16 transition-colors duration-300 relative select-none font-sans",
      "bg-white dark:bg-[#030712] text-slate-800 dark:text-slate-100"
    )}>
      {/* Background radial highlight mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/[0.02] dark:from-indigo-950/20 via-transparent to-transparent pointer-events-none" />

      {/* 1. Header Toolbar Navigation */}
      <header className="relative w-full border-b border-slate-105 dark:border-white/5 bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl px-6 py-2.5 flex items-center justify-between z-30">
        
        {/* Left Side: Breadcrumb Navigator */}
        <div className="flex items-center gap-3">
          <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 dark:text-slate-500 cursor-pointer">
            <Menu className="w-5 h-5 stroke-[1.5]" />
          </button>
          
          <div className="flex items-center gap-2 font-sans text-xs tracking-wide text-slate-555 dark:text-slate-405">
            <span className="font-extrabold uppercase text-slate-900 dark:text-white flex items-center gap-1.5">
              {/* Custom APS Logo Icon */}
              <div className="w-5 h-5 bg-slate-900 dark:bg-white rounded flex items-center justify-center shrink-0 shadow-sm mr-1 select-none">
                <svg className="w-3.5 h-3.5 text-white dark:text-slate-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3L2 21h20L12 3z" />
                  <circle cx="12" cy="15" r="1.5" fill="currentColor" />
                </svg>
              </div>
              Aether Precision Systems
            </span>
            <span className="text-slate-205 dark:text-slate-800">/</span>
            <button className="hover:text-slate-900 dark:hover:text-white font-medium cursor-pointer">
              Personal Space
            </button>
            <span className="text-slate-202 dark:text-slate-800">/</span>
            <button className="hover:text-slate-900 dark:hover:text-white font-medium cursor-pointer">
              ARIA
            </button>
            <span className="text-slate-202 dark:text-slate-800">/</span>
            <span className="text-slate-400 dark:text-slate-500 font-semibold select-none">3LoMI</span>
          </div>
        </div>

        {/* Right Side Tools */}
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1 text-[11px] text-slate-505 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer select-none font-bold">
            <span>Group</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-455" />
          </button>

          <button className="p-1.5 rounded-lg text-slate-450 hover:text-slate-750 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer">
            <Search className="w-4 h-4 stroke-[1.5]" />
          </button>

          <button className="p-1.5 rounded-lg text-slate-450 hover:text-slate-750 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 relative cursor-pointer">
            <Bell className="w-4 h-4 stroke-[1.5]" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
          </button>

          <button className="p-1.5 rounded-lg text-slate-455 hover:text-slate-750 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer">
            <Calendar className="w-4 h-4 stroke-[1.5]" />
          </button>

          <button className="p-1.5 rounded-lg text-slate-450 hover:text-slate-750 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer">
            <Grid className="w-4 h-4 stroke-[1.5]" />
          </button>

          <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-extrabold text-slate-805 dark:text-white flex items-center justify-center border border-slate-300 dark:border-white/10 select-none">
            RD
          </div>
        </div>
      </header>

      {/* Main Grid Content */}
      <div className="max-w-[1400px] w-full mx-auto px-8 py-8 flex flex-col gap-10">
        
        {/* 3. Hero Welcome section & Aria Ledger Stream Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
          
          {/* Hero text Left */}
          <div className="lg:col-span-3 space-y-4 py-2 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-[10px] font-extrabold text-slate-405 uppercase tracking-widest">
                <span className="px-2 py-0.5 rounded bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/15">
                  &bull; 3 Capital Levers
                </span>
                <span className="text-slate-400 dark:text-slate-550 font-bold">Personalised</span>
                <span className="text-slate-455 dark:text-slate-555 font-bold">Monday, 27 July 2026</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-[44px] font-[300] tracking-tight text-slate-900 dark:text-white leading-tight">
                Good morning, Roger &mdash;<br />
                let's drive <span className="font-serif italic text-[#008fbb] dark:text-cyan-405 font-normal">impact</span> today.
              </h1>

              <p className="text-sm text-[#4a423b] dark:text-slate-400 leading-relaxed max-w-lg font-sans font-medium">
                Review TPRM anomalies, resolve shipping lane bottlenecks, and optimize cross-border cash sweep configurations. 
                Three interventions queued. One board meeting pack by 16:00.
              </p>
            </div>

            {/* Simulated actions - rounded-full pills */}
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3 pt-2">
                <button 
                  onClick={triggerHorizonSimulation}
                  disabled={horizonLoading}
                  className={clsx(
                    "px-5 py-2.5 rounded-full text-xs font-extrabold transition-all cursor-pointer shadow flex items-center gap-2",
                    horizonLoading 
                      ? "bg-slate-705 text-slate-405 dark:bg-slate-800 dark:text-slate-505 cursor-not-allowed" 
                      : "bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-955 dark:hover:bg-white"
                  )}
                >
                  {horizonLoading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
                      Simulating...
                    </>
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 bg-white dark:bg-slate-950 rounded-full animate-ping" />
                      Simulate capital flow
                    </>
                  )}
                </button>

                <button 
                  onClick={() => navigateToScenario("swissoptics-tprm")}
                  className="px-5 py-2.5 rounded-full text-xs font-extrabold border border-slate-350 hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 transition-all cursor-pointer bg-white/50 dark:bg-transparent"
                >
                  &bull; Scan Liquidity Spread
                </button>
              </div>

              {horizonMessage && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs flex items-center gap-2 font-medium max-w-lg"
                >
                  <Check className="w-4 h-4 shrink-0" />
                  {horizonMessage}
                </motion.div>
              )}
            </div>
          </div>

          {/* AI Ledger Panel Right - Elegant clean white/light pane */}
          <div className="lg:col-span-2 bg-[#f8fafc] dark:bg-[#090d16]/60 border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-full select-none">
            <div className="flex justify-between items-center text-[9px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4 border-b border-slate-200 dark:border-white/5 pb-2.5 shrink-0">
              <span className="flex items-center gap-1.5 font-bold">
                <Brain className="w-3.5 h-3.5 text-indigo-505" />
                ARIA Ledger Stream
              </span>
              <span>System Observations</span>
            </div>

            {/* Continuous stream container */}
            <div 
              ref={ledgerContainerRef}
              className="flex-1 overflow-y-auto space-y-3.5 pr-1 py-1 scrollbar-none max-h-[220px]"
            >
              <AnimatePresence initial={false}>
                {ledgerLogs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-3 bg-white dark:bg-black/25 rounded-xl border border-slate-200/50 dark:border-white/5 flex flex-col gap-1 hover:bg-slate-105/50 dark:hover:bg-black/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className={clsx("text-[8px] font-extrabold px-1.5 py-0.5 rounded tracking-wider uppercase font-sans", log.color)}>
                        {log.type}
                      </span>
                      <span className="text-[8px] text-slate-400 dark:text-slate-505 font-mono font-bold">[{log.time}]</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 font-sans font-medium text-[11px] leading-relaxed">
                      {log.message}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Clean status footer */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200 dark:border-white/5 text-[9px] uppercase tracking-wider text-slate-455 dark:text-slate-500 font-mono shrink-0">
              <div className="flex items-center gap-1.5 font-sans font-bold">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Continuous Ledger Audit Active
              </div>

              <button 
                onClick={() => navigateToScenario("swissoptics-tprm")}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 flex items-center justify-center text-slate-500 hover:text-slate-855 dark:text-slate-455 dark:hover:text-white transition-all cursor-pointer border border-slate-200 dark:border-white/10"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 4. "For you — generated by AI" - SOLID FULL COLORS AND REDIRECT ACTIONS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-555 dark:text-slate-400 flex items-center gap-1">
              <span className="text-slate-300 dark:text-slate-750 font-normal mr-0.5 text-xs">+</span>
              For you &mdash; <span className="opacity-75 font-medium lowercase italic">generated by AI</span>
            </h3>

            <div className="flex items-center gap-3 text-[10px] font-extrabold uppercase tracking-widest">
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-505 border border-indigo-500/20 select-none font-bold">
                Personalised
              </span>
              <button 
                onClick={resetTiles}
                className="text-indigo-505 hover:text-indigo-400 font-extrabold cursor-pointer"
              >
                See All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              
              {/* Tile 1: SwissOptics TPRM Anomaly */}
              {visibleTiles.diagnostics && (
                <motion.div
                  initial={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, y: 15 }}
                  className="bg-[#facc15] dark:bg-[#eab308] rounded-2xl border border-amber-600/10 shadow-md overflow-hidden flex flex-col justify-between min-h-[170px]"
                >
                  <div className="bg-[#eab308]/60 dark:bg-[#ca8a04]/60 p-3 border-b border-amber-600/25 flex justify-between items-center text-[9px] font-extrabold uppercase tracking-wider text-amber-955 dark:text-white">
                    <span className="flex items-center gap-1.5">
                      <div className="w-5.5 h-5.5 rounded bg-amber-955/20 flex items-center justify-center">
                        <AlertTriangle className="w-3 h-3 text-amber-955 dark:text-white" />
                      </div>
                      TPRM COMPLIANCE
                    </span>
                    <button 
                      onClick={() => closeTile("diagnostics")}
                      className="text-amber-955 dark:text-amber-100 hover:text-black cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5 stroke-[2]" />
                    </button>
                  </div>
                  
                  <div className="p-4 flex-grow space-y-1">
                    <h4 className="text-xs font-extrabold text-amber-955 dark:text-white">
                      SwissOptics TPRM Anomaly
                    </h4>
                    <p className="text-[11px] text-amber-955/85 dark:text-amber-50 leading-relaxed font-sans font-medium">
                      D&B score dropped from 92 to 45. Suspend $450,000 pending invoice payment to avoid BEC fraud.
                    </p>
                  </div>

                  <div className="p-3 border-t border-amber-600/20 flex items-center justify-between bg-amber-955/5 font-mono text-[9px] uppercase tracking-wider">
                    <div className="space-y-0.5">
                      <span className="block text-[8px] text-amber-900/75 dark:text-amber-100/75 font-bold">Risk Exposure</span>
                      <span className="text-xs font-bold text-amber-955 dark:text-white">$450,000</span>
                    </div>

                    <button 
                      onClick={() => navigateToScenario("swissoptics-tprm")}
                      className="px-4 py-1.5 rounded-full bg-slate-955 hover:bg-slate-900 text-white text-[10px] font-extrabold flex items-center gap-1 cursor-pointer transition-all shadow-sm shrink-0"
                    >
                      <span>Investigate</span>
                      <span className="h-3 w-[1px] bg-white/20 mx-1" />
                      <span className="text-[7px] text-slate-355">▼</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Tile 2: Strait of Hormuz Disruption */}
              {visibleTiles.observation && (
                <motion.div
                  initial={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, y: 15 }}
                  className="bg-[#fca5a5] dark:bg-[#ef4444]/80 rounded-2xl border border-red-600/10 shadow-md overflow-hidden flex flex-col justify-between min-h-[170px]"
                >
                  <div className="bg-[#f87171]/60 dark:bg-[#dc2626]/60 p-3 border-b border-red-655/25 flex justify-between items-center text-[9px] font-extrabold uppercase tracking-wider text-red-955 dark:text-white">
                    <span className="flex items-center gap-1.5">
                      <div className="w-5.5 h-5.5 rounded bg-red-955/20 flex items-center justify-center">
                        <TrendingUp className="w-3 h-3 text-red-955 dark:text-white" />
                      </div>
                      SUPPLY CHAIN & FX
                    </span>
                    <button 
                      onClick={() => closeTile("observation")}
                      className="text-red-955 dark:text-red-100 hover:text-black cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5 stroke-[2]" />
                    </button>
                  </div>
                  
                  <div className="p-4 flex-grow space-y-1">
                    <h4 className="text-xs font-extrabold text-red-955 dark:text-white">
                      Strait of Hormuz Disruption
                    </h4>
                    <p className="text-[11px] text-red-955/85 dark:text-red-55 leading-relaxed font-sans font-medium">
                      Cobalt sensor stock runs out in 12 days. Reroute supply to AlloyTech US and hedge $1.5M EUR/USD exposure.
                    </p>
                  </div>

                  <div className="p-3 border-t border-red-600/20 flex items-center justify-between bg-red-955/5 font-mono text-[9px] uppercase tracking-wider">
                    <div className="space-y-0.5">
                      <span className="block text-[8px] text-red-900/75 dark:text-red-100/75 font-bold">Hedge Volume</span>
                      <span className="text-xs font-bold text-red-955 dark:text-white">$1.5M USD</span>
                    </div>

                    <button 
                      onClick={() => navigateToScenario("strait-of-hormuz")}
                      className="px-4 py-1.5 rounded-full bg-slate-950 hover:bg-slate-900 text-white text-[10px] font-extrabold flex items-center gap-1 cursor-pointer transition-all shadow-sm shrink-0"
                    >
                      <span>Reroute & Hedge</span>
                      <span className="h-3 w-[1px] bg-white/20 mx-1" />
                      <span className="text-[7px] text-slate-355">▼</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Tile 3: Singapore-US Treasury Sweep */}
              {visibleTiles.compass && (
                <motion.div
                  initial={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, y: 15 }}
                  className="bg-[#d8b4fe] dark:bg-[#a855f7]/80 rounded-2xl border border-purple-600/10 shadow-md overflow-hidden flex flex-col justify-between min-h-[170px]"
                >
                  <div className="bg-[#c084fc]/60 dark:bg-[#9333ea]/60 p-3 border-b border-purple-650/25 flex justify-between items-center text-[9px] font-extrabold uppercase tracking-wider text-purple-955 dark:text-white">
                    <span className="flex items-center gap-1.5">
                      <div className="w-5.5 h-5.5 rounded bg-purple-955/20 flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-purple-955 dark:text-white" />
                      </div>
                      TREASURY SWEEP
                    </span>
                    <button 
                      onClick={() => closeTile("compass")}
                      className="text-purple-955 dark:text-purple-100 hover:text-black cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5 stroke-[2]" />
                    </button>
                  </div>
                  
                  <div className="p-4 flex-grow space-y-1">
                    <h4 className="text-xs font-extrabold text-purple-955 dark:text-white">
                      Singapore-US Treasury Sweep
                    </h4>
                    <p className="text-[11px] text-purple-955/85 dark:text-purple-50 leading-relaxed font-sans font-medium">
                      Offset USA 8.2% debt using Singapore 3.5% idle surplus cash. Sweep $5.0M to save $235,000/yr.
                    </p>
                  </div>

                  <div className="p-3 border-t border-purple-600/20 flex items-center justify-between bg-purple-955/5 font-mono text-[9px] uppercase tracking-wider">
                    <div className="space-y-0.5">
                      <span className="block text-[8px] text-purple-900/75 dark:text-purple-100/75 font-bold">Interest Spread</span>
                      <span className="text-xs font-bold text-purple-955 dark:text-white">4.7% ($\Delta$)</span>
                    </div>

                    <button 
                      onClick={() => navigateToScenario("global-treasury-sweep")}
                      className="px-4 py-1.5 rounded-full bg-slate-955 hover:bg-slate-900 text-white text-[10px] font-extrabold flex items-center gap-1 cursor-pointer transition-all shadow-sm shrink-0"
                    >
                      <span>Sweep Cash</span>
                      <span className="h-3 w-[1px] bg-white/20 mx-1" />
                      <span className="text-[7px] text-slate-355">▼</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Tile 4: White/Slate Suggested Action */}
              {visibleTiles.suggested && (
                <motion.div
                  initial={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, y: 15 }}
                  className="bg-[#f8fafc] dark:bg-[#1e293b]/70 rounded-2xl border border-slate-200 dark:border-white/10 shadow-md overflow-hidden flex flex-col justify-between min-h-[170px]"
                >
                  <div className="bg-slate-100 dark:bg-slate-800/80 p-3 border-b border-slate-200 dark:border-white/5 flex justify-between items-center text-[9px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    <span className="flex items-center gap-1.5">
                      <div className="w-5.5 h-5.5 rounded bg-slate-900/10 dark:bg-white/15 flex items-center justify-center">
                        <SlidersHorizontal className="w-3 h-3 text-slate-805 dark:text-white" />
                      </div>
                      Suggested Action
                    </span>
                    <button 
                      onClick={() => closeTile("suggested")}
                      className="text-slate-405 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5 stroke-[2]" />
                    </button>
                  </div>
                  
                  <div className="p-4 flex-grow space-y-1">
                    <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                      Automate 7 Manual Controls
                    </h4>
                    <p className="text-[11px] text-slate-550 dark:text-slate-350 leading-relaxed font-sans font-medium">
                      AI identified 7 financial compliance controls eligible for automated clearing. Saves manual overhead.
                    </p>
                  </div>

                  <div className="p-3 border-t border-slate-200 dark:border-white/5 flex items-center justify-between bg-slate-55 dark:bg-black/10 font-mono text-[9px] uppercase tracking-wider">
                    <div className="space-y-0.5">
                      <span className="block text-[8px] text-slate-455 dark:text-slate-400">Savings Value</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100">$12k/mo</span>
                    </div>

                    <button 
                      onClick={() => navigateToScenario("global-treasury-sweep")}
                      className="px-4 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-extrabold flex items-center gap-1 cursor-pointer transition-all shadow-sm shrink-0"
                    >
                      <span>Explore</span>
                      <span className="h-3 w-[1px] bg-white/20 mx-1" />
                      <span className="text-[7px] text-slate-355">▼</span>
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

        {/* 5. "My widgets" Grid Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-550 dark:text-slate-405">
              My widgets
            </h3>

            <div className="flex items-center gap-4 text-[9px] font-extrabold uppercase tracking-widest text-slate-405 dark:text-slate-505">
              <span>Drag the grip to reorder</span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <button 
                onClick={() => {
                  setTasks(prev => [
                    { id: Date.now(), text: "Review fiscal compliance policies", category: "Audit Preparation", due: "Next week", urgent: false, done: false },
                    ...prev
                  ]);
                }}
                className="text-indigo-500 hover:text-indigo-400 font-extrabold cursor-pointer"
              >
                + Add Widget
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Widget 1: Financial Dashboards */}
            <div className="bg-white dark:bg-[#090d16]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[300px]">
              <div>
                <div className="flex justify-between items-center text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mb-6 border-b border-slate-100 dark:border-white/5 pb-2">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Database className="w-3.5 h-3.5 text-indigo-505" />
                    Financial Dashboards
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-300 dark:text-slate-707">|</span>
                    <span className="text-slate-450 dark:text-slate-405">Your boards</span>
                    <button className="text-slate-455 hover:text-slate-805 dark:hover:text-white cursor-pointer ml-1">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  
                  {/* Item 1 */}
                  <div className="flex items-start justify-between p-3 bg-slate-50 hover:bg-slate-100 dark:bg-black/20 dark:hover:bg-black/30 rounded-xl transition-all border border-slate-200/50 dark:border-white/5 cursor-pointer">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-850 dark:text-white font-semibold">
                          Working Capital & Cash Flow
                        </span>
                        <span className="text-[7px] font-mono font-extrabold px-1 py-0.5 rounded bg-indigo-500/10 text-indigo-405 border border-indigo-500/15 uppercase">
                          Demo
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-455 dark:text-slate-400 font-medium">
                        5 visuals &bull; Template
                      </p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 mt-1" />
                  </div>

                  {/* Item 2 */}
                  <div className="flex items-start justify-between p-3 bg-slate-50 hover:bg-slate-105 dark:bg-black/20 dark:hover:bg-black/30 rounded-xl transition-all border border-slate-200/50 dark:border-white/5 cursor-pointer">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-855 dark:text-white font-semibold">
                          Treasury & Liquidity Ledger
                        </span>
                        <span className="text-[7px] font-mono font-extrabold px-1 py-0.5 rounded bg-teal-500/10 text-teal-650 dark:text-teal-400 border border-teal-500/15 uppercase">
                          Shared
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-455 dark:text-slate-400 font-medium">
                        8 visuals &bull; Template &bull; Shared with you &bull; Alex K.
                      </p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 mt-1" />
                  </div>

                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-white/5 text-[9px] font-mono uppercase tracking-widest text-slate-404 mt-6">
                All templates synchronized via internal ledger
              </div>
            </div>

            {/* Widget 2: High Priority Tasks */}
            <div className="bg-white dark:bg-[#090d16]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[300px]">
              <div>
                <div className="flex justify-between items-center text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mb-6 border-b border-slate-100 dark:border-white/5 pb-2">
                  <span className="flex items-center gap-1.5 font-bold">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse mr-0.5" />
                    High Priority
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-455 dark:text-slate-405 font-bold">3 items &bull; 2 urgent</span>
                    <button className="text-slate-450 hover:text-slate-850 dark:hover:text-white cursor-pointer ml-1">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 max-h-[170px] overflow-y-auto pr-1">
                  <AnimatePresence>
                    {tasks.map((task) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className={clsx(
                          "p-3 rounded-xl border flex items-center justify-between gap-3 group relative transition-colors",
                          task.done 
                            ? "bg-slate-105/50 dark:bg-black/10 border-slate-202 dark:border-white/5 opacity-55"
                            : "bg-slate-50 hover:bg-slate-100 dark:bg-black/20 dark:hover:bg-black/30 border-slate-200/55 dark:border-white/5"
                        )}
                      >
                        {task.urgent && !task.done && (
                          <div className="absolute top-2 bottom-2 left-0 w-[3px] bg-red-500 rounded-r" />
                        )}

                        <div className="flex items-center gap-3">
                          <input 
                            type="checkbox"
                            checked={task.done}
                            onChange={() => toggleTask(task.id)}
                            className="w-3.5 h-3.5 rounded accent-indigo-500 cursor-pointer"
                          />
                          <div className="space-y-0.5">
                            <span className={clsx(
                              "text-xs font-bold block",
                              task.done ? "line-through text-slate-400 dark:text-slate-550" : "text-slate-805 dark:text-slate-200"
                            )}>
                              {task.text}
                            </span>
                            <span className="text-[9px] text-slate-405 block font-medium">
                              {task.category}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={clsx(
                            "text-[8px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded",
                            task.done 
                              ? "bg-emerald-500/10 text-emerald-500"
                              : task.urgent 
                              ? "bg-red-500/10 text-red-500" 
                              : "bg-slate-200 dark:bg-slate-800 text-slate-505 dark:text-slate-400"
                          )}>
                            {task.due}
                          </span>
                          <button 
                            onClick={() => deleteTask(task.id)}
                            className="text-slate-455 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-0.5 rounded hover:bg-slate-200 dark:hover:bg-white/5"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              <form onSubmit={handleAddTask} className="border border-slate-200 dark:border-white/10 rounded-full p-1 bg-slate-50/50 dark:bg-black/20 flex items-center gap-2 mt-6 bg-white shadow-inner">
                <FileText className="w-4 h-4 text-slate-450 dark:text-slate-500 ml-3" />
                <input
                  type="text"
                  placeholder="Type cash command or press Enter..."
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  className="flex-1 bg-transparent text-xs py-1.5 focus:outline-none placeholder-slate-450"
                />
                
                <div className="flex items-center gap-1.5 pr-1">
                  <div className="text-[10px] font-bold text-slate-450 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white cursor-pointer px-3 py-1 rounded-full border border-transparent hover:border-slate-250 dark:hover:border-white/5 flex items-center gap-0.5 bg-[#f1f5f9] dark:bg-slate-900 shadow-sm">
                    <span>Design</span>
                    <ChevronDown className="w-3 h-3" />
                  </div>
                  
                  <button 
                    type="submit"
                    className="w-7 h-7 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-950 flex items-center justify-center cursor-pointer hover:opacity-85 shadow"
                  >
                    <Send className="w-3.5 h-3.5 rotate-[-30deg] ml-0.5 mt-[-1px]" />
                  </button>
                </div>
              </form>
            </div>

            {/* Widget 3: Prepared for meeting */}
            <div className="bg-white dark:bg-[#090d16]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[300px]">
              <div>
                <div className="flex justify-between items-center text-[9px] font-extrabold uppercase tracking-widest text-slate-405 mb-6 border-b border-slate-105 dark:border-white/5 pb-2">
                  <span className="flex items-center gap-1.5 font-bold">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                    Prepared for your meeting
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-455 dark:text-slate-455 font-bold text-[8px]">Board - Q2 review</span>
                    <button className="text-slate-455 hover:text-slate-850 dark:hover:text-white cursor-pointer ml-1">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-855 dark:text-slate-200">
                    Q2 Working Capital Review
                  </h4>
                  <p className="text-[10px] text-slate-405 font-mono -mt-2">
                    Board pack - 42 financial metrics assessed
                  </p>

                  <div className="flex items-center gap-8 py-2">
                    
                    <div className="relative w-24 h-24 shrink-0 flex items-center justify-center select-none">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r="38" stroke="rgba(255,255,255,0.02)" strokeWidth="8" fill="transparent" />
                        <circle cx="48" cy="48" r="38" stroke="#3b82f6" strokeWidth="9" fill="transparent"
                          strokeDasharray="238.7" strokeDashoffset="0" />
                        <circle cx="48" cy="48" r="38" stroke="#ef4444" strokeWidth="9" fill="transparent"
                          strokeDasharray="238.7" strokeDashoffset="100.2" />
                        <circle cx="48" cy="48" r="38" stroke="#f59e0b" strokeWidth="9" fill="transparent"
                          strokeDasharray="238.7" strokeDashoffset="152.7" />
                        <circle cx="48" cy="48" r="38" stroke="#94a3b8" strokeWidth="9" fill="transparent"
                          strokeDasharray="238.7" strokeDashoffset="200.5" />
                      </svg>
                      
                      <div className="absolute text-center">
                        <span className="block text-base font-extrabold text-slate-900 dark:text-white leading-none">42</span>
                        <span className="text-[8px] text-slate-405 font-mono leading-none">metrics</span>
                      </div>
                    </div>

                    <div className="flex-1 space-y-2 text-[10px] font-semibold font-sans text-slate-655 dark:text-slate-350">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                          Cash Optimized
                        </span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">42%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                          In Reconciliation
                        </span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">22%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                          Locked Capital
                        </span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">20%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                          Forecast Pending
                        </span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">16%</span>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-white/5 text-[9px] font-mono uppercase tracking-widest text-slate-404 mt-6">
                Next Audit Committee sync: tomorrow at 10:00 AM
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
