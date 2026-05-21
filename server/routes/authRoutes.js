const express = require("express");
const router = express.Router();
const {
  registerUser,
  handleLogin,
  logoutUser,
} = require("../controllers/authController");

// POST /api/auth/register
router.post("/register", registerUser);
router.post("/login", handleLogin);
router.post("/logout", logoutUser);

module.exports = router;
