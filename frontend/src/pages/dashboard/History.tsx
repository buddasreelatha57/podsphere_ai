import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import "./History.css";
import { getHistory } from "../../services/user.service";
import { useNavigate } from "react-router-dom";

interface HistoryItem {
  _id: string;
  title: string;
  thumbnail: string;
  creator: {
    name: string;
  };
  views: number;
  viewedAt: string;
}

type HistoryFilter = "all" | "week" | "older";

export default function History() {
  const [videos, setVideos] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<HistoryFilter>("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await getHistory();
      setVideos(res.history);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVideos = videos.filter((video) => {
    if (filter === "all") return true;

    const viewedAt = new Date(video.viewedAt).getTime();
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    return filter === "week" ? viewedAt >= weekAgo : viewedAt < weekAgo;
  });

  return (
    <DashboardLayout>
      <div className="dashboard-page">
        <div className="dashboard-header">
          <div>
            <h1>Watch History</h1>
            <p>Your recently watched videos and podcasts.</p>
          </div>
          <label className="history-filter">
            <span className="sr-only">Filter watch history</span>
            <select value={filter} onChange={(e) => setFilter(e.target.value as HistoryFilter)}>
              <option value="all">All history</option>
              <option value="week">Last 7 days</option>
              <option value="older">Older than 7 days</option>
            </select>
          </label>
        </div>

        {loading ? (
          <h2>Loading...</h2>
        ) : videos.length === 0 ? (
          <h2>No watch history.</h2>
        ) : filteredVideos.length === 0 ? (
          <h2>No history found for this filter.</h2>
        ) : (
          <div className="history-list">
            {filteredVideos.map((video, index) => (
              <div
                className="history-card"
                key={video._id + index}
                onClick={() => navigate(`/watch/${video._id}`)}
              >
                <div className="history-thumbnail">
                  <img src={video.thumbnail} alt={video.title} />
                  <div className="history-play-btn">▶</div>
                </div>

                <div className="history-info">
                  <h3>{video.title}</h3>
                  <p>{video.creator?.name || "Unknown Creator"}</p>
                  <div className="history-footer">
                    <span>Viewed: {new Date(video.viewedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
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
