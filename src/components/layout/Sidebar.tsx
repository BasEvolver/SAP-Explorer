"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Compass, Database, Link as LinkIcon, Settings, HardDrive, ChevronDown, ChevronRight, FileText, Table, ServerCog, Blocks, Code2, Network, DatabaseZap, PanelLeftClose, PanelLeftOpen, Search, TrendingUp, Sparkles, ShieldAlert, Coins, Landmark, Scale, ShieldCheck, BadgeAlert, ShoppingCart, Briefcase, Activity, Lock, Sun, Moon, LayoutGrid } from "lucide-react";
import clsx from "clsx";
import ConnectionStatus from "@/components/layout/ConnectionStatus";
import { useState, useEffect } from "react";

interface SubItem {
  icon: any;
  label: string;
  href: string;
}

interface ScenarioGroup {
  label: string;
  items: SubItem[];
}

interface NavItem {
  icon: any;
  label: string;
  href?: string;
  subItems?: SubItem[];
  groups?: ScenarioGroup[];
}

const navItems: NavItem[] = [
  { 
    icon: Compass, 
    label: "Discover", 
    subItems: [
      { icon: Database, label: "SAP Logical DB", href: "/discover/logical-db" },
      { icon: Network, label: "SAP Org Structure", href: "/discover/org-structure" },
      { icon: LinkIcon, label: "SAP Object Relationships", href: "/discover/object-relationships" }
    ]
  },
  { 
    icon: Sparkles, 
    label: "Scenarios", 
    groups: [
      {
        label: "CFO & Treasurer",
        items: [
          { icon: TrendingUp, label: "Working Capital (Active)", href: "/aria-finance" },
          { icon: Landmark, label: "Cash Sweeper", href: "/scenarios?id=cash-concentration" },
          { icon: Coins, label: "FX Hedging", href: "/scenarios?id=fx-hedging" },
        ]
      },
      {
        label: "Tax & Compliance",
        items: [
          { icon: Scale, label: "Cross-Border Tax", href: "/scenarios?id=tax-jurisdiction" },
          { icon: Scale, label: "Tax Lookback", href: "/scenarios?id=tax-lookback" },
          { icon: ShieldCheck, label: "Revenue Lock (IFRS 15)", href: "/scenarios?id=revenue-recognition" },
          { icon: BadgeAlert, label: "Duplicate Payments", href: "/scenarios?id=duplicate-payments" },
        ]
      },
      {
        label: "Procurement & SC",
        items: [
          { icon: ShoppingCart, label: "Maverick Spend", href: "/scenarios?id=spend-compliance" },
          { icon: Database, label: "Inventory Realloc", href: "/scenarios?id=inventory-reallocation" },
          { icon: Briefcase, label: "Freight Cost Audit", href: "/scenarios?id=freight-audit" },
        ]
      },
      {
        label: "Corporate Controller",
        items: [
          { icon: Activity, label: "Intercompany G/L", href: "/scenarios?id=intercompany-reconciliation" },
          { icon: ShieldCheck, label: "CapEx Control", href: "/scenarios?id=capex-control" },
          { icon: Lock, label: "Credit Limit Release", href: "/scenarios?id=credit-limit" }
        ]
      }
    ]
  },
  { 
    icon: Database, 
    label: "Data", 
    subItems: [
      { icon: FileText, label: "Data Dictionary", href: "/data/dictionary" },
      { icon: Table, label: "Transparent Tables", href: "/data/tables" },
      { icon: ServerCog, label: "Logical Databases", href: "/data/logical-dbs" },
      { icon: DatabaseZap, label: "CDS Views", href: "/data/cds-views" },
      { icon: Database, label: "Prisma Database UI", href: "/data/database" },
    ]
  },
  { 
    icon: LinkIcon, 
    label: "Interfaces", 
    subItems: [
      { icon: Blocks, label: "BAPIs", href: "/interfaces/bapis" },
      { icon: Code2, label: "RFCs", href: "/interfaces/rfcs" },
      { icon: Network, label: "OData Services", href: "/interfaces/odata" },
    ]
  },
  { icon: HardDrive, label: "Maintenance", href: "/maintenance" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState<boolean>(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    "Discover": true,
    "Scenarios": true,
    "Data": false,
    "Interfaces": false
  });
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    "CFO & Treasurer": true,
    "Tax & Compliance": false,
    "Procurement & SC": false,
    "Corporate Controller": false
  });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeScenarioQueryId, setActiveScenarioQueryId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleLocationChange = () => {
        const params = new URLSearchParams(window.location.search);
        setActiveScenarioQueryId(params.get("id"));
      };

      handleLocationChange();

      window.addEventListener("popstate", handleLocationChange);
      return () => {
        window.removeEventListener("popstate", handleLocationChange);
      };
    }
  }, [pathname]);

  // Auto-expand scenario group based on active pathname and search parameters
  useEffect(() => {
    if (pathname === "/aria-finance") {
      setExpandedGroups(prev => ({ ...prev, "CFO & Treasurer": true }));
    } else if (pathname === "/scenarios") {
      const activeId = activeScenarioQueryId || "ap-ar-optimization";
      const scenarioItem = navItems.find(item => item.label === "Scenarios");
      if (scenarioItem && scenarioItem.groups) {
        const matchingGroup = scenarioItem.groups.find(group => 
          group.items.some((sub: any) => {
            const subId = sub.href.includes("id=") ? sub.href.split("id=")[1] : null;
            return subId === activeId;
          })
        );
        if (matchingGroup) {
          setExpandedGroups(prev => ({ ...prev, [matchingGroup.label]: true }));
        }
      }
    }
  }, [pathname, activeScenarioQueryId]);

  const toggleMenu = (label: string) => {
    if (isCollapsed) setIsCollapsed(false);
    setExpandedMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const toggleGroup = (groupLabel: string) => {
    setExpandedGroups(prev => ({ ...prev, [groupLabel]: !prev[groupLabel] }));
  };

  return (
    <aside className={clsx(
      "h-full flex flex-col py-6 border-r border-slate-200 dark:border-white/5 bg-white/95 dark:bg-evolver-bg-dark/80 backdrop-blur-3xl z-50 transition-all duration-300",
      isCollapsed ? "w-20 items-center" : "w-20 lg:w-64 items-center lg:items-stretch"
    )}>
      {/* Brand / Logo */}
      <div className={clsx("flex items-center mb-12", isCollapsed ? "justify-center px-0" : "justify-center lg:justify-between px-0 lg:px-6 w-full")}>
        <Link href="/" className="flex items-center group/logo hover:opacity-85 transition-opacity" title="Back to Portal Hub">
            <div className={clsx("w-10 h-10 relative", isCollapsed ? "" : "hidden lg:block")}>
                <Image 
                    src="/graphics/Evolver_Mark_Viridian.png" 
                    alt="Evolver Logo" 
                    width={40} 
                    height={40}
                    className="object-contain group-hover/logo:scale-105 transition-transform duration-300"
                />
            </div>
            <div className={clsx("w-10 h-10 relative lg:hidden", isCollapsed ? "hidden" : "block")}>
                <Image 
                    src="/graphics/Evolver_Mark_Viridian.png" 
                    alt="Evolver Logo" 
                    width={40} 
                    height={40}
                    className="object-contain group-hover/logo:scale-105 transition-transform duration-300"
                />
            </div>
            {!isCollapsed && <span className="hidden lg:block ml-3 font-semibold text-xl tracking-tight text-slate-900 dark:text-white group-hover/logo:text-evolver-viridian-light transition-colors">Evolver</span>}
        </Link>
        {!isCollapsed && (
            <button onClick={() => setIsCollapsed(true)} className="hidden lg:block text-slate-500 hover:text-slate-950 dark:hover:text-white transition-colors">
                <PanelLeftClose className="w-5 h-5" />
            </button>
        )}
      </div>

      {isCollapsed && (
          <button onClick={() => setIsCollapsed(false)} className="hidden lg:block mb-6 text-slate-500 hover:text-slate-950 dark:hover:text-white transition-colors">
              <PanelLeftOpen className="w-5 h-5" />
          </button>
      )}

      {/* Global Search Bar */}
      <div className={clsx("mb-4 w-full", isCollapsed ? "px-2 hidden lg:flex justify-center" : "px-4 hidden lg:block")}>
        {isCollapsed ? (
            <button onClick={() => setIsCollapsed(false)} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/5 transition-colors">
                <Search className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </button>
        ) : (
            <div className="relative group w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-evolver-viridian transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search SAP (e.g. MARA)..."
                    className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl py-2 pl-9 pr-3 text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-evolver-viridian/50 focus:ring-1 focus:ring-evolver-viridian/50 transition-all shadow-inner"
                />
            </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className={clsx("flex-1 w-full space-y-2 overflow-y-auto overflow-x-hidden", isCollapsed ? "px-2" : "px-3")}>
        {navItems.map((item) => {
          const hasSubItems = !!item.subItems || !!item.groups;
          const isExpanded = expandedMenus[item.label];
          // Determine if any child is active
          const isAnyChildActive = hasSubItems && (
            (item.subItems && item.subItems.some((sub: any) => {
              const subPath = sub.href.split(/[?#]/)[0];
              return pathname === subPath;
            })) ||
            (item.groups && item.groups.some((group: any) => 
              group.items.some((sub: any) => {
                if (pathname === "/aria-finance" && sub.href === "/aria-finance") {
                  return true;
                } else if (pathname === "/scenarios") {
                  const subId = sub.href.includes("id=") ? sub.href.split("id=")[1] : null;
                  const activeId = activeScenarioQueryId || "ap-ar-optimization";
                  return subId === activeId;
                } else {
                  return pathname === sub.href;
                }
              })
            ))
          );
          const isActive = pathname === item.href || isAnyChildActive;

          return (
            <div key={item.label} className="w-full">
              {hasSubItems ? (
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={clsx(
                    "w-full group flex items-center justify-between p-3 rounded-xl transition-all duration-300 relative",
                    isActive && !isExpanded
                      ? "bg-evolver-viridian/10 text-evolver-viridian dark:text-evolver-viridian-light shadow-[inset_4px_0_0_0_#40826D]" 
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
                  )}
                >
                  <div className={clsx("flex items-center", isCollapsed ? "justify-center w-full" : "justify-center lg:justify-start w-full lg:w-auto")}>
                    <item.icon className={clsx("w-6 h-6 transition-transform duration-300", isActive && !isExpanded && "scale-110")} />
                    {!isCollapsed && <span className="hidden lg:block ml-3 text-sm font-medium">{item.label}</span>}
                  </div>
                  {!isCollapsed && (
                    <div className="hidden lg:block text-slate-500">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  )}
                  
                  {/* Tooltip for collapsed state */}
                  <div className="absolute left-20 bg-white dark:bg-evolver-bg-obsidian border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-md text-xs font-medium text-slate-800 dark:text-white opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 lg:hidden z-50 whitespace-nowrap shadow-xl">
                    {item.label}
                  </div>
                  {isCollapsed && (
                    <div className="absolute left-20 bg-white dark:bg-evolver-bg-obsidian border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-md text-xs font-medium text-slate-800 dark:text-white opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 hidden lg:block z-50 whitespace-nowrap shadow-xl">
                      {item.label}
                    </div>
                  )}
                </button>
              ) : (
                <Link
                  href={item.href!}
                  className={clsx(
                    "w-full group flex items-center p-3 rounded-xl transition-all duration-300 relative",
                    isCollapsed ? "justify-center" : "justify-center lg:justify-start",
                    isActive 
                      ? "bg-evolver-viridian/10 dark:bg-evolver-viridian/20 text-evolver-viridian dark:text-evolver-viridian-light shadow-[inset_4px_0_0_0_#40826D]" 
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
                  )}
                >
                  <item.icon className={clsx("w-6 h-6 transition-transform duration-300", isActive && "scale-110")} />
                  {!isCollapsed && <span className="hidden lg:block ml-3 text-sm font-medium">{item.label}</span>}
                  
                  {/* Tooltip for collapsed state */}
                  <div className="absolute left-20 bg-white dark:bg-evolver-bg-obsidian border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-md text-xs font-medium text-slate-800 dark:text-white opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 lg:hidden z-50 whitespace-nowrap shadow-xl">
                    {item.label}
                  </div>
                  {isCollapsed && (
                    <div className="absolute left-20 bg-white dark:bg-evolver-bg-obsidian border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-md text-xs font-medium text-slate-800 dark:text-white opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 hidden lg:block z-50 whitespace-nowrap shadow-xl">
                      {item.label}
                    </div>
                  )}
                </Link>
              )}

              {/* Render SubItems */}
              {hasSubItems && isExpanded && !isCollapsed && (
                <div className="mt-1 space-y-1 hidden lg:block ml-4 pl-4 border-l border-slate-200 dark:border-white/10">
                  {/* Standard Flat SubItems */}
                  {item.subItems && item.subItems.map((sub: any) => {
                    // Check active state
                    const isSubActive = pathname === sub.href;

                    return (
                      <Link
                        key={sub.label}
                        href={sub.href}
                        className={clsx(
                          "w-full group flex items-center justify-start p-2 rounded-lg transition-all duration-200",
                          isSubActive 
                            ? "bg-evolver-viridian/10 dark:bg-evolver-viridian/20 text-evolver-viridian dark:text-evolver-viridian-light font-semibold" 
                            : "text-slate-500 hover:bg-slate-100 hover:text-slate-850 dark:hover:bg-white/5 dark:hover:text-slate-300"
                        )}
                      >
                        <sub.icon className={clsx("w-4 h-4 mr-3 transition-transform duration-300", isSubActive && "scale-110")} />
                        <span className="text-sm font-medium">{sub.label}</span>
                      </Link>
                    );
                  })}

                  {/* Grouped SubItems (e.g. Scenarios) */}
                  {item.groups && item.groups.map((group: any) => {
                    const isGroupExpanded = expandedGroups[group.label];
                    const isGroupActive = group.items.some((sub: any) => {
                      if (pathname === "/aria-finance" && sub.href === "/aria-finance") {
                        return true;
                      } else if (pathname === "/scenarios") {
                        const subId = sub.href.includes("id=") ? sub.href.split("id=")[1] : null;
                        const activeId = activeScenarioQueryId || "ap-ar-optimization";
                        return subId === activeId;
                      } else {
                        return pathname === sub.href;
                      }
                    });

                    return (
                      <div key={group.label} className="space-y-1">
                        <button
                          onClick={() => toggleGroup(group.label)}
                          className={clsx(
                            "w-full flex items-center justify-between py-1.5 px-2 rounded-lg text-[10px] font-extrabold uppercase tracking-widest transition-all duration-200 cursor-pointer text-left select-none outline-none focus:outline-none group",
                            isGroupActive
                              ? "text-evolver-viridian dark:text-evolver-viridian-light bg-evolver-viridian/[0.03] dark:bg-evolver-viridian/[0.05]"
                              : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
                          )}
                        >
                          <span className="flex items-center gap-1.5">
                            {group.label}
                            {isGroupActive && !isGroupExpanded && (
                              <span className="w-1.5 h-1.5 rounded-full bg-evolver-viridian animate-pulse" />
                            )}
                          </span>
                          <div className="text-slate-400 dark:text-slate-500 group-hover:text-slate-655 dark:group-hover:text-slate-300 transition-colors">
                            {isGroupExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5" />
                            )}
                          </div>
                        </button>

                        {/* Group Items Container */}
                        {isGroupExpanded && (
                          <div className="space-y-1 pl-2 border-l border-slate-100 dark:border-white/5 ml-2 transition-all duration-200">
                            {group.items.map((sub: any) => {
                              let isSubActive = false;
                              if (pathname === "/aria-finance" && sub.href === "/aria-finance") {
                                isSubActive = true;
                              } else if (pathname === "/scenarios") {
                                const subId = sub.href.includes("id=") ? sub.href.split("id=")[1] : null;
                                const activeId = activeScenarioQueryId || "ap-ar-optimization";
                                isSubActive = subId === activeId;
                              } else {
                                isSubActive = pathname === sub.href;
                              }

                              return (
                                <Link
                                  key={sub.label}
                                  href={sub.href}
                                  className={clsx(
                                    "w-full group flex items-center justify-start p-2 rounded-lg transition-all duration-200",
                                    isSubActive 
                                      ? "bg-evolver-viridian/10 dark:bg-evolver-viridian/20 text-evolver-viridian dark:text-evolver-viridian-light font-semibold" 
                                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-850 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-350"
                                  )}
                                >
                                  <sub.icon className={clsx("w-4 h-4 mr-3 transition-transform duration-300", isSubActive && "scale-110")} />
                                  <span className="text-sm font-medium">{sub.label}</span>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className={clsx("mt-auto w-full space-y-1", isCollapsed ? "px-2" : "px-3")}>
        {!isCollapsed && <ConnectionStatus />}
        
        {/* Sliding mechanical theme switcher */}
        {mounted && (
          <div className={clsx(
            "w-full flex items-center p-3 rounded-xl transition-all duration-300",
            isCollapsed ? "justify-center" : "justify-between"
          )}>
            {!isCollapsed && (
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                {theme === "dark" ? <Moon className="w-4 h-4 text-emerald-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                Theme
              </span>
            )}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={clsx(
                "flex items-center justify-between gap-2 p-1 rounded-full bg-slate-200/80 dark:bg-slate-950/60 border border-slate-300/80 dark:border-white/5 shadow-inner transition-all duration-300 relative cursor-pointer",
                isCollapsed ? "w-10 h-10 justify-center rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10" : "w-14 h-7"
              )}
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isCollapsed ? (
                theme === "dark" ? (
                  <Moon className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <Sun className="w-5 h-5 text-amber-500 shrink-0" />
                )
              ) : (
                <>
                  <div className={clsx(
                    "w-5 h-5 rounded-full flex items-center justify-center absolute transition-all duration-300 shadow",
                    theme === "dark" 
                      ? "bg-slate-800 text-emerald-400 right-1" 
                      : "bg-white text-amber-500 left-1"
                  )}>
                    {theme === "dark" ? (
                      <Moon className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Sun className="w-3 h-3 text-amber-500" />
                    )}
                  </div>
                  <div className="flex justify-between w-full px-1.5 text-slate-400 pointer-events-none">
                    <Sun className="w-2.5 h-2.5 text-slate-400 dark:text-slate-600" />
                    <Moon className="w-2.5 h-2.5 text-slate-400 dark:text-slate-400" />
                  </div>
                </>
              )}
            </button>
          </div>
        )}

        <Link href="/" className={clsx(
            "w-full flex items-center p-3 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white transition-all duration-300 group",
            isCollapsed ? "justify-center" : "justify-center lg:justify-start"
        )}>
            <LayoutGrid className="w-6 h-6 group-hover:scale-110 transition-transform duration-300 text-evolver-viridian" />
            {!isCollapsed && <span className="hidden lg:block ml-3 text-sm font-medium">Portal Hub</span>}
        </Link>

        <button className={clsx(
            "w-full flex items-center p-3 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white transition-all duration-300 group",
            isCollapsed ? "justify-center" : "justify-center lg:justify-start"
        )}>
            <Settings className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
            {!isCollapsed && <span className="hidden lg:block ml-3 text-sm font-medium">Settings</span>}
        </button>
      </div>
    </aside>
  );
}
