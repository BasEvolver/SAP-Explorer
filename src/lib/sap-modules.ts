export const sapModules = [
  {
    module: "Finance & Controlling (FI/CO)",
    icon: "Briefcase",
    submodules: [
      {
        category: "General Ledger",
        views: [
          { id: "I_GLAccountInChartOfAccounts", name: "G/L Account in Chart of Accounts", description: "Master data for General Ledger Accounts.", category: "Master Data" },
          { id: "I_ProfitCenter", name: "Profit Center", description: "Master data for Profit Centers.", category: "Master Data" },
          { id: "I_CostCenter", name: "Cost Center", description: "Master data for Cost Centers.", category: "Master Data" },
          { id: "I_JournalEntryItem", name: "Journal Entry Line Item", description: "Financial Posting line items.", category: "Transaction Data" },
        ]
      },
      {
        category: "Accounts Payable",
        views: [
          { id: "I_Supplier", name: "Supplier Master Data", description: "Master data for Suppliers (vendors).", category: "Master Data" },
          { id: "I_SupplierLineItem", name: "Supplier Line Items", description: "Vendor Open/closed Items.", category: "Transaction Data" },
          { id: "I_SupplierInvoice", name: "Supplier Invoice Header", description: "Vendor Invoice Header.", category: "Transaction Data" },
          { id: "I_SupplierInvoiceItem", name: "Supplier Invoice Line Item", description: "Vendor Invoice Line item.", category: "Transaction Data" },
        ]
      },
      {
        category: "Accounts Receivable",
        views: [
          { id: "I_Customer", name: "Customer Master Data", description: "Master Data for Customers.", category: "Master Data" },
          { id: "I_CustomerLineItem", name: "Customer Line Items", description: "Customer open/closed Items.", category: "Transaction Data" },
          { id: "I_BillingDocument", name: "Billing Document Header", description: "Customer Invoice header.", category: "Transaction Data" },
          { id: "I_BillingDocumentItem", name: "Billing Document Line Item", description: "Customer Invoice line item.", category: "Transaction Data" },
        ]
      }
    ]
  },
  {
    module: "Tax & Compliance",
    icon: "FileText",
    submodules: [
      {
        category: "Sales & Use Tax",
        views: [
          { id: "Z_SalesUseTaxLookback", name: "SUT Lookback Data", description: "Custom Audit View: Billing items joined with tax conditions.", category: "Transaction Data" },
        ]
      },
      {
        category: "VAT Registers",
        views: [
          { id: "Z_VatRegister", name: "VAT / Sales Tax Register", description: "Custom Audit View: Tax document segments with vendor/customer data.", category: "Transaction Data" },
        ]
      },
      {
        category: "Withholding Tax",
        views: [
          { id: "Z_WithholdingTax", name: "Withholding Tax Register", description: "Custom Audit View: Withholding tax items with vendor details.", category: "Transaction Data" },
        ]
      },
      {
        category: "Property Tax (Pending)",
        views: [
          { id: "pending_property_tax", name: "Property Tax Asset Register (Pending)", description: "Future View: Fixed assets, depreciation, and locations.", category: "Master Data" },
        ]
      },
      {
        category: "Exemptions (Pending)",
        views: [
          { id: "pending_exemptions", name: "Tax Exemption Certificates (Pending)", description: "Future View: Customer tax classification tracking.", category: "Master Data" },
        ]
      },
      {
        category: "Customs & Trade (Pending)",
        views: [
          { id: "pending_customs", name: "Customs & Tariffs (Pending)", description: "Future View: Import duties and commodity codes.", category: "Transaction Data" },
        ]
      }
    ]
  },
  {
    module: "Sales & Distribution (SD)",
    icon: "ShoppingCart",
    submodules: [
      {
        category: "Sales Processing",
        views: [
          { id: "I_SalesOrder", name: "Sales Order Header", description: "Customer Sales Orders.", category: "Transaction Data" },
        ]
      }
    ]
  },
  {
    module: "Materials Management (MM)",
    icon: "Package",
    submodules: [
      {
        category: "Purchasing & Inventory",
        views: [
          { id: "I_Product", name: "Material/Product Master", description: "Master data for Products.", category: "Master Data" },
          { id: "I_PurchaseOrderAPI01", name: "Purchase Order Header", description: "Purchase Order Header.", category: "Transaction Data" },
        ]
      }
    ]
  },
  {
    module: "Production & Projects",
    icon: "Factory",
    submodules: [
      {
        category: "Manufacturing",
        views: [
          { id: "I_ManufacturingOrder", name: "Production Order", description: "Manufacturing Order Header.", category: "Transaction Data" },
          { id: "I_EnterpriseProject", name: "Enterprise Project", description: "Project and WBS Elements.", category: "Master Data" },
        ]
      }
    ]
  },
  {
    module: "Human Resources (HCM)",
    icon: "Users",
    submodules: [
      {
        category: "Workforce",
        views: [
          { id: "I_WorkforcePerson", name: "Workforce Person", description: "Employee and Worker Master Data.", category: "Master Data" },
        ]
      }
    ]
  }
];
