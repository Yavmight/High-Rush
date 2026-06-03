const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware.js");
const {
  registerUser,
  handleLogin,
  logoutUser,
  getUser,
} = require("../controllers/authController");

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: All fields are required
 *       409:
 *         description: User with this username already exists
 */
router.post("/register", registerUser);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful and token cookie is created
 *       400:
 *         description: All fields are required
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", handleLogin);

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Log out the current user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful and token cookie is cleared
 */
router.post("/logout", logoutUser);

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Get the currently logged-in user
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *       401:
 *         description: No token provided or invalid token
 */
router.get("/profile", authMiddleware, getUser);

module.exports = router;
