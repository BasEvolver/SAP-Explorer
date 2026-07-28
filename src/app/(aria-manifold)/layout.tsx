"use client";

import ManifoldSidebar from "@/components/manifold/ManifoldSidebar";
import { TenantProvider, useTenant } from "@/components/manifold/TenantContext";

function ManifoldLayoutContainer({ children }: { children: React.ReactNode }) {
  const { themeColors } = useTenant();

  return (
    <div className={`flex h-screen w-full relative ${themeColors.bodyBg} ${themeColors.textPrimary} transition-colors duration-300 font-sans`}>
      <ManifoldSidebar />
      <main className={`flex-1 flex flex-col h-full relative overflow-hidden transition-colors duration-300`}>
        {children}
      </main>
    </div>
  );
}

export default function AriaManifoldLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TenantProvider>
      <ManifoldLayoutContainer>{children}</ManifoldLayoutContainer>
    </TenantProvider>
  );
}
