import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    console.log("⏳ Connecting to MongoDB...");
    const rawUri =
      process.env.MONGODB_URI ||
      process.env.MONGO_URI ||
      process.env.MONGODB_URL ||
      process.env.DATABASE_URL;

    const uri = rawUri ? rawUri.trim().replace(/^['"]|['"]$/g, "") : "";
    console.log("URI Exists:", !!uri);

    if (!uri) {
      console.log("Detected environment keys:", Object.keys(process.env).filter(k => !k.startsWith("npm_") && !k.startsWith("NODE_")));
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