import React, { useState } from "react";
import "./RelatedCard.css";

interface Props {
  video: any;
  onClick?: () => void;
}

export default function RelatedVideoCard({ video, onClick }: Props) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="related-card"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      {isHovered && video.originalVideo ? (
        <video 
          src={video.originalVideo}
          className="hover-preview-video"
          muted
          autoPlay
          loop
          playsInline
          controls={false}
          disablePictureInPicture
          style={{ pointerEvents: "none" }}
        />
      ) : (
        <img src={video.thumbnail} alt={video.title} />
      )}

      <div className="related-info">
        <h4>{video.title}</h4>
        <p className="creator-name">{video.creator?.name || "Unknown Creator"}</p>
        <div className="stats-row">
          <span>{video.views || 0} views</span>
          <span className="dot">•</span>
          <span>{new Date(video.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>
    </div>
  );
}