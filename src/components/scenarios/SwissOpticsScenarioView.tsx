"use client";

import React, { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Terminal, 
  Search, 
  Database, 
  Building2, 
  FileText, 
  Zap, 
  ArrowRight, 
  Play, 
  RotateCcw, 
  Cpu, 
  Globe, 
  Layers, 
  Activity, 
  Sparkles, 
  CheckCircle, 
  Lock, 
  ChevronRight,
  TrendingDown,
  Info,
  DollarSign,
  AlertCircle,
  Clock,
  ChevronDown
} from "lucide-react";

export interface SwissOpticsScenarioViewProps {
  onProceedToReasoning?: () => void;
  activeStep?: number;
  onSelectStep?: (step: number) => void;
}

interface LogEntry {
  id: string;
  timestamp: string;
  type: "TRIGGER" | "COMPLIANCE" | "SAP_READ" | "SFDC_READ" | "ANALYTICS" | "MARD_READ" | "EKPO_READ" | "BSEG_READ" | "MORPHISM" | "COMPLETE";
  badgeText: string;
  badgeColor: string;
  title: string;
  details?: string;
  querySyntax?: string;
  dataPayload?: any;
  tierIndex: number;
}

export default function SwissOpticsScenarioView({ 
  onProceedToReasoning, 
  activeStep = 1, 
  onSelectStep 
}: SwissOpticsScenarioViewProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Scenario Workflow States
  const [stage, setStage] = useState<"ingestion" | "assessing" | "complete">("ingestion");
  const [fbiTriggered, setFbiTriggered] = useState(false);
  const [activeTier, setActiveTier] = useState<number>(0);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"all" | "sql" | "compliance">("all");

  const ledgerEndRef = useRef<HTMLDivElement>(null);

  // Trigger FBI Raid signal 1.8s after opening the ingestion screen
  useEffect(() => {
    if (stage === "ingestion") {
      const timer = setTimeout(() => {
        setFbiTriggered(true);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  // Log sequence definitions
  const discoveryLogs: LogEntry[] = [
    {
      id: "log-1",
      timestamp: "15:38:01.020",
      type: "TRIGGER",
      badgeText: "EVENT_TRIGGER",
      badgeColor: "bg-red-500/10 text-red-500 border-red-500/20",
      title: "Ingesting threat telemetry for SwissOptics AG (VEND_CH_9002)",
      details: "D&B Credit & Risk rating dropped precipitously from 92 to 45. Cross-checking global trade sanctions registry.",
      tierIndex: 1
    },
    {
      id: "log-2",
      timestamp: "15:38:02.150",
      type: "COMPLIANCE",
      badgeText: "COMPLIANCE_ALERT",
      badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      title: "OFAC & BIS Denied Persons List Match Confirmed",
      details: "SwissOptics AG added to US Dept of Commerce Denied Persons List under EAR § 744.11 for illegal re-export of dual-use satellite optical components.",
      querySyntax: "BIS_DPL_API.search({ entity: 'SwissOptics AG', taxId: 'CHE-109.821.404' })",
      tierIndex: 1
    },
    {
      id: "log-3",
      timestamp: "15:38:03.400",
      type: "SAP_READ",
      badgeText: "SAP_LFA1_READ",
      badgeColor: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
      title: "Reading Vendor Master Schema from SAP S/4HANA (LFA1/LFB1)",
      details: "Retrieved master record for LIFNR = VEND_CH_9002. Remittance bank account IBAN: CH89 0000 1209 8890 1.",
      querySyntax: "SELECT LIFNR, NAME1, BANKN, SPERR FROM LFA1 WHERE LIFNR = 'VEND_CH_9002'",
      dataPayload: { LIFNR: "VEND_CH_9002", Name: "SwissOptics AG", Country: "CH", PurchasingBlock: "Blank (Unblocked)" },
      tierIndex: 2
    },
    {
      id: "log-4",
      timestamp: "15:38:04.850",
      type: "SFDC_READ",
      badgeText: "SFDC_SOQL_READ",
      badgeColor: "bg-pink-500/10 text-pink-500 border-pink-500/20",
      title: "Querying Salesforce Revenue Cloud Customer Accounts",
      details: "Auditing if SwissOptics AG holds active revenue customer contracts or dual-role commercial accounts.",
      querySyntax: "SELECT Id, Name, AccountType FROM Account WHERE TaxId = 'CHE-109.821.404'",
      dataPayload: { RecordsFound: 0, Relationship: "Pure Procurement Dependency (Zero Customer Revenue)" },
      tierIndex: 3
    },
    {
      id: "log-5",
      timestamp: "15:38:06.200",
      type: "ANALYTICS",
      badgeText: "5YR_SPEND_AUDIT",
      badgeColor: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      title: "Aggregating 5-Year Universal Ledger (ACDOCA) Procurement History",
      details: "Average historical spend: $4,250,000/yr. Primary procurement material: MAT_OPT_8820 (Optical Satellite Lens Assemblies). Zero joint plant operations.",
      querySyntax: "SELECT RACCT, SUM(WSL) FROM ACDOCA WHERE LIFNR = 'VEND_CH_9002' GROUP BY FISCAL_YEAR",
      tierIndex: 3
    },
    {
      id: "log-6",
      timestamp: "15:38:07.600",
      type: "MARD_READ",
      badgeText: "SAP_MARD_READ",
      badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      title: "Scanning Inventory Buffer in Transparent Storage Table MARD",
      details: "Plant 1010 (Hamburg HQ) holds 1,200 units of MAT_OPT_8820 in stock (Reorder Point: 5,000). At 85 units/day burn rate, assembly line shuts down in 14 days.",
      querySyntax: "SELECT MATNR, WERKS, LABST FROM MARD WHERE MATNR = 'MAT_OPT_8820' AND WERKS = 'PLANT_DE_10'",
      dataPayload: { Material: "MAT_OPT_8820", Plant: "PLANT_DE_10", UnrestrictedStock: 1200, DaysRemaining: 14 },
      tierIndex: 4
    },
    {
      id: "log-7",
      timestamp: "15:38:09.100",
      type: "EKPO_READ",
      badgeText: "SAP_EKPO_READ",
      badgeColor: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
      title: "Auditing Multi-Country Open Purchase Orders in SAP EKPO",
      details: "Discovered active PO 45001928 (US, $450k - In Transit/Hold), PO 45002104 (UK, $180k - Goods Received), and PR 9012 (SG, $90k - Draft). Total AP exposure $630k.",
      querySyntax: "SELECT EBELN, BUKRS, MENGE, NETPR FROM EKPO WHERE LIFNR = 'VEND_CH_9002' AND STATU = 'Active'",
      tierIndex: 4
    },
    {
      id: "log-8",
      timestamp: "15:38:10.500",
      type: "BSEG_READ",
      badgeText: "SAP_BSEG_READ",
      badgeColor: "bg-red-500/10 text-red-500 border-red-500/20",
      title: "Auditing Accounts Payable Postings in BSEG Segment",
      details: "CRITICAL: Invoice BSEG-10002841 ($450,000.00) is due for bank wire disbursement in 3 DAYS with Payment Block ZLSPR = ' ' (Unblocked). Secondary invoice BSEG-10002990 ($180,000.00) due in 14 days.",
      querySyntax: "SELECT BELNR, DMBTR, ZLSPR, ZFBDT FROM BSEG WHERE LIFNR = 'VEND_CH_9002' AND ZLSPR = ' '",
      dataPayload: { UrgentInvoice: "10002841", Amount: "$450,000.00", DueIn: "3 Days", PaymentBlock: "Unblocked (High Fraud Exposure)" },
      tierIndex: 5
    },
    {
      id: "log-9",
      timestamp: "15:38:11.900",
      type: "MORPHISM",
      badgeText: "MORPHISM_VERIFY",
      badgeColor: "bg-teal-500/10 text-teal-500 border-teal-500/20",
      title: "Category-Theoretic Functor Verification (LFA1 -> EKPO -> BSEG)",
      details: "Lawful mapping established across multi-country procurement charts. Risk Curvature spike confirmed: κ = 8.2 (Critical OFAC/BEC Exposure). Total AP Hold Liability: $630,000.",
      tierIndex: 5
    },
    {
      id: "log-10",
      timestamp: "15:38:12.800",
      type: "COMPLETE",
      badgeText: "ASSESSMENT_COMPLETE",
      badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      title: "Impact Assessment Completed — Multi-Country Topology Mapped",
      details: "All system dependencies, multi-country PO line items, and risk vectors successfully identified. Ready for cognitive action planning.",
      tierIndex: 5
    }
  ];

  const [visibleLogs, setVisibleLogs] = useState<LogEntry[]>([]);

  // Start Impact Assessment Animation
  const startAssessment = () => {
    setStage("assessing");
    setVisibleLogs([]);
    setActiveTier(1);
    setProgressPercent(0);

    let logIdx = 0;
    const interval = setInterval(() => {
      if (logIdx < discoveryLogs.length) {
        const nextLog = discoveryLogs[logIdx];
        setVisibleLogs((prev) => [...prev, nextLog]);
        setActiveTier(nextLog.tierIndex);
        setProgressPercent(Math.round(((logIdx + 1) / discoveryLogs.length) * 100));
        logIdx++;
      } else {
        clearInterval(interval);
        setStage("complete");
      }
    }, 1200);
  };

  // Auto-scroll ledger
  useEffect(() => {
    if (stage === "assessing" && ledgerEndRef.current) {
      ledgerEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [visibleLogs, stage]);

  const filteredLogs = visibleLogs.filter((log) => {
    if (activeTab === "sql") return log.querySyntax !== undefined;
    if (activeTab === "compliance") return log.type === "COMPLIANCE" || log.type === "TRIGGER";
    return true;
  });

  return (
    <div className="w-full flex flex-col gap-6 font-sans">
      
      {/* HEADER BAR */}
      <div className={clsx(
        "p-6 rounded-2xl border backdrop-blur-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300",
        isDark ? "bg-slate-900/50 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
      )}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold uppercase bg-red-500/10 text-red-500 border border-red-500/20 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 animate-pulse" />
              US Sanctions & Export Control Alert
            </span>
            <span className="text-[10px] font-mono text-slate-400">Node: VEND_CH_9002</span>
          </div>
          <h2 className="text-2xl font-light tracking-tight text-slate-900 dark:text-white">
            SwissOptics AG Sanctions & Payment Block Scenario
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
            SwissOptics AG has been flagged for illegal export control circumvention and added to the US Denied Persons List (DPL). Aether must halt incoming goods and freeze $450k pending wire disbursements to remain OFAC compliant.
          </p>
        </div>

        {/* Phase Indicator Pills & Timeline Stepper */}
        <div className="flex flex-col items-end gap-2.5 shrink-0">
          {onSelectStep && (
            <div className="flex items-center gap-1.5">
              {[
                { num: 1, label: "Signal" },
                { num: 2, label: "Reasoning" },
                { num: 3, label: "Calibrate" },
                { num: 4, label: "Commit" }
              ].map((step, idx) => (
                <React.Fragment key={step.num}>
                  <button
                    onClick={() => onSelectStep(step.num)}
                    className={clsx(
                      "px-3 py-1.5 rounded-lg text-[10px] font-extrabold tracking-wider uppercase border cursor-pointer transition-all",
                      activeStep === step.num
                        ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-955 dark:border-white shadow-sm"
                        : activeStep > step.num
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : "bg-white border-slate-200 text-slate-450 hover:bg-slate-50 dark:bg-slate-900/30 dark:border-white/5 dark:text-slate-400"
                    )}
                  >
                    {step.num}. {step.label}
                  </button>
                  {idx < 3 && <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-700" />}
                </React.Fragment>
              ))}
            </div>
          )}

          <div className={clsx(
            "px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 transition-all self-end",
            stage === "ingestion" ? "bg-amber-500/10 border-amber-500/30 text-amber-500" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
          )}>
            <span className={clsx("w-2 h-2 rounded-full", stage === "ingestion" ? "bg-amber-500 animate-ping" : "bg-emerald-500")} />
            Phase 1: {stage === "ingestion" ? "Threat Intelligence Wire" : stage === "assessing" ? "Assessing Impact..." : "Discovery Complete"}
          </div>
        </div>
      </div>

      {/* STAGE 1: RAW SIGNALS INGESTION STREAM - UNIFIED NEWS FEED WIRE */}
      {stage === "ingestion" && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Main News Wire Console Card */}
          <div className={clsx(
            "rounded-2xl border p-6 shadow-sm space-y-4 transition-all duration-300",
            isDark ? "bg-slate-900/60 border-white/10" : "bg-white border-slate-200"
          )}>
            {/* News Wire Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200/80 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    Live Telemetry & Sanctions News Wire Feed
                    <span className="flex items-center gap-1.5 text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live Feed
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Real-time external intelligence crawled from global trade registries, news wires, and sanctions databases
                  </p>
                </div>
              </div>

              <div className="text-right font-mono text-xs text-slate-400 shrink-0">
                <span className="font-bold text-slate-700 dark:text-slate-200">{fbiTriggered ? "4" : "3"} Signals Ingested</span>
                <span className="text-[10px] block text-slate-400">Target Node: SwissOptics AG (VEND_CH_9002)</span>
              </div>
            </div>

            {/* Vertical Timeline News Feed Stream */}
            <div className="space-y-3 pt-1">
              
              {/* Item 1: D&B Financial Rating (-5 hours) */}
              <div className={clsx(
                "p-4 rounded-xl border transition-all flex items-start gap-4 text-xs",
                isDark ? "bg-slate-950/40 border-white/5 hover:border-white/10" : "bg-slate-50/80 border-slate-200/70 hover:border-slate-300"
              )}>
                <div className="font-mono text-[11px] text-slate-400 whitespace-nowrap pt-0.5 shrink-0 w-24">
                  <div className="font-bold text-slate-700 dark:text-slate-300">11:15 UTC</div>
                  <div className="text-[10px] text-slate-400">5 hours ago</div>
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Globe className="w-3 h-3 text-slate-400" />
                      D&B Financial Intelligence
                    </span>
                    <span className="font-mono text-[10px] text-amber-500 font-semibold">Risk Score: 92 ➔ 45</span>
                  </div>

                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                    Credit & Compliance Rating Downgraded
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11.5px]">
                    Dun & Bradstreet automated crawler recorded a severe drop in SwissOptics AG risk rating from <strong className="text-emerald-500 font-mono">92 (Low Risk)</strong> down to <strong className="text-red-400 font-mono">45 (Critical Alert)</strong> following unannounced credit rating downgrades in Zurich.
                  </p>
                </div>
              </div>

              {/* Item 2: Reuters Commercial Wire (-3 hours) */}
              <div className={clsx(
                "p-4 rounded-xl border transition-all flex items-start gap-4 text-xs",
                isDark ? "bg-slate-950/40 border-white/5 hover:border-white/10" : "bg-slate-50/80 border-slate-200/70 hover:border-slate-300"
              )}>
                <div className="font-mono text-[11px] text-slate-400 whitespace-nowrap pt-0.5 shrink-0 w-24">
                  <div className="font-bold text-slate-700 dark:text-slate-300">13:30 UTC</div>
                  <div className="text-[10px] text-slate-400">3 hours ago</div>
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <FileText className="w-3 h-3 text-slate-400" />
                      Reuters Commercial News Wire
                    </span>
                    <span className="font-mono text-[10px] text-slate-400 font-semibold">Category: Regulatory</span>
                  </div>

                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                    US Department of Commerce Initiates Export Control Inquiry
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11.5px]">
                    Bureau of Industry and Security (BIS) launched a formal inquiry into SwissOptics AG regarding suspected unauthorized re-exports of precision optical satellite guidance components to sanctioned entities.
                  </p>
                </div>
              </div>

              {/* Item 3: OFAC Watch List (-1 hour) */}
              <div className={clsx(
                "p-4 rounded-xl border transition-all flex items-start gap-4 text-xs",
                isDark ? "bg-slate-950/40 border-white/5 hover:border-white/10" : "bg-slate-50/80 border-slate-200/70 hover:border-slate-300"
              )}>
                <div className="font-mono text-[11px] text-slate-400 whitespace-nowrap pt-0.5 shrink-0 w-24">
                  <div className="font-bold text-slate-700 dark:text-slate-300">15:45 UTC</div>
                  <div className="text-[10px] text-slate-400">1 hour ago</div>
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <ShieldAlert className="w-3 h-3 text-slate-400" />
                      OFAC Automated Customs Feed
                    </span>
                    <span className="font-mono text-[10px] text-slate-400 font-semibold">Type: Manifest Audit</span>
                  </div>

                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                    European Transshipment Anomaly Flagged
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11.5px]">
                    Shipping manifest irregularities detected on optical sensor batches routed through intermediary customs freight nodes in Rotterdam and Frankfurt.
                  </p>
                </div>
              </div>

              {/* Item 4: LIVE UPDATE - FBI Raid & BIS Denied Persons List (JUST NOW) */}
              <AnimatePresence>
                {fbiTriggered && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, y: 10 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className={clsx(
                      "p-4 rounded-xl border-2 transition-all flex items-start gap-4 text-xs shadow-md relative overflow-hidden",
                      isDark 
                        ? "bg-red-500/10 border-red-500/40 text-slate-100" 
                        : "bg-red-50 border-red-300 text-slate-900"
                    )}
                  >
                    <div className="font-mono text-[11px] text-red-500 whitespace-nowrap pt-0.5 shrink-0 w-24">
                      <div className="font-extrabold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
                        16:38 UTC
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-wide">JUST NOW</div>
                    </div>

                    <div className="space-y-1.5 flex-1 z-10">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-extrabold uppercase tracking-wider text-red-500 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          US DEPT OF COMMERCE / FBI FIELD OFFICE
                        </span>
                        <span className="font-mono text-[9px] font-extrabold uppercase bg-red-500 text-white px-2 py-0.5 rounded-full tracking-wider">
                          CRITICAL BREAKING SIGNAL
                        </span>
                      </div>

                      <h4 className="font-extrabold text-red-600 dark:text-red-300 text-sm">
                        FBI Raid at Zurich HQ & Addition to BIS Denied Persons List (DPL)
                      </h4>
                      <p className="text-slate-700 dark:text-red-100/90 leading-relaxed text-[11.5px] font-medium">
                        US federal agents raided SwissOptics Zurich HQ. Bureau of Industry and Security (BIS) officially listed SwissOptics AG on the <strong>Denied Persons List (DPL)</strong> under EAR § 744.11. All trade receipts and <strong>$450,000 pending wire disbursements</strong> must be frozen immediately.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>

          {/* Executive Action Trigger Banner */}
          <div className={clsx(
            "p-6 rounded-2xl border shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-300",
            isDark ? "bg-slate-900/80 border-indigo-500/30" : "bg-white border-slate-200"
          )}>
            <div className="space-y-1 text-center md:text-left">
              <span className="text-[10px] font-mono font-extrabold text-indigo-500 uppercase tracking-widest block">
                Executive Action Required
              </span>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Initiate Cross-System Cognitive Impact Assessment
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
                Trigger ARIA to inspect SAP S/4HANA ledgers (LFA1, ACDOCA, BSEG), Salesforce CRM, open Purchase Orders, and inventory levels to map complete organizational exposure.
              </p>
            </div>

            <button
              onClick={startAssessment}
              disabled={!fbiTriggered}
              className={clsx(
                "px-6 py-3 rounded-xl font-mono text-xs font-extrabold cursor-pointer transition-all shadow-lg flex items-center gap-2 shrink-0 border",
                fbiTriggered 
                  ? "bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 border-transparent shadow-indigo-500/10" 
                  : "bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600 border-transparent cursor-not-allowed opacity-60"
              )}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Run Cognitive Impact Assessment</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* STAGE 2: IMPACT ASSESSMENT COCKPIT (DUAL PANE: REASONING LEDGER + PROGRESSIVE GRAPH) */}
      {(stage === "assessing" || stage === "complete") && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          {/* Top Progress Bar */}
          <div className={clsx(
            "p-4 rounded-2xl border backdrop-blur-xl shadow-sm flex items-center justify-between gap-4",
            isDark ? "bg-slate-900/60 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
          )}>
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <Cpu className="w-4 h-4 text-indigo-500 animate-spin" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex justify-between text-xs font-mono font-bold">
                  <span className="text-indigo-400 uppercase tracking-wider">
                    {stage === "assessing" ? `ARIA Cognitive Discovery in Progress (Tier ${activeTier}/5)...` : "Impact Discovery 100% Complete"}
                  </span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-[10px] font-mono shrink-0">
              <span className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 font-bold">
                AP Risk: $630,000.00
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                Stock Buffer: 14 Days Left
              </span>
            </div>
          </div>

          {/* DUAL PANE GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[640px]">
            
            {/* LEFT PANE: STREAMING REASONING & ACTION LEDGER (5 Cols) */}
            <div className={clsx(
              "lg:col-span-5 rounded-3xl border p-5 flex flex-col justify-between backdrop-blur-xl shadow-sm transition-colors",
              isDark ? "bg-slate-950/80 border-white/10 text-slate-100" : "bg-slate-900 border-slate-800 text-white"
            )}>
              <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
                
                {/* Ledger Header & Tabs */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-white">
                      ARIA Action & Reasoning Ledger
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[9px] font-mono">
                    <button
                      onClick={() => setActiveTab("all")}
                      className={clsx("px-2 py-0.5 rounded-lg border cursor-pointer", activeTab === "all" ? "bg-indigo-600 text-white border-indigo-500" : "bg-slate-900 border-white/10 text-slate-400")}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setActiveTab("sql")}
                      className={clsx("px-2 py-0.5 rounded-lg border cursor-pointer", activeTab === "sql" ? "bg-indigo-600 text-white border-indigo-500" : "bg-slate-900 border-white/10 text-slate-400")}
                    >
                      SQL/SOQL
                    </button>
                    <button
                      onClick={() => setActiveTab("compliance")}
                      className={clsx("px-2 py-0.5 rounded-lg border cursor-pointer", activeTab === "compliance" ? "bg-indigo-600 text-white border-indigo-500" : "bg-slate-900 border-white/10 text-slate-400")}
                    >
                      Compliance
                    </button>
                  </div>
                </div>

                {/* Streamed Log Entries Container */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-700 max-h-[520px]">
                  {filteredLogs.map((log, idx) => (
                    <motion.div 
                      key={log.id}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-2 text-xs font-mono"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className={clsx("px-2 py-0.5 rounded border font-bold flex items-center gap-1.5", log.badgeColor)}>
                          {log.type === "TRIGGER" || log.type === "COMPLIANCE" ? (
                            <ShieldAlert className="w-3 h-3 text-red-400 shrink-0" />
                          ) : log.type.includes("SAP") || log.type.includes("BSEG") || log.type.includes("EKPO") || log.type.includes("MARD") ? (
                            <Database className="w-3 h-3 text-indigo-400 shrink-0" />
                          ) : log.type === "SFDC_READ" ? (
                            <Search className="w-3 h-3 text-sky-400 shrink-0" />
                          ) : log.type === "ANALYTICS" ? (
                            <Activity className="w-3 h-3 text-purple-400 shrink-0" />
                          ) : log.type === "MORPHISM" ? (
                            <Layers className="w-3 h-3 text-teal-400 shrink-0" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          )}
                          {log.badgeText}
                        </span>
                        <span className="text-slate-500">{log.timestamp}</span>
                      </div>

                      <h5 className="font-bold text-white text-xs flex items-center gap-1.5">
                        {log.title}
                      </h5>

                      {log.details && (
                        <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                          {log.details}
                        </p>
                      )}

                      {log.querySyntax && (
                        <div className="p-2 rounded-xl bg-black/60 border border-white/5 font-mono text-[10px] text-emerald-400 overflow-x-auto">
                          <code>{log.querySyntax}</code>
                        </div>
                      )}

                      {log.dataPayload && (
                        <div className="p-2 rounded-xl bg-slate-950 border border-white/5 font-mono text-[9.5px] text-sky-300">
                          <pre>{JSON.stringify(log.dataPayload, null, 2)}</pre>
                        </div>
                      )}
                    </motion.div>
                  ))}
                  <div ref={ledgerEndRef} />
                </div>

              </div>

              <div className="pt-3 border-t border-white/10 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                <span>Active Systems Queried: SAP S/4HANA, SFDC, D&B</span>
                <span>Ledger Logged: {filteredLogs.length} Events</span>
              </div>
            </div>

            {/* RIGHT PANE: PROGRESSIVE LEFT-TO-RIGHT CONNECTED GRAPH & MULTI-COUNTRY DISCOVERY (7 Cols) */}
            <div className={clsx(
              "lg:col-span-7 rounded-3xl border p-5 flex flex-col justify-between backdrop-blur-xl shadow-sm transition-colors relative overflow-hidden",
              isDark ? "bg-slate-900/60 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
            )}>
              <div className="space-y-4 flex-1 flex flex-col">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                      Progressive Multi-Country Discovery Topology
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-indigo-400 font-bold">
                    {activeTier === 0 ? "Initializing Topology..." : activeTier < 5 ? `Building Tier ${activeTier}/5 Node Mesh...` : "Full 360 Topology Mapped"}
                  </span>
                </div>

                {/* 5-TIER DYNAMIC TOPOLOGY CANVAS (Starts 100% empty, nodes pop in as discovered) */}
                {activeTier === 0 ? (
                  <div className="flex-1 w-full flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-white/10 rounded-2xl p-8 text-center space-y-2 bg-slate-50/50 dark:bg-slate-950/40">
                    <Cpu className="w-7 h-7 text-indigo-500 animate-spin" />
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Topology Canvas Awaiting ARIA Reasoning Stream...
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm font-sans leading-relaxed">
                      Nodes will generate dynamically onto the canvas tier by tier as ARIA audits enterprise databases.
                    </p>
                  </div>
                ) : (
                  <div className="flex-1 w-full flex items-center justify-between gap-3 overflow-x-auto py-3">
                    
                    {/* TIER 1: THREAT SIGNALS */}
                    {activeTier >= 1 && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8, x: -10 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        className="flex-1 min-w-[125px] flex flex-col gap-2.5"
                      >
                        <span className="text-[9px] font-mono font-extrabold uppercase text-slate-500 dark:text-slate-400 text-center block tracking-wider">
                          Tier 1: Threat Signals
                        </span>
                        
                        <div className={clsx(
                          "p-2.5 rounded-xl border text-center space-y-0.5 shadow-sm transition-all",
                          isDark ? "bg-slate-950 border-white/10 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                        )}>
                          <span className="text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400 block uppercase">D&B Risk Rating</span>
                          <span className="text-[10px] font-extrabold text-red-500 block font-mono">Risk Index: 45</span>
                        </div>

                        <div className={clsx(
                          "p-2.5 rounded-xl border text-center space-y-0.5 shadow-sm transition-all",
                          isDark ? "bg-slate-950 border-white/10 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                        )}>
                          <span className="text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400 block uppercase">BIS Denied Persons</span>
                          <span className="text-[10px] font-extrabold text-slate-800 dark:text-slate-200 block font-mono">EAR § 744.11</span>
                        </div>
                      </motion.div>
                    )}

                    {/* ARROW 1-2 */}
                    {activeTier >= 2 && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <ChevronRight className="w-4 h-4 text-indigo-500 shrink-0" />
                      </motion.div>
                    )}

                    {/* TIER 2: ENTERPRISE SYSTEMS */}
                    {activeTier >= 2 && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8, x: -10 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        className="flex-1 min-w-[125px] flex flex-col gap-2.5"
                      >
                        <span className="text-[9px] font-mono font-extrabold uppercase text-slate-500 dark:text-slate-400 text-center block tracking-wider">
                          Tier 2: Systems
                        </span>
                        
                        <div className={clsx(
                          "p-2.5 rounded-xl border text-center space-y-0.5 shadow-sm transition-all",
                          isDark ? "bg-slate-950 border-white/10 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                        )}>
                          <span className="text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400 block uppercase">SAP S/4HANA</span>
                          <span className="text-[10px] font-extrabold text-slate-800 dark:text-slate-200 block font-mono">LFA1/BSEG Kernel</span>
                        </div>

                        <div className={clsx(
                          "p-2.5 rounded-xl border text-center space-y-0.5 shadow-sm transition-all",
                          isDark ? "bg-slate-950 border-white/10 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                        )}>
                          <span className="text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400 block uppercase">Salesforce CRM</span>
                          <span className="text-[10px] font-extrabold text-slate-800 dark:text-slate-200 block font-mono">0 Accounts</span>
                        </div>
                      </motion.div>
                    )}

                    {/* ARROW 2-3 */}
                    {activeTier >= 3 && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <ChevronRight className="w-4 h-4 text-indigo-500 shrink-0" />
                      </motion.div>
                    )}

                    {/* TIER 3: VENDOR 360 ENTITY */}
                    {activeTier >= 3 && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8, x: -10 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        className="flex-1 min-w-[130px] flex flex-col gap-2.5"
                      >
                        <span className="text-[9px] font-mono font-extrabold uppercase text-slate-500 dark:text-slate-400 text-center block tracking-wider">
                          Tier 3: 360 Entity
                        </span>
                        
                        <div className={clsx(
                          "p-2.5 rounded-xl border text-center space-y-0.5 shadow-sm transition-all",
                          isDark ? "bg-slate-950 border-indigo-500/40 text-white" : "bg-slate-50 border-indigo-300 text-slate-900"
                        )}>
                          <span className="text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400 block uppercase">SwissOptics AG</span>
                          <span className="text-[10px] font-extrabold text-slate-800 dark:text-slate-200 block font-mono">$4.25M/yr Buy</span>
                        </div>

                        <div className={clsx(
                          "p-2.5 rounded-xl border text-center space-y-0.5 shadow-sm transition-all",
                          isDark ? "bg-slate-950 border-white/10 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                        )}>
                          <span className="text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400 block uppercase">Zurich Facility</span>
                          <span className="text-[10px] font-extrabold text-slate-800 dark:text-slate-200 block font-mono">Optical Lens Mfg</span>
                        </div>
                      </motion.div>
                    )}

                    {/* ARROW 3-4 */}
                    {activeTier >= 4 && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <ChevronRight className="w-4 h-4 text-indigo-500 shrink-0" />
                      </motion.div>
                    )}

                    {/* TIER 4: MULTI-COUNTRY PO DISCOVERY */}
                    {activeTier >= 4 && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8, x: -10 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        className="flex-1 min-w-[155px] flex flex-col gap-2"
                      >
                        <span className="text-[9px] font-mono font-extrabold uppercase text-slate-500 dark:text-slate-400 text-center block tracking-wider">
                          Tier 4: Global POs
                        </span>
                        
                        <div className={clsx(
                          "p-2 rounded-xl border text-left space-y-0.5 shadow-sm transition-all",
                          isDark ? "bg-slate-950 border-white/10 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                        )}>
                          <div className="flex items-center justify-between text-[8.5px] font-mono">
                            <span className="font-bold text-slate-700 dark:text-slate-300">🇺🇸 Aether US (1000)</span>
                            <span className="text-amber-600 dark:text-amber-400 font-bold">In Transit</span>
                          </div>
                          <span className="text-[9.5px] font-extrabold text-slate-900 dark:text-slate-100 block font-mono">PO 45001928 ($450k)</span>
                        </div>

                        <div className={clsx(
                          "p-2 rounded-xl border text-left space-y-0.5 shadow-sm transition-all",
                          isDark ? "bg-slate-950 border-white/10 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                        )}>
                          <div className="flex items-center justify-between text-[8.5px] font-mono">
                            <span className="font-bold text-slate-700 dark:text-slate-300">🇬🇧 Aether UK (2000)</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Received</span>
                          </div>
                          <span className="text-[9.5px] font-extrabold text-slate-900 dark:text-slate-100 block font-mono">PO 45002104 ($180k)</span>
                        </div>

                        <div className={clsx(
                          "p-2 rounded-xl border text-left space-y-0.5 shadow-sm transition-all",
                          isDark ? "bg-slate-950 border-white/10 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                        )}>
                          <div className="flex items-center justify-between text-[8.5px] font-mono">
                            <span className="font-bold text-slate-700 dark:text-slate-300">🇸🇬 Aether SG (3000)</span>
                            <span className="text-slate-400">Draft</span>
                          </div>
                          <span className="text-[9.5px] font-extrabold text-slate-900 dark:text-slate-100 block font-mono">PR 9012 ($90k Hold)</span>
                        </div>
                      </motion.div>
                    )}

                    {/* ARROW 4-5 */}
                    {activeTier >= 5 && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <ChevronRight className="w-4 h-4 text-indigo-500 shrink-0" />
                      </motion.div>
                    )}

                    {/* TIER 5: AP LINE ITEMS & VOUCHERS */}
                    {activeTier >= 5 && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8, x: -10 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        className="flex-1 min-w-[130px] flex flex-col gap-2.5"
                      >
                        <span className="text-[9px] font-mono font-extrabold uppercase text-slate-500 dark:text-slate-400 text-center block tracking-wider">
                          Tier 5: AP Vouchers
                        </span>
                        
                        <div className={clsx(
                          "p-2.5 rounded-xl border text-center space-y-0.5 shadow-sm transition-all",
                          isDark ? "bg-red-500/10 border-red-500/40 text-white" : "bg-red-50 border-red-300 text-slate-900"
                        )}>
                          <span className="text-[9px] font-mono text-red-500 font-bold block">BSEG-10002841</span>
                          <span className="text-[9.5px] font-extrabold text-slate-900 dark:text-slate-100 block font-mono">$450,000 (Due 3d)</span>
                        </div>

                        <div className={clsx(
                          "p-2.5 rounded-xl border text-center space-y-0.5 shadow-sm transition-all",
                          isDark ? "bg-slate-950 border-white/10 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                        )}>
                          <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 font-bold block">BSEG-10002990</span>
                          <span className="text-[9.5px] font-extrabold text-slate-900 dark:text-slate-100 block font-mono">$180,000 (Due 14d)</span>
                        </div>
                      </motion.div>
                    )}

                  </div>
                )}

                {/* VENDOR 360 MULTI-COUNTRY SUMMARY CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-white/5 space-y-1">
                    <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 uppercase block">Total AP Exposure</span>
                    <span className="text-sm font-extrabold text-red-500">$630,000.00</span>
                    <span className="text-[9.5px] font-mono text-slate-400 block">2 Open Invoices (US & UK)</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-white/5 space-y-1">
                    <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 uppercase block">Single-Source Supply</span>
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white">MAT_OPT_8820</span>
                    <span className="text-[9.5px] font-mono text-slate-400 block">Zurich Optical Lens Mfg</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-white/5 space-y-1">
                    <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 uppercase block">Assembly Buffer</span>
                    <span className="text-sm font-extrabold text-amber-500">14 Days Remaining</span>
                    <span className="text-[9.5px] font-mono text-slate-400 block">1,200 Units in Plant DE-10</span>
                  </div>
                </div>

              </div>

              {/* BOTTOM PROCEED BUTTON (Solid, professional, non-jumping style) */}
              {stage === "complete" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pt-4 border-t border-slate-200 dark:border-white/10 flex justify-end"
                >
                  <button
                    onClick={onProceedToReasoning}
                    className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-955 dark:hover:bg-slate-100 font-sans text-xs font-extrabold cursor-pointer transition-all shadow-md flex items-center gap-2 border border-transparent"
                  >
                    <span>Proceed to Cognitive Reasoning & Action Planning</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

            </div>

          </div>

        </motion.div>
      )}

    </div>
  );
}
