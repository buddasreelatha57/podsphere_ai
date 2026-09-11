import React, { useState, useEffect } from "react";
import { User, Shield, Lock, Eye, Monitor, Save, Camera } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { updateProfile, updateProfileImages } from "../../services/user.service";
import "./Settings.css";

interface UserProfile {
  name: string;
  email: string;
  bio: string;
  avatar: string;
  banner: string;
}

interface UserSettings {
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
}

export default function Settings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Profile State
  const [profile, setProfile] = useState<UserProfile>({
    name: "", email: "", bio: "", avatar: "", banner: ""
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");
  
  // Settings State
  const [settings, setSettings] = useState<UserSettings>({
    theme: "dark",
    playbackQuality: "auto",
    notifications: true,
    privacy: { isProfilePublic: true, showFollowers: true },
    restrictions: { childSafetyMode: false, childRestrictions: false }
  });

  // Password State
  const [passwords, setPasswords] = useState({
    currentPassword: "", newPassword: "", confirmPassword: ""
  });

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user") || localStorage.getItem("user");
    if (storedUser) {
      try {
        if (JSON.parse(storedUser)?.role === "guest") {
          navigate("/dashboard", { replace: true });
          return;
        }
      } catch {
        // Ignore malformed cached user data and let the API decide.
      }
    }
    fetchUserData();
  }, [navigate]);

  const fetchUserData = async () => {
    try {
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/users/profile/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        if (data.profile?.role === "guest") {
          navigate("/dashboard", { replace: true });
          return;
        }
        setProfile({
          name: data.profile.name || "",
          email: data.profile.email || "",
          bio: data.profile.bio || "",
          avatar: data.profile.avatar || "",
          banner: data.profile.banner || "",
        });
        setAvatarPreview(data.profile.avatar || "");
        setBannerPreview(data.profile.banner || "");
        
        // If the user's DB doesn't have the new settings yet, merge defaults
        if (data.profile.settings) {
          setSettings({
            theme: data.profile.settings.theme || "dark",
            playbackQuality: data.profile.settings.playbackQuality || "auto",
            notifications: data.profile.settings.notifications ?? true,
            privacy: {
              isProfilePublic: data.profile.settings.privacy?.isProfilePublic ?? true,
              showFollowers: data.profile.settings.privacy?.showFollowers ?? true,
            },
            restrictions: {
              childSafetyMode: data.profile.settings.restrictions?.childSafetyMode ?? false,
              childRestrictions: data.profile.settings.restrictions?.childRestrictions ?? false,
            }
          });
        }
      }
    } catch (err) {
      toast.error("Failed to load settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let updatedUser: UserProfile;

      if (avatarFile || bannerFile) {
        const formData = new FormData();
        formData.append("name", profile.name);
        formData.append("bio", profile.bio);
        if (avatarFile) formData.append("avatar", avatarFile);
        if (bannerFile) formData.append("banner", bannerFile);

        const response = await updateProfileImages(formData);
        updatedUser = response.user;
      } else {
        const response = await updateProfile(profile);
        updatedUser = response.user;
      }

      setProfile((currentProfile) => ({ ...currentProfile, ...updatedUser }));
      setAvatarFile(null);
      setBannerFile(null);
      setAvatarPreview(updatedUser.avatar || "");
      setBannerPreview(updatedUser.banner || "");
      toast.success("Profile updated successfully!");

      const localUser = JSON.parse(
        sessionStorage.getItem("user") || localStorage.getItem("user") || "{}"
      );
      const updatedLocalUser = { ...localUser, ...updatedUser };
      if (sessionStorage.getItem("user")) {
        sessionStorage.setItem("user", JSON.stringify(updatedLocalUser));
      } else {
        localStorage.setItem("user", JSON.stringify(updatedLocalUser));
      }
    } catch (err) {
      toast.error("Network error.");
    } finally {
      setSaving(false);
    }
  };

  const handleSettingsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/users/settings", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ settings })
      });
      if (res.ok) {
        toast.success("Settings saved successfully!");
        document.documentElement.setAttribute("data-theme", settings.theme);
        
        // Update local user object
        try {
          const localUser = JSON.parse(localStorage.getItem("user") || "{}");
          localUser.settings = { ...(localUser.settings || {}), ...settings };
          localStorage.setItem("user", JSON.stringify(localUser));
        } catch(e) {}
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to update settings.");
      }
    } catch (err) {
      toast.error("Network error.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error("New passwords do not match!");
    }
    
    setSaving(true);
    try {
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/users/password", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        })
      });
      if (res.ok) {
        toast.success("Password updated successfully!");
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to update password.");
      }
    } catch (err) {
      toast.error("Network error.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (category: 'privacy' | 'restrictions', key: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...(prev as any)[category],
        [key]: !(prev as any)[category][key]
      }
    }));
  };

  if (loading) {
    return <div className="settings-loader"><div className="spinner"></div></div>;
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Account Settings</h1>
        <p>Manage your profile, privacy, and preferences.</p>
      </div>

      <div className="settings-layout">
        {/* Sidebar Menu */}
        <aside className="settings-sidebar glass-panel">
          <nav>
            <button 
              className={`settings-nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={18} /> Profile
            </button>
            <button 
              className={`settings-nav-btn ${activeTab === 'restrictions' ? 'active' : ''}`}
              onClick={() => setActiveTab('restrictions')}
            >
              <Shield size={18} /> Permissions & Restrictions
            </button>
            <button 
              className={`settings-nav-btn ${activeTab === 'privacy' ? 'active' : ''}`}
              onClick={() => setActiveTab('privacy')}
            >
              <Eye size={18} /> Privacy
            </button>
            <button 
              className={`settings-nav-btn ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <Lock size={18} /> Passwords & Security
            </button>
            <button 
              className={`settings-nav-btn ${activeTab === 'appearance' ? 'active' : ''}`}
              onClick={() => setActiveTab('appearance')}
            >
              <Monitor size={18} /> Appearance & Playback
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="settings-content glass-panel">
          
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <form className="settings-form" onSubmit={handleProfileSave}>
              <div className="form-header">
                <h2>Public Profile</h2>
                <p>This is how others will see you on the platform.</p>
              </div>

              <div className="profile-images">
                <div className="avatar-upload">
                  <img src={avatarPreview || "https://via.placeholder.com/100"} alt="Avatar" className="settings-avatar" />
                  <div className="upload-overlay"><Camera size={20} /></div>
                </div>
                <div className="form-group flex-1">
                  <label>Profile Picture</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="settings-input"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setAvatarFile(file);
                      setAvatarPreview(file ? URL.createObjectURL(file) : profile.avatar);
                    }}
                  />
                </div>
              </div>

              <div className="form-group mt-4">
                <label>Banner Image</label>
                <input
                  type="file"
                  accept="image/*"
                  className="settings-input"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setBannerFile(file);
                    setBannerPreview(file ? URL.createObjectURL(file) : profile.banner);
                  }}
                />
                {bannerPreview && (
                  <img src={bannerPreview} alt="Banner preview" className="settings-banner-preview" />
                )}
              </div>

              <div className="form-group">
                <label>Display Name</label>
                <input type="text" className="settings-input" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} required />
              </div>

              <div className="form-group">
                <label>Bio</label>
                <textarea className="settings-input" rows={4} value={profile.bio} onChange={(e) => setProfile({...profile, bio: e.target.value})} placeholder="Tell us about yourself..." />
              </div>

              <div className="form-actions">
                <button type="submit" className="settings-btn-primary" disabled={saving}>
                  <Save size={16} /> {saving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          )}

          {/* PERMISSIONS TAB */}
          {activeTab === 'restrictions' && (
            <form className="settings-form" onSubmit={handleSettingsSave}>
              <div className="form-header">
                <h2>Permissions & Restrictions</h2>
                <p>Manage what content you see and how your data is used.</p>
              </div>

              <div className="toggle-group">
                <div className="toggle-info">
                  <h4>Child Safety Mode</h4>
                  <p>Any adult and explicit content will not be shown in feeds and search results.</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={settings.restrictions.childSafetyMode} onChange={() => handleToggle('restrictions', 'childSafetyMode')} />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="toggle-group">
                <div className="toggle-info">
                  <h4>Child Restrictions</h4>
                  <p>Filter out content inappropriate for children.</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={settings.restrictions.childRestrictions} onChange={() => handleToggle('restrictions', 'childRestrictions')} />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="settings-btn-primary" disabled={saving}>
                  <Save size={16} /> {saving ? "Saving..." : "Save Preferences"}
                </button>
              </div>
            </form>
          )}

          {/* PRIVACY TAB */}
          {activeTab === 'privacy' && (
            <form className="settings-form" onSubmit={handleSettingsSave}>
              <div className="form-header">
                <h2>Privacy Settings</h2>
                <p>Control who can see your profile and activity.</p>
              </div>

              <div className="toggle-group">
                <div className="toggle-info">
                  <h4>Public Profile</h4>
                  <p>Allow anyone to view your profile and the content you've uploaded.</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={settings.privacy.isProfilePublic} onChange={() => handleToggle('privacy', 'isProfilePublic')} />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="toggle-group">
                <div className="toggle-info">
                  <h4>Show Abhiman</h4>
                  <p>Display your follower and following counts on your profile page.</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={settings.privacy.showFollowers} onChange={() => handleToggle('privacy', 'showFollowers')} />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="settings-btn-primary" disabled={saving}>
                  <Save size={16} /> {saving ? "Saving..." : "Save Privacy Settings"}
                </button>
              </div>
            </form>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <form className="settings-form" onSubmit={handlePasswordSave}>
              <div className="form-header">
                <h2>Passwords & Security</h2>
                <p>Update your password to keep your account secure.</p>
              </div>

              <div className="form-group">
                <label>Current Password</label>
                <input type="password" className="settings-input" value={passwords.currentPassword} onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})} required />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input type="password" className="settings-input" value={passwords.newPassword} onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})} required minLength={6} />
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <input type="password" className="settings-input" value={passwords.confirmPassword} onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})} required minLength={6} />
              </div>

              <div className="form-actions">
                <button type="submit" className="settings-btn-primary" disabled={saving}>
                  <Lock size={16} /> {saving ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          )}

          {/* APPEARANCE TAB */}
          {activeTab === 'appearance' && (
            <form className="settings-form" onSubmit={handleSettingsSave}>
              <div className="form-header">
                <h2>Appearance & Playback</h2>
                <p>Customize how PodSphere looks and feels.</p>
              </div>

              <div className="form-group">
                <label>Theme</label>
                <select className="settings-input select" value={settings.theme} onChange={(e) => setSettings({...settings, theme: e.target.value as any})}>
                  <option value="dark">Dark Mode (Default)</option>
                  <option value="light">Light Mode</option>
                </select>
              </div>

              <div className="form-group">
                <label>Default Playback Quality</label>
                <select className="settings-input select" value={settings.playbackQuality} onChange={(e) => setSettings({...settings, playbackQuality: e.target.value as any})}>
                  <option value="auto">Auto (Recommended)</option>
                  <option value="1080p">1080p HD</option>
                  <option value="720p">720p</option>
                  <option value="480p">480p</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="submit" className="settings-btn-primary" disabled={saving}>
                  <Save size={16} /> {saving ? "Saving..." : "Save Preferences"}
                </button>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}
