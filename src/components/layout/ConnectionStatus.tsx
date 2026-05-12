"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";

export default function ConnectionStatus() {
  const [status, setStatus] = useState<'checking' | 'alive' | 'dead'>('checking');

  useEffect(() => {
    const checkStatus = async () => {
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

    // Initial check
    checkStatus();

    // Poll every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex items-center justify-center lg:justify-start p-3 rounded-xl hover:bg-white/5 transition-all duration-300 group cursor-help" title={status === 'alive' ? "SAP S/4HANA Connected" : (status === 'dead' ? "SAP S/4HANA Disconnected" : "Checking Connection...")}>
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
  );
}
