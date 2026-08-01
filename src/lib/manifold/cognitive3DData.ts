import { sapOrgData } from "@/lib/sap-org-structure";

export interface Node3D {
  id: string;
  label: string;
  type: "System" | "CompanyCode" | "Plant" | "SalesOrg" | "PurchOrg" | "Customer" | "Vendor" | "Employee" | "Material" | "Invoice" | "Signal" | "Country" | "MasterData";
  group: string;
  color: string;
  val: number;
  country?: string;
  parentSystemId?: string; // Links internal data objects to their home system
  scopes?: ("applications" | "tprm" | "finance" | "sales")[];
  sapTable?: string;
  tcode?: string;
  details?: string;
  scenario?: string;
  riskScore?: string;
  annualSpend?: string;
  dualRoleSell?: string;
  openInvoices?: string;
  fields?: string[];
  x?: number;
  y?: number;
  z?: number;
}

export interface Link3D {
  source: string;
  target: string;
  type: string;
  label?: string;
  color?: string;
  scenario?: string;
  scopes?: ("applications" | "tprm" | "finance" | "sales")[];
  status?: "normal" | "blocked" | "rerouted" | "netted" | "hazard";
}

export interface Graph3DData {
  nodes: Node3D[];
  links: Link3D[];
}

const VENDOR_PREFIXES = ["Nordic", "Alpine", "Bavarian", "Helvetia", "Pacific", "Atlantic", "Apex", "Vanguard", "Precision", "Optima", "Quantum", "Nexus", "Titan", "Zenith", "Aerospace", "Sensors", "Alloys", "Optics", "Silicon", "Photonics"];
const VENDOR_SUFFIXES = ["AG", "GmbH", "Inc.", "Pte Ltd", "Corp", "SA", "SE", "BV", "S.p.A.", "Holdings", "Technologies", "Solutions", "Components", "Systems"];
const CUSTOMER_NAMES = [
  "European Space Agency (ESA)", "Thales Alenia Space", "Airbus Defence & Space", "Lockheed Martin Optronics", "RocketLab US", "Maxar Technologies", 
  "Northrop Grumman Guidance", "BAE Systems Systems", "OHB System AG", "Safran Electronics", "Hensoldt Sensors", "L3Harris Technologies",
  "Boeing Space Systems", "General Dynamics Electronics", "Leonardo S.p.A.", "Cobham Aerospace", "Teledyne FLIR", "Ball Aerospace"
];

const EMPLOYEE_TITLES = [
  "VP Sourcing & Procurement", "Chief Procurement Officer", "Senior AP Audit Manager", "Plant Operations Director", 
  "Quality Assurance Lead", "Global Treasury Controller", "Strategic Buyer (Optics)", "Supply Chain Resilience Director",
  "Category Manager (Aerospace)", "ERP Master Data Governance Lead", "Trade Compliance Officer", "Accounts Receivable Controller"
];

const REGIONS = ["EMEA", "AMER", "APAC"];

const REGIONS_MAP: Record<string, string> = {
  EMEA: "DE",
  AMER: "US",
  APAC: "SG"
};

export function generateEnterprise3DGraph(): Graph3DData {
  const nodes: Node3D[] = [];
  const links: Link3D[] = [];

  // 1. COUNTRY HIERARCHY NODES (Level 1 Org Breakdown)
  const countryNodes: Node3D[] = [
    { id: "Country: DE", label: "Germany (DE)", type: "Country", group: "Country", color: "#38bdf8", val: 40, country: "DE", details: "Germany Legal Domain & HQ (DE-10)" },
    { id: "Country: US", label: "USA (US)", type: "Country", group: "Country", color: "#38bdf8", val: 38, country: "US", details: "USA Operating Domain (US-20)" },
    { id: "Country: SG", label: "Singapore (SG)", type: "Country", group: "Country", color: "#38bdf8", val: 35, country: "SG", details: "Singapore Intercompany Hub (SG-30)" },
    { id: "Country: FR", label: "France (FR)", type: "Country", group: "Country", color: "#38bdf8", val: 32, country: "FR", details: "France Aerospace Manufacturing Domain" },
    { id: "Country: GB", label: "United Kingdom (GB)", type: "Country", group: "Country", color: "#38bdf8", val: 32, country: "GB", details: "UK Defense Systems Domain" },
    { id: "Country: JP", label: "Japan (JP)", type: "Country", group: "Country", color: "#38bdf8", val: 30, country: "JP", details: "Japan Wafer & Optical Lab" },
    { id: "Country: IN", label: "India (IN)", type: "Country", group: "Country", color: "#38bdf8", val: 30, country: "IN", details: "India Global Shared Services" }
  ];
  nodes.push(...countryNodes);

  // 2. TOGAF 10 ENTERPRISE ARCHITECTURE SYSTEM NODES (35 Platforms across 7 Domains)
  const systemNodes: Node3D[] = [
    // --- DOMAIN 1: IDENTITY, CYBER SECURITY & INFRASTRUCTURE (Purple #a855f7) ---
    {
      id: "System: Microsoft Azure AD",
      label: "Microsoft Entra ID / Azure AD",
      type: "System",
      group: "Identity & Cyber Hub",
      color: "#a855f7",
      val: 75,
      x: 180, y: 180, z: 120,
      country: "GLOBAL",
      scopes: ["applications"],
      details: "Central enterprise IAM directory enforcing SSO claims, SAML 2.0/OIDC tokens, and SCIM provisioning across all enterprise apps."
    },
    {
      id: "System: Okta Identity",
      label: "Okta Customer Identity Cloud",
      type: "System",
      group: "Identity & Cyber Hub",
      color: "#c084fc",
      val: 45,
      x: 260, y: 220, z: 140,
      country: "GLOBAL",
      scopes: ["applications"],
      details: "Customer & partner identity portal for B2B client logins and external partner API authorization."
    },
    {
      id: "System: CyberArk PAM",
      label: "CyberArk Privileged Access Vault",
      type: "System",
      group: "Identity & Cyber Hub",
      color: "#9333ea",
      val: 42,
      x: 220, y: 140, z: 160,
      country: "GLOBAL",
      scopes: ["applications"],
      details: "Privileged access vault managing root admin credentials and just-in-time ERP session elevation."
    },
    {
      id: "System: ServiceNow ITSM",
      label: "ServiceNow ITSM & SecOps",
      type: "System",
      group: "Identity & Cyber Hub",
      color: "#7e22ce",
      val: 68,
      x: 240, y: 160, z: -80,
      country: "GLOBAL",
      scopes: ["applications", "tprm"],
      details: "Enterprise Security Operations & IT Service Management engine managing incident tickets and CMDB asset topology."
    },
    {
      id: "System: Palo Alto Prisma",
      label: "Palo Alto Prisma Cloud Security",
      type: "System",
      group: "Identity & Cyber Hub",
      color: "#6b21a8",
      val: 32,
      x: 280, y: 200, z: 100,
      country: "GLOBAL",
      scopes: ["applications"],
      details: "Zero-Trust network mesh and cloud security posture manager auditing enterprise API boundaries."
    },

    // --- DOMAIN 2: ENTERPRISE INTEGRATION & EVENT STREAMING (Indigo #6366f1) ---
    {
      id: "System: MuleSoft Integration",
      label: "MuleSoft Anypoint iPaaS Hub",
      type: "System",
      group: "Integration & ESB Hub",
      color: "#6366f1",
      val: 85, // Dominant Central ESB Hub
      x: 0, y: 260, z: 180,
      country: "GLOBAL",
      scopes: ["applications"],
      details: "Central enterprise iPaaS API gateway orchestrating high-velocity transactions across Salesforce, SAP, Workday, and ServiceNow."
    },
    {
      id: "System: Kafka Event Streaming",
      label: "Confluent Kafka Event Mesh",
      type: "System",
      group: "Integration & ESB Hub",
      color: "#4f46e5",
      val: 78,
      x: 60, y: 280, z: 80,
      country: "GLOBAL",
      scopes: ["applications"],
      details: "Real-time asynchronous pub/sub event streaming backbone distributing Change Data Capture (CDC) events across systems."
    },
    {
      id: "System: SAP BTP",
      label: "SAP Business Technology Platform",
      type: "System",
      group: "Integration & ESB Hub",
      color: "#4338ca",
      val: 50,
      x: -120, y: 220, z: 120,
      country: "GLOBAL",
      scopes: ["applications"],
      details: "SAP Integration Suite and cloud extension foundation hosting ARIA cognitive microservices."
    },

    // --- DOMAIN 3: CORE ERP, FINANCE & ACCOUNTING (Cyan #06b6d4 & Emerald #10b981) ---
    {
      id: "System: SAP S/4HANA",
      label: "SAP S/4HANA Enterprise ERP",
      type: "System",
      group: "Finance & ERP Kernel",
      color: "#06b6d4",
      val: 85, // Central Financial Kernel
      x: -240, y: -100, z: 0,
      country: "GLOBAL",
      scopes: ["applications", "finance", "tprm", "sales"],
      details: "Central financial and logistical transaction kernel hosting ACDOCA ledgers, Vendor Master (LFA1), and Storage Bins (MARD)."
    },
    {
      id: "System: SAP BPC",
      label: "SAP BPC / SAC Financial Consolidation",
      type: "System",
      group: "Finance & ERP Kernel",
      color: "#0284c7",
      val: 45,
      x: -340, y: -160, z: -40,
      country: "GLOBAL",
      scopes: ["applications", "finance"],
      details: "Financial planning, budgeting, and period-end consolidation engine connected to SAP S/4HANA G/L."
    },
    {
      id: "System: Kyriba Treasury",
      label: "Kyriba Corporate Treasury & SWIFT",
      type: "System",
      group: "Finance & ERP Kernel",
      color: "#10b981",
      val: 45,
      x: -300, y: -30, z: 80,
      country: "GLOBAL",
      scopes: ["applications", "finance"],
      scenario: "global-treasury-sweep",
      details: "Global treasury management system clearing intercompany cash sweeps ($5.0M) and SWIFT payment rails."
    },
    {
      id: "System: HighRadius AR",
      label: "HighRadius Autonomous AR & Credit",
      type: "System",
      group: "Finance & ERP Kernel",
      color: "#34d399",
      val: 38,
      x: -200, y: 20, z: 100,
      country: "GLOBAL",
      scopes: ["applications", "sales", "finance"],
      details: "AI-driven credit risk & AR cash application engine managing customer credit limits and netting holds."
    },
    {
      id: "System: Vertex Tax Engine",
      label: "Vertex Indirect Tax Determination",
      type: "System",
      group: "Finance & ERP Kernel",
      color: "#14b8a6",
      val: 35,
      x: -360, y: -80, z: 40,
      country: "GLOBAL",
      scopes: ["applications", "finance"],
      details: "Real-time indirect tax calculation engine determining global VAT and sales tax compliance code (MWSKZ / BAPI_TAX_CALCULATE)."
    },
    {
      id: "System: BlackLine Close",
      label: "BlackLine Financial Reconciliation",
      type: "System",
      group: "Finance & ERP Kernel",
      color: "#059669",
      val: 35,
      x: -320, y: -200, z: -20,
      country: "GLOBAL",
      scopes: ["applications", "finance"],
      details: "Automated account reconciliation, journal entry matching, and balance sheet integrity management."
    },
    {
      id: "System: SAP BW/4HANA",
      label: "SAP BW/4HANA Analytics",
      type: "System",
      group: "Finance & ERP Kernel",
      color: "#0891b2",
      val: 42,
      x: -320, y: -220, z: 30,
      country: "GLOBAL",
      scopes: ["applications", "finance"],
      details: "High-performance SAP Business Warehouse extracting operational line items for executive reporting."
    },
    {
      id: "System: SAP GRC",
      label: "SAP GRC Risk & Compliance",
      type: "System",
      group: "Finance & ERP Kernel",
      color: "#0e7490",
      val: 38,
      x: -280, y: -140, z: -100,
      country: "GLOBAL",
      scopes: ["applications", "finance", "tprm"],
      details: "SAP Governance, Risk & Compliance module managing Segregation of Duties (SOD) rules."
    },

    // --- DOMAIN 4: COMMERCIAL & CRM REVENUE ECOSYSTEM (Vibrant Pink #ec4899) ---
    {
      id: "System: Salesforce CRM",
      label: "Salesforce Revenue Cloud",
      type: "System",
      group: "Commercial & CRM Hub",
      color: "#ec4899",
      val: 80, // Commercial Revenue Hub
      x: 240, y: 80, z: 0,
      country: "GLOBAL",
      scopes: ["applications", "sales"],
      details: "Commercial revenue hub tracking customer accounts (KNA1), opportunities, and Accounts Receivable contracts."
    },
    {
      id: "System: Marketo Automation",
      label: "Marketo Marketing Automation",
      type: "System",
      group: "Commercial & CRM Hub",
      color: "#f472b6",
      val: 48,
      x: 330, y: 120, z: 40,
      country: "GLOBAL",
      scopes: ["applications", "sales"],
      details: "Global lead management & campaign attribution engine feeding sales opportunities to Salesforce."
    },
    {
      id: "System: Conga CPQ",
      label: "Conga CPQ & Contract Lifecycle",
      type: "System",
      group: "Commercial & CRM Hub",
      color: "#f43f5e",
      val: 42,
      x: 300, y: 20, z: -30,
      country: "GLOBAL",
      scopes: ["applications", "sales"],
      details: "Configure-Price-Quote and digital contract generation engine integrated with Salesforce accounts."
    },
    {
      id: "System: Gainsight CS",
      label: "Gainsight Customer Success",
      type: "System",
      group: "Commercial & CRM Hub",
      color: "#db2777",
      val: 30,
      x: 360, y: 60, z: -60,
      country: "GLOBAL",
      scopes: ["applications", "sales"],
      details: "Customer health scoring and ARR renewal tracking portal for commercial defense accounts."
    },
    {
      id: "System: Zendesk Support",
      label: "Zendesk Enterprise Support",
      type: "System",
      group: "Commercial & CRM Hub",
      color: "#e11d48",
      val: 32,
      x: 320, y: 160, z: -40,
      country: "GLOBAL",
      scopes: ["applications", "sales"],
      details: "Omnichannel customer support ticketing portal synchronizing client issues with Salesforce cases."
    },

    // --- DOMAIN 5: HUMAN CAPITAL & PAYROLL MANAGEMENT (Teal #14b8a6) ---
    {
      id: "System: Workday HCM",
      label: "Workday Enterprise HCM",
      type: "System",
      group: "HCM & Payroll Hub",
      color: "#14b8a6",
      val: 78,
      x: -180, y: 180, z: -120,
      country: "GLOBAL",
      scopes: ["applications"],
      details: "Global Human Capital Management engine synchronizing employee personnel records (PA0002) and sign-off hierarchies."
    },
    {
      id: "System: SuccessFactors",
      label: "SAP SuccessFactors Talent",
      type: "System",
      group: "HCM & Payroll Hub",
      color: "#0d9488",
      val: 40,
      x: -260, y: 140, z: -160,
      country: "GLOBAL",
      scopes: ["applications"],
      details: "Talent acquisition and executive governance platform tracking key C-level sign-off authorizations."
    },
    {
      id: "System: ADP Global Payroll",
      label: "ADP Global Payroll Engine",
      type: "System",
      group: "HCM & Payroll Hub",
      color: "#0f766e",
      val: 35,
      x: -220, y: 220, z: -100,
      country: "GLOBAL",
      scopes: ["applications", "finance"],
      details: "Multi-country payroll processing engine calculating tax withholdings and wage disbursements."
    },

    // --- DOMAIN 6: PROCUREMENT, SUPPLY CHAIN & LOGISTICS (Amber #f59e0b) ---
    {
      id: "System: Siemens PLM",
      label: "Siemens Teamcenter PLM",
      type: "System",
      group: "Procurement & SCM Hub",
      color: "#f59e0b",
      val: 72,
      x: 0, y: -260, z: -180,
      country: "GLOBAL",
      scopes: ["applications"],
      details: "Product Lifecycle Management repository housing Qualified Supplier Catalogs (QPL), Work Orders, and BOM drawings."
    },
    {
      id: "System: SAP Ariba Network",
      label: "SAP Ariba Supplier Network",
      type: "System",
      group: "Procurement & SCM Hub",
      color: "#fbbf24",
      val: 50,
      x: -140, y: -300, z: -120,
      country: "GLOBAL",
      scopes: ["applications", "tprm"],
      details: "Cloud procurement network processing electronic purchase orders, supplier onboarding, and e-invoicing."
    },
    {
      id: "System: Coupa Spend",
      label: "Coupa Spend Management",
      type: "System",
      group: "Procurement & SCM Hub",
      color: "#d97706",
      val: 42,
      x: 140, y: -280, z: -140,
      country: "GLOBAL",
      scopes: ["applications", "tprm"],
      details: "Business spend management engine auditing indirect procurement contracts and catalog pricing compliance."
    },
    {
      id: "System: Dun & Bradstreet",
      label: "D&B Cyber & Threat Crawler",
      type: "Signal",
      group: "Procurement & SCM Hub",
      color: "#ef4444",
      val: 40,
      x: -220, y: -240, z: -160,
      country: "GLOBAL",
      scopes: ["applications", "tprm"],
      scenario: "swissoptics-tprm",
      riskScore: "D&B Score: 45 (High Cyber Risk)",
      details: "Real-time threat intelligence feed monitoring darkweb domain dumps, credit rating drops, and vendor bank account tampering."
    },
    {
      id: "System: Celonis Process Mining",
      label: "Celonis EMS Execution Management",
      type: "System",
      group: "Procurement & SCM Hub",
      color: "#b45309",
      val: 40,
      x: -180, y: -220, z: -80,
      country: "GLOBAL",
      scopes: ["applications"],
      details: "Enterprise process mining engine monitoring real-time SAP order execution friction and AP payment block durations."
    },
    {
      id: "System: Manhattan WMS",
      label: "Manhattan Associates WMS",
      type: "System",
      group: "Procurement & SCM Hub",
      color: "#ea580c",
      val: 38,
      x: 60, y: -320, z: -200,
      country: "GLOBAL",
      scopes: ["applications"],
      details: "Warehouse management system optimizing storage bin picking (MARD) and inventory receipts."
    },
    {
      id: "System: Blue Yonder SCM",
      label: "Blue Yonder Demand Planning",
      type: "System",
      group: "Procurement & SCM Hub",
      color: "#c2410c",
      val: 38,
      x: -60, y: -340, z: -160,
      country: "GLOBAL",
      scopes: ["applications"],
      details: "Supply chain demand forecasting engine calculating Material Requirements Planning (MRP) buffers."
    },

    // --- DOMAIN 7: DATA LAKEHOUSE, ANALYTICS & AI (Sky Blue #38bdf8) ---
    {
      id: "System: Snowflake Data Cloud",
      label: "Snowflake Enterprise Data Cloud",
      type: "System",
      group: "Data Lakehouse & AI",
      color: "#38bdf8",
      val: 80, // Central Data Hub
      x: 0, y: 300, z: -160,
      country: "GLOBAL",
      scopes: ["applications", "finance"],
      details: "Central enterprise analytics data cloud ingesting real-time telemetry from Salesforce, SAP, Marketo, and Workday."
    },
    {
      id: "System: Databricks Lakehouse",
      label: "Databricks Lakehouse AI Engine",
      type: "System",
      group: "Data Lakehouse & AI",
      color: "#ff3621",
      val: 48,
      x: 100, y: 360, z: -200,
      country: "GLOBAL",
      scopes: ["applications"],
      details: "Unified AI & Data Lakehouse platform processing streaming supply chain predictive ML risk scoring models."
    },
    {
      id: "System: Tableau Analytics",
      label: "Tableau & PowerBI BI Suite",
      type: "System",
      group: "Data Lakehouse & AI",
      color: "#60a5fa",
      val: 42,
      x: -100, y: 340, z: -120,
      country: "GLOBAL",
      scopes: ["applications"],
      details: "Executive business intelligence dashboard reporting multi-domain financial & operational KPIs."
    },
    {
      id: "System: ThoughtSpot Search",
      label: "ThoughtSpot AI Analytics Search",
      type: "System",
      group: "Data Lakehouse & AI",
      color: "#2563eb",
      val: 30,
      x: 40, y: 380, z: -100,
      country: "GLOBAL",
      scopes: ["applications"],
      details: "Natural language analytics search over Snowflake enterprise tables."
    }
  ];
  nodes.push(...systemNodes);

  // --- NON-SAP ORG STRUCTURE NODES ---
  const otherOrgNodes: Node3D[] = [
    // Workday Org
    { id: "Org: WD Global HR", label: "Global HR", type: "SalesOrg", group: "HR & Talent Mgmt", color: "#14b8a6", val: 18 },
    { id: "Org: WD US Ops", label: "US Operations (Supervisory)", type: "Plant", group: "HR & Talent Mgmt", color: "#14b8a6", val: 14 },
    { id: "Org: WD EMEA Ops", label: "EMEA Operations (Supervisory)", type: "Plant", group: "HR & Talent Mgmt", color: "#14b8a6", val: 14 },
    
    // Salesforce Org
    { id: "Org: SF Global Sales", label: "Global Sales", type: "SalesOrg", group: "Revenue & Customer Experience", color: "#2563eb", val: 18 },
    { id: "Org: SF NA Territory", label: "NA Territory", type: "Plant", group: "Revenue & Customer Experience", color: "#2563eb", val: 14 },
    { id: "Org: SF EMEA Territory", label: "EMEA Territory", type: "Plant", group: "Revenue & Customer Experience", color: "#2563eb", val: 14 },

    // Coupa/Ariba Org
    { id: "Org: Global Procurement", label: "Global Procurement", type: "PurchOrg", group: "Procurement & SCM Hub", color: "#fbbf24", val: 18 },
    { id: "Org: US Purchasing", label: "US Purchasing Unit", type: "Plant", group: "Procurement & SCM Hub", color: "#fbbf24", val: 14 },
    { id: "Org: EMEA Purchasing", label: "EMEA Purchasing Unit", type: "Plant", group: "Procurement & SCM Hub", color: "#fbbf24", val: 14 },
  ];
  nodes.push(...otherOrgNodes);


      // --- CORE MASTER DATA SCHEMA OBJECTS ---
  const masterDataNodes: Node3D[] = [
    // Workday HCM
    { id: "MD: Employee", label: "Employee Profile", type: "MasterData", group: "HR & Talent Mgmt", color: "#14b8a6", val: 20 },
    { id: "MD: Job Profile", label: "Job Profile", type: "MasterData", group: "HR & Talent Mgmt", color: "#14b8a6", val: 12 },
    { id: "MD: Org Unit", label: "Organizational Unit", type: "MasterData", group: "HR & Talent Mgmt", color: "#14b8a6", val: 15 },
    
    // SAP S/4HANA
    { id: "MD: Cost Center", label: "Cost Center", type: "MasterData", group: "Finance & ERP Kernel", color: "#06b6d4", val: 18 },
    { id: "MD: Profit Center", label: "Profit Center", type: "MasterData", group: "Finance & ERP Kernel", color: "#06b6d4", val: 18 },
    { id: "MD: GL Account", label: "G/L Account", type: "MasterData", group: "Finance & ERP Kernel", color: "#06b6d4", val: 20 },
    { id: "MD: Vendor", label: "Vendor Master", type: "MasterData", group: "Finance & ERP Kernel", color: "#06b6d4", val: 22 },
    { id: "MD: Customer", label: "Customer Master", type: "MasterData", group: "Finance & ERP Kernel", color: "#06b6d4", val: 22 },
    { id: "MD: Material", label: "Material Master", type: "MasterData", group: "Finance & ERP Kernel", color: "#06b6d4", val: 25 },
    { id: "MD: Equipment", label: "Equipment Master", type: "MasterData", group: "Finance & ERP Kernel", color: "#06b6d4", val: 18 },
    { id: "MD: Func Loc", label: "Functional Location", type: "MasterData", group: "Finance & ERP Kernel", color: "#06b6d4", val: 18 },
    { id: "MD: Bank Account", label: "Bank Account Master", type: "MasterData", group: "Finance & ERP Kernel", color: "#06b6d4", val: 18 },
    { id: "MD: Pricing Cond", label: "Pricing Conditions", type: "MasterData", group: "Finance & ERP Kernel", color: "#06b6d4", val: 18 },
    { id: "MD: Work Center", label: "Work Center", type: "MasterData", group: "Finance & ERP Kernel", color: "#06b6d4", val: 18 },
    
    // Salesforce CRM
    { id: "MD: Account", label: "CRM Account", type: "MasterData", group: "Revenue & Customer Experience", color: "#2563eb", val: 22 },
    { id: "MD: Opportunity", label: "Opportunity", type: "MasterData", group: "Revenue & Customer Experience", color: "#2563eb", val: 20 },
    { id: "MD: Contact", label: "Contact", type: "MasterData", group: "Revenue & Customer Experience", color: "#2563eb", val: 15 },
    { id: "MD: Lead", label: "Lead", type: "MasterData", group: "Revenue & Customer Experience", color: "#2563eb", val: 12 },

    // Siemens PLM
    { id: "MD: Eng BOM", label: "Engineering BOM", type: "MasterData", group: "Product & Engineering", color: "#4f46e5", val: 20 },
    { id: "MD: Product Drawing", label: "Product Drawing (CAD)", type: "MasterData", group: "Product & Engineering", color: "#4f46e5", val: 15 },

    // SAP Ariba
    { id: "MD: Supplier Profile", label: "Supplier Profile", type: "MasterData", group: "Procurement & SCM Hub", color: "#fbbf24", val: 18 },
    { id: "MD: Sourcing Contract", label: "Sourcing Contract", type: "MasterData", group: "Procurement & SCM Hub", color: "#fbbf24", val: 18 },

    // Coupa Spend
    { id: "MD: Purchase Req", label: "Purchase Requisition", type: "MasterData", group: "Procurement & SCM Hub", color: "#d97706", val: 15 },
    { id: "MD: Supplier Catalog", label: "Supplier Catalog", type: "MasterData", group: "Procurement & SCM Hub", color: "#d97706", val: 12 },

    // HighRadius AR
    { id: "MD: Credit Limit", label: "Credit Limit Profile", type: "MasterData", group: "Treasury & Collections", color: "#0ea5e9", val: 14 },

    // Zendesk Support
    { id: "MD: Support Ticket", label: "Support Ticket", type: "MasterData", group: "Revenue & Customer Experience", color: "#10b981", val: 10 },

    // Conga CPQ
    { id: "MD: Price Book", label: "Price Book", type: "MasterData", group: "Revenue & Customer Experience", color: "#1d4ed8", val: 12 },
    { id: "MD: Quote", label: "Quote", type: "MasterData", group: "Revenue & Customer Experience", color: "#1d4ed8", val: 14 }
  ];
  nodes.push(...masterDataNodes);

  // 3. EXPLICIT 35 CROSS-SYSTEM DATA FLOW VECTORS (O2C, P2P, H2R, Event Mesh, Entra SSO/SCIM)
  const appFlowLinks: Link3D[] = [
    // --- ENTRA ID FEDERATED IDENTITY & SSO MESH (7 Links) ---
    {
      source: "System: Microsoft Azure AD",
      target: "System: Salesforce CRM",
      type: "AppFlow",
      label: "➔ SAML 2.0 SSO Claims & SCIM Provisioning",
      color: "#a855f7",
      scopes: ["applications"]
    },
    {
      source: "System: Microsoft Azure AD",
      target: "System: Workday HCM",
      type: "AppFlow",
      label: "➔ SCIM User Life-Cycle Provisioning & MFA",
      color: "#a855f7",
      scopes: ["applications"]
    },
    {
      source: "System: Microsoft Azure AD",
      target: "System: ServiceNow ITSM",
      type: "AppFlow",
      label: "➔ Identity Context & SecOps Tokens",
      color: "#a855f7",
      scopes: ["applications"]
    },
    {
      source: "System: Microsoft Azure AD",
      target: "System: Snowflake Data Cloud",
      type: "AppFlow",
      label: "➔ Federated OAuth2 & Row-Level Security",
      color: "#a855f7",
      scopes: ["applications"]
    },
    {
      source: "System: Microsoft Azure AD",
      target: "System: SAP S/4HANA",
      type: "AppFlow",
      label: "➔ Kerberos / SAML SSO & ERP Authorization Roles",
      color: "#a855f7",
      scopes: ["applications"]
    },
    {
      source: "System: Microsoft Azure AD",
      target: "System: MuleSoft Integration",
      type: "AppFlow",
      label: "➔ Anypoint API Client Credentials",
      color: "#a855f7",
      scopes: ["applications"]
    },
    {
      source: "System: Microsoft Azure AD",
      target: "System: Siemens PLM",
      type: "AppFlow",
      label: "➔ SSO Auth & Engineering Drawings ACL",
      color: "#a855f7",
      scopes: ["applications"]
    },

    // --- WORKDAY HCM ENTERPRISE MESH (6 Links) ---
    {
      source: "System: Workday HCM",
      target: "System: Salesforce CRM",
      type: "AppFlow",
      label: "➔ Sales Incentive Compensation & Quotas",
      color: "#14b8a6",
      scopes: ["applications", "sales"]
    },
    {
      source: "System: Workday HCM",
      target: "System: SAP S/4HANA",
      type: "AppFlow",
      label: "➔ Payroll Cost Center Allocations (PA0002)",
      color: "#14b8a6",
      scopes: ["applications", "finance"]
    },
    {
      source: "System: Workday HCM",
      target: "System: ServiceNow ITSM",
      type: "AppFlow",
      label: "➔ Employee Onboarding Workflows",
      color: "#14b8a6",
      scopes: ["applications"]
    },
    {
      source: "System: Workday HCM",
      target: "System: Snowflake Data Cloud",
      type: "AppFlow",
      label: "➔ Workforce Analytics & Headcount Telemetry",
      color: "#14b8a6",
      scopes: ["applications"]
    },
    {
      source: "System: Workday HCM",
      target: "System: SuccessFactors",
      type: "AppFlow",
      label: "➔ Executive Talent Calibration & Leadership Sync",
      color: "#14b8a6",
      scopes: ["applications"]
    },
    {
      source: "System: SAP S/4HANA",
      target: "System: Workday HCM",
      type: "AppFlow",
      label: "➔ Core Financial Cost Centers to HCM",
      color: "#06b6d4",
      scopes: ["applications", "finance"]
    },
    {
      source: "System: Workday HCM",
      target: "System: ADP Global Payroll",
      type: "AppFlow",
      label: "➔ Gross-to-Net Payroll File Transfer",
      color: "#14b8a6",
      scopes: ["applications"]
    },

    // --- MULESOFT CENTRAL IPAAS RADIAL SPOKES (7 Links) ---
    {
      source: "System: MuleSoft Integration",
      target: "System: Salesforce CRM",
      type: "AppFlow",
      label: "➔ Sales Order API Bus & Account Sync",
      color: "#6366f1",
      scopes: ["applications", "sales"]
    },
    {
      source: "System: MuleSoft Integration",
      target: "System: SAP S/4HANA",
      type: "AppFlow",
      label: "➔ BAPI_SALESORDER_CREATE & IDoc Feeds",
      color: "#6366f1",
      scopes: ["applications", "finance"]
    },
    {
      source: "System: MuleSoft Integration",
      target: "System: ServiceNow ITSM",
      type: "AppFlow",
      label: "➔ ITSM Incident & Change Request API",
      color: "#6366f1",
      scopes: ["applications"]
    },
    {
      source: "System: MuleSoft Integration",
      target: "System: Kyriba Treasury",
      type: "AppFlow",
      label: "➔ SWIFT MT940 Cash Statement API",
      color: "#6366f1",
      scopes: ["applications", "finance"]
    },
    {
      source: "System: MuleSoft Integration",
      target: "System: Siemens PLM",
      type: "AppFlow",
      label: "➔ Engineering Change Order (ECO) API",
      color: "#6366f1",
      scopes: ["applications"]
    },
    {
      source: "System: MuleSoft Integration",
      target: "System: SAP Ariba Network",
      type: "AppFlow",
      label: "➔ Purchase Order & Invoice B2B API",
      color: "#6366f1",
      scopes: ["applications", "tprm"]
    },
    {
      source: "System: MuleSoft Integration",
      target: "System: Kafka Event Streaming",
      type: "AppFlow",
      label: "➔ API Event Bus Bridge to Kafka Mesh",
      color: "#6366f1",
      scopes: ["applications"]
    },

    // --- KAFKA ASYNCHRONOUS EVENT STREAMING MESH (3 Links) ---
    {
      source: "System: SAP S/4HANA",
      target: "System: Kafka Event Streaming",
      type: "AppFlow",
      label: "➔ Business Event Streams (SalesOrder, GoodsMovement)",
      color: "#4f46e5",
      scopes: ["applications"]
    },
    {
      source: "System: Salesforce CRM",
      target: "System: Kafka Event Streaming",
      type: "AppFlow",
      label: "➔ Change Data Capture (CDC) Event Streams",
      color: "#4f46e5",
      scopes: ["applications"]
    },
    {
      source: "System: Kafka Event Streaming",
      target: "System: Snowflake Data Cloud",
      type: "AppFlow",
      label: "➔ Real-Time Event Stream Ingestion",
      color: "#4f46e5",
      scopes: ["applications"]
    },

    // --- ORDER-TO-CASH & REVENUE STREAM (5 Links) ---
    {
      source: "System: Marketo Automation",
      target: "System: Salesforce CRM",
      type: "AppFlow",
      label: "➔ MQL Leads & Campaign Attribution",
      color: "#f472b6",
      scopes: ["applications", "sales"]
    },
    {
      source: "System: Conga CPQ",
      target: "System: Salesforce CRM",
      type: "AppFlow",
      label: "➔ CPQ Quotes, E-Signatures & Contracts",
      color: "#f43f5e",
      scopes: ["applications", "sales"]
    },
    {
      source: "System: Salesforce CRM",
      target: "System: HighRadius AR",
      type: "AppFlow",
      label: "➔ Customer Invoices & AR Credit Limits",
      color: "#ec4899",
      scopes: ["applications", "sales"]
    },
    {
      source: "System: HighRadius AR",
      target: "System: SAP S/4HANA",
      type: "AppFlow",
      label: "➔ Cash Application & Netting Collateral",
      color: "#34d399",
      scopes: ["applications", "finance"]
    },
    {
      source: "System: Vertex Tax Engine",
      target: "System: SAP S/4HANA",
      type: "AppFlow",
      label: "➔ Real-Time Tax Determination (MWSKZ)",
      color: "#14b8a6",
      scopes: ["applications", "finance"]
    },

    // --- PROCURE-TO-PAY & LOGISTICS STREAM (5 Links) ---
    {
      source: "System: Siemens PLM",
      target: "System: SAP S/4HANA",
      type: "AppFlow",
      label: "➔ Work Orders, Engineering BOMs (STPO) & QPL",
      color: "#f59e0b",
      scopes: ["applications"]
    },
    {
      source: "System: SAP Ariba Network",
      target: "System: SAP S/4HANA",
      type: "AppFlow",
      label: "➔ Purchase Orders (EKKO) & Electronic Invoices",
      color: "#fbbf24",
      scopes: ["applications", "tprm"]
    },
    {
      source: "System: Coupa Spend",
      target: "System: SAP S/4HANA",
      type: "AppFlow",
      label: "➔ Indirect Spend Requisitions",
      color: "#d97706",
      scopes: ["applications", "tprm"]
    },
    {
      source: "System: Dun & Bradstreet",
      target: "System: SAP S/4HANA",
      type: "AppFlow",
      label: "➔ Supplier Risk Ratings & IBAN Warnings",
      color: "#ef4444",
      scopes: ["applications", "tprm"]
    },
    {
      source: "System: Manhattan WMS",
      target: "System: SAP S/4HANA",
      type: "AppFlow",
      label: "➔ Goods Receipt (MIGO) & Warehouse Bins (MARD)",
      color: "#ea580c",
      scopes: ["applications"]
    },

    // --- DATA LAKEHOUSE, ANALYTICS & AI STREAM (2 Links) ---
    {
      source: "System: Snowflake Data Cloud",
      target: "System: Databricks Lakehouse",
      type: "AppFlow",
      label: "➔ Raw Data Lake Ingestion & ML Scoring",
      color: "#ff3621",
      scopes: ["applications"]
    },
    {
      source: "System: Databricks Lakehouse",
      target: "System: SAP S/4HANA",
      type: "AppFlow",
      label: "➔ Streaming Predictive Risk & Vendor Scores",
      color: "#ff3621",
      scopes: ["applications"]
    },
    
    // --- MISSING SYSTEM LINKS ---
    {
      source: "System: SAP GRC",
      target: "System: SAP S/4HANA",
      type: "AppFlow",
      label: "➔ SOD Rules & Compliance Sync",
      color: "#0e7490",
      scopes: ["applications", "finance"]
    },
    {
      source: "System: SAP BW/4HANA",
      target: "System: SAP S/4HANA",
      type: "AppFlow",
      label: "➔ BW Extraction & Analytics",
      color: "#0891b2",
      scopes: ["applications", "finance"]
    },
    {
      source: "System: SAP BPC",
      target: "System: SAP S/4HANA",
      type: "AppFlow",
      label: "➔ Financial Consolidation & Planning",
      color: "#0284c7",
      scopes: ["applications", "finance"]
    },
    {
      source: "System: BlackLine Close",
      target: "System: SAP S/4HANA",
      type: "AppFlow",
      label: "➔ Journal Entries & Account Reconciliations",
      color: "#059669",
      scopes: ["applications", "finance"]
    },
    {
      source: "System: Kyriba Treasury",
      target: "System: SAP S/4HANA",
      type: "AppFlow",
      label: "➔ Treasury Sweeps & Bank Statements",
      color: "#10b981",
      scopes: ["applications", "finance"]
    },
    {
      source: "System: HighRadius AR",
      target: "System: SAP S/4HANA",
      type: "AppFlow",
      label: "➔ Cash Application & Credit Management",
      color: "#34d399",
      scopes: ["applications", "finance"]
    },
    {
      source: "System: Celonis Process Mining",
      target: "System: SAP S/4HANA",
      type: "AppFlow",
      label: "➔ Process Execution Telemetry",
      color: "#b45309",
      scopes: ["applications"]
    },
    {
      source: "System: Marketo Automation",
      target: "System: Salesforce CRM",
      type: "AppFlow",
      label: "➔ Marketing Leads & Campaign Sync",
      color: "#f472b6",
      scopes: ["applications", "sales"]
    },
    {
      source: "System: Conga CPQ",
      target: "System: Salesforce CRM",
      type: "AppFlow",
      label: "➔ CPQ & Contract Data",
      color: "#f43f5e",
      scopes: ["applications", "sales"]
    },
    {
      source: "System: Gainsight CS",
      target: "System: Salesforce CRM",
      type: "AppFlow",
      label: "➔ Customer Health & Renewals",
      color: "#db2777",
      scopes: ["applications", "sales"]
    },
    {
      source: "System: Zendesk Support",
      target: "System: Salesforce CRM",
      type: "AppFlow",
      label: "➔ Support Tickets & Case Sync",
      color: "#e11d48",
      scopes: ["applications", "sales"]
    },
    {
      source: "System: Okta Identity",
      target: "System: Salesforce CRM",
      type: "AppFlow",
      label: "➔ B2B Client SSO",
      color: "#c084fc",
      scopes: ["applications"]
    },
    {
      source: "System: CyberArk PAM",
      target: "System: SAP S/4HANA",
      type: "AppFlow",
      label: "➔ Privileged Access & Root Credentials",
      color: "#9333ea",
      scopes: ["applications"]
    },
    {
      source: "System: Palo Alto Prisma",
      target: "System: SAP S/4HANA",
      type: "AppFlow",
      label: "➔ Network Security & API Auditing",
      color: "#6b21a8",
      scopes: ["applications"]
    },
    {
      source: "System: SAP BTP",
      target: "System: SAP S/4HANA",
      type: "AppFlow",
      label: "➔ Integration Suite & Extensions",
      color: "#4338ca",
      scopes: ["applications"]
    },
    {
      source: "System: Blue Yonder SCM",
      target: "System: SAP S/4HANA",
      type: "AppFlow",
      label: "➔ Supply Chain Planning & Forecasting",
      color: "#d97706",
      scopes: ["applications"]
    },
    {
      source: "System: Tableau Analytics",
      target: "System: Snowflake Data Cloud",
      type: "AppFlow",
      label: "➔ Visual Analytics Dashboards",
      color: "#f43f5e",
      scopes: ["applications"]
    },
    {
      source: "System: ThoughtSpot Search",
      target: "System: Snowflake Data Cloud",
      type: "AppFlow",
      label: "➔ AI-Driven Search Analytics",
      color: "#e11d48",
      scopes: ["applications"]
    },
    
    // --- ADVANCED DATA MESH & ANALYTICS PIPELINES ---
    {
      source: "System: Snowflake Data Cloud",
      target: "System: Salesforce CRM",
      type: "AppFlow",
      label: "➔ Reverse ETL & Lead Scoring Sync",
      color: "#ff3621",
      scopes: ["applications", "sales"]
    },
    {
      source: "System: Snowflake Data Cloud",
      target: "System: Workday HCM",
      type: "AppFlow",
      label: "➔ HCM Headcount Analytics",
      color: "#ff3621",
      scopes: ["applications"]
    },
    {
      source: "System: Snowflake Data Cloud",
      target: "System: ServiceNow ITSM",
      type: "AppFlow",
      label: "➔ IT Ops Telemetry Ingestion",
      color: "#ff3621",
      scopes: ["applications"]
    },
    {
      source: "System: MuleSoft Integration",
      target: "System: Snowflake Data Cloud",
      type: "AppFlow",
      label: "➔ Streaming API Data Ingestion",
      color: "#6366f1",
      scopes: ["applications"]
    },
    {
      source: "System: MuleSoft Integration",
      target: "System: Databricks Lakehouse",
      type: "AppFlow",
      label: "➔ Bulk Data Lake CDC Streaming",
      color: "#6366f1",
      scopes: ["applications"]
    },
    {
      source: "System: Coupa Spend",
      target: "System: Workday HCM",
      type: "AppFlow",
      label: "➔ Employee Cost Center Sync",
      color: "#d97706",
      scopes: ["applications"]
    },
    {
      source: "System: Zendesk Support",
      target: "System: SAP S/4HANA",
      type: "AppFlow",
      label: "➔ Sales Order Status Queries",
      color: "#e11d48",
      scopes: ["applications", "sales"]
    }
  ];
  links.push(...appFlowLinks);

  // --- NON-SAP ORG TO SYSTEM LINKS ---
  const otherOrgLinks: Link3D[] = [
    // Workday
    { source: "System: Workday HCM", target: "Org: WD Global HR", type: "OrgStructure", label: "➔ Base Org", color: "#6b7280", scopes: ["applications"] },
    { source: "Org: WD Global HR", target: "Org: WD US Ops", type: "OrgStructure", label: "➔ Sub-Org", color: "#6b7280", scopes: ["applications"] },
    { source: "Org: WD Global HR", target: "Org: WD EMEA Ops", type: "OrgStructure", label: "➔ Sub-Org", color: "#6b7280", scopes: ["applications"] },

    // Salesforce
    { source: "System: Salesforce CRM", target: "Org: SF Global Sales", type: "OrgStructure", label: "➔ Base Org", color: "#6b7280", scopes: ["applications"] },
    { source: "Org: SF Global Sales", target: "Org: SF NA Territory", type: "OrgStructure", label: "➔ Sub-Org", color: "#6b7280", scopes: ["applications"] },
    { source: "Org: SF Global Sales", target: "Org: SF EMEA Territory", type: "OrgStructure", label: "➔ Sub-Org", color: "#6b7280", scopes: ["applications"] },

    // Procurement
    { source: "System: Coupa Spend", target: "Org: Global Procurement", type: "OrgStructure", label: "➔ Base Org", color: "#6b7280", scopes: ["applications"] },
    { source: "System: SAP Ariba Network", target: "Org: Global Procurement", type: "OrgStructure", label: "➔ Base Org", color: "#6b7280", scopes: ["applications"] },
    { source: "Org: Global Procurement", target: "Org: US Purchasing", type: "OrgStructure", label: "➔ Sub-Org", color: "#6b7280", scopes: ["applications"] },
    { source: "Org: Global Procurement", target: "Org: EMEA Purchasing", type: "OrgStructure", label: "➔ Sub-Org", color: "#6b7280", scopes: ["applications"] },
    
    // Link SAP Client 100 to SAP S/4HANA System
    { source: "System: SAP S/4HANA", target: "Client 100", type: "OrgStructure", label: "➔ Base Org", color: "#6b7280", scopes: ["applications"] },
  ];
  links.push(...otherOrgLinks);


  
  // --- MASTER DATA STRUCTURAL & REPLICATION LINKS ---
  const mdLinks: Link3D[] = [
    // Workday HCM
    { source: "Org: WD Global HR", target: "MD: Org Unit", type: "MasterDataSchema", label: "➔ Owns Schema", color: "rgba(100, 255, 100, 0.4)", scopes: ["applications"] },
    { source: "Org: WD US Ops", target: "MD: Employee", type: "MasterDataSchema", label: "➔ Owns Schema", color: "rgba(100, 255, 100, 0.4)", scopes: ["applications"] },
    { source: "Org: WD EMEA Ops", target: "MD: Job Profile", type: "MasterDataSchema", label: "➔ Owns Schema", color: "rgba(100, 255, 100, 0.4)", scopes: ["applications"] },
    
    // Employee Replication
    { source: "MD: Employee", target: "System: SAP S/4HANA", type: "DataReplication", label: "➔ Replicates (Mini-Master)", color: "rgba(255, 165, 0, 0.6)", scopes: ["applications"] },
    { source: "MD: Employee", target: "System: Salesforce CRM", type: "DataReplication", label: "➔ Replicates", color: "rgba(255, 165, 0, 0.6)", scopes: ["applications"] },
    { source: "MD: Employee", target: "System: ServiceNow ITSM", type: "DataReplication", label: "➔ Replicates", color: "rgba(255, 165, 0, 0.6)", scopes: ["applications"] },

    // SAP S/4HANA Finance
    { source: "CoCode 1710", target: "MD: Cost Center", type: "MasterDataSchema", label: "➔ Owns Schema", color: "rgba(100, 255, 100, 0.4)", scopes: ["applications"] },
    { source: "Controlling Area A000", target: "MD: Profit Center", type: "MasterDataSchema", label: "➔ Owns Schema", color: "rgba(100, 255, 100, 0.4)", scopes: ["applications"] },
    { source: "CoCode 1010", target: "MD: GL Account", type: "MasterDataSchema", label: "➔ Owns Schema", color: "rgba(100, 255, 100, 0.4)", scopes: ["applications"] },
    { source: "CoCode 1710", target: "MD: Bank Account", type: "MasterDataSchema", label: "➔ Owns Schema", color: "rgba(100, 255, 100, 0.4)", scopes: ["applications"] },
    
    // Cost Center Replication
    { source: "MD: Cost Center", target: "System: Workday HCM", type: "DataReplication", label: "➔ Replicates", color: "rgba(255, 165, 0, 0.6)", scopes: ["applications"] },
    { source: "MD: Cost Center", target: "System: Coupa Spend", type: "DataReplication", label: "➔ Replicates", color: "rgba(255, 165, 0, 0.6)", scopes: ["applications"] },

    // SAP S/4HANA Logistics / Materials
    { source: "Plant 1710", target: "MD: Material", type: "MasterDataSchema", label: "➔ Owns Schema", color: "rgba(100, 255, 100, 0.4)", scopes: ["applications"] },
    { source: "Plant 1010", target: "MD: Equipment", type: "MasterDataSchema", label: "➔ Owns Schema", color: "rgba(100, 255, 100, 0.4)", scopes: ["applications"] },
    { source: "Plant 1710", target: "MD: Func Loc", type: "MasterDataSchema", label: "➔ Owns Schema", color: "rgba(100, 255, 100, 0.4)", scopes: ["applications"] },
    { source: "Plant 1010", target: "MD: Work Center", type: "MasterDataSchema", label: "➔ Owns Schema", color: "rgba(100, 255, 100, 0.4)", scopes: ["applications"] },
    
    // Material Replication
    { source: "MD: Material", target: "System: SAP Ariba Network", type: "DataReplication", label: "➔ Replicates", color: "rgba(255, 165, 0, 0.6)", scopes: ["applications"] },
    { source: "MD: Material", target: "System: Siemens PLM", type: "DataReplication", label: "➔ Replicates", color: "rgba(255, 165, 0, 0.6)", scopes: ["applications"] },
    { source: "MD: Material", target: "System: Coupa Spend", type: "DataReplication", label: "➔ Replicates", color: "rgba(255, 165, 0, 0.6)", scopes: ["applications"] },
    { source: "MD: Material", target: "System: Blue Yonder SCM", type: "DataReplication", label: "➔ Replicates", color: "rgba(255, 165, 0, 0.6)", scopes: ["applications"] },

    // SAP S/4HANA Procurement & Sales
    { source: "PurchOrg 1710", target: "MD: Vendor", type: "MasterDataSchema", label: "➔ Owns Schema", color: "rgba(100, 255, 100, 0.4)", scopes: ["applications"] },
    { source: "SalesOrg 1710", target: "MD: Customer", type: "MasterDataSchema", label: "➔ Owns Schema", color: "rgba(100, 255, 100, 0.4)", scopes: ["applications"] },
    { source: "SalesOrg 1010", target: "MD: Pricing Cond", type: "MasterDataSchema", label: "➔ Owns Schema", color: "rgba(100, 255, 100, 0.4)", scopes: ["applications"] },

    // Vendor / Customer Replication
    { source: "MD: Vendor", target: "System: SAP Ariba Network", type: "DataReplication", label: "➔ Replicates", color: "rgba(255, 165, 0, 0.6)", scopes: ["applications"] },
    { source: "MD: Vendor", target: "System: Coupa Spend", type: "DataReplication", label: "➔ Replicates", color: "rgba(255, 165, 0, 0.6)", scopes: ["applications"] },
    { source: "MD: Customer", target: "System: Salesforce CRM", type: "DataReplication", label: "➔ Replicates", color: "rgba(255, 165, 0, 0.6)", scopes: ["applications"] },
    { source: "MD: Customer", target: "System: Zendesk Support", type: "DataReplication", label: "➔ Replicates", color: "rgba(255, 165, 0, 0.6)", scopes: ["applications"] },
    { source: "MD: Customer", target: "System: HighRadius AR", type: "DataReplication", label: "➔ Replicates", color: "rgba(255, 165, 0, 0.6)", scopes: ["applications"] },

    // Salesforce CRM
    { source: "Org: SF NA Territory", target: "MD: Account", type: "MasterDataSchema", label: "➔ Owns Schema", color: "rgba(100, 255, 100, 0.4)", scopes: ["applications"] },
    { source: "Org: SF EMEA Territory", target: "MD: Opportunity", type: "MasterDataSchema", label: "➔ Owns Schema", color: "rgba(100, 255, 100, 0.4)", scopes: ["applications"] },
    { source: "Org: SF NA Territory", target: "MD: Contact", type: "MasterDataSchema", label: "➔ Owns Schema", color: "rgba(100, 255, 100, 0.4)", scopes: ["applications"] },
    { source: "Org: SF Global Sales", target: "MD: Lead", type: "MasterDataSchema", label: "➔ Owns Schema", color: "rgba(100, 255, 100, 0.4)", scopes: ["applications"] },

    // Account & Contact Replication
    { source: "MD: Account", target: "System: SAP S/4HANA", type: "DataReplication", label: "➔ Replicates (BP)", color: "rgba(255, 165, 0, 0.6)", scopes: ["applications"] },
    { source: "MD: Account", target: "System: Zendesk Support", type: "DataReplication", label: "➔ Replicates", color: "rgba(255, 165, 0, 0.6)", scopes: ["applications"] },
    { source: "MD: Account", target: "System: Marketo Automation", type: "DataReplication", label: "➔ Replicates", color: "rgba(255, 165, 0, 0.6)", scopes: ["applications"] },
    { source: "MD: Contact", target: "System: Marketo Automation", type: "DataReplication", label: "➔ Replicates", color: "rgba(255, 165, 0, 0.6)", scopes: ["applications"] },
    { source: "MD: Contact", target: "System: Zendesk Support", type: "DataReplication", label: "➔ Replicates", color: "rgba(255, 165, 0, 0.6)", scopes: ["applications"] },

    // Siemens PLM
    { source: "System: Siemens PLM", target: "MD: Eng BOM", type: "MasterDataSchema", label: "➔ Owns Schema", color: "rgba(100, 255, 100, 0.4)", scopes: ["applications"] },
    { source: "System: Siemens PLM", target: "MD: Product Drawing", type: "MasterDataSchema", label: "➔ Owns Schema", color: "rgba(100, 255, 100, 0.4)", scopes: ["applications"] },

    // Procurement
    { source: "Org: Global Procurement", target: "MD: Supplier Profile", type: "MasterDataSchema", label: "➔ Owns Schema", color: "rgba(100, 255, 100, 0.4)", scopes: ["applications"] },
    { source: "Org: US Purchasing", target: "MD: Sourcing Contract", type: "MasterDataSchema", label: "➔ Owns Schema", color: "rgba(100, 255, 100, 0.4)", scopes: ["applications"] },
    { source: "Org: US Purchasing", target: "MD: Purchase Req", type: "MasterDataSchema", label: "➔ Owns Schema", color: "rgba(100, 255, 100, 0.4)", scopes: ["applications"] },
    { source: "Org: EMEA Purchasing", target: "MD: Supplier Catalog", type: "MasterDataSchema", label: "➔ Owns Schema", color: "rgba(100, 255, 100, 0.4)", scopes: ["applications"] },
    
    // Supplier Profile Replication
    { source: "MD: Supplier Profile", target: "System: SAP S/4HANA", type: "DataReplication", label: "➔ Replicates (Vendor)", color: "rgba(255, 165, 0, 0.6)", scopes: ["applications"] },

    // Treasury & AR
    { source: "System: HighRadius AR", target: "MD: Credit Limit", type: "MasterDataSchema", label: "➔ Owns Schema", color: "rgba(100, 255, 100, 0.4)", scopes: ["applications"] },

    // Service & CPQ
    { source: "System: Zendesk Support", target: "MD: Support Ticket", type: "MasterDataSchema", label: "➔ Owns Schema", color: "rgba(100, 255, 100, 0.4)", scopes: ["applications"] },
    { source: "System: Conga CPQ", target: "MD: Price Book", type: "MasterDataSchema", label: "➔ Owns Schema", color: "rgba(100, 255, 100, 0.4)", scopes: ["applications"] },
    { source: "System: Conga CPQ", target: "MD: Quote", type: "MasterDataSchema", label: "➔ Owns Schema", color: "rgba(100, 255, 100, 0.4)", scopes: ["applications"] },
  ];
  links.push(...mdLinks);


  // 4. CONVERT SAP CAL ORG STRUCTURE NODES & LINKS
  sapOrgData.nodes.forEach((n) => {
    let color = "#008fbb";
    let val = 14;
    let country = "DE";

    if (n.id.includes("1710") || n.id.includes("US")) country = "US";
    else if (n.id.includes("3010") || n.id.includes("SG")) country = "SG";
    else if (n.id.includes("FR")) country = "FR";
    else if (n.id.includes("GB")) country = "GB";
    else if (n.id.includes("JP")) country = "JP";
    else if (n.id.includes("IN")) country = "IN";

    if (n.type === "CompanyCode") { color = "#06b6d4"; val = 30; }
    else if (n.type === "Plant") { color = "#10b981"; val = 22; }
    else if (n.type === "SalesOrg") { color = "#ec4899"; val = 20; }
    else if (n.type === "PurchOrg") { color = "#f59e0b"; val = 20; }
    else if (n.type === "MasterData") { color = "#a855f7"; val = 12; }

    nodes.push({
      id: n.id,
      label: `${n.id}: ${n.description}`,
      type: n.type as any,
      group: n.group,
      color: color,
      val: val,
      country: country,
      parentSystemId: "System: SAP S/4HANA",
      scopes: n.group === "Finance" ? ["finance"] : n.group === "Sales" ? ["sales"] : ["tprm"],
      sapTable: n.sapTable,
      tcode: n.tcode,
      details: n.details
    });

    if (n.type === "CompanyCode") {
      links.push(
        {
          source: "System: SAP S/4HANA",
          target: n.id,
          type: "SystemLink",
          color: "rgba(6, 182, 212, 0.4)"
        },
        {
          source: `Country: ${country}`,
          target: n.id,
          type: "CountryLink",
          color: "rgba(56, 189, 248, 0.4)"
        }
      );
    }
  });

  sapOrgData.links.forEach((l) => {
    links.push({
      source: l.source,
      target: l.target,
      type: l.type,
      color: l.color
    });
  });

  // 5. SCENARIO 1 TARGET NODES (SwissOptics Anomaly & Block) - Renamed Voucher to Invoice
  const swissOpticsVendor: Node3D = {
    id: "Vendor: VEND_CH_9002 (SwissOptics)",
    label: "SwissOptics AG (Zurich, CH)",
    type: "Vendor",
    group: "Procurement",
    color: "#ef4444",
    val: 28,
    country: "DE",
    parentSystemId: "System: SAP Ariba Network",
    scopes: ["tprm", "finance"],
    scenario: "swissoptics-tprm",
    sapTable: "LFA1 (Vendor Master)",
    annualSpend: "$4,250,000 / yr (AP Buy)",
    dualRoleSell: "$1,120,000 / yr (AR Sell)",
    openInvoices: "Invoice 10002841 ($450k) & 10002990 ($180k)",
    riskScore: "D&B Rating: 45 (Compromised Domain)",
    details: "8-Year Tier-1 Supplier of Optical Lens Assemblies (`MAT_OPT_8820`). Subject to active BEC fraud alert."
  };

  const swissOpticsCustomer: Node3D = {
    id: "Customer: CUST_CH_9002 (SwissOptics)",
    label: "SwissOptics AR Customer Acct",
    type: "Customer",
    group: "Sales & AR",
    color: "#f59e0b",
    val: 24,
    country: "DE",
    parentSystemId: "System: Salesforce CRM",
    scopes: ["sales", "finance"],
    scenario: "swissoptics-tprm",
    sapTable: "KNA1 / Salesforce Account",
    dualRoleSell: "$1,120,000 / yr",
    details: "Receivables account for Sensor Calibration Chips (`MAT_CHIP_902`) shipped to SwissOptics. Collateral for AR netting."
  };

  const invoice10002841: Node3D = {
    id: "Invoice: BSEG-10002841",
    label: "Invoice 10002841 ($450,000)",
    type: "Invoice",
    group: "Accounts Payable",
    color: "#ef4444",
    val: 20,
    country: "DE",
    parentSystemId: "System: SAP S/4HANA",
    scopes: ["tprm", "finance"],
    scenario: "swissoptics-tprm",
    sapTable: "BSEG",
    fields: ["BELNR = 10002841", "DMBTR = $450,000.00", "ZLSPR = A (Payment Block)"],
    details: "Target AP Invoice document locked by ARIA to prevent $450k wire fraud disbursement."
  };

  const zeissVendor: Node3D = {
    id: "Vendor: VEND_CH_8801 (Zeiss)",
    label: "Carl Zeiss Optronics CH",
    type: "Vendor",
    group: "Procurement",
    color: "#10b981",
    val: 24,
    country: "DE",
    parentSystemId: "System: SAP Ariba Network",
    scopes: ["tprm"],
    scenario: "swissoptics-tprm",
    sapTable: "LFA1 / Teamcenter QPL",
    details: "Pre-qualified secondary optical lens supplier with 4,500 units in stock for emergency PO rerouting."
  };

  nodes.push(swissOpticsVendor, swissOpticsCustomer, invoice10002841, zeissVendor);

  links.push(
    { source: "System: Dun & Bradstreet", target: "Vendor: VEND_CH_9002 (SwissOptics)", type: "ThreatLink", color: "#ef4444", scenario: "swissoptics-tprm", status: "hazard", scopes: ["tprm"] },
    { source: "Vendor: VEND_CH_9002 (SwissOptics)", target: "CoCode 1010", type: "ProcurementLink", color: "#ef4444", scenario: "swissoptics-tprm", status: "blocked", scopes: ["tprm"] },
    { source: "Vendor: VEND_CH_9002 (SwissOptics)", target: "Invoice: BSEG-10002841", type: "InvoiceLink", color: "#ef4444", scenario: "swissoptics-tprm", status: "blocked", scopes: ["tprm", "finance"] },
    { source: "CoCode 1010", target: "Customer: CUST_CH_9002 (SwissOptics)", type: "SalesLink", color: "#f59e0b", scenario: "swissoptics-tprm", status: "netted", scopes: ["sales", "finance"] },
    { source: "Vendor: VEND_CH_8801 (Zeiss)", target: "CoCode 1010", type: "RerouteLink", color: "#10b981", scenario: "swissoptics-tprm", status: "rerouted", scopes: ["tprm"] }
  );

  // 6. GENERATE EMPLOYEES & PERSONNEL (Workday HCM)
  for (let i = 1; i <= 300; i++) {
    const title = EMPLOYEE_TITLES[i % EMPLOYEE_TITLES.length];
    const country = i < 100 ? "DE" : i < 200 ? "US" : "SG";
    const empId = `EMP_${country}_${100 + i}`;
    const empName = `Person ${i} (${title})`;
    const coCode = country === "DE" ? "CoCode 1010" : country === "US" ? "CoCode 1710" : "CoCode 0001";

    nodes.push({
      id: `Employee: ${empId}`,
      label: empName,
      type: "Employee",
      group: "Human Resources",
      color: "#14b8a6",
      val: 8,
      country: country,
      parentSystemId: "System: Workday HCM",
      scopes: ["applications"],
      sapTable: "PA0002",
      details: `Active employee in Company Code ${coCode} holding authorization roles for ERP workflow sign-off.`
    });

    if (i % 2 === 0) {
      links.push({
        source: `Employee: ${empId}`,
        target: coCode,
        type: "EmploymentLink",
        color: "rgba(20, 184, 166, 0.2)"
      });
    }
  }

  // 7. GENERATE CUSTOMER ACCOUNTS (Salesforce CRM)
  for (let i = 1; i <= 400; i++) {
    const custName = i < CUSTOMER_NAMES.length ? CUSTOMER_NAMES[i] : `Customer Acct CUST_GLOBAL_${1000 + i}`;
    const code = `CUST_ACC_${1000 + i}`;
    const country = i % 3 === 0 ? "DE" : i % 3 === 1 ? "US" : "SG";

    nodes.push({
      id: `Customer: ${code}`,
      label: `${custName} (${code})`,
      type: "Customer",
      group: "Sales & AR",
      color: "#ec4899",
      val: i < 20 ? 16 : 9,
      country: country,
      parentSystemId: "System: Salesforce CRM",
      scopes: ["sales", "finance"],
      sapTable: "KNA1 / Salesforce Account",
      annualSpend: `$${((i * 45200) % 6500000 + 150000).toLocaleString()} / yr (AR Contracts)`,
      details: `Strategic commercial satellite or defense contractor.`
    });

    links.push({
      source: "System: Salesforce CRM",
      target: `Customer: ${code}`,
      type: "CRMContract",
      color: "rgba(236, 72, 153, 0.15)",
      scopes: ["sales"]
    });
  }

  // 8. GENERATE 1,500 REGIONAL TPRM VENDORS (SAP Ariba)
  for (let i = 1; i <= 1500; i++) {
    const prefix = VENDOR_PREFIXES[i % VENDOR_PREFIXES.length];
    const suffix = VENDOR_SUFFIXES[i % VENDOR_SUFFIXES.length];
    const region = REGIONS[i % REGIONS.length];
    const country = REGIONS_MAP[region];
    const code = `VEND_${region}_${2000 + i}`;
    const parentCoCode = country === "DE" ? "CoCode 1010" : country === "US" ? "CoCode 1710" : "CoCode 0001";

    nodes.push({
      id: `Vendor: ${code}`,
      label: `${prefix} ${suffix} (${code})`,
      type: "Vendor",
      group: "Procurement",
      color: region === "EMEA" ? "#6366f1" : region === "AMER" ? "#06b6d4" : "#a855f7",
      val: (i % 9 === 0) ? 12 : 6,
      country: country,
      parentSystemId: "System: SAP Ariba Network",
      scopes: ["tprm", "finance"],
      sapTable: "LFA1",
      annualSpend: `$${((i * 18900) % 950000 + 15000).toLocaleString()} / yr`,
      details: `Registered Tier-${(i % 3) + 1} vendor under Purchasing Org PURCH_${region}_10.`
    });

    if (i % 3 !== 0) {
      links.push({
        source: `Vendor: ${code}`,
        target: parentCoCode,
        type: "VendorLink",
        color: "rgba(255, 255, 255, 0.06)",
        scopes: ["tprm"]
      });
    }
  }

  return { nodes, links };
}

/**
 * System Sub-Graph Generator:
 * Generates an isolated sub-graph workspace for a specific system (e.g. Workday, SAP, Salesforce).
 * Returns the target System node, its internal data objects, direct partner systems, and connecting links.
 */
export function generateSystemSubGraph(systemId: string): Graph3DData {
  const fullGraph = generateEnterprise3DGraph();
  const targetSystemNode = fullGraph.nodes.find((n) => n.id === systemId);
  if (!targetSystemNode) return fullGraph;

  // 1. Collect child data objects belonging to this system
  const childNodes = fullGraph.nodes.filter((n) => n.parentSystemId === systemId);

  // 2. Collect direct links connected to this system
  const connectedLinks = fullGraph.links.filter((l) => {
    const sId = typeof l.source === "object" ? (l.source as any).id : l.source;
    const tId = typeof l.target === "object" ? (l.target as any).id : l.target;
    return sId === systemId || tId === systemId;
  });

  // 3. Collect partner system IDs connected by direct links
  const partnerSystemIds = new Set<string>();
  connectedLinks.forEach((l) => {
    const sId = typeof l.source === "object" ? (l.source as any).id : l.source;
    const tId = typeof l.target === "object" ? (l.target as any).id : l.target;
    if (sId !== systemId) partnerSystemIds.add(sId);
    if (tId !== systemId) partnerSystemIds.add(tId);
  });

  const partnerNodes = fullGraph.nodes.filter((n) => partnerSystemIds.has(n.id));

  // 4. Combine into clean sub-graph
  const subNodes = [targetSystemNode, ...childNodes, ...partnerNodes];
  const nodeIds = new Set(subNodes.map((n) => n.id));
  const subLinks = fullGraph.links.filter((l) => {
    const sId = typeof l.source === "object" ? (l.source as any).id : l.source;
    const tId = typeof l.target === "object" ? (l.target as any).id : l.target;
    return nodeIds.has(sId) && nodeIds.has(tId);
  });

  return { nodes: subNodes, links: subLinks };
}
