"use client";

import React, { useState, useMemo, useRef } from "react";
import clsx from "clsx";
import { 
  APS_NODES, 
  APS_EDGES, 
  GraphNode, 
  GraphEdge, 
  ZoomLevel, 
  NodeType 
} from "@/lib/manifold/cognitiveGraphData";
import { 
  Database, 
  Building2, 
  ShieldAlert, 
  FileText, 
  Zap, 
  Lock, 
  ArrowRight, 
  Info, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Sliders, 
  CheckCircle,
  Search,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CognitiveGraphCanvasProps {
  scenarioFilter?: string; // "all" | "swissoptics-tprm" | "strait-of-hormuz" | "global-treasury-sweep"
  initialZoomLevel?: ZoomLevel;
  ariaLevers?: {
    apPaymentBlock?: boolean;
    vendorMasterFreeze?: boolean;
    alternateSupplierReroute?: number;
    arNettingHold?: boolean;
  };
  embeddedMode?: boolean;
  onSelectNode?: (node: GraphNode | null) => void;
}

export default function CognitiveGraphCanvas({
  scenarioFilter = "all",
  initialZoomLevel = 2,
  ariaLevers = {
    apPaymentBlock: true,
    vendorMasterFreeze: true,
    alternateSupplierReroute: 50,
    arNettingHold: true
  },
  embeddedMode = false,
  onSelectNode
}: CognitiveGraphCanvasProps) {
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>(initialZoomLevel);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Filter nodes visible at current zoom level & search query
  const visibleNodes = useMemo(() => {
    return APS_NODES.filter((node) => {
      const levelMatches = node.zoomLevel <= zoomLevel;
      const searchMatches = searchQuery === "" || 
        node.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
        node.category.toLowerCase().includes(searchQuery.toLowerCase());
      return levelMatches && searchMatches;
    });
  }, [zoomLevel, searchQuery]);

  const visibleNodeIds = useMemo(() => new Set(visibleNodes.map((n) => n.id)), [visibleNodes]);

  // Filter edges visible based on node presence & active scenario
  const visibleEdges = useMemo(() => {
    return APS_EDGES.filter((edge) => {
      const nodesExist = visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target);
      if (!nodesExist) return false;

      if (scenarioFilter !== "all" && edge.scenarios) {
        return edge.scenarios.includes(scenarioFilter);
      }
      return true;
    });
  }, [visibleNodeIds, scenarioFilter]);

  // Drag Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === "svg" || (e.target as HTMLElement).id === "graph-canvas") {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
    if (onSelectNode) onSelectNode(node);
  };

  const resetView = () => {
    setPanOffset({ x: 0, y: 0 });
    setZoomLevel(initialZoomLevel);
    setSelectedNode(null);
    if (onSelectNode) onSelectNode(null);
  };

  // Helper node icon
  const renderNodeIcon = (type: NodeType) => {
    switch (type) {
      case "system":
        return <Zap className="w-3.5 h-3.5 text-indigo-400" />;
      case "org":
        return <Building2 className="w-3.5 h-3.5 text-[#008fbb] dark:text-cyan-400" />;
      case "master_record":
        return <Database className="w-3.5 h-3.5 text-amber-500" />;
      case "document":
        return <FileText className="w-3.5 h-3.5 text-emerald-500" />;
      case "signal":
        return <ShieldAlert className="w-3.5 h-3.5 text-red-500" />;
      default:
        return <Info className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className={clsx(
      "relative w-full h-full rounded-3xl overflow-hidden select-none border border-slate-200 dark:border-white/10 flex flex-col justify-between transition-colors duration-300",
      embeddedMode ? "bg-slate-900/90 text-white min-h-[420px]" : "bg-slate-900 text-slate-100 min-h-[620px]"
    )}>
      {/* Background Tech Grid Lines */}
      <div 
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #6366f1 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Top Toolbar Controls */}
      <div className="relative z-20 p-4 flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 backdrop-blur-md border-b border-white/5">
        
        {/* Semantic Zoom Level Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono uppercase font-bold text-slate-400">Semantic Zoom:</span>
          
          <div className="flex bg-slate-900 p-1 rounded-xl border border-white/10 text-[10px] font-mono">
            {[
              { level: 1, label: "L1 (Macro Systems)" },
              { level: 2, label: "L2 (Org & Master)" },
              { level: 3, label: "L3 (Micro SAP Vouchers)" }
            ].map((z) => (
              <button
                key={z.level}
                onClick={() => setZoomLevel(z.level as ZoomLevel)}
                className={clsx(
                  "px-3 py-1 rounded-lg transition-all font-bold cursor-pointer",
                  zoomLevel === z.level 
                    ? "bg-white text-slate-950 shadow-sm" 
                    : "text-slate-400 hover:text-white"
                )}
              >
                {z.label}
              </button>
            ))}
          </div>
        </div>

        {/* Node Search & View Reset */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5" />
            <input 
              type="text"
              placeholder="Search SAP tables, vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 bg-slate-900 border border-white/10 rounded-xl text-[10px] font-mono text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-44"
            />
          </div>

          <button
            onClick={resetView}
            className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded-xl text-slate-300 hover:text-white cursor-pointer transition-colors"
            title="Reset Graph Zoom & Pan"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main SVG Interactive Graph Canvas */}
      <div 
        id="graph-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="relative flex-1 w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
      >
        <svg 
          className="w-full h-full" 
          viewBox="0 0 900 500"
          preserveAspectRatio="xMidYMid meet"
        >
          <g transform={`translate(${panOffset.x}, ${panOffset.y})`}>
            
            {/* Render Edges */}
            {visibleEdges.map((edge) => {
              const sourceNode = APS_NODES.find((n) => n.id === edge.source);
              const targetNode = APS_NODES.find((n) => n.id === edge.target);

              if (!sourceNode || !targetNode) return null;

              // Dynamic ARIA Action status morphing logic for Scenario 1
              let edgeColor = "#475569";
              let strokeWidth = 1.5;
              let isDashed = false;
              let hasLock = false;

              if (scenarioFilter === "swissoptics-tprm") {
                if (edge.id === "edge_swiss_inv2841" && ariaLevers.apPaymentBlock) {
                  edgeColor = "#ef4444"; // Red for payment block
                  strokeWidth = 2.5;
                  hasLock = true;
                } else if (edge.id === "edge_zeiss_reroute" && (ariaLevers.alternateSupplierReroute || 0) > 0) {
                  edgeColor = "#10b981"; // Green for supplier reroute
                  strokeWidth = 2.5;
                } else if (edge.id === "edge_netting_hold" && ariaLevers.arNettingHold) {
                  edgeColor = "#f59e0b"; // Gold for AR netting
                  strokeWidth = 2.5;
                } else if (edge.id === "edge_dnb_tprm") {
                  edgeColor = "#ef4444";
                  isDashed = true;
                }
              }

              const midX = (sourceNode.x + targetNode.x) / 2;
              const midY = (sourceNode.y + targetNode.y) / 2;

              return (
                <g key={edge.id}>
                  {/* Path Connection Line */}
                  <line
                    x1={sourceNode.x}
                    y1={sourceNode.y}
                    x2={targetNode.x}
                    y2={targetNode.y}
                    stroke={edgeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={isDashed ? "3,3" : undefined}
                    className="transition-all duration-300"
                  />

                  {/* Edge Label */}
                  {edge.label && (
                    <text
                      x={midX}
                      y={midY - 4}
                      className="text-[7.5px] fill-slate-400 font-mono text-center select-none"
                      textAnchor="middle"
                    >
                      {edge.label}
                    </text>
                  )}

                  {/* Lock icon marker for blocked payment edge */}
                  {hasLock && (
                    <circle cx={midX} cy={midY} r="6" fill="#ef4444" />
                  )}
                </g>
              );
            })}

            {/* Render Nodes */}
            {visibleNodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              
              // Dynamic status highlight
              let nodeBorderColor = "border-white/10";
              let nodeBg = "bg-slate-900/90";

              if (node.id === "master_swissoptics" && ariaLevers.vendorMasterFreeze) {
                nodeBorderColor = "border-red-500 ring-2 ring-red-500/30";
              } else if (node.id === "master_zeiss" && (ariaLevers.alternateSupplierReroute || 0) > 0) {
                nodeBorderColor = "border-emerald-500 ring-2 ring-emerald-500/30";
              } else if (node.id === "doc_inv_10002841" && ariaLevers.apPaymentBlock) {
                nodeBorderColor = "border-amber-500 ring-2 ring-amber-500/30";
              }

              return (
                <g 
                  key={node.id} 
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => handleNodeClick(node)}
                  className="cursor-pointer group"
                >
                  <foreignObject x="-60" y="-22" width="120" height="44">
                    <div 
                      className={clsx(
                        "w-full h-full p-1.5 rounded-xl border backdrop-blur-md flex items-center gap-2 shadow-lg transition-all group-hover:scale-105",
                        isSelected ? "bg-indigo-600 border-white ring-2 ring-indigo-400 text-white" : `${nodeBg} ${nodeBorderColor} text-slate-200`
                      )}
                    >
                      <div className="p-1 rounded-lg bg-slate-950/60 shrink-0">
                        {renderNodeIcon(node.type)}
                      </div>
                      <div className="overflow-hidden leading-tight">
                        <div className="text-[9px] font-extrabold truncate font-sans">{node.label}</div>
                        {node.sublabel && (
                          <div className="text-[7.5px] font-mono text-slate-400 truncate">{node.sublabel}</div>
                        )}
                      </div>
                    </div>
                  </foreignObject>
                </g>
              );
            })}

          </g>
        </svg>
      </div>

      {/* Node Inspector Drawer / Sidebar Popup */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-16 right-4 bottom-4 w-72 bg-slate-950/95 border border-white/10 rounded-2xl p-4 backdrop-blur-xl shadow-2xl z-30 flex flex-col justify-between overflow-y-auto"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  {renderNodeIcon(selectedNode.type)}
                  <span className="text-[10px] font-mono font-bold uppercase text-indigo-400">{selectedNode.category}</span>
                </div>
                <button 
                  onClick={() => setSelectedNode(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-white font-sans">{selectedNode.label}</h3>
                {selectedNode.sublabel && (
                  <p className="text-[10px] font-mono text-slate-400">{selectedNode.sublabel}</p>
                )}
              </div>

              {/* Node Details Catalog */}
              {selectedNode.details && (
                <div className="space-y-2 text-[10px] font-mono">
                  {selectedNode.details.systemOfRecord && (
                    <div className="p-2 bg-slate-900 rounded-xl border border-white/5">
                      <span className="text-slate-500 uppercase block text-[8px]">System of Record</span>
                      <span className="text-slate-200 font-bold">{selectedNode.details.systemOfRecord}</span>
                    </div>
                  )}

                  {selectedNode.details.sapTable && (
                    <div className="p-2 bg-slate-900 rounded-xl border border-white/5">
                      <span className="text-slate-500 uppercase block text-[8px]">SAP Database Table</span>
                      <span className="text-cyan-400 font-bold">{selectedNode.details.sapTable}</span>
                    </div>
                  )}

                  {selectedNode.details.annualSpend && (
                    <div className="p-2 bg-slate-900 rounded-xl border border-white/5">
                      <span className="text-slate-500 uppercase block text-[8px]">Annual Spend</span>
                      <span className="text-emerald-400 font-bold">{selectedNode.details.annualSpend}</span>
                    </div>
                  )}

                  {selectedNode.details.dualRoleSell && (
                    <div className="p-2 bg-slate-900 rounded-xl border border-white/5">
                      <span className="text-slate-500 uppercase block text-[8px]">Dual-Role Reverse Sell</span>
                      <span className="text-amber-400 font-bold">{selectedNode.details.dualRoleSell}</span>
                    </div>
                  )}

                  {selectedNode.details.description && (
                    <p className="text-slate-400 font-sans text-[10px] leading-relaxed pt-1">
                      {selectedNode.details.description}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-between text-[9px] font-mono text-slate-500">
              <span>Node ID: {selectedNode.id}</span>
              <span>Zoom L{selectedNode.zoomLevel}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Legend Bar */}
      <div className="relative z-20 p-3 bg-slate-950/60 backdrop-blur-md border-t border-white/5 flex items-center justify-between text-[9px] font-mono text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Blocked / Payment Hold
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Alternate Supplier Reroute
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            AR Netting Collateral Hold
          </span>
        </div>

        <div>
          Visible: <span className="font-bold text-white">{visibleNodes.length} Nodes</span> &bull; <span className="font-bold text-white">{visibleEdges.length} Edges</span>
        </div>
      </div>
    </div>
  );
}
