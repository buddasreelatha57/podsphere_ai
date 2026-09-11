import express from "express";
import {
  register,
  login,
  profile,
  googleAuth,
  guestLogin,
} from "../controllers/auth.controller";

const router = express.Router();

// Authentication Routes
router.post("/register", register);
router.post("/login", login);
router.post("/google", googleAuth);
router.post("/guest", guestLogin);
router.get("/profile", profile);

export default router;