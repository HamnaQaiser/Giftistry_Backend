import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
console.log("Script started");

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected");

    const existingAdmin = await User.findOne({ email: "admin@giftistry.com" });
    if (existingAdmin) {
      console.log("⚠️ Admin user already exists");
    } else {
      const admin = new User({
        name: "Admin",
        email: "admin@giftistry.com",
        password: "admin123", // Will be hashed
        isAdmin: true,
      });

      await admin.save();
      console.log("✅ Admin user created: admin@giftistry.com / admin123");
    }

    mongoose.disconnect();
  })
  .catch((err) => console.error("❌ MongoDB error:", err));
