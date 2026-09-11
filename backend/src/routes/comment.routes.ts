
import express from "express";
import { authenticate } from "../middleware/auth.middleware";

import {
  addComment,
  getComments,
  deleteComment,
  likeComment,
  editComment,
} from "../controllers/comment.controller";

const router = express.Router();

router.post(
  "/",
  authenticate,
  addComment
);

router.get(
  "/:id",
  getComments
);

router.delete(
  "/:id",
  authenticate,
  deleteComment
);

router.patch(
  "/like/:id",
  authenticate,
  likeComment
);

router.patch(
  "/:id",
  authenticate,
  editComment
);

export default router;