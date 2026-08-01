"use client";

import React, { useState } from 'react';
import { useBlastRadiusStore } from '../../store/blastRadiusStore';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, Activity, ChevronDown, ChevronRight, CheckSquare, Square as SquareIcon, Box, Database, Circle, Hexagon, Triangle, User, Zap, Search } from 'lucide-react';

export default function HUDOverlay() {
  const {
    selectedNode,
    epicenterNode,
    injectedRiskScore,
    setInjectedRiskScore,
    triggerBlast,
    isPlaying,
    play,
    pause,
    stepForward,
    stepBackward,
    playbackSpeed,
    setPlaybackSpeed,
    resetSimulation,
    propagationSteps,
    currentStepIndex,
    visibleNodeTypes,
    toggleNodeTypeFilter,
    nodeRiskMap,
    dataset,
    setDataset,
    graphData,
    visibleGroups,
    toggleGroupFilter,
    searchQuery,
    setSearchQuery
  } = useBlastRadiusStore();

  const maxSteps = propagationSteps.length > 0 ? Math.max(...propagationSteps.map(s => s.stepIndex)) : 0;
  
  const affectedCount = propagationSteps.filter(s => s.stepIndex <= currentStepIndex).length;
  // Estimate exposure based on affected nodes
  const exposureMillions = affectedCount * 2.5;

  const currentRisk = selectedNode ? (nodeRiskMap[selectedNode.id] ?? selectedNode.baseRisk) : 0;

  const [domainsExpanded, setDomainsExpanded] = useState(false);
  const [catsExpanded, setCatsExpanded] = useState<Record<string, boolean>>({
     'Systems & Apps': true,
     'Master Data': true,
     'Transactions & Events': true,
     'Organizational': true,
     'Other': true
  });

  const toggleCat = (cat: string) => setCatsExpanded(prev => ({ ...prev, [cat]: !prev[cat] }));

  // Extract unique groups and their baseColor from the active dataset
  const groupColors: Record<string, string> = {};
  graphData.nodes.forEach(n => {
    if (n.group && n.baseColor && !groupColors[n.group]) {
      groupColors[n.group] = n.baseColor;
    }
  });

  const getNodeCategory = (type: string) => {
    if (['system', 'application'].includes(type)) return 'Systems & Apps';
    if (['master_data', 'material', 'vendor', 'customer', 'employee'].includes(type)) return 'Master Data';
    if (['transaction', 'invoice', 'signal'].includes(type)) return 'Transactions & Events';
    if (['plant', 'companycode', 'salesorg', 'purchorg', 'country'].includes(type)) return 'Organizational';
    return 'Other';
  };

  const groupedNodeTypes: Record<string, string[]> = {};
  Object.keys(visibleNodeTypes).forEach(type => {
    const cat = getNodeCategory(type);
    if (!groupedNodeTypes[cat]) groupedNodeTypes[cat] = [];
    groupedNodeTypes[cat].push(type);
  });

  const getShapeIcon = (category: string) => {
    const color = "#9ca3af"; // neutral gray-400 for shape icons
    switch(category) {
      case 'Systems & Apps': return <Circle className="w-4 h-4" style={{ color }} />;
      case 'Master Data': return <Triangle className="w-3.5 h-3.5" style={{ color }} />;
      case 'Transactions & Events': return <Zap className="w-3.5 h-3.5" style={{ color }} />;
      case 'Organizational': return <Database className="w-3.5 h-3.5" style={{ color }} />;
      default: return <Box className="w-3.5 h-3.5" style={{ color }} />;
    }
  };


  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-6 select-none">
      
      {/* Top Header */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div className="bg-gray-900/80 backdrop-blur border border-gray-800 p-4 rounded-xl shadow-2xl max-w-sm">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-red-500" />
            <h1 className="text-xl font-bold text-white tracking-wide">Blast Radius PoC</h1>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Simulate and trace risk propagation across the enterprise ecosystem.
          </p>
          
          <div className="flex bg-gray-950 p-1 rounded-lg">
            <button 
              onClick={() => setDataset('custom')}
              className={`flex-1 text-xs font-semibold py-2 px-2 rounded-md transition-colors ${dataset === 'custom' ? 'bg-teal-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
            >
              Custom Topology
            </button>
            <button 
              onClick={() => setDataset('mock')}
              className={`flex-1 text-xs font-semibold py-2 px-2 rounded-md transition-colors ${dataset === 'mock' ? 'bg-teal-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
            >
              Mock Topology
            </button>
            <button 
              onClick={() => setDataset('cognitive')}
              className={`flex-1 text-xs font-semibold py-2 px-2 rounded-md transition-colors ${dataset === 'cognitive' ? 'bg-teal-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
            >
              Cognitive TPRM
            </button>
          </div>
        </div>

        {/* Filters Legend */}
        <div className="bg-gray-900/90 backdrop-blur border border-gray-800 p-5 rounded-xl shadow-2xl flex flex-col gap-5 max-h-[60vh] overflow-y-auto w-72 pointer-events-auto custom-scrollbar">
          
          {/* Search Bar */}
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search nodes (e.g. Palo Alto)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg py-2 pl-9 pr-3 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-teal-500 placeholder-gray-600 transition-shadow"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div 
              className="flex items-center justify-between cursor-pointer group"
              onClick={() => setDomainsExpanded(!domainsExpanded)}
            >
              <span className="text-xs font-semibold text-gray-400 group-hover:text-gray-300 uppercase tracking-wider">Domains (Colors)</span>
              {domainsExpanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
            </div>
            {domainsExpanded && (
              <div className="flex flex-col gap-2 mt-1">
                {Object.keys(visibleGroups).map(group => (
                  <label key={group} className="flex items-center gap-3 cursor-pointer group/label">
                    <input 
                      type="checkbox" 
                      checked={visibleGroups[group]}
                      onChange={() => toggleGroupFilter(group)}
                      className="w-3.5 h-3.5 rounded border-gray-700 text-teal-500 focus:ring-teal-500 bg-gray-800 shrink-0"
                    />
                    <div className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: groupColors[group] || '#6b7280' }} />
                    <span className="text-xs text-gray-300 group-hover/label:text-white capitalize truncate">{group}</span>
                  </label>
                ))}
                {Object.keys(visibleGroups).length === 0 && (
                   <span className="text-xs text-gray-500 italic">No domains mapped.</span>
                )}
              </div>
            )}
          </div>
          <div className="w-full h-[1px] bg-gray-800 my-1" />

          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Node Categories (Shapes)</span>
            
            {Object.entries(groupedNodeTypes).map(([cat, types]) => {
              const allChecked = types.every(t => visibleNodeTypes[t]);
              const someChecked = types.some(t => visibleNodeTypes[t]);
              
              return (
                <div key={cat} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between group cursor-pointer" onClick={() => toggleCat(cat)}>
                    <div className="flex items-center gap-2" onClick={(e) => { 
                      e.stopPropagation(); 
                      types.forEach(t => {
                        if (visibleNodeTypes[t] === allChecked) toggleNodeTypeFilter(t);
                      });
                    }}>
                      {allChecked ? <CheckSquare className="w-4 h-4 text-teal-500" /> : someChecked ? <div className="w-4 h-4 flex items-center justify-center rounded border border-gray-600 bg-gray-800"><div className="w-2 h-2 bg-teal-500 rounded-sm" /></div> : <SquareIcon className="w-4 h-4 text-gray-600" />}
                      <div className="flex items-center gap-2">
                        {getShapeIcon(cat)}
                        <span className="text-sm font-medium text-gray-200 group-hover:text-white select-none">{cat}</span>
                      </div>
                    </div>
                    {catsExpanded[cat] ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                  </div>
                  
                  {catsExpanded[cat] && (
                    <div className="pl-7 flex flex-col gap-2 mt-2 mb-2">
                      {types.map(type => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer group/label">
                          <input 
                            type="checkbox" 
                            checked={visibleNodeTypes[type]}
                            onChange={() => toggleNodeTypeFilter(type)}
                            className="w-3.5 h-3.5 rounded border-gray-700 text-teal-500 focus:ring-teal-500 bg-gray-800 shrink-0"
                          />
                          <span className="text-xs text-gray-400 group-hover/label:text-gray-200 capitalize truncate">{type.replace('_', ' ')}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
        </div>
      </div>

      {/* Sidebars and Bottom Panel */}
      <div className="flex justify-between items-end pointer-events-auto">
        
        {/* Left Sidebar - Selected Node / Trigger */}
        <div className="bg-gray-900/90 backdrop-blur border border-gray-800 p-5 rounded-xl shadow-2xl w-80 min-h-[300px] flex flex-col">
          {selectedNode ? (
            <>
              <div className="mb-4">
                <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-widest text-teal-300 bg-teal-900/30 rounded-full mb-2 inline-block">
                  {selectedNode.type.replace('_', ' ')}
                </span>
                <h2 className="text-2xl font-semibold text-white">{selectedNode.name}</h2>
                <p className="text-xs text-gray-400 font-mono mt-1">ID: {selectedNode.id}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-950/50 p-3 rounded-lg border border-gray-800">
                <div>
                  <div className="text-xs text-gray-500 uppercase">Base Risk</div>
                  <div className="text-lg font-mono text-gray-200">{(selectedNode.baseRisk * 100).toFixed(0)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase">Current Risk</div>
                  <div className="text-lg font-mono text-red-400">{(currentRisk * 100).toFixed(0)}</div>
                </div>
              </div>

              <div className="mt-auto">
                <label className="block text-sm text-gray-300 mb-2">Inject Risk Score: {(injectedRiskScore * 100).toFixed(0)}</label>
                <input 
                  type="range" 
                  min="0.1" 
                  max="1.0" 
                  step="0.05"
                  value={injectedRiskScore}
                  onChange={(e) => setInjectedRiskScore(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500 mb-4"
                />
                
                <button 
                  onClick={triggerBlast}
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-3 px-4 rounded-lg shadow-lg shadow-red-900/20 transition-all flex items-center justify-center gap-2"
                >
                  <Activity className="w-4 h-4" /> Trigger Blast Event
                </button>
              </div>
            </>
          ) : (
             <div className="flex-1 flex items-center justify-center text-gray-500 text-sm text-center">
               Select a node in the 3D space to inspect its properties and inject a risk event.
             </div>
          )}
        </div>

        {/* Bottom Playback & Summary */}
        {epicenterNode && (
          <div className="bg-gray-900/90 backdrop-blur border border-gray-800 p-5 rounded-xl shadow-2xl w-[600px] animate-in fade-in slide-in-from-bottom-8">
            <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-4">
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Epicenter Event</div>
                <div className="text-lg text-white font-medium">{epicenterNode.name}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Impact Radius</div>
                <div className="text-2xl text-red-400 font-mono font-semibold">{affectedCount} <span className="text-sm text-gray-500">Nodes Affected</span></div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Estimated Exposure</div>
                <div className="text-2xl text-red-400 font-mono font-semibold">${exposureMillions.toFixed(1)}<span className="text-sm text-gray-500">M</span></div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-6">
              {/* Controls */}
              <div className="flex items-center gap-3">
                <button onClick={resetSimulation} className="p-2 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button onClick={stepBackward} disabled={currentStepIndex < 0} className="p-2 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50">
                  <SkipBack className="w-4 h-4" />
                </button>
                <button onClick={isPlaying ? pause : play} className="p-3 text-white bg-teal-600 hover:bg-teal-500 rounded-full transition-colors shadow-lg shadow-teal-900/20">
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <button onClick={stepForward} disabled={currentStepIndex >= maxSteps} className="p-2 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50">
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              {/* Timeline Info */}
              <div className="flex-1">
                <div className="flex justify-between text-xs text-gray-500 mb-1 font-mono">
                  <span>T-0</span>
                  <span>Step {currentStepIndex >= 0 ? currentStepIndex : 0} of {maxSteps}</span>
                  <span>T+{maxSteps}</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-teal-500 transition-all duration-300"
                    style={{ width: `${maxSteps > 0 ? (Math.max(0, currentStepIndex) / maxSteps) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Speed */}
              <div className="flex flex-col gap-1 w-24">
                <span className="text-[10px] text-gray-500 uppercase text-center">Speed: {playbackSpeed}x</span>
                <input 
                  type="range" min="0.5" max="3" step="0.5" 
                  value={playbackSpeed} onChange={e => setPlaybackSpeed(parseFloat(e.target.value))}
                  className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
