import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { updateProfile, updateProfileImages } from "../../services/user.service";
import api from "../../services/api";
import { X, Edit2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./MypodCasts.css";
import "./Profile.css";

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [content, setContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"videos" | "podcasts" | "articles" | "analytics">("videos");
  const navigate = useNavigate();

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await api.get("/user/profile/me");
      setProfile(res.data.profile);
      setContent(res.data.content);

      // Init modal state
      setEditName(res.data.profile.name || "");
      setEditBio(res.data.profile.bio || "");
      setAvatarFile(null);
      setBannerFile(null);
    } catch (err) {
      console.log(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      let updatedUser: Record<string, unknown>;

      if (avatarFile || bannerFile) {
        const formData = new FormData();
        formData.append("name", editName);
        formData.append("bio", editBio);
        if (avatarFile) formData.append("avatar", avatarFile);
        if (bannerFile) formData.append("banner", bannerFile);

        const response = await updateProfileImages(formData);
        updatedUser = response.user;
      } else {
        const response = await updateProfile({
          name: editName,
          bio: editBio,
        });
        updatedUser = response.user;
      }

      setProfile((currentProfile: Record<string, unknown>) => ({ ...currentProfile, ...updatedUser }));
      setAvatarFile(null);
      setBannerFile(null);
      setShowModal(false);
      fetchProfile();
    } catch (err) {
      console.log(err);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <DashboardLayout><div className="loading-page">Loading...</div></DashboardLayout>;
  }

  if (error || !profile) {
    return (
      <DashboardLayout>
        <div className="loading-page" style={{ color: '#ff4b4b' }}>
          Failed to load profile data. This is likely due to the backend being disconnected from the database.
        </div>
      </DashboardLayout>
    );
  }

  // Filter content based on active tab
  const filteredContent = content.filter(item => {
    if (activeTab === "videos") return item.originalVideo;
    if (activeTab === "podcasts") return item.podcastAudio;
    if (activeTab === "articles") return item.article;
    return false;
  });

  // Calculate analytics
  const totalViews = content.reduce((sum, item) => sum + (item.views || 0), 0);
  const totalLikes = content.reduce((sum, item) => sum + (item.likes || 0), 0);
  const totalShares = content.reduce((sum, item) => sum + (item.shares || 0), 0);
  const totalBookmarks = content.reduce((sum, item) => sum + (item.bookmarks || 0), 0);
  const profileName = typeof profile.name === "string" && profile.name.trim()
    ? profile.name
    : "Creator";
  const isGuest = profile.role === "guest";

  return (
    <DashboardLayout>
      <div className="channel-page">
        {/* Banner */}
        <div
          className="channel-banner"
          style={{ backgroundImage: profile.banner ? `url(${profile.banner})` : 'linear-gradient(to right, #0f2027, #203a43, #2c5364)' }}
        ></div>

        {/* Header Info */}
        <div className="channel-header">
          <div className="channel-info-wrapper">
            {profile.avatar ? (
              <img src={profile.avatar} alt="Avatar" className="channel-avatar" />
            ) : (
              <div className="channel-avatar">
                {profileName.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="channel-info">
              <h1>{profileName}</h1>
              <div className="channel-stats">
                <span>{profile.followers?.length || 0} abhiman</span>
                <span>•</span>
                <span>{content.length} videos</span>
                <span>•</span>
                <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="channel-bio">{profile.bio}</p>
            </div>
          </div>

          {!isGuest && (
            <div className="channel-actions">
              <button className="secondary-btn" onClick={() => { setAvatarFile(null); setBannerFile(null); setShowModal(true); }}>
                <Edit2 size={16} /> Customize Channel
              </button>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="channel-tabs">
          <button className={`channel-tab ${activeTab === "videos" ? "active" : ""}`} onClick={() => setActiveTab("videos")}>Videos</button>
          <button className={`channel-tab ${activeTab === "podcasts" ? "active" : ""}`} onClick={() => setActiveTab("podcasts")}>Podcasts</button>
          <button className={`channel-tab ${activeTab === "articles" ? "active" : ""}`} onClick={() => setActiveTab("articles")}>Articles</button>
          <button className={`channel-tab ${activeTab === "analytics" ? "active" : ""}`} onClick={() => setActiveTab("analytics")}>Analytics</button>
        </div>

        {/* Content Grid */}
        {activeTab !== "analytics" ? (
          <div className="video-grid" style={{ padding: '0 40px' }}>
            {filteredContent.map((video) => (
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
                  <p>{profileName}</p>
                  <div className="video-footer">
                    <span>{video.views} Views</span>
                    <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
            {filteredContent.length === 0 && (
              <div style={{ color: '#94a3b8', padding: '40px 0' }}>No {activeTab} available yet.</div>
            )}
          </div>
        ) : (
          <div className="analytics-dashboard">
            <h2 style={{ color: '#fff', marginBottom: '10px' }}>Channel Overview</h2>
            <div className="analytics-grid">
              <div className="analytics-card">
                <h3>Total Views</h3>
                <p className="counter" style={{ margin: '10px 0 0 0', display: 'inline-block' }}>{totalViews}</p>
              </div>
              <div className="analytics-card">
                <h3>Total Likes</h3>
                <p className="counter" style={{ margin: '10px 0 0 0', display: 'inline-block' }}>{totalLikes}</p>
              </div>
              <div className="analytics-card">
                <h3>Total Shares</h3>
                <p className="counter" style={{ margin: '10px 0 0 0', display: 'inline-block' }}>{totalShares}</p>
              </div>
              <div className="analytics-card">
                <h3>Total Saves</h3>
                <p className="counter" style={{ margin: '10px 0 0 0', display: 'inline-block' }}>{totalBookmarks}</p>
              </div>
            </div>

            <h2 style={{ color: '#fff', marginTop: '40px', marginBottom: '10px' }}>Content Performance</h2>
            <div className="analytics-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {content.map(item => (
                <div key={item._id} className="analytics-list-item" style={{ display: 'flex', gap: '20px', background: '#1f1f1f', padding: '15px', borderRadius: '12px', alignItems: 'center' }}>
                  <img src={item.thumbnail} style={{ width: '120px', height: '68px', objectFit: 'cover', borderRadius: '8px' }} />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#fff', fontSize: '16px' }}>{item.title}</h4>
                    <div style={{ display: 'flex', gap: '20px', color: '#94a3b8', fontSize: '14px', alignItems: 'center' }}>
                      <span><strong className="counter" style={{ padding: '2px 6px', margin: '0 4px 0 0' }}>{item.views}</strong> Views</span>
                      <span><strong className="counter" style={{ padding: '2px 6px', margin: '0 4px 0 0' }}>{item.likes}</strong> Likes</span>
                      <span><strong className="counter" style={{ padding: '2px 6px', margin: '0 4px 0 0' }}>{item.shares}</strong> Shares</span>
                      <span><strong className="counter" style={{ padding: '2px 6px', margin: '0 4px 0 0' }}>{item.bookmarks}</strong> Saves</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Customize Channel</h2>
              <button className="close-btn" onClick={() => { setAvatarFile(null); setBannerFile(null); setShowModal(false); }}><X size={24} /></button>
            </div>

            <div className="form-group">
              <label>Channel Name</label>
              <input type="text" className="form-control" value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>

            <div className="form-group" style={{ marginTop: '15px' }}>
              <label>Description (Bio)</label>
              <textarea
                className="form-control"
                rows={3}
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Tell viewers about your channel..."
              ></textarea>
            </div>

            <div className="form-group" style={{ marginTop: '15px' }}>
              <label>Profile Picture</label>
              <input type="file" accept="image/*" className="form-control" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
            </div>

            <div className="form-group" style={{ marginTop: '15px' }}>
              <label>Banner Image</label>
              <input type="file" accept="image/*" className="form-control" onChange={(e) => setBannerFile(e.target.files?.[0] || null)} />
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => { setAvatarFile(null); setBannerFile(null); setShowModal(false); }}>Cancel</button>
              <button className="btn-save" onClick={handleUpdate} disabled={saving}>
                {saving ? "Saving..." : "Publish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
