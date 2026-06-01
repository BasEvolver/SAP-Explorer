const fs = require('fs');
const services = JSON.parse(fs.readFileSync('all_sap_services.json', 'utf8'));

const results = services.filter(s => {
    const id = s.ID.toLowerCase();
    const title = s.Title.toLowerCase();
    return (id.includes('supplier_master') || id.includes('suppliermaster') || 
            title.includes('supplier_master') || title.includes('suppliermaster')) ||
           (id.includes('md_') && id.includes('supplier'));
});

console.log(`Found ${results.length} supplier services:`);
results.forEach(s => {
    console.log(`- ID: ${s.ID}, Title: ${s.Title}, ServiceUrl: ${s.ServiceUrl}`);
});
