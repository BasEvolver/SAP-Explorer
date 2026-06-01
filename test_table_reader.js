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

async function querySAPTable(tableName, options = "") {
    const top = 100;
    const skip = 0;
    const encodedOptions = encodeURIComponent(options);
    const filters = `&$filter=QueryTable eq '${tableName}' and Text eq '${encodedOptions}' and Rowcount eq ${top} and Rowskips eq ${skip}`;
    
    try {
        const response = await odataQuery("Z_TABLE_READER_SRV/TableDataSet", filters);
        const results = response.d?.results || [];
        return results.map(row => row.Wa || "");
    } catch (e) {
        console.error(`Error querying ${tableName}:`, e.message);
        return [];
    }
}

async function run() {
    console.log("Querying KNA1 (Customers) via Z_TABLE_READER_SRV...");
    const kna1Rows = await querySAPTable("KNA1");
    console.log(`Success! Found: ${kna1Rows.length} customer rows.`);
    kna1Rows.slice(0, 15).forEach(row => {
        console.log(`Customer Row:`, row);
    });

    console.log("\nQuerying LFA1 (Suppliers) via Z_TABLE_READER_SRV...");
    const lfa1Rows = await querySAPTable("LFA1");
    console.log(`Success! Found: ${lfa1Rows.length} supplier rows.`);
    lfa1Rows.slice(0, 15).forEach(row => {
        console.log(`Supplier Row:`, row);
    });
}

run();
