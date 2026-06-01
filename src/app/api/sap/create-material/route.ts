import { NextRequest, NextResponse } from "next/server";
import { SAPClient } from "@/lib/sap/client";
import * as fs from "fs";
import * as path from "path";
import { logUpdate } from "@/lib/sap/update-logger";

// Path to persistent store
const STORE_DIR = path.join(process.cwd(), "src", "lib", "sap");
const STORE_FILE = path.join(STORE_DIR, "created-materials.json");

// Helper to load materials
function getCreatedMaterials(): any[] {
  try {
    if (!fs.existsSync(STORE_DIR)) {
      fs.mkdirSync(STORE_DIR, { recursive: true });
    }
    if (!fs.existsSync(STORE_FILE)) {
      fs.writeFileSync(STORE_FILE, "[]", "utf8");
      return [];
    }
    const data = fs.readFileSync(STORE_FILE, "utf8");
    return JSON.parse(data);
  } catch (e) {
    console.error("Error reading created materials:", e);
    return [];
  }
}

// Helper to save materials
function saveCreatedMaterials(materials: any[]) {
  try {
    if (!fs.existsSync(STORE_DIR)) {
      fs.mkdirSync(STORE_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(materials, null, 2), "utf8");
  } catch (e) {
    console.error("Error saving created materials:", e);
  }
}

export async function POST(req: NextRequest) {
  const logs: string[] = [];
  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    logs.push(`[${timestamp}] ${msg}`);
  };

  try {
    const body = await req.json();
    const { description, plant, materialType, uom } = body;

    if (!description || !plant || !materialType || !uom) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    addLog(`⚙️ Initializing SAP S/4HANA Master Data validation for plant scope ${plant}...`);
    addLog(`📡 Checking OData gateway status at host: 172.211.212.84...`);

    const client = SAPClient.getInstance();
    const pingResult = await client.ping();
    const isSapAlive = pingResult.status === "connected";

    if (!isSapAlive) {
      addLog(`🔴 S/4HANA CAL instance (172.211.212.84) is offline. Live creation aborted.`);
      return NextResponse.json({ 
        error: `SAP CAL S/4HANA OData Gateway is offline. Reason: ${pingResult.message || "Connection failed"}`, 
        logs 
      }, { status: 503 });
    }

    addLog(`🟢 OData Gateway is active at 172.211.212.84:44301.`);
    addLog(`🔑 Fetching CSRF Token and cookies from API_PRODUCT_SRV/ ...`);
    
    let createdId = "";
    try {
      // Build OData payload omitting the 'Product' field for internal number range assignment
      const payload = {
        ProductType: materialType,
        IndustrySector: "M", // Standard Mechanical Engineering industry sector (mandatory field MBRSH)
        BaseUnit: uom,
        to_Description: [
          {
            Language: "EN",
            ProductDescription: description
          }
        ]
      };
      
      addLog(`📦 Building SAP Master Material payload (IndustrySector: "M")...`);
      addLog(`🚀 Executing OData POST to API_PRODUCT_SRV/A_Product...`);
      
      const response = await client.odataPost("API_PRODUCT_SRV/A_Product", payload);
      
      createdId = response?.d?.Product || response?.Product || "";
      if (!createdId) {
        throw new Error("SAP did not return a valid Product ID in the response.");
      }
      
      addLog(`🟢 OData write successful! Master record ${createdId} committed in S/4HANA.`);
    } catch (postErr: any) {
      addLog(`❌ Live OData write failed: ${postErr.message}`);
      return NextResponse.json({ 
        error: `SAP S/4HANA OData Error: ${postErr.message}`, 
        logs 
      }, { status: 500 });
    }

    // Persist locally for dashboard synchronization
    const materials = getCreatedMaterials();
    const newMaterial = {
      id: createdId,
      description,
      plant,
      materialType,
      uom,
      createdAt: new Date().toISOString()
    };
    materials.push(newMaterial);
    saveCreatedMaterials(materials);

    // Register the update in our central rollback log
    logUpdate({
      scenarioId: "create-material",
      scenarioName: "Create Material Master",
      targetObject: `Material ${createdId}`,
      description: `Created material '${description}' for plant ${plant}`,
      revertAction: {
        type: "CREATE_MATERIAL",
        payload: {
          materialId: createdId
        }
      }
    });

    addLog(`🎉 Material Master creation sequence completed successfully!`);

    return NextResponse.json({
      status: "success",
      material: newMaterial,
      logs
    });

  } catch (error: any) {
    addLog(`❌ Material creation failed: ${error.message}`);
    return NextResponse.json({ error: error.message, logs }, { status: 500 });
  }
}
