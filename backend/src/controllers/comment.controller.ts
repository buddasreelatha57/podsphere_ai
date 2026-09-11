import { Request, Response } from "express";
import Comment from "../models/Comment";
import Content from "../models/Content";
import User from "../models/User";
import Notification from "../models/Notification";

//add comments

export const addComment = async (
  req: Request,
  res: Response
) => {
  try {
    if ((req as any).user?.role === "guest") {
      return res.status(403).json({ success: false, message: "Please log in to comment" });
    }

    const user =
      (req as any).user.id ||
      (req as any).user._id;

    const { contentId, message } = req.body;

    const comment = await Comment.create({
      content: contentId,
      user,
      message,
    });

    await comment.populate(
      "user",
      "name email"
    );

    // Create notification for content creator
    const targetContent = await Content.findById(contentId);
    if (targetContent && targetContent.creator.toString() !== user.toString()) {
      const commenter = await User.findById(user);
      await Notification.create({
        recipient: targetContent.creator,
        sender: user,
        type: "comment",
        contentId: contentId,
        message: `${commenter?.name || 'Someone'} commented on your post: "${message.substring(0, 20)}..."`,
      });
    }

    res.status(201).json({
      success: true,
      comment,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
    });
  }
};

//get comments

export const getComments = async (
  req: Request,
  res: Response
) => {
  try {
    const comments = await Comment.find({
      content: req.params.id,
    })
      .populate("user", "name")
      .sort({
        createdAt: -1,
      });

    res.json({
      success: true,
      comments,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
    });
  }
};

//delete comment

export const deleteComment = async (
  req: Request,
  res: Response
) => {
  try {
    if ((req as any).user?.role === "guest") {
      return res.status(403).json({ success: false, message: "Guest users cannot delete comments" });
    }

    await Comment.findByIdAndDelete(
      req.params.id
    );

    res.json({
      success: true,
    });
  } catch {
    res.status(500).json({
      success: false,
    });
  }
};


//like comment

export const likeComment = async (
  req: Request,
  res: Response
) => {
  try {
    if ((req as any).user?.role === "guest") {
      return res.status(403).json({ success: false, message: "Please log in to like comments" });
    }

    const comment =
      await Comment.findById(req.params.id);

    if (!comment)
      return res.status(404).json({
        success: false,
      });

    comment.likes++;

    await comment.save();

    res.json({
      success: true,
      likes: comment.likes,
    });
  } catch {
    res.status(500).json({
      success: false,
    });
  }
};

//edit comment
export const editComment = async (
  req: Request,
  res: Response
) => {
  try {
    if ((req as any).user?.role === "guest") {
      return res.status(403).json({ success: false, message: "Guest users cannot edit comments" });
    }

    const user =
      (req as any).user.id ||
      (req as any).user._id;

    const { message } = req.body;

    const comment = await Comment.findById(req.params.id);

    if (!comment)
      return res.status(404).json({
        success: false,
      });

    if (comment.user.toString() !== user.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    comment.message = message;
    await comment.save();

    res.json({
      success: true,
      comment,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
    });
  }
};
