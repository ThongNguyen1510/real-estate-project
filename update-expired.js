const sql = require("mssql");

// Database configuration
const dbConfig = {
  user: "sa",
  password: "Thong15102004",
  server: "localhost",
  port: 1433,
  database: "RealEstateDB",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

async function updateExpiredProperties() {
  try {
    console.log('Connecting to database...');
    await sql.connect(dbConfig);
    console.log('Connected successfully');
    
    // Check for properties with expired dates but not marked as expired
    const checkQuery = `
      SELECT id, title, status, expires_at
      FROM Properties
      WHERE 
        status = 'available' 
        AND expires_at IS NOT NULL 
        AND expires_at < GETDATE()
    `;
    
    const checkResult = await sql.query(checkQuery);
    console.log(`Found ${checkResult.recordset.length} properties that need to be marked as expired`);
    
    if (checkResult.recordset.length > 0) {
      console.log('Properties to be updated:');
      console.table(checkResult.recordset);
    }
    
    // Update properties to 'expired' status
    const updateQuery = `
      UPDATE Properties
      SET status = 'expired'
      WHERE 
        status = 'available' 
        AND expires_at IS NOT NULL 
        AND expires_at < GETDATE()
    `;
    
    const updateResult = await sql.query(updateQuery);
    console.log(`Successfully marked ${updateResult.rowsAffected[0]} properties as expired`);
    
    // Verify update
    const verifyQuery = `
      SELECT id, title, status, expires_at
      FROM Properties
      WHERE status = 'expired'
    `;
    
    const verifyResult = await sql.query(verifyQuery);
    console.log(`Total expired properties in system: ${verifyResult.recordset.length}`);
    
    if (verifyResult.recordset.length > 0) {
      console.log('Current expired properties:');
      console.table(verifyResult.recordset);
    }
    
  } catch (error) {
    console.error('Error updating expired properties:', error);
  } finally {
    sql.close();
  }
}

// Run the function
updateExpiredProperties(); 