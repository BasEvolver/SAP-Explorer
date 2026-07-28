"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useTheme } from "next-themes";

export type TenantType = "asml" | "abb" | "evolver";

export interface TenantThemeTokens {
  bodyBg: string;
  panelBg: string;
  sidebarBg: string;
  cardBg: string;
  borderClass: string;
  textPrimary: string;
  textSecondary: string;
  buttonInk: string;
  composerBorder: string;
  composerBg: string;
  badgeClass: string;
  logoGradient: string;
}

interface TenantContextProps {
  activeTenant: TenantType;
  setActiveTenant: (tenant: TenantType) => void;
  themeColors: TenantThemeTokens;
}

const TenantContext = createContext<TenantContextProps | undefined>(undefined);

// Theme tokens catalog mapped by tenant and mode
const THEME_TOKENS: Record<TenantType, { light: TenantThemeTokens; dark: TenantThemeTokens }> = {
  asml: {
    light: {
      bodyBg: "bg-[#f3eee4]",
      panelBg: "bg-[#f4f6f8]",
      sidebarBg: "bg-white",
      cardBg: "bg-white",
      borderClass: "border-[#0f172a]/10",
      textPrimary: "text-[#1a1815]",
      textSecondary: "text-[#4a423b]",
      buttonInk: "bg-[#0f172a] hover:bg-[#1e293b] text-white",
      composerBorder: "border-[#027864]",
      composerBg: "bg-[#ffffff]",
      badgeClass: "bg-[#0f172a]/15 text-[#0f172a] border-[#0f172a]/20",
      logoGradient: "from-slate-800 to-slate-950",
    },
    dark: {
      bodyBg: "bg-[#0b1220]",
      panelBg: "bg-[#0f172a]",
      sidebarBg: "bg-[#060814]",
      cardBg: "bg-[#111a2b]",
      borderClass: "border-white/10",
      textPrimary: "text-[#e8e8ee]",
      textSecondary: "text-slate-400",
      buttonInk: "bg-slate-800 hover:bg-slate-700 text-white",
      composerBorder: "border-[#115949]",
      composerBg: "bg-[#0b1220]",
      badgeClass: "bg-slate-800 text-slate-200 border-slate-700",
      logoGradient: "from-slate-600 to-slate-800",
    },
  },
  abb: {
    light: {
      bodyBg: "bg-[#f0f2f5]",
      panelBg: "bg-white",
      sidebarBg: "bg-white",
      cardBg: "bg-[#f8fafc]",
      borderClass: "border-slate-200",
      textPrimary: "text-[#000000]",
      textSecondary: "text-slate-500",
      buttonInk: "bg-[#ff0000] hover:bg-[#d90000] text-white",
      composerBorder: "border-slate-350",
      composerBg: "bg-[#f8fafc]",
      badgeClass: "bg-[#ff0000]/10 text-[#ff0000] border-[#ff0000]/20",
      logoGradient: "from-red-650 to-red-500",
    },
    dark: {
      bodyBg: "bg-[#0f0f10]",
      panelBg: "bg-[#18181b]",
      sidebarBg: "bg-[#09090b]",
      cardBg: "bg-[#18181b]",
      borderClass: "border-zinc-800",
      textPrimary: "text-[#f4f4f5]",
      textSecondary: "text-zinc-500",
      buttonInk: "bg-[#ff0000] hover:bg-[#d90000] text-white",
      composerBorder: "border-zinc-700",
      composerBg: "bg-[#09090b]",
      badgeClass: "bg-[#ff0000]/20 text-[#ff0000] border-[#ff0000]/30",
      logoGradient: "from-red-800 to-red-600",
    },
  },
  evolver: {
    light: {
      bodyBg: "bg-[#f8fafc]",
      panelBg: "bg-white",
      sidebarBg: "bg-white",
      cardBg: "bg-white",
      borderClass: "border-emerald-500/10",
      textPrimary: "text-slate-800",
      textSecondary: "text-slate-500",
      buttonInk: "bg-emerald-600 hover:bg-emerald-500 text-white",
      composerBorder: "border-emerald-500",
      composerBg: "bg-white",
      badgeClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      logoGradient: "from-emerald-500 to-teal-650",
    },
    dark: {
      bodyBg: "bg-[#030712]",
      panelBg: "bg-[#090e17]",
      sidebarBg: "bg-[#060814]",
      cardBg: "bg-[#0b1029]",
      borderClass: "border-indigo-500/15",
      textPrimary: "text-slate-100",
      textSecondary: "text-slate-400",
      buttonInk: "bg-indigo-650 hover:bg-indigo-500 text-white",
      composerBorder: "border-indigo-500",
      composerBg: "bg-[#0b1029]",
      badgeClass: "bg-indigo-500/10 text-indigo-400 border-indigo-500/25",
      logoGradient: "from-indigo-600 to-cyan-500",
    },
  },
};

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [activeTenant, setActiveTenantState] = useState<TenantType>("asml");
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read from local storage if available
    const saved = localStorage.getItem("aria_manifold_tenant");
    if (saved === "asml" || saved === "abb" || saved === "evolver") {
      setActiveTenantState(saved as TenantType);
    }
    setMounted(true);
  }, []);

  const setActiveTenant = (tenant: TenantType) => {
    setActiveTenantState(tenant);
    localStorage.setItem("aria_manifold_tenant", tenant);
  };

  const themeMode = (mounted && resolvedTheme === "light" ? "light" : "dark") as "light" | "dark";
  const themeColors = THEME_TOKENS[activeTenant][themeMode];

  return (
    <TenantContext.Provider value={{ activeTenant, setActiveTenant, themeColors }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
}
