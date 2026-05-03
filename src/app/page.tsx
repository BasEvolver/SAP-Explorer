'use client';

import dynamic from 'next/dynamic';

const SchemaGraph = dynamic(() => import('@/components/schema-graph/SchemaGraph'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-evolver-bg-dark">
      <div className="animate-pulse text-evolver-viridian font-mono">Initializing Schema Graph...</div>
    </div>
  )
});

export default function Home() {
  return (
    <div className="relative w-full h-full flex-1">
      <SchemaGraph />
    </div>
  );
}
