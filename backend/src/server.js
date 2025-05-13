import express from "express";
import { connectDB } from "./lib/db.js";
import cors from "cors";
import authRoutes from "./routes/auth.route.js";
import creditRoutes from "./routes/credit.route.js";
import feedRoutes from "./routes/feed.route.js";
import profileRoutes from "./routes/profile.route.js";
import adminRoutes from "./routes/admin.route.js";
import path from "node:path";

const app = express();
const __dirname = path.resolve();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/credits", creditRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/admin", adminRoutes);

/*********PRODUCTION CODE**********/
if (process.env.NODE_ENV === "production") {
  const frontendDistPath = path.join(__dirname, "..", "frontend", "dist");
  const publicPath = path.join(__dirname, "..", "frontend", "public");

  app.use(express.static(frontendDistPath));

  app.get("/robots.txt", (req, res) => {
    res.sendFile(path.join(publicPath, "robots.txt"));
  });

  app.get("/sitemap.xml", (req, res) => {
    res.sendFile(path.join(publicPath, "sitemap.xml"));
  });

  // Catch-all route for React SPA
  app.get("/*splat", (req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}
/*********PRODUCTION CODE**********/

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
