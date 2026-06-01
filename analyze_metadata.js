const fs = require('fs');
const content = fs.readFileSync('MD_CUSTOMER_MASTER_SRV_01_metadata.xml', 'utf8');

// Find all EntitySets
const matches = [];
const regex = /<EntitySet\s+[^>]*Name="([^"]+)"[^>]*>/g;
let match;
while ((match = regex.exec(content)) !== null) {
    matches.push(match[1]);
}

console.log(`Found ${matches.length} EntitySets:`);
console.log(matches.slice(0, 50));

// Also let's search for any EntityType with "Customer" or "Name" properties
const customerEntityTypeRegex = /<EntityType\s+[^>]*Name="([^"]*Customer[^"]*)"[^>]*>([\s\S]*?)<\/EntityType>/gi;
const entityTypes = [];
while ((match = customerEntityTypeRegex.exec(content)) !== null) {
    entityTypes.push(match[1]);
}
console.log(`\nFound ${entityTypes.length} EntityTypes matching "Customer":`);
console.log(entityTypes);
