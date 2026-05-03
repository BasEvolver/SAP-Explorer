"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const Tree = dynamic(() => import("react-d3-tree"), { ssr: false });

interface LogicalTreeProps {
  data: any;
}

export default function LogicalTree({ data }: LogicalTreeProps) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      // Get the parent container's dimensions to fit the tree canvas
      const container = document.getElementById("tree-wrapper");
      if (container) {
        setDimensions({
          width: container.clientWidth,
          height: container.clientHeight,
        });
      }
    };

    window.addEventListener("resize", updateDimensions);
    updateDimensions();

    // Short timeout to ensure flex layout is calculated
    setTimeout(updateDimensions, 50);

    return () => window.removeEventListener("resize", updateDimensions);
  }, [data]);

  const renderCustomNodeElement = ({ nodeDatum, toggleNode }: any) => (
    <g>
      <rect
        width="180"
        height="60"
        x="-90"
        y="-30"
        fill={nodeDatum.attributes?.isRoot ? "#1D4E89" : "#090E17"}
        stroke={nodeDatum.attributes?.isRoot ? "#52a68a" : "#40826D"}
        strokeWidth="2"
        rx="8"
        onClick={toggleNode}
        className="transition-colors duration-300 hover:fill-slate-800 cursor-pointer"
      />
      <text fill="white" strokeWidth="0" x="0" y="-5" textAnchor="middle" className="font-bold text-sm font-mono">
        {nodeDatum.name}
      </text>
      <text fill="#94a3b8" strokeWidth="0" x="0" y="15" textAnchor="middle" className="text-xs">
        {nodeDatum.attributes?.description || "Table"}
      </text>
      {nodeDatum.children && nodeDatum.children.length > 0 && (
        <circle cx="0" cy="30" r="10" fill="#40826D" onClick={toggleNode} className="cursor-pointer" />
      )}
      {nodeDatum.children && nodeDatum.children.length > 0 && (
        <text fill="white" x="0" y="34" textAnchor="middle" className="text-xs pointer-events-none">
          {nodeDatum.__rd3t.collapsed ? "+" : "-"}
        </text>
      )}
    </g>
  );

  return (
    <div id="tree-wrapper" className="w-full h-full relative">
      {dimensions.width > 0 && (
        <Tree
          data={data}
          dimensions={dimensions}
          translate={{ x: dimensions.width / 2, y: 100 }}
          orientation="vertical"
          pathFunc="step"
          renderCustomNodeElement={renderCustomNodeElement}
          separation={{ siblings: 2, nonSiblings: 2 }}
        />
      )}
    </div>
  );
}
