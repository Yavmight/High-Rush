const db = require("../config/db.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const createUser = async (username, password) => {
  const hashPassword = await bcrypt.hash(password, 10);

  try {
    const result = await db.query(
      `INSERT INTO users(username, password_hash)
        VALUES($1,$2) 
        RETURNING id`,
      [username, hashPassword],
    );

    return result.rows[0]; //returning the user
  } catch (error) {
    if (error.code === "23505") {
      // checking if there are duplicate entry
      throw new Error("USER_ALREADY_EXISTS"); // throw and catch
    }
    throw error;
  }
};

const loginUser = async (username, password) => {
  const result = await db.query(
    `SELECT id , username, password_hash FROM users WHERE username = $1`,
    [username],
  );

  if (result.rows.length === 0) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const user = result.rows[0];

  const match = await bcrypt.compare(password, user.password_hash);

  if (!match) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
    },
  };
};

module.exports = { createUser, loginUser };
