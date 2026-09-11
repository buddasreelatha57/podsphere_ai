import express from "express";
import { authenticate } from "../middleware/auth.middleware";
import { getNotifications, markAsRead, markAllAsRead } from "../controllers/notification.controller";

const router = express.Router();

router.get("/", authenticate, getNotifications);
router.put("/read-all", authenticate, markAllAsRead);
router.put("/:id/read", authenticate, markAsRead);

export default router;
