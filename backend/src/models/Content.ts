import mongoose, { Schema, Document } from "mongoose";

export interface IContent extends Document {
  creator: mongoose.Types.ObjectId;

  title: string;
  description: string;
  category: string;
  tags: string[];

  thumbnail: string;
  originalVideo: string;
  podcastAudio: string;
  article: string;

  duration: number;
  durationText: string;
  podcastDuration: number;
  resolution: string;
  fileSize: number;

  visibility: "public" | "private";

  publishVideo: boolean;
  publishPodcast: boolean;
  publishArticle: boolean;

  aiTranscript: boolean;
  aiSummary: boolean;
  aiChapters: boolean;
  aiTranslation: boolean;
  aiSEO: boolean;
  aiVoice: boolean;

  transcript: string;
  translatedTranscript: string;
  summary: string;

  seoTitle: string;
  seoDescription: string;

  chapters: {
    title: string;
    startTime: number;
  }[];

  views: number;
  likes: number;
  dislikes: number;
  bookmarks: number;
  shares: number;

  likedBy: mongoose.Types.ObjectId[];
  dislikedBy: mongoose.Types.ObjectId[];
  bookmarkedBy: mongoose.Types.ObjectId[];

  progress: {
    upload: number;
    transcript: number;
    summary: number;
    article: number;
    chapters: number;
    translation: number;
    seo: number;
    podcast: number;
  };

  status:
    | "processing"
    | "published"
    | "draft"
    | "failed";
}

const ContentSchema = new Schema<IContent>(
  {
    // ================= Creator =================

    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ================= Basic =================

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      required: true,
    },

    tags: [
      {
        type: String,
      },
    ],

    // ================= Files =================

    thumbnail: {
      type: String,
      default: "",
    },

    originalVideo: {
      type: String,
      default: "",
    },

    podcastAudio: {
      type: String,
      default: "",
    },

    article: {
      type: String,
      default: "",
    },

    // ================= Video Info =================

    duration: {
      type: Number,
      default: 0,
    },

    durationText: {
      type: String,
      default: "",
    },

    podcastDuration: {
      type: Number,
      default: 0,
    },

    resolution: {
      type: String,
      default: "",
    },

    fileSize: {
      type: Number,
      default: 0,
    },

    // ================= Visibility =================

    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },

    // ================= Publishing =================

    publishVideo: {
      type: Boolean,
      default: true,
    },

    publishPodcast: {
      type: Boolean,
      default: false,
    },

    publishArticle: {
      type: Boolean,
      default: false,
    },

    // ================= AI Options =================

    aiTranscript: {
      type: Boolean,
      default: true,
    },

    aiSummary: {
      type: Boolean,
      default: true,
    },

    aiChapters: {
      type: Boolean,
      default: true,
    },

    aiTranslation: {
      type: Boolean,
      default: false,
    },

    aiSEO: {
      type: Boolean,
      default: true,
    },

    aiVoice: {
      type: Boolean,
      default: false,
    },

    // ================= AI Generated =================

    transcript: {
      type: String,
      default: "",
    },

    translatedTranscript: {
      type: String,
      default: "",
    },

    summary: {
      type: String,
      default: "",
    },

    seoTitle: {
      type: String,
      default: "",
    },

    seoDescription: {
      type: String,
      default: "",
    },

    chapters: [
      {
        title: {
          type: String,
          default: "",
        },

        startTime: {
          type: Number,
          default: 0,
        },
      },
    ],

    // ================= Analytics =================

    views: {
      type: Number,
      default: 0,
    },

    likes: {
      type: Number,
      default: 0,
    },

    dislikes: {
      type: Number,
      default: 0,
    },

    bookmarks: {
      type: Number,
      default: 0,
    },

    shares: {
      type: Number,
      default: 0,
    },

    likedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    dislikedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    bookmarkedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // ================= AI Progress =================

    progress: {
      upload: {
        type: Number,
        default: 100,
      },

      transcript: {
        type: Number,
        default: 0,
      },

      summary: {
        type: Number,
        default: 0,
      },

      article: {
        type: Number,
        default: 0,
      },

      chapters: {
        type: Number,
        default: 0,
      },

      translation: {
        type: Number,
        default: 0,
      },

      seo: {
        type: Number,
        default: 0,
      },

      podcast: {
        type: Number,
        default: 0,
      },
    },

    // ================= Status =================

    status: {
      type: String,
      enum: [
        "processing",
        "published",
        "draft",
        "failed",
      ],
      default: "processing",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IContent>(
  "Content",
  ContentSchema
);