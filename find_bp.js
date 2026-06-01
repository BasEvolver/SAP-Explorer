const fs = require('fs');
const services = JSON.parse(fs.readFileSync('all_sap_services.json', 'utf8'));

const keywords = ['partner', 'customer', 'supplier', 'vendor', 'bp', 'kna1', 'lfa1'];
const results = services.filter(s => {
    const id = (s.ID || '').toLowerCase();
    const title = (s.Title || '').toLowerCase();
    const desc = (s.Description || '').toLowerCase();
    const techName = (s.TechnicalServiceName || '').toLowerCase();
    return keywords.some(k => id.includes(k) || title.includes(k) || desc.includes(k) || techName.includes(k));
});

console.log(`Found ${results.length} matching services.`);
fs.writeFileSync('bp_services.json', JSON.stringify(results, null, 2), 'utf8');
console.log('Results written to bp_services.json');
