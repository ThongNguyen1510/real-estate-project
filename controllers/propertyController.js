const { connectToDatabase, sql } = require('../config/database');
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET; // Sử dụng biến môi trường

// Middleware for authentication
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: "Access denied" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
}

// Get all properties
async function getProperties(req, res) {
  try {
    const pool = await connectToDatabase();
    const result = await pool.request().query("SELECT * FROM Properties");
    res.status(200).json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Add a new property
async function addProperty(req, res) {
  const { title, description, price, area, property_type, bedrooms, bathrooms, parking_slots, amenities, owner_id, location_id } = req.body;
  try {
    const pool = await connectToDatabase();
    await pool.request()
      .input("title", sql.NVarChar, title)
      .input("description", sql.NVarChar, description)
      .input("price", sql.Decimal(18, 2), price)
      .input("area", sql.Decimal(18, 2), area)
      .input("property_type", sql.NVarChar, property_type)
      .input("bedrooms", sql.Int, bedrooms)
      .input("bathrooms", sql.Int, bathrooms)
      .input("parking_slots", sql.Int, parking_slots)
      .input("amenities", sql.NVarChar, amenities)
      .input("owner_id", sql.Int, owner_id)
      .input("location_id", sql.Int, location_id)
      .query(`
        INSERT INTO Properties (title, description, price, area, property_type, bedrooms, bathrooms, parking_slots, amenities, owner_id, location_id)
        VALUES (@title, @description, @price, @area, @property_type, @bedrooms, @bathrooms, @parking_slots, @amenities, @owner_id, @location_id)
      `);
    res.status(201).json({ message: "Property added successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Update a property
async function updateProperty(req, res) {
  const { id } = req.params;
  const { title, description, price, area, property_type, bedrooms, bathrooms, parking_slots, amenities } = req.body;
  try {
    const pool = await connectToDatabase();
    await pool.request()
      .input("id", sql.Int, id)
      .input("title", sql.NVarChar, title)
      .input("description", sql.NVarChar, description)
      .input("price", sql.Decimal(18, 2), price)
      .input("area", sql.Decimal(18, 2), area)
      .input("property_type", sql.NVarChar, property_type)
      .input("bedrooms", sql.Int, bedrooms)
      .input("bathrooms", sql.Int, bathrooms)
      .input("parking_slots", sql.Int, parking_slots)
      .input("amenities", sql.NVarChar, amenities)
      .query(`
        UPDATE Properties
        SET title = @title, description = @description, price = @price, area = @area, property_type = @property_type, bedrooms = @bedrooms, bathrooms = @bathrooms, parking_slots = @parking_slots, amenities = @amenities
        WHERE id = @id
      `);
    res.status(200).json({ message: "Property updated successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Delete a property
async function deleteProperty(req, res) {
  const { id } = req.params;
  try {
    const pool = await connectToDatabase();
    await pool.request()
      .input("id", sql.Int, id)
      .query("DELETE FROM Properties WHERE id = @id");
    res.status(200).json({ message: "Property deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Search and filter properties
async function searchProperties(req, res) {
  const {
    city,
    district,
    ward,
    price_min,
    price_max,
    area_min,
    area_max,
    bedrooms,
    bathrooms,
    property_type,
    amenities
  } = req.query;

  try {
    const pool = await connectToDatabase();
    const request = pool.request();

    // Build SQL query dynamically
    let query = `
      SELECT p.*, l.city, l.district, l.ward, l.street
      FROM Properties p
      INNER JOIN Locations l ON p.location_id = l.id
      WHERE 1=1
    `;

    if (city) {
      query += ` AND l.city = @city`;
      request.input('city', sql.NVarChar, city);
    }
    if (district) {
      query += ` AND l.district = @district`;
      request.input('district', sql.NVarChar, district);
    }
    if (ward) {
      query += ` AND l.ward = @ward`;
      request.input('ward', sql.NVarChar, ward);
    }
    if (price_min) {
      query += ` AND p.price >= @price_min`;
      request.input('price_min', sql.Decimal(18, 2), price_min);
    }
    if (price_max) {
      query += ` AND p.price <= @price_max`;
      request.input('price_max', sql.Decimal(18, 2), price_max);
    }
    if (area_min) {
      query += ` AND p.area >= @area_min`;
      request.input('area_min', sql.Decimal(18, 2), area_min);
    }
    if (area_max) {
      query += ` AND p.area <= @area_max`;
      request.input('area_max', sql.Decimal(18, 2), area_max);
    }
    if (bedrooms) {
      query += ` AND p.bedrooms = @bedrooms`;
      request.input('bedrooms', sql.Int, bedrooms);
    }
    if (bathrooms) {
      query += ` AND p.bathrooms = @bathrooms`;
      request.input('bathrooms', sql.Int, bathrooms);
    }
    if (property_type) {
      query += ` AND p.property_type = @property_type`;
      request.input('property_type', sql.NVarChar, property_type);
    }
    if (amenities) {
      query += ` AND p.amenities LIKE @amenities`;
      request.input('amenities', sql.NVarChar, `%${amenities}%`);
    }

    const result = await request.query(query);
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error searching properties:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  getProperties: [authenticateToken, getProperties],
  addProperty: [authenticateToken, addProperty],
  updateProperty: [authenticateToken, updateProperty],
  deleteProperty: [authenticateToken, deleteProperty],
  searchProperties, // Đảm bảo hàm này được export
};
