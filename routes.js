const express = require("express");
const { registerUser, loginUser } = require("./controllers/userController");
const propertyController = require("./controllers/propertyController");

const router = express.Router();

// Authentication routes
router.post("/auth/register", registerUser);
router.post("/auth/login", loginUser);

// Property routes
router.get("/properties", propertyController.getProperties);
router.post("/properties", propertyController.addProperty);
router.put("/properties/:id", propertyController.updateProperty);
router.delete("/properties/:id", propertyController.deleteProperty);

module.exports = router;
