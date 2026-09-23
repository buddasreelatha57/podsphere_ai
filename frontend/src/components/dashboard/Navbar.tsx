import { Bell, Search, Mic, Check, Menu } from "lucide-react";
import { toast } from "react-toastify";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "../../services/notification.service";
import api from "../../services/api";

import "./Navbar.css";

type SpeechRecognitionResultEvent = {
  resultIndex: number;
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const [term, setTerm] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    return () => recognitionRef.current?.stop();
  }, []);

  useEffect(() => {
    const storage = sessionStorage.getItem("user") ? sessionStorage : localStorage;
    const userData = storage.getItem("user");

    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }

    const refreshUser = async () => {
      try {
        const response = await api.get("/users/profile/me");
        const profile = response.data?.profile;

        if (!profile) return;

        setUser((currentUser: any) => {
          const updatedUser = { ...(currentUser || {}), ...profile };
          storage.setItem("user", JSON.stringify(updatedUser));
          return updatedUser;
        });
      } catch (error) {
        console.error("Failed to refresh navbar profile", error);
      }
    };

    if (userData) refreshUser();
  }, []);
  const avatar = user?.avatar || user?.photoURL || "/avatar.png";

  useEffect(() => {
    fetchNotifications();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      if (res.success) {
        setNotifications(res.notifications);
      }
    } catch (err) {
      console.error("Failed to load notifications");
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error("Failed to mark as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all as read");
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const toggleVoiceSearch = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const speechWindow = window as typeof window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    const SpeechRecognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Voice search is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const transcript = event.results[event.resultIndex]?.[0]?.transcript;
      if (transcript) setTerm(transcript);
    };
    recognition.onerror = () => {
      setIsListening(false);
      toast.error("Voice search could not access the microphone.");
    };
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  };

  return (
    <header className="dashboard-navbar">

      <button className="mobile-menu-btn" onClick={onMenuClick} aria-label="Open sidebar">
        <Menu size={22} />
      </button>

      <div className="search-box">
        {term === "" && <Search size={18} />}
        <input
          type="text"
          placeholder={term === "" ? "Search podcasts..." : ""}
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && term.trim()) {
              navigate(`/search?q=${encodeURIComponent(term.trim())}`);
            }
          }}
        />
        <button
          className={`mic-btn ${isListening ? "listening" : ""}`}
          aria-label={isListening ? "Stop voice search" : "Start voice search"}
          aria-pressed={isListening}
          title={isListening ? "Listening..." : "Voice search"}
          onClick={toggleVoiceSearch}
        >
          <Mic size={18} />
        </button>
      </div>

      <div className="navbar-right">

        <div className="notification-wrapper" ref={dropdownRef}>
          <button className="icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
            <Bell size={20} />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h3>Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllAsRead} className="mark-all-btn">
                    <Check size={14} /> Mark all read
                  </button>
                )}
              </div>
              <div className="notification-list">
                {notifications.length === 0 ? (
                  <p className="no-notifications">No new notifications</p>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n._id} 
                      className={`notification-item ${n.isRead ? 'read' : 'unread'}`}
                      onClick={() => !n.isRead && handleMarkAsRead(n._id)}
                    >
                      <img src={n.sender?.avatar || "https://placehold.co/40x40"} alt="avatar" className="notif-avatar" />
                      <div className="notif-content">
                        <p>{n.message}</p>
                        <span className="notif-time">{new Date(n.createdAt).toLocaleDateString()}</span>
                      </div>
                      {!n.isRead && <div className="unread-dot"></div>}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="profile-box" onClick={() => navigate("/profile")}> 
          <img className="profile-avatar" src={avatar} alt="Profile" />
          <div>
            <h4>{user?.name ?? "Sree"}</h4>
            <span>{user?.role ?? "Creator"}</span>
          </div>
        </div>

      </div>

    </header>
  );
}