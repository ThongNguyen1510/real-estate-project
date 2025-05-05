const sql = require('mssql');

// Configuration for database connection - get these from your existing database config
const config = {
  user: 'sa',
  password: 'YourStrong@Passw0rd',
  server: 'localhost',
  database: 'realEstateDB',
  options: {
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

async function checkDatabase() {
  try {
    console.log('Connecting to database...');
    await sql.connect(config);
    console.log('Connected to database successfully!');

    // Check if PropertyImages table exists
    const tableCheck = await sql.query`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'PropertyImages'
    `;
    
    if (tableCheck.recordset.length === 0) {
      console.log('PropertyImages table does not exist!');
      return;
    }
    
    console.log('PropertyImages table exists');
    
    // Check for table structure
    const columns = await sql.query`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'PropertyImages'
    `;
    
    console.log('Table structure:');
    console.log(columns.recordset);
    
    // Count images
    const count = await sql.query`
      SELECT COUNT(*) as total
      FROM PropertyImages
    `;
    
    console.log(`Total images in database: ${count.recordset[0].total}`);
    
  } catch (err) {
    console.error('Database error:', err);
  } finally {
    try {
      await sql.close();
      console.log('Connection closed');
    } catch (err) {
      console.error('Error closing connection:', err);
    }
  }
}

// Run the function
checkDatabase(); 