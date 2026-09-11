import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    console.log("⏳ Connecting to MongoDB...");
    console.log("URI Exists:", !!process.env.MONGODB_URI);

    await mongoose.connect(process.env.MONGODB_URI as string);

    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed");
    console.error(error);
    process.exit(1);
  }
};