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

function makeRequest(urlStr, accept = 'application/xml') {
    return new Promise((resolve, reject) => {
        console.log(`Querying: ${urlStr}`);
        const url = new URL(urlStr);
        
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: 'GET',
            headers: {
                'Authorization': authHeader,
                'Accept': accept
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
                    resolve(data);
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.setTimeout(35000, () => req.destroy(new Error("Timeout")));
        req.end();
    });
}

async function run() {
    const service = "ODATA_FM_BP_CORE_MANAGE_SRV";
    try {
        console.log(`--- Fetching metadata for ${service} ---`);
        const xml = await makeRequest(`${baseUrl}/${service}/$metadata`);
        console.log(`Success! Metadata length: ${xml.length}`);
        fs.writeFileSync(`${service}_metadata.xml`, xml, 'utf8');
        console.log(`Saved to ${service}_metadata.xml`);
    } catch (e) {
        console.error(`Metadata fetch failed for ${service}:`, e.message);
    }
}

run();
