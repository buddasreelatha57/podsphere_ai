import {
  Heart,
  ThumbsDown,
  Bookmark,
  Share2,
  Download,
} from "lucide-react";

import "./VideoActions.css";

interface Props {
  likes: number;
  dislikes: number;
  bookmarks: number;
  shares: number;

  liked: boolean;
  disliked: boolean;
  bookmarked: boolean;

  onLike: () => void;
  onDislike: () => void;
  onBookmark: () => void;
  onShare: () => void;
  onDownload: () => void;
}

export default function VideoActions({
  likes,
  dislikes,
  bookmarks,
  shares,
  liked,
  disliked,
  bookmarked,
  onLike,
  onDislike,
  onBookmark,
  onShare,
  onDownload,
}: Props) {
  return (
    <div className="video-actions">

      <button
        className={`action-btn ${liked ? "active" : ""}`}
        onClick={onLike}
      >
        <Heart
          size={18}
          fill={liked ? "currentColor" : "none"}
        />
        <span>{likes}</span>
      </button>

      <button
        className={`action-btn ${disliked ? "active" : ""}`}
        onClick={onDislike}
      >
        <ThumbsDown size={18} />
        <span>{dislikes}</span>
      </button>

      <button
        className={`action-btn ${bookmarked ? "active" : ""}`}
        onClick={onBookmark}
      >
        <Bookmark
          size={18}
          fill={bookmarked ? "currentColor" : "none"}
        />
        <span>Save</span>
      </button>

      <button
        className="action-btn"
        onClick={onShare}
      >
        <Share2 size={18} />
        <span>Share</span>
      </button>

      <button
        className="action-btn"
        onClick={onDownload}
      >
        <Download size={18} />
        <span>Download</span>
      </button>

    </div>
  );
}