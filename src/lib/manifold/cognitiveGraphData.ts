export type ZoomLevel = 1 | 2 | 3; // 1: Macro Systems, 2: Orgs & Masters, 3: Micro Vouchers & Tables

export type NodeType = "system" | "org" | "master_record" | "document" | "signal";

export interface GraphNode {
  id: string;
  label: string;
  sublabel?: string;
  type: NodeType;
  zoomLevel: ZoomLevel; // Minimum zoom level at which node is visible
  x: number;
  y: number;
  category: string;
  status?: "normal" | "critical" | "warning" | "optimal" | "blocked" | "rerouted" | "netted";
  details?: {
    systemOfRecord?: string;
    sapTable?: string;
    annualSpend?: string;
    dualRoleSell?: string;
    openInvoices?: string;
    riskScore?: string;
    description?: string;
    fields?: string[];
  };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: "DATA_FEED" | "OWNS_ORG" | "SUPPLIES_TO" | "REVERSE_SELL" | "ISSUES_DOC" | "NETTING_OFFSET" | "REROUTE_PATH";
  zoomLevel: ZoomLevel;
  status?: "normal" | "blocked" | "rerouted" | "netted" | "hazard";
  scenarios?: string[]; // Scenarios in which this edge is highlighted
}

export const APS_NODES: GraphNode[] = [
  // LEVEL 1: MACRO SYSTEM NODES
  {
    id: "sys_sap",
    label: "SAP S/4HANA ERP",
    sublabel: "Core Ledgers & Operations",
    type: "system",
    zoomLevel: 1,
    x: 450,
    y: 250,
    category: "System of Record",
    status: "normal",
    details: {
      systemOfRecord: "S/4HANA 2023 Enterprise",
      description: "Primary enterprise resource planning system hosting General Ledger (ACDOCA), Accounts Payable (BSEG), Vendor Master (LFA1), and Material Master (MARC)."
    }
  },
  {
    id: "sys_salesforce",
    label: "Salesforce CRM",
    sublabel: "Global Accounts & AR Contracts",
    type: "system",
    zoomLevel: 1,
    x: 180,
    y: 150,
    category: "System of Record",
    status: "normal",
    details: {
      systemOfRecord: "Salesforce Revenue Cloud",
      description: "Customer relationship management portal holding dual-role buyer accounts, customer contracts, and open AR receivables."
    }
  },
  {
    id: "sys_dnb",
    label: "Dun & Bradstreet Feed",
    sublabel: "External Credit & Cyber Crawlers",
    type: "signal",
    zoomLevel: 1,
    x: 150,
    y: 400,
    category: "External Data Feed",
    status: "critical",
    details: {
      systemOfRecord: "D&B Direct API & Threat Crawler",
      riskScore: "D&B Rating: 45 (High Cyber & Credit Risk)",
      description: "Continuous threat crawler scanning darkweb credential dumps, domain integrity, and vendor credit ratings."
    }
  },
  {
    id: "sys_treasury",
    label: "Corporate Treasury Portal",
    sublabel: "Bank Lines & Liquidity Clearing",
    type: "system",
    zoomLevel: 1,
    x: 750,
    y: 150,
    category: "Financial Gateway",
    status: "warning",
    details: {
      systemOfRecord: "F110 Payment Program & Intercompany Clearing",
      description: "Manages intercompany borrowing debt lines (8.2%), idle cash pools (3.5%), and automatic payment run proposals."
    }
  },
  {
    id: "sys_plm",
    label: "Siemens Teamcenter PLM",
    sublabel: "BOM Specs & Qualified Suppliers",
    type: "system",
    zoomLevel: 1,
    x: 750,
    y: 400,
    category: "Engineering & Sourcing",
    status: "normal",
    details: {
      systemOfRecord: "Teamcenter Enterprise PLM",
      description: "Product Lifecycle Management repository housing qualified component specifications (QPL) and secondary vendor approvals."
    }
  },

  // LEVEL 2: ORG UNITS & MASTER RECORDS
  {
    id: "org_aether_de",
    label: "Aether DE-10",
    sublabel: "Germany Headquarters (DE-10)",
    type: "org",
    zoomLevel: 2,
    x: 350,
    y: 200,
    category: "Company Code",
    status: "normal",
    details: {
      systemOfRecord: "SAP S/4HANA (AETHER_DE)",
      annualSpend: "$45,200,000 / yr",
      description: "Primary manufacturing and engineering hub for satellite optical sensors and high-frequency radar arrays."
    }
  },
  {
    id: "org_aether_us",
    label: "Aether US-20",
    sublabel: "USA Operating Node (US-20)",
    type: "org",
    zoomLevel: 2,
    x: 600,
    y: 180,
    category: "Company Code",
    status: "warning",
    details: {
      systemOfRecord: "SAP S/4HANA (AETHER_US)",
      annualSpend: "$28,400,000 / yr",
      description: "US operations node holding $5.0M short-term debt line @ 8.2% borrowing interest rate."
    }
  },
  {
    id: "org_aether_sg",
    label: "Aether SG-30",
    sublabel: "Singapore Intercompany Hub (SG-30)",
    type: "org",
    zoomLevel: 2,
    x: 600,
    y: 320,
    category: "Company Code",
    status: "optimal",
    details: {
      systemOfRecord: "SAP S/4HANA (AETHER_SG)",
      annualSpend: "$14,500,000 / yr",
      description: "Wholly owned Asian manufacturing subsidiary holding $8.0M idle cash surplus @ 3.5% yield."
    }
  },
  {
    id: "master_swissoptics",
    label: "SwissOptics AG",
    sublabel: "Vendor VEND_CH_9002 (Zurich)",
    type: "master_record",
    zoomLevel: 2,
    x: 240,
    y: 300,
    category: "Tier-1 Vendor (AP)",
    status: "critical",
    details: {
      systemOfRecord: "SAP LFA1 / Salesforce Account",
      sapTable: "LFA1 (Vendor Master)",
      annualSpend: "$4,250,000 / yr (AP Buy)",
      dualRoleSell: "YES — $1,120,000 / yr (AR Sell)",
      openInvoices: "2 Pending Vouchers ($630,000.00 Total)",
      riskScore: "D&B Rating: 45 (Compromised Domain & Unverified IBAN)",
      description: "8-Year strategic supplier of Optical Lenses. Simultaneously purchases Sensor Calibration Chips from Aether Germany."
    }
  },
  {
    id: "master_swissoptics_cust",
    label: "SwissOptics Customer Acct",
    sublabel: "Customer CUST_CH_9002 (AR)",
    type: "master_record",
    zoomLevel: 2,
    x: 120,
    y: 250,
    category: "Dual-Role Customer (AR)",
    status: "normal",
    details: {
      systemOfRecord: "Salesforce CRM / SAP KNA1",
      sapTable: "KNA1 (Customer Master)",
      dualRoleSell: "$1,120,000 / yr (AR Receivables)",
      description: "Receivables account for Calibration Chips (`MAT_CHIP_902`) shipped to SwissOptics. Collateral source for AR netting."
    }
  },
  {
    id: "master_zeiss",
    label: "Carl Zeiss Optronics CH",
    sublabel: "Vendor VEND_CH_8801 (Secondary)",
    type: "master_record",
    zoomLevel: 2,
    x: 400,
    y: 400,
    category: "Qualified Secondary Vendor",
    status: "optimal",
    details: {
      systemOfRecord: "SAP LFA1 / Teamcenter PLM",
      sapTable: "LFA1 / QPL Approved",
      description: "Pre-qualified secondary optical lens supplier with 4,500 units in stock for emergency PO rerouting."
    }
  },
  {
    id: "master_alloytech",
    label: "AlloyTech US",
    sublabel: "Vendor VEND_US_8009",
    type: "master_record",
    zoomLevel: 2,
    x: 750,
    y: 280,
    category: "US Supplier",
    status: "optimal",
    details: {
      systemOfRecord: "SAP LFA1",
      description: "US supplier of Cobalt Sensor Assemblies available for emergency rerouting during Hormuz shipping closures."
    }
  },

  // LEVEL 3: MICRO SAP DATABASE TABLES & VOUCHERS
  {
    id: "doc_inv_10002841",
    label: "Invoice 10002841",
    sublabel: "BSEG-BELNR = 10002841 ($450,000)",
    type: "document",
    zoomLevel: 3,
    x: 320,
    y: 260,
    category: "AP Voucher",
    status: "blocked",
    details: {
      systemOfRecord: "SAP BSEG Table",
      sapTable: "BSEG (Accounting Segment)",
      openInvoices: "$450,000.00 (Due in 3 Days)",
      fields: ["BELNR = 10002841", "DMBTR = $450,000.00", "ZLSPR = A (Blocked for Payment)", "LIFNR = VEND_CH_9002"],
      description: "Target invoice voucher flagged by ARIA for BEC wire fraud hold via BAPI_ACC_DOCUMENT_POST."
    }
  },
  {
    id: "doc_inv_10002990",
    label: "Invoice 10002990",
    sublabel: "BSEG-BELNR = 10002990 ($180,000)",
    type: "document",
    zoomLevel: 3,
    x: 280,
    y: 350,
    category: "AP Voucher",
    status: "normal",
    details: {
      systemOfRecord: "SAP BSEG Table",
      sapTable: "BSEG",
      openInvoices: "$180,000.00 (Due in 14 Days)",
      fields: ["BELNR = 10002990", "DMBTR = $180,000.00", "ZLSPR = [Blank]"],
      description: "Secondary pending AP invoice from SwissOptics."
    }
  },
  {
    id: "doc_sweep04",
    label: "Proposal SWEEP04",
    sublabel: "F110 Intercompany Wire ($5.0M)",
    type: "document",
    zoomLevel: 3,
    x: 680,
    y: 220,
    category: "Treasury Proposal",
    status: "optimal",
    details: {
      systemOfRecord: "SAP ACDOCA / F110",
      sapTable: "ACDOCA / BSEG (MWSKZ = I0)",
      description: "Intercompany wire proposal transferring $5.0M from SG-30 to US-20 to eliminate 8.2% debt line."
    }
  },
  {
    id: "mat_cobalt",
    label: "Cobalt Sensor Board",
    sublabel: "MARC-MATNR = MAT_COB_4019",
    type: "master_record",
    zoomLevel: 3,
    x: 480,
    y: 340,
    category: "Material Master",
    status: "warning",
    details: {
      systemOfRecord: "SAP MARC / MARD",
      sapTable: "MARC (Plant Data) / MARD (Storage Bins)",
      fields: ["MATNR = MAT_COB_4019", "WERKS = PLANT_DE_10", "LABST = 1,200 units (12 Days Stock)"],
      description: "Critical material component facing 12-day stock depletion due to Strait of Hormuz logistics shutdown."
    }
  }
];

export const APS_EDGES: GraphEdge[] = [
  // LEVEL 1 EDGES
  {
    id: "edge_dnb_tprm",
    source: "sys_dnb",
    target: "master_swissoptics",
    label: "Cyber Threat Flag",
    type: "DATA_FEED",
    zoomLevel: 1,
    status: "hazard",
    scenarios: ["swissoptics-tprm"]
  },
  {
    id: "edge_sap_de",
    source: "sys_sap",
    target: "org_aether_de",
    label: "HQ Ledger Host",
    type: "OWNS_ORG",
    zoomLevel: 1
  },
  {
    id: "edge_sap_treasury",
    source: "sys_sap",
    target: "sys_treasury",
    label: "Intercompany Pool",
    type: "DATA_FEED",
    zoomLevel: 1,
    scenarios: ["global-treasury-sweep"]
  },
  {
    id: "edge_salesforce_cust",
    source: "sys_salesforce",
    target: "master_swissoptics_cust",
    label: "AR Revenue Contract",
    type: "REVERSE_SELL",
    zoomLevel: 1,
    scenarios: ["swissoptics-tprm"]
  },

  // LEVEL 2 EDGES (Org & Masters)
  {
    id: "edge_swiss_de_buy",
    source: "master_swissoptics",
    target: "org_aether_de",
    label: "AP Buy ($4.25M/yr)",
    type: "SUPPLIES_TO",
    zoomLevel: 2,
    status: "blocked",
    scenarios: ["swissoptics-tprm"]
  },
  {
    id: "edge_de_swiss_sell",
    source: "org_aether_de",
    target: "master_swissoptics_cust",
    label: "AR Sell ($1.12M/yr)",
    type: "REVERSE_SELL",
    zoomLevel: 2,
    status: "netted",
    scenarios: ["swissoptics-tprm"]
  },
  {
    id: "edge_zeiss_reroute",
    source: "master_zeiss",
    target: "org_aether_de",
    label: "Secondary Qualified Supply",
    type: "REROUTE_PATH",
    zoomLevel: 2,
    status: "rerouted",
    scenarios: ["swissoptics-tprm"]
  },
  {
    id: "edge_sg_us_sweep",
    source: "org_aether_sg",
    target: "org_aether_us",
    label: "Intercompany Sweep ($5.0M)",
    type: "DATA_FEED",
    zoomLevel: 2,
    scenarios: ["global-treasury-sweep"]
  },
  {
    id: "edge_sg_de_supply",
    source: "org_aether_sg",
    target: "org_aether_de",
    label: "Cobalt Board Shipping",
    type: "SUPPLIES_TO",
    zoomLevel: 2,
    status: "hazard",
    scenarios: ["strait-of-hormuz"]
  },
  {
    id: "edge_alloytech_reroute",
    source: "master_alloytech",
    target: "org_aether_de",
    label: "US Reroute (5,000 units)",
    type: "REROUTE_PATH",
    zoomLevel: 2,
    status: "rerouted",
    scenarios: ["strait-of-hormuz"]
  },

  // LEVEL 3 EDGES (Micro Vouchers & Tables)
  {
    id: "edge_swiss_inv2841",
    source: "master_swissoptics",
    target: "doc_inv_10002841",
    label: "Voucher 10002841",
    type: "ISSUES_DOC",
    zoomLevel: 3,
    status: "blocked",
    scenarios: ["swissoptics-tprm"]
  },
  {
    id: "edge_swiss_inv2990",
    source: "master_swissoptics",
    target: "doc_inv_10002990",
    label: "Voucher 10002990",
    type: "ISSUES_DOC",
    zoomLevel: 3
  },
  {
    id: "edge_netting_hold",
    source: "doc_inv_10002841",
    target: "master_swissoptics_cust",
    label: "AR Netting Collateral",
    type: "NETTING_OFFSET",
    zoomLevel: 3,
    status: "netted",
    scenarios: ["swissoptics-tprm"]
  },
  {
    id: "edge_cobalt_de",
    source: "mat_cobalt",
    target: "org_aether_de",
    label: "Plant DE-10 Bin MARD",
    type: "OWNS_ORG",
    zoomLevel: 3,
    scenarios: ["strait-of-hormuz"]
  },
  {
    id: "edge_sweep04_doc",
    source: "doc_sweep04",
    target: "org_aether_us",
    label: "ACDOCA G/L Post",
    type: "ISSUES_DOC",
    zoomLevel: 3,
    scenarios: ["global-treasury-sweep"]
  }
];
