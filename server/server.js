const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

//import
const authRoutes = require("./routes/authRoutes.js");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());

app.use(cookieParser());

app.use(authRoutes);

app.listen(PORT, () => {
  console.log("Server is Running");
});
