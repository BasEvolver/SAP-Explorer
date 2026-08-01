import { create } from 'zustand';
import { GraphData, GraphNode, PropagationStep } from '../lib/blast-radius/types';
import { generateMockGraph } from '../lib/blast-radius/mockGraphData';
import { calculateBlastRadius } from '../lib/blast-radius/calculateBlastRadius';
import { generateCognitiveGraphData } from '../lib/blast-radius/mapCognitiveData';
import { generateCustomGraphData } from '../lib/blast-radius/customGraphData';

interface BlastRadiusState {
  dataset: 'mock' | 'cognitive' | 'custom';
  graphData: GraphData;
  selectedNode: GraphNode | null;
  epicenterNode: GraphNode | null;
  injectedRiskScore: number;
  
  // Playback & Timeline
  propagationSteps: PropagationStep[];
  currentStepIndex: number; // The timeline index
  isPlaying: boolean;
  playbackSpeed: number; // Multiplier, e.g., 1x, 2x

  // Derived state for visuals
  nodeRiskMap: Record<string, number>;
  highlightedLinks: Record<string, boolean>;
  activeLinkParticles: Array<{ source: string; target: string }>;

  // Search
  searchQuery: string;

  // Filters
  visibleNodeTypes: Record<string, boolean>;
  visibleGroups: Record<string, boolean>;

  // Actions
  setSelectedNode: (node: GraphNode | null) => void;
  setInjectedRiskScore: (score: number) => void;
  setSearchQuery: (query: string) => void;
  setDataset: (dataset: 'mock' | 'cognitive' | 'custom') => void;
  triggerBlast: () => void;
  resetSimulation: () => void;
  
  // Timeline Actions
  play: () => void;
  pause: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  setPlaybackSpeed: (speed: number) => void;
  applyTimelineStep: (index: number) => void;

  toggleNodeTypeFilter: (type: string) => void;
  toggleGroupFilter: (group: string) => void;
}

const initialGraph = generateMockGraph();

export const useBlastRadiusStore = create<BlastRadiusState>()((set, get) => ({
  dataset: 'mock',
  graphData: initialGraph,
  selectedNode: null,
  epicenterNode: null,
  injectedRiskScore: 0.95,
  
  propagationSteps: [],
  currentStepIndex: -1,
  isPlaying: false,
  playbackSpeed: 1,

  nodeRiskMap: {},
  highlightedLinks: {},
  activeLinkParticles: [],

  searchQuery: '',

  visibleNodeTypes: {
    vendor: true,
    application: true,
    master_data: true,
    transaction: true,
  },
  visibleGroups: {},

  setSelectedNode: (node) => set({ selectedNode: node }),
  setInjectedRiskScore: (score) => set({ injectedRiskScore: score }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  setDataset: (dataset) => {
    let newGraph;
    if (dataset === 'cognitive') {
      newGraph = generateCognitiveGraphData();
    } else if (dataset === 'custom') {
      newGraph = generateCustomGraphData();
    } else {
      newGraph = generateMockGraph();
    }
    
    const uniqueTypes = Array.from(new Set(newGraph.nodes.map(n => n.type)));
    const newFilters: Record<string, boolean> = {};
    uniqueTypes.forEach(t => newFilters[t] = true);
    
    const uniqueGroups = Array.from(new Set(newGraph.nodes.map(n => n.group).filter(Boolean))) as string[];
    const newGroupFilters: Record<string, boolean> = {};
    uniqueGroups.forEach(g => newGroupFilters[g] = true);
    
    set({
      dataset,
      graphData: newGraph,
      selectedNode: null,
      epicenterNode: null,
      propagationSteps: [],
      currentStepIndex: -1,
      isPlaying: false,
      nodeRiskMap: {},
      highlightedLinks: {},
      activeLinkParticles: [],
      visibleNodeTypes: newFilters,
      visibleGroups: newGroupFilters
    });
  },

  triggerBlast: () => {
    const { graphData, selectedNode, injectedRiskScore } = get();
    if (!selectedNode) return;

    const steps = calculateBlastRadius(graphData, selectedNode.id, injectedRiskScore);
    
    const initialRiskMap: Record<string, number> = {};
    graphData.nodes.forEach(n => {
        initialRiskMap[n.id] = n.baseRisk;
    });

    set({
      epicenterNode: selectedNode,
      propagationSteps: steps,
      currentStepIndex: -1,
      isPlaying: true, // Auto-play on trigger
      nodeRiskMap: initialRiskMap,
      highlightedLinks: {},
      activeLinkParticles: []
    });
  },

  resetSimulation: () => {
    const { graphData } = get();
    const initialRiskMap: Record<string, number> = {};
    graphData.nodes.forEach(n => {
        initialRiskMap[n.id] = n.baseRisk;
    });

    set({
      epicenterNode: null,
      propagationSteps: [],
      currentStepIndex: -1,
      isPlaying: false,
      nodeRiskMap: initialRiskMap,
      highlightedLinks: {},
      activeLinkParticles: []
    });
  },

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  
  stepForward: () => {
    const { currentStepIndex, propagationSteps, applyTimelineStep } = get();
    // Max step index is the highest stepIndex in the steps array
    const maxIndex = propagationSteps.length > 0 ? Math.max(...propagationSteps.map(s => s.stepIndex)) : -1;
    if (currentStepIndex < maxIndex) {
      applyTimelineStep(currentStepIndex + 1);
    } else {
       set({ isPlaying: false }); // Stop if at end
    }
  },

  stepBackward: () => {
     const { currentStepIndex, applyTimelineStep } = get();
     if (currentStepIndex >= 0) {
         applyTimelineStep(currentStepIndex - 1);
     }
  },

  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),

  applyTimelineStep: (targetTimelineIndex) => {
    const { graphData, propagationSteps } = get();
    
    const newNodeRiskMap: Record<string, number> = {};
    graphData.nodes.forEach(n => newNodeRiskMap[n.id] = n.baseRisk);

    const newHighlightedLinks: Record<string, boolean> = {};
    const newActiveParticles: Array<{ source: string; target: string }> = [];

    // Apply all steps up to the targetTimelineIndex
    propagationSteps.forEach(step => {
      if (step.stepIndex <= targetTimelineIndex) {
         newNodeRiskMap[step.nodeId] = step.newRisk;
         if (step.sourceNodeId) {
             newHighlightedLinks[`${step.sourceNodeId}-${step.nodeId}`] = true;
         }
      }
      
      // If this step is EXACTLY the current step index being processed, we emit particles from its source to it
      if (step.stepIndex === targetTimelineIndex && step.sourceNodeId) {
          newActiveParticles.push({
              source: step.sourceNodeId,
              target: step.nodeId
          });
      }
    });

    set({
       currentStepIndex: targetTimelineIndex,
       nodeRiskMap: newNodeRiskMap,
       highlightedLinks: newHighlightedLinks,
       activeLinkParticles: newActiveParticles
    });
  },

  toggleNodeTypeFilter: (type) => {
      set((state) => ({
          visibleNodeTypes: {
              ...state.visibleNodeTypes,
              [type]: !state.visibleNodeTypes[type]
          }
      }));
  },

  toggleGroupFilter: (group) => {
      set((state) => ({
          visibleGroups: {
              ...state.visibleGroups,
              [group]: !state.visibleGroups[group]
          }
      }));
  }
}));
