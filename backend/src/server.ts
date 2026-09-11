import dotenv from "dotenv";
dotenv.config();

import "./config/cloudinary";

import fs from "fs";
import path from "path";
import app from "./app";
import { connectDB } from "./config/database";

const PORT = process.env.PORT || 5000;

/** Delete orphaned temp files on startup so disk stays clean between restarts */
const cleanUploadsDir = () => {
  const uploadsDir = path.join(__dirname, "../../uploads");
  if (!fs.existsSync(uploadsDir)) return;
  const files = fs.readdirSync(uploadsDir);
  let cleaned = 0;
  for (const file of files) {
    try {
      fs.unlinkSync(path.join(uploadsDir, file));
      cleaned++;
    } catch {}
  }
  if (cleaned > 0) console.log(`🧹 Cleaned ${cleaned} orphaned temp files from uploads/`);
};

const startServer = async () => {
  try {
    cleanUploadsDir();
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server");
    console.error(error);
    process.exit(1);
  }
};

startServer();