import { useEffect, useState } from "react";
import {
  Home,
  Compass,
  Upload,
  Podcast,
  Heart,
  History,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./Sidebar.css";

const menus = [
  { name: "Home", icon: Home, path: "/dashboard" },
  { name: "Explore", icon: Compass, path: "/explore" },
  { name: "Upload", icon: Upload, path: "/upload" },
  { name: "My Podcasts", icon: Podcast, path: "/my-podcasts" },
  { name: "Favorites", icon: Heart, path: "/favorites" },
  { name: "History", icon: History, path: "/history" },
  { name: "Profile", icon: User, path: "/profile" },
  { name: "Settings", icon: Settings, path: "/settings" },
];




export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false); // desktop collapse
  const [mobileOpen, setMobileOpen] = useState(false); // mobile overlay
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) setMobileOpen(false);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleToggle = () => {
    if (isMobile) setMobileOpen((s) => !s);
    else setCollapsed((s) => !s);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    toast.success("Logged out successfully!");

    navigate("/login");
  };

  const storedUser = sessionStorage.getItem("user") || localStorage.getItem("user");
  let isGuest = false;
  try {
    isGuest = JSON.parse(storedUser || "null")?.role === "guest";
  } catch {
    isGuest = false;
  }
  const visibleMenus = menus.filter((item) => !isGuest || item.name !== "Settings");

  return (
    <>
      <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "open" : ""}`}>

        <div>

          <div className="sidebar-logo">

            <img src="./logo.png" alt="PodSphere AI" />



            <button
              className="logo-toggle"
              onClick={handleToggle}
              aria-label={isMobile ? (mobileOpen ? "Close sidebar" : "Open sidebar") : (collapsed ? "Expand sidebar" : "Collapse sidebar")}
            >
              {isMobile ? (
                mobileOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />
              ) : (
                collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />
              )}
            </button>

          </div>

          <nav className="sidebar-menu">

            {visibleMenus.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  isActive ? "menu-item active" : "menu-item"
                }
              >
                <item.icon size={20} />

                <span>{item.name}</span>
              </NavLink>
            ))}

          </nav>

        </div>

        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>

      </aside>
    </>
  );
}