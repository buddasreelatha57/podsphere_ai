import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import "./MypodCasts.css";
import { getAllContent } from "../../services/content.service";
import { useNavigate } from "react-router-dom";

interface Content {
  _id: string;
  title: string;
  thumbnail: string;
  creator: {
    name: string;
  };
  views: number;
  createdAt: string;
}

export default function Explore() {
  const [videos, setVideos] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await getAllContent();
      setVideos(res.content);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="dashboard-page">
        <div className="dashboard-header">
          <h1>Explore</h1>
          <p>Discover trending and latest content across all categories.</p>
        </div>

        {loading ? (
          <h2>Loading...</h2>
        ) : videos.length === 0 ? (
          <h2>No content available.</h2>
        ) : (
          <div className="video-grid">
            {videos.map((video) => (
              <div
                className="video-card"
                key={video._id}
                onClick={() => navigate(`/watch/${video._id}`)}
                style={{ cursor: "pointer" }}
              >
                <div className="thumbnail">
                  <img src={video.thumbnail} alt={video.title} />
                  <div className="play-btn">▶</div>
                </div>

                <div className="video-info">
                  <h3>{video.title}</h3>
                  <p>{video.creator?.name}</p>
                  <div className="video-footer">
                    <span>{video.views} Views</span>
                    <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
