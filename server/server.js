const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger.js");
require("dotenv").config();

//import
const authRoutes = require("./routes/authRoutes.js");
const leaderBoardRoutes = require("./routes/leaderBoardRoutes.js");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: "http://127.0.0.1:5500", credentials: true }));

app.use(express.json());

app.use(cookieParser());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(authRoutes);

app.use(leaderBoardRoutes);

app.listen(PORT, () => {
  console.log("Server is Running");
});
