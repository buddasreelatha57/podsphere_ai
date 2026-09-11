import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    console.log("⏳ Connecting to MongoDB...");
    const uri = process.env.MONGODB_URI;
    console.log("URI Exists:", !!uri);

    if (!uri) {
      throw new Error("MONGODB_URI environment variable is not defined in Render environment settings.");
    }

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 7500,
    });

    console.log("✅ MongoDB Connected");
  } catch (error: any) {
    console.error("❌ MongoDB Connection Failed:", error?.message || error);
    process.exit(1);
  }
};