import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";

import Landing from "./pages/Landing/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import CreateContent from "./pages/Upload/CreateContent";
import MyPodCasts from "./pages/dashboard/MyPodCasts";
import WatchVideoPage from "./pages/dashboard/WatchVideoPage";
import Explore from "./pages/dashboard/Explore";
import Favorites from "./pages/dashboard/Favorites";
import History from "./pages/dashboard/History";
import Profile from "./pages/dashboard/Profile";
import Settings from "./pages/Settings/Settings";
import SearchResults from "./pages/dashboard/SearchResults";
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminProtectedRoute from "./routes/AdminProtectedRoute";

function App() {
  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user?.settings?.theme) {
          document.documentElement.setAttribute("data-theme", user.settings.theme);
        }
      }
    } catch (e) {
      // Ignore
    }
  }, []);

  return (
    <Routes>
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin/dashboard"
        element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        }
      />
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <CreateContent />
          </ProtectedRoute>
        }
      />
     <Route path="/my-podcasts" element={<MyPodCasts />} />

     <Route
    path="/watch/:id"
    element={
        <ProtectedRoute>
            <WatchVideoPage/>
        </ProtectedRoute>
    }
/>

      <Route
        path="/explore"
        element={
          <ProtectedRoute>
            <Explore />
          </ProtectedRoute>
        }
      />
      <Route
        path="/favorites"
        element={
          <ProtectedRoute>
            <Favorites />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/search"
        element={
          <ProtectedRoute>
            <SearchResults />
          </ProtectedRoute>
        }
      />

    </Routes>

   
  );
}

export default App;
