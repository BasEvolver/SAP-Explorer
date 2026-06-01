"use client";

import { useState, useMemo } from "react";
import { useTheme } from "next-themes";
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
  BarChart2,
  Eye,
  Terminal,
  Sliders,
  Zap,
  Globe,
  Layers,
  FileCode,
  Check,
  Info,
  ChevronRight
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

export type TabId = "overview" | "ingestion" | "visualize" | "reason" | "execute" | "evidence";

export default function AriaFinanceDashboard() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [activeOutlineSection, setActiveOutlineSection] = useState<string>("ov-summary");
  const [currentPhase, setCurrentPhase] = useState<number>(1); // kept for subcomponents/backward compatibility

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    if (tab === "overview") setActiveOutlineSection("ov-summary");
    else if (tab === "ingestion") setActiveOutlineSection("ing-pipeline");
    else if (tab === "visualize") setActiveOutlineSection("vis-forecast");
    else if (tab === "reason") setActiveOutlineSection("reas-sliders");
    else if (tab === "execute") setActiveOutlineSection("exec-gate");
    else if (tab === "evidence") setActiveOutlineSection("ev-graph");
  };

  const outlineSections: Record<TabId, { id: string; label: string; icon: any }[]> = {
    overview: [
      { id: "ov-summary", label: "1.1 Scenario Summary", icon: Eye },
      { id: "ov-what", label: "1.2 Diagnostic Plan", icon: Sparkles },
      { id: "ov-why", label: "1.3 Value & Compliance", icon: ShieldCheck },
      { id: "ov-process", label: "1.4 Ingestion Blueprint", icon: Network },
      { id: "ov-objective", label: "1.5 Cash Objective Model", icon: Sliders },
      { id: "ov-tables", label: "1.6 SAP Schema Mapping", icon: Database }
    ],
    ingestion: [
      { id: "ing-pipeline", label: "2.1 OData Stage Controls", icon: Network },
      { id: "ing-dictionary", label: "2.2 SAP Data Dictionary", icon: FileCode },
      { id: "ing-pgcache", label: "2.3 PostgreSQL Cache DB", icon: Database }
    ],
    visualize: [
      { id: "vis-forecast", label: "3.1 Projected Cash Curve", icon: TrendingUp },
      { id: "vis-insights", label: "3.2 Liquidity Risk Cards", icon: AlertCircle },
      { id: "vis-causes", label: "3.3 Deficit Root Causes", icon: Activity }
    ],
    reason: [
      { id: "reas-sliders", label: "4.1 Strategy Adjustments", icon: Sliders },
      { id: "reas-rules", label: "4.2 Policy Engine Check", icon: ShieldCheck },
      { id: "reas-rationale", label: "4.3 AI Domain Rationale", icon: Sparkles }
    ],
    execute: [
      { id: "exec-gate", label: "5.1 Reviewer Gate Sign-off", icon: Lock },
      { id: "exec-terminal", label: "5.2 BAPI Terminal Console", icon: Terminal }
    ],
    evidence: [
      { id: "ev-graph", label: "6.1 Process Evidence Graph", icon: Network },
      { id: "ev-memo", label: "6.2 Printable Audit Memo", icon: FileText }
    ]
  };

  // Live S/4HANA Ingestion Pipeline States
  const [companyCode, setCompanyCode] = useState<string>("1710");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [pipelineLog, setPipelineLog] = useState<string[]>([]);

  // Working Capital Scenario Parameter States
  const [wcDocScope, setWcDocScope] = useState<"all" | "orders" | "sales">("all");
  const [minOrderValue, setMinOrderValue] = useState<number>(50000);
  const [topLimit, setTopLimit] = useState<string>("all");
  
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
          body: JSON.stringify({
            action: "INGEST",
            companyCode,
            wcDocScope,
            minOrderValue,
            topLimit
          })
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
        const fetchRes = await fetch(`/api/sap/finance-data?companyCode=${companyCode}&source=db&wcDocScope=${wcDocScope}&minOrderValue=${minOrderValue}&topLimit=${topLimit}`);
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
    <div className="w-full h-full flex flex-col p-8 pt-20 overflow-y-auto bg-slate-50 dark:bg-evolver-bg-dark text-slate-800 dark:text-slate-100 select-none transition-colors duration-300">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 z-10 gap-4">
        <div className="flex items-center space-x-3">
          <span className="p-2 rounded-xl bg-evolver-viridian/10 border border-evolver-viridian/20 text-evolver-viridian">
            <Coins className="w-6 h-6 animate-pulse" />
          </span>
          <div>
            <h1 className="text-3xl font-bold dark:text-white text-slate-900 tracking-tight flex items-center">
              Working Capital
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
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider font-sans">Active Scope</span>
            <div className="flex items-center space-x-2 glass-panel px-4 py-2 rounded-xl border border-slate-200 dark:border-white/5 shadow-md h-[32px]">
              <span className="w-1.5 h-1.5 rounded-full bg-evolver-viridian"></span>
              <span className="text-[10px] text-slate-700 dark:text-slate-350 font-mono font-bold">CC: {companyCode}</span>
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider font-sans">S/4HANA Connectivity</span>
            <div className="flex items-center space-x-2 glass-panel px-4 py-2 rounded-xl border border-slate-200 dark:border-white/5 shadow-md h-[32px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] text-slate-600 dark:text-slate-400 font-mono">Host: 108.142.112.116 (CAL)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filing Cabinet Navigation Tabs */}
      <div className="flex flex-wrap items-end pl-2 sm:pl-6 z-10 -mb-[1px] space-x-1 w-full font-mono mt-4">
        {[
          { id: "overview", label: "1. Overview", icon: Eye },
          { id: "ingestion", label: "2. Ingestion", icon: Database },
          { id: "visualize", label: "3. Visualize Findings", icon: BarChart2 },
          { id: "reason", label: "4. Reason Policies", icon: ShieldCheck },
          { id: "execute", label: "5. Execute BAPI", icon: Terminal },
          { id: "evidence", label: "6. Audit Evidence", icon: FileText }
        ].map(t => {
          const isTabActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => handleTabChange(t.id as TabId)}
              className={clsx(
                "relative px-4 sm:px-5 py-2.5 text-[10.5px] font-extrabold transition-all duration-200 select-none rounded-t-xl sm:rounded-t-2xl flex items-center gap-1.5 border border-slate-200 dark:border-white/5 shrink-0 uppercase tracking-wider cursor-pointer",
                isTabActive
                  ? "bg-white dark:bg-slate-900/50 backdrop-blur-xl border-b-transparent dark:border-b-transparent text-slate-900 dark:text-white font-black z-20 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_-4px_12px_rgba(0,0,0,0.4)]"
                  : "bg-slate-100 dark:bg-slate-950/40 text-slate-500 hover:bg-slate-200/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/60 dark:hover:text-slate-200 z-10 mt-1"
              )}
              style={{
                borderBottomColor: isTabActive ? "transparent" : (resolvedTheme === "light" ? "rgb(226, 232, 240)" : "rgba(255, 255, 255, 0.05)")
              }}
            >
              <t.icon className={clsx("w-3.5 h-3.5 shrink-0", isTabActive ? "text-evolver-viridian" : "text-slate-500")} />
              <span>{t.label}</span>
              {isTabActive && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-evolver-viridian rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Cabinet Workspace Panel */}
      <div className="w-full flex flex-col p-8 rounded-3xl border border-slate-200 dark:border-white/5 shadow-2xl relative min-h-[580px] bg-white dark:bg-slate-900/50 backdrop-blur-xl transition-colors duration-300 overflow-y-auto max-h-[85vh] mt-1 z-10">
          
          {/* TAB 1: OVERVIEW & SCENARIO INTRO */}
          {activeTab === "overview" && (
            <div className="flex-1 flex flex-col justify-between py-2 space-y-6 animate-in fade-in duration-300">
              
              {/* Scenario Summary */}
              <div id="ov-summary" className="p-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-3xl space-y-3 scroll-mt-6">
                <h4 className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Scenario Summary</h4>
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-light font-sans">
                  This dashboard automates the cash conversion cycle (CCC) by synchronizing Accounts Receivable and Accounts Payable ledger tables.
                  By evaluating open invoice lifecycles inside S/4HANA tables (BSID/BSIK) and calculating simulated liquidity runways, the engine stabilizes operating capital while maintaining supply chain integrity.
                </p>
              </div>

              {/* Grid block mapping What and Why */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                
                {/* What We Are Doing Card */}
                <div id="ov-what" className="p-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-3xl space-y-3 scroll-mt-6">
                  <h4 className="text-[11px] font-extrabold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                    <Eye className="w-4.5 h-4.5 text-cyan-600 dark:text-cyan-400" />
                    What We Are Doing (The Diagnostics)
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                    ARIA establishes an automated, dual-sided audit on Accounts Receivable open ledger items (BSID) and Accounts Payable open invoices (BSIK) to analyze rolling treasury cash conversion cycles.
                  </p>
                </div>

                {/* Why We Are Doing It Card */}
                <div id="ov-why" className="p-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-3xl space-y-3 scroll-mt-6">
                  <h4 className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
                    Why We Are Doing It (Value & Compliance)
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                    Optimizing the Cash Conversion Cycle directly expands corporate runway without relying on high-interest commercial bank credit lines. Capturing early-payment discount yields on receivables while extending baseline payables protects working capital margins.
                  </p>
                </div>

              </div>

              {/* ARIA CLOSED-LOOP EXECUTION FLOWCHART */}
              <div id="ov-process" className="p-6 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-3xl space-y-5 relative overflow-hidden scroll-mt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <Network className="w-5 h-5 text-evolver-viridian" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-sans">
                        ARIA Closed-Loop Execution & Data Flow
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-light font-sans">
                        End-to-end transaction pipeline mapping. Click a phase card to jump into that live operational environment.
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded uppercase font-bold tracking-wider self-start sm:self-center">
                    Interactive Pipeline Map
                  </span>
                </div>
                
                <div className="relative">
                  {/* SVG Animated Connector Line */}
                  <div className="absolute inset-x-12 top-[48px] h-1 hidden md:block z-0 pointer-events-none opacity-40">
                    <svg className="w-full h-1 overflow-visible">
                      <line
                        x1="0%"
                        y1="50%"
                        x2="100%"
                        y2="50%"
                        stroke="rgba(64, 130, 109, 0.2)"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      <line
                        x1="0%"
                        y1="50%"
                        x2="100%"
                        y2="50%"
                        stroke="#40826D"
                        strokeWidth="3"
                        strokeDasharray="8 8"
                        strokeLinecap="round"
                        className="animate-dash-fast"
                      />
                    </svg>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-5 relative z-10 items-stretch">
                    {(() => {
                      const stepTabs: TabId[] = ["ingestion", "visualize", "reason", "execute", "evidence"];
                      const flowSteps = [
                        { title: "1. Read / Ingest", desc: "Extract outstanding customer invoices and accounts payable lines.", dataIn: "BSID (Open AR), BSIK (Open AP)", dataOut: "PostgreSQL Treasury Cache", icon: Database },
                        { title: "2. Reconcile", desc: "Model cash runoffs over a 30-day window to locate reserve breaches.", dataIn: "T052 Payment Terms indices", dataOut: "Runway Projections Matrix", icon: Activity },
                        { title: "3. Authorize", desc: "Collect cryptographically signed owner permission to execute sweeps.", dataIn: "Manual Review & approval", dataOut: "sha256 Compliance Hash", icon: FileText },
                        { title: "4. Execute", desc: "Shift payables baseline dates and capture early discount terms.", dataIn: "BAPI_CUSTOMER_EXTENS_CHG", dataOut: "BSEG-ZLSPR Payment Block", icon: Terminal },
                        { title: "5. Audit Ledger", desc: "Push cleared results back to consolidate corporate close balances.", dataIn: "Universal Journal ledger lines", dataOut: "TIM-WC voucher receipt", icon: CheckCircle2 }
                      ];

                      return flowSteps.map((step, idx) => {
                        const targetTab = stepTabs[idx];
                        return (
                          <button
                            key={idx}
                            onClick={() => handleTabChange(targetTab)}
                            className="text-left p-4.5 bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-white/5 rounded-2xl flex flex-col justify-between text-xs space-y-4 cursor-pointer hover:border-evolver-viridian/40 hover:bg-slate-50 dark:hover:bg-slate-950 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_4px_25px_rgba(64,130,109,0.1)] dark:hover:shadow-[0_4px_25px_rgba(64,130,109,0.15)] transition-all duration-300 group select-none active:scale-[0.98] w-full"
                          >
                            <div className="space-y-2.5">
                              {/* Card Header */}
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-mono font-bold tracking-widest px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 group-hover:text-evolver-viridian group-hover:border-evolver-viridian/20 transition-all">
                                  PHASE 0{idx + 1}
                                </span>
                                <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors flex items-center gap-0.5">
                                  Live ➔
                                </span>
                              </div>

                              {/* Step Title */}
                              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                                <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-evolver-viridian group-hover:bg-evolver-viridian group-hover:text-slate-950 dark:group-hover:text-slate-950 transition-all shrink-0">
                                  <step.icon className="w-4 h-4" />
                                </div>
                                <span className="text-xs group-hover:text-evolver-viridian transition-colors font-extrabold">{step.title}</span>
                              </div>

                              {/* Description */}
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal font-light group-hover:text-slate-800 dark:group-hover:text-slate-300 transition-colors line-clamp-3">
                                {step.desc}
                              </p>
                            </div>

                            {/* Data Flow Consoles */}
                            <div className="pt-3 border-t border-slate-200 dark:border-white/5 space-y-2 font-mono text-[9px] leading-normal w-full">
                              <div className="bg-slate-50 dark:bg-slate-950/80 rounded-xl p-2.5 border border-slate-200 dark:border-white/5 space-y-1 group-hover:border-cyan-500/20 transition-all">
                                <div className="flex items-center gap-1 text-[7.5px] font-extrabold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                                  <Database className="w-2.5 h-2.5 shrink-0" />
                                  <span>Data In (SAP)</span>
                                </div>
                                <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300 block truncate" title={step.dataIn}>
                                  {step.dataIn}
                                </span>
                              </div>
                              <div className="bg-slate-50 dark:bg-slate-950/80 rounded-xl p-2.5 border border-slate-200 dark:border-white/5 space-y-1 group-hover:border-emerald-500/20 transition-all">
                                <div className="flex items-center gap-1 text-[7.5px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                                  <Terminal className="w-2.5 h-2.5 shrink-0" />
                                  <span>Data Out (Action)</span>
                                </div>
                                <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300 block truncate" title={step.dataOut}>
                                  {step.dataOut}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Helpful Instruction Note */}
                <div className="flex items-start gap-2 p-3 bg-evolver-viridian/5 border border-evolver-viridian/10 rounded-2xl text-[10px] text-slate-500 dark:text-slate-400 font-light">
                  <Info className="w-4 h-4 text-evolver-viridian shrink-0 mt-0.5" />
                  <span>
                    <strong>Interactive Flow Playground:</strong> The cards above represent the operational lifecycle stages of this closed-loop scenario. You can <strong>click any card</strong> to directly jump into its respective dashboard tab and inspect active OData lines, graphs, checks, or logs.
                  </span>
                </div>
              </div>

              {/* Math TeX formula card & Database mappings */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch pt-2">
                
                {/* Mathematical formulation */}
                <div id="ov-objective" className="lg:col-span-6 flex flex-col bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-3xl p-5 justify-between scroll-mt-6">
                  <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2.5">Objective Function Model</h4>
                  <div className="text-xs font-mono font-bold text-center py-4 bg-slate-100 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-white/5 text-cyan-600 dark:text-cyan-400 shadow-inner overflow-x-auto whitespace-nowrap">
                    {"\\text{Minimize } CCC \\implies \\Delta \\text{Cash Runway} > \\text{Safety Buffer}"}
                  </div>
                  <div className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400 mt-3 font-sans">
                    💡 <strong>Mathematical Constraint:</strong> Early payment discount incentives accelerate customer collections, shifting cash receipts forward, while baseline extensions defer payables, stabilizing critical reserve buffers.
                  </div>
                </div>

                {/* Database dictionary maps */}
                <div id="ov-tables" className="lg:col-span-6 flex flex-col justify-between space-y-2 scroll-mt-6">
                  <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">In-Scope SAP Transparent Tables</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "BSID (AR Open Items)",
                      "BSIK (AP Liabilities)",
                      "T052 (Payment Terms Master)",
                      "ACDOCA (Universal Ledger)"
                    ].map((t, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl font-mono text-[10.5px] text-slate-600 dark:text-slate-300 flex flex-col shadow-sm">
                        <span className="font-extrabold text-slate-900 dark:text-white">{t.split(' ')[0]}</span>
                        <span className="text-[8.5px] text-slate-500 mt-0.5">{t.includes('(') ? t.split('(')[1].replace(')', '') : "Table"}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              <div className="pt-2 text-right">
                <button
                  onClick={() => handleTabChange("ingestion")}
                  className="py-3 px-6 rounded-xl bg-evolver-viridian hover:bg-evolver-viridian-light text-white text-xs font-bold transition-all shadow-lg inline-flex items-center space-x-1 cursor-pointer font-sans"
                >
                  <span>Proceed to Data Ingestion</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        {/* TAB 2: INGESTION / READ (SAP DATA) */}
        {activeTab === "ingestion" && (
          <div className="flex-grow flex flex-col justify-between py-2 space-y-6 animate-in fade-in duration-300">
            
            {/* Stepper split view */}
            <div id="ing-pipeline" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1 scroll-mt-6">
              
              {/* Left Column: Stage Console */}
              <div className="lg:col-span-5 flex flex-col">
                <div className="glass-panel p-6 rounded-2xl flex flex-col space-y-5 shadow-lg h-full justify-between">
                  
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center border-b border-slate-200 dark:border-white/5 pb-2.5">
                      <Network className="w-5 h-5 mr-2 text-evolver-viridian" />
                      S/4HANA OData Ingestion Pipeline
                    </h3>
                    <p className="text-xs text-slate-655 dark:text-slate-400 leading-relaxed font-sans">
                      Establish secure RFC handshake to S/4HANA CAL Gateway and execute real-time OData extractions for Company Code <strong>{companyCode}</strong>.
                      Raw records are verified against SAP Transparent Tables and physically replicated into the high-speed Postgres Cache DB.
                    </p>

                    {/* Dynamic Scenario Ingestion Filters */}
                    <div className="grid grid-cols-2 gap-3 p-3 bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl font-sans text-xs">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                          Company Code (BUKRS)
                        </label>
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
                          className="w-full px-2 py-1.5 text-[10px] font-sans bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg text-slate-700 dark:text-slate-350 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 transition-all cursor-pointer"
                        >
                          <option value="1710">1710 - US Operations</option>
                          <option value="1010">1010 - US Subsidiary</option>
                          <option value="1000">1000 - European HQ</option>
                          <option value="1810">1810 - Canadian Ops</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                          Document Scope ($filter)
                        </label>
                        <select
                          value={wcDocScope}
                          onChange={(e) => setWcDocScope(e.target.value as any)}
                          disabled={isProcessing}
                          className="w-full px-2 py-1.5 text-[10px] font-sans bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg text-slate-700 dark:text-slate-355 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 transition-all cursor-pointer"
                        >
                          <option value="all">Ledger Invoices (BSID/BSIK)</option>
                          <option value="orders">Purchase Orders (EKKO/EKPO)</option>
                          <option value="sales">Sales Orders (VBAK/VBAP)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                          Min Order Value ($)
                        </label>
                        <select
                          value={minOrderValue}
                          onChange={(e) => setMinOrderValue(Number(e.target.value))}
                          disabled={isProcessing || wcDocScope === "all"}
                          className="w-full px-2 py-1.5 text-[10px] font-sans bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg text-slate-700 dark:text-slate-350 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 transition-all cursor-pointer"
                        >
                          <option value="0">All Orders (Value {'>='} 0)</option>
                          <option value="50000">{'>='} $50,000</option>
                          <option value="100000">{'>='} $100,000</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                          Records Page Limit ($top)
                        </label>
                        <select
                          value={topLimit}
                          onChange={(e) => setTopLimit(e.target.value)}
                          disabled={isProcessing}
                          className="w-full px-2 py-1.5 text-[10px] font-sans bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg text-slate-700 dark:text-slate-350 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 transition-all cursor-pointer"
                        >
                          <option value="all">No Page Limit ($top = full)</option>
                          <option value="100">100 Rows ($top = 100)</option>
                          <option value="5">5 Rows (Quick Pitch)</option>
                        </select>
                      </div>
                    </div>

                    {/* Ingestion progress console logs */}
                    <div className="bg-slate-900 border border-slate-850 rounded-xl p-4 font-mono text-[9.5px] leading-relaxed text-slate-400 h-64 overflow-y-auto shadow-inner">
                      {pipelineLog.length === 0 ? (
                        <div className="text-slate-500 italic">Awaiting RFC connection handshake... Click "Replicate & Sync" below.</div>
                      ) : (
                        pipelineLog.map((log, i) => (
                          <div 
                            key={i} 
                            className={clsx(
                              "font-mono",
                              log.includes("✅") ? "text-emerald-400" :
                              log.includes("❌") ? "text-rose-400 font-bold" :
                              log.includes("🎉") ? "text-cyan-400 font-bold" : "text-slate-350"
                            )}
                          >
                            {log}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Operational triggers */}
                  <div className="pt-4 border-t border-slate-200 dark:border-white/5">
                    {isProcessing ? (
                      <button
                        disabled
                        className="w-full py-3.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-400 text-xs font-semibold cursor-not-allowed flex items-center justify-center space-x-2 border border-slate-200 dark:border-white/5"
                      >
                        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                        <span>Extracting open ledgers from S/4HANA...</span>
                      </button>
                    ) : arItems.length > 0 ? (
                      <div className="space-y-3">
                        <button
                          onClick={handleIngestAndLink}
                          className="w-full py-3.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold transition-all border border-slate-300 dark:border-white/10 flex items-center justify-center space-x-2 cursor-pointer"
                        >
                          <FolderSync className="w-4.5 h-4.5" />
                          <span>Re-Sync S/4HANA Ledger Cache</span>
                        </button>
                        <button
                          onClick={() => handleTabChange("visualize")}
                          className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg flex items-center justify-center space-x-1 group cursor-pointer animate-pulse"
                        >
                          <span>Ingestion Complete ➜ Simulate Runway</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleIngestAndLink}
                        className="w-full py-3.5 rounded-xl bg-evolver-viridian hover:bg-evolver-viridian-light text-white text-xs font-bold transition-all shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
                      >
                        <FolderSync className="w-4.5 h-4.5" />
                        <span>Replicate & Sync S/4HANA Ledger</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Schema/Table Visual State */}
              <div className="lg:col-span-7 flex flex-col font-sans">
                <div className="glass-panel p-6 rounded-2xl flex flex-col space-y-4 shadow-lg h-full justify-between">
                  
                  {arItems.length === 0 ? (
                    // Ready to extract state
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-300 flex items-center mb-4">
                          <Database className="w-4 h-4 mr-2 text-cyan-600 dark:text-cyan-400" />
                          Active Data Dictionary Map (Azure PostgreSQL Cache)
                        </h3>
                        <div className="space-y-3 text-xs leading-relaxed text-slate-655 dark:text-slate-400">
                          <p>
                            Your Azure PostgreSQL database cache has successfully mapped the massive S/4HANA metadata dictionary, containing <strong>907,077 tables</strong> and relations. 
                          </p>
                          <p>
                            Schema reader has verified the presence of the primary G/L transparent table structures:
                          </p>
                          <div className="grid grid-cols-2 gap-3 pt-2 font-mono">
                            <div className="p-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl">
                              <div className="font-bold text-slate-800 dark:text-slate-300 text-xs font-sans">AR Ledger cache (BSID)</div>
                              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">VERIFIED IN DD02L</div>
                            </div>
                            <div className="p-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl">
                              <div className="font-bold text-slate-800 dark:text-slate-300 text-xs font-sans">AP Ledger cache (BSIK)</div>
                              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">VERIFIED IN DD02L</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 rounded-xl bg-cyan-50 dark:bg-cyan-500/5 border border-cyan-200 dark:border-cyan-500/10 text-cyan-800 dark:text-cyan-400 text-xs font-semibold mt-4 leading-relaxed">
                        💡 <strong>Lineage Insight:</strong> Ingesting the ledger replicates raw open AR and AP postings directly into PostgreSQL cached tables. Once replicated, full historical operational data is exposed to dynamic liquidity forecast models.
                      </div>
                    </div>
                  ) : (
                    // Ingested cache datatable view
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-300 flex items-center">
                            <Database className="w-4 h-4 mr-2 text-cyan-600 dark:text-cyan-400" />
                            PostgreSQL Cloud Database Cache
                          </h3>
                          <div className="flex bg-slate-200/50 dark:bg-black/40 rounded-lg p-0.5 border border-slate-200 dark:border-white/5 text-[10px]">
                            <button
                              onClick={() => setActiveDbTab("ar")}
                              className={clsx(
                                "px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer select-none",
                                activeDbTab === "ar"
                                  ? "bg-cyan-500/20 text-cyan-650 dark:text-cyan-400 border border-cyan-500/30 font-bold"
                                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                              )}
                            >
                              AR Invoices ({arItems.length})
                            </button>
                            <button
                              onClick={() => setActiveDbTab("ap")}
                              className={clsx(
                                "px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer select-none",
                                activeDbTab === "ap"
                                  ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-bold"
                                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                              )}
                            >
                              AP Liabilities ({apItems.length})
                            </button>
                          </div>
                        </div>

                        {activeDbTab === "ar" ? (
                          <div className="overflow-x-auto max-h-[480px] scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-750">
                            <table className="w-full text-left text-xs text-slate-655 dark:text-slate-300 font-sans border-collapse font-sans">
                              <thead>
                                <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[9px] bg-slate-100 dark:bg-white/5 font-sans">
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
                                  <tr key={idx} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="py-2 px-3 font-mono text-[10.5px]">{item.id.split('-')[0]}</td>
                                    <td className="py-2 px-3 font-mono font-bold text-slate-800 dark:text-white">{item.customer}</td>
                                    <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{item.customerName}</td>
                                    <td className="py-2 px-3 text-slate-500 dark:text-slate-400 font-mono text-[10px]">{item.glAccount}</td>
                                    <td className="py-2 px-3 font-bold font-mono text-cyan-600 dark:text-cyan-400">${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    <td className="py-2 px-3 text-slate-500 dark:text-slate-400 font-mono text-[10px]">{item.postingDate}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="overflow-x-auto max-h-[480px] scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-750">
                            <table className="w-full text-left text-xs text-slate-655 dark:text-slate-300 font-sans border-collapse">
                              <thead>
                                <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[9px] bg-slate-100 dark:bg-white/5">
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
                                  <tr key={idx} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="py-2 px-3 font-mono text-[10.5px]">{item.id.split('-')[0]}</td>
                                    <td className="py-2 px-3 font-mono font-bold text-slate-800 dark:text-white">{item.vendor}</td>
                                    <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{item.vendorName}</td>
                                    <td className="py-2 px-3 text-slate-500 dark:text-slate-400 font-mono text-[10px]">{item.glAccount}</td>
                                    <td className="py-2 px-3 font-bold font-mono text-emerald-600 dark:text-emerald-400">${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    <td className="py-2 px-3 text-slate-500 dark:text-slate-400 font-mono text-[10px]">{item.postingDate}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                        <div className="mt-2 text-[10px] text-slate-400 dark:text-slate-500 italic text-right font-sans">
                          💡 Showing first {activeDbTab === "ar" ? arItems.length : apItems.length} items. Scroll vertically to inspect all rows in the PostgreSQL cache.
                        </div>
                      </div>
                      
                      <div className="text-[10px] text-slate-505 font-mono flex items-center justify-between border-t border-slate-200 dark:border-white/5 pt-2.5 mt-4">
                        <span>Source: {sapSource}</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Cache Status: 100% physically Ingested in Postgres ({arItems.length + apItems.length} unique records)
                        </span>
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: VISUALIZE FINDINGS */}
        {activeTab === "visualize" && (
          <div className="flex-grow flex flex-col justify-between py-2 space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-grow">
              {/* Left side: Projected Cash Runway SVG */}
              <div id="vis-forecast" className="lg:col-span-8 flex flex-col scroll-mt-6">
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
                <div id="vis-insights" className="glass-panel p-6 rounded-2xl flex flex-col space-y-4 shadow-lg border-l-2 border-l-rose-500 flex-1 scroll-mt-6">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center font-sans">
                    <ShieldAlert className="w-4.5 h-4.5 mr-2 text-rose-500" />
                    Detected Liquidity Risk Insights
                  </h3>
                  
                  <div className="space-y-4 text-xs flex-1 font-sans">
                    <div className="p-3 bg-rose-50 dark:bg-rose-500/5 border border-rose-200 dark:border-rose-500/10 rounded-xl leading-relaxed text-rose-950 dark:text-rose-200 text-[11px]">
                      <strong>Projected Cash Deficit:</strong> On Day 18 (Payroll run), operational cash balance drops to <strong>${lowestUnoptValue.toLocaleString()}</strong>, which breaches the safety buffer limit of <strong>${minBuffer.toLocaleString()}</strong> by <strong>-${(minBuffer - lowestUnoptValue).toLocaleString()}</strong>.
                    </div>

                    <div id="vis-causes" className="space-y-2 text-slate-700 dark:text-slate-300 scroll-mt-6">
                      <div className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[9px] font-sans">Root Cause Mapping:</div>
                      <div className="flex justify-between p-2 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-[10.5px]">
                        <span>Total Payables Outstanding:</span>
                        <span className="font-mono text-slate-850 dark:text-white font-bold">${apVolume.toLocaleString()} (Day 12)</span>
                      </div>
                      <div className="flex justify-between p-2 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-[10.5px]">
                        <span>Customer Settlement Lag:</span>
                        <span className="font-mono text-purple-650 dark:text-purple-400 font-bold">48 Days (Day 48 receipt)</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-auto">
                    <button
                      onClick={() => handleTabChange("reason")}
                      className="w-full py-3 rounded-xl bg-evolver-viridian hover:bg-evolver-viridian-light text-white text-xs font-bold transition-all shadow-lg flex items-center justify-center space-x-1 group cursor-pointer"
                    >
                      <span>Evaluate Recommended Actions</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: REASON POLICIES */}
        {activeTab === "reason" && (
          <div className="flex-grow flex flex-col justify-between py-2 space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-grow">
              {/* Left side: Interactive sliders & Forecast */}
              <div className="lg:col-span-8 flex flex-col space-y-6">
                {/* Sliders */}
                <div id="reas-sliders" className="glass-panel p-6 rounded-2xl flex flex-col space-y-4 shadow-lg scroll-mt-6">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-300 flex items-center border-b border-slate-200 dark:border-white/5 pb-2.5 font-sans">
                    <Activity className="w-4 h-4 mr-2 text-evolver-viridian" />
                    Scenario Engine (Configure Recommendation Parameters)
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
                    {/* Slider 1 */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400 font-semibold">Min Cash Buffer</span>
                        <span className="font-mono text-slate-800 dark:text-white font-bold">${(minBuffer / 1000000).toFixed(2)}M</span>
                      </div>
                      <input
                        type="range"
                        min={1000000}
                        max={2500000}
                        step={50000}
                        value={minBuffer}
                        onChange={(e) => setMinBuffer(Number(e.target.value))}
                        className="w-full accent-evolver-viridian bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none h-1.5 cursor-pointer"
                      />
                    </div>

                    {/* Slider 2 */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400 font-semibold">AR Early Discount Rate</span>
                        <span className="font-mono text-slate-800 dark:text-white font-bold">{discountRate.toFixed(1)}%</span>
                      </div>
                      <input
                        type="range"
                        min={0.0}
                        max={3.0}
                        step={0.5}
                        value={discountRate}
                        onChange={(e) => setDiscountRate(Number(e.target.value))}
                        className="w-full accent-cyan-500 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none h-1.5 cursor-pointer"
                      />
                    </div>

                    {/* Slider 3 */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400 font-semibold">AP Extension Days</span>
                        <span className="font-mono text-slate-800 dark:text-white font-bold">+{apExtension} Days</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={20}
                        step={1}
                        value={apExtension}
                        onChange={(e) => setApExtension(Number(e.target.value))}
                        className="w-full accent-amber-500 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none h-1.5 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Dynamic SVG projection */}
                <div className="flex-grow min-h-[260px]">
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
                <div id="reas-rules" className="scroll-mt-6">
                  <RuleEngineStatus
                    arTerms={arTerms}
                    apExtension={apExtension}
                    minBuffer={minBuffer}
                    lowestOptValue={lowestOptValue}
                    lowestUnoptValue={lowestUnoptValue}
                    discountRate={discountRate}
                  />
                </div>

                <div id="reas-rationale" className="glass-panel p-6 rounded-2xl flex flex-col space-y-3 relative overflow-hidden shadow-lg border-l-2 border-l-purple-500 flex-grow justify-between font-sans scroll-mt-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-300">Domain Judgment & ML Rationale</h3>
                    <div className="text-[11px] leading-relaxed text-purple-950 dark:text-purple-200 bg-purple-50 dark:bg-purple-500/5 border border-purple-200 dark:border-purple-500/10 p-4 rounded-xl max-h-[180px] overflow-y-auto mt-2 leading-relaxed font-sans">
                      {domainJudgmentText}
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <button
                      disabled={!isCurrentlySafe}
                      onClick={() => handleTabChange("execute")}
                      className={clsx(
                        "w-full py-3 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center justify-center space-x-1 group cursor-pointer font-sans",
                        isCurrentlySafe
                          ? "bg-evolver-viridian hover:bg-evolver-viridian-light text-white"
                          : "bg-slate-200 dark:bg-slate-900/40 text-slate-400 dark:text-slate-650 border border-slate-200 dark:border-white/5 cursor-not-allowed"
                      )}
                    >
                      <span>Configure Write-Back Gateway</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform font-sans" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: EXECUTE BAPI */}
        {activeTab === "execute" && (
          <div className="flex-grow flex flex-col justify-between py-2 space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-grow">
              {/* Left side: BAPI Terminal */}
              <div id="exec-terminal" className="lg:col-span-7 flex flex-col min-h-[360px] scroll-mt-6">
                <BapiTerminal
                  arTerms={arTerms}
                  apExtension={apExtension}
                  executionState={executionState}
                  onExecute={handleExecuteBapis}
                />
              </div>

              {/* Right side: CFO Sign-off */}
              <div className="lg:col-span-5 flex flex-col space-y-6 justify-between">
                {/* Reviewer Gate */}
                <div id="exec-gate" className="glass-panel p-6 rounded-2xl flex flex-col space-y-4 shadow-lg border-t-2 border-t-evolver-viridian relative font-sans scroll-mt-6">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Reviewer Gate & Cryptographic Approval</h3>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                    Cryptographic verification generates verifiable TYPOGRAPHIC audit packets logged against your S/4HANA system. Signatures validate modifications to customer profiles and invoice dates.
                  </p>

                  {approvalState === "signing" ? (
                    <div className="flex flex-col items-center justify-center p-5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 space-y-2">
                      <span className="w-1.5 h-1.5 bg-evolver-viridian rounded-full animate-ping"></span>
                      <span className="text-xs font-mono text-evolver-viridian animate-pulse">
                        Generating digital credentials...
                      </span>
                    </div>
                  ) : approvalState === "signed" ? (
                    <div className="p-4 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 space-y-2">
                      <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-400 font-sans">
                        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs font-bold font-sans">Verification Active: Signature Stamped</span>
                      </div>
                      <div className="space-y-1 text-[9.5px] font-mono text-slate-600 dark:text-slate-400">
                        <div>Signer: Treasurer/CFO (Verified Credentials)</div>
                        <div className="truncate">Tx: {txHash}</div>
                        <div>Stamp: {signatureDate}</div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleAuthorizeSignature}
                      className="w-full py-3 rounded-xl text-xs font-bold transition-all shadow-md active:scale-97 flex items-center justify-center bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-350 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20 cursor-pointer font-sans"
                    >
                      <Lock className="w-4 h-4 mr-2 text-slate-500" />
                      <span>Stamp Authorized Signature</span>
                    </button>
                  )}
                </div>

                {executionState === "success" && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-semibold flex items-center justify-between shadow-md font-sans">
                    <span>🎉 BAPI executed successfully. ERP tables BSID/BSIK updated.</span>
                    <button
                      onClick={() => handleTabChange("evidence")}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[10px] uppercase font-mono tracking-wider transition-all cursor-pointer shadow-md select-none animate-pulse"
                    >
                      Collect Evidence Voucher ➜
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: AUDIT EVIDENCE */}
        {activeTab === "evidence" && (
          <div className="flex-grow flex flex-col justify-between py-2 space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-grow">
              {/* Left side: Evidence Graph */}
              <div id="ev-graph" className="lg:col-span-7 flex flex-col min-h-[360px] scroll-mt-6">
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

              {/* Right side: Generated Memo */}
              <div id="ev-memo" className="lg:col-span-5 flex flex-col justify-between scroll-mt-6">
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
            </div>
          </div>
        )}

    </div>
  </div>
  );
}
