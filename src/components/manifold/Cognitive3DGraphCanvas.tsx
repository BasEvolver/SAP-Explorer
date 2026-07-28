"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import * as THREE from "three";
import SpriteText from "three-spritetext";
import clsx from "clsx";
import { useTheme } from "next-themes";
import { 
  generateEnterprise3DGraph, 
  Graph3DData, 
  Node3D, 
  Link3D 
} from "@/lib/manifold/cognitive3DData";
import { 
  Maximize2, 
  Search, 
  X, 
  Zap, 
  Building2, 
  Database, 
  ShieldAlert, 
  FileText, 
  Info,
  Compass,
  Eye,
  Sliders,
  Globe,
  Layers,
  Sparkles,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), { ssr: false });

export type ViewPerspective = "all" | "applications" | "country" | "tprm" | "finance" | "sales";

interface Cognitive3DGraphCanvasProps {
  scenarioFilter?: string;
  viewPerspective?: ViewPerspective;
  selectedCountry?: string;
  ariaLevers?: {
    apPaymentBlock?: boolean;
    vendorMasterFreeze?: boolean;
    alternateSupplierReroute?: number;
    arNettingHold?: boolean;
  };
  embeddedMode?: boolean;
  onSelectNode?: (node: Node3D | null) => void;
}

export default function Cognitive3DGraphCanvas({
  scenarioFilter = "all",
  viewPerspective: initialPerspective = "all",
  selectedCountry: initialCountry = "ALL",
  ariaLevers = {
    apPaymentBlock: true,
    vendorMasterFreeze: true,
    alternateSupplierReroute: 50,
    arNettingHold: true
  },
  embeddedMode = false,
  onSelectNode
}: Cognitive3DGraphCanvasProps) {
  const graphRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [selectedNode, setSelectedNode] = useState<Node3D | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  // Theme resolution
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Filter Perspective State
  const [viewMode, setViewMode] = useState<ViewPerspective>(initialPerspective);
  const [countryFilter, setCountryFilter] = useState<string>(initialCountry);

  // Generate dataset
  const rawGraphData = useMemo(() => generateEnterprise3DGraph(), []);

  // Filter nodes & links based on viewPerspective & countryFilter
  const filteredData = useMemo(() => {
    let nodes = rawGraphData.nodes;
    let links = rawGraphData.links;

    // Perspective Filter
    if (viewMode === "applications") {
      nodes = nodes.filter((n) => n.type === "System" || n.type === "Signal");
      links = links.filter((l) => l.type === "AppFlow");
    } else if (viewMode === "country") {
      nodes = nodes.filter((n) => n.type === "Country" || n.type === "CompanyCode" || n.type === "Plant" || n.type === "SalesOrg" || n.type === "PurchOrg");
    } else if (viewMode === "tprm") {
      nodes = nodes.filter((n) => n.scopes?.includes("tprm") || n.type === "System" || n.type === "Vendor" || n.type === "Signal");
      links = links.filter((l) => l.scopes?.includes("tprm") || l.scenario === "swissoptics-tprm");
    } else if (viewMode === "finance") {
      nodes = nodes.filter((n) => n.scopes?.includes("finance") || n.type === "System" || n.type === "CompanyCode" || n.type === "Voucher");
      links = links.filter((l) => l.scopes?.includes("finance"));
    } else if (viewMode === "sales") {
      nodes = nodes.filter((n) => n.scopes?.includes("sales") || n.type === "Customer" || n.id.includes("Salesforce"));
      links = links.filter((l) => l.scopes?.includes("sales"));
    }

    // Country Filter
    if (countryFilter !== "ALL" && viewMode !== "applications") {
      nodes = nodes.filter((n) => n.country === countryFilter || n.country === "GLOBAL" || n.type === "Country");
    }

    // Scenario Filter
    if (scenarioFilter !== "all") {
      links = links.filter((l) => !l.scenario || l.scenario === scenarioFilter);
    }

    const nodeIds = new Set(nodes.map((n) => n.id));
    links = links.filter((l) => nodeIds.has(typeof l.source === "object" ? (l.source as any).id : l.source) && nodeIds.has(typeof l.target === "object" ? (l.target as any).id : l.target));

    return { nodes, links };
  }, [rawGraphData, viewMode, countryFilter, scenarioFilter]);

  // Configure D3 Force Spacing for Applications View
  useEffect(() => {
    if (graphRef.current) {
      if (viewMode === "applications") {
        graphRef.current.d3Force("charge")?.strength(-850);
        graphRef.current.d3Force("link")?.distance(260);
      } else {
        graphRef.current.d3Force("charge")?.strength(-120);
        graphRef.current.d3Force("link")?.distance(50);
      }
      graphRef.current.d3ReheatSimulation();
    }
  }, [viewMode]);

  // Handle Resize & Simulated Loading Timer
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    window.addEventListener("resize", updateDimensions);
    updateDimensions();

    const timer = setTimeout(() => setIsLoaded(true), 800);

    return () => {
      window.removeEventListener("resize", updateDimensions);
      clearTimeout(timer);
    };
  }, []);

  // 3D Camera Flight Jump
  const flyToNode = (node: Node3D, distance = 140) => {
    if (graphRef.current) {
      const distRatio = 1 + distance / Math.hypot(node.x || 1, node.y || 1, node.z || 1);
      graphRef.current.cameraPosition(
        { x: (node.x || 0) * distRatio, y: (node.y || 0) * distRatio, z: (node.z || 0) * distRatio },
        node,
        1200
      );
    }
  };

  // Fly to Country node when countryFilter changes
  useEffect(() => {
    if (!graphRef.current || !isLoaded || countryFilter === "ALL") return;

    const targetCountryNode = rawGraphData.nodes.find((n) => n.id === `Country: ${countryFilter}`);
    if (targetCountryNode) {
      setTimeout(() => flyToNode(targetCountryNode, 180), 400);
    }
  }, [countryFilter, isLoaded, rawGraphData]);

  const handleNodeClick = (node: any) => {
    const targetNode = node as Node3D;
    setSelectedNode(targetNode);
    flyToNode(targetNode);
    if (onSelectNode) onSelectNode(targetNode);
  };

  const renderNodeIcon = (type: string) => {
    switch (type) {
      case "System":
        return <Zap className="w-3.5 h-3.5 text-indigo-400" />;
      case "Country":
        return <Globe className="w-3.5 h-3.5 text-sky-400" />;
      case "CompanyCode":
      case "Plant":
        return <Building2 className="w-3.5 h-3.5 text-[#008fbb]" />;
      case "Vendor":
      case "Customer":
        return <Database className="w-3.5 h-3.5 text-amber-500" />;
      case "Voucher":
        return <FileText className="w-3.5 h-3.5 text-emerald-500" />;
      default:
        return <Info className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const bgColor = isDark ? "#030712" : "#faf8f5";

  return (
    <div 
      ref={containerRef}
      className={clsx(
        "relative w-full h-full rounded-3xl overflow-hidden select-none border flex flex-col justify-between transition-colors duration-300",
        isDark ? "bg-[#030712] border-white/10 text-slate-100" : "bg-[#faf8f5] border-slate-200 text-slate-800",
        embeddedMode ? "min-h-[440px]" : "min-h-[660px]"
      )}
    >
      {/* Animated Circular Donut Spinner Overlay */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={clsx(
              "absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 backdrop-blur-xl transition-colors duration-300",
              isDark ? "bg-[#030712]/90" : "bg-[#faf8f5]/90"
            )}
          >
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-2 border-indigo-500/20 animate-ping absolute" />
              <Loader2 className="w-12 h-12 animate-spin text-indigo-500 stroke-[2]" />
            </div>
            
            <div className="text-center space-y-1">
              <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-slate-800 dark:text-white block">
                Initializing 3D Enterprise Topology
              </span>
              <p className="text-[10px] font-mono text-slate-400">
                Calculating WebGL 3D Force Vectors for {filteredData.nodes.length} Nodes & Links...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Perspective & Country Controls Toolbar */}
      <div className={clsx(
        "relative z-20 p-3.5 flex flex-wrap items-center justify-between gap-3 backdrop-blur-md border-b transition-colors duration-300",
        isDark ? "bg-slate-950/80 border-white/5" : "bg-white/80 border-slate-200"
      )}>
        
        {/* View Modes Selector */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[9px] font-mono uppercase font-bold text-slate-400 flex items-center gap-1 mr-1">
            <Eye className="w-3.5 h-3.5 text-indigo-500" />
            Perspective:
          </span>

          {[
            { id: "all", label: "Full Constellation" },
            { id: "applications", label: "Applications Topology" },
            { id: "country", label: "Country Org Hierarchy" },
            { id: "tprm", label: "TPRM Scope" },
            { id: "finance", label: "SAP Finance Scope" },
            { id: "sales", label: "Salesforce Revenue Scope" }
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => setViewMode(v.id as ViewPerspective)}
              className={clsx(
                "px-3 py-1 rounded-xl text-[10px] font-mono font-bold cursor-pointer transition-all border",
                viewMode === v.id
                  ? isDark ? "bg-white text-slate-955 border-white shadow-sm" : "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : isDark ? "bg-slate-900 border-white/10 text-slate-400 hover:text-white hover:bg-slate-800" : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
              )}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* Country Drill-Down Selector */}
        <div className="flex items-center gap-2">
          {viewMode !== "applications" && (
            <div className="flex items-center gap-1 text-[10px] font-mono">
              <Globe className="w-3.5 h-3.5 text-sky-500" />
              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className={clsx(
                  "border rounded-xl px-2.5 py-1 text-[10px] font-mono focus:outline-none focus:border-indigo-500 cursor-pointer transition-colors",
                  isDark ? "bg-slate-900 border-white/10 text-white" : "bg-white border-slate-200 text-slate-800"
                )}
              >
                <option value="ALL">All Countries (Global)</option>
                <option value="DE">Germany (DE-10)</option>
                <option value="US">USA (US-20)</option>
                <option value="SG">Singapore (SG-30)</option>
                <option value="FR">France (FR01)</option>
                <option value="GB">United Kingdom (GB01)</option>
                <option value="JP">Japan (JP01)</option>
              </select>
            </div>
          )}

          {/* Node Search Autocomplete */}
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5" />
            <input 
              type="text"
              placeholder="Search nodes..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                const found = rawGraphData.nodes.find((n) => 
                  n.label.toLowerCase().includes(e.target.value.toLowerCase())
                );
                if (found && e.target.value.length > 2) flyToNode(found);
              }}
              className={clsx(
                "pl-8 pr-3 py-1 border rounded-xl text-[10px] font-mono placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-36 transition-colors",
                isDark ? "bg-slate-900 border-white/10 text-white" : "bg-white border-slate-200 text-slate-800"
              )}
            />
          </div>

          <button
            onClick={() => {
              setViewMode("all");
              setCountryFilter("ALL");
              if (graphRef.current) graphRef.current.zoomToFit(1200, 100);
            }}
            className={clsx(
              "p-1.5 border rounded-xl cursor-pointer transition-colors",
              isDark ? "bg-slate-900 hover:bg-slate-800 border-white/10 text-slate-300 hover:text-white" : "bg-white hover:bg-slate-100 border-slate-200 text-slate-600"
            )}
            title="Reset View"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Main 3D Canvas Viewport */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {dimensions.width > 0 && (
          <ForceGraph3D
            ref={graphRef}
            graphData={filteredData}
            width={dimensions.width}
            height={dimensions.height}
            backgroundColor={bgColor}
            nodeLabel={(node: any) => `${node.label} (${node.type})`}
            nodeColor={(node: any) => {
              if (selectedNode?.id === node.id) return isDark ? "#ffffff" : "#0f172a";
              if (node.scenario === scenarioFilter) return "#ef4444";
              return node.color || "#6366f1";
            }}
            nodeVal={(node: any) => node.val || 8}
            nodeRelSize={2.2}
            linkColor={(link: any) => {
              if (link.status === "blocked") return "#ef4444";
              if (link.status === "rerouted") return "#10b981";
              if (link.status === "netted") return "#f59e0b";
              if (link.type === "AppFlow") return isDark ? "#38bdf8" : "#0284c7";
              return isDark ? "rgba(255, 255, 255, 0.45)" : "rgba(15, 23, 42, 0.5)";
            }}
            linkWidth={(link: any) => (link.type === "AppFlow" ? 1.2 : link.status ? 2.0 : 0.8)}
            linkDirectionalParticles={(link: any) => (link.type === "AppFlow" ? 6 : link.status ? 6 : 2)}
            linkDirectionalParticleSpeed={0.008}
            linkDirectionalParticleColor={(link: any) => {
              if (link.type === "AppFlow") return isDark ? "#38bdf8" : "#0284c7";
              if (link.status === "blocked") return "#ef4444";
              if (link.status === "rerouted") return "#10b981";
              return isDark ? "#818cf8" : "#4338ca";
            }}
            nodeThreeObject={(node: any) => {
              const labelText = node.label.split("(")[0].trim();
              const sprite = new SpriteText(labelText);
              sprite.color = selectedNode?.id === node.id ? (isDark ? "#ffffff" : "#000000") : (isDark ? "#ffffff" : "#0f172a");
              sprite.textHeight = node.val > 60 ? 12 : node.val > 35 ? 7 : 4.5;
              sprite.fontWeight = node.val > 35 ? "bold" : "normal";
              sprite.backgroundColor = isDark ? "rgba(15, 23, 42, 0.85)" : "rgba(248, 250, 252, 0.95)";
              sprite.padding = 3;
              sprite.borderRadius = 4;
              return sprite;
            }}
            nodeThreeObjectExtend={true}
            linkThreeObject={(link: any) => {
              if (!link.label || link.type !== "AppFlow") return null;
              const sprite = new SpriteText(link.label);
              sprite.color = isDark ? "#38bdf8" : "#0284c7";
              sprite.textHeight = 3.5;
              sprite.fontWeight = "bold";
              sprite.backgroundColor = isDark ? "rgba(3, 7, 18, 0.9)" : "rgba(255, 255, 255, 0.95)";
              sprite.padding = 2;
              sprite.borderRadius = 3;
              return sprite;
            }}
            linkThreeObjectExtend={true}
            linkPositionUpdate={(sprite: any, { start, end }: any) => {
              if (!sprite) return;
              const middle = {
                x: start.x + (end.x - start.x) * 0.5,
                y: start.y + (end.y - start.y) * 0.5,
                z: start.z + (end.z - start.z) * 0.5
              };
              Object.assign(sprite.position, middle);
            }}
            onNodeClick={handleNodeClick}
            enableNodeDrag={true}
            enableNavigationControls={true}
            showNavInfo={false}
          />
        )}
      </div>

      {/* Node Details Inspector Sidebar */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={clsx(
              "absolute top-16 right-4 bottom-4 w-80 border rounded-2xl p-4 backdrop-blur-xl shadow-2xl z-30 flex flex-col justify-between overflow-y-auto transition-colors duration-300",
              isDark ? "bg-slate-950/95 border-white/10 text-white" : "bg-white/95 border-slate-200 text-slate-900"
            )}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  {renderNodeIcon(selectedNode.type)}
                  <span className="text-[10px] font-mono font-bold uppercase text-indigo-500">{selectedNode.group}</span>
                </div>
                <button 
                  onClick={() => setSelectedNode(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-extrabold font-sans text-slate-900 dark:text-white">{selectedNode.label}</h3>
                <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">Node ID: {selectedNode.id}</p>
                {selectedNode.country && (
                  <span className="inline-block text-[8.5px] font-mono bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-full uppercase">
                    Country: {selectedNode.country}
                  </span>
                )}
              </div>

              <div className="space-y-2 text-[10px] font-mono">
                {selectedNode.sapTable && (
                  <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/5">
                    <span className="text-slate-500 uppercase block text-[8px]">SAP Database Table</span>
                    <span className="text-cyan-600 dark:text-cyan-400 font-bold">{selectedNode.sapTable}</span>
                  </div>
                )}

                {selectedNode.annualSpend && (
                  <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/5">
                    <span className="text-slate-500 uppercase block text-[8px]">Annual Spend Exposure</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{selectedNode.annualSpend}</span>
                  </div>
                )}

                {selectedNode.dualRoleSell && (
                  <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/5">
                    <span className="text-slate-500 uppercase block text-[8px]">Dual-Role Reverse Trade</span>
                    <span className="text-amber-600 dark:text-amber-400 font-bold">{selectedNode.dualRoleSell}</span>
                  </div>
                )}

                {selectedNode.details && (
                  <p className="text-slate-600 dark:text-slate-400 font-sans text-[10.5px] leading-relaxed pt-1">
                    {selectedNode.details}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex justify-between text-[9px] font-mono text-slate-500">
              <span>Perspective: {viewMode.toUpperCase()}</span>
              <button
                onClick={() => flyToNode(selectedNode)}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold cursor-pointer"
              >
                Refocus Camera
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Bar */}
      <div className={clsx(
        "relative z-20 p-3 backdrop-blur-md border-t flex items-center justify-between text-[9px] font-mono transition-colors duration-300",
        isDark ? "bg-slate-950/70 border-white/5 text-slate-400" : "bg-white/80 border-slate-200 text-slate-600"
      )}>
        <div className="flex flex-wrap items-center gap-4">
          {viewMode === "applications" ? (
            <>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                Identity & Cyber Mesh
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                ESB & Event Streaming
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                Finance & Core ERP
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-pink-500" />
                Commercial & CRM
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                HCM & Payroll
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Procurement & SCM
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                Data Lakehouse & AI
              </span>
            </>
          ) : (
            <>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                Company Code / System
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Plant / Storage Bin
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-pink-500" />
                SalesOrg / Customer
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                Vendor / Master Data
              </span>
            </>
          )}
        </div>

        <div>
          Active Nodes: <span className="font-bold text-slate-900 dark:text-white">{filteredData.nodes.length} Rendered</span>
        </div>
      </div>

    </div>
  );
}
