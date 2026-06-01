const fs = require('fs');
const services = JSON.parse(fs.readFileSync('bp_services.json', 'utf8'));

// Filter for top updatable/writable OData service candidates
const candidates = services.filter(s => {
    const id = s.ID.toLowerCase();
    const title = s.Title.toLowerCase();
    const serviceUrl = s.ServiceUrl || '';
    
    // We want standard or custom transactional services
    return serviceUrl.includes('/sap/opu/odata/sap/') && (
        id.includes('create') || id.includes('manage') || id.includes('maintain') || id.includes('change') ||
        title.includes('create') || title.includes('manage') || title.includes('maintain') || title.includes('change')
    );
});

console.log(`Found ${candidates.length} candidates:`);
candidates.forEach(s => {
    console.log(`- ID: ${s.ID}, Title: ${s.Title}, ServiceUrl: ${s.ServiceUrl}`);
});
