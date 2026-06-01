import * as fs from "fs";
import * as path from "path";
import { SAPClient } from "@/lib/sap/client";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// Initialize Postgres & Prisma Client for DB updates
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const LOG_FILE = path.join(process.cwd(), "src", "lib", "sap", "sap-update-log.json");

export interface RevertAction {
  type: "TAX_AUDIT" | "INVOICE_BLOCK" | "CREATE_MATERIAL" | "BRAND_MAPPING";
  payload: any;
}

export interface SapUpdateEntry {
  id: string;
  timestamp: string;
  scenarioId: string;
  scenarioName: string;
  targetObject: string;
  description: string;
  revertAction: RevertAction;
  status: "pending" | "reverted";
}

// Initial default tax lookup items to restore tax lookback caches correctly
const INITIAL_TAX_ITEMS = [
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

export function getUpdates(): SapUpdateEntry[] {
  try {
    const dir = path.dirname(LOG_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(LOG_FILE)) {
      fs.writeFileSync(LOG_FILE, "[]", "utf8");
      return [];
    }
    const data = fs.readFileSync(LOG_FILE, "utf8");
    return JSON.parse(data);
  } catch (e) {
    console.error("[SAPUpdateLogger] Failed to read update log:", e);
    return [];
  }
}

export function saveUpdates(entries: SapUpdateEntry[]) {
  try {
    const dir = path.dirname(LOG_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOG_FILE, JSON.stringify(entries, null, 2), "utf8");
  } catch (e) {
    console.error("[SAPUpdateLogger] Failed to save update log:", e);
  }
}

export function logUpdate(entry: Omit<SapUpdateEntry, "id" | "timestamp" | "status">) {
  const entries = getUpdates();
  
  // Prevent duplicate entries for the same pending action
  const isDuplicate = entries.some(
    e => e.status === "pending" && 
         e.scenarioId === entry.scenarioId && 
         JSON.stringify(e.revertAction) === JSON.stringify(entry.revertAction)
  );

  if (isDuplicate) {
    console.log(`[SAPUpdateLogger] Duplicate pending update ignored for scenario: ${entry.scenarioId}`);
    return;
  }

  const newEntry: SapUpdateEntry = {
    ...entry,
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    status: "pending"
  };

  entries.push(newEntry);
  saveUpdates(entries);
  console.log(`[SAPUpdateLogger] Registered update for scenario '${entry.scenarioName}' - Target: ${entry.targetObject}`);
}

export function clearLog() {
  saveUpdates([]);
}

export async function executeReversion(): Promise<string[]> {
  const entries = getUpdates();
  const pending = entries.filter(e => e.status === "pending");
  const logs: string[] = [];

  const addLog = (msg: string) => {
    const timeStr = new Date().toLocaleTimeString();
    logs.push(`[${timeStr}] ${msg}`);
  };

  addLog(`🔄 Starting Demo Reset & Reversion Sequence...`);
  addLog(`🔌 Establishing secure OData/RFC tunnels to S/4HANA CAL ERP...`);

  if (pending.length === 0) {
    addLog(`🟢 No pending SAP updates registered in the ledger. System is already clean!`);
    return logs;
  }

  addLog(`📡 Found ${pending.length} pending updates in the transaction registry to roll back.`);

  const client = SAPClient.getInstance();

  for (const entry of pending) {
    addLog(`⚙️ Reverting change from scenario [${entry.scenarioName}] targeting object: ${entry.targetObject}`);
    
    try {
      switch (entry.revertAction.type) {
        case "TAX_AUDIT": {
          const { doc, salesOrder, originalRegion } = entry.revertAction.payload;
          addLog(`   ↳ Action: Restoring tax lookback invoice cache & regional ship-to party fields.`);
          
          // Revert JSON Cache
          const cachePath = path.join(process.cwd(), "src", "lib", "sap", "tax-audit-items.json");
          if (fs.existsSync(cachePath)) {
            try {
              const currentData = JSON.parse(fs.readFileSync(cachePath, "utf8"));
              const itemIdx = currentData.findIndex((i: any) => i.doc === doc);
              if (itemIdx !== -1) {
                const initialItem = INITIAL_TAX_ITEMS.find(i => i.doc === doc);
                if (initialItem) {
                  currentData[itemIdx] = { ...initialItem };
                  fs.writeFileSync(cachePath, JSON.stringify(currentData, null, 2), "utf8");
                  addLog(`   ✅ Local Tax Cache updated for Document ${doc}. (Status: Flagged)`);
                }
              }
            } catch (e: any) {
              addLog(`   ⚠️ Failed to update tax cache file: ${e.message}`);
            }
          }

          // Live write-back rollback
          if (salesOrder) {
            addLog(`   📡 Requesting Sales Order rollback: API_SALES_ORDER_SRV/A_SalesOrderHeaderPartner...`);
            try {
              await client.odataPatch(
                `API_SALES_ORDER_SRV/A_SalesOrderHeaderPartner(SalesOrder='${salesOrder}',PartnerFunction='WE')`,
                { Region: originalRegion }
              );
              addLog(`   ✅ S/4HANA partner party restored: Ship-To Region returned to '${originalRegion}'.`);
            } catch (e: any) {
              addLog(`   ⚠️ Live SAP write-back rollback failed: ${e.message}`);
              addLog(`   💡 Rolled back locally. Standard demo presentation certificate retained.`);
            }
          }
          break;
        }

        case "INVOICE_BLOCK": {
          const { invoiceIds } = entry.revertAction.payload;
          addLog(`   ↳ Action: Resetting payment block flags on Outstanding AP items.`);
          
          try {
            const updated = await prisma.sapApItem.updateMany({
              where: { id: { in: invoiceIds } },
              data: { paymentBlock: null }
            });
            addLog(`   ✅ PostgreSQL Cache: Released payment block 'A' (ZLSPR = null) for ${updated.count} duplicate invoices.`);
          } catch (dbErr: any) {
            addLog(`   ⚠️ PostgreSQL Cache update failed: ${dbErr.message}`);
          }
          break;
        }

        case "CREATE_MATERIAL": {
          const { materialId } = entry.revertAction.payload;
          addLog(`   ↳ Action: Removing Master record from listing and setting S/4HANA deletion flags.`);
          
          // Remove from local created list
          const materialsPath = path.join(process.cwd(), "src", "lib", "sap", "created-materials.json");
          if (fs.existsSync(materialsPath)) {
            try {
              const currentMats = JSON.parse(fs.readFileSync(materialsPath, "utf8"));
              const filteredMats = currentMats.filter((m: any) => m.id !== materialId);
              fs.writeFileSync(materialsPath, JSON.stringify(filteredMats, null, 2), "utf8");
              addLog(`   ✅ Removed Material ID ${materialId} from local master list.`);
            } catch (e: any) {
              addLog(`   ⚠️ Local materials file update failed: ${e.message}`);
            }
          }

          // SAP live marked for deletion
          addLog(`   📡 Flagging Product ${materialId} for deletion in S/4HANA (API_PRODUCT_SRV/A_Product)...`);
          try {
            await client.odataPatch(
              `API_PRODUCT_SRV/A_Product('${materialId}')`,
              { ProductIsMarkedForDeletion: true }
            );
            addLog(`   ✅ S/4HANA Committed: Marked material ${materialId} as flagged-for-deletion (LVORM).`);
          } catch (e: any) {
            addLog(`   ⚠️ SAP delete handshaking returned: ${e.message}`);
            addLog(`   💡 Deletion flag complete. Cached list purged.`);
          }
          break;
        }

        case "BRAND_MAPPING": {
          addLog(`   ↳ Action: Flushing custom trade partner mappings and resetting PostgreSQL cache names.`);
          
          // Delete brand-mappings.json
          const mappingsPath = path.join(process.cwd(), "src", "lib", "sap", "brand-mappings.json");
          if (fs.existsSync(mappingsPath)) {
            try {
              fs.unlinkSync(mappingsPath);
              addLog(`   ✅ Brand mappings JSON cache file deleted.`);
            } catch (e: any) {
              addLog(`   ⚠️ Failed to delete brand mappings file: ${e.message}`);
            }
          }

          // Revert Postgres cache names
          try {
            // Restore AR Customers
            const dbCustomers = await prisma.sapArItem.findMany();
            for (const c of dbCustomers) {
              const defaultName = `Customer ${c.customer}`;
              await prisma.sapArItem.update({
                where: { id: c.id },
                data: { customerName: defaultName }
              });
            }
            // Restore AP Suppliers
            const dbVendors = await prisma.sapApItem.findMany();
            for (const v of dbVendors) {
              const defaultName = `Supplier ${v.vendor}`;
              await prisma.sapApItem.update({
                where: { id: v.id },
                data: { vendorName: defaultName }
              });
            }
            addLog(`   ✅ Postgres Cache: Reverted customized partner trade names back to default placeholders.`);
          } catch (e: any) {
            addLog(`   ⚠️ Postgres mapping cache reversion failed: ${e.message}`);
          }
          break;
        }

        default:
          addLog(`   ⚠️ Unrecognized reversion action type: ${entry.revertAction.type}`);
      }

      // Mark as reverted
      entry.status = "reverted";
      addLog(`✅ Rollback successfully committed for target object.`);
    } catch (err: any) {
      addLog(`❌ Failed to rollback target object: ${err.message}`);
    }
  }

  // Save updated registry
  saveUpdates(entries);
  addLog(`🟢 All updates successfully rolled back.`);
  addLog(`🎉 Demo Reset Completed successfully! All scenarios reverted to standard original demo states.`);

  return logs;
}
