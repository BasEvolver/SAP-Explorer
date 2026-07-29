"use client";

import React, { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import { 
  Brain, 
  Database, 
  TrendingUp, 
  RotateCcw, 
  ArrowRight,
  Menu,
  Bell,
  Calendar,
  Search,
  Grid,
  ChevronDown,
  Play,
  Sliders,
  CheckCircle,
  Activity,
  ArrowUpRight,
  TrendingDown,
  Loader2,
  Lock,
  Layers,
  AlertTriangle,
  ChevronRight,
  CornerDownRight,
  FileCode,
  Terminal,
  Cpu,
  BarChart,
  ShieldCheck,
  CheckCircle2,
  Info,
  Building2,
  ShoppingBag,
  ArrowLeftRight,
  FileText,
  ShieldAlert,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Cognitive3DGraphCanvas from "@/components/manifold/Cognitive3DGraphCanvas";
import SwissOpticsScenarioView from "@/components/scenarios/SwissOpticsScenarioView";

// Scenarios definition matching Reference documents & Vendor 360 Deep-Dive
const SCENARIOS = {
  "swissoptics-tprm": {
    title: "SwissOptics TPRM Anomaly & Block",
    category: "TPRM & COMPLIANCE",
    node: "SwissOptics AG (VEND_CH_9002)",
    situation: "Aether Precision Systems relies on SwissOptics AG to supply optical lenses for satellite sensors. ARIA's automated threat crawler flagged a critical cybersecurity breach and operational distress warning (D&B rating drops to 45). German ledgers show $450,000 in open invoices pending payment. If cash is disbursed to SwissOptics' unverified accounts during this breach, BEC fraud risk spikes.",
    vendor360: {
      entityName: "SwissOptics AG (Zurich, CH)",
      taxId: "CHE-109.821.404",
      relationshipTier: "8-Year Strategic Tier-1 Supplier",
      annualBuySpend: "$4,250,000 / yr",
      buyItems: "Optical Lens Assemblies (MAT_OPT_8820)",
      dualRoleSell: true,
      annualSellVolume: "$1,120,000 / yr",
      sellItems: "Sensor Calibration Chips (MAT_CHIP_902)",
      netExposure: "$3,130,000 AP Net",
      openInvoices: [
        { id: "10002841", amount: "$450,000.00", due: "3 Days", status: "Pending Wire" },
        { id: "10002990", amount: "$180,000.00", due: "14 Days", status: "In Approval" }
      ]
    },
    ariaRecommendations: [
      { id: "A", title: "AP Payment Hold (BAPI_ACC_DOCUMENT_POST)", desc: "Apply Block Code 'A' on pending invoice 10002841 ($450k) to prevent BEC wire fraud.", recommended: true },
      { id: "B", title: "Vendor Purchasing Freeze (BAPI_VENDOR_BLOCK)", desc: "Flag Vendor Master LFA1-SPERR to block new Purchase Order creation until cyber audit clears." },
      { id: "C", title: "Qualify Alternate Lens Supplier", desc: "Re-route optical lens orders to secondary supplier Carl Zeiss Optronics CH (VEND_CH_8801)." },
      { id: "D", title: "Accounts Receivable Netting Hold", desc: "Freeze $210k in pending AR receivables from SwissOptics for Calibration Chips to offset default risk." }
    ],
    tables: [
      { name: "LFA1 (Vendor Master)", fields: "LIFNR = VEND_CH_9002, BANKN = CH89 0000 1209 8890 1, DOME1 (D&B Score) = 45" },
      { name: "BSEG (Accounting Segment)", fields: "BELNR = 10002841, DMBTR = $450,000.00, ZLSPR (Payment Block) = [Blank]" }
    ],
    bapiName: "BAPI_ACC_DOCUMENT_POST & BAPI_VENDOR_BLOCK",
    bapiDesc: "Locks payment parameters on invoice 10002841, applies purchasing block in LFA1, and routes alternate requisition.",
    bapiPayload: {
      "AP_Document_Hold": {
        "InvoiceNumber": "10002841",
        "CompanyCode": "AETHER_DE",
        "VendorCode": "VEND_CH_9002",
        "PaymentBlockCode": "A",
        "Reason": "TPRM Cyber Security Hold"
      },
      "Vendor_Master_Freeze": {
        "VendorCode": "VEND_CH_9002",
        "PurchasingOrg": "PURCH_DE_10",
        "PurchasingBlock": true
      },
      "Alternate_Requisition": {
        "TargetVendor": "VEND_CH_8801 (Carl Zeiss Optronics CH)",
        "Material": "MAT_OPT_8820",
        "Quantity": 2500,
        "DocType": "NB"
      }
    },
    terminalLogs: [
      "⏳ Establishing RFC handshake with live S/4HANA ERP instance...",
      "🔑 Authenticating active tenant credentials roger.dutton@aether.de...",
      "🚀 Dispatching document adjustment via BAPI_ACC_DOCUMENT_POST...",
      "   ↳ Target Invoice: 10002841 (Company: AETHER_DE)",
      "   ↳ Setting BSEG-ZLSPR payment block code to 'A' ($450,000 hold)",
      "🚀 Dispatching vendor Purchasing Block via BAPI_VENDOR_BLOCK...",
      "   ↳ Target Vendor: VEND_CH_9002 (SwissOptics AG), LFA1-SPERR Purchasing Block set to 'X'",
      "🚀 Dispatching emergency Purchase Requisition via BAPI_PR_CREATE...",
      "   ↳ 2,500 units of MAT_OPT_8820 routed to Carl Zeiss Optronics CH (VEND_CH_8801)",
      "⚙️ Registering Accounts Receivable collateral freeze ($210,000 hold)...",
      "⚙️ Purging localized accounts payable transactional database cache.",
      "🎉 SUCCESS! Document locked & alternate supply lines secured.",
      "🧾 Compliance clearance voucher posted: CH-TPRM-SWISSOPTICS-2026"
    ],
    themeColor: "#facc15"
  },
  "strait-of-hormuz": {
    title: "Strait of Hormuz SC Disruption",
    category: "SUPPLY CHAIN & FX",
    node: "Strait of Hormuz shipping lane corridor",
    situation: "Aether Headquarters (Germany) imports custom cobalt sensor boards from Aether Asia (Singapore). Geopolitical conflict has shut down shipping corridors in the Strait of Hormuz, halting all cargo transits. Aether Germany's unrestricted stock levels in transparent table MARD will drop to zero in 12 days. ARIA must reallocate supply to AlloyTech US and hedge the USD currency risk.",
    vendor360: {
      entityName: "Aether Asia Pte Ltd (Singapore - SG-30)",
      taxId: "SG-200918239M",
      relationshipTier: "Wholly Owned Intercompany Node",
      annualBuySpend: "$14,500,000 / yr",
      buyItems: "Cobalt Sensor Assemblies (MAT_COB_4019)",
      dualRoleSell: true,
      annualSellVolume: "$6,800,000 / yr",
      sellItems: "Precision Aerospace Alloys (MAT_ALLOY_101)",
      netExposure: "12 Days Inventory Buffer (1,200 units left)",
      openInvoices: [
        { id: "PO_SG_3002", amount: "$1,500,000.00", due: "12 Days", status: "Cargo Transit Blocked" }
      ]
    },
    ariaRecommendations: [
      { id: "A", title: "Emergency PO Reallocation (BAPI_PR_CREATE)", desc: "Issue emergency Purchase Requisition for 5,000 units to AlloyTech US (VEND_US_8009).", recommended: true },
      { id: "B", title: "Forward FX Contract Lock", desc: "Execute $1.5M EUR/USD Forward FX Hedge at strike rate 1.085 on corporate treasury ledger." },
      { id: "C", title: "Safety Stock Threshold Adjustment", desc: "Update S/4HANA Material Master MARC-EISBE safety stock buffer from 1,200 to 5,000 units." },
      { id: "D", title: "Logistics Corridor Air Freight Reroute", desc: "Switch carrier logistics mode from maritime Hormuz shipping to air freight transshipment via Frankfurt." }
    ],
    tables: [
      { name: "MARD (Storage Bin Data)", fields: "MATNR = MAT_COB_4019, WERKS = PLANT_DE_10, LABST (Stock Count) = 1,200 (Reorder: 5,000)" },
      { name: "EKKO (PO Headers)", fields: "LIFNR = VEND_SG_3002 (Cargo blocked in shipping corridor)" }
    ],
    bapiName: "BAPI_PR_CREATE & FX Hedge Lock",
    bapiDesc: "Submits emergency purchase requisition for 5,000 units of sensors from US and logs Forward FX contract strike parameters.",
    bapiPayload: {
      "Requisition": {
        "Material": "MAT_COB_4019",
        "Plant": "PLANT_DE_10",
        "Quantity": 5000,
        "SourceVendor": "VEND_US_8009 (AlloyTech US)",
        "DocType": "NB"
      },
      "TreasuryHedge": {
        "Instrument": "Forward FX Contract",
        "BaseCurrency": "EUR",
        "QuoteCurrency": "USD",
        "NotionalAmount": 1500000.00,
        "StrikeRate": 1.085,
        "MaturityDate": "2026-08-30"
      }
    },
    terminalLogs: [
      "⏳ Initializing intercompany procurement gateway connection...",
      "🔑 Authenticating active tenant credentials roger.dutton@aether.de...",
      "🚀 Dispatching emergency requisition via BAPI_PR_CREATE...",
      "   ↳ Created Purchase Requisition for 5,000 units of MAT_COB_4019",
      "   ↳ Sourcing Vendor adjusted to VEND_US_8009 (AlloyTech US)",
      "🚀 Executing currency hedging request on corporate treasury ledger...",
      "   ↳ Locked EUR/USD Forward FX Contract for $1.5M at Strike Rate 1.085",
      "🎉 SUCCESS! Supply lines reallocated and FX risk minimized.",
      "🧾 Compliance clearance voucher posted: US-SC-HEDGE-5000"
    ],
    themeColor: "#fca5a5"
  },
  "global-treasury-sweep": {
    title: "Singapore-US Cash Sweep & Tax",
    category: "TREASURY SWEEP",
    node: "Aether Singapore to Aether USA Cash Sweep",
    situation: "Aether USA (US-20) holds short-term debt at an interest rate of 8.2%, costing significant interest expenses. Simultaneously, Aether Asia (Singapore - SG-30) holds surplus idle cash of $8.0M yielding only 3.5%. ARIA detects this spread loss ($235,000/yr). ARIA proposes sweeping $5.0M to pay down US debt, first checking tax code compliance in ACDOCA to avoid transfer pricing penalties.",
    vendor360: {
      entityName: "Aether Corporate Treasury Pool (SG-30 to US-20)",
      taxId: "DE-812093821",
      relationshipTier: "Global Cash Concentration Clearing",
      annualBuySpend: "$25,000,000 / yr",
      buyItems: "Intercompany Loan & Liquidity Clearing",
      dualRoleSell: true,
      annualSellVolume: "$18,200,000 / yr",
      sellItems: "Cross-Border Treasury Settlement",
      netExposure: "Net Rate Arbitrage Loss: -$235,000 / yr",
      openInvoices: [
        { id: "SWEEP04", amount: "$5,000,000.00", due: "Immediate", status: "Intercompany Sweep Ready" }
      ]
    },
    ariaRecommendations: [
      { id: "A", title: "Execute Automatic Wire Sweep (BAPI_PAYMENT_PROPOSAL_CREATE)", desc: "Create F110 intercompany payment proposal SWEEP04 for $5.0M to eliminate 8.2% debt line.", recommended: true },
      { id: "B", title: "OECD Section 482 Arm's Length Boundary Check", desc: "Validate transfer pricing rate compliance in ACDOCA/BSEG for intercompany loan agreements." },
      { id: "C", title: "Intercompany G/L Netting (GL 0000129000)", desc: "Post intercompany clearance to G/L account 0000129000 with tax code I0 (Exempt)." },
      { id: "D", title: "Automated ARIA Treasury Rate Arbitrage Monitor", desc: "Configure weekly background daemon trigger when interest rate spread exceeds 2.5%." }
    ],
    tables: [
      { name: "ACDOCA (Universal Journal)", fields: "RBUKRS = AETHER_SG / AETHER_US, RACCT = 0000113100 (Cash) / 0000215000 (Debt), WSL = $8,000,000 / -$5,000,000" },
      { name: "BSEG (Accounting Segment)", fields: "MWSKZ (Tax Code) = I0 (Intercompany Tax Exempt) [Verified Compliant]" }
    ],
    bapiName: "BAPI_PAYMENT_PROPOSAL_CREATE",
    bapiDesc: "Creates intercompany wire transfer proposal under F110 Automatic Payment Program to execute sweep.",
    bapiPayload: {
      "RunDate": "2026-07-26",
      "RunID": "SWEEP04",
      "SourceCompanyCode": "AETHER_SG",
      "DestinationCompanyCode": "AETHER_US",
      "PaymentMethod": "T (Wire Transfer)",
      "SweepAmount": 5000000.00,
      "Currency": "USD",
      "IntercompanyGL": "0000129000 (Clearing Account)"
    },
    terminalLogs: [
      "⏳ Connecting to intercompany financial clearing portal gateway...",
      "🔑 Authenticating active tenant credentials roger.dutton@aether.de...",
      "📋 Validating transfer pricing boundary constraints (ACDOCA/BSEG)...",
      "   ↳ Tax Code verified: I0 (Intercompany Tax Exempt) - compliant",
      "🚀 Dispatching wire transfer proposal via BAPI_PAYMENT_PROPOSAL_CREATE...",
      "   ↳ Run ID: SWEEP04, Sweep Amount: $5.0M USD",
      "   ↳ Source: AETHER_SG, Destination: AETHER_US",
      "🎉 SUCCESS! Automatic payment run clearing document registered.",
      "🧾 Compliance clearance voucher posted: F110-SWEEP-04"
    ],
    themeColor: "#d8b4fe"
  }
};

type ScenarioKey = keyof typeof SCENARIOS;

export default function SimulationSandboxPage() {
  const [activeScenarioId, setActiveScenarioId] = useState<ScenarioKey>("swissoptics-tprm");
  const [activeStep, setActiveStep] = useState(1); // Steps: 1 (Signal), 2 (Reasoning), 3 (Calibrate), 4 (Execute)
  
  // Scenario 1 Multi-Action Levers State
  const [s1Levers, setS1Levers] = useState({
    apPaymentBlock: true,       // Lever 1: BAPI_ACC_DOCUMENT_POST (Hold $450k)
    vendorMasterFreeze: true,   // Lever 2: BAPI_VENDOR_BLOCK (Block LFA1-SPERR)
    alternateSupplierReroute: 50, // Lever 3: Zeiss Optronics CH reroute ratio %
    arNettingHold: true         // Lever 4: Freeze $210k pending AR receivables
  });

  // Scenarios specific sliders
  const [fxHedgeRatio, setFxHedgeRatio] = useState(90);
  const [reorderQty, setReorderQty] = useState(5000);
  const [sweepVolume, setSweepVolume] = useState(5.0);

  // Execution terminal state
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [execIndex, setExecIndex] = useState(0);
  const [showSuccessCertificate, setShowSuccessCertificate] = useState(false);

  const scenario = SCENARIOS[activeScenarioId];

  // Sync active scenario from URL query ?id=...
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlId = params.get("id") as ScenarioKey;
      if (urlId && SCENARIOS[urlId]) {
        setActiveScenarioId(urlId);
      }
    }
  }, []);

  // Step Reset on scenario change
  const handleScenarioChange = (id: ScenarioKey) => {
    setActiveScenarioId(id);
    setActiveStep(1);
    setTerminalLines([]);
    setExecIndex(0);
    setIsExecuting(false);
    setShowSuccessCertificate(false);
  };

  // Run terminal animations step by step
  const executeWriteBack = () => {
    setIsExecuting(true);
    setTerminalLines([]);
    setExecIndex(0);
    setShowSuccessCertificate(false);
  };

  useEffect(() => {
    if (!isExecuting) return;

    if (execIndex < scenario.terminalLogs.length) {
      const timer = setTimeout(() => {
        setTerminalLines((prev) => [...prev, scenario.terminalLogs[execIndex]]);
        setExecIndex((prev) => prev + 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsExecuting(false);
      setShowSuccessCertificate(true);
    }
  }, [isExecuting, execIndex, scenario.terminalLogs]);

  // Derived metrics calculations for Scenario 1 dynamic multi-action levers
  const s1CurvatureNum = 8.2 
    - (s1Levers.apPaymentBlock ? 3.0 : 0) 
    - (s1Levers.vendorMasterFreeze ? 2.0 : 0) 
    - (s1Levers.alternateSupplierReroute * 0.015) 
    - (s1Levers.arNettingHold ? 0.7 : 0);

  const simulatedCurvature = activeScenarioId === "swissoptics-tprm" 
    ? Math.max(1.0, s1CurvatureNum).toFixed(1)
    : activeScenarioId === "strait-of-hormuz"
    ? (6.9 * (1 - fxHedgeRatio / 100) + 1.0).toFixed(1)
    : (7.4 * (1 - sweepVolume / 8.0) + 1.0).toFixed(1);

  const simulatedHedgeSavings = Math.round(85000 * (fxHedgeRatio / 100));
  const simulatedSweepSavings = Math.round(sweepVolume * 1000000 * 0.047);

  return (
    <div className={clsx(
      "flex-grow flex flex-col h-full overflow-y-auto pb-16 transition-colors duration-300 relative select-none font-sans bg-[#faf8f5] text-slate-800 dark:bg-[#030712] dark:text-slate-100"
    )}>
      {/* Background highlight gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/[0.02] dark:from-indigo-950/20 via-transparent to-transparent pointer-events-none" />

      {/* 1. Header Toolbar Navigator */}
      <header className="relative w-full border-b border-slate-200/60 dark:border-white/5 bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl px-8 py-3 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 dark:text-slate-500 cursor-pointer">
            <Menu className="w-5 h-5 stroke-[1.5]" />
          </button>
          
          <div className="flex items-center gap-2 font-sans text-xs tracking-wide text-slate-500 dark:text-slate-405">
            <span className="font-extrabold uppercase text-slate-900 dark:text-white flex items-center gap-1.5">
              {/* Custom APS Logo Icon */}
              <div className="w-5 h-5 bg-slate-900 dark:bg-white rounded flex items-center justify-center shrink-0 shadow-sm mr-1 select-none">
                <svg className="w-3.5 h-3.5 text-white dark:text-slate-955" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3L2 21h20L12 3z" />
                  <circle cx="12" cy="15" r="1.5" fill="currentColor" />
                </svg>
              </div>
              Aether Precision Systems
            </span>
            <span className="text-slate-200 dark:text-slate-800">/</span>
            <button className="hover:text-slate-900 dark:hover:text-white font-medium cursor-pointer">
              Personal Space
            </button>
            <span className="text-slate-200 dark:text-slate-800">/</span>
            <button className="hover:text-slate-900 dark:hover:text-white font-medium cursor-pointer">
              ARIA
            </button>
            <span className="text-slate-200 dark:text-slate-800">/</span>
            <span className="text-slate-400 dark:text-slate-500 font-semibold select-none">Resolution Workspace</span>
          </div>
        </div>

        {/* Right Side Tools */}
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer select-none font-bold">
            <span>Group</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-450" />
          </button>

          <button className="p-1.5 rounded-lg text-slate-450 hover:text-slate-755 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer">
            <Search className="w-4 h-4 stroke-[1.5]" />
          </button>

          <button className="p-1.5 rounded-lg text-slate-455 hover:text-slate-755 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 relative cursor-pointer">
            <Bell className="w-4 h-4 stroke-[1.5]" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
          </button>

          <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-extrabold text-slate-850 dark:text-white flex items-center justify-center border border-slate-300 dark:border-white/10 select-none">
            RD
          </div>
        </div>
      </header>

      {/* Main Full-Width Workspace (Maxized Canvas) */}
      <div className="max-w-[1800px] w-full mx-auto px-8 py-6 flex flex-col gap-6">
        
        {/* Scenario Switcher Tabs */}
        <div className="flex flex-wrap gap-2.5 border-b border-slate-200/70 dark:border-white/5 pb-3">
          {(Object.keys(SCENARIOS) as ScenarioKey[]).map((key) => (
            <button
              key={key}
              onClick={() => handleScenarioChange(key)}
              className={clsx(
                "px-5 py-2.5 rounded-full text-xs font-extrabold cursor-pointer transition-all shadow-sm",
                activeScenarioId === key
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-slate-900/40 dark:border-white/5 dark:text-slate-400 dark:hover:bg-slate-900/70"
              )}
            >
              {SCENARIOS[key].title}
            </button>
          ))}
        </div>

        {/* Dynamic Header & Stepper (Rendered for standard views, omitted for SwissOptics Phase 1 to prevent double header) */}
        {!(activeScenarioId === "swissoptics-tprm" && activeStep === 1) && (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900/30 border border-slate-200/80 dark:border-white/5 p-6 rounded-2xl shadow-sm">
            <div className="space-y-1">
              <span className="text-[9px] font-mono font-extrabold text-indigo-505 dark:text-indigo-400 uppercase tracking-widest block">
                Resolution Workspace Selector &bull; {scenario.category}
              </span>
              <h2 className="text-2xl font-[300] tracking-tight text-slate-900 dark:text-white">
                {scenario.title}
              </h2>
              <p className="text-xs text-slate-455 dark:text-slate-400 max-w-2xl font-medium leading-relaxed">
                Active Enterprise Node: <span className="font-mono text-[11px] font-bold text-[#008fbb] dark:text-cyan-400">{scenario.node}</span>
              </p>
            </div>

            {/* Timeline wizard steps navigator */}
            <div className="flex items-center gap-1.5 self-center">
              {[
                { num: 1, label: "Signal" },
                { num: 2, label: "Reasoning" },
                { num: 3, label: "Calibrate" },
                { num: 4, label: "Commit" }
              ].map((step, idx) => (
                <React.Fragment key={step.num}>
                  <button
                    onClick={() => {
                      setActiveStep(step.num);
                      if (step.num < 4) {
                        setTerminalLines([]);
                        setIsExecuting(false);
                        setShowSuccessCertificate(false);
                      }
                    }}
                    className={clsx(
                      "px-3.5 py-1.5 rounded-lg text-[10px] font-extrabold tracking-wider uppercase border cursor-pointer transition-all",
                      activeStep === step.num
                        ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-950 dark:border-white shadow-sm"
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
          </div>
        )}

        {/* Workspace Content View */}
        {activeScenarioId === "swissoptics-tprm" && activeStep === 1 ? (
          <SwissOpticsScenarioView 
            onProceedToReasoning={() => setActiveStep(2)} 
            activeStep={activeStep}
            onSelectStep={(s) => {
              setActiveStep(s);
              if (s < 4) {
                setTerminalLines([]);
                setIsExecuting(false);
                setShowSuccessCertificate(false);
              }
            }}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* Main Content Area: Left & Middle Columns (2/3 width) */}
            <div className="lg:col-span-2 bg-white dark:bg-[#090d16]/60 border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-sm flex flex-col justify-between relative min-h-[480px]">
              
              {/* Animate Step Transitions */}
              <AnimatePresence mode="wait">
                {activeStep === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-6"
                  >
                    <div className="flex justify-between items-center text-[9px] font-extrabold uppercase tracking-widest text-slate-500 border-b border-slate-100 dark:border-white/5 pb-2">
                      <span className="flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        Step 1: Signal & Third-Party Risk (TPRM 360 View)
                      </span>
                      <span>Automated Ingestion</span>
                    </div>

                    {/* Top Alert & Crawl Feeds */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-red-500/5 dark:bg-red-500/10 rounded-2xl border border-red-500/15 space-y-1.5">
                        <span className="text-[10px] text-red-600 dark:text-red-400 font-extrabold uppercase tracking-wider block font-mono flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          Trigger Event Ingestion
                        </span>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                          {scenario.situation}
                        </p>
                      </div>

                      <div className="p-3.5 bg-slate-900 text-slate-200 rounded-2xl font-mono text-[10px] space-y-1.5 border border-white/5 shadow-inner flex flex-col justify-between">
                        <span className="text-[9px] text-slate-400 font-extrabold uppercase block tracking-widest">
                          Raw Crawled Ingestion Logs
                        </span>
                        {activeScenarioId === "strait-of-hormuz" ? (
                          <div className="space-y-1">
                            <div className="text-red-400">&bull; [SC Logistics] Shipping Lane Strait of Hormuz blocked. Red Flag registered.</div>
                            <div className="text-slate-300">&bull; [Inventory Audit] Depletion alert at storage Plant DE-10. Material MAT_COB_4019 count critical.</div>
                            <div className="text-amber-400">&bull; [Procurement Alert] Alternate vendor sources found: VEND_US_8009 (AlloyTech US).</div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="text-purple-400">&bull; [Treasury Scan] Active intercompany borrowing rates discrepancy found. Net leakage: $235,000/yr.</div>
                            <div className="text-slate-300">&bull; [G/L Ledger Check] Singapore cash surplus: $8.0M @ 3.5%; US debt liability: -$5.0M @ 8.2%.</div>
                            <div className="text-emerald-400">&bull; [Boundary Test] Intercompany clearance rules check triggered (ACDOCA/BSEG validation).</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Vendor 360 Deep-Dive Commercial Intelligence */}
                    <div className="space-y-3">
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block font-mono flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                        Commercial Entity 360 Profile & Relationships
                      </span>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-200/80 dark:border-white/5 space-y-1">
                          <span className="text-[9px] text-slate-400 uppercase font-bold block">Entity Name & Location</span>
                          <div className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{scenario.vendor360.entityName}</div>
                          <span className="text-[9.5px] font-mono text-indigo-500 font-semibold">{scenario.vendor360.relationshipTier}</span>
                        </div>

                        <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-200/80 dark:border-white/5 space-y-1">
                          <span className="text-[9px] text-slate-400 uppercase font-bold block">Annual AP Buy Spend</span>
                          <div className="text-xs font-extrabold text-slate-900 dark:text-white font-mono">{scenario.vendor360.annualBuySpend}</div>
                          <span className="text-[9.5px] font-sans text-slate-500 truncate block">{scenario.vendor360.buyItems}</span>
                        </div>

                        <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-200/80 dark:border-white/5 space-y-1">
                          <span className="text-[9px] text-slate-400 uppercase font-bold block flex items-center justify-between">
                            <span>Reverse Trade / Sell</span>
                            <span className="text-emerald-500 text-[8px] font-bold">Dual-Role</span>
                          </span>
                          <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">{scenario.vendor360.annualSellVolume}</div>
                          <span className="text-[9.5px] font-sans text-slate-500 truncate block">{scenario.vendor360.sellItems}</span>
                        </div>

                        <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-200/80 dark:border-white/5 space-y-1">
                          <span className="text-[9px] text-slate-400 uppercase font-bold block">Net Exposure Position</span>
                          <div className="text-xs font-extrabold text-amber-600 dark:text-amber-400 font-mono">{scenario.vendor360.netExposure}</div>
                          <span className="text-[9.5px] font-mono text-slate-500 font-semibold">{scenario.vendor360.openInvoices.length} Open Voucher(s)</span>
                        </div>
                      </div>
                    </div>

                    {/* ARIA Recommendations Matrix */}
                    <div className="space-y-3">
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block font-mono flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                        ARIA Strategic Enterprise Recommendations Matrix
                      </span>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {scenario.ariaRecommendations.map((rec) => (
                          <div 
                            key={rec.id}
                            className={clsx(
                              "p-3.5 rounded-2xl border flex items-start gap-3 transition-all",
                              rec.recommended 
                                ? "bg-indigo-500/5 dark:bg-indigo-500/10 border-indigo-500/30 shadow-sm" 
                                : "bg-slate-50 dark:bg-slate-950/30 border-slate-200/70 dark:border-white/5"
                            )}
                          >
                            <div className={clsx(
                              "w-6 h-6 rounded-lg text-xs font-extrabold font-mono flex items-center justify-center shrink-0 mt-0.5",
                              rec.recommended 
                                ? "bg-indigo-600 text-white" 
                                : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                            )}>
                              {rec.id}
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-900 dark:text-white font-sans">{rec.title}</span>
                                {rec.recommended && (
                                  <span className="text-[8px] font-extrabold font-mono uppercase bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 px-1.5 py-0.5 rounded">
                                    Primary Path
                                  </span>
                                )}
                              </div>
                              <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                {rec.desc}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex justify-between items-center text-[10px] font-mono uppercase tracking-wide text-slate-400">
                      <span>Vendor 360 & Recommendations Ingested</span>
                      <button
                        onClick={() => setActiveStep(2)}
                        className="px-5 py-2.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-955 font-extrabold text-[10px] tracking-wider flex items-center gap-1.5 cursor-pointer transition-all hover:opacity-85 shadow"
                      >
                        Explore Table Connectome & Reasoning
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                )}

              {activeStep === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center text-[9px] font-extrabold uppercase tracking-widest text-slate-500 border-b border-slate-100 dark:border-white/5 pb-2">
                    <span className="flex items-center gap-1">
                      <Brain className="w-3.5 h-3.5 text-indigo-505" />
                      Step 2: Table Mapping & Connectome Reasoning
                    </span>
                    <span>Semantic Tracing</span>
                  </div>

                  <div className="space-y-4 py-1">
                    {/* Embedded Sub-Graph Canvas Pane */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] text-slate-400 font-extrabold uppercase block font-mono">
                          Interactive Cognitive Graph Sub-Topology
                        </span>
                        <span className="text-[8.5px] font-mono text-indigo-400 font-bold">
                          Zoom Level 2 &bull; Active Signal Filter
                        </span>
                      </div>

                      <div className="h-80 w-full">
                        <Cognitive3DGraphCanvas 
                          scenarioFilter={activeScenarioId}
                          ariaLevers={s1Levers}
                          embeddedMode={true}
                        />
                      </div>
                    </div>

                    {/* SAP Tables Traced */}
                    <div className="space-y-2">
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase block font-mono">
                        Queried SAP S/4HANA Database Tables
                      </span>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {scenario.tables.map((tbl, idx) => (
                          <div key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-950/45 rounded-2xl border border-slate-200 dark:border-white/5 flex items-start gap-3 shadow-sm">
                            <Database className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                            <div className="space-y-0.5">
                              <span className="text-xs font-bold text-slate-850 dark:text-white font-sans">{tbl.name}</span>
                              <p className="text-[10px] font-mono text-slate-500 font-medium leading-normal">{tbl.fields}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex justify-between items-center text-[10px] font-mono uppercase tracking-wide text-slate-400">
                    <span>Connectome traversal mapping completed</span>
                    <button
                      onClick={() => setActiveStep(3)}
                      className="px-5 py-2.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-extrabold text-[10px] tracking-wider flex items-center gap-1.5 cursor-pointer transition-all hover:opacity-85 shadow"
                    >
                      Calibrate Levers
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {activeStep === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center text-[9px] font-extrabold uppercase tracking-widest text-slate-500 border-b border-slate-100 dark:border-white/5 pb-2">
                    <span className="flex items-center gap-1">
                      <Sliders className="w-3.5 h-3.5 text-indigo-505" />
                      Step 3: Corrective Path Calibration Matrix
                    </span>
                    <span>Action Calibration</span>
                  </div>

                  <div className="space-y-5 py-1">
                    {/* Scenario 1 Multi-Lever Matrix */}
                    {activeScenarioId === "swissoptics-tprm" && (
                      <div className="space-y-4">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block font-mono">
                          Configure Executive Resolution Action Levers
                        </span>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Lever 1: AP Payment Block */}
                          <div 
                            className={clsx(
                              "p-4 rounded-2xl border transition-all space-y-2 cursor-pointer",
                              s1Levers.apPaymentBlock
                                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900 dark:border-white shadow-sm"
                                : "bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400"
                            )}
                            onClick={() => setS1Levers(prev => ({ ...prev, apPaymentBlock: !prev.apPaymentBlock }))}
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-mono font-bold uppercase tracking-wider">Lever 1 &bull; BAPI_ACC_DOCUMENT_POST</span>
                              <div className={clsx(
                                "w-4 h-4 rounded-full border flex items-center justify-center text-[9px]",
                                s1Levers.apPaymentBlock ? "border-emerald-500 bg-emerald-500 text-white font-bold" : "border-slate-400"
                              )}>
                                {s1Levers.apPaymentBlock ? "✓" : ""}
                              </div>
                            </div>
                            <h4 className="text-xs font-bold font-sans">AP Payment Block Code 'A'</h4>
                            <p className="text-[10px] opacity-80 leading-relaxed font-medium">
                              Locks pending voucher 10002841 ($450,000) to prevent BEC wire fraud.
                            </p>
                          </div>

                          {/* Lever 2: Vendor Purchasing Freeze */}
                          <div 
                            className={clsx(
                              "p-4 rounded-2xl border transition-all space-y-2 cursor-pointer",
                              s1Levers.vendorMasterFreeze
                                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900 dark:border-white shadow-sm"
                                : "bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400"
                            )}
                            onClick={() => setS1Levers(prev => ({ ...prev, vendorMasterFreeze: !prev.vendorMasterFreeze }))}
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-mono font-bold uppercase tracking-wider">Lever 2 &bull; BAPI_VENDOR_BLOCK</span>
                              <div className={clsx(
                                "w-4 h-4 rounded-full border flex items-center justify-center text-[9px]",
                                s1Levers.vendorMasterFreeze ? "border-emerald-500 bg-emerald-500 text-white font-bold" : "border-slate-400"
                              )}>
                                {s1Levers.vendorMasterFreeze ? "✓" : ""}
                              </div>
                            </div>
                            <h4 className="text-xs font-bold font-sans">Vendor Purchasing Freeze (LFA1-SPERR)</h4>
                            <p className="text-[10px] opacity-80 leading-relaxed font-medium">
                              Blocks buyers from issuing new POs to SwissOptics until cyber audit clears.
                            </p>
                          </div>

                          {/* Lever 3: Alternate Supplier Reroute */}
                          <div className="p-4 rounded-2xl border bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-white/5 space-y-2 md:col-span-2">
                            <div className="flex justify-between items-center text-xs font-semibold">
                              <span className="text-slate-700 dark:text-slate-300 font-bold">
                                Lever 3 &bull; Re-route Order Volume to Carl Zeiss Optronics CH (VEND_CH_8801)
                              </span>
                              <span className="font-mono font-bold text-slate-900 dark:text-white">
                                {s1Levers.alternateSupplierReroute}% Rerouted
                              </span>
                            </div>
                            <input 
                              type="range"
                              min="0"
                              max="100"
                              step="10"
                              value={s1Levers.alternateSupplierReroute}
                              onChange={(e) => setS1Levers(prev => ({ ...prev, alternateSupplierReroute: Number(e.target.value) }))}
                              className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-slate-900 dark:accent-white"
                            />
                            <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                              <span>0% (Single Source Risk)</span>
                              <span>50% (Dual Sourcing)</span>
                              <span>100% (Full Reallocation)</span>
                            </div>
                          </div>

                          {/* Lever 4: AR Netting Hold */}
                          <div 
                            className={clsx(
                              "p-4 rounded-2xl border transition-all space-y-2 cursor-pointer md:col-span-2",
                              s1Levers.arNettingHold
                                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900 dark:border-white shadow-sm"
                                : "bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400"
                            )}
                            onClick={() => setS1Levers(prev => ({ ...prev, arNettingHold: !prev.arNettingHold }))}
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-mono font-bold uppercase tracking-wider">Lever 4 &bull; AR Netting & Collateral Hold</span>
                              <div className={clsx(
                                "w-4 h-4 rounded-full border flex items-center justify-center text-[9px]",
                                s1Levers.arNettingHold ? "border-emerald-500 bg-emerald-500 text-white font-bold" : "border-slate-400"
                              )}>
                                {s1Levers.arNettingHold ? "✓" : ""}
                              </div>
                            </div>
                            <h4 className="text-xs font-bold font-sans">Freeze $210,000 Pending Accounts Receivable</h4>
                            <p className="text-[10px] opacity-80 leading-relaxed font-medium">
                              Locks receivables from SwissOptics for Sensor Calibration Chips to offset potential default damages.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeScenarioId === "strait-of-hormuz" && (
                      <div className="space-y-6 bg-slate-50 dark:bg-slate-950/45 p-5 rounded-2xl border border-slate-200 dark:border-white/5">
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-600 dark:text-slate-400">FX Hedge Ratio</span>
                            <span className="font-mono font-bold text-slate-900 dark:text-white">{fxHedgeRatio}%</span>
                          </div>
                          <input 
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={fxHedgeRatio}
                            onChange={(e) => setFxHedgeRatio(Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-slate-900 dark:accent-white"
                          />
                          <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                            <span>No Hedge: 0%</span>
                            <span>Full Forward Hedge: 100%</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-600 dark:text-slate-400">Reorder Quantity (Cobalt Sensors)</span>
                            <span className="font-mono font-bold text-slate-900 dark:text-white">{reorderQty.toLocaleString()} units</span>
                          </div>
                          <input 
                            type="range"
                            min="1000"
                            max="10000"
                            step="500"
                            value={reorderQty}
                            onChange={(e) => setReorderQty(Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-slate-900 dark:accent-white"
                          />
                          <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                            <span>Min: 1,000 units</span>
                            <span>Max: 10,000 units</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeScenarioId === "global-treasury-sweep" && (
                      <div className="space-y-4 bg-slate-50 dark:bg-slate-950/45 p-5 rounded-2xl border border-slate-200 dark:border-white/5">
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-600 dark:text-slate-400">Sweep Volume (Singapore to US)</span>
                            <span className="font-mono font-bold text-slate-900 dark:text-white">${sweepVolume.toFixed(1)}M</span>
                          </div>
                          <input 
                            type="range"
                            min="1.0"
                            max="8.0"
                            step="0.5"
                            value={sweepVolume}
                            onChange={(e) => setSweepVolume(Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-slate-900 dark:accent-white"
                          />
                          <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                            <span>Min Sweep: $1.0M</span>
                            <span>Max Sweep: $8.0M</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Calculated dynamic projected impacts */}
                    <div className="p-5 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl space-y-2.5">
                      <span className="text-[9px] text-indigo-650 dark:text-indigo-400 font-extrabold uppercase tracking-wider block font-mono">
                        Projected Resolution Outcomes
                      </span>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-slate-400 block font-semibold">
                            {activeScenarioId === "swissoptics-tprm" ? "Active Action Levers" : activeScenarioId === "strait-of-hormuz" ? "Rerouted Volume" : "Tax Code Status"}
                          </span>
                          <span className="text-sm font-extrabold text-slate-805 dark:text-white font-mono">
                            {activeScenarioId === "swissoptics-tprm" ? `${[s1Levers.apPaymentBlock, s1Levers.vendorMasterFreeze, s1Levers.arNettingHold].filter(Boolean).length + (s1Levers.alternateSupplierReroute > 0 ? 1 : 0)} / 4 Active` : activeScenarioId === "strait-of-hormuz" ? `${reorderQty.toLocaleString()} units` : "I0 (Exempt - verified)"}
                          </span>
                        </div>

                        <div className="space-y-0.5">
                          <span className="text-[10px] text-slate-400 block font-semibold">
                            {activeScenarioId === "swissoptics-tprm" ? "Total Suspended Exposure" : activeScenarioId === "strait-of-hormuz" ? "Hedged SC Cost Savings" : "Annual Cash Interest Saved"}
                          </span>
                          <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-450 font-mono">
                            {activeScenarioId === "swissoptics-tprm" ? "$660,000" : activeScenarioId === "strait-of-hormuz" ? `$${simulatedHedgeSavings.toLocaleString()}` : `+$${simulatedSweepSavings.toLocaleString()}/yr`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex justify-between items-center text-[10px] font-mono uppercase tracking-wide text-slate-400">
                    <span>Impact metrics calibrated</span>
                    <button
                      onClick={() => {
                        setActiveStep(4);
                        executeWriteBack();
                      }}
                      className="px-5 py-2.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-extrabold text-[10px] tracking-wider flex items-center gap-1.5 cursor-pointer transition-all hover:opacity-85 shadow"
                    >
                      Authorize Execution
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {activeStep === 4 && (
                <motion.div
                  key="step-4"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center text-[9px] font-extrabold uppercase tracking-widest text-slate-500 border-b border-slate-100 dark:border-white/5 pb-2">
                    <span className="flex items-center gap-1">
                      <Terminal className="w-3.5 h-3.5 text-indigo-505" />
                      Step 4: Commit S/4HANA Write-Back Payloads
                    </span>
                    <span>RFC Execution Gate</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-1">
                    
                    {/* BAPI Payload Panel */}
                    <div className="space-y-2">
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase block font-mono">
                        Generated RFC BAPI Payload(s)
                      </span>

                      <div className="p-4 bg-slate-50 dark:bg-black/35 rounded-2xl border border-slate-200 dark:border-white/10 flex flex-col justify-between h-[230px]">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <FileCode className="w-4 h-4 text-indigo-500 shrink-0" />
                            <span className="text-xs font-bold text-slate-800 dark:text-white font-sans">{scenario.bapiName}</span>
                          </div>
                          <p className="text-[10.5px] text-slate-455 dark:text-slate-400 font-sans leading-relaxed font-medium">
                            {scenario.bapiDesc}
                          </p>
                        </div>

                        <pre className="p-3 bg-slate-900 text-slate-300 rounded-xl font-mono text-[9.5px] overflow-auto select-text scrollbar-none border border-white/5 flex-1 mt-2.5">
                          {JSON.stringify(scenario.bapiPayload, null, 2)}
                        </pre>
                      </div>
                    </div>

                    {/* S/4HANA RFC Live Terminal */}
                    <div className="space-y-2">
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase block font-mono">
                        S/4HANA Live RFC Execution Terminal
                      </span>

                      <div className="p-4 bg-slate-900 rounded-2xl border border-white/5 h-[230px] overflow-y-auto font-mono text-[9.5px] text-emerald-400 space-y-1 scrollbar-none flex flex-col justify-end">
                        <AnimatePresence>
                          {terminalLines.map((line, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -5 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="leading-relaxed"
                            >
                              {line}
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        {isExecuting && (
                          <div className="flex items-center gap-1.5 text-slate-400 mt-1">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                            <span>Processing remote BAPI gateway parameters...</span>
                          </div>
                        )}
                        {!isExecuting && terminalLines.length === 0 && (
                          <div className="text-slate-500 italic text-center my-auto">
                            Authorization signature required to connect ERP pipeline
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex justify-between items-center text-[10px] font-mono uppercase tracking-wide text-slate-400">
                    <span>Compliance sign-off active</span>
                    
                    {!showSuccessCertificate ? (
                      <button
                        onClick={executeWriteBack}
                        disabled={isExecuting}
                        className="px-6 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 font-extrabold text-[10px] tracking-wider flex items-center gap-2 cursor-pointer transition-all shadow disabled:opacity-40"
                      >
                        <Lock className="w-3.5 h-3.5 fill-current" />
                        Authorize System Write-Back
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 text-emerald-500 font-extrabold text-[10px] tracking-wider border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 rounded-full uppercase">
                        <CheckCircle className="w-3.5 h-3.5 fill-current" />
                        Transaction Posted Successfully
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Visualizer Status and Negentropy Curve (1/3 width) */}
          <div className="lg:col-span-1 bg-white dark:bg-[#090d16]/60 border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-sm flex flex-col justify-between select-none min-h-[480px]">
            
            {/* Visualizer Header */}
            <div>
              <div className="flex justify-between items-center text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mb-6 border-b border-slate-100 dark:border-white/5 pb-2 shrink-0">
                <span className="flex items-center gap-1.5 font-bold">
                  <Activity className="w-3.5 h-3.5 text-indigo-505" />
                  Manifold Metrics Visualizer
                </span>
              </div>

              {/* Dynamic Information Box based on active step */}
              <div className="space-y-4">
                
                {/* Risk Curvature Card with Scale & Reference Baseline */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950/45 rounded-2xl border border-slate-200 dark:border-white/5 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-[#008fbb] dark:text-cyan-400 font-extrabold uppercase font-mono">
                      Risk Curvature Rating (κ)
                    </span>
                    <span className={clsx(
                      "text-[8.5px] font-extrabold uppercase px-2 py-0.5 rounded-full border font-mono",
                      Number(simulatedCurvature) >= 6.0
                        ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                        : Number(simulatedCurvature) >= 3.0
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    )}>
                      {Number(simulatedCurvature) >= 6.0 ? "Critical (Action Req.)" : Number(simulatedCurvature) >= 3.0 ? "Moderate Elevation" : "Stabilized (Optimal)"}
                    </span>
                  </div>
                  
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
                        {simulatedCurvature}
                      </span>
                      <span className="text-[9.5px] text-slate-400 font-mono">/ 10.0 scale</span>
                    </div>

                    <div className="text-right text-[9px] text-slate-400 font-mono">
                      <span>Target Nominal: </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">1.0 κ</span>
                    </div>
                  </div>

                  {/* Horizontal Spectrum Track Gauge */}
                  <div className="space-y-1">
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative">
                      <div 
                        className={clsx(
                          "h-full transition-all duration-500 rounded-full",
                          Number(simulatedCurvature) >= 6.0 ? "bg-red-500" : Number(simulatedCurvature) >= 3.0 ? "bg-amber-500" : "bg-emerald-500"
                        )}
                        style={{ width: `${Math.min(100, Math.max(10, (Number(simulatedCurvature) / 10.0) * 100))}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[8px] text-slate-400 font-mono">
                      <span>1.0 (Optimal Target)</span>
                      <span>5.0 (Threshold)</span>
                      <span>10.0 (Emergency)</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed font-sans">
                    {activeStep === 1 
                      ? "Unmitigated threat logs raise risk metrics above threshold. Transition to reasoning to evaluate short geodesics." 
                      : activeStep === 2
                      ? "Table boundaries mapped. Geodesic coordinates ready for parameter adjustment."
                      : activeStep === 3
                      ? "Calibration updates risk curvature dynamically. Stabilize to 1.0 to clear ledger blockages."
                      : "Morphisms successfully clearance-tested. RFC post posted."}
                  </p>
                </div>

                {/* Negentropy creation tracking with Benchmark Scale */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950/45 rounded-2xl border border-slate-200 dark:border-white/5 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-indigo-650 dark:text-indigo-400 font-extrabold uppercase font-mono">
                      System Negentropy
                    </span>
                    <span className="text-[8.5px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 font-mono">
                      High Structuring
                    </span>
                  </div>
                  
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-extrabold font-mono text-slate-800 dark:text-white">
                        +14.2
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">bits / token</span>
                    </div>

                    <div className="text-right text-[9px] text-slate-400 font-mono">
                      <span>Benchmark: </span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">&gt; 10.0 b/t</span>
                    </div>
                  </div>

                  <p className="text-[9.5px] text-slate-450 dark:text-slate-400 leading-normal font-medium">
                    Measures structured data order created in ERP database ledgers per LLM cognitive query.
                  </p>
                </div>

                {/* Geodesic Efficiency Metric Box */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950/45 rounded-2xl border border-slate-200 dark:border-white/5 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-amber-600 dark:text-amber-400 font-extrabold uppercase font-mono">
                      Geodesic Path Efficiency
                    </span>
                    <span className="text-[8.5px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-mono">
                      Benchmark: 90%+
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-extrabold font-mono text-amber-600 dark:text-amber-400">
                      {activeScenarioId === "swissoptics-tprm" ? "40%" : activeScenarioId === "strait-of-hormuz" ? "35%" : "52%"}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">
                      Post-Commit Target: <strong className="text-emerald-500">96%</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SVG Visualizer Chart with Axes & Nominal Reference Line */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block font-mono">
                  Scenario Curvature Projection (κ vs Time)
                </span>
                <span className="text-[8px] font-mono text-emerald-500 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Target Line: 1.0 κ
                </span>
              </div>

              <div className="h-36 w-full bg-slate-900/90 rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden p-3 relative">
                {/* SVG Chart with Labeled Axes */}
                <svg className="w-full h-full" viewBox="0 0 120 50">
                  {/* Y-Axis Grid Lines & Tick Labels */}
                  <line x1="18" y1="8" x2="115" y2="8" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" strokeDasharray="1,2" />
                  <text x="2" y="10" className="text-[4px] fill-red-400 font-mono font-bold">10.0 (Alarm)</text>

                  <line x1="18" y1="22" x2="115" y2="22" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" strokeDasharray="1,2" />
                  <text x="2" y="24" className="text-[4px] fill-amber-400 font-mono font-bold">5.0 (Elevated)</text>

                  {/* Nominal Target Line (1.0 κ) */}
                  <line x1="18" y1="36" x2="115" y2="36" stroke="#10b981" strokeWidth="0.75" strokeDasharray="2,2" />
                  <text x="2" y="38" className="text-[4px] fill-emerald-400 font-mono font-bold">1.0 (Target)</text>

                  {/* Dynamic Curvature Trajectory */}
                  {activeScenarioId === "swissoptics-tprm" ? (
                    <>
                      <path
                        d={`M 20 8 L 50 8 L 70 36 L 115 ${Math.min(42, 36 - ((s1Levers.alternateSupplierReroute + (s1Levers.apPaymentBlock ? 30 : 0)) / 4))}`}
                        fill="none"
                        stroke={scenario.themeColor}
                        strokeWidth="1.5"
                      />
                      <circle cx="70" cy="36" r="1.5" fill="#ef4444" />
                      <circle cx="115" cy={Math.min(42, 36 - ((s1Levers.alternateSupplierReroute + (s1Levers.apPaymentBlock ? 30 : 0)) / 4))} r="1.5" fill={scenario.themeColor} />
                    </>
                  ) : activeScenarioId === "strait-of-hormuz" ? (
                    <>
                      <path
                        d={`M 20 10 L 50 38 L 55 38 Q 85 15, 115 ${Math.max(8, 36 - reorderQty / 300)}`}
                        fill="none"
                        stroke="#fca5a5"
                        strokeWidth="1.5"
                      />
                      <circle cx="50" cy="38" r="1.5" fill="#ef4444" />
                      <circle cx="115" cy={Math.max(8, 36 - reorderQty / 300)} r="1.5" fill="#fca5a5" />
                    </>
                  ) : (
                    <>
                      <rect x="35" y={Math.max(10, 36 - 8 * 2.5)} width="15" height={8 * 2.5} fill="#d8b4fe" rx="1" />
                      <rect x="80" y={Math.max(10, 36 - (5 + sweepVolume) * 2.2)} width="15" height={(5 + sweepVolume) * 2.2} fill="#a855f7" rx="1" />
                    </>
                  )}

                  {/* X-Axis Labels */}
                  <text x="18" y="47" className="text-[4px] fill-slate-400 font-mono">T0 (Ingest)</text>
                  <text x="60" y="47" className="text-[4px] fill-slate-400 font-mono">T+7d (Calibrated)</text>
                  <text x="95" y="47" className="text-[4px] fill-slate-400 font-mono">T+30d (Target)</text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

        {/* Certificate Section for active verification */}
        <AnimatePresence>
          {showSuccessCertificate && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl flex items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600 shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                
                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-bold text-emerald-650 uppercase tracking-widest block">
                    Cryptographic Evidence Certificate
                  </span>
                  
                  <h4 className="text-sm font-extrabold text-emerald-805 dark:text-emerald-400">
                    S/4HANA Transaction Clearing morph complete
                  </h4>
                  
                  <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                    Ledger post written back successfully. Clearing reference: <span className="font-mono text-[11px] font-bold text-slate-800 dark:text-white">SEC-{activeScenarioId.toUpperCase()}-2026-07</span>. 
                    Morphism verified compliant at all legal company boundaries.
                  </p>
                </div>
              </div>

              <div className="text-right font-mono text-[10px] text-slate-400 space-y-0.5 shrink-0 hidden md:block">
                <div>Hash: sha256:4f89d3a1...d5c4b3a</div>
                <div>Timestamp: {new Date().toISOString()}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
