// Script to generate SQL statements for inserting Ho Chi Minh City locations data
const fs = require('fs');
const path = require('path');
const { generateLocationInsertSQL } = require('../models/locationDataHCM');

// Generate the SQL statements
const sql = generateLocationInsertSQL();

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Write the SQL to a file
const outputFile = path.join(dataDir, 'hcmc_locations.sql');
fs.writeFileSync(outputFile, sql, 'utf8');

console.log(`Generated SQL statements saved to ${outputFile}`);
console.log(`To import the data, run this SQL file against your database.`); 