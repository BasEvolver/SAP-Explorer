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
            // Remove quotes if present
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
            envLocal[key] = value;
        }
    });
}

const baseUrl = envLocal.SAP_BASE_URL || "https://108.142.112.116:44301/sap/opu/odata/sap";
const user = envLocal.SAP_USER || "Bas";
const pass = envLocal.SAP_PASSWORD || "Aria1234";
const authHeader = 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64');

function odataQuery(apiPath, filters = "") {
    return new Promise((resolve, reject) => {
        const urlStr = `${baseUrl}/${apiPath}?$format=json${filters}`;
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
        req.setTimeout(15000, () => req.destroy(new Error("Timeout")));
        req.end();
    });
}

async function run() {
    try {
        console.log("Checking Live Customers...");
        const res = await odataQuery("API_BUSINESS_PARTNER/A_Customer", "&$top=10");
        console.log("Success! Found:", res?.d?.results?.length);
        res.d.results.forEach(row => {
            console.log(` - ID: ${row.Customer}, Name: ${row.CustomerName}`);
        });
    } catch (e) {
        console.error("Customers query failed:", e.message);
    }

    try {
        console.log("\nChecking Live Suppliers...");
        const res = await odataQuery("API_BUSINESS_PARTNER/A_Supplier", "&$top=10");
        console.log("Success! Found:", res?.d?.results?.length);
        res.d.results.forEach(row => {
            console.log(` - ID: ${row.Supplier}, Name: ${row.SupplierName}`);
        });
    } catch (e) {
        console.error("Suppliers query failed:", e.message);
    }
}

run();
