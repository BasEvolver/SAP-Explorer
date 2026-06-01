export interface OrgNode {
  id: string;
  description: string;
  type: 'Client' | 'CompanyCode' | 'PurchOrg' | 'PurchGroup' | 'SalesOrg' | 'DistrChannel' | 'Division' | 'SalesArea' | 'Plant' | 'StorageLoc' | 'ShippingPoint' | 'MaintPlanning' | 'WorkCenter' | 'MasterData' | 'TransactionData';
  group: 'Client' | 'Finance' | 'Procurement' | 'Sales' | 'Logistics' | 'Maintenance' | 'Master' | 'Transaction';
  color: string;
  sapTable?: string;
  tcode?: string;
  details?: string;
}

export interface OrgLink {
  source: string;
  target: string;
  type: string;
  color?: string;
  sapTable?: string;
}

export interface OrgStructureData {
  nodes: OrgNode[];
  links: OrgLink[];
}

export const sapOrgData: OrgStructureData = {
  nodes: [
    // Client Node
    {
      id: "Client 100",
      description: "Demo CAL S/4HANA Production Client",
      type: "Client",
      group: "Client",
      color: "#ffffff",
      sapTable: "MANDT",
      details: "Client 100 is the pre-configured Best Practices client on the demo CAL system, containing rich demo data for multiple global legal entities."
    },

    // FINANCE / COMPANY CODES (Standard S/4HANA CAL Company Codes)
    {
      id: "CoCode 1710",
      description: "US Operations (Best Practices)",
      type: "CompanyCode",
      group: "Finance",
      color: "#06b6d4",
      sapTable: "T001",
      tcode: "OX02",
      details: "Primary legal entity representing US Operations. Standard currency USD, Chart of Accounts YCOA."
    },
    {
      id: "CoCode 1010",
      description: "Germany Operations (Best Practices)",
      type: "CompanyCode",
      group: "Finance",
      color: "#06b6d4",
      sapTable: "T001",
      tcode: "OX02",
      details: "Primary legal entity representing Germany Operations. Standard currency EUR, Chart of Accounts YCOA."
    },
    {
      id: "CoCode 0001",
      description: "SAP A.G. (Corporate Headquarters)",
      type: "CompanyCode",
      group: "Finance",
      color: "#06b6d4",
      sapTable: "T001",
      tcode: "OX02",
      details: "Original default corporate company code for SAP SE, representing the German headquarters in Walldorf. Currency EUR."
    },
    {
      id: "CoCode 0003",
      description: "SAP US (IS-HT-SW Software Sales)",
      type: "CompanyCode",
      group: "Finance",
      color: "#06b6d4",
      sapTable: "T001",
      tcode: "OX02",
      details: "High-Tech and Software sales branch of SAP US. Currency USD."
    },
    {
      id: "CoCode IN01",
      description: "India Model Company",
      type: "CompanyCode",
      group: "Finance",
      color: "#06b6d4",
      sapTable: "T001",
      tcode: "OX02",
      details: "Pre-configured legal entity representing India Operations. Currency INR."
    },
    {
      id: "CoCode FR01",
      description: "France Operations Template",
      type: "CompanyCode",
      group: "Finance",
      color: "#06b6d4",
      sapTable: "T001",
      tcode: "OX02",
      details: "Pre-configured legal entity representing French business operations. Currency EUR."
    },
    {
      id: "CoCode GB01",
      description: "UK Operations Template",
      type: "CompanyCode",
      group: "Finance",
      color: "#06b6d4",
      sapTable: "T001",
      tcode: "OX02",
      details: "Pre-configured legal entity representing United Kingdom operations. Currency GBP."
    },
    {
      id: "CoCode JP01",
      description: "Japan Operations Template",
      type: "CompanyCode",
      group: "Finance",
      color: "#06b6d4",
      sapTable: "T001",
      tcode: "OX02",
      details: "Pre-configured legal entity representing Japan Operations. Currency JPY."
    },

    // CONTROLLING (CO) ORGANIZATIONAL ELEMENTS
    {
      id: "Controlling Area A000",
      description: "Standard Controlling Area",
      type: "CompanyCode", // Silver-cyan representing administrative level
      group: "Finance",
      color: "#0891b2",
      sapTable: "T010O",
      tcode: "OX06",
      details: "Central organizational unit in Controlling (CO) used to structure cost accounting. Assigned to multiple Company Codes (including 1710 and 1010) using CO Chart of Accounts YCOA."
    },

    // PROCUREMENT / PURCHASING ORGS
    {
      id: "PurchOrg 1710",
      description: "US Purchasing Org",
      type: "PurchOrg",
      group: "Procurement",
      color: "#10b981",
      sapTable: "T024E",
      tcode: "OX08",
      details: "Handles purchasing negotiations and vendor contract sign-offs for US entities. Mapped to Company Code 1710."
    },
    {
      id: "PurchOrg 1010",
      description: "DE Purchasing Org",
      type: "PurchOrg",
      group: "Procurement",
      color: "#10b981",
      sapTable: "T024E",
      tcode: "OX08",
      details: "Handles purchasing negotiations and vendor contract sign-offs for Germany/EU entities. Mapped to Company Code 1010."
    },
    {
      id: "PurchGroup US1",
      description: "US Direct Materials Procurement",
      type: "PurchGroup",
      group: "Procurement",
      color: "#10b981",
      sapTable: "T024",
      tcode: "OME4",
      details: "Buyer group responsible for daily procurement of raw and direct materials in the US."
    },
    {
      id: "PurchGroup DE1",
      description: "DE Capital & Service Procurement",
      type: "PurchGroup",
      group: "Procurement",
      color: "#10b981",
      sapTable: "T024",
      tcode: "OME4",
      details: "Buyer group responsible for capital expenditures and services in Germany."
    },

    // SALES & DISTRIBUTION
    {
      id: "SalesOrg 1710",
      description: "US Sales Organization",
      type: "SalesOrg",
      group: "Sales",
      color: "#ec4899",
      sapTable: "TVKO",
      tcode: "OVX5",
      details: "Handles customer billing, product distribution, and liability for sales transactions in the United States."
    },
    {
      id: "SalesOrg 1010",
      description: "Germany Sales Organization",
      type: "SalesOrg",
      group: "Sales",
      color: "#ec4899",
      sapTable: "TVKO",
      tcode: "OVX5",
      details: "Handles domestic and EU product distribution, credit control, and billing for German operations."
    },
    {
      id: "DistrChannel 10",
      description: "Direct Sales (Retail/Online)",
      type: "DistrChannel",
      group: "Sales",
      color: "#ec4899",
      sapTable: "TVCO",
      tcode: "OVXI",
      details: "Represents the direct-to-customer channel, including corporate retail and online storefronts."
    },
    {
      id: "DistrChannel 20",
      description: "Wholesale Distribution Channel",
      type: "DistrChannel",
      group: "Sales",
      color: "#ec4899",
      sapTable: "TVCO",
      tcode: "OVXI",
      details: "Represents B2B bulk transactions, reseller accounts, and distributor contracts."
    },
    {
      id: "Division 00",
      description: "Cross-Product Division",
      type: "Division",
      group: "Sales",
      color: "#ec4899",
      sapTable: "TSPA",
      tcode: "OVXB",
      details: "Common division grouping representing general products and services."
    },
    {
      id: "SalesArea US-Direct",
      description: "US Sales Area (1710-10-00)",
      type: "SalesArea",
      group: "Sales",
      color: "#ec4899",
      sapTable: "TVTA",
      tcode: "OVXG",
      details: "The official combination of Sales Org 1710, Channel 10, Division 00 used to scope sales records and customer master data."
    },
    {
      id: "SalesArea DE-Whs",
      description: "DE Sales Area (1010-20-00)",
      type: "SalesArea",
      group: "Sales",
      color: "#ec4899",
      sapTable: "TVTA",
      tcode: "OVXG",
      details: "The official combination of Sales Org 1010, Channel 20, Division 00 used to scope wholesale records in Germany."
    },

    // LOGISTICS & PRODUCTION / PLANTS (Representing all respective regional S/4HANA Plants)
    {
      id: "Plant 1710",
      description: "Austin Production HQ",
      type: "Plant",
      group: "Logistics",
      color: "#a855f7",
      sapTable: "T001W",
      tcode: "OX10",
      details: "Primary US plant. Configured for production planning, raw materials inventory, and assembly."
    },
    {
      id: "Plant 1720",
      description: "Palo Alto R&D Site",
      type: "Plant",
      group: "Logistics",
      color: "#a855f7",
      sapTable: "T001W",
      tcode: "OX10",
      details: "Secondary US plant focusing on specialized software, testing, and engineering change notices."
    },
    {
      id: "Plant 1010",
      description: "Hamburg Manufacturing Plant",
      type: "Plant",
      group: "Logistics",
      color: "#a855f7",
      sapTable: "T001W",
      tcode: "OX10",
      details: "Primary German production plant, covering heavy assembly, batches, and EU logistics operations."
    },
    {
      id: "Plant 0001",
      description: "Walldorf Corporate Plant",
      type: "Plant",
      group: "Logistics",
      color: "#a855f7",
      sapTable: "T001W",
      tcode: "OX10",
      details: "Default plant associated with German headquarters 0001. Typically used for test configurations."
    },
    {
      id: "Plant IN01",
      description: "Bangalore Manufacturing Site",
      type: "Plant",
      group: "Logistics",
      color: "#a855f7",
      sapTable: "T001W",
      tcode: "OX10",
      details: "Primary production plant representing Indian domestic manufacturing operations."
    },
    {
      id: "Plant FR01",
      description: "Paris Assembly Plant",
      type: "Plant",
      group: "Logistics",
      color: "#a855f7",
      sapTable: "T001W",
      tcode: "OX10",
      details: "French plant set up for localized final packaging, quality assurance, and distribution."
    },
    {
      id: "Plant GB01",
      description: "London Logistics Site",
      type: "Plant",
      group: "Logistics",
      color: "#a855f7",
      sapTable: "T001W",
      tcode: "OX10",
      details: "United Kingdom shipping plant and warehousing node supporting local operations."
    },
    {
      id: "Plant JP01",
      description: "Tokyo Assembly Plant",
      type: "Plant",
      group: "Logistics",
      color: "#a855f7",
      sapTable: "T001W",
      tcode: "OX10",
      details: "Japan regional plant configured for localized electronics assemblies and customer shipments."
    },

    // LOCAL LOGISTICS SITES (Storage Locations / Shipping Points)
    {
      id: "StorageLoc 171A",
      description: "Austin Raw Materials (171A)",
      type: "StorageLoc",
      group: "Logistics",
      color: "#a855f7",
      sapTable: "T001L",
      tcode: "OX09",
      details: "Dedicated physical storage location in Austin for raw components, steel, and electronics."
    },
    {
      id: "StorageLoc 171B",
      description: "Austin Finished Goods (171B)",
      type: "StorageLoc",
      group: "Logistics",
      color: "#a855f7",
      sapTable: "T001L",
      tcode: "OX09",
      details: "Dedicated physical storage location in Austin for completed products waiting for shipping."
    },
    {
      id: "StorageLoc 101A",
      description: "Hamburg Central Inventory (101A)",
      type: "StorageLoc",
      group: "Logistics",
      color: "#a855f7",
      sapTable: "T001L",
      tcode: "OX09",
      details: "Primary storage warehouse for German operations, covering spare parts and finished goods."
    },
    {
      id: "ShippingPoint 1710",
      description: "Austin Rail & Truck Gate",
      type: "ShippingPoint",
      group: "Logistics",
      color: "#a855f7",
      sapTable: "TVST",
      tcode: "OVXD",
      details: "The physical logistics hub responsible for calculating shipping durations and loading operations in US Plant 1710."
    },
    {
      id: "ShippingPoint 1010",
      description: "Hamburg Port Dock Gate",
      type: "ShippingPoint",
      group: "Logistics",
      color: "#a855f7",
      sapTable: "TVST",
      tcode: "OVXD",
      details: "The logistics node managing marine containers and freight trucks loading at German Plant 1010."
    },

    // PLANT MAINTENANCE & OPERATIONS
    {
      id: "MaintPlanning 1710",
      description: "US Maintenance Planning",
      type: "MaintPlanning",
      group: "Maintenance",
      color: "#f59e0b",
      sapTable: "T399I",
      tcode: "OIOA",
      details: "Responsible for defining preventive maintenance programs, task lists, and work schedules for US facilities."
    },
    {
      id: "MaintPlanning 1010",
      description: "DE Maintenance Planning",
      type: "MaintPlanning",
      group: "Maintenance",
      color: "#f59e0b",
      sapTable: "T399I",
      tcode: "OIOA",
      details: "Responsible for engineering schedules and safety inspections at the Hamburg Plant."
    },
    {
      id: "WorkCenter WC-ASSEM1",
      description: "US Assembly Work Center",
      type: "WorkCenter",
      group: "Maintenance",
      color: "#f59e0b",
      sapTable: "CRHD",
      tcode: "CR01",
      details: "Physical node representing the main assembly line. Controls capacity formulas and machine/labor costing rates."
    },
    {
      id: "WorkCenter WC-MACH1",
      description: "DE Heavy Machining Work Center",
      type: "WorkCenter",
      group: "Maintenance",
      color: "#f59e0b",
      sapTable: "CRHD",
      tcode: "CR01",
      details: "Capacity work center representing heavy CNC milling machinery in Germany."
    },
    {
      id: "MaintGroup PM-US",
      description: "US Maintenance Engineers",
      type: "WorkCenter",
      group: "Maintenance",
      color: "#f59e0b",
      sapTable: "T352G",
      tcode: "OIOB",
      details: "Tech crew group responding to emergency equipment breakdowns and standard PM schedules in US Plant 1710."
    },

    // MASTER DATA (ENRICHED WITH FI/CO CORE MASTER ENTITIES)
    {
      id: "G/L COA YCOA",
      description: "Financial Chart of Accounts (COA)",
      type: "MasterData",
      group: "Master",
      color: "#3b82f6",
      sapTable: "T004",
      tcode: "OB13",
      details: "Chart of Accounts containing global definitions of all G/L accounts. Mapped to Controlling Area and Company Codes."
    },
    {
      id: "G/L Account Master (SKA1/SKB1)",
      description: "General Ledger Accounts Master",
      type: "MasterData",
      group: "Master",
      color: "#3b82f6",
      sapTable: "SKA1",
      tcode: "FS00",
      details: "General Ledger Accounts defined globally at the Chart of Accounts level (SKA1) and configured locally at the Company Code level (SKB1) to scope balance sheet and P&L bookings."
    },
    {
      id: "Cost Center Master (CSKS)",
      description: "Controlling Cost Centers Master",
      type: "MasterData",
      group: "Master",
      color: "#3b82f6",
      sapTable: "CSKS",
      tcode: "KS01",
      details: "Organizational units within a Controlling Area representing defined areas of cost responsibility. Mapped to plants and standard cost accounting hierarchies."
    },
    {
      id: "Profit Center Master (CEPC)",
      description: "Profit Centers Master Data",
      type: "MasterData",
      group: "Master",
      color: "#3b82f6",
      sapTable: "CEPC",
      tcode: "KE01",
      details: "Management-oriented organizational units in Controlling used for internal profitability reporting and balance sheet valuation."
    },
    {
      id: "Customer Master (KNA1)",
      description: "Global Customer Registry",
      type: "MasterData",
      group: "Master",
      color: "#3b82f6",
      sapTable: "KNA1",
      tcode: "BP",
      details: "Stores general and credit data for clients. Synced with Sales Areas to establish customer terms."
    },
    {
      id: "Supplier Master (LFA1)",
      description: "Global Vendor Registry",
      type: "MasterData",
      group: "Master",
      color: "#3b82f6",
      sapTable: "LFA1",
      tcode: "BP",
      details: "Stores credentials, bank accounts, and purchasing terms for materials suppliers."
    },
    {
      id: "Material Master (MARA)",
      description: "Central Material Master",
      type: "MasterData",
      group: "Master",
      color: "#3b82f6",
      sapTable: "MARA",
      tcode: "MM01",
      details: "Central repository containing global settings (weight, units, category) for parts, raw elements, and finished products."
    },
    {
      id: "Equipment Master (EQUI)",
      description: "Plant Equipment Assets",
      type: "MasterData",
      group: "Master",
      color: "#3b82f6",
      sapTable: "EQUI",
      tcode: "IE01",
      details: "Individual, physical assets (e.g. pumps, trucks, servers) tracked for breakdown maintenance and depreciation."
    },

    // TRANSACTION DATA (ENRICHED WITH FI/CO LEDGER POSTINGS)
    {
      id: "Journal Items (ACDOCA)",
      description: "Universal Journal Ledger Entries",
      type: "TransactionData",
      group: "Transaction",
      color: "#ef4444",
      sapTable: "ACDOCA",
      tcode: "GD20",
      details: "Universal Journal ledger table in S/4HANA (ACDOCA). Holds all standard posting entries, combining General Ledger, Controlling, Asset Accounting, and Material Ledger in a single unified schema."
    },
    {
      id: "G/L Document Segment (BSEG)",
      description: "Traditional Document Segment Postings",
      type: "TransactionData",
      group: "Transaction",
      color: "#ef4444",
      sapTable: "BSEG",
      tcode: "FB03",
      details: "Accounting Document Segment (BSEG) line items. Traditional entry table capturing balance sheet segments, customer, and vendor open postings."
    },
    {
      id: "Sales Orders (VBAK)",
      description: "Sales Order Documents",
      type: "TransactionData",
      group: "Transaction",
      color: "#ef4444",
      sapTable: "VBAK",
      tcode: "VA01",
      details: "Documents agreements to deliver goods to customers. Mapped to Sales Areas and Customers."
    },
    {
      id: "Purchase Orders (EKKO)",
      description: "Purchase Order Documents",
      type: "TransactionData",
      group: "Transaction",
      color: "#ef4444",
      sapTable: "EKKO",
      tcode: "ME21N",
      details: "Legally binding procurement documents requesting parts/services from Vendors under Purchasing Orgs."
    },
    {
      id: "Production Orders (AUFK)",
      description: "Shop Floor Production Orders",
      type: "TransactionData",
      group: "Transaction",
      color: "#ef4444",
      sapTable: "AUFK",
      tcode: "CO01",
      details: "Controls internal plant processes, components, labor costs, and scheduling for active manufacturing."
    },
    {
      id: "Maintenance Orders (PM)",
      description: "Equipment Work Orders",
      type: "TransactionData",
      group: "Transaction",
      color: "#ef4444",
      sapTable: "AUFK",
      tcode: "IW31",
      details: "Work orders authorizing technicians to execute service and repairs on Equipment, collecting maintenance costs."
    }
  ],
  links: [
    // Client to ALL Company Codes (T001)
    { source: "Client 100", target: "CoCode 1710", type: "ClientLink", color: "rgba(255, 255, 255, 0.8)", sapTable: "T001" },
    { source: "Client 100", target: "CoCode 1010", type: "ClientLink", color: "rgba(255, 255, 255, 0.8)", sapTable: "T001" },
    { source: "Client 100", target: "CoCode 0001", type: "ClientLink", color: "rgba(255, 255, 255, 0.8)", sapTable: "T001" },
    { source: "Client 100", target: "CoCode 0003", type: "ClientLink", color: "rgba(255, 255, 255, 0.8)", sapTable: "T001" },
    { source: "Client 100", target: "CoCode IN01", type: "ClientLink", color: "rgba(255, 255, 255, 0.8)", sapTable: "T001" },
    { source: "Client 100", target: "CoCode FR01", type: "ClientLink", color: "rgba(255, 255, 255, 0.8)", sapTable: "T001" },
    { source: "Client 100", target: "CoCode GB01", type: "ClientLink", color: "rgba(255, 255, 255, 0.8)", sapTable: "T001" },
    { source: "Client 100", target: "CoCode JP01", type: "ClientLink", color: "rgba(255, 255, 255, 0.8)", sapTable: "T001" },

    // Client to Controlling Area (OX06)
    { source: "Client 100", target: "Controlling Area A000", type: "ClientLink", color: "rgba(255, 255, 255, 0.8)", sapTable: "T010O" },

    // Controlling Area to Company Codes (OX19)
    { source: "Controlling Area A000", target: "CoCode 1710", type: "CoToFin", color: "#0891b2", sapTable: "T001" },
    { source: "Controlling Area A000", target: "CoCode 1010", type: "CoToFin", color: "#0891b2", sapTable: "T001" },

    // Company Codes to purchasing Orgs
    { source: "CoCode 1710", target: "PurchOrg 1710", type: "FinToProc", color: "#06b6d4", sapTable: "T024E" },
    { source: "CoCode 1010", target: "PurchOrg 1010", type: "FinToProc", color: "#06b6d4", sapTable: "T024E" },
    
    // Company Codes to sales Orgs
    { source: "CoCode 1710", target: "SalesOrg 1710", type: "FinToSales", color: "#06b6d4", sapTable: "TVKO" },
    { source: "CoCode 1010", target: "SalesOrg 1010", type: "FinToSales", color: "#06b6d4", sapTable: "TVKO" },

    // Purchasing Mappings
    { source: "PurchOrg 1710", target: "PurchGroup US1", type: "ProcToGroup", color: "#10b981", sapTable: "T024" },
    { source: "PurchOrg 1010", target: "PurchGroup DE1", type: "ProcToGroup", color: "#10b981", sapTable: "T024" },

    // Sales Area Construct mappings
    { source: "SalesOrg 1710", target: "SalesArea US-Direct", type: "SalesToArea", color: "#ec4899", sapTable: "TVTA" },
    { source: "DistrChannel 10", target: "SalesArea US-Direct", type: "SalesToArea", color: "#ec4899", sapTable: "TVTA" },
    { source: "Division 00", target: "SalesArea US-Direct", type: "SalesToArea", color: "#ec4899", sapTable: "TVTA" },

    { source: "SalesOrg 1010", target: "SalesArea DE-Whs", type: "SalesToArea", color: "#ec4899", sapTable: "TVTA" },
    { source: "DistrChannel 20", target: "SalesArea DE-Whs", type: "SalesToArea", color: "#ec4899", sapTable: "TVTA" },
    { source: "Division 00", target: "SalesArea DE-Whs", type: "SalesToArea", color: "#ec4899", sapTable: "TVTA" },

    // MAPPINGS BETWEEN ALL COMPANY CODES AND REGIONAL PLANTS
    { source: "CoCode 1710", target: "Plant 1710", type: "FinToLog", color: "#06b6d4", sapTable: "T001W" },
    { source: "CoCode 1710", target: "Plant 1720", type: "FinToLog", color: "#06b6d4", sapTable: "T001W" },
    { source: "CoCode 1010", target: "Plant 1010", type: "FinToLog", color: "#06b6d4", sapTable: "T001W" },
    { source: "CoCode 0001", target: "Plant 0001", type: "FinToLog", color: "#06b6d4", sapTable: "T001W" },
    { source: "CoCode IN01", target: "Plant IN01", type: "FinToLog", color: "#06b6d4", sapTable: "T001W" },
    { source: "CoCode FR01", target: "Plant FR01", type: "FinToLog", color: "#06b6d4", sapTable: "T001W" },
    { source: "CoCode GB01", target: "Plant GB01", type: "FinToLog", color: "#06b6d4", sapTable: "T001W" },
    { source: "CoCode JP01", target: "Plant JP01", type: "FinToLog", color: "#06b6d4", sapTable: "T001W" },

    // Plant to Storage Locations
    { source: "Plant 1710", target: "StorageLoc 171A", type: "LogToLoc", color: "#a855f7", sapTable: "T001L" },
    { source: "Plant 1710", target: "StorageLoc 171B", type: "LogToLoc", color: "#a855f7", sapTable: "T001L" },
    { source: "Plant 1010", target: "StorageLoc 101A", type: "LogToLoc", color: "#a855f7", sapTable: "T001L" },

    // Plant to Shipping Points
    { source: "Plant 1710", target: "ShippingPoint 1710", type: "LogToShip", color: "#a855f7", sapTable: "TVSTZ" },
    { source: "Plant 1010", target: "ShippingPoint 1010", type: "LogToShip", color: "#a855f7", sapTable: "TVSTZ" },

    // Plant to Maintenance Planner
    { source: "Plant 1710", target: "MaintPlanning 1710", type: "LogToMaint", color: "#a855f7", sapTable: "T399I" },
    { source: "Plant 1010", target: "MaintPlanning 1010", type: "LogToMaint", color: "#a855f7", sapTable: "T399I" },

    // Plant/Maint Planning to Work Centers / Teams
    { source: "Plant 1710", target: "WorkCenter WC-ASSEM1", type: "LogToWC", color: "#a855f7", sapTable: "CRHD" },
    { source: "Plant 1010", target: "WorkCenter WC-MACH1", type: "LogToWC", color: "#a855f7", sapTable: "CRHD" },
    { source: "MaintPlanning 1710", target: "MaintGroup PM-US", type: "MaintToGroup", color: "#f59e0b", sapTable: "T352G" },

    // ----------------------------------------------------
    // MASTER DATA RELATIONSHIPS (FI/CO STRUCTURE COMPLETE RELATIONSHIPS)
    // ----------------------------------------------------
    
    // G/L Chart of Accounts assigned to Company Codes
    { source: "CoCode 1710", target: "G/L COA YCOA", type: "FinToMaster", color: "#3b82f6", sapTable: "T001" },
    { source: "CoCode 1010", target: "G/L COA YCOA", type: "FinToMaster", color: "#3b82f6", sapTable: "T001" },

    // Controlling Area assigned to Chart of Accounts (OB62)
    { source: "Controlling Area A000", target: "G/L COA YCOA", type: "CoToMaster", color: "#3b82f6", sapTable: "T004" },

    // G/L Chart of Accounts defines G/L Account Master
    { source: "G/L COA YCOA", target: "G/L Account Master (SKA1/SKB1)", type: "MasterToMaster", color: "#3b82f6", sapTable: "SKA1" },
    { source: "CoCode 1710", target: "G/L Account Master (SKA1/SKB1)", type: "FinToMaster", color: "#3b82f6", sapTable: "SKB1" },
    { source: "CoCode 1010", target: "G/L Account Master (SKA1/SKB1)", type: "FinToMaster", color: "#3b82f6", sapTable: "SKB1" },

    // Controlling Area defines Cost Center Master
    { source: "Controlling Area A000", target: "Cost Center Master (CSKS)", type: "CoToMaster", color: "#3b82f6", sapTable: "CSKS" },
    
    // Controlling Area defines Profit Center Master
    { source: "Controlling Area A000", target: "Profit Center Master (CEPC)", type: "CoToMaster", color: "#3b82f6", sapTable: "CEPC" },
    
    // Cost Center linked to Plants (Operational Cost accounting allocation)
    { source: "Plant 1710", target: "Cost Center Master (CSKS)", type: "LogToMaster", color: "#3b82f6", sapTable: "CSKS" },
    { source: "Plant 1010", target: "Cost Center Master (CSKS)", type: "LogToMaster", color: "#3b82f6", sapTable: "CSKS" },

    // Profit Center linked to G/L Accounts (Accounting responsibility reporting)
    { source: "Profit Center Master (CEPC)", target: "G/L Account Master (SKA1/SKB1)", type: "MasterToMaster", color: "#3b82f6", sapTable: "SKB1" },

    // Customer to Sales Area & CoCode
    { source: "SalesArea US-Direct", target: "Customer Master (KNA1)", type: "SalesToMaster", color: "#3b82f6", sapTable: "KNVV" },
    { source: "CoCode 1710", target: "Customer Master (KNA1)", type: "FinToMaster", color: "#3b82f6", sapTable: "KNB1" },

    // Vendor to Purch Org & CoCode
    { source: "PurchOrg 1710", target: "Supplier Master (LFA1)", type: "ProcToMaster", color: "#3b82f6", sapTable: "LFM1" },
    { source: "CoCode 1710", target: "Supplier Master (LFA1)", type: "FinToMaster", color: "#3b82f6", sapTable: "LFB1" },

    // Material Master linked to ALL Plants via MARC (S/4HANA global stock separation)
    { source: "Plant 1710", target: "Material Master (MARA)", type: "LogToMaster", color: "#3b82f6", sapTable: "MARC" },
    { source: "Plant 1720", target: "Material Master (MARA)", type: "LogToMaster", color: "#3b82f6", sapTable: "MARC" },
    { source: "Plant 1010", target: "Material Master (MARA)", type: "LogToMaster", color: "#3b82f6", sapTable: "MARC" },
    { source: "Plant 0001", target: "Material Master (MARA)", type: "LogToMaster", color: "#3b82f6", sapTable: "MARC" },
    { source: "Plant IN01", target: "Material Master (MARA)", type: "LogToMaster", color: "#3b82f6", sapTable: "MARC" },
    { source: "Plant FR01", target: "Material Master (MARA)", type: "LogToMaster", color: "#3b82f6", sapTable: "MARC" },
    { source: "Plant GB01", target: "Material Master (MARA)", type: "LogToMaster", color: "#3b82f6", sapTable: "MARC" },
    { source: "Plant JP01", target: "Material Master (MARA)", type: "LogToMaster", color: "#3b82f6", sapTable: "MARC" },

    { source: "SalesArea US-Direct", target: "Material Master (MARA)", type: "SalesToMaster", color: "#3b82f6", sapTable: "MVKE" },

    // Equipment to Work Centers & Planning
    { source: "WorkCenter WC-ASSEM1", target: "Equipment Master (EQUI)", type: "MaintToMaster", color: "#3b82f6", sapTable: "CRHD" },
    { source: "MaintPlanning 1710", target: "Equipment Master (EQUI)", type: "MaintToMaster", color: "#3b82f6", sapTable: "EFIH" },

    // ----------------------------------------------------
    // TRANSACTION DATA RELATIONSHIPS (DE & US complete flow integration)
    // ----------------------------------------------------

    // Universal Journal (ACDOCA) connects to G/L Accounts and Company Codes
    { source: "G/L Account Master (SKA1/SKB1)", target: "Journal Items (ACDOCA)", type: "MasterToTx", color: "#ef4444", sapTable: "ACDOCA" },
    { source: "CoCode 1710", target: "Journal Items (ACDOCA)", type: "FinToTx", color: "#ef4444", sapTable: "ACDOCA" },
    { source: "CoCode 1010", target: "Journal Items (ACDOCA)", type: "FinToTx", color: "#ef4444", sapTable: "ACDOCA" },

    // Accounting Document Segment (BSEG) connects to G/L Accounts and Company Codes
    { source: "G/L Account Master (SKA1/SKB1)", target: "G/L Document Segment (BSEG)", type: "MasterToTx", color: "#ef4444", sapTable: "BSEG" },
    { source: "CoCode 1710", target: "G/L Document Segment (BSEG)", type: "FinToTx", color: "#ef4444", sapTable: "BSEG" },
    { source: "CoCode 1010", target: "G/L Document Segment (BSEG)", type: "FinToTx", color: "#ef4444", sapTable: "BSEG" },

    // Universal Journal integrates traditional BSEG line entries in S/4HANA
    { source: "G/L Document Segment (BSEG)", target: "Journal Items (ACDOCA)", type: "TxToTx", color: "#ef4444", sapTable: "ACDOCA" },

    // Sales Orders connect to Sales Area and Customer Master
    { source: "SalesArea US-Direct", target: "Sales Orders (VBAK)", type: "SalesToTx", color: "#ef4444", sapTable: "VBAK" },
    { source: "SalesArea DE-Whs", target: "Sales Orders (VBAK)", type: "SalesToTx", color: "#ef4444", sapTable: "VBAK" },
    { source: "Customer Master (KNA1)", target: "Sales Orders (VBAK)", type: "MasterToTx", color: "#ef4444", sapTable: "VBAK" },

    // Purchase Orders connect to Purch Orgs and Vendor Master
    { source: "PurchOrg 1710", target: "Purchase Orders (EKKO)", type: "ProcToTx", color: "#ef4444", sapTable: "EKKO" },
    { source: "PurchOrg 1010", target: "Purchase Orders (EKKO)", type: "ProcToTx", color: "#ef4444", sapTable: "EKKO" },
    { source: "Supplier Master (LFA1)", target: "Purchase Orders (EKKO)", type: "MasterToTx", color: "#ef4444", sapTable: "EKKO" },

    // Production Orders connect to Plant and Material Master
    { source: "Plant 1710", target: "Production Orders (AUFK)", type: "LogToTx", color: "#ef4444", sapTable: "AFKO" },
    { source: "Material Master (MARA)", target: "Production Orders (AUFK)", type: "MasterToTx", color: "#ef4444", sapTable: "AFKO" },

    // Maintenance Orders connect to Planning and Equipment
    { source: "MaintPlanning 1710", target: "Maintenance Orders (PM)", type: "MaintToTx", color: "#ef4444", sapTable: "AFIH" },
    { source: "Equipment Master (EQUI)", target: "Maintenance Orders (PM)", type: "MasterToTx", color: "#ef4444", sapTable: "AFIH" }
  ]
};
