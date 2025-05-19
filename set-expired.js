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

async function setPropertyExpired() {
  try {
    await sql.connect(dbConfig);
    console.log('Connected to database');
    
    // Set a specific property to expired
    const updateQuery = `
      UPDATE Properties 
      SET status = 'expired', 
          expires_at = DATEADD(day, -1, GETDATE()) 
      WHERE id = 51
    `;
    
    const result = await sql.query(updateQuery);
    console.log(`Updated property: ${result.rowsAffected[0]} record(s) affected`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    sql.close();
  }
}

setPropertyExpired(); 