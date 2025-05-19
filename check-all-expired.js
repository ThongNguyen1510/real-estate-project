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

async function checkAllExpiredProperties() {
  try {
    await sql.connect(dbConfig);
    console.log('Connected to database');
    
    // Check all expired properties
    const query = `
      SELECT p.id, p.title, p.status, p.expires_at, p.owner_id, u.username
      FROM Properties p
      JOIN Users u ON p.owner_id = u.id
      WHERE p.status = 'expired'
    `;
    
    const result = await sql.query(query);
    
    if (result.recordset.length > 0) {
      console.log(`Found ${result.recordset.length} expired properties:`);
      console.table(result.recordset);
    } else {
      console.log('No expired properties found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    sql.close();
  }
}

checkAllExpiredProperties(); 