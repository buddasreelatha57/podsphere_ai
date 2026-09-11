import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  banner?: string;
  bio?: string;
  role: "user" | "admin";
  isVerified: boolean;
  watchHistory: {
    contentId: mongoose.Types.ObjectId;
    viewedAt: Date;
  }[];
  settings: {
    theme: "light" | "dark";
    playbackQuality: "auto" | "1080p" | "720p" | "480p";
    notifications: boolean;
    privacy: {
      isProfilePublic: boolean;
      showFollowers: boolean;
    };
    restrictions: {
      childSafetyMode: boolean;
      childRestrictions: boolean;
    };
  };
  followers: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
  lastActiveAt?: Date;
  country?: string;
  deviceType?: "Web" | "Android" | "iOS" | "Unknown";
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    avatar: {
      type: String,
      default: "",
    },
    
    banner: {
      type: String,
      default: "",
    },
    
    bio: {
      type: String,
      default: "No bio yet.",
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
    watchHistory: [
      {
        contentId: {
          type: Schema.Types.ObjectId,
          ref: "Content",
          required: true,
        },
        viewedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    settings: {
      theme: {
        type: String,
        enum: ["light", "dark"],
        default: "dark",
      },
      playbackQuality: {
        type: String,
        enum: ["auto", "1080p", "720p", "480p"],
        default: "auto",
      },
      notifications: {
        type: Boolean,
        default: true,
      },
      privacy: {
        isProfilePublic: { type: Boolean, default: true },
        showFollowers: { type: Boolean, default: true }
      },
      restrictions: {
        childSafetyMode: { type: Boolean, default: false },
        childRestrictions: { type: Boolean, default: false }
      }
    },
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
    country: {
      type: String,
      default: "Unknown",
    },
    deviceType: {
      type: String,
      enum: ["Web", "Android", "iOS", "Unknown"],
      default: "Unknown",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>("User", userSchema);