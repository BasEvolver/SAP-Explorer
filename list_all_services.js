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
        const catalogUrl = `${baseUrl.replace('/sap/opu/odata/sap', '/sap/opu/odata')}/IWFND/CATALOGSERVICE;v=2/ServiceCollection?$format=json`;
        console.log("Querying Catalog Service:", catalogUrl);
        const data = await makeRequest(catalogUrl);
        const services = data.d?.results || [];
        console.log(`Successfully found ${services.length} services.`);
        
        // Log all services to a local JSON file for inspection
        fs.writeFileSync('all_sap_services.json', JSON.stringify(services, null, 2), 'utf8');
        console.log("Written all services to all_sap_services.json");

        // Filter and display some services
        const bpServices = services.filter(s => {
            const id = (s.ID || s.id || "").toLowerCase();
            const techName = (s.TechnicalName || s.technicalName || s.Title || "").toLowerCase();
            return id.includes("partner") || id.includes("customer") || id.includes("supplier") || id.includes("business") || id.includes("bp") ||
                   techName.includes("partner") || techName.includes("customer") || techName.includes("supplier") || techName.includes("business") || techName.includes("bp");
        });

        console.log(`\nFound ${bpServices.length} Partner/Customer/Supplier related services:`);
        bpServices.forEach(s => {
            console.log(`- ID: ${s.ID || s.id || 'N/A'}, Title: ${s.Title || 'N/A'}, TechName: ${s.TechnicalName || 'N/A'}`);
        });

    } catch (e) {
        console.error("Failed to query catalog service:", e.message);
    }
}

run();
