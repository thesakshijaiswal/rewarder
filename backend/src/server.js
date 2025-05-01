import express from "express";
import { connectDB } from "./lib/db.js";
import cors from "cors";
import authRoutes from "./routes/auth.route.js";
import creditRoutes from "./routes/credit.route.js";
import feedRoutes from "./routes/feed.route.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/credits", creditRoutes);
app.use("/api/feed", feedRoutes);

app.get("/", (req, res) => {
  res.send("Server is Running 🟢");
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is up and Running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
