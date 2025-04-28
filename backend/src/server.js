import express from "express";
import { connectDB } from "./lib/db.js";

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.get("/", (req, res) => {
  res.send("Server is Running 🟢");
});

app.listen(PORT, () => {
  console.log(`Server is up and Running at http://localhost:${PORT}`);
});
