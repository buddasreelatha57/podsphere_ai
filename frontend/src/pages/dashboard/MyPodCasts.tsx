import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import "./MypodCasts.css";
import { getMyContent, deleteContent, updateContent } from "../../services/content.service";
import { Edit2, Trash2, Plus } from "lucide-react";

interface Content {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  originalVideo: string;
  status: string;
  visibility: string;
  createdAt: string;

  creator?: {
    _id: string;
    name: string;
    email: string;
  };
}

function ExpandableDescription({ description }: { description: string }) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = description.length > 180;

  if (!description) return null;

  return (
    <div className={`my-podcast-description ${expanded ? "expanded" : ""}`}>
      <p>{description}</p>
      {hasMore && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setExpanded((isExpanded) => !isExpanded);
          }}
          aria-expanded={expanded}
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}

export default function MyPodCasts() {
  const navigate = useNavigate();

  const [videos, setVideos] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editingVideo, setEditingVideo] = useState<Content | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchMyContent();
  }, []);

  const fetchMyContent = async () => {
    try {
      const res = await getMyContent();
      if (res && res.success) {
        setVideos(res.content || []);
      } else {
        setVideos([]);
      }
    } catch (error: any) {
      console.error("API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this content? This action cannot be undone.")) {
      try {
        await deleteContent(id);
        setVideos(videos.filter((v) => v._id !== id));
      } catch (err) {
        console.error("Failed to delete content:", err);
        alert("Failed to delete content");
      }
    }
  };

  const openEditModal = (e: React.MouseEvent, video: Content) => {
    e.stopPropagation();
    setEditingVideo(video);
    setEditTitle(video.title);
    setEditDescription(video.description);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;
    
    setIsUpdating(true);
    try {
      await updateContent(editingVideo._id, { title: editTitle, description: editDescription });
      setVideos(videos.map(v => v._id === editingVideo._id ? { ...v, title: editTitle, description: editDescription } : v));
      setEditingVideo(null);
    } catch (err) {
      console.error("Failed to update content:", err);
      alert("Failed to update content");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="dashboard-page">
        <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>My Podcasts</h1>
            <p>Manage all your uploaded videos and podcasts.</p>
          </div>
          <button 
            className="primary-btn" 
            onClick={() => navigate('/upload')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', background: '#0fb3a0', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            <Plus size={20} /> Upload New
          </button>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <h2>{videos.length}</h2>
            <p>Total Uploads</p>
          </div>
          <div className="stat-card">
            <h2>{videos.filter((v) => v.status === "completed" || v.status === "published").length}</h2>
            <p>Published</p>
          </div>
          <div className="stat-card">
            <h2>{videos.filter((v) => v.status === "draft").length}</h2>
            <p>Drafts</p>
          </div>
          <div className="stat-card">
            <h2>{videos.filter((v) => v.status === "processing").length}</h2>
            <p>Processing</p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ color: "white", textAlign: "center", marginTop: 40 }}>
            Loading...
          </div>
        )}

        {/* Empty */}
        {!loading && videos.length === 0 && (
          <div style={{ color: "white", textAlign: "center", marginTop: 50 }}>
            <h2>No uploads yet.</h2>
            <p>Upload your first video to see it here.</p>
          </div>
        )}

        {/* Videos */}
        {!loading && videos.length > 0 && (
          <>
            <h2 className="section-title">Latest Uploads</h2>
            <div className="video-grid">
              {videos.map((video) => (
                <div
                  className="video-card"
                  key={video._id}
                  onClick={() => navigate(`/watch/${video._id}`)}
                  style={{ position: 'relative', opacity: video.status === 'draft' ? 0.7 : 1 }}
                >
                  {/* Action Buttons */}
                  <div className="card-actions" style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10, display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={(e) => openEditModal(e, video)}
                      style={{ background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={(e) => handleDelete(e, video._id)}
                      style={{ background: 'rgba(220,38,38,0.7)', border: 'none', color: '#fff', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="thumbnail">
                    <img src={video.thumbnail || "https://placehold.co/600x350?text=No+Thumbnail"} alt={video.title} />
                    <div className="play-btn">▶</div>
                  </div>
                  <div className="video-info">
                    <h3>{video.title}</h3>
                    <p>{video.creator?.name || "You"}</p>
                    <ExpandableDescription description={video.description} />
                    <div className="video-footer">
                      <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                      <span className={video.status === "completed" || video.status === "published" ? "status published" : video.status === "draft" ? "status draft" : "status processing"}>
                        {video.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Edit Modal */}
        {editingVideo && (
          <div className="edit-modal-overlay" onClick={() => setEditingVideo(null)}>
            <div className="edit-modal-content" onClick={e => e.stopPropagation()}>
              <h2>Edit Content</h2>
              <form onSubmit={handleUpdate}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#fff' }}>Title</label>
                  <input 
                    type="text" 
                    value={editTitle} 
                    onChange={e => setEditTitle(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #333', background: '#111', color: '#fff' }}
                    required
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#fff' }}>Description</label>
                  <textarea 
                    value={editDescription} 
                    onChange={e => setEditDescription(e.target.value)}
                    rows={4}
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #333', background: '#111', color: '#fff', resize: 'vertical' }}
                    required
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" onClick={() => setEditingVideo(null)} className="secondary-btn" style={{ padding: '8px 16px', background: 'transparent', color: '#fff', border: '1px solid #333', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" disabled={isUpdating} style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

