"use client";

import React, { useEffect, useRef, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import * as THREE from 'three';
import SpriteText from 'three-spritetext';
import { useBlastRadiusStore } from '../../store/blastRadiusStore';
import { GraphNode } from '../../lib/blast-radius/types';

const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), { ssr: false });

export default function BlastRadiusVisualizer() {
  const fgRef = useRef<any>(null);
  const {
    graphData, 
    visibleNodeTypes,
    visibleGroups,
    nodeRiskMap,
    highlightedLinks,
    activeLinkParticles, 
    setSelectedNode,
    epicenterNode,
    isPlaying,
    stepForward,
    playbackSpeed,
    currentStepIndex,
    searchQuery
  } = useBlastRadiusStore();

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setDimensions({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Playback timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        stepForward();
      }, 1000 / playbackSpeed); // Step every second (adjusted by speed)
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, stepForward]);

  // Zoom out to global view when a blast is triggered so user can watch propagation
  useEffect(() => {
    // When a blast is triggered, currentStepIndex resets to -1 and isPlaying goes true.
    if (isPlaying && currentStepIndex === -1 && fgRef.current && epicenterNode) {
       const distance = 250; // zoom out distance
       
       // Handle edge case where epicenter is exactly at 0,0,0
       const hyp = Math.hypot(epicenterNode.x || 0, epicenterNode.y || 0, epicenterNode.z || 0) || 1;
       const distRatio = 1 + distance / hyp;
       
       fgRef.current.cameraPosition(
         { 
           x: (epicenterNode.x || 0) * distRatio, 
           y: (epicenterNode.y || 0) * distRatio, 
           z: (epicenterNode.z || 0) * distRatio + distance // bias Z slightly for a better isometric angle
         },
         { x: epicenterNode.x, y: epicenterNode.y, z: epicenterNode.z },
         2000 // 2 seconds smooth transition
       );
    }
  }, [isPlaying, currentStepIndex, epicenterNode]);

  // Filter graph data
  const filteredData = useMemo(() => {
    const nodes = graphData.nodes.filter(n => {
       const typeVisible = visibleNodeTypes[n.type];
       const groupVisible = n.group ? visibleGroups[n.group] : true;
       return typeVisible && groupVisible;
    });
    const nodeIds = new Set(nodes.map(n => n.id));
    const links = graphData.links.filter(l => {
      const sourceId = typeof l.source === 'object' ? (l.source as any).id : l.source;
      const targetId = typeof l.target === 'object' ? (l.target as any).id : l.target;
      return nodeIds.has(sourceId) && nodeIds.has(targetId);
    });

    // Compute curvature for multiple links between the same nodes
    const linkPairs = new Map<string, number>();
    links.forEach(l => {
      const sourceId = typeof l.source === 'object' ? (l.source as any).id : l.source;
      const targetId = typeof l.target === 'object' ? (l.target as any).id : l.target;
      const pair = [sourceId, targetId].sort().join('-');
      linkPairs.set(pair, (linkPairs.get(pair) || 0) + 1);
    });

    const linkPairCurvatureCount = new Map<string, number>();
    links.forEach(l => {
      const sourceId = typeof l.source === 'object' ? (l.source as any).id : l.source;
      const targetId = typeof l.target === 'object' ? (l.target as any).id : l.target;
      const pair = [sourceId, targetId].sort().join('-');
      const totalLinks = linkPairs.get(pair) || 1;
      
      let curvature = 0;
      let rotation = 0;
      
      if (totalLinks > 1) {
        const count = linkPairCurvatureCount.get(pair) || 0;
        linkPairCurvatureCount.set(pair, count + 1);
        curvature = 0.15; // Only curve if there are multiple edges
        rotation = (Math.PI * 2 * count) / totalLinks; // Distribute evenly
      }
      
      (l as any).__curvature = curvature;
      (l as any).__curveRotation = rotation;
    });

    return { nodes, links };
  }, [graphData, visibleNodeTypes, visibleGroups]);

  // Compute search focus set (matching nodes + direct neighbors)
  const searchFocusNodes = useMemo(() => {
    if (!searchQuery || searchQuery.trim() === '') return null;
    
    const query = searchQuery.toLowerCase();
    const focusSet = new Set<string>();
    
    // Find direct matches
    filteredData.nodes.forEach(n => {
      if (n.id.toLowerCase().includes(query) || (n.name && n.name.toLowerCase().includes(query))) {
        focusSet.add(n.id);
      }
    });

    // Add direct neighbors
    const initialMatches = Array.from(focusSet);
    filteredData.links.forEach(l => {
      const sourceId = typeof l.source === 'object' ? (l.source as any).id : l.source;
      const targetId = typeof l.target === 'object' ? (l.target as any).id : l.target;
      
      if (initialMatches.includes(sourceId)) focusSet.add(targetId);
      if (initialMatches.includes(targetId)) focusSet.add(sourceId);
    });

    return focusSet;
  }, [searchQuery, filteredData]);

  // Node Color Mapping (uses native dataset color)
  const getNodeColor = (risk: number, baseColorHex?: string) => {
    return baseColorHex ? new THREE.Color(baseColorHex) : new THREE.Color(0x00ffff);
  };

  const getNodeCategory = (type: string) => {
    if (['system', 'application', 'business_application', 'infrastructure', 'analytics_system'].includes(type.toLowerCase())) return 'Systems & Apps';
    if (['master_data', 'material', 'vendor', 'customer', 'employee'].includes(type.toLowerCase())) return 'Master Data';
    if (['transaction', 'invoice', 'signal'].includes(type.toLowerCase())) return 'Transactions & Events';
    if (['plant', 'companycode', 'salesorg', 'purchorg', 'country'].includes(type.toLowerCase())) return 'Organizational';
    return 'Other';
  };

  const nodeThreeObject = (n: any) => {
    const node = n as GraphNode;
    let geometry;
    const size = node.val || 2;
    const category = getNodeCategory(node.type);
    
    switch (category) {
      case 'Systems & Apps':
        geometry = new THREE.SphereGeometry(size * 1.2, 16, 16); // Slightly larger sphere for Systems
        break;
      case 'Master Data':
        geometry = new THREE.ConeGeometry(size, size * 2, 4); // Square pyramid
        break;
      case 'Transactions & Events':
        geometry = new THREE.TetrahedronGeometry(size); // Sharp transaction events
        break;
      case 'Organizational':
        geometry = new THREE.CylinderGeometry(size, size, size * 1.5, 8); // Pillars for org
        geometry.rotateX(Math.PI / 2);
        break;
      default:
        geometry = new THREE.BoxGeometry(size, size, size); // Generic fallback
    }

    const initialRisk = nodeRiskMap[node.id] ?? node.baseRisk;
    
    const isFocused = searchFocusNodes ? searchFocusNodes.has(node.id) : true;
    const opacity = isFocused ? 0.9 : 0.1;

    const material = new THREE.MeshLambertMaterial({
      color: getNodeColor(initialRisk, node.baseColor),
      transparent: true,
      opacity: opacity,
    });
    
    if (initialRisk > 0.7) {
       material.emissive = getNodeColor(initialRisk, node.baseColor);
       material.emissiveIntensity = (initialRisk - 0.7) * 2;
    }

    const mesh = new THREE.Mesh(geometry, material);
    
    if (['system', 'application', 'business_application', 'analytics_system', 'master_data'].includes(node.type.toLowerCase())) {
      const group = new THREE.Group();
      group.add(mesh);
      
      const sprite = new SpriteText(node.name || node.id || "");
      sprite.color = 'white';
      sprite.textHeight = size * 0.4;
      sprite.position.y = size * 1.5;
      sprite.material.opacity = isFocused ? 0.8 : 0.2;
      group.add(sprite);
      
      (n as any).__threeObj = group;
      return group;
    }

    (n as any).__threeObj = mesh;
    return mesh;
  };

  // Dynamically update node colors without recreating meshes
  useEffect(() => {
    filteredData.nodes.forEach(node => {
      const obj = (node as any).__threeObj;
      if (obj) {
        const mesh = obj.isGroup ? obj.children[0] : obj;
        const currentRisk = nodeRiskMap[node.id] ?? node.baseRisk;
        const color = getNodeColor(currentRisk, node.baseColor);
        mesh.material.color = color;
        if (currentRisk > 0.7) {
          mesh.material.emissive = color;
          mesh.material.emissiveIntensity = (currentRisk - 0.7) * 2;
        } else {
          mesh.material.emissiveIntensity = 0;
        }
      }
    });
  }, [nodeRiskMap, filteredData]);

  // Programmatically emit particles
  useEffect(() => {
    if (activeLinkParticles.length > 0 && fgRef.current) {
      filteredData.links.forEach((link: any) => {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        const isActive = activeLinkParticles.some(p => p.source === sourceId && p.target === targetId);
        if (isActive) {
          fgRef.current.emitParticle(link);
        }
      });
    }
  }, [activeLinkParticles, currentStepIndex, filteredData]);

  // Adjust physics layout to prevent node overlap
  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force('charge').strength(-450); // Increased repulsion to spread out nodes
      fgRef.current.d3Force('link').distance(40); // Increased link distance
    }
  }, [filteredData]);

  const handleNodeClick = (n: any) => {
    const node = n as GraphNode;
    setSelectedNode(node);
    
    // Auto focus camera
    if (fgRef.current) {
      const distance = 40;
      const distRatio = 1 + distance/Math.hypot(node.x || 0, node.y || 0, node.z || 0);
      fgRef.current.cameraPosition(
        { x: (node.x || 0) * distRatio, y: (node.y || 0) * distRatio, z: (node.z || 0) * distRatio },
        { x: node.x, y: node.y, z: node.z },
        1500 // ms transition
      );
    }
  };

  const handleBackgroundClick = () => {
    setSelectedNode(null);
  };



  if (dimensions.width === 0) return null; // Wait for mount

  return (
    <div className="absolute inset-0 z-0 bg-gray-950">
      <ForceGraph3D
        ref={fgRef}
        graphData={filteredData}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="#030712" // Tailwind gray-950
        nodeThreeObject={nodeThreeObject}
        onNodeClick={handleNodeClick}
        onBackgroundClick={handleBackgroundClick}
        enableNodeDrag={false}
        cooldownTicks={100}
        // Link styling - Best practices applied (organic curves, ultra-thin, low opacity)
        linkWidth={0.2}
        linkCurvature={link => (link as any).__curvature || 0}
        linkCurveRotation={link => (link as any).__curveRotation || 0}
        // @ts-ignore - react-force-graph-3d types restrict linkOpacity to number, but runtime supports function
        linkOpacity={link => {
          if (searchFocusNodes) {
            const sId = typeof link.source === 'object' ? (link.source as any).id : link.source;
            const tId = typeof link.target === 'object' ? (link.target as any).id : link.target;
            if (!searchFocusNodes.has(sId) || !searchFocusNodes.has(tId)) return 0.01;
          }
          return 0.1;
        }}
        linkColor={(link: any) => {
          const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
          const targetId = typeof link.target === 'object' ? link.target.id : link.target;
          // Subtler default color, but high contrast for highlights
          return highlightedLinks[`${sourceId}-${targetId}`] ? '#ff4500' : (link.color || 'rgba(200, 215, 240, 0.2)');
        }}
        linkDirectionalArrowLength={1.5}
        linkDirectionalArrowRelPos={1}
        // Particle setup
        linkDirectionalParticleWidth={2}
        linkDirectionalParticleColor={() => '#ff4500'}
        linkDirectionalParticleSpeed={0.02 * playbackSpeed}
      />
    </div>
  );
}
