"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { 
  Compass, 
  Brain, 
  Database, 
  Network, 
  Zap, 
  LayoutGrid, 
  ChevronRight, 
  Sun, 
  Moon, 
  Cpu, 
  ShieldCheck, 
  Server,
  ArrowUpRight
} from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";

export default function PortalHub() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#030712] text-slate-100 relative overflow-hidden font-sans">
      {/* Background Cyber Mesh Visuals */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/20 via-[#030712] to-[#010208] pointer-events-none" />
      
      {/* Large Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/[0.03] rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/[0.04] rounded-full blur-[130px] pointer-events-none" />
      
      {/* Subtle Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.015)_1px,_transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />

      {/* Floating Particle/Star Elements */}
      <div className="absolute top-1/4 left-1/5 w-1 h-1 bg-emerald-400 rounded-full animate-pulse pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping [animation-duration:3s] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-cyan-400 rounded-full animate-pulse [animation-duration:2s] pointer-events-none" />

      {/* Header Bar */}
      <header className="relative w-full max-w-7xl mx-auto px-6 py-8 flex justify-between items-center z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 relative bg-gradient-to-tr from-emerald-600 to-indigo-600 rounded-xl p-0.5 shadow-lg flex items-center justify-center">
            <LayoutGrid className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-wider text-white">
              EVOLVER
            </span>
            <span className="text-[10px] font-extrabold tracking-widest text-indigo-400 block -mt-1 uppercase">
              Portal Hub
            </span>
          </div>
        </div>

        {/* Global theme toggle inside launcher hub */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 text-slate-400 hover:text-white transition-all shadow-md cursor-pointer flex items-center gap-2 text-xs font-semibold"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-emerald-400" />
              <span>Dark Mode</span>
            </>
          )}
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 z-10 max-w-5xl mx-auto w-full">
        {/* Hub Welcome Banner */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 space-y-4"
        >
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 text-indigo-300 border border-indigo-500/15 uppercase tracking-widest">
            Autonomous Enterprise Control Center
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white max-w-3xl">
            Select Your Orchestration Environment
          </h1>
          <p className="text-base text-slate-400 max-w-xl mx-auto">
            Switch between technical ERP exploration or predictive enterprise intelligence systems. Powered by Evolver cognitive models.
          </p>
        </motion.div>

        {/* Applications Selector Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          
          {/* App Card 1: SAP Explorer */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ y: -6 }}
            className="flex flex-col bg-[#060814]/75 border border-emerald-500/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300"
          >
            {/* Glowing Accent Border Line */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500/50 via-emerald-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-emerald-500/[0.01] rounded-full blur-[40px] pointer-events-none" />

            {/* Icon Banner */}
            <div className="flex items-center justify-between mb-8">
              <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
                <Compass className="w-7 h-7 text-emerald-400 group-hover:rotate-12 transition-transform duration-500" />
              </div>
              <span className="text-[10px] font-extrabold tracking-wider uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full">
                SAP DISCOVERY
              </span>
            </div>

            {/* Content Details */}
            <div className="flex-1 space-y-3">
              <h2 className="text-2xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                SAP Explorer
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Unlock core ERP relationship mapping. Walk through logical schemas, query transparent tables, check active OData/RFC endpoints, and audit fiscal compliance scenarios.
              </p>

              {/* Bullet Features list */}
              <ul className="pt-4 space-y-2.5 text-xs text-slate-400 font-mono">
                <li className="flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-emerald-500/75 shrink-0" />
                  <span>SAP Logical DB Relationship Graphs</span>
                </li>
                <li className="flex items-center gap-2">
                  <Network className="w-3.5 h-3.5 text-emerald-500/75 shrink-0" />
                  <span>Interactive OData, RFC & BAPI Interfaces</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/75 shrink-0" />
                  <span>Working Capital, Tax & Compliance Scenarios</span>
                </li>
              </ul>
            </div>

            {/* Action Launch Button */}
            <div className="mt-10">
              <Link
                href="/discover/logical-db"
                className="w-full py-4 px-6 bg-slate-900 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 hover:text-white rounded-2xl font-semibold tracking-wide text-sm flex items-center justify-center gap-2 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-lg shadow-emerald-950/20"
              >
                Launch SAP Explorer Environment
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
              </Link>
            </div>
          </motion.div>

          {/* App Card 2: ARIA Manifold */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ y: -6 }}
            className="flex flex-col bg-[#060814]/75 border border-indigo-500/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-300"
          >
            {/* Glowing Accent Border Line */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500/50 via-cyan-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-indigo-500/[0.01] rounded-full blur-[40px] pointer-events-none" />

            {/* Icon Banner */}
            <div className="flex items-center justify-between mb-8">
              <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
                <Brain className="w-7 h-7 text-indigo-400" />
              </div>
              <span className="text-[10px] font-extrabold tracking-wider uppercase bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full">
                INTELLIGENCE NODE
              </span>
            </div>

            {/* Content Details */}
            <div className="flex-1 space-y-3">
              <h2 className="text-2xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                ARIA Manifold
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Build sovereign cognitive workflows. Orchestrate autonomous AI agents, simulate supply-chain disruption delays, explore enterprise semantic graphs, and sync parameters.
              </p>

              {/* Bullet Features list */}
              <ul className="pt-4 space-y-2.5 text-xs text-slate-400 font-mono">
                <li className="flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-indigo-500/75 shrink-0" />
                  <span>Autonomous Agent Lifecycle Logs</span>
                </li>
                <li className="flex items-center gap-2">
                  <Server className="w-3.5 h-3.5 text-indigo-500/75 shrink-0" />
                  <span>Cognitive Semantic Fabric Node Mapper</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-indigo-500/75 shrink-0" />
                  <span>Dynamic Value-Chain Stress Simulation Sandbox</span>
                </li>
              </ul>
            </div>

            {/* Action Launch Button */}
            <div className="mt-10">
              <Link
                href="/manifold"
                className="w-full py-4 px-6 bg-slate-900 border border-indigo-500/20 hover:border-indigo-500/40 text-indigo-400 hover:text-white rounded-2xl font-semibold tracking-wide text-sm flex items-center justify-center gap-2 group-hover:bg-indigo-650 group-hover:text-white transition-all duration-300 shadow-lg shadow-indigo-950/20"
              >
                Initialize ARIA Manifold Workspace
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
              </Link>
            </div>
          </motion.div>

        </div>
      </main>

      {/* Footer Info */}
      <footer className="relative w-full border-t border-white/5 py-6 px-6 z-10 shrink-0 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          <span>&copy; 2026 EVOLVER ENTERPRISE SUITE. All sovereign nodes operational.</span>
          <div className="flex items-center gap-4 text-slate-600 font-medium">
            <span className="hover:text-slate-400 transition-colors">Documentation</span>
            <span>&bull;</span>
            <span className="hover:text-slate-400 transition-colors">API Systems</span>
            <span>&bull;</span>
            <span className="hover:text-slate-400 transition-colors">Privacy policy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
