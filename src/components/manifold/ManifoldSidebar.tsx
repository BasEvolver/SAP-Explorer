"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Brain, 
  Cpu, 
  Network, 
  LineChart, 
  Sliders, 
  ArrowLeft, 
  PanelLeftClose, 
  PanelLeftOpen, 
  Zap
} from "lucide-react";
import clsx from "clsx";
import { useState, useEffect } from "react";
import { useTenant } from "./TenantContext";

interface SidebarItem {
  icon: any;
  label: string;
  href: string;
  badge?: string;
}

const sidebarItems: SidebarItem[] = [
  { 
    icon: Brain, 
    label: "Manifold Hub", 
    href: "/manifold" 
  },
  { 
    icon: Cpu, 
    label: "Agent Orchestrator", 
    href: "/manifold/agents",
    badge: "Active" 
  },
  { 
    icon: Network, 
    label: "Cognitive Graph", 
    href: "/manifold/graph" 
  },
  { 
    icon: LineChart, 
    label: "Resolution Workspace", 
    href: "/manifold/simulations" 
  },
  { 
    icon: Sliders, 
    label: "Model Settings", 
    href: "/manifold/settings" 
  }
];

export default function ManifoldSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { activeTenant, themeColors } = useTenant();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <aside className={clsx(
      "h-full flex flex-col py-6 border-r z-50 transition-all duration-300 relative",
      themeColors.sidebarBg,
      themeColors.borderClass,
      isCollapsed ? "w-20 items-center" : "w-20 lg:w-64 items-center lg:items-stretch"
    )}>
      {/* Glow Effect for Evolver default theme */}
      {activeTenant === "evolver" && (
        <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-indigo-500/20 via-cyan-500/10 to-transparent pointer-events-none" />
      )}

      {/* Brand Header */}
      <div className={clsx(
        "flex items-center mb-8 w-full", 
        isCollapsed ? "justify-center px-0" : "justify-center lg:justify-between px-0 lg:px-6"
      )}>
        <Link href="/" className="flex items-center group/logo hover:opacity-90 transition-opacity" title="Return to Portal Hub">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-600 to-indigo-600 p-2 shadow-md flex items-center justify-center relative overflow-hidden group-hover/logo:scale-105 transition-transform duration-300">
            <img 
              src="/graphics/Evolver_Mark_White.png" 
              alt="ARIA" 
              className="w-5.5 h-5.5 object-contain relative z-10" 
            />
          </div>
          {!isCollapsed && (
            <div className="hidden lg:flex flex-col ml-3 select-none">
              <span className="font-extrabold text-base leading-none tracking-wider text-slate-900 dark:text-white">
                ARIA
              </span>
              <span className="font-bold text-[9.5px] tracking-widest uppercase mt-1 text-slate-400 dark:text-slate-400">
                ARIA Core Node
              </span>
            </div>
          )}
        </Link>
        
        {!isCollapsed && (
          <button 
            onClick={() => setIsCollapsed(true)} 
            className="hidden lg:block text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
          >
            <PanelLeftClose className="w-4.5 h-4.5" />
          </button>
        )}
      </div>

      {isCollapsed && (
        <button 
          onClick={() => setIsCollapsed(false)} 
          className="hidden lg:block mb-6 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
        >
          <PanelLeftOpen className="w-4.5 h-4.5" />
        </button>
      )}

      {/* Navigation */}
      <nav className={clsx("flex-1 w-full space-y-1.5 overflow-y-auto overflow-x-hidden", isCollapsed ? "px-2" : "px-3")}>
        <div className={clsx(
          "text-[10px] font-extrabold uppercase tracking-widest mb-3 pl-3 text-slate-400 dark:text-slate-500 select-none transition-all duration-300",
          isCollapsed && "opacity-0 h-0 overflow-hidden mb-0"
        )}>
          Core Intelligence
        </div>

        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.label}
              href={item.href}
              className={clsx(
                "w-full group flex items-center p-2.5 rounded-xl transition-all duration-200 relative border text-xs font-semibold select-none",
                isCollapsed ? "justify-center" : "justify-center lg:justify-start",
                isActive 
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900 dark:border-white shadow-sm font-bold" 
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <item.icon 
                className={clsx(
                  "w-4.5 h-4.5 transition-colors duration-200 shrink-0",
                  isActive 
                    ? "text-white dark:text-slate-950" 
                    : "text-slate-400 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-200"
                )} 
              />
              
              {!isCollapsed && (
                <span className="hidden lg:block ml-3 tracking-wide">
                  {item.label}
                </span>
              )}

              {/* Badge */}
              {item.badge && !isCollapsed && (
                <span className={clsx(
                  "hidden lg:inline-flex items-center ml-auto px-2 py-0.5 rounded-full text-[9.5px] font-extrabold border uppercase tracking-wider",
                  isActive
                    ? "bg-white/20 text-white dark:bg-slate-950/20 dark:text-slate-900 border-transparent"
                    : "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/20"
                )}>
                  {item.badge}
                </span>
              )}

              {/* Tooltip for collapsed state */}
              <div className="absolute left-20 bg-slate-900 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 lg:hidden z-50 whitespace-nowrap shadow-xl">
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer Exit Portal Action */}
      <div className={clsx("mt-auto w-full space-y-1", isCollapsed ? "px-2" : "px-3")}>
        <div className="h-[1px] bg-gradient-to-r from-transparent via-slate-500/10 to-transparent my-4" />
        
        <Link 
          href="/" 
          className={clsx(
            "w-full flex items-center p-2.5 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-xs font-semibold group",
            isCollapsed ? "justify-center" : "justify-center lg:justify-start"
          )}
          title="Exit to Portal Hub"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300 shrink-0" />
          {!isCollapsed && (
            <span className="hidden lg:block ml-3 text-sm font-medium">
              Exit to Hub
            </span>
          )}
        </Link>
      </div>
    </aside>
  );
}
