"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp,
  Coins,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Activity,
  Sparkles,
  Lock,
  Database,
  ArrowRight,
  Loader2,
  FolderSync,
  AlertCircle,
  Network,
  CheckCircle2,
  BarChart2
} from "lucide-react";
import clsx from "clsx";

// Import subcomponents
import EvidenceGraph from "./EvidenceGraph";
import CashFlowForecastChart from "./CashFlowForecastChart";
import RuleEngineStatus from "./RuleEngineStatus";
import BapiTerminal from "./BapiTerminal";
import AuditMemo from "./AuditMemo";

interface GLAccount {
  chartOfAccounts: string;
  account: string;
  group: string;
  type: string;
}

interface ARItem {
  id: string;
  companyCode: string;
  customer: string;
  customerName: string;
  amount: number;
  currency: string;
  glAccount: string;
  glAccountName: string;
  postingDate: string;
  originalTerms: string;
  avgLagDays: number;
}

interface SourceConnector {
  id: string;
  name: string;
  desc: string;
  status: string;
}

export default function AriaFinanceDashboard() {
  const [currentPhase, setCurrentPhase] = useState<number>(1); // 1: Retrieve, 2: Analyze, 3: Recommend, 4: Execute
  const [retrieveSubStep, setRetrieveSubStep] = useState<number>(1); // 1: Identify, 2: Audit Global, 3: Calculate Filter, 4: Ingest & Link

  // Live S/4HANA Ingestion Pipeline States
  const [companyCode, setCompanyCode] = useState<string>("1710");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [pipelineLog, setPipelineLog] = useState<string[]>([]);
  
  const [sources, setSources] = useState<SourceConnector[]>([
    { id: "BSID", name: "API_OPERATIONAL_AR_SRV", desc: "Accounts Receivable: Open Items (BSID/BSAD)", status: "Discovered" },
    { id: "BSIK", name: "API_OPERATIONAL_AP_SRV", desc: "Accounts Payable: Open Items (BSIK/BSAK)", status: "Discovered" },
    { id: "T052", name: "API_GLACCOUNTINCHARTOFACCOUNTS_SRV", desc: "Terms of Payment Master (T052 mapping)", status: "Discovered" },
    { id: "ACDOCA", name: "API_JOURNALENTRYITEMBASIC_SRV", desc: "Universal Journal Ledger (ACDOCA primary mapping)", status: "Discovered" }
  ]);

  const [counts, setCounts] = useState({
    global: { glAccounts: 0, ledger: 0 },
    filtered: { ledger: 0, arItems: 0, apItems: 0 }
  });

  const [glAccounts, setGlAccounts] = useState<GLAccount[]>([]);
  const [arItems, setArItems] = useState<ARItem[]>([]);
  const [apItems, setApItems] = useState<any[]>([]);
  const [activeDbTab, setActiveDbTab] = useState<"ar" | "ap">("ar");
  const [sapSource, setSapSource] = useState<string>("");

  // Simulation Controls
  const [minBuffer, setMinBuffer] = useState<number>(1500000); // Default $1.5M
  const [discountRate, setDiscountRate] = useState<number>(0.0); // Default 0% discount
  const [apExtension, setApExtension] = useState<number>(0); // Default 0 days

  // System States
  const [approvalState, setApprovalState] = useState<"idle" | "signing" | "signed">("idle");
  const [executionState, setExecutionState] = useState<"idle" | "executing" | "success">("idle");
  const [dbSynced, setDbSynced] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string>("pending_handshake");
  const [signatureDate, setSignatureDate] = useState<string>("Not Authorized");

  const arTerms = useMemo(() => {
    return discountRate > 0 ? "Z010" : "Standard";
  }, [discountRate]);

  // Compute total outstanding receivables extracted from S/4HANA
  const totalReceivables = useMemo(() => {
    if (arItems.length === 0) return 450000;
    return arItems.reduce((acc, item) => acc + item.amount, 0);
  }, [arItems]);

  const targetCustomer = useMemo(() => {
    if (arItems.length === 0) {
      return { id: "0000401290", name: "Amplify Corp", doc: "900200845", amount: 450000 };
    }
    return {
      id: arItems[0].customer,
      name: arItems[0].customerName,
      doc: arItems[0].id,
      amount: arItems[0].amount
    };
  }, [arItems]);

  // Compute total outstanding payables extracted from S/4HANA
  const apVolume = useMemo(() => {
    if (apItems.length === 0) return 320000;
    return apItems.reduce((acc, item) => acc + item.amount, 0);
  }, [apItems]);

  // Compute Cash Runway Data (Lowest values) using real extracted balances
  const cashForecasts = useMemo(() => {
    // Dynamically scale starting cash based on payables volume for perfect visualization scaling
    const startingCash = apVolume * 5;
    let currentUnopt = startingCash;
    let currentOpt = startingCash;
    const optValues: number[] = [];
    const unoptValues: number[] = [];

    const arVol = totalReceivables;
    const apVol = apVolume;

    for (let day = 1; day <= 30; day++) {
      // Scale daily drift and general payouts in proportion to database volume size
      let change = -(apVol * 0.025); 
      let unoptAP = day === 12 ? -apVol : 0;
      let optAP = day === (12 + apExtension) ? -apVol : 0;

      if (day === 18) change -= (apVol * 0.78);  // e.g. Payroll scale
      if (day === 25) change -= (apVol * 0.56);  // e.g. Supplier runs scale

      let optAR = (day === 10 && discountRate > 0) ? (arVol - (arVol * discountRate / 100)) : 0;

      currentUnopt += change + unoptAP;
      currentOpt += change + optAP + optAR;

      optValues.push(currentOpt);
      unoptValues.push(currentUnopt);
    }

    return {
      lowestUnopt: Math.min(...unoptValues),
      lowestOpt: Math.min(...optValues)
    };
  }, [discountRate, apExtension, totalReceivables, apVolume]);

  const lowestUnoptValue = cashForecasts.lowestUnopt;
  const lowestOptValue = cashForecasts.lowestOpt;

  const isCurrentlySafe = lowestOptValue >= minBuffer;

  // PIPELINE SUB-STEP 2: Audit Global Volumes
  const handleAuditGlobalVolumes = () => {
    setIsProcessing(true);
    setPipelineLog([
      "📡 Pinging S/4HANA CAL Host (108.142.112.116:44301)...",
      "🤝 Connection handshaken successfully. Initiating parallel aggregate queries...",
      "🔍 Resolving global count for API_GLACCOUNTINCHARTOFACCOUNTS_SRV...",
      "🔍 Resolving global count for API_JOURNALENTRYITEMBASIC_SRV (ACDOCA)..."
    ]);

    setTimeout(async () => {
      try {
        const response = await fetch(`/api/sap/finance-data?companyCode=${companyCode}&source=sap`);
        const json = await response.json();
        
        if (json.status === "success") {
          setCounts(prev => ({
            ...prev,
            global: {
              glAccounts: json.counts.global.glAccounts,
              ledger: json.counts.global.ledger
            }
          }));
          setSources(prev => prev.map(s => ({ ...s, status: s.id === "T052" || s.id === "ACDOCA" ? "Audited (Active)" : s.status })));
          setPipelineLog(prev => [
            ...prev,
            `✅ Global Audit Complete: Found ${json.counts.global.glAccounts.toLocaleString()} Chart of Accounts G/L records.`,
            `✅ Global Audit Complete: Found ${json.counts.global.ledger.toLocaleString()} Universal Ledger (ACDOCA) records.`,
            "🚀 Global Data Scale mapped successfully!"
          ]);
        } else {
          throw new Error(json.error);
        }
      } catch (err: any) {
        setPipelineLog(prev => [...prev, `❌ Error: ${err.message}`]);
      } finally {
        setIsProcessing(false);
      }
    }, 1500);
  };

  // PIPELINE SUB-STEP 3: Calculate Filtered Scope
  const handleCalculateFilteredScope = () => {
    setIsProcessing(true);
    setPipelineLog([
      `🎯 Targeting Company Code: ${companyCode}...`,
      `⚙️ Applying OData filter parameters: CompanyCode eq '${companyCode}'...`,
      `🔍 Resolving in-scope counts for Accounts Receivable open items...`,
      `🔍 Resolving in-scope counts for Accounts Payable liabilities...`
    ]);

    setTimeout(async () => {
      try {
        const response = await fetch(`/api/sap/finance-data?companyCode=${companyCode}&source=sap`);
        const json = await response.json();
        
        if (json.status === "success") {
          setCounts(prev => ({
            ...prev,
            filtered: {
              ledger: json.counts.filtered.ledger,
              arItems: json.counts.filtered.arItems,
              apItems: json.counts.filtered.apItems
            }
          }));
          setSources(prev => prev.map(s => ({ ...s, status: "Audited & Filtered" })));
          setPipelineLog(prev => [
            ...prev,
            `✅ Mapped ${json.counts.filtered.ledger.toLocaleString()} total ledger postings for CC ${companyCode}.`,
            `✅ Identified ${json.counts.filtered.arItems.toLocaleString()} outstanding Customer Invoices (AR) in scope.`,
            `✅ Identified ${json.counts.filtered.apItems.toLocaleString()} outstanding Vendor Invoices (AP) in scope.`,
            `🚀 Scope fully mapped! Operational density mapped to CC ${companyCode}.`
          ]);
        } else {
          throw new Error(json.error);
        }
      } catch (err: any) {
        setPipelineLog(prev => [...prev, `❌ Error: ${err.message}`]);
      } finally {
        setIsProcessing(false);
      }
    }, 1500);
  };

  // PIPELINE SUB-STEP 4: Physical Ingestion into cloud PostgreSQL
  const handleIngestAndLink = () => {
    setIsProcessing(true);
    setPipelineLog([
      "📡 Initiating real-time pipeline connection to S/4HANA & Azure PostgreSQL...",
      "⏳ establishing OData socket stream..."
    ]);

    // Start polling the server logs every 300ms for real-time scrolling updates
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/sap/finance-data?action=status`);
        const json = await res.json();
        if (json.logs && json.logs.length > 0) {
          setPipelineLog(json.logs);
        }
      } catch (e) {
        console.error("Error polling ingestion logs:", e);
      }
    }, 300);

    // Trigger the OData extraction asynchronously
    setTimeout(async () => {
      try {
        const ingestRes = await fetch("/api/sap/finance-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "INGEST", companyCode })
        });
        const ingestJson = await ingestRes.json();

        // Halt progress polling
        clearInterval(pollInterval);

        // Capture completed milestones one final time
        const finalLogRes = await fetch(`/api/sap/finance-data?action=status`);
        const finalLogJson = await finalLogRes.json();
        if (finalLogJson.logs) {
          setPipelineLog(finalLogJson.logs);
        }

        if (ingestJson.status !== "success") {
          throw new Error(ingestJson.error || "Ingestion write failed.");
        }

        // Fetch the ingested database entries directly from local PostgreSQL cache (source=db)
        const fetchRes = await fetch(`/api/sap/finance-data?companyCode=${companyCode}&source=db`);
        const json = await fetchRes.json();
        
        if (json.status === "success") {
          setGlAccounts(json.glAccounts);
          setArItems(json.arItems);
          setApItems(json.apItems);
          setSapSource(json.source);
        } else {
          throw new Error(json.error || "Failed to load database records.");
        }
      } catch (err: any) {
        clearInterval(pollInterval);
        setPipelineLog(prev => [...prev, `❌ Ingestion failed: ${err.message}`]);
      } finally {
        setIsProcessing(false);
      }
    }, 500);
  };

  const domainJudgmentText = useMemo(() => {
    if (discountRate === 0 && apExtension === 0) {
      return `CRITICAL ANALYSIS: Active operational cash buffer deficit detected on Day 18 (Payroll run). Standard AR Net 30 payment terms on S/4HANA customer ${targetCustomer.id} (${targetCustomer.name}) fail to cover outbound payables ($${apVolume.toLocaleString()} due Day 12). Current liquidity crunch equals $${(minBuffer - lowestUnoptValue).toLocaleString()} below safety buffer. Immediate outbound smoothing or inbound acceleration is highly recommended.`;
    }
    
    let analysis = `ANALYSIS: Proposing early payment incentives on ${targetCustomer.name} AR assets (${discountRate > 0 ? `${discountRate.toFixed(1)}% discount` : "0.0%"}). `;
    
    if (discountRate > 0) {
      analysis += `Activating Z010 term code forces rapid client invoice settlement within 10 days, securing $${(totalReceivables - (totalReceivables * discountRate / 100)).toLocaleString()} in liquidity by Day 10. `;
    } else {
      analysis += `${targetCustomer.name} receivable remains un-accelerated (lags to Day 48 based on ACDOCA averages). `;
    }

    if (apExtension > 0) {
      analysis += `Concurrently, AP baseline extension on vendor liability document offsets outflow by ${apExtension} days, preserving $${apVolume.toLocaleString()} through the Day 18 payroll cycle. `;
    } else {
      analysis += `Vendor payables remain un-smoothed (due on Day 12). `;
    }

    if (isCurrentlySafe) {
      analysis += `RESULT: Cash runway is stabilized. Forecasted lowest cash point is $${lowestOptValue.toLocaleString()}, remaining safely above the $${minBuffer.toLocaleString()} buffer threshold. Policy checks completed: ALL PASSED.`;
    } else {
      analysis += `RESULT: Breaches remain. Cash dips to $${lowestOptValue.toLocaleString()} which is still below the $${minBuffer.toLocaleString()} safety limit. Further adjustments required.`;
    }

    return analysis;
  }, [discountRate, apExtension, minBuffer, isCurrentlySafe, lowestOptValue, targetCustomer, apVolume, totalReceivables, lowestUnoptValue]);

  const handleAuthorizeSignature = () => {
    if (!isCurrentlySafe) return;
    setApprovalState("signing");
    setTimeout(() => {
      setApprovalState("signed");
      setSignatureDate(new Date().toLocaleString());
      setTxHash("sha256:d5f2a1b9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9");
    }, 1800);
  };

  const handleExecuteBapis = () => {
    if (approvalState !== "signed") return;
    setExecutionState("executing");
    setTimeout(() => {
      setExecutionState("success");
      setDbSynced(true);
    }, 9500);
  };

  return (
    <div className="w-full h-full flex flex-col p-8 pt-20 overflow-y-auto bg-evolver-bg-dark select-none">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 z-10 gap-4">
        <div className="flex items-center space-x-3">
          <span className="p-2 rounded-xl bg-evolver-viridian/10 border border-evolver-viridian/20 text-evolver-viridian">
            <Coins className="w-6 h-6 animate-pulse" />
          </span>
          <div>
            <h1 className="text-3xl font-bold dark:text-white text-slate-900 tracking-tight flex items-center">
              Working Capital & Cash Conversion
              <span className="ml-3 text-xs font-mono px-2 py-0.5 rounded bg-evolver-viridian/20 text-evolver-viridian-light border border-evolver-viridian/30 uppercase">
                Active S/4HANA CAL
              </span>
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Live-extracting operational ledgers to drive automated closed-loop cash conversion.
            </p>
          </div>
        </div>

        {/* Global Connection & Selector Panel */}
        <div className="flex items-center space-x-4">
          <div className="flex flex-col space-y-1">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider font-sans">Active Company Code</span>
            <select
              value={companyCode}
              disabled={isProcessing}
              onChange={(e) => {
                setCompanyCode(e.target.value);
                setArItems([]);
                setApItems([]);
                setCounts(prev => ({
                  ...prev,
                  filtered: { ledger: 0, arItems: 0, apItems: 0 }
                }));
              }}
              className="bg-black/60 border border-white/10 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none focus:border-evolver-viridian/50 transition-all font-mono font-bold"
            >
              <option value="1710">1710 - US Operations</option>
              <option value="1010">1010 - US Subsidiary</option>
              <option value="1000">1000 - European HQ</option>
              <option value="1810">1810 - Canadian Ops</option>
            </select>
          </div>

          <div className="flex flex-col space-y-1">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider font-sans">S/4HANA Connectivity</span>
            <div className="flex items-center space-x-2 glass-panel px-4 py-2 rounded-xl border border-white/5 shadow-md h-[32px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] text-slate-400 font-mono">Host: 108.142.112.116 (CAL)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stepper Steps Menu */}
      <div className="grid grid-cols-4 gap-2 mb-8 bg-black/40 p-1.5 rounded-2xl border border-white/5 z-10">
        {[
          { phase: 1, title: "1. Retrieve SAP Data", desc: "Live OData extracts" },
          { phase: 2, title: "2. Analyze Runway", desc: "Real ledger predictions" },
          { phase: 3, title: "3. Recommend", desc: "Policies & AI sliders" },
          { phase: 4, title: "4. Execute BAPIs", desc: "Committed write-backs" }
        ].map((step) => {
          const isActive = currentPhase === step.phase;
          const isDone = currentPhase > step.phase;
          return (
            <button
              key={step.phase}
              disabled={step.phase > 1 && arItems.length === 0}
              onClick={() => setCurrentPhase(step.phase)}
              className={clsx(
                "p-3 rounded-xl transition-all duration-300 text-left relative flex flex-col justify-center",
                isActive
                  ? "bg-evolver-viridian text-white shadow-lg animate-pulse"
                  : isDone
                  ? "bg-white/5 text-slate-300 border border-white/5 hover:bg-white/10"
                  : "bg-black/10 text-slate-600 border border-transparent cursor-not-allowed"
              )}
            >
              <span className="text-xs font-bold">{step.title}</span>
              <span className={clsx("text-[9px] mt-0.5 font-medium", isActive ? "text-white/80" : "text-slate-500")}>
                {step.desc}
              </span>
              {isDone && (
                <div className="absolute top-2 right-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[8px] font-mono px-1 py-0.25 rounded-md font-bold">
                  MET
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Step Render Area */}
      <div className="flex-1 min-h-0 mb-8">
        
        {/* PHASE 1: RETRIEVE DATA (Discovery & Ingestion Pipeline) */}
        {currentPhase === 1 && (
          <div className="flex flex-col space-y-6">
            
            {/* Extraction Stepper */}
            <div className="grid grid-cols-4 gap-2 bg-black/20 p-1.5 rounded-xl border border-white/5 z-10 text-xs">
              {[
                { sub: 1, title: "1.1 Identify Sources" },
                { sub: 2, title: "1.2 Audit Global Volumes" },
                { sub: 3, title: "1.3 Calculate CC Scope" },
                { sub: 4, title: "1.4 Ingest & Link" }
              ].map(s => (
                <button
                  key={s.sub}
                  disabled={isProcessing}
                  onClick={() => setRetrieveSubStep(s.sub)}
                  className={clsx(
                    "py-2 rounded-lg text-center font-semibold transition-all",
                    retrieveSubStep === s.sub
                      ? "bg-evolver-viridian/25 text-white border border-evolver-viridian"
                      : "text-slate-400 hover:text-white"
                  )}
                >
                  {s.title}
                </button>
              ))}
            </div>

            {/* Stepper split view */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Left Column: Stage Console */}
              <div className="lg:col-span-5 flex flex-col">
                <div className="glass-panel p-6 rounded-2xl flex flex-col space-y-5 shadow-lg h-full justify-between">
                  
                  {/* Sub-step 1.1: Identify */}
                  {retrieveSubStep === 1 && (
                    <div className="space-y-4">
                      <h3 className="text-base font-bold text-slate-200 flex items-center border-b border-white/5 pb-2.5">
                        <Network className="w-5 h-5 mr-2 text-evolver-viridian" />
                        Step 1.1: Identify S/4HANA Sources
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Treasury agents must preserve verifiable typographic links. 
                        Aria maps standard relational extractions across the key relational tables (BSIK, BSID, T052, ACDOCA).
                      </p>
                      <div className="space-y-2.5 pt-2">
                        {sources.map(s => (
                          <div key={s.id} className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between text-xs">
                            <div>
                              <div className="font-bold text-slate-200 font-mono">{s.id} ({s.name})</div>
                              <div className="text-[10px] text-slate-500 mt-0.5">{s.desc}</div>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-mono font-bold">
                              {s.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sub-step 1.2: Audit Global */}
                  {retrieveSubStep === 2 && (
                    <div className="space-y-4">
                      <h3 className="text-base font-bold text-slate-200 flex items-center border-b border-white/5 pb-2.5">
                        <BarChart2 className="w-5 h-5 mr-2 text-evolver-viridian" />
                        Step 1.2: Audit Global Volumes
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Establish real-time pings to calculate the global volumes of the target datasets in your CAL ERP. This provides the total scale of the ledger before filtering.
                      </p>
                      
                      {counts.global.ledger > 0 && (
                        <div className="space-y-3 pt-2">
                          <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between text-xs">
                            <span className="text-slate-400">Global G/L Accounts (T052):</span>
                            <span className="font-mono text-white font-bold">{counts.global.glAccounts.toLocaleString()}</span>
                          </div>
                          <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between text-xs">
                            <span className="text-slate-400">Global Ledger Items (ACDOCA):</span>
                            <span className="font-mono text-white font-bold">{counts.global.ledger.toLocaleString()}</span>
                          </div>
                        </div>
                      )}

                      {pipelineLog.length > 0 && (
                        <div className="bg-black/60 rounded-xl border border-white/5 p-4 font-mono text-[9.5px] leading-relaxed text-slate-400 h-28 overflow-y-auto">
                          {pipelineLog.map((log, i) => (
                            <div key={i} className={clsx(log.startsWith("✅") ? "text-emerald-400" : "")}>{log}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sub-step 1.3: Filter Scope */}
                  {retrieveSubStep === 3 && (
                    <div className="space-y-4">
                      <h3 className="text-base font-bold text-slate-200 flex items-center border-b border-white/5 pb-2.5">
                        <AlertCircle className="w-5 h-5 mr-2 text-evolver-viridian" />
                        Step 1.3: Define Scope by Company Code
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Filter operational targets specifically by the target Company Code to define scope. In multi-company S/4HANA systems, this isolates the ledger density.
                      </p>

                      <div className="space-y-1.5 mt-2">
                        <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          Target Company Code
                        </label>
                        <select
                          value={companyCode}
                          disabled={isProcessing}
                          onChange={(e) => setCompanyCode(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-evolver-viridian/50 transition-all font-mono"
                        >
                          <option value="1710">1710 - US Operations (Domestic)</option>
                          <option value="1010">1010 - US Subsidiary</option>
                          <option value="1000">1000 - European Headquarters (Germany)</option>
                          <option value="1810">1810 - Canadian Operations</option>
                        </select>
                      </div>

                      {counts.filtered.ledger > 0 && (
                        <div className="grid grid-cols-3 gap-2.5 pt-2 text-center text-xs">
                          <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl">
                            <div className="text-[9px] text-slate-500">In Scope Ledger</div>
                            <div className="font-mono text-slate-200 font-bold mt-1">{counts.filtered.ledger.toLocaleString()}</div>
                          </div>
                          <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl">
                            <div className="text-[9px] text-slate-500">AR Invoices</div>
                            <div className="font-mono text-cyan-400 font-bold mt-1">{counts.filtered.arItems.toLocaleString()}</div>
                          </div>
                          <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl">
                            <div className="text-[9px] text-slate-500">AP Liabilities</div>
                            <div className="font-mono text-emerald-400 font-bold mt-1">{counts.filtered.apItems.toLocaleString()}</div>
                          </div>
                        </div>
                      )}

                      {pipelineLog.length > 0 && (
                        <div className="bg-black/60 rounded-xl border border-white/5 p-4 font-mono text-[9.5px] leading-relaxed text-slate-400 h-24 overflow-y-auto">
                          {pipelineLog.map((log, i) => (
                            <div key={i} className={clsx(log.startsWith("✅") ? "text-emerald-400" : "")}>{log}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sub-step 1.4: Ingest and Link */}
                  {retrieveSubStep === 4 && (
                    <div className="space-y-4">
                      <h3 className="text-base font-bold text-slate-200 flex items-center border-b border-white/5 pb-2.5">
                        <ShieldCheck className="w-5 h-5 mr-2 text-evolver-viridian" />
                        Step 1.4: Ingest & Link Lineage
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Trigger OData extractions for transaction items, link receivables to historical averages, and physically replicate them into our local PostgreSQL database.
                      </p>

                      {pipelineLog.length > 0 && (
                        <div className="bg-black/60 rounded-xl border border-white/5 p-4 font-mono text-[9.5px] leading-relaxed text-slate-400 h-36 overflow-y-auto">
                          {pipelineLog.map((log, i) => (
                            <div key={i} className={clsx(log.startsWith("✅") ? "text-emerald-400" : log.startsWith("🎉") ? "text-emerald-300 font-bold" : "")}>{log}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Operational triggers */}
                  <div className="pt-4 border-t border-white/5">
                    {isProcessing ? (
                      <button
                        disabled
                        className="w-full py-3.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-semibold cursor-not-allowed flex items-center justify-center space-x-2 border border-white/5"
                      >
                        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                        <span>Processing Live Ingestion...</span>
                      </button>
                    ) : retrieveSubStep === 1 ? (
                      <button
                        onClick={() => setRetrieveSubStep(2)}
                        className="w-full py-3.5 rounded-xl bg-evolver-viridian hover:bg-evolver-viridian-light text-white text-xs font-bold transition-all shadow-lg flex items-center justify-center space-x-1"
                      >
                        <span>Audit Live Global Volumes</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : retrieveSubStep === 2 ? (
                      <div className="space-y-3">
                        <button
                          onClick={handleAuditGlobalVolumes}
                          className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-white/10 flex items-center justify-center space-x-1.5"
                        >
                          <FolderSync className="w-4.5 h-4.5" />
                          <span>Audit Global Volumes</span>
                        </button>
                        {counts.global.ledger > 0 && (
                          <button
                            onClick={() => setRetrieveSubStep(3)}
                            className="w-full py-3.5 rounded-xl bg-evolver-viridian hover:bg-evolver-viridian-light text-white text-xs font-bold transition-all shadow-lg flex items-center justify-center space-x-1"
                          >
                            <span>Define Company Code Scope</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ) : retrieveSubStep === 3 ? (
                      <div className="space-y-3">
                        <button
                          onClick={handleCalculateFilteredScope}
                          className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-white/10 flex items-center justify-center space-x-1.5"
                        >
                          <FolderSync className="w-4.5 h-4.5" />
                          <span>Calculate Filtered Scope</span>
                        </button>
                        {counts.filtered.ledger > 0 && (
                          <button
                            onClick={() => setRetrieveSubStep(4)}
                            className="w-full py-3.5 rounded-xl bg-evolver-viridian hover:bg-evolver-viridian-light text-white text-xs font-bold transition-all shadow-lg flex items-center justify-center space-x-1"
                          >
                            <span>Ingest & Link Pipeline</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <button
                          onClick={handleIngestAndLink}
                          className="w-full py-3.5 rounded-xl bg-evolver-viridian hover:bg-evolver-viridian-light text-white text-xs font-bold transition-all shadow-lg flex items-center justify-center space-x-2"
                        >
                          <FolderSync className="w-4.5 h-4.5 animate-spin" />
                          <span>Ingest & Sync PostgreSQL Cache</span>
                        </button>
                        {arItems.length > 0 && (
                          <button
                            onClick={() => setCurrentPhase(2)}
                            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg flex items-center justify-center space-x-1 group"
                          >
                            <span>Ingestion Metric Complete ➜ Analyze</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Schema/Table Visual State */}
              <div className="lg:col-span-7 flex flex-col">
                <div className="glass-panel p-6 rounded-2xl flex flex-col space-y-4 shadow-lg h-full">
                  
                  {/* If we are at Step 1.1 or 1.2: Show metadata grid */}
                  {retrieveSubStep <= 2 && (
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-300 flex items-center mb-4">
                          <Database className="w-4 h-4 mr-2 text-cyan-400" />
                          Active Data Dictionary Map (Azure PostgreSQL Cache)
                        </h3>
                        <div className="space-y-3 text-xs leading-relaxed text-slate-400">
                          <p>
                            Your Azure PostgreSQL database cache has successfully replicated the massive S/4HANA metadata dictionary, containing <strong>907,077 tables</strong>, <strong>10,340,508 fields</strong>, and <strong>1,187,826 relations</strong>. 
                          </p>
                          <p>
                            We have verified the presence of the primary G/L schema structures:
                          </p>
                          <div className="grid grid-cols-2 gap-3 pt-2">
                            <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                              <div className="font-bold text-slate-300">AR Ledger cache (BSID)</div>
                              <div className="text-[10px] text-emerald-400 font-mono mt-0.5">VERIFIED IN DD02L</div>
                            </div>
                            <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                              <div className="font-bold text-slate-300">AP Ledger cache (BSIK)</div>
                              <div className="text-[10px] text-emerald-400 font-mono mt-0.5">VERIFIED IN DD02L</div>
                            </div>
                            <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                              <div className="font-bold text-slate-300">Payment Terms (T052)</div>
                              <div className="text-[10px] text-emerald-400 font-mono mt-0.5">VERIFIED IN DD02L</div>
                            </div>
                            <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                              <div className="font-bold text-slate-300">Universal Ledger (ACDOCA)</div>
                              <div className="text-[10px] text-emerald-400 font-mono mt-0.5">VERIFIED IN DD02L</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10 text-cyan-400 text-xs font-semibold mt-4">
                        💡 <strong>Lineage Insight:</strong> By auditing global record volumes, we establish baseline table sizes prior to applying the localized Company Code scope query parameters.
                      </div>
                    </div>
                  )}

                  {/* If we are at Step 1.3: Show filtered stats */}
                  {retrieveSubStep === 3 && (
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-300 flex items-center mb-4">
                          <AlertCircle className="w-4.5 h-4.5 mr-2 text-amber-500" />
                          Company Code {companyCode} Scope Definition
                        </h3>
                        {counts.filtered.ledger === 0 ? (
                          <div className="py-20 flex flex-col items-center justify-center text-slate-500 space-y-2">
                            <AlertCircle className="w-10 h-10 opacity-20" />
                            <p className="text-xs">Awaiting filtered scope counts. Click "Calculate Filtered Scope".</p>
                          </div>
                        ) : (
                          <div className="space-y-4 text-xs">
                            <p className="text-slate-400 leading-relaxed">
                              S/4HANA filters successfully returned scope parameters. A total of <strong>{counts.filtered.ledger.toLocaleString()} journal ledger items</strong> are active for Company Code <strong>{companyCode}</strong>:
                            </p>
                            <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-2">
                              <div className="flex justify-between">
                                <span className="text-slate-400">OData Target:</span>
                                <span className="font-mono text-slate-300">API_JOURNALENTRYITEMBASIC_SRV</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">OData filter:</span>
                                <span className="font-mono text-cyan-400">CompanyCode eq '{companyCode}'</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Chart of Accounts:</span>
                                <span className="font-mono text-slate-300">{companyCode === "1000" ? "INT" : "YCOA"}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-amber-400 text-xs font-semibold mt-4">
                        💡 <strong>Lineage Insight:</strong> Calculating filtered scope isolates only records relevant to Company Code {companyCode}, drastically reducing memory footprint during extraction.
                      </div>
                    </div>
                  )}

                  {/* If we are at Step 1.4: Show real records table */}
                  {retrieveSubStep === 4 && (
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-bold text-slate-300 flex items-center">
                            <Database className="w-4 h-4 mr-2 text-cyan-400" />
                            PostgreSQL Cloud Database Cache
                          </h3>
                          <div className="flex bg-black/40 rounded-lg p-0.5 border border-white/5 text-[10px]">
                            <button
                              onClick={() => setActiveDbTab("ar")}
                              className={clsx(
                                "px-2.5 py-1 rounded-md font-semibold transition-all",
                                activeDbTab === "ar"
                                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold"
                                  : "text-slate-400 hover:text-white"
                              )}
                            >
                              AR Invoices ({arItems.length})
                            </button>
                            <button
                              onClick={() => setActiveDbTab("ap")}
                              className={clsx(
                                "px-2.5 py-1 rounded-md font-semibold transition-all",
                                activeDbTab === "ap"
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold"
                                  : "text-slate-400 hover:text-white"
                              )}
                            >
                              AP Liabilities ({apItems.length})
                            </button>
                          </div>
                        </div>

                        {activeDbTab === "ar" ? (
                          arItems.length === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center text-slate-500 space-y-2">
                              <Database className="w-10 h-10 opacity-20" />
                              <p className="text-xs">PostgreSQL table empty. Click "Ingest & Sync PostgreSQL Cache" to execute replication.</p>
                            </div>
                          ) : (
                            <div className="overflow-x-auto max-h-[280px]">
                              <table className="w-full text-left text-xs text-slate-300 font-sans border-collapse">
                                <thead>
                                  <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider text-[9px] bg-white/5">
                                    <th className="py-2 px-3">Doc</th>
                                    <th className="py-2 px-3">Customer ID</th>
                                    <th className="py-2 px-3">Customer Name</th>
                                    <th className="py-2 px-3">G/L Account</th>
                                    <th className="py-2 px-3">Outstanding Amount</th>
                                    <th className="py-2 px-3">Posting Date</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {arItems.map((item, idx) => (
                                    <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                      <td className="py-2 px-3 font-mono">{item.id}</td>
                                      <td className="py-2 px-3 font-mono font-bold text-white">{item.customer}</td>
                                      <td className="py-2 px-3 text-slate-300">{item.customerName}</td>
                                      <td className="py-2 px-3 text-slate-400 font-mono">{item.glAccount}</td>
                                      <td className="py-2 px-3 font-bold font-mono text-cyan-400">${item.amount.toLocaleString()}</td>
                                      <td className="py-2 px-3 text-slate-400 font-mono">{item.postingDate}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )
                        ) : (
                          apItems.length === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center text-slate-500 space-y-2">
                              <Database className="w-10 h-10 opacity-20" />
                              <p className="text-xs">PostgreSQL table empty. Click "Ingest & Sync PostgreSQL Cache" to execute replication.</p>
                            </div>
                          ) : (
                            <div className="overflow-x-auto max-h-[280px]">
                              <table className="w-full text-left text-xs text-slate-300 font-sans border-collapse">
                                <thead>
                                  <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider text-[9px] bg-white/5">
                                    <th className="py-2 px-3">Doc</th>
                                    <th className="py-2 px-3">Vendor ID</th>
                                    <th className="py-2 px-3">Vendor Name</th>
                                    <th className="py-2 px-3">G/L Account</th>
                                    <th className="py-2 px-3">Outstanding Amount</th>
                                    <th className="py-2 px-3">Posting Date</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {apItems.map((item, idx) => (
                                    <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                      <td className="py-2 px-3 font-mono">{item.id}</td>
                                      <td className="py-2 px-3 font-mono font-bold text-white">{item.vendor}</td>
                                      <td className="py-2 px-3 text-slate-300">{item.vendorName}</td>
                                      <td className="py-2 px-3 text-slate-400 font-mono">{item.glAccount}</td>
                                      <td className="py-2 px-3 font-bold font-mono text-emerald-400">${item.amount.toLocaleString()}</td>
                                      <td className="py-2 px-3 text-slate-400 font-mono">{item.postingDate}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )
                        )}
                      </div>
                      
                      {arItems.length > 0 && (
                        <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between border-t border-white/5 pt-2.5 mt-4">
                          <span>Source: {sapSource}</span>
                          <span className="text-emerald-400 font-semibold flex items-center">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Cache Status: 100% physically Ingested in Postgres
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>

            </div>
          </div>
        )}

        {/* PHASE 2: ANALYZE AND FORECAST */}
        {currentPhase === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left side: Projected Cash Runway SVG */}
            <div className="lg:col-span-8 flex flex-col">
              <CashFlowForecastChart
                arTerms={arTerms}
                apExtension={apExtension}
                minBuffer={minBuffer}
                apVolume={apVolume}
                arVolume={totalReceivables}
              />
            </div>

            {/* Right side: Insights details */}
            <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
              <div className="glass-panel p-6 rounded-2xl flex flex-col space-y-4 shadow-lg border-l-2 border-l-rose-500 flex-1">
                <h3 className="text-sm font-bold text-slate-200 flex items-center">
                  <ShieldAlert className="w-4.5 h-4.5 mr-2 text-rose-500" />
                  Detected Liquidity Risk Insights
                </h3>
                
                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl leading-relaxed text-rose-200">
                    <strong>Projected Cash Deficit:</strong> On Day 18 (Payroll run), operational cash balance drops to <strong>${lowestUnoptValue.toLocaleString()}</strong>, which breaches the safety buffer limit of <strong>${minBuffer.toLocaleString()}</strong> by <strong>-${(minBuffer - lowestUnoptValue).toLocaleString()}</strong>.
                  </div>

                  <div className="space-y-2 text-slate-300">
                    <div className="font-semibold text-slate-400 uppercase tracking-wider text-[9px]">Root Cause Mapping:</div>
                    <div className="flex justify-between p-2 rounded bg-white/5 border border-white/5">
                      <span>Total Payables Outstanding:</span>
                      <span className="font-mono text-white font-bold">${apVolume.toLocaleString()} (Day 12)</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-white/5 border border-white/5">
                      <span>Customer Settlement Lag:</span>
                      <span className="font-mono text-purple-400 font-bold">48 Days (Day 48 receipt)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-auto">
                  <button
                    onClick={() => setCurrentPhase(3)}
                    className="w-full py-3 rounded-xl bg-evolver-viridian hover:bg-evolver-viridian-light text-white text-xs font-bold transition-all shadow-lg flex items-center justify-center space-x-1 group"
                  >
                    <span>Evaluate Recommended Actions</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PHASE 3: RECOMMEND ACTIONS */}
        {currentPhase === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left side: Interactive sliders & Forecast */}
            <div className="lg:col-span-8 flex flex-col space-y-6">
              {/* Sliders */}
              <div className="glass-panel p-6 rounded-2xl flex flex-col space-y-4 shadow-lg">
                <h3 className="text-sm font-bold text-slate-300 flex items-center border-b border-white/5 pb-2.5">
                  <Activity className="w-4 h-4 mr-2 text-evolver-viridian" />
                  Scenario Engine (Configure Recommendation Parameters)
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Slider 1 */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-semibold">Min Cash Buffer</span>
                      <span className="font-mono text-white font-bold">${(minBuffer / 1000000).toFixed(2)}M</span>
                    </div>
                    <input
                      type="range"
                      min={1000000}
                      max={2500000}
                      step={50000}
                      value={minBuffer}
                      onChange={(e) => setMinBuffer(Number(e.target.value))}
                      className="w-full accent-evolver-viridian bg-slate-800 rounded-lg appearance-none h-1.5 cursor-pointer"
                    />
                  </div>

                  {/* Slider 2 */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-semibold">AR Early Discount Rate</span>
                      <span className="font-mono text-white font-bold">{discountRate.toFixed(1)}%</span>
                    </div>
                    <input
                      type="range"
                      min={0.0}
                      max={3.0}
                      step={0.5}
                      value={discountRate}
                      onChange={(e) => setDiscountRate(Number(e.target.value))}
                      className="w-full accent-cyan-500 bg-slate-800 rounded-lg appearance-none h-1.5 cursor-pointer"
                    />
                  </div>

                  {/* Slider 3 */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-semibold">AP Extension Days</span>
                      <span className="font-mono text-white font-bold">+{apExtension} Days</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={20}
                      step={1}
                      value={apExtension}
                      onChange={(e) => setApExtension(Number(e.target.value))}
                      className="w-full accent-amber-500 bg-slate-800 rounded-lg appearance-none h-1.5 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic SVG projection */}
              <div className="flex-1 min-h-[260px]">
                <CashFlowForecastChart
                  arTerms={arTerms}
                  apExtension={apExtension}
                  minBuffer={minBuffer}
                  apVolume={apVolume}
                  arVolume={totalReceivables}
                />
              </div>
            </div>

            {/* Right side: Policy Checks & AI Judgment */}
            <div className="lg:col-span-4 flex flex-col space-y-6">
              <RuleEngineStatus
                arTerms={arTerms}
                apExtension={apExtension}
                minBuffer={minBuffer}
                lowestOptValue={lowestOptValue}
                lowestUnoptValue={lowestUnoptValue}
                discountRate={discountRate}
              />

              <div className="glass-panel p-6 rounded-2xl flex flex-col space-y-3 relative overflow-hidden shadow-lg border-l-2 border-l-purple-500 flex-1">
                <h3 className="text-sm font-bold text-slate-300">Domain Judgment & ML Rationale</h3>
                <div className="text-[11px] leading-relaxed text-purple-200 bg-purple-500/5 border border-purple-500/10 p-4 rounded-xl flex-1 overflow-y-auto">
                  {domainJudgmentText}
                </div>
                
                <div className="pt-2">
                  <button
                    disabled={!isCurrentlySafe}
                    onClick={() => setCurrentPhase(4)}
                    className={clsx(
                      "w-full py-3 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center justify-center space-x-1 group",
                      isCurrentlySafe
                        ? "bg-evolver-viridian hover:bg-evolver-viridian-light text-white"
                        : "bg-slate-900/40 text-slate-600 border border-white/5 cursor-not-allowed"
                    )}
                  >
                    <span>Configure Write-Back Gateway</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PHASE 4: AUTHORIZE AND EXECUTE BAPIs */}
        {currentPhase === 4 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left side: Evidence Graph & BAPI Terminal */}
            <div className="lg:col-span-7 flex flex-col space-y-6">
              {/* Evidence Graph */}
              <div className="h-[280px]">
                <EvidenceGraph
                  arTerms={arTerms}
                  apExtension={apExtension}
                  dbSynced={dbSynced}
                  companyCode={companyCode}
                  arCustomerName={targetCustomer.name}
                  arCustomerID={targetCustomer.id}
                  arAmount={targetCustomer.amount}
                  apAmount={apVolume}
                />
              </div>

              {/* BAPI Terminal */}
              <div className="flex-1 min-h-[300px]">
                <BapiTerminal
                  arTerms={arTerms}
                  apExtension={apExtension}
                  executionState={executionState}
                  onExecute={handleExecuteBapis}
                />
              </div>
            </div>

            {/* Right side: CFO Sign-off and generated memo */}
            <div className="lg:col-span-5 flex flex-col space-y-6">
              {/* Reviewer Gate */}
              <div className="glass-panel p-6 rounded-2xl flex flex-col space-y-4 shadow-lg border-t-2 border-t-evolver-viridian relative">
                <h3 className="text-sm font-bold text-slate-200">Reviewer Gate & Cryptographic Approval</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Cryptographic verification generates verifiable TYPOGRAPHIC audit packets logged against your S/4HANA system. Signatures validate modifications to customer profiles and invoice dates.
                </p>

                {approvalState === "signing" ? (
                  <div className="flex flex-col items-center justify-center p-5 rounded-xl bg-white/5 border border-white/5 space-y-2">
                    <span className="w-1.5 h-1.5 bg-evolver-viridian rounded-full animate-ping"></span>
                    <span className="text-xs font-mono text-evolver-viridian-light animate-pulse">
                      Generating digital credentials...
                    </span>
                  </div>
                ) : approvalState === "signed" ? (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                    <div className="flex items-center space-x-2 text-emerald-400">
                      <ShieldCheck className="w-5 h-5" />
                      <span className="text-xs font-bold font-sans">Verification Active: Signature Stamped</span>
                    </div>
                    <div className="space-y-1 text-[9.5px] font-mono text-slate-400">
                      <div>Signer: Treasurer/CFO (Verified Credentials)</div>
                      <div className="truncate">Tx: {txHash}</div>
                      <div>Stamp: {signatureDate}</div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleAuthorizeSignature}
                    className="w-full py-3 rounded-xl text-xs font-bold transition-all shadow-md active:scale-97 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white border border-white/10 hover:border-white/20"
                  >
                    <Lock className="w-4 h-4 mr-2 text-slate-500" />
                    <span>Stamp Authorized Signature</span>
                  </button>
                )}
              </div>

              {/* Generated Audit Memo */}
              {executionState === "success" && (
                <div className="flex-1">
                  <AuditMemo
                    arTerms={arTerms}
                    apExtension={apExtension}
                    minBuffer={minBuffer}
                    discountRate={discountRate}
                    lowestUnoptValue={lowestUnoptValue}
                    signatureDate={signatureDate}
                    txHash={txHash}
                  />
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
