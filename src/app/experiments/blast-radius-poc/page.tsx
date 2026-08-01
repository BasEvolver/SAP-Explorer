import React from 'react';
import BlastRadiusVisualizer from '../../../components/blast-radius/BlastRadiusVisualizer';
import HUDOverlay from '../../../components/blast-radius/HUDOverlay';

export const metadata = {
  title: 'Blast Radius PoC | SAP Explorer',
  description: 'Simulate risk propagation and blast radius within the enterprise network.',
};

export default function BlastRadiusPage() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-gray-950">
      <BlastRadiusVisualizer />
      <HUDOverlay />
    </main>
  );
}
