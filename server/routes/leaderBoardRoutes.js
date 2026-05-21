const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware.js");
const {
  createScore,
  getAllScores,
  updateScore,
  deleteScore,
} = require("../controllers/leaderboardController.js");

//Get the scores
router.get("/scores", getAllScores);

// the scores
router.post("/scores", authMiddleware, createScore);
router.put("/scores/:id", authMiddleware, updateScore);
router.delete("/scores/:id", authMiddleware, deleteScore);

module.exports = router;
