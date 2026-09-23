import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/User";
import Content from "../models/Content";
import Notification from "../models/Notification";

export const getHistory = async (req: Request, res: Response) => {
  try {
    if ((req as any).user?.role === "guest") {
      return res.json({ success: true, history: [] });
    }
    const userId = (req as any).user.id;
    const user = await User.findById(userId).populate({
      path: "watchHistory.contentId",
      select: "title thumbnail creator views createdAt",
      populate: {
        path: "creator",
        select: "name",
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Sort history by most recent
    const history = user.watchHistory
      .filter((h) => h.contentId) // Filter out deleted content
      .sort((a, b) => b.viewedAt.getTime() - a.viewedAt.getTime())
      .map((h: any) => ({
        ...h.contentId.toObject(),
        viewedAt: h.viewedAt,
      }));

    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch history" });
  }
};

export const getCreatorProfile = async (req: Request, res: Response) => {
  try {
    if ((req as any).user?.role === "guest" && req.params.id === "me") {
      return res.json({
        success: true,
        profile: {
          _id: "guest",
          name: "Guest Explorer",
          role: "guest",
          avatar: "",
          banner: "",
          bio: "",
          followers: [],
          following: [],
        },
        content: [],
      });
    }
    const { id } = req.params;
    
    let userQuery;
    if (id === "me") {
      userQuery = (req as any).user.id;
    } else {
      userQuery = id;
    }

    const projection = id === "me" ? "-password -watchHistory" : "-password -settings -watchHistory";
    const user = await User.findById(userQuery).select(projection);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const content = await Content.find({
      creator: user._id,
      visibility: "public",
      status: "published"
    }).sort({ createdAt: -1 });

    const contentWithLikes = content.map(doc => {
      const obj = doc.toObject();
      return {
        ...obj,
        likes: doc.likedBy?.length || 0,
        dislikes: doc.dislikedBy?.length || 0,
      };
    });

    res.json({
      success: true,
      profile: user,
      content: contentWithLikes,
    });

  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch creator profile" });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    if ((req as any).user?.role === "guest") {
      return res.status(403).json({ success: false, message: "Guest users cannot update profile" });
    }
    const userId = (req as any).user.id;
    const { name, email, avatar, bio, banner } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (name) user.name = name;
    if (email) user.email = email;
    if (avatar) user.avatar = avatar;
    if (bio !== undefined) user.bio = bio;
    if (banner !== undefined) user.banner = banner;

    await user.save();

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update profile" });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    if ((req as any).user?.role === "guest") {
      return res.status(403).json({ success: false, message: "Guest users cannot update settings" });
    }
    const userId = (req as any).user.id;
    const { settings } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.settings = {
      ...user.settings,
      ...settings,
    };

    await user.save();

    res.json({ success: true, settings: user.settings });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update settings" });
  }
};

export const toggleFollow = async (req: Request, res: Response) => {
  try {
    if ((req as any).user?.role === "guest") {
      return res.status(403).json({ success: false, message: "Please log in to follow users" });
    }
    const followerId = (req as any).user.id;
    const { id: targetId } = req.params;

    if (followerId === targetId) {
      return res.status(400).json({ success: false, message: "Cannot follow yourself" });
    }

    const follower = await User.findById(followerId);
    const targetUser = await User.findById(targetId);

    if (!follower || !targetUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isFollowing = follower.following.includes(targetUser._id as any);

    if (isFollowing) {
      // Unfollow
      follower.following = follower.following.filter((id) => id.toString() !== targetId);
      targetUser.followers = targetUser.followers.filter((id) => id.toString() !== followerId);
    } else {
      // Follow
      follower.following.push(targetUser._id as any);
      targetUser.followers.push(follower._id as any);

      // Create notification for target user
      await Notification.create({
        recipient: targetUser._id,
        sender: follower._id,
        type: "follow",
        message: `${follower.name} started following you.`,
      });
    }

    await follower.save();
    await targetUser.save();

    res.json({ success: true, isFollowing: !isFollowing, followersCount: targetUser.followers.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to toggle follow status" });
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  try {
    if ((req as any).user?.role === "guest") {
      return res.status(403).json({ success: false, message: "Guest users cannot update password" });
    }
    const userId = (req as any).user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Current and new password are required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Incorrect current password" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Error updating password:", err);
    res.status(500).json({ success: false, message: "Failed to update password" });
  }
};

import cloudinary, { getActiveCloudinaryConfig } from "../config/cloudinary";
import fs from "fs";

export const updateProfileImages = async (req: Request, res: Response) => {
  const files = req.files as {
    avatar?: Express.Multer.File[];
    banner?: Express.Multer.File[];
  };

  try {
    if ((req as any).user?.role === "guest") {
      return res.status(403).json({ success: false, message: "Guest users cannot update profile" });
    }

    const userId = (req as any).user.id;
    const { name, bio } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;

    const uploadedFiles = [...(files?.avatar || []), ...(files?.banner || [])];

    if (uploadedFiles.length > 0) {
      const activeConfig = await getActiveCloudinaryConfig();

      for (const file of uploadedFiles) {
        const result = await cloudinary.uploader.upload(file.path, {
          ...activeConfig,
          folder: "podsphere/users",
          resource_type: "image",
        });

        if (file.fieldname === "avatar") {
          user.avatar = result.secure_url;
        }
        if (file.fieldname === "banner") {
          user.banner = result.secure_url;
        }
      }
    }

    await user.save();

    res.json({ success: true, user });
  } catch (err: any) {
    console.error("Error updating profile images:", err);
    const message = err?.message || "Failed to update profile images";
    res.status(500).json({ success: false, message });
  } finally {
    for (const file of [...(files?.avatar || []), ...(files?.banner || [])]) {
      try {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      } catch (cleanupError) {
        console.error("Failed to remove temporary profile image:", cleanupError);
      }
    }
  }
};

