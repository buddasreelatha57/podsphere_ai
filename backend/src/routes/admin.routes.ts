import express from "express";
import { authenticate, isAdmin } from "../middleware/auth.middleware";
import { getDashboardStats, getDetailedAnalytics, getFullAnalytics } from "../controllers/admin.controller";

const router = express.Router();

// Apply auth middleware to all admin routes
router.use(authenticate);
router.use(isAdmin);

router.get("/stats", getDashboardStats);
router.get("/analytics/detailed", getDetailedAnalytics);
router.get("/analytics/full", getFullAnalytics);

export default router;