"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Network, Database, GitMerge, Code, Settings, HardDrive } from "lucide-react";
import clsx from "clsx";

const navItems = [
  { icon: Network, label: "Schema Graph", href: "/" },
  { icon: Database, label: "Data Grid", href: "/grid" },
  { icon: GitMerge, label: "Logical DB", href: "/blueprint" },
  { icon: Code, label: "API Hub", href: "/api" },
  { icon: HardDrive, label: "Sync Engine", href: "/sync" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-20 lg:w-64 h-full flex flex-col items-center lg:items-stretch py-6 border-r border-white/5 bg-evolver-bg-dark/80 backdrop-blur-3xl z-50 transition-all duration-300">
      {/* Brand / Logo */}
      <div className="flex items-center justify-center lg:justify-start px-0 lg:px-6 mb-12">
        <div className="w-10 h-10 relative hidden lg:block">
            <Image 
                src="/graphics/Evolver_Mark_Viridian.png" 
                alt="Evolver Logo" 
                width={40} 
                height={40}
                className="object-contain"
            />
        </div>
        <div className="w-10 h-10 relative lg:hidden block">
            <Image 
                src="/graphics/Evolver_Mark_Viridian.png" 
                alt="Evolver Logo" 
                width={40} 
                height={40}
                className="object-contain"
            />
        </div>
        <span className="hidden lg:block ml-3 font-semibold text-xl tracking-tight text-white">Evolver</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 w-full px-3 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={clsx(
                "group flex items-center justify-center lg:justify-start p-3 rounded-xl transition-all duration-300",
                isActive 
                  ? "bg-evolver-viridian/20 text-evolver-viridian-light shadow-[inset_4px_0_0_0_#40826D]" 
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={clsx("w-6 h-6 transition-transform duration-300", isActive && "scale-110")} />
              <span className="hidden lg:block ml-3 text-sm font-medium">{item.label}</span>
              
              {/* Tooltip for collapsed state */}
              <div className="absolute left-20 bg-evolver-bg-obsidian border border-white/10 px-3 py-1.5 rounded-md text-xs font-medium text-white opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 lg:hidden z-50 whitespace-nowrap shadow-xl">
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="mt-auto px-3 w-full">
        <button className="w-full flex items-center justify-center lg:justify-start p-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all duration-300 group">
            <Settings className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
            <span className="hidden lg:block ml-3 text-sm font-medium">Settings</span>
        </button>
      </div>
    </aside>
  );
}
