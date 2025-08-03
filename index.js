console.log("🔥 THIS IS THE REAL SERVER");
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import orderRoutes from "./routes/orderRoutes.js";
console.log("✅ Imported authRoutes");
import uploadRoutes from "./routes/uploadRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Routes
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
console.log("✅ Registered /api/auth route");
// Serve static files from uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Mount the route
app.use("/api/uploads", uploadRoutes);

app.get("/api/ping", (req, res) => {
  res.send({ message: "pong 🏓" });
});
app.all("*", (req, res) => {
  console.log(`❌ Unmatched route: ${req.method} ${req.originalUrl}`);
  res.status(404).send("Custom 404: Route not found");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
