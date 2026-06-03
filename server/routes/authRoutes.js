const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware.js");
const {
  registerUser,
  handleLogin,
  logoutUser,
  getUser,
} = require("../controllers/authController");

// POST /api/auth/register
router.post("/register", registerUser);
router.post("/login", handleLogin);
router.post("/logout", logoutUser);
router.get("/profile", authMiddleware, getUser);
module.exports = router;
