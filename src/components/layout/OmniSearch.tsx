"use client";

import { Search, Command, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function OmniSearch() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [query, setQuery] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
    }
  };

  useEffect(() => setMounted(true), []);

  return (
    <div className="relative z-50 w-full max-w-3xl mx-auto mt-6 px-4 flex items-center gap-4 shrink-0">
      <div className="relative group flex-1">
        {/* Glow effect underneath */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-evolver-viridian to-evolver-blue rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        
        {/* Search Input Container */}
        <div className="relative flex items-center glass-panel rounded-2xl px-4 py-3">
          <Search className="w-5 h-5 text-slate-400 group-focus-within:text-evolver-viridian transition-colors" />
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search SAP Entities (e.g. VBAK, BAPI_SALESORDER_CREATEFROMDAT2)..." 
            className="w-full bg-transparent border-none outline-none px-3 text-sm text-slate-900 dark:text-white placeholder-slate-500"
          />
          <div className="flex items-center space-x-1 px-2 py-1 rounded bg-black/5 dark:bg-white/10 text-xs text-slate-500 dark:text-slate-300 font-mono">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </div>
      </div>
      
      {mounted && (
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="relative glass-panel p-3 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors shrink-0"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
        </button>
      )}
    </div>
  );
}
