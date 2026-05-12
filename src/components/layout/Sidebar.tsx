"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Database, Link as LinkIcon, Settings, HardDrive, ChevronDown, ChevronRight, FileText, Table, ServerCog, Blocks, Code2, Network, DatabaseZap, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import clsx from "clsx";
import ConnectionStatus from "@/components/layout/ConnectionStatus";
import { useState } from "react";

const navItems = [
  { icon: Compass, label: "Discover", href: "/" },
  { 
    icon: Database, 
    label: "Data", 
    subItems: [
      { icon: FileText, label: "Data Dictionary", href: "/data/dictionary" },
      { icon: Table, label: "Transparent Tables", href: "/data/tables" },
      { icon: ServerCog, label: "Logical Databases", href: "/data/logical-dbs" },
      { icon: DatabaseZap, label: "CDS Views", href: "/data/cds-views" },
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
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    "Data": true,
    "Interfaces": false
  });
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleMenu = (label: string) => {
    if (isCollapsed) setIsCollapsed(false);
    setExpandedMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside className={clsx(
      "h-full flex flex-col py-6 border-r border-white/5 bg-evolver-bg-dark/80 backdrop-blur-3xl z-50 transition-all duration-300",
      isCollapsed ? "w-20 items-center" : "w-20 lg:w-64 items-center lg:items-stretch"
    )}>
      {/* Brand / Logo */}
      <div className={clsx("flex items-center mb-12", isCollapsed ? "justify-center px-0" : "justify-center lg:justify-between px-0 lg:px-6 w-full")}>
        <div className="flex items-center">
            <div className={clsx("w-10 h-10 relative", isCollapsed ? "" : "hidden lg:block")}>
                <Image 
                    src="/graphics/Evolver_Mark_Viridian.png" 
                    alt="Evolver Logo" 
                    width={40} 
                    height={40}
                    className="object-contain"
                />
            </div>
            <div className={clsx("w-10 h-10 relative lg:hidden", isCollapsed ? "hidden" : "block")}>
                <Image 
                    src="/graphics/Evolver_Mark_Viridian.png" 
                    alt="Evolver Logo" 
                    width={40} 
                    height={40}
                    className="object-contain"
                />
            </div>
            {!isCollapsed && <span className="hidden lg:block ml-3 font-semibold text-xl tracking-tight text-white">Evolver</span>}
        </div>
        {!isCollapsed && (
            <button onClick={() => setIsCollapsed(true)} className="hidden lg:block text-slate-500 hover:text-white transition-colors">
                <PanelLeftClose className="w-5 h-5" />
            </button>
        )}
      </div>

      {isCollapsed && (
          <button onClick={() => setIsCollapsed(false)} className="hidden lg:block mb-6 text-slate-500 hover:text-white transition-colors">
              <PanelLeftOpen className="w-5 h-5" />
          </button>
      )}

      {/* Navigation Links */}
      <nav className={clsx("flex-1 w-full space-y-2 overflow-y-auto overflow-x-hidden", isCollapsed ? "px-2" : "px-3")}>
        {navItems.map((item) => {
          const hasSubItems = !!item.subItems;
          const isExpanded = expandedMenus[item.label];
          // Determine if any child is active
          const isAnyChildActive = hasSubItems && item.subItems?.some(sub => pathname === sub.href);
          const isActive = pathname === item.href || isAnyChildActive;

          return (
            <div key={item.label} className="w-full">
              {hasSubItems ? (
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={clsx(
                    "w-full group flex items-center justify-between p-3 rounded-xl transition-all duration-300 relative",
                    isActive && !isExpanded
                      ? "bg-evolver-viridian/10 text-evolver-viridian-light shadow-[inset_4px_0_0_0_#40826D]" 
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
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
                  <div className="absolute left-20 bg-evolver-bg-obsidian border border-white/10 px-3 py-1.5 rounded-md text-xs font-medium text-white opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 lg:hidden z-50 whitespace-nowrap shadow-xl">
                    {item.label}
                  </div>
                  {isCollapsed && (
                    <div className="absolute left-20 bg-evolver-bg-obsidian border border-white/10 px-3 py-1.5 rounded-md text-xs font-medium text-white opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 hidden lg:block z-50 whitespace-nowrap shadow-xl">
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
                      ? "bg-evolver-viridian/20 text-evolver-viridian-light shadow-[inset_4px_0_0_0_#40826D]" 
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon className={clsx("w-6 h-6 transition-transform duration-300", isActive && "scale-110")} />
                  {!isCollapsed && <span className="hidden lg:block ml-3 text-sm font-medium">{item.label}</span>}
                  
                  {/* Tooltip for collapsed state */}
                  <div className="absolute left-20 bg-evolver-bg-obsidian border border-white/10 px-3 py-1.5 rounded-md text-xs font-medium text-white opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 lg:hidden z-50 whitespace-nowrap shadow-xl">
                    {item.label}
                  </div>
                  {isCollapsed && (
                    <div className="absolute left-20 bg-evolver-bg-obsidian border border-white/10 px-3 py-1.5 rounded-md text-xs font-medium text-white opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 hidden lg:block z-50 whitespace-nowrap shadow-xl">
                      {item.label}
                    </div>
                  )}
                </Link>
              )}

              {/* Render SubItems */}
              {hasSubItems && isExpanded && !isCollapsed && (
                <div className="mt-1 space-y-1 hidden lg:block ml-4 pl-4 border-l border-white/10">
                  {item.subItems!.map(sub => {
                    const isSubActive = pathname === sub.href;
                    return (
                      <Link
                        key={sub.label}
                        href={sub.href}
                        className={clsx(
                          "w-full group flex items-center justify-start p-2 rounded-lg transition-all duration-200",
                          isSubActive 
                            ? "bg-evolver-viridian/20 text-evolver-viridian-light" 
                            : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
                        )}
                      >
                        <sub.icon className={clsx("w-4 h-4 mr-3 transition-transform duration-300", isSubActive && "scale-110")} />
                        <span className="text-sm font-medium">{sub.label}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className={clsx("mt-auto w-full space-y-2", isCollapsed ? "px-2" : "px-3")}>
        {!isCollapsed && <ConnectionStatus />}
        <button className={clsx(
            "w-full flex items-center p-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all duration-300 group",
            isCollapsed ? "justify-center" : "justify-center lg:justify-start"
        )}>
            <Settings className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
            {!isCollapsed && <span className="hidden lg:block ml-3 text-sm font-medium">Settings</span>}
        </button>
      </div>
    </aside>
  );
}
