const {
  insertScore,
  fetchAllScores,
  fetchscorebyId,
  editScore,
  removeScore,
} = require("../services/leaderboardService.js");

const createScore = async (req, res) => {
  const { race_time, top_speed, perfect_shifts } = req.body;
  const { id: userId, username } = req.user;

  console.log(req.user);

  try {
    const entry = await insertScore(
      userId,
      username,
      race_time,
      top_speed,
      perfect_shifts,
    );

    return res.status(201).json({
      message: "Score Submitted Successfully",

      entry,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getAllScores = async (req, res) => {
  try {
    const scores = await fetchAllScores();

    return res.status(200).json({ scores });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const updateScore = async (req, res) => {
  const { id } = req.params;
  const { race_time, top_speed, perfect_shifts } = req.body;
  const { id: userId } = req.user;

  try {
    const updated = await editScore(
      id,
      userId,
      race_time,
      top_speed,
      perfect_shifts,
    );

    return res.status(200).json({
      message: "Score updated successfully",
      entry: updated,
    });
  } catch (error) {
    if (error.message === "SCORE_NOT_FOUND") {
      return res.status(404).json({ message: "Score not found" });
    }
    if (error.message === "UNAUTHORIZED") {
      return res
        .status(403)
        .json({ message: "You can only edit your own scores" });
    }
    return res.status(500).json({ error: error.message });
  }
};

const deleteScore = async (req, res) => {
  const { id } = req.params;
  const { id: userId } = req.user;

  try {
    await removeScore(id, userId);

    return res.status(200).json({ message: "Score deleted successfully" });
  } catch (error) {
    if (error.message === "SCORE_NOT_FOUND") {
      return res.status(404).json({ message: "Score not found" });
    }
    if (error.message === "UNAUTHORIZED") {
      return res
        .status(403)
        .json({ message: "You can only delete your own scores" });
    }
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createScore,
  getAllScores,
  updateScore,
  deleteScore,
};
