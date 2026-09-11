import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";

import api from "../../services/api";

import RelatedVideoCard from "../../components/dashboard/RelatedVideoCard";
import CommentSection from "../../components/comments/CommentSection";

import VideoPlayer from "../../components/video/VideoPlayer";
import PodcastPlayer from "../../components/podcast/PodcastPlayer";
import CreatorCard from "../../components/video/CreatorCard";
import VideoActions from "../../components/video/VideoActions";
import DescriptionCard from "../../components/video/DescriptionCard";
import ChapterList from "../../components/video/ChapterList";
import ShareModal from "../../components/common/ShareModal";

import "./WatchVideoPage.css";

interface Chapter {
  title: string;
  startTime: number;
}

interface Creator {
  _id?: string;
  name: string;
  avatar?: string;
  followers?: string[];
}

interface Content {
  _id: string;

  title: string;
  description: string;

  thumbnail: string;
  originalVideo: string;
  podcastAudio?: string;

  summary: string;
  article: string;
  transcript: string;

  category: string;

  creator: Creator;

  chapters: Chapter[];

  views: number;

  likes: number;
  dislikes: number;
  bookmarks: number;
  shares: number;

  liked: boolean;
  disliked: boolean;
  bookmarked: boolean;
  isFollowing?: boolean;

  createdAt: string;
}

export default function WatchVideoPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [video, setVideo] =
    useState<Content | null>(null);

  const [allVideos, setAllVideos] =
    useState<Content[]>([]);

  const [activeFormat, setActiveFormat] = useState<"video" | "podcast" | "article">("video");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    fetchVideo();
    fetchVideos();
  }, [id]);



  const handleLike = async () => {
    if (!video) return;
    try {
      const res = await api.post(
        `/content/${video._id}/like`
      );

      setVideo((prev) =>
        prev
          ? {
            ...prev,
            likes: res.data.likes,
            dislikes: res.data.dislikes,
            liked: res.data.liked,
            disliked: false,
          }
          : prev
      );
    } catch (err) {
      console.log(err);
    }
  };

  const handleDislike = async () => {
    if (!video) return;
    try {
      const res = await api.post(
        `/content/${video._id}/dislike`
      );

      setVideo((prev) =>
        prev
          ? {
            ...prev,
            likes: res.data.likes,
            dislikes: res.data.dislikes,
            liked: false,
            disliked: res.data.disliked,
          }
          : prev
      );
    } catch (err) {
      console.log(err);
    }
  };

  const handleBookmark = async () => {
    if (!video) return;
    try {
      const res = await api.post(
        `/content/${video._id}/bookmark`
      );

      setVideo((prev) =>
        prev
          ? {
            ...prev,
            bookmarks: res.data.bookmarks,
            bookmarked: res.data.bookmarked,
          }
          : prev
      );
    } catch (err) {
      console.log(err);
    }
  };

  const handleFollow = async () => {
    if (!video || !video.creator?._id) return;
    try {
      const res = await api.post(`/user/${video.creator._id}/follow`);
      setVideo((prev) => {
        if (!prev) return prev;
        
        // Update followers array length by generating a dummy array of the correct length
        const newFollowers = Array(res.data.followersCount).fill("");

        return {
          ...prev,
          isFollowing: res.data.isFollowing,
          creator: {
            ...prev.creator,
            followers: newFollowers
          }
        };
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = async () => {
    if (!video) return;
    setIsShareModalOpen(true);
    try {
      const res = await api.post(
        `/content/${video._id}/share`
      );

      setVideo((prev) =>
        prev
          ? {
            ...prev,
            shares: res.data.shares,
          }
          : prev
      );
    } catch (err) {
      console.log(err);
    }
  };
  const handleDownload = () => {
    if (!video) return;
    const link = document.createElement("a");

    link.href = video.originalVideo;

    link.download = `${video.title}.mp4`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  const handleValidView = async () => {
    try {
      const res = await api.post(`/content/${id}/view`);
      // Update local view count if the backend registered a new view
      if (res.data.success && res.data.views) {
        setVideo((prev) => prev ? { ...prev, views: res.data.views } : prev);
      }
    } catch (err) {
      console.log("Failed to register view:", err);
    }
  };

  const fetchVideo = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/content/${id}`);
      setVideo(res.data.content);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVideos = async () => {
    try {
      const res = await api.get("/content");
      setAllVideos(res.data.content);
    } catch (err) {
      console.log(err);
    }
  };

  const relatedVideos = useMemo(() => {
    if (!video || !allVideos) return [];
    
    const scoredVideos = allVideos
      .filter(item => item._id !== video._id)
      .map(item => {
        let score = 0;

        // 1. Same Creator
        const itemCreatorId = typeof item.creator === 'object' ? item.creator?._id : item.creator;
        const videoCreatorId = typeof video.creator === 'object' ? video.creator?._id : video.creator;
        if (itemCreatorId && videoCreatorId && itemCreatorId === videoCreatorId) {
          score += 50;
        }

        // 2. Same Category
        if (item.category === video.category) {
          score += 30;
        }

        // 3. Shared SEO / Title Keywords
        if (item.title && video.title) {
          const videoWords = video.title.toLowerCase().split(' ').filter((w: string) => w.length > 3);
          const itemWords = item.title.toLowerCase().split(' ').filter((w: string) => w.length > 3);
          const sharedWords = itemWords.filter((w: string) => videoWords.includes(w));
          score += sharedWords.length * 10;
        }

        // 4. Popularity (Views and Likes)
        score += (item.views || 0) * 0.1;
        score += (item.likes || 0) * 0.5;

        return { ...item, score };
      });

    // Sort by score descending and take top 10 recommendations
    return scoredVideos.sort((a, b) => b.score - a.score).slice(0, 10);
  }, [allVideos, video]);

  const extractedHashtags = useMemo(() => {
    if (!video || !video.description) return [];
    // Natively extract #tags from the description
    const matches = video.description.match(/#[\w-]+/g);
    return matches ? matches.slice(0, 3) : []; // Show max 3 like YouTube
  }, [video]);

  if (loading && !video) {
    return (
      <DashboardLayout>
        <div className="loading-page">
          Loading...
        </div>
      </DashboardLayout>
    );
  }

  if (!video) {
    return (
      <DashboardLayout>
        <div className="loading-page">
          Unable to load this content.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="watch-container">
        <div className="watch-main">

          {/* Format Switcher */}
          <div className="format-switcher" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button
              className={`secondary-btn ${activeFormat === "video" ? "active" : ""}`}
              onClick={() => setActiveFormat("video")}
              style={{ background: activeFormat === "video" ? "#0fb3a0" : "transparent", borderColor: activeFormat === "video" ? "#0fb3a0" : "rgba(255,255,255,.06)", opacity: activeFormat === "video" ? 1 : 0.7 }}
            >
              🎥 Video
            </button>
            <button
              className={`secondary-btn ${activeFormat === "podcast" ? "active" : ""}`}
              onClick={() => { if (video.podcastAudio) setActiveFormat("podcast") }}
              style={{ background: activeFormat === "podcast" ? "#0fb3a0" : "transparent", borderColor: activeFormat === "podcast" ? "#0fb3a0" : "rgba(255,255,255,.06)", opacity: activeFormat === "podcast" ? 1 : (video.podcastAudio ? 0.7 : 0.3), cursor: video.podcastAudio ? 'pointer' : 'not-allowed' }}
              title={!video.podcastAudio ? "Podcast not generated yet" : ""}
            >
              🎧 Podcast
            </button>
            <button
              className={`secondary-btn ${activeFormat === "article" ? "active" : ""}`}
              onClick={() => { if (video.article) setActiveFormat("article") }}
              style={{ background: activeFormat === "article" ? "#0fb3a0" : "transparent", borderColor: activeFormat === "article" ? "#0fb3a0" : "rgba(255,255,255,.06)", opacity: activeFormat === "article" ? 1 : (video.article ? 0.7 : 0.3), cursor: video.article ? 'pointer' : 'not-allowed' }}
              title={!video.article ? "Article not generated yet" : ""}
            >
              📖 Article
            </button>
          </div>

          {activeFormat === "video" && (
            <div style={{ marginTop: '30px' }}>
              <VideoPlayer
                title={video.title}
                thumbnail={video.thumbnail}
                video={video.originalVideo}
                hashtags={extractedHashtags}
                summary={video.summary}
                article={video.article}
                transcript={video.transcript}
                onValidView={handleValidView}
              />
            </div>
          )}

          {activeFormat === "podcast" && (
            <PodcastPlayer
              title={video.title}
              creator={video.creator.name}
              thumbnail={video.thumbnail}
              audio={video.podcastAudio || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"}
              onValidView={handleValidView}
            />
          )}

          {activeFormat === "article" && (
            <div className="article-view" style={{ padding: '20px', background: '#1e293b', borderRadius: '10px', lineHeight: 1.6, color: '#f8fafc' }}>
              <h1 style={{ marginBottom: '20px' }}>{video.title}</h1>
              <div style={{ whiteSpace: 'pre-wrap' }}>
                {video.article || (
                  <div>
                    <p style={{ fontStyle: "italic", color: "#94a3b8", marginBottom: "1rem" }}>
                      This is a preview of the AI-generated article. The original uploader did not generate an article for this content.
                    </p>
                    <h2>Introduction</h2>
                    <p>Welcome to this exciting content piece. Here we explore fascinating topics related to <strong>{video.category || "technology"}</strong> and modern trends.</p>
                    <h2>Key Takeaways</h2>
                    <ul>
                      <li>Insightful discussion on the main theme.</li>
                      <li>Actionable advice for the audience.</li>
                      <li>Future predictions and next steps.</li>
                    </ul>
                    <h2>Conclusion</h2>
                    <p>Thank you for engaging with our content. We hope you found this AI-generated reading experience valuable!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <CreatorCard
            creator={video.creator}
            views={video.views}
            createdAt={video.createdAt}
            isFollowing={video.isFollowing}
            onFollow={handleFollow}
          />

          <VideoActions
            likes={video.likes}
            dislikes={video.dislikes}
            bookmarks={video.bookmarks}
            shares={video.shares}
            liked={video.liked}
            disliked={video.disliked}
            bookmarked={video.bookmarked}
            onLike={handleLike}
            onDislike={handleDislike}
            onBookmark={handleBookmark}
            onShare={handleShare}
            onDownload={handleDownload}
          />


          <DescriptionCard
            description={video.description}
          />

          {video.chapters &&
            video.chapters.length > 0 && (
              <ChapterList
                chapters={video.chapters}
              />
            )}

          <CommentSection
            contentId={video._id}
          />

          <ShareModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            url={window.location.href}
            title={video.title}
            embedType="video"
          />

        </div>

        <aside className="watch-sidebar">

          <h2 className="sidebar-title">
            Related Videos
          </h2>

          {relatedVideos.map(item => (
            <RelatedVideoCard
              key={item._id}
              video={item}
              onClick={() => {
                // Instantly update the player with the new video data to bypass autoplay blocks
                setVideo(item);
                navigate(`/watch/${item._id}`);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          ))}

        </aside>

      </div>

    </DashboardLayout>
  );
}