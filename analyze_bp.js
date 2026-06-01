const fs = require('fs');
const services = JSON.parse(fs.readFileSync('bp_services.json', 'utf8'));

// Filter for top candidates
const candidates = services.filter(s => {
    const id = s.ID.toLowerCase();
    const title = s.Title.toLowerCase();
    
    // We want primary/standard master services
    return (id.includes('business_partner') || id.includes('businesspartner') || id.includes('customer_master') || id.includes('suppliermaster') ||
           title.includes('business_partner') || title.includes('businesspartner') || title.includes('customer_master') || title.includes('suppliermaster')) ||
           (id.includes('api_') && (id.includes('customer') || id.includes('supplier') || id.includes('vendor')));
});

console.log(`Found ${candidates.length} top candidates:`);
candidates.forEach(s => {
    console.log(`- ID: ${s.ID}`);
    console.log(`  Title: ${s.Title}`);
    console.log(`  TechName: ${s.TechnicalServiceName}`);
    console.log(`  ServiceUrl: ${s.ServiceUrl}`);
    console.log('---');
});
