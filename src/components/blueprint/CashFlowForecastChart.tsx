"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";
import { TrendingUp, Info } from "lucide-react";

interface CashFlowForecastChartProps {
  arTerms: string;
  apExtension: number;
  minBuffer: number;
  apVolume: number;
  arVolume: number;
}

export default function CashFlowForecastChart({
  arTerms,
  apExtension,
  minBuffer,
  apVolume,
  arVolume,
}: CashFlowForecastChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  // Generate 30 days of data
  const chartData = useMemo(() => {
    const data: { day: number; unopt: number; opt: number }[] = [];
    
    const startingCash = apVolume * 5;
    let currentUnopt = startingCash; // Starting Cash
    let currentOpt = startingCash;

    for (let day = 1; day <= 30; day++) {
      // 1. Compute Base Changes (Slow operational drift)
      let change = -(apVolume * 0.025); 
      
      // 2. Outbound Payments (AP)
      let unoptAP = day === 12 ? -apVolume : 0;
      let optAP = day === (12 + apExtension) ? -apVolume : 0;

      // Dynamic scaled payroll / supplier outflows
      if (day === 18) {
        change -= (apVolume * 0.78);
      }
      if (day === 25) {
        change -= (apVolume * 0.56);
      }

      // 3. Inbound Payments (AR)
      let unoptAR = 0;
      let optAR = 0;
      if (day === 10 && arTerms !== "Standard") {
        optAR = arVolume - (arVolume * 0.02); // actual AR minus 2% discount
      }

      currentUnopt += change + unoptAP + unoptAR;
      currentOpt += change + optAP + optAR;

      data.push({
        day,
        unopt: currentUnopt,
        opt: currentOpt,
      });
    }

    return data;
  }, [arTerms, apExtension, arVolume, apVolume]);

  // Dimension helpers for SVG
  const width = 640;
  const height = 280;
  const padding = { top: 20, right: 20, bottom: 40, left: 70 };

  const startingCash = apVolume * 5;
  const minCashVal = startingCash - (apVolume * 3.4);
  const maxCashVal = startingCash + (apVolume * 3.2);

  // Scale functions
  const getX = (day: number) => {
    return padding.left + ((day - 1) / 29) * (width - padding.left - padding.right);
  };

  const getY = (val: number) => {
    const clamped = Math.max(minCashVal, Math.min(maxCashVal, val));
    return (
      height -
      padding.bottom -
      ((clamped - minCashVal) / (maxCashVal - minCashVal)) *
        (height - padding.top - padding.bottom)
    );
  };

  // Build SVG Paths
  const unoptPath = useMemo(() => {
    return chartData
      .map((d, i) => `${i === 0 ? "M" : "L"} ${getX(d.day)} ${getY(d.unopt)}`)
      .join(" ");
  }, [chartData]);

  const optPath = useMemo(() => {
    return chartData
      .map((d, i) => `${i === 0 ? "M" : "L"} ${getX(d.day)} ${getY(d.opt)}`)
      .join(" ");
  }, [chartData]);

  // Forecast status check
  const lowestOptValue = useMemo(() => {
    return Math.min(...chartData.map((d) => d.opt));
  }, [chartData]);

  const lowestUnoptValue = useMemo(() => {
    return Math.min(...chartData.map((d) => d.unopt));
  }, [chartData]);

  const isOptimizedSafe = lowestOptValue >= minBuffer;

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col space-y-4 relative overflow-hidden shadow-lg h-full">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-300 flex items-center">
          <TrendingUp className="w-4 h-4 mr-2 text-evolver-viridian" />
          30-Day Liquidity & Cash Runway Simulation
        </h3>
        <div className="flex items-center space-x-4 text-[10px]">
          <div className="flex items-center space-x-1">
            <span className="w-2 h-0.5 bg-slate-400 dark:bg-slate-500 inline-block border-t border-dashed"></span>
            <span className="text-slate-500 dark:text-slate-450">Before</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-1 bg-emerald-500 inline-block rounded-full"></span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">After</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full flex-1 min-h-[220px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
        >
          {/* Y Axis Gridlines */}
          {[1000000, 1500000, 2000000, 2500000].map((val) => (
            <g key={val} className="opacity-20 dark:opacity-20">
              <line
                x1={padding.left}
                y1={getY(val)}
                x2={width - padding.right}
                y2={getY(val)}
                stroke={isDark ? "#fff" : "#475569"}
                strokeWidth="1"
              />
              <text
                x={padding.left - 10}
                y={getY(val) + 4}
                fill={isDark ? "#fff" : "#475569"}
                fontSize="10"
                fontFamily="monospace"
                textAnchor="end"
              >
                ${(val / 1000000).toFixed(1)}M
              </text>
            </g>
          ))}

          {/* X Axis Gridlines & Labels */}
          {[1, 5, 10, 15, 20, 25, 30].map((day) => (
            <text
              key={day}
              x={getX(day)}
              y={height - 15}
              fill={isDark ? "#94a3b8" : "#475569"}
              fontSize="9"
              fontFamily="monospace"
              textAnchor="middle"
              className="opacity-60"
            >
              Day {day}
            </text>
          ))}

          {/* Buffer Target Threshold Line */}
          <g>
            <line
              x1={padding.left}
              y1={getY(minBuffer)}
              x2={width - padding.right}
              y2={getY(minBuffer)}
              stroke="#ef4444"
              strokeWidth="1.5"
              strokeDasharray="4,4"
              className="opacity-50 dark:opacity-60"
            />
            <rect
              x={width - 150}
              y={getY(minBuffer) - 18}
              width="130"
              height="14"
              rx="4"
              fill="#ef4444"
              className="opacity-15 dark:opacity-20"
            />
            <text
              x={width - 85}
              y={getY(minBuffer) - 8}
              fill={isDark ? "#fca5a5" : "#b91c1c"}
              fontSize="8"
              fontWeight="bold"
              textAnchor="middle"
            >
              Min. Buffer: ${(minBuffer / 1000000).toFixed(2)}M
            </text>
          </g>

          {/* Unoptimized Path Line */}
          <path
            d={unoptPath}
            fill="none"
            stroke="#ef4444"
            strokeWidth="1.5"
            strokeDasharray="4,3"
            className="opacity-40 dark:opacity-40"
          />

          {/* Optimized Path Line */}
          <path
            d={optPath}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            className="drop-shadow-[0_0_8px_rgba(16,185,129,0.3)] transition-all duration-500"
          />

          {/* Value Dot Highlights */}
          {lowestUnoptValue < minBuffer && (
            <g>
              {/* Pulsing Sonar Ring */}
              <circle
                cx={getX(18)}
                cy={getY(chartData[17].unopt)}
                r="6"
                fill="#ef4444"
                className="animate-ping opacity-75"
              />
              {/* Solid Center Core */}
              <circle
                cx={getX(18)}
                cy={getY(chartData[17].unopt)}
                r="4.5"
                fill="#ef4444"
              />
            </g>
          )}

          {isOptimizedSafe && (
            <circle
              cx={getX(30)}
              cy={getY(chartData[29].opt)}
              r="5"
              fill="#10b981"
            />
          )}
        </svg>
      </div>

      {/* Info panel */}
      <div className="flex items-start space-x-2 text-[10.5px] p-2.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5">
        <Info className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 mt-0.5 flex-shrink-0" />
        <div className="text-slate-700 dark:text-slate-400">
          {isOptimizedSafe ? (
            <span className="text-slate-600 dark:text-slate-300">
              <strong className="text-emerald-700 dark:text-emerald-400">Optimization Successful:</strong> Proactive interventions pull early customer capital and delay outbound payments. Cash balance remains strictly above the red line threshold.
            </span>
          ) : (
            <span className="text-slate-600 dark:text-slate-300">
              <strong className="text-rose-600 dark:text-rose-400">Buffer Violated:</strong> Under the current parameters, your forecasted liquidity is projected to dip to{" "}
              <strong className="font-mono text-rose-700 dark:text-rose-300">${(lowestUnoptValue / 1000000).toFixed(2)}M</strong> on Day 18 (Payroll), breaching your defined cash safety buffer. Adjust the sliders to resolve the deficit.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
