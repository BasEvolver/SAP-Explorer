const fs = require('fs');
const services = JSON.parse(fs.readFileSync('all_sap_services.json', 'utf8'));

const results = services.filter(s => {
    const serviceUrl = s.ServiceUrl || '';
    const id = s.ID || '';
    const isSapOdata = serviceUrl.includes('/sap/opu/odata/sap/');
    return isSapOdata && (
        id.toLowerCase().includes('customer') || 
        id.toLowerCase().includes('supplier') ||
        id.toLowerCase().includes('vendor')
    );
});

console.log(`Found ${results.length} SAP OData services matching customer/supplier/vendor:`);
results.forEach(s => {
    console.log(`- ID: ${s.ID}, Title: ${s.Title}, ServiceUrl: ${s.ServiceUrl}`);
});
