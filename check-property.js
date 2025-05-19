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

async function checkProperty() {
  try {
    await sql.connect(dbConfig);
    console.log('Connected to database');
    
    // Check property status
    const query = `
      SELECT id, title, status, expires_at, owner_id 
      FROM Properties 
      WHERE id = 51
    `;
    
    const result = await sql.query(query);
    
    if (result.recordset.length > 0) {
      console.log('Property details:');
      console.table(result.recordset);
    } else {
      console.log('Property not found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    sql.close();
  }
}

checkProperty(); 