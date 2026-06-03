const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware.js");
const {
  createScore,
  getAllScores,
  updateScore,
  deleteScore,
} = require("../controllers/leaderboardController.js");

/**
 * @swagger
 * /scores:
 *   get:
 *     summary: Get all leaderboard scores
 *     tags: [Leaderboard]
 *     responses:
 *       200:
 *         description: List of all scores
 *       500:
 *         description: Server error
 */
router.get("/scores", getAllScores);

/**
 * @swagger
 * /scores:
 *   post:
 *     summary: Submit a new race score
 *     tags: [Leaderboard]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ScoreRequest'
 *     responses:
 *       201:
 *         description: Score submitted successfully
 *       401:
 *         description: User is not logged in
 *       500:
 *         description: Server error
 */
router.post("/scores", authMiddleware, createScore);

/**
 * @swagger
 * /scores/{id}:
 *   put:
 *     summary: Update one of the logged-in user's scores
 *     tags: [Leaderboard]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Score ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ScoreRequest'
 *     responses:
 *       200:
 *         description: Score updated successfully
 *       403:
 *         description: You can only edit your own scores
 *       404:
 *         description: Score not found
 */
router.put("/scores/:id", authMiddleware, updateScore);

/**
 * @swagger
 * /scores/{id}:
 *   delete:
 *     summary: Delete one of the logged-in user's scores
 *     tags: [Leaderboard]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Score ID
 *     responses:
 *       200:
 *         description: Score deleted successfully
 *       403:
 *         description: You can only delete your own scores
 *       404:
 *         description: Score not found
 */
router.delete("/scores/:id", authMiddleware, deleteScore);

module.exports = router;
