import multer from "multer";
import path from "path";
import fs from "fs";

// Use a local uploads folder OUTSIDE the backend folder so ts-node-dev doesn't watch it and restart!
const uploadDir = path.join(__dirname, "../../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname);
  },
});

const fileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
  const allowedMimeTypes = [
    // Video
    "video/mp4",
    "video/quicktime",  // .mov
    "video/x-msvideo",  // .avi
    "video/webm",
    // Audio (for podcast uploads)
    "audio/mpeg",       // .mp3
    "audio/mp4",        // .m4a
    "audio/wav",
    "audio/ogg",
    "audio/webm",
    "audio/aac",
    // Images (thumbnails)
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Unsupported file type. Please upload a valid video, audio, or image file."
      )
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024, // 2 GB
  },
});

export default upload;