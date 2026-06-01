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

function makeRequest(urlStr) {
    return new Promise((resolve, reject) => {
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
                    reject(new Error(`SAP Status ${res.statusCode}: ${res.statusMessage}`));
                } else {
                    resolve(JSON.parse(data));
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.setTimeout(8000, () => req.destroy(new Error("Timeout")));
        req.end();
    });
}

async function run() {
    const services = [
        { srv: "C_NOPAYMENTMETHODSUPPLIER_CDS", coll: "C_NoPaymentMethodSupplier" },
        { srv: "C_NORECNCLNACCTSUPPLIER_CDS", coll: "C_NoRecnclnAcctSupplier" },
        { srv: "C_NOTINCOCODECNTRYSUPPLIER_CDS", coll: "C_NotInCoCodeCntrySupplier" }
    ];

    for (const item of services) {
        try {
            console.log(`\nQuerying ${item.srv}/${item.coll}...`);
            const data = await makeRequest(`${baseUrl}/${item.srv}/${item.coll}?$format=json&$top=100`);
            const results = data.d?.results || [];
            console.log(`Success! Found ${results.length} rows.`);
            results.forEach(row => {
                console.log(` - Supplier: ${row.Supplier}, Name: ${row.SupplierName || row.BusinessPartnerName}`);
            });
        } catch (e) {
            console.error("Failed:", e.message);
        }
    }
}

run();
