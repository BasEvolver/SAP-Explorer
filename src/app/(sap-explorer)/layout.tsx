import Sidebar from "@/components/layout/Sidebar";

export default function SapExplorerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen w-full relative">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        {children}
      </main>
    </div>
  );
}
