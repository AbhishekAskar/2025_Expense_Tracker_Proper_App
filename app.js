const express = require("express");
const path = require("path");
const db = require('./Utils/db-connection');
const userRoutes = require("./Routes/userRoute");
const expenseRoutes = require("./Routes/expenseRoute");
const port = 3000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/user/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/user/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "signup.html"));
});

app.use("/user", userRoutes);
app.use("/expense", expenseRoutes);

db.sync({force: false}).then(() => {
  app.listen(port, () => {
    console.log("✅ Server is listening on Port: " + port);
  });
}).catch((error) => {
  console.log(error);
});
