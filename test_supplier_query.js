const https = require('https');
const fs = require('fs');
const path = require('path');

// Read .env.local
const envLocalPath = path.resolve(__dirname, '.env.local');
let envLocal = {};
if (fs.existsSync(envLocalPath)) {
    const lines = fs.readFileSync(envLocalPath, 'utf8').split('\n');
    lines.forEach(line => {
        const match = line.match(/^\s*([\w\.\-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            let key = match[1];
            let value = match[2] || '';
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
            envLocal[key] = value;
        }
    });
}

const baseUrl = envLocal.SAP_BASE_URL || "https://172.211.212.84:44301/sap/opu/odata/sap";
const user = envLocal.SAP_USER || "ARIA";
const pass = envLocal.SAP_PASSWORD || "Aria1234";
const authHeader = 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64');

function odataQuery(serviceName, collection, filters = "") {
    return new Promise((resolve, reject) => {
        const urlStr = `${baseUrl}/${serviceName}/${collection}?$format=json${filters}`;
        console.log(`Querying: ${urlStr}`);
        const url = new URL(urlStr);
        
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: 'GET',
            headers: {
                'Authorization': authHeader,
                'Accept': 'application/json'
            },
            rejectUnauthorized: false
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
                    reject(new Error(`SAP Status ${res.statusCode}: ${res.statusMessage} - ${data}`));
                } else {
                    resolve(JSON.parse(data));
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.setTimeout(12000, () => req.destroy(new Error("Timeout")));
        req.end();
    });
}

async function run() {
    const service = "MD_SUPPLIER_MASTER_SRV";
    
    // 1. Try I_Supplier
    try {
        console.log("\n--- Querying I_Supplier ---");
        const res = await odataQuery(service, "I_Supplier", "&$top=3");
        console.log("Success! Found:", res?.d?.results?.length);
        if (res?.d?.results) {
            res.d.results.forEach(row => {
                console.log(`- ID: ${row.Supplier}, Name: ${row.SupplierName || row.FullName || row.SupplierFullName}`);
                console.log("Full row keys:", Object.keys(row));
            });
        }
    } catch (e) {
        console.error("I_Supplier query failed:", e.message);
    }

    // 2. Try I_Supplier_VH
    try {
        console.log("\n--- Querying I_Supplier_VH ---");
        const res = await odataQuery(service, "I_Supplier_VH", "&$top=3");
        console.log("Success! Found:", res?.d?.results?.length);
        if (res?.d?.results) {
            res.d.results.forEach(row => {
                console.log(`- ID: ${row.Supplier}, Name: ${row.SupplierName || row.FullName || row.SupplierFullName}`);
                console.log("Full row keys:", Object.keys(row));
            });
        }
    } catch (e) {
        console.error("I_Supplier_VH query failed:", e.message);
    }
}

run();
