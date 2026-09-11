import express from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  getHistory,
  getCreatorProfile,
  updateProfile,
  updateSettings,
  updatePassword,
  toggleFollow,
  updateProfileImages,
} from "../controllers/user.controller";
import upload from "../middleware/upload.middleware";

const router = express.Router();

router.get("/history", authenticate, getHistory);
router.get("/profile/me", authenticate, (req, res, next) => {
  req.params.id = "me";
  next();
}, getCreatorProfile);
router.get("/profile/:id", getCreatorProfile);

router.put("/profile", authenticate, updateProfile);
router.put(
  "/profile/upload", 
  authenticate, 
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]), 
  updateProfileImages
);
router.put("/settings", authenticate, updateSettings);
router.put("/password", authenticate, updatePassword);

router.post("/follow/:id", authenticate, toggleFollow);

export default router;
