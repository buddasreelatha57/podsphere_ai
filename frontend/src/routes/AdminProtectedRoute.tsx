import { Navigate } from "react-router-dom";

interface Props {
  children: React.ReactNode;
}

export default function AdminProtectedRoute({ children }: Props) {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  let isAdmin = false;

  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.role === "admin") {
        isAdmin = true;
      }
    } catch (e) {
      console.error("Failed to parse user from local storage");
    }
  }

  if (!token || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
