const fs = require('fs');
const content = fs.readFileSync('MD_CUSTOMER_MASTER_SRV_01_metadata.xml', 'utf8');

const regex = /<EntitySet\s+[^>]*Name="([^"]+)"[^>]*sap:updatable="true"[^>]*>/g;
const updatableSets = [];
let match;
while ((match = regex.exec(content)) !== null) {
    updatableSets.push(match[1]);
}

console.log(`Found ${updatableSets.length} updatable EntitySets:`);
console.log(updatableSets.slice(0, 50));
