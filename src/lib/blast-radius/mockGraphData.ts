import { GraphData, GraphNode, GraphEdge, NodeType, EdgeType } from './types';

function randomRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function assignCriticality(risk: number): GraphNode['criticality'] {
  if (risk < 0.25) return 'low';
  if (risk < 0.5) return 'medium';
  if (risk < 0.75) return 'high';
  return 'critical';
}

function getBaseRisk(type: string): number {
  switch (type) {
    case 'vendor': return randomRange(0.1, 0.4);
    case 'application': return randomRange(0.05, 0.3);
    case 'master_data': return randomRange(0.01, 0.2);
    case 'transaction': return randomRange(0.0, 0.1);
    default: return randomRange(0.05, 0.2);
  }
}

export function generateMockGraph(): GraphData {
  const nodes: GraphNode[] = [];
  const links: GraphEdge[] = [];

  const counts = {
    vendor: 15,
    application: 20,
    master_data: 25,
    transaction: 30,
  };

  // Generate Nodes
  let idCounter = 1;

  const vendors: GraphNode[] = [];
  for (let i = 0; i < counts.vendor; i++) {
    const risk = getBaseRisk('vendor');
    const node: GraphNode = {
      id: `v${idCounter++}`,
      name: `Supplier ${String.fromCharCode(65 + i % 26)}${i > 26 ? i : ''}`,
      type: 'vendor',
      baseRisk: risk,
      currentRisk: risk,
      criticality: assignCriticality(risk),
      val: randomRange(2, 4)
    };
    vendors.push(node);
    nodes.push(node);
  }

  const applications: GraphNode[] = [];
  const appNames = ['ERP Core', 'CRM Hub', 'Billing Eng', 'Supply Chain', 'Analytics DB', 'Auth Service', 'Payment Gateway', 'Logistics API', 'HRIS', 'Procurement Portal'];
  for (let i = 0; i < counts.application; i++) {
    const risk = getBaseRisk('application');
    const node: GraphNode = {
      id: `a${idCounter++}`,
      name: appNames[i % appNames.length] + (i >= appNames.length ? ` ${Math.floor(i/appNames.length)}` : ''),
      type: 'application',
      baseRisk: risk,
      currentRisk: risk,
      criticality: assignCriticality(risk),
      val: randomRange(3, 6)
    };
    applications.push(node);
    nodes.push(node);
  }

  const masterData: GraphNode[] = [];
  const mdNames = ['Vendor Master', 'Material Master', 'Customer Master', 'Pricing Cond', 'GL Accounts', 'Cost Centers', 'Tax Config'];
  for (let i = 0; i < counts.master_data; i++) {
    const risk = getBaseRisk('master_data');
    const node: GraphNode = {
      id: `m${idCounter++}`,
      name: mdNames[i % mdNames.length] + (i >= mdNames.length ? ` ${Math.floor(i/mdNames.length)}` : ''),
      type: 'master_data',
      baseRisk: risk,
      currentRisk: risk,
      criticality: assignCriticality(risk),
      val: randomRange(1, 3)
    };
    masterData.push(node);
    nodes.push(node);
  }

  const transactions: GraphNode[] = [];
  for (let i = 0; i < counts.transaction; i++) {
    const risk = getBaseRisk('transaction');
    const node: GraphNode = {
      id: `t${idCounter++}`,
      name: `PO-${1000 + i}`,
      type: 'transaction',
      baseRisk: risk,
      currentRisk: risk,
      criticality: assignCriticality(risk),
      val: randomRange(0.5, 1.5)
    };
    transactions.push(node);
    nodes.push(node);
  }

  // Generate Edges (Directed)
  // Vendor -> Application (SUPPLIES)
  vendors.forEach(vendor => {
    const numApps = Math.floor(randomRange(1, 4));
    for (let i = 0; i < numApps; i++) {
      const app = applications[Math.floor(Math.random() * applications.length)];
      links.push({
        source: vendor.id,
        target: app.id,
        type: 'SUPPLIES',
        attenuation: randomRange(0.6, 0.95)
      });
    }
  });

  // Application -> Master Data (WRITES_TO / DEPENDS_ON)
  applications.forEach(app => {
    const numMd = Math.floor(randomRange(2, 6));
    for (let i = 0; i < numMd; i++) {
      const md = masterData[Math.floor(Math.random() * masterData.length)];
      links.push({
        source: app.id,
        target: md.id,
        type: Math.random() > 0.5 ? 'WRITES_TO' : 'DEPENDS_ON',
        attenuation: randomRange(0.5, 0.85)
      });
    }
  });

  // Application / Master Data -> Transaction
  transactions.forEach(trx => {
    // Links to an application
    const app = applications[Math.floor(Math.random() * applications.length)];
    links.push({
      source: app.id,
      target: trx.id,
      type: 'LINKED_TRANSACTION',
      attenuation: randomRange(0.4, 0.8)
    });

    // Links to a master data
    if (Math.random() > 0.3) {
      const md = masterData[Math.floor(Math.random() * masterData.length)];
      links.push({
        source: md.id,
        target: trx.id,
        type: 'LINKED_TRANSACTION',
        attenuation: randomRange(0.7, 0.9)
      });
    }
  });

  // Add some cross-app dependencies
  for(let i=0; i<10; i++) {
      const app1 = applications[Math.floor(Math.random() * applications.length)];
      const app2 = applications[Math.floor(Math.random() * applications.length)];
      if (app1.id !== app2.id) {
          links.push({
              source: app1.id,
              target: app2.id,
              type: 'DEPENDS_ON',
              attenuation: randomRange(0.3, 0.9)
          });
      }
  }

  return { nodes, links };
}
