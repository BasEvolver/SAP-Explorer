"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";

const Tree = dynamic(() => import("react-d3-tree"), { ssr: false });

interface LogicalTreeProps {
  data: any;
}

export default function LogicalTree({ data }: LogicalTreeProps) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

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

  const renderCustomNodeElement = ({ nodeDatum, toggleNode }: any) => {
    const isNodeRoot = nodeDatum.attributes?.isRoot;
    const nodeBg = isNodeRoot
      ? (isDark ? "#1D4E89" : "#2563EB")
      : (isDark ? "#090E17" : "#F8FAFC");
    const nodeStroke = isNodeRoot
      ? (isDark ? "#52a68a" : "#60A5FA")
      : (isDark ? "#40826D" : "#CBD5E1");
    const primaryText = isDark ? "white" : "#0F172A";
    const secondaryText = isDark ? "#94a3b8" : "#64748B";
    const expandCircleFill = isDark ? "#40826D" : "#2563EB";

    return (
      <g>
        <rect
          width="180"
          height="60"
          x="-90"
          y="-30"
          fill={nodeBg}
          stroke={nodeStroke}
          strokeWidth="2"
          rx="8"
          onClick={toggleNode}
          className="transition-colors duration-300 hover:fill-slate-800 dark:hover:fill-slate-850 cursor-pointer"
        />
        <text fill={primaryText} strokeWidth="0" x="0" y="-5" textAnchor="middle" className="font-bold text-sm font-mono">
          {nodeDatum.name}
        </text>
        <text fill={secondaryText} strokeWidth="0" x="0" y="15" textAnchor="middle" className="text-xs">
          {nodeDatum.attributes?.description || "Table"}
        </text>
        {nodeDatum.children && nodeDatum.children.length > 0 && (
          <circle cx="0" cy="30" r="10" fill={expandCircleFill} onClick={toggleNode} className="cursor-pointer" />
        )}
        {nodeDatum.children && nodeDatum.children.length > 0 && (
          <text fill="white" x="0" y="34" textAnchor="middle" className="text-xs pointer-events-none">
            {nodeDatum.__rd3t.collapsed ? "+" : "-"}
          </text>
        )}
      </g>
    );
  };

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
