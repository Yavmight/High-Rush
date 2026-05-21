const db = require("../config/db.js");

const insertScore = async (
  userId,
  username,
  race_time,
  top_speed,
  perfect_shifts,
) => {
  const result = await db.query(
    `INSERT INTO scores (id, username, race_time, top_speed, perfect_shifts)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, username, race_time, top_speed, perfect_shifts],
  );

  return result.rows[0];
};

const fetchAllScores = async () => {
  const result = await db.query(
    `SELECT id, username, race_time, top_speed, perfect_shifts, created_at
     FROM scores
     ORDER BY race_time ASC`,
  );

  return result.rows;
};

const editScore = async (id, userId, race_time, top_speed, perfect_shifts) => {
  const existing = await db.query(`SELECT id FROM scores WHERE id = $1`, [id]);

  if (existing.rows.length === 0) {
    throw new Error("SCORE_NOT_FOUND");
  }

  if (existing.rows[0].id !== userId) {
    throw new Error("UNAUTHORIZED");
  }

  const result = await db.query(
    `UPDATE scores
     SET race_time = $1, top_speed = $2, perfect_shifts = $3
     WHERE id = $4
     RETURNING *`,
    [race_time, top_speed, perfect_shifts, id],
  );

  return result.rows[0];
};

const removeScore = async (id, userId) => {
  const existing = await db.query(`SELECT id FROM scores WHERE id = $1`, [id]);

  if (existing.rows.length === 0) {
    throw new Error("SCORE_NOT_FOUND");
  }

  if (existing.rows[0].id !== userId) {
    throw new Error("UNAUTHORIZED");
  }

  await db.query(`DELETE FROM scores WHERE id = $1`, [id]);
};

module.exports = {
  insertScore,
  fetchAllScores,
  editScore,
  removeScore,
};
