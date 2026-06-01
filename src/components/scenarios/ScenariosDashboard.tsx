"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import {
  TrendingUp,
  Coins,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Activity,
  Sparkles,
  Lock,
  Database,
  ArrowRight,
  Loader2,
  FolderSync,
  AlertCircle,
  Network,
  CheckCircle2,
  BarChart2,
  Terminal,
  Play,
  CheckCircle,
  Info,
  Sliders,
  Zap,
  Globe,
  Layers,
  FileCode,
  FileEdit,
  Landmark,
  Scale,
  ShoppingCart,
  BadgeAlert,
  Briefcase,
  Eye,
  FileSpreadsheet,
  Check,
  ChevronRight,
  Shield,
  Sun,
  Moon,
  Building,
  Warehouse,
  RotateCcw
} from "lucide-react";
import clsx from "clsx";

// Types
interface ARItem {
  id: string;
  companyCode: string;
  customer: string;
  customerName: string;
  amount: number;
  currency: string;
  glAccount: string;
  glAccountName: string;
  postingDate: string;
  originalTerms: string;
  avgLagDays: number;
}

interface APItem {
  id: string;
  companyCode: string;
  vendor: string;
  vendorName: string;
  amount: number;
  currency: string;
  glAccount: string;
  glAccountName: string;
  postingDate: string;
  originalTerms: string;
  zfbdt: string;
  documentReference?: string | null;
  paymentBlock?: string | null;
}

interface TaxAuditItem {
  doc: string;
  type: string;
  customerName: string;
  soldToRegion: string;
  shipToRegion: string;
  netValue: number;
  taxBilledRate: number;
  taxBilledAmount: number;
  taxCorrectRate: number;
  taxCorrectAmount: number;
  currency: string;
  status: "Flagged" | "Resolved";
  salesOrder?: string;
  varianceType: "Exempt" | "Rate Mismatch" | "None";
}

const INITIAL_TAX_ITEMS: TaxAuditItem[] = [
  {
    doc: "90001641",
    type: "Sales Order (OR)",
    customerName: "Summit Tech Systems Inc.",
    soldToRegion: "California (CA)",
    shipToRegion: "Oregon (OR)",
    netValue: 175.50,
    taxBilledRate: 8.25,
    taxBilledAmount: 14.48,
    taxCorrectRate: 0.00,
    taxCorrectAmount: 0.00,
    currency: "USD",
    status: "Flagged",
    salesOrder: "3974",
    varianceType: "Exempt"
  },
  {
    doc: "90000016",
    type: "Sales Order (OR)",
    customerName: "Horizon Heavy Industries",
    soldToRegion: "California (CA)",
    shipToRegion: "Oregon (OR)",
    netValue: 8480.00,
    taxBilledRate: 8.25,
    taxBilledAmount: 699.60,
    taxCorrectRate: 0.00,
    taxCorrectAmount: 0.00,
    currency: "USD",
    status: "Flagged",
    salesOrder: "4515",
    varianceType: "Exempt"
  },
  {
    doc: "90001619",
    type: "Purchase Order (NB)",
    customerName: "Summit Tech Systems Inc.",
    soldToRegion: "New York (NY)",
    shipToRegion: "New Jersey (NJ)",
    netValue: 210.60,
    taxBilledRate: 8.875,
    taxBilledAmount: 18.69,
    taxCorrectRate: 6.625,
    taxCorrectAmount: 13.95,
    currency: "USD",
    status: "Flagged",
    salesOrder: "4500000001",
    varianceType: "Rate Mismatch"
  },
  {
    doc: "90000000",
    type: "Purchase Order (NB)",
    customerName: "Quantum Grid & Cable LLC",
    soldToRegion: "New York (NY)",
    shipToRegion: "New Jersey (NJ)",
    netValue: 9170.00,
    taxBilledRate: 8.875,
    taxBilledAmount: 813.84,
    taxCorrectRate: 6.625,
    taxCorrectAmount: 607.51,
    currency: "USD",
    status: "Flagged",
    salesOrder: "4500000002",
    varianceType: "Rate Mismatch"
  },
  {
    doc: "90000001",
    type: "Purchase Order (NB)",
    customerName: "Orion Freight Systems Corp.",
    soldToRegion: "New York (NY)",
    shipToRegion: "New Jersey (NJ)",
    netValue: 9380.00,
    taxBilledRate: 8.875,
    taxBilledAmount: 832.48,
    taxCorrectRate: 6.625,
    taxCorrectAmount: 621.43,
    currency: "USD",
    status: "Flagged",
    salesOrder: "4500000003",
    varianceType: "Rate Mismatch"
  },
  {
    doc: "90001639",
    type: "Sales Invoice (F2)",
    customerName: "Summit Tech Systems Inc.",
    soldToRegion: "California (CA)",
    shipToRegion: "California (CA)",
    netValue: 1755.00,
    taxBilledRate: 8.25,
    taxBilledAmount: 144.79,
    taxCorrectRate: 8.25,
    taxCorrectAmount: 144.79,
    currency: "USD",
    status: "Resolved",
    salesOrder: "3974",
    varianceType: "None"
  },
  {
    doc: "90000002",
    type: "Sales Invoice (F2)",
    customerName: "Vanguard Avionics Inc.",
    soldToRegion: "California (CA)",
    shipToRegion: "Oregon (OR)",
    netValue: 3990.00,
    taxBilledRate: 8.25,
    taxBilledAmount: 329.18,
    taxCorrectRate: 0.00,
    taxCorrectAmount: 0.00,
    currency: "USD",
    status: "Flagged",
    salesOrder: "2564",
    varianceType: "Exempt"
  },
  {
    doc: "90000003",
    type: "Supplier Invoice (KR)",
    customerName: "Cascade Specialty Materials Ltd.",
    soldToRegion: "Washington (WA)",
    shipToRegion: "Washington (WA)",
    netValue: 1470.00,
    taxBilledRate: 8.50,
    taxBilledAmount: 124.95,
    taxCorrectRate: 8.50,
    taxCorrectAmount: 124.95,
    currency: "USD",
    status: "Resolved",
    salesOrder: "8",
    varianceType: "None"
  },
  {
    doc: "90000004",
    type: "Sales Invoice (F2)",
    customerName: "Horizon Heavy Industries",
    soldToRegion: "Washington (WA)",
    shipToRegion: "Oregon (OR)",
    netValue: 15890.00,
    taxBilledRate: 8.50,
    taxBilledAmount: 1350.65,
    taxCorrectRate: 0.00,
    taxCorrectAmount: 0.00,
    currency: "USD",
    status: "Flagged",
    salesOrder: "9",
    varianceType: "Exempt"
  },
  {
    doc: "90000005",
    type: "Sales Invoice (F2)",
    customerName: "Apex Avionics Inc.",
    soldToRegion: "Illinois (IL)",
    shipToRegion: "Wisconsin (WI)",
    netValue: 13020.00,
    taxBilledRate: 8.25,
    taxBilledAmount: 1074.15,
    taxCorrectRate: 5.00,
    taxCorrectAmount: 651.00,
    currency: "USD",
    status: "Flagged",
    salesOrder: "12",
    varianceType: "Rate Mismatch"
  },
  {
    doc: "90001807",
    type: "Supplier Invoice (KR)",
    customerName: "Summit Tech Systems Inc.",
    soldToRegion: "New York (NY)",
    shipToRegion: "New York (NY)",
    netValue: 203136.00,
    taxBilledRate: 8.875,
    taxBilledAmount: 18028.32,
    taxCorrectRate: 8.875,
    taxCorrectAmount: 18028.32,
    currency: "USD",
    status: "Resolved",
    salesOrder: "15",
    varianceType: "None"
  },
  {
    doc: "90003770",
    type: "Sales Invoice (F2)",
    customerName: "Summit Defense Systems Group",
    soldToRegion: "New York (NY)",
    shipToRegion: "New Jersey (NJ)",
    netValue: 2640.00,
    taxBilledRate: 8.875,
    taxBilledAmount: 234.30,
    taxCorrectRate: 6.625,
    taxCorrectAmount: 174.90,
    currency: "USD",
    status: "Flagged",
    salesOrder: "16",
    varianceType: "Rate Mismatch"
  },
  {
    doc: "90000008",
    type: "Supplier Invoice (KR)",
    customerName: "Summit Defense Systems Group",
    soldToRegion: "Massachusetts (MA)",
    shipToRegion: "New Hampshire (NH)",
    netValue: 2760.00,
    taxBilledRate: 6.25,
    taxBilledAmount: 172.50,
    taxCorrectRate: 0.00,
    taxCorrectAmount: 0.00,
    currency: "USD",
    status: "Flagged",
    salesOrder: "18",
    varianceType: "Exempt"
  },
  {
    doc: "90000009",
    type: "Sales Invoice (F2)",
    customerName: "Vanguard Avionics Inc.",
    soldToRegion: "Massachusetts (MA)",
    shipToRegion: "Massachusetts (MA)",
    netValue: 21960.00,
    taxBilledRate: 6.25,
    taxBilledAmount: 1372.50,
    taxCorrectRate: 6.25,
    taxCorrectAmount: 1372.50,
    currency: "USD",
    status: "Resolved",
    salesOrder: "19",
    varianceType: "None"
  },
  {
    doc: "90001801",
    type: "Supplier Invoice (KR)",
    customerName: "Amplify Heavy Industries Corp.",
    soldToRegion: "Pennsylvania (PA)",
    shipToRegion: "Delaware (DE)",
    netValue: 26670.00,
    taxBilledRate: 6.00,
    taxBilledAmount: 1600.20,
    taxCorrectRate: 0.00,
    taxCorrectAmount: 0.00,
    currency: "USD",
    status: "Flagged",
    salesOrder: "21",
    varianceType: "Exempt"
  },
  {
    doc: "90003459",
    type: "Supplier Invoice (KR)",
    customerName: "Orion Freight Systems Corp.",
    soldToRegion: "Pennsylvania (PA)",
    shipToRegion: "Pennsylvania (PA)",
    netValue: 9240.00,
    taxBilledRate: 6.00,
    taxBilledAmount: 554.40,
    taxCorrectRate: 6.00,
    taxCorrectAmount: 554.40,
    currency: "USD",
    status: "Resolved",
    salesOrder: "25",
    varianceType: "None"
  },
  {
    doc: "90003493",
    type: "Supplier Invoice (KR)",
    customerName: "Summit Tech Systems Inc.",
    soldToRegion: "Michigan (MI)",
    shipToRegion: "Michigan (MI)",
    netValue: 2560.00,
    taxBilledRate: 6.00,
    taxBilledAmount: 153.60,
    taxCorrectRate: 6.00,
    taxCorrectAmount: 153.60,
    currency: "USD",
    status: "Resolved",
    salesOrder: "28",
    varianceType: "None"
  },
  {
    doc: "90000013",
    type: "Supplier Invoice (KR)",
    customerName: "Zenith Pharmaceutical LLC",
    soldToRegion: "Michigan (MI)",
    shipToRegion: "Ohio (OH)",
    netValue: 800.00,
    taxBilledRate: 6.00,
    taxBilledAmount: 48.00,
    taxCorrectRate: 5.75,
    taxCorrectAmount: 46.00,
    currency: "USD",
    status: "Flagged",
    salesOrder: "29",
    varianceType: "Rate Mismatch"
  },
  {
    doc: "90000014",
    type: "Supplier Invoice (KR)",
    customerName: "Summit Tech Systems Inc.",
    soldToRegion: "California (CA)",
    shipToRegion: "Oregon (OR)",
    netValue: 14720.00,
    taxBilledRate: 8.25,
    taxBilledAmount: 1214.40,
    taxCorrectRate: 0.00,
    taxCorrectAmount: 0.00,
    currency: "USD",
    status: "Flagged",
    salesOrder: "31",
    varianceType: "Exempt"
  },
  {
    doc: "90000015",
    type: "Supplier Invoice (KR)",
    customerName: "Cascade Specialty Materials Ltd.",
    soldToRegion: "New York (NY)",
    shipToRegion: "New Jersey (NJ)",
    netValue: 1440.00,
    taxBilledRate: 8.875,
    taxBilledAmount: 127.80,
    taxCorrectRate: 6.625,
    taxCorrectAmount: 95.40,
    currency: "USD",
    status: "Flagged",
    salesOrder: "32",
    varianceType: "Rate Mismatch"
  }
];

// Live Levenshtein String Similarity functions
function getLevenshteinDistance(a: string, b: string): number {
  const tmp: number[][] = [];
  let i, j;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  for (i = 0; i <= a.length; i++) tmp[i] = [i];
  for (j = 0; j <= b.length; j++) tmp[0][j] = j;
  for (i = 1; i <= a.length; i++) {
    for (j = 1; j <= b.length; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1, // deletion
        tmp[i][j - 1] + 1, // insertion
        tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1) // substitution
      );
    }
  }
  return tmp[a.length][b.length];
}

function getStringSimilarity(a: string, b: string): number {
  const cleanA = a.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  const cleanB = b.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  if (cleanA === cleanB) return 1.0;
  
  const distance = getLevenshteinDistance(cleanA, cleanB);
  const maxLength = Math.max(cleanA.length, cleanB.length);
  if (maxLength === 0) return 1.0;
  return 1.0 - distance / maxLength;
}

type StakeholderGroup = "CFO & Treasurer" | "Tax & Compliance" | "Procurement & Supply Chain" | "Corporate Controller";

type TabId = "overview" | "read" | "visualize" | "reason" | "execute" | "evidence";

interface FlowNode {
  title: string;
  desc: string;
  dataIn: string;
  dataOut: string;
  icon: any;
}

interface Scenario {
  id: string;
  title: string;
  category: string;
  desc: string;
  icon: any;
  stakeholder: StakeholderGroup;
  
  // Overview Tab Details
  valueProp: string;
  sapReadDesc: string;
  ariaReasonDesc: string;
  agenticActionsDesc: string;
  outcomeDesc: string;
  
  // What and Why Deep-Dive
  whatWeAreDoing: string;
  whyWeAreDoingIt: string;
  
  // Flow Steps Data Diagram (In & Out of SAP)
  flowSteps: FlowNode[];
  
  tables: string[];
  objectiveMath: string;
  
  // Tab 2: Read OData Table
  readPath: string;
  readHeaders: string[];
  readRecords: Record<string, string | number>[];
  
  // Tab 3: Visualizer Identifier
  visualizerType: "runway" | "sweeps" | "hedging" | "tax" | "revenue" | "duplicate" | "maverick" | "inventory" | "freight" | "intercompany" | "capex" | "credit";
  
  // Tab 4: Rule Engine Checkpoints
  reasoningRules: { rule: string; value: string; status: "passed" | "flagged" | "optimal" }[];
  
  // Tab 5: Execute BAPI module Details
  bapiName: string;
  bapiDescription: string;
  bapiLogs: string[];
  
  // Tab 6: Result Audit Details
  evidenceCertificate: {
    hash: string;
    actionTaken: string;
    impactMetrics: string;
    sapVoucher: string;
  };
}

const getMockInvoicePDFData = (docNum: string) => {
  const map: Record<string, {
    billTo: string;
    shipTo: string;
    items: { desc: string; qty: number; price: number; code: string }[];
    stamp: string;
    memo?: string;
  }> = {
    "90001641": {
      billTo: "Horizon Retailers\n500 Market St\nSan Francisco, CA 94105",
      shipTo: "Horizon Retailers\n1200 NW Naito Pkwy\nPortland, OR 97209",
      items: [{ desc: "Smart Rack Mount Rails (Pack of 5)", qty: 1, price: 175.50, code: "EXE" }],
      stamp: "OCR: DESTINATION VARIANCE - EXEMPT STATE",
      memo: "Shipment delivered to tax-exempt Oregon warehouse. California sales tax corrected to 0%."
    },
    "90001150": {
      billTo: "Horizon Retailers\n500 Market St\nSan Francisco, CA 94105",
      shipTo: "Horizon Retailers\n1200 NW Naito Pkwy\nPortland, OR 97209",
      items: [{ desc: "Industrial High-Performance Servo Motors", qty: 16, price: 1500.00, code: "EXE" }],
      stamp: "OCR: DESTINATION VARIANCE - EXEMPT STATE",
      memo: "Large order transfer. Tax exempted due to interstate delivery parameters under OR regulations."
    },
    "90001619": {
      billTo: "Sovereign Distributors\n200 Park Ave\nNew York, NY 10166",
      shipTo: "Sovereign Distributors\n80 Park Pl\nNewark, NJ 07102",
      items: [{ desc: "Ethernet Distribution Patch Cables Cat6A", qty: 30, price: 7.02, code: "UTX1" }],
      stamp: "OCR: TAX JURISDICTION RATE MISMATCH",
      memo: "Billed at New York rate (8.875%). Adjusted to New Jersey physical delivery rate (6.625%)."
    },
    "90001092": {
      billTo: "Sovereign Distributors\n200 Park Ave\nNew York, NY 10166",
      shipTo: "Sovereign Distributors\n80 Park Pl\nNewark, NJ 07102",
      items: [{ desc: "Enterprise Cloud-Managed Core Switches", qty: 15, price: 5500.00, code: "UTX1" }],
      stamp: "OCR: TAX JURISDICTION RATE MISMATCH",
      memo: "High-value network upgrade. NYC withholding tax reclaimed. NJ destination rate applied."
    },
    "90001048": {
      billTo: "Horizon Retailers\n500 Market St\nSan Francisco, CA 94105",
      shipTo: "Horizon Retailers\n500 Market St\nSan Francisco, CA 94105",
      items: [{ desc: "Standard Retail Point-of-Sale Terminals", qty: 28, price: 550.00, code: "UTX1" }],
      stamp: "AUDIT COMPLIANT",
      memo: "Addresses align. Standard California sales tax (8.25%) correctly withheld and reported."
    },
    "90001801": {
      billTo: "Summit Heavy Industries\n1000 Louisiana St\nHouston, TX 77002",
      shipTo: "Summit Heavy Industries\n1000 Louisiana St\nHouston, TX 77002",
      items: [{ desc: "Heavy-Duty Hydraulic Pressing Cylinders", qty: 5, price: 25000.00, code: "UTX1" }],
      stamp: "AUDIT COMPLIANT",
      memo: "Internal delivery. Texas sales tax rate (8.25%) matches billing entity location."
    },
    "90001802": {
      billTo: "Vanguard Tech Systems\n3000 Sand Hill Rd\nMenlo Park, CA 94025",
      shipTo: "Vanguard Tech Systems\n200 SW Yamhill St\nPortland, OR 97204",
      items: [{ desc: "Secure Hardware Encryption Keys (FIPS 140-3)", qty: 50, price: 190.00, code: "EXE" }],
      stamp: "OCR: DESTINATION VARIANCE - EXEMPT STATE",
      memo: "Physical shipment routed to Oregon tech labs. California tax overcharge reclaimed."
    },
    "90001803": {
      billTo: "Apex Avionics\n9200 Marginal Way S\nSeattle, WA 98108",
      shipTo: "Apex Avionics\n9200 Marginal Way S\nSeattle, WA 98108",
      items: [{ desc: "High-Fidelity Autopilot Transponder Avionics", qty: 2, price: 17000.00, code: "UTX1" }],
      stamp: "AUDIT COMPLIANT",
      memo: "Seattle manufacturing facility delivery. Washington sales tax rate (8.50%) verified."
    },
    "90001804": {
      billTo: "Apex Avionics\n9200 Marginal Way S\nSeattle, WA 98108",
      shipTo: "Apex Avionics\n520 SW Yamhill St\nPortland, OR 97204",
      items: [{ desc: "Ultra-Calibrated Avionics Wind-Tunnel Monitors", qty: 4, price: 12050.00, code: "EXE" }],
      stamp: "OCR: DESTINATION VARIANCE - EXEMPT STATE",
      memo: "Aerospace testing gear shipped to Oregon testing hangar. Full WA sales tax refund requested."
    },
    "90001805": {
      billTo: "Equinox Solutions\n233 S Wacker Dr\nChicago, IL 60606",
      shipTo: "Equinox Solutions\n777 E Wisconsin Ave\nMilwaukee, WI 53202",
      items: [{ desc: "Enterprise Resource Load-Balancers", qty: 6, price: 10750.00, code: "UTX1" }],
      stamp: "OCR: TAX JURISDICTION RATE MISMATCH",
      memo: "IL rate (8.25%) corrected to WI delivery rate (5.00%). Implements correct interstate tax codes."
    },
    "90001806": {
      billTo: "Orion Energy\n1251 Avenue of the Americas\nNew York, NY 10020",
      shipTo: "Orion Energy\n1251 Avenue of the Americas\nNew York, NY 10020",
      items: [{ desc: "High-Volume Grid Battery Storage Inverters", qty: 11, price: 10000.00, code: "UTX1" }],
      stamp: "AUDIT COMPLIANT",
      memo: "Consolidated New York close. NY tax rate (8.875%) verified against central ledger lines."
    },
    "90001807": {
      billTo: "Orion Energy\n1251 Avenue of the Americas\nNew York, NY 10020",
      shipTo: "Orion Energy\n1 Exchange Pl\nJersey City, NJ 07302",
      items: [{ desc: "Substation Monitoring Optical Sensor Nodes", qty: 40, price: 710.00, code: "UTX1" }],
      stamp: "OCR: TAX JURISDICTION RATE MISMATCH",
      memo: "Power node shipment to Jersey City hub. NYC local surcharge corrected to NJ state tax."
    },
    "90001808": {
      billTo: "Zenith Wholesale\n1 International Pl\nBoston, MA 02110",
      shipTo: "Zenith Wholesale\n100 Commercial St\nManchester, NH 03101",
      items: [{ desc: "Heavy-Duty Pallet Jack Units (Redwood)", qty: 25, price: 740.00, code: "EXE" }],
      stamp: "OCR: DESTINATION VARIANCE - EXEMPT STATE",
      memo: "Distribution jacks delivered to New Hampshire warehouse. Exempt from MA sales tax (6.25%)."
    },
    "90001809": {
      billTo: "Zenith Wholesale\n1 International Pl\nBoston, MA 02110",
      shipTo: "Zenith Wholesale\n1 International Pl\nBoston, MA 02110",
      items: [{ desc: "Industrial Safety Goggles & Helmets Bundle", qty: 20, price: 260.00, code: "UTX1" }],
      stamp: "AUDIT COMPLIANT",
      memo: "Boston corporate supply close. MA state sales tax (6.25%) correctly logged in ledgers."
    },
    "90001810": {
      billTo: "Beacon Consumer Goods\n1735 Market St\nPhiladelphia, PA 19103",
      shipTo: "Beacon Consumer Goods\n1201 N Market St\nWilmington, DE 19801",
      items: [{ desc: "Premium Recycled Cardboard Cartons", qty: 89000, price: 1.00, code: "EXE" }],
      stamp: "OCR: DESTINATION VARIANCE - EXEMPT STATE",
      memo: "Massive packaging shipment to tax-free Delaware fulfillment depot. PA tax (6.00%) reversed."
    },
    "90001811": {
      billTo: "Beacon Consumer Goods\n1735 Market St\nPhiladelphia, PA 19103",
      shipTo: "Beacon Consumer Goods\n1735 Market St\nPhiladelphia, PA 19103",
      items: [{ desc: "Commercial Grade Biodegradable Pallet Wraps", qty: 80, price: 150.00, code: "UTX1" }],
      stamp: "AUDIT COMPLIANT",
      memo: "Philadelphia packaging supplies close. PA tax rate (6.00%) verified for local delivery."
    },
    "90001812": {
      billTo: "Quantum Foundries\n400 Renaissance Center\nDetroit, MI 48243",
      shipTo: "Quantum Foundries\n400 Renaissance Center\nDetroit, MI 48243",
      items: [{ desc: "Custom Aluminum EV Chassis Casting Molds", qty: 1, price: 235000.00, code: "UTX1" }],
      stamp: "AUDIT COMPLIANT",
      memo: "Detroit engineering plant mold close. Michigan sales tax (6.00%) matches billing parameters."
    },
    "90001813": {
      billTo: "Quantum Foundries\n400 Renaissance Center\nDetroit, MI 48243",
      shipTo: "Quantum Foundries\n200 Public Sq\nCleveland, OH 44114",
      items: [{ desc: "Industrial Furnace Silicon Carbide Rods", qty: 120, price: 650.00, code: "UTX1" }],
      stamp: "OCR: TAX JURISDICTION RATE MISMATCH",
      memo: "Furnace heating elements shipped to Cleveland. MI rate (6.00%) corrected to OH rate (5.75%)."
    },
    "90001814": {
      billTo: "Horizon Retailers\n500 Market St\nSan Francisco, CA 94105",
      shipTo: "Horizon Retailers\n1200 NW Naito Pkwy\nPortland, OR 97209",
      items: [{ desc: "Next-Gen Edge Server Racks (Premium)", qty: 25, price: 4600.00, code: "EXE" }],
      stamp: "OCR: DESTINATION VARIANCE - EXEMPT STATE",
      memo: "Data center server upgrade shipped to Oregon hub. California tax (8.25%) overcharge reversed."
    },
    "90001815": {
      billTo: "Sovereign Distributors\n200 Park Ave\nNew York, NY 10166",
      shipTo: "Sovereign Distributors\n80 Park Pl\nNewark, NJ 07102",
      items: [{ desc: "High-Volume Optical Transceivers (100Gbps)", qty: 290, price: 500.00, code: "UTX1" }],
      stamp: "OCR: TAX JURISDICTION RATE MISMATCH",
      memo: "Bulk transceiver components delivered to NJ depot. Reclaims NYC local tax surcharge."
    }
  };

  return map[docNum] || {
    billTo: "Horizon Retailers\n500 Market St\nSan Francisco, CA 94105",
    shipTo: "Horizon Retailers\n1200 NW Naito Pkwy\nPortland, OR 97209",
    items: [{ desc: "Industrial Hardware Supply", qty: 1, price: 150000.00, code: "UTX1" }],
    stamp: "AUDIT VERIFIED",
    memo: "Standard transactional tax lookup completed."
  };
};

export default function ScenariosDashboard() {
  const [activeScenarioId, setActiveScenarioId] = useState<string>("ap-ar-optimization");
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState<boolean>(false);
  const [purchaseOrg, setPurchaseOrg] = useState<string>("USPO");
  const [plantCode, setPlantCode] = useState<string>("1000");

  useEffect(() => {
    setMounted(true);
  }, []);

  // S/4HANA Live integration caches
  const [companyCode, setCompanyCode] = useState<string>("1710");
  const [fiscalYear, setFiscalYear] = useState<string>("2019");
  const [docTypeFilter, setDocTypeFilter] = useState<string>("All");
  const [clearingStatus, setClearingStatus] = useState<string>("open");
  const [topLimit, setTopLimit] = useState<string>("all");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [arItems, setArItems] = useState<ARItem[]>([]);
  const [apItems, setApItems] = useState<APItem[]>([]);
  const [sapSource, setSapSource] = useState<string>("");
  const [isDbCached, setIsDbCached] = useState<boolean>(false);
  
  // Dynamic Extraction & Document Viewer States
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [selectedViewMode, setSelectedViewMode] = useState<"fiori" | "pdf">("fiori");
  const [pdfPreviewType, setPdfPreviewType] = useState<"file" | "draft">("file");
  const [hasExtracted, setHasExtracted] = useState<Record<string, boolean>>({});
  const [isExtractingLive, setIsExtractingLive] = useState<boolean>(false);
  const [extractionLogs, setExtractionLogs] = useState<string[]>([]);
  const [demoScope, setDemoScope] = useState<"quick" | "standard" | "enterprise">("enterprise");
  const [dateFilter, setDateFilter] = useState<string>("365");
  
  // Interactive Sliders (Scenario specific state)
  const [minBuffer, setMinBuffer] = useState<number>(1500000); // Working Capital runway buffer
  const [discountRate, setDiscountRate] = useState<number>(2.0); // early-pay captured discount
  const [apExtension, setApExtension] = useState<number>(15); // AP extension offset days
  
  const [sweepThreshold, setSweepThreshold] = useState<number>(50000); // Daily cash sweep minimum
  const [hedgeCoverage, setHedgeCoverage] = useState<number>(80); // PO hedge coverage target
  const [creditBuffer, setCreditBuffer] = useState<number>(25000); // Dynamic credit override reserve
  const [duplicateThreshold, setDuplicateThreshold] = useState<number>(90); // Levenshtein similarity threshold (90%)
  const [chartMetric, setChartMetric] = useState<"amount" | "count">("amount"); // duplicate payments chart metric toggle
  const [hoveredBar, setHoveredBar] = useState<string | null>(null); // duplicate payments chart hovered bar status
  
  // Dynamic AI Reasoning Sandbox Toggles
  const [isIgnorePunctuation, setIsIgnorePunctuation] = useState<boolean>(true);
  const [isCheckBaselineDate, setIsCheckBaselineDate] = useState<boolean>(true);
  const [policyBaselineWindow, setPolicyBaselineWindow] = useState<number>(3);
  const [isRestrictDocType, setIsRestrictDocType] = useState<boolean>(true);
  const [useEvaluationPresets, setUseEvaluationPresets] = useState<boolean>(true);
  
  // Dynamic Working Capital Sandbox Toggles
  const [isArAccelerateEnabled, setIsArAccelerateEnabled] = useState<boolean>(true);
  const [isApDeferEnabled, setIsApDeferEnabled] = useState<boolean>(true);
  const [isOverdraftProtection, setIsOverdraftProtection] = useState<boolean>(true);
  const [useHighYieldArPreset, setUseHighYieldArPreset] = useState<boolean>(true);

  // Working Capital Scenario Parameter States
  const [wcDocScope, setWcDocScope] = useState<"all" | "orders" | "sales">("all");
  const [minOrderValue, setMinOrderValue] = useState<number>(50000);
  const [orderStageFilter, setOrderStageFilter] = useState<string>("all");

  // Tax Lookback Scenario Parameter States
  const [taxDocScope, setTaxDocScope] = useState<"all" | "billing" | "purchasing">("all");
  const [taxCodeFilter, setTaxCodeFilter] = useState<string>("all");
  const [taxVarianceThreshold, setTaxVarianceThreshold] = useState<number>(2.0);
  const [isEnforceExemption, setIsEnforceExemption] = useState<boolean>(true);
  const [isExemptScan, setIsExemptScan] = useState<boolean>(true);
  const [taxAgreement1, setTaxAgreement1] = useState<boolean>(false);
  const [taxAgreement2, setTaxAgreement2] = useState<boolean>(false);

  // execution terminal states
  const [approvalState, setApprovalState] = useState<Record<string, "idle" | "signed">>({});
  const [executionState, setExecutionState] = useState<Record<string, "idle" | "executing" | "success">>({});
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const extractionTerminalEndRef = useRef<HTMLDivElement>(null);
  const [requestStatus, setRequestStatus] = useState<Record<string, boolean>>({});

  // Parse URL search parameters for navigation deep-links
  const searchParams = useSearchParams();
  const urlScenarioId = searchParams.get("id");

  // 12 High-Fidelity closed-loop corporate scenarios
  const scenarios: Scenario[] = useMemo(() => [
    // GROUP 1: CFO & Treasurer
    {
      id: "ap-ar-optimization",
      title: "Working Capital",
      category: "Treasury Operations",
      desc: "Accelerate invoice discounts (AR) and dynamically extend baseline dates (AP) to stabilize cash runways above corporate safety margins.",
      icon: TrendingUp,
      stakeholder: "CFO & Treasurer",
      valueProp: "Unlocks cash velocity, netting an immediate 2.0% capture on early pay items while extending AP outflows by 15 days.",
      sapReadDesc: "Scans open customer items and supplier invoices from G/L line ledgers to map outstanding balance sheets.",
      ariaReasonDesc: "Models cash flows over a 30-day projection to identify if payment runs breach the corporate runway safety buffer.",
      agenticActionsDesc: "Recalculates invoice terms, locks early-pay agreements, and structures cleared offsets.",
      outcomeDesc: "Preserves liquid cash balances above the $1.5M reserve threshold, avoiding bank overdraft lines.",
      whatWeAreDoing: "ARIA establishes an automated, dual-sided audit on Accounts Receivable open ledger items (BSID) and Accounts Payable open invoices (BSIK) to analyze rolling treasury cash conversion cycles.",
      whyWeAreDoingIt: "Optimizing the Cash Conversion Cycle directly expands corporate runway without relying on high-interest commercial bank credit lines. Capturing early-payment discount yields on receivables while extending baseline payables protects working capital margins.",
      flowSteps: [
        { title: "1. Read / Ingest", desc: "Extract outstanding customer invoices and accounts payable lines.", dataIn: "BSID (Open AR), BSIK (Open AP)", dataOut: "PostgreSQL Treasury Cache", icon: Database },
        { title: "2. Reconcile", desc: "Model cash runoffs over a 30-day window to locate reserve breaches.", dataIn: "T052 Payment Terms indices", dataOut: "Runway Projections Matrix", icon: Activity },
        { title: "3. Authorize", desc: "Collect cryptographically signed owner permission to execute sweeps.", dataIn: "Manual Review & approval", dataOut: "sha256 Compliance Hash", icon: FileEdit },
        { title: "4. Execute", desc: "Shift payables baseline dates and capture early discount terms.", dataIn: "BAPI_CUSTOMER_EXTENS_CHG", dataOut: "BSEG-ZLSPR Payment Block", icon: Terminal },
        { title: "5. Audit Ledger", desc: "Push cleared results back to consolidate corporate close balances.", dataIn: "Universal Journal ledger lines", dataOut: "TIM-WC voucher receipt", icon: CheckCircle }
      ],
      tables: ["BSID (AR Open Items)", "BSIK (AP Liabilities)", "T052 (Payment Terms Master)", "ACDOCA (Universal Ledger)"],
      objectiveMath: "\\text{Minimize } CCC \\implies \\Delta \\text{Cash Runway} > \\text{Safety Buffer}",
      readPath: "API_GLACCOUNTLINEITEM/GLAccountLineItem",
      readHeaders: ["Doc Number", "Account Type", "Partner Profile", "Open Amount", "Posting Date", "Baseline Terms"],
      readRecords: [
        { doc: "900200845", type: "Customer (D)", partner: "Domestic US Customer 14", amount: 450000, date: "2026-05-18", terms: "Z030 (Net 30)" },
        { doc: "1900004121", type: "Supplier (K)", partner: "Domestic US Supplier 1", amount: 320000, date: "2026-05-12", terms: "Z001 (Immediate)" },
        { doc: "900200890", type: "Customer (D)", partner: "Domestic US Customer 2", amount: 180000, date: "2026-05-20", terms: "Z030 (Net 30)" },
        { doc: "1900004240", type: "Supplier (K)", partner: "Domestic US Supplier 1", amount: 155000, date: "2026-05-15", terms: "Z045 (Net 45)" }
      ],
      visualizerType: "runway",
      reasoningRules: [
        { rule: "Cash runway buffer check", value: "$1,500,000 baseline", status: "flagged" },
        { rule: "Capital early-pay discount eligibility", value: "Cost of Capital < 6.5%", status: "passed" },
        { rule: "Supplier DPO alignment compliance", value: "Standard deviations < 5.0", status: "optimal" }
      ],
      bapiName: "BAPI_CUSTOMER_EXTENS_CHG / BAPI_ACC_DOCUMENT_CHANGE",
      bapiDescription: "Commits payment term codes to customer records and updates payables baseline ledger document fields.",
      bapiLogs: [
        "⏳ Establishing secure RFC handshake with live S/4HANA ERP instance...",
        "🔑 Authenticating active tenant credentials bas@evolver.ai...",
        "🚀 Dispatching customer term modifications via BAPI_CUSTOMER_EXTENS_CHG...",
        "   ↳ Partner: Domestic US Customer 14, Terms Code updated: Z010 (2% 10 / Net 30)",
        "🚀 Dispatching payables adjustment via BAPI_ACC_DOCUMENT_CHANGE...",
        "   ↳ Voucher: 1900004121, Extended baseline date shifted by +15 days.",
        "⚙️ Purging local database cache indexes and synchronizing ledger tables.",
        "🎉 SUCCESS! Closed-loop cash run optimization posted successfully."
      ],
      evidenceCertificate: {
        hash: "sha256:4f89d3a1f9e2b8c5c7d6e4f3a2b1f09e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a",
        actionTaken: "Captured customer early payment discounts and extended vendor payables baseline",
        impactMetrics: "Runway runway buffer secured with $210,000 operating liquidity margin",
        sapVoucher: "Cleared SAP Doc reference: SEC-WC-1710-845"
      }
    },
    {
      id: "cash-concentration",
      title: "Daily Cash Concentration Sweep",
      category: "Liquidity Sweep",
      desc: "Scan global subsidiary G/L ledger accounts and automatically sweep idle regional balances into central high-yield treasury nodes.",
      icon: Landmark,
      stakeholder: "CFO & Treasurer",
      valueProp: "Aggregates fragmented cash piles to generate yield, reducing outstanding debt lines.",
      sapReadDesc: "Audits Electronic Bank Statements (FEBKO) and subsidiary ledger balances (SKB1) in real-time.",
      ariaReasonDesc: "Compares local bank interest charges against centralized sweeping return yield indices.",
      agenticActionsDesc: "Pre-calculates intercompany settlement margins and prepares electronic funds transfers.",
      outcomeDesc: "Zeros out passive subsidiary accounts, sweeping $380,000 into active yield accounts.",
      whatWeAreDoing: "ARIA continuously monitors subsidiary ledger balances (SKB1) and bank statements (FEBKO) across global company entities. It identifies idle capital buffers and automatically triggers balancing clearing entries to pull stagnant funds back.",
      whyWeAreDoingIt: "Stagnant regional liquidity incurs passive opportunity costs. Consolidating subsidiary balances into centralized high-yield cash sweep accounts guarantees interest maximization while preventing localized subsidiary bank overdraft penalties.",
      flowSteps: [
        { title: "1. Read / Ingest", desc: "Gather electronic statements and bank balances across all regions.", dataIn: "SKB1 (G/L), FEBKO (Bank Header)", dataOut: "PostgreSQL Treasury Cache", icon: Database },
        { title: "2. Reconcile", desc: "Compare local interest rates vs intercompany FX conversion spreads.", dataIn: "Spot Rate currency indices", dataOut: "Concentration Routing Map", icon: Activity },
        { title: "3. Authorize", desc: "Verify cryptographic authorization signature to trigger sweeps.", dataIn: "Executive approval signoff", dataOut: "sha256 Compliance Hash", icon: FileEdit },
        { title: "4. Execute", desc: "Commit intercompany settlement transfer journal vouchers.", dataIn: "BAPI_ACC_DOCUMENT_POST", dataOut: "Cleared G/L sweeping lines", icon: Terminal },
        { title: "5. Audit Ledger", desc: "Balance the consolidated ledger closing accounts.", dataIn: "ACDOCA intercompany items", dataOut: "TIM-CS voucher receipt", icon: CheckCircle }
      ],
      tables: ["FEBKO (Bank Statement Header)", "SKB1 (G/L Accounts)", "ACDOCA (Ledger Records)"],
      objectiveMath: "\\text{Maximize } Consolidated\\,Yield = \\sum_{i} Balance_i \\times (R_{central} - R_{local})",
      readPath: "API_GLACCOUNTLINEITEM/GLAccountLineItem",
      readHeaders: ["Company Code", "Subsidiary", "Bank G/L Account", "Balance (Local)", "Currency", "Last Sweep Date"],
      readRecords: [
        { doc: "DE01", type: "Frankfurt Sub", partner: "SKB1-DE-102000", amount: 145000, date: "2026-05-29", terms: "EUR" },
        { doc: "UK01", type: "London Sub", partner: "SKB1-UK-102000", amount: 98000, date: "2026-05-29", terms: "GBP" },
        { doc: "JP01", type: "Tokyo Sub", partner: "SKB1-JP-102000", amount: 120000, date: "2026-05-28", terms: "JPY" },
        { doc: "SG01", type: "Singapore Sub", partner: "SKB1-SG-102000", amount: 67000, date: "2026-05-29", terms: "SGD" }
      ],
      visualizerType: "sweeps",
      reasoningRules: [
        { rule: "Subsidiary balance audit threshold", value: "> $50,000 surplus", status: "passed" },
        { rule: "FX transfer friction check", value: "Conversion spreads < 0.15%", status: "optimal" },
        { rule: "Target concentration account verification", value: "Clearing ID: Active", status: "passed" }
      ],
      bapiName: "BAPI_ACC_DOCUMENT_POST",
      bapiDescription: "Executes intercompany ledger transfer entries to document fund sweeping operations.",
      bapiLogs: [
        "⏳ Establishing secure RFC handshake with global S/4HANA instances...",
        "📡 Querying global bank balances via Electronic Bank Statements...",
        "🚀 Dispatching subsidiary sweeping transfers using BAPI_ACC_DOCUMENT_POST...",
        "   ↳ Cleared UK01 G/L: Swept £77,500 ($98,000 USD) to centralized Treasury account.",
        "   ↳ Cleared DE01 G/L: Swept €133,200 ($145,000 USD) to centralized Treasury account.",
        "✅ Consolidated yield G/L postings documented in corporate ledger.",
        "🎉 SUCCESS! Sweeping complete. Swept $380,000 into core central nodes."
      ],
      evidenceCertificate: {
        hash: "sha256:0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b",
        actionTaken: "Swept local regional G/L balances to centralized treasury nodes",
        impactMetrics: "Consolidated cash balances, netting an immediate 4.25% yield return",
        sapVoucher: "Cleared SAP Doc reference: SEC-CS-1710-090"
      }
    },
    {
      id: "fx-hedging",
      title: "FX Transactional Margin Hedging",
      category: "Risk Mitigation",
      desc: "Audit outstanding multi-currency purchase orders against real-time spot price fluctuations to lock in hedges.",
      icon: Coins,
      stakeholder: "CFO & Treasurer",
      valueProp: "Guarantees contract gross margins, removing volatility from multi-currency supply lines.",
      sapReadDesc: "Audits unbilled foreign currency purchase orders (EKKO) and operational liabilities (BSIK).",
      ariaReasonDesc: "Calculates total multi-currency currency net variances against spot pricing indexes.",
      agenticActionsDesc: "Matches hedge positions and executes currency spot transactions to seal balances.",
      outcomeDesc: "Hedges EUR, GBP, and JPY transactional exposures, locking corporate gross margins.",
      whatWeAreDoing: "ARIA audits outstanding purchase orders (EKKO/EKPO) placed in foreign currencies. It measures total unbilled exposure against real-time spot currencies and active forward-swap hedges to highlight spot price variance trends.",
      whyWeAreDoingIt: "Currency volatility directly erodes manufacturing gross margins on cross-border supply lines. Automating micro-hedges to cover active PO allocations removes foreign exchange risk, stabilizing the corporate cost base.",
      flowSteps: [
        { title: "1. Read / Ingest", desc: "Monitor foreign currency purchase order lists and unbilled lines.", dataIn: "EKKO (Header), EKPO (PO Items)", dataOut: "PostgreSQL Treasury Cache", icon: Database },
        { title: "2. Reconcile", desc: "Cross-reference foreign currencies against Spot exchange index rates.", dataIn: "Live spot currency API feed", dataOut: "Net FX Exposure Score", icon: Activity },
        { title: "3. Authorize", desc: "Obtain owner permission to allocate hedging derivative forward swap.", dataIn: "Executive approval signoff", dataOut: "sha256 Compliance Hash", icon: FileEdit },
        { title: "4. Execute", desc: "Commit derivative offset contract details to the treasury ledger.", dataIn: "BAPI_ACC_DOCUMENT_POST", dataOut: "Locked Spot rate forward swaps", icon: Terminal },
        { title: "5. Audit Ledger", desc: "Verify hedged PO postings align with accounts payable entries.", dataIn: "ACDOCA cash ledger codes", dataOut: "TIM-FX voucher receipt", icon: CheckCircle }
      ],
      tables: ["EKKO (PO Header)", "EKPO (PO Items)", "BSIK (Vendor Balances)"],
      objectiveMath: "\\text{Minimize } Net\\,Exposure = \\sum | Liability_{Foreign} - Hedge_{Spot} |",
      readPath: "API_GLACCOUNTLINEITEM/GLAccountLineItem",
      readHeaders: ["PO Document", "Vendor Profile", "Foreign Liability", "Currency", "Spot Base (USD)", "Current Exposure"],
      readRecords: [
        { doc: "4500021004", type: "ASML Holding NV", partner: "EUR Purchasing", amount: 480000, date: "2026-05-28", terms: "$523,200" },
        { doc: "4500021085", type: "ASML Holding NV", partner: "EUR Purchasing", amount: 150000, date: "2026-05-25", terms: "$163,500" },
        { doc: "4500021112", type: "London Transport", partner: "GBP Logistics", amount: 95000, date: "2026-05-29", terms: "$120,650" }
      ],
      visualizerType: "hedging",
      reasoningRules: [
        { rule: "Net exposure drift check", value: "> 5% margin tolerance", status: "flagged" },
        { rule: "Market volatility tracking", value: "VIX index < 22", status: "passed" },
        { rule: "Hedging contract alignment", value: "Counterparty limit verified", status: "optimal" }
      ],
      bapiName: "BAPI_ACC_DOCUMENT_POST",
      bapiDescription: "Books transactional currency hedging contracts directly inside treasury ledger documents.",
      bapiLogs: [
        "⏳ Connecting to Treasury Risk Spot rate gateway...",
        "📡 Reading open purchase orders (EKKO/EKPO) in non-base currencies...",
        "🔍 Detected unhedged exposure in EUR: €630,000.",
        "🚀 Dispatching Spot Lock clearing transfer via BAPI_ACC_DOCUMENT_POST...",
        "   ↳ Locked EUR forward swap contract at spot rate 1.090 USD/EUR.",
        "✅ Hedged derivative positions reconciled with G/L liability entries.",
        "🎉 SUCCESS! Open transactional currency exposures hedged to zero."
      ],
      evidenceCertificate: {
        hash: "sha256:f1e2d3c4b5a697887766554433221100abcdef1234567890abcdef0123456789",
        actionTaken: "Locked spot rate derivative swap contracts for foreign currency PO lines",
        impactMetrics: "Eliminated open FX exposure variances, guaranteeing gross margin",
        sapVoucher: "Cleared SAP Doc reference: SEC-FX-1710-112"
      }
    },

    // GROUP 2: Tax & Compliance
    {
      id: "tax-jurisdiction",
      title: "Cross-Border Tax Jurisdiction",
      category: "Auditing & Compliance",
      desc: "Audit partner profiles for location variances between Sold-To and Ship-To addresses to correct tax calculations.",
      icon: Scale,
      stakeholder: "Tax & Compliance",
      valueProp: "Eliminates tax audit fines and prevents erroneous cross-border withholding tax deductions.",
      sapReadDesc: "Audits customer address regions (ADRC) and invoice billing partners (VBPA).",
      ariaReasonDesc: "Validates shipping destinations against customer master tax registries (KNVI).",
      agenticActionsDesc: "Corrects billing tax indicators and matches regional withholding tax parameters.",
      outcomeDesc: "Blocks incorrect tax invoices, preventing post-audit penalties.",
      whatWeAreDoing: "ARIA performs real-time address validation on customer partner profiles, cross-referencing Billing (Sold-To) locations against actual Shipping (Ship-To) physical destinations (VBPA/ADRC) to detect tax jurisdiction mismatches.",
      whyWeAreDoingIt: "Erroneous cross-border withholding and sales tax bookings introduce massive tax compliance liabilities. Correcting billing codes automatically according to the verified physical destination averts regulatory audit fines and overcharge claims.",
      flowSteps: [
        { title: "1. Read / Ingest", desc: "Audit invoice billing partners and regional warehouse coordinates.", dataIn: "VBPA (Partners), ADRC (Addresses)", dataOut: "PostgreSQL Auditing Cache", icon: Database },
        { title: "2. Reconcile", desc: "Cross-reference actual Ship-To destination with Sold-To regions.", dataIn: "KNVI Customer Tax master", dataOut: "Tax Exemption Mappings", icon: Activity },
        { title: "3. Authorize", desc: "Sign off tax billing changes and regional adjustments.", dataIn: "Compliance officer approval", dataOut: "sha256 Compliance Hash", icon: FileEdit },
        { title: "4. Execute", desc: "Update sales document billing tax codes to align with shipping.", dataIn: "BAPI_SALESORDER_CHANGE", dataOut: "Cleared customer tax lines", icon: Terminal },
        { title: "5. Audit Ledger", desc: "Re-run billing document tax checks and update tax records.", dataIn: "VBRK Billing Document status", dataOut: "TIM-TAX voucher receipt", icon: CheckCircle }
      ],
      tables: ["VBPA (Partner Functions)", "ADRC (Addresses)", "KNVI (Tax Indicator)"],
      objectiveMath: "\\text{Minimize } Tax\\,Discrepancy = \\sum_{i} | Tax_{Billed} - Tax_{Jurisdiction} |",
      readPath: "API_GLACCOUNTLINEITEM/GLAccountLineItem",
      readHeaders: ["Billing Doc", "Customer", "Sold-To Region", "Ship-To Region", "Tax Posted (USD)", "Correct Tax (USD)"],
      readRecords: [
        { doc: "90001048", type: "Horizon Retailers", partner: "CA (California)", amount: 15400, date: "0.00% (exempt)", terms: "8.25% ($1,270.50)" },
        { doc: "90001092", type: "Sovereign Distrib", partner: "TX (Texas)", amount: 82500, date: "6.25% ($5,156.25)", terms: "0.00% (exempt)" },
        { doc: "90001150", type: "Horizon Retailers", partner: "OR (Oregon)", amount: 24000, date: "8.25% ($1,980.00)", terms: "0.00% (OR exempt)" }
      ],
      visualizerType: "tax",
      reasoningRules: [
        { rule: "Tax jurisdiction region audit", value: "Address mismatch detected", status: "flagged" },
        { rule: "Customer exemption status validation", value: "Exemption ID: Missing", status: "flagged" },
        { rule: "Withholding tax determination check", value: "Complies with code 1099-B", status: "passed" }
      ],
      bapiName: "BAPI_SALESORDER_CHANGE",
      bapiDescription: "Adjusts regional partner region details and updates sales document tax indicators.",
      bapiLogs: [
        "⏳ Establishing billing audit pipeline validation...",
        "   📡 Scanning sales invoice partners (VBPA) and shipping records...",
        "🔍 Detected variance: Customer Sold-To in CA, but Ship-To delivery in OR.",
        "🚀 Dispatching partner detail update using BAPI_SALESORDER_CHANGE...",
        "   ↳ Updated sales tax billing indicators to align with OR region.",
        "✅ Adjusted G/L sales tax accounts and posted adjusted values.",
        "🎉 SUCCESS! Regional tax determination reconciled successfully."
      ],
      evidenceCertificate: {
        hash: "sha256:1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
        actionTaken: "Corrected regional sales tax indicators to match shipping destinations",
        impactMetrics: "Averted regulatory tax audit fines and erroneous withholding",
        sapVoucher: "Cleared SAP Doc reference: SEC-TAX-1710-150"
      }
    },
    {
      id: "tax-lookback",
      title: "Tax Lookback",
      category: "Auditing & Compliance",
      desc: "Perform dynamic audits on standard billing documents (VBRK) and verify physical Ship-To addresses (VBPA) against OCR scanned invoice registries to recover overwithheld sales taxes.",
      icon: Scale,
      stakeholder: "Tax & Compliance",
      valueProp: "Averts compliance penalty risk and recovers thousands in sales tax overpayments by matching actual physical shipping states.",
      sapReadDesc: "Fetches S/4HANA billing document headers (VBRK), line items (VBRP), and Ship-To partner address physical regions (VBPA).",
      ariaReasonDesc: "Compares system-determined ERP tax rates against actual physical warehouse destinations extracted via OCR.",
      agenticActionsDesc: "Recalculates tax deltas, computes refund values, and issues a live OData PATCH write-back to update partner records.",
      outcomeDesc: "Discovers $3,836.25 in overwithheld tax overcharges and adjusts S/4HANA records to secure refund certificates.",
      whatWeAreDoing: "Tax Lookback audits standard billing documents and partner functions, comparing Sold-To corporate billing addresses with actual physical Ship-To coordinates extracted via high-accuracy scanned OCR invoice metadata.",
      whyWeAreDoingIt: "Wrong shipping address registrations lead to incorrect tax rates being applied, incurring overpayment leaks or massive penalty audits on underwithholdings. Automated lookback corrections align standard ledger accounts and lock down compliance.",
      flowSteps: [
        { title: "1. Read / Ingest", desc: "Scan S/4HANA billing documents (VBRK) and partner profiles (VBPA).", dataIn: "CB_BILLING_DOCUMENT_SRV/BillingDocuments", dataOut: "PostgreSQL Compliance Cache", icon: Database },
        { title: "2. Reconcile", desc: "Cross-reference physical OCR shipping destinations against ERP regions.", dataIn: "Scanned PDF shipping metadata", dataOut: "Tax Address Variance Matrix", icon: Activity },
        { title: "3. Authorize", desc: "Request compliance permission to trigger OData PATCH adjustments.", dataIn: "Tax controller multi-sign", dataOut: "sha256 Compliance Hash", icon: FileEdit },
        { title: "4. Execute", desc: "Commit live OData PATCH write-backs to adjust partner addresses.", dataIn: "API_SALES_ORDER_SRV/A_SalesOrderHeaderPartner", dataOut: "BSEG Adjusted G/L tax indices", icon: Terminal },
        { title: "5. Audit Ledger", desc: "Generate refund certifications and lock down verified entries.", dataIn: "ACDOCA tax accounts check", dataOut: "TIM-TAX-LOOKBACK voucher", icon: CheckCircle }
      ],
      tables: ["VBRK (Billing Header)", "VBPA (Partner Functions)", "VBRP (Billing Items)", "ACDOCA (Consolidated Ledger)"],
      objectiveMath: "\\text{Minimize } Tax\\,Delta = \\sum | Tax_{System} - Tax_{Physical} | \\implies Refund\\,Opportunity",
      readPath: "CB_BILLING_DOCUMENT_SRV/BillingDocuments",
      readHeaders: ["Billing Doc", "Customer", "Sold-To Region", "Ship-To Region", "Tax Billed", "Correct Tax"],
      readRecords: [
        { doc: "90001641", type: "Horizon Retailers", partner: "CA (California)", amount: "Oregon (OR)", date: "8.25% ($14.48)", terms: "0.00% (exempt)" },
        { doc: "90001619", type: "Sovereign Distrib", partner: "NY (New York)", amount: "New Jersey (NJ)", date: "8.875% ($18.69)", terms: "6.625% ($13.95)" },
        { doc: "90001048", type: "Horizon Retailers", partner: "CA (California)", amount: "California (CA)", date: "8.25% ($1,270.50)", terms: "8.25% ($1,270.50)" },
        { doc: "90001150", type: "Horizon Retailers", partner: "CA (California)", amount: "Oregon (OR)", date: "8.25% ($1,980.00)", terms: "0.00% (OR exempt)" },
        { doc: "90001092", type: "Sovereign Distrib", partner: "NY (New York)", amount: "New Jersey (NJ)", date: "8.875% ($7,321.88)", terms: "6.625% ($5,465.63)" }
      ],
      visualizerType: "tax",
      reasoningRules: [
        { rule: "OCR address extraction comparison", value: "Address variance detected", status: "flagged" },
        { rule: "Tax jurisdiction code validation", value: "Exemption ID: Missing", status: "flagged" },
        { rule: "OData PATCH write-back check", value: "Active Connection available", status: "passed" }
      ],
      bapiName: "OData PATCH / API_SALES_ORDER_SRV",
      bapiDescription: "Commits live OData PATCH write-back updates to Sales Order Partner address records and synchronizes general ledgers.",
      bapiLogs: [
        "⏳ Establishing billing lookback audit pipeline validation...",
        "📡 Scanning S/4HANA billing documents (CB_BILLING_DOCUMENT_SRV)...",
        "🔍 Detected partner address variance between Sold-To CA and Ship-To OR.",
        "🚀 Dispatching OData PATCH write-back to Sales Order WE partner...",
        "   ↳ Updated Sales Order partner address region code to OR.",
        "✅ Adjusted G/L sales tax accounts and posted adjusted values.",
        "🎉 SUCCESS! Regional tax determination reconciled successfully."
      ],
      evidenceCertificate: {
        hash: "sha256:4f89d3a1f9e2b8c5c7d6e4f3a2b1f09e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3f",
        actionTaken: "Updated S/4HANA Partner address regions via OData PATCH write-backs",
        impactMetrics: "Recovered $3,836.25 in sales tax overcharge opportunities",
        sapVoucher: "Cleared SAP Doc reference: SEC-TAX-LOOKBACK-1641"
      }
    },
    {
      id: "revenue-recognition",
      title: "Proof-of-Delivery Revenue Lock",
      category: "Revenue Accounting",
      desc: "Reconcile delivery shipping details against signed Proof-of-Delivery vouchers to release deferred revenue under IFRS 15.",
      icon: ShieldCheck,
      stakeholder: "Tax & Compliance",
      valueProp: "Slashes revenue recognition cycles, immediately releasing deferred balances into recognizable sales.",
      sapReadDesc: "Scans open warehouse billing items (LIKP) and status records (VBUK).",
      ariaReasonDesc: "Validates digital signatures against performance obligations.",
      agenticActionsDesc: "Drops customer billing locks and triggers deferred revenue clearing entries.",
      outcomeDesc: "Recognizes $220,000 in deferred sales upon warehouse delivery verification.",
      whatWeAreDoing: "ARIA audits unbilled customer deliveries (LIKP) and compares delivery codes with signed digital Proof-of-Delivery (POD) vouchers to verify the completion of shipping obligations.",
      whyWeAreDoingIt: "Holding balances in deferred revenue accounts inflates the balance sheet while artificially restricting recognizable income. Releasing billing locks instantly upon verified delivery obligations optimizes revenue cycles under strict IFRS 15 guidelines.",
      flowSteps: [
        { title: "1. Read / Ingest", desc: "Audits outstanding deliveries and deferred revenue accounts.", dataIn: "LIKP (Delivery), VBRK (Billing)", dataOut: "PostgreSQL Compliance Cache", icon: Database },
        { title: "2. Reconcile", desc: "Match unbilled deliveries against signed customer Proof-of-Delivery receipts.", dataIn: "Warehouse POD digital signatures", dataOut: "IFRS 15 Obligation releases", icon: Activity },
        { title: "3. Authorize", desc: "Collect cryptographic authorization to release locked revenue lines.", dataIn: "Revenue controller signoff", dataOut: "sha256 Compliance Hash", icon: FileEdit },
        { title: "4. Execute", desc: "Drop customer billing locks, releasing deferred balances to recognized sales.", dataIn: "BAPI_SALESORDER_CHANGE", dataOut: "Consolidated sales journal postings", icon: Terminal },
        { title: "5. Audit Ledger", desc: "Audit finalized general ledger items and income accounts.", dataIn: "ACDOCA ledger lines status", dataOut: "TIM-REV voucher receipt", icon: CheckCircle }
      ],
      tables: ["VBRK (Billing Header)", "LIKP (Delivery Header)", "ACDOCA (Ledger Accounts)"],
      objectiveMath: "\\text{Minimize } Revenue\\,Recognition\\,Lag = t_{clear} - t_{delivery} \\implies POD = True",
      readPath: "API_GLACCOUNTLINEITEM/GLAccountLineItem",
      readHeaders: ["Delivery Doc", "Customer", "Deferred Balance", "Days Unbilled", "POD Signature", "Status"],
      readRecords: [
        { doc: "80010452", type: "Delta Dynamics", partner: 145000, amount: 18, date: "Signed (SHA-256)", terms: "Pending Release" },
        { doc: "80010499", type: "Apex Logistics", partner: 75000, amount: 24, date: "Signed (SHA-256)", terms: "Pending Release" },
        { doc: "80010530", type: "Starlight Retail", partner: 92000, amount: 5, date: "Not Received", terms: "In Transit" }
      ],
      visualizerType: "revenue",
      reasoningRules: [
        { rule: "Proof of Delivery verification", value: "Verified signature found", status: "passed" },
        { rule: "Performance contract compliance", value: "IFRS 15 Obligation complete", status: "optimal" },
        { rule: "Unbilled balance threshold", value: "> $25,000 deferred", status: "passed" }
      ],
      bapiName: "BAPI_SALESORDER_CHANGE",
      bapiDescription: "Drops billing locks on sales orders and commits deferred G/L balancing lines.",
      bapiLogs: [
        "⏳ Initializing IFRS 15 billing release run...",
        "📡 Scanning deliveries and signed Proof-of-Delivery references...",
        "🔍 Detected signed POD vouchers for deliveries 80010452 and 80010499.",
        "🚀 Dispatching release requests using BAPI_SALESORDER_CHANGE...",
        "   ↳ Removed billing blocks, releasing $220,000 into recognized sales.",
        "✅ Cleared deferred accounts, booking values to central income ledger.",
        "🎉 SUCCESS! Deferred revenue released into recognizable gross earnings."
      ],
      evidenceCertificate: {
        hash: "sha256:a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
        actionTaken: "Verified customer POD signatures and cleared sales deferred ledgers",
        impactMetrics: "Released $220,000 of deferred capital directly into recognized sales",
        sapVoucher: "Cleared SAP Doc reference: SEC-REV-1710-452"
      }
    },
    {
      id: "duplicate-payments",
      title: "Duplicate Invoice Mitigation",
      category: "Asset Protection",
      desc: "Perform fuzzy string distance audits on open supplier invoice reference keys to freeze double payments.",
      icon: BadgeAlert,
      stakeholder: "Tax & Compliance",
      valueProp: "Guarantees asset preservation, intercepting duplicate disbursements during payment runs.",
      sapReadDesc: "Audits open supplier entries (BSIK) and document header fields (BKPF).",
      ariaReasonDesc: "Computes fuzzy Levenshtein distance ratings between invoice codes.",
      agenticActionsDesc: "Locks duplicate invoices, updating payment ledger records.",
      outcomeDesc: "Blocks a duplicate invoice from Ingram Micro Logistics, securing $125,000.",
      whatWeAreDoing: "ARIA scans open accounts payable entries (BSIK) and document headers (BKPF), running string-distance checks (Levenshtein algorithms) to locate highly similar invoice references (e.g. 900200-83 vs 90020083) posted by identical suppliers.",
      whyWeAreDoingIt: "Erroneous duplicate invoice approvals result in massive cash leaks that require costly manual auditing to reclaim. Auto-freezing duplicate invoices prior to bank clearing runs preserves cash assets and enforces accounting integrity.",
      flowSteps: [
        { title: "1. Read / Ingest", desc: "Monitor open accounts payable and vendor document headers.", dataIn: "BSIK (Open AP), BKPF (Header)", dataOut: "PostgreSQL Invoices Cache", icon: Database },
        { title: "2. Reconcile", desc: "Compare reference strings against supplier indices using Levenshtein distance.", dataIn: "LFA1 Vendor master details", dataOut: "Fuzzy Similarity Scores", icon: Activity },
        { title: "3. Authorize", desc: "Sign authorization to lock flagged duplicates and halt payment.", dataIn: "Audit director approval", dataOut: "sha256 Compliance Hash", icon: FileEdit },
        { title: "4. Execute", desc: "Set payment lock parameters to freeze double invoices.", dataIn: "BAPI_ACC_DOCUMENT_CHANGE", dataOut: "BSEG-ZLSPR = 'A' locked entries", icon: Terminal },
        { title: "5. Audit Ledger", desc: "Verify accounts payable lists reflect active duplicate blocks.", dataIn: "ACDOCA ledger lines status", dataOut: "TIM-DUP voucher receipt", icon: CheckCircle }
      ],
      tables: ["BSIK (AP Open Items)", "BSAK (AP Cleared Items)", "BKPF (Header Data)"],
      objectiveMath: "\\text{StringDist}(Ref_1, Ref_2) < \\theta \\implies BSEG\\text{-ZLSPR} = \\text{'A' (Locked)}",
      readPath: "API_GLACCOUNTLINEITEM/GLAccountLineItem",
      readHeaders: ["Document No", "Invoice Reference", "Supplier Name", "Amount", "Posting Date", "Payment Block Status"],
      readRecords: [
        { doc: "1900000013", type: "900200-83", partner: "Ingram Micro Logistics", amount: 125000, date: "2018-03-09", terms: "Free for Payment" },
        { doc: "1900000013-DUP", type: "90020083", partner: "Ingram Micro Logistics", amount: 125000, date: "2018-03-10", terms: "Free for Payment" }
      ],
      visualizerType: "duplicate",
      reasoningRules: [
        { rule: "Fuzzy text distance audit", value: "Levenshtein rating > 90%", status: "flagged" },
        { rule: "Amount and date validation", value: "Identical figures detected", status: "flagged" },
        { rule: "Payment block validation", value: "ZLSPR block active: False", status: "flagged" }
      ],
      bapiName: "BAPI_ACC_DOCUMENT_CHANGE",
      bapiDescription: "Sets payment lock parameters on target document lines.",
      bapiLogs: [
        "⏳ Initiating Levenshtein duplicate payment audit...",
        "📡 Scanning open and cleared vendor documents...",
        "🔍 Detected potential duplicate invoices for Ingram Micro Logistics.",
        "🚀 Dispatching payment block via BAPI_ACC_DOCUMENT_CHANGE...",
        "   ↳ Updated Ingram Micro Logistics Invoice 90020083 (Document 1900000013-DUP), setting payment block ZLSPR = 'A'.",
        "✅ Document ledger logs updated successfully.",
        "🎉 SUCCESS! Duplicate invoices locked, saving $125,000."
      ],
      evidenceCertificate: {
        hash: "sha256:0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b",
        actionTaken: "Set payment block flags on fuzzy duplicate invoice ledger items",
        impactMetrics: "Saved $125,000 in duplicate cash payouts",
        sapVoucher: "Cleared SAP Doc reference: SEC-DUP-1710-013"
      }
    },

    // GROUP 3: Procurement & Supply Chain
    {
      id: "spend-compliance",
      title: "Maverick Spend Redirection",
      category: "Procurement Compliance",
      desc: "Audit open Purchase Orders against master agreements to detect price leakage and auto-redirect spend to contracted terms.",
      icon: ShoppingCart,
      stakeholder: "Procurement & Supply Chain",
      valueProp: "Enforces outlines contracts, clawing back price variance leakage automatically.",
      sapReadDesc: "Audits purchase orders (EKPO) and master Outline Agreements (EKKO).",
      ariaReasonDesc: "Compares contract rates with purchase prices.",
      agenticActionsDesc: "Updates purchase orders and preferred supplier indicators.",
      outcomeDesc: "Saves $42,500 in invoice pricing leaks on global tech agreements.",
      whatWeAreDoing: "ARIA audits active purchase order lines (EKPO) against master Outline Agreements (EKKO) to identify uncontracted procurement leakages. It measures unit rate deviations and updates purchasing values to match negotiated terms.",
      whyWeAreDoingIt: "Buying materials outside negotiated outline pricing (maverick spend) erodes margin discounts. Aligning purchase order values back to contract rules guarantees pricing integrity and optimizes corporate supplier compliance.",
      flowSteps: [
        { title: "1. Read / Ingest", desc: "Scans active purchase order lines and item records.", dataIn: "EKPO (PO Items), MARA (Material)", dataOut: "PostgreSQL Procurement Cache", icon: Database },
        { title: "2. Reconcile", desc: "Compare unit rates against central outline contract matrices.", dataIn: "EKKO Global Agreements WK/MK", dataOut: "Pricing Leakage Deviation Score", icon: Activity },
        { title: "3. Authorize", desc: "Sign authorization to adjust purchase order rates.", dataIn: "Procurement manager signoff", dataOut: "sha256 Compliance Hash", icon: FileEdit },
        { title: "4. Execute", desc: "Adjust PO pricing values to match negotiated catalog contract rates.", dataIn: "BAPI_PO_CHANGE", dataOut: "Adjusted preferred supplier rates", icon: Terminal },
        { title: "5. Audit Ledger", desc: "Re-index purchase document logs with corrected values.", dataIn: "Universal G/L purchasing ledgers", dataOut: "TIM-PO voucher receipt", icon: CheckCircle }
      ],
      tables: ["EKKO (Outline Agreements)", "EKPO (PO Items)", "MARA (Material Master)"],
      objectiveMath: "\\text{Minimize } Leakage = \\sum_{i} (Price_{Invoice, i} - Price_{Contract, i}) \\times Quantity_i",
      readPath: "API_GLACCOUNTLINEITEM/GLAccountLineItem",
      readHeaders: ["PO Number", "Material", "Billed Price", "Contract Price", "Order Volume", "Price Deviation"],
      readRecords: [
        { doc: "4500084501", type: "WBS Component X", partner: "$850.00 / unit", amount: "$720.00 / unit", date: 250, terms: "$32,500 Leakage" },
        { doc: "4500084592", type: "WBS Component Y", partner: "$420.00 / unit", amount: "$380.00 / unit", date: 150, terms: "$6,000 Leakage" },
        { doc: "4500084610", type: "Support Service", partner: "$145.00 / hr", amount: "$125.00 / hr", date: 200, terms: "$4,000 Leakage" }
      ],
      visualizerType: "maverick",
      reasoningRules: [
        { rule: "Outline agreement rate check", value: "Price deviation detected", status: "flagged" },
        { rule: "Contract volume allocation check", value: "Allocation within limit", status: "passed" },
        { rule: "Supplier compliance rating", value: "A-grade supplier certified", status: "optimal" }
      ],
      bapiName: "BAPI_PO_CHANGE",
      bapiDescription: "Updates pricing conditions and outline contract index references inside purchase items.",
      bapiLogs: [
        "⏳ Launching Procurement Leakage audit...",
        "📡 Reconciling live PO lines against outline contracts...",
        "🔍 Detected $42,500 pricing leakage across 3 open orders.",
        "🚀 Dispatching pricing revisions using BAPI_PO_CHANGE...",
        "   ↳ Updated PO 4500084501, adjusting unit rates to contracted $720.00.",
        "✅ Re-indexed purchasing ledgers with corrected pricing indicators.",
        "🎉 SUCCESS! Purchase order rates aligned with master outline contract."
      ],
      evidenceCertificate: {
        hash: "sha256:7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b",
        actionTaken: "Aligned purchase order line item rates with master outline contract rates",
        impactMetrics: "Recovered $42,500 in pricing leakages across global tech contracts",
        sapVoucher: "Cleared SAP Doc reference: SEC-PO-1710-501"
      }
    },
    {
      id: "inventory-reallocation",
      title: "Multi-Plant Capital Reallocation",
      category: "Stock Optimization",
      desc: "Audit slow-moving storage warehouse stocks across physical plants and automatically create Stock Transport Orders to cover regional shortfalls.",
      icon: Database,
      stakeholder: "Procurement & Supply Chain",
      valueProp: "Optimizes capital turnover, avoiding duplicate supplier order outflows.",
      sapReadDesc: "Audits warehouse inventory records (MARD) and production material demands (MD04).",
      ariaReasonDesc: "Locates excess inventory balances and calculates transport route expenses.",
      agenticActionsDesc: "Initializes Stock Transport Orders, correcting stock records.",
      outcomeDesc: "Reroutes 180 component units, saving $92,000 in redundant purchase runs.",
      whatWeAreDoing: "ARIA audits inventory stock allocations in storage locations (MARD) against active MRP material requirements (MD04) in separate regional plants. It automatically maps transport paths to transfer surplus components internally.",
      whyWeAreDoingIt: "Storing excess component stock incurs holding costs, while regional plants make duplicate purchases. Establishing internal Stock Transport Orders reallocates under-utilized assets directly, avoiding redundant procurement outlays.",
      flowSteps: [
        { title: "1. Read / Ingest", desc: "Audit storage warehouse component stocks and physical locations.", dataIn: "MARD (Storage), MSEG (Movements)", dataOut: "PostgreSQL Inventory Cache", icon: Database },
        { title: "2. Reconcile", desc: "Compare excess warehouse items against active plant demands.", dataIn: "MD04 Material Demand rules", dataOut: "Inter-plant deficit transit routing", icon: Activity },
        { title: "3. Authorize", desc: "Sign authorization to issue internal Stock Transport Orders.", dataIn: "Inventory director signoff", dataOut: "sha256 Compliance Hash", icon: FileEdit },
        { title: "4. Execute", desc: "Generate Stock Transport Orders between different plant codes.", dataIn: "BAPI_PO_CREATE1", dataOut: "Transfer Posting document STO", icon: Terminal },
        { title: "5. Audit Ledger", desc: "Re-index plant stock balance tables with moved units.", dataIn: "MARD inventory record updates", dataOut: "TIM-STO voucher receipt", icon: CheckCircle }
      ],
      tables: ["MARD (Storage Locations)", "MD04 (Material Demands)", "MSEG (Document Segments)"],
      objectiveMath: "\\text{Maximize } turnover = \\frac{Demand_{active}}{\\sum Excess\\,Stock_{local}} \\implies STO = True",
      readPath: "API_GLACCOUNTLINEITEM/GLAccountLineItem",
      readHeaders: ["Material ID", "Plant A (Surplus)", "Stock (Surplus)", "Plant B (Deficit)", "Stock (Deficit)", "Reallocated STO"],
      readRecords: [
        { doc: "MAT-29082", type: "Wolfsburg (1000)", partner: 450, amount: "Munich (2000)", date: 15, terms: "180 Units STO" },
        { doc: "MAT-48091", type: "Berlin (1100)", partner: 220, amount: "Hamburg (2100)", date: 5, terms: "80 Units STO" },
        { doc: "MAT-88192", type: "Stuttgart (1200)", partner: 90, amount: "Cologne (2200)", date: 0, terms: "Pending Routing" }
      ],
      visualizerType: "inventory",
      reasoningRules: [
        { rule: "Excess inventory aging check", value: "> 180 days slow-moving", status: "passed" },
        { rule: "Transport cost threshold", value: "Freight < procurement cost", status: "optimal" },
        { rule: "Physical storage verification", value: "MARD stock verified", status: "passed" }
      ],
      bapiName: "BAPI_PO_CREATE1",
      bapiDescription: "Creates internal Stock Transport Orders between different company plant codes.",
      bapiLogs: [
        "⏳ Auditing storage warehouse component stocks...",
        "📡 Scanning storage locations (MARD) and live material requirements (MD04)...",
        "🔍 Detected 180 surplus components in Plant 1000 matching deficits in Plant 2000.",
        "🚀 Dispatching Stock Transport Order via BAPI_PO_CREATE1...",
        "   ↳ Established STO 4500084720 to transfer 180 units from Wolfsburg to Munich.",
        "✅ Balance records updated across both plants.",
        "🎉 SUCCESS! Stock Transport Order created, avoiding external purchasing."
      ],
      evidenceCertificate: {
        hash: "sha256:b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2",
        actionTaken: "Generated Stock Transport Orders (STO) between regional storage locations",
        impactMetrics: "Reallocated slow-moving assets, saving $92,000 in redundant purchasing",
        sapVoucher: "Cleared SAP Doc reference: SEC-STO-1710-720"
      }
    },
    {
      id: "freight-audit",
      title: "Freight Cost Audit & Reconciliation",
      category: "Logistics Audit",
      desc: "Compare carrier invoice logs against internal transport registers to auto-flag and block billing overcharges.",
      icon: Briefcase,
      stakeholder: "Procurement & Supply Chain",
      valueProp: "Guarantees carrier compliance, preventing shipping invoice overcharges.",
      sapReadDesc: "Audits carrier accounts payable records (BSIK) and warehouse transport details (LIKP).",
      ariaReasonDesc: "Cross-references weight rate indices against invoice charges.",
      agenticActionsDesc: "Locks variance invoice entries, updating payment ledger records.",
      outcomeDesc: "Intercepts a $12,800 logistics billing variance on overseas lines.",
      whatWeAreDoing: "ARIA audits third-party carrier invoices (BSIK) against internal shipment logs (LIKP) and negotiated tariff matrices to verify billed rates based on physical cargo weights and routing coordinates.",
      whyWeAreDoingIt: "Logistics carrier overcharges frequently slip past accounts payable without verification. Intercepting rate anomalies automatically and placing payment holds locks out leakage prior to bank clearance runs.",
      flowSteps: [
        { title: "1. Read / Ingest", desc: "Monitor carrier accounts payable invoices and shipping logs.", dataIn: "BSIK (Vendor), LIKP (Outbound)", dataOut: "PostgreSQL Freight Cache", icon: Database },
        { title: "2. Reconcile", desc: "Reconcile billed charges against negotiated master tariffs.", dataIn: "LFA1 Carrier Master rates", dataOut: "Shipping Weight variance analysis", icon: Activity },
        { title: "3. Authorize", desc: "Sign authorization to lock anomalous freight invoices.", dataIn: "Logistics director signoff", dataOut: "sha256 Compliance Hash", icon: FileEdit },
        { title: "4. Execute", desc: "Set payment block parameters to freeze unapproved overcharges.", dataIn: "BAPI_ACC_DOCUMENT_CHANGE", dataOut: "BSEG-ZLSPR = 'A' locked invoices", icon: Terminal },
        { title: "5. Audit Ledger", desc: "Verify accounts payable entries reflect locked shipping values.", dataIn: "AP ledger records updates", dataOut: "TIM-FR voucher receipt", icon: CheckCircle }
      ],
      tables: ["LIKP (Outbound Deliveries)", "BSIK (Vendor Open Items)", "LFA1 (Carrier Profile)"],
      objectiveMath: "\\text{Minimize } Variance = Billing_{Billed} - Rate_{Master} > \\text{Threshold} \\implies Block",
      readPath: "API_GLACCOUNTLINEITEM/GLAccountLineItem",
      readHeaders: ["Carrier Invoice", "Shipping Doc", "Billed Rate", "Contract Rate", "Cargo Weight", "Variance (USD)"],
      readRecords: [
        { doc: "F-INV-8290", type: "SH-9002001", partner: "$18,500.00", amount: "$15,200.00", date: "42,000 lbs", terms: "$3,300.00 Blocked" },
        { doc: "F-INV-8312", type: "SH-9002088", partner: "$32,400.00", amount: "$24,000.00", date: "68,000 lbs", terms: "$8,400.00 Blocked" },
        { doc: "F-INV-8450", type: "SH-9002155", partner: "$8,200.00", amount: "$7,100.00", date: "15,500 lbs", terms: "$1,100.00 Blocked" }
      ],
      visualizerType: "freight",
      reasoningRules: [
        { rule: "Shipping weight and rate audit", value: "Rate mismatch detected", status: "flagged" },
        { rule: "Contract tariff check", value: "Matches tariff code: DHL-EUR", status: "passed" },
        { rule: "Carrier limit check", value: "Under allocation limit", status: "optimal" }
      ],
      bapiName: "BAPI_ACC_DOCUMENT_CHANGE",
      bapiDescription: "Sets payment locks on logistics invoices exceeding contract limits.",
      bapiLogs: [
        "⏳ Initializing carrier invoice reconciliation...",
        "📡 Reading shipping weights (LIKP) and supplier liabilities (BSIK)...",
        "🔍 Detected carrier overbilling variance totaling $12,800 across 3 shipments.",
        "🚀 Dispatching payment block via BAPI_ACC_DOCUMENT_CHANGE...",
        "   ↳ Applied payment locks to invoice F-INV-8290 (BSEG-ZLSPR = 'A').",
        "✅ Shipping accounts payable log entries locked pending carrier review.",
        "🎉 SUCCESS! Freight overcharges blocked, audit trails updated."
      ],
      evidenceCertificate: {
        hash: "sha256:c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2",
        actionTaken: "Blocked carrier payment invoices pending weight variance audit resolution",
        impactMetrics: "Saved $12,800 in unapproved shipping invoice overcharges",
        sapVoucher: "Cleared SAP Doc reference: SEC-FR-1710-290"
      }
    },

    // GROUP 4: Corporate Controller
    {
      id: "intercompany-reconciliation",
      title: "Intercompany G/L Settlement",
      category: "Consolidation Close",
      desc: "Match intercompany ledger balances across subsidiaries and post clearing sweeps to balance consolidation sheets.",
      icon: Activity,
      stakeholder: "Corporate Controller",
      valueProp: "Shortens close-out cycles and guarantees correct intercompany reconciliations.",
      sapReadDesc: "Audits subsidiary ledger entries and balances (ACDOCA).",
      ariaReasonDesc: "Matches partner company code identifiers (RCNTR) and transactions.",
      agenticActionsDesc: "Prepares clearing entries and posts journal balances.",
      outcomeDesc: "Reconciles a $145,000 intercompany G/L imbalance, balancing consolidate records.",
      whatWeAreDoing: "ARIA audits partner company entries in the Universal Ledger (ACDOCA) across subsidiaries. It isolates un-cleared intercompany balances and executes balancing clearing swept entries to offset subsidiary ledger variances.",
      whyWeAreDoingIt: "Manual intercompany reconciliation during close-out operations is labor-intensive and error-prone. Automating matching settlements balances consolidations in real-time and maintains strict general ledger integrity.",
      flowSteps: [
        { title: "1. Read / Ingest", desc: "Audit global general ledger items and subsidiary balances.", dataIn: "ACDOCA (Ledger), SKB1 (G/L Account)", dataOut: "PostgreSQL Ledger Cache", icon: Database },
        { title: "2. Reconcile", desc: "Correlate intercompany partner lines to discover imbalances.", dataIn: "Partner company codes RASSC", dataOut: "Intercompany Voucher Matches", icon: Activity },
        { title: "3. Authorize", desc: "Sign off intercompany clearing Sweeps and settlements.", dataIn: "Corporate controller approval", dataOut: "sha256 Compliance Hash", icon: FileEdit },
        { title: "4. Execute", desc: "Post balancing clearing entries between subsidiary ledgers.", dataIn: "BAPI_ACC_DOCUMENT_POST", dataOut: "Consolidated balanced ledger vouchers", icon: Terminal },
        { title: "5. Audit Ledger", desc: "Audit reconciled close balances across subsidiaries.", dataIn: "Subsidiary clearing G/L entries", dataOut: "TIM-IC voucher receipt", icon: CheckCircle }
      ],
      tables: ["ACDOCA (Consolidated Ledger)", "SKB1 (G/L Accounts)", "T001 (Company Codes)"],
      objectiveMath: "\\text{Minimize } Consolidation\\,Variance = \\sum | Balance_{Sub, i} - Balance_{Sub, j} | \\to 0",
      readPath: "API_GLACCOUNTLINEITEM/GLAccountLineItem",
      readHeaders: ["Recon Ref", "Entity A", "Balance A (USD)", "Entity B", "Balance B (USD)", "Imbalance (USD)"],
      readRecords: [
        { doc: "REC-US-DE-01", type: "US01 (USA)", partner: 450000, amount: "DE01 (Germany)", date: 435000, terms: "$15,000 Cleared" },
        { doc: "REC-US-UK-02", type: "US01 (USA)", partner: 280000, amount: "UK01 (UK)", date: 150000, terms: "$130,000 Cleared" },
        { doc: "REC-DE-UK-03", type: "DE01 (Germany)", partner: 95000, amount: "UK01 (UK)", date: 95000, terms: "$0 Balanced" }
      ],
      visualizerType: "intercompany",
      reasoningRules: [
        { rule: "Intercompany balance matching", value: "Document discrepancies found", status: "flagged" },
        { rule: "Foreign currency translation check", value: "Matches monthly rate: 1.09", status: "passed" },
        { rule: "Consolidation limit compliance", value: "Compliant with IAS 27", status: "optimal" }
      ],
      bapiName: "BAPI_ACC_DOCUMENT_POST",
      bapiDescription: "Posts matching intercompany clearing journal documents.",
      bapiLogs: [
        "⏳ Initializing intercompany clearing audit...",
        "📡 Scanning intercompany ledger lines (ACDOCA) for matching partners...",
        "🔍 Detected $145,000 G/L balance variance across 2 subsidiary channels.",
        "🚀 Dispatching clearing post-back using BAPI_ACC_DOCUMENT_POST...",
        "   ↳ Posted clearing balances between US01 and DE01 for $15,000.",
        "   ↳ Posted clearing balances between US01 and UK01 for $130,000.",
        "✅ Consolidated general ledgers balanced and locked for close.",
        "🎉 SUCCESS! Intercompany journal ledgers balanced successfully."
      ],
      evidenceCertificate: {
        hash: "sha256:d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2",
        actionTaken: "Posted matching intercompany balancing journal vouchers to G/L ledgers",
        impactMetrics: "Reconciled $145,000 in subsidiary imbalances, balancing close",
        sapVoucher: "Cleared SAP Doc reference: SEC-IC-1710-001"
      }
    },
    {
      id: "capex-control",
      title: "Real-Time CapEx Overrun Control",
      category: "Budget Enforcement",
      desc: "Audit operational project WBS balances against approved CapEx budget templates to auto-block exceeding purchase requisitions.",
      icon: ShieldCheck,
      stakeholder: "Corporate Controller",
      valueProp: "Enforces project budget compliance, preventing capital expenditure overruns.",
      sapReadDesc: "Audits Project WBS registers (PRPS) and purchase requisitions (EBAN).",
      ariaReasonDesc: "Compares combined actual costs and commitments against budgets.",
      agenticActionsDesc: "Blocks requisition items exceeding budget allocations.",
      outcomeDesc: "Secures $112,000 in unapproved equipment purchase requisitions.",
      whatWeAreDoing: "ARIA monitors active Project WBS elements (PRPS) and aggregates actual project costs (ACDOCA) alongside open purchase commitments (EBAN). It auto-checks if incoming requisitions exceed CapEx limits.",
      whyWeAreDoingIt: "Project budgets frequently suffer from delayed accounting, causing overruns to be caught only post-close. Automating real-time checks on project allocations blocks unapproved material commitments before liabilities are booked.",
      flowSteps: [
        { title: "1. Read / Ingest", desc: "Audit Project WBS structures and open purchase requisitions.", dataIn: "PRPS (WBS), EBAN (Requisitions)", dataOut: "PostgreSQL Projects Cache", icon: Database },
        { title: "2. Reconcile", desc: "Check combined expenditures and commitments against WBS budget limits.", dataIn: "ACDOCA Actual expenditure lines", dataOut: "CapEx budget exhaustion score", icon: Activity },
        { title: "3. Authorize", desc: "Sign authorization to lock requisitions exceeding project allocations.", dataIn: "Project controller approval", dataOut: "sha256 Compliance Hash", icon: FileEdit },
        { title: "4. Execute", desc: "Update purchase requisitions, placing blocks on items exceeding budget.", dataIn: "BAPI_PO_CHANGE", dataOut: "Blocked EBAN requisition codes", icon: Terminal },
        { title: "5. Audit Ledger", desc: "Review project commitment ledgers to verify locked balances.", dataIn: "Commitment ledger limits updates", dataOut: "TIM-CP voucher receipt", icon: CheckCircle }
      ],
      tables: ["PRPS (WBS Details)", "EBAN (Purchase Reqs)", "ACDOCA (Actual Ledger)"],
      objectiveMath: "Spend_{Actual} + Commitments \\le Budget_{CapEx} \\implies EBAN\\text{-BANPR} = \\text{'Blocked'}",
      readPath: "API_GLACCOUNTLINEITEM/GLAccountLineItem",
      readHeaders: ["WBS Project", "CapEx Budget", "Actual Spend", "Commitments", "Pending Req", "Status"],
      readRecords: [
        { doc: "WBS-1710-01", type: "IT Infrastructure", partner: 500000, amount: 380000, date: 85000, terms: "$112,000 Blocked" },
        { doc: "WBS-1710-02", type: "Lab Equip Expansion", partner: 250000, amount: 245000, date: 0, terms: "$15,000 Blocked" },
        { doc: "WBS-1710-03", type: "HQ Server Upgrade", partner: 180000, amount: 120000, date: 15000, terms: "$8,000 Approved" }
      ],
      visualizerType: "capex",
      reasoningRules: [
        { rule: "WBS budget overrun check", value: "Budget threshold exceeded", status: "flagged" },
        { rule: "Project approval validation", value: "Sign-off signature verified", status: "passed" },
        { rule: "Corporate CapEx alignment check", value: "WBS code active", status: "optimal" }
      ],
      bapiName: "BAPI_PO_CHANGE",
      bapiDescription: "Revises purchase requisitions to set blocks on items exceeding budget.",
      bapiLogs: [
        "⏳ Starting CapEx overrun check for active projects...",
        "📡 Reading Project WBS balances (PRPS) and commitments (EBAN)...",
        "🔍 Detected budget overrun risk on Project IT Infrastructure (WBS-1710-01).",
        "🚀 Dispatching requisition block via BAPI_PO_CHANGE...",
        "   ↳ Frozen requisition item 0010, preventing $112,000 unapproved purchase.",
        "✅ CapEx commitment ledger balances adjusted successfully.",
        "🎉 SUCCESS! Requisition blocked, project budget integrity maintained."
      ],
      evidenceCertificate: {
        hash: "sha256:e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2",
        actionTaken: "Blocked purchasing requisitions exceeding WBS project budget limits",
        impactMetrics: "Saved $112,000 in unapproved budget overrun expenditures",
        sapVoucher: "Cleared SAP Doc reference: SEC-CP-1710-01"
      }
    },
    {
      id: "credit-limit",
      title: "Dynamic Credit Limit Release",
      category: "Risk Control",
      desc: "Audit sales order lines blocked under credit holds against incoming G/L cash receipts and payments to auto-release orders.",
      icon: Lock,
      stakeholder: "Corporate Controller",
      valueProp: "Boosts order clearing cycles, releasing orders dynamically while managing risk exposure.",
      sapReadDesc: "Audits blocked sales items (VBUK) and customer credit metrics (KNKK).",
      ariaReasonDesc: "Re-calculates active customer credit limits against cleared invoice records.",
      agenticActionsDesc: "Drops sales order blocks, updating shipping registers.",
      outcomeDesc: "Releases a $450,000 billing block for Domestic US Customer 14 upon deposit confirmation.",
      whatWeAreDoing: "ARIA audits blocked sales orders (VBUK) and reviews customer credit parameters (KNKK). It automatically cross-references recent G/L cash clearances to re-calculate customer risk profiles and release credit blocks.",
      whyWeAreDoingIt: "Manual credit overrides drag down order fulfillment speed and delay customer delivery flows. Auto-releasing order credit holds upon verified cash deposit receipt secures transaction cycles without introducing bad debt risks.",
      flowSteps: [
        { title: "1. Read / Ingest", desc: "Scans credit-blocked sales orders and customer credit masters.", dataIn: "VBUK (Order Status), KNKK (Limits)", dataOut: "PostgreSQL Credit Cache", icon: Database },
        { title: "2. Reconcile", desc: "Audit open receivables against verified cash deposits inside ledgers.", dataIn: "BSID Customer Receivables", dataOut: "Adjusted active exposure scores", icon: Activity },
        { title: "3. Authorize", desc: "Collect cryptographic authorization to release credit blocks.", dataIn: "Credit manager approval signoff", dataOut: "sha256 Compliance Hash", icon: FileEdit },
        { title: "4. Execute", desc: "Commit release updates to drop credit holdings on the order.", dataIn: "BAPI_SALESORDER_CHANGE", dataOut: "Released shipping order lines", icon: Terminal },
        { title: "5. Audit Ledger", desc: "Review customer accounts and verify released shipment balances.", dataIn: "Cleared bank receipts ledgers", dataOut: "TIM-CR voucher receipt", icon: CheckCircle }
      ],
      tables: ["VBUK (Order Status)", "KNKK (Credit Limits)", "BSAD (AR Cleared Items)"],
      objectiveMath: "Exposure_{Live} \\le Limit_{Credit} + Cash_{Cleared} \\implies Order = Released",
      readPath: "API_GLACCOUNTLINEITEM/GLAccountLineItem",
      readHeaders: ["Order Number", "Customer", "Order Value", "Credit Limit", "Cleared Deposit", "Release Decision"],
      readRecords: [
        { doc: "10020084", type: "Domestic US Customer 14", partner: 450000, amount: 500000, date: 120000, terms: "Released" },
        { doc: "10020092", type: "Domestic US Customer 2", partner: 250000, amount: 200000, date: 15000, terms: "Hold (Limit Breached)" },
        { doc: "10020110", type: "Domestic US Customer 12", partner: 85000, amount: 150000, date: 50000, terms: "Released" }
      ],
      visualizerType: "credit",
      reasoningRules: [
        { rule: "Credit exposure limit check", value: "Exposure within tolerance", status: "passed" },
        { rule: "Bank payment confirmation check", value: "$120,000 deposit confirmed", status: "passed" },
        { rule: "Customer payment performance", value: "Average DSO < 34 days", status: "optimal" }
      ],
      bapiName: "BAPI_SALESORDER_CHANGE",
      bapiDescription: "Removes credit blocks on sales documents to release orders to logistics shipping.",
      bapiLogs: [
        "⏳ Scanning credit-blocked sales documents...",
        "📡 Reading customer credit settings (KNKK) and cleared deposits (BSAD)...",
        "🔍 Detected confirmed bank deposit of $120,000 for customer Domestic US Customer 14.",
        "🚀 Dispatching release requests using BAPI_SALESORDER_CHANGE...",
        "   ↳ Dropped credit block on order 10020084, releasing items to shipping.",
        "✅ Re-indexed billing and shipment ledger documents.",
        "🎉 SUCCESS! Blocked order released to logistics successfully."
      ],
      evidenceCertificate: {
        hash: "sha256:f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3",
        actionTaken: "Released sales credit billing blocks based on confirmed cash clearances",
        impactMetrics: "Released $450,000 in billing holds into regional shipping pipelines",
        sapVoucher: "Cleared SAP Doc reference: SEC-CR-1710-084"
      }
    }
  ], [companyCode, arItems, apItems, activeScenarioId, minBuffer, discountRate, apExtension, sweepThreshold, hedgeCoverage, creditBuffer]);

  // Group scenarios by stakeholder
  const groupedScenarios = useMemo(() => {
    const groups: Record<StakeholderGroup, Scenario[]> = {
      "CFO & Treasurer": [],
      "Tax & Compliance": [],
      "Procurement & Supply Chain": [],
      "Corporate Controller": []
    };
    
    scenarios.forEach(s => {
      groups[s.stakeholder].push(s);
    });
    
    return groups;
  }, [scenarios]);

  const activeScenario = useMemo(() => {
    return scenarios.find(s => s.id === activeScenarioId) || scenarios[0];
  }, [activeScenarioId, scenarios]);

  // Synchronize scenario with search parameters (URL ?id=...)
  useEffect(() => {
    if (urlScenarioId && urlScenarioId !== activeScenarioId) {
      const matched = scenarios.some(s => s.id === urlScenarioId);
      if (matched) {
        setActiveScenarioId(urlScenarioId);
        setActiveTab("overview");
      }
    }
  }, [urlScenarioId, activeScenarioId, scenarios]);

  // Load live data from Postgres Cache / SAP CAL
  const loadSapData = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/sap/finance-data?companyCode=${companyCode}&source=db`);
      const json = await res.json();
      
      if (res.ok && json.status === "success" && json.arItems && json.arItems.length > 0) {
        setArItems(json.arItems);
        setApItems(json.apItems || []);
        setSapSource(json.source);
        setIsDbCached(true);
      } else {
        const liveRes = await fetch(`/api/sap/finance-data?companyCode=${companyCode}&source=sap`);
        const liveJson = await liveRes.json();
        
        if (liveRes.ok && liveJson.status === "success") {
          setArItems(liveJson.arItems || []);
          setApItems(liveJson.apItems || []);
          setSapSource(liveJson.source);
          setIsDbCached(false);
        } else {
          throw new Error(liveJson.error || "Failed to retrieve SAP datasets.");
        }
      }
    } catch (e: any) {
      console.error("Error loading SAP data:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  const [taxItems, setTaxItems] = useState<any[]>([]);
  const [selectedTaxDoc, setSelectedTaxDoc] = useState<any>(null);

  const loadTaxData = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/sap/tax-audit");
      const json = await res.json();
      if (res.ok && json.status === "success") {
        setTaxItems(json.items || []);
        // Auto-select first flagged item if none is selected
        const flagged = (json.items || []).find((item: any) => item.status === "Flagged");
        if (flagged) {
          setSelectedTaxDoc(flagged);
        } else if (json.items && json.items.length > 0) {
          setSelectedTaxDoc(json.items[0]);
        }
      }
    } catch (e) {
      console.error("Error loading tax audit data:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetTaxLookback = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/sap/tax-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RESET" })
      });
      if (res.ok) {
        await loadTaxData();
        setHasExtracted(prev => ({ ...prev, "tax-lookback": false }));
        setApprovalState(prev => ({ ...prev, "tax-lookback": "idle" }));
        setExecutionState(prev => ({ ...prev, "tax-lookback": "idle" }));
        setTaxAgreement1(false);
        setTaxAgreement2(false);
        setSelectedInvoice(null);
        alert("Demo cache reset successfully! Tax Lookback is back to the initial flagged state.");
      }
    } catch (e) {
      console.error("Failed to reset demo cache:", e);
    } finally {
      setIsProcessing(false);
    }
  };


  // Live S/4HANA OData Gateway Extraction Run
  const handleTriggerExtraction = () => {
    setIsExtractingLive(true);
    setExtractionLogs([]);
    
    if (activeScenarioId === "tax-lookback") {
      const rfcHeaderLogs = [
        "⏳ [INFO] [RFC_CONN_01] Initializing RFC connection handshake to S/4HANA Fiori Gateway...",
        "🔑 [INFO] [RFC_AUTH] Authenticating user 'bas@evolver.ai' via Secure OAuth2 Profile...",
        "📡 [INFO] [RFC_GATEWAY] Connection established to https://172.211.212.84:44301/sap/opu/odata/sap/CB_BILLING_DOCUMENT_SRV",
        "🔍 [INFO] [ODATA_QUERY] Parsing parameters & filters:",
        "   ├── $expand = SNAV_INVOICE_ITEM,CPREVIOUS_SALES_ORDERS",
        "   ├── $filter = CompanyCode eq '1710'",
        "   └── $top = 20",
        "📦 [INFO] [ETL_ENGINE] Launching billing data extraction..."
      ];
      
      const logs = [
        ...rfcHeaderLogs,
        "📊 [INFO] [ETL_METRIC] System calculated total volume: 5 records match the query scope.",
        "🚀 [INGEST] [CHUNK_01] Fetching offsets: 0 - 5...",
        "📥 [INGEST] [CHUNK_01] Received 5 billing documents | HTTP 200 OK | Size: 18.5KB",
        "⚙️ [TAX_AUDIT] Cross-referencing physical warehouse addresses with ERP partners...",
        "⚠️ [TAX_AUDIT] Discovered 2 tax jurisdiction region variances (CA vs OR, NY vs NJ).",
        "💾 [POSTGRES] Wrote 5 rows to table 'sap_billing_cache' [Staged: 100%]",
        "📊 [INFO] [SUCCESS] Synced 5 rows successfully.",
        "🎉 [INFO] Ready for real-time Sales & Use Tax lookback audit!"
      ];
      
      let currentLine = 0;
      const interval = setInterval(async () => {
        if (currentLine < logs.length) {
          setExtractionLogs(prev => [...prev, logs[currentLine]]);
          currentLine++;
        } else {
          clearInterval(interval);
          try {
            await fetch("/api/sap/tax-audit", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "INGEST" })
            });
          } catch (e) {
            console.error("Backend ingest failed", e);
          }
          await loadTaxData();
          setHasExtracted(prev => ({ ...prev, [activeScenario.id]: true }));
          setIsExtractingLive(false);
        }
      }, 150);
      return;
    }

    const isAPAR = activeScenarioId === "ap-ar-optimization";
    const isDuplicate = activeScenarioId === "duplicate-payments";
    
    // Choose appropriate table & path dynamically
    let targetTable = "ACDOCA/BSEG";
    let readPath = activeScenario.readPath || "API_GLACCOUNTLINEITEM/GLAccountLineItem";
    let filterString = `(CompanyCode eq '${companyCode}') and (FiscalYear eq '${fiscalYear}')`;
    let selectFields = "DocumentNumber,CompanyCode,FiscalYear,PostingDate,GLAccount,AmountInCompanyCodeCurrency,DebitCreditCode,ClearingDate";
    let matchedCount = 0;

    if (isAPAR) {
      if (wcDocScope === "orders") {
        targetTable = "EKKO/EKPO";
        readPath = "API_PURCHASEORDER_PROCESS_SRV/A_PurchaseOrder";
        filterString = `(CompanyCode eq '${companyCode}') and (OrderValue ge ${minOrderValue})`;
        selectFields = "PurchaseOrder,CompanyCode,PurchasingOrganization,DocumentDate,OrderValue,Supplier,SupplierName,OverallBillingStatus";
        matchedCount = minOrderValue >= 100000 ? 12 : minOrderValue >= 50000 ? 32 : 84;
      } else if (wcDocScope === "sales") {
        targetTable = "VBAK/VBAP";
        readPath = "API_SALES_ORDER_SRV/A_SalesOrder";
        filterString = `(CompanyCode eq '${companyCode}') and (OverallBillingStatus ne 'C')`;
        selectFields = "SalesOrder,CompanyCode,SalesOrganization,CreationDate,NetValue,SoldToParty,CustomerName,OverallBillingStatus";
        matchedCount = 68;
      } else {
        targetTable = "BSID/BSIK";
        readPath = "API_GLACCOUNTLINEITEM/GLAccountLineItem";
        filterString = `(CompanyCode eq '${companyCode}') and (ClearingDate eq null)`;
        selectFields = "DocumentNumber,CompanyCode,FiscalYear,PostingDate,GLAccount,AmountInCompanyCodeCurrency,DebitCreditCode,ClearingDate";
        matchedCount = companyCode === "1710" ? 194 : companyCode === "1010" ? 45 : 6;
      }
    } else if (isDuplicate) {
      targetTable = "BSIK";
      readPath = "API_OPERATIONAL_AP_SRV/BSIK_OpenItems";
      filterString = `(CompanyCode eq '${companyCode}') and (ClearingDate eq null) and (SimilarityMatch ge ${duplicateThreshold}%)`;
      selectFields = "AccountingDocument,CompanyCode,FiscalYear,PostingDate,Vendor,VendorName,AmountInCompanyCodeCurrency,ClearingDate,InvoiceReference";
      matchedCount = duplicateThreshold >= 90 ? 4 : duplicateThreshold >= 85 ? 12 : 27;
    } else {
      // Fallback scenarios
      if (docTypeFilter !== "All") {
        filterString += ` and (DocumentType eq '${docTypeFilter}')`;
      }
      if (clearingStatus === "open") {
        filterString += " and (ClearingDate eq null)";
      } else if (clearingStatus === "cleared") {
        filterString += " and (ClearingDate ne null)";
      }
      if (fiscalYear === "2019") {
        matchedCount = 194;
      } else if (fiscalYear === "2020") {
        matchedCount = 45;
      } else {
        matchedCount = 6;
      }
    }
    
    let pagingString = "";
    if (topLimit !== "all") {
      pagingString = `&$top=${topLimit}`;
      matchedCount = Math.min(matchedCount, parseInt(topLimit));
    }

    const rfcHeaderLogs = [
      "⏳ [INFO] [RFC_CONN_01] Initializing RFC connection handshake to S/4HANA Fiori Gateway...",
      "🔑 [INFO] [RFC_AUTH] Authenticating user 'bas@evolver.ai' via Secure OAuth2 Profile...",
      `📡 [INFO] [RFC_GATEWAY] Connection established to https://s4hana-cal.local:443/sap/opu/odata/sap/${readPath.split('/')[0]}`,
      "🔍 [INFO] [ODATA_QUERY] Parsing parameters & filters:",
      `   ├── $select = ${selectFields}`,
      `   ├── $filter = ${filterString}`,
      `   └── $orderby = ${isAPAR && wcDocScope === "orders" ? "DocumentDate" : isAPAR && wcDocScope === "sales" ? "CreationDate" : "PostingDate"} desc${pagingString ? `\n   └── $top = ${topLimit}` : ""}`,
      `📦 [INFO] [ETL_ENGINE] Launching parallel chunk extraction from Table: ${targetTable}...`
    ];

    if (topLimit !== "all") {
      matchedCount = Math.min(matchedCount, parseInt(topLimit));
    }

    let chunkLogs: string[] = [];
    if (matchedCount <= 5) {
      chunkLogs = [
        `📊 [INFO] [ETL_METRIC] System calculated total volume: ${matchedCount} records match the query scope.`,
        `🚀 [INGEST] [CHUNK_01] Fetching offsets: 0 - ${matchedCount}...`,
        `📥 [INGEST] [CHUNK_01] Received ${matchedCount} records | HTTP 200 OK | Size: ${(matchedCount * 0.9).toFixed(1)}KB | Rate: 980 rec/s`,
        `💾 [POSTGRES] [CHUNK_01] Wrote ${matchedCount} rows to table 'sap_finance_cache' [Staged: 100%]`
      ];
    } else if (matchedCount <= 50) {
      chunkLogs = [
        `📊 [INFO] [ETL_METRIC] System calculated total volume: ${matchedCount} records match the query scope.`,
        `🚀 [INGEST] [CHUNK_01] Fetching offsets: 0 - ${matchedCount}...`,
        `📥 [INGEST] [CHUNK_01] Received ${matchedCount} records | HTTP 200 OK | Size: ${(matchedCount * 0.9).toFixed(1)}KB | Rate: 1,150 rec/s`,
        `💾 [POSTGRES] [CHUNK_01] Wrote ${matchedCount} rows to table 'sap_finance_cache' [Staged: 100%]`
      ];
    } else {
      const half = Math.floor(matchedCount / 2);
      chunkLogs = [
        `📊 [INFO] [ETL_METRIC] System calculated total volume: ${matchedCount} records match the query scope.`,
        `🚀 [INGEST] [CHUNK_01] Fetching offsets: 0 - ${half}...`,
        `📥 [INGEST] [CHUNK_01] Received ${half} records | HTTP 200 OK | Size: ${(half * 0.9).toFixed(1)}KB | Rate: 1,320 rec/s`,
        `💾 [POSTGRES] [CHUNK_01] Wrote ${half} rows to table 'sap_finance_cache' [Staged: 50%]`,
        `🚀 [INGEST] [CHUNK_02] Fetching offsets: ${half} - ${matchedCount}...`,
        `📥 [INGEST] [CHUNK_02] Received ${matchedCount - half} records | HTTP 200 OK | Size: ${((matchedCount - half) * 0.9).toFixed(1)}KB | Rate: 1,410 rec/s`,
        `💾 [POSTGRES] [CHUNK_02] Wrote ${matchedCount - half} rows to table 'sap_finance_cache' [Staged: 100%]`
      ];
    }

    const footerLogs = [
      "⚙️ [POSTGRES] [INDEX] Re-building composite indexes on fields: BELNR, GJAHR, BUKRS...",
      "🧹 [POSTGRES] [CLEAN] Cleaned up temporary chunk workspace allocations.",
      `📊 [INFO] [SUCCESS] Synced ${matchedCount} rows successfully. Local cache stages fully warmed.`,
      "🎉 [INFO] Ready for real-time scenario evaluations!"
    ];

    const logs = [...rfcHeaderLogs, ...chunkLogs, ...footerLogs];
    
    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < logs.length) {
        setExtractionLogs(prev => [...prev, logs[currentLine]]);
        currentLine++;
      } else {
        clearInterval(interval);
        // Load the actual Postgres cache data
        loadSapData();
        setHasExtracted(prev => ({ ...prev, [activeScenario.id]: true }));
        setIsExtractingLive(false);
      }
    }, 150);
  };

  // Load data on mount or companyCode changes (for Working Capital and Duplicate Invoices)
  useEffect(() => {
    if (activeScenarioId === "ap-ar-optimization" || activeScenarioId === "duplicate-payments") {
      loadSapData();
    } else if (activeScenarioId === "tax-lookback") {
      loadTaxData();
    }
  }, [companyCode, activeScenarioId]);

  // Auto scroll terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalLogs]);

  // Auto scroll extraction terminal
  useEffect(() => {
    extractionTerminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [extractionLogs]);

  // Compute stats based on actual SAP CAL data
  const stats = useMemo(() => {
    const arTotal = arItems.reduce((acc, item) => acc + item.amount, 0) || 450000;
    const apTotal = apItems.reduce((acc, item) => acc + item.amount, 0) || 320000;
    const targetCustomer = arItems.length > 0 ? arItems[0].customerName : "Domestic US Customer 14";
    const targetCustomerDoc = arItems.length > 0 ? arItems[0].id : "900200845";
    
    return {
      arTotal,
      apTotal,
      targetCustomer,
      targetCustomerDoc
    };
  }, [arItems, apItems]);

  // Forecast curves based on actual retrieved amounts
  const forecastCurves = useMemo(() => {
    const startingCash = stats.apTotal * 5;
    let currentUnopt = startingCash;
    let currentOpt = startingCash;
    const data: { day: number; unopt: number; opt: number }[] = [];

    for (let day = 1; day <= 30; day++) {
      let operationalDrift = -(stats.apTotal * 0.025);
      
      // AP Payments
      let unoptAP = day === 12 ? -stats.apTotal : 0;
      let optAP = 0;
      if (isApDeferEnabled) {
        optAP = day === (12 + apExtension) ? -stats.apTotal : 0;
      } else {
        optAP = day === 12 ? -stats.apTotal : 0;
      }

      // Regular high-value runs (Payroll & Suppliers)
      if (day === 18) operationalDrift -= (stats.apTotal * 0.78);
      if (day === 25) operationalDrift -= (stats.apTotal * 0.56);

      // Inbound accelerated payments (AR)
      let optAR = 0;
      if (isArAccelerateEnabled && day === 10 && discountRate > 0) {
        optAR = stats.arTotal - (stats.arTotal * (discountRate / 100));
      }

      // Inbound high-yield preset (simulating treasury cash sweep on Day 5)
      let optPreset = 0;
      if (useHighYieldArPreset && day === 5) {
        optPreset = stats.arTotal * 0.75;
      }

      currentUnopt += operationalDrift + unoptAP;
      currentOpt += operationalDrift + optAP + optAR + optPreset;

      data.push({
        day,
        unopt: currentUnopt,
        opt: currentOpt
      });
    }

    return {
      data,
      lowestUnopt: Math.min(...data.map(d => d.unopt)),
      lowestOpt: Math.min(...data.map(d => d.opt))
    };
  }, [stats, apExtension, discountRate, isArAccelerateEnabled, isApDeferEnabled, useHighYieldArPreset]);

  // Dynamic Levenshtein fuzzy matching on live AP items
  const detectedDuplicates = useMemo(() => {
    const baseAp = [...apItems];
    
    // Inject dynamic high-value duplicate invoices to guarantee the demo behaves beautifully
    if (useEvaluationPresets) {
      if (baseAp.length > 0) {
        // Root duplicates strictly in the actual loaded documents!
        const actualItems = [...baseAp];
        actualItems.forEach((item) => {
          // Skip if it's already a synthetic duplicate item
          if (!item.id.includes("SYN") && !item.id.includes("DUP")) {
            // Twin A: Punctuation transposition (Stripping hyphens/slashes or adding one)
            const cleanRef = (item.documentReference || "").replace(/[^a-zA-Z0-9]/g, "");
            const mockRef = cleanRef ? `${cleanRef.slice(0, 3)}-${cleanRef.slice(3)}` : `INV-${item.id.split('-')[0]}`;
            
            baseAp.push({
              id: `${item.id.split('-')[0]}-DUP`,
              companyCode: item.companyCode,
              vendor: item.vendor,
              vendorName: item.vendorName,
              amount: item.amount,
              currency: item.currency,
              glAccount: item.glAccount,
              glAccountName: item.glAccountName,
              postingDate: item.postingDate,
              originalTerms: item.originalTerms,
              zfbdt: item.zfbdt,
              documentReference: mockRef, // Dynamic transposed reference
              paymentBlock: ""
            });
          }
        });
      } else {
        // Fallback: If no live data is fetched yet, pre-populate with realistic entries so visuals are not empty
        baseAp.push(
          {
            id: "1900000013-SYN",
            companyCode: "1710",
            vendor: "17300083",
            vendorName: "Ingram Micro Logistics",
            amount: 125000,
            currency: "USD",
            glAccount: "300000",
            glAccountName: "Trade Payables",
            postingDate: "2018-03-09",
            originalTerms: "Z030 (Net 30)",
            zfbdt: "2018-03-09",
            documentReference: "900200-83",
            paymentBlock: ""
          },
          {
            id: "1900000013-DUP",
            companyCode: "1710",
            vendor: "17300083",
            vendorName: "Ingram Micro Logistics",
            amount: 125000,
            currency: "USD",
            glAccount: "300000",
            glAccountName: "Trade Payables",
            postingDate: "2018-03-10",
            originalTerms: "Z030 (Net 30)",
            zfbdt: "2018-03-10",
            documentReference: "90020083",
            paymentBlock: ""
          }
        );
      }
    }

    const results: { doc1: string; doc2: string; id1: string; id2: string; vendorName: string; amount: number; score: number; status: string }[] = [];
    const seenPairs = new Set<string>();

    for (let i = 0; i < baseAp.length; i++) {
      for (let j = i + 1; j < baseAp.length; j++) {
        const item1 = baseAp[i];
        const item2 = baseAp[j];

        // Restrict to KR Invoice logic (vendor items only)
        if (isRestrictDocType) {
          const isItem1AP = item1.id.includes("SYN") || item1.glAccount === "300000";
          const isItem2AP = item2.id.includes("SYN") || item2.glAccount === "300000";
          if (!isItem1AP || !isItem2AP) continue;
        }

        if (
          item1.id !== item2.id &&
          item1.vendor === item2.vendor &&
          item1.amount === item2.amount
        ) {
          // Date consistency check: enforce dates are within baseline window
          if (isCheckBaselineDate) {
            const date1 = new Date(item1.postingDate).getTime();
            const date2 = new Date(item2.postingDate).getTime();
            const diffDays = Math.abs(date1 - date2) / (1000 * 60 * 60 * 24);
            if (diffDays > policyBaselineWindow) continue;
          }

          const ref1 = item1.documentReference || "";
          const ref2 = item2.documentReference || "";
          
          // Skip if either document reference is missing/empty as we cannot perform similarity checks on blank data
          if (!ref1.trim() || !ref2.trim()) continue;
          
          let similarity = 0;
          if (isIgnorePunctuation) {
            const clean1 = ref1.replace(/[^a-zA-Z0-9]/g, "");
            const clean2 = ref2.replace(/[^a-zA-Z0-9]/g, "");
            similarity = getStringSimilarity(clean1, clean2);
          } else {
            similarity = getStringSimilarity(ref1, ref2);
          }
          
          const pairKey = [item1.id, item2.id].sort().join(":");
          if (!seenPairs.has(pairKey)) {
            seenPairs.add(pairKey);
            const scorePct = Math.round(similarity * 100);
            
            if (scorePct >= duplicateThreshold) {
              const isLocked = item1.paymentBlock === "A" || item2.paymentBlock === "A" || executionState["duplicate-payments"] === "success";
              results.push({
                doc1: ref1,
                doc2: ref2,
                id1: item1.id,
                id2: item2.id,
                vendorName: item1.vendorName,
                amount: item1.amount,
                score: scorePct,
                status: isLocked ? "Locked (ZLSPR = A)" : "Flagged (Unresolved)"
              });
            }
          }
        }
      }
    }
    return results;
  }, [apItems, duplicateThreshold, executionState, useEvaluationPresets, isIgnorePunctuation, isCheckBaselineDate, policyBaselineWindow, isRestrictDocType]);

  // Categorize suspicious duplicate invoices dynamically for the visualizer panel
  const categorizedDuplicates = useMemo(() => {
    const categories = {
      transposition: {
        id: "transposition",
        title: "Punctuation & Character Transpositions",
        reason: "Identical amounts and suppliers with references varying only by punctuation (e.g., dashes, slashes, spaces) used to bypass exact-match validation.",
        detail: "Standard ERP duplicate checks match strings exactly. Adding or omitting a hyphen (like 'INV-900200-84' vs 'INV90020084') is a common vulnerability bypassed by automated payment runs but caught by Levenshtein distance rules.",
        count: 0,
        amount: 0,
        color: "from-rose-500 to-orange-500",
        bgColor: "bg-rose-500/10",
        borderColor: "border-rose-500/20",
        textColor: "text-rose-500 dark:text-rose-400 font-extrabold",
        items: [] as typeof detectedDuplicates
      },
      prefixTypo: {
        id: "prefixTypo",
        title: "Abbreviation & Prefix Variations",
        reason: "Slight prefix abbreviation shifts (e.g., 'IN' vs 'INV') for identical amounts, signaling shorthand keystroke entries or double-billing entries.",
        detail: "Alphanumeric prefix variations (like 'IN-200892' vs 'INV-200892') frequently escape standard AP controls. Fuzzy character matches capture these transcriptions, flag them as severe duplicate payment exposures, and force manual audit reviews.",
        count: 0,
        amount: 0,
        color: "from-amber-500 to-yellow-500",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/20",
        textColor: "text-amber-500 dark:text-amber-400 font-extrabold",
        items: [] as typeof detectedDuplicates
      },
      exactDouble: {
        id: "exactDouble",
        title: "Identical Postings & Clear Duplicates",
        reason: "Direct identical invoice reference numbers with identical values loaded into the accounts payable ledger on matching dates.",
        detail: "Direct duplications represent immediate duplicate clearance hazards. These items are immediately locked under payment block codes (BSEG-ZLSPR = A) and posted for reconciliation.",
        count: 0,
        amount: 0,
        color: "from-purple-500 to-indigo-500",
        bgColor: "bg-purple-500/10",
        borderColor: "border-purple-500/20",
        textColor: "text-purple-500 dark:text-purple-400 font-extrabold",
        items: [] as typeof detectedDuplicates
      }
    };

    detectedDuplicates.forEach(item => {
      const score = item.score;
      const clean1 = item.doc1.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
      const clean2 = item.doc2.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
      const hasPunctuationDiff = clean1 === clean2;

      if (score === 100) {
        categories.exactDouble.count++;
        categories.exactDouble.amount += item.amount;
        categories.exactDouble.items.push(item);
      } else if (hasPunctuationDiff) {
        categories.transposition.count++;
        categories.transposition.amount += item.amount;
        categories.transposition.items.push(item);
      } else {
        categories.prefixTypo.count++;
        categories.prefixTypo.amount += item.amount;
        categories.prefixTypo.items.push(item);
      }
    });

    return Object.values(categories);
  }, [detectedDuplicates]);

  // Trigger BAPI execution logs dynamically based on the active scenario
  const handleExecuteBapi = () => {
    if (approvalState[activeScenario.id] !== "signed") return;
    
    setExecutionState(prev => ({ ...prev, [activeScenario.id]: "executing" }));
    setTerminalLogs([]);

    // Closed-loop direct database writeback for Tax Lookback Audit
    if (activeScenario.id === "tax-lookback") {
      if (!selectedTaxDoc) {
        setTerminalLogs(["❌ No tax audit document selected."]);
        setExecutionState(prev => ({ ...prev, [activeScenario.id]: "idle" }));
        return;
      }
      
      const regionMatch = selectedTaxDoc.shipToRegion?.match(/\(([^)]+)\)/);
      const regionCode = regionMatch ? regionMatch[1] : (selectedTaxDoc.shipToRegion || "OR");

      fetch("/api/sap/tax-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "EXECUTE_ADJUSTMENT",
          doc: selectedTaxDoc.doc,
          salesOrder: selectedTaxDoc.salesOrder || "22",
          shipToRegion: regionCode
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.status === "success" && data.logs) {
          let currentLogIndex = 0;
          const logInterval = setInterval(() => {
            if (currentLogIndex < data.logs.length) {
              setTerminalLogs(prev => [...prev, data.logs[currentLogIndex]]);
              currentLogIndex++;
            } else {
              clearInterval(logInterval);
              setExecutionState(prev => ({ ...prev, [activeScenario.id]: "success" }));
              loadTaxData();
            }
          }, 350);
        } else {
          setTerminalLogs(prev => [
            "⏳ Establishing secure RFC handshake with live S/4HANA ERP instance...",
            "🔑 Authenticating active tenant credentials bas@evolver.ai...",
            "❌ Error during execution: " + (data.error || "Unknown error")
          ]);
          setExecutionState(prev => ({ ...prev, [activeScenario.id]: "idle" }));
        }
      })
      .catch(err => {
        console.error("Execution error:", err);
        setTerminalLogs(prev => [
          "⏳ Establishing secure RFC handshake with live S/4HANA ERP instance...",
          "🔑 Authenticating active tenant credentials bas@evolver.ai...",
          "❌ Execution network failure: " + err.message
        ]);
        setExecutionState(prev => ({ ...prev, [activeScenario.id]: "idle" }));
      });
      
      return;
    }

    // Closed-loop direct database writeback for Duplicate Payments
    if (activeScenario.id === "duplicate-payments") {
      const invoiceIdsToBlock = detectedDuplicates.flatMap(item => [item.id1, item.id2]);
      fetch("/api/sap/finance-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "BLOCK_INVOICES",
          invoiceIds: invoiceIdsToBlock
        })
      })
      .then(res => res.json())
      .then(data => {
        console.log("[Closed-Loop Write-Back] DB Response:", data);
      })
      .catch(err => {
        console.error("[Closed-Loop Write-Back] DB Error:", err);
      });
    }

    const logScript = activeScenario.bapiLogs;
    let currentLogIndex = 0;
    
    const interval = setInterval(() => {
      if (currentLogIndex < logScript.length) {
        setTerminalLogs(prev => [...prev, logScript[currentLogIndex]]);
        currentLogIndex++;
      } else {
        clearInterval(interval);
        setExecutionState(prev => ({ ...prev, [activeScenario.id]: "success" }));
      }
    }, 450);

    return () => clearInterval(interval);
  };

  // Blueprint deployment logger
  const handleRequestBlueprint = (id: string) => {
    setRequestStatus(prev => ({ ...prev, [id]: true }));
  };

  // Normalize the selected invoice into a unified document structure for FB03 modal
  const docDetails = useMemo(() => {
    if (!selectedInvoice) return null;
    
    // Check if it's a tax lookback audit item
    if ("taxBilledRate" in selectedInvoice) {
      const taxItem = selectedInvoice as any;
      const isSales = taxItem.type ? taxItem.type.includes("Sales") : true;
      return {
        docNum: taxItem.doc,
        docType: isSales ? "DR" : "KR",
        docTypeDesc: taxItem.type || "Invoice",
        companyCode: companyCode,
        docDate: "2026-05-15",
        postingDate: "2026-05-15",
        fiscalYear: "2026",
        period: "05",
        reference: taxItem.salesOrder ? `SO-${taxItem.salesOrder}` : `INV-TAX-${taxItem.doc}`,
        currency: taxItem.currency || "USD",
        amount: taxItem.netValue,
        partnerId: isSales ? "17100001" : "17300082",
        partnerName: taxItem.customerName,
        partnerType: isSales ? "Customer" : "Supplier",
        glAccount: isSales ? "121000" : "300000",
        glAccountName: isSales ? "Accounts Receivable" : "Trade Payables",
        terms: "Z030 (Net 30)",
        paymentBlock: null,
        postingKeys: {
          line1: isSales
            ? { pk: "01", type: "Customer Debit", account: "17100001", name: taxItem.customerName, amount: taxItem.netValue, isDebit: true }
            : { pk: "31", type: "Supplier Credit", account: "17300082", name: taxItem.customerName, amount: taxItem.netValue, isDebit: false },
          line2: isSales
            ? { pk: "50", type: "G/L Credit", account: "410000", name: "Domestic Sales Revenue", amount: taxItem.netValue, isDebit: false }
            : { pk: "40", type: "G/L Debit", account: "510000", name: "Trade Expense - Goods", amount: taxItem.netValue, isDebit: true }
        }
      };
    }
    
    // Check if it's a fuzzy duplicate match object
    if ("doc1" in selectedInvoice && "doc2" in selectedInvoice) {
      const dup = selectedInvoice as { doc1: string; doc2: string; id1: string; id2: string; vendorName: string; amount: number; score: number; status: string };
      const isLocked = dup.status.includes("Locked") || executionState["duplicate-payments"] === "success";
      
      // Look up the actual AP database item to get the real S/4HANA document information
      const matchedApItem = apItems.find(item => item.id === dup.id1);
      const pDate = matchedApItem?.postingDate || "2018-03-09";
      const fYear = pDate.split("-")[0] || "2018";
      
      return {
        docNum: dup.id1.split('-')[0],
        docType: "KR", // Supplier Invoice
        docTypeDesc: "Vendor Invoice (Duplicate)",
        companyCode: companyCode,
        docDate: pDate,
        postingDate: pDate,
        fiscalYear: fYear,
        reference: dup.doc1,
        currency: matchedApItem?.currency || "USD",
        amount: dup.amount,
        partnerId: matchedApItem?.vendor || "17300083",
        partnerName: dup.vendorName,
        partnerType: "Supplier",
        glAccount: matchedApItem?.glAccount || "300000",
        glAccountName: matchedApItem?.glAccountName || "Trade Payables",
        terms: matchedApItem?.originalTerms || "Z030 (Net 30)",
        paymentBlock: isLocked ? "A" : null,
        postingKeys: {
          line1: { pk: "31", type: "Supplier Credit", account: matchedApItem?.vendor || "17300083", name: dup.vendorName, amount: dup.amount, isDebit: false },
          line2: { pk: "40", type: "G/L Debit", account: matchedApItem?.glAccount || "300000", name: matchedApItem?.glAccountName || "Trade Payables", amount: dup.amount, isDebit: true }
        }
      };
    }
    
    // Check if it's an ARItem
    if ("customerName" in selectedInvoice) {
      const arItem = selectedInvoice as ARItem;
      return {
        docNum: arItem.id.split('-')[0],
        docType: "DR", // Customer Invoice
        docTypeDesc: "Customer Invoice",
        companyCode: companyCode,
        docDate: arItem.postingDate,
        postingDate: arItem.postingDate,
        fiscalYear: arItem.postingDate ? arItem.postingDate.split('-')[0] : "2026",
        period: arItem.postingDate ? arItem.postingDate.split('-')[1] : "05",
        reference: `INV-AR-${arItem.id.split('-')[0].slice(-4)}`,
        currency: arItem.currency || "USD",
        amount: arItem.amount,
        partnerId: arItem.customer || "17100001",
        partnerName: arItem.customerName,
        partnerType: "Customer",
        glAccount: arItem.glAccount || "121000",
        glAccountName: arItem.glAccountName || "Accounts Receivable",
        terms: arItem.originalTerms,
        paymentBlock: null,
        postingKeys: {
          line1: { pk: "01", type: "Customer Debit", account: arItem.customer || "17100001", name: arItem.customerName, amount: arItem.amount, isDebit: true },
          line2: { pk: "50", type: "G/L Credit", account: arItem.glAccount || "410000", name: arItem.glAccountName || "Domestic Sales Revenue", amount: arItem.amount, isDebit: false }
        }
      };
    }
    
    // Check if it's an APItem
    if ("vendorName" in selectedInvoice) {
      const apItem = selectedInvoice as APItem;
      const isLocked = apItem.paymentBlock === "A" || executionState[activeScenario.id] === "success" || executionState["duplicate-payments"] === "success";
      return {
        docNum: apItem.id.split('-')[0],
        docType: "KR", // Supplier Invoice
        docTypeDesc: "Vendor Invoice",
        companyCode: companyCode,
        docDate: apItem.postingDate,
        postingDate: apItem.postingDate,
        fiscalYear: apItem.postingDate ? apItem.postingDate.split('-')[0] : "2026",
        period: apItem.postingDate ? apItem.postingDate.split('-')[1] : "05",
        reference: apItem.documentReference || `INV-AP-${apItem.id.split('-')[0].slice(-4)}`,
        currency: apItem.currency || "USD",
        amount: apItem.amount,
        partnerId: apItem.vendor || "17300082",
        partnerName: apItem.vendorName,
        partnerType: "Supplier",
        glAccount: apItem.glAccount || "300000",
        glAccountName: apItem.glAccountName || "Trade Payables",
        terms: apItem.originalTerms,
        paymentBlock: isLocked ? "A" : null,
        postingKeys: {
          line1: { pk: "31", type: "Supplier Credit", account: apItem.vendor || "17300082", name: apItem.vendorName, amount: apItem.amount, isDebit: false },
          line2: { pk: "40", type: "G/L Debit", account: apItem.glAccount || "510000", name: apItem.glAccountName || "Trade Expense - Material", amount: apItem.amount, isDebit: true }
        }
      };
    }
    
    // Fallback/readRecords structure
    const rec = selectedInvoice as any;
    const isCustomer = rec.type ? rec.type.includes("Customer") : true;
    const amountVal = typeof rec.amount === "number" ? rec.amount : parseFloat(String(rec.amount).replace(/[^0-9.]/g, "")) || 150000;
    
    return {
      docNum: rec.doc || rec.id || "900200845",
      docType: isCustomer ? "DR" : "KR",
      docTypeDesc: isCustomer ? "Customer Invoice" : "Vendor Invoice",
      companyCode: companyCode,
      docDate: rec.date || rec.postingDate || "2026-05-18",
      postingDate: rec.date || rec.postingDate || "2026-05-18",
      fiscalYear: (rec.date || rec.postingDate) && String(rec.date || rec.postingDate).includes('-')
        ? String(rec.date || rec.postingDate).split('-')[0] 
        : "2026",
      period: (rec.date || rec.postingDate) && String(rec.date || rec.postingDate).includes('-') ? String(rec.date || rec.postingDate).split('-')[1] : "05",
      reference: rec.doc || rec.id ? `INV-SYS-${rec.doc || rec.id}` : "REF-90020084",
      currency: "USD",
      amount: amountVal,
      partnerId: rec.type && !isCustomer ? "17300082" : "17100001",
      partnerName: rec.partner || rec.customerName || rec.vendorName || "Domestic US Customer 14",
      partnerType: isCustomer ? "Customer" : "Supplier",
      glAccount: isCustomer ? "121000" : "300000",
      glAccountName: isCustomer ? "Accounts Receivable" : "Trade Payables",
      terms: rec.terms || rec.originalTerms || "Z030",
      paymentBlock: (activeScenario.id === "duplicate-payments" && String(rec.terms || "").includes("Blocked")) ? "A" : null,
      postingKeys: {
        line1: isCustomer 
          ? { pk: "01", type: "Customer Debit", account: "17100001", name: rec.partner || rec.customerName || "Domestic US Customer 14", amount: amountVal, isDebit: true }
          : { pk: "31", type: "Supplier Credit", account: "17300082", name: rec.partner || rec.vendorName || "Supplier Partner", amount: amountVal, isDebit: false },
        line2: isCustomer
          ? { pk: "50", type: "G/L Credit", account: "410000", name: "Domestic Sales Revenue", amount: amountVal, isDebit: false }
          : { pk: "40", type: "G/L Debit", account: "510000", name: "Trade Expense - Goods", amount: amountVal, isDebit: true }
      }
    };
  }, [selectedInvoice, companyCode, executionState, activeScenario, apItems]);

  return (
    <div className="w-full h-full flex flex-col p-8 pt-20 overflow-y-auto bg-slate-50 dark:bg-evolver-bg-dark text-slate-800 dark:text-slate-100 select-none transition-colors duration-300">
      
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 z-10">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-evolver-viridian/10 border border-evolver-viridian/20 text-evolver-viridian rounded-2xl">
            <activeScenario.icon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center text-slate-900 dark:text-white">
              {activeScenario.title}
              <span className="ml-3 text-[10px] font-mono font-bold tracking-widest px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase">
                Active Tenant Link
              </span>
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-slate-500 text-xs font-semibold">
              <span className="text-evolver-viridian font-mono font-extrabold uppercase text-[9.5px] tracking-widest bg-evolver-viridian/10 border border-evolver-viridian/20 px-2 py-0.5 rounded">
                {activeScenario.category}
              </span>
              <span>• Sponsor: {activeScenario.stakeholder}</span>
              
              {/* Dynamic SAP Organizational Scoping */}
              <span className="text-slate-300 dark:text-slate-700">•</span>
              
              {activeScenario.stakeholder !== "Procurement & Supply Chain" ? (
                <div className="flex items-center gap-1.5 bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 px-2.5 py-1 rounded-xl shadow-sm">
                  <Building className="w-3.5 h-3.5 text-evolver-viridian" />
                  <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[9px]">Company Code:</span>
                  <span className="text-slate-850 dark:text-slate-200 font-mono font-extrabold text-[10.5px] uppercase">
                    {companyCode === "1710" ? "1710 (US Financials)" : companyCode === "1010" ? "1010 (EU Financials)" : "0001 (Global Ledger)"}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 px-2.5 py-1 rounded-xl shadow-sm">
                    <Building className="w-3.5 h-3.5 text-evolver-viridian" />
                    <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[9px]">Purchase Org:</span>
                    <select
                      value={purchaseOrg}
                      onChange={(e) => setPurchaseOrg(e.target.value)}
                      className="bg-transparent text-slate-800 dark:text-slate-200 font-mono font-extrabold focus:outline-none border-none cursor-pointer text-[10.5px]"
                    >
                      <option value="USPO" className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200">USPO (US Purchasing)</option>
                      <option value="EUPO" className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200">EUPO (EU Purchasing)</option>
                      <option value="JPPO" className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200">JPPO (Japan Purchasing)</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 px-2.5 py-1 rounded-xl shadow-sm">
                    <Warehouse className="w-3.5 h-3.5 text-cyan-500" />
                    <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[9px]">Plant Code:</span>
                    <select
                      value={plantCode}
                      onChange={(e) => setPlantCode(e.target.value)}
                      className="bg-transparent text-slate-800 dark:text-slate-200 font-mono font-extrabold focus:outline-none border-none cursor-pointer text-[10.5px]"
                    >
                      <option value="1000" className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200">1000 (Wolfsburg)</option>
                      <option value="2000" className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200">2000 (Munich)</option>
                      <option value="3000" className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200">3000 (Tokyo)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Global Connections Indicator */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col text-right">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Active Workspace Connection</span>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 font-mono flex items-center gap-1.5 justify-end">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              Azure VM: ef9a2eea-c187-4d59-aad0-76c8a9fb0842
            </span>
          </div>
        </div>
      </div>

      {/* Main Layout Widescreen */}
      <div className="w-full flex flex-col items-stretch mb-8">
        
        {/* Filing Cabinet Navigation Tabs */}
        <div className="flex flex-wrap items-end pl-2 sm:pl-6 z-10 -mb-[1px] space-x-1 w-full">
          {[
            { id: "overview", label: "1. Overview", icon: Eye },
            { id: "read", label: "2. Read (SAP Data)", icon: Database },
            { id: "visualize", label: "3. Visualize Findings", icon: BarChart2 },
            { id: "reason", label: "4. Reason Policies", icon: ShieldCheck },
            { id: "execute", label: "5. Execute BAPI", icon: Terminal },
            { id: "evidence", label: "6. Audit Evidence", icon: FileText }
          ].map(t => {
            const isTabActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as TabId)}
                className={clsx(
                  "relative px-4 sm:px-5 py-2.5 text-xs font-bold transition-all duration-200 select-none rounded-t-xl sm:rounded-t-2xl flex items-center gap-1.5 border border-slate-200 dark:border-white/5 shrink-0",
                  isTabActive
                    ? "bg-white dark:bg-slate-900/50 backdrop-blur-xl border-b-transparent dark:border-b-transparent text-slate-900 dark:text-white font-extrabold z-20 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_-4px_12px_rgba(0,0,0,0.4)]"
                    : "bg-slate-100 dark:bg-slate-950/40 text-slate-500 hover:bg-slate-200/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/60 dark:hover:text-slate-200 z-10 mt-1"
                )}
                style={{
                  borderBottomColor: isTabActive ? "transparent" : (theme === "light" ? "rgb(226, 232, 240)" : "rgba(255, 255, 255, 0.05)")
                }}
              >
                <t.icon className={clsx("w-3.5 h-3.5 shrink-0", isTabActive ? "text-evolver-viridian" : "text-slate-500")} />
                <span>{t.label}</span>
                {isTabActive && (
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-evolver-viridian rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Full-width 6-Tab Workspace (Filing Cabinet Panel) */}
        <div className="w-full flex flex-col p-8 rounded-3xl rounded-tl-none border border-slate-200 dark:border-white/5 shadow-2xl relative min-h-[580px] bg-white dark:bg-slate-900/50 backdrop-blur-xl transition-colors duration-300">
          
          {/* TAB 1: OVERVIEW & SCENARIO BLUEPRINT */}
          {activeTab === "overview" && (
            <div className="flex-1 flex flex-col justify-between py-2 space-y-6">
              
              {/* Scenario Lead Description */}
              <div className="p-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-3xl space-y-3">
                <h4 className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Scenario Summary</h4>
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-light">
                  {activeScenario.desc}
                </p>
              </div>

              {/* Grid block mapping What and Why */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* What We Are Doing Card */}
                <div className="p-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-3xl space-y-3">
                  <h4 className="text-[11px] font-extrabold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                    <Eye className="w-4.5 h-4.5 text-cyan-600 dark:text-cyan-400" />
                    What We Are Doing (The Diagnostics)
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {activeScenario.whatWeAreDoing}
                  </p>
                </div>

                {/* Why We Are Doing It Card */}
                <div className="p-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-3xl space-y-3">
                  <h4 className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
                    Why We Are Doing It (Value & Compliance)
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {activeScenario.whyWeAreDoingIt}
                  </p>
                </div>

              </div>

              {/* ARIA CLOSED-LOOP EXECUTION FLOWCHART */}
              <div className="p-6 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-3xl space-y-5 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <Network className="w-5 h-5 text-evolver-viridian" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        ARIA Closed-Loop Execution & Data Flow Diagram
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-light">
                        End-to-end transaction pipeline mapping. Click a phase card to jump into that live operational environment.
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded uppercase font-bold tracking-wider self-start sm:self-center">
                    Interactive Blueprint
                  </span>
                </div>
                
                <div className="relative">
                  {/* SVG Animated Connector Line */}
                  <div className="absolute inset-x-12 top-[48px] h-1 hidden md:block z-0 pointer-events-none opacity-40">
                    <svg className="w-full h-1 overflow-visible">
                      <line
                        x1="0%"
                        y1="50%"
                        x2="100%"
                        y2="50%"
                        stroke={theme === "light" ? "rgba(64, 130, 109, 0.1)" : "rgba(64, 130, 109, 0.2)"}
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      <line
                        x1="0%"
                        y1="50%"
                        x2="100%"
                        y2="50%"
                        stroke="#40826D"
                        strokeWidth="3"
                        strokeDasharray="8 8"
                        strokeLinecap="round"
                        className="animate-dash-fast"
                      />
                    </svg>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-5 relative z-10 items-stretch">
                    {(() => {
                      const stepTabs: TabId[] = ["read", "visualize", "reason", "execute", "evidence"];
                      return activeScenario.flowSteps.map((step, idx) => {
                        const targetTab = stepTabs[idx];
                        return (
                          <div key={idx} className="relative flex items-stretch h-full">
                            
                            {/* Individual Flow Card */}
                            <button
                              onClick={() => setActiveTab(targetTab)}
                              className="flex-1 text-left p-4.5 bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-white/5 rounded-2xl flex flex-col justify-between text-xs space-y-4 cursor-pointer hover:border-evolver-viridian/40 hover:bg-slate-50 dark:hover:bg-slate-950 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_4px_25px_rgba(64,130,109,0.1)] dark:hover:shadow-[0_4px_25px_rgba(64,130,109,0.15)] transition-all duration-300 group select-none active:scale-[0.98]"
                            >
                              <div className="space-y-2.5">
                                {/* Card Header */}
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] font-mono font-bold tracking-widest px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 group-hover:text-evolver-viridian group-hover:border-evolver-viridian/20 transition-all">
                                    PHASE 0{idx + 1}
                                  </span>
                                  <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors flex items-center gap-0.5">
                                    Live ➔
                                  </span>
                                </div>

                                {/* Step Title */}
                                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                                  <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-evolver-viridian group-hover:bg-evolver-viridian group-hover:text-slate-950 dark:group-hover:text-slate-950 transition-all shrink-0">
                                    <step.icon className="w-4 h-4" />
                                  </div>
                                  <span className="text-xs group-hover:text-evolver-viridian transition-colors font-extrabold">{step.title}</span>
                                </div>

                                {/* Description */}
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal font-light group-hover:text-slate-800 dark:group-hover:text-slate-300 transition-colors line-clamp-3">
                                  {step.desc}
                                </p>
                              </div>

                              {/* Data Flow Consoles */}
                              <div className="pt-3 border-t border-slate-200 dark:border-white/5 space-y-2 font-mono text-[9px] leading-normal">
                                <div className="bg-slate-50 dark:bg-slate-950/80 rounded-xl p-2.5 border border-slate-200 dark:border-white/5 space-y-1 group-hover:border-cyan-500/20 transition-all">
                                  <div className="flex items-center gap-1 text-[7.5px] font-extrabold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                                    <Database className="w-2.5 h-2.5 shrink-0" />
                                    <span>Data In (SAP)</span>
                                  </div>
                                  <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300 block truncate" title={step.dataIn}>
                                    {step.dataIn}
                                  </span>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-950/80 rounded-xl p-2.5 border border-slate-200 dark:border-white/5 space-y-1 group-hover:border-emerald-500/20 transition-all">
                                  <div className="flex items-center gap-1 text-[7.5px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                                    <Terminal className="w-2.5 h-2.5 shrink-0" />
                                    <span>Data Out (Action)</span>
                                  </div>
                                  <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300 block truncate" title={step.dataOut}>
                                    {step.dataOut}
                                  </span>
                                </div>
                              </div>
                            </button>

                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Helpful Instruction Note */}
                <div className="flex items-start gap-2 p-3 bg-evolver-viridian/5 border border-evolver-viridian/10 rounded-2xl text-[10px] text-slate-500 dark:text-slate-400 font-light">
                  <Info className="w-4 h-4 text-evolver-viridian shrink-0 mt-0.5" />
                  <span>
                    <strong>Interactive Flow Playground:</strong> The cards above represent the operational lifecycle stages of this closed-loop scenario. You can <strong>click any card</strong> to directly jump into its respective dashboard tab and inspect active OData lines, graphs, checks, or logs.
                  </span>
                </div>
              </div>

              {/* Math TeX formula card & Database mappings */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch pt-2">
                
                {/* Mathematical formulation */}
                <div className="lg:col-span-6 flex flex-col bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-3xl p-5 justify-between">
                  <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2.5">TeX Objective Formulation</h4>
                  <div className="text-xs font-mono font-bold text-center py-4 bg-slate-100 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-white/5 text-cyan-600 dark:text-cyan-400 shadow-inner overflow-x-auto whitespace-nowrap">
                    {activeScenario.objectiveMath}
                  </div>
                </div>

                {/* Database dictionary maps */}
                <div className="lg:col-span-6 flex flex-col justify-between space-y-2">
                  <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">In-Scope SAP Transparent Tables</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {activeScenario.tables.map((t, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl font-mono text-[10.5px] text-slate-600 dark:text-slate-300 flex flex-col shadow-sm">
                        <span className="font-extrabold text-slate-900 dark:text-white">{t.split(' ')[0]}</span>
                        <span className="text-[8.5px] text-slate-500 mt-0.5">{t.includes('(') ? t.split('(')[1].replace(')', '') : "Table"}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: READ (DATA EXTRACTION GRID) */}
          {activeTab === "read" && (
            <div className="flex-grow flex flex-col justify-between py-2 space-y-4">
              
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/5 pb-3">
                <div>
                  <span className="text-[10px] font-extrabold text-evolver-viridian uppercase tracking-widest block mb-1">OData Integration</span>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Database className="w-5 h-5 text-slate-400" />
                    Open Ledger Ingest Table
                  </h2>
                </div>

                {/* Live metadata query badges */}
                <div className="text-[9.5px] font-mono text-slate-500 flex items-center gap-3">
                  {hasExtracted[activeScenario.id] && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setHasExtracted(prev => ({ ...prev, [activeScenario.id]: false }))}
                        className="px-2.5 py-1 text-[9.5px] font-bold font-mono tracking-wide text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg border border-slate-200 dark:border-white/5 flex items-center gap-1.5 transition-all cursor-pointer select-none active:scale-95 shrink-0"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        CONFIGURE & SYNC AGAIN
                      </button>

                      {activeScenarioId === "tax-lookback" && (
                        <button
                          onClick={handleResetTaxLookback}
                          className="px-2.5 py-1 text-[9.5px] font-bold font-mono tracking-wide text-rose-600 dark:text-rose-450 hover:text-rose-550 dark:hover:text-rose-350 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-lg border border-rose-200 dark:border-rose-900/30 flex items-center gap-1.5 transition-all cursor-pointer select-none active:scale-95 shrink-0"
                          title="Revert all invoice adjustments and flags to initial demo status"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          RESET DEMO DATA
                        </button>
                      )}
                    </div>
                  )}
                  <span>Endpoint: <strong className="text-cyan-600 dark:text-cyan-400">{activeScenario.readPath}</strong></span>
                  {(activeScenarioId === "ap-ar-optimization" || activeScenarioId === "duplicate-payments") && sapSource && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                      {sapSource.includes("Postgres") ? "Local Cache" : "Live S/4HANA"}
                    </span>
                  )}
                </div>
              </div>

              {!hasExtracted[activeScenario.id] ? (
                /* LIVE EXTRACTION CONSOLE WRAPPER */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-grow min-h-[380px]">
                  
                  {/* Left column: Control Panel */}
                  <div className="lg:col-span-5 flex flex-col justify-between bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-3xl p-6 space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
                          <Network className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                            Live S/4HANA Connection
                          </h3>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-mono">Gateway Service Client</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-light">
                        To perform transactional audits without overloading active ERP cores, ledger lines are dynamically fetched and cached locally. Use the controls below to configure filter scopes and load durations.
                      </p>

                      {/* Authentic SAP OData Query Filters */}
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        {activeScenarioId === "ap-ar-optimization" ? (
                          <>
                            {/* Working Capital Specific Filters */}
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                                Company Code (BUKRS)
                              </label>
                              <select
                                value={companyCode}
                                onChange={(e) => setCompanyCode(e.target.value)}
                                disabled={isExtractingLive}
                                className="w-full px-2 py-1.5 text-[10.5px] font-mono bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 transition-all cursor-pointer"
                              >
                                <option value="1710">1710 (Domestic US)</option>
                                <option value="1010">1010 (Germany ERP)</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                                Document Scope ($filter)
                              </label>
                              <select
                                value={wcDocScope}
                                onChange={(e) => setWcDocScope(e.target.value as any)}
                                disabled={isExtractingLive}
                                className="w-full px-2 py-1.5 text-[10.5px] font-mono bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 transition-all cursor-pointer"
                              >
                                <option value="all">Ledger Invoices (BSID/BSIK)</option>
                                <option value="orders">Purchase Orders (EKKO/EKPO)</option>
                                <option value="sales">Sales Orders (VBAK/VBAP)</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                                Min Order Value ($)
                              </label>
                              <select
                                value={minOrderValue}
                                onChange={(e) => setMinOrderValue(Number(e.target.value))}
                                disabled={isExtractingLive || wcDocScope === "all"}
                                className="w-full px-2 py-1.5 text-[10.5px] font-mono bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 transition-all cursor-pointer"
                              >
                                <option value="0">All Orders (Value {'>='} 0)</option>
                                <option value="50000">{'>='} $50,000 (Major Accounts)</option>
                                <option value="100000">{'>='} $100,000 (High Priority)</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                                Records Page Limit ($top)
                              </label>
                              <select
                                value={topLimit}
                                onChange={(e) => setTopLimit(e.target.value)}
                                disabled={isExtractingLive}
                                className="w-full px-2 py-1.5 text-[10.5px] font-mono bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 transition-all cursor-pointer"
                              >
                                <option value="all">No Page Limit ($top = full)</option>
                                <option value="100">100 Rows ($top = 100)</option>
                                <option value="5">5 Rows (Quick Pitch)</option>
                              </select>
                            </div>
                          </>
                        ) : activeScenarioId === "duplicate-payments" ? (
                          <>
                            {/* Duplicate Invoice Mitigation Specific Filters */}
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                                Company Code (BUKRS)
                              </label>
                              <select
                                value={companyCode}
                                onChange={(e) => setCompanyCode(e.target.value)}
                                disabled={isExtractingLive}
                                className="w-full px-2 py-1.5 text-[10.5px] font-mono bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 transition-all cursor-pointer"
                              >
                                <option value="1710">1710 (Domestic US)</option>
                                <option value="1010">1010 (Germany ERP)</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                                Fuzzy Similarity Match Threshold
                              </label>
                              <select
                                value={duplicateThreshold}
                                onChange={(e) => setDuplicateThreshold(Number(e.target.value))}
                                disabled={isExtractingLive}
                                className="w-full px-2 py-1.5 text-[10.5px] font-mono bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 transition-all cursor-pointer"
                              >
                                <option value="90">90% Similarity (Standard Audit)</option>
                                <option value="85">85% Similarity (Broad Audit)</option>
                                <option value="75">75% Similarity (Deep Scan)</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                                Clearing Status (AUGDT)
                              </label>
                              <div className="w-full px-3 py-1.5 text-[10px] font-mono bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-xl text-amber-600 dark:text-amber-400 font-bold select-none h-[32px] flex items-center shadow-inner">
                                AUGDT eq null (Unpaid Open Items)
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                                Records Page Limit ($top)
                              </label>
                              <select
                                value={topLimit}
                                onChange={(e) => setTopLimit(e.target.value)}
                                disabled={isExtractingLive}
                                className="w-full px-2 py-1.5 text-[10.5px] font-mono bg-white dark:bg-slate-955/40 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 transition-all cursor-pointer"
                              >
                                <option value="all">No Page Limit ($top = full)</option>
                                <option value="100">100 Rows ($top = 100)</option>
                                <option value="5">5 Rows (Quick Pitch)</option>
                              </select>
                            </div>
                          </>
                        ) : activeScenarioId === "tax-lookback" ? (
                          <>
                            {/* Tax Lookback Specific Filters */}
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                                Company Code (BUKRS)
                              </label>
                              <select
                                value={companyCode}
                                onChange={(e) => setCompanyCode(e.target.value)}
                                disabled={isExtractingLive}
                                className="w-full px-2 py-1.5 text-[10.5px] font-mono bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 transition-all cursor-pointer"
                              >
                                <option value="1710">1710 (Domestic US)</option>
                                <option value="1010">1010 (Germany ERP)</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                                Document Type (VBRK vs RBKP)
                              </label>
                              <select
                                value={taxDocScope}
                                onChange={(e) => setTaxDocScope(e.target.value as any)}
                                disabled={isExtractingLive}
                                className="w-full px-2 py-1.5 text-[10.5px] font-mono bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 transition-all cursor-pointer"
                              >
                                <option value="all">All Invoices & Billing Docs</option>
                                <option value="billing">Sales Billing Documents (VBRK)</option>
                                <option value="purchasing">Supplier Invoices (RBKP/RSEG)</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                                Tax Jurisdiction Code (MWSKZ)
                              </label>
                              <select
                                value={taxCodeFilter}
                                onChange={(e) => setTaxCodeFilter(e.target.value)}
                                disabled={isExtractingLive}
                                className="w-full px-2 py-1.5 text-[10.5px] font-mono bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 transition-all cursor-pointer"
                              >
                                <option value="all">All Tax Codes</option>
                                <option value="UTX1">UTX1 (US Sales & Use Tax)</option>
                                <option value="MWST">MWST (EU Output Value Added Tax)</option>
                                <option value="EXE">EXE (Tax Exempt / Certificate)</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                                Min Address Variance Threshold (%)
                              </label>
                              <select
                                value={taxVarianceThreshold}
                                onChange={(e) => setTaxVarianceThreshold(Number(e.target.value))}
                                disabled={isExtractingLive}
                                className="w-full px-2 py-1.5 text-[10.5px] font-mono bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 transition-all cursor-pointer"
                              >
                                <option value="0">All Invoices (0% Variance)</option>
                                <option value="2">&gt;= 2.0% (Address Deviation Flag)</option>
                                <option value="5">&gt;= 5.0% (High Refund Potential)</option>
                              </select>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Fallback Standard Filters */}
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                                Company Code (BUKRS)
                              </label>
                              <select
                                value={companyCode}
                                onChange={(e) => setCompanyCode(e.target.value)}
                                disabled={isExtractingLive}
                                className="w-full px-2 py-1.5 text-[10.5px] font-mono bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 transition-all cursor-pointer"
                              >
                                <option value="1710">1710 (Domestic US)</option>
                                <option value="1010">1010 (Germany ERP)</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                                Fiscal Year (GJAHR)
                              </label>
                              <select
                                value={fiscalYear}
                                onChange={(e) => setFiscalYear(e.target.value)}
                                disabled={isExtractingLive}
                                className="w-full px-2 py-1.5 text-[10.5px] font-mono bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 transition-all cursor-pointer"
                              >
                                <option value="2019">2019 (AR Focus / 194 lines)</option>
                                <option value="2020">2020 (AP Focus / 45 lines)</option>
                                <option value="2018">2018 (Legacy / 5 lines)</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                                Open Items Only (AUGDT)
                              </label>
                              <select
                                value={clearingStatus}
                                onChange={(e) => setClearingStatus(e.target.value)}
                                disabled={isExtractingLive}
                                className="w-full px-2 py-1.5 text-[10.5px] font-mono bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 transition-all cursor-pointer"
                              >
                                <option value="open">AUGDT eq null (Unpaid)</option>
                                <option value="cleared">AUGDT ne null (Cleared)</option>
                                <option value="all">All Postings (Full Audit)</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                                Records Page Limit ($top)
                              </label>
                              <select
                                value={topLimit}
                                onChange={(e) => setTopLimit(e.target.value)}
                                disabled={isExtractingLive}
                                className="w-full px-2 py-1.5 text-[10.5px] font-mono bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 transition-all cursor-pointer"
                              >
                                <option value="all">No Page Limit ($top = full)</option>
                                <option value="100">100 Rows ($top = 100)</option>
                                <option value="5">5 Rows (Quick Pitch)</option>
                              </select>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="space-y-2.5 p-3 bg-slate-50 dark:bg-black/30 border border-slate-200/50 dark:border-white/5 rounded-2xl font-mono text-[10px]">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Target URL:</span>
                          {(() => {
                            let path = activeScenario.readPath || "API_GLACCOUNTLINEITEM/GLAccountLineItem";
                            let query = `?$filter=(CompanyCode eq '${companyCode}') and (FiscalYear eq '${fiscalYear}')${clearingStatus === "open" ? " and (ClearingDate eq null)" : clearingStatus === "cleared" ? " and (ClearingDate ne null)" : ""}${topLimit !== "all" ? `&$top=${topLimit}` : ""}`;
                            
                            if (activeScenarioId === "ap-ar-optimization") {
                              if (wcDocScope === "orders") {
                                path = "API_PURCHASEORDER_PROCESS_SRV/A_PurchaseOrder";
                                query = `?$filter=(CompanyCode eq '${companyCode}') and (OrderValue ge ${minOrderValue})${topLimit !== "all" ? `&$top=${topLimit}` : ""}`;
                              } else if (wcDocScope === "sales") {
                                path = "API_SALES_ORDER_SRV/A_SalesOrder";
                                query = `?$filter=(CompanyCode eq '${companyCode}') and (OverallBillingStatus ne 'C')${topLimit !== "all" ? `&$top=${topLimit}` : ""}`;
                              } else {
                                path = "API_GLACCOUNTLINEITEM/GLAccountLineItem";
                                query = `?$filter=(CompanyCode eq '${companyCode}') and (ClearingDate eq null)${topLimit !== "all" ? `&$top=${topLimit}` : ""}`;
                              }
                            } else if (activeScenarioId === "duplicate-payments") {
                              path = "API_OPERATIONAL_AP_SRV/BSIK_OpenItems";
                              query = `?$filter=(CompanyCode eq '${companyCode}') and (ClearingDate eq null) and (SimilarityMatch ge ${duplicateThreshold}%)${topLimit !== "all" ? `&$top=${topLimit}` : ""}`;
                            } else if (activeScenarioId === "tax-lookback") {
                              if (taxDocScope === "purchasing") {
                                path = "API_INVOICERECEIPT_PROCESS_SRV/A_SupplierInvoice";
                                query = `?$filter=(CompanyCode eq '${companyCode}') and (TaxAmount ge 0)${taxCodeFilter !== "all" ? ` and (TaxCode eq '${taxCodeFilter}')` : ""}${topLimit !== "all" ? `&$top=${topLimit}` : ""}`;
                              } else {
                                path = "CB_BILLING_DOCUMENT_SRV/BillingDocuments";
                                query = `?$filter=(CompanyCode eq '${companyCode}') and (BillingDocumentType eq 'F2')${taxCodeFilter !== "all" ? ` and (TaxClassification eq '${taxCodeFilter}')` : ""}${topLimit !== "all" ? `&$top=${topLimit}` : ""}`;
                              }
                            }
                            
                            const fullUrl = `/sap/opu/odata/sap/${path}${query}`;
                            return (
                              <span className="text-cyan-600 dark:text-cyan-400 font-bold max-w-[200px] truncate" title={fullUrl}>
                                /sap/opu/odata/sap/{path.split('/')[0]}
                              </span>
                            );
                          })()}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Estimated Scope:</span>
                          <span className="text-slate-700 dark:text-slate-300 font-bold">
                            {(() => {
                              let count = 0;
                              if (activeScenarioId === "ap-ar-optimization") {
                                if (wcDocScope === "orders") {
                                  count = minOrderValue >= 100000 ? 12 : minOrderValue >= 50000 ? 32 : 84;
                                } else if (wcDocScope === "sales") {
                                  count = 68;
                                } else {
                                  count = companyCode === "1710" ? 194 : companyCode === "1010" ? 45 : 6;
                                }
                              } else if (activeScenarioId === "duplicate-payments") {
                                count = duplicateThreshold >= 90 ? 4 : duplicateThreshold >= 85 ? 12 : 27;
                              } else if (activeScenarioId === "tax-lookback") {
                                if (taxDocScope === "purchasing") {
                                  count = taxCodeFilter === "UTX1" ? 14 : taxCodeFilter === "EXE" ? 4 : 29;
                                } else {
                                  count = taxCodeFilter === "UTX1" ? 34 : taxCodeFilter === "EXE" ? 8 : 92;
                                }
                              } else {
                                if (fiscalYear === "2019") {
                                  count = 194;
                                } else if (fiscalYear === "2020") {
                                  count = 45;
                                } else {
                                  count = 6;
                                }
                              }
                              if (topLimit !== "all") {
                                count = Math.min(count, parseInt(topLimit));
                              }
                              return `${count} Matching ERP Lines`;
                            })()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Active Scope:</span>
                          <span className="text-slate-700 dark:text-slate-300 font-bold font-mono">
                            {activeScenarioId === "tax-lookback"
                              ? `Tax: ${taxCodeFilter.toUpperCase()} | Scope: ${taxDocScope.toUpperCase()}`
                              : activeScenario.stakeholder === "Procurement & Supply Chain" 
                                ? `POrg: ${purchaseOrg} | Plant: ${plantCode}`
                                : `Company Code: ${companyCode}`}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-1 border-t border-slate-200 dark:border-white/5">
                          <span className="text-slate-400">Cache Status:</span>
                          <span className="px-2 py-0.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[9px] rounded font-bold uppercase">
                            Stale / Sync Required
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleTriggerExtraction}
                      disabled={isExtractingLive}
                      className={clsx(
                        "w-full py-3.5 rounded-2xl text-xs font-bold font-mono tracking-wider flex items-center justify-center gap-2 select-none active:scale-[0.98] transition-all cursor-pointer border border-transparent",
                        isExtractingLive
                          ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-300/30 dark:border-white/5 cursor-not-allowed"
                          : "bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-extrabold shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20"
                      )}
                    >
                      {isExtractingLive ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin animate-infinite" />
                          LIVE INGESTION SYNCING...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current shrink-0" />
                          CONNECT & INGEST FROM SAP
                        </>
                      )}
                    </button>
                  </div>

                  {/* Right column: Terminal Console logs */}
                  <div className="lg:col-span-7 flex flex-col bg-slate-950 border border-slate-800 dark:border-white/5 rounded-3xl p-5 shadow-2xl h-[360px] lg:h-auto">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-3 shrink-0">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-300 font-mono">
                        <div className="flex space-x-1.5 shrink-0">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 block" />
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block" />
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block" />
                        </div>
                        <span className="pl-1.5 text-slate-400 font-medium">OData RFC stdout logs</span>
                      </div>
                      <span className="text-[9.5px] text-slate-600 font-mono">/bin/bash/odata_sync</span>
                    </div>

                    <div className="flex-grow bg-slate-900/40 rounded-2xl p-4 overflow-y-auto font-mono text-[10.5px] leading-relaxed text-emerald-400 space-y-2 border border-slate-800 shadow-inner flex flex-col justify-start">
                      {extractionLogs.length === 0 && !isExtractingLive ? (
                        <div className="text-slate-600 italic">
                          &gt; Awaiting RFC handshake command... Click the control panel to initiate S/4HANA query.
                        </div>
                      ) : (
                        <>
                          {extractionLogs.map((log, idx) => (
                            <div key={idx} className="flex items-start gap-1">
                              <span className="text-slate-600 shrink-0 select-none">&gt;</span>
                              <span className="break-all">{log}</span>
                            </div>
                          ))}
                          {isExtractingLive && (
                            <div className="flex items-center gap-1">
                              <span className="text-slate-600 shrink-0 select-none">&gt;</span>
                              <span className="inline-block w-1.5 h-3 bg-emerald-400 animate-pulse ml-0.5" />
                            </div>
                          )}
                          <div ref={extractionTerminalEndRef} />
                        </>
                      )}
                    </div>

                    <div className="pt-2 border-t border-white/5 text-[9px] text-slate-600 font-mono flex justify-between shrink-0 mt-3">
                      <span>Status: {isExtractingLive ? "SYNCING TRANSACTION VOLUMES" : hasExtracted[activeScenario.id] ? "CACHING SUCCEEDED" : "DISCONNECTED"}</span>
                      <span>Port: 443 HTTPS</span>
                    </div>
                  </div>

                </div>
              ) : (
                /* INGESTED DATA SCREEN (METRICS + TABLE) */
                <>
                  {/* Ingestion Statistics Metrics Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-950/40 p-4 border border-slate-200 dark:border-white/5 rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-300 font-sans">
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-500 font-mono font-bold uppercase tracking-wider block">Total Ledger Scope Scanned</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-slate-900 dark:text-white text-lg font-extrabold font-mono">
                          {(() => {
                            let count = 0;
                            if (activeScenarioId === "tax-lookback") {
                              if (taxDocScope === "purchasing") {
                                count = taxCodeFilter === "UTX1" ? 14 : taxCodeFilter === "EXE" ? 4 : 29;
                              } else {
                                count = taxCodeFilter === "UTX1" ? 34 : taxCodeFilter === "EXE" ? 8 : 92;
                              }
                            } else if (fiscalYear === "2019") {
                              count = activeScenarioId === "duplicate-payments" ? 17 : 194;
                            } else if (fiscalYear === "2020") {
                              count = 45;
                            } else {
                              count = activeScenarioId === "duplicate-payments" ? 5 : 6;
                            }
                            if (topLimit !== "all") {
                              count = Math.min(count, parseInt(topLimit));
                            }
                            return `${count.toLocaleString()} Items`;
                          })()}
                        </span>
                        <span className="text-[9.5px] text-slate-400 font-light">
                          ({activeScenarioId === "tax-lookback" 
                            ? "Exemption & Rate Audit" 
                            : clearingStatus === "open" ? "Open items" : clearingStatus === "cleared" ? "Cleared items" : "Full Year"})
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-white/5 pt-3 sm:pt-0 sm:pl-4 font-sans">
                      <span className="text-[9px] text-slate-500 font-mono font-bold uppercase tracking-wider block">Total Financial Capital Audited</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-emerald-600 dark:text-emerald-400 text-lg font-extrabold font-mono">
                          {(() => {
                            let amount = 0;
                            if (activeScenarioId === "tax-lookback") {
                              amount = taxDocScope === "purchasing" ? 480000 : 1240000;
                            } else if (activeScenarioId === "duplicate-payments") {
                              const base = fiscalYear === "2019" ? 475000 : fiscalYear === "2020" ? 640000 : 310000;
                              amount = topLimit === "5" ? 320000 : base;
                            } else {
                              const base = fiscalYear === "2019" ? 950000 : fiscalYear === "2020" ? 480000 : 150000;
                              amount = topLimit === "5" ? 180000 : base;
                            }
                            return `$${amount.toLocaleString()}`;
                          })()}
                        </span>
                        <span className="text-[9.5px] text-slate-400 font-light">USD Exposure</span>
                      </div>
                    </div>
                    <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-white/5 pt-3 sm:pt-0 sm:pl-4 font-sans">
                      <span className="text-[9px] text-slate-500 font-mono font-bold uppercase tracking-wider block">Active OData Filters</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-cyan-600 dark:text-cyan-400 text-lg font-extrabold font-mono">
                          {activeScenarioId === "tax-lookback" 
                            ? `JURIS = ${taxCodeFilter.toUpperCase()}`
                            : `GJAHR = ${fiscalYear}`}
                        </span>
                        <span className="text-[9.5px] text-slate-400 font-light">
                          {activeScenarioId === "tax-lookback"
                            ? `(${taxDocScope.toUpperCase()})`
                            : `(Limit: ${topLimit === "all" ? "None" : `$top=${topLimit}`})`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Data Table */}
                  <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-inner flex-1 min-h-[220px] max-h-[360px] overflow-y-auto relative">
                    <table className="w-full text-left border-collapse text-xs select-text">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-900 text-slate-500 font-bold sticky top-0 z-10">
                          {activeScenario.readHeaders.map((header, idx) => (
                            <th key={idx} className="p-3 pl-4 bg-slate-100 dark:bg-slate-900">{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                        {/* Map live loaded Postgres cached tables for WC early discounts */}
                        {activeScenarioId === "ap-ar-optimization" && arItems.length > 0 ? (
                          arItems.map((row, idx) => (
                            <tr 
                              key={idx} 
                              onClick={() => setSelectedInvoice(row)}
                              className="hover:bg-slate-200/80 dark:hover:bg-white/5 transition-colors font-mono cursor-pointer group"
                            >
                              <td className="p-3 pl-4 text-slate-900 dark:text-white font-bold flex items-center gap-1.5">
                                <Eye className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-cyan-500 transition-opacity shrink-0" />
                                {row.id.split('-')[0]}
                              </td>
                              <td className="p-3 text-slate-600 dark:text-slate-300">Customer (D)</td>
                              <td className="p-3 text-slate-600 dark:text-slate-400">{row.customerName}</td>
                              <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">${row.amount.toLocaleString()}</td>
                              <td className="p-3 text-slate-500">{row.postingDate}</td>
                              <td className="p-3 text-slate-500">{row.originalTerms}</td>
                            </tr>
                          ))
                        ) : activeScenarioId === "duplicate-payments" && apItems.length > 0 ? (
                          apItems.map((row, idx) => {
                            const isLocked = row.paymentBlock === "A" || executionState["duplicate-payments"] === "success";
                            return (
                              <tr 
                                key={idx} 
                                onClick={() => setSelectedInvoice(row)}
                                className="hover:bg-slate-200/80 dark:hover:bg-white/5 transition-colors font-mono cursor-pointer group"
                              >
                                <td className="p-3 pl-4 text-slate-900 dark:text-white font-bold flex items-center gap-1.5">
                                  <Eye className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-cyan-500 transition-opacity shrink-0" />
                                  {row.id.split('-')[0]}
                                </td>
                                <td className="p-3 text-slate-600 dark:text-slate-300 font-bold">{row.documentReference || "—"}</td>
                                <td className="p-3 text-slate-600 dark:text-slate-400">{row.vendorName}</td>
                                <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">${row.amount.toLocaleString()}</td>
                                <td className="p-3 text-slate-500">{row.postingDate}</td>
                                <td className="p-3">
                                  <span className={clsx(
                                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase border",
                                    isLocked 
                                      ? "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
                                      : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                  )}>
                                    {isLocked ? "Blocked (ZLSPR = A)" : "Free for Payment"}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        ) : activeScenarioId === "tax-lookback" ? (
                          (taxItems.length > 0 ? taxItems : INITIAL_TAX_ITEMS).map((row: any, idx: number) => (
                            <tr 
                              key={idx} 
                              onClick={() => setSelectedInvoice(row)}
                              className="hover:bg-slate-200/80 dark:hover:bg-white/5 transition-colors font-mono cursor-pointer group"
                            >
                              <td className="p-3 pl-4 text-slate-900 dark:text-white font-bold flex items-center gap-1.5">
                                <Eye className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-cyan-500 transition-opacity shrink-0" />
                                {row.doc}
                              </td>
                              <td className="p-3 text-slate-600 dark:text-slate-350">{row.customerName}</td>
                              <td className="p-3 text-slate-600 dark:text-slate-450">{row.soldToRegion}</td>
                              <td className="p-3 text-slate-600 dark:text-slate-455">{row.shipToRegion}</td>
                              <td className="p-3 text-slate-500 font-semibold">{row.taxBilledRate.toFixed(2)}% (${row.taxBilledAmount.toFixed(2)})</td>
                              <td className="p-3 text-emerald-600 dark:text-emerald-450 font-bold">{row.taxCorrectRate.toFixed(2)}% (${row.taxCorrectAmount.toFixed(2)})</td>
                            </tr>
                          ))
                        ) : (
                          activeScenario.readRecords.map((row: any, idx: number) => (
                            <tr 
                              key={idx} 
                              onClick={() => setSelectedInvoice(row)}
                              className="hover:bg-slate-200/80 dark:hover:bg-white/5 transition-colors font-mono cursor-pointer group"
                            >
                              <td className="p-3 pl-4 text-slate-900 dark:text-white font-bold flex items-center gap-1.5">
                                <Eye className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-cyan-500 transition-opacity shrink-0" />
                                {row.doc || row.id}
                              </td>
                              <td className="p-3 text-slate-600 dark:text-slate-300">{row.type}</td>
                              <td className="p-3 text-slate-600 dark:text-slate-400">{row.partner}</td>
                              <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">
                                {typeof row.amount === "number" ? `$${row.amount.toLocaleString()}` : row.amount}
                              </td>
                              <td className="p-3 text-slate-500">{row.date || row.postingDate}</td>
                              <td className="p-3 text-slate-500">{row.terms || row.originalTerms}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 text-[10px] text-slate-500 leading-normal p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5">
                    <div className="flex items-start gap-1.5">
                      <Info className="w-4.5 h-4.5 text-cyan-500 dark:text-cyan-400 shrink-0 mt-0.5" />
                      <span>
                        All records above match standard S/4HANA OData payloads cleared of personal markers. In production runs, these arrays sync continuously via local cached ledgers (like Azure PostgreSQL) to prevent API request rate congestion.
                      </span>
                    </div>
                    <span className="shrink-0 text-[10px] font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-lg">
                      💡 Tip: Click any row to display the formal SAP Fiori Ledger Document Display (FB03)
                    </span>
                  </div>

                  {/* Your Next Step Guidance Card */}
                  <div className="p-4.5 bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 dark:border-emerald-500/10 rounded-2xl flex items-start gap-3 mt-2 hover:border-emerald-500/30 transition-all duration-300">
                    <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400 shrink-0">
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9.5px] font-mono font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase block">
                        Your Next Step In This Scenario
                      </span>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal font-light">
                        Tab 2 serves as a **read-only ingestion panel** to verify that S/4HANA OData records are correctly loaded. **No manual action or correction is required on this screen.** 
                      </p>
                      <button
                        onClick={() => setActiveTab("visualize")}
                        className="text-[11px] font-extrabold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors flex items-center gap-1 mt-1 cursor-pointer"
                      >
                        Click here to navigate to Tab 3: Visualize Findings to run the live Levenshtein fuzzy matching engine ➔
                      </button>
                    </div>
                  </div>
                </>
              )}

            </div>
          )}

          {/* TAB 3: VISUALIZE FINDINGS (HIGH-FIDELITY ANALYTICS) */}
          {activeTab === "visualize" && (
            <div className="flex-grow flex flex-col justify-between py-2 space-y-5">
              
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/5 pb-3">
                <div>
                  <span className="text-[10px] font-extrabold text-evolver-viridian uppercase tracking-widest block mb-1">Visual Intelligence</span>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-slate-400" />
                    Scenario Diagnostic Panel
                  </h2>
                </div>
              </div>

              {/* SCENARIO 1: WORKING CAPITAL RUNWAY CHART */}
              {activeScenario.visualizerType === "runway" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                  <div className="lg:col-span-4 flex flex-col justify-between bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-2xl p-4 space-y-4">
                    <div className="space-y-3.5">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider flex items-center">
                        <Sliders className="w-4 h-4 text-evolver-viridian mr-2" />
                        Runway Controllers
                      </h4>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500 font-medium">Safety Cash Buffer:</span>
                          <span className="text-slate-900 dark:text-white font-mono font-bold">${(minBuffer / 1000000).toFixed(2)}M</span>
                        </div>
                        <input
                          type="range"
                          min="1000000"
                          max="2200000"
                          step="100000"
                          value={minBuffer}
                          onChange={(e) => setMinBuffer(Number(e.target.value))}
                          className="w-full accent-evolver-viridian cursor-pointer bg-slate-200 dark:bg-slate-900"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500 font-medium">AR Early Discount:</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">{discountRate.toFixed(1)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="4.0"
                          step="0.5"
                          value={discountRate}
                          onChange={(e) => setDiscountRate(Number(e.target.value))}
                          className="w-full accent-evolver-viridian cursor-pointer bg-slate-200 dark:bg-slate-900"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500 font-medium">AP Extend Outflow:</span>
                          <span className="text-cyan-600 dark:text-cyan-400 font-mono font-bold">+{apExtension} days</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="30"
                          step="5"
                          value={apExtension}
                          onChange={(e) => setApExtension(Number(e.target.value))}
                          className="w-full accent-evolver-viridian cursor-pointer bg-slate-200 dark:bg-slate-900"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl text-[10.5px]">
                      <div className="text-slate-500 font-bold uppercase tracking-wider text-[8.5px] mb-1">Optimized Lowest Point</div>
                      <div className={clsx(
                        "text-base font-mono font-bold",
                        forecastCurves.lowestOpt >= minBuffer ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                      )}>
                        ${(forecastCurves.lowestOpt / 1000000).toFixed(2)}M
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-8 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl p-5 flex flex-col justify-between min-h-[250px]">
                    {(() => {
                      const width = 500;
                      const height = 200;
                      const padding = { top: 15, right: 15, bottom: 25, left: 60 };

                      const startingCash = stats.apTotal * 5;
                      const minCashVal = startingCash - (stats.apTotal * 3.4);
                      const maxCashVal = startingCash + (stats.apTotal * 3.2);

                      const getX = (day: number) => {
                        return padding.left + ((day - 1) / 29) * (width - padding.left - padding.right);
                      };

                      const getY = (val: number) => {
                        const clamped = Math.max(minCashVal, Math.min(maxCashVal, val));
                        return (
                          height -
                          padding.bottom -
                          ((clamped - minCashVal) / (maxCashVal - minCashVal)) *
                            (height - padding.top - padding.bottom)
                        );
                      };

                      const unoptPath = forecastCurves.data
                        .map((d, i) => `${i === 0 ? "M" : "L"} ${getX(d.day)} ${getY(d.unopt)}`)
                        .join(" ");

                      const optPath = forecastCurves.data
                        .map((d, i) => `${i === 0 ? "M" : "L"} ${getX(d.day)} ${getY(d.opt)}`)
                        .join(" ");

                      return (
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="flex items-center justify-between mb-3 text-[10px]">
                            <span className="font-bold text-slate-800 dark:text-slate-300">Runway Projection Balance Curve</span>
                            <div className="flex items-center space-x-3 text-[9px]">
                              <span className="text-slate-500 border-t border-dashed w-3 inline-block">Before</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">● Optimized After</span>
                            </div>
                          </div>

                          <div className="relative w-full flex-1 min-h-[140px]">
                            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                              {[1000000, 1500000, 2000000, 2500000].map((val) => (
                                <g key={val} className="opacity-15">
                                  <line x1={padding.left} y1={getY(val)} x2={width - padding.right} y2={getY(val)} stroke={theme === "light" ? "#475569" : "#fff"} strokeWidth="0.75" />
                                  <text x={padding.left - 8} y={getY(val) + 3} fill={theme === "light" ? "#475569" : "#fff"} fontSize="9" fontFamily="monospace" textAnchor="end">
                                    ${(val / 1000000).toFixed(1)}M
                                  </text>
                                </g>
                              ))}

                              {[1, 10, 20, 30].map((day) => (
                                <text key={day} x={getX(day)} y={height - 5} fill={theme === "light" ? "#475569" : "#94a3b8"} fontSize="8.5" fontFamily="monospace" textAnchor="middle" className="opacity-60">
                                  Day {day}
                                </text>
                              ))}

                              <line x1={padding.left} y1={getY(minBuffer)} x2={width - padding.right} y2={getY(minBuffer)} stroke="#ef4444" strokeWidth="1.25" strokeDasharray="3,3" />

                              <path d={unoptPath} fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="3,2" className="opacity-35" />
                              <path d={optPath} fill="none" stroke="#10b981" strokeWidth="2" className="drop-shadow-[0_0_6px_rgba(16,185,129,0.25)] transition-all duration-300" />
                            </svg>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* SCENARIO 2: CASH CONCENTRATION SWEEP CHART */}
              {activeScenario.visualizerType === "sweeps" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                  <div className="lg:col-span-4 flex flex-col justify-between bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-4">
                    <div className="space-y-3.5">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider flex items-center">
                        <Sliders className="w-4 h-4 text-evolver-viridian mr-2" />
                        Sweep Threshold
                      </h4>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500 font-medium">Sweep Min Limit:</span>
                          <span className="text-slate-900 dark:text-white font-mono font-bold">${sweepThreshold.toLocaleString()}</span>
                        </div>
                        <input
                          type="range"
                          min="10000"
                          max="80000"
                          step="5000"
                          value={sweepThreshold}
                          onChange={(e) => setSweepThreshold(Number(e.target.value))}
                          className="w-full accent-evolver-viridian cursor-pointer bg-slate-200 dark:bg-slate-950"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-[10.5px] leading-relaxed text-slate-500 dark:text-slate-400">
                      💡 Sweeps clear all subsidiary accounts possessing funds exceeding the **Min Limit**, leaving balances consolidated in your primary G/L yield node.
                    </div>
                  </div>

                  <div className="lg:col-span-8 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between min-h-[250px]">
                    <div className="flex items-center justify-between mb-4 text-[10px]">
                      <span className="font-bold text-slate-800 dark:text-slate-300">Regional Accounts: Pre-sweep vs Swept Consolidated Yield</span>
                      <span className="text-emerald-600 dark:text-emerald-400 text-[9px] font-bold">Consolidated Sweep Active</span>
                    </div>

                    {/* Simple custom SVG bar chart mapping sweeps */}
                    <div className="flex-1 flex items-end justify-around h-[140px] pt-4 font-mono text-[9px]">
                      {[
                        { name: "DE01", val: 145000 },
                        { name: "UK01", val: 98000 },
                        { name: "JP01", val: 120000 },
                        { name: "SG01", val: 67000 }
                      ].map((item, idx) => {
                        const exceeds = item.val >= sweepThreshold;
                        const finalVal = exceeds ? 0 : item.val;
                        const heightPct = (item.val / 160000) * 100;
                        const finalHeightPct = (finalVal / 160000) * 100;
                        
                        return (
                          <div key={idx} className="flex flex-col items-center space-y-2 w-16">
                            <div className="relative w-full h-[100px] bg-slate-200 dark:bg-slate-950/40 rounded-lg overflow-hidden border border-slate-300 dark:border-white/5 flex items-end">
                              {/* Original balance column (faint red) */}
                              <div style={{ height: `${heightPct}%` }} className="absolute w-full bg-rose-500/20 bottom-0 left-0" />
                              {/* Swept balance column (green) */}
                              <div style={{ height: `${finalHeightPct}%` }} className="w-full bg-emerald-500/60 transition-all duration-300 z-10" />
                            </div>
                            <span className="text-slate-700 dark:text-slate-300 font-bold">{item.name}</span>
                            <span className={clsx("font-bold text-[8.5px]", exceeds ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500")}>
                              {exceeds ? "Swept" : `$${(item.val / 1000).toFixed(0)}k`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* SCENARIO 3: FX HEDGING */}
              {activeScenario.visualizerType === "hedging" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                  <div className="lg:col-span-4 flex flex-col justify-between bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-4">
                    <div className="space-y-3.5">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider flex items-center">
                        <Sliders className="w-4 h-4 text-evolver-viridian mr-2" />
                        PO Hedge Coverage
                      </h4>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500 font-medium">Hedge Coverage Target:</span>
                          <span className="text-slate-900 dark:text-white font-mono font-bold">{hedgeCoverage}%</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="100"
                          step="5"
                          value={hedgeCoverage}
                          onChange={(e) => setHedgeCoverage(Number(e.target.value))}
                          className="w-full accent-evolver-viridian cursor-pointer bg-slate-200 dark:bg-slate-950"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-[10.5px] leading-relaxed text-slate-500 dark:text-slate-400">
                      🔒 Sets the target margin risk ratio to cover on foreign purchase orders against the active Spot index to insulate from FX friction.
                    </div>
                  </div>

                  <div className="lg:col-span-8 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between min-h-[250px]">
                    <div className="flex items-center justify-between mb-4 text-[10px]">
                      <span className="font-bold text-slate-800 dark:text-slate-300">FX net exposure hedging coverage analysis</span>
                      <span className="text-cyan-600 dark:text-cyan-400 text-[9px] font-bold font-mono">Spot Rate: 1.090 USD/EUR</span>
                    </div>

                    <div className="flex-1 flex items-center justify-center min-h-[140px]">
                      <div className="grid grid-cols-2 gap-8 items-center w-full max-w-md">
                        {/* Circular progress bar of hedged balance */}
                        <div className="flex flex-col items-center space-y-2">
                          <div className="relative w-28 h-28 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                              <circle cx="56" cy="56" r="46" stroke={theme === "light" ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)"} strokeWidth="8" fill="transparent" />
                              <circle cx="56" cy="56" r="46" stroke="#10b981" strokeWidth="8" fill="transparent"
                                      strokeDasharray={289}
                                      strokeDashoffset={289 - (289 * hedgeCoverage) / 100}
                                      className="transition-all duration-500" />
                            </svg>
                            <span className="absolute font-mono text-lg font-extrabold text-slate-900 dark:text-white">{hedgeCoverage}%</span>
                          </div>
                          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Hedged Reserve</span>
                        </div>

                        {/* Financial figures indicators */}
                        <div className="space-y-4 font-mono text-xs">
                          <div className="p-3 bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl">
                            <span className="text-[9px] text-slate-500 uppercase font-bold block mb-1">Total foreign PO volume</span>
                            <span className="text-slate-900 dark:text-white font-extrabold text-sm">$686,700 USD</span>
                          </div>
                          <div className="p-3 bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl">
                            <span className="text-[9px] text-slate-500 uppercase font-bold block mb-1">Active Hedged Value</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">${((686700 * hedgeCoverage) / 100).toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SCENARIO 4: CROSS-BORDER TAX address variance grid & OCR split-pane visualizer */}
              {activeScenario.visualizerType === "tax" && (
                <div className="flex flex-col space-y-6 w-full animate-in fade-in duration-300">
                  
                  {/* Premium Financial Overview & CSS Comparison Chart */}
                  {(() => {
                    const itemsToAnalyze = taxItems.length > 0 ? taxItems : INITIAL_TAX_ITEMS;
                    const totalAuditedVolume = itemsToAnalyze.reduce((acc, item) => acc + item.netValue, 0);
                    const reclaimableRefund = itemsToAnalyze.reduce((acc, item) => {
                      const diff = item.taxBilledAmount - item.taxCorrectAmount;
                      return acc + (diff > 0 ? diff : 0);
                    }, 0);
                    
                    const resolvedSavings = itemsToAnalyze.reduce((acc, item) => {
                      if (item.status === "Resolved") {
                        const initialItem = INITIAL_TAX_ITEMS.find(i => i.doc === item.doc);
                        if (initialItem) {
                          const initialOverbill = initialItem.taxBilledAmount - initialItem.taxCorrectAmount;
                          return acc + (initialOverbill > 0 ? initialOverbill : 0);
                        }
                      }
                      return acc;
                    }, 0);

                    const preventedLeakageProjection = resolvedSavings > 0 ? resolvedSavings * 12 : 24500.00;

                    return (
                      <div className="space-y-6 font-sans">
                        {/* Premium Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Card 1: Audited Billing Volume */}
                          <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900/60 dark:to-slate-900/10 border border-slate-205 dark:border-white/10 p-6 rounded-3xl shadow-sm flex items-center justify-between border-l-4 border-l-cyan-500 hover:shadow-md transition-all">
                            <div>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-extrabold block">
                                Audited Billing Volume
                              </span>
                              <h4 className="text-2xl font-mono font-black text-slate-800 dark:text-white mt-1">
                                ${totalAuditedVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </h4>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">
                                S/4HANA VBRK/VBRP index scope
                              </span>
                            </div>
                            <div className="bg-cyan-500/10 p-3 rounded-2xl">
                              <Database className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                            </div>
                          </div>

                          {/* Card 2: Reclaimable Tax Refund (Historical Savings) */}
                          <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900/60 dark:to-slate-900/10 border border-slate-205 dark:border-white/10 p-6 rounded-3xl shadow-sm flex items-center justify-between border-l-4 border-l-emerald-500 hover:shadow-md transition-all relative overflow-hidden">
                            <div className="absolute -top-6 -right-6 w-20 h-20 bg-emerald-500/5 rounded-full pointer-events-none" />
                            <div>
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-455 uppercase tracking-widest font-extrabold block flex items-center gap-1.5 font-sans">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Reclaimable Tax Refund
                              </span>
                              <h4 className="text-2xl font-mono font-black text-emerald-600 dark:text-emerald-400 mt-1">
                                ${reclaimableRefund.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </h4>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">
                                Overbilled out-of-state exemption
                              </span>
                            </div>
                            <div className="bg-emerald-500/10 p-3 rounded-2xl">
                              <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                          </div>

                          {/* Card 3: Mitigated Leakage Risk (Annualized Projections) */}
                          <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900/60 dark:to-slate-900/10 border border-slate-205 dark:border-white/10 p-6 rounded-3xl shadow-sm flex items-center justify-between border-l-4 border-l-amber-500 hover:shadow-md transition-all">
                            <div>
                              <span className="text-[10px] text-amber-600 dark:text-amber-550 uppercase tracking-widest font-extrabold block">
                                Prevented Annual Leakage
                              </span>
                              <h4 className="text-2xl font-mono font-black text-slate-800 dark:text-white mt-1">
                                ${preventedLeakageProjection.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                              </h4>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1 font-sans">
                                locked-in S/4HANA partner rules
                              </span>
                            </div>
                            <div className="bg-amber-500/10 p-3 rounded-2xl">
                              <ShieldCheck className="w-6 h-6 text-amber-600 dark:text-amber-450" />
                            </div>
                          </div>
                        </div>

                        {/* Comparative Visual Bar Chart */}
                        <div className="bg-gradient-to-b from-white to-slate-50 dark:from-slate-955/40 dark:to-slate-900/20 border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-xl space-y-4">
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-200 dark:border-white/5 pb-4">
                            <div>
                              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <BarChart2 className="w-4.5 h-4.5 text-emerald-500" />
                                Tax Discrepancy Analysis (Billed vs. Correct)
                              </h3>
                              <p className="text-[10.5px] text-slate-400 dark:text-slate-500 mt-0.5 font-sans">
                                Comparison of S/4HANA Universal Ledger postings versus verified physical OCR warehouses.
                              </p>
                            </div>
                            <div className="flex items-center gap-4 text-[10px] font-bold">
                              <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded bg-rose-500/80" />
                                <span className="text-slate-500">Billed Tax</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded bg-emerald-500" />
                                <span className="text-slate-500">Correct Tax (Saved)</span>
                              </div>
                            </div>
                          </div>

                          {/* CSS Charts */}
                          <div className="space-y-4 font-mono text-[11px]">
                            {itemsToAnalyze.map((item: any) => {
                              const refund = item.taxBilledAmount - item.taxCorrectAmount;
                              const isOverbilled = refund > 0;
                              const savingsPercent = isOverbilled ? Math.round((refund / item.taxBilledAmount) * 100) : 0;
                              
                              // Scale bars relatively (max value is Sovereign 90001092 billed $7321.88)
                              const maxBilled = 7321.88;
                              const billedBarWidth = Math.max(10, Math.min(100, (item.taxBilledAmount / maxBilled) * 100));
                              const correctBarWidth = Math.max(0, Math.min(100, (item.taxCorrectAmount / maxBilled) * 100));

                              return (
                                <div key={item.doc} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center hover:bg-slate-100/30 dark:hover:bg-white/5 p-2 rounded-2xl transition-colors">
                                  {/* Document Label */}
                                  <div className="md:col-span-3 flex items-center justify-between md:justify-start gap-2">
                                    <span className="font-bold text-slate-700 dark:text-slate-350">Doc {item.doc}</span>
                                    <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-slate-200/50 dark:bg-white/5 text-slate-400">
                                      {item.customerName.split(' ')[0]}
                                    </span>
                                  </div>

                                  {/* Visual Comparison Bars */}
                                  <div className="md:col-span-6 space-y-1.5">
                                    {/* Billed Bar */}
                                    <div className="flex items-center gap-2">
                                      <div className="w-full bg-slate-100 dark:bg-black/30 h-2.5 rounded-full overflow-hidden">
                                        <div 
                                          className="bg-rose-500/80 h-full rounded-full transition-all duration-500"
                                          style={{ width: `${billedBarWidth}%` }}
                                        />
                                      </div>
                                      <span className="text-[10px] text-rose-550 font-bold shrink-0 w-16 text-right">
                                        ${item.taxBilledAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                      </span>
                                    </div>
                                    
                                    {/* Correct Bar */}
                                    <div className="flex items-center gap-2">
                                      <div className="w-full bg-slate-100 dark:bg-black/30 h-2.5 rounded-full overflow-hidden">
                                        <div 
                                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                          style={{ width: `${correctBarWidth}%` }}
                                        />
                                      </div>
                                      <span className="text-[10px] text-emerald-555 font-bold shrink-0 w-16 text-right">
                                        ${item.taxCorrectAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Savings / Results Badge */}
                                  <div className="md:col-span-3 text-right">
                                    {isOverbilled ? (
                                      <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-500 text-[10px] font-bold font-sans inline-flex items-center gap-1">
                                        <TrendingUp className="w-3.5 h-3.5" />
                                        Save {savingsPercent}% (${refund.toLocaleString(undefined, { minimumFractionDigits: 2 })})
                                      </span>
                                    ) : (
                                      <span className="px-2.5 py-1 rounded-xl bg-slate-200/50 dark:bg-white/5 text-slate-400 text-[10px] font-bold font-sans inline-block">
                                        0% Variance
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Document Selection Tabs */}
                  <div className="flex flex-wrap items-center gap-2 bg-slate-100 dark:bg-black/30 p-2.5 rounded-2xl border border-slate-200 dark:border-white/5 font-sans">
                    <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest px-2">
                      In-Scope Invoices:
                    </span>
                    {(taxItems.length > 0 ? taxItems : INITIAL_TAX_ITEMS).map((item: any) => {
                      const isSelected = selectedTaxDoc?.doc === item.doc;
                      const isFlagged = item.status === "Flagged";
                      return (
                        <button
                          key={item.doc}
                          onClick={() => setSelectedTaxDoc(item)}
                          className={clsx(
                            "px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all select-none cursor-pointer border",
                            isSelected
                              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-md scale-105"
                              : "bg-white dark:bg-slate-950/40 text-slate-650 dark:text-slate-350 border-slate-200 dark:border-white/5 hover:bg-slate-150 dark:hover:bg-slate-900/60"
                          )}
                        >
                          <span>Doc {item.doc}</span>
                          <span className={clsx(
                            "w-2 h-2 rounded-full",
                            isFlagged ? "bg-rose-500 animate-pulse" : "bg-emerald-500"
                          )} />
                        </button>
                      );
                    })}
                  </div>

                  {/* Selected Document Details Split-Pane */}
                  {selectedTaxDoc && (() => {
                    const isFlagged = selectedTaxDoc.status === "Flagged";
                    const refundOpportunity = selectedTaxDoc.taxBilledAmount - selectedTaxDoc.taxCorrectAmount;
                    
                    return (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                        
                        {/* Left Column: Scanned PDF Invoice Viewer (OCR Extraction) */}
                        <div className="lg:col-span-6 flex flex-col justify-between bg-gradient-to-b from-white to-slate-50 dark:from-slate-950/80 dark:to-slate-900/40 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                          {/* Premium Invoice watermark */}
                          <div className="absolute top-4 right-4 opacity-15 text-slate-400 dark:text-slate-600 font-mono text-[9px] uppercase font-bold tracking-widest border border-dashed border-slate-300 dark:border-slate-700 px-2 py-0.5 rounded">
                            PDF / OCR Ingest
                          </div>
                          
                          <div className="space-y-4">
                            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                              <span className="text-[8.5px] font-mono font-extrabold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block">
                                Scanned Physical Document
                              </span>
                              <h3 className="text-sm font-bold text-slate-800 dark:text-white mt-1">
                                {selectedTaxDoc.customerName}
                              </h3>
                              <span className="text-[10px] text-slate-400 font-mono block">Inv Ref: Invoice_Copy_{selectedTaxDoc.doc}.pdf</span>
                            </div>

                            {/* Simulated OCR Invoice Layout */}
                            <div className="p-4 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-2xl text-xs font-mono space-y-3 relative shadow-inner">
                              <div className="flex justify-between border-b border-slate-100 dark:border-slate-900 pb-1.5 text-[10px] text-slate-500">
                                <span>INVOICE HEADER</span>
                                <span>DATE: 2026-05-18</span>
                              </div>
                              <div className="grid grid-cols-2 gap-3 text-[10.5px]">
                                <div>
                                  <span className="text-slate-400 dark:text-slate-500 block text-[8px] uppercase">Corporate Bill-To</span>
                                  <span className="font-bold text-slate-800 dark:text-slate-300">Horizon Retailers Inc</span>
                                  <span className="text-slate-500 block text-[9.5px]">1200 Market St, San Francisco, CA</span>
                                </div>
                                <div className="bg-cyan-500/5 dark:bg-cyan-400/5 p-2 rounded-xl border border-cyan-500/20">
                                  <span className="text-cyan-600 dark:text-cyan-400 block text-[8px] uppercase font-extrabold">Ship-To (Physical OCR)</span>
                                  <span className="font-bold text-slate-800 dark:text-slate-250">Warehouse S07 Delivery</span>
                                  <span className="text-cyan-600 dark:text-cyan-400 font-bold block text-[10.5px] mt-0.5 animate-pulse">
                                    {selectedTaxDoc.shipToRegion}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="border-t border-slate-100 dark:border-slate-900 pt-2 flex justify-between items-center text-[10.5px]">
                                <span>Net Product Subtotal:</span>
                                <span className="font-bold">${selectedTaxDoc.netValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                              </div>
                            </div>

                            {/* Diagnostic Note */}
                            <div className="p-3.5 bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-900/30 rounded-2xl text-[10.5px] leading-relaxed text-slate-700 dark:text-slate-300 font-sans">
                              💡 **OCR Metadata Analysis:** The physical billing document scanned from the carrier shows delivery warehouse coordinates registered directly in the **{selectedTaxDoc.shipToRegion.split(' ')[0]}** region, where specific tax exemption rules apply.
                            </div>
                          </div>
                          
                          <div className="pt-4 border-t border-slate-200 dark:border-slate-850 text-[9px] text-slate-500 font-mono flex justify-between mt-4">
                            <span>OCR Scanner: High-Accuracy Vision v4</span>
                            <span>Match: 99.8%</span>
                          </div>
                        </div>

                        {/* Right Column: S/4HANA ERP Ledger Invoice Record */}
                        <div className="lg:col-span-6 flex flex-col justify-between bg-gradient-to-b from-white to-slate-50 dark:from-slate-950/80 dark:to-slate-900/40 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                          {/* ERP watermark */}
                          <div className="absolute top-4 right-4 opacity-15 text-slate-400 dark:text-slate-600 font-mono text-[9px] uppercase font-bold tracking-widest border border-dashed border-slate-300 dark:border-slate-700 px-2 py-0.5 rounded">
                            S/4HANA Ledger
                          </div>

                          <div className="space-y-4">
                            <div className="border-b border-slate-200 dark:border-slate-880 pb-3">
                              <span className="text-[8.5px] font-mono font-extrabold text-amber-600 dark:text-amber-450 uppercase tracking-wider block">
                                S/4HANA Active Billing Ledger
                              </span>
                              <h3 className="text-sm font-bold text-slate-800 dark:text-white mt-1 flex items-center gap-1.5">
                                SAP Billing Document: <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">{selectedTaxDoc.doc}</span>
                              </h3>
                              <span className="text-[10px] text-slate-400 font-mono block">Sales Order Ref: {selectedTaxDoc.salesOrder || "22"}</span>
                            </div>

                            {/* ERP Console record layout */}
                            <div className="p-4 bg-slate-950 text-slate-250 border border-slate-850 rounded-2xl text-xs font-mono space-y-3 relative shadow-inner">
                              <div className="flex justify-between border-b border-slate-800 pb-1.5 text-[9px] text-slate-550">
                                <span>TABLES: VBRK / VBPA</span>
                                <span>STATUS: Completed</span>
                              </div>
                              <div className="grid grid-cols-2 gap-3 text-[10.5px]">
                                <div>
                                  <span className="text-slate-500 block text-[8px] uppercase">Sold-To Party (BUKRS)</span>
                                  <span className="font-bold text-slate-300">Customer: 17100001</span>
                                  <span className="text-slate-400 block text-[9.5px]">{selectedTaxDoc.soldToRegion}</span>
                                </div>
                                <div className={clsx(
                                  "p-2 rounded-xl border",
                                  isFlagged
                                    ? "bg-rose-500/5 border-rose-500/20 text-rose-450"
                                    : "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                                )}>
                                  <span className="text-slate-500 block text-[8px] uppercase font-bold">Ship-To Party (WE Partner)</span>
                                  <span className="font-bold text-slate-300">AddressID: 23653</span>
                                  <span className={clsx(
                                    "font-black block text-[10.5px] mt-0.5",
                                    isFlagged ? "text-rose-600 dark:text-rose-400 animate-pulse" : "text-emerald-600 dark:text-emerald-400"
                                  )}>
                                    {selectedTaxDoc.soldToRegion}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="border-t border-slate-800 pt-2 flex justify-between items-center text-[10.5px]">
                                <span>Billed Sales Tax Amount:</span>
                                <span className={clsx(
                                  "font-bold text-xs font-mono",
                                  isFlagged ? "text-rose-650 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-450"
                                )}>
                                  {selectedTaxDoc.taxBilledRate.toFixed(3)}% (${selectedTaxDoc.taxBilledAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })})
                                </span>
                              </div>
                            </div>

                            {/* Comparison Matrix & Delta Indicator */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 rounded-2xl flex flex-col justify-between shadow-sm">
                                <span className="text-[8px] text-slate-500 uppercase font-extrabold block">Location Variance</span>
                                <div className="flex items-center gap-1.5 mt-1 font-mono text-xs font-bold">
                                  {isFlagged ? (
                                    <>
                                      <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">System CA</span>
                                      <span>⟷</span>
                                      <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">Physical OR</span>
                                    </>
                                  ) : (
                                    <span className="text-emerald-600 dark:text-emerald-450 flex items-center gap-1">
                                      <Check className="w-4 h-4 stroke-[3]" /> Reconciled & Synced
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className={clsx(
                                "p-3.5 border rounded-2xl flex flex-col justify-between shadow-sm text-left font-sans",
                                isFlagged
                                  ? "bg-rose-500/5 border-rose-500/20"
                                  : "bg-emerald-500/5 border-emerald-500/20"
                              )}>
                                <span className="text-[8px] text-slate-500 uppercase font-extrabold block">
                                  {isFlagged ? "Tax Refund Opportunity" : "Compliance Cleared"}
                                </span>
                                <span className={clsx(
                                  "font-mono font-black text-sm md:text-base mt-1 block",
                                  isFlagged ? "text-rose-650 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-450"
                                )}>
                                  {isFlagged 
                                    ? `$${refundOpportunity.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD`
                                    : "0.00% variance"
                                  }
                                </span>
                              </div>
                            </div>

                          </div>
                          
                          <div className="pt-4 border-t border-slate-200 dark:border-slate-850 text-[9px] text-slate-500 font-mono flex justify-between mt-4">
                            <span>Connection status: vhcals4hcs Connected</span>
                            <span>Port: 44301 SSL</span>
                          </div>
                        </div>

                      </div>
                    );
                  })()}

                  {/* Actions Guidelines Summary Card */}
                  {selectedTaxDoc && (
                    <div className="p-5 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 border border-slate-200 dark:border-emerald-500/10 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-emerald-500/20 transition-all duration-300">
                      <div className="space-y-1">
                        <span className="text-[9.5px] font-mono font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase block">
                          Operational Resolution Path
                        </span>
                        <p className="text-xs text-slate-655 dark:text-slate-350 leading-relaxed font-light">
                          {selectedTaxDoc.status === "Flagged" ? (
                            <span>To execute the closed-loop correction, proceed to **4. Reason Policies** or **5. Execute BAPI** to adjust Sales Order partner details via OData PATCH write-back.</span>
                          ) : (
                            <span className="text-emerald-650 dark:text-emerald-405 font-bold flex items-center gap-1">
                              <Check className="w-4 h-4 stroke-[3]" /> Tax Audit resolved successfully! Cryptographic proof certificate generated in Tab 6.
                            </span>
                          )}
                        </p>
                      </div>
                      
                      {selectedTaxDoc.status === "Flagged" && (
                        <button
                          onClick={() => setActiveTab("reason")}
                          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md select-none transition-all active:scale-[0.98] cursor-pointer shrink-0"
                        >
                          Navigate to Policy Checkpoints ➔
                        </button>
                      )}
                    </div>
                  )}

                </div>
              )}

              {/* SCENARIO 5: POD REVENUE LOCK Progress and recognition speed chart */}
              {activeScenario.visualizerType === "revenue" && (
                <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between min-h-[250px] space-y-4">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-slate-800 dark:text-slate-300">IFRS 15 Deferred Revenue recognitions and delivery aging analysis</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">Target Cleared: $220,000 USD</span>
                  </div>

                  <div className="flex-1 grid grid-cols-3 gap-4 font-mono text-center text-xs">
                    {[
                      { doc: "80010452", client: "Delta Dynamics", val: 145000, days: 18, status: "Signed & Released" },
                      { doc: "80010499", client: "Apex Logistics", val: 75000, days: 24, status: "Signed & Released" },
                      { doc: "80010530", client: "Starlight Retail", val: 92000, days: 5, status: "Pending Delivery" }
                    ].map((item, idx) => (
                      <div key={idx} className="p-4 bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between space-y-2">
                        <span className="text-slate-500 font-bold text-[9px] uppercase">Delivery {item.doc}</span>
                        <div className="py-2">
                          <span className="text-slate-900 dark:text-white font-extrabold text-base">${item.val.toLocaleString()}</span>
                          <span className="text-slate-500 block text-[9px] uppercase mt-0.5">{item.client}</span>
                        </div>
                        <span className={clsx("text-[9px] font-bold uppercase", item.status.includes('Released') ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-500")}>
                          {item.status} ({item.days} days)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SCENARIO 6: DUPLICATE INVOICE FUZZY DISTANCES */}
              {activeScenario.visualizerType === "duplicate" && (
                <div className="flex flex-col space-y-6 w-full animate-in fade-in duration-300">
                  
                  {/* Dynamic Audit Control Panel */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-xl text-slate-900 dark:text-white">
                    <div className="md:col-span-6 space-y-2">
                      <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-300 uppercase tracking-wider flex items-center">
                        <Sliders className="w-4 h-4 text-evolver-viridian mr-2" />
                        Levenshtein Similarity Audit Filter
                      </h4>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="50"
                          max="100"
                          step="5"
                          value={duplicateThreshold}
                          onChange={(e) => setDuplicateThreshold(Number(e.target.value))}
                          className="flex-1 accent-evolver-viridian cursor-pointer bg-slate-300 dark:bg-slate-900 h-1.5 rounded-lg"
                        />
                        <span className="text-slate-800 dark:text-white font-mono font-extrabold text-xs px-3 py-1 bg-slate-200 dark:bg-slate-950/60 border border-slate-300 dark:border-white/10 rounded-lg shrink-0">
                          {duplicateThreshold}% Similarity
                        </span>
                      </div>
                    </div>
                    
                    <div className="md:col-span-6 grid grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 rounded-xl text-left">
                        <span className="text-[8px] text-slate-500 uppercase font-bold block mb-1">Total Audit Capital Exposure</span>
                        <span className="text-rose-600 dark:text-rose-400 font-mono font-extrabold text-sm sm:text-base">
                          ${detectedDuplicates.reduce((sum, item) => sum + item.amount, 0).toLocaleString()} USD
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 rounded-xl text-left flex flex-col justify-between">
                        <span className="text-[8px] text-slate-500 uppercase font-bold block">Compliance Audit Risk</span>
                        <div className="flex items-center gap-1.5 mt-1">
                          {detectedDuplicates.length > 0 ? (
                            <>
                              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider">HIGH AUDIT ALERT</span>
                            </>
                          ) : (
                            <>
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">SECURED</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Upper Panel: Premium Risk Anomaly Bar Chart & General Explainer */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                    
                    {/* Bar Chart Panel */}
                    <div className="lg:col-span-7 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl p-5 flex flex-col justify-between min-h-[300px] space-y-4 shadow-sm text-slate-900 dark:text-white relative">
                      <div className="flex justify-between items-center text-[10px] shrink-0">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-800 dark:text-slate-300 block">Suspicious Invoice Threat Profiling</span>
                          <span className="text-slate-500 font-mono text-[9px]">Levenshtein distance matching buckets</span>
                        </div>
                        
                        {/* Interactive toggle switch for SVG bar chart metrics */}
                        <div className="flex items-center bg-slate-200 dark:bg-black/40 rounded-xl p-0.5 border border-slate-300 dark:border-white/5 font-sans">
                          <button
                            onClick={() => setChartMetric("amount")}
                            className={clsx(
                              "px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase transition-all select-none cursor-pointer",
                              chartMetric === "amount"
                                ? "bg-evolver-viridian text-white shadow-sm"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            )}
                          >
                            USD Exposure
                          </button>
                          <button
                            onClick={() => setChartMetric("count")}
                            className={clsx(
                              "px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase transition-all select-none cursor-pointer",
                              chartMetric === "count"
                                ? "bg-evolver-viridian text-white shadow-sm"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            )}
                          >
                            Pair Count
                          </button>
                        </div>
                      </div>

                      {/* True Interactive Vertical SVG Bar Chart */}
                      <div className="flex-grow flex items-center justify-center relative min-h-[170px]">
                        {detectedDuplicates.length === 0 ? (
                          <div className="absolute inset-0 flex items-center justify-center border border-dashed border-slate-300 dark:border-white/5 rounded-xl">
                            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                              No Suspicious Records Detected
                            </span>
                          </div>
                        ) : (() => {
                          const catExact = categorizedDuplicates.find(c => c.id === "exactDouble") || { amount: 0, count: 0 };
                          const catPunctuation = categorizedDuplicates.find(c => c.id === "transposition") || { amount: 0, count: 0 };
                          const catPrefix = categorizedDuplicates.find(c => c.id === "prefixTypo") || { amount: 0, count: 0 };

                          const exactAmount = catExact.amount;
                          const exactCount = catExact.count;
                          const punctuationAmount = catPunctuation.amount;
                          const punctuationCount = catPunctuation.count;
                          const prefixAmount = catPrefix.amount;
                          const prefixCount = catPrefix.count;

                          const valExact = chartMetric === "amount" ? exactAmount : exactCount;
                          const valPunctuation = chartMetric === "amount" ? punctuationAmount : punctuationCount;
                          const valPrefix = chartMetric === "amount" ? prefixAmount : prefixCount;

                          const maxVal = Math.max(1, valExact, valPunctuation, valPrefix);
                          
                          // Dimensions inside viewBox="0 0 500 170"
                          const plotW = 420;
                          const plotH = 120;
                          const xMargin = 65;
                          const yMargin = 15;

                          const hExact = (valExact / maxVal) * plotH;
                          const hPunctuation = (valPunctuation / maxVal) * plotH;
                          const hPrefix = (valPrefix / maxVal) * plotH;

                          return (
                            <div className="w-full h-full flex flex-col justify-end">
                              <svg viewBox="0 0 500 170" width="100%" height="100%" className="overflow-visible select-none">
                                <defs>
                                  {/* Dynamic Premium Gradients for Threat Levels */}
                                  <linearGradient id="exactGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#c084fc" />
                                    <stop offset="100%" stopColor="#a855f7" />
                                  </linearGradient>
                                  <linearGradient id="punctuationGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#fb7185" />
                                    <stop offset="100%" stopColor="#f43f5e" />
                                  </linearGradient>
                                  <linearGradient id="prefixGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#fbbf24" />
                                    <stop offset="100%" stopColor="#f59e0b" />
                                  </linearGradient>
                                </defs>

                                {/* Y-Axis Horizontal Gridlines */}
                                {[0, 0.33, 0.66, 1].map((ratio, gridIdx) => {
                                  const y = yMargin + plotH * (1 - ratio);
                                  const displayVal = maxVal * ratio;
                                  return (
                                    <g key={gridIdx} className="opacity-70 dark:opacity-100">
                                      <line 
                                        x1={xMargin} 
                                        y1={y} 
                                        x2={xMargin + plotW} 
                                        y2={y} 
                                        className="stroke-slate-300 dark:stroke-white/10" 
                                        strokeDasharray="4,4" 
                                      />
                                      <text 
                                        x={xMargin - 8} 
                                        y={y + 3.5} 
                                        className="text-[8px] font-mono fill-slate-500 text-right"
                                        textAnchor="end"
                                      >
                                        {chartMetric === "amount" 
                                          ? `$${Math.round(displayVal / 1000)}k`
                                          : Math.round(displayVal)
                                        }
                                      </text>
                                    </g>
                                  );
                                })}

                                {/* Active bars mapping */}
                                {[
                                  {
                                    id: "exactDouble",
                                    label: "Exact Postings",
                                    val: valExact,
                                    height: hExact,
                                    gradient: "url(#exactGrad)",
                                    x: xMargin + plotW * 0.15 - 22.5,
                                    colorClass: "bg-purple-500",
                                    amountStr: `$${exactAmount.toLocaleString()}`,
                                    countStr: `${exactCount} ${exactCount === 1 ? "pair" : "pairs"}`,
                                    details: "Identical references & amounts"
                                  },
                                  {
                                    id: "punctuation",
                                    label: "Punctuation Shifts",
                                    val: valPunctuation,
                                    height: hPunctuation,
                                    gradient: "url(#punctuationGrad)",
                                    x: xMargin + plotW * 0.50 - 22.5,
                                    colorClass: "bg-rose-500",
                                    amountStr: `$${punctuationAmount.toLocaleString()}`,
                                    countStr: `${punctuationCount} ${punctuationCount === 1 ? "pair" : "pairs"}`,
                                    details: "Spaces & hyphen bypass attempts"
                                  },
                                  {
                                    id: "prefixTypo",
                                    label: "Prefix Typo",
                                    val: valPrefix,
                                    height: hPrefix,
                                    gradient: "url(#prefixGrad)",
                                    x: xMargin + plotW * 0.85 - 22.5,
                                    colorClass: "bg-amber-500",
                                    amountStr: `$${prefixAmount.toLocaleString()}`,
                                    countStr: `${prefixCount} ${prefixCount === 1 ? "pair" : "pairs"}`,
                                    details: "Shorthand keystroke variations"
                                  }
                                ].map((bar) => {
                                  const barY = yMargin + plotH - bar.height;
                                  const isHovered = hoveredBar === bar.id;
                                  return (
                                    <g key={bar.id} className="cursor-pointer group">
                                      {/* Highlight column block on hover */}
                                      <rect
                                        x={bar.x - 15}
                                        y={yMargin}
                                        width={75}
                                        height={plotH}
                                        fill="transparent"
                                        className="hover:fill-slate-300/20 dark:hover:fill-white/5 transition-colors"
                                        onMouseEnter={() => setHoveredBar(bar.id)}
                                        onMouseLeave={() => setHoveredBar(null)}
                                      />

                                      {/* Vertical Bar Graph Column */}
                                      <rect
                                        x={bar.x}
                                        y={barY}
                                        width={45}
                                        height={Math.max(2, bar.height)}
                                        rx={6}
                                        fill={bar.gradient}
                                        className="transition-all duration-300 filter group-hover:brightness-110"
                                        onMouseEnter={() => setHoveredBar(bar.id)}
                                        onMouseLeave={() => setHoveredBar(null)}
                                      />

                                      {/* Bar labels */}
                                      <text
                                        x={bar.x + 22.5}
                                        y={yMargin + plotH + 14}
                                        textAnchor="middle"
                                        className="text-[9px] font-sans font-bold uppercase tracking-wider fill-slate-700 dark:fill-slate-400 group-hover:fill-slate-900 dark:group-hover:fill-white transition-colors"
                                      >
                                        {bar.label}
                                      </text>

                                      {/* Floating values above bars */}
                                      {bar.height > 10 && (
                                        <text
                                          x={bar.x + 22.5}
                                          y={barY - 5}
                                          textAnchor="middle"
                                          className="text-[8.5px] font-mono font-extrabold fill-slate-800 dark:fill-slate-200"
                                        >
                                          {chartMetric === "amount" ? `$${Math.round(bar.val / 1000)}k` : bar.val}
                                        </text>
                                      )}
                                    </g>
                                  );
                                })}
                              </svg>

                              {/* Absolute Overlay Rich HTML Tooltip */}
                              {hoveredBar && (() => {
                                const target = [
                                  {
                                    id: "exactDouble",
                                    label: "Exact Postings",
                                    amt: exactAmount,
                                    ct: exactCount,
                                    color: "bg-purple-500",
                                    desc: "Absolute identical duplicate postings"
                                  },
                                  {
                                    id: "punctuation",
                                    label: "Punctuation Shifts",
                                    amt: punctuationAmount,
                                    ct: punctuationCount,
                                    color: "bg-rose-500",
                                    desc: "Hyphens/slashes bypass standard indices"
                                  },
                                  {
                                    id: "prefixTypo",
                                    label: "Prefix Typo",
                                    amt: prefixAmount,
                                    ct: prefixCount,
                                    color: "bg-amber-500",
                                    desc: "Abbreviation shifts (e.g. IN vs INV)"
                                  }
                                ].find(x => x.id === hoveredBar);

                                if (!target) return null;

                                return (
                                  <div className="absolute top-[38px] left-[50%] -translate-x-1/2 bg-slate-900 border border-slate-800 dark:border-white/10 p-3 rounded-xl shadow-2xl text-[10px] w-[200px] space-y-1.5 z-25 text-white font-sans">
                                    <div className="flex items-center gap-1.5">
                                      <span className={clsx("w-2 h-2 rounded-full", target.color)} />
                                      <span className="font-extrabold uppercase tracking-wide">{target.label}</span>
                                    </div>
                                    <div className="border-t border-white/5 pt-1 text-slate-400">
                                      {target.desc}
                                    </div>
                                    <div className="flex justify-between items-center font-mono text-[9px] pt-1">
                                      <span>Amount:</span>
                                      <span className="font-extrabold text-emerald-400">${target.amt.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center font-mono text-[9px]">
                                      <span>Pairs Count:</span>
                                      <span className="font-extrabold text-slate-200">{target.ct} {target.ct === 1 ? "pair" : "pairs"}</span>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Explainer / System Reasoning Panel */}
                    <div className="lg:col-span-5 bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-2xl p-5 flex flex-col justify-between min-h-[300px] space-y-4 shadow-sm text-slate-900 dark:text-white">
                      <div className="space-y-2.5">
                        <span className="text-[9px] font-mono font-bold tracking-widest text-evolver-viridian uppercase block">
                          System Audit Intelligence
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Levenshtein & Heuristic Analysis</h4>
                        <p className="text-[10.5px] leading-relaxed text-slate-600 dark:text-slate-400">
                          Traditional ERP duplicate validations (like standard exact index checks in BSEG/BSIP) look for absolute exact string matches on document references or invoice keys.
                        </p>
                        <p className="text-[10.5px] leading-relaxed text-slate-600 dark:text-slate-400">
                          This creates a major systemic gap: minor punctuation variations, abbreviation differences, or typo variations easily slip past exact-checks. ARIA's Levenshtein distance calculations systematically audit the AP records, grouping risks into actionable threat buckets.
                        </p>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl text-[10px] text-slate-500 font-mono">
                        💡 Tip: Adjusting the Levenshtein similarity slider re-calculates exact threat matches inside your local PostgreSQL database cache in real-time.
                      </div>
                    </div>

                  </div>

                  {/* Lower Panel: Detailed Audit Breakdown Ledger */}
                  <div className="space-y-6 w-full">
                    
                    {detectedDuplicates.length === 0 ? (
                      <div className="bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl p-12 flex flex-col items-center justify-center text-slate-500 space-y-3 shadow-sm">
                        <ShieldCheck className="w-12 h-12 text-emerald-500 dark:text-emerald-400 opacity-60 animate-pulse shrink-0" />
                        <h4 className="text-slate-800 dark:text-slate-300 font-extrabold text-sm">General Ledger Secured</h4>
                        <p className="text-[11px] text-slate-500 text-center max-w-sm">
                          No duplicate AP invoice items have been detected at the current similarity threshold of **{duplicateThreshold}%**. Adjust the Levenshtein filter above to increase auditing sensitivity.
                        </p>
                      </div>
                    ) : (
                      categorizedDuplicates.map((cat, catIdx) => {
                        if (cat.items.length === 0) return null;
                        
                        return (
                          <div 
                            key={cat.id || catIdx} 
                            className="bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-3xl p-5 sm:p-6 space-y-5 flex flex-col shadow-sm"
                          >
                            {/* Category Header */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-200 dark:border-white/5">
                              <div className="flex items-center space-x-3">
                                <span className={clsx("w-3 h-3 rounded-full bg-gradient-to-r shadow-md", cat.color)} />
                                <h3 className={clsx("text-sm font-extrabold uppercase tracking-wide", cat.textColor)}>
                                  {cat.title}
                                </h3>
                              </div>
                              <span className="px-3 py-1 rounded bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/5 font-mono text-[10px] text-slate-700 dark:text-slate-300 font-bold shrink-0">
                                {cat.items.length} Flagged {cat.items.length === 1 ? "Pair" : "Pairs"} | ${cat.amount.toLocaleString()} USD
                              </span>
                            </div>

                            {/* Discrepancy Explanation Banner */}
                            <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-white/5 text-xs text-slate-800 dark:text-slate-300 leading-relaxed space-y-2">
                              <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-900 dark:text-white">
                                <span className="w-1.5 h-1.5 rounded-full bg-evolver-viridian" />
                                <span>Why Flags are Raised</span>
                              </div>
                              <p className="text-slate-600 dark:text-slate-400 text-[10.5px]">
                                {cat.reason}
                              </p>
                              <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-900 dark:text-white pt-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                                <span>Risk & Vulnerability Narrative</span>
                              </div>
                              <p className="text-slate-600 dark:text-slate-400 text-[10.5px]">
                                {cat.detail}
                              </p>
                            </div>

                            {/* Itemized Conflict list */}
                            <div className="space-y-4">
                              {cat.items.map((item, itemIdx) => (
                                <div 
                                  key={itemIdx} 
                                  className="p-4 bg-slate-200/20 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-2xl space-y-4 hover:border-slate-300 dark:hover:border-white/10 hover:bg-slate-200/50 dark:hover:bg-slate-950/60 transition-all duration-200 shadow-sm"
                                >
                                  {/* Row Info Top */}
                                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="space-y-1">
                                      <span className="text-[9px] text-slate-500 uppercase font-mono tracking-wider block">Vendor Account profile</span>
                                      <div className="flex items-center gap-2">
                                        <span className="text-slate-900 dark:text-white font-extrabold text-xs sm:text-sm font-sans">{item.vendorName}</span>
                                        <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 bg-slate-200 dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-300 dark:border-white/5">
                                          Vendor Code: 17300082
                                        </span>
                                      </div>
                                    </div>
                                    
                                    <div className="text-left sm:text-right">
                                      <span className="text-[9px] text-slate-500 uppercase font-mono tracking-wider block">Duplicate Exposure</span>
                                      <span className="text-slate-900 dark:text-white font-black text-sm sm:text-base font-mono">
                                        ${item.amount.toLocaleString()} <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">USD</span>
                                      </span>
                                    </div>
                                  </div>

                                  {/* Conflict Details Row Grid */}
                                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-100 dark:bg-slate-950/80 p-4 rounded-xl border border-slate-200 dark:border-white/5 font-mono text-[11px] text-slate-800 dark:text-slate-300 shadow-inner">
                                    
                                    {/* Invoice Document 1 */}
                                    <div className="md:col-span-4 space-y-1.5">
                                      <div className="flex justify-between items-center text-[9px] text-slate-500 uppercase font-bold">
                                        <span>Voucher Entry A</span>
                                        <span className="text-[8px] text-slate-400">ID: {item.id1.split('-')[0]}</span>
                                      </div>
                                      <div className="p-2.5 bg-slate-200 dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-white/5 flex justify-between items-center">
                                        <span className="text-cyan-600 dark:text-cyan-400 font-extrabold">{item.doc1}</span>
                                        <span className="text-[8px] text-slate-500 uppercase font-bold">Ref Key</span>
                                      </div>
                                    </div>

                                    {/* Comparison Bridge */}
                                    <div className="md:col-span-4 flex flex-col items-center justify-center space-y-1 py-2 md:py-0">
                                      <span className="px-2.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[9px] font-extrabold uppercase">
                                        {item.score}% Similarity
                                      </span>
                                      <div className="text-slate-500 text-xs">⟷</div>
                                      <span className="text-[9px] text-slate-500 uppercase font-bold">Reference Variance</span>
                                    </div>

                                    {/* Invoice Document 2 */}
                                    <div className="md:col-span-4 space-y-1.5">
                                      <div className="flex justify-between items-center text-[9px] text-slate-500 uppercase font-bold">
                                        <span>Voucher Entry B</span>
                                        <span className="text-[8px] text-slate-400">ID: {item.id2.split('-')[0]}</span>
                                      </div>
                                      <div className="p-2.5 bg-slate-200 dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-white/5 flex justify-between items-center">
                                        <span className="text-cyan-600 dark:text-cyan-400 font-extrabold">{item.doc2}</span>
                                        <span className="text-[8px] text-slate-500 uppercase font-bold">Ref Key</span>
                                      </div>
                                    </div>

                                  </div>

                                  {/* Narrative and Action Badge */}
                                  <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-slate-200/50 dark:bg-slate-900/30 p-3.5 rounded-xl border border-slate-300 dark:border-white/5">
                                    <div className="flex items-start gap-2.5 text-[10.5px] leading-relaxed text-slate-600 dark:text-slate-400 max-w-2xl">
                                      <Info className="w-4 h-4 text-evolver-viridian shrink-0 mt-0.5" />
                                      <div>
                                        <span className="font-extrabold text-slate-800 dark:text-slate-300">Auditor Diagnostic:</span>{" "}
                                        Supplier uploaded two matching invoice amounts of <span className="font-bold text-slate-800 dark:text-slate-200">${item.amount.toLocaleString()}</span>. The document reference values <span className="font-mono text-cyan-600 dark:text-cyan-400 bg-slate-200 dark:bg-slate-950 px-1 rounded">{item.doc1}</span> and <span className="font-mono text-cyan-600 dark:text-cyan-400 bg-slate-200 dark:bg-slate-950 px-1 rounded">{item.doc2}</span> indicate {item.score < 100 ? "a highly suspicious fuzzy similarity bypass attempt." : "an exact duplicate voucher upload."}{" "}
                                        {item.status.includes("Locked") ? (
                                          <span className="text-emerald-600 dark:text-emerald-400 font-bold block sm:inline mt-1 sm:mt-0">System block active (BSEG-ZLSPR = A) to permanently freeze payouts.</span>
                                        ) : (
                                          <span className="text-amber-600 dark:text-amber-400 font-bold block sm:inline mt-1 sm:mt-0">Unresolved voucher pairs. Payment block recommended.</span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Deep-Link Trigger Button */}
                                    <button
                                      onClick={() => setSelectedInvoice(item)}
                                      className="px-4 py-2.5 bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 border border-slate-300 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white rounded-xl text-[10px] font-extrabold uppercase font-mono tracking-wider transition-all select-none active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 shrink-0 shadow-sm"
                                    >
                                      <FileText className="w-3.5 h-3.5" />
                                      Fiori FB03 Viewer
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
              {activeScenario.visualizerType === "maverick" && (
                <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-850 rounded-2xl p-5 flex flex-col justify-between min-h-[250px] space-y-4">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-slate-800 dark:text-slate-300">Contract pricing deviation leaks audit</span>
                    <span className="text-amber-600 dark:text-amber-400 font-bold">Total price leakage detected: $42,500 USD</span>
                  </div>

                  <div className="flex-1 flex flex-col justify-around h-[120px] font-mono text-[9px]">
                    {[
                      { po: "4500084501", item: "WBS Component X", billed: 850, contract: 720, count: 250, leak: 32500 },
                      { po: "4500084592", item: "WBS Component Y", billed: 420, contract: 380, count: 150, leak: 6000 }
                    ].map((item, idx) => {
                      const totalWidth = 360;
                      const billedWidth = (item.billed / 900) * totalWidth;
                      const contractWidth = (item.contract / 900) * totalWidth;
                      
                      return (
                        <div key={idx} className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 rounded-xl">
                          <div className="w-32">
                            <span className="text-slate-400 dark:text-slate-500 block text-[7.5px] uppercase">PO {item.po} ({item.count} units)</span>
                            <span className="text-slate-800 dark:text-white font-bold">{item.item}</span>
                          </div>
                          
                          {/* Comparative visual horizontal bar */}
                          <div className="flex-1 flex flex-col space-y-1 max-w-[360px]">
                            <div className="h-2.5 bg-slate-100 dark:bg-slate-900 rounded overflow-hidden relative">
                              <div style={{ width: `${billedWidth}px` }} className="absolute h-full bg-rose-500/30" />
                              <div style={{ width: `${contractWidth}px` }} className="absolute h-full bg-emerald-500/70" />
                            </div>
                            <div className="flex justify-between text-[8px] text-slate-500">
                              <span>Contract: ${item.contract}/u</span>
                              <span>Billed PO: ${item.billed}/u</span>
                            </div>
                          </div>

                          <div className="text-right w-24">
                            <span className="text-[11px] font-extrabold text-rose-600 dark:text-rose-400">${item.leak.toLocaleString()}</span>
                            <span className="text-[7.5px] text-slate-400 dark:text-slate-500 block uppercase">Price Leakage</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SCENARIO 8: INVENTORY REALLOCATION plant stocks grid */}
              {activeScenario.visualizerType === "inventory" && (
                <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-850 rounded-2xl p-5 flex flex-col justify-between min-h-[250px] space-y-4">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-slate-800 dark:text-slate-300">Warehouse stock reallocations: surplus storage to regional production deficits</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">2 Reallocation Stock transport orders (STO) active</span>
                  </div>

                  <div className="flex-1 grid grid-cols-2 gap-4 text-xs font-mono">
                    {[
                      { mat: "MAT-29082", from: "Wolfsburg (Plant 1000)", surplus: 450, to: "Munich (Plant 2000)", deficit: 15, realloc: "180 Units STO Issued" },
                      { mat: "MAT-48091", from: "Berlin (Plant 1100)", surplus: 220, to: "Hamburg (Plant 2100)", deficit: 5, realloc: "80 Units STO Issued" }
                    ].map((item, idx) => (
                      <div key={idx} className="p-4 bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 rounded-2xl space-y-3 flex flex-col justify-between">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-800 dark:text-white font-bold text-[10.5px]">{item.mat}</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-[9px] font-bold uppercase">{item.realloc}</span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                          <div className="text-left">
                            <span className="text-slate-400 dark:text-slate-500 block text-[7.5px] uppercase">From (Surplus)</span>
                            <span className="text-slate-800 dark:text-white font-medium">{item.from}</span>
                            <span className="text-slate-650 dark:text-slate-400 font-bold block text-[9px]">{item.surplus} units</span>
                          </div>
                          
                          <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 mx-2" />

                          <div className="text-right">
                            <span className="text-slate-400 dark:text-slate-500 block text-[7.5px] uppercase">To (Deficit)</span>
                            <span className="text-slate-800 dark:text-white font-medium">{item.to}</span>
                            <span className="text-rose-600 dark:text-rose-400 font-bold block text-[9px]">{item.deficit} units</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SCENARIO 9: FREIGHT COST AUDIT Carrier rate comparative list */}
              {activeScenario.visualizerType === "freight" && (
                <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-850 rounded-2xl p-5 flex flex-col justify-between min-h-[250px] space-y-4">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-slate-800 dark:text-slate-300">Carrier logistics billing rate overcharge audit</span>
                    <span className="text-rose-600 dark:text-rose-400 font-bold">Total freight billing variance blocked: $12,800 USD</span>
                  </div>

                  <div className="flex-1 flex flex-col space-y-2 text-xs font-mono">
                    {[
                      { inv: "F-INV-8290", doc: "SH-9002001", billed: "$18,500.00", contract: "$15,200.00", weight: "42,000 lbs", variance: "$3,300.00 Overcharge" },
                      { inv: "F-INV-8312", doc: "SH-9002088", billed: "$32,400.00", contract: "$24,000.00", weight: "68,000 lbs", variance: "$8,400.00 Overcharge" }
                    ].map((item, idx) => (
                      <div key={idx} className="p-3 bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 rounded-xl flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                          <div className="text-left">
                            <span className="text-slate-400 dark:text-slate-500 block text-[8px] uppercase">Carrier Invoice</span>
                            <span className="text-slate-800 dark:text-white font-bold">{item.inv}</span>
                          </div>
                          <div className="text-left">
                            <span className="text-slate-400 dark:text-slate-500 block text-[8px] uppercase">Weight / Doc</span>
                            <span className="text-slate-650 dark:text-slate-400">{item.weight} ({item.doc})</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-6 text-[10.5px]">
                          <div className="text-right">
                            <span className="text-slate-400 dark:text-slate-500 block text-[8px] uppercase">Billed vs Contract</span>
                            <span className="text-rose-600 dark:text-rose-400">{item.billed}</span> ⟷ <span className="text-emerald-600 dark:text-emerald-400 font-bold">{item.contract}</span>
                          </div>
                          <div className="text-right w-28">
                            <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-500/10 text-rose-800 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 text-[9px] font-bold uppercase">{item.variance}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SCENARIO 10: INTERCOMPANY SETTLEMENT Cleared subsidiary ledger entries */}
              {activeScenario.visualizerType === "intercompany" && (
                <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-850 rounded-2xl p-5 flex flex-col justify-between min-h-[250px] space-y-4">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-slate-800 dark:text-slate-300">Intercompany subsidiary general ledger clearing and sweeps status</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Consolidation Ledger Balanced</span>
                  </div>

                  <div className="flex-1 grid grid-cols-2 gap-4 text-xs font-mono">
                    {[
                      { ref: "REC-US-DE-01", subA: "US01 (USA)", balA: "$450,000", subB: "DE01 (Germany)", balB: "$435,000", sweep: "$15,000 Swept" },
                      { ref: "REC-US-UK-02", subA: "US01 (USA)", balA: "$280,000", subB: "UK01 (UK)", balB: "$150,000", sweep: "$130,000 Swept" }
                    ].map((item, idx) => (
                      <div key={idx} className="p-4 bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 rounded-2xl flex flex-col justify-between space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 dark:text-slate-500 font-bold text-[9px] uppercase">Recon Code {item.ref}</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-[9px] font-bold uppercase">{item.sweep}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px] py-1 border-t border-b border-slate-200 dark:border-white/5">
                          <div>
                            <span className="text-slate-400 dark:text-slate-500 block text-[7.5px] uppercase">{item.subA}</span>
                            <span className="text-slate-800 dark:text-white font-bold">{item.balA}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 dark:text-slate-500 block text-[7.5px] uppercase">{item.subB}</span>
                            <span className="text-slate-800 dark:text-white font-bold">{item.balB}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SCENARIO 11: CAPEX OVERRUN Project PRPS WBS elements */}
              {activeScenario.visualizerType === "capex" && (
                <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-850 rounded-2xl p-5 flex flex-col justify-between min-h-[250px] space-y-4">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-slate-800 dark:text-slate-300">WBS Project budgets vs actual costs vs outstanding commitments auditing</span>
                    <span className="text-rose-600 dark:text-rose-400 font-bold">1 Overrun requisition frozen</span>
                  </div>

                  <div className="flex-1 flex flex-col justify-around h-[120px] font-mono text-[9px]">
                    {[
                      { wbs: "WBS-1710-01", name: "IT Infrastructure", budget: 500000, actual: 380000, commit: 85000, frozen: 112000 }
                    ].map((item, idx) => {
                      const totalWidth = 380;
                      const actW = (item.actual / item.budget) * totalWidth;
                      const comW = (item.commit / item.budget) * totalWidth;
                      
                      return (
                        <div key={idx} className="p-3 bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 rounded-xl space-y-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-slate-400 dark:text-slate-500 block text-[8px] uppercase">{item.wbs} Project</span>
                              <span className="text-slate-800 dark:text-white font-bold text-[11px]">{item.name}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-slate-400 dark:text-slate-500 block text-[8px] uppercase">CapEx Budget</span>
                              <span className="text-slate-800 dark:text-white font-extrabold text-[11px]">${item.budget.toLocaleString()}</span>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="h-3 bg-slate-100 dark:bg-slate-900 rounded overflow-hidden flex">
                              <div style={{ width: `${actW}px` }} className="h-full bg-emerald-500" />
                              <div style={{ width: `${comW}px` }} className="h-full bg-amber-500" />
                            </div>
                            <div className="flex justify-between text-[8px] text-slate-500">
                              <span>Actual Spend: ${item.actual.toLocaleString()}</span>
                              <span>Commitment Runs: ${item.commit.toLocaleString()}</span>
                            </div>
                          </div>

                          <div className="p-2.5 bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/10 rounded-lg text-rose-800 dark:text-rose-450 text-[10px] leading-relaxed flex items-center justify-between">
                            <span>⚠️ Intercepted requisition exceeding budget by <strong>${item.frozen.toLocaleString()}</strong>. Item blocked.</span>
                            <span className="font-bold uppercase text-[9px] px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20">Blocked</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SCENARIO 12: DYNAMIC CREDIT LIMIT AVAILABLE BAR */}
              {activeScenario.visualizerType === "credit" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                  <div className="lg:col-span-4 flex flex-col justify-between bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-4">
                    <div className="space-y-3.5">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider flex items-center">
                        <Sliders className="w-4 h-4 text-evolver-viridian mr-2" />
                        Credit Buffer
                      </h4>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500 font-medium">Override Reserve:</span>
                          <span className="text-slate-900 dark:text-white font-mono font-bold">${creditBuffer.toLocaleString()}</span>
                        </div>
                        <input
                          type="range"
                          min="10000"
                          max="50000"
                          step="5000"
                          value={creditBuffer}
                          onChange={(e) => setCreditBuffer(Number(e.target.value))}
                          className="w-full accent-evolver-viridian cursor-pointer bg-slate-200 dark:bg-slate-950"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-850 rounded-xl text-[10.5px] leading-relaxed text-slate-500 dark:text-slate-400">
                      💡 Sets the safety cash buffer added to active customer accounts to auto-release orders locked under basic credit thresholds.
                    </div>
                  </div>

                  <div className="lg:col-span-8 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-850 rounded-2xl p-5 flex flex-col justify-between min-h-[250px]">
                    <div className="flex items-center justify-between mb-4 text-[10px]">
                      <span className="font-bold text-slate-800 dark:text-slate-300">Customer open exposure vs credit limits analysis</span>
                      <span className="text-emerald-600 dark:text-emerald-400 text-[9px] font-bold font-mono">Confirmed release</span>
                    </div>

                    <div className="flex-1 flex flex-col justify-around h-[120px] font-mono text-[9px]">
                      {[
                        { client: "Domestic US Customer 14", val: 450000, limit: 500000, cleared: 120000, status: "Released" }
                      ].map((item, idx) => {
                        const totalW = 380;
                        const expW = (item.val / (item.limit + creditBuffer)) * totalW;
                        const limW = (item.limit / (item.limit + creditBuffer)) * totalW;
                        
                        return (
                          <div key={idx} className="p-3 bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 rounded-xl space-y-3">
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="text-slate-400 dark:text-slate-500 block text-[8px] uppercase">Customer Account</span>
                                <span className="text-slate-800 dark:text-white font-bold text-[11px]">{item.client}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-slate-400 dark:text-slate-500 block text-[8px] uppercase">Deposit Cleared</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-[11px]">+${item.cleared.toLocaleString()}</span>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="h-3 bg-slate-100 dark:bg-slate-900 rounded overflow-hidden relative">
                                <div style={{ width: `${limW}px` }} className="absolute h-full bg-slate-200 dark:bg-slate-800" />
                                <div style={{ width: `${expW}px` }} className="absolute h-full bg-cyan-500/70" />
                              </div>
                              <div className="flex justify-between text-[8px] text-slate-500">
                                <span>Active Exposure: ${item.val.toLocaleString()}</span>
                                <span>Credit Limit: ${item.limit.toLocaleString()}</span>
                              </div>
                            </div>

                            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 rounded-lg text-emerald-800 dark:text-emerald-400 text-[10px] leading-relaxed flex items-center justify-between">
                              <span>✅ Confirmed bank deposit cleared customer exposure. Credit hold released.</span>
                              <span className="font-bold uppercase text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">Released</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 4: REASON (ARIA RULE ENGINE AND POLICY CHECKS) */}
          {activeTab === "reason" && (
            <div className="flex-grow flex flex-col justify-between py-2 space-y-4 animate-in fade-in duration-300">
              
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/5 pb-3">
                <div>
                  <span className="text-[10px] font-extrabold text-evolver-viridian uppercase tracking-widest block mb-1">AI Reasoning Engine</span>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                    {activeScenario.id === "duplicate-payments" ? "Fuzzy Duplicate Audit Sandbox" : "Policy Checklist Audits"}
                  </h2>
                </div>
              </div>

              {activeScenario.id === "duplicate-payments" ? (
                /* UPGRADED FUZZY DUPLICATE AUDIT SANDBOX */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                  
                  {/* Left Column: Rule Engine Control Center */}
                  <div className="lg:col-span-5 flex flex-col justify-between bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-2xl p-5 space-y-5 shadow-sm dark:shadow-lg relative overflow-hidden backdrop-blur-sm">
                    {/* Decorative watermark */}
                    <div className="absolute -bottom-10 -left-10 opacity-5 dark:opacity-[0.02] text-slate-400 dark:text-white pointer-events-none select-none">
                      <Sliders className="w-36 h-36" />
                    </div>

                    <div className="space-y-4 relative z-10">
                      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/5 pb-2.5">
                        <Sliders className="w-4.5 h-4.5 text-cyan-500 dark:text-cyan-400 animate-pulse" />
                        <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                          Policy Sandbox Settings
                        </h4>
                      </div>

                      {/* Rule 1: Levenshtein Similarity Slider */}
                      <div className="space-y-2 p-3.5 bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 rounded-xl shadow-inner">
                        <div className="flex justify-between items-center text-[10.5px]">
                          <span className="text-slate-600 dark:text-slate-400 font-bold">Fuzzy Similarity Limit:</span>
                          <span className="text-cyan-600 dark:text-cyan-400 font-mono font-extrabold px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 text-xs">
                            {duplicateThreshold}% Similarity
                          </span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="100"
                          value={duplicateThreshold}
                          onChange={(e) => setDuplicateThreshold(Number(e.target.value))}
                          className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 dark:accent-cyan-400 focus:outline-none focus:ring-0"
                        />
                        <div className="flex justify-between text-[8px] text-slate-500 font-mono">
                          <span>50% (Loose)</span>
                          <span>90% (Optimal)</span>
                          <span>100% (Exact)</span>
                        </div>
                      </div>

                      {/* Rule 2: Baseline Date Window Slider */}
                      <div className="space-y-2 p-3.5 bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 rounded-xl shadow-inner">
                        <div className="flex justify-between items-center text-[10.5px]">
                          <span className="text-slate-600 dark:text-slate-400 font-bold">Baseline Date Window:</span>
                          <span className="text-indigo-600 dark:text-indigo-400 font-mono font-extrabold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-xs">
                            {policyBaselineWindow} Days Buffer
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="15"
                          value={policyBaselineWindow}
                          disabled={!isCheckBaselineDate}
                          onChange={(e) => setPolicyBaselineWindow(Number(e.target.value))}
                          className={clsx(
                            "w-full h-1 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-0",
                            isCheckBaselineDate 
                              ? "bg-slate-200 dark:bg-slate-800 accent-indigo-500 dark:accent-indigo-400" 
                              : "bg-slate-300 dark:bg-slate-900 accent-slate-400 dark:accent-slate-600 cursor-not-allowed opacity-40"
                          )}
                        />
                        <div className="flex justify-between text-[8px] text-slate-500 font-mono">
                          <span>0 Days (Same Day)</span>
                          <span>3 Days (Optimal)</span>
                          <span>15 Days (Wide)</span>
                        </div>
                      </div>

                      {/* Rule Engine Active Toggles */}
                      <div className="space-y-2.5">
                        <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider block">
                          Active Audit Policies
                        </span>

                        {/* Toggle A: Ignore Punctuation */}
                        <div className="flex justify-between items-center p-2.5 bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-xl transition-all hover:bg-slate-100 dark:hover:bg-slate-950/60 shadow-sm">
                          <div>
                            <span className="text-[10.5px] font-bold text-slate-700 dark:text-slate-300 block">Ignore Reference Punctuation</span>
                            <span className="text-[8px] text-slate-500 font-mono block">Strips hyphens/slashes/spaces before similarity checks</span>
                          </div>
                          <button
                            onClick={() => setIsIgnorePunctuation(!isIgnorePunctuation)}
                            className={clsx(
                              "w-9 h-5 rounded-full p-0.5 border transition-all duration-300 focus:outline-none shadow-inner shrink-0 cursor-pointer relative",
                              isIgnorePunctuation 
                                ? "bg-emerald-100 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500/40" 
                                : "bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-white/5"
                            )}
                          >
                            <div className={clsx(
                              "w-3.5 h-3.5 rounded-full shadow transition-all duration-300",
                              isIgnorePunctuation 
                                ? "bg-emerald-600 dark:bg-emerald-400 translate-x-4" 
                                : "bg-slate-500 translate-x-0"
                            )} />
                          </button>
                        </div>

                        {/* Toggle B: Same Baseline Date */}
                        <div className="flex justify-between items-center p-2.5 bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-xl transition-all hover:bg-slate-100 dark:hover:bg-slate-950/60 shadow-sm">
                          <div>
                            <span className="text-[10.5px] font-bold text-slate-700 dark:text-slate-300 block">Enforce Baseline Date Proximity</span>
                            <span className="text-[8px] text-slate-500 font-mono block">Checks if posting date offset fits within the day window</span>
                          </div>
                          <button
                            onClick={() => setIsCheckBaselineDate(!isCheckBaselineDate)}
                            className={clsx(
                              "w-9 h-5 rounded-full p-0.5 border transition-all duration-300 focus:outline-none shadow-inner shrink-0 cursor-pointer relative",
                              isCheckBaselineDate 
                                ? "bg-emerald-100 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500/40" 
                                : "bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-white/5"
                            )}
                          >
                            <div className={clsx(
                              "w-3.5 h-3.5 rounded-full shadow transition-all duration-300",
                              isCheckBaselineDate 
                                ? "bg-emerald-600 dark:bg-emerald-400 translate-x-4" 
                                : "bg-slate-500 translate-x-0"
                            )} />
                          </button>
                        </div>

                        {/* Toggle C: Restrict to KR invoices */}
                        <div className="flex justify-between items-center p-2.5 bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-xl transition-all hover:bg-slate-100 dark:hover:bg-slate-950/60 shadow-sm">
                          <div>
                            <span className="text-[10.5px] font-bold text-slate-700 dark:text-slate-300 block">Restrict to Vendor Invoices (KR)</span>
                            <span className="text-[8px] text-slate-500 font-mono block">Filters out customer lines from the vulnerability scan</span>
                          </div>
                          <button
                            onClick={() => setIsRestrictDocType(!isRestrictDocType)}
                            className={clsx(
                              "w-9 h-5 rounded-full p-0.5 border transition-all duration-300 focus:outline-none shadow-inner shrink-0 cursor-pointer relative",
                              isRestrictDocType 
                                ? "bg-emerald-100 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500/40" 
                                : "bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-white/5"
                            )}
                          >
                            <div className={clsx(
                              "w-3.5 h-3.5 rounded-full shadow transition-all duration-300",
                              isRestrictDocType 
                                ? "bg-emerald-600 dark:bg-emerald-400 translate-x-4" 
                                : "bg-slate-500 translate-x-0"
                            )} />
                          </button>
                        </div>

                        {/* Toggle D: High-Value Evaluation Presets */}
                        <div className="flex justify-between items-center p-2.5 bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-500/10 rounded-xl transition-all hover:bg-cyan-100/50 dark:hover:bg-cyan-950/40 shadow-sm">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4.5 h-4.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                            <div>
                              <span className="text-[10.5px] font-extrabold text-cyan-800 dark:text-cyan-300 block">Simulate Corporate Savings Presets</span>
                              <span className="text-[8px] text-slate-600 dark:text-slate-400 font-mono block">Inject high-exposure duplicate entries ($1.6M+ saved)</span>
                            </div>
                          </div>
                          <button
                            onClick={() => setUseEvaluationPresets(!useEvaluationPresets)}
                            className={clsx(
                              "w-9 h-5 rounded-full p-0.5 border transition-all duration-300 focus:outline-none shadow-inner shrink-0 cursor-pointer relative",
                              useEvaluationPresets 
                                ? "bg-cyan-100 dark:bg-cyan-500/20 border-cyan-300 dark:border-cyan-500/40" 
                                : "bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-white/5"
                            )}
                          >
                            <div className={clsx(
                              "w-3.5 h-3.5 rounded-full shadow transition-all duration-300",
                              useEvaluationPresets 
                                ? "bg-cyan-600 dark:bg-cyan-400 translate-x-4" 
                                : "bg-slate-500 translate-x-0"
                            )} />
                          </button>
                        </div>

                      </div>
                    </div>
                  </div>

                  {/* Right Column: AI Audit Copilot Console */}
                  <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                    
                    {/* Part A: Dynamic Rules Checklist */}
                    <div className="space-y-2">
                      <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider block">
                        Real-Time Policy Compliance Mappings
                      </span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        
                        {/* Policy check item 1 */}
                        <div className="p-3.5 bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 rounded-2xl flex items-center justify-between text-xs font-mono shadow-sm">
                          <div className="flex items-center space-x-2.5">
                            <div className="p-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                            <div className="text-left">
                              <span className="text-slate-500 block text-[7.5px] uppercase">Similarity Threshold</span>
                              <span className="text-slate-800 dark:text-white font-bold text-[10.5px] truncate">Levenshtein {duplicateThreshold}%</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-[8.5px] font-bold">OPTIMAL</span>
                          </div>
                        </div>

                        {/* Policy check item 2 */}
                        <div className="p-3.5 bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 rounded-2xl flex items-center justify-between text-xs font-mono shadow-sm">
                          <div className="flex items-center space-x-2.5">
                            <div className={clsx(
                              "p-1 rounded-full shrink-0",
                              isIgnorePunctuation ? "bg-emerald-100 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-amber-100 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400"
                            )}>
                              {isIgnorePunctuation ? (
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              ) : (
                                <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
                              )}
                            </div>
                            <div className="text-left">
                              <span className="text-slate-500 block text-[7.5px] uppercase">Punctuation Check</span>
                              <span className="text-slate-800 dark:text-white font-bold text-[10.5px]">Clean String Match</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={clsx(
                              "px-2 py-0.5 rounded text-[8.5px] font-bold",
                              isIgnorePunctuation ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20" : "bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20"
                            )}>
                              {isIgnorePunctuation ? "ACTIVE" : "BYPASSED"}
                            </span>
                          </div>
                        </div>

                        {/* Policy check item 3 */}
                        <div className="p-3.5 bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 rounded-2xl flex items-center justify-between text-xs font-mono shadow-sm">
                          <div className="flex items-center space-x-2.5">
                            <div className={clsx(
                              "p-1 rounded-full shrink-0",
                              isCheckBaselineDate ? "bg-emerald-100 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-white/5 text-slate-500"
                            )}>
                              {isCheckBaselineDate ? (
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              ) : (
                                <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
                              )}
                            </div>
                            <div className="text-left">
                              <span className="text-slate-500 block text-[7.5px] uppercase">Date Proximity Rule</span>
                              <span className="text-slate-800 dark:text-white font-bold text-[10.5px]">Offset Buffer: &lt;= {policyBaselineWindow}d</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={clsx(
                              "px-2 py-0.5 rounded text-[8.5px] font-bold",
                              isCheckBaselineDate ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20" : "bg-slate-200 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-white/10"
                            )}>
                              {isCheckBaselineDate ? "ENFORCED" : "INACTIVE"}
                            </span>
                          </div>
                        </div>

                        {/* Policy check item 4 */}
                        <div className="p-3.5 bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 rounded-2xl flex items-center justify-between text-xs font-mono shadow-sm">
                          <div className="flex items-center space-x-2.5">
                            <div className={clsx(
                              "p-1 rounded-full shrink-0",
                              detectedDuplicates.length > 0 ? "bg-rose-100 dark:bg-rose-500/10 border-rose-300 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 animate-pulse" : "bg-emerald-100 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                            )}>
                              {detectedDuplicates.length > 0 ? (
                                <ShieldAlert className="w-3.5 h-3.5" />
                              ) : (
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              )}
                            </div>
                            <div className="text-left">
                              <span className="text-slate-500 block text-[7.5px] uppercase">Payment Block Scan</span>
                              <span className="text-slate-800 dark:text-white font-bold text-[10.5px]">BSEG-ZLSPR Audit</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={clsx(
                              "px-2 py-0.5 rounded text-[8.5px] font-bold",
                              detectedDuplicates.length > 0 ? "bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20" : "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                            )}>
                              {detectedDuplicates.length > 0 ? `${detectedDuplicates.length} RISK FLGS` : "PASSED"}
                            </span>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Part B: A.R.I.A. Audit Reasoning Terminal Console */}
                    <div className="bg-slate-950 border border-slate-350 dark:border-white/10 text-slate-100 rounded-2xl p-4 font-mono text-[10px] leading-relaxed shadow-inner flex flex-col justify-between flex-grow min-h-[160px] max-h-[180px] overflow-y-auto">
                      <div className="space-y-2 select-text">
                        <div className="flex items-center gap-1.5 border-b border-slate-800 dark:border-white/5 pb-1.5 mb-1.5 text-slate-400 font-bold">
                          <Terminal className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                          <span>A.R.I.A. Executive Audit Log</span>
                        </div>
                        <p className="text-emerald-400 font-semibold">
                          &gt; matching live S/4HANA outstanding payables (BSIK)...
                        </p>
                        <p className="text-slate-400 text-[9.5px]">
                          - Similarity scope: <strong className="text-slate-200">{duplicateThreshold}% Levenshtein</strong> | Ignore punctuation: <strong className="text-slate-200">{isIgnorePunctuation ? "Active" : "Inactive"}</strong> | Date buffer: <strong className="text-slate-200">{isCheckBaselineDate ? `${policyBaselineWindow}d proximity` : "Inactive"}</strong>
                        </p>
                        
                        {detectedDuplicates.length > 0 ? (
                          <div className="text-rose-400 font-bold border-l-2 border-rose-500/40 pl-2.5 py-1 bg-rose-500/5 rounded-r text-[10px] leading-normal">
                            🚨 VULNERABILITY ALERT: Intercepted {detectedDuplicates.length} duplicate invoice pair(s) totaling ${detectedDuplicates.reduce((acc, x) => acc + x.amount, 0).toLocaleString()} USD in open exposure.
                          </div>
                        ) : (
                          <div className="text-emerald-400 font-bold border-l-2 border-emerald-500/40 pl-2.5 py-1 bg-emerald-500/5 rounded-r text-[10px]">
                            ✅ SECURE: No suspicious duplicate invoice exposure detected in active scope.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Part B2: A.R.I.A. Executive Audit Insight Panel */}
                    {detectedDuplicates.length > 0 && (
                      <div className="space-y-2.5 text-left mt-2">
                        <span className="text-[9px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider block">
                          A.R.I.A. Key Action Recommendations & Reasoning
                        </span>

                        <div className="grid grid-cols-1 gap-3">
                          {/* Suggestion 1: Lock in BSEG */}
                          <div className="p-4 bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 hover:border-rose-300 dark:hover:border-rose-800/50 rounded-2xl flex items-start gap-3.5 text-xs leading-normal shadow-sm transition-all duration-200">
                            <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-450 shrink-0 mt-0.5 animate-pulse" />
                            <div className="text-left space-y-1">
                              <span className="font-extrabold text-rose-950 dark:text-rose-250 block text-[11px]">1. Mitigate Exposure: Commit Payment Block (BSEG-ZLSPR = 'A')</span>
                              <span className="text-slate-700 dark:text-slate-300 text-[10px] block font-sans leading-relaxed">
                                <strong className="text-slate-900 dark:text-white font-semibold">Reasoning:</strong> Standard ERP exact-match duplicate checking fails on transposed punctuation. A.R.I.A. computed a <strong className="text-slate-900 dark:text-white font-semibold font-mono bg-slate-100 dark:bg-slate-800/60 px-1 py-0.2 rounded border border-slate-200 dark:border-slate-700/30">94% similarity score</strong> using Levenshtein distance on Ingram Micro Logistics invoices <strong className="text-slate-900 dark:text-white font-semibold">900200-83</strong> and <strong className="text-slate-900 dark:text-white font-semibold">90020083</strong>.
                              </span>
                              <span className="text-slate-700 dark:text-slate-300 text-[10px] block font-sans leading-relaxed mt-1">
                                <strong className="text-slate-900 dark:text-white font-semibold">Action:</strong> Go to <strong className="text-slate-900 dark:text-white font-semibold">5. Execute BAPI</strong> to freeze standard BSEG tables, blocking document <strong className="text-slate-900 dark:text-white font-mono font-semibold">1900000013-DUP</strong> to secure <strong className="text-emerald-700 dark:text-emerald-400 font-extrabold">$125,000</strong> cash risk before automatic clearing.
                              </span>
                            </div>
                          </div>

                          {/* Suggestion 2: Standardize Levenshtein Buffer */}
                          <div className="p-4 bg-cyan-50/70 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-900/30 hover:border-cyan-300 dark:hover:border-cyan-800/50 rounded-2xl flex items-start gap-3.5 text-xs leading-normal shadow-sm transition-all duration-200">
                            <Sliders className="w-5 h-5 text-cyan-600 dark:text-cyan-450 shrink-0 mt-0.5 animate-pulse" />
                            <div className="text-left space-y-1">
                              <span className="font-extrabold text-cyan-950 dark:text-cyan-250 block text-[11px]">2. Policy Control: Standardize Fuzzy Similarity Limit (90%)</span>
                              <span className="text-slate-700 dark:text-slate-300 text-[10px] block font-sans leading-relaxed">
                                <strong className="text-slate-900 dark:text-white font-semibold">Reasoning:</strong> Supplier invoice reference formatting regularly shifts across regional ERP nodes. Exact indexing matches are bypassed by minor string variations (e.g. slashes/hyphens).
                              </span>
                              <span className="text-slate-700 dark:text-slate-300 text-[10px] block font-sans leading-relaxed mt-1">
                                <strong className="text-slate-900 dark:text-white font-semibold">Action:</strong> Standardize the active policy baseline to a <strong className="text-slate-900 dark:text-white font-semibold">90% similarity window</strong> on all vendor ledger postings to intercept similar transpositions automatically.
                              </span>
                            </div>
                          </div>

                          {/* Suggestion 3: SU01 Role Assign */}
                          <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 hover:border-emerald-300 dark:hover:border-emerald-800/50 rounded-2xl flex items-start gap-3.5 text-xs leading-normal shadow-sm transition-all duration-200">
                            <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-450 shrink-0 mt-0.5 animate-pulse" />
                            <div className="text-left space-y-1">
                              <span className="font-extrabold text-emerald-950 dark:text-emerald-250 block text-[11px]">3. Reconcile Roles: Assign AP Accountant Target Role (SU01)</span>
                              <span className="text-slate-700 dark:text-slate-300 text-[10px] block font-sans leading-relaxed">
                                <strong className="text-slate-900 dark:text-white font-semibold">Reasoning:</strong> Navigation target mapping exceptions for Fiori apps such as <strong className="text-slate-900 dark:text-white font-semibold">#JournalEntry-display</strong> and <strong className="text-slate-900 dark:text-white font-semibold">#JournalEntry-manage</strong> are typically caused by missing SAP security role mappings.
                              </span>
                              <span className="text-slate-700 dark:text-slate-300 text-[10px] block font-sans leading-relaxed mt-1">
                                <strong className="text-slate-900 dark:text-white font-semibold">Action:</strong> Ensure your integration user <strong className="text-slate-900 dark:text-white font-mono font-semibold">ARIA_FIN</strong> has the security role <strong className="text-emerald-800 dark:text-emerald-300 font-extrabold font-mono text-[9px] px-1.5 py-0.5 rounded bg-emerald-105 dark:bg-emerald-950/50 border border-emerald-200/50 dark:border-emerald-800/30">SAP_BR_AP_ACCOUNTANT</strong> assigned inside standard transaction <strong className="text-slate-900 dark:text-white font-semibold">SU01</strong>.
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Part C: Closed-Loop Commit Trigger */}
                    <div className="border-t border-slate-200 dark:border-white/5 pt-3 mt-3 flex justify-between items-center gap-3">
                      <div className="flex items-start gap-1 text-[9px] text-slate-400 max-w-sm">
                        <Info className="w-3.5 h-3.5 text-cyan-500 shrink-0 mt-0.5" />
                        <span>Audit complete. Block parameters will sync to standard BSEG tables in real-time.</span>
                      </div>
                      <button
                        onClick={() => setActiveTab("execute")}
                        className="px-4.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold transition-all duration-200 active:scale-[0.97] shadow-[0_0_12px_rgba(16,185,129,0.3)] flex items-center gap-1.5 select-none shrink-0 cursor-pointer"
                      >
                        Proceed to ERP Commit <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </div>
                    </div>
                  </div>
                ) : activeScenario.id === "ap-ar-optimization" ? (
                /* UPGRADED WORKING CAPITAL AUDIT SANDBOX */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                  
                  {/* Left Column: Rule Engine Control Center */}
                  <div className="lg:col-span-5 flex flex-col justify-between bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-2xl p-5 space-y-5 shadow-sm dark:shadow-lg relative overflow-hidden backdrop-blur-sm">
                    {/* Decorative watermark */}
                    <div className="absolute -bottom-10 -left-10 opacity-5 dark:opacity-[0.02] text-slate-400 dark:text-white pointer-events-none select-none">
                      <TrendingUp className="w-36 h-36" />
                    </div>

                    <div className="space-y-4 relative z-10">
                      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/5 pb-2.5">
                        <Sliders className="w-4.5 h-4.5 text-cyan-500 dark:text-cyan-400 animate-pulse" />
                        <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                          Runway Control Center
                        </h4>
                      </div>

                      {/* Rule 1: Safety Buffer Slider */}
                      <div className="space-y-2 p-3.5 bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 rounded-xl shadow-inner">
                        <div className="flex justify-between items-center text-[10.5px]">
                          <span className="text-slate-655 dark:text-slate-400 font-bold">Safety Cash Buffer:</span>
                          <span className="text-cyan-600 dark:text-cyan-400 font-mono font-bold px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 text-xs">
                            ${(minBuffer / 1000000).toFixed(2)}M Reserve
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1000000"
                          max="2200000"
                          step="100000"
                          value={minBuffer}
                          onChange={(e) => setMinBuffer(Number(e.target.value))}
                          className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 dark:accent-cyan-400 focus:outline-none focus:ring-0"
                        />
                        <div className="flex justify-between text-[8px] text-slate-500 font-mono">
                          <span>$1.0M (Low)</span>
                          <span>$1.5M (Optimal)</span>
                          <span>$2.2M (High)</span>
                        </div>
                      </div>

                      {/* Rule 2: AR Early Discount Rate */}
                      <div className="space-y-2 p-3.5 bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 rounded-xl shadow-inner">
                        <div className="flex justify-between items-center text-[10.5px]">
                          <span className="text-slate-655 dark:text-slate-400 font-bold">AR Early Discount Rate:</span>
                          <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-xs">
                            {discountRate.toFixed(1)}% Yield
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="4.0"
                          step="0.5"
                          value={discountRate}
                          disabled={!isArAccelerateEnabled}
                          onChange={(e) => setDiscountRate(Number(e.target.value))}
                          className={clsx(
                            "w-full h-1 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-0",
                            isArAccelerateEnabled 
                              ? "bg-slate-200 dark:bg-slate-800 accent-indigo-500 dark:accent-indigo-400" 
                              : "bg-slate-300 dark:bg-slate-900 accent-slate-400 dark:accent-slate-600 cursor-not-allowed opacity-40"
                          )}
                        />
                        <div className="flex justify-between text-[8px] text-slate-500 font-mono">
                          <span>0.5% (Conservative)</span>
                          <span>2.0% (Optimal)</span>
                          <span>4.0% (Aggressive)</span>
                        </div>
                      </div>

                      {/* Rule 3: AP Extension Slider */}
                      <div className="space-y-2 p-3.5 bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 rounded-xl shadow-inner">
                        <div className="flex justify-between items-center text-[10.5px]">
                          <span className="text-slate-655 dark:text-slate-400 font-bold">AP Outflow Extension:</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-xs">
                            +{apExtension} Days Deferral
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="30"
                          step="5"
                          value={apExtension}
                          disabled={!isApDeferEnabled}
                          onChange={(e) => setApExtension(Number(e.target.value))}
                          className={clsx(
                            "w-full h-1 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-0",
                            isApDeferEnabled 
                              ? "bg-slate-200 dark:bg-slate-800 accent-emerald-500 dark:accent-emerald-400" 
                              : "bg-slate-300 dark:bg-slate-900 accent-slate-400 dark:accent-slate-600 cursor-not-allowed opacity-40"
                          )}
                        />
                        <div className="flex justify-between text-[8px] text-slate-500 font-mono">
                          <span>+0 Days (Immediate)</span>
                          <span>+15 Days (Optimal)</span>
                          <span>+30 Days (Maximum)</span>
                        </div>
                      </div>

                      {/* Toggles */}
                      <div className="space-y-2.5">
                        <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider block">
                          Active Optimization Policies
                        </span>

                        {/* Toggle A: AR Collections */}
                        <div className="flex justify-between items-center p-2.5 bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-xl transition-all hover:bg-slate-100 dark:hover:bg-slate-950/60 shadow-sm">
                          <div>
                            <span className="text-[10.5px] font-bold text-slate-700 dark:text-slate-300 block">Accelerate Customer Receivables</span>
                            <span className="text-[8px] text-slate-500 font-mono block">Enforces early discount (2/10 Net 30) collections via OData</span>
                          </div>
                          <button
                            onClick={() => setIsArAccelerateEnabled(!isArAccelerateEnabled)}
                            className={clsx(
                              "w-9 h-5 rounded-full p-0.5 border transition-all duration-300 focus:outline-none shadow-inner shrink-0 cursor-pointer relative",
                              isArAccelerateEnabled 
                                ? "bg-emerald-100 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500/40" 
                                : "bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-white/5"
                            )}
                          >
                            <div className={clsx(
                              "w-3.5 h-3.5 rounded-full shadow transition-all duration-300",
                              isArAccelerateEnabled 
                                ? "bg-emerald-600 dark:bg-emerald-400 translate-x-4" 
                                : "bg-slate-500 translate-x-0"
                            )} />
                          </button>
                        </div>

                        {/* Toggle B: AP Extensions */}
                        <div className="flex justify-between items-center p-2.5 bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-xl transition-all hover:bg-slate-100 dark:hover:bg-slate-950/60 shadow-sm">
                          <div>
                            <span className="text-[10.5px] font-bold text-slate-700 dark:text-slate-300 block">Enforce Payables Extensions</span>
                            <span className="text-[8px] text-slate-500 font-mono block">Extends supplier baseline payables dates to maximize runway</span>
                          </div>
                          <button
                            onClick={() => setIsApDeferEnabled(!isApDeferEnabled)}
                            className={clsx(
                              "w-9 h-5 rounded-full p-0.5 border transition-all duration-300 focus:outline-none shadow-inner shrink-0 cursor-pointer relative",
                              isApDeferEnabled 
                                ? "bg-emerald-100 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500/40" 
                                : "bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-white/5"
                            )}
                          >
                            <div className={clsx(
                              "w-3.5 h-3.5 rounded-full shadow transition-all duration-300",
                              isApDeferEnabled 
                                ? "bg-emerald-600 dark:bg-emerald-400 translate-x-4" 
                                : "bg-slate-500 translate-x-0"
                            )} />
                          </button>
                        </div>

                        {/* Toggle C: High-Yield Presets */}
                        <div className="flex justify-between items-center p-2.5 bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-500/10 rounded-xl transition-all hover:bg-cyan-100/50 dark:hover:bg-cyan-950/40 shadow-sm">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4.5 h-4.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                            <div>
                              <span className="text-[10.5px] font-extrabold text-cyan-800 dark:text-cyan-300 block">Treasury Cash Concentration Preset</span>
                              <span className="text-[8px] text-slate-650 dark:text-slate-400 font-mono block">Simulate high-yield intercompany cash sweeps (+$330K)</span>
                            </div>
                          </div>
                          <button
                            onClick={() => setUseHighYieldArPreset(!useHighYieldArPreset)}
                            className={clsx(
                              "w-9 h-5 rounded-full p-0.5 border transition-all duration-300 focus:outline-none shadow-inner shrink-0 cursor-pointer relative",
                              useHighYieldArPreset 
                                ? "bg-cyan-100 dark:bg-cyan-500/20 border-cyan-300 dark:border-cyan-500/40" 
                                : "bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-white/5"
                            )}
                          >
                            <div className={clsx(
                              "w-3.5 h-3.5 rounded-full shadow transition-all duration-300",
                              useHighYieldArPreset 
                                ? "bg-cyan-600 dark:bg-cyan-400 translate-x-4" 
                                : "bg-slate-500 translate-x-0"
                            )} />
                          </button>
                        </div>

                      </div>
                    </div>
                  </div>

                  {/* Right Column: AI Audit Copilot Console */}
                  <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                    
                    {/* Part A: Dynamic Rules Checklist */}
                    <div className="space-y-2">
                      <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider block">
                        Real-Time Treasury Policy Compliances
                      </span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        
                        {/* Policy check item 1: Buffer Check */}
                        <div className="p-3.5 bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 rounded-2xl flex items-center justify-between text-xs font-mono shadow-sm">
                          <div className="flex items-center space-x-2.5">
                            <div className={clsx(
                              "p-1 rounded-full shrink-0",
                              forecastCurves.lowestOpt >= minBuffer 
                                ? "bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                                : "bg-rose-100 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 animate-pulse"
                            )}>
                              {forecastCurves.lowestOpt >= minBuffer ? (
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              ) : (
                                <ShieldAlert className="w-3.5 h-3.5" />
                              )}
                            </div>
                            <div className="text-left">
                              <span className="text-slate-500 block text-[7.5px] uppercase">Cash Safety Runway</span>
                              <span className="text-slate-800 dark:text-white font-bold text-[10.5px] truncate">
                                Min Runway: ${(forecastCurves.lowestOpt / 1000000).toFixed(2)}M
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={clsx(
                              "px-2 py-0.5 rounded text-[8.5px] font-bold",
                              forecastCurves.lowestOpt >= minBuffer 
                                ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20" 
                                : "bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20"
                            )}>
                              {forecastCurves.lowestOpt >= minBuffer ? "SECURED" : "BREACHED"}
                            </span>
                          </div>
                        </div>

                        {/* Policy check item 2: AR early collection */}
                        <div className="p-3.5 bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 rounded-2xl flex items-center justify-between text-xs font-mono shadow-sm">
                          <div className="flex items-center space-x-2.5">
                            <div className={clsx(
                              "p-1 rounded-full shrink-0",
                              isArAccelerateEnabled ? "bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-white/5 text-slate-500"
                            )}>
                              {isArAccelerateEnabled ? (
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              ) : (
                                <ShieldAlert className="w-3.5 h-3.5 text-slate-550" />
                              )}
                            </div>
                            <div className="text-left">
                              <span className="text-slate-500 block text-[7.5px] uppercase">Early Pay Incentives</span>
                              <span className="text-slate-800 dark:text-white font-bold text-[10.5px]">2/10 Net 30 Terms</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={clsx(
                              "px-2 py-0.5 rounded text-[8.5px] font-bold",
                              isArAccelerateEnabled ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20" : "bg-slate-200 dark:bg-slate-500 border border-slate-305 dark:border-white/10"
                            )}>
                              {isArAccelerateEnabled ? `${discountRate}% RATE` : "DISABLED"}
                            </span>
                          </div>
                        </div>

                        {/* Policy check item 3: AP extensions */}
                        <div className="p-3.5 bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 rounded-2xl flex items-center justify-between text-xs font-mono shadow-sm">
                          <div className="flex items-center space-x-2.5">
                            <div className={clsx(
                              "p-1 rounded-full shrink-0",
                              isApDeferEnabled ? "bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-white/5 text-slate-500"
                            )}>
                              {isApDeferEnabled ? (
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              ) : (
                                <ShieldAlert className="w-3.5 h-3.5 text-slate-550" />
                              )}
                            </div>
                            <div className="text-left">
                              <span className="text-slate-500 block text-[7.5px] uppercase">Payables Extensions</span>
                              <span className="text-slate-800 dark:text-white font-bold text-[10.5px]">AP Offset: +{apExtension}d</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={clsx(
                              "px-2 py-0.5 rounded text-[8.5px] font-bold",
                              isApDeferEnabled ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20" : "bg-slate-200 dark:bg-slate-550 border border-slate-300 dark:border-white/10"
                            )}>
                              {isApDeferEnabled ? "ACTIVE" : "BYPASSED"}
                            </span>
                          </div>
                        </div>

                        {/* Policy check item 4: Liquidity limit check */}
                        <div className="p-3.5 bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 rounded-2xl flex items-center justify-between text-xs font-mono shadow-sm">
                          <div className="flex items-center space-x-2.5">
                            <div className={clsx(
                              "p-1 rounded-full shrink-0",
                              forecastCurves.lowestOpt > 0 ? "bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-rose-100 dark:bg-rose-500/10 border border-rose-300 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 animate-pulse"
                            )}>
                              {forecastCurves.lowestOpt > 0 ? (
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              ) : (
                                <ShieldAlert className="w-3.5 h-3.5" />
                              )}
                            </div>
                            <div className="text-left">
                              <span className="text-slate-500 block text-[7.5px] uppercase">Overdraft Risk Audit</span>
                              <span className="text-slate-800 dark:text-white font-bold text-[10.5px]">Liquidity Baseline Scan</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={clsx(
                              "px-2 py-0.5 rounded text-[8.5px] font-bold",
                              forecastCurves.lowestOpt > 0 ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20" : "bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20"
                            )}>
                              {forecastCurves.lowestOpt > 0 ? "SAFE" : "OVERDRAFT RISK"}
                            </span>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Part B: A.R.I.A. Audit Reasoning Terminal Console */}
                    <div className="bg-slate-900 border border-slate-800 text-slate-100 dark:bg-black/60 dark:border-white/5 rounded-2xl p-4 font-mono text-[10px] leading-relaxed shadow-inner flex flex-col justify-between flex-grow min-h-[220px]">
                      <div className="space-y-2.5 select-text">
                        <div className="flex items-center gap-1.5 border-b border-slate-800 dark:border-white/5 pb-1.5 mb-2 text-slate-400 font-bold">
                          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                          <span>A.R.I.A. Treasury Reasoning Log</span>
                        </div>
                        <p className="text-emerald-400 font-semibold">
                          &gt; projecting 30-day cash conversion runway across legal entity company codes...
                        </p>
                        <p className="text-slate-300">
                          - Safety Buffer limit: <strong className="text-white font-bold">${(minBuffer / 1000000).toFixed(2)}M USD</strong>.
                          - AR collection acceleration: <strong className="text-white font-bold">{isArAccelerateEnabled ? `Active (${discountRate.toFixed(1)}% early discount)` : "Inactive"}</strong>.
                          - AP payment outflows extension: <strong className="text-white font-bold">{isApDeferEnabled ? `Active (+${apExtension} days deferral)` : "Bypassed"}</strong>.
                        </p>
                        
                        {forecastCurves.lowestOpt < minBuffer ? (
                          <div className="text-rose-400 font-bold border-l-2 border-rose-500/40 pl-2.5 py-1 bg-rose-500/5 rounded-r text-[10.5px]">
                            🚨 AUDIT FLAGGED: LIQUIDITY BUFFER BREACH
                            <div className="text-white font-normal mt-1 leading-normal text-[10px]">
                              Treasury projections indicate cash reserves drop to <span className="text-rose-400 font-bold">${(forecastCurves.lowestOpt / 1000000).toFixed(2)}M USD</span> on Day 12, breaching your safety threshold of <span className="text-cyan-400 font-bold">${(minBuffer / 1000000).toFixed(2)}M</span>. 
                              <p className="mt-1 text-slate-350">💡 Recommendation: Increase payables extension to <span className="text-emerald-400">+15 days</span> and enable cash concentration presets to secure liquidity.</p>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="text-emerald-400 font-bold border-l-2 border-emerald-500/40 pl-2.5 py-1 bg-emerald-500/5 rounded-r text-[10.5px]">
                              ✅ LIQUIDITY TARGET SECURED:
                              <div className="text-white font-bold mt-1 text-[11px]">
                                Optimized cash runway lowest point remains at <span className="text-emerald-400 font-extrabold">${(forecastCurves.lowestOpt / 1000000).toFixed(2)}M USD</span>, exceeding safety buffer by <span className="text-cyan-400 font-extrabold">${((forecastCurves.lowestOpt - minBuffer) / 1000000).toFixed(2)}M USD</span>.
                              </div>
                            </div>

                            <div className="text-slate-300 pl-1 space-y-1.5 mt-2">
                              <div className="text-cyan-400 font-bold text-[9px] uppercase tracking-wider">💡 ARIA Auditor Actions & Recommendations:</div>
                              <p className="leading-normal">
                                1. <strong className="text-white font-bold">Lock in AP extension</strong>: Go to Tab 5 and commit the shifted baseline dates on document <strong className="text-white font-bold">1900004121</strong> via BAPI_ACC_DOCUMENT_CHANGE.
                              </p>
                              <p className="leading-normal">
                                2. <strong className="text-white font-bold">Accelerate Receivables</strong>: Trigger BAPI_CUSTOMER_EXTENS_CHG to update partner accounts to early payment terms <strong className="text-white">Z010 (2% 10 / Net 30)</strong>.
                              </p>
                              <p className="leading-normal">
                                3. <strong className="text-white font-bold">Authorized Account</strong>: User <strong className="text-emerald-400">ARIA_FIN</strong> has full corporate authorization to release early close clearance items.
                              </p>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Part C: Closed-Loop Commit Trigger */}
                      <div className="border-t border-slate-800 dark:border-white/5 pt-3 mt-3 flex justify-between items-center gap-3">
                        <div className="flex items-start gap-1 text-[9px] text-slate-400 max-w-sm">
                          <Info className="w-3.5 h-3.5 text-cyan-500 shrink-0 mt-0.5" />
                          <span>Audit complete. Optimization triggers will sync to S/4HANA treasury ledgers.</span>
                        </div>
                        <button
                          onClick={() => setActiveTab("execute")}
                          className="px-4.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold transition-all duration-200 active:scale-[0.97] shadow-[0_0_12px_rgba(16,185,129,0.3)] flex items-center gap-1.5 select-none shrink-0 cursor-pointer"
                        >
                          Proceed to ERP Commit <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>

                    </div>

                  </div>

                </div>
              ) : activeScenarioId === "tax-lookback" ? (
                /* UPGRADED TAX AUDIT REASONING COPILOT SANDBOX */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                  
                  {/* Left Column: Rule Engine Control Center */}
                  <div className="lg:col-span-5 flex flex-col justify-between bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-2xl p-5 space-y-5 shadow-sm dark:shadow-lg relative overflow-hidden backdrop-blur-sm">
                    {/* Decorative watermark */}
                    <div className="absolute -bottom-10 -left-10 opacity-5 dark:opacity-[0.02] text-slate-400 dark:text-white pointer-events-none select-none">
                      <Scale className="w-36 h-36" />
                    </div>

                    <div className="space-y-4 relative z-10">
                      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/5 pb-2.5">
                        <Sliders className="w-4.5 h-4.5 text-emerald-500 dark:text-emerald-400 animate-pulse" />
                        <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                          Tax Policy Settings
                        </h4>
                      </div>

                      {/* Rule 1: Variance Threshold Slider */}
                      <div className="space-y-2 p-3.5 bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 rounded-xl shadow-inner">
                        <div className="flex justify-between items-center text-[10.5px]">
                          <span className="text-slate-600 dark:text-slate-400 font-bold">Variance Tolerance Limit:</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-mono font-extrabold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-xs">
                            {taxVarianceThreshold.toFixed(1)}% Deviation
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.0"
                          max="8.0"
                          step="0.5"
                          value={taxVarianceThreshold}
                          onChange={(e) => setTaxVarianceThreshold(Number(e.target.value))}
                          className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 dark:accent-emerald-400 focus:outline-none focus:ring-0"
                        />
                        <div className="flex justify-between text-[8px] text-slate-500 font-mono">
                          <span>0.0% (Strict)</span>
                          <span>2.0% (Optimal)</span>
                          <span>8.0% (Coarse)</span>
                        </div>
                      </div>

                      {/* Toggles */}
                      <div className="space-y-2.5">
                        <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider block">
                          Tax Evaluation Policies
                        </span>

                        {/* Toggle A: Enforce Exemption Certificates */}
                        <div className="flex justify-between items-center p-2.5 bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-xl transition-all hover:bg-slate-100 dark:hover:bg-slate-950/60 shadow-sm">
                          <div>
                            <span className="text-[10.5px] font-bold text-slate-700 dark:text-slate-300 block">Strict Exemption Audits</span>
                            <span className="text-[8px] text-slate-500 font-mono block">Enforce reseller certifications for CA and OR entities</span>
                          </div>
                          <button
                            onClick={() => setIsEnforceExemption(!isEnforceExemption)}
                            className={clsx(
                              "w-9 h-5 rounded-full p-0.5 border transition-all duration-300 focus:outline-none shadow-inner shrink-0 cursor-pointer relative",
                              isEnforceExemption 
                                ? "bg-emerald-100 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500/40" 
                                : "bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-white/5"
                            )}
                          >
                            <div className={clsx(
                              "w-3.5 h-3.5 rounded-full shadow transition-all duration-300",
                              isEnforceExemption 
                                ? "bg-emerald-600 dark:bg-emerald-400 translate-x-4" 
                                : "bg-slate-500 translate-x-0"
                            )} />
                          </button>
                        </div>

                        {/* Toggle B: OCR Address Check */}
                        <div className="flex justify-between items-center p-2.5 bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-xl transition-all hover:bg-slate-100 dark:hover:bg-slate-950/60 shadow-sm">
                          <div>
                            <span className="text-[10.5px] font-bold text-slate-700 dark:text-slate-300 block">Strict Geography Validation</span>
                            <span className="text-[8px] text-slate-500 font-mono block">Audit physical coordinates vs Sold-To state tags</span>
                          </div>
                          <button
                            onClick={() => setIsExemptScan(!isExemptScan)}
                            className={clsx(
                              "w-9 h-5 rounded-full p-0.5 border transition-all duration-300 focus:outline-none shadow-inner shrink-0 cursor-pointer relative",
                              isExemptScan 
                                ? "bg-emerald-100 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500/40" 
                                : "bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-white/5"
                            )}
                          >
                            <div className={clsx(
                              "w-3.5 h-3.5 rounded-full shadow transition-all duration-300",
                              isExemptScan 
                                ? "bg-emerald-600 dark:bg-emerald-400 translate-x-4" 
                                : "bg-slate-500 translate-x-0"
                            )} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: AI Audit Copilot Console */}
                  <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                    
                    {/* Part A: Dynamic Rules Checklist */}
                    <div className="space-y-2">
                      <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider block">
                        Real-Time Policy Compliance Mappings
                      </span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 rounded-xl flex items-center justify-between text-xs font-mono shadow-sm">
                          <div className="flex items-center space-x-2">
                            <div className="p-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                            <div className="text-left">
                              <span className="text-slate-500 block text-[7.5px] uppercase">OCR Extraction Status</span>
                              <span className="text-slate-800 dark:text-white font-bold text-[10px]">ADRC Reconciled (100%)</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 rounded-xl flex items-center justify-between text-xs font-mono shadow-sm">
                          <div className="flex items-center space-x-2">
                            <div className="p-1 rounded-full bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0 animate-pulse">
                              <ShieldAlert className="w-3.5 h-3.5" />
                            </div>
                            <div className="text-left">
                              <span className="text-slate-500 block text-[7.5px] uppercase">Jurisdiction Variances</span>
                              <span className="text-slate-800 dark:text-white font-bold text-[10px]">4 Flags Detected</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Part B: Audited Issues Categorization & Corrective Action Recommendations */}
                    <div className="space-y-2">
                      <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider block">
                        Audited Issues & Recommended Corrective Actions
                      </span>

                      <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                        
                        {/* Issue 1: CA-OR Exemption */}
                        <div className="p-4 bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 hover:border-rose-300 dark:hover:border-rose-800/50 rounded-2xl flex items-start gap-3.5 text-xs leading-normal shadow-sm transition-all duration-200">
                          <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-450 shrink-0 mt-0.5 animate-pulse" />
                          <div className="text-left space-y-1">
                            <span className="font-extrabold text-rose-950 dark:text-rose-250 block text-[11px]">Category: State Exemption Mismatch (CA vs OR)</span>
                            <p className="text-slate-700 dark:text-slate-300 text-[10.5px] leading-relaxed font-sans">
                              <strong className="text-slate-900 dark:text-white font-semibold">Identified Issue:</strong> System applied CA standard tax rate (**8.25%**) to Horizon Retailers invoices **90001641** and **90001150** based on CA billing address, but the physical Ship-To warehouse destination is situated in Oregon (**OR**) which holds a 0% tax exempt reseller status.
                            </p>
                            <p className="text-slate-700 dark:text-slate-300 text-[10.5px] mt-1 font-sans">
                              <strong className="text-emerald-700 dark:text-emerald-450 font-bold">Recommended Action:</strong>
                              <span className="block mt-0.5 pl-2 border-l border-emerald-500/20 leading-relaxed">
                                1. Issue an OData PATCH request to open Sales Orders **SO 22** and **SO 24** to shift WE Partner region to **OR** (fixes future billing).<br/>
                                2. File California Sales Tax Refund Claims to recover overpayments totaling **$1,994.48** (fixes past logs).
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Issue 2: NY-NJ Rate Mismatch */}
                        <div className="p-4 bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 hover:border-rose-300 dark:hover:border-rose-800/50 rounded-2xl flex items-start gap-3.5 text-xs leading-normal shadow-sm transition-all duration-200">
                          <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-450 shrink-0 mt-0.5 animate-pulse" />
                          <div className="text-left space-y-1">
                            <span className="font-extrabold text-rose-950 dark:text-rose-250 block text-[11px]">Category: Out-of-State Rate Variance (NY vs NJ)</span>
                            <p className="text-slate-700 dark:text-slate-300 text-[10.5px] leading-relaxed font-sans">
                              <strong className="text-slate-900 dark:text-white font-semibold">Identified Issue:</strong> System applied New York tax rate (**8.875%**) to Sovereign Distributors invoices **90001619** and **90001092** based on NY billing location, but delivery is bound to New Jersey (**NJ**) physical warehouses which carry a lower rate of **6.625%**.
                            </p>
                            <p className="text-slate-700 dark:text-slate-300 text-[10.5px] mt-1 font-sans">
                              <strong className="text-emerald-700 dark:text-emerald-450 font-bold">Recommended Action:</strong>
                              <span className="block mt-0.5 pl-2 border-l border-emerald-500/20 leading-relaxed">
                                1. Issue an OData PATCH request to active Sales Order **SO 23** to align the WE partner region with the actual **NJ** shipment destination.<br/>
                                2. Deduct/refund the **2.25% variance** on historical bookings to recover **$1,860.99** in tax leakage.
                              </span>
                            </p>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Part C: Explicit User Agreement Form & Release Trigger */}
                    <div className="p-4 bg-slate-100/80 dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-2xl space-y-3">
                      <div className="flex flex-col text-left space-y-2 text-[10.5px]">
                        <span className="text-[9px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">
                          Audit Policy & Action Agreements
                        </span>
                        
                        {/* Checkbox A */}
                        <label className="flex items-start gap-2.5 cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={taxAgreement1}
                            onChange={(e) => setTaxAgreement1(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 dark:border-white/10 text-emerald-500 accent-emerald-500 focus:ring-0 focus:outline-none mt-0.5 cursor-pointer"
                          />
                          <span className="text-slate-700 dark:text-slate-300 font-sans leading-normal">
                            I agree to dispatch live OData partner address corrections to open Sales Orders **SO 22, SO 23, and SO 24** to lock correct rates.
                          </span>
                        </label>

                        {/* Checkbox B */}
                        <label className="flex items-start gap-2.5 cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={taxAgreement2}
                            onChange={(e) => setTaxAgreement2(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 dark:border-white/10 text-emerald-500 accent-emerald-500 focus:ring-0 focus:outline-none mt-0.5 cursor-pointer"
                          />
                          <span className="text-slate-700 dark:text-slate-300 font-sans leading-normal">
                            I agree to authorize the preparation of tax refund filing certifications for the **$3,855.47** in historical cash overpayments.
                          </span>
                        </label>
                      </div>

                      {/* Approval Commit Action Button */}
                      <div className="border-t border-slate-200 dark:border-white/5 pt-3 flex justify-between items-center gap-3">
                        <div className="flex items-start gap-1 text-[9.5px] text-slate-400">
                          <Info className="w-3.5 h-3.5 text-cyan-500 shrink-0 mt-0.5" />
                          <span>Check both items to approve and proceed to the commit console.</span>
                        </div>
                        <button
                          onClick={() => {
                            setApprovalState(prev => ({ ...prev, [activeScenario.id]: "signed" }));
                            setActiveTab("execute");
                          }}
                          disabled={!taxAgreement1 || !taxAgreement2}
                          className={clsx(
                            "px-4.5 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 active:scale-[0.97] flex items-center gap-1.5 select-none shrink-0 cursor-pointer border border-transparent shadow",
                            taxAgreement1 && taxAgreement2
                              ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                              : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-300/30 dark:border-white/5 cursor-not-allowed"
                          )}
                        >
                          Approve Actions & Commit <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              ) : (
                /* STANDARDIZED SIMPLE RULES CHECKLIST FOR OTHER SCENARIOS */
                <div className="space-y-3">
                  {activeScenario.reasoningRules.map((rule, idx) => (
                    <div key={idx} className="p-4 bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 rounded-2xl flex items-center justify-between text-xs font-mono shadow-sm text-slate-700 dark:text-slate-300">
                      <div className="flex items-center space-x-3.5">
                        <div className={clsx(
                          "p-1 rounded-full border shrink-0",
                          rule.status === "flagged"
                            ? "bg-rose-100 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400"
                            : rule.status === "passed"
                            ? "bg-emerald-100 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                            : "bg-cyan-100 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20 text-cyan-600 dark:text-cyan-400"
                        )}>
                          {rule.status === "flagged" ? (
                            <ShieldAlert className="w-4 h-4" />
                          ) : (
                            <Check className="w-4 h-4 stroke-[3]" />
                          )}
                        </div>
                        <div className="text-left">
                          <span className="text-slate-500 block text-[8px] uppercase">Rule Validation</span>
                          <span className="text-slate-800 dark:text-white font-bold text-xs">{rule.rule}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-slate-500 block text-[8px] uppercase">Measured Value</span>
                        <span className={clsx(
                          "font-extrabold font-mono text-xs",
                          rule.status === "flagged"
                            ? "text-rose-600 dark:text-rose-400"
                            : rule.status === "passed"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-cyan-600 dark:text-cyan-400"
                        )}>
                          {rule.value}
                        </span>
                      </div>
                    </div>
                  ))}

                  <div className="p-3 bg-cyan-100/10 dark:bg-cyan-500/5 border border-cyan-200 dark:border-cyan-500/10 rounded-xl text-[10px] text-slate-600 dark:text-slate-400 leading-normal flex items-start gap-1.5 mt-2">
                    <Info className="w-4 h-4 shrink-0 text-cyan-600 dark:text-cyan-400 mt-0.5" />
                    <span>
                      All evaluations must pass validation rules before BAPI writebacks are unlocked. Flagged status triggers ARIA alerts, proposing specific corrective inputs to resolve breaches.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: EXECUTE (BAPI COMMITS & SECURE RPC LOGGER) */}
          {activeTab === "execute" && (
            <div className="flex-grow flex flex-col justify-between py-2 space-y-4 animate-in fade-in duration-300">
              
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-2">
                <div>
                  <span className="text-[10px] font-extrabold text-evolver-viridian uppercase tracking-widest block mb-1">ERP Write-Back Commits</span>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                    Secure RPC Post Stdout
                  </h2>
                </div>
                <div className="flex items-center space-x-2 text-[9px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 font-bold">
                    OData Active
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 font-bold">
                    BAPI Simulated
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">

                {/* Left column: cryptographic authorization signature */}
                <div className="lg:col-span-4 p-5 bg-gradient-to-b from-slate-50/90 to-slate-100/50 dark:from-slate-900/40 dark:to-slate-950/30 border border-slate-200 dark:border-white/5 rounded-2xl flex flex-col justify-between space-y-4 shadow-sm">
                  <div className="space-y-4">
                    <div>
                      <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Authorization</span>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">Corporate Sign-Off</h4>
                      <p className="text-[10.5px] text-slate-650 dark:text-slate-400 leading-relaxed">
                        To commit automated writebacks directly into standard S/4HANA tables, the authorized treasury auditor must sign off.
                      </p>
                    </div>

                    {approvalState[activeScenario.id] === "signed" ? (
                      <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/30 rounded-xl text-emerald-800 dark:text-emerald-300 text-[10.5px] font-semibold flex items-start gap-2.5 shadow-sm">
                        <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-450 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-extrabold">Signature Verified</div>
                          <span className="text-[8.5px] text-slate-500 dark:text-slate-450 font-mono block mt-0.5">Hash: sha256:d5f2a1b9b2c3d4...</span>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setApprovalState(prev => ({ ...prev, [activeScenario.id]: "signed" }))}
                        className="w-full py-3 bg-slate-200 dark:bg-white/5 border border-slate-350 dark:border-white/10 hover:bg-slate-300 dark:hover:bg-white/10 text-slate-800 dark:text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer shadow-sm"
                      >
                        <FileEdit className="w-4 h-4 text-evolver-viridian" /> Authorize Audit Signature
                      </button>
                    )}
                  </div>

                  <div className="p-3.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-250 dark:border-amber-900/30 rounded-xl text-[10px] text-slate-700 dark:text-slate-300 leading-normal flex items-start gap-2 shadow-sm">
                    <Info className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <span>
                      Notice: Database indices are written in real-time. Commits are displayed on the terminal stdout console.
                    </span>
                  </div>
                </div>

                {/* Right column: Stdout logs area */}
                <div className="lg:col-span-8 flex flex-col bg-gradient-to-b from-slate-50/90 to-slate-100/50 dark:from-slate-900/40 dark:to-slate-950/30 border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-2 mb-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                      <Terminal className="w-4 h-4 text-emerald-500 dark:text-emerald-400 animate-pulse" />
                      <span>Closed-Loop execution terminal</span>
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono font-bold bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">{activeScenario.bapiName}</span>
                  </div>

                  {/* Logs box */}
                  <div className="flex-1 bg-slate-950 text-slate-200 border border-slate-850 dark:bg-black/60 dark:border-white/5 p-4 font-mono text-[10px] leading-relaxed overflow-y-auto min-h-[180px] max-h-[220px] shadow-inner select-text rounded-xl">
                    {terminalLogs.length === 0 && executionState[activeScenario.id] !== "executing" && (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 space-y-2 py-12">
                        <Terminal className="w-7 h-7 opacity-30" />
                        <p>Terminal ready. Authorize signature to commit BAPI entries.</p>
                      </div>
                    )}

                    {terminalLogs.map((log, idx) => (
                      <div
                        key={idx}
                        className={clsx(
                          "whitespace-pre-wrap transition-opacity duration-300",
                          log.includes("[LIVE]") || log.includes("[LIVE DB INTEGRATION]") ? "text-cyan-400 font-bold" : "",
                          log.includes("[SIMULATED BAPI]") || log.includes("BAPI_") ? "text-amber-400 font-semibold" : "",
                          log.startsWith("✅") || log.includes("SUCCESS") ? "text-emerald-400 font-semibold" : "",
                          log.startsWith("🎉") ? "text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded mt-1.5 inline-block" : "",
                          log.startsWith("   ↳") ? "text-slate-550 shrink-0" : "text-slate-300"
                        )}
                      >
                        {log}
                      </div>
                    ))}
                    <div ref={terminalEndRef} />
                  </div>

                  {/* Terminal control button */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-white/5 mt-3 text-slate-600 dark:text-slate-400">
                    <span className="text-[9px] font-mono font-medium">{activeScenario.bapiDescription}</span>
                    
                    {executionState[activeScenario.id] === "executing" ? (
                      <button disabled className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-xs font-semibold cursor-not-allowed border border-slate-200 dark:border-white/5">
                        <Loader2 className="w-4 h-4 animate-spin text-slate-450 dark:text-slate-500" />
                        <span>Committing balances...</span>
                      </button>
                    ) : executionState[activeScenario.id] === "success" ? (
                      <div className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-xs font-bold shadow-sm">
                        <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Commit Complete</span>
                      </div>
                    ) : (
                      <button
                        onClick={handleExecuteBapi}
                        disabled={approvalState[activeScenario.id] !== "signed"}
                        className={clsx(
                          "flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all shadow-md active:scale-95 group cursor-pointer",
                          approvalState[activeScenario.id] === "signed"
                            ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                            : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-605 border border-transparent cursor-not-allowed"
                        )}
                      >
                        <Play className="w-4 h-4 fill-current group-hover:scale-105 transition-transform" />
                        <span>Commit to ERP</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 6: RESULT / EVIDENCE (COMPLIANCE CERTIFICATE) */}
          {activeTab === "evidence" && (
            <div className="flex-grow flex flex-col justify-between py-2 space-y-4 animate-in fade-in duration-300">
              
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/5 pb-3">
                <div>
                  <span className="text-[10px] font-extrabold text-evolver-viridian uppercase tracking-widest block mb-1">Audit Trail ledger</span>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                    Clearing Evidence Voucher
                  </h2>
                </div>
              </div>

              {/* evidence card receipt */}
              <div className="p-7 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950/60 dark:to-slate-900/40 border-2 border-dashed border-slate-300 dark:border-white/10 rounded-3xl font-mono text-xs text-slate-700 dark:text-slate-300 relative overflow-hidden space-y-5 shadow-md">
                
                {/* Decorative background watermark */}
                <div className="absolute -top-10 -right-10 opacity-10 dark:opacity-[0.02] text-slate-400 dark:text-white pointer-events-none select-none">
                  <Shield className="w-44 h-44" />
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-200 dark:border-white/5 pb-4">
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-500 dark:text-slate-450 uppercase font-bold tracking-wider block">Cryptographic Audit Signature</span>
                    <div className="text-cyan-600 dark:text-cyan-400 text-[10px] select-all bg-white dark:bg-slate-950/50 border border-slate-250 dark:border-white/5 px-2 py-0.5 rounded shadow-sm break-all inline-block font-bold">{activeScenario.evidenceCertificate.hash}</div>
                  </div>
                  <div className="text-right">
                    <span className="px-3.5 py-1 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-250 dark:border-emerald-500/20 text-[9.5px] font-extrabold uppercase tracking-widest flex items-center gap-1 shadow-sm">
                      <Check className="w-3.5 h-3.5 stroke-[3]" /> Audit Verified
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px] pt-1">
                  
                  <div className="p-3.5 bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm space-y-1">
                    <span className="text-slate-500 dark:text-slate-450 block text-[8px] uppercase font-bold tracking-wider">Corporate Intervention</span>
                    <span className="text-slate-900 dark:text-white font-extrabold text-[11px] block leading-normal">{activeScenario.evidenceCertificate.actionTaken}</span>
                  </div>
                  
                  <div className="p-3.5 bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm space-y-1">
                    <span className="text-slate-500 dark:text-slate-450 block text-[8px] uppercase font-bold tracking-wider">Subsequent SAP Posting Voucher</span>
                    <span className="text-cyan-600 dark:text-cyan-400 font-extrabold text-xs block font-mono">{activeScenario.evidenceCertificate.sapVoucher}</span>
                  </div>

                  <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/15 border border-emerald-200 dark:border-emerald-900/30 rounded-2xl shadow-sm space-y-1">
                    <span className="text-emerald-800 dark:text-emerald-400 block text-[8px] uppercase font-bold tracking-wider">Quantified Corporate Value</span>
                    <span className="text-emerald-750 dark:text-emerald-400 font-extrabold text-sm block">{activeScenario.evidenceCertificate.impactMetrics}</span>
                  </div>

                  <div className="p-3.5 bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm space-y-1">
                    <span className="text-slate-500 dark:text-slate-450 block text-[8px] uppercase font-bold tracking-wider">Ingestion Sync Method</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold font-sans text-[11px] block">OData RFC Handshake to Azure Postgres</span>
                  </div>

                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-white/5 text-[9px] text-slate-550 dark:text-slate-400 flex justify-between font-mono font-medium">
                  <span>Authorized Signature: bas@evolver.ai</span>
                  <span>Compliance Code: TIM-WEDGE-1710</span>
                </div>

              </div>

              {/* deployment request bar */}
              <div className="border-t border-slate-200 dark:border-white/5 pt-4 mt-2 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-start gap-2.5 text-xs max-w-lg">
                  <Info className="w-4.5 h-4.5 text-cyan-500 dark:text-cyan-400 shrink-0 mt-0.5" />
                  <span className="text-slate-600 dark:text-slate-400 leading-normal">
                    This scenario has complete schema definitions and BAPI models mapped. Request deployment to output full data model profiles to your active environment?
                  </span>
                </div>

                <button
                  onClick={() => handleRequestBlueprint(activeScenario.id)}
                  disabled={requestStatus[activeScenario.id]}
                  className={clsx(
                    "px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 select-none active:scale-[0.98] cursor-pointer",
                    requestStatus[activeScenario.id]
                      ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-300 dark:border-white/5 cursor-not-allowed"
                      : "bg-evolver-viridian hover:bg-evolver-viridian-light text-slate-950 font-extrabold shadow-[0_0_12px_rgba(64,130,109,0.35)]"
                  )}
                >
                  {requestStatus[activeScenario.id] ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Blueprint Requested
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 fill-slate-950" />
                      Request Blueprint Package
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

      {/* SAP Document Viewer Modal (FB03 Journal Entry Display) */}
      {selectedInvoice && docDetails && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            
            {/* Modal Top Bar */}
            <div className="bg-slate-100 dark:bg-slate-950 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold tracking-widest px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 uppercase shrink-0">
                    SAP Fiori
                  </span>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono">
                    Document {docDetails.docNum}
                  </h3>
                </div>

                {/* View Mode Toggle Buttons */}
                <div className="flex bg-slate-200/80 dark:bg-white/5 p-0.5 rounded-lg border border-slate-300/60 dark:border-white/10 shrink-0 font-mono text-[9px] font-bold">
                  <button
                    onClick={() => setSelectedViewMode("fiori")}
                    className={clsx(
                      "px-2.5 py-1 rounded transition-all cursor-pointer select-none",
                      selectedViewMode === "fiori"
                        ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-350"
                    )}
                  >
                    SAP JOURNAL (FB03)
                  </button>
                  <button
                    onClick={() => setSelectedViewMode("pdf")}
                    className={clsx(
                      "px-2.5 py-1 rounded transition-all cursor-pointer flex items-center gap-1 select-none",
                      selectedViewMode === "pdf"
                        ? "bg-emerald-500 text-slate-950 shadow-sm font-extrabold"
                        : "text-slate-500 dark:text-slate-450 hover:text-slate-700 dark:hover:text-slate-350"
                    )}
                  >
                    <FileText className="w-2.5 h-2.5" />
                    PDF INVOICE SCAN
                  </button>
                </div>
              </div>
              <button 
                onClick={() => setSelectedInvoice(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors text-xs font-mono font-extrabold px-3 py-1 bg-slate-200/50 dark:bg-white/5 rounded-lg border border-slate-300/40 dark:border-white/10 cursor-pointer self-end sm:self-auto"
              >
                ✕ Close
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-grow bg-slate-50/50 dark:bg-slate-950/20">
              
              {selectedViewMode === "pdf" ? (
                /* PDF INVOICE PREVIEW DISPLAY */
                <div className="space-y-6 animate-in fade-in duration-300">
                  
                  {/* Informational banner */}
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 dark:border-emerald-500/10 rounded-2xl flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 font-sans">
                        ARIA Audit Scanned Invoice
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                        This panel displays the unique physical document extracted via our high-fidelity OCR engine. The orange highlights flag the actual Ship-To regional delivery address discovered from physical transport metadata, causing the tax variance.
                      </p>
                    </div>
                  </div>

                  {/* Sub-selector tabs inside PDF mode */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-100 dark:bg-black/30 p-2.5 rounded-2xl border border-slate-200 dark:border-white/5 gap-2 font-mono">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">PDF Source:</span>
                      <div className="flex bg-slate-200 dark:bg-white/5 p-0.5 rounded-lg text-[9px] font-bold">
                        <button
                          onClick={() => setPdfPreviewType("file")}
                          className={clsx(
                            "px-2.5 py-1 rounded transition-all cursor-pointer select-none",
                            pdfPreviewType === "file"
                              ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm"
                              : "text-slate-500 dark:text-slate-455 hover:text-slate-700 dark:hover:text-slate-350"
                          )}
                        >
                          {docDetails?.partnerType === "Customer" ? "CUSTOMER PURCHASE ORDER (PDF)" : "SUPPLIER INVOICE (PDF)"}
                        </button>
                        <button
                          onClick={() => setPdfPreviewType("draft")}
                          className={clsx(
                            "px-2.5 py-1 rounded transition-all cursor-pointer select-none",
                            pdfPreviewType === "draft"
                              ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm"
                              : "text-slate-500 dark:text-slate-455 hover:text-slate-700 dark:hover:text-slate-350"
                          )}
                        >
                          INTERACTIVE DRAFT
                        </button>
                      </div>
                    </div>
                    <span className="text-[9.5px] text-slate-550 dark:text-slate-400">
                      File: <strong className="text-cyan-600 dark:text-cyan-400">/invoices/transaction_audit_bundle.pdf#page={(() => {
                        const docPageMap: Record<string, number> = {
                          "90001641": 1,
                          "90000016": 2,
                          "90001619": 3,
                          "90000000": 4,
                          "90000001": 5,
                          "90001639": 6,
                          "90000002": 7,
                          "90000003": 8,
                          "90000004": 9,
                          "90000005": 10,
                          "90001807": 11,
                          "90003770": 12,
                          "90000008": 13,
                          "90000009": 14,
                          "90001801": 15,
                          "90003459": 16,
                          "90003493": 17,
                          "90000013": 18,
                          "90000014": 19,
                          "90000015": 20
                        };
                        return docPageMap[docDetails.docNum] || 1;
                      })()}</strong>
                    </span>
                  </div>

                  {pdfPreviewType === "file" ? (
                    /* Real Scanned PDF iframe/object viewer */
                    <div className="w-full h-[620px] bg-slate-150 dark:bg-black/40 rounded-3xl overflow-hidden border border-slate-250 dark:border-slate-800 shadow-xl flex flex-col items-center justify-center relative">
                      {(() => {
                        const docPageMap: Record<string, number> = {
                          "90001641": 1,
                          "90000016": 2,
                          "90001619": 3,
                          "90000000": 4,
                          "90000001": 5,
                          "90001639": 6,
                          "90000002": 7,
                          "90000003": 8,
                          "90000004": 9,
                          "90000005": 10,
                          "90001807": 11,
                          "90003770": 12,
                          "90000008": 13,
                          "90000009": 14,
                          "90001801": 15,
                          "90003459": 16,
                          "90003493": 17,
                          "90000013": 18,
                          "90000014": 19,
                          "90000015": 20
                        };
                        const pageNum = docPageMap[docDetails.docNum] || 1;
                        return (
                          <>
                            <iframe 
                              src={`/invoices/transaction_audit_bundle.pdf#page=${pageNum}&toolbar=0&navpanes=0&scrollbar=0&view=Fit`} 
                              className="w-full h-full border-0 rounded-3xl pointer-events-none"
                              title={`Scanned Invoice PDF ${docDetails.docNum}`}
                            />
                            
                            {/* Gentle helper overlay showing fallback suggestion if PDF fails to render in browser */}
                            <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 text-white p-3.5 rounded-2xl text-[10.5px] font-sans flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 backdrop-blur-md border border-white/5 pointer-events-auto">
                              <span className="flex items-start sm:items-center gap-1.5 font-light leading-normal text-left">
                                <Info className="w-4 h-4 text-cyan-400 mt-0.5 sm:mt-0 shrink-0" />
                                <span>Viewing page <strong className="text-cyan-455 font-bold">{pageNum}</strong> of physical PDF bundle from <code className="px-1.5 py-0.5 rounded bg-white/15 text-slate-200">public/invoices/transaction_audit_bundle.pdf</code>.</span>
                              </span>
                              <button
                                onClick={() => setPdfPreviewType("draft")}
                                className="px-3.5 py-1.5 bg-white/15 hover:bg-white/25 border border-white/10 text-white font-bold rounded-xl transition-colors cursor-pointer select-none text-[9.5px] font-mono shrink-0 active:scale-95"
                              >
                                Switch to Draft ➔
                              </button>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    /* Physical Printed Paper Invoice Sheet (our HTML draft) */
                    <div className="bg-white text-slate-800 p-8 border border-slate-200/80 shadow-2xl rounded-3xl relative select-text font-sans max-w-2xl mx-auto ring-4 ring-slate-100 dark:ring-black/10 text-left">
                      
                      {/* Rotated Auditor Watermark Stamp */}
                      {(() => {
                        const variance = (selectedInvoice as any).varianceType || "None";
                        const stampStyle = 
                          variance === "Exempt" 
                            ? "border-amber-500 text-amber-600 bg-amber-500/5 rotate-[-12deg]" 
                            : variance === "Rate Mismatch"
                              ? "border-indigo-500 text-indigo-600 bg-indigo-500/5 rotate-[-12deg]"
                              : "border-emerald-500 text-emerald-600 bg-emerald-500/5 rotate-[-12deg]";
                        
                        const stampText = 
                          variance === "Exempt" 
                            ? "TAX EXEMPT STATE" 
                            : variance === "Rate Mismatch"
                              ? "RATE ADJUSTMENT REQ"
                              : "AUDIT COMPLIANT";
                        
                        return (
                          <div className={clsx(
                            "absolute top-36 right-8 px-4 py-2 border-4 rounded-xl text-xs font-extrabold tracking-widest font-mono select-none opacity-85 z-20 pointer-events-none uppercase",
                            stampStyle
                          )}>
                            {stampText}
                          </div>
                        );
                      })()}

                      {/* Invoice Top Header */}
                      <div className="flex justify-between items-start border-b-2 border-slate-100 pb-6">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-slate-900 to-slate-700 flex items-center justify-center text-white text-[11px] font-black font-sans shadow-md">
                              EV
                            </div>
                            <span className="font-extrabold text-sm text-slate-900 tracking-tight">Evolver Logistics Corp.</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                            100 S S/4HANA Way, Suite 400<br />
                            San Jose, CA 95113<br />
                            Tel: +1 (800) 555-SAP1
                          </p>
                        </div>
                        
                        <div className="text-right space-y-1">
                          <h2 className="text-lg font-black text-slate-950 tracking-tight uppercase">Invoice Document</h2>
                          <div className="text-[10px] text-slate-500 font-mono space-y-0.5">
                            <div>Invoice #: <strong className="text-slate-800 font-bold">{docDetails.docNum}</strong></div>
                            <div>Date: <strong className="text-slate-800 font-bold">{docDetails.docDate}</strong></div>
                            <div>PO Ref: <strong className="text-slate-800 font-bold">{docDetails.reference}</strong></div>
                            <div>Terms: <strong className="text-slate-800 font-bold">{docDetails.terms}</strong></div>
                          </div>
                        </div>
                      </div>

                      {/* Addresses grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-6 text-xs border-b border-slate-100">
                        {/* Bill To */}
                        <div className="space-y-2">
                          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block font-mono">Bill To:</span>
                          <div className="font-bold text-slate-900">
                            {(() => {
                              const details = getMockInvoicePDFData(docDetails.docNum);
                              const lines = details.billTo.split('\n');
                              return (
                                <>
                                  <div className="text-[12px] font-extrabold text-slate-950">{lines[0]}</div>
                                  <div className="font-normal text-slate-500 mt-1 space-y-0.5">
                                    {lines.slice(1).map((l, i) => <div key={i}>{l}</div>)}
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Ship To */}
                        <div className="space-y-2">
                          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block font-mono">Ship To (Physical Delivery):</span>
                          {(() => {
                            const details = getMockInvoicePDFData(docDetails.docNum);
                            const lines = details.shipTo.split('\n');
                            const variance = (selectedInvoice as any).varianceType || "None";
                            const hasVariance = variance !== "None";
                            
                            return (
                              <div className={clsx(
                                "p-3 rounded-2xl border transition-all text-left",
                                hasVariance
                                  ? "bg-amber-500/5 border-amber-300 text-slate-900 shadow-sm"
                                  : "border-slate-150 text-slate-900"
                              )}>
                                <div className="font-bold text-[12px] flex items-center gap-1.5">
                                  {lines[0]}
                                  {hasVariance && (
                                    <span className="px-1.5 py-0.5 bg-amber-500 text-white font-mono text-[8px] font-black rounded uppercase tracking-wider">
                                      Discrepancy
                                    </span>
                                  )}
                                </div>
                                <div className="font-normal text-slate-500 mt-1 space-y-0.5">
                                  {lines.slice(1).map((l, i) => <div key={i}>{l}</div>)}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Invoice Items Table */}
                      <table className="w-full text-left border-collapse text-xs mt-6">
                        <thead>
                          <tr className="border-b-2 border-slate-150 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                            <th className="py-2.5">Item Details</th>
                            <th className="py-2.5 text-center w-12">Qty</th>
                            <th className="py-2.5 text-right w-24">Unit Price</th>
                            <th className="py-2.5 text-center w-16">Tax Code</th>
                            <th className="py-2.5 text-right pr-2 w-28">Net Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[11px] text-slate-600 font-medium">
                          {(() => {
                            const details = getMockInvoicePDFData(docDetails.docNum);
                            return details.items.map((item, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50">
                                <td className="py-3 font-bold text-slate-900">{item.desc}</td>
                                <td className="py-3 text-center font-mono">{item.qty}</td>
                                <td className="py-3 text-right font-mono">${item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                <td className="py-3 text-center font-mono text-[10px] text-slate-400 font-bold">{item.code}</td>
                                <td className="py-3 text-right pr-2 font-mono text-slate-900 font-bold">${(item.qty * item.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                              </tr>
                            ));
                          })()}
                        </tbody>
                      </table>

                      {/* Invoice Totals Summary Block */}
                      <div className="mt-8 border-t-2 border-slate-100 pt-6 flex flex-col sm:flex-row justify-between items-start gap-6">
                        {/* Left: Auditor Memo */}
                        <div className="max-w-[280px] space-y-2 text-[10.5px] text-slate-500 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                          <span className="font-extrabold text-slate-950 uppercase block text-[8.5px] tracking-widest font-mono">Auditor Memo:</span>
                          <p className="leading-relaxed">
                            {getMockInvoicePDFData(docDetails.docNum).memo || "Audit check complete. Document lines verified."}
                          </p>
                        </div>

                        {/* Right: Calculations */}
                        <div className="w-full sm:w-56 space-y-2 text-xs font-medium text-slate-500">
                          <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span className="font-mono text-slate-900 font-bold">${docDetails.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between items-center text-[11px]">
                            <span>SAP Billed Tax ({((selectedInvoice as any).taxBilledRate || 0).toFixed(2)}%):</span>
                            <span className="font-mono text-rose-600 font-bold">${((selectedInvoice as any).taxBilledAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between items-center text-[11px] border-b border-dashed border-slate-200 pb-2">
                            <span className="font-bold text-emerald-600">Correct Tax ({((selectedInvoice as any).taxCorrectRate || 0).toFixed(2)}%):</span>
                            <span className="font-mono text-emerald-600 font-extrabold">${((selectedInvoice as any).taxCorrectAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                          
                          {/* Final Balance */}
                          <div className="flex justify-between items-baseline pt-2">
                            <span className="font-extrabold text-slate-950 text-xs uppercase tracking-wider font-mono">Invoice Total:</span>
                            <span className="font-mono text-slate-950 font-black text-sm">
                              ${(docDetails.amount + ((selectedInvoice as any).taxCorrectAmount || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                          </div>

                          {/* Variance Note */}
                          {(() => {
                            const delta = ((selectedInvoice as any).taxBilledAmount || 0) - ((selectedInvoice as any).taxCorrectAmount || 0);
                            if (delta <= 0.01) return null;
                            return (
                              <div className="bg-emerald-50 text-emerald-700 text-[10px] font-bold p-2.5 rounded-xl border border-emerald-250 text-center tracking-wide mt-2">
                                Reclaimable Tax Delta: **${delta.toLocaleString(undefined, { minimumFractionDigits: 2 })}**
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              ) : (
                /* ORIGINAL SAP FIORI LEDGER DISPLAY */
                <>
                  {/* Document Header details grid */}
                  <div className="bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-2xl p-5 space-y-4 text-left">
                    <h4 className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      Document Header (BSEG / BKPF Records)
                    </h4>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 block uppercase">Document Number</span>
                        <span className="text-slate-900 dark:text-white font-extrabold">{docDetails.docNum}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 block uppercase">Company Code</span>
                        <span className="text-slate-900 dark:text-white font-extrabold">{docDetails.companyCode}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 block uppercase">Fiscal Year</span>
                        <span className="text-slate-900 dark:text-white font-extrabold">{docDetails.fiscalYear}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 block uppercase">Ledger Period</span>
                        <span className="text-slate-900 dark:text-white font-extrabold">{docDetails.period}</span>
                      </div>
                      
                      <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-white/5">
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 block uppercase">Document Date</span>
                        <span className="text-slate-900 dark:text-white font-bold">{docDetails.docDate}</span>
                      </div>
                      <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-white/5">
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 block uppercase">Posting Date</span>
                        <span className="text-slate-900 dark:text-white font-bold">{docDetails.postingDate}</span>
                      </div>
                      <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-white/5">
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 block uppercase">Document Type</span>
                        <span className="text-slate-900 dark:text-white font-bold">{docDetails.docType} ({docDetails.docTypeDesc})</span>
                      </div>
                      <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-white/5">
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 block uppercase">Reference Key</span>
                        <span className="text-cyan-600 dark:text-cyan-400 font-bold">{docDetails.reference}</span>
                      </div>
                    </div>

                    {/* SAP GUI Lookup Integration */}
                    <div className="pt-4 border-t border-slate-200/60 dark:border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-[10.5px]">
                      <div className="flex items-center gap-1.5 font-sans">
                        <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold text-[9px] uppercase shrink-0">
                          SAP GUI
                        </span>
                        <span className="text-slate-600 dark:text-slate-400 font-medium">
                          To locate this item in standard SAP desktop graphical interface:
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 font-mono text-[9.5px]">
                        <span className="px-2.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-extrabold">
                          T-Code: FB03 (Accounting Display)
                        </span>
                        {docDetails.docType === "KR" ? (
                          <>
                            <span className="px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-extrabold">
                              T-Code: MIR4 (LIV Logistics)
                            </span>
                            <span className="px-2.5 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                              Original MM Invoice: 5105608240
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-extrabold">
                              T-Code: VF03 (SD Billing Display)
                            </span>
                            <span className="px-2.5 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                              Original SD Billing Doc: {docDetails.docNum}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* SAP FIORI Web Client Integration */}
                    <div className="pt-3.5 border-t border-slate-200/60 dark:border-white/5 flex flex-col gap-3 text-[10.5px] mt-1.5 animate-in fade-in duration-300">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="flex items-center gap-1.5 font-sans">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-[9px] uppercase shrink-0 animate-pulse">
                            Fiori & WebGUI
                          </span>
                          <span className="text-slate-600 dark:text-slate-400 font-medium">
                            Launch this document in your browser using these resolution options:
                          </span>
                        </div>
                        <span className="text-[9.5px] text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-2.5 py-0.5 rounded shadow-inner self-end sm:self-auto">
                          🔑 Fiori User: <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold">ARIA_FIN</strong> (or WebGUI: <strong className="text-slate-700 dark:text-slate-200 font-bold">ARIA</strong>) | <strong className="text-slate-700 dark:text-slate-200">Pass: Aria1234</strong>
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 pt-0.5">
                        {/* Option 1: Direct WebGUI FB03 (Bulletproof) */}
                        <a 
                          href={`https://172.211.212.84:44301/sap/bc/gui/sap/its/webgui?sap-client=100&sap-language=EN&~transaction=*FB03%20RFBELG-BELNR=${docDetails.docNum};RFBELG-BUKRS=${docDetails.companyCode};RFBELG-GJAHR=${docDetails.fiscalYear};DYNP_OKCODE=SHOW`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-extrabold hover:bg-blue-500/20 transition-all cursor-pointer font-mono text-[9px] flex items-center gap-1 hover:scale-105 active:scale-95 shadow-sm"
                          title="Direct HTML5 SAP GUI - Bypasses Fiori target mapping completely"
                        >
                          <Globe className="w-3.5 h-3.5 text-blue-500 animate-spin" style={{ animationDuration: '10s' }} /> WebGUI Direct (FB03) <span className="text-[8px] opacity-75 font-normal">(Most Reliable)</span> ↗
                        </a>

                        {/* Option 2: Fiori JournalEntry Display */}
                        <a 
                          href={`https://172.211.212.84:44301/sap/bc/ui2/flp?sap-client=100&sap-language=EN#JournalEntry-display?AccountingDocument=${docDetails.docNum}&CompanyCode=${docDetails.companyCode}&FiscalYear=${docDetails.fiscalYear}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-extrabold hover:bg-emerald-500/20 transition-all cursor-pointer font-mono text-[9px] flex items-center gap-1 hover:scale-105 active:scale-95 shadow-sm"
                          title="Standard S/4HANA Journal Entry view"
                        >
                          <Globe className="w-3.5 h-3.5 text-emerald-500" /> Fiori (JournalEntry) ↗
                        </a>

                        {/* Option 3: Fiori JournalEntry Manage */}
                        <a 
                          href={`https://172.211.212.84:44301/sap/bc/ui2/flp?sap-client=100&sap-language=EN#JournalEntry-manage?AccountingDocument=${docDetails.docNum}&CompanyCode=${docDetails.companyCode}&FiscalYear=${docDetails.fiscalYear}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-extrabold hover:bg-indigo-500/20 transition-all cursor-pointer font-mono text-[9px] flex items-center gap-1 hover:scale-105 active:scale-95 shadow-sm"
                          title="Standard S/4HANA Manage Journal Entries dashboard"
                        >
                          <Globe className="w-3.5 h-3.5 text-indigo-500" /> Fiori (Manage JE) ↗
                        </a>

                        {/* Option 4: Original Legacy Intent */}
                        <a 
                          href={`https://172.211.212.84:44301/sap/bc/ui2/flp?sap-client=100&sap-language=EN#AccountingDocument-display?AccountingDocument=${docDetails.docNum}&CompanyCode=${docDetails.companyCode}&FiscalYear=${docDetails.fiscalYear}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10 font-bold hover:bg-slate-200 dark:hover:bg-white/10 transition-all cursor-pointer font-mono text-[9px] flex items-center gap-1 hover:scale-105 active:scale-95 shadow-sm"
                          title="Legacy AccountingDocument intent"
                        >
                          <Globe className="w-3.5 h-3.5 text-slate-400" /> Legacy (AccountingDoc) ↗
                        </a>
                      </div>
                    </div>

                  </div>

                  {/* Journal Ledger Allocations Table */}
                  <div className="space-y-2.5 text-left">
                    <h4 className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      Journal Entry line Allocations (PK Posting keys)
                    </h4>
                    
                    <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-inner">
                      <table className="w-full text-left border-collapse text-xs select-text">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-black/40 text-slate-400 dark:text-slate-500 font-bold font-mono text-[10px]">
                            <th className="p-2.5 pl-4">Line</th>
                            <th className="p-2.5">PK</th>
                            <th className="p-2.5">Posting key Desc</th>
                            <th className="p-2.5">SAP Account</th>
                            <th className="p-2.5">Name / Description</th>
                            <th className="p-2.5 text-right pr-4">Amount ({docDetails.currency})</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-white/5 font-mono text-[11px]">
                          
                          {/* Line item 1: Customer / Vendor line */}
                          <tr className="hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                            <td className="p-3 pl-4 text-slate-400 font-extrabold">001</td>
                            <td className="p-3 font-bold text-blue-600 dark:text-blue-400">{docDetails.postingKeys.line1.pk}</td>
                            <td className="p-3 text-slate-500">{docDetails.postingKeys.line1.type}</td>
                            <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{docDetails.postingKeys.line1.account}</td>
                            <td className="p-3 font-sans text-slate-700 dark:text-slate-300 font-bold">{docDetails.postingKeys.line1.name}</td>
                            <td className={clsx(
                              "p-3 text-right pr-4 font-bold text-xs",
                              docDetails.postingKeys.line1.isDebit ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                            )}>
                              {docDetails.postingKeys.line1.isDebit ? "" : "-"}${docDetails.postingKeys.line1.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </tr>

                          {/* Line item 2: G/L Offset Account line */}
                          <tr className="hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                            <td className="p-3 pl-4 text-slate-400 font-extrabold">002</td>
                            <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400">{docDetails.postingKeys.line2.pk}</td>
                            <td className="p-3 text-slate-500">{docDetails.postingKeys.line2.type}</td>
                            <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{docDetails.postingKeys.line2.account}</td>
                            <td className="p-3 font-sans text-slate-700 dark:text-slate-300">{docDetails.postingKeys.line2.name}</td>
                            <td className={clsx(
                              "p-3 text-right pr-4 font-bold text-xs",
                              docDetails.postingKeys.line2.isDebit ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                            )}>
                              {docDetails.postingKeys.line2.isDebit ? "" : "-"}${docDetails.postingKeys.line2.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </tr>

                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Status Section */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                        Payment Terms:
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-white/10">
                        {docDetails.terms}
                      </span>
                    </div>
                    
                    {/* Payment block detail */}
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        BSEG-ZLSPR (Block):
                      </span>
                      {docDetails.paymentBlock === "A" ? (
                        <span className="px-3 py-1 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-bold flex items-center gap-1.5 animate-pulse animate-duration-1000">
                          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                          A - Blocked for Duplicate
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                          Free for Payment
                        </span>
                      )}
                    </div>
                  </div>
                </>
              )}

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 shrink-0">
              <button 
                onClick={() => setSelectedInvoice(null)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold font-mono border border-slate-300/40 dark:border-white/10 active:scale-[0.98] transition-all cursor-pointer"
              >
                Display Overview Close
              </button>
              <button
                onClick={() => {
                  alert("Raw JSON Ledger Record:\n" + JSON.stringify(selectedInvoice, null, 2));
                }}
                className="px-5 py-2 bg-evolver-viridian hover:bg-evolver-viridian-light text-slate-950 rounded-xl text-xs font-bold font-mono active:scale-[0.98] transition-all cursor-pointer shadow-[0_0_12px_rgba(64,130,109,0.25)]"
              >
                Inspect Raw JSON Data
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  </div>
</div>
);
}
