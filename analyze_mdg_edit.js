const fs = require('fs');
const content = fs.readFileSync('MDG_EDIT_CUSTOMER_metadata.xml', 'utf8');

// Find all EntitySets
const matches = [];
const regex = /<EntitySet\s+[^>]*Name="([^"]+)"[^>]*>/g;
let match;
while ((match = regex.exec(content)) !== null) {
    matches.push(match[1]);
}

console.log(`Found ${matches.length} EntitySets:`);
console.log(matches.slice(0, 50));

// Find updatable EntitySets
const updatableRegex = /<EntitySet\s+[^>]*Name="([^"]+)"[^>]*sap:updatable="true"[^>]*>/g;
const updatableSets = [];
while ((match = updatableRegex.exec(content)) !== null) {
    updatableSets.push(match[1]);
}
console.log(`\nFound ${updatableSets.length} updatable EntitySets:`);
console.log(updatableSets);
