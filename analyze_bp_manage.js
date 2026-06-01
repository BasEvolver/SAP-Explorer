const fs = require('fs');
const content = fs.readFileSync('ODATA_FM_BP_CORE_MANAGE_SRV_metadata.xml', 'utf8');

// Find all EntitySets
const matches = [];
const regex = /<EntitySet\s+[^>]*Name="([^"]+)"[^>]*>/g;
let match;
while ((match = regex.exec(content)) !== null) {
    matches.push(match[1]);
}

console.log(`Found ${matches.length} EntitySets:`);
console.log(matches);

// Find updatable EntitySets
const updatableRegex = /<EntitySet\s+[^>]*Name="([^"]+)"[^>]*sap:updatable="true"[^>]*>/g;
const updatableSets = [];
while ((match = updatableRegex.exec(content)) !== null) {
    updatableSets.push(match[1]);
}
console.log(`\nFound ${updatableSets.length} updatable EntitySets:`);
console.log(updatableSets);

// Let's print properties of BusinessPartner or similar EntityType if it exists
const entityTypeRegex = /<EntityType\s+[^>]*Name="([^"]+)"[\s\S]*?<\/EntityType>/gi;
const types = [];
while ((match = entityTypeRegex.exec(content)) !== null) {
    types.push(match[1]);
}
console.log(`\nFound EntityTypes:`, types);
