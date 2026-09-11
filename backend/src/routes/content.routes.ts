import express from "express";
import upload from "../middleware/upload.middleware";
import { authenticate } from "../middleware/auth.middleware";
import {
  uploadContent,
  getMyContent,
  getAllContent,
  getContentById,
  likeContent,
  dislikeContent,
  bookmarkContent,
  shareContent,
  incrementView,
  getFavorites,
  updateContent,
  deleteContent,
  searchContent,
} from "../controllers/content.controller";

const router = express.Router();

router.post(
  "/upload",
  authenticate,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  uploadContent
);

// Public Home Feed
router.get(
  "/",
  authenticate,
  getAllContent
);

// Logged-in user's uploads
router.get(
  "/my",
  authenticate,
  getMyContent
);

// Favorites
router.get("/favorites", authenticate, getFavorites);

// Search Content
router.get("/search", authenticate, searchContent);

//watch feed
router.get(
  "/:id",
  authenticate,
  getContentById
);

// Update and Delete Content
router.put("/:id", authenticate, updateContent);
router.delete("/:id", authenticate, deleteContent);

// Analytics Routes
router.post("/:id/like", authenticate, likeContent);
router.post("/:id/dislike", authenticate, dislikeContent);
router.post("/:id/bookmark", authenticate, bookmarkContent);
router.post("/:id/share", authenticate, shareContent);
router.post("/:id/view", authenticate, incrementView);
export default router;