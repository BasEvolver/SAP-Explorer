const fs = require('fs');
const content = fs.readFileSync('MD_CUSTOMER_MASTER_SRV_01_metadata.xml', 'utf8');

// Find EntityContainer and check updatable properties of I_Customer
const customerSetRegex = /<EntitySet\s+[^>]*Name="I_Customer"[^>]*>/gi;
const match = customerSetRegex.exec(content);
if (match) {
    console.log("Found EntitySet I_Customer:", match[0]);
} else {
    console.log("EntitySet I_Customer not found in metadata");
}

// Find EntityType I_CustomerType definition to see key and properties
const entityTypeRegex = /<EntityType\s+[^>]*Name="I_CustomerType"[\s\S]*?<\/EntityType>/gi;
const typeMatch = entityTypeRegex.exec(content);
if (typeMatch) {
    console.log("\nFound EntityType I_CustomerType definition (length: " + typeMatch[0].length + "):");
    // Find properties like CustomerName, CustomerFullName
    const props = [];
    const propRegex = /<Property\s+[^>]*Name="([^"]+)"[^>]*>/g;
    let propMatch;
    while ((propMatch = propRegex.exec(typeMatch[0])) !== null) {
        props.push(propMatch[1]);
    }
    console.log("Properties:", props.slice(0, 30));
    console.log("Includes CustomerName:", props.includes("CustomerName"));
    console.log("Includes CustomerFullName:", props.includes("CustomerFullName"));
} else {
    console.log("EntityType I_CustomerType not found");
}
