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
  const { priceMin, priceMax, areaMin, areaMax, property_type, bedrooms, bathrooms } = req.query;

  try {
    const pool = await connectToDatabase();
    let query = "SELECT * FROM Properties WHERE 1=1";
    const inputs = [];

    if (priceMin) {
      query += " AND price >= @priceMin";
      inputs.push({ name: "priceMin", type: sql.Decimal(18, 2), value: priceMin });
    }
    if (priceMax) {
      query += " AND price <= @priceMax";
      inputs.push({ name: "priceMax", type: sql.Decimal(18, 2), value: priceMax });
    }
    if (areaMin) {
      query += " AND area >= @areaMin";
      inputs.push({ name: "areaMin", type: sql.Decimal(18, 2), value: areaMin });
    }
    if (areaMax) {
      query += " AND area <= @areaMax";
      inputs.push({ name: "areaMax", type: sql.Decimal(18, 2), value: areaMax });
    }
    if (property_type) {
      query += " AND property_type = @property_type";
      inputs.push({ name: "property_type", type: sql.NVarChar, value: property_type });
    }
    if (bedrooms) {
      query += " AND bedrooms = @bedrooms";
      inputs.push({ name: "bedrooms", type: sql.Int, value: bedrooms });
    }
    if (bathrooms) {
      query += " AND bathrooms = @bathrooms";
      inputs.push({ name: "bathrooms", type: sql.Int, value: bathrooms });
    }

    const request = pool.request();
    inputs.forEach(input => request.input(input.name, input.type, input.value));

    const result = await request.query(query);
    res.status(200).json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getProperties: [authenticateToken, getProperties],
  addProperty: [authenticateToken, addProperty],
  updateProperty: [authenticateToken, updateProperty],
  deleteProperty: [authenticateToken, deleteProperty],
  searchProperties,
};
