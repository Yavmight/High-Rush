const jwt = require("jsonwebtoken");
const db = require("../config/db");

const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      error: "No token provided",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await db.query(`SELECT id FROM users WHERE id = $1`, [
      decoded.id,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "User doesn't exist. Token invalid.",
      });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid token" });
  }
};

module.exports = authMiddleware;
