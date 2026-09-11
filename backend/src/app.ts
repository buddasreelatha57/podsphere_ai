import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import contentRoutes from "./routes/content.routes";
import commentRoutes from "./routes/comment.routes";
import notificationRoutes from "./routes/notification.routes";
import adminRoutes from "./routes/admin.routes";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (e.g. mobile apps, curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
}));
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("🚀 PodSphere AI Backend Running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/user", userRoutes); // keep legacy path if it was there
app.use("/api/content", contentRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);

export default app;