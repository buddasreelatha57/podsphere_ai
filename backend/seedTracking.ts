import mongoose from "mongoose";
import User from "./src/models/User";
import dotenv from "dotenv";

dotenv.config();

const countries = ["US", "IN", "UK", "DE", "AU", "Unknown"];
const devices = ["Web", "Android", "iOS", "Unknown"];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/podsphere");
    const users = await User.find({});
    for (const u of users) {
      const randomDaysAgo = Math.floor(Math.random() * 45); // 0 to 45 days ago
      const lastActiveAt = new Date();
      lastActiveAt.setDate(lastActiveAt.getDate() - randomDaysAgo);
      
      u.lastActiveAt = lastActiveAt;
      u.country = countries[Math.floor(Math.random() * countries.length)];
      u.deviceType = devices[Math.floor(Math.random() * devices.length)] as any;
      await u.save();
    }
    console.log("Successfully seeded historical tracking data for real analytics test.");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

seed();
