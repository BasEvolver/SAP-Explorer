"use client";

import { ShieldCheck, ShieldAlert, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import clsx from "clsx";

interface RuleEngineStatusProps {
  arTerms: string;
  apExtension: number;
  minBuffer: number;
  lowestOptValue: number;
  lowestUnoptValue: number;
  discountRate: number;
}

export default function RuleEngineStatus({
  arTerms,
  apExtension,
  minBuffer,
  lowestOptValue,
  lowestUnoptValue,
  discountRate,
}: RuleEngineStatusProps) {
  // Rule 1: TR-09 (Buffer rule)
  const isTr09Passed = lowestOptValue >= minBuffer;

  // Rule 2: AR-02 (AR Discount limit rule: Max discount 2% unless severe cash crunch < 15 days runway)
  const isAr02Passed = discountRate <= 2.0 || lowestUnoptValue < minBuffer;

  // Rule 3: AP-01 (AP Extension Limit rule: Max DPO extension 15 days without triggering vendor flags)
  const isAp01Passed = apExtension <= 15;

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col space-y-4 shadow-lg">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <h3 className="text-sm font-bold text-slate-300 flex items-center">
          <ShieldCheck className="w-4 h-4 mr-2 text-evolver-viridian" />
          Policy-as-Code / Deterministic Rule Engine
        </h3>
        <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
          v2.4.1-STABLE
        </span>
      </div>

      <div className="space-y-3.5">
        {/* Rule TR-09 */}
        <div className="flex items-start justify-between space-x-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
          <div className="flex-1 space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold text-slate-200">TR-09</span>
              <span className="text-[10px] text-slate-500 font-semibold">• Liquidity Safeguard</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Maintain active cash reserve above the configured minimum buffer of <strong>${(minBuffer / 1000000).toFixed(2)}M</strong>.
            </p>
          </div>
          <div className="flex-shrink-0 pt-0.5">
            {isTr09Passed ? (
              <span className="flex items-center space-x-1 text-emerald-400 font-semibold text-xs">
                <CheckCircle2 className="w-4.5 h-4.5" />
                <span>PASSED</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-rose-400 font-semibold text-xs">
                <XCircle className="w-4.5 h-4.5" />
                <span>BREACH</span>
              </span>
            )}
          </div>
        </div>

        {/* Rule AR-02 */}
        <div className="flex items-start justify-between space-x-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
          <div className="flex-1 space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold text-slate-200">AR-02</span>
              <span className="text-[10px] text-slate-500 font-semibold">• Revenue Leakage Cap</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Limit early payment incentive discounts to <strong>&le; 2.0%</strong> unless an active cash deficit triggers an emergency exception.
            </p>
          </div>
          <div className="flex-shrink-0 pt-0.5">
            {isAr02Passed ? (
              <span className="flex items-center space-x-1 text-emerald-400 font-semibold text-xs">
                <CheckCircle2 className="w-4.5 h-4.5" />
                <span>PASSED</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-yellow-400 font-semibold text-xs">
                <AlertTriangle className="w-4.5 h-4.5" />
                <span>OVERRIDE</span>
              </span>
            )}
          </div>
        </div>

        {/* Rule AP-01 */}
        <div className="flex items-start justify-between space-x-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
          <div className="flex-1 space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold text-slate-200">AP-01</span>
              <span className="text-[10px] text-slate-500 font-semibold">• Supply Chain Integrity</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Days Payable Outstanding (DPO) extension must not exceed <strong>15 days</strong> to preserve critical vendor relationships (ASML).
            </p>
          </div>
          <div className="flex-shrink-0 pt-0.5">
            {isAp01Passed ? (
              <span className="flex items-center space-x-1 text-emerald-400 font-semibold text-xs">
                <CheckCircle2 className="w-4.5 h-4.5" />
                <span>PASSED</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-rose-400 font-semibold text-xs">
                <ShieldAlert className="w-4.5 h-4.5 text-rose-400" />
                <span>FLAGGED</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
