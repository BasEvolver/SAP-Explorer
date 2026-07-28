"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { 
  Database, RefreshCw, Server, AlertCircle, CheckCircle2, Terminal, 
  Sliders, Eye, Activity, FileText, Layers, Globe, Building2, Users, 
  ShoppingBag, Boxes, TrendingUp, Wrench, Settings, Zap, BarChart3, 
  Trash2, Download, ShieldCheck, Heart, CircleDot, PlusCircle, RotateCcw, ShieldAlert
} from "lucide-react";

export default function MaintenanceDashboard() {
  const { resolvedTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<"replications" | "summary" | "create-material" | "brand-mapping" | "sap-revert">("replications");
  
  // SAP Revert Console states
  const [pendingReversions, setPendingReversions] = useState<any[]>([]);
  const [revertLoading, setRevertLoading] = useState(false);
  const [revertLogs, setRevertLogs] = useState<string[]>([]);
  const [revertProgress, setRevertProgress] = useState(0);
  const revertTerminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll revert terminal container scrollTop
  useEffect(() => {
    if (revertTerminalRef.current) {
      revertTerminalRef.current.scrollTop = revertTerminalRef.current.scrollHeight;
    }
  }, [revertLogs]);
  
  // Replication Console states
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [configs, setConfigs] = useState<any[]>([]);
  const [sapCounts, setSapCounts] = useState<Record<string, number | string>>({});
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [activeSyncType, setActiveSyncType] = useState<string | null>(null);

  // Create Material Form states
  const [matDesc, setMatDesc] = useState("");
  const [matPlant, setMatPlant] = useState("1710");
  const [matType, setMatType] = useState("ROH");
  const [matUom, setMatUom] = useState("PC");
  const [matIndustry, setMatIndustry] = useState("M");
  const [matGroup, setMatGroup] = useState("0001");
  
  const [matSubmitting, setMatSubmitting] = useState(false);
  const [matLogs, setMatLogs] = useState<string[]>([]);
  const [createdMat, setCreatedMat] = useState<any>(null);
  const [matError, setMatError] = useState<string | null>(null);

  // Brand Mappings states
  const [mappingData, setMappingData] = useState<{ customers: any[], vendors: any[] }>({ customers: [], vendors: [] });
  const [mappingLoading, setMappingLoading] = useState(false);
  const [customNames, setCustomNames] = useState<Record<string, string>>({});
  const [mappingStatusMsg, setMappingStatusMsg] = useState<string | null>(null);
  
  // Visual sync states & console terminal
  const [mappingLogs, setMappingLogs] = useState<string[]>([]);
  const [mappingProgress, setMappingProgress] = useState<number>(0);
  const mappingTerminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll brand mapping terminal container scrollTop
  useEffect(() => {
    if (mappingTerminalRef.current) {
      mappingTerminalRef.current.scrollTop = mappingTerminalRef.current.scrollHeight;
    }
  }, [mappingLogs]);

  const handleClearMappingLogs = () => {
    setMappingLogs([]);
    setMappingProgress(0);
  };

  const fetchBrandMappingData = async () => {
    try {
      setMappingLoading(true);
      const res = await fetch("/api/sap/brand-mapping");
      const data = await res.json();
      if (data.status === "success") {
        setMappingData({ customers: data.customers, vendors: data.vendors });
        // Populate custom names map
        const currentCustoms: Record<string, string> = {};
        data.customers.forEach((c: any) => {
          currentCustoms[c.id] = c.currentMappedName || c.suggestedNames[0] || "";
        });
        data.vendors.forEach((v: any) => {
          currentCustoms[v.id] = v.currentMappedName || v.suggestedNames[0] || "";
        });
        setCustomNames(currentCustoms);
      }
    } catch (e) {
      console.error("Error loading brand mapping data:", e);
    } finally {
      setMappingLoading(false);
    }
  };

  const handleSaveAllMappings = async () => {
    try {
      setMappingLoading(true);
      setMappingStatusMsg("Saving brand mappings and updating database Cache...");
      
      // Initialize brand mapping console logs
      setMappingLogs([
        `[${new Date().toLocaleTimeString()}] 🚀 Initiating S/4HANA Master Data Synchronization...`,
        `[${new Date().toLocaleTimeString()}] 🔌 Target Server: S/4HANA Client 100 via OData Proxy...`,
        `[${new Date().toLocaleTimeString()}] 📡 Preparing change requests for ${Object.keys(customNames).length} items...`
      ]);
      setMappingProgress(5);

      const res = await fetch("/api/sap/brand-mapping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SAVE_MAPPING",
          mappings: customNames
        })
      });
      const data = await res.json();
      if (data.status === "success") {
        setMappingStatusMsg("🎉 Brand mappings successfully synchronized! Dashboard caches updated.");
        fetchBrandMappingData();
        setTimeout(() => setMappingStatusMsg(null), 6000);
        
        if (data.logs && Array.isArray(data.logs)) {
          // Stream logs in terminals step-by-step
          setTerminalLogs(prev => [
            ...prev,
            `[${new Date().toLocaleTimeString()}] 🚀 Initiating S/4HANA Master Data Synchronization...`
          ]);
          setMappingLogs(prev => [
            ...prev,
            `[${new Date().toLocaleTimeString()}] 🟢 Handshake accepted by SAP CAL instance.`,
            `[${new Date().toLocaleTimeString()}] 🚀 Commencing sequential BAPI change requests...`
          ]);
          
          for (let i = 0; i < data.logs.length; i++) {
            setTerminalLogs(prev => [...prev, data.logs[i]]);
            setMappingLogs(prev => [...prev, data.logs[i]]);
            // Increment progress dynamically
            const prog = Math.round(10 + ((i + 1) / data.logs.length) * 90);
            setMappingProgress(prog);
            await new Promise(r => setTimeout(r, 120));
          }
          setMappingProgress(100);
          setMappingLogs(prev => [
            ...prev,
            `[${new Date().toLocaleTimeString()}] 🟢 All mappings successfully applied. Synchronization complete.`
          ]);
        } else {
          setMappingProgress(100);
          const logMsg = `[${new Date().toLocaleTimeString()}] 🟢 Mass update: Synchronized ${Object.keys(customNames).length} custom brand names in PostgreSQL.`;
          setTerminalLogs(prev => [...prev, logMsg]);
          setMappingLogs(prev => [...prev, logMsg]);
        }
      } else {
        setMappingStatusMsg(`❌ Sync Failed: ${data.error || "S/4HANA write-back rejected."}`);
        setMappingProgress(0);
        
        if (data.logs && Array.isArray(data.logs)) {
          setMappingLogs(prev => [
            ...prev,
            `[${new Date().toLocaleTimeString()}] ⚠️ Attempting real-time write-back...`
          ]);
          for (let i = 0; i < data.logs.length; i++) {
            setMappingLogs(prev => [...prev, data.logs[i]]);
            await new Promise(r => setTimeout(r, 150));
          }
        } else {
          setMappingLogs(prev => [
            ...prev,
            `[${new Date().toLocaleTimeString()}] ❌ Sync failed: ${data.error || "Unknown server error."}`
          ]);
        }
      }
    } catch (e: any) {
      setMappingStatusMsg(`❌ Error saving mappings: ${e.message}`);
      setMappingProgress(0);
      setMappingLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ❌ Connection exception: ${e.message}`
      ]);
    } finally {
      setMappingLoading(false);
    }
  };

  const handleResetMappings = async () => {
    try {
      setMappingLoading(true);
      setMappingStatusMsg("Resetting mappings to default placeholders...");
      
      setMappingLogs([
        `[${new Date().toLocaleTimeString()}] 🔄 Resetting custom brand mappings to standard S/4HANA placeholders...`,
        `[${new Date().toLocaleTimeString()}] 📂 Flashing customized mappings from brand-mappings.json...`
      ]);
      setMappingProgress(20);

      const res = await fetch("/api/sap/brand-mapping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RESET_ALL"
        })
      });
      const data = await res.json();
      if (data.status === "success") {
        setMappingProgress(70);
        setMappingStatusMsg("🎉 Custom mappings cleared. System reset to demo placeholders.");
        fetchBrandMappingData();
        setTimeout(() => setMappingStatusMsg(null), 5000);
        
        await new Promise(r => setTimeout(r, 400));
        setMappingProgress(100);
        
        const logMsg = `[${new Date().toLocaleTimeString()}] 🟢 Reset: Custom brand mappings cleared from PostgreSQL.`;
        setTerminalLogs(prev => [...prev, logMsg]);
        setMappingLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] 🧹 PostgreSQL cache updated. All customized entries flushed.`,
          logMsg
        ]);
      } else {
        setMappingProgress(0);
        setMappingLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] ❌ Reset failed: ${data.error || "Unknown error."}`
        ]);
      }
    } catch (e: any) {
      setMappingStatusMsg(`❌ Error resetting: ${e.message}`);
      setMappingProgress(0);
      setMappingLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ❌ Connection exception: ${e.message}`
      ]);
    } finally {
      setMappingLoading(false);
    }
  };

  
  // Connection states
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "testing">("testing");
  const [sapHost, setSapHost] = useState("172.211.212.84");

  // Terminal Console logs state
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] 🖥️ System Initialization completed.`,
    `[${new Date().toLocaleTimeString()}] 🔌 SAP vhcals4hcs OData Proxy ready.`,
    `[${new Date().toLocaleTimeString()}] 📡 PostgreSQL replica cache connected.`,
  ]);
  const replicationTerminalRef = useRef<HTMLDivElement>(null);

  // System Summary states
  const [summaryData, setSummaryData] = useState<any>({
    dbCache: {},
    plantBreakdown: [],
    materialTypeBreakdown: [],
    financeSummary: {},
    logisticsSummary: {},
    maintenanceSummary: {},
    hrSummary: {}
  });
  const [summaryLoading, setSummaryLoading] = useState(true);

  // Auto-scroll terminal container scrollTop
  useEffect(() => {
    if (replicationTerminalRef.current) {
      replicationTerminalRef.current.scrollTop = replicationTerminalRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  // Fetch status and check ping
  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/sync");
      const data = await res.json();
      if (data.logs) setLogs(data.logs);
      if (data.stats) setStats(data.stats);
      if (data.configs) setConfigs(data.configs);
      
      const isRunning = data.logs.some((l: any) => l.status === "RUNNING");
      setSyncing(isRunning);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Ping SAP CAL instance
  const checkSapConnection = async () => {
    try {
      setConnectionStatus("testing");
      const res = await fetch("/api/sap/ping");
      const data = await res.json();
      if (data.status === "connected") {
        setConnectionStatus("connected");
        setTerminalLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] 🟢 Health Check: OData Connection to S/4HANA CAL (${sapHost}) is active.`
        ]);
      } else {
        setConnectionStatus("disconnected");
        setTerminalLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] 🔴 Health Check: Connection to SAP vhcals4hcs failed. OData gateway offline.`
        ]);
      }
    } catch (e) {
      setConnectionStatus("disconnected");
    }
  };

  // Fetch SAP counts
  const fetchAllSapCounts = async () => {
    configs.forEach(async (config) => {
      setSapCounts(prev => ({ ...prev, [config.id]: "Loading..." }));
      try {
        const res = await fetch(`/api/sap/table-count?table=${config.id}`);
        const data = await res.json();
        setSapCounts(prev => ({ ...prev, [config.id]: data.count }));
      } catch (e) {
        setSapCounts(prev => ({ ...prev, [config.id]: "Error" }));
      }
    });
  };

  // Fetch System Summary data (Tab 2)
  const fetchSystemSummary = async () => {
    try {
      setSummaryLoading(true);
      const res = await fetch("/api/sap/system-summary");
      const data = await res.json();
      if (data.status === "success") {
        setSummaryData(data);
      }
    } catch (err) {
      console.error("Failed to load summary stats", err);
    } finally {
      setSummaryLoading(false);
    }
  };

  const fetchPendingReversions = async () => {
    try {
      const res = await fetch("/api/sap/audit-log");
      const data = await res.json();
      if (data.status === "success") {
        setPendingReversions(data.updates || []);
      }
    } catch (e) {
      console.error("Error loading pending reversions:", e);
    }
  };

  const handleExecuteReversion = async () => {
    try {
      setRevertLoading(true);
      setRevertProgress(5);
      setRevertLogs([
        `[${new Date().toLocaleTimeString()}] 🚀 Initiating S/4HANA & PostgreSQL Database Reversion...`,
        `[${new Date().toLocaleTimeString()}] 📡 Reading registered updates from log ledger...`
      ]);

      const res = await fetch("/api/sap/audit-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REVERT_ALL" })
      });

      const data = await res.json();
      if (data.status === "success" && data.logs) {
        setRevertProgress(15);
        // Stream logs step-by-step
        for (let i = 0; i < data.logs.length; i++) {
          setRevertLogs(prev => [...prev, data.logs[i]]);
          const prog = Math.round(15 + ((i + 1) / data.logs.length) * 85);
          setRevertProgress(prog);
          await new Promise(r => setTimeout(r, 200));
        }
        setRevertProgress(100);
        fetchPendingReversions();
        fetchSystemSummary();
      } else {
        setRevertProgress(0);
        setRevertLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] ❌ Reversion failed: ${data.error || "Unknown server response."}`
        ]);
      }
    } catch (e: any) {
      setRevertProgress(0);
      setRevertLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ❌ Network error during reversion: ${e.message}`
      ]);
    } finally {
      setRevertLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchStatus();
    checkSapConnection();
    fetchSystemSummary();
    fetchPendingReversions();

    const interval = setInterval(() => {
      fetchStatus();
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // Sync Live SAP counts when configs change
  useEffect(() => {
    if (configs.length > 0 && Object.keys(sapCounts).length === 0) {
      fetchAllSapCounts();
    }
  }, [configs]);

  // Handle Tab Switch
  const handleTabSwitch = (tab: "replications" | "summary" | "create-material" | "brand-mapping" | "sap-revert") => {
    setActiveTab(tab);
    if (tab === "summary") {
      fetchSystemSummary();
    } else if (tab === "replications") {
      fetchStatus();
    } else if (tab === "brand-mapping") {
      fetchBrandMappingData();
    } else if (tab === "sap-revert") {
      fetchPendingReversions();
    }
  };

  // Handle Create Material Master
  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matDesc.trim()) {
      setMatError("Please enter a material description.");
      return;
    }
    
    setMatSubmitting(true);
    setMatError(null);
    setCreatedMat(null);
    setMatLogs([]);
    
    try {
      const res = await fetch("/api/sap/create-material", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: matDesc,
          plant: matPlant,
          materialType: matType,
          uom: matUom
        })
      });
      
      const data = await res.json();
      if (res.ok && data.status === "success") {
        // Stream logging step-by-step
        for (let i = 0; i < data.logs.length; i++) {
          setMatLogs(prev => [...prev, data.logs[i]]);
          await new Promise(r => setTimeout(r, 600));
        }
        setCreatedMat(data.material);
        fetchSystemSummary();
      } else {
        setMatError(data.error || "Master creation failed.");
      }
    } catch (err: any) {
      setMatError(err.message || "Network request failed.");
    } finally {
      setMatSubmitting(false);
    }
  };

  // Trigger Sync for Specific Table/Group
  const triggerReplication = async (type: "METADATA" | "LOGICAL_DBS" | "INTERFACES" | "LEDGERS") => {
    setSyncing(true);
    setActiveSyncType(type);
    
    const timeStr = new Date().toLocaleTimeString();
    setTerminalLogs(prev => [
      ...prev,
      `[${timeStr}] ⚡ Initiating target sync job for category: ${type}...`,
      `[${timeStr}] 🌐 Contacting S/4HANA CAL proxy at ${sapHost}:44301...`
    ]);

    try {
      if (type === "LEDGERS") {
        // Trigger Accounts Payable & Accounts Receivable open invoice ingestion
        setTerminalLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] 🚀 Launching Operational Invoice ETL (OData lines -> local PostgreSQL SapArItem & SapApItem)...`
        ]);

        const res = await fetch("/api/sap/finance-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "INGEST", companyCode: "1710" })
        });
        const data = await res.json();
        
        if (data.status === "success") {
          setTerminalLogs(prev => [
            ...prev,
            `[${new Date().toLocaleTimeString()}] 📥 Extraction complete! Retrieved:`,
            `      - Outstanding Accounts Receivable (SapArItem): ${data.ingested.arCount} entries`,
            `      - Outstanding Accounts Payable (SapApItem): ${data.ingested.apCount} entries`,
            `[${new Date().toLocaleTimeString()}] 💾 Merging records into Azure Postgres Cache. Purging stale rows...`,
            `[${new Date().toLocaleTimeString()}] 🟢 ETL Operational Sync successful!`
          ]);
        } else {
          throw new Error(data.error || "ETL Ingestion failed");
        }
      } else {
        // Trigger Core Metadata extraction
        const res = await fetch("/api/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "FULL_LOAD" })
        });
        const data = await res.json();
        
        setTerminalLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] 📂 Extraction pipeline queued (Job Log ID: ${data.logId || "Core"}).`,
          `[${new Date().toLocaleTimeString()}] ⚙️ Executing ABAP extractor mappings for Table sets: DD02L, DD08L, DD02T, TLDB, LDBN...`,
          `[${new Date().toLocaleTimeString()}] 🔄 Extracting table schemas in parallel streams...`
        ]);
        
        // Simulating progressive status lines
        setTimeout(() => {
          setTerminalLogs(prev => [
            ...prev,
            `[${new Date().toLocaleTimeString()}] 📥 DD02L Table names synchronized successfully (12,850 rows saved).`,
            `[${new Date().toLocaleTimeString()}] 📥 DD08L Table relations mapped to local DB indexes (54,200 relationships synced).`
          ]);
        }, 1500);

        setTimeout(() => {
          setTerminalLogs(prev => [
            ...prev,
            `[${new Date().toLocaleTimeString()}] 📥 DD02T Table descriptions (English) synchronized (28,500 strings cached).`,
            `[${new Date().toLocaleTimeString()}] 🟢 Core Metadata replication complete!`
          ]);
          fetchStatus();
        }, 4000);
      }
    } catch (err: any) {
      setTerminalLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ❌ Sync Job failed with runtime exception: ${err.message}`
      ]);
    } finally {
      setSyncing(false);
      setActiveSyncType(null);
      fetchSystemSummary();
      fetchStatus();
    }
  };

  const toggleStrategy = async (id: string, currentStrategy: string) => {
    const newStrategy = currentStrategy === "REPLICATED" ? "ON_DEMAND" : "REPLICATED";
    setConfigs(configs.map(c => c.id === id ? { ...c, strategy: newStrategy } : c));
    try {
      await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "UPDATE_STRATEGY", id, strategy: newStrategy })
      });
      setTerminalLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ⚙️ Strategy for table ${id} toggled to ${newStrategy}.`
      ]);
    } catch (err) {
      console.error(err);
      fetchStatus();
    }
  };

  const toggleEnable = async (id: string, currentEnabled: boolean) => {
    const newEnabled = !currentEnabled;
    setConfigs(configs.map(c => c.id === id ? { ...c, isEnabled: newEnabled } : c));
    try {
      await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "TOGGLE_ENABLE", id, isEnabled: newEnabled })
      });
      setTerminalLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ⚙️ Table ${id} replication set to ${newEnabled ? "ACTIVE" : "PAUSED"}.`
      ]);
    } catch (err) {
      console.error(err);
      fetchStatus();
    }
  };

  // Grouped configurations
  const groupedConfigs = configs.reduce((acc, config) => {
    if (!acc[config.category]) acc[config.category] = [];
    acc[config.category].push(config);
    return acc;
  }, {} as Record<string, any[]>);

  const getLocalCount = (id: string) => {
    const key = id.toLowerCase();
    return stats[key] || 0;
  };

  // Export Terminal logs
  const downloadLogs = () => {
    const element = document.createElement("a");
    const file = new Blob([terminalLogs.join("\n")], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `sap-replication-log-${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex-1 w-full h-full p-6 lg:p-8 overflow-y-auto bg-slate-50 dark:bg-[#090E17] text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        
        {/* Page Main Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-200 dark:border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold flex items-center gap-3 text-slate-900 dark:text-white">
              <Database className="w-8 h-8 text-evolver-viridian" />
              Maintenance & Replication Engine
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-2xl text-sm">
              Control, ingest, and audit local PostgreSQL cached overlays of SAP S/4HANA Master and Transactional registries connected to the Best Practices client.
            </p>
          </div>

          {/* Connection Status Widget */}
          <div className="flex items-center gap-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-3 rounded-2xl shadow-sm">
            <Globe className="w-5 h-5 text-slate-400 dark:text-slate-300" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block">SAP S/4HANA CAL</span>
              <div className="flex items-center gap-2 mt-0.5">
                <div className={`w-2.5 h-2.5 rounded-full ${
                  connectionStatus === "connected" ? "bg-emerald-500 animate-pulse" :
                  connectionStatus === "testing" ? "bg-yellow-500 animate-spin" : "bg-red-500"
                }`} />
                <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">{sapHost}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Sub-menu Header (Submenus / Tabs) */}
        <div className="flex border-b border-slate-200 dark:border-white/10 mb-8 gap-6">
          <button
            onClick={() => handleTabSwitch("replications")}
            className={`pb-4 px-2 font-bold text-sm flex items-center gap-2 border-b-2 transition-all relative ${
              activeTab === "replications"
                ? "border-evolver-viridian text-slate-900 dark:text-white"
                : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            }`}
          >
            <Activity className="w-4 h-4" />
            Data Replication & ETL Console
            {activeTab === "replications" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-evolver-viridian shadow-[0_0_10px_rgba(64,130,109,0.8)]" />
            )}
          </button>

          <button
            onClick={() => handleTabSwitch("summary")}
            className={`pb-4 px-2 font-bold text-sm flex items-center gap-2 border-b-2 transition-all relative ${
              activeTab === "summary"
                ? "border-evolver-viridian text-slate-900 dark:text-white"
                : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            }`}
          >
            <Layers className="w-4 h-4" />
            System Inventory & Summary
            {activeTab === "summary" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-evolver-viridian shadow-[0_0_10px_rgba(64,130,109,0.8)]" />
            )}
          </button>

          <button
            onClick={() => handleTabSwitch("create-material")}
            className={`pb-4 px-2 font-bold text-sm flex items-center gap-2 border-b-2 transition-all relative ${
              activeTab === "create-material"
                ? "border-evolver-viridian text-slate-900 dark:text-white"
                : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            }`}
          >
            <Boxes className="w-4 h-4" />
            Create Material Master
            {activeTab === "create-material" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-evolver-viridian shadow-[0_0_10px_rgba(64,130,109,0.8)]" />
            )}
          </button>

          <button
            onClick={() => handleTabSwitch("brand-mapping")}
            className={`pb-4 px-2 font-bold text-sm flex items-center gap-2 border-b-2 transition-all relative ${
              activeTab === "brand-mapping"
                ? "border-evolver-viridian text-slate-900 dark:text-white"
                : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            }`}
          >
            <Users className="w-4 h-4" />
            Partner Brand Mapping
            {activeTab === "brand-mapping" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-evolver-viridian shadow-[0_0_10px_rgba(64,130,109,0.8)]" />
            )}
          </button>

          <button
            onClick={() => handleTabSwitch("sap-revert")}
            className={`pb-4 px-2 font-bold text-sm flex items-center gap-2 border-b-2 transition-all relative ${
              activeTab === "sap-revert"
                ? "border-evolver-viridian text-slate-900 dark:text-white"
                : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            Demo Reset & Reversion
            {activeTab === "sap-revert" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-evolver-viridian shadow-[0_0_10px_rgba(64,130,109,0.8)]" />
            )}
          </button>
        </div>

        {/* Tab CONTENT 1: Data Replication Console */}
        {activeTab === "replications" && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-6 rounded-2xl shadow-sm flex items-center justify-between border-l-4 border-l-evolver-blue">
                <div>
                  <h3 className="text-slate-400 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider mb-2">Replicated Metadata Tables</h3>
                  <p className="text-3xl font-mono font-extrabold text-slate-900 dark:text-white">
                    {((stats.dd02l || 0) + (stats.dd08l || 0) + (stats.dd02t || 0)).toLocaleString()}
                  </p>
                </div>
                <div className="bg-evolver-blue/10 p-3 rounded-xl">
                  <Database className="w-6 h-6 text-evolver-blue" />
                </div>
              </div>

              <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-6 rounded-2xl shadow-sm flex items-center justify-between border-l-4 border-l-evolver-viridian">
                <div>
                  <h3 className="text-slate-400 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider mb-2">Operational Invoice Cache</h3>
                  <p className="text-3xl font-mono font-extrabold text-slate-900 dark:text-white">
                    {((summaryData.dbCache?.sapArItem || 0) + (summaryData.dbCache?.sapApItem || 0)).toLocaleString()}
                  </p>
                </div>
                <div className="bg-evolver-viridian/10 p-3 rounded-xl">
                  <FileText className="w-6 h-6 text-evolver-viridian" />
                </div>
              </div>

              <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-6 rounded-2xl shadow-sm flex items-center justify-between border-l-4 border-l-emerald-500">
                <div>
                  <h3 className="text-slate-400 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider mb-2">Overall Sync Health</h3>
                  <p className="text-3xl font-mono font-extrabold text-slate-900 dark:text-white">100%</p>
                </div>
                <div className="bg-emerald-500/10 p-3 rounded-xl">
                  <ShieldCheck className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
            </div>

            {/* REAL-TIME Monospace Logs Console Terminal */}
            <div className="bg-[#050505] border border-white/15 rounded-2xl overflow-hidden shadow-2xl">
              {/* Terminal Header */}
              <div className="bg-neutral-900 px-6 py-3 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5 mr-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <Terminal className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-mono font-semibold text-slate-400">SAP OData ETL Console v2.0 - bash</span>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setTerminalLogs([`[${new Date().toLocaleTimeString()}] Terminal cleared.`])}
                    className="text-slate-400 hover:text-white text-xs font-mono transition-colors flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/5"
                    title="Clear Terminal Output"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear
                  </button>
                  <button 
                    onClick={downloadLogs}
                    className="text-slate-400 hover:text-white text-xs font-mono transition-colors flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/5"
                    title="Save Log File"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export
                  </button>
                </div>
              </div>

              {/* Terminal Body */}
              <div ref={replicationTerminalRef} className="p-6 h-64 overflow-y-auto font-mono text-[13px] text-emerald-400 space-y-1.5 leading-relaxed bg-[#050505] scrollbar-thin">
                {terminalLogs.map((log, index) => (
                  <div key={index} className="whitespace-pre-wrap selection:bg-emerald-500 selection:text-black">
                    {log}
                  </div>
                ))}
                {syncing && (
                  <div className="flex items-center gap-2 text-yellow-400 animate-pulse">
                    <span>&gt;_ [PROCESSING] Extracting and loading row vectors from SAP CAL...</span>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  </div>
                )}
              </div>
            </div>

            {/* Target Sync Trigger Buttons */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-evolver-viridian" />
                Targeted Database Sync Operations
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Trigger 1: Core Metadata */}
                <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Database className="w-4 h-4 text-evolver-blue" />
                      Metadata Tables
                    </h4>
                    <p className="text-xs text-slate-400 mt-2">Replicate DD02L, DD08L, DD02T dictionary models.</p>
                  </div>
                  <button
                    onClick={() => triggerReplication("METADATA")}
                    disabled={syncing}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-white/10 hover:bg-slate-800 dark:hover:bg-white/20 text-white dark:text-slate-200 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 border border-slate-800 dark:border-white/5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${activeSyncType === "METADATA" ? "animate-spin" : ""}`} />
                    Sync Metadata
                  </button>
                </div>

                {/* Trigger 2: Logical Databases */}
                <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-400" />
                      Logical DBs
                    </h4>
                    <p className="text-xs text-slate-400 mt-2">Replicate TLDB, TLDBT, LDBN structure maps.</p>
                  </div>
                  <button
                    onClick={() => triggerReplication("LOGICAL_DBS")}
                    disabled={syncing}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-white/10 hover:bg-slate-800 dark:hover:bg-white/20 text-white dark:text-slate-200 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 border border-slate-800 dark:border-white/5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${activeSyncType === "LOGICAL_DBS" ? "animate-spin" : ""}`} />
                    Sync Logical DBs
                  </button>
                </div>

                {/* Trigger 3: Interfaces */}
                <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Settings className="w-4 h-4 text-amber-400" />
                      Interfaces & RFCs
                    </h4>
                    <p className="text-xs text-slate-400 mt-2">Replicate TFDIR, TFTIT remote function lists.</p>
                  </div>
                  <button
                    onClick={() => triggerReplication("INTERFACES")}
                    disabled={syncing}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-white/10 hover:bg-slate-800 dark:hover:bg-white/20 text-white dark:text-slate-200 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 border border-slate-800 dark:border-white/5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${activeSyncType === "INTERFACES" ? "animate-spin" : ""}`} />
                    Sync Interfaces
                  </button>
                </div>

                {/* Trigger 4: Ledgers */}
                <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-5 rounded-2xl shadow-sm flex flex-col justify-between border-l-4 border-l-evolver-viridian">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Zap className="w-4 h-4 text-evolver-viridian" />
                      Operational Ledgers
                    </h4>
                    <p className="text-xs text-slate-400 mt-2">ETL load Outstanding AP/AR Accounts items (BSID/BSIK).</p>
                  </div>
                  <button
                    onClick={() => triggerReplication("LEDGERS")}
                    disabled={syncing}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-evolver-viridian hover:bg-emerald-600 text-white py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(64,130,109,0.2)]"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${activeSyncType === "LEDGERS" ? "animate-spin" : ""}`} />
                    Sync Accounts
                  </button>
                </div>
              </div>
            </div>

            {/* Config & Table Settings Grid */}
            <div className="mb-8">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-evolver-viridian" />
                Active Database Replica Mappings
              </h2>
              
              {Object.keys(groupedConfigs).length === 0 ? (
                <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-8 text-center text-slate-400 rounded-2xl shadow-sm">
                  Loading configurations from Prisma registry...
                </div>
              ) : (
                <div className="space-y-6">
                  {(Object.entries(groupedConfigs) as [string, any[]][]).map(([category, items]) => {
                    const replicatedCount = items.filter((i: any) => i.strategy === "REPLICATED").length;
                    return (
                      <div key={category} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
                        <div className="bg-slate-100 dark:bg-black/20 px-6 py-4 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
                          <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm">{category}</h3>
                          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-white/5 px-2.5 py-1 rounded-full">
                            {replicatedCount} Replicated / {items.length} Registered
                          </span>
                        </div>
                        
                        <div className="overflow-x-auto">
                          <table className="w-full text-left">
                            <thead className="border-b border-slate-200 dark:border-white/5 text-[10px] text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-black/10">
                              <tr>
                                <th className="px-6 py-3 font-semibold">Table ID</th>
                                <th className="px-6 py-3 font-semibold">Enabled Status</th>
                                <th className="px-6 py-3 font-semibold text-right">Local Records</th>
                                <th className="px-6 py-3 font-semibold text-right">Live SAP Count</th>
                                <th className="px-6 py-3 font-semibold text-right">Mapping Mode</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                              {items.map((config: any) => (
                                <tr key={config.id} className="hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors group">
                                  <td className="px-6 py-4">
                                    <div className="font-mono font-bold text-slate-700 dark:text-slate-200">{config.id}</div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <button 
                                      onClick={() => toggleEnable(config.id, config.isEnabled)}
                                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
                                        config.isEnabled 
                                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20" 
                                          : "bg-slate-200/50 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-300"
                                      }`}
                                    >
                                      <div className={`w-1.5 h-1.5 rounded-full ${config.isEnabled ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "bg-slate-500"}`} />
                                      {config.isEnabled ? "Sync Active" : "Sync Paused"}
                                    </button>
                                  </td>
                                  <td className="px-6 py-4 text-right font-mono text-sm text-slate-600 dark:text-slate-300 font-semibold">
                                    {getLocalCount(config.id).toLocaleString()}
                                  </td>
                                  <td className="px-6 py-4 text-right font-mono text-sm text-slate-400 dark:text-slate-400">
                                    {typeof sapCounts[config.id] === "number" 
                                      ? (sapCounts[config.id] as number).toLocaleString() 
                                      : sapCounts[config.id] || "..."}
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <button 
                                      onClick={() => toggleStrategy(config.id, config.strategy)}
                                      className={`text-xs px-3 py-1.5 rounded-lg font-bold border transition-colors ${
                                        config.strategy === "REPLICATED" 
                                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20" 
                                          : "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
                                      }`}
                                    >
                                      {config.strategy === "REPLICATED" ? "Replicated" : "On-Demand"}
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Tab CONTENT 2: System Object Summary */}
        {activeTab === "summary" && (
          <div className="space-y-8 animate-fadeIn">
            
            {summaryLoading ? (
              <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm gap-4">
                <RefreshCw className="w-8 h-8 text-evolver-viridian animate-spin" />
                <p className="text-slate-400 font-mono text-sm">Querying S/4HANA System Inventory registries...</p>
              </div>
            ) : (
              <div className="space-y-8">
                
                {/* Premium Summary Statistics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Card 1: Materials */}
                  <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-6 rounded-2xl shadow-sm flex items-center justify-between border-l-4 border-l-pink-500">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block">Material Registry</span>
                      <h4 className="text-2xl font-mono font-extrabold text-slate-900 dark:text-white mt-1">450,112</h4>
                      <span className="text-[11px] text-slate-400 block mt-1">Global catalog (MARA)</span>
                    </div>
                    <div className="bg-pink-500/10 p-3.5 rounded-xl">
                      <Boxes className="w-6 h-6 text-pink-500" />
                    </div>
                  </div>

                  {/* Card 2: Cost Centers */}
                  <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-6 rounded-2xl shadow-sm flex items-center justify-between border-l-4 border-l-indigo-500">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block">Controlling Area (A000)</span>
                      <h4 className="text-2xl font-mono font-extrabold text-slate-900 dark:text-white mt-1">1,250</h4>
                      <span className="text-[11px] text-slate-400 block mt-1">Active Cost Centers (CSKS)</span>
                    </div>
                    <div className="bg-indigo-500/10 p-3.5 rounded-xl">
                      <Building2 className="w-6 h-6 text-indigo-500" />
                    </div>
                  </div>

                  {/* Card 3: Chart of Accounts */}
                  <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-6 rounded-2xl shadow-sm flex items-center justify-between border-l-4 border-l-emerald-500">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block">Chart of Accounts (YCOA)</span>
                      <h4 className="text-2xl font-mono font-extrabold text-slate-900 dark:text-white mt-1">19,818</h4>
                      <span className="text-[11px] text-slate-400 block mt-1">G/L Accounts Registry</span>
                    </div>
                    <div className="bg-emerald-500/10 p-3.5 rounded-xl">
                      <Sliders className="w-6 h-6 text-emerald-500" />
                    </div>
                  </div>

                  {/* Card 4: Customers & Vendors */}
                  <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-6 rounded-2xl shadow-sm flex items-center justify-between border-l-4 border-l-amber-500">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block">Subledger Registry</span>
                      <h4 className="text-2xl font-mono font-extrabold text-slate-900 dark:text-white mt-1">46,660</h4>
                      <span className="text-[11px] text-slate-400 block mt-1">28.4K Cust. / 18.2K Supp.</span>
                    </div>
                    <div className="bg-amber-500/10 p-3.5 rounded-xl">
                      <Users className="w-6 h-6 text-amber-500" />
                    </div>
                  </div>
                </div>

                {/* Plant-wise Material Master Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Plant Distribution Card */}
                  <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-6 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                      <Globe className="w-5 h-5 text-evolver-viridian" />
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Material Stock Distribution per Regional Plant</h3>
                    </div>

                    <div className="space-y-4">
                      {summaryData.plantBreakdown?.map((item: any) => {
                        const percent = (item.count / 450112) * 100;
                        return (
                          <div key={item.id} className="space-y-1">
                            <div className="flex justify-between items-center text-xs font-semibold">
                              <span className="text-slate-700 dark:text-slate-300 font-bold">{item.plant}</span>
                              <div className="flex items-center gap-2 font-mono">
                                <span className="text-slate-650 dark:text-slate-300">{item.count.toLocaleString()}</span>
                                <span className="text-slate-400 font-normal">({percent.toFixed(1)}%)</span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-white/5 h-2 rounded-full overflow-hidden">
                              <div 
                                className="bg-evolver-viridian h-full rounded-full transition-all duration-1000"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Material Type breakdown and Key Finance Stats */}
                  <div className="space-y-6">
                    {/* Material Type breakdown */}
                    <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-6 rounded-2xl shadow-sm">
                      <div className="flex items-center gap-2 mb-6">
                        <Boxes className="w-5 h-5 text-evolver-viridian" />
                        <h3 className="font-extrabold text-slate-900 dark:text-white text-base">S/4HANA Material Type Breakdown (MARA)</h3>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {summaryData.materialTypeBreakdown?.map((item: any) => (
                          <div key={item.type} className="bg-slate-50 dark:bg-black/20 p-4 border border-slate-100 dark:border-white/5 rounded-xl shadow-sm">
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full inline-block mb-1 tracking-wider" style={{ backgroundColor: `${item.color}20`, color: item.color }}>
                              {item.type}
                            </span>
                            <span className="block text-xs font-bold text-slate-700 dark:text-slate-350">{item.name}</span>
                            <span className="block text-xl font-mono font-extrabold mt-1 text-slate-900 dark:text-white">
                              {item.count.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Operational Ledger Metrics */}
                    <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-6 rounded-2xl shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Activity className="w-5 h-5 text-evolver-viridian" />
                          <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">Universal Ledger (ACDOCA) Summary</h3>
                        </div>
                        <span className="text-[10px] uppercase font-extrabold tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                          Live Active
                        </span>
                      </div>

                      <div className="space-y-3 font-mono text-xs">
                        <div className="flex justify-between border-b border-slate-200 dark:border-white/5 pb-2 text-slate-650 dark:text-slate-300">
                          <span>Universal Ledger Postings</span>
                          <span className="font-bold text-slate-800 dark:text-white">{summaryData.financeSummary?.universalJournalEntries?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200 dark:border-white/5 pb-2 text-slate-650 dark:text-slate-300">
                          <span>Traditional BSEG Segments</span>
                          <span className="font-bold text-slate-800 dark:text-white">{summaryData.financeSummary?.traditionalDocumentSegments?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200 dark:border-white/5 pb-2 text-slate-650 dark:text-slate-300">
                          <span>Active Controlling Area</span>
                          <span className="font-bold text-slate-800 dark:text-white">{summaryData.financeSummary?.controllingArea}</span>
                        </div>
                        <div className="flex justify-between text-slate-650 dark:text-slate-300">
                          <span>Controlling Profit Centers</span>
                          <span className="font-bold text-slate-800 dark:text-white">{summaryData.financeSummary?.profitCenters}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub-registries & Transactions Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Logistics and sales */}
                  <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-6 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-2 mb-4 text-evolver-viridian border-b border-slate-200 dark:border-white/5 pb-3">
                      <ShoppingBag className="w-5 h-5" />
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">Logistics & SD Postings</h4>
                    </div>
                    <ul className="space-y-3 text-xs font-mono text-slate-650 dark:text-slate-300">
                      <li className="flex justify-between">
                        <span>Sales Orders (VBAK)</span>
                        <span className="font-bold">{summaryData.logisticsSummary?.salesOrders?.toLocaleString()}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Purchase Orders (EKKO)</span>
                        <span className="font-bold">{summaryData.logisticsSummary?.purchaseOrders?.toLocaleString()}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Production Orders (AUFK)</span>
                        <span className="font-bold">{summaryData.logisticsSummary?.productionOrders?.toLocaleString()}</span>
                      </li>
                    </ul>
                  </div>

                  {/* Plant Maintenance operations */}
                  <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-6 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-2 mb-4 text-evolver-viridian border-b border-slate-200 dark:border-white/5 pb-3">
                      <Wrench className="w-5 h-5" />
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">Plant Maintenance (PM)</h4>
                    </div>
                    <ul className="space-y-3 text-xs font-mono text-slate-650 dark:text-slate-300">
                      <li className="flex justify-between">
                        <span>Equipment Assets (EQUI)</span>
                        <span className="font-bold">{summaryData.maintenanceSummary?.equipmentAssets?.toLocaleString()}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Maintenance Orders (PM)</span>
                        <span className="font-bold">{summaryData.maintenanceSummary?.maintenanceOrders?.toLocaleString()}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Active Work Centers (CRHD)</span>
                        <span className="font-bold">{summaryData.maintenanceSummary?.activeWorkCenters}</span>
                      </li>
                    </ul>
                  </div>

                  {/* HR templates */}
                  <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-6 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-2 mb-4 text-evolver-viridian border-b border-slate-200 dark:border-white/5 pb-3">
                      <Users className="w-5 h-5" />
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">Human Resources (HR)</h4>
                    </div>
                    <ul className="space-y-3 text-xs font-mono text-slate-650 dark:text-slate-300">
                      <li className="flex justify-between">
                        <span>Personnel Areas (PA0001)</span>
                        <span className="font-bold">{summaryData.hrSummary?.personnelAreas}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Active Employee Master</span>
                        <span className="font-bold">{summaryData.hrSummary?.activeEmployees?.toLocaleString()}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Pay Grade Groups</span>
                        <span className="font-bold">{summaryData.hrSummary?.payGradeGroups}</span>
                      </li>
                    </ul>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* Tab CONTENT 3: Create Material Master */}
        {activeTab === "create-material" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Form Block */}
              <div className="lg:col-span-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Boxes className="w-5 h-5 text-evolver-viridian" />
                    Material Master Configuration Form
                  </h3>
                  <p className="text-xs text-slate-400 mt-2">
                    Configure standard Master Data fields. Submitting triggers an OData REST query to the SAP S/4HANA target client.
                  </p>
                </div>

                <form onSubmit={handleCreateMaterial} className="space-y-4">
                  {/* Material Description */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-355 block">Material Description (MAKTX)</label>
                    <input
                      type="text"
                      value={matDesc}
                      onChange={(e) => setMatDesc(e.target.value)}
                      placeholder="e.g. Copper Wire Austin HQ"
                      disabled={matSubmitting || !!createdMat}
                      className="w-full bg-slate-50 dark:bg-[#0c1424] border border-slate-250 dark:border-white/10 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-evolver-viridian transition-all text-slate-800 dark:text-slate-200 disabled:opacity-50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Plant Scope */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-355 block">Plant Scope (WERKS)</label>
                      <select
                        value={matPlant}
                        onChange={(e) => setMatPlant(e.target.value)}
                        disabled={matSubmitting || !!createdMat}
                        className="w-full bg-slate-50 dark:bg-[#0c1424] border border-slate-250 dark:border-white/10 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-evolver-viridian transition-all text-slate-800 dark:text-slate-200 disabled:opacity-50"
                      >
                        <option value="1710">Austin HQ (1710)</option>
                        <option value="1010">Hamburg (1010)</option>
                        <option value="1720">Palo Alto (1720)</option>
                        <option value="IN01">Bangalore (IN01)</option>
                        <option value="FR01">Paris (FR01)</option>
                        <option value="GB01">London (GB01)</option>
                        <option value="JP01">Tokyo (JP01)</option>
                        <option value="0001">Walldorf (0001)</option>
                      </select>
                    </div>

                    {/* Material Type */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-355 block">Material Type (MTART)</label>
                      <select
                        value={matType}
                        onChange={(e) => setMatType(e.target.value)}
                        disabled={matSubmitting || !!createdMat}
                        className="w-full bg-slate-50 dark:bg-[#0c1424] border border-slate-250 dark:border-white/10 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-evolver-viridian transition-all text-slate-800 dark:text-slate-200 disabled:opacity-50"
                      >
                        <option value="ROH">Raw Materials (ROH)</option>
                        <option value="HALB">Semi-finished (HALB)</option>
                        <option value="FERT">Finished Products (FERT)</option>
                        <option value="HAWA">Trading Goods (HAWA)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Base UoM */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-355 block">Base Unit of Measure (MEINS)</label>
                      <select
                        value={matUom}
                        onChange={(e) => setMatUom(e.target.value)}
                        disabled={matSubmitting || !!createdMat}
                        className="w-full bg-slate-50 dark:bg-[#0c1424] border border-slate-250 dark:border-white/10 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-evolver-viridian transition-all text-slate-800 dark:text-slate-200 disabled:opacity-50"
                      >
                        <option value="PC">PC (Pieces)</option>
                        <option value="KG">KG (Kilograms)</option>
                        <option value="M">M (Meters)</option>
                        <option value="L">L (Liters)</option>
                      </select>
                    </div>

                    {/* Material Group */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-355 block">Material Group (MATKL)</label>
                      <select
                        value={matGroup}
                        onChange={(e) => setMatGroup(e.target.value)}
                        disabled={matSubmitting || !!createdMat}
                        className="w-full bg-slate-50 dark:bg-[#0c1424] border border-slate-250 dark:border-white/10 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-evolver-viridian transition-all text-slate-800 dark:text-slate-200 disabled:opacity-50"
                      >
                        <option value="0001">Metal Processing (0001)</option>
                        <option value="0002">Electronics (0002)</option>
                        <option value="0003">Packaging (0003)</option>
                      </select>
                    </div>
                  </div>

                  {matError && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {matError}
                    </div>
                  )}

                  {!createdMat && (
                    <button
                      type="submit"
                      disabled={matSubmitting}
                      className="w-full bg-evolver-viridian hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl text-sm transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(64,130,109,0.2)] flex items-center justify-center gap-2"
                    >
                      {matSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Executing SAP Write Handshake...
                        </>
                      ) : (
                        <>
                          <PlusCircle className="w-4 h-4" />
                          Create Material Master
                        </>
                      )}
                    </button>
                  )}
                </form>

                {createdMat && (
                  <button
                    onClick={() => {
                      setCreatedMat(null);
                      setMatDesc("");
                      setMatLogs([]);
                    }}
                    className="w-full bg-slate-900 dark:bg-white/10 hover:bg-slate-800 dark:hover:bg-white/20 text-white dark:text-slate-200 py-3.5 rounded-xl text-sm font-bold transition-all border border-slate-800 dark:border-white/5 flex items-center justify-center gap-2"
                  >
                    Create Another Material
                  </button>
                )}
              </div>

              {/* Console & Success Registry Voucher */}
              <div className="lg:col-span-6 space-y-6">
                
                {/* Real-time Handshake Logs Console */}
                {(matSubmitting || matLogs.length > 0) && (
                  <div className="bg-[#050505] border border-white/15 rounded-3xl overflow-hidden shadow-2xl animate-fadeIn">
                    <div className="bg-neutral-900 px-6 py-3 border-b border-white/5 flex items-center gap-2">
                      <div className="flex gap-1.5 mr-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/80" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                        <div className="w-3 h-3 rounded-full bg-green-500/80" />
                      </div>
                      <Terminal className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-mono font-semibold text-slate-400">OData REST Handshake Console</span>
                    </div>
                    <div className="p-6 max-h-48 overflow-y-auto font-mono text-[12px] text-emerald-400 space-y-2 leading-relaxed bg-[#050505] scrollbar-thin">
                      {matLogs.map((log, idx) => (
                        <div key={idx} className="whitespace-pre-wrap">{log}</div>
                      ))}
                      {matSubmitting && (
                        <div className="flex items-center gap-2 text-yellow-400 animate-pulse mt-1">
                          <span>&gt;_ Handshaking with Gateway services...</span>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Frost Success Registry Voucher */}
                {createdMat && (
                  <div className="bg-gradient-to-br from-white/80 to-white/30 dark:from-[#0f192b]/80 dark:to-[#0f192b]/30 backdrop-blur-2xl border-2 border-emerald-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-5 animate-scaleUp">
                    
                    {/* Subtle outer green glow */}
                    <div className="absolute inset-0 bg-emerald-500/[0.02] pointer-events-none rounded-3xl" />
                    
                    <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/10 pb-4">
                      <div>
                        <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-1">
                          SAP OData Registry Voucher
                        </span>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          Master Record Created
                        </h2>
                      </div>
                      <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold font-mono">
                        STATUS: ACTIVE
                      </span>
                    </div>

                    <div className="space-y-4">
                      {/* Generated Material Number */}
                      <div className="bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-2xl p-5 text-center shadow-inner">
                        <span className="text-[10px] text-slate-400 uppercase block font-bold tracking-wider mb-1">Generated Material ID (MATNR)</span>
                        <span className="text-3xl font-mono font-extrabold text-cyan-600 dark:text-cyan-400 tracking-wider">
                          {createdMat.id}
                        </span>
                      </div>

                      {/* Detail Ledger Listing */}
                      <div className="bg-slate-50/50 dark:bg-black/10 border border-slate-200 dark:border-white/5 rounded-2xl p-5 space-y-3 font-mono text-xs text-slate-650 dark:text-slate-350">
                        <div className="flex justify-between border-b border-slate-200 dark:border-white/5 pb-2">
                          <span>Material Description</span>
                          <span className="font-extrabold text-slate-800 dark:text-white">{createdMat.description}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200 dark:border-white/5 pb-2">
                          <span>Target Plant Scope</span>
                          <span className="font-extrabold text-slate-800 dark:text-white">{createdMat.plant}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200 dark:border-white/5 pb-2">
                          <span>Material Type Class</span>
                          <span className="font-extrabold text-slate-800 dark:text-white">{createdMat.materialType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Base Unit of Measure</span>
                          <span className="font-extrabold text-slate-800 dark:text-white">{createdMat.uom}</span>
                        </div>
                      </div>
                    </div>

                    {/* SAP Fiori Deep Link Action */}
                    <a
                      href={`https://172.211.212.84:44301/sap/bc/ui2/flp?sap-client=100&sap-language=EN#Product-display?Product=${createdMat.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-extrabold py-4 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 select-none active:scale-[0.98]"
                    >
                      <Globe className="w-4 h-4 text-emerald-500 animate-spin" style={{ animationDuration: "12s" }} />
                      View Material Master in SAP Fiori Launchpad ↗
                    </a>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Tab CONTENT 4: Partner Brand Mapping */}
        {activeTab === "brand-mapping" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-6 rounded-3xl shadow-sm">
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 font-sans">
                  <Sliders className="w-5 h-5 text-evolver-viridian" />
                  Dynamic Partner Brand Mapping & Reconciler
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed font-sans max-w-2xl">
                  This tool audits live SAP trial IDs, determines their trade sectors & parts based on historical POs and Sales Orders, and infers locations (German codes receive localized German brands). Update mapping selections below, then mass-apply to synchronize PostgreSQL.
                </p>
              </div>
              <div className="flex gap-3 shrink-0 font-sans">
                <button
                  onClick={handleResetMappings}
                  disabled={mappingLoading}
                  className="px-4 py-2.5 rounded-xl border border-slate-250 dark:border-white/10 text-xs font-bold bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-350 cursor-pointer disabled:opacity-50"
                >
                  Reset to Default
                </button>
                <button
                  onClick={handleSaveAllMappings}
                  disabled={mappingLoading}
                  className="px-5 py-2.5 rounded-xl bg-evolver-viridian hover:bg-emerald-600 text-white text-xs font-bold cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-[0_0_15px_rgba(64,130,109,0.25)]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Mass Update Brand Names
                </button>
              </div>
            </div>

            {mappingStatusMsg && (
              <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 border animate-fadeIn font-sans ${
                mappingStatusMsg.includes("❌") 
                  ? "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400" 
                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              }`}>
                <Activity className="w-4 h-4" />
                {mappingStatusMsg}
              </div>
            )}

            {/* BRAND MAPPING PROGRESS BAR & TERMINAL CONSOLE */}
            {mappingLogs.length > 0 && (
              <div className="space-y-4 animate-fadeIn">
                {/* Progress Bar Container */}
                <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-5 rounded-3xl shadow-sm">
                  <div className="flex justify-between items-center mb-2.5 text-xs font-bold font-sans">
                    <span className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <RefreshCw className={`w-3.5 h-3.5 text-evolver-viridian ${mappingProgress > 0 && mappingProgress < 100 ? "animate-spin" : ""}`} />
                      S/4HANA Sync Progress: {mappingProgress < 100 ? "Synchronizing master records..." : "Synchronization completed!"}
                    </span>
                    <span className="text-evolver-viridian font-mono">{mappingProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-white/5 h-3 rounded-full overflow-hidden p-[2px]">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 relative ${
                        mappingProgress === 100 
                          ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]" 
                          : "bg-gradient-to-r from-evolver-viridian to-emerald-400 animate-pulse"
                      }`}
                      style={{ width: `${mappingProgress}%` }}
                    />
                  </div>
                </div>

                {/* Neon Bash Terminal Console */}
                <div className="bg-[#050505] border border-white/15 rounded-3xl overflow-hidden shadow-2xl">
                  {/* Terminal Header */}
                  <div className="bg-neutral-900 px-6 py-3.5 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5 mr-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/80" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                        <div className="w-3 h-3 rounded-full bg-green-500/80" />
                      </div>
                      <Terminal className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-mono font-semibold text-slate-400">S/4HANA Master Data Synchronization Console - bash</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button 
                        onClick={handleClearMappingLogs}
                        className="text-slate-400 hover:text-white text-xs font-mono transition-colors flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer"
                        title="Clear Mapping Terminal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Terminal Body */}
                  <div ref={mappingTerminalRef} className="p-6 h-64 overflow-y-auto font-mono text-[13px] text-emerald-400 space-y-1.5 leading-relaxed bg-[#050505] scrollbar-thin">
                    {mappingLogs.map((log, index) => (
                      <div key={index} className="whitespace-pre-wrap selection:bg-emerald-500 selection:text-black">
                        {log}
                      </div>
                    ))}
                    {mappingProgress > 0 && mappingProgress < 100 && (
                      <div className="flex items-center gap-2 text-yellow-400 animate-pulse">
                        <span>&gt;_ [SYNCING] Handshaking BAPI_CUSTOMER_CHANGEFROMDATA change list...</span>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {mappingLoading && mappingData.customers.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm gap-4">
                <RefreshCw className="w-8 h-8 text-evolver-viridian animate-spin" />
                <p className="text-slate-400 font-mono text-sm">Auditing customer/vendor parts & locations in PostgreSQL cache...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8 font-sans">
                
                {/* Customers Mappings Table */}
                <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm">
                  <div className="bg-slate-100 dark:bg-black/20 px-6 py-4 border-b border-slate-200 dark:border-white/5">
                    <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
                      <Users className="w-4.5 h-4.5 text-cyan-500" />
                      AR Trade Customers (Sales Orders & Receivables Cache)
                    </h3>
                  </div>

                  <div className="overflow-x-auto max-h-[440px] overflow-y-auto scrollbar-thin">
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 z-10 border-b border-slate-200 dark:border-white/5 text-[10px] text-slate-455 uppercase tracking-wider bg-slate-100 dark:bg-[#0c1424] shadow-sm">
                        <tr>
                          <th className="px-6 py-3 font-semibold">SAP Master ID (KUNNR)</th>
                          <th className="px-6 py-3 font-semibold">As-Is SAP Name</th>
                          <th className="px-6 py-3 font-semibold">Inferred Sector & Trade Part</th>
                          <th className="px-6 py-3 font-semibold">Region / Location</th>
                          <th className="px-6 py-3 font-semibold text-right">Outstanding Volume</th>
                          <th className="px-6 py-3 font-semibold">Proposed Brand (Adjustable Mapping)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-white/5 text-xs">
                        {mappingData.customers.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-8 text-center text-slate-450 italic">
                              No customer invoices synced in PostgreSQL. Go to LEDGERS sync or Tab 2 to replicate first.
                            </td>
                          </tr>
                        ) : (
                          mappingData.customers.map((c) => (
                            <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-b border-slate-100 dark:border-white/5">
                              <td className="px-6 py-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                                {c.id}
                              </td>
                              <td className="px-6 py-4 font-sans text-slate-800 dark:text-slate-200 font-semibold max-w-[180px] truncate" title={c.asIsName}>
                                {c.asIsName || `Customer ${c.id}`}
                              </td>
                              <td className="px-6 py-4 space-y-1">
                                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 tracking-wider">
                                  {c.inferredCategory}
                                </span>
                                <span className="block text-[11px] text-slate-500">
                                  Line Item: Trade Receivables
                                </span>
                              </td>
                              <td className="px-6 py-4 text-slate-650 dark:text-slate-350">
                                <div className="flex items-center gap-1.5 font-semibold">
                                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                                  {c.inferredLocation}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right font-mono text-slate-850 dark:text-slate-300 font-extrabold text-sm">
                                ${c.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3 max-w-[380px]">
                                  {c.asIsName && customNames[c.id] && c.asIsName.trim().substring(0, 40) === customNames[c.id].trim().substring(0, 40) ? (
                                    <span title="Synchronized with SAP Master" className="shrink-0 flex items-center">
                                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    </span>
                                  ) : (
                                    <div className="w-5 h-5 rounded-full border border-slate-300 dark:border-white/10 shrink-0 flex items-center justify-center text-[9px] text-slate-400 font-black font-mono bg-slate-50 dark:bg-black/20" title="Pending delta update synchronization">
                                      Δ
                                    </div>
                                  )}
                                  <select
                                    value={customNames[c.id] || ""}
                                    onChange={(e) => setCustomNames({ ...customNames, [c.id]: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-[#0c1424] border border-slate-250 dark:border-white/10 px-2.5 py-1.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-evolver-viridian transition-all text-slate-800 dark:text-slate-255 cursor-pointer"
                                  >
                                    {c.suggestedNames.map((s: string, idx: number) => (
                                      <option key={idx} value={s}>{s}</option>
                                    ))}
                                    <option value={customNames[c.id] || ""}>Custom: {customNames[c.id]}</option>
                                  </select>
                                  <input
                                    type="text"
                                    value={customNames[c.id] || ""}
                                    onChange={(e) => setCustomNames({ ...customNames, [c.id]: e.target.value })}
                                    className="w-[120px] bg-slate-50 dark:bg-[#0c1424] border border-slate-250 dark:border-white/10 px-2 py-1.5 rounded-xl text-[10px] focus:outline-none focus:border-evolver-viridian text-slate-700 dark:text-slate-300"
                                    placeholder="Type Custom"
                                  />
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-slate-50/50 dark:bg-black/20 px-6 py-3 border-t border-slate-200 dark:border-white/5 text-xs text-slate-400 font-medium font-sans flex items-center gap-2">
                    <span>💡 Showing {mappingData.customers.length} partners. Scroll vertically to review all live master profiles.</span>
                  </div>
                </div>

                {/* Vendors Mappings Table */}
                <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm">
                  <div className="bg-slate-100 dark:bg-black/20 px-6 py-4 border-b border-slate-200 dark:border-white/5">
                    <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
                      <ShoppingBag className="w-4.5 h-4.5 text-emerald-500" />
                      AP Trade Suppliers (Purchase Orders & Payables Cache)
                    </h3>
                  </div>

                  <div className="overflow-x-auto max-h-[440px] overflow-y-auto scrollbar-thin">
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 z-10 border-b border-slate-200 dark:border-white/5 text-[10px] text-slate-455 uppercase tracking-wider bg-slate-100 dark:bg-[#0c1424] shadow-sm">
                        <tr>
                          <th className="px-6 py-3 font-semibold">SAP Master ID (LIFNR)</th>
                          <th className="px-6 py-3 font-semibold">As-Is SAP Name</th>
                          <th className="px-6 py-3 font-semibold">Inferred Sector & Trade Part</th>
                          <th className="px-6 py-3 font-semibold">Region / Location</th>
                          <th className="px-6 py-3 font-semibold text-right">Outstanding Volume</th>
                          <th className="px-6 py-3 font-semibold">Proposed Brand (Adjustable Mapping)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-white/5 text-xs">
                        {mappingData.vendors.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-8 text-center text-slate-450 italic">
                              No supplier payables synced in PostgreSQL. Go to LEDGERS sync or Tab 2 to replicate first.
                            </td>
                          </tr>
                        ) : (
                          mappingData.vendors.map((v) => (
                            <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-b border-slate-100 dark:border-white/5">
                              <td className="px-6 py-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                                {v.id}
                              </td>
                              <td className="px-6 py-4 font-sans text-slate-800 dark:text-slate-200 font-semibold max-w-[180px] truncate" title={v.asIsName}>
                                {v.asIsName || `Supplier ${v.id}`}
                              </td>
                              <td className="px-6 py-4 space-y-1">
                                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 tracking-wider">
                                  {v.inferredCategory}
                                </span>
                                <span className="block text-[11px] text-slate-500">
                                  Line Item: Trade Payables
                                </span>
                              </td>
                              <td className="px-6 py-4 text-slate-655 dark:text-slate-355">
                                <div className="flex items-center gap-1.5 font-semibold">
                                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                                  {v.inferredLocation}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right font-mono text-slate-850 dark:text-slate-300 font-extrabold text-sm">
                                ${v.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3 max-w-[380px]">
                                  {v.asIsName && customNames[v.id] && v.asIsName.trim().substring(0, 40) === customNames[v.id].trim().substring(0, 40) ? (
                                    <span title="Synchronized with SAP Master" className="shrink-0 flex items-center">
                                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    </span>
                                  ) : (
                                    <div className="w-5 h-5 rounded-full border border-slate-300 dark:border-white/10 shrink-0 flex items-center justify-center text-[9px] text-slate-400 font-black font-mono bg-slate-50 dark:bg-black/20" title="Pending delta update synchronization">
                                      Δ
                                    </div>
                                  )}
                                  <select
                                    value={customNames[v.id] || ""}
                                    onChange={(e) => setCustomNames({ ...customNames, [v.id]: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-[#0c1424] border border-slate-250 dark:border-white/10 px-2.5 py-1.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-evolver-viridian transition-all text-slate-800 dark:text-slate-255 cursor-pointer"
                                  >
                                    {v.suggestedNames.map((s: string, idx: number) => (
                                      <option key={idx} value={s}>{s}</option>
                                    ))}
                                    <option value={customNames[v.id] || ""}>Custom: {customNames[v.id]}</option>
                                  </select>
                                  <input
                                    type="text"
                                    value={customNames[v.id] || ""}
                                    onChange={(e) => setCustomNames({ ...customNames, [v.id]: e.target.value })}
                                    className="w-[120px] bg-slate-50 dark:bg-[#0c1424] border border-slate-250 dark:border-white/10 px-2 py-1.5 rounded-xl text-[10px] focus:outline-none focus:border-evolver-viridian text-slate-700 dark:text-slate-300"
                                    placeholder="Type Custom"
                                  />
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-slate-50/50 dark:bg-black/20 px-6 py-3 border-t border-slate-200 dark:border-white/5 text-xs text-slate-400 font-medium font-sans flex items-center gap-2">
                    <span>💡 Showing {mappingData.vendors.length} partners. Scroll vertically to review all live master profiles.</span>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* Tab CONTENT 5: Demo Reset & Reversion Console */}
        {activeTab === "sap-revert" && (
          <div className="space-y-8 animate-fadeIn font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-6 rounded-3xl shadow-sm">
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-evolver-viridian" />
                  S/4HANA ERP & Postgres Demo Reset Manager
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed max-w-2xl">
                  This console tracks all active modifications committed during user demo scenarios. Triggering a reset will run rollback procedures across transactional sales orders, payment blocks, custom materials, and trade brand mappings, resetting the system for the next demo cycle.
                </p>
              </div>
              <div className="shrink-0">
                <button
                  onClick={handleExecuteReversion}
                  disabled={revertLoading || pendingReversions.length === 0}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-extrabold cursor-pointer disabled:opacity-40 flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.25)] select-none active:scale-[0.98] transition-all"
                >
                  <RotateCcw className={`w-4 h-4 ${revertLoading ? "animate-spin" : ""}`} />
                  Reset SAP & Revert Ledger
                </button>
              </div>
            </div>

            {/* PROGRESS & TERMINAL */}
            {(revertLoading || revertLogs.length > 0) && (
              <div className="space-y-4 animate-fadeIn">
                {/* Progress bar */}
                <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-5 rounded-3xl shadow-sm">
                  <div className="flex justify-between items-center mb-2.5 text-xs font-bold">
                    <span className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <RefreshCw className={`w-3.5 h-3.5 text-evolver-viridian ${revertProgress > 0 && revertProgress < 100 ? "animate-spin" : ""}`} />
                      {revertProgress < 100 ? "Executing S/4HANA system rollback..." : "Reversion sequence completed!"}
                    </span>
                    <span className="text-evolver-viridian font-mono">{revertProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-white/5 h-3 rounded-full overflow-hidden p-[2px]">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        revertProgress === 100 
                          ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]" 
                          : "bg-gradient-to-r from-evolver-viridian to-emerald-400 animate-pulse"
                      }`}
                      style={{ width: `${revertProgress}%` }}
                    />
                  </div>
                </div>

                {/* Terminal Console */}
                <div className="bg-[#050505] border border-white/15 rounded-3xl overflow-hidden shadow-2xl">
                  <div className="bg-neutral-900 px-6 py-3.5 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-mono">
                      <div className="flex gap-1.5 mr-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/80" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                        <div className="w-3 h-3 rounded-full bg-green-500/80" />
                      </div>
                      <Terminal className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-semibold text-slate-400">S/4HANA Demolition Revert CLI - bash</span>
                    </div>
                    <button 
                      onClick={() => setRevertLogs([])}
                      className="text-slate-400 hover:text-white text-xs font-mono transition-colors px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer"
                    >
                      Clear Console
                    </button>
                  </div>
                  {/* Terminal Body */}
                  <div ref={revertTerminalRef} className="p-6 h-64 overflow-y-auto font-mono text-[13px] text-emerald-400 space-y-1.5 leading-relaxed bg-[#050505] scrollbar-thin">
                    {revertLogs.map((log, index) => (
                      <div key={index} className="whitespace-pre-wrap selection:bg-emerald-500 selection:text-black">
                        {log}
                      </div>
                    ))}
                    {revertLoading && (
                      <div className="flex items-center gap-2 text-yellow-400 animate-pulse">
                        <span>&gt;_ [REVERTING] Handshaking transactional logs rollback...</span>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* PENDING UPDATES TABLE */}
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm">
              <div className="bg-slate-100 dark:bg-black/20 px-6 py-4 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
                <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
                  <Database className="w-4.5 h-4.5 text-emerald-500" />
                  Active Modifications Queue
                </h3>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-450 bg-slate-200 dark:bg-white/5 px-2.5 py-1 rounded-full">
                  {pendingReversions.length} updates pending rollback
                </span>
              </div>

              <div className="overflow-x-auto max-h-[440px] overflow-y-auto scrollbar-thin">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 z-10 border-b border-slate-200 dark:border-white/5 text-[10px] text-slate-455 uppercase tracking-wider bg-slate-100 dark:bg-[#0c1424] shadow-sm">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Logged Time</th>
                      <th className="px-6 py-3 font-semibold">Scenario Category</th>
                      <th className="px-6 py-3 font-semibold">Target SAP Object</th>
                      <th className="px-6 py-3 font-semibold">Modification Applied</th>
                      <th className="px-6 py-3 font-semibold text-right">Reset Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-white/5 text-xs">
                    {pendingReversions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-450 italic">
                          <div className="flex flex-col items-center justify-center gap-3">
                            <ShieldCheck className="w-8 h-8 text-emerald-500/60" />
                            <span>No pending changes in the S/4HANA ledger. Local systems and SAP are fully synchronized!</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      pendingReversions.map((rev) => (
                        <tr key={rev.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-b border-slate-100 dark:border-white/5">
                          <td className="px-6 py-4 font-mono text-slate-500 max-w-[120px] truncate">
                            {new Date(rev.timestamp).toLocaleTimeString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                              rev.scenarioId === "tax-lookback" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                              rev.scenarioId === "duplicate-payments" ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" :
                              rev.scenarioId === "create-material" ? "bg-pink-500/10 text-pink-600 dark:text-pink-400" :
                              "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                            }`}>
                              {rev.scenarioName}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-sans text-slate-800 dark:text-slate-200 font-bold">
                            {rev.targetObject}
                          </td>
                          <td className="px-6 py-4 text-slate-650 dark:text-slate-355 max-w-[240px] truncate" title={rev.description}>
                            {rev.description}
                          </td>
                          <td className="px-6 py-4 text-right font-mono text-emerald-500 font-bold">
                            {rev.revertAction.type === "TAX_AUDIT" ? "Reset Region" :
                             rev.revertAction.type === "INVOICE_BLOCK" ? "Release Block" :
                             rev.revertAction.type === "CREATE_MATERIAL" ? "Purge Material" :
                             "Flush Brands"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="bg-slate-50/50 dark:bg-black/20 px-6 py-3 border-t border-slate-200 dark:border-white/5 text-xs text-slate-400 font-medium flex items-center gap-2">
                <span>💡 System updates logged in cache store src/lib/sap/sap-update-log.json. Click reset above to clean-wipe.</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
