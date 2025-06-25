const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const morgan = require("morgan");
dotenv.config(); // Load .env variables

const db = require('./Utils/db-connection');
require('./Models'); // Ensure models load and associations setup

// Routes
const userRoutes = require("./Routes/userRoute");
const expenseRoutes = require("./Routes/expenseRoute");
const purchaseRoutes = require("./Routes/purchaseRoutes");
const leaderBoard = require("./Routes/leaderBoard");
const forgetPassword = require("./Routes/forgetPasswordRoute");
const analyticsRoute = require("./Routes/reportGenerationRoute");

const app = express();

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a'}
);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(morgan('combined', { stream: accessLogStream }));

// Routes
app.get("/user/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/user/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "signup.html"));
});

app.use("/user", userRoutes);
app.use("/expense", expenseRoutes);
app.use("/purchase", purchaseRoutes);
app.use("/leaderBoard", leaderBoard);
app.use("/passwordreset", forgetPassword);
app.use("/analytics", analyticsRoute);

// 404 fallback
app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, "public", "404.html")); // optional 404.html page
});

// DB sync and start server
const PORT = process.env.PORT || 3000;
db.sync({ force: false }).then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server is live on http://localhost:${PORT}`);
  });
}).catch((error) => {
  console.error("❌ DB Sync Error:", error);
});
