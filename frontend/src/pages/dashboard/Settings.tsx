import { useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { updateSettings, updateProfile } from "../../services/user.service";
import { User, Shield, Lock, Eye, Monitor } from "lucide-react";
import "./Settings.css";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [playbackQuality, setPlaybackQuality] = useState<"auto" | "1080p" | "720p" | "480p">("auto");
  const [notifications, setNotifications] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [name, setName] = useState("Sree");
  const [email, setEmail] = useState("sree@example.com");

  const [ageRestriction, setAgeRestriction] = useState(false);
  const [privateProfile, setPrivateProfile] = useState(false);
  const [hideHistory, setHideHistory] = useState(false);

  const handleSaveSettings = async () => {
    setLoading(true);
    setMessage("");
    try {
      await updateSettings({ theme, playbackQuality, notifications });
      setMessage("Settings saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Failed to save settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setMessage("");
    try {
      await updateProfile({ name, email });
      setMessage("Profile updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="settings-page">
        {/* Sidebar */}
        <aside className="settings-sidebar">
          <div className="settings-sidebar-header">
            <h2>Settings</h2>
          </div>
          <nav className="settings-nav">
            <button className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
              <User size={18} /> Profile
            </button>
            <button className={`settings-tab ${activeTab === 'permissions' ? 'active' : ''}`} onClick={() => setActiveTab('permissions')}>
              <Shield size={18} /> Permissions & Restrictions
            </button>
            <button className={`settings-tab ${activeTab === 'privacy' ? 'active' : ''}`} onClick={() => setActiveTab('privacy')}>
              <Eye size={18} /> Privacy
            </button>
            <button className={`settings-tab ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
              <Lock size={18} /> Passwords & Security
            </button>
            <button className={`settings-tab ${activeTab === 'appearance' ? 'active' : ''}`} onClick={() => setActiveTab('appearance')}>
              <Monitor size={18} /> Appearance & Playback
            </button>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="settings-content">
          {message && (
            <div style={{ background: message.includes("success") ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)", color: message.includes("success") ? "#10b981" : "#ef4444", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", border: `1px solid ${message.includes("success") ? "#10b981" : "#ef4444"}` }}>
              {message}
            </div>
          )}

          {activeTab === 'profile' && (
            <div>
              <h1 className="settings-section-title">Public Profile</h1>
              <p className="settings-section-desc">Manage how you appear to others on PodSphere.</p>
              
              <div className="settings-card">
                <h3>Basic Information</h3>
                <div className="form-group">
                  <label>Display Name</label>
                  <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <button className="primary-btn" onClick={handleSaveProfile} disabled={loading}>Save Profile</button>
              </div>
            </div>
          )}

          {activeTab === 'permissions' && (
            <div>
              <h1 className="settings-section-title">Permissions & Restrictions</h1>
              <p className="settings-section-desc">Control what kind of content you interact with.</p>
              
              <div className="settings-card">
                <div className="flex-row">
                  <div className="flex-col">
                    <h4>Age Restricted Content</h4>
                    <p>Filter out content that may be inappropriate for some users.</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" checked={ageRestriction} onChange={() => setAgeRestriction(!ageRestriction)} />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div>
              <h1 className="settings-section-title">Privacy</h1>
              <p className="settings-section-desc">Manage who can see your activity.</p>
              
              <div className="settings-card">
                <div className="flex-row">
                  <div className="flex-col">
                    <h4>Private Profile</h4>
                    <p>Only your abhiman can see your content and activity.</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" checked={privateProfile} onChange={() => setPrivateProfile(!privateProfile)} />
                    <span className="slider round"></span>
                  </label>
                </div>
                <div className="flex-row">
                  <div className="flex-col">
                    <h4>Hide Watch History</h4>
                    <p>Do not show your recently watched videos on your public profile.</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" checked={hideHistory} onChange={() => setHideHistory(!hideHistory)} />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <h1 className="settings-section-title">Passwords & Security</h1>
              <p className="settings-section-desc">Keep your account secure.</p>
              
              <div className="settings-card">
                <h3>Change Password</h3>
                <div className="form-group">
                  <label>Current Password</label>
                  <input type="password" className="form-control" placeholder="••••••••" />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input type="password" className="form-control" placeholder="••••••••" />
                </div>
                <button className="primary-btn">Update Password</button>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div>
              <h1 className="settings-section-title">Appearance & Playback</h1>
              <p className="settings-section-desc">Customize your viewing experience.</p>
              
              <div className="settings-card">
                <h3>App Theme</h3>
                <div className="form-group" style={{ display: 'flex', gap: '20px' }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: '14px' }}>
                    <input type="radio" checked={theme === "dark"} onChange={() => setTheme("dark")} /> Dark Theme
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: '14px' }}>
                    <input type="radio" checked={theme === "light"} onChange={() => setTheme("light")} /> Light Theme
                  </label>
                </div>
              </div>

              <div className="settings-card">
                <h3>Default Video Quality</h3>
                <div className="form-group">
                  <select
                    value={playbackQuality}
                    onChange={(e) => setPlaybackQuality(e.target.value as any)}
                    className="form-control"
                  >
                    <option value="auto">Auto (Recommended)</option>
                    <option value="1080p">1080p HD</option>
                    <option value="720p">720p</option>
                    <option value="480p">480p Data Saver</option>
                  </select>
                </div>
              </div>

              <div className="settings-card">
                <div className="flex-row">
                  <div className="flex-col">
                    <h4>Email Notifications</h4>
                    <p>Receive emails when creators you follow upload new content.</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" checked={notifications} onChange={() => setNotifications(!notifications)} />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>

              <button className="primary-btn" onClick={handleSaveSettings} disabled={loading}>
                {loading ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          )}
        </main>
      </div>
    </DashboardLayout>
  );
}
