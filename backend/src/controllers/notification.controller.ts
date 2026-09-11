import { Request, Response } from "express";
import Notification from "../models/Notification";

export const getNotifications = async (req: Request, res: Response) => {
  try {
    if ((req as any).user?.role === "guest") {
      return res.json({ success: true, notifications: [] });
    }
    const userId = (req as any).user.id;
    const notifications = await Notification.find({ recipient: userId })
      .populate("sender", "name avatar")
      .populate("contentId", "title")
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      notifications,
    });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    if ((req as any).user?.role === "guest") {
      return res.json({ success: true });
    }
    const userId = (req as any).user.id;
    const notificationId = req.params.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.json({
      success: true,
      notification,
    });
  } catch (err) {
    console.error("Error marking notification as read:", err);
    res.status(500).json({ success: false, message: "Failed to update notification" });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    if ((req as any).user?.role === "guest") {
      return res.json({ success: true, message: "All notifications marked as read" });
    }
    const userId = (req as any).user.id;

    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (err) {
    console.error("Error marking all notifications as read:", err);
    res.status(500).json({ success: false, message: "Failed to update notifications" });
  }
};
