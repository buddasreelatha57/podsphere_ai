import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import contentRoutes from "./routes/content.routes";
import commentRoutes from "./routes/comment.routes";
import notificationRoutes from "./routes/notification.routes";
import adminRoutes from "./routes/admin.routes";

const app = express();

// CORS configuration supporting local development and deployed frontend on Vercel
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5000",
  "https://podsphereaisree.vercel.app",
];

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith(".vercel.app") ||
      origin.endsWith(".onrender.com") ||
      origin.includes("localhost")
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
}));


app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Health Check & Root routes
app.get("/", (_req, res) => {
  res.send("🚀 PodSphere AI Backend Running...");
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "PodSphere AI Backend", timestamp: new Date().toISOString() });
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "PodSphere AI Backend", timestamp: new Date().toISOString() });
});

// Mount routes on /api/... as standard and direct fallbacks to prevent 404s
app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes);

app.use("/api/users", userRoutes);
app.use("/api/user", userRoutes);
app.use("/users", userRoutes);
app.use("/user", userRoutes);

app.use("/api/content", contentRoutes);
app.use("/content", contentRoutes);

app.use("/api/comments", commentRoutes);
app.use("/comments", commentRoutes);

app.use("/api/notifications", notificationRoutes);
app.use("/notifications", notificationRoutes);

app.use("/api/admin", adminRoutes);
app.use("/admin", adminRoutes);

export default app;