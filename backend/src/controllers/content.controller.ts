import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import User from "../models/User";
import mongoose from "mongoose";

import cloudinary, { getActiveCloudinaryConfig } from "../config/cloudinary";
import Content from "../models/Content";
import User from "../models/User";
import Notification from "../models/Notification";

import { extractAudio, compressVideo } from "../utils/ffmpeg";

import { generateTranscript } from "../ai/whisper";
import { generateSummary } from "../ai/summary";
import { generateArticle } from "../ai/article";
import { generateChapters } from "../ai/chapters";
import { generateSEO } from "../ai/seo";
import { translate } from "../ai/translator";

const uploadToCloudinary = async (
  buffer: Buffer,
  folder: string,
  resourceType: "image" | "video"
): Promise<string> => {

  const activeConfig = await getActiveCloudinaryConfig();

  const result = await new Promise<any>((resolve, reject) => {

    const stream = cloudinary.uploader.upload_stream(
      {
        ...activeConfig,
        folder,
        resource_type: resourceType,
        timeout: 600000, // 10 minutes timeout for large videos
        chunk_size: 6000000 // 6MB chunks for large files
      },
      (error, result) => {

        if (error) return reject(error);

        if (!result)
          return reject(new Error("Upload Failed"));

        resolve(result);

      }
    );

    stream.end(buffer);

  });

  return result.secure_url;

};

export const validateObjectId = (id: string) => mongoose.isValidObjectId(id);

const processAIInBackground = async (
  contentId: string,
  audioPath: string,
  videoPath: string,
  title: string,
  category: string,
  publishPodcast: boolean,
  publishArticle: boolean,
  finalStatus: string
) => {
  try {
    const content = await Content.findById(contentId);
    if (!content) return;

    console.log(`[AI] Processing started for content ${contentId}`);

    let podcastUrl = "";
    if (publishPodcast) {
      podcastUrl = await uploadToCloudinary(
        fs.readFileSync(audioPath),
        "podsphere/podcasts",
        "video"
      );
    }

    let transcript = "";
    let summary = "";
    let chapters: any[] = [];
    let translated = "";
    let article = "";
    let seo = "";

    try {
      transcript = await generateTranscript(audioPath);
      summary = await generateSummary(transcript);
      chapters = await generateChapters(transcript);
      translated = await translate(transcript, "Hindi");

      if (publishArticle) {
        article = await generateArticle(title, transcript, summary, category);
        seo = await generateSEO(article);
      }
    } catch (aiError) {
      console.error(`[AI] Rate limit or API error for ${contentId}. Skipping AI generation:`, aiError);
    }

    // Delete temp files RIGHT AWAY after all processing — free disk space immediately
    try { if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath); } catch {}
    try { if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath); } catch {}

    content.transcript = transcript;
    content.summary = summary;
    content.chapters = chapters;
    content.translatedTranscript = translated;
    
    if (publishArticle) {
      content.article = article;
      content.seoDescription = seo;
    }
    
    if (publishPodcast) {
      content.podcastAudio = podcastUrl;
    }
    
    content.status = finalStatus || "published";
    await content.save();
    console.log(`[AI] Processing completed for content ${contentId} with status ${content.status}`);
  } catch (error) {
    console.error(`[AI] Error processing content ${contentId}:`, error);
    // Still clean up even on error
    try { if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath); } catch {}
    try { if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath); } catch {}
  }
};

export const uploadContent = async (
  req: Request,
  res: Response
) => {

if ((req as any).user?.role === "guest") {
  return res.status(403).json({ success: false, message: "Guest users cannot upload content" });
}

let videoPath = "";
let audioPath = "";

try{

const files=req.files as{
video?:Express.Multer.File[];
thumbnail?:Express.Multer.File[];
};

if(!files?.video?.length){
  return res.status(400).json({ success: false, message: "Video Required" });
}

const creatorId=(req as any).user.id;
const videoFile=files.video[0];
const thumbnailFile=files.thumbnail?.[0];

const{
  title, description, category, visibility,
  publishVideo, publishPodcast, publishArticle,
  aiTranscript, aiSummary, aiChapters, aiTranslation, aiSEO, aiVoice,
  status
}=req.body;

const uploadDir = path.join(__dirname, "../../../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const timestamp = Date.now();
videoPath = videoFile.path;
audioPath = path.join(uploadDir, `${timestamp}.mp3`);

console.log(`[Upload] File received by multer: ${videoPath}. Exists: ${fs.existsSync(videoPath)}`);

// ─── STEP 1: Extract audio FIRST (while video is still on disk) ──────
console.log(`[Upload] Starting audio extraction...`);
await extractAudio(videoPath, audioPath);
console.log(`[Upload] Audio extraction done. Video exists: ${fs.existsSync(videoPath)}`);

// ─── STEP 1.5: Compress video if it's over 90MB (Cloudinary Free Tier limit is 100MB) ──
const stats = fs.statSync(videoPath);
const fileSizeInMB = stats.size / (1024 * 1024);

if (fileSizeInMB > 90) {
  console.log(`[Upload] Video is ${fileSizeInMB.toFixed(1)}MB (> 90MB). Starting compression to 720p...`);
  const compressedVideoPath = path.join(uploadDir, `compressed-${timestamp}.mp4`);
  await compressVideo(videoPath, compressedVideoPath);
  
  // Delete the original massive file to save space immediately
  try { if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath); } catch {}
  
  // Point videoPath to the new, smaller compressed file
  videoPath = compressedVideoPath;
  console.log(`[Upload] Compression finished. New file ready for upload.`);
}

// ─── STEP 2: Upload video to Cloudinary (upload_large handles files >100MB) ──
console.log(`[Upload] Starting Cloudinary upload for video...`);
const activeConfig = await getActiveCloudinaryConfig();

const videoUploadResult: any = await new Promise((resolve, reject) => {
  cloudinary.uploader.upload_large(videoPath, {
    ...activeConfig,
    resource_type: "video",
    folder: "podsphere/videos",
    chunk_size: 6000000,   // 6MB chunks
    timeout: 600000        // 10 min timeout for large files
  }, (error, result) => {
    if (error) reject(error);
    else resolve(result);
  });
});
console.log(`[Upload] Cloudinary upload done.`);
const videoUrl = videoUploadResult?.secure_url || "";

// ─── STEP 3: Delete video file IMMEDIATELY after upload ──────────────
// Cloudinary's upload_large sometimes leaves dangling async streams. 
// We wait 3 seconds before deleting to prevent an unhandled ENOENT crash.
const videoToDelete = videoPath;
setTimeout(() => {
  try { if (fs.existsSync(videoToDelete)) fs.unlinkSync(videoToDelete); } catch {}
}, 3000);
videoPath = "";

// ─── STEP 4: Upload thumbnail ─────────────────────────────────────────
let thumbnailUrl = "";
if (thumbnailFile) {
  const thumbResult = await cloudinary.uploader.upload(thumbnailFile.path, {
    ...activeConfig,
    folder: "podsphere/thumbnails",
    resource_type: "image"
  });
  thumbnailUrl = thumbResult.secure_url;
  try { if (fs.existsSync(thumbnailFile.path)) fs.unlinkSync(thumbnailFile.path); } catch {}
}

const isPublishVideo   = publishVideo   === "true";
const isPublishPodcast = publishPodcast === "true";
const isPublishArticle = publishArticle === "true";

const content=await Content.create({

creator:creatorId,

title,
description,
category,
visibility,

thumbnail:thumbnailUrl,

originalVideo:videoUrl,

publishVideo: isPublishVideo,
publishPodcast: isPublishPodcast,
publishArticle: isPublishArticle,

aiTranscript:aiTranscript==="true",
aiSummary:aiSummary==="true",
aiChapters:aiChapters==="true",
aiTranslation:aiTranslation==="true",
aiSEO:aiSEO==="true",
aiVoice:aiVoice==="true",

status: "processing"

});

// Start background AI task
processAIInBackground(
  content._id.toString(),
  audioPath,
  videoPath,
  title,
  category,
  isPublishPodcast,
  isPublishArticle,
  status
);

return res.status(201).json({

success:true,
message:"Uploaded Successfully (Processing in background)",
content

});

}catch(error:any){

console.log(error);

// Only cleanup on initial failure. Background process handles its own cleanup.
if (videoPath && fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
if (audioPath && fs.existsSync(audioPath)) fs.unlinkSync(audioPath);

return res.status(500).json({

success:false,
message:error.message

});

}

};

export const getMyContent=async(
req:Request,
res:Response
)=>{

try{

if ((req as any).user?.role === "guest") {
  return res.json({ success: true, content: [] });
}

const creatorId=(req as any).user.id;

const content=await Content.find({
creator:creatorId
})
.populate("creator","name email followers")
.sort({
createdAt:-1
});

const contentWithLikes = content.map(doc => {
  const obj = doc.toObject();
  return {
    ...obj,
    likes: doc.likedBy?.length || 0,
    dislikes: doc.dislikedBy?.length || 0,
  };
});

res.json({
success:true,
content: contentWithLikes
});

}catch(err){

res.status(500).json({
success:false
});

}

};

export const getAllContent=async(
req:Request,
res:Response
)=>{

try{

const creatorId=(req as any).user.id;

const query: any = {
  visibility: "public",
  status: "published"
};

if (creatorId !== "guest") {
  query.creator = { $ne: creatorId };
}

const content=await Content.find(query)
.populate("creator","name email followers")
.sort({
createdAt:-1
});

const contentWithLikesAll = content.map(doc => {
  const obj = doc.toObject();
  return {
    ...obj,
    likes: doc.likedBy?.length || 0,
    dislikes: doc.dislikedBy?.length || 0,
  };
});

res.json({
success:true,
content: contentWithLikesAll
});

}catch{

res.status(500).json({
success:false
});

}

};

export const getContentById = async (
  req: Request,
  res: Response
) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid content id",
      });
    }

    const content = await Content.findById(req.params.id).populate(
      "creator",
      "name email avatar followers"
    );

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    const userId = (req as any).user.id;
    const isLiked = content.likedBy?.includes(userId);
    const isDisliked = content.dislikedBy?.includes(userId);
    const isBookmarked = content.bookmarkedBy?.includes(userId);
    
    // Check if user is following creator
    let isFollowing = false;
    if (content.creator) {
      const creatorId = (content.creator as any)._id;
      const creator = await User.findById(creatorId);
      if (creator && creator.followers?.includes(userId)) {
        isFollowing = true;
      }
    }

    const contentObj = content.toObject();
    
    res.json({
      success: true,
      content: {
        ...contentObj,
        likes: content.likedBy?.length || 0,
        dislikes: content.dislikedBy?.length || 0,
        liked: isLiked,
        disliked: isDisliked,
        bookmarked: isBookmarked,
        isFollowing
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error while loading content",
    });
  }
};

export const likeContent = async (
  req: Request,
  res: Response
) => {
  try {
    if ((req as any).user?.role === "guest") {
      return res.status(403).json({ success: false, message: "Please log in to like content" });
    }

    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid content id",
      });
    }

    const userId =
      (req as any).user.id;

    const content =
      await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    const alreadyLiked =
      content.likedBy.some(
        (id: any) =>
          id.toString() === userId.toString()
      );

    if (alreadyLiked) {

      content.likedBy =
        content.likedBy.filter(
          (id: any) =>
            id.toString() !== userId.toString()
        );

    } else {
      content.likedBy.push(userId);
      content.dislikedBy = content.dislikedBy.filter(
        (id: any) => id.toString() !== userId.toString()
      );

      if (content.creator.toString() !== userId.toString()) {
        const liker = await User.findById(userId);
        await Notification.create({
          recipient: content.creator,
          sender: userId,
          type: "like",
          contentId: content._id,
          message: `${liker?.name || 'Someone'} liked your content.`,
        });
      }
    }

    content.likes = content.likedBy.length;
    content.dislikes = content.dislikedBy.length;

    await content.save();

    return res.json({

      success: true,

      likes: content.likedBy.length,

      dislikes:
        content.dislikedBy.length,

      liked: !alreadyLiked,

    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server error while updating like status",
    });
  }
};

export const dislikeContent = async (
  req: Request,
  res: Response
) => {

  try {

    const userId =
      (req as any).user.id;

    const content =
      await Content.findById(req.params.id);

    if (!content) {

      return res.status(404).json({
        success: false,
      });

    }

    const alreadyDisliked =
      content.dislikedBy.some(
        (id: any) =>
          id.toString() === userId.toString()
      );

    if (alreadyDisliked) {

      content.dislikedBy =
        content.dislikedBy.filter(
          (id: any) =>
            id.toString() !== userId.toString()
        );

    } else {

      content.dislikedBy.push(userId);

      content.likedBy =
        content.likedBy.filter(
          (id: any) =>
            id.toString() !== userId.toString()
        );

    }

    content.likes = content.likedBy.length;
    content.dislikes = content.dislikedBy.length;

    await content.save();

    return res.json({

      success: true,

      likes:
        content.likedBy.length,

      dislikes:
        content.dislikedBy.length,

      disliked: !alreadyDisliked,

    });

  } catch {

    return res.status(500).json({
      success: false,
    });

  }

};

export const bookmarkContent = async (
  req: Request,
  res: Response
) => {

  try {

    const userId =
      (req as any).user.id;

    const content =
      await Content.findById(req.params.id);

    if (!content) {

      return res.status(404).json({
        success: false,
      });

    }

    const bookmarked =
      content.bookmarkedBy.some(
        (id: any) =>
          id.toString() === userId.toString()
      );

    if (bookmarked) {

      content.bookmarkedBy =
        content.bookmarkedBy.filter(
          (id: any) =>
            id.toString() !== userId.toString()
        );

    } else {

      content.bookmarkedBy.push(userId);

    }

    await content.save();

    return res.json({

      success: true,

      bookmarks:
        content.bookmarkedBy.length,

      bookmarked:
        !bookmarked,

    });

  } catch {

    return res.status(500).json({
      success: false,
    });

  }

};

export const shareContent = async (
  req: Request,
  res: Response
) => {

  try {

    const content =
      await Content.findById(req.params.id);

    if (!content) {

      return res.status(404).json({
        success: false,
      });

    }

    content.shares += 1;

    await content.save();

    return res.json({

      success: true,

      shares:
        content.shares,

    });

  } catch {

    return res.status(500).json({
      success: false,
    });

  }

};

export const incrementView = async (
  req: Request,
  res: Response
) => {

  try {
    const userId = (req as any).user?.id;
    const content =
      await Content.findById(req.params.id);

    if (!content) {

      return res.status(404).json({
        success: false,
      });

    }

    if (userId && userId !== "guest") {
      const user = await User.findById(userId);
      if (user) {
        // Check if viewed in last 24 hours
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentView = user.watchHistory.find(
          (history: any) => 
            history.contentId.toString() === content._id.toString() && 
            new Date(history.viewedAt) > oneDayAgo
        );

        if (recentView) {
          // Already viewed recently, don't increment view count again
          return res.json({
            success: true,
            views: content.views,
            message: "View already counted recently"
          });
        }

        user.watchHistory.push({
          contentId: content._id as mongoose.Types.ObjectId,
          viewedAt: new Date(),
        });
        await user.save();
      }
    }

    content.views += 1;
    await content.save();

    return res.json({

      success: true,

      views:
        content.views,

    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
    });

  }

};

export const getFavorites = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).user.id;
    const content = await Content.find({
      bookmarkedBy: userId,
    })
      .populate("creator", "name email followers")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      content,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
    });
  }
};

export const updateContent = async (req: Request, res: Response) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }
    
    const userId = (req as any).user.id;
    const content = await Content.findOne({ _id: req.params.id, creator: userId });
    
    if (!content) {
      return res.status(404).json({ success: false, message: "Content not found or unauthorized" });
    }

    const { title, description, category, visibility } = req.body;
    
    if (title) content.title = title;
    if (description !== undefined) content.description = description;
    if (category) content.category = category;
    if (visibility) content.visibility = visibility;
    
    await content.save();
    
    return res.json({ success: true, message: "Content updated successfully", content });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteContent = async (req: Request, res: Response) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }
    
    const userId = (req as any).user.id;
    const content = await Content.findOne({ _id: req.params.id, creator: userId });
    
    if (!content) {
      return res.status(404).json({ success: false, message: "Content not found or unauthorized" });
    }

    await Content.findByIdAndDelete(req.params.id);
    
    return res.json({ success: true, message: "Content deleted successfully" });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
export const searchContent = async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.json({ success: true, content: [] });
    }

    const regex = new RegExp(query, "i");

    const content = await Content.find({
      $or: [
        { title: regex },
        { description: regex },
        { seoDescription: regex },
        { category: regex },
        { tags: regex }
      ],
      visibility: "public",
      status: "published"
    })
      .populate("creator", "name email followers")
      .sort({ createdAt: -1 })
      .limit(50);

    const contentWithLikes = content.map(doc => {
      const obj = doc.toObject();
      return {
        ...obj,
        likes: doc.likedBy?.length || 0,
        dislikes: doc.dislikedBy?.length || 0,
      };
    });

    return res.json({ success: true, content: contentWithLikes });
  } catch (err: any) {
    console.error("Search Error:", err);
    return res.status(500).json({ success: false, message: "Search failed" });
  }
};
