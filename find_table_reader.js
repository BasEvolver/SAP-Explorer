const fs = require('fs');
const services = JSON.parse(fs.readFileSync('all_sap_services.json', 'utf8'));

const results = services.filter(s => {
    const id = (s.ID || '').toLowerCase();
    const title = (s.Title || '').toLowerCase();
    return id.includes('table') || title.includes('table') || id.includes('reader') || title.includes('reader');
});

console.log(`Found ${results.length} services matching 'table' or 'reader':`);
results.forEach(s => {
    console.log(`- ID: ${s.ID}, Title: ${s.Title}, ServiceUrl: ${s.ServiceUrl}`);
});
