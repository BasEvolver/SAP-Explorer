export interface FlowNode {
  id: string;
  description: string;
  type: 'MasterData' | 'TransactionData';
  group: 'Master' | 'Transaction';
  color: string;
  flowSeq: number;
  yOffset: number;
  sapTable?: string;
  tcode?: string;
  details?: string;
}

export interface FlowLink {
  source: string;
  target: string;
  type: string;
  color?: string;
  sapTable?: string;
}

export interface ObjectFlowData {
  nodes: FlowNode[];
  links: FlowLink[];
}

// 1. Procure-to-Pay (Procurement) Lifecycle Flow Dataset
export const procureToPayData: ObjectFlowData = {
  nodes: [
    {
      id: "Material Master (MARA)",
      description: "S/4HANA Central Material Master",
      type: "MasterData",
      group: "Master",
      color: "#3b82f6",
      flowSeq: 0,
      yOffset: -70,
      sapTable: "MARA",
      tcode: "MM03",
      details: "MARA defines the global physical attributes of stockable goods. Linked with plants via MARC to scope inventory valuation, standard pricing, and material class groups."
    },
    {
      id: "Supplier Master (LFA1)",
      description: "Global Vendor Master Register",
      type: "MasterData",
      group: "Master",
      color: "#3b82f6",
      flowSeq: 0,
      yOffset: 70,
      sapTable: "LFA1",
      tcode: "BP",
      details: "LFA1 holds central vendor records (address, bank accounts, tax numbers). Synced locally via LFB1 (Company Code) and LFM1 (Purchasing Org) to support AP invoicing and procurement validation."
    },
    {
      id: "Purchase Info Record (EINA)",
      description: "Supplier-Material Price Agreements",
      type: "MasterData",
      group: "Master",
      color: "#3b82f6",
      flowSeq: 1,
      yOffset: 0,
      sapTable: "EINA",
      tcode: "ME13",
      details: "EINA/EINE establishes a solid link between a material and a specific vendor, containing customized pricing schemas, delivery times, and buyer control data."
    },
    {
      id: "Outline Agreement (EKKO/EKPO)",
      description: "Long-Term Scheduling Contracts",
      type: "TransactionData",
      group: "Transaction",
      color: "#ef4444",
      flowSeq: 2,
      yOffset: -70,
      sapTable: "EKKO",
      tcode: "ME33K",
      details: "Standard quantity or value agreements defining long-term supplier commit volumes. Outlines terms for recurring shipments and pricing discounts."
    },
    {
      id: "Purchase Requisition (EBAN)",
      description: "Internal Material Demands",
      type: "TransactionData",
      group: "Transaction",
      color: "#ef4444",
      flowSeq: 2,
      yOffset: 70,
      sapTable: "EBAN",
      tcode: "ME53N",
      details: "EBAN captures internal department shopping cart requests, MRP planned order conversions, or plant maintenance requirements waiting for procurement approval."
    },
    {
      id: "Delivery Schedule (EKET)",
      description: "Outline Contract Delivery Schedules",
      type: "TransactionData",
      group: "Transaction",
      color: "#ef4444",
      flowSeq: 3,
      yOffset: -70,
      sapTable: "EKET",
      tcode: "ME38",
      details: "EKET maps physical schedule release lines (quantities and required delivery dates) derived directly from active outline scheduling contracts."
    },
    {
      id: "Purchase Order (EKKO)",
      description: "Standard External Purchase Orders",
      type: "TransactionData",
      group: "Transaction",
      color: "#ef4444",
      flowSeq: 4,
      yOffset: 0,
      sapTable: "EKKO",
      tcode: "ME23N",
      details: "EKKO represents the binding external commercial order issued to the vendor, specifying quantities, delivery dates, tax codes, and payment terms."
    },
    {
      id: "Goods Receipt (MSEG)",
      description: "Stock Intake & Goods Receipt Documents",
      type: "TransactionData",
      group: "Transaction",
      color: "#ef4444",
      flowSeq: 5,
      yOffset: -50,
      sapTable: "MSEG",
      tcode: "MIGO",
      details: "Captures physical warehouse intake of materials (Movement Type 101). Increases inventory valuations, adjusts plant stock, and posts a GR/IR clearing balance to the ledger."
    },
    {
      id: "Invoice Verification (RBKP)",
      description: "Supplier Invoices (Logistics Verification)",
      type: "TransactionData",
      group: "Transaction",
      color: "#ef4444",
      flowSeq: 6,
      yOffset: -50,
      sapTable: "RBKP",
      tcode: "MIRO",
      details: "Captures supplier invoices (RBKP/RSEG) and performs three-way match checks (PO quantity vs GR quantity vs Invoice price) before authorizing accounts payable bookings."
    },
    {
      id: "Accounts Payable (BSEG)",
      description: "Supplier Liability Open Postings",
      type: "TransactionData",
      group: "Transaction",
      color: "#ef4444",
      flowSeq: 7,
      yOffset: 0,
      sapTable: "BSEG",
      tcode: "FBL1N",
      details: "Captured in BSEG as open liability postings against the vendor's subledger. Controlled by credit terms and aging limits prior to cash settlement execution."
    },
    {
      id: "Outgoing Payments (REGUP)",
      description: "Outgoing Cash Payments & Settled Items",
      type: "TransactionData",
      group: "Transaction",
      color: "#ef4444",
      flowSeq: 8,
      yOffset: 0,
      sapTable: "REGUP",
      tcode: "F110",
      details: "Outgoing payment clearing documents representing bank wire transfers or checks generated by standard S/4HANA automatic payment runs (F110). Settles vendor liabilities."
    },
    {
      id: "G/L Ledger Postings (ACDOCA)",
      description: "Universal Journal Postings (FI/CO)",
      type: "TransactionData",
      group: "Transaction",
      color: "#ef4444",
      flowSeq: 9,
      yOffset: 0,
      sapTable: "ACDOCA",
      tcode: "GD20",
      details: "Universal journal database (ACDOCA). Records accounting line entries along every step (GR inventory adjustments, GR/IR clears, AP liabilities, and cash outgoing payouts)."
    }
  ],
  links: [
    { source: "Material Master (MARA)", target: "Purchase Info Record (EINA)", type: "MasterFlow", color: "#3b82f6" },
    { source: "Supplier Master (LFA1)", target: "Purchase Info Record (EINA)", type: "MasterFlow", color: "#3b82f6" },
    { source: "Purchase Info Record (EINA)", target: "Outline Agreement (EKKO/EKPO)", type: "ContractFlow", color: "#3b82f6" },
    { source: "Purchase Requisition (EBAN)", target: "Purchase Order (EKKO)", type: "DocFlow", color: "#ef4444" },
    { source: "Outline Agreement (EKKO/EKPO)", target: "Delivery Schedule (EKET)", type: "DocFlow", color: "#ef4444" },
    { source: "Delivery Schedule (EKET)", target: "Purchase Order (EKKO)", type: "DocFlow", color: "#ef4444" },
    { source: "Purchase Order (EKKO)", target: "Goods Receipt (MSEG)", type: "ProcessFlow", color: "#ef4444" },
    { source: "Goods Receipt (MSEG)", target: "Invoice Verification (RBKP)", type: "ProcessFlow", color: "#ef4444" },
    { source: "Invoice Verification (RBKP)", target: "Accounts Payable (BSEG)", type: "LedgerFlow", color: "#ef4444" },
    { source: "Accounts Payable (BSEG)", target: "Outgoing Payments (REGUP)", type: "SettleFlow", color: "#ef4444" },
    { source: "Outgoing Payments (REGUP)", target: "G/L Ledger Postings (ACDOCA)", type: "GLFlow", color: "#ef4444" },
    { source: "Goods Receipt (MSEG)", target: "G/L Ledger Postings (ACDOCA)", type: "GLFlow", color: "#ef4444" },
    { source: "Invoice Verification (RBKP)", target: "G/L Ledger Postings (ACDOCA)", type: "GLFlow", color: "#ef4444" }
  ]
};

// 2. Order-to-Cash (Sales) Lifecycle Flow Dataset
export const orderToCashData: ObjectFlowData = {
  nodes: [
    {
      id: "Customer Master (KNA1)",
      description: "Global Customer Master Register",
      type: "MasterData",
      group: "Master",
      color: "#3b82f6",
      flowSeq: 0,
      yOffset: -70,
      sapTable: "KNA1",
      tcode: "BP",
      details: "KNA1 holds global customer profile details. Mapped locally via KNB1 (Company Code) and KNVV (Sales Area) to coordinate customer accounts receivable credit checks and tax categories."
    },
    {
      id: "Material Master (MARA)",
      description: "S/4HANA Central Material Master",
      type: "MasterData",
      group: "Master",
      color: "#3b82f6",
      flowSeq: 0,
      yOffset: 70,
      sapTable: "MARA",
      tcode: "MM03",
      details: "MARA defines global item specifications, weights, and product divisions. Synced with Sales Areas via MVKE to maintain custom catalog listings and shipping configurations."
    },
    {
      id: "Cust-Mat Price Book (KNMT)",
      description: "Customer-Specific Pricing & SKUs",
      type: "MasterData",
      group: "Master",
      color: "#3b82f6",
      flowSeq: 1,
      yOffset: 0,
      sapTable: "KNMT",
      tcode: "VD53",
      details: "KNMT links customer records to catalog items. Stores customer-specific part numbers, delivery terms, and negotiated contract prices."
    },
    {
      id: "Sales Inquiry (VBAK - Inquiry)",
      description: "Customer RFQs & Inquiries",
      type: "TransactionData",
      group: "Transaction",
      color: "#ef4444",
      flowSeq: 2,
      yOffset: 0,
      sapTable: "VBAK",
      tcode: "VA13",
      details: "VBAK (Inquiry category) records non-binding customer inquiries or requests for product pricing, forming the starting point of the sales pipeline."
    },
    {
      id: "Sales Quotation (VBAK - Quote)",
      description: "Binding Pricing Quotation Proposals",
      type: "TransactionData",
      group: "Transaction",
      color: "#ef4444",
      flowSeq: 3,
      yOffset: 0,
      sapTable: "VBAK",
      tcode: "VA23",
      details: "VBAK (Quotation category) represents a binding contract offer issued to the customer, defining product pricing, validity date limits, and shipping durations."
    },
    {
      id: "Sales Order (VBAK - Order)",
      description: "Standard Sales Orders",
      type: "TransactionData",
      group: "Transaction",
      color: "#ef4444",
      flowSeq: 4,
      yOffset: 0,
      sapTable: "VBAK",
      tcode: "VA03",
      details: "VBAK (Order category) represents the legally binding commercial commitment placed by the customer, triggering inventory checks and outbound logistics scheduling."
    },
    {
      id: "Outbound Delivery (LIKP)",
      description: "Outbound Shipping Deliveries",
      type: "TransactionData",
      group: "Transaction",
      color: "#ef4444",
      flowSeq: 5,
      yOffset: -50,
      sapTable: "LIKP",
      tcode: "VL03N",
      details: "LIKP coordinates picking, packing, and loading operations in the warehouse. Feeds shipping point logistics calculations."
    },
    {
      id: "Goods Issue (WBSG)",
      description: "Warehouse Goods Issue Clearance",
      type: "TransactionData",
      group: "Transaction",
      color: "#ef4444",
      flowSeq: 6,
      yOffset: -50,
      sapTable: "MSEG",
      tcode: "VL02N",
      details: "Captures the physical dispatch and ownership transfer of inventory. Relieves warehouse stocks, recalculates stock values, and schedules billing cycles."
    },
    {
      id: "Billing Document / Invoice (VBRK)",
      description: "Customer Billing Invoices",
      type: "TransactionData",
      group: "Transaction",
      color: "#ef4444",
      flowSeq: 7,
      yOffset: 0,
      sapTable: "VBRK",
      tcode: "VF03",
      details: "VBRK represents the customer commercial invoice document. Details revenues, calculated value-added tax rates, and routes open balances to accounts receivable."
    },
    {
      id: "Accounts Receivable (BSEG - AR)",
      description: "Customer Open Balance Postings",
      type: "TransactionData",
      group: "Transaction",
      color: "#ef4444",
      flowSeq: 8,
      yOffset: 0,
      sapTable: "BSEG",
      tcode: "FBL5N",
      details: "Tracks open debit items against customer subledgers (BSEG). Monitored by sales credit control area for payment compliance."
    },
    {
      id: "Payment Receipt (BSEG - Settle)",
      description: "Customer Cash Payments & Clearings",
      type: "TransactionData",
      group: "Transaction",
      color: "#ef4444",
      flowSeq: 9,
      yOffset: 0,
      sapTable: "BSEG",
      tcode: "F-28",
      details: "Payment clearing documents representing incoming customer checks, wire transfers, or credit clearances. settles open customer receivables."
    },
    {
      id: "G/L Ledger Postings (ACDOCA)",
      description: "Universal Journal Postings (FI/CO)",
      type: "TransactionData",
      group: "Transaction",
      color: "#ef4444",
      flowSeq: 10,
      yOffset: 0,
      sapTable: "ACDOCA",
      tcode: "GD20",
      details: "Universal journal ledger (ACDOCA). Captures active ledger postings for Cost of Goods Sold (COGS), inventory clearings, accounts receivable assets, and cash intake accounts."
    }
  ],
  links: [
    { source: "Customer Master (KNA1)", target: "Cust-Mat Price Book (KNMT)", type: "MasterFlow", color: "#3b82f6" },
    { source: "Material Master (MARA)", target: "Cust-Mat Price Book (KNMT)", type: "MasterFlow", color: "#3b82f6" },
    { source: "Cust-Mat Price Book (KNMT)", target: "Sales Inquiry (VBAK - Inquiry)", type: "DocFlow", color: "#3b82f6" },
    { source: "Sales Inquiry (VBAK - Inquiry)", target: "Sales Quotation (VBAK - Quote)", type: "DocFlow", color: "#ef4444" },
    { source: "Sales Quotation (VBAK - Quote)", target: "Sales Order (VBAK - Order)", type: "DocFlow", color: "#ef4444" },
    { source: "Sales Order (VBAK - Order)", target: "Outbound Delivery (LIKP)", type: "ProcessFlow", color: "#ef4444" },
    { source: "Outbound Delivery (LIKP)", target: "Goods Issue (WBSG)", type: "ProcessFlow", color: "#ef4444" },
    { source: "Goods Issue (WBSG)", target: "Billing Document / Invoice (VBRK)", type: "ProcessFlow", color: "#ef4444" },
    { source: "Billing Document / Invoice (VBRK)", target: "Accounts Receivable (BSEG - AR)", type: "LedgerFlow", color: "#ef4444" },
    { source: "Billing Document / Invoice (VBRK)", target: "G/L Ledger Postings (ACDOCA)", type: "GLFlow", color: "#ef4444" },
    { source: "Accounts Receivable (BSEG - AR)", target: "Payment Receipt (BSEG - Settle)", type: "SettleFlow", color: "#ef4444" },
    { source: "Payment Receipt (BSEG - Settle)", target: "G/L Ledger Postings (ACDOCA)", type: "GLFlow", color: "#ef4444" }
  ]
};

// 3. Production Planning (PP) & Manufacturing Lifecycle Dataset
export const productionPlanningData: ObjectFlowData = {
  nodes: [
    {
      id: "Material Master (MARA)",
      description: "S/4HANA Central Material Master",
      type: "MasterData",
      group: "Master",
      color: "#3b82f6",
      flowSeq: 0,
      yOffset: -70,
      sapTable: "MARA",
      tcode: "MM03",
      details: "MARA defines global physical attributes, material types (ROH/FERT/HALB), and planning categories. Linked locally to production plants via table MARC."
    },
    {
      id: "Capacity Work Center (CRHD)",
      description: "Production Work Center & Machine Capacities",
      type: "MasterData",
      group: "Master",
      color: "#3b82f6",
      flowSeq: 0,
      yOffset: 70,
      sapTable: "CRHD",
      tcode: "CR03",
      details: "CRHD holds capacity profiles, cost centers, labor allocations, and machine capacities for capacity planning and routing operations."
    },
    {
      id: "Bill of Materials (MAST/STKO)",
      description: "Material Bill of Materials (BOM) & Components",
      type: "MasterData",
      group: "Master",
      color: "#3b82f6",
      flowSeq: 1,
      yOffset: 0,
      sapTable: "MAST",
      tcode: "CS03",
      details: "MAST/STKO lists all physical raw material components, quantities, and operational items required to produce a finished or semi-finished parent material."
    },
    {
      id: "Material Demand (MD04/EBAN)",
      description: "MRP Material Requisition Demands",
      type: "TransactionData",
      group: "Transaction",
      color: "#a855f7",
      flowSeq: 2,
      yOffset: 0,
      sapTable: "EBAN",
      tcode: "MD04",
      details: "MRP runs (MD01N/MD04) generate demands or purchase requisitions (EBAN) when physical stock levels drop below safety requirements."
    },
    {
      id: "Planned Order (PLAF)",
      description: "MRP Planned Production Proposals",
      type: "TransactionData",
      group: "Transaction",
      color: "#a855f7",
      flowSeq: 3,
      yOffset: 0,
      sapTable: "PLAF",
      tcode: "MD13",
      details: "PLAF represents a planned order proposal generated automatically by S/4HANA MRP runs. Serves as a draft before converting into a physical production order."
    },
    {
      id: "Production Order (AUFK/AFKO)",
      description: "Released Production Orders",
      type: "TransactionData",
      group: "Transaction",
      color: "#a855f7",
      flowSeq: 4,
      yOffset: 0,
      sapTable: "AUFK",
      tcode: "CO03",
      details: "AUFK/AFKO represents the released discrete manufacturing order, containing routing schedules, planned costs, and clearance states."
    },
    {
      id: "Component Reservation (RESB)",
      description: "Stock Reservations for Production",
      type: "TransactionData",
      group: "Transaction",
      color: "#a855f7",
      flowSeq: 5,
      yOffset: -50,
      sapTable: "RESB",
      tcode: "MB25",
      details: "RESB reserves specific raw component quantities in inventory for production orders, ensuring material stock is allocated prior to job runs."
    },
    {
      id: "Manufacturing Confirmation (AFRU)",
      description: "Production Confirmation & Yield Postings",
      type: "TransactionData",
      group: "Transaction",
      color: "#a855f7",
      flowSeq: 6,
      yOffset: 0,
      sapTable: "AFRU",
      tcode: "CO11N",
      details: "AFRU captures actual manufacturing confirmation (yield, scrap, labor time, machine durations). Posts activity cost and finished stock receipt (Movement 101)."
    },
    {
      id: "G/L Ledger Postings (ACDOCA)",
      description: "Universal Journal Ledger Postings (FI/CO)",
      type: "TransactionData",
      group: "Transaction",
      color: "#ef4444",
      flowSeq: 7,
      yOffset: 0,
      sapTable: "ACDOCA",
      tcode: "GD20",
      details: "Universal journal database (ACDOCA). Records material cost postings, labor cost settlements, inventory receipts, and overhead variances."
    }
  ],
  links: [
    { source: "Material Master (MARA)", target: "Bill of Materials (MAST/STKO)", type: "MasterFlow", color: "#3b82f6" },
    { source: "Capacity Work Center (CRHD)", target: "Bill of Materials (MAST/STKO)", type: "MasterFlow", color: "#3b82f6" },
    { source: "Bill of Materials (MAST/STKO)", target: "Material Demand (MD04/EBAN)", type: "DemandFlow", color: "#3b82f6" },
    { source: "Material Demand (MD04/EBAN)", target: "Planned Order (PLAF)", type: "DraftFlow", color: "#a855f7" },
    { source: "Planned Order (PLAF)", target: "Production Order (AUFK/AFKO)", type: "ConvertFlow", color: "#a855f7" },
    { source: "Production Order (AUFK/AFKO)", target: "Component Reservation (RESB)", type: "ReserveFlow", color: "#a855f7" },
    { source: "Component Reservation (RESB)", target: "Manufacturing Confirmation (AFRU)", type: "ProcessFlow", color: "#a855f7" },
    { source: "Manufacturing Confirmation (AFRU)", target: "G/L Ledger Postings (ACDOCA)", type: "GLFlow", color: "#a855f7" }
  ]
};

// 4. Plant Maintenance (PM) & Enterprise Asset Lifecycle Dataset
export const plantMaintenanceData: ObjectFlowData = {
  nodes: [
    {
      id: "Equipment Master (EQUI)",
      description: "S/4HANA Physical Equipment Master",
      type: "MasterData",
      group: "Master",
      color: "#3b82f6",
      flowSeq: 0,
      yOffset: -70,
      sapTable: "EQUI",
      tcode: "IE03",
      details: "EQUI holds central records for physical machinery, vehicles, or assets. Tracks technical status, warranty dates, serial numbers, and maintenance schedules."
    },
    {
      id: "Functional Location (IFLOT)",
      description: "Asset Spatial/Functional Location Hierarchies",
      type: "MasterData",
      group: "Master",
      color: "#3b82f6",
      flowSeq: 0,
      yOffset: 70,
      sapTable: "IFLOT",
      tcode: "IL03",
      details: "IFLOT maps physical or functional plant locations (e.g. Building 5, Line A). Organizes spatial structures where Equipment resides."
    },
    {
      id: "Capacity Work Center (CRHD)",
      description: "Maintenance Capacity Planning Work Centers",
      type: "MasterData",
      group: "Master",
      color: "#3b82f6",
      flowSeq: 1,
      yOffset: 0,
      sapTable: "CRHD",
      tcode: "CR03",
      details: "CRHD represents mechanical, electrical, or planning groups responsible for executing scheduled maintenance orders."
    },
    {
      id: "Maintenance Notification (VIQMEL)",
      description: "Asset Defect & Maintenance Notifications",
      type: "TransactionData",
      group: "Transaction",
      color: "#f97316",
      flowSeq: 2,
      yOffset: 0,
      sapTable: "QMEL",
      tcode: "IW23",
      details: "VIQMEL/QMEL documents asset issues, breakdown details, item malfunctions, and damage categories to schedule corrective action."
    },
    {
      id: "Maintenance Order (AUFK/AFIH)",
      description: "Scheduled Corrective Maintenance Orders",
      type: "TransactionData",
      group: "Transaction",
      color: "#f97316",
      flowSeq: 3,
      yOffset: 0,
      sapTable: "AFIH",
      tcode: "IW33",
      details: "AFIH/AUFK details physical work packages, parts checklists, labor assignments, planned durations, and safety requirements to restore asset operation."
    },
    {
      id: "Maint Purchase Requisition (EBAN)",
      description: "Internal Spare Parts Purchase Demands",
      type: "TransactionData",
      group: "Transaction",
      color: "#f97316",
      flowSeq: 4,
      yOffset: -50,
      sapTable: "EBAN",
      tcode: "ME53N",
      details: "EBAN generates requisition requests for spare parts or external repair services not currently stocked in the local plant inventory."
    },
    {
      id: "Maint Confirmation (AFRU)",
      description: "Asset Maintenance Confirmed Labor Yields",
      type: "TransactionData",
      group: "Transaction",
      color: "#f97316",
      flowSeq: 5,
      yOffset: 0,
      sapTable: "AFRU",
      tcode: "IW41",
      details: "AFRU confirms actual maintenance activities (labor hours, completed checklists, replaced parts) and returns equipment back to operational status."
    },
    {
      id: "G/L Ledger Postings (ACDOCA)",
      description: "Universal Journal Ledger Postings (FI/CO)",
      type: "TransactionData",
      group: "Transaction",
      color: "#ef4444",
      flowSeq: 6,
      yOffset: 0,
      sapTable: "ACDOCA",
      tcode: "GD20",
      details: "Universal journal ledger database (ACDOCA). Distributes maintenance costs, spare parts expenses, and external service liabilities directly to the G/L cost ledger."
    }
  ],
  links: [
    { source: "Equipment Master (EQUI)", target: "Maintenance Notification (VIQMEL)", type: "AssetFlow", color: "#3b82f6" },
    { source: "Functional Location (IFLOT)", target: "Maintenance Notification (VIQMEL)", type: "AssetFlow", color: "#3b82f6" },
    { source: "Capacity Work Center (CRHD)", target: "Maintenance Notification (VIQMEL)", type: "AssetFlow", color: "#3b82f6" },
    { source: "Maintenance Notification (VIQMEL)", target: "Maintenance Order (AUFK/AFIH)", type: "DocFlow", color: "#f97316" },
    { source: "Maintenance Order (AUFK/AFIH)", target: "Maint Purchase Requisition (EBAN)", type: "ProcessFlow", color: "#f97316" },
    { source: "Maint Purchase Requisition (EBAN)", target: "Maint Confirmation (AFRU)", type: "ProcessFlow", color: "#f97316" },
    { source: "Maint Confirmation (AFRU)", target: "G/L Ledger Postings (ACDOCA)", type: "GLFlow", color: "#f97316" }
  ]
};

// 5. Quality Management (QM) & Quality Inspection Lifecycle Dataset
export const qualityManagementData: ObjectFlowData = {
  nodes: [
    {
      id: "Material Master (MARA)",
      description: "S/4HANA Central Material Master",
      type: "MasterData",
      group: "Master",
      color: "#3b82f6",
      flowSeq: 0,
      yOffset: -70,
      sapTable: "MARA",
      tcode: "MM03",
      details: "MARA defines central physical settings. Integrates quality details via view 'Quality Management' (MARA/MARC) to coordinate automatic lot routing."
    },
    {
      id: "Inspection Plan (PLMK)",
      description: "Quality Inspection Plans & Characteristics",
      type: "MasterData",
      group: "Master",
      color: "#3b82f6",
      flowSeq: 1,
      yOffset: 0,
      sapTable: "PLMK",
      tcode: "QP03",
      details: "PLMK defines inspection steps, qualitative/quantitative check points (e.g. diameter, purity), sampling rates, and testing equipment setups."
    },
    {
      id: "Inspection Lot (QALS)",
      description: "Inspection Lots & Quality Records",
      type: "TransactionData",
      group: "Transaction",
      color: "#eab308",
      flowSeq: 2,
      yOffset: 0,
      sapTable: "QALS",
      tcode: "QA03",
      details: "QALS represents the inspection lot record generated automatically during goods intake or manufacturing completion. Blocks stock until usage decision approval."
    },
    {
      id: "Inspection Results (QASER)",
      description: "Qualitative/Quantitative Check Points Results",
      type: "TransactionData",
      group: "Transaction",
      color: "#eab308",
      flowSeq: 3,
      yOffset: 0,
      sapTable: "QASER",
      tcode: "QE51N",
      details: "QASER captures measured laboratory characteristics and attributes (e.g. purity = 99.8%) and performs safety boundary checks."
    },
    {
      id: "Usage Decision (QAVE)",
      description: "Quality Usage Decisions & Clearances",
      type: "TransactionData",
      group: "Transaction",
      color: "#eab308",
      flowSeq: 4,
      yOffset: 0,
      sapTable: "QAVE",
      tcode: "QA13",
      details: "QAVE records the formal usage release (Usage Decision) authorizing stock movement, generating quality scores, or routing rejects."
    },
    {
      id: "Stock Transfer (MSEG)",
      description: "Inventory Postings & Quality Stock Clearances",
      type: "TransactionData",
      group: "Transaction",
      color: "#eab308",
      flowSeq: 5,
      yOffset: -50,
      sapTable: "MSEG",
      tcode: "MIGO",
      details: "Stock movement ledger (MSEG). Releases material from Quality Inspection (Stock type 2) into Unrestricted Stock (Stock type 1) following usage approval."
    },
    {
      id: "Quality Notification (QMEL)",
      description: "Quality Malfunctions & Rejection Claims",
      type: "TransactionData",
      group: "Transaction",
      color: "#eab308",
      flowSeq: 5,
      yOffset: 50,
      sapTable: "QMEL",
      tcode: "QM03",
      details: "QMEL records customer rejection complaints or vendor non-conformance defects if the usage decision fails. coordinates corrective actions."
    },
    {
      id: "G/L Ledger Postings (ACDOCA)",
      description: "Universal Journal Ledger Postings (FI/CO)",
      type: "TransactionData",
      group: "Transaction",
      color: "#ef4444",
      flowSeq: 6,
      yOffset: 0,
      sapTable: "ACDOCA",
      tcode: "GD20",
      details: "Universal journal ledger (ACDOCA). Records material scrap expenses, quality control cost accruals, and audit ledger bookings."
    }
  ],
  links: [
    { source: "Material Master (MARA)", target: "Inspection Plan (PLMK)", type: "MasterFlow", color: "#3b82f6" },
    { source: "Inspection Plan (PLMK)", target: "Inspection Lot (QALS)", type: "DocFlow", color: "#3b82f6" },
    { source: "Inspection Lot (QALS)", target: "Inspection Results (QASER)", type: "ProcessFlow", color: "#eab308" },
    { source: "Inspection Results (QASER)", target: "Usage Decision (QAVE)", type: "ProcessFlow", color: "#eab308" },
    { source: "Usage Decision (QAVE)", target: "Stock Transfer (MSEG)", type: "ClearFlow", color: "#eab308" },
    { source: "Usage Decision (QAVE)", target: "Quality Notification (QMEL)", type: "RejectFlow", color: "#eab308" },
    { source: "Stock Transfer (MSEG)", target: "G/L Ledger Postings (ACDOCA)", type: "GLFlow", color: "#eab308" }
  ]
};

// 6. Human Resources & Workforce Time Sheet Allocation (HR/HCM) Dataset
export const humanResourcesData: ObjectFlowData = {
  nodes: [
    {
      id: "Employee Record (PA0001)",
      description: "S/4HANA Employee Master Inforecords",
      type: "MasterData",
      group: "Master",
      color: "#3b82f6",
      flowSeq: 0,
      yOffset: -70,
      sapTable: "PA0001",
      tcode: "PA30",
      details: "PA0001/PA0002 holds employee personnel data, bank accounts, and corporate assignments (Company Code, Cost Center) in S/4HANA Personnel Management."
    },
    {
      id: "Organizational Position (HRP1000)",
      description: "Enterprise Positions & Hierarchies",
      type: "MasterData",
      group: "Master",
      color: "#3b82f6",
      flowSeq: 0,
      yOffset: 70,
      sapTable: "HRP1000",
      tcode: "PPOME",
      details: "HRP1000 defines corporate structures, job descriptions, employee hierarchical reporting paths, and operational roles."
    },
    {
      id: "Capacity Work Center (CRHD)",
      description: "Personnel Work Centers & Labor Profiles",
      type: "MasterData",
      group: "Master",
      color: "#3b82f6",
      flowSeq: 1,
      yOffset: 0,
      sapTable: "CRHD",
      tcode: "CR03",
      details: "CRHD represents active personnel, labor rate classes, and available planning capacities assigned to physical operational modules."
    },
    {
      id: "Time Sheet Entries (CATSDB)",
      description: "CATS Cross-Application Labor Time Sheets",
      type: "TransactionData",
      group: "Transaction",
      color: "#10b981",
      flowSeq: 2,
      yOffset: 0,
      sapTable: "CATSDB",
      tcode: "CAT2",
      details: "CATSDB represents the S/4HANA central database recording daily operational labor allocations against cost centers, production jobs, or projects."
    },
    {
      id: "Payroll Run (PAYR)",
      description: "HR Personnel Payroll Runs",
      type: "TransactionData",
      group: "Transaction",
      color: "#10b981",
      flowSeq: 3,
      yOffset: 0,
      sapTable: "PAYR",
      tcode: "PC00_M99_CALC",
      details: "S/4HANA central payroll clusters (PCL1/PCL2/PAYR) calculate gross/net wages, health benefits, tax liabilities, and payroll checks."
    },
    {
      id: "G/L Ledger Postings (ACDOCA)",
      description: "Universal Journal Ledger Postings (FI/CO)",
      type: "TransactionData",
      group: "Transaction",
      color: "#ef4444",
      flowSeq: 4,
      yOffset: 0,
      sapTable: "ACDOCA",
      tcode: "GD20",
      details: "Universal journal ledger database (ACDOCA). Captures payroll wage distributions, tax payables liability clearings, and cost center labor overheads."
    }
  ],
  links: [
    { source: "Employee Record (PA0001)", target: "Time Sheet Entries (CATSDB)", type: "LaborFlow", color: "#3b82f6" },
    { source: "Organizational Position (HRP1000)", target: "Time Sheet Entries (CATSDB)", type: "LaborFlow", color: "#3b82f6" },
    { source: "Capacity Work Center (CRHD)", target: "Time Sheet Entries (CATSDB)", type: "LaborFlow", color: "#3b82f6" },
    { source: "Time Sheet Entries (CATSDB)", target: "Payroll Run (PAYR)", type: "DocFlow", color: "#10b981" },
    { source: "Payroll Run (PAYR)", target: "G/L Ledger Postings (ACDOCA)", type: "GLFlow", color: "#10b981" }
  ]
};

// Combined Enterprise-Wide Object Flow Dataset (Full View)
export const allObjectFlowData: ObjectFlowData = (() => {
  const allNodes: FlowNode[] = [];
  const addedNodeIds = new Set<string>();

  const datasets = [
    procureToPayData,
    orderToCashData,
    productionPlanningData,
    plantMaintenanceData,
    qualityManagementData,
    humanResourcesData
  ];

  datasets.forEach(dataset => {
    dataset.nodes.forEach(node => {
      if (!addedNodeIds.has(node.id)) {
        addedNodeIds.add(node.id);
        allNodes.push({ ...node });
      }
    });
  });

  const allLinks: FlowLink[] = [];
  const addedLinkKeys = new Set<string>();

  datasets.forEach(dataset => {
    dataset.links.forEach(link => {
      const src = typeof link.source === 'object' ? (link.source as any).id : link.source;
      const tgt = typeof link.target === 'object' ? (link.target as any).id : link.target;
      const key = `${src}->${tgt}`;
      if (!addedLinkKeys.has(key)) {
        addedLinkKeys.add(key);
        allLinks.push({ ...link });
      }
    });
  });

  return {
    nodes: allNodes,
    links: allLinks
  };
})();

