const express = require("express");
const path = require("path");
const db = require('./Utils/db-connection');
const expenseRoutes = require("./Routes/expenseRoute");
const port = 3000;
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.use("/api", expenseRoutes);

db.sync().then(() => {
  app.listen(port, () => {
    console.log("✅ Server is listening on Port: " + port);
  });
}).catch((error) => {
  console.log(error);
});
