"use client";

import { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Power, 
  Activity, 
  Settings, 
  HelpCircle, 
  Loader2, 
  X, 
  AlertTriangle, 
  ExternalLink, 
  RefreshCw,
  Server,
  CloudLightning,
  Sparkles
} from "lucide-react";

export default function ConnectionStatus() {
  const [status, setStatus] = useState<'checking' | 'alive' | 'dead'>('checking');
  const [calStatus, setCalStatus] = useState<'ACTIVE' | 'SUSPENDED' | 'ACTIVATING' | 'SUSPENDING' | 'ERROR' | 'CONFIG_ERROR' | 'checking'>('checking');
  const [rawCalStatus, setRawCalStatus] = useState<string>("");
  const [applianceName, setApplianceName] = useState<string>("SAP Instance");
  const [showControl, setShowControl] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'info' | 'success' | 'error' } | null>(null);
  
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Check the SAP gateway OData connection status
  const checkSapPing = async () => {
    try {
      const res = await fetch('/api/sap/ping');
      if (res.ok) {
        setStatus('alive');
      } else {
        setStatus('dead');
      }
    } catch (err) {
      setStatus('dead');
    }
  };

  // Check the SAP CAL Cloud Appliance Library status
  const checkCalStatus = async (showLogs = false) => {
    try {
      const res = await fetch('/api/sap/cal/status');
      if (res.ok) {
        const data = await res.json();
        setCalStatus(data.status);
        setRawCalStatus(data.rawStatus || "");
        if (data.name && data.name !== "Not Configured") {
          setApplianceName(data.name);
        }
      } else {
        setCalStatus('ERROR');
        setRawCalStatus("");
      }
    } catch (err) {
      setCalStatus('ERROR');
      setRawCalStatus("");
    }
  };

  // Run initial checks on mount
  useEffect(() => {
    checkSapPing();
    checkCalStatus();

    // Poll SAP connection status every 30 seconds
    const pingInterval = setInterval(checkSapPing, 30000);

    return () => {
      clearInterval(pingInterval);
    };
  }, []);

  // Poll CAL status more frequently when in a transitioning state (activating or suspending)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (calStatus === 'ACTIVATING' || calStatus === 'SUSPENDING') {
      interval = setInterval(() => {
        checkCalStatus();
        checkSapPing();
      }, 5000); // Poll every 5s during transitions
    } else {
      // Normal background polling for CAL status (every 60s)
      interval = setInterval(checkCalStatus, 60000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [calStatus]);

  // Handle clicking outside to close the control popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current && 
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setShowControl(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Trigger activation API
  const handleActivate = async () => {
    setActionLoading(true);
    setMessage({ text: "Sending activation signal to SAP CAL...", type: "info" });
    try {
      const res = await fetch('/api/sap/cal/activate', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setCalStatus('ACTIVATING');
        setMessage({ text: "Activation initiated! Starting up Azure VMs. This usually takes 5-10 minutes.", type: "success" });
      } else {
        setMessage({ text: data.message || "Failed to trigger activation.", type: "error" });
      }
    } catch (err: any) {
      setMessage({ text: err.message || "Network error occurred.", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  // Trigger suspension API
  const handleSuspend = async () => {
    setActionLoading(true);
    setMessage({ text: "Sending suspension signal to SAP CAL...", type: "info" });
    try {
      const res = await fetch('/api/sap/cal/suspend', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setCalStatus('SUSPENDING');
        setStatus('dead'); // Instantly mark gateway offline
        setMessage({ text: "Suspension initiated! Safely shutting down compute nodes to save costs.", type: "success" });
      } else {
        setMessage({ text: data.message || "Failed to trigger suspension.", type: "error" });
      }
    } catch (err: any) {
      setMessage({ text: err.message || "Network error occurred.", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  // Get status color tokens
  const getSapStatusBadge = () => {
    switch (status) {
      case 'alive':
        return { bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400", label: "OData Connected" };
      case 'dead':
        return { bg: "bg-red-500/10 border-red-500/20 text-red-400", label: "OData Offline" };
      case 'checking':
      default:
        return { bg: "bg-slate-500/10 border-slate-500/20 text-slate-400 animate-pulse", label: "Pinging Gateway..." };
    }
  };

  const getCalStatusDetails = () => {
    switch (calStatus) {
      case 'ACTIVE':
        return {
          icon: <CloudLightning className="w-5 h-5 text-emerald-400" />,
          colorClass: "text-emerald-400",
          label: "Active (Azure)",
          pulseClass: "bg-emerald-500",
          desc: "The cloud appliance instance is active and running."
        };
      case 'SUSPENDED':
        return {
          icon: <Power className="w-5 h-5 text-amber-500" />,
          colorClass: "text-amber-500",
          label: "Suspended",
          pulseClass: "bg-amber-500",
          desc: "The instance is offline. Storage is kept, compute is stopped."
        };
      case 'ACTIVATING':
        return {
          icon: <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />,
          colorClass: "text-cyan-400",
          label: "Activating...",
          pulseClass: "bg-cyan-500 animate-pulse",
          desc: "Waking up virtual machines & bootstrapping SAP kernel services."
        };
      case 'SUSPENDING':
        return {
          icon: <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />,
          colorClass: "text-amber-400",
          label: "Suspending...",
          pulseClass: "bg-amber-500 animate-pulse",
          desc: "Safely flushing cache and stopping virtual machine resources."
        };
      case 'CONFIG_ERROR':
        if (rawCalStatus === 'AZURE_LOGIN_REQUIRED') {
          return {
            icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
            colorClass: "text-amber-400",
            label: "Azure Login Needed",
            pulseClass: "bg-amber-500",
            desc: "Your local Azure CLI session has expired. Please run 'az login' in your command terminal."
          };
        }
        return {
          icon: <AlertTriangle className="w-5 h-5 text-rose-400" />,
          colorClass: "text-rose-400",
          label: "CAL Key Missing",
          pulseClass: "bg-rose-500",
          desc: "Credentials not detected in environment configurations."
        };
      case 'ERROR':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-rose-500" />,
          colorClass: "text-rose-500",
          label: "API Connection Error",
          pulseClass: "bg-rose-500",
          desc: "Failed to connect to SAP Cloud Appliance Library."
        };
      case 'checking':
      default:
        return {
          icon: <RefreshCw className="w-5 h-5 text-slate-400 animate-spin" />,
          colorClass: "text-slate-400",
          label: "Syncing CAL...",
          pulseClass: "bg-slate-500",
          desc: "Checking instance state on SAP CAL servers."
        };
    }
  };

  const calDetails = getCalStatusDetails();
  const sapBadge = getSapStatusBadge();

  return (
    <div className="relative w-full">
      {/* Sidebar Button Trigger */}
      <button
        ref={triggerRef}
        onClick={() => setShowControl(!showControl)}
        className={clsx(
          "w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 group cursor-pointer hover:bg-white/5 border border-transparent",
          showControl ? "bg-white/5 border-white/10" : ""
        )}
      >
        <div className="flex items-center">
          <div className="relative flex h-3 w-3">
            {status === 'alive' && (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </>
            )}
            {status === 'dead' && (
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            )}
            {status === 'checking' && (
              <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-500 animate-pulse"></span>
            )}
          </div>
          <span className="hidden lg:block ml-3 text-sm font-medium text-slate-400 group-hover:text-white transition-colors">
            {status === 'alive' ? 'System Online' : (status === 'dead' ? 'System Offline' : 'Connecting...')}
          </span>
        </div>
        
        {/* Subtle cloud activation state indicator in button */}
        {!showControl && calStatus !== 'checking' && (
          <div className={clsx(
            "hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border",
            calStatus === 'ACTIVE' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "",
            calStatus === 'SUSPENDED' ? "bg-amber-500/10 border-amber-500/20 text-amber-400" : "",
            calStatus === 'ACTIVATING' || calStatus === 'SUSPENDING' ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400 animate-pulse" : "",
            calStatus === 'ERROR' ? "bg-rose-500/10 border-rose-500/20 text-rose-400" : "",
            calStatus === 'CONFIG_ERROR' ? "bg-amber-500/10 border-amber-500/20 text-amber-400" : ""
          )}>
            <div className={clsx("w-1 h-1 rounded-full", calDetails.pulseClass)} />
            {calStatus === 'ACTIVE' && "CAL VM Active"}
            {calStatus === 'SUSPENDED' && "CAL Suspended"}
            {calStatus === 'ACTIVATING' && "Waking..."}
            {calStatus === 'SUSPENDING' && "Stopping..."}
            {calStatus === 'ERROR' && "CAL Error"}
            {calStatus === 'CONFIG_ERROR' && rawCalStatus === 'AZURE_LOGIN_REQUIRED' && "Login Azure"}
            {calStatus === 'CONFIG_ERROR' && rawCalStatus !== 'AZURE_LOGIN_REQUIRED' && "CAL Config"}
          </div>
        )}
      </button>

      {/* Glassmorphic Control Card Panel */}
      <AnimatePresence>
        {showControl && (
          <motion.div
            ref={popoverRef}
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute bottom-16 left-0 lg:left-2 z-[99] w-[300px] bg-slate-950/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-2xl text-left"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-evolver-viridian" />
                <span className="font-semibold text-sm text-white">SAP Cloud Controller</span>
              </div>
              <button 
                onClick={() => setShowControl(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Appliance Details */}
            <div className="space-y-4">
              <div>
                <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">Appliance Name</div>
                <div className="text-sm font-semibold text-slate-200 truncate flex items-center gap-1.5" title={applianceName}>
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                  {applianceName}
                </div>
              </div>

              {/* Status Diagnostics Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-black/30 border border-white/5 rounded-xl p-2.5">
                  <div className="text-[10px] text-slate-500 font-semibold mb-1 uppercase tracking-wider">Gateway Client</div>
                  <span className={clsx("inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border", sapBadge.bg)}>
                    {status === 'alive' ? "Connected" : "Offline"}
                  </span>
                </div>

                <div className="bg-black/30 border border-white/5 rounded-xl p-2.5">
                  <div className="text-[10px] text-slate-500 font-semibold mb-1 uppercase tracking-wider">CAL VM State</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className={clsx("w-1.5 h-1.5 rounded-full shrink-0", calDetails.pulseClass)} />
                    <span className={clsx("text-xs font-bold shrink-0 truncate", calDetails.colorClass)}>
                      {calDetails.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Descriptive State text */}
              <p className="text-xs text-slate-400 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                {calDetails.desc}
              </p>

              {/* API Messages */}
              {message && (
                <div className={clsx(
                  "p-3 rounded-xl border text-xs leading-normal flex items-start gap-2",
                  message.type === 'success' && "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
                  message.type === 'error' && "bg-rose-500/10 border-rose-500/20 text-rose-400",
                  message.type === 'info' && "bg-cyan-500/10 border-cyan-500/20 text-cyan-400 animate-pulse"
                )}>
                  {message.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />}
                  <span>{message.text}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2">
                {calStatus === 'CONFIG_ERROR' ? (
                  rawCalStatus === 'AZURE_LOGIN_REQUIRED' ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-[11px] leading-relaxed flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>Your local Azure CLI session has expired or you need to authenticate. Please run <code>az login</code> in your command terminal.</span>
                      </div>
                      <button
                        onClick={() => {
                          checkCalStatus();
                          checkSapPing();
                          setMessage({ text: "Verifying local Azure authentication...", type: "info" });
                          setTimeout(() => setMessage(null), 3000);
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl py-3 px-4 text-xs font-extrabold transition-colors active:scale-[0.98]"
                      >
                        <RefreshCw className="w-4 h-4" /> Check Azure Connection
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-[11px] leading-relaxed flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>SAP CAL credentials are missing from your configuration. Please fill out the keys inside <code>.env.local</code>.</span>
                      </div>
                      <a 
                        href="https://cal.sap.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl py-2 px-3 text-xs font-semibold transition-colors"
                      >
                        Open SAP CAL Console <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )
                ) : (
                  <div className="flex flex-col gap-2">
                    {/* Activate Button */}
                    {calStatus === 'SUSPENDED' && (
                      <button
                        onClick={handleActivate}
                        disabled={actionLoading}
                        className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl py-3 px-4 text-xs font-extrabold transition-all shadow-[0_0_15px_rgba(16,185,129,0.25)] active:scale-[0.98]"
                      >
                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
                        Activate SAP Instance
                      </button>
                    )}

                    {/* Suspend Button */}
                    {calStatus === 'ACTIVE' && (
                      <button
                        onClick={handleSuspend}
                        disabled={actionLoading}
                        className="w-full flex items-center justify-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-xl py-3 px-4 text-xs font-bold transition-all active:scale-[0.98]"
                      >
                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
                        Suspend SAP Instance
                      </button>
                    )}

                    {/* Transition Loading State */}
                    {(calStatus === 'ACTIVATING' || calStatus === 'SUSPENDING' || calStatus === 'checking') && (
                      <div className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/5 text-slate-400 rounded-xl py-3 px-4 text-xs font-semibold cursor-not-allowed">
                        <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                        Please Wait...
                      </div>
                    )}

                    {/* Refresh / Check manually */}
                    <button
                      onClick={() => {
                        checkCalStatus();
                        checkSapPing();
                        setMessage({ text: "Checking latest statuses...", type: "info" });
                        setTimeout(() => setMessage(null), 3000);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-300 py-1 transition-colors mt-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Refresh Status
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
