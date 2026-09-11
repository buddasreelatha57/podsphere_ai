import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema(
  {
    content: {
      type: Schema.Types.ObjectId,
      ref: "Content",
      required: true,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    likes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Comment", commentSchema);